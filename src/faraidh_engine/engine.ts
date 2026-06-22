import { FaraidhInput, FaraidhResult, HeirResult, HeirKey, ALL_HEIRS_LIST, StatusWaris, StepLog } from './types';

/**
 * Find the Least Common Multiple (LCM) of an array of numbers
 */
function findLCM(numbers: number[]): number {
  if (numbers.length === 0) return 1;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
  return numbers.reduce((acc, curr) => lcm(acc, curr), 1);
}

/**
 * Format fractional string representation
 */
export function formatFraction(num: number, den: number): string {
  if (num === 0) return '0';
  if (num === den) return '1';
  // Check if we can simplify
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(num, den);
  const simNum = num / divisor;
  const simDen = den / divisor;
  return `${simNum}/${simDen}`;
}

export function calculateFaraidh(input: FaraidhInput): FaraidhResult {
  const explanationLogs: string[] = [];
  const calculationSteps: StepLog[] = [];
  const errorMessages: string[] = [];

  // ==========================================
  // TAHAP 1: VALIDASI DATA AHLI WARIS
  // ==========================================
  const activeHeirKeys = Object.entries(input.heirs)
    .filter(([_, qty]) => qty && qty > 0)
    .map(([key]) => key as HeirKey);

  const getCount = (key: HeirKey): number => input.heirs[key] || 0;

  // Validasi gender pewaris & spouse
  if (input.deceasedGender === 'L') {
    if (getCount('suami') > 0) {
      errorMessages.push('Pewaris berjenis kelamin Laki-laki tidak mungkin memiliki Suami.');
    }
  } else {
    if (getCount('istri') > 0) {
      errorMessages.push('Pewaris berjenis kelamin Perempuan tidak mungkin memiliki Istri.');
    }
  }

  if (getCount('suami') > 1) {
    errorMessages.push('Jumlah Suami tidak boleh lebih dari 1.');
  }
  if (getCount('istri') > 4) {
    errorMessages.push('Jumlah Istri maks 4 berdasarkan syariat Islam.');
  }
  if (getCount('ayah') > 1) {
    errorMessages.push('Jumlah Ayah tidak boleh lebih dari 1.');
  }
  if (getCount('ibu') > 1) {
    errorMessages.push('Jumlah Ibu tidak boleh lebih dari 1.');
  }

  // Hitung distribusi keuangan awal
  const assets = input.assets;
  const debts = input.debts;
  const funeralCosts = input.funeralCosts;
  
  // Harta bersih setelah dikurangi tirkah utama (Mu'nah Tajhiz dan debts)
  const baseWealth = assets - debts - funeralCosts;
  let netEstate = baseWealth;
  let bequestAllowed = 0;

  if (baseWealth < 0) {
    netEstate = 0;
    errorMessages.push('Jumlah hutang dan biaya pemakaman melebihi total harta peninggalan.');
  } else {
    // Batasan wasiat maksimal 1/3 dari harta setelah hutang & pemakaman
    const maxBequest = baseWealth / 3;
    if (input.bequest > maxBequest) {
      bequestAllowed = maxBequest;
      explanationLogs.push(`Wasiat nominal Rp ${input.bequest.toLocaleString('id-ID')} melampaui batas syar'i (1/3 dari harta bersih = Rp ${maxBequest.toLocaleString('id-ID')}). Maka wasiat disesuaikan otomatis menjadi Rp ${maxBequest.toLocaleString('id-ID')}.`);
    } else {
      bequestAllowed = input.bequest;
    }
    netEstate = baseWealth - bequestAllowed;
  }

  calculationSteps.push({
    title: 'Pembersihan Harta Peninggalan',
    description: `Harta Kasar: Rp ${assets.toLocaleString('id-ID')}\n` +
      `- Hutang: Rp ${debts.toLocaleString('id-ID')}\n` +
      `- Biaya Pemakaman: Rp ${funeralCosts.toLocaleString('id-ID')}\n` +
      `- Wasiat (Disetujui): Rp ${bequestAllowed.toLocaleString('id-ID')}\n` +
      `➡️ Harta Bersih Tersisa (Net Estate) untuk Ahli Waris: Rp ${netEstate.toLocaleString('id-ID')}`
  });

  if (errorMessages.length > 0) {
    return {
      ancestralProblem: 1,
      finalProblem: 1,
      isAul: false,
      isRadd: false,
      netEstate,
      bequestAllowed,
      heirResults: [],
      explanationLogs,
      calculationSteps,
      isValid: false,
      errorMessages
    };
  }

  // ==========================================
  // TAHAP 2: MENENTUKAN AHLI WARIS YANG GUGUR KARENA TERHALANG (HAJB HIRMAN)
  // ==========================================
  const blockedHeirs = new Map<HeirKey, { blocker: string; reason: string }>();

  // Far'u Warits (Keturunan)
  const hasAnakLk = getCount('anak_lk') > 0;
  const hasCucuLk = getCount('cucu_lk') > 0;
  const hasAnakPr = getCount('anak_pr') > 0;
  const hasCucuPr = getCount('cucu_pr') > 0;
  
  const hasFarUWaritsLk = hasAnakLk || hasCucuLk;
  const hasFarUWarits = hasAnakLk || hasCucuLk || hasAnakPr || hasCucuPr;

  // Ushul Warits (Leluhur)
  const hasAyah = getCount('ayah') > 0;
  const hasKakek = getCount('kakek') > 0;
  const hasIbu = getCount('ibu') > 0;

  // Saudara & Saudari
  const hasSaudaraKnd = getCount('saudara_knd') > 0;
  const hasSaudaridKnd = getCount('saudari_knd') > 0;
  const hasSaudaraBy = getCount('saudara_by') > 0;
  const hasSaudariBy = getCount('saudari_by') > 0;

  // Aturan Hajb Hirman:
  // 1. Cucu Laki-laki terhalang oleh Anak Laki-laki
  if (hasCucuLk && hasAnakLk) {
    blockedHeirs.set('cucu_lk', {
      blocker: 'Anak Laki-laki',
      reason: 'Cucu laki-laki terhalang (mahjub) karena adanya Anak Laki-laki.'
    });
  }

  // 2. Cucu Perempuan terhalang oleh Anak Laki-laki, atau 2 Anak Perempuan ke atas (kecuali jika ada cucu laki-laki se-tingkat/dibawahnya yang menjadi ashabah bil ghair)
  if (hasCucuPr) {
    if (hasAnakLk) {
      blockedHeirs.set('cucu_pr', {
        blocker: 'Anak Laki-laki',
        reason: 'Cucu perempuan terhalang (mahjub) karena adanya Anak Laki-laki.'
      });
    } else if (getCount('anak_pr') >= 2 && !hasCucuLk) {
      blockedHeirs.set('cucu_pr', {
        blocker: `${getCount('anak_pr')} Anak Perempuan`,
        reason: 'Cucu perempuan terhalang karena adanya dua atau lebih Anak Perempuan dan tidak ada Cucu Laki-laki penolong (Ashabah bil Ghair).'
      });
    }
  }

  // 3. Kakek terhalang oleh Ayah
  if (hasKakek && hasAyah) {
    blockedHeirs.set('kakek', {
      blocker: 'Ayah',
      reason: 'Kakek terhalang karena adanya Ayah.'
    });
  }

  // 4. Nenek dari Ibu terhalang oleh Ibu
  if (getCount('nenek_ibu') > 0 && hasIbu) {
    blockedHeirs.set('nenek_ibu', {
      blocker: 'Ibu',
      reason: 'Nenek dari Ibu terhalang karena adanya Ibu.'
    });
  }

  // 5. Nenek dari Ayah terhalang oleh Ibu dan Ayah
  if (getCount('nenek_ayah') > 0) {
    if (hasIbu) {
      blockedHeirs.set('nenek_ayah', {
        blocker: 'Ibu',
        reason: 'Nenek dari Ayah terhalang karena adanya Ibu.'
      });
    } else if (hasAyah) {
      blockedHeirs.set('nenek_ayah', {
        blocker: 'Ayah',
        reason: 'Nenek dari Ayah terhalang karena adanya Ayah.'
      });
    }
  }

  // Nenek dari Ibu menghalangi Nenek dari Ayah bila nenek ibu lebih dekat (standard rahbiyyah)
  // Untuk simplifikasi, jika nenek_ibu ada, dia tidak otomatis memblock nenek_ayah kecuali jika diatur urutannya. Kedua nenek mendapat bersama 1/6 jika tdk ada penghalang utama (ibu/bapak).

  // 6. Saudara Kandung (Laki & Perempuan) terhalang oleh Anak Laki, Cucu Laki, atau Ayah
  const blockSiblingsCond = hasAnakLk || hasCucuLk || hasAyah;
  const blockSiblingsReason = hasAnakLk ? 'Anak Laki-laki' : hasCucuLk ? 'Cucu Laki-laki' : 'Ayah';
  
  if (blockSiblingsCond) {
    if (hasSaudaraKnd) blockedHeirs.set('saudara_knd', { blocker: blockSiblingsReason, reason: `Saudara kandung terhalang oleh ${blockSiblingsReason}.` });
    if (hasSaudaridKnd) blockedHeirs.set('saudari_knd', { blocker: blockSiblingsReason, reason: `Saudara perempuan kandung terhalang oleh ${blockSiblingsReason}.` });
    if (hasSaudaraBy) blockedHeirs.set('saudara_by', { blocker: blockSiblingsReason, reason: `Saudara seayah terhalang oleh ${blockSiblingsReason}.` });
    if (hasSaudariBy) blockedHeirs.set('saudari_by', { blocker: blockSiblingsReason, reason: `Saudara perempuan seayah terhalang oleh ${blockSiblingsReason}.` });
    if (getCount('saudara_bu') > 0) blockedHeirs.set('saudara_bu', { blocker: blockSiblingsReason, reason: `Saudara seibu terhalang oleh ${blockSiblingsReason}.` });
    if (getCount('saudari_bu') > 0) blockedHeirs.set('saudari_bu', { blocker: blockSiblingsReason, reason: `Saudara perempuan seibu terhalang oleh ${blockSiblingsReason}.` });
  }

  // Tambahan: Saudara Seibu terhalang pula oleh Anak Perempuan / Cucu Perempuan (Far'u Warits mutlak menghalangi saudara seibu)
  if (hasAnakPr || hasCucuPr) {
    if (getCount('saudara_bu') > 0 && !blockedHeirs.has('saudara_bu')) blockedHeirs.set('saudara_bu', { blocker: 'Anak/Cucu Perempuan', reason: 'Saudara seibu terhalang oleh keturunan perempuan (far\'u warits perempuan).' });
    if (getCount('saudari_bu') > 0 && !blockedHeirs.has('saudari_bu')) blockedHeirs.set('saudari_bu', { blocker: 'Anak/Cucu Perempuan', reason: 'Saudara perempuan seibu terhalang oleh keturunan perempuan (far\'u warits perempuan).' });
  }

  // 7. Saudara Seayah terhalang oleh Saudara Kandung Laki-laki
  if (hasSaudaraBy && hasSaudaraKnd) {
    blockedHeirs.set('saudara_by', { blocker: 'Saudara Kandung Laki-laki', reason: 'Saudara seayah terhalang oleh Saudara Kandung Laki-laki.' });
  }
  if (hasSaudariBy && hasSaudaraKnd) {
    blockedHeirs.set('saudari_by', { blocker: 'Saudara Kandung Laki-laki', reason: 'Saudara perempuan seayah terhalang oleh Saudara Kandung Laki-laki.' });
  }

  // Terhalang oleh dua saudara kandung perempuan jika seayah tidak bersama saudara seayah lk
  if (hasSaudariBy && getCount('saudari_knd') >= 2 && !hasSaudaraBy && !blockedHeirs.has('saudari_by')) {
    blockedHeirs.set('saudari_by', { blocker: 'Dua Saudara Perempuan Kandung', reason: 'Saudara perempuan seayah terhalang karena dua saudara perempuan kandung telah menghabiskan porsi 2/3, dan tidak ada saudara seayah laki-laki (ashabah bil ghair).' });
  }

  // Saudara kandung perempuan yang menjadi ashabah ma'al ghair (karena ada anak pr / cucu pr) bertindak sebagai saudara kandung laki-laki dan menghalangi saudara seayah.
  const hasAshabahMaAlGhairKnd = hasSaudaridKnd && (hasAnakPr || hasCucuPr) && !hasSaudaraKnd && !blockSiblingsCond;
  if (hasAshabahMaAlGhairKnd) {
    if (hasSaudaraBy && !blockedHeirs.has('saudara_by')) {
      blockedHeirs.set('saudara_by', { blocker: 'Saudara Perempuan Kandung (Ashabah Ma\'al Ghair)', reason: 'Saudara seayah terhalang oleh Saudara Perempuan Kandung yang menjadi Ashabah Ma\'al Ghair.' });
    }
    if (hasSaudariBy && !blockedHeirs.has('saudari_by')) {
      blockedHeirs.set('saudari_by', { blocker: 'Saudara Perempuan Kandung (Ashabah Ma\'al Ghair)', reason: 'Saudara perempuan seayah terhalang oleh Saudara Perempuan Kandung yang menjadi Ashabah Ma\'al Ghair.' });
    }
  }

  // 8. Keponakan (Anak saudara kandung / seayah) terhalang oleh Anak laki, cucu laki, ayah, kakek, saudara kandung, saudara seayah, saudari kandung/seayah yang menjadi ashabah ma'al ghair
  // Ringkasnya, blocker yang menghalangi keponakan adalah porsi ashabah pria yang lebih dekat.
  const keponakanBlockerCond = hasAnakLk || hasCucuLk || hasAyah || hasKakek || hasSaudaraKnd || hasSaudaraBy || hasAshabahMaAlGhairKnd || (hasSaudariBy && (hasAnakPr || hasCucuPr));
  if (keponakanBlockerCond) {
    const bName = 'Ahli Waris Laki-laki Terdekat (Keturunan/Leluhur/Saudara)';
    if (getCount('keponakan_knd') > 0) blockedHeirs.set('keponakan_knd', { blocker: bName, reason: 'Keponakan laki-laki kandung gugur karena ada ahli waris ashabah yang lebih dekat.' });
    if (getCount('keponakan_by') > 0) blockedHeirs.set('keponakan_by', { blocker: bName, reason: 'Keponakan laki-laki seayah gugur karena ada ahli waris ashabah yang lebih dekat.' });
  }

  if (getCount('keponakan_by') > 0 && getCount('keponakan_knd') > 0) {
    blockedHeirs.set('keponakan_by', { blocker: 'Anak Saudara Kandung', reason: 'Keponakan laki-laki seayah terhalang oleh Keponakan laki-laki kandung.' });
  }

  // 9. Paman Kandung & Paman Seayah terhalang oleh seluruh keponakan laki-laki ke atas
  const pamanBlockerCond = keponakanBlockerCond || getCount('keponakan_knd') > 0 || getCount('keponakan_by') > 0;
  if (pamanBlockerCond) {
    const bName = 'Ahli Waris Laki-laki Terdekat (Keponakan/Saudara/Ushul/Far\'u)';
    if (getCount('paman_knd') > 0) blockedHeirs.set('paman_knd', { blocker: bName, reason: 'Paman kandung terhalang oleh ahli waris ashabah yang lebih dekat.' });
    if (getCount('paman_by') > 0) blockedHeirs.set('paman_by', { blocker: bName, reason: 'Paman seayah terhalang oleh ahli waris ashabah yang lebih dekat.' });
  }
  if (getCount('paman_by') > 0 && getCount('paman_knd') > 0) {
    blockedHeirs.set('paman_by', { blocker: 'Paman Kandung', reason: 'Paman seayah terhalang oleh Paman Kandung.' });
  }

  // 10. Anak Paman (Sepupu) Kandung & Seayah terhalang paman
  const sepupuBlockerCond = pamanBlockerCond || getCount('paman_knd') > 0 || getCount('paman_by') > 0;
  if (sepupuBlockerCond) {
    const bName = 'Ahli Waris Laki-laki Terdekat (Paman/Keponakan/dll)';
    if (getCount('sepupu_knd') > 0) blockedHeirs.set('sepupu_knd', { blocker: bName, reason: 'Anak paman kandung terhalang oleh ahli waris ashabah yang lebih dekat.' });
    if (getCount('sepupu_by') > 0) blockedHeirs.set('sepupu_by', { blocker: bName, reason: 'Anak paman seayah terhalang oleh ahli waris ashabah yang lebih dekat.' });
  }
  if (getCount('sepupu_by') > 0 && getCount('sepupu_knd') > 0) {
    blockedHeirs.set('sepupu_by', { blocker: 'Anak Paman Kandung', reason: 'Anak paman seayah terhalang oleh Anak Paman Kandung.' });
  }

  // Mu'tiq dan Mu'tiqah terhalang bila ada ahli waris ashabah nasab (seluruh ashabah laki-laki di atas)
  const hasAshabahNasab = hasAnakLk || hasCucuLk || hasAyah || hasKakek || hasSaudaraKnd || hasSaudaraBy || getCount('keponakan_knd') > 0 || getCount('keponakan_by') > 0 || getCount('paman_knd') > 0 || getCount('paman_by') > 0 || getCount('sepupu_knd') > 0 || getCount('sepupu_by') > 0 || hasAshabahMaAlGhairKnd;
  if (hasAshabahNasab) {
    if (getCount('mu_tiq') > 0) blockedHeirs.set('mu_tiq', { blocker: 'Ashabah Nasab', reason: 'Mu\'tiq terhalang oleh ashabah nasab.' });
    if (getCount('mu_tiqah') > 0) blockedHeirs.set('mu_tiqah', { blocker: 'Ashabah Nasab', reason: 'Mu\'tiqah terhalang oleh ashabah nasab.' });
  }
  if (getCount('mu_tiqah') > 0 && getCount('mu_tiq') > 0) {
    blockedHeirs.set('mu_tiqah', { blocker: 'Mu\'tiq', reason: 'Mu\'tiqah terhalang karena adanya Mu\'tiq laki-laki.' });
  }

  // Tulis penjelasan hajb hirman ke log
  blockedHeirs.forEach((val, key) => {
    explanationLogs.push(`❌ ${ALL_HEIRS_LIST.find(h => h.key === key)?.name} tidak memperoleh bagian karena terhalang oleh ${val.blocker}. Reason: ${val.reason}`);
  });

  // Helper untuk mengecek apakah ahli waris aktif dan TIDAK terhalang
  const isEligible = (key: HeirKey): boolean => getCount(key) > 0 && !blockedHeirs.has(key);

  // ==========================================
  // TAHAP 8: DETEKSI KASUS KHUSUS TERLEBIH DAHULU (MUSYARAKAH & AKDARIYYAH)
  // ==========================================
  let specialCase: 'Musyarakah' | 'Akdariyyah' | null = null;

  // Kasus Musyarakah (Himariyyah)
  // Syarat: Suami (1), Ibu/Nenek (1), Sdr Seibu (2 atau lebih), Sdr Kandung Lk (1 atau lebih - bs jg sdr knd perempuan bersama sdr knd lk).
  // Dan tidak ada anak, cucu, bapak, kakek.
  const condMusyarakah = 
    isEligible('suami') && 
    (isEligible('ibu') || isEligible('nenek_ibu') || isEligible('nenek_ayah')) &&
    (getCount('saudara_bu') + getCount('saudari_bu') >= 2) &&
    (getCount('saudara_knd') >= 1) && 
    !isEligible('anak_lk') && !isEligible('anak_pr') && !isEligible('cucu_lk') && !isEligible('cucu_pr') && !isEligible('ayah') && !isEligible('kakek');

  if (condMusyarakah) {
    specialCase = 'Musyarakah';
    explanationLogs.push('💎 KASUS KHUSUS TERDETEKSI: Musyarakah (Himariyyah/Yammiah). Berdasarkan ijtihad Umar bin Khattab r.a. yang diadopsi kitab Ar-Rahbiyyah, Saudara Kandung berbagi rata pada porsi sepertiga bersama Saudara Seibu.');
  }

  // Kasus Akdariyyah
  // Syarat: Suami (1), Ibu (1), Kakek (1), Saudari Kandung/Seayah Perempuan (1).
  // Tidak ada anak, cucu, bapak, saudara kandung laki, saudara seayah laki.
  const hasEligibleSaudariForAkdariyyah = isEligible('saudari_knd') || isEligible('saudari_by');
  const condAkdariyyah =
    isEligible('suami') &&
    isEligible('ibu') &&
    isEligible('kakek') &&
    hasEligibleSaudariForAkdariyyah &&
    getCount('saudari_knd') + getCount('saudari_by') === 1 &&
    !isEligible('saudara_knd') && !isEligible('saudara_by') &&
    !isEligible('anak_lk') && !isEligible('anak_pr') && !isEligible('cucu_lk') && !isEligible('cucu_pr') && !isEligible('ayah');

  if (condAkdariyyah) {
    specialCase = 'Akdariyyah';
    explanationLogs.push('💎 KASUS KHUSUS TERDETEKSI: Akdariyyah. Kakek dan satu Saudara Perempuan saling melengkapi bagian dan mendistribusikan sisa mereka dengan rasio 2:1 (Laki:Perempuan).');
  }

  // ==========================================
  // TAHAP 3 & 4: ASHABUL FURUDH & ASHABAH
  // ==========================================
  
  // Porsi pecahan dalam Asal Masalah (Representasi Numerator & Denominator)
  const rawSharesList: { key: HeirKey; num: number; den: number; isAshabah: boolean; isAshabahBilGhair: boolean; isAshabahMaAlGhair: boolean }[] = [];

  // Kita definisikan rules ashabul furudh standar jika bukan kasus Akdariyyah/Musyarakah biasa
  if (specialCase === 'Akdariyyah') {
    // Akdariyyah direct resolution:
    // Suami: 1/2
    // Ibu: 1/3
    // Kakek & Saudari: (Kakek 1/6 + Saudari 1/2 = 4/6 total) kemudian di-tas-hih (dibagi 3: Kakek 2 bagian, Saudari 1 bagian)
    // Asal Masalah Akdariyyah: 6. Aul ke 9. 
    // Jadi: Suami (3/9), Ibu (2/9), Kakek (8/27), Saudari (4/27).
    // Let's model this using a master common base: 27
    rawSharesList.push({ key: 'suami', num: 9, den: 27, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
    rawSharesList.push({ key: 'ibu', num: 6, den: 27, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
    
    const activeSaudariKey: HeirKey = isEligible('saudari_knd') ? 'saudari_knd' : 'saudari_by';
    rawSharesList.push({ key: 'kakek', num: 8, den: 27, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
    rawSharesList.push({ key: activeSaudariKey, num: 4, den: 27, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });

    explanationLogs.push('• Suami mendapat 1/2 (menjadi 9/27 setelah Aul dan Tashih Akdariyyah) karena tidak ada anak.');
    explanationLogs.push('• Ibu mendapat 1/3 (menjadi 6/27 setelah Aul dan Tashih) karena tidak ada anak atau kumpulan saudara.');
    explanationLogs.push(`• Kakek & ${ALL_HEIRS_LIST.find(h => h.key === activeSaudariKey)?.name} bagian mereka digabung (1/6 + 1/2 = 4/6), karena Aul menjadi 4/9 dari total, kemudian diselesaikan dengan rasio 2:1. Kakek mendapat 8/27, Saudari mendapat 4/27.`);

  } else if (specialCase === 'Musyarakah') {
    // Musyarakah direct resolution:
    // Suami: 1/2 (3/6)
    // Ibu/Nenek: 1/6 (1/6)
    // Saudara Seibu + Saudara Kandung laki (+ perempuan): bersama berbagi dalam 1/3 (2/6 dari total).
    // Total porsi 1/2 + 1/6 + 1/3 = 100%. Tidak ada ashabah murni tersisa.
    rawSharesList.push({ key: 'suami', num: 3, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
    
    const activeMotherKey: HeirKey = isEligible('ibu') ? 'ibu' : (isEligible('nenek_ibu') ? 'nenek_ibu' : 'nenek_ayah');
    rawSharesList.push({ key: activeMotherKey, num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });

    // Hitung total kepala penerima Musyarakah:
    // Saudara/i seibu + saudara/i kandung
    // Note: Dalam Musyarakah, saudari kandung perempuan juga ikut, dan porsi laki & perempuan sama rata 1:1!
    const numSdrBu = getCount('saudara_bu') + getCount('saudari_bu');
    const numSdrKnd = getCount('saudara_knd') + getCount('saudari_knd');
    const totalHeads = numSdrBu + numSdrKnd;

    // Kami buat entri khusus untuk ashabul furudh musyarakah ini
    explanationLogs.push(`• Suami mendapat 1/2 karena tidak ada anak.`);
    explanationLogs.push(`• ${ALL_HEIRS_LIST.find(h => h.key === activeMotherKey)?.name} mendapat 1/6 karena ada kumpulan saudara.`);
    explanationLogs.push(`• Sibling Gabungan (${totalHeads} orang: ${numSdrBu} dr seibu + ${numSdrKnd} kandung) membagi rata porsi 1/3 (2/6) dengan rasio sama rata 1:1.`);

  } else {
    // ----------------------------------------------------
    // KASUS STANDAR (ASHABUL FURUDH & ASHABAH RULE ENGINE)
    // ----------------------------------------------------

    // 1. Suami
    if (isEligible('suami')) {
      if (hasFarUWarits) {
        rawSharesList.push({ key: 'suami', num: 1, den: 4, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Suami mendapat porsi 1/4 (Hajb Nuqshan) karena pewaris memiliki keturunan (far\'u warits).');
      } else {
        rawSharesList.push({ key: 'suami', num: 1, den: 2, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Suami mendapat porsi penuh 1/2 karena pewaris tidak memiliki keturunan (far\'u warits).');
      }
    }

    // 2. Istri
    if (isEligible('istri')) {
      if (hasFarUWarits) {
        rawSharesList.push({ key: 'istri', num: 1, den: 8, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push(`• Istri (berjumlah ${getCount('istri')}) mendapat porsi bersama 1/8 (Hajb Nuqshan) karena pewaris memiliki keturunan.`);
      } else {
        rawSharesList.push({ key: 'istri', num: 1, den: 4, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push(`• Istri (berjumlah ${getCount('istri')}) mendapat porsi bersama 1/4 karena pewaris tidak memiliki keturunan.`);
      }
    }

    // 3. Ibu
    if (isEligible('ibu')) {
      const allSiblingsQty = 
        getCount('saudara_knd') + getCount('saudari_knd') + 
        getCount('saudara_by') + getCount('saudari_by') + 
        getCount('saudara_bu') + getCount('saudari_bu');

      // Umariyyatayn / Ghorrawain check
      // Suami/Istri + Ibu + Ayah (tanpa anak dan tanpa saudara lain)
      const isUmariyyataynSuami = isEligible('suami') && isEligible('ayah') && allSiblingsQty === 0 && !hasFarUWarits;
      const isUmariyyataynIstri = isEligible('istri') && isEligible('ayah') && allSiblingsQty === 0 && !hasFarUWarits;

      if (isUmariyyataynSuami) {
        // Ibu mendapat 1/3 dari SISA setelah suami ambil 1/2.
        // Suami = 1/2 (3/6). Sisa = 1/2 (3/6). Ibu dapat 1/3 dari 1/2 = 1/6 (sepertiga sisa). Ayah ashabah dapat sisa 2/6.
        rawSharesList.push({ key: 'ibu', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Ibu mendapat 1/3 dari SISA (Ghorrawain/Umariyyatayn) senilai 1/6 karena ahli waris hanya terdiri dari Suami, Ibu, dan Ayah.');
      } else if (isUmariyyataynIstri) {
        // Ibu mendapat 1/3 dari SISA setelah istri ambil 1/4.
        // Istri = 1/4 (3/12). Sisa = 3/4. Ibu dapat 1/3 dari 3/4 = 1/4 (3/12). Ayah ashabah dapat sisa 2/4 (6/12).
        rawSharesList.push({ key: 'ibu', num: 1, den: 4, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Ibu mendapat 1/3 dari SISA (Ghorrawain/Umariyyatayn) senilai 1/4 karena ahli waris hanya terdiri dari Istri, Ibu, dan Ayah.');
      } else if (hasFarUWarits) {
        rawSharesList.push({ key: 'ibu', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Ibu mendapat porsi 1/6 (Hajb Nuqshan) karena pewaris memiliki keturunan (far\'u warits).');
      } else if (allSiblingsQty >= 2) {
        rawSharesList.push({ key: 'ibu', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push(`• Ibu mendapat porsi 1/6 (Hajb Nuqshan) karena ada kumpulan saudara/i (${allSiblingsQty} orang).`);
      } else {
        rawSharesList.push({ key: 'ibu', num: 1, den: 3, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Ibu mendapat porsi penuh 1/3 karena tidak ada anak atau kumpulan saudara.');
      }
    }

    // 4. Ayah (Sebagai Ashabul Furudh)
    // Ayah mendapat 1/6 fardh jika ada anak laki/cucu laki.
    // Jika ada anak perempuan / cucu perempuan tanpa anak laki-laki, ayah dapat 1/6 fardh + ashabah.
    // Jika tidak ada anak sama sekali, ayah murni ashabah.
    if (isEligible('ayah') && hasFarUWaritsLk) {
      rawSharesList.push({ key: 'ayah', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Ayah mendapat porsi fardh 1/6 karena pewaris memiliki keturunan laki-laki (anak/cucu).');
    } else if (isEligible('ayah') && (hasAnakPr || hasCucuPr) && !hasFarUWaritsLk) {
      rawSharesList.push({ key: 'ayah', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Ayah mendapat porsi fardh 1/6 dan juga bertindak sebagai Ashabah mengambil sisa harta karena hanya ada keturunan perempuan.');
    }

    // 5. Kakek (Sebagai Ashabul Furudh)
    if (isEligible('kakek')) {
      if (hasFarUWaritsLk) {
        rawSharesList.push({ key: 'kakek', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Kakek mendapat porsi fardh 1/6 karena pewaris memiliki keturunan laki-laki.');
      } else if ((hasAnakPr || hasCucuPr) && !hasFarUWaritsLk) {
        rawSharesList.push({ key: 'kakek', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Kakek mendapat porsi fardh 1/6 dan juga bertindak sebagai Ashabah mengambil sisa harta.');
      }
    }

    // 6. Nenek (Ibu & Ayah)
    // Nenek (baik dari ibu maupun ayah) mendapat porsi bersama 1/6 jika memenuhi syarat (tdk terblock ibu/bapak).
    if (isEligible('nenek_ibu') && isEligible('nenek_ayah')) {
      rawSharesList.push({ key: 'nenek_ibu', num: 1, den: 12, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      rawSharesList.push({ key: 'nenek_ayah', num: 1, den: 12, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Nenek dari Ibu & Nenek dari Ayah berbagi rata porsi fardh 1/6 (masing-masing 1/12).');
    } else if (isEligible('nenek_ibu')) {
      rawSharesList.push({ key: 'nenek_ibu', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Nenek dari Ibu mendapat porsi fardh 1/6 karena tidak ada Ibu.');
    } else if (isEligible('nenek_ayah')) {
      rawSharesList.push({ key: 'nenek_ayah', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Nenek dari Ayah mendapat porsi fardh 1/6 karena tidak ada Ibu atau Ayah.');
    }

    // 7. Saudara & Saudari Seibu (Ukhwah li Um)
    // Sepertiga (1/3) bila ada 2 orang atau lebih, seperenam (1/6) jika sendirian.
    const qtySeibu = getCount('saudara_bu') + getCount('saudari_bu');
    if (qtySeibu >= 2) {
      if (isEligible('saudara_bu')) {
        const shareNum = getCount('saudara_bu');
        rawSharesList.push({ key: 'saudara_bu', num: shareNum, den: 3 * qtySeibu, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      }
      if (isEligible('saudari_bu')) {
        const shareNum = getCount('saudari_bu');
        rawSharesList.push({ key: 'saudari_bu', num: shareNum, den: 3 * qtySeibu, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      }
      explanationLogs.push(`• Saudara/i seibu (berjumlah ${qtySeibu} orang) mendapat porsi bersama 1/3 karena tidak ada anak/cucu/ayah/kakek.`);
    } else if (qtySeibu === 1) {
      const activeSeibuKey = isEligible('saudara_bu') ? 'saudara_bu' : 'saudari_bu';
      rawSharesList.push({ key: activeSeibuKey, num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push(`• ${ALL_HEIRS_LIST.find(h => h.key === activeSeibuKey)?.name} mendapat porsi fardh 1/6 karena sendirian.`);
    }

    // 8. Anak Perempuan (Bint)
    // 1/2 jika sendirian, 2/3 jika berdua atau lebih (bila tidak ada anak laki-laki)
    if (isEligible('anak_pr') && !isEligible('anak_lk')) {
      const qtyAnakPr = getCount('anak_pr');
      if (qtyAnakPr === 1) {
        rawSharesList.push({ key: 'anak_pr', num: 1, den: 2, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Anak perempuan mendapat 1/2 karena sendirian dan tidak ada anak laki-laki.');
      } else {
        rawSharesList.push({ key: 'anak_pr', num: 2, den: 3, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push(`• Anak perempuan (berjumlah ${qtyAnakPr}) mendapat porsi bersama 2/3 karena lebih dari satu dan tidak ada anak laki-laki.`);
      }
    }

    // 9. Cucu Perempuan (Bintul Ibn)
    // 1/2 jika sendirian, 2/3 jika berdua/lebih (bila tidak ada anak/cucu laki).
    // Bila ada 1 anak perempuan, cucu perempuan dapat 1/6 (penyempurna 2/3).
    if (isEligible('cucu_pr') && !isEligible('anak_lk') && !isEligible('cucu_lk')) {
      const qtyCucuPr = getCount('cucu_pr');
      const qtyAnakPr = getCount('anak_pr');

      if (qtyAnakPr === 0) {
        if (qtyCucuPr === 1) {
          rawSharesList.push({ key: 'cucu_pr', num: 1, den: 2, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
          explanationLogs.push('• Cucu perempuan mendapat 1/2 karena sendirian dan tidak ada anak/cucu laki-laki.');
        } else {
          rawSharesList.push({ key: 'cucu_pr', num: 2, den: 3, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
          explanationLogs.push(`• Cucu perempuan (berjumlah ${qtyCucuPr}) mendapat porsi bersama 2/3 karena lebih dari satu dan tidak ada anak/cucu laki-laki.`);
        }
      } else if (qtyAnakPr === 1) {
        rawSharesList.push({ key: 'cucu_pr', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
        explanationLogs.push('• Cucu perempuan mendapat porsi fardh 1/6 sebagai penyempurna porsi dua pertiga (Takmiliyyatan lits-tsulutsain) karena ada satu Anak Perempuan.');
      }
    }

    // 10. Saudara Perempuan Kandung (Ukhtun Syaqiqah)
    // 1/2 jika sendirian, 2/3 jika berdua/lebih (bila tidak ada anak, cucu, ayah, saudara kandung laki).
    const hasFarUWaritsPr = hasAnakPr || hasCucuPr;
    if (isEligible('saudari_knd') && !isEligible('saudara_knd') && !hasFarUWaritsLk && !isEligible('ayah')) {
      const qtySdrKndPr = getCount('saudari_knd');
      if (!hasFarUWaritsPr) {
        if (qtySdrKndPr === 1) {
          rawSharesList.push({ key: 'saudari_knd', num: 1, den: 2, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
          explanationLogs.push('• Saudara perempuan kandung mendapat 1/2 karena sendirian dan tidak ada anak/cucu/ayah/saudara kandung laki-laki.');
        } else {
          rawSharesList.push({ key: 'saudari_knd', num: 2, den: 3, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
          explanationLogs.push(`• Saudara perempuan kandung (berjumlah ${qtySdrKndPr}) mendapat porsi bersama 2/3 karena lebih dari satu dan tidak ada anak/cucu/ayah/saudara kandung laki-laki.`);
        }
      } else {
        // Ashabah Ma'al Ghair (dengan anak/cucu perempuan)
        rawSharesList.push({ key: 'saudari_knd', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: true });
        explanationLogs.push('• Saudara perempuan kandung bertindak sebagai Ashabah Ma\'al Ghair bersama dengan Keturunan Perempuan (Anak/Cucu Perempuan).');
      }
    }

    // 11. Saudara Perempuan Seayah (Ukhtun li Ab)
    // 1/2 jika sendirian, 2/3 jika berdua/lebih.
    // Jika ada 1 saudara perempuan kandung (yang dpt 1/2) dan tidak ada yang lain, saudari seayah dpt 1/6 (penyempurna 2/3).
    if (isEligible('saudari_by') && !isEligible('saudara_by') && !hasFarUWaritsLk && !isEligible('ayah') && !isEligible('saudara_knd')) {
      const qtySdrByPr = getCount('saudari_by');
      const qtySrdKndPr = getCount('saudari_knd');

      if (!hasFarUWaritsPr) {
        if (qtySrdKndPr === 0) {
          if (qtySdrByPr === 1) {
            rawSharesList.push({ key: 'saudari_by', num: 1, den: 2, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
            explanationLogs.push('• Saudara perempuan seayah mendapat 1/2 karena tidak ada anak/cucu/ayah/saudara seayah laki-laki atau saudara kandung.');
          } else {
            rawSharesList.push({ key: 'saudari_by', num: 2, den: 3, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
            explanationLogs.push(`• Saudara perempuan seayah (berjumlah ${qtySdrByPr}) mendapat porsi bersama 2/3 karena lebih dari satu.`);
          }
        } else if (qtySrdKndPr === 1) {
          rawSharesList.push({ key: 'saudari_by', num: 1, den: 6, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
          explanationLogs.push('• Saudara perempuan seayah mendapat 1/6 sebagai penyempurna porsi dua pertiga (Takmiliyyatan lits-tsulutsain) karena ada satu Saudara Perempuan Kandung.');
        }
      } else {
        // Ashabah Ma'al Ghair (dengan anak/cucu perempuan)
        rawSharesList.push({ key: 'saudari_by', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: true });
        explanationLogs.push('• Saudara perempuan seayah bertindak sebagai Ashabah Ma\'al Ghair bersama dengan Keturunan Perempuan (Anak/Cucu Perempuan).');
      }
    }

    // ----------------------------------------------------
    // PEMBAGIAN ASHABAH (SISA)
    // ----------------------------------------------------
    
    // TAHAP 4: Menentukan tipe ashabah aktif
    // 4.1 Ashabah bil Ghair (bersama saudara laki-laki setara: anak lk-anak pr, cucu lk-cucu pr, dsb)
    // 4.2 Ashabah bin Nafsih (pria ashabah murni)
    
    const isAshabahBilGhairAnak = isEligible('anak_pr') && isEligible('anak_lk');
    if (isAshabahBilGhairAnak) {
      rawSharesList.push({ key: 'anak_lk', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      rawSharesList.push({ key: 'anak_pr', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      explanationLogs.push('• Anak Laki-laki dan Anak Perempuan menjadi Ashabah Bil Ghair dengan pembagian rasio 2:1 (pria:wanita).');
    } else if (isEligible('anak_lk')) {
      rawSharesList.push({ key: 'anak_lk', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Anak laki-laki menjadi Ashabah Bin Nafsih dan mengambil seluruh sisa harta peninggalan.');
    }

    const isAshabahBilGhairCucu = isEligible('cucu_pr') && isEligible('cucu_lk');
    if (isAshabahBilGhairCucu) {
      rawSharesList.push({ key: 'cucu_lk', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      rawSharesList.push({ key: 'cucu_pr', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      explanationLogs.push('• Cucu Laki-laki dan Cucu Perempuan menjadi Ashabah Bil Ghair dengan pembagian rasio 2:1.');
    } else if (isEligible('cucu_lk')) {
      rawSharesList.push({ key: 'cucu_lk', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Cucu laki-laki menjadi Ashabah Bin Nafsih mengambil sisa harta setelah ashabul furudh.');
    }

    // Saudara Kandung
    const isAshabahBilGhairKnd = isEligible('saudari_knd') && isEligible('saudara_knd');
    if (isAshabahBilGhairKnd) {
      rawSharesList.push({ key: 'saudara_knd', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      rawSharesList.push({ key: 'saudari_knd', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      explanationLogs.push('• Saudara Laki-laki dan Perempuan Kandung menjadi Ashabah Bil Ghair dengan pembagian rasio 2:1.');
    } else if (isEligible('saudara_knd') && !blockSiblingsCond) {
      rawSharesList.push({ key: 'saudara_knd', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Saudara kandung laki-laki bertindak sebagai Ashabah Bin Nafsih mengambil sisa harta.');
    }

    // Saudara Seayah
    const isAshabahBilGhairBy = isEligible('saudari_by') && isEligible('saudara_by');
    if (isAshabahBilGhairBy) {
      rawSharesList.push({ key: 'saudara_by', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      rawSharesList.push({ key: 'saudari_by', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: true, isAshabahMaAlGhair: false });
      explanationLogs.push('• Saudara Laki-laki dan Perempuan Seayah menjadi Ashabah Bil Ghair dengan pembagian rasio 2:1.');
    } else if (isEligible('saudara_by') && !blockSiblingsCond) {
      rawSharesList.push({ key: 'saudara_by', num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      explanationLogs.push('• Saudara seayah laki-laki bertindak sebagai Ashabah Bin Nafsih mengambil sisa harta.');
    }

    // Urutan ashabah lainnya yang murni bin nafsih (hanya mengambil jika tidak ada ashabah di atasnya)
    // Sisa ashabah bin nafsih list:
    const potentialBinNafsih: { key: HeirKey; label: string }[] = [
      { key: 'ayah', label: 'Ayah' }, // Ayah jadi ashabah jika tidak ada anak laki-laki mulia
      { key: 'kakek', label: 'Kakek' },
      { key: 'keponakan_knd', label: 'Anak laki-laki saudara kandung' },
      { key: 'keponakan_by', label: 'Anak laki-laki saudara seayah' },
      { key: 'paman_knd', label: 'Paman kandung' },
      { key: 'paman_by', label: 'Paman seayah' },
      { key: 'sepupu_knd', label: 'Anak paman kandung' },
      { key: 'sepupu_by', label: 'Anak paman seayah' },
      { key: 'mu_tiq', label: 'Mu\'tiq' },
      { key: 'mu_tiqah', label: 'Mu\'tiqah' },
    ];

    // Cek yang benar-benar berhak sebagai ashabah bin nafsih teraktif
    // Dalam system Islam, hanya 1 level ashabah bin nafsih terkuat yang mengambil sisa.
    // Jika ada anak laki-laki atau cucu, ashabah lain tertutup dari ashabah (tapi ayah tetap dapat fardh).
    let ashabahBinNafsihFound = isEligible('anak_lk') || isEligible('cucu_lk') || isAshabahBilGhairAnak || isAshabahBilGhairCucu || isAshabahBilGhairKnd || isEligible('saudara_knd') || isAshabahBilGhairBy || isEligible('saudara_by');
    
    // Saudari kandung / seayah yang ashabah ma'al ghair juga menghabiskan ashabah karena kedudukan mereka setara saudara kandung
    const hasAshabahMaAlGhairActive = 
      (isEligible('saudari_knd') && hasFarUWaritsPr && !isEligible('saudara_knd') && !isEligible('anak_lk') && !isEligible('cucu_lk')) ||
      (isEligible('saudari_by') && hasFarUWaritsPr && !isEligible('saudara_by') && !isEligible('anak_lk') && !isEligible('cucu_lk') && !isEligible('saudara_knd') && !isEligible('saudari_knd'));

    if (hasAshabahMaAlGhairActive) {
      ashabahBinNafsihFound = true;
    }

    if (!ashabahBinNafsihFound) {
      for (const p of potentialBinNafsih) {
        if (isEligible(p.key)) {
          rawSharesList.push({ key: p.key, num: 0, den: 1, isAshabah: true, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
          explanationLogs.push(`• ${p.label} bertindak sebagai Ashabah Bin Nafsih sisa harta peninggalan.`);
          break; // Hanya 1 ashabah bin nafsih terkuat yang mengambil sisa
        }
      }
    }
  }

  // ==========================================
  // TAHAP 5 & 6 & 7: ASAL MASALAH, AUL, AND RADD
  // ==========================================
  
  let ancestralProblem = 1;
  let finalProblem = 1;
  let isAul = false;
  let isRadd = false;
  let aulTarget: number | undefined;

  // Saring furudh non-ashabah
  const activeFurudh = rawSharesList.filter(share => !share.isAshabah);

  // Jika kasus spesial Akdariyyah, kita pasangkan langsung
  if (specialCase === 'Akdariyyah') {
    ancestralProblem = 6;
    finalProblem = 27;
    isAul = true;
    aulTarget = 9; // Aul dari 6 ke 9, lalu di-tas-hih dikali 3 menjadi 27.
    
    calculationSteps.push({
      title: 'Penyelesaian Kasus Khusus Akdariyyah',
      description: 'Langkah Perhitungan Akdariyyah:\n' +
        '1. Bagian awal: Suami (1/2 = 3/6), Ibu (1/3 = 2/6), Kakek (1/6 = 1/6), Saudari (1/2 = 3/6).\n' +
        '2. Jumlah bagian: 3 + 2 + 1 + 3 = 9 (Mengalami Aul dari 6 menjadi 9).\n' +
        '3. Hak Kakek & Saudari digabungkan: 1 (porsi Kakek) + 3 (porsi Saudari) = 4 bagian.\n' +
        '4. Sesuai aturan Akdariyyah, 4 bagian dibagi dengan rasio 2:1 pria dibanding wanita.\n' +
        '5. Untuk memisahkan pecahan tanpa koma, seluruh penyebut dikalikan 3 (Tashih):\n' +
        '   - Penyebut Akhir: 9 × 3 = 27\n' +
        '   - Suami: 3 × 3 = 9/27\n' +
        '   - Ibu: 2 × 3 = 6/27\n' +
        '   - Porsi Gabungan Kakek & Saudari: 4 × 3 = 12 bagian.\n' +
        '   - Kakek (2/3 dr 12) = 8/27\n' +
        '   - Saudari (1/3 dr 12) = 4/27\n' +
        '➡️ Semua pembilang berjumlah 9 + 6 + 8 + 4 = 27/27 (Pas 100%).'
    });

  } else if (specialCase === 'Musyarakah') {
    ancestralProblem = 6;
    finalProblem = 6;
    
    const totalSdrBu = getCount('saudara_bu') + getCount('saudari_bu');
    const totalSdrKnd = getCount('saudara_knd') + getCount('saudari_knd');
    const totalHeads = totalSdrBu + totalSdrKnd;

    // Musyarakah shares:
    // Suami: 3/6 (1/2)
    // Ibu/Nenek: 1/6
    // Sibling Gabungan: 2/6 (1/3) dibagi rata totalHeads
    // Kita lakukan Tashih jika totalHeads tidak habis membagi 2 saham.
    // Jika totalHeads ganjil/genap, kita buat penyebut baru: finalProblem = 6 * totalHeads
    // Pembilang baru: Suami (3 * totalHeads), Ibu (1 * totalHeads), Sibling (2 per orang!)
    const multiplier = totalHeads;
    finalProblem = 6 * multiplier;

    rawSharesList.length = 0; // Hapus dan set ulang pembagian yang presisi
    rawSharesList.push({ key: 'suami', num: 3 * multiplier, den: finalProblem, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
    
    const activeMotherKey: HeirKey = isEligible('ibu') ? 'ibu' : (isEligible('nenek_ibu') ? 'nenek_ibu' : 'nenek_ayah');
    rawSharesList.push({ key: activeMotherKey, num: 1 * multiplier, den: finalProblem, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });

    // Setiap saudara (seibu maupun kandung) mendapat 2 dari finalProblem
    const allSiblingsKeys: HeirKey[] = ['saudara_bu', 'saudari_bu', 'saudara_knd', 'saudari_knd'];
    for (const sk of allSiblingsKeys) {
      const q = getCount(sk);
      if (q > 0) {
        rawSharesList.push({ key: sk, num: 2 * q, den: finalProblem, isAshabah: false, isAshabahBilGhair: false, isAshabahMaAlGhair: false });
      }
    }

    calculationSteps.push({
      title: 'Penyelesaian Kasus Khusus Musyarakah (Himariyyah)',
      description: 'Langkah Perhitungan:\n' +
        '1. Bagian awal: Suami (1/2 = 3/6), Ibu (1/6), Saudara Seibu (1/3 = 2/6).\n' +
        '2. Saudara kandung (ashabah) mendapat sisa = 0.\n' +
        '3. Umar bin Khattab menetapkan saudara kandung memiliki ibu yang sama, sehingga mereka disamakan kedudukannya dengan saudara seibu dan ikut berbagi dalam porsi 1/3 (2/6).\n' +
        `4. Jumlah kepala penerima: ${totalHeads} orang.\n` +
        `5. Dilakukan Tashih dengan mengalikan Asal Masalah dengan jumlah kepala (${totalHeads}):\n` +
        `   - Asal Masalah Baru: 6 × ${totalHeads} = ${finalProblem}\n` +
        `   - Suami: 3 × ${totalHeads} = ${3 * multiplier}/${finalProblem}\n` +
        `   - Ibu: 1 × ${totalHeads} = ${1 * multiplier}/${finalProblem}\n` +
        `   - Bagian rata per kepala saudara: 2 bagian dari ${finalProblem} (senilai ${(2 / finalProblem * 100).toFixed(2)}% per individu).`
    });

  } else {
    // ----------------------------------------------------
    // PROSES PERCONTAHAN ASAL MASALAH KASUS STANDAR
    // ----------------------------------------------------
    const activeDenominators = activeFurudh.map(f => f.den);
    // Asal masalah standar diperoleh dari kelipatan persekutuan terkecil (KPK / LCM) penyebut aktif
    ancestralProblem = findLCM(activeDenominators);

    // Hitung total saham pembilang dalam Asal Masalah
    let sumFurudhNumerators = 0;
    const furudhAssignments = activeFurudh.map(f => {
      const multiplier = ancestralProblem / f.den;
      const numInAM = f.num * multiplier;
      sumFurudhNumerators += numInAM;
      return { key: f.key, numInAM };
    });

    // Cek ada Ashabah aktif atau tidak
    const activeAshabah = rawSharesList.filter(share => share.isAshabah);
    const hasActiveAshabah = activeAshabah.length > 0;

    if (sumFurudhNumerators > ancestralProblem) {
      // ==========================================
      // KASUS AUL DETECTED (Fractions sum > 1)
      // ==========================================
      isAul = true;
      finalProblem = sumFurudhNumerators; // Asal Masalah naik menjadi total saham pembilang
      aulTarget = finalProblem;

      // Update shares pembagian Aul
      rawSharesList.length = 0;
      furudhAssignments.forEach(fa => {
        rawSharesList.push({
          key: fa.key,
          num: fa.numInAM,
          den: finalProblem,
          isAshabah: false,
          isAshabahBilGhair: false,
          isAshabahMaAlGhair: false
        });
      });

      calculationSteps.push({
        title: 'Penyesuaian Bagian Menolak Aul',
        description: `Total bagian ashabul furudh melebihi 100% (pembilang dalam Asal Masalah ${ancestralProblem} berjumlah ${sumFurudhNumerators}).\n` +
          `➡️ Dilakukan kenaikan Asal Masalah (Aul) menjadi ${finalProblem}. Seluruh hak ashabul furudh dikurangi secara proporsional.`
      });

    } else if (sumFurudhNumerators < ancestralProblem && !hasActiveAshabah) {
      // ==========================================
      // KASUS RADD DETECTED (Fractions sum < 1 & No Ashabah)
      // ==========================================
      isRadd = true;

      // Berdasarkan mode_jumhur = true, Suami/Istri tidak berhak ikut Radd.
      const hasSpouse = isEligible('suami') || isEligible('istri');
      const spouseShare = rawSharesList.find(r => r.key === 'suami' || r.key === 'istri');

      if (hasSpouse && spouseShare) {
        // Radd dengan ahli waris suami/istri + fardh lainnya
        // Suami/Istri menerima porsi pas awal mereka. Sisa harta setelah dikurangi istri/suami dibagikan kepada ahli waris lain sebanding dengan rasio fardh mereka sendiri.
        const spousePortion = spouseShare.num / spouseShare.den; // e.g. 1/4 atau 1/8 atau 1/2
        
        // Saring furudh non-spouse
        const nonSpouseFurudh = furudhAssignments.filter(fa => fa.key !== 'suami' && fa.key !== 'istri');
        const sumNonSpouseNumerators = nonSpouseFurudh.reduce((sum, fa) => sum + fa.numInAM, 0);

        rawSharesList.length = 0;
        // Porsi pasangan:
        rawSharesList.push({
          key: spouseShare.key,
          num: spouseShare.num * sumNonSpouseNumerators,
          den: spouseShare.den * sumNonSpouseNumerators,
          isAshabah: false,
          isAshabahBilGhair: false,
          isAshabahMaAlGhair: false
        });

        // Bagikan sisa kepada ashabul furudh lain
        nonSpouseFurudh.forEach(ns => {
          // ns menerima porsi aslinya ditambah porsi radd.
          // Rumus matematis setara: non_spouse_saham = (1 - porsi_pasangan) * (saham_ns / total_saham_ns_selebihnya)
          // Contoh: Istri = 1/4. Sisa = 3/4. Anak Perempuan (fardh 1/2) + Ibu (1/6). rasio anak pr : ibu = 3:1.
          // Anak pr dpt 3/4 dari 3/4 = 9/16. Ibu dpt 1/4 dari 3/4 = 3/16.
          // Mari kita konversikan langsung ke penyebut umum
          const userSharePercentOfRemainder = ns.numInAM / sumNonSpouseNumerators;
          const spouseRem = 1 - spousePortion;
          const finalFraction = spouseRem * userSharePercentOfRemainder;

          // Kita ubah ke numerikal representation agar presisi
          // finalFraction = (spouseShare.den - spouseShare.num)/spouseShare.den * ns.numInAM / sumNonSpouseNumerators
          const finalNum = (spouseShare.den - spouseShare.num) * ns.numInAM;
          const finalDen = spouseShare.den * sumNonSpouseNumerators;

          rawSharesList.push({
            key: ns.key,
            num: finalNum,
            den: finalDen,
            isAshabah: false,
            isAshabahBilGhair: false,
            isAshabahMaAlGhair: false
          });
        });

        // Hasil penyebut KPK akhir untuk Radd dengan Pasangan
        finalProblem = spouseShare.den * sumNonSpouseNumerators;

        calculationSteps.push({
          title: 'Distribusi Sisa Harta Menggunakan Radd (Mode Jumhur)',
          description: `Terdapat sisa harta dan ada Pasangan (Suami/Istri). Sesuai kesepakatan Jumhur sahabat:\n` +
            `1. Pasangan tidak memperoleh tambahan Radd, bagian mereka tetap sesuai porsi awal.\n` +
            `2. Sisa harta setelah porsi pasangan dibagikan habis kepada ahli waris fardh lain secara proporsional.\n` +
            `➡️ KPK Penyebut Akhir: ${finalProblem} dengan penyelesaian radd sukses.`
        });

      } else {
        // Radd tanpa suami/istri
        // Penyebut asal masalah langsung diturunkan menjadi jumlah saham fardh yang ada
        finalProblem = sumSelectedNumerators(furudhAssignments);
        rawSharesList.length = 0;
        
        furudhAssignments.forEach(fa => {
          rawSharesList.push({
            key: fa.key,
            num: fa.numInAM,
            den: finalProblem,
            isAshabah: false,
            isAshabahBilGhair: false,
            isAshabahMaAlGhair: false
          });
        });

        calculationSteps.push({
          title: 'Distribusi Sisa Harta Menggunakan Radd (Tanpa Pasangan)',
          description: `Sisa porsi ashabul furudh dikembalikan kepada mereka sendiri secara proporsional.\n` +
            `➡️ Asal Masalah diturunkan dari ${ancestralProblem} menjadi ${finalProblem} (Kecil penyebut).`
        });
      }

    } else {
      // ==========================================
      // KASUS NORMAL ATAU ADA KANDUNGAN ASHABAH
      // ==========================================
      finalProblem = ancestralProblem;
      
      // Sync rawSharesList with furudhAssignments so non-ashabah shares have the right ancestral values
      rawSharesList.forEach(share => {
        if (!share.isAshabah) {
          const fa = furudhAssignments.find(f => f.key === share.key);
          if (fa) {
            share.num = fa.numInAM;
            share.den = ancestralProblem;
          }
        }
      });

      const sisaSaham = finalProblem - sumFurudhNumerators;

      // Jika ada ashabah yang berhak mengambil sisa saham
      if (hasActiveAshabah && sisaSaham >= 0) {
        // Hitung total saham ashabah berdasarkan aturan rasio 2:1 (untuk ashabah bil ghair) atau 1:0 (pria saja)
        // Kita hitung total kepala/bagian ashabah
        let totalAshabahShares = 0;
        activeAshabah.forEach(ash => {
          const qty = getCount(ash.key);
          const genderNode = ALL_HEIRS_LIST.find(h => h.key === ash.key);
          if (ash.isAshabahBilGhair) {
            // Rasio pria mendapat 2, wanita mendapat 1
            if (genderNode?.gender === 'L') {
              totalAshabahShares += qty * 2;
            } else {
              totalAshabahShares += qty * 1;
            }
          } else if (ash.isAshabahMaAlGhair) {
            // Saudara perempuan kandung/seayah bertindak sebagai ashabah mengambil sisa. Rasio rata 1
            totalAshabahShares += qty * 1;
          } else {
            // Ashabah bin nafsih pria, rasio rata 1 per orang
            totalAshabahShares += qty * 1;
          }
        });

        if (totalAshabahShares > 0) {
          // Melakukan Tashih (Koreksi) penyebut jika sisaSaham tidak habis dibagi totalAshabahShares
          // e.g. sisaSaham = 1, totalAshabahShares = 3. Maka Penyebut dikalikan 3.
          const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
          const divisor = gcd(sisaSaham, totalAshabahShares);
          const multiplier = totalAshabahShares / divisor;

          if (multiplier > 1) {
            finalProblem = ancestralProblem * multiplier;
            // Update porsi furudh yang sudah ada dikali multiplier
            rawSharesList.forEach(share => {
              if (!share.isAshabah) {
                share.num = share.num * multiplier;
                share.den = finalProblem;
              }
            });
            
            // Sisa saham yang siap dibagikan ashabah disesuaikan multiplier
            const adjustedSisaSaham = sisaSaham * multiplier;
            const sharePerPart = adjustedSisaSaham / totalAshabahShares;

            activeAshabah.forEach(ash => {
              const qty = getCount(ash.key);
              const genderNode = ALL_HEIRS_LIST.find(h => h.key === ash.key);
              let itemNum = 0;
              
              if (ash.isAshabahBilGhair) {
                const partValue = (genderNode?.gender === 'L' ? 2 : 1);
                itemNum = partValue * sharePerPart * qty;
              } else {
                itemNum = 1 * sharePerPart * qty;
              }

              rawSharesList.push({
                key: ash.key,
                num: itemNum,
                den: finalProblem,
                isAshabah: true,
                isAshabahBilGhair: ash.isAshabahBilGhair,
                isAshabahMaAlGhair: ash.isAshabahMaAlGhair
              });
            });

            calculationSteps.push({
              title: 'Tashih (Koreksi Masalah) untuk Penyelesaian Ashabah',
              description: `Sisa saham sisa ashabah ${sisaSaham}/${ancestralProblem} tidak dapat dibagi habis ke dalam total ${totalAshabahShares} bagian ashabah.\n` +
                `➡️ Dilakukan pengalian seluruh penyebut dengan faktor ${multiplier} sehingga Asal Masalah baru menjadi ${finalProblem}.`
            });

          } else {
            // Sisa saham habis dibagi rata ashabah
            const sharePerPart = sisaSaham / totalAshabahShares;
            activeAshabah.forEach(ash => {
              const qty = getCount(ash.key);
              const genderNode = ALL_HEIRS_LIST.find(h => h.key === ash.key);
              let itemNum = 0;

              if (ash.isAshabahBilGhair) {
                const partValue = (genderNode?.gender === 'L' ? 2 : 1);
                itemNum = partValue * sharePerPart * qty;
              } else {
                itemNum = 1 * sharePerPart * qty;
              }

              rawSharesList.push({
                key: ash.key,
                num: itemNum,
                den: finalProblem,
                isAshabah: true,
                isAshabahBilGhair: ash.isAshabahBilGhair,
                isAshabahMaAlGhair: ash.isAshabahMaAlGhair
              });
            });

            calculationSteps.push({
              title: 'Pembagian Sisa Warisan untuk Ashabah',
              description: `Sisa harta warisan senilai ${sisaSaham}/${finalProblem} dibagikan langsung kepada penerima Ashabah\n` +
                `dengan total hak ashabah ${totalAshabahShares} bagian tanpa memerlukan koreksi (tashih) penyebut.`
            });
          }
        }
      } else {
        // Normal furudh tanpa ashabah dan pas 100%
        rawSharesList.length = 0;
        furudhAssignments.forEach(fa => {
          rawSharesList.push({
            key: fa.key,
            num: fa.numInAM,
            den: finalProblem,
            isAshabah: false,
            isAshabahBilGhair: false,
            isAshabahMaAlGhair: false
          });
        });
      }
    }
  }

  // Helper untuk menjumlahkan pembilang
  function sumSelectedNumerators(arr: { numInAM: number }[]): number {
    return arr.reduce((sum, item) => sum + item.numInAM, 0);
  }

  // ==========================================
  // TAHAP 9: PRESENTASI DISTRIBUSI WARIS AKHIR & TAHAP 10: VALIDASI TOTAL 100%
  // ==========================================
  
  const heirResults: HeirResult[] = [];
  let calculatedAndValidatedSumPercentage = 0;
  let totalNominalDistributed = 0;

  // Satukan hasil perhitungan per-key dengan porsi individual
  ALL_HEIRS_LIST.forEach(heirMeta => {
    const qty = getCount(heirMeta.key);
    if (qty > 0) {
      const matches = rawSharesList.filter(s => s.key === heirMeta.key);
      let matchShare: any = undefined;
      
      if (matches.length > 0) {
        const firstMatch = matches[0];
        let combinedNum = 0;
        matches.forEach(s => {
          if (s.den !== firstMatch.den) {
            combinedNum += s.num * (firstMatch.den / s.den);
          } else {
            combinedNum += s.num;
          }
        });
        
        matchShare = {
          ...firstMatch,
          num: combinedNum,
          den: firstMatch.den,
          isAshabah: matches.some(s => s.isAshabah)
        };
      }
      
      if (blockedHeirs.has(heirMeta.key)) {
        const bl = blockedHeirs.get(heirMeta.key)!;
        heirResults.push({
          key: heirMeta.key,
          name: heirMeta.name,
          arabicName: heirMeta.arabicName,
          qty,
          status: 'Gugur',
          originalShare: 'Mahjub',
          finalNumerator: 0,
          finalDenominator: 1,
          percentage: 0,
          totalPercentage: 0,
          amountPerIndiv: 0,
          totalAmount: 0,
          reason: bl.reason
        });
      } else if (matchShare) {
        // hitung porsi individual
        // matchShare.num adalah TOTAL porsi kelompok ahli waris ini dalam penyebut umum matchShare.den
        // Maka porsi per individu = matchShare.num / (matchShare.den * qty)
        const commonDen = matchShare.den * qty;
        const indivNum = matchShare.num; // indivNum / commonDen
        
        const percentage = (indivNum / commonDen) * 100;
        const totalPercentage = percentage * qty;
        const amountPerIndiv = (indivNum / commonDen) * netEstate;
        const totalAmount = amountPerIndiv * qty;

        calculatedAndValidatedSumPercentage += totalPercentage;
        totalNominalDistributed += totalAmount;

        let statusText: StatusWaris = 'Ashabul Furudh';
        if (specialCase === 'Musyarakah' && ['saudara_bu', 'saudari_bu', 'saudara_knd', 'saudari_knd'].includes(heirMeta.key)) {
          statusText = 'Musyarakah';
        } else if (matchShare.isAshabah) {
          statusText = 'Ashabah';
        }

        const originalShareString = 
          specialCase === 'Akdariyyah' ? 'Akdariyyah' :
          specialCase === 'Musyarakah' ? '1/3 Rata' :
          matchShare.isAshabah ? 'Ashabah' : formatFraction(matchShare.num / qty, matchShare.den);

        heirResults.push({
          key: heirMeta.key,
          name: heirMeta.name,
          arabicName: heirMeta.arabicName,
          qty,
          status: statusText,
          originalShare: originalShareString,
          finalNumerator: indivNum,
          finalDenominator: commonDen,
          percentage,
          totalPercentage,
          amountPerIndiv,
          totalAmount,
          reason: getSyarIReason(heirMeta.key, qty, input)
        });
      } else {
        // Aktif tapi tidak kebagian (aslinya ashabah tapi sisa = 0)
        heirResults.push({
          key: heirMeta.key,
          name: heirMeta.name,
          arabicName: heirMeta.arabicName,
          qty,
          status: 'Mahjub',
          originalShare: 'Sisa (Ashabah)',
          finalNumerator: 0,
          finalDenominator: 1,
          percentage: 0,
          totalPercentage: 0,
          amountPerIndiv: 0,
          totalAmount: 0,
          reason: 'Tidak mendapat bagian ashabah karena sisa harta peninggalan telah habis dibagi ashabul furudh.'
        });
      }
    }
  });

  // Validasi akhir
  const diffPercentage = Math.abs(calculatedAndValidatedSumPercentage - 100);
  const isValid = diffPercentage < 0.01 || heirResults.length === 0;

  // Tambahkan porsi aktif syar'i rujukan Kitab Rahbiyyah ke explanationLogs untuk visualisasi Cetak
  heirResults.forEach(h => {
    if (h.status !== 'Gugur' && h.status !== 'Mahjub' && h.reason) {
      explanationLogs.push(`📝 ${h.name} (${h.status}):\n${h.reason}`);
    }
  });

  return {
    ancestralProblem,
    finalProblem,
    isAul,
    isRadd,
    aulTarget,
    netEstate,
    bequestAllowed,
    heirResults,
    explanationLogs,
    calculationSteps,
    specialCaseName: specialCase || undefined,
    isValid,
    errorMessages: errorMessages.length > 0 ? errorMessages : undefined
  };
}

/**
 * Mendapatkan argumen syar'i untuk ahli waris tertentu berdasarkan aturan dlm Rahbiyyah
 */
function getSyarIReason(key: HeirKey, qty: number, input: FaraidhInput): string {
  const allSublingsQty = (input.heirs['saudara_knd'] || 0) + (input.heirs['saudari_knd'] || 0) + (input.heirs['saudara_by'] || 0) + (input.heirs['saudari_by'] || 0) + (input.heirs['saudara_bu'] || 0) + (input.heirs['saudari_bu'] || 0);
  const hasKids = (input.heirs['anak_lk'] || 0) > 0 || (input.heirs['anak_pr'] || 0) > 0 || (input.heirs['cucu_lk'] || 0) > 0 || (input.heirs['cucu_pr'] || 0) > 0;

  switch (key) {
    case 'suami':
      if (hasKids) {
        return `Mendapat porsi 1/4 (Hajb Nuqshan) karena pewaris memiliki keturunan.\n` +
               `📖 Fasal Bagian 1/4 (الرُّبُع) - Bait 17:\n` +
               `وَالرُّبْعُ فَرْضُ الزَّوْجِ إِنْ كَانَ مَعَهْ ... مِنْ وَلَدِ الزَّوْجَةِ مَنْ قَدْ تَبِعَهْ\n` +
               `"Dan seperempat adalah fardh untuk Suami jika ia menyertai keturunan isteri yang mengikutinya."`;
      } else {
        return `Mendapat porsi penuh 1/2 karena pewaris tidak memiliki keturunan.\n` +
               `📖 Fasal Bagian 1/2 (النِّصْف) - Bait 16:\n` +
               `وَنِصْفُ مِيرَاثِ Nِّسَاءِ الزَّوْجُ ... إِذَا خَلَتْ عَنْ وَلَدٍ يُهَيَّجُ\n` +
               `"Dan bagi suami adalah setengah harta peninggalan wanita (isteri), apabila wanita tersebut tidak meninggalkan keturunan."`;
      }
    case 'istri':
      if (hasKids) {
        return `Mendapat porsi bersama/tunggal 1/8 karena pewaris memiliki keturunan.\n` +
               `📖 Fasal Bagian 1/8 (الثُّمُن) - Bait 20:\n` +
               `وَالثُّمنُ لِلزَّوْجَةِ وَالزَّوْجَاتِ ... مَعَ البَنِينَ أَوْ مَعَ البَنَاتِ\n` +
               `"Dan seperdelapan adalah bagian isteri atau para isteri bersamaan dengan adanya anak laki-laki atau perempuan."`;
      } else {
        return `Mendapat porsi bersama/tunggal 1/4 karena pewaris tidak memiliki keturunan.\n` +
               `📖 Fasal Bagian 1/4 (الرُّبُع) - Bait 18:\n` +
               `وَهُوَ لِكُلِّ زَوْجَةٍ أَوْ أَكْثَرَا ... مَعَ عَدَمِ الأَوْلَادِ فِيمَا قُدِّرَا\n` +
               `"Dan (seperempat) itu bagian bagi satu isteri atau lebih jika pewaris tidak memiliki keturunan dalam hal yang telah ditentukan syariat."`;
      }
    case 'ibu':
      // Check Umariyyatayn
      const isUmariyyataynSuami = (input.heirs['suami'] || 0) > 0 && (input.heirs['ayah'] || 0) > 0 && allSublingsQty === 0 && !hasKids;
      const isUmariyyataynIstri = (input.heirs['istri'] || 0) > 0 && (input.heirs['ayah'] || 0) > 0 && allSublingsQty === 0 && !hasKids;
      if (isUmariyyataynSuami || isUmariyyataynIstri) {
        return `Mendapat 1/3 dari SISA (Kasus Ghorrawain/Umariyyatayn) setelah bagian pasangan diambil, sebagai langkah menjaga keadilan porsi ayah yang harus bernilai dua kali lipat porsi ibu.\n` +
               `📖 Fasal Bagian 1/3 Sisa (ثُلُث البَاقِي) - Bait 25-26:\n` +
               `وَإِنْ يَكُنْ زَوْجٌ وَأُمٌّ وَأَبُ ... فَلِثُلُثِ البَاقِي لَهَا مُرَتَّبُ\n` +
               `كَمَا لَوِ اسْتَهَلَّتْ زَوْجَةٌ مَعَ أَبِ ... وَأُمِّهَا الطَّاعَةُ لِلْمُجْتَهِبِ\n` +
               `"Jika ahli waris adalah Suami, Ibu, dan Ayah, maka Ibu mendapat sepertiga dari sisa harta yang diatur. Begitu pula jika ahli waris terdiri dari Istri, Ayah, dan Ibu."`;
      }
      if (hasKids) {
        return `Mendapat 1/6 (Hajb Nuqshan) karena pewaris memiliki keturunan.\n` +
               `📖 Fasal Bagian 1/6 (السُّدُس) - Bait 22:\n` +
               `فَأُمُّ تَأْخُذُهُ مَعَ الوَلَدِ ... أَوْ مَعَ اثْنَيْنِ مِنْ إِخْوَةٍ يُعْتَمَدْ\n` +
               `"Maka Ibu mengambil porsi seperenam jika beserta dengan anak, atau beserta dua saudara/i (atau lebih) yang diperhitungkan."`;
      }
      if (allSublingsQty >= 2) {
        return `Mendapat 1/6 (Hajb Nuqshan) karena ada perkumpulan saudara/i (${allSublingsQty} orang).\n` +
               `📖 Fasal Bagian 1/6 (السُّدُس) - Bait 22:\n` +
               `فَأُمُّ تَأْخُذُهُ مَعَ الوَلَدِ ... أَوْ مَعَ اثْنَيْنِ مِنْ إِخْوَةٍ يُعْتَمَدْ\n` +
               `"Maka Ibu mengambil porsi seperenam jika beserta dengan anak, atau beserta dua saudara/i (atau lebih)."`;
      }
      return `Mendapat porsi penuh 1/3 karena tidak ada anak maupun perkumpulan saudara.\n` +
             `📖 Fasal Bagian 1/3 (الثُّلُث) - Bait 24:\n` +
             `وَالثُّلُثُ فَرْضُ الأُمِّ حَيْثُ لَا وَلَدْ ... وَلَا لَهَا جَمْعٌ مِنَ الإِخْوَةِ يُعْتَمَدْ\n` +
             `"Dan sepertiga adalah fardh untuk Ibu selama tidak ada keturunan dan tidak ada sekumpulan saudara yang diperhitungkan."`;
    case 'ayah':
      if (hasKids) {
        return `Mendapat porsi fardh 1/6 karena pewaris memiliki keturunan.\n` +
               `📖 Fasal Bagian 1/6 (السُّدُس) - Bait 21:\n` +
               `فَالأَبُ يَسْتَحِقُّهُ مَعَ الوَلَدْ ... وَهَكَذَا الجَدُّ عِنْدَ فَقْدِهِ يُعْتَمَدْ\n` +
               `"Maka Ayah berhak mendapatkan porsi seperenam bersama anak pewaris, demikian pula Kakek jika Ayah tidak ada."`;
      } else {
        return `Mendapat seluruh sisa harta lewat jalur Ashabah Bin Nafsih, karena tidak ada keturunan laki-laki.\n` +
               `📖 Fasal Ta'shib (العَصَبَة) - Bait 28-29:\n` +
               `وَكُلُّ مَنْ أَحْرَزَ كُلَّ المَالِ ... مِنَ القَرَابَاتِ أَوِ Mَوَالِي\n` +
               `فَهُوَ أَخُو العُصُوبَةِ المُفَضَّلِ ... كَالابْنِ وَالأَخِ المِلِي الكَامِلِ\n` +
               `"Dan setiap orang yang mengambil sisa/seluruh harta dari kalangan kerabat terdekat atau penolong, maka ia adalah pemegang ashabah yang diutamakan."`;
      }
    case 'kakek':
      return `Mendapat bagian fardh 1/6 atau ashabah sejalan dengan status kakek pengganti ayah ketika ayah wafat terlebih dahulu.\n` +
             `📖 Fasal Kakek & Saudara (الجد والإخوة) - Bait 21 / 34:\n` +
             `وَهَكَذَا الجَدُّ عِنْدَ فَقْدِ الأَبِ ... يَقُومُ مَقَامَهُ بِلا كَذِبِ\n` +
             `"Dan demikianlah Kakek ketika tidak adanya Ayah, dia menempati posisinya tanpa keraguan."`;
    case 'nenek_ibu':
    case 'nenek_ayah':
      return `Mendapat porsi fardh bersama/sendirian 1/6 selaku pengganti posisi ibu saat ibu tidak ada.\n` +
             `📖 Fasal Bagian Nenek (الجدات) - Bait 39:\n` +
             `وَقَدْ قَضَى النَّبِيُّ لِلْجَدَّاتِ ... بِالسُّدُسِ عِنْدَ فَقْدِ الأُمَّهَاتِ\n` +
             `"Dan sungguh Rasulullah SAW telah memutuskan atau menetapkan bagian seperenam untuk nenek-nenek ketika tidak lagi ada ibu/ibu-ibu."`;
    case 'anak_lk':
      return `Bertindak sebagai Ashabah Bin Nafsih prima dengan sisa harta warisan. Jika ada anak perempuan, mereka berbagi dengan rasio 2:1.\n` +
             `📖 Fasal Pembagian Ashabah (التعصيب) - Bait 29:\n` +
             `فَهُوَ أَخُو العُصُوبَةِ المُفَضَّلِ ... كَالابْنِ وَالأَخِ المِلِي الكَامِلِ\n` +
             `"Maka dialah pemegang gelar Ashabah yang utama, seperti Anak laki-laki dan Saudara laki-laki yang kokoh porsinya."`;
    case 'anak_pr':
      if (qty === 1) {
        return `Mendapat fardh setengah (1/2) karena ia anak tunggal dan tidak ada saudara laki-laki penolong.\n` +
               `📖 Fasal Bagian 1/2 (النِّصْف) - Bait 14:\n` +
               `وَالنِّصْفُ فَرْضُ خَمْسَةٍ أَفْرَادِ ... الزَّوْجُ وَالأُنْثَى مِنَ الأَوْلَادِ\n` +
               `"Setengah adalah porsi fardh untuk lima golongan: diantaranya Suami, dan anak kandung perempuan tunggal."`;
      } else {
        return `Mendapat porsi bersama 2/3 karena jumlahnya berdua atau lebih, dan tidak ada anak laki-laki.\n` +
               `📖 Fasal Bagian 2/3 (الثُّلُثَيْنِ) - Bait 15:\n` +
               `وَالثُّلُثَانِ فَرْضُ أَرْبَعٍ مِنَ النِّسَا ... بِنْتٍ وَبِنْتِ ابْنِ شَرِيفَاتِ النَّسَا\n` +
               `"Dua sepertiga adalah fardh untuk empat golongan wanita: Anak kandung perempuan (dua atau lebih), dan Cucu perempuan..."`;
      }
    case 'cucu_lk':
      return `Bertindak sebagai Ashabah Bin Nafsih sisa harta dalam urutan pengganti posisi anak laki-laki.\n` +
             `📖 Fasal Bagian Ashabah (التعصيب) - Bait 30:\n` +
             `وَحُكْمُهُ كَحُكْمِ ابْنِ العُصُوبَة ... عِنْدَ خُلُوِّ عَنِ الْمَحْجُوبِهِ\n` +
             `"Dan hukum (cucu laki-laki) adalah seperti kedudukan anak laki-laki dalam ashabah jika tidak ada yang menghalangi."`;
    case 'cucu_pr':
      const qtyAnakPr = input.heirs['anak_pr'] || 0;
      if (qty === 1 && qtyAnakPr === 0) {
        return `Mendapat fardh setengah (1/2) karena sendirian, tidak ada anak perempuan kandung, dan tidak ada cucu laki-laki.\n` +
               `📖 Fasal Bagian 1/2 (النِّصْف) - Bait 15:\n` +
               `وَبِنْتُ الابْنِ عِنْدَ فَقْدِ البِنْتِ ... صَاحِبَةُ النِّصْفِ كَمَا عَلِمْتِ\n` +
               `"Dan anak perempuan dari anak laki-laki (cucu perempuan) apabila tidak ada anak perempuan kandung, maka ia pemilik porsi setengah sebagaimana engkau ketahui."`;
      } else if (qtyAnakPr === 1) {
        return `Mendapat porsi fardh 1/6 sebagai penyempurna porsi dua pertiga (Takmiliyyatan lits-tsulutsain) karena ada satu anak perempuan kandung.\n` +
               `📖 Fasal Bagian 1/6 (السُّدُس) - Bait 23:\n` +
               `وَبِنْتُ الابْنِ تَأْخُذُ السُّدْسَ مَعَا ... بِنْتِ الوِلَادَةِ تَأْصِيلًا شَاعَا\n` +
               `"Dan cucu perempuan mengambil porsi seperenam bersama anak perempuan kandung tunggal untuk menyempurnakan bagian dua pertiga."`;
      } else {
        return `Mengambil porsi bersama dalam pemegang fardh keturunan perempuan.\n` +
               `📖 Fasal Bagian 2/3 (الثُّلُثَيْنِ) - Bait 15:\n` +
               `وَالثُّلُثَانِ فَرْضُ أَرْبَعٍ مِنَ النِّسَا ... بِنْتٍ وَبِنْتِ ابْنِ شَرِيفَاتِ النَّسَا\n` +
               `"Dua sepertiga adalah fardh untuk empat golongan wanita: Anak kandung perempuan, Cucu perempuan (dua atau lebih)..."`;
      }
    case 'saudara_bu':
    case 'saudari_bu':
      const qtySeibu = (input.heirs['saudara_bu'] || 0) + (input.heirs['saudari_bu'] || 0);
      if (qtySeibu > 1) {
        return `Berbagi porsi fardh sepertiga (1/3) secara merata tanpa membedakan gender laki-laki dan perempuan.\n` +
               `📖 Fasal Bagian 1/3 (الثُّلُث) - Bait 27:\n` +
               `وَالثُّلُثُ فَرْضُ اثْنَيْنِ أَوْ كَثِيرَا ... مِنْ وَلَدِ الأُمِّ عَلَى التَّشْهِيرَا\n` +
               `"Dan sepertiga adalah fards bagi dua orang atau lebih dari anak seibu secara masyhur."`;
      } else {
        return `Mendapat porsi fardh 1/6 sebagai saudara seibu tunggal.\n` +
               `📖 Fasal Bagian 1/6 (السُّدُس) - Bait 24:\n` +
               `وَإِنْ يَكُنْ وَاحِدًا مِنَ الإِخْوَةِ ... لِلأُمِّ فَرْضُ السُّدُسِ فِي التَّسْوِيَةِ\n` +
               `"Dan bilamana saudara seibu itu tunggal (satu orang), maka porsi seperenam adalah fardh yang adil bagi dirinya."`;
      }
    case 'saudara_knd':
      return `Mendapat sisa harta sebagai ashabah nasab bersaudara terkuat setelah porsi fardh habis dibagikan.\n` +
             `📖 Fasal Ta'shib (العَصَبَة) - Bait 29:\n` +
             `فَهُوَ أَخُو العُصُوبَةِ المُفَضَّلِ ... كَالابْنِ وَالأَخِ المِلِي الكَامِلِ\n` +
             `"Maka ia menjadi pemilik keistimewaan ashabah, layaknya anak laki-laki dan saudara laki-laki."`;
    case 'saudari_knd':
      if (hasKids) {
        return `Bertindak sebagai Ashabah Ma'al Ghair (bersama keturunan perempuan anak/cucu perempuan) mengambil sisa harta.\n` +
               `📖 Fasal Ashabah Ma'al Ghair - Bait 32:\n` +
               `وَالأَخَوَاتُ إِنْ يَكُنْ بَنَاتُ ... فَهُنَّ مَعْهُنَّ عَصَبَاتُ\n` +
               `"Dan segenap saudara perempuan bila disandingkan dengan keturunan perempuan (anak/cucu perempuan), maka mereka bersama-sama menjadi Ashabah."`;
      } else if (qty === 1) {
        return `Mendapat fardh setengah (1/2) karena sendirian, tidak ada anak/cucu, ayah, maupun saudara laki-laki kandung.\n` +
               `📖 Fasal Bagian 1/2 (النِّصْف) - Bait 14:\n` +
               `وَالنِّصْفُ فَرْضُ خَمْسَةٍ أَفْرَادِ ... الزَّوْجُ وَالأُنْثَى مِنَ الأَوْلَادِ ... وَالأُخْتُ\n` +
               `"Setengah adalah porsi fardh untuk lima golongan: diantaranya Suami, anak perempuan, dan saudara perempuan..."`;
      } else {
        return `Mendapat porsi bersama 2/3 karena jumlahnya berdua atau lebih, dan tidak ada saudara kandung laki-laki.\n` +
               `📖 Fasal Bagian 2/3 (الثُّلُثَيْنِ) - Bait 15:\n` +
               `وَالثُّلُثَانِ فَرْضُ أَرْبَعٍ مِنَ النِّسَا ... بِنْتٍ وَبِنْتِ ابْنِ ... وَأُخْتٍ\n` +
               `"Dua sepertiga adalah fardh untuk empat golongan wanita... termasuk saudara kandung perempuan."`;
      }
    case 'saudara_by':
      return `Mendapat sisa harta sebagai ashabah seayah (posisi di bawah saudara kandung).\n` +
             `📖 Fasal Pembagian Ashabah (التعصيب) - Bait 29:\n` +
             `فَهُوَ أَخُو العُصُوبَةِ المُفَضَّلِ ... كَالابْنِ وَالأَخِ المِلِي الكَامِلِ\n` +
             `"Maka ia menjadi pemilik keistimewaan ashabah, layaknya anak laki-laki dan saudara laki-laki."`;
    case 'saudari_by':
      if (hasKids) {
        return `Bertindak sebagai Ashabah Ma'al Ghair (bersama keturunan perempuan) mengambil sisa harta.\n` +
               `📖 Fasal Ashabah Ma'al Ghair - Bait 32:\n` +
               `وَالأَخَوَاتُ إِنْ يَكُنْ بَنَاتُ ... فَهُنَّ مَعْهُنَّ عَصَبَاتُ\n` +
               `"Dan segenap saudara-saudara perempuan bila ada anak perempuan, maka mereka bersama-sama menjadi Ashabah."`;
      } else if (qty === 1) {
        const qtySrdKndPr = input.heirs['saudari_knd'] || 0;
        if (qtySrdKndPr === 1) {
          return `Mendapat porsi fardh 1/6 sebagai penyempurna porsi 2/3 (Takmiliyyah) karena ada satu saudara perempuan kandung.\n` +
                 `📖 Fasal Bagian 1/6 (السُّدُس) - Bait 23:\n` +
                 `وَبِنْتُ الابْنِ تَأْخُذُ السُّدْسَ مَعَا ... بِنْتِ الوِلَادَةِ تَأْصِيلًا شَاعَا\n` +
                 `"Dan saudara perempuan seayah mengambil porsi seperenam bersama satu saudara perempuan kandung tunggal (untuk menyempurnakan 2/3)."`;
        }
        return `Mendapat fardh setengah (1/2) karena sendirian dan tidak ada penghalang.\n` +
               `📖 Fasal Bagian 1/2 (النِّصْف) - Bait 14:\n` +
               `وَالنِّصْفُ فَرْضُ خَمْسَةٍ أَفْرَادِ ... وَالأُخْتُ لِأَبِ\n` +
               `"Setengah adalah porsi fardh untuk lima golongan... termasuk saudara perempuan seayah."`;
      } else {
        return `Mendapat porsi bersama 2/3 karena jumlahnya berdua atau lebih, and tidak ada penghalang.\n` +
               `📖 Fasal Bagian 2/3 (الثُّلُثَيْنِ) - Bait 15:\n` +
               `وَالثُّلُثَانِ فَرْضُ أَرْبَعٍ مِنَ النِّسَا ... وَأُخْتٍ لِأَبِ\n` +
               `"Dua sepertiga adalah fardh untuk empat golongan wanita... termasuk saudara seayah perempuan."`;
      }
    default:
      return 'Menerima bagian distribusi berdasarkan penetapan prioritas kedekatan ashabah ahli waris.';
  }
}
