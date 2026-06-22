export type Gender = 'L' | 'P';

export type HeirKey =
  // Laki-laki (15)
  | 'anak_lk'
  | 'cucu_lk'
  | 'ayah'
  | 'kakek'
  | 'saudara_knd'
  | 'saudara_by'
  | 'saudara_bu'
  | 'keponakan_knd'
  | 'keponakan_by'
  | 'paman_knd'
  | 'paman_by'
  | 'sepupu_knd'
  | 'sepupu_by'
  | 'suami'
  | 'mu_tiq'
  // Perempuan (10)
  | 'anak_pr'
  | 'cucu_pr'
  | 'ibu'
  | 'nenek_ibu'
  | 'nenek_ayah'
  | 'saudari_knd'
  | 'saudari_by'
  | 'saudari_bu'
  | 'istri'
  | 'mu_tiqah';

export interface Heir {
  key: HeirKey;
  name: string;
  arabicName: string;
  gender: 'L' | 'P';
  isMale: boolean;
}

export const ALL_HEIRS_LIST: Heir[] = [
  // Laki-laki
  { key: 'anak_lk', name: 'Anak Laki-laki', arabicName: 'الابن', gender: 'L', isMale: true },
  { key: 'cucu_lk', name: 'Cucu Laki-laki (dari Anak Laki-laki)', arabicName: 'ابن الابن', gender: 'L', isMale: true },
  { key: 'ayah', name: 'Ayah', arabicName: 'الأب', gender: 'L', isMale: true },
  { key: 'kakek', name: 'Kakek Shahih (Ayah dari Ayah)', arabicName: 'الجد الصحيح', gender: 'L', isMale: true },
  { key: 'saudara_knd', name: 'Saudara Laki-laki Kandung', arabicName: 'الأخ الشقيق', gender: 'L', isMale: true },
  { key: 'saudara_by', name: 'Saudara Laki-laki Seayah', arabicName: 'الأخ لأب', gender: 'L', isMale: true },
  { key: 'saudara_bu', name: 'Saudara Laki-laki Seibu', arabicName: 'الأخ لأم', gender: 'L', isMale: true },
  { key: 'keponakan_knd', name: 'Anak Laki-laki Saudara Kandung', arabicName: 'ابن الأخ الشقيق', gender: 'L', isMale: true },
  { key: 'keponakan_by', name: 'Anak Laki-laki Saudara Seayah', arabicName: 'ابن الأخ لأب', gender: 'L', isMale: true },
  { key: 'paman_knd', name: 'Paman Kandung (Saudara Ayah)', arabicName: 'العم الشقيق', gender: 'L', isMale: true },
  { key: 'paman_by', name: 'Paman Seayah', arabicName: 'العم لأب', gender: 'L', isMale: true },
  { key: 'sepupu_knd', name: 'Anak Laki-laki Paman Kandung', arabicName: 'ابن العم الشقيق', gender: 'L', isMale: true },
  { key: 'sepupu_by', name: 'Anak Laki-laki Paman Seayah', arabicName: 'ابن العم لأب', gender: 'L', isMale: true },
  { key: 'suami', name: 'Suami', arabicName: 'الزوج', gender: 'L', isMale: true },
  { key: 'mu_tiq', name: 'Mu\'tiq (Pembebas Budak Lk)', arabicName: 'المعتق', gender: 'L', isMale: true },
  
  // Perempuan
  { key: 'anak_pr', name: 'Anak Perempuan', arabicName: 'البنت', gender: 'P', isMale: false },
  { key: 'cucu_pr', name: 'Cucu Perempuan (dari Anak Laki-laki)', arabicName: 'بنت الابن', gender: 'P', isMale: false },
  { key: 'ibu', name: 'Ibu', arabicName: 'الأم', gender: 'P', isMale: false },
  { key: 'nenek_ibu', name: 'Nenek dari Ibu', arabicName: 'الجدة لأم', gender: 'P', isMale: false },
  { key: 'nenek_ayah', name: 'Nenek dari Ayah', arabicName: 'الجدة لأب', gender: 'P', isMale: false },
  { key: 'saudari_knd', name: 'Saudara Perempuan Kandung', arabicName: 'الأخت الشقيقة', gender: 'P', isMale: false },
  { key: 'saudari_by', name: 'Saudara Perempuan Seayah', arabicName: 'الأخت لأب', gender: 'P', isMale: false },
  { key: 'saudari_bu', name: 'Saudara Perempuan Seibu', arabicName: 'الأخت لأم', gender: 'P', isMale: false },
  { key: 'istri', name: 'Istri', arabicName: 'الزوجة', gender: 'P', isMale: false },
  { key: 'mu_tiqah', name: 'Mu\'tiqah (Pembebas Budak Pr)', arabicName: 'المعتقة', gender: 'P', isMale: false },
];

export interface FaraidhInput {
  deceasedGender: Gender;
  assets: number;         // Total Harta Kasar
  debts: number;          // Hutang
  funeralCosts: number;   // Biaya Pemakaman
  bequest: number;        // Wasiat (Maks 1/3 harta bersih)
  heirs: Partial<Record<HeirKey, number>>; // Jumlah ahli waris untuk key tersebut (contoh: istri: 2, anak_lk: 3)
}

export type StatusWaris = 'Ashabul Furudh' | 'Ashabah' | 'Mahjub' | 'Gugur' | 'Musyarakah';

export interface HeirResult {
  key: HeirKey;
  name: string;
  arabicName: string;
  qty: number;
  status: StatusWaris;
  originalShare: string;   // Contoh: '1/2', '1/6', 'Ashabah', 'Mahjub'
  finalNumerator: number;  // Pembilang setelah Aul/Radd
  finalDenominator: number;// Penyebut setelah Aul/Radd
  percentage: number;      // Persentase bagian per individu
  totalPercentage: number; // Persentase total kategori (persentase * qty)
  amountPerIndiv: number;  // Nominal rupiah per individu
  totalAmount: number;     // Nominal rupiah total kategori
  reason: string;          // Alasan syar'i / Alasan gugur
}

export interface StepLog {
  title: string;
  description: string;
}

export interface FaraidhResult {
  ancestralProblem: number;      // Asal Masalah Awal (e.g. 6, 8, 12, 24, dst)
  finalProblem: number;          // Asal Masalah Akhir (setelah Aul/Radd)
  isAul: boolean;
  isRadd: boolean;
  aulTarget?: number;            // Masalah Aul
  netEstate: number;             // Harta bersih (harta - hutang - tajhiz - wasiat)
  bequestAllowed: number;        // Wasiat yang disetujui (maks 1/3 dari harta bersi setelah hutang & tajhiz)
  heirResults: HeirResult[];
  explanationLogs: string[];     // Log penjelasan per ahli waris
  calculationSteps: StepLog[];   // Langkah matematika perhitungan
  specialCaseName?: string;      // Nama Kasus Khusus (e.g., 'Musyarakah', 'Akdariyyah')
  isValid: boolean;              // Apakah validitas total % = 100%
  errorMessages?: string[];
}
