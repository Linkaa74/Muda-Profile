/* Data konten situs. Edit teks, harga, dan daftar di file ini. */
const navItems = [
  { label: 'Halaman utama', href: '#beranda' },
  { label: 'Tentang kami', href: '#tentang' },
  { label: 'Layanan', href: '#layanan' },
  { label: 'Tim', href: '#tim' },
  { label: 'Portofolio', href: '#portofolio' },
  { label: 'Kontak', href: '#/kontak' },
]

const clients = ['91cbc.png', '6fb37.webp', 'd1ce7.png', 'ea28f.png', '78201.png', 'a7301.png', 'ae888.png']

// Panel layanan memotong satu gambar ilustrasi (3 panel vertikal)

const services = [
  {
    slug: 'creative-digital-agency',
    title: 'CREATIVE & DIGITAL AGENCY',
    desc: 'Solusi strategi pemasaran dan branding menyeluruh untuk membangun citra bisnis, mengoptimalkan biaya promosi, dan meningkatkan penjualan secara terukur.',
    top: '-24.63%',
    intro: 'Kami menggabungkan riset pasar, kreativitas, dan data untuk membangun brand yang dikenal, dipercaya, dan mendorong penjualan. Dari identitas visual sampai kampanye digital, semuanya dirancang selaras dan terukur.',
    scope: [
      { title: 'Strategi & Branding', text: 'Riset audiens, positioning, tone of voice, dan identitas visual (logo, palet, panduan brand).' },
      { title: 'Kampanye Digital', text: 'Perencanaan dan eksekusi iklan berbayar, SEO, dan promosi lintas kanal dengan target yang jelas.' },
      { title: 'Produksi Konten', text: 'Desain grafis, foto, video pendek, dan copywriting untuk berbagai kebutuhan promosi.' },
      { title: 'Analitik & Laporan', text: 'Pemantauan performa dan laporan bulanan agar anggaran promosi dioptimalkan.' },
    ],
    steps: [
      { title: 'Discovery', text: 'Diskusi tujuan bisnis, audiens, dan kompetitor.' },
      { title: 'Strategi', text: 'Penyusunan konsep kreatif dan rencana kampanye.' },
      { title: 'Eksekusi', text: 'Produksi materi dan peluncuran kampanye.' },
      { title: 'Evaluasi', text: 'Analisis hasil dan optimasi berkelanjutan.' },
    ],
    results: ['Citra brand yang konsisten di semua kanal', 'Biaya promosi lebih efisien', 'Peningkatan penjualan yang terukur', 'Aset kreatif siap pakai jangka panjang'],
    forWho: 'Perusahaan, UMKM, dan agensi yang ingin membangun atau menyegarkan brand.',
    duration: '2 - 6 minggu',
  },
  {
    slug: 'digital-platform',
    title: 'DIGITAL PLATFORM',
    desc: 'Pengembangan platform digital interaktif dan edukatif untuk memperluas jangkauan komunitas, program sosial, maupun kebutuhan bisnis modern.',
    top: '-146.94%',
    intro: 'Kami merancang dan membangun website, aplikasi, dan portal digital yang mudah dipakai, aman, dan siap tumbuh. Cocok untuk komunitas, program edukasi, maupun layanan bisnis.',
    scope: [
      { title: 'Website & Landing Page', text: 'Situs profil, katalog, dan halaman kampanye yang cepat dan responsif di semua perangkat.' },
      { title: 'Aplikasi & Portal', text: 'Platform web interaktif seperti portal komunitas, e-learning, dan sistem pendaftaran.' },
      { title: 'Desain UI/UX', text: 'Riset pengguna, wireframe, prototipe, dan desain antarmuka yang konsisten.' },
      { title: 'Pemeliharaan', text: 'Pembaruan, pemantauan keamanan, dan dukungan teknis setelah peluncuran.' },
    ],
    steps: [
      { title: 'Analisis Kebutuhan', text: 'Menentukan fitur utama dan alur pengguna.' },
      { title: 'Desain', text: 'Wireframe dan prototipe untuk disetujui bersama.' },
      { title: 'Pengembangan', text: 'Pembuatan platform dengan pengujian berkala.' },
      { title: 'Peluncuran', text: 'Deploy, pelatihan admin, dan dukungan awal.' },
    ],
    results: ['Jangkauan komunitas lebih luas', 'Pengalaman pengguna yang mudah dan nyaman', 'Platform aman dan mudah dikembangkan', 'Dokumentasi dan pelatihan untuk tim Anda'],
    forWho: 'Komunitas, lembaga pendidikan, program sosial, dan bisnis yang butuh kehadiran digital.',
    duration: '6 - 12 minggu',
  },
  {
    slug: 'media-sosial-konten',
    title: 'MEDIA SOSIAL & KONTEN',
    desc: 'Pengelolaan media sosial profesional agar brand tampil konsisten, berinteraksi dengan audiens, dan mencapai tujuan pemasaran secara efektif.',
    top: '-270%',
    intro: 'Layanan profesional untuk mengelola dan mengembangkan media sosial brand, perusahaan, atau individu. Kami membangun citra positif, meningkatkan interaksi, dan mengarahkannya ke tujuan pemasaran.',
    scope: [
      { title: 'Perencanaan Konten', text: 'Kalender editorial bulanan, pilar konten, dan arahan visual yang selaras dengan brand.' },
      { title: 'Produksi & Publikasi', text: 'Desain, video pendek, caption, dan penjadwalan unggahan di platform pilihan Anda.' },
      { title: 'Manajemen Komunitas', text: 'Membalas komentar dan pesan, serta menjaga interaksi positif dengan audiens.' },
      { title: 'Iklan & Laporan', text: 'Pengelolaan iklan sosial berbayar dan laporan performa bulanan.' },
    ],
    steps: [
      { title: 'Audit Akun', text: 'Evaluasi kondisi akun dan kompetitor saat ini.' },
      { title: 'Rencana Konten', text: 'Menyusun pilar dan jadwal publikasi.' },
      { title: 'Produksi', text: 'Membuat dan mempublikasikan konten rutin.' },
      { title: 'Optimasi', text: 'Membaca data lalu menyempurnakan strategi.' },
    ],
    results: ['Tampilan akun yang konsisten dan profesional', 'Interaksi dan pengikut yang tumbuh', 'Waktu Anda bebas dari urusan konten harian', 'Laporan yang jelas tiap bulan'],
    forWho: 'Brand, perusahaan, UMKM, dan figur publik yang ingin aktif tanpa harus mengelola sendiri.',
    duration: 'Kontrak bulanan',
  },
]

const team = [
  {
    role: 'UI/UX Developer', photo: 'team/uiux.jpg',
    focus: 'Merancang dan membangun antarmuka website serta aplikasi yang mudah dipakai.',
    preview: [
      { title: 'Riset & Wireframe', text: 'Memetakan alur pengguna lalu menuangkannya ke wireframe dan prototipe interaktif.' },
      { title: 'Desain Antarmuka', text: 'Membuat sistem desain, komponen, dan tampilan yang konsisten dengan brand.' },
      { title: 'Implementasi Front-end', text: 'Mengubah desain menjadi halaman responsif yang cepat dan siap rilis.' },
    ],
    tools: ['Figma', 'React', 'Prototyping'],
  },
  {
    role: 'Live Talent', photo: 'team/live-talent.jpg',
    focus: 'Tampil sebagai pembawa acara dan host siaran langsung untuk promosi brand.',
    preview: [
      { title: 'Live Streaming', text: 'Memandu siaran langsung produk, peluncuran, dan acara komunitas secara interaktif.' },
      { title: 'Presentasi Produk', text: 'Menjelaskan keunggulan produk dengan bahasa yang menarik dan mudah dipahami.' },
      { title: 'Interaksi Penonton', text: 'Menjawab pertanyaan secara langsung dan menjaga suasana tetap hidup.' },
    ],
    tools: ['Host', 'Live Commerce', 'Event'],
  },
  {
    role: 'Internal (PIC)', photo: 'team/internal-pic.jpg',
    focus: 'Penanggung jawab koordinasi klien, jadwal, dan kelancaran setiap proyek.',
    preview: [
      { title: 'Koordinasi Klien', text: 'Menjadi satu pintu komunikasi antara klien dan tim produksi.' },
      { title: 'Manajemen Jadwal', text: 'Menyusun timeline, memantau milestone, dan memastikan tenggat terpenuhi.' },
      { title: 'Kontrol Kualitas', text: 'Memeriksa hasil kerja sebelum diserahkan dan mengelola revisi.' },
    ],
    tools: ['Project Management', 'Timeline', 'Laporan'],
  },
  {
    role: 'Game Developer', photo: 'team/game-dev.jpg',
    focus: 'Mengembangkan game dan pengalaman interaktif untuk kampanye maupun hiburan.',
    preview: [
      { title: 'Game Design', text: 'Merancang mekanik permainan, level, dan alur progres pemain.' },
      { title: 'Pengembangan Game', text: 'Membuat prototipe dan versi rilis untuk web maupun mobile.' },
      { title: 'Uji & Optimasi', text: 'Menguji performa dan menyeimbangkan gameplay berdasarkan umpan balik.' },
    ],
    tools: ['Unity', 'Gameplay', 'Interactive'],
  },
  {
    role: 'KOL (Key Opinion Leader)', photo: 'team/kol.jpg',
    focus: 'Menjadi wajah brand dan membangun kepercayaan lewat konten di media sosial.',
    preview: [
      { title: 'Konten Kolaborasi', text: 'Membuat video dan unggahan ulasan yang jujur dan dekat dengan audiens.' },
      { title: 'Kampanye Brand', text: 'Menyampaikan pesan kampanye sesuai karakter komunitas pengikutnya.' },
      { title: 'Laporan Jangkauan', text: 'Merangkum jangkauan, interaksi, dan dampak tiap kampanye.' },
    ],
    tools: ['Instagram', 'TikTok', 'YouTube'],
  },
  {
    role: 'Directur', photo: 'team/direktur.jpg',
    focus: 'Memimpin arah strategi perusahaan dan menjaga kualitas seluruh layanan.',
    preview: [
      { title: 'Visi & Strategi', text: 'Menetapkan arah perusahaan dan prioritas pengembangan layanan.' },
      { title: 'Kemitraan', text: 'Membangun hubungan jangka panjang dengan klien, mitra, dan komunitas.' },
      { title: 'Kepemimpinan Tim', text: 'Mengarahkan seluruh divisi agar bekerja selaras dan berkualitas.' },
    ],
    tools: ['Strategi', 'Kemitraan', 'Manajemen'],
  },
]

const brands = [
  { slug: 'milkypedia', name: 'Milkypedia', logo: 'logos/milkypedia.png', category: 'Minuman & Kuliner', handle: '@milkypedia.id', base: 5200, growth: 1.9, seed: 3, about: 'Brand susu segar dengan maskot sapi yang ceria. Fokus kampanye pada konten edukasi gizi dan visual karakter untuk membangun kedekatan dengan audiens muda.' },
  { slug: 'alto', name: 'Alto', logo: 'logos/alto.png', category: 'Fashion & Gaya Hidup', handle: '@alto.official', base: 7800, growth: 1.3, seed: 7, about: 'Brand dengan identitas tegas dan modern. Kampanye menonjolkan konsistensi visual, kolaborasi, dan konten produk yang rapi.' },
  { slug: 'neabeauty', name: 'Neabeauty', logo: 'logos/neabeauty.png', category: 'Kecantikan', handle: '@neabeauty.id', base: 4300, growth: 2.2, seed: 11, about: 'Brand kecantikan dengan nuansa elegan. Strategi konten berfokus pada tutorial, ulasan produk, dan testimoni pelanggan.' },
  { slug: 'trily', name: 'Trily', logo: 'logos/trily.png', category: 'Produk Alami', handle: '@trily.co', base: 3600, growth: 1.6, seed: 5, about: 'Brand produk alami dengan identitas daun yang minimalis. Konten menonjolkan cerita bahan, proses, dan gaya hidup sehat.' },
  { slug: 'intowncell', name: 'Intowncell', logo: 'logos/intowncell.png', category: 'Teknologi & Gadget', handle: '@intowncell', base: 6100, growth: 1.1, seed: 13, about: 'Toko gadget dan layanan seluler. Kampanye menekankan promo, tips penggunaan perangkat, dan konten unboxing.' },
  { slug: 'kominfo', name: 'Kominfo', logo: 'logos/kominfo.png', category: 'Lembaga Publik', handle: '@kemenkominfo', base: 9800, growth: 0.8, seed: 17, about: 'Kampanye komunikasi publik untuk literasi digital. Fokus pada infografis, edukasi, dan penyebaran informasi yang mudah dibagikan.' },
]

const postImages = ['posts/post-1.jpg', 'posts/post-2.jpg', 'posts/post-3.jpg']

const ranges = [
  { id: '1b', label: '1 Bulan', long: '1 bulan terakhir', points: 30, unit: 'Hari' },
  { id: '3b', label: '3 Bulan', long: '3 bulan terakhir', points: 12, unit: 'Minggu' },
  { id: '1t', label: '1 Tahun', long: '1 tahun terakhir', points: 12, unit: 'Bulan' },
]
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function buildSeries(b, r) {
  const cfg = ranges.find((x) => x.id === r)
  const scale = r === '1b' ? 1 : r === '3b' ? 7 : 30
  const total = r === '1t' ? 1 : r === '3b' ? 0.55 : 0.22
  const now = new Date()
  return Array.from({ length: cfg.points }, (_, i) => {
    const t = i / (cfg.points - 1)
    const wave = Math.sin((i + b.seed) * 1.7) * 0.07 + Math.cos((i * b.seed) * 0.9) * 0.04
    const lift = 1 + b.growth * total * t * (1 + wave)
    const views = Math.round(b.base * scale * lift)
    const reach = Math.round(views * (0.62 + t * 0.06))
    const visits = Math.round(views * (0.085 + t * 0.012) * (1 + wave / 2))
    let label = `${i + 1}`
    if (r === '1t') label = monthNames[(now.getMonth() - (cfg.points - 1 - i) + 24) % 12]
    if (r === '3b') label = `M${i + 1}`
    if (r === '1b') label = `${i + 1}`
    return { label, views, reach, visits }
  })
}

const avg = (xs) => xs.reduce((a, c) => a + c, 0) / xs.length
const growthPct = (xs) => {
  const n = Math.max(2, Math.round(xs.length / 4))
  return ((avg(xs.slice(-n)) - avg(xs.slice(0, n))) / avg(xs.slice(0, n))) * 100
}
const nf = new Intl.NumberFormat('id-ID')
const compact = (n) => (n >= 1e9 ? `${(n / 1e9).toFixed(1)} M` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} jt` : n >= 1e3 ? `${(n / 1e3).toFixed(1)} rb` : `${n}`).replace('.', ',')

const subsidiaryLogos = [
  { name: 'upsociety', file: 'logos/sub-upsociety.png', h: 'h-7', href: '#/upsociety' },
  { name: 'econ', file: 'logos/sub-econ.png', h: 'h-10' },
  { name: 'mipo', file: 'logos/sub-mipo.png', h: 'h-10' },
]

const reviews = [
  { name: 'Rina Maharani', role: 'Pemilik UMKM Kuliner', rating: 5, text: 'Konten media sosial kami jadi jauh lebih hidup. Dalam dua bulan, jangkauan Instagram naik drastis dan pesanan ikut bertambah.' },
  { name: 'Budi Hartono', role: 'Marketing Manager', rating: 5, text: 'Tim sangat responsif dan paham kebutuhan brand. Laporan bulanannya jelas dan mudah dipahami oleh manajemen.' },
  { name: 'Sari Wulandari', role: 'Founder Brand Kecantikan', rating: 5, text: 'Identitas visual yang dibuat benar-benar mewakili karakter brand kami. Hasilnya rapi dan konsisten di semua kanal.' },
  { name: 'Andika Putra', role: 'Kepala Komunitas', rating: 4, text: 'Platform digital yang dibangun mudah dipakai anggota kami. Proses pengerjaan tepat waktu dan revisi cepat ditangani.' },
  { name: 'Maya Anggraini', role: 'Brand Owner Fashion', rating: 5, text: 'Kolaborasi dengan KOL dari muda group tepat sasaran. Engagement naik dan audiens baru terus berdatangan.' },
  { name: 'Hendra Saputra', role: 'Direktur Operasional', rating: 5, text: 'Profesional dari awal sampai akhir. Strategi kampanyenya terukur dan anggaran promosi jadi jauh lebih efisien.' },
  { name: 'Dewi Lestari', role: 'Pengelola Program Sosial', rating: 5, text: 'Konten edukasinya menarik dan mudah dibagikan. Program kami kini dikenal lebih banyak orang.' },
  { name: 'Fajar Nugroho', role: 'Pemilik Toko Gadget', rating: 4, text: 'Promo yang dikemas dalam konten pendek sangat efektif. Kunjungan ke profil dan toko meningkat tajam.' },
  { name: 'Citra Permata', role: 'Event Organizer', rating: 5, text: 'Liputan live dan dokumentasi acaranya keren. Tim kreatifnya punya ide segar dan mudah diajak berdiskusi.' },
  { name: 'Yoga Prasetyo', role: 'Founder Startup', rating: 5, text: 'Dari desain antarmuka sampai peluncuran, semuanya terasa mulus. Sangat direkomendasikan untuk bisnis yang ingin tumbuh.' },
]

const footerLinks = [
  { title: 'Perusahaan', links: [{ label: 'Tentang Kami', href: '#tentang' }, { label: 'Portofolio', href: '#portofolio' }, { label: 'Kontak', href: '#/kontak' }] },
  { title: 'Bantuan', links: [{ label: 'Layanan', href: '#layanan' }, { label: 'Kontak', href: '#/kontak' }, { label: 'FAQ', href: '#/faq' }] },
]

const faqCategories = [
  { id: 'Perusahaan', label: 'Sebagai Klien Perusahaan' },
  { id: 'UMKM', label: 'Sebagai Klien UMKM' },
  { id: 'Agensi', label: 'Sebagai Klien Agensi' },
]

const faqs = [
  { cat: 'Perusahaan', q: 'Paket yang cocok untuk perusahaan?', a: 'Untuk perusahaan kami merekomendasikan paket Corporate: strategi brand menyeluruh, manajemen media sosial multi-platform, pengembangan platform digital, serta laporan performa bulanan. Tim khusus (account manager, strategist, dan creative) akan mendampingi Anda sepanjang kontrak.' },
  { cat: 'Perusahaan', q: 'Apakah Paket bisa custom?', a: 'Bisa. Semua paket dapat disesuaikan dengan kebutuhan, mulai dari ruang lingkup layanan, jumlah konten per bulan, hingga durasi kerja sama. Ceritakan target bisnis Anda lewat formulir kontak dan kami siapkan penawaran dalam 1x24 jam kerja.' },
  { cat: 'Perusahaan', q: 'Garansi apa yang ditawarkan setelah bekerja sama?', a: 'Kami memberikan garansi revisi hingga hasil sesuai brief, dukungan purna proyek selama 30 hari, dan perjanjian kerahasiaan (NDA) untuk seluruh data perusahaan Anda. Seluruh hasil akhir menjadi hak milik klien.' },
  { cat: 'Perusahaan', q: 'Berapa lama proses pengerjaan proyek?', a: 'Identitas brand umumnya 2-4 minggu, kampanye digital 4-6 minggu, dan pengembangan platform 6-12 minggu tergantung kompleksitas. Jadwal rinci diberikan di awal proyek beserta milestone yang dapat Anda pantau.' },
  { cat: 'UMKM', q: 'Apakah ini aman untuk keberlanjutan usaha UMKM?', a: 'Aman. Kami merancang paket UMKM dengan biaya terukur dan tanpa kontrak panjang, sehingga arus kas usaha Anda tetap terjaga. Strategi difokuskan pada promosi yang hemat biaya dan hasil yang bisa diukur, bukan sekadar tampil.' },
  { cat: 'UMKM', q: 'Paket yang cocok untuk UMKM?', a: 'Paket Starter cocok untuk UMKM: pembuatan identitas visual dasar, 12 konten media sosial per bulan, optimasi profil Google Bisnis, dan konsultasi bulanan. Anda dapat naik ke paket lebih besar kapan saja saat usaha berkembang.' },
  { cat: 'UMKM', q: 'Apakah Paket bisa custom?', a: 'Bisa. UMKM dapat memilih layanan satuan, misalnya hanya desain logo atau hanya pengelolaan Instagram. Harga disesuaikan dengan layanan yang dipilih, tanpa biaya tersembunyi.' },
  { cat: 'UMKM', q: 'Garansi apa yang ditawarkan setelah bekerja sama?', a: 'Setiap proyek mendapat revisi gratis sesuai paket, panduan penggunaan hasil kerja, serta sesi tanya jawab setelah proyek selesai agar Anda dapat mengelola sendiri aset digital Anda dengan percaya diri.' },
  { cat: 'Agensi', q: 'Paket yang cocok untuk agensi?', a: 'Paket Partner (white-label) memungkinkan agensi Anda memakai tim produksi kami: desain, pengembangan web, dan produksi konten. Hasil kerja diberikan tanpa atribut muda group sehingga dapat langsung diserahkan ke klien Anda.' },
  { cat: 'Agensi', q: 'Apakah ini aman untuk keberlanjutan usaha agensi?', a: 'Ya. Kami tidak menghubungi klien Anda secara langsung dan terikat perjanjian non-kompetisi. Kapasitas tim fleksibel, jadi Anda bisa menambah atau mengurangi volume pekerjaan sesuai jumlah proyek.' },
  { cat: 'Agensi', q: 'Apakah Paket bisa custom?', a: 'Bisa. Kami menawarkan sistem kuota jam kerja atau per proyek, lengkap dengan SLA pengerjaan yang disepakati bersama. Hubungi kami untuk merancang skema yang paling sesuai.' },
  { cat: 'Agensi', q: 'Garansi apa yang ditawarkan setelah bekerja sama?', a: 'Kami menjamin ketepatan waktu sesuai SLA, revisi hingga disetujui klien akhir Anda, dan penggantian cepat apabila terjadi kendala kualitas pada hasil pengerjaan.' },
]

const addOns = [
  'Tanpa add-on',
  'Akun media sosial tambahan',
  'Postingan tambahan (per 4 konten)',
  'Ads management',
  'KOL / talent video',
  'Live streaming',
  'Foto produk',
  'Laporan analisis tambahan',
  'Lainnya (tulis di pesan)',
]

const upsSlides = [
  'Cover', 'Tentang Kami', 'Bidang Klien', 'Klien: Intown Cell', 'Klien: Milkypedia', 'Klien: Neabeauty', 'Kami Berbeda', 'Paket Harga', 'Penutup',
].map((title, i) => ({ title, src: `upsociety/slide-${i + 1}.jpg` }))

const upsSectors = ['Fashion', 'FnB', 'Retail', 'FMCG', 'Others']
const upsPlans = [
  { name: 'Go UMKM', price: 'Rp 599.000', items: ['1 akun media sosial', '10x postingan per bulan', 'Content planner', 'Desain feed, story & reels'] },
  { name: 'Starting', price: 'Rp 999.000', items: ['2 akun media sosial', '16x postingan per bulan', 'Laporan analisis bulanan', 'Ide konten, hashtag & caption'] },
  { name: 'Auto Pilot', price: 'Rp 1.699.000', items: ['2 akun media sosial', '18x postingan per bulan', 'Ads management', 'KOL & talent video, free live'], hot: true },
  { name: 'Exclusive', price: 'Rp 2.899.000', items: ['3 akun media sosial', '18x postingan per bulan', 'Interactive admin sosmed', 'Free foto produk & live'] },
]
const company = {
  address: 'Jl. Contoh Raya No. 12, Jakarta Selatan, DKI Jakarta 12345',
  phone: '+62 838 2043 9894',
  wa: '6283820439894',
  email: 'halo@mudagroup.id',
  hours: 'Senin - Jumat, 09.00 - 17.00 WIB',
}

// URL Google Apps Script penerima data form (tab "Kontak" dan "Pendaftar")
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzvtqJdJTChdb-54c2GYUGWPG_efIEYNdAkhirimpc4VQudK5VonvzB1tm1OIwD45Wq/exec'

/* ---------- Portal PIC / Pimpinan ----------
   Akun DUMMY untuk demo di localhost. Ini hanya penyaringan tampilan di sisi browser,
   bukan keamanan sungguhan: untuk produksi, otentikasi harus dilakukan di server. */
const PIC_ACCOUNTS = [
  { email: 'direktur@mudagroup.id', hash: '14a4043a494a125f9c77fad8bbb61e23d9cf6586a6fadadde550a1639cfc09d8', hashB64: 'TXVkYVBJQyMyMDI2',
    user: { name: 'Direktur Utama', email: 'direktur@mudagroup.id', role: 'pic', jabatan: 'Direktur Utama', company: 'muda group' } },
  { email: 'headbrand@mudagroup.id', hash: '9008091c705b2fc1445d718419e60aec490b8f771ff70b6656cdd92a806f6839', hashB64: 'QnJhbmRQSUMjMjAyNg==',
    user: { name: 'Head of Brand', email: 'headbrand@mudagroup.id', role: 'pic', jabatan: 'Head of Brand', company: 'muda group' } },
]

const picNav = [
  { label: 'Beranda PIC', href: '#/pic' },
  { label: 'Cakupan Portofolio', href: '#/pic/portofolio' },
  { label: 'Performa Brand', href: '#/pic/performa' },
  { label: 'Analisis LIVE Talent', href: '#/pic/live' },
]
