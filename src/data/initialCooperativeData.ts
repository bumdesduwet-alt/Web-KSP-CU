import {
  CooperativeProduct,
  CooperativeProfile,
  GalleryItem,
  JoinGuide,
  MemberCategory,
  MemberProduct,
  NewsArticle,
  SiteSettings,
  Testimonial,
} from '../types';

export const ASSET_IMAGES = {
  heroOffice: '/src/assets/images/hero_argomanunggal_office_1795771505571.jpg',
  communityMeeting: '/src/assets/images/about_community_meeting_1795771483214.jpg',
  savingsLedger: '/src/assets/images/product_savings_ledger_1795771483073.jpg',
  batikCraft: '/src/assets/images/marketplace_batik_craft_1795771481841.jpg',
  javaneseCoffee: '/src/assets/images/marketplace_javanese_coffee_1795771483057.jpg',
  communityBazaar: '/src/assets/images/gallery_community_bazaar_1795771483401.jpg',
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  cooperativeName: 'KSP CU Argomanunggal Santosa',
  tagline: 'Lembaga Keuangan Koperasi Berbasis Pemberdayaan Anggota di Prambanan, Sleman',
  welcomeTitle: 'Membangun Kemandirian Ekonomi Bersama KSP CU Argomanunggal Santosa',
  welcomeMessage:
    'Selamat datang di portal resmi KSP CU Argomanunggal Santosa. Berkedudukan di Jali, Gayamharjo, Prambanan, Sleman, Yogyakarta, kami hadir sebagai wadah solidaritas finansial, pendidikan keuangan, serta penggerak usaha produktif dan UMKM bagi seluruh anggota dan masyarakat sekitar.',
  heroImageUrl: ASSET_IMAGES.heroOffice,
  importantAnnouncement:
    'Pelayanan tatap muka Kantor Jali, Gayamharjo dibuka setiap hari kerja pukul 08.00–15.00 WIB. Pendaftaran anggota baru dapat dilakukan langsung di kantor atau melalui formulir daring.',
  showAnnouncement: true,
  address: 'Jali, Gayamharjo, Prambanan, Sleman, Daerah Istimewa Yogyakarta 55572',
  whatsappNumber: '6281227005572',
  email: 'sekretariat@cuargomanunggal.id',
  serviceHours: 'Senin – Jumat: 08.00 – 15.00 WIB · Sabtu: 08.00 – 12.00 WIB',
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
  },
  stats: [
    {
      label: 'Anggota Aktif',
      value: '1.250+',
      unit: 'Anggota Terdaftar',
      period: 'Data Tahun Buku Berjalan',
    },
    {
      label: 'Pelaku UMKM Binaan',
      value: '185',
      unit: 'Unit Usaha Anggota',
      period: 'Wilayah Prambanan & Sekitarnya',
    },
    {
      label: 'Program Literasi Keuangan',
      value: '24',
      unit: 'Pertemuan / Tahun',
      period: 'Pendidikan Dasar & Kewirausahaan',
    },
    {
      label: 'Tata Kelola Partisipatif',
      value: '100%',
      unit: 'Rapat Anggota Tahunan',
      period: 'Transparan & Akuntabel',
    },
  ],
};

export const INITIAL_COOPERATIVE_PROFILE: CooperativeProfile = {
  history:
    'KSP CU Argomanunggal Santosa lahir dari kesadaran kolektif warga di perbukitan Gayamharjo, Prambanan, Sleman untuk membangun lembaga keuangan milik bersama yang sehat, mendidik, dan berpihak pada kesejahteraan rumah tangga serta usaha mikro masyarakat.\n\nBerawal dari kelompok swadaya simpan pinjam masyarakat desa, semangat gotong royong terus bertumbuh hingga terbentuknya Koperasi Simpan Pinjam Credit Union (KSP CU) Argomanunggal Santosa. Nama "Argomanunggal Santosa" mencerminkan tekad warga pegunungan (Argo) untuk bersatu padu (Manunggal) mewujudkan kehidupan yang tenteram, mandiri, dan sejahtera (Santosa).\n\nHingga saat ini, koperasi konsisten mengedepankan tiga pilar utama Credit Union: pendidikan berkelanjutan, swadaya melalui kebiasaan menabung, dan solidaritas antaranggota.',
  vision:
    'Menjadi Koperasi Simpan Pinjam Credit Union yang sehat, terpercaya, dan unggul dalam memberdayakan ekonomi keluarga serta UMKM anggota di Sleman dan sekitarnya.',
  missions: [
    'Menyelenggarakan pendidikan keuangan dan kewirausahaan secara berkesinambungan bagi anggota dan calon anggota.',
    'Menumbuhkan budaya menabung secara teratur sebagai fondasi kemandirian ekonomi keluarga.',
    'Menyediakan layanan simpanan dan pinjaman produktif dengan tata kelola yang transparan, amanah, dan sesuai kebijakan resmi Rapat Anggota.',
    'Mendorong promosi dan pemasaran produk usaha anggota melalui jaringan koperasi dan portal digital resmi.',
  ],
  values: [
    {
      title: 'Swadaya & Kemandirian',
      description: 'Kekuatan koperasi bersumber dari kesadaran menabung dan partisipasi aktif seluruh anggota.',
    },
    {
      title: 'Pendidikan Berkelanjutan',
      description: 'Setiap anggota dibekali pemahaman literasi keuangan agar mampu mengelola aset dan usaha secara bijak.',
    },
    {
      title: 'Solidaritas & Gotong Royong',
      description: 'Kebersamaan antaranggota menjadi penopang utama saat membangun usaha maupun menghadapi kebutuhan mendesak.',
    },
    {
      title: 'Transparansi & Akuntabilitas',
      description: 'Pengelolaan organisasi diawasi secara berkala dan dipertanggungjawabkan dalam Rapat Anggota Tahunan.',
    },
  ],
  principles: [
    'Keanggotaan bersifat sukarela dan terbuka bagi warga yang memenuhi ketentuan AD/ART.',
    'Pengelolaan dilakukan secara demokratis dengan prinsip satu anggota satu suara.',
    'Pembagian Sisa Hasil Usaha (SHU) dilakukan secara adil sebanding dengan besarnya partisipasi dan jasa masing-masing anggota.',
    'Kemandirian lembaga dalam pengambilan keputusan dan permodalan.',
    'Pendidikan perkoperasian dan kerja sama antarkoperasi.',
  ],
  objectives: [
    'Meningkatkan kesejahteraan ekonomi dan sosial anggota serta keluarganya secara berkelanjutan.',
    'Memperkuat permodalan usaha mikro, pertanian, kerajinan, dan perdagangan lokal di Prambanan dan Sleman.',
    'Mewujudkan lembaga keuangan komunitas yang aman, profesional, dan bebas dari praktik pinjaman eksploitatif.',
  ],
  orgStructureSummary:
    'Kekuasaan tertinggi berada pada Rapat Anggota Tahunan (RAT). Pelaksanaan operasional dijalankan oleh Pengurus yang dipilih anggota, diawasi secara independen oleh Pengawas, serta didukung oleh tim Pengelola kantor pelayanan.',
  officePhotos: [ASSET_IMAGES.heroOffice, ASSET_IMAGES.communityMeeting, ASSET_IMAGES.communityBazaar],
  boardMembers: [
    {
      name: 'Pengurus Ketua',
      role: 'Ketua Pengurus',
      group: 'Pengurus',
      bio: 'Memimpin arah kebijakan organisasi dan perwakilan resmi KSP CU Argomanunggal Santosa sesuai mandat RAT (dapat diperbarui melalui Panel Admin).',
    },
    {
      name: 'Sekretaris Pengurus',
      role: 'Sekretaris',
      group: 'Pengurus',
      bio: 'Mengelola administrasi kelembagaan, dokumentasi keputusan pengurus, dan komunikasi resmi anggota.',
    },
    {
      name: 'Bendahara Pengurus',
      role: 'Bendahara',
      group: 'Pengurus',
      bio: 'Mengawasi tata kelola keuangan, pembukuan, dan pelaporan akuntabilitas koperasi.',
    },
    {
      name: 'Koordinator Pengawas',
      role: 'Ketua Pengawas',
      group: 'Pengawas',
      bio: 'Melakukan pemeriksaan berkala terhadap kepatuhan tata kelola dan kebijakan resmi koperasi.',
    },
    {
      name: 'Manajer Operasional',
      role: 'Pengelola Kantor Pelayanan',
      group: 'Pengelola',
      bio: 'Melayani administrasi harian anggota di kantor pelayanan Jali, Gayamharjo, Prambanan.',
    },
  ],
};

export const INITIAL_JOIN_GUIDE: JoinGuide = {
  benefits: [
    'Mendapatkan akses layanan simpanan yang aman dan terkelola secara transparan.',
    'Kesempatan mengajukan pinjaman produktif dan usaha sesuai ketentuan resmi koperasi.',
    'Mengikuti pelatihan literasi keuangan, kewirausahaan, dan pendampingan UMKM anggota.',
    'Mempromosikan produk usaha milik anggota secara gratis di Portal Produk Anggota.',
    'Berhak memperoleh Sisa Hasil Usaha (SHU) dan mengikuti Rapat Anggota Tahunan.',
  ],
  requirements: [
    'Warga Negara Indonesia yang cakap hukum dan berdomisili di wilayah pelayanan koperasi.',
    'Bersedia memahami dan mematuhi Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) koperasi.',
    'Mengikuti sesi orientasi / pendidikan dasar keanggotaan yang diselenggarakan pengurus.',
    'Menyetorkan Simpanan Pokok dan Simpanan Wajib sesuai ketentuan resmi yang berlaku.',
  ],
  steps: [
    {
      stepNumber: 1,
      title: 'Ajukan Minat atau Datang ke Kantor',
      description: 'Isi formulir minat di halaman ini atau kunjungi kantor pelayanan kami di Jali, Gayamharjo, Prambanan.',
    },
    {
      stepNumber: 2,
      title: 'Ikuti Penjelasan & Orientasi Anggota',
      description: 'Pengurus akan menjelaskan prinsip Credit Union, hak dan kewajiban anggota, serta kebijakan layanan resmi.',
    },
    {
      stepNumber: 3,
      title: 'Lengkapi Berkas & Setoran Awal',
      description: 'Serahkan fotokopi identitas diri dan lakukan setoran awal simpanan keanggotaan sesuai ketentuan resmi.',
    },
    {
      stepNumber: 4,
      title: 'Aktivasi Buku Anggota',
      description: 'Anda resmi tercatat sebagai anggota KSP CU Argomanunggal Santosa dan berhak mengakses seluruh program pemberdayaan.',
    },
  ],
  documents: [
    'Fotokopi KTP yang masih berlaku.',
    'Fotokopi Kartu Keluarga (KK).',
    'Pas foto terbaru ukuran 3x4 sebanyak 2 lembar.',
    'Mengisi formulir pendaftaran anggota resmi yang disediakan di kantor pelayanan.',
  ],
  contactPersonName: 'Tim Pelayanan Anggota',
  contactPersonRole: 'Pengurus & Pengelola Kantor Jali',
  contactWhatsapp: '6281227005572',
};

export const INITIAL_COOPERATIVE_PRODUCTS: Omit<CooperativeProduct, 'id'>[] = [
  {
    category: 'simpanan',
    subType: 'Simpanan Pokok',
    name: 'Simpanan Pokok Anggota',
    imageUrl: ASSET_IMAGES.savingsLedger,
    description:
      'Simpanan dasar yang wajib disetorkan satu kali pada saat pertama kali bergabung menjadi anggota KSP CU Argomanunggal Santosa sebagai bukti kepemilikan bersama atas koperasi.',
    requirements: 'Berlaku bagi setiap calon anggota yang telah menyetujui AD/ART dan lulus orientasi keanggotaan.',
    terms:
      'Besaran nominal dan ketentuan penarikan saat berhenti dari keanggotaan mengikuti kebijakan resmi Anggaran Rumah Tangga (dapat diperbarui oleh Administrator).',
    benefits: 'Memberikan hak suara penuh dalam Rapat Anggota Tahunan dan menjadi dasar perhitungan hak anggota.',
    isPublished: true,
    sortOrder: 1,
  },
  {
    category: 'simpanan',
    subType: 'Simpanan Wajib',
    name: 'Simpanan Wajib Bulanan',
    imageUrl: ASSET_IMAGES.savingsLedger,
    description:
      'Simpanan rutin yang disetorkan secara berkala oleh setiap anggota untuk membangun kebiasaan menabung dan memperkuat modal kolektif koperasi.',
    requirements: 'Dimiliki oleh seluruh anggota aktif KSP CU Argomanunggal Santosa.',
    terms:
      'Nominal setoran bulanan serta ketentuan pengelolaan ditetapkan melalui keputusan resmi Rapat Anggota dan kebijakan pengurus (dapat diperbarui oleh Administrator).',
    benefits: 'Membangun disiplin finansial keluarga dan menjadi komponen utama perhitungan balas jasa simpanan dalam SHU.',
    isPublished: true,
    sortOrder: 2,
  },
  {
    category: 'simpanan',
    subType: 'Simpanan Sukarela',
    name: 'Simpanan Sukarela Harian & Berencana',
    imageUrl: ASSET_IMAGES.savingsLedger,
    description:
      'Layanan simpanan fleksibel untuk membantu anggota mempersiapkan dana pendidikan, cadangan usaha, maupun kebutuhan keluarga secara terencana.',
    requirements: 'Terbuka bagi anggota aktif dengan menunjukkan kartu anggota atau identitas resmi saat transaksi.',
    terms:
      'Ketentuan setoran, penarikan, serta balas jasa simpanan diatur sepenuhnya oleh kebijakan resmi pengurus yang berlaku (dapat diperbarui oleh Administrator).',
    benefits: 'Aman, fleksibel untuk kebutuhan darurat maupun rencana jangka menengah, dan mendukung perputaran ekonomi komunitas.',
    isPublished: true,
    sortOrder: 3,
  },
  {
    category: 'pinjaman',
    subType: 'Pinjaman Produktif',
    name: 'Pinjaman Produktif Pertanian & Ternak',
    imageUrl: ASSET_IMAGES.communityMeeting,
    description:
      'Fasilitas pembiayaan bagi anggota yang bergerak di sektor pertanian, perkebunan, peternakan, dan pengolahan hasil bumi di wilayah Sleman dan sekitarnya.',
    requirements: 'Anggota aktif yang telah memenuhi masa keanggotaan dan kelengkapan administrasi sesuai kebijakan koperasi.',
    terms:
      'Plafon, jangka waktu, jasa pinjaman, dan jaminan ditetapkan sesuai kebijakan resmi pengajuan pinjaman KSP CU Argomanunggal Santosa (diisi dan diperbarui oleh Administrator).',
    benefits: 'Membantu ketersediaan modal bibit, sarana produksi, serta menjaga arus kas usaha hingga masa panen.',
    isPublished: true,
    sortOrder: 4,
  },
  {
    category: 'pinjaman',
    subType: 'Pinjaman Usaha',
    name: 'Pinjaman Pengembangan UMKM & Perdagangan',
    imageUrl: ASSET_IMAGES.batikCraft,
    description:
      'Pinjaman modal kerja dan pengadaan alat usaha untuk anggota pelaku UMKM kuliner, kerajinan, warung, maupun jasa.',
    requirements: 'Memiliki usaha produktif berjalan dan melengkapi dokumen permohonan sesuai ketentuan pengurus.',
    terms:
      'Ketentuan persetujuan, besaran jasa, dan skema angsuran mengikuti peraturan resmi koperasi yang berlaku (diisi dan diperbarui oleh Administrator).',
    benefits: 'Mendukung ekspansi kapasitas produksi, peningkatan kualitas kemasan, dan pendampingan pemasaran melalui portal koperasi.',
    isPublished: true,
    sortOrder: 5,
  },
  {
    category: 'pinjaman',
    subType: 'Pinjaman Kebutuhan Anggota',
    name: 'Pinjaman Kesejahteraan & Pendidikan Keluarga',
    imageUrl: ASSET_IMAGES.heroOffice,
    description:
      'Dukungan pembiayaan untuk kebutuhan penting rumah tangga anggota seperti biaya pendidikan anak, perbaikan rumah layak huni, atau keperluan mendesak.',
    requirements: 'Anggota aktif dengan rekam partisipasi simpanan sesuai ketentuan kebijakan resmi.',
    terms:
      'Seluruh ketentuan plafon, masa angsuran, dan biaya administrasi ditentukan berdasarkan peraturan resmi pengurus (diisi dan diperbarui oleh Administrator).',
    benefits: 'Memberikan solusi pembiayaan yang manusiawi, terencana, dan disertai konsultasi keuangan keluarga.',
    isPublished: true,
    sortOrder: 6,
  },
];

export const INITIAL_MEMBER_CATEGORIES: Omit<MemberCategory, 'id'>[] = [
  { name: 'Kuliner & Olahan Pangan', slug: 'kuliner-olahan-pangan', sortOrder: 1 },
  { name: 'Kerajinan & Batik', slug: 'kerajinan-batik', sortOrder: 2 },
  { name: 'Hasil Pertanian & Perkebunan', slug: 'hasil-pertanian-perkebunan', sortOrder: 3 },
  { name: 'Jasa & Kebutuhan Rumah Tangga', slug: 'jasa-rumah-tangga', sortOrder: 4 },
];

export const INITIAL_MEMBER_PRODUCTS: Omit<MemberProduct, 'id'>[] = [
  {
    name: 'Batik Tulis Motif Perbukitan Prambanan',
    category: 'Kerajinan & Batik',
    price: 245000,
    unit: 'lembar (2m)',
    imageUrl: ASSET_IMAGES.batikCraft,
    ownerName: 'Ibu Sri Wahyuni',
    businessName: 'Sanggar Batik Sekar Arum',
    description:
      'Kain batik tulis tangan pewarna alam dengan motif khas perbukitan Sleman timur. Dikerjakan langsung oleh perajin anggota koperasi dengan ketelitian tinggi dan bahan katun primisima halus.',
    location: 'Gayamharjo, Prambanan, Sleman',
    whatsappNumber: '6281227005572',
    isFeatured: true,
    status: 'approved',
  },
  {
    name: 'Kopi Robusta Lereng Perbukitan & Gula Aren',
    category: 'Kuliner & Olahan Pangan',
    price: 45000,
    unit: 'kemasan 250g',
    imageUrl: ASSET_IMAGES.javaneseCoffee,
    ownerName: 'Bapak Hartono',
    businessName: 'Usaha Tani Manunggal Rasa',
    description:
      'Kopi sangrai pilihan dari kebun warga Gayamharjo berpadu aroma khas dan keasaman seimbang. Tersedia juga paket pendamping gula aren murni tanpa pengawet.',
    location: 'Jali, Gayamharjo, Prambanan',
    whatsappNumber: '6281227005572',
    isFeatured: true,
    status: 'approved',
  },
  {
    name: 'Anyaman Bambu Wadah Hantaran Tradisional',
    category: 'Kerajinan & Batik',
    price: 65000,
    unit: 'set',
    imageUrl: ASSET_IMAGES.batikCraft,
    ownerName: 'Bapak Darmanto',
    businessName: 'Karya Bambu Lestari',
    description:
      'Keranjang anyaman bambu apus pilihan yang kuat, rapi, dan ramah lingkungan. Cocok untuk wadah hantaran, parcel hari raya, maupun perlengkapan sajian rumah makan.',
    location: 'Sumberharjo, Prambanan, Sleman',
    whatsappNumber: '6281227005572',
    isFeatured: true,
    status: 'approved',
  },
  {
    name: 'Keripik Singkong Pedas Manis & Kue Kering',
    category: 'Kuliner & Olahan Pangan',
    price: 18000,
    unit: 'bungkus 200g',
    imageUrl: ASSET_IMAGES.javaneseCoffee,
    ownerName: 'Ibu Rina Kusuma',
    businessName: 'Dapur UMKM Santosa',
    description:
      'Camilan renyah dari singkong segar hasil panen petani anggota, diolah higienis dengan bumbu rempah tradisional tanpa pewarna buatan.',
    location: 'Gayamharjo, Prambanan, Sleman',
    whatsappNumber: '6281227005572',
    isFeatured: false,
    status: 'approved',
  },
];

export const INITIAL_NEWS_ARTICLES: Omit<NewsArticle, 'id'>[] = [
  {
    title: 'Penguatan Literasi Keuangan dan Pemasaran Digital bagi Pelaku UMKM Anggota',
    slug: 'penguatan-literasi-keuangan-dan-pemasaran-digital-umkm-anggota',
    category: 'Pendidikan dan Pelatihan',
    coverImageUrl: ASSET_IMAGES.communityMeeting,
    author: 'Pengurus KSP CU Argomanunggal Santosa',
    excerpt:
      'Koperasi menyelenggarakan lokakarya pencatatan keuangan usaha mikro sekaligus peluncuran katalog digital untuk memperluas jangkauan produk anggota di Sleman.',
    content:
      'KSP CU Argomanunggal Santosa kembali menggelar kegiatan pendidikan dan pelatihan bagi anggota pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di balai pertemuan Jali, Gayamharjo, Prambanan.\n\n## Fokus Materi Pelatihan\n\nPelatihan kali ini menekankan pentingnya pemisahan keuangan rumah tangga dan modal usaha, perencanaan arus kas sederhana, serta strategi pengemasan produk agar lebih menarik bagi pembeli.\n\n- Pengelolaan arus kas harian untuk usaha kecil\n- Standar foto produk dan deskripsi informatif\n- Pemanfaatan kanal WhatsApp dan Portal Produk Anggota sebagai etalase bersama\n\n> Koperasi tidak hanya hadir sebagai tempat menyimpan dan meminjam, tetapi juga sebagai pendamping nyata agar usaha anggota naik kelas.\n\nMelalui portal resmi koperasi, seluruh anggota yang memiliki produk kerajinan, kuliner, hasil tani, maupun jasa dapat mendaftarkan produknya untuk dipromosikan secara terbuka kepada masyarakat luas.',
    supportingImages: [ASSET_IMAGES.communityBazaar, ASSET_IMAGES.batikCraft],
    isPublished: true,
    isImportant: true,
  },
  {
    title: 'Jadwal Pelayanan Kantor dan Penerimaan Anggota Baru Periode Berjalan',
    slug: 'jadwal-pelayanan-kantor-dan-penerimaan-anggota-baru',
    category: 'Pengumuman',
    coverImageUrl: ASSET_IMAGES.heroOffice,
    author: 'Sekretariat Pengurus',
    excerpt:
      'Informasi resmi mengenai jam operasional kantor pelayanan di Jali, Gayamharjo serta alur pendaftaran anggota baru secara luring maupun daring.',
    content:
      'Kepada seluruh anggota dan masyarakat di wilayah Prambanan, Sleman dan sekitarnya, berikut kami sampaikan informasi resmi pelayanan kantor KSP CU Argomanunggal Santosa.\n\n## Jam Operasional Kantor\n\nKantor pelayanan beralamat di Jali, Gayamharjo, Prambanan, Sleman, Yogyakarta 55572 melayani anggota pada:\n\n- Senin hingga Jumat: Pukul 08.00 – 15.00 WIB\n- Sabtu: Pukul 08.00 – 12.00 WIB\n- Minggu dan Hari Libur Nasional: Tutup\n\n## Pendaftaran Anggota Baru\n\nCalon anggota dapat membaca informasi persyaratan pada halaman Cara Bergabung dan mengisi formulir minat secara langsung. Tim pengurus akan menghubungi calon anggota untuk menjadwalkan sesi orientasi dasar Credit Union.',
    supportingImages: [],
    isPublished: true,
    isImportant: true,
  },
  {
    title: 'Bazar Produk Lokal dan Temu Usaha Anggota di Gayamharjo',
    slug: 'bazar-produk-lokal-dan-temu-usaha-anggota-gayamharjo',
    category: 'Kegiatan Anggota',
    coverImageUrl: ASSET_IMAGES.communityBazaar,
    author: 'Bidang Pemberdayaan Usaha Anggota',
    excerpt:
      'Puluhan produk pangan olahan, hasil kebun, dan kerajinan bambu karya anggota koperasi tampil memeriahkan bazar komunitas.',
    content:
      'Suasana hangat dan penuh kebersamaan mewarnai kegiatan Bazar Produk Lokal yang diinisiasi oleh anggota KSP CU Argomanunggal Santosa. Kegiatan ini menjadi ruang temu langsung antara produsen lokal dan masyarakat.\n\nBeragam produk unggulan mulai dari batik tulis, anyaman bambu, kopi lokal, gula aren, hingga aneka olahan singkong laris dikunjungi warga sekitar.\n\nPengurus berharap agenda temu usaha ini dapat terus mempererat jaringan pemasaran antaranggota sekaligus memperkenalkan potensi ekonomi Gayamharjo kepada khalayak yang lebih luas.',
    supportingImages: [ASSET_IMAGES.javaneseCoffee],
    isPublished: true,
    isImportant: false,
  },
];

export const INITIAL_GALLERY_ITEMS: Omit<GalleryItem, 'id'>[] = [
  {
    type: 'photo',
    title: 'Kantor Pelayanan KSP CU Argomanunggal Santosa',
    caption: 'Gedung kantor pelayanan anggota di Jali, Gayamharjo, Prambanan, Sleman.',
    category: 'Kantor & Layanan',
    activityDate: '2026-10-12',
    mediaUrl: ASSET_IMAGES.heroOffice,
    thumbnailUrl: ASSET_IMAGES.heroOffice,
    isPublished: true,
  },
  {
    type: 'photo',
    title: 'Lokakarya Pendidikan Keuangan Anggota',
    caption: 'Sesi diskusi dan pendampingan tata kelola keuangan usaha kecil bersama pengurus.',
    category: 'Pendidikan & Pelatihan',
    activityDate: '2026-10-25',
    mediaUrl: ASSET_IMAGES.communityMeeting,
    thumbnailUrl: ASSET_IMAGES.communityMeeting,
    isPublished: true,
  },
  {
    type: 'photo',
    title: 'Bazar UMKM & Pameran Hasil Tani Anggota',
    caption: 'Antusiasme masyarakat mengunjungi stan kerajinan anyaman bambu dan pangan lokal.',
    category: 'Bazar UMKM',
    activityDate: '2026-11-08',
    mediaUrl: ASSET_IMAGES.communityBazaar,
    thumbnailUrl: ASSET_IMAGES.communityBazaar,
    isPublished: true,
  },
  {
    type: 'photo',
    title: 'Etalase Kerajinan Batik & Anyaman Anggota',
    caption: 'Produk unggulan karya perajin binaan KSP CU Argomanunggal Santosa.',
    category: 'Produk Anggota',
    activityDate: '2026-11-15',
    mediaUrl: ASSET_IMAGES.batikCraft,
    thumbnailUrl: ASSET_IMAGES.batikCraft,
    isPublished: true,
  },
];

export const INITIAL_TESTIMONIALS: Omit<Testimonial, 'id'>[] = [
  {
    memberName: 'Ibu Sri Wahyuni',
    memberRole: 'Anggota & Pemilik Sanggar Batik Sekar Arum',
    quote:
      'Sebelum bergabung, saya kesulitan mengatur modal bahan baku batik tulis. Setelah mengikuti pendidikan keuangan dan memanfaatkan pinjaman usaha koperasi, produksi kain kini rutin setiap bulan dan dipromosikan di portal anggota.',
    isPublished: true,
    sortOrder: 1,
  },
  {
    memberName: 'Bapak Hartono',
    memberRole: 'Anggota & Petani Kopi Gayamharjo',
    quote:
      'Menabung secara rutin di koperasi membuat keluarga kami memiliki cadangan biaya pendidikan anak. Pendampingan pengurus sangat terbuka dan mudah dipahami warga.',
    isPublished: true,
    sortOrder: 2,
  },
  {
    memberName: 'Ibu Rina Kusuma',
    memberRole: 'Anggota & Pelaku UMKM Kuliner',
    quote:
      'Melalui menu Produk Anggota, pembeli dari luar kecamatan kini mudah memesan keripik singkong dan kue kering langsung lewat WhatsApp saya tanpa perantara.',
    isPublished: true,
    sortOrder: 3,
  },
];
