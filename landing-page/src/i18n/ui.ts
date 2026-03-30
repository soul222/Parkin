export const languages = {
  id: 'Indonesia',
  en: 'English',
};

export const defaultLang = 'id';

export const routes = {
  id: {
    home: '/',
  },
  en: {
    home: '/en/',
  }
}

export const ui = {
  id: {
    // Navbar
    'nav.fitur': 'Fitur',
    'nav.caraKerja': 'Cara Kerja',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.demo': 'Start Your Project',
    'nav.demoMobile': 'Start Your Project',
    
    // Hero
    'hero.title': 'Sistem Parkir Cerdas Tanpa Sensor Terikat.',
    'hero.subtitle': 'Transformasi CCTV standar menjadi instrumen pelacakan real-time presisi tinggi dengan kecerdasan buatan.',
    'hero.desc': 'Tingkatkan efisiensi area parkir Anda dengan meniadakan instalasi perangkat keras magnetik. PARKIN mendigitalisasi pemantauan okupansi secara instan, menyajikan visibilitas data absolut setiap saat.',
    'hero.ctaPrimary': 'Start Your Project',
    'hero.ctaSecondary': 'Pelajari Arsitektur ↓',
    'hero.badge': 'LIVE SYNC',
    'hero.car': 'Mobil',
    'hero.motorcycle': 'Motor',
    'hero.total': 'Total',

    // Stats S3
    'stats.cost': 'Biaya Instalasi Alat FIsik',
    'stats.slots': 'Slot Dipantau Serentak',
    'stats.latency': 'Latensi Pemantauan',

    // Features S4
    'features.badge': 'Efisiensi Tanpa Batas',
    'features.title': 'Otomatisasi Parkir Berbasis AI Core',
    'features.desc': 'PARKIN direkayasa secara teliti untuk memotong biaya pemeliharaan hardware dan memberikan tingkat pemrosesan analitik berpresisi tinggi.',
    'features.1.title': 'Bebas Konstruksi & Kabel Fisik',
    'features.1.desc': 'Didukung model Deep Learning YOLO v8, CCTV eksisting dikonversi menjadi sensor pergerakan dinamis tanpa perlu instalasi loop logam di bawah aspal.',
    'features.2.title': 'Data Presisi Bebas Latensi',
    'features.2.desc': 'Lacak fluktuasi okupansi kendaraan pada detik yang sama peristiwa itu terjadi (< 100ms) melalui transmisi data WebSocket skalabel.',
    'features.3.title': 'Akses Mobile Terdesentralisasi',
    'features.3.desc': 'Arsitektur Progressive Web App (PWA) kami memungkinkan pengelola kawasan memantau matriks pergerakan live secara langsung dari perangkat genggam apa pun.',
    'features.4.title': 'Arsitektur Integrasi Terbuka',
    'features.4.desc': 'Siap mengadopsi tumpukan teknologi eksternal. Kami menyediakan akses komunikasi gRPC bagi tim engineer Anda guna menarik data menuju display informasi pusat kota.',

    // How It Works S5
    'how.title': 'Hanya Butuh Eksekusi Sederhana',
    'how.desc': 'Tak ada anggaran yang membengkak. Hanya integrasi masuk akal dalam empat lompatan pasti.',
    'how.1.title': 'Posisikan CCTV',
    'how.1.desc': 'Sambungkan kabel RTSP CCTV biasa tanpa perlu membeli server kamera baru.',
    'how.2.title': 'Konfigurasi Web',
    'how.2.desc': 'Tautkan identitas lahan pada platform PARKIN.',
    'how.3.title': 'AI Mulai Bekerja',
    'how.3.desc': 'Kecerdasan buatan akan langsung menghitung sisa kendaraan yang hilir-mudik.',
    'how.4.title': 'Terima Laporan',
    'how.4.desc': 'Miliki kontrol visibilitas dalam bentuk peringatan otomatis via pesan WhatsApp.',

    // User Segment Tabs S7
    'segment.title': 'Siapapun Bisa Mendapatkan Kebebasan Ini',
    'segment.btn.school': 'Sekolah K-12',
    'segment.btn.commercial': 'Komersial / Mall',
    'segment.btn.enterprise': 'Gedung Enterprise',
    'segment.school.title': 'Hapus Kekacauan Area Penjemputan',
    'segment.school.desc': 'Bayangkan satpam Anda tidak perlu lagi meneriaki kendaraan dengan pengeras suara. Sistem ini memampukan orangtua melihat sisa kapasitas drop-off lewat HP mereka sebelum sampai ke gerbang.',
    'segment.commercial.title': 'Pengunjung Tulus Berbelanja',
    'segment.commercial.desc': 'Jangan biarkan pelanggan frustrasi berputar-putar lantai. Andai mereka disambut oleh panel Penuh/Kosong mutlak di depan lobi, indeks kepuasan tenant Anda akan melonjak.',
    'segment.enterprise.title': 'Monitor Aset Skala Kota',
    'segment.enterprise.desc': 'Untuk pengelola raksasa, satu dasbor terpusat merangkum ribuan titik parkir tanpa instalasi kabel yang membengkakkan Laporan Tahunan. Keputusan presisi, di ujung jari.',

    // Trust Signals S9
    'trust.yolo': 'Didukung YOLO v8',
    'trust.pwa': 'Aplikasi PWA Super Cepat',
    'trust.https': 'Koneksi Teralokasi SSL',
    'trust.os': 'Open Source Filosofi',

    // Pricing S10
    'pricing.title': 'Investasi Nol Resiko',
    'pricing.desc': 'Andaikata kami mengenakan tarif sewa puluhan juta, itu sama saja kami seperti vendor lawas. Kami meyakini model bayar murni dari kapasitas komputasi spesifik.',
    'pricing.pro.title': 'Parkin PRO',
    'pricing.pro.desc': 'Pendekatan lincah untuk bisnis satu pintu dengan lalu lintas terpusat.',
    'pricing.pro.btn': 'Jadwalkan Demo Konsultasi',
    'pricing.pro.l1': '1 Kamera CCTV / Lahan',
    'pricing.pro.l2': 'Kuota Pantau Tak Terbatas',
    'pricing.pro.l3': 'Dashboard WebSocket Murni',
    'pricing.pro.l4': 'Custom Identitas Lokasi',
    'pricing.pro.l5': 'Tanpa WhatsApp Auto-webhook',
    'pricing.ent.title': 'Enterprise',
    'pricing.ent.desc': 'Dominasi penuh bagi kawasan multinasional & multi-gerbang.',
    'pricing.ent.btn': 'Hubungi Arsitek Kami',
    'pricing.ent.l1': 'Injeksi Kamera Tidak Dibatasi',
    'pricing.ent.l2': 'Visualisasi Lokasi Gabungan',
    'pricing.ent.l3': 'Broadcast WhatsApp Automatis',
    'pricing.ent.l4': 'Akses Penuh Arsitektur API',
    'pricing.ent.l5': 'Privilege Account Manager',

    // FAQ S11
    'faq.title': 'Pertanyaan Integrasi Teknis',
    'faq.1.q': 'Apakah topologi ini rentan terhadap degradasi fisik di lapangan?',
    'faq.1.a': 'Model komputasi PARKIN dijalankan secara terpusat. Anda sama sekali tidak memiliki modal fisik di gerbang yang rawan tertabrak kendaraan, menjamin keberlangsungan operasional bebas biaya mekanik tak terduga.',
    'faq.2.q': 'Apakah kompatibel di atas infrastruktur analog/IP Kamera pasif?',
    'faq.2.a': 'Penerima kami kompatibel secara universal. Cukup berikan port output RTSP stabil dan PARKIN akan melokalisasi video masukan sebelum melarutkan inferensi klasifikasi objek di atasnya.',
    'faq.3.q': 'Bagaimana cara AI mengetahui batas kapasitas absolut area parkir?',
    'faq.3.a': 'Setiap zona ditandai dengan konstanta digital pada dasbor pimpinan. Mesin visi mengalibrasi status ketersediaan melalui hitungan matematis dinamis seiring objek menembus gerbang maya terdeteksi.',

    // Final CTA S12
    'cta.title': 'Migrasi Menuju Otomatisasi Absolut',
    'cta.desc': 'Hentikan kebocoran modal yang disebabkan pemeliharaan portal mekanis. Inilah langkah transformatif merengkuh manajemen data spasial nirkabel untuk lanskap fasilitas masa depan.',
    'cta.btn': 'Beritahu Kami Infrastruktur Anda',

    // Footer S13
    'footer.slogan': 'Infrastruktur Analitik Visual.',
    'footer.copyright': '2025 Ekosistem PARKIN. Dimiliki secara publik.'
  },
  en: {
    // Navbar
    'nav.fitur': 'Features',
    'nav.caraKerja': 'How It Works',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.demo': 'Start Your Project',
    'nav.demoMobile': 'Start Your Project',
    
    // Hero
    'hero.title': 'Sensorless Smart Parking.',
    'hero.subtitle': 'Transform standard surveillance into highly-precise real-time tracking instruments with artificial intelligence.',
    'hero.desc': 'Enhance facility efficiencies by erasing hefty hardware installments. PARKIN instantly digitalizes occupancy monitoring, granting complete visibility across widespread properties.',
    'hero.ctaPrimary': 'Start Your Project',
    'hero.ctaSecondary': 'Learn The Architecture ↓',
    'hero.badge': 'LIVE SYNC',
    'hero.car': 'Car',
    'hero.motorcycle': 'Motor',
    'hero.total': 'Total',

    // Stats S3
    'stats.cost': 'Physical Hardware Costs',
    'stats.slots': 'Simultaneously Monitored Slots',
    'stats.latency': 'Sync Latency Target',

    // Features S4
    'features.badge': 'Imagine if...',
    'features.title': 'Parking Headaches Resolve Themselves',
    'features.desc': 'We engineered these capabilities not for show, but to surgically eliminate daily operational pain points.',
    'features.1.title': 'No More Asphalt Digging',
    'features.1.desc': 'Powered by YOLO v8 AI, your existing CCTV simply points at the gates. We categorize hundreds of passing cars naturally without looping metal sensors.',
    'features.2.title': 'Zero Screen Lag',
    'features.2.desc': 'You can monitor occurrences exact to the millisecond (< 100ms) with pure WebSocket injection without refreshing pages.',
    'features.3.title': 'Pocket-Sized Operations',
    'features.3.desc': 'Imagine regional managers reviewing occupancy from bed? Our PWA is built native to hand-held mobility constraints.',
    'features.4.title': 'Effortless Integrations',
    'features.4.desc': 'Build uniquely. We grant gRPC tunnels for engineers to pull occupancy telemetry right into your proprietary city billboards.',

    // How It Works S5
    'how.title': 'Simply Requires A Few Steps',
    'how.desc': 'No bloated budget approvals. Just sensible integrations across four robust leaps.',
    'how.1.title': 'Position Cameras',
    'how.1.desc': 'Plug standard RTSP streams natively without demanding high specs servers on-premise.',
    'how.2.title': 'Web Configuration',
    'how.2.desc': 'Link parameter zones natively within the PARKIN platform environment.',
    'how.3.title': 'AI Takes Over',
    'how.3.desc': 'Deep-learning intercepts the flux of cars calculating unyielding mathematics.',
    'how.4.title': 'Acquire Reports',
    'how.4.desc': 'Claim ultimate visibility coupled with WhatsApp mobile push responses.',

    // User Segment Tabs S7
    'segment.title': 'Freedom Granted For Every Ecosystem',
    'segment.btn.school': 'K-12 Education',
    'segment.btn.commercial': 'Malls & Retail',
    'segment.btn.enterprise': 'Enterprise Blocks',
    'segment.school.title': 'Eradicate Pick-up Chaos',
    'segment.school.desc': 'Imagine guards stopping the usage of loud megaphones. Parents check the lot drop-off occupancy on phones securely right before even arriving.',
    'segment.commercial.title': 'Genuine Shopping Experiences',
    'segment.commercial.desc': 'Never strand customers circulating dead floors. Imagine them embraced by massive LED statuses upfront, surging your tenant satisfaction levels.',
    'segment.enterprise.title': 'City-Scale Intelligence',
    'segment.enterprise.desc': 'For massive operators, one unified screen centralizes thousands of lots discarding wired installations that bloat CAPEX. Decisions at your fingertips.',

    // Trust Signals S9
    'trust.yolo': 'Geared by YOLO v8',
    'trust.pwa': 'Hyperfast PWA Core',
    'trust.https': 'SSL Encrypted Links',
    'trust.os': 'Open Source Philosophy',

    // Pricing S10
    'pricing.title': 'Zero Weight Investments',
    'pricing.desc': 'If we charge tens of thousands like an old-school vendor, we fail our mission. We believe in billing solely based on direct computational horsepower.',
    'pricing.pro.title': 'Parkin PRO',
    'pricing.pro.desc': 'Agile approaches for focused, single-gate establishments.',
    'pricing.pro.btn': 'Reserve Architecture Demo',
    'pricing.pro.l1': '1 Dedicated CCTV Feed',
    'pricing.pro.l2': 'Infinite View Instances',
    'pricing.pro.l3': 'Seamless Dashboard WebSockets',
    'pricing.pro.l4': 'Custom Local Branding',
    'pricing.pro.l5': 'Excluded Auto-Webhook',
    'pricing.ent.title': 'Enterprise',
    'pricing.ent.desc': 'Unchallenged supremacy spanning multi-national gates.',
    'pricing.ent.btn': 'Speak To Our Architects',
    'pricing.ent.l1': 'Unlimited Camera Nodes',
    'pricing.ent.l2': 'Converged Map Visualizations',
    'pricing.ent.l3': 'WhatsApp Broadcast Channels',
    'pricing.ent.l4': 'Unrestricted gRPC API',
    'pricing.ent.l5': 'Privileged Service Manager',

    // FAQ S11
    'faq.title': 'Dismantle Your Doubts',
    'faq.1.q': 'Is this resilient against hardware vandalism?',
    'faq.1.a': 'Absolutely! Because calculations thrive remotely on cloud video processing, you own zero expensive hardware (metal loop sensors) on the street ready to be ran over by reckless visitors.',
    'faq.2.q': 'Are legacy CCTVs compatible?',
    'faq.2.a': 'If your camera relays an RTSP feed out, the engine will aggressively consume it and synthesize enterprise-grade tracking logic effortlessly.',
    'faq.3.q': 'How does the AI know the maximal lot size?',
    'faq.3.a': 'You statically bound ceiling limits on the admin dashboard. The AI increments upon entrance and decrements dynamically upon exiting gates.',

    // Final CTA S12
    'cta.title': 'Time To Abandon Legacy Constraints',
    'cta.desc': 'Exhausted by constant mechanic replacements for parking booms? Shift toward weightless visual intelligence granting total serenity in operational scale.',
    'cta.btn': 'Seize Operations via WhatsApp',

    // Footer S13
    'footer.slogan': 'Visual Analytics Infrastructure.',
    'footer.copyright': '2025 PARKIN Ecosystems. Publicly owned.'
  }
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
