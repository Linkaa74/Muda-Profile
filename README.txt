muda group - situs HTML statis (tanpa Node.js / build)

Cara pakai
- Lokal (disarankan): buka terminal di folder ini lalu jalankan  python -m http.server 8000
  kemudian buka http://localhost:8000  (membuka index.html langsung juga bisa, tetapi
  pembacaan PDF paling stabil lewat server lokal).
- Hosting: unggah seluruh isi folder (index.html, css/, js/, images/, templates/) ke hosting.

Struktur
- index.html        kerangka halaman
- css/style.css     CSS hasil kompilasi Tailwind (siap pakai)
- js/data.js        teks, harga, daftar, kontak, URL Google Sheets, akun dummy PIC
- js/ui.js, pages.js, widgets.js, icons.js   tampilan dan interaksi situs
- js/pic.js         PORTAL PIC: skema data, pembaca Excel/PDF, perhitungan peningkatan, tampilan
- js/pic-data.js    PORTAL PIC: lihat & edit data, telusur perhitungan, riwayat perubahan, ekspor Excel
- js/vendor/        pustaka pembaca file (SheetJS (build lengkap, mendukung .xlsx dan .xls) untuk Excel, pdf.js untuk PDF). Dimuat HANYA
                    saat ada file diunggah, jadi tidak membebani halaman biasa.
- templates/        template Excel dan contoh PDF untuk 3 analisis PIC
- images/           semua gambar

Portal PIC / Pimpinan
- Masuk lewat  #/masuk/pic  (atau tab "PIC / Pimpinan" di halaman Masuk / Daftar).
- PIC hanya melihat 3 menu: Cakupan Data Portofolio, Peningkatan Performa Brand, Analisis LIVE Talent.
- Setiap menu punya unggah PDF / Excel; peningkatan dihitung otomatis. Tanpa unggahan, tampil data contoh.
- Peningkatan (%) = (nilai periode terakhir - nilai periode pertama) / nilai periode pertama x 100.
- Format kolom tiap analisis ada di dalam halaman ("Format data yang dibutuhkan") dan di templates/.
- Akun dummy ada di js/data.js (PIC_ACCOUNTS, berupa hash). Ganti/tambah dengan cara membuat
  hash SHA-256 dari kata sandi baru.
- Data & Transparansi (di bagian bawah tiap menu analisis):
    * Data      : tabel semua baris yang dipakai analisis. "Mode Edit" untuk ubah sel, tambah/hapus baris,
                  urungkan, dan pulihkan ke file sumber. Setiap perubahan langsung menghitung ulang analisis.
    * Perhitungan: angka awal, angka akhir, dan rumus dengan angka sebenarnya; kolom pembanding "data asli"
                  muncul bila data sudah diedit.
    * Riwayat   : catatan tambah-saja (siapa, kapan, nilai sebelum/sesudah). Mengurungkan atau memulihkan
                  tidak menghapus catatan.
    * Unduh Excel: sheet Data (bisa diunggah ulang), Perhitungan, Riwayat, Ringkasan.
  Label "Data diedit" muncul di hasil analisis bila data berbeda dari file sumber.
- PENTING: login ini hanya penyaringan tampilan di browser (data akun & hasil unggahan disimpan
  di localStorage). Untuk data perusahaan yang sungguhan, otentikasi dan penyimpanan harus
  dipindah ke server/back-end.

Mengompilasi ulang CSS (hanya jika menambah class Tailwind baru)
  npm i -D @tailwindcss/cli
  npx tailwindcss -i css/input.css -o css/style.css --minify

Jika ada file tidak terbaca / gagal dibagikan
- Cocokkan isi folder dengan DAFTAR-FILE.txt (nama, ukuran, SHA-256). File yang hilang atau ukurannya
  berbeda berarti proses ekstrak/kirim tidak lengkap: ekstrak ulang zip ke folder baru.
- Gmail dan beberapa aplikasi menolak/ memotong zip yang berisi file .js. Kirim lewat Google Drive,
  WeTransfer, atau unggah ke hosting statis (Netlify Drop, GitHub Pages) lalu bagikan tautannya.
- js/vendor/*.js adalah pustaka pihak ketiga yang di-minify (satu baris sangat panjang, sampai 1 MB). Itu
  normal dan hanya dipakai untuk membaca file Excel/PDF. Jika alat Anda tidak bisa membacanya, itu tidak
  mempengaruhi cara kerja situs; gunakan paket "kode-saja" untuk keperluan review kode.
- Windows: klik kanan zip > Extract All (jangan jalankan dari dalam pratinjau zip). Setelah diekstrak,
  index.html dapat dibuka dengan klik dua kali.
