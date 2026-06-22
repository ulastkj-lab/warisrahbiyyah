export interface RahbiyyahVerse {
  arabic: string;
  indonesian: string;
  number: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RahbiyyahLesson {
  id: string;
  title: string;
  arabicTitle: string;
  chapter: 'Muqaddimah' | 'Ashabul Furudh' | 'Ashabah' | 'Hajb' | 'Aul' | 'Radd' | 'Musyarakah' | 'Akdariyyah';
  summary: string;
  verses: RahbiyyahVerse[];
  quizzes: QuizQuestion[];
}

export const RAHBIYYAH_LESSONS: RahbiyyahLesson[] = [
  {
    id: 'muqaddimah',
    title: 'Muqaddimah (Pendahuluan)',
    arabicTitle: 'المقدّمة',
    chapter: 'Muqaddimah',
    summary: 'Kitab Ar-Rahbiyyah dimulai dengan memuji Allah SWT, bershalawat atas Nabi Muhammad SAW, serta menekankan keutamaan ilmu Faraidh (waris Islam) sebagai ilmu pertama yang akan dicabut dari umat Islam, seperti yang disinyalir dalam hadits Nabi.',
    verses: [
      {
        number: 1,
        arabic: 'أَقُولُ فِي القَوْلِ بِحَمْدِ اللهِ ... مُسْتَفْتِحاً لِلرُّشْدِ فِي الأُمُورِ',
        indonesian: 'Aku memulai ucapanku dengan memuji Allah, seraya memohon petunjuk kebenaran dalam segala perkara.'
      },
      {
        number: 2,
        arabic: 'وَالحَمْدُ للهِ عَلَى مَا أَنْعَمَا ... حَمْداً بِهِ نَجْلُو عَنِ القَلْبِ العَمَى',
        indonesian: 'Dan segala puji bagi Allah atas segala nikmat yang diberikan-Nya, dengan pujian yang dengannya kita dapat membersihkan kebutaan hati.'
      },
      {
        number: 3,
        arabic: 'ثُمَّ الصَّلَاةُ بَعْدُ وَالسَّلَامُ ... عَلَى النُّبِيِّ المَصْطَفَى التِّهَامِي',
        indonesian: 'Kemudian, shalawat serta salam senantiasa tercurahkan kepada Nabi terpilih dari tanah Tihamah (Makkah).'
      },
      {
        number: 4,
        arabic: 'وَأَنَّ هَذَا العِلْمَ مَخْصُوصٌ بِمَا ... قَدْ شَاعَ فِيهِ عِنْدَ كُلِّ العُلَمَا',
        indonesian: 'Dan ketahuilah bahwa ilmu waris ini dikhususkan secara istimewa, sebagaimana telah masyhur di kalangan seluruh ulama.'
      },
      {
        number: 5,
        arabic: 'بِأَنَّهُ أَوَّلُ عِلْمٍ يُفْقَدُ ... فِي الأَرْضِ حَتَّى لَا يَكَادُ يُوجَدُ',
        indonesian: 'Bahwasanya ia (faraidh) merupakan ilmu pertama yang akan hilang dari muka bumi, hingga hampir-hampir tidak ditemukan lagi.'
      }
    ],
    quizzes: [
      {
        id: 'q_muq_1',
        question: 'Menurut Kitab Ar-Rahbiyyah, apakah jenis ilmu agama yang diprediksikan pertama kali diangkat dan lenyap dari bumi?',
        options: [
          'Ilmu Tafsir Al-Quran',
          'Ilmu Faraidh (Waris Islam)',
          'Ilmu Ushul Fikih',
          'Ilmu Hadits'
        ],
        correctIndex: 1,
        explanation: 'Dalam bait ke-5, penulis menyebutkan bahwa ilmu faraidh adalah ilmu pertama yang akan ditarik (hilang) dari muka bumi sampai hampir tidak ada orang yang mengetahuinya secara utuh.'
      }
    ]
  },
  {
    id: 'ashabul_furudh',
    title: 'Ashabul Furudh (Bagian Tertentu)',
    arabicTitle: 'باب أصحاب الفروض',
    chapter: 'Ashabul Furudh',
    summary: 'Bagian waris yang sudah ditentukan secara pasti di dalam Al-Quran ada 6 bagian, yaitu: 1/2 (Setengah), 1/4 (Seperempat), 1/8 (Seperdelapan), 2/3 (Dua Pertiga), 1/3 (Sepertiga), dan 1/6 (Seperenam). Masing-masing memiliki syarat tersendiri.',
    verses: [
      {
        number: 12,
        arabic: 'وَاعْلَمْ بِأَنَّ الإِرْثَ نَوْعَانِ هُمَا ... فَرْضٌ وَتَعْصِيبٌ عَلَى مَا قُسِّمَا',
        indonesian: 'Ketahuilah bahwa jalan pembagian warisan itu ada dua: jalan Fardh (bagian pasti) dan jalan Ta\'shib (sisa).'
      },
      {
        number: 13,
        arabic: 'فَالفَرْضُ فِي نَصِّ الكِتَابِ سِتَّهْ ... لَا فَرْضَ فِي الإِرْثِ سِوَاهَا بَتَّهْ',
        indonesian: 'Maka bagian Fardh di dalam nash Kitabullah (Al-Quran) berjumlah enam bagian, sama sekali tidak ada ketentuan lain di luar itu.'
      },
      {
        number: 14,
        arabic: 'نِصْفٌ وَرُبْعٌ ثُمَّ نِصْفُ الرُّبْعِ ... وَالثُّلُثَانِ وَهُمَا ذُو نَفْعِ',
        indonesian: 'Separuh (1/2), seperempat (1/4), kemudian setengahnya seperempat (1/8), dan dua pertiga (2/3) yang sarat manfaat.'
      },
      {
        number: 15,
        arabic: 'وَالثُّلُثُ الفَرْضُ كَذَا السُّدُسُ ... بِنَصِّ قُرْآنٍ فَلَا تَلْبِسُ',
        indonesian: 'Dan sepertiga (1/3) fardh, begitu pula seperenam (1/6) berdasarkan nash Al-Quran, maka janganlah engkau ragu.'
      }
    ],
    quizzes: [
      {
        id: 'q_furudh_1',
        question: 'Ada berapa bagian pasti (Fardh Muqaddar) yang secara eksplisit tertulis di dalam Al-Quran?',
        options: [
          '3 bagian',
          '4 bagian',
          '6 bagian',
          '8 bagian'
        ],
        correctIndex: 2,
        explanation: 'Fardh yang tercantum di Al-Quran ada 6, yakni 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6.'
      },
      {
        id: 'q_furudh_2',
        question: 'Berapakah porsi bagian yang berhak diterima seorang suami jika pasangan yang wafat TIDAK memiliki keturunan laki-laki maupun perempuan?',
        options: [
          '1/4 bagian',
          '1/2 bagian',
          '1/3 bagian',
          '1/6 bagian'
        ],
        correctIndex: 1,
        explanation: 'Suami mendapatkan 1/2 jika pewaris tidak memiliki keturunan (far\'u warits), dan berkurang menjadi 1/4 jika memiliki keturunan.'
      }
    ]
  },
  {
    id: 'ashabah',
    title: 'Pembagian Ashabah (Sisa)',
    arabicTitle: 'باب التعصيب',
    chapter: 'Ashabah',
    summary: 'Ashabah adalah ahli waris yang tidak memiliki porsi pecahan tertentu, melainkan mengambil sisa harta setelah dibagikan kepada Ashabul Furudh. Terdiri dari Ashabah Bin Nafsih (pria saja), Ashabah Bil Ghair (wanita bersama saudara prianya), dan Ashabah Ma\'al Ghair (saudara perempuan bersama anak/cucu perempuan).',
    verses: [
      {
        number: 28,
        arabic: 'وَكُلُّ مَنْ أَحْرَزَ كُلَّ المَالِ ... مِنَ القَرَابَاتِ أَوِ المَوَالِي',
        indonesian: 'Setiap kerabat nasab atau mantan majikan yang mengambil seluruh harta (ketika sendirian).'
      },
      {
        number: 29,
        arabic: 'فَهُوَ أَخُو العُصُوبَةِ المُفَضَّلِ ... كَالابْنِ وَالأَخِ المِلِي الكَامِلِ',
        indonesian: 'Maka dia adalah pemegang gelar Ashabah yang utama, seperti Anak laki-laki dan Saudara laki-laki yang kokoh haknya.'
      }
    ],
    quizzes: [
      {
        id: 'q_ashabah_1',
        question: 'Siapakah ahli waris wanita yang dapat bertindak sebagai Ashabah Ma\'al Ghair (Ashabah bersama yang lain)?',
        options: [
          'Ibu kandung',
          'Istri pewaris',
          'Saudara perempuan kandung / seayah jika bersama anak atau cucu perempuan',
          'Anak perempuan kandung'
        ],
        correctIndex: 2,
        explanation: 'Menurut bait terkenal "Segenap saudara perempuan bersama anak perempuan menjadi Ashabah", saudara perempuan kandung/seayah menjadi ashabah bersama keturunan perempuan (ashabah ma\'al ghair).'
      }
    ]
  },
  {
    id: 'hajb',
    title: 'Ilmu Hajb (Penghalangan)',
    arabicTitle: 'باب الحجب',
    chapter: 'Hajb',
    summary: 'Hajb adalah penghalangan ahli waris untuk menerima warisan. Terdiri dari Hajb Hirman (penghalangan total, gugur sama sekali) dan Hajb Nuqshan (pengurangan porsi karena adanya kehadiran ahli waris lain yang lebih dekat).',
    verses: [
      {
        number: 40,
        arabic: 'وَبَابُ الحَجْبِ فِي الإِرْثِ مُهِمٌّ ... وَفَهْمُهُ عَلَى الفَتَى مُتِمٌّ',
        indonesian: 'Bab Hajb (penghalangan) di dalam warisan amatlah penting, memahaminya secara matang adalah keharusan bagi seorang pemuda.'
      },
      {
        number: 41,
        arabic: 'فَتَارَةً يَكُونُ بِالنُّقْصَانِ ... وَتَارَةً يَكُونُ بِالحِرْمَانِ',
        indonesian: 'Maka adakalanya ia berupa pengurangan porsi bagian (Nuqshan), dan adakalanya penghapusan bagian secara total (Hirman).'
      }
    ],
    quizzes: [
      {
        id: 'q_hajb_1',
        question: 'Dapatkah Ibu terhalang penuh hingga 0 bagian (Hajb Hirman) oleh kehadiran keturunan atau ayah?',
        options: [
          'Ya, ibu gugur jika ada anak laki-laki',
          'Tidak, Ibu termasuk satu dari enam golongan utama yang tidak akan pernah tertutup penuh (Hajb Hirman)',
          'Ibu terhalang penuh jika ada Ayah',
          'Ibu terhalang jika ada Kakek'
        ],
        correctIndex: 1,
        explanation: 'Golongan yang tidak pernah terhalang penuh (Hajb Hirman) ada 6: Suami, Istri, Ayah, Ibu, Anak Laki-laki, dan Anak Perempuan.'
      }
    ]
  },
  {
    id: 'aul',
    title: 'Masalah Al-Aul (Kelebihan Saham)',
    arabicTitle: 'باب العول',
    chapter: 'Aul',
    summary: 'Aul terjadi ketika jumlah total bagian pembilang ashabul furudh setelah disamakan penyebutnya melebihi nilai penyebut umum (Asal Masalah). Dalam hal ini, Ar-Rahbiyyah menjabarkan bagaimana menaikkan nilai asal masalah agar seluruh penerima terbagi merata.',
    verses: [
      {
        number: 55,
        arabic: 'وَاعْلَمْ بِأَنَّ العَوْلَ أَنْ تَزِيدَا ... سِهَامُ فَرْضِ كُلِّ مَنْ يُرِيدَا',
        indonesian: 'Ketahuilah bahwa Aul adalah bertambahnya total nilai saham-saham fardh bagi para ahli waris yang berhak.'
      },
      {
        number: 56,
        arabic: 'فَتَعْلُو المَسْأَلَةُ الفَرْضِيَّهْ ... بِحَسَبِ الزِّيَادَةِ المَقْضِيَّهْ',
        indonesian: 'Sehingga membubung tinggilah angka nominal masalah faraidh sesuai dengan ketetapan pertambahan pembagian.'
      }
    ],
    quizzes: [
      {
        id: 'q_aul_1',
        question: 'Manakah dari daftar Asal Masalah dasar berikut yang DAPAT mengalami kasus Aul?',
        options: [
          'Angka 2, 3, dan 4',
          'Angka 6, 12, dan 24',
          'Angka 8, 16, dan 32',
          'Angka 10 dan 20'
        ],
        correctIndex: 1,
        explanation: 'Dalam ilmu Faraidh klasik (dan diterangkan di Rahbiyyah), penyebut dasar yang bisa mengalami Aul hanyalah 6, 12, dan 24.'
      }
    ]
  },
  {
    id: 'radd',
    title: 'Masalah Al-Radd (Pengembalian Sisa)',
    arabicTitle: 'باب الردّ',
    chapter: 'Radd',
    summary: 'Radd adalah kebalikan dari Aul. Terjadi jika seluruh fardh telah dibagikan dan masih menyisakan sisa harta, sementara tidak ada ashabah. Sisa harta dikembalikan kepada Ashabul Furudh sesuai dengan rasio porsi mereka, namun mode Jumhur menutup penambahan bagi Suami/Istri.',
    verses: [
      {
        number: 62,
        arabic: 'فَإِنْ بَقِي شَيْءٌ مِنَ الفُرُوضِ ... وَانْطَفَأَتْ مَشَاعِلُ التَّعْصِيبِ',
        indonesian: 'Jika terdapat sisa harta setelah pembagian fardh selesai, sementara obor ashabah sisa telah padam (tidak ada).'
      },
      {
        number: 63,
        arabic: 'فَرُدَّهُ لِأَهْلِهِ صِرَافاً ... غَيْرَ ذَوِي الزَّوْجِيَّةِ اعْتِرَافاً',
        indonesian: 'Selesaikanlah dengan mengembalikan sisa itu murni untuk mereka, tanpa menyertakan suami/istri sebagai pengakuan atas aturan jumhur.'
      }
    ],
    quizzes: [
      {
        id: 'q_radd_1',
        question: 'Siapakah golongan ashabul furudh yang menurut madzhab Jumhur sahabat tidak berhak menerima penambahan sisa lewat skema Radd?',
        options: [
          'Ibu',
          'Anak Perempuan',
          'Suami dan Istri',
          'Saudara perempuan seibu'
        ],
        correctIndex: 2,
        explanation: 'Menurut madzhab Jumhur, suami dan istri tidak berhak menerima porsi Radd. Sisa dikembalikan kepada selain suami/istri.'
      }
    ]
  },
  {
    id: 'musyarakah',
    title: 'Musyarakah (Syirkah Himariyyah)',
    arabicTitle: 'باب المشتركة',
    chapter: 'Musyarakah',
    summary: 'Kasus Musyarakah (Himariyyah) terjadi ketika pewaris wafat meninggalkan Suami, Ibu, minim 2 Saudara Seibu, dan saudara kandung laki-laki. Secara matematis, bagian ashabul furudh menghabiskan total harta, meninggalkan saudara kandung dengan sisa 0. Umar ra memutuskan menggabungkan keduanya pada porsi sepertiga.',
    verses: [
      {
        number: 70,
        arabic: 'وَإِنْ تَجِدْ زَوْجاً وَأُمّاً وَوَلَدْ ... لِأُمٍّ وَأَخاً شَقِيقاً قَدْ فَقَدْ',
        indonesian: 'Dan sekiranya engkau temui Suami, Ibu, Anak-anak seibu, serta Saudara laki-laki kandung dalam satu kasus.'
      },
      {
        number: 71,
        arabic: 'فَاجْعَلْهُمُ فِي الثُّلُثِ مُسْتَوِينَا ... شَقِيقَهُمْ وَالذِي لِأُمٍّ دِينَا',
        indonesian: 'Maka kumpulkan dan samakanlah kedudukan mereka di dalam porsi sepertiga; antara saudara kandung dan saudara seibu secara rata.'
      }
    ],
    quizzes: [
      {
        id: 'q_musy_1',
        question: 'Kenapa kasus Musyarakah disebut juga dengan julukan Al-Himariyyah atau Al-Hajariyyah?',
        options: [
          'Karena saudari perempuan menyerupai keledai dalam berjalan',
          'Karena argumen kekeluargaan saudara kandung: "Anggap ayah kami keledai (himar) atau batu (hajar) yang terbuang ke laut, bukankah kami tetap bersaudara seibu?"',
          'Karena terjadi di atas bukit batu',
          'Karena terinspirasi dari kendaraan Nabi Muhammad SAW'
        ],
        correctIndex: 1,
        explanation: 'Disebut Himariyyah (keledai) karena saudara kandung memprotes ke Khalifah Umar r.a. bahwa jika ayah mereka dianggap keledai/batu yang dibuang ke laut, mereka tetaplah satu ibu dengan saudara seibu yang menerima bagian sepertiga.'
      }
    ]
  },
  {
    id: 'akdariyyah',
    title: 'Al-Akdariyyah',
    arabicTitle: 'باب الأكدرية',
    chapter: 'Akdariyyah',
    summary: 'Kasus khusus Akdariyyah melibatkan Suami, Ibu, Kakek, dan satu Saudara perempuan kandung/seayah. Akdariyyah menyimpang dari asas kakek bersama saudara biasa di mana kakek dan saudari membagi gabungan porsi mereka dengan rasio 2:1 setelah diselesaikan melalui jalur Aul dari 6 ke 9.',
    verses: [
      {
        number: 78,
        arabic: 'وَالأَكَدْرِيَّةُ فِي الإِرْثِ جَلِيَّهْ ... مَشْهُورَةٌ عِنْدَ ذَوِي التَّرْبِيَّهْ',
        indonesian: 'Dan kasus Akdariyyah dalam ilmu waris sangatlah jelas, dan masyhur di sisi para pengajar ilmu faraidh.'
      },
      {
        number: 79,
        arabic: 'مَسْأَلَةٌ تُعْرَفُ بِالأَكْدَرِي ... حِسَابُهَا جَاءَ بِفَرْضٍ جَوْهَرِي',
        indonesian: 'Itulah masalah yang dikenal sebagai Akdariyyah, perhitungannya terselesaikan melalui fardh mulia yang esensial.'
      }
    ],
    quizzes: [
      {
        id: 'q_akd_1',
        question: 'Siapakah ahli waris yang terlibat langsung di dalam formulasi Kasus Akdariyyah?',
        options: [
          'Suami, Ibu, Anak Perempuan, Kakek',
          'Suami, Ibu, Kakek, dan satu Saudara Perempuan Kandung/Seayah',
          'Istri, Dua Anak, Paman, Kakek',
          'Ayah, Ibu, Suami, Saudari Seibu'
        ],
        correctIndex: 1,
        explanation: 'Akdariyyah hanya terjadi jika komposisi ahli waris terdiri dari Suami, Ibu, Kakek, dan satu orang Saudara Perempuan (kandung/seayah).'
      }
    ]
  }
];
