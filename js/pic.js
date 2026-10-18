/* Portal PIC / Pimpinan: skema data, pembaca file Excel & PDF, perhitungan peningkatan, tampilan.
   Pustaka pembaca file (js/vendor) dimuat HANYA saat ada file diunggah, supaya halaman tetap ringan. */

/* ---------- Utilitas ---------- */
const pSum = (xs, k) => xs.reduce((a, c) => a + (c[k] || 0), 0)
const pMean = (xs, k) => (xs.length ? pSum(xs, k) / xs.length : 0)
const pPct = (b, a) => (a > 0 && isFinite(a) && isFinite(b) ? ((b - a) / a) * 100 : null)
const pDec = (n, d = 2) => Number(n).toFixed(d).replace('.', ',')
const fmtPct = (p, d = 1) => (p == null ? '-' : `${p >= 0 ? '+' : '-'}${pDec(Math.abs(p), d)}%`)
const rpFull = (n) => `Rp ${nf.format(Math.round(n))}`
const rpShort = (n) => `Rp ${compact(Math.round(n))}`
const uniqSorted = (xs) => [...new Set(xs)].sort()
const pad2 = (n) => String(n).padStart(2, '0')
const monthLabel = (p) => `${monthNames[+p.slice(5, 7) - 1]} ${p.slice(2, 4)}`
const groupBy = (rows, fn) => {
  const m = new Map()
  for (const r of rows) {
    const k = fn(r)
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(r)
  }
  return m
}
const pickWin = (periods, w) => (w === 'all' ? periods : periods.slice(-Math.max(2, +w)))
const seeded = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/* ---------- Pembacaan nilai sel ---------- */
const MONTHS = { jan: 1, januari: 1, january: 1, feb: 2, februari: 2, february: 2, mar: 3, maret: 3, march: 3, apr: 4, april: 4, mei: 5, may: 5, jun: 6, juni: 6, june: 6, jul: 7, juli: 7, july: 7, agu: 8, agt: 8, agustus: 8, aug: 8, august: 8, sep: 9, sept: 9, september: 9, okt: 10, oktober: 10, oct: 10, october: 10, nov: 11, november: 11, des: 12, desember: 12, dec: 12, december: 12 }

function dateParts(v) {
  let y, m, d
  if (v instanceof Date) {
    if (isNaN(v)) return null
    y = v.getFullYear(); m = v.getMonth() + 1; d = v.getDate()
  } else if (typeof v === 'number') {
    if (v > 25569 && v < 80000) {
      const x = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000)
      y = x.getUTCFullYear(); m = x.getUTCMonth() + 1; d = x.getUTCDate()
    } else if (Number.isInteger(v) && v >= 200001 && v <= 210012) {
      y = Math.floor(v / 100); m = v % 100; d = 1
    } else return null
  } else {
    const s = String(v ?? '').trim()
    let r
    if ((r = s.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?(?:[T\s].*)?$/))) { y = +r[1]; m = +r[2]; d = +(r[3] || 1) }
    else if ((r = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) { d = +r[1]; m = +r[2]; y = +r[3] }
    else if ((r = s.match(/^(\d{1,2})[-/.](\d{4})$/))) { m = +r[1]; y = +r[2]; d = 1 }
    else if ((r = s.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/))) { d = +r[1]; m = MONTHS[r[2].toLowerCase()]; y = +r[3] }
    else if ((r = s.match(/^([A-Za-z]+)\.?[\s-]*(\d{2}|\d{4})$/))) { m = MONTHS[r[1].toLowerCase()]; y = +r[2] < 100 ? 2000 + +r[2] : +r[2]; d = 1 }
    else return null
  }
  if (!m || m < 1 || m > 12 || !d || d < 1 || d > 31 || y < 2000 || y > 2100) return null
  return { y, m, d }
}

function parseNum(v, type) {
  if (typeof v === 'number') return isFinite(v) ? v : null
  let s = String(v ?? '').replace(/[\s\u00a0]/g, '').replace(/rp\.?/i, '').replace('%', '')
  if (!s || !/^-?[\d.,]+$/.test(s)) return null
  const neg = s[0] === '-'
  if (neg) s = s.slice(1)
  const dots = (s.match(/\./g) || []).length
  const commas = (s.match(/,/g) || []).length
  let dec = ''
  if (dots && commas) dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ','
  else if (dots === 1 || commas === 1) {
    const sep = dots ? '.' : ','
    const tail = s.length - s.indexOf(sep) - 1
    dec = type === 'dec' || tail !== 3 ? sep : ''
  }
  const t = dec === '.' ? s.replace(/,/g, '') : dec === ',' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/[.,]/g, '')
  const n = Number(t)
  return isFinite(n) ? (neg ? -n : n) : null
}

const hnorm = (v) => String(v ?? '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '')

/* ---------- Skema data: satu sumber untuk validasi, panduan format, dan template ---------- */
const TXT = 'Teks'
const INT = 'Bilangan bulat'
const DEC = 'Desimal (2 angka di belakang koma)'

const PIC = {
  portofolio: {
    slug: 'portofolio', icon: 'BarChart3', file: 'cakupan-portofolio', whoKey: 'brand', whoLabel: 'brand', whoAll: 'Semua brand',
    title: 'Cakupan Data Portofolio',
    desc: 'Ringkasan views, jangkauan, kunjungan profil, dan follower baru seluruh brand dalam portofolio, lengkap dengan kontribusi tiap brand.',
    resultTitle: 'Cakupan & Peningkatan Portofolio',
    formula: 'Peningkatan (%) = (nilai periode terakhir - nilai periode pertama) / nilai periode pertama x 100. Jika satu brand punya beberapa baris pada periode yang sama, angkanya dijumlahkan.',
    cols: [
      { k: 'brand', label: 'Brand', type: 'text', req: true, alias: ['klien', 'client', 'namabrand'], typeLabel: TXT, rule: 'Nama brand, tulis konsisten', ex: 'Milkypedia' },
      { k: 'period', label: 'Periode', type: 'period', req: true, alias: ['bulan', 'period', 'month'], typeLabel: 'Teks YYYY-MM', rule: 'Tahun-bulan. Format sel Excel: Text', ex: '2026-01' },
      { k: 'views', label: 'Views', type: 'int', req: true, alias: ['totalviews', 'tayangan', 'impressions'], typeLabel: INT, rule: 'Tanpa desimal dan simbol, mis. 52000 atau 52.000', ex: 52000 },
      { k: 'reach', label: 'Jangkauan', type: 'int', req: true, alias: ['reach', 'awareness'], typeLabel: INT, rule: 'Akun unik yang terjangkau', ex: 34500 },
      { k: 'visits', label: 'Kunjungan Profil', type: 'int', req: true, alias: ['kunjungan', 'profilevisits', 'visits'], typeLabel: INT, rule: 'Jumlah kunjungan ke profil', ex: 4600 },
      { k: 'followers', label: 'Follower Baru', type: 'int', req: true, alias: ['followersbaru', 'newfollowers', 'pertambahanfollower'], typeLabel: INT, rule: 'Tambahan follower pada periode itu', ex: 650 },
    ],
    sample() {
      const out = []
      brands.forEach((b) => {
        const r = seeded(b.seed * 31)
        SAMPLE_PERIODS.forEach((p, i) => {
          const t = i / (SAMPLE_PERIODS.length - 1)
          const views = Math.round(b.base * 30 * (1 + b.growth * 0.3 * t * (1 + (r() - 0.5) * 0.18)))
          const visits = Math.round(views * (0.085 + t * 0.012))
          out.push({ brand: b.name, period: p, views, reach: Math.round(views * (0.62 + t * 0.06)), visits, followers: Math.round(visits * 0.14) })
        })
      })
      return out
    },
  },
  performa: {
    slug: 'performa', icon: 'TrendingUp', file: 'performa-brand', whoKey: 'brand', whoLabel: 'brand', whoAll: 'Semua brand',
    title: 'Peningkatan Performa Brand',
    desc: 'Pantau seberapa besar follower, engagement rate, konversi, dan omzet tiap brand meningkat setelah bekerja sama dengan muda group.',
    resultTitle: 'Peningkatan Performa Brand',
    formula: 'Peningkatan (%) = (nilai periode terakhir - nilai periode pertama) / nilai periode pertama x 100. Untuk Engagement Rate dan Konversi ditampilkan juga selisih dalam poin persentase. Skor Peningkatan = rata-rata peningkatan keempat metrik.',
    cols: [
      { k: 'brand', label: 'Brand', type: 'text', req: true, alias: ['klien', 'client', 'namabrand'], typeLabel: TXT, rule: 'Nama brand, tulis konsisten', ex: 'Neabeauty' },
      { k: 'period', label: 'Periode', type: 'period', req: true, alias: ['bulan', 'period', 'month'], typeLabel: 'Teks YYYY-MM', rule: 'Tahun-bulan. Format sel Excel: Text', ex: '2026-01' },
      { k: 'followers', label: 'Follower', type: 'int', req: true, alias: ['followers', 'totalfollower', 'jumlahfollower'], typeLabel: INT, rule: 'Total follower di akhir periode', ex: 12900 },
      { k: 'er', label: 'Engagement Rate (%)', type: 'dec', max: 100, req: true, alias: ['er', 'tingkatengagement'], typeLabel: DEC, rule: 'Persen 0-100 tanpa tanda %, mis. 4,35', ex: 2.4 },
      { k: 'conv', label: 'Konversi (%)', type: 'dec', max: 100, req: true, alias: ['conversionrate', 'konversirate', 'cr'], typeLabel: DEC, rule: 'Persen 0-100 tanpa tanda %, mis. 1,80', ex: 1.1 },
      { k: 'revenue', label: 'Omzet (Rp)', type: 'int', req: true, alias: ['revenue', 'penjualan', 'pendapatan'], typeLabel: 'Bilangan bulat (Rupiah)', rule: 'Tanpa "Rp" dan titik, mis. 4680000', ex: 3870000 },
    ],
    sample() {
      const out = []
      brands.forEach((b) => {
        const r = seeded(b.seed * 17 + 3)
        SAMPLE_PERIODS.forEach((p, i) => {
          const t = i / (SAMPLE_PERIODS.length - 1)
          const n = () => 1 + (r() - 0.5) * 0.06
          out.push({
            brand: b.name, period: p,
            followers: Math.round(b.base * 3 * (1 + b.growth * 0.12 * t) * n()),
            er: +((2.2 + b.growth * 0.85 * t) * n()).toFixed(2),
            conv: +((1 + b.growth * 0.32 * t) * n()).toFixed(2),
            revenue: Math.round(b.base * 900 * (1 + b.growth * 0.45 * t) * n()),
          })
        })
      })
      return out
    },
  },
  live: {
    slug: 'live', icon: 'Video', file: 'live-talent', whoKey: 'talent', whoLabel: 'talent', whoAll: 'Semua talent',
    title: 'Analisis LIVE Talent',
    desc: 'Evaluasi performa tiap talent live streaming: penonton, pesanan, GMV, konversi, dan seberapa besar peningkatannya dari bulan ke bulan.',
    resultTitle: 'Performa Sesi LIVE',
    formula: 'Peningkatan (%) = (rata-rata per sesi di bulan terakhir - bulan pertama) / bulan pertama x 100. Konversi (%) = total pesanan / total rata-rata penonton x 100. Jam Live = total durasi / 60.',
    cols: [
      { k: 'talent', label: 'Talent', type: 'text', req: true, alias: ['talenta', 'namatalent', 'host'], typeLabel: TXT, rule: 'Nama talent, tulis konsisten', ex: 'Raka Pratama' },
      { k: 'brand', label: 'Brand', type: 'text', req: false, alias: ['klien', 'client', 'namabrand'], typeLabel: 'Teks (opsional)', rule: 'Brand yang dipromosikan', ex: 'Milkypedia' },
      { k: 'date', label: 'Tanggal', type: 'date', req: true, alias: ['date', 'tanggallive', 'tanggalsesi'], typeLabel: 'Teks YYYY-MM-DD', rule: 'Tanggal sesi. Tanggal asli Excel juga bisa', ex: '2026-01-05' },
      { k: 'duration', label: 'Durasi (menit)', type: 'int', req: true, alias: ['duration', 'lamalive'], typeLabel: INT, rule: 'Lama siaran dalam menit', ex: 120 },
      { k: 'peak', label: 'Penonton Puncak', type: 'int', req: true, alias: ['peakviewers', 'puncak', 'peak'], typeLabel: INT, rule: 'Penonton bersamaan tertinggi', ex: 640 },
      { k: 'avg', label: 'Rata-rata Penonton', type: 'int', req: true, alias: ['ratapenonton', 'avgviewers', 'averageviewers'], typeLabel: INT, rule: 'Rata-rata penonton selama sesi', ex: 380 },
      { k: 'comments', label: 'Komentar', type: 'int', req: false, alias: ['comments'], typeLabel: 'Bilangan bulat (opsional)', rule: 'Jumlah komentar', ex: 910 },
    { k: 'orders', label: 'Pesanan', type: 'int', req: true, alias: ['order', 'orders', 'jumlahpesanan'], typeLabel: INT, rule: 'Jumlah pesanan dari sesi', ex: 24 },
      { k: 'gmv', label: 'GMV (Rp)', type: 'int', req: true, alias: ['totalgmv', 'nilaipenjualan'], typeLabel: 'Bilangan bulat (Rupiah)', rule: 'Tanpa "Rp" dan titik, mis. 3600000', ex: 3600000 },
    ],
    sample() {
      const talents = [['Raka Pratama', 'Milkypedia'], ['Dinda Safira', 'Neabeauty'], ['Bima Aditya', 'Intowncell'], ['Salsa Maharani', 'Alto'], ['Tania Putri', 'Trily']]
      const out = []
      talents.forEach(([talent, brand], ti) => {
        const r = seeded(ti * 97 + 11)
        const base = 170 + ti * 55
        const rate = 0.035 + ti * 0.004
        const price = 60000 + ti * 22000
        SAMPLE_PERIODS.forEach((p, i) => {
          const t = i / (SAMPLE_PERIODS.length - 1)
          ;[4, 13, 22].forEach((day) => {
            const avg = Math.round(base * (1 + (0.5 + ti * 0.12) * t) * (1 + (r() - 0.5) * 0.14))
            const duration = 90 + Math.round(r() * 90)
            const orders = Math.round(avg * rate * (1 + 0.5 * t) * (1 + (r() - 0.5) * 0.2))
            out.push({ talent, brand, date: `${p}-${pad2(day)}`, period: p, duration, peak: Math.round(avg * (1.5 + r() * 0.4)), avg, comments: Math.round(avg * (0.9 + r() * 0.5) * (duration / 60)), orders, gmv: orders * price })
          })
        })
      })
      return out
    },
  },
}
const SAMPLE_PERIODS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']
Object.values(PIC).forEach((sc) => sc.cols.forEach((c) => { c._al = new Set([hnorm(c.label), ...c.alias]) }))

/* ---------- Validasi satu nilai sel (dipakai saat baca file dan saat edit manual) ---------- */
function coerce(c, raw) {
  if (raw === '' || raw == null) return c.req ? { ok: false, err: `${c.label} wajib diisi` } : { ok: true, v: c.type === 'text' ? '' : 0 }
  if (c.type === 'text') return { ok: true, v: String(raw).trim() }
  if (c.type === 'period' || c.type === 'date') {
    const d = dateParts(raw)
    if (!d) return { ok: false, err: `${c.label} "${raw}" tidak dikenali` }
    return { ok: true, v: c.type === 'period' ? `${d.y}-${pad2(d.m)}` : `${d.y}-${pad2(d.m)}-${pad2(d.d)}` }
  }
  const n = parseNum(raw, c.type)
  if (n === null) return { ok: false, err: `${c.label} "${raw}" bukan angka` }
  if (n < 0) return { ok: false, err: `${c.label} tidak boleh negatif` }
  if (c.max && n > c.max) return { ok: false, err: `${c.label} melebihi ${c.max}` }
  return { ok: true, v: c.type === 'int' ? Math.round(n) : n }
}

/* ---------- Matriks tabel -> baris data (dipakai Excel dan PDF) ---------- */
const MAX_ROWS = 5000

function matrixToRows(matrix, sc) {
  const need = sc.cols.filter((c) => c.req)
  let best = null
  for (let i = 0; i < Math.min(matrix.length, 25); i++) {
    const cells = matrix[i].map(hnorm)
    const map = {}
    sc.cols.forEach((c) => {
      const j = cells.findIndex((x) => x && c._al.has(x))
      if (j >= 0) map[c.k] = j
    })
    const found = need.filter((c) => map[c.k] !== undefined).length
    if (!best || found > best.found) best = { i, map, found }
    if (found === need.length) break
  }
  if (!best || best.found < need.length) {
    const miss = need.filter((c) => !best || best.map[c.k] === undefined).map((c) => c.label)
    throw new Error(`Kolom wajib tidak ditemukan: ${miss.join(', ')}. Pastikan baris judul kolom sama dengan template.`)
  }

  const rows = []
  const warns = []
  const skips = []
  let skipped = 0
  const first = need[0]
  for (let i = best.i + 1; i < matrix.length; i++) {
    const cells = matrix[i]
    if (cells.every((c) => c === '' || c == null)) continue
    if (first && first._al.has(hnorm(cells[best.map[first.k]]))) continue // judul kolom berulang (PDF antar halaman)
    const row = {}
    let bad = ''
    for (const c of sc.cols) {
      const r = coerce(c, best.map[c.k] === undefined ? '' : cells[best.map[c.k]])
      if (!r.ok) { bad = r.err; break }
      row[c.k] = r.v
    }
    if (bad) {
      skipped++
      if (warns.length < 4) warns.push(`baris ${i + 1}: ${bad}`)
      if (skips.length < 50) skips.push({ row: i + 1, why: bad })
      continue
    }
    if (sc.slug === 'live') row.period = row.date.slice(0, 7)
    rows.push(row)
    if (rows.length >= MAX_ROWS) { warns.push(`dibatasi ${nf.format(MAX_ROWS)} baris pertama`); break }
  }
  if (!rows.length) throw new Error(`Tidak ada baris data yang valid.${warns.length ? ' Contoh masalah: ' + warns[0] + '.' : ''}`)
  return { rows, warns, skipped, skips }
}

/* ---------- Pembaca file (pustaka dimuat saat dibutuhkan) ---------- */
const libLoads = {}
function loadScript(src) {
  if (!libLoads[src]) {
    libLoads[src] = new Promise((res, rej) => {
      const s = document.createElement('script')
      s.src = src
      s.onload = res
      s.onerror = () => { delete libLoads[src]; rej(new Error('Pustaka pembaca file gagal dimuat. Pastikan folder js/vendor ikut ada di server.')) }
      document.head.appendChild(s)
    })
  }
  return libLoads[src]
}

async function readExcel(file, sc) {
  await loadScript('js/vendor/xlsx.full.min.js')
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  let lastErr = null
  for (const name of wb.SheetNames) {
    const m = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: '', blankrows: false })
    try { return matrixToRows(m, sc) } catch (e) { lastErr = e }
  }
  throw lastErr || new Error('File Excel kosong.')
}

async function readPdf(file, sc) {
  await loadScript('js/vendor/pdf.min.js')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('js/vendor/pdf.worker.min.js', document.baseURI).href
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const matrix = []
  const pages = Math.min(pdf.numPages, 60)
  for (let p = 1; p <= pages; p++) {
    const tc = await (await pdf.getPage(p)).getTextContent()
    const items = tc.items.filter((it) => it.str && it.str.trim()).map((it) => ({ s: it.str, x: it.transform[4], y: it.transform[5], w: it.width }))
    items.sort((a, b) => b.y - a.y || a.x - b.x)
    const lines = []
    for (const it of items) {
      const L = lines[lines.length - 1]
      if (L && Math.abs(L.y - it.y) <= 3) L.items.push(it)
      else lines.push({ y: it.y, items: [it] })
    }
    for (const L of lines) {
      L.items.sort((a, b) => a.x - b.x)
      const cells = []
      let end = null
      for (const it of L.items) {
        if (end !== null && it.x - end < 5.5) cells[cells.length - 1] += (it.x - end > 0.5 ? ' ' : '') + it.s
        else cells.push(it.s)
        end = it.x + it.w
      }
      matrix.push(cells.map((c) => c.trim()))
    }
  }
  if (!matrix.length) throw new Error('PDF tidak berisi teks (kemungkinan hasil scan atau gambar). Gunakan PDF hasil ekspor dari Excel/Word, atau unggah file Excel.')
  return matrixToRows(matrix, sc)
}

/* ---------- Penyimpanan data (browser) ---------- */
const PIC_KEY = 'muda_pic_data'
let picStore = {}
try { picStore = JSON.parse(localStorage.getItem(PIC_KEY) || '{}') } catch { picStore = {} }
const sampleCache = {}
const sampleRows = (kind) => (sampleCache[kind] ||= PIC[kind].sample().map((r, i) => ({ id: i + 1, ...r })))
function savePicStore() {
  try { localStorage.setItem(PIC_KEY, JSON.stringify(picStore)) } catch { toast('Data terlalu besar untuk disimpan; hanya berlaku sampai halaman ditutup.') }
}
// Migrasi data dari versi sebelumnya (belum punya id, data asli, dan riwayat)
Object.values(picStore).forEach((d) => {
  if (!d || !d.rows) return
  if (d.rows[0] && d.rows[0].id == null) d.rows.forEach((r, i) => { r.id = i + 1 })
  if (!d.orig && d.source && d.source.type === 'file') d.orig = d.rows.map((r) => ({ ...r }))
  d.log ||= []
  d.nextId ||= d.rows.reduce((m, r) => Math.max(m, r.id), 0) + 1
})
const picDataset = (kind) => picStore[kind] || { rows: sampleRows(kind), source: { type: 'sample' }, log: [] }
const origRows = (kind) => (picStore[kind] && picStore[kind].orig) || sampleRows(kind)

S.pic = {
  portofolio: { who: 'all', win: 'all', sort: { k: 'views', dir: -1 }, tab: 'data', edit: false, page: 0, q: '', undo: [] },
  performa: { who: 'all', win: 'all', sort: { k: 'score', dir: -1 }, tab: 'data', edit: false, page: 0, q: '', undo: [] },
  live: { who: 'all', win: 'all', sort: { k: 'gmv', dir: -1 }, tab: 'data', edit: false, page: 0, q: '', undo: [] },
}

/* ---------- Analisis ---------- */
function analyzePortofolio(rows, st) {
  const periods = pickWin(uniqSorted(rows.map((r) => r.period)), st.win)
  const ps = new Set(periods)
  const inWin = rows.filter((r) => ps.has(r.period))
  const scope = st.who === 'all' ? inWin : inWin.filter((r) => r.brand === st.who)
  const byP = groupBy(scope, (r) => r.period)
  const series = periods.filter((p) => byP.has(p)).map((p) => {
    const g = byP.get(p)
    return { p, label: monthLabel(p), views: pSum(g, 'views'), reach: pSum(g, 'reach'), visits: pSum(g, 'visits'), followers: pSum(g, 'followers') }
  })
  const f = series[0]
  const l = series[series.length - 1]
  const two = series.length > 1
  const kpi = (k) => ({ total: pSum(series, k), first: f[k], last: l[k], pct: two ? pPct(l[k], f[k]) : null })
  const totalViews = pSum(inWin, 'views')
  const table = [...groupBy(inWin, (r) => r.brand)].map(([name, g]) => {
    const byPp = groupBy(g, (r) => r.period)
    const ks = [...byPp.keys()].sort()
    return {
      name, views: pSum(g, 'views'), reach: pSum(g, 'reach'), visits: pSum(g, 'visits'), followers: pSum(g, 'followers'),
      share: totalViews ? (pSum(g, 'views') / totalViews) * 100 : 0,
      pa: ks[0], pb: ks[ks.length - 1], a: pSum(byPp.get(ks[0]), 'views'), b: pSum(byPp.get(ks[ks.length - 1]), 'views'),
      growth: ks.length > 1 ? pPct(pSum(byPp.get(ks[ks.length - 1]), 'views'), pSum(byPp.get(ks[0]), 'views')) : null,
    }
  })
  return { periods, series, two, kpi: { views: kpi('views'), reach: kpi('reach'), visits: kpi('visits'), followers: kpi('followers') }, table }
}

function perfAt(g) {
  return { followers: pSum(g, 'followers'), er: pMean(g, 'er'), conv: pMean(g, 'conv'), revenue: pSum(g, 'revenue') }
}

function analyzePerforma(rows, st) {
  const periods = pickWin(uniqSorted(rows.map((r) => r.period)), st.win)
  const ps = new Set(periods)
  const inWin = rows.filter((r) => ps.has(r.period))
  const scope = st.who === 'all' ? inWin : inWin.filter((r) => r.brand === st.who)
  const byP = groupBy(scope, (r) => r.period)
  const series = periods.filter((p) => byP.has(p)).map((p) => ({ p, label: monthLabel(p), ...perfAt(byP.get(p)) }))
  const two = series.length > 1
  const f = series[0]
  const l = series[series.length - 1]
  const table = [...groupBy(inWin, (r) => r.brand)].map(([name, g]) => {
    const byPp = groupBy(g, (r) => r.period)
    const ks = [...byPp.keys()].sort()
    const a = perfAt(byPp.get(ks[0]))
    const b = perfAt(byPp.get(ks[ks.length - 1]))
    const ok = ks.length > 1
    const gr = { followers: ok ? pPct(b.followers, a.followers) : null, er: ok ? pPct(b.er, a.er) : null, conv: ok ? pPct(b.conv, a.conv) : null, revenue: ok ? pPct(b.revenue, a.revenue) : null }
    const vals = Object.values(gr).filter((x) => x != null)
    return { name, pa: ks[0], pb: ks[ks.length - 1], a, b, gr, score: vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null, gFollowers: gr.followers, gEr: gr.er, gConv: gr.conv, gRevenue: gr.revenue }
  })
  return { periods, series, two, first: f, last: l, table }
}

function analyzeLive(rows, st) {
  const periods = pickWin(uniqSorted(rows.map((r) => r.period)), st.win)
  const ps = new Set(periods)
  const inWin = rows.filter((r) => ps.has(r.period))
  const scope = st.who === 'all' ? inWin : inWin.filter((r) => r.talent === st.who)
  const mon = (g) => ({ sessions: g.length, avg: pMean(g, 'avg'), peak: pMean(g, 'peak'), orders: pSum(g, 'orders'), gmv: pSum(g, 'gmv'), ordersPS: pSum(g, 'orders') / g.length, gmvPS: pSum(g, 'gmv') / g.length })
  const byP = groupBy(scope, (r) => r.period)
  const series = periods.filter((p) => byP.has(p)).map((p) => ({ p, label: monthLabel(p), ...mon(byP.get(p)) }))
  const two = series.length > 1
  const f = series[0]
  const l = series[series.length - 1]
  const table = [...groupBy(inWin, (r) => r.talent)].map(([name, g]) => {
    const byPp = groupBy(g, (r) => r.period)
    const ks = [...byPp.keys()].sort()
    const a = mon(byPp.get(ks[0]))
    const b = mon(byPp.get(ks[ks.length - 1]))
    const viewers = pSum(g, 'avg')
    return {
      name, pa: ks[0], pb: ks[ks.length - 1], a: a.gmvPS, b: b.gmvPS, sessions: g.length, hours: pSum(g, 'duration') / 60, avg: pMean(g, 'avg'), orders: pSum(g, 'orders'), gmv: pSum(g, 'gmv'),
      conv: viewers ? (pSum(g, 'orders') / viewers) * 100 : 0, growth: ks.length > 1 ? pPct(b.gmvPS, a.gmvPS) : null,
      gViewers: ks.length > 1 ? pPct(b.avg, a.avg) : null, brand: g[g.length - 1].brand,
    }
  })
  return { periods, series, two, first: f, last: l, table, totals: { sessions: scope.length, hours: pSum(scope, 'duration') / 60, avg: pMean(scope, 'avg'), orders: pSum(scope, 'orders'), gmv: pSum(scope, 'gmv'), talents: new Set(scope.map((r) => r.talent)).size } }
}

/* ---------- Tampilan: komponen ---------- */
let picView = { kind: '', A: null }
let picCharts = []

const kpiCard = (k) => {
  const up = k.pct == null ? null : k.pct >= 0
  return `
  <div class="rounded-3xl border border-mist bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div class="flex items-center justify-between"><span class="text-sm font-bold text-deep/70">${k.label}</span><span class="grid size-10 place-items-center rounded-full bg-mist text-azure">${ic(k.icon, 18)}</span></div>
    <p class="mt-3 font-display text-3xl font-extrabold text-navy">${k.value}</p>
    <p class="mt-1 flex flex-wrap items-center gap-1 text-sm font-bold ${up === false ? 'text-red-600' : 'text-ocean'}">${up === null ? '' : ic(up ? 'TrendingUp' : 'TrendingDown', 14)} ${fmtPct(k.pct)} <span class="font-normal text-deep/60">${k.note}</span></p>
    ${k.sub ? `<p class="mt-1 text-xs text-deep/60">${k.sub}</p>` : ''}
  </div>`
}

const gCell = (p, sub = '') => `<div class="font-bold ${p == null ? 'text-deep/50' : p >= 0 ? 'text-ocean' : 'text-red-600'}">${fmtPct(p)}</div>${sub ? `<div class="text-xs font-normal text-deep/60">${sub}</div>` : ''}`

const barList = (title, sub, items) => {
  const max = Math.max(...items.map((i) => i.v), 1)
  return `
  <div class="rounded-3xl bg-gradient-to-br from-navy to-ocean p-6 text-white shadow-sm">
    <h3 class="font-display text-lg font-extrabold">${title}</h3>
    <p class="text-sm text-white/70">${sub}</p>
    <ul class="mt-5 space-y-4">
      ${items.map((i) => `
        <li>
          <div class="mb-1 flex justify-between gap-3 text-sm font-bold"><span class="truncate">${esc(i.label)}</span><span class="shrink-0">${i.text}</span></div>
          <div class="h-3 overflow-hidden rounded-full bg-white/15"><div class="h-full rounded-full bg-gradient-to-r from-sky to-cyan" style="width:${Math.max(4, (Math.max(i.v, 0) / max) * 100)}%"></div></div>
        </li>`).join('')}
    </ul>
  </div>`
}

const chartCard = (id, title, h, legend = '') => `
  <div class="rounded-3xl border border-mist bg-white p-6 shadow-sm">
    <h3 class="font-display text-lg font-extrabold text-deep">${title}</h3>
    <div id="${id}" class="relative mt-4 ${h}"></div>
    ${legend}
  </div>`

const legendOf = (xs) => `<div class="mt-3 flex flex-wrap gap-5 text-sm font-bold">${xs.map(([c, t]) => `<span class="flex items-center gap-2" style="color:${c}"><i class="size-3 rounded-full" style="background:${c}"></i> ${t}</span>`).join('')}</div>`

function sortRows(rows, { k, dir }) {
  return [...rows].sort((a, b) => {
    const x = a[k]
    const y = b[k]
    if (x == null && y == null) return 0
    if (x == null) return 1
    if (y == null) return -1
    return (typeof x === 'string' ? x.localeCompare(y, 'id') : x - y) * dir
  })
}

const TCOLS = {
  portofolio: [
    { k: 'name', label: 'Brand', cell: (r) => esc(r.name) },
    { k: 'views', label: 'Views', num: 1, cell: (r) => nf.format(r.views) },
    { k: 'reach', label: 'Jangkauan', num: 1, cell: (r) => nf.format(r.reach) },
    { k: 'visits', label: 'Kunjungan Profil', num: 1, cell: (r) => nf.format(r.visits) },
    { k: 'followers', label: 'Follower Baru', num: 1, cell: (r) => nf.format(r.followers) },
    { k: 'share', label: 'Kontribusi', num: 1, cell: (r) => `${pDec(r.share, 1)}%` },
    { k: 'growth', label: 'Peningkatan Views', num: 1, cell: (r) => gCell(r.growth) },
  ],
  performa: [
    { k: 'name', label: 'Brand', cell: (r) => esc(r.name) },
    { k: 'gFollowers', label: 'Follower', num: 1, cell: (r) => gCell(r.gr.followers, `${compact(r.a.followers)} → ${compact(r.b.followers)}`) },
    { k: 'gEr', label: 'Engagement Rate', num: 1, cell: (r) => gCell(r.gr.er, `${pDec(r.a.er)}% → ${pDec(r.b.er)}%`) },
    { k: 'gConv', label: 'Konversi', num: 1, cell: (r) => gCell(r.gr.conv, `${pDec(r.a.conv)}% → ${pDec(r.b.conv)}%`) },
    { k: 'gRevenue', label: 'Omzet', num: 1, cell: (r) => gCell(r.gr.revenue, `${rpShort(r.a.revenue)} → ${rpShort(r.b.revenue)}`) },
    { k: 'score', label: 'Skor Peningkatan', num: 1, cell: (r) => gCell(r.score) },
  ],
  live: [
    { k: 'name', label: 'Talent', cell: (r) => `${esc(r.name)}${r.brand ? `<div class="text-xs font-normal text-deep/60">${esc(r.brand)}</div>` : ''}` },
    { k: 'sessions', label: 'Sesi', num: 1, cell: (r) => nf.format(r.sessions) },
    { k: 'hours', label: 'Jam Live', num: 1, cell: (r) => pDec(r.hours, 1) },
    { k: 'avg', label: 'Rata-rata Penonton', num: 1, cell: (r) => `<div class="font-bold text-navy">${nf.format(Math.round(r.avg))}</div><div class="text-xs font-normal ${r.gViewers == null ? 'text-deep/50' : r.gViewers >= 0 ? 'text-ocean' : 'text-red-600'}">${fmtPct(r.gViewers)}</div>` },
    { k: 'orders', label: 'Pesanan', num: 1, cell: (r) => nf.format(r.orders) },
    { k: 'gmv', label: 'GMV', num: 1, cell: (r) => rpFull(r.gmv) },
    { k: 'conv', label: 'Konversi', num: 1, cell: (r) => `${pDec(r.conv)}%` },
    { k: 'growth', label: 'Peningkatan GMV / Sesi', num: 1, cell: (r) => gCell(r.growth) },
  ],
}

function tableHtml(kind) {
  const st = S.pic[kind]
  const cols = TCOLS[kind]
  const rows = sortRows(picView.A.table, st.sort)
  const top = sortRows(picView.A.table, { k: kind === 'performa' ? 'score' : kind === 'live' ? 'gmv' : 'growth', dir: -1 })[0]
  return `
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] text-left text-sm">
      <thead><tr class="border-b-2 border-mist text-deep/70">
        ${cols.map((c) => `<th scope="col" aria-sort="${st.sort.k === c.k ? (st.sort.dir > 0 ? 'ascending' : 'descending') : 'none'}" class="px-3 py-3 ${c.num ? 'text-right' : ''}"><button type="button" data-act="pic-sort" data-k="${c.k}" class="inline-flex items-center gap-1 font-bold transition hover:text-azure ${st.sort.k === c.k ? 'text-azure' : ''}">${c.label} ${ic('ArrowUpDown', 13)}</button></th>`).join('')}
      </tr></thead>
      <tbody>
        ${rows.map((r) => `
          <tr class="border-b border-mist/70 transition hover:bg-mist/40 ${r.name === st.who ? 'bg-mist/60' : ''}">
            ${cols.map((c, i) => `<td class="px-3 py-3 ${c.num ? 'text-right' : 'font-bold text-navy'}">${i === 0 && top && r.name === top.name && rows.length > 1 ? `<span class="inline-flex items-center gap-1.5">${esc(r.name)} <span title="Peningkatan tertinggi" class="text-azure">${ic('Award', 15)}</span></span>` : c.cell(r)}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`
}

const tableCard = (kind, title, sub) => `
  <div class="mt-6 rounded-3xl border border-mist bg-white p-6 shadow-sm">
    <h3 class="font-display text-lg font-extrabold text-deep">${title}</h3>
    <p class="text-sm text-deep/60">${sub}</p>
    <div id="pic-table" class="mt-4">${tableHtml(kind)}</div>
  </div>`

const formulaNote = (kind) => `
  <p class="mt-6 flex items-start gap-3 rounded-2xl bg-mist/60 px-5 py-4 text-sm text-deep/80">
    <span class="mt-0.5 shrink-0 text-azure">${ic('Info', 18)}</span><span><b class="text-navy">Cara menghitung.</b> ${PIC[kind].formula}</span>
  </p>`

/* ---------- Tampilan: isi hasil per jenis analisis ---------- */
function picBody(kind) {
  const ds = picDataset(kind)
  const st = S.pic[kind]
  const A = { portofolio: analyzePortofolio, performa: analyzePerforma, live: analyzeLive }[kind](ds.rows, st)
  picView = { kind, A }
  const src = ds.source.type === 'sample' ? 'Data contoh (ilustrasi). Unggah file untuk menggantinya dengan data nyata.' : `Sumber: ${esc(ds.source.name)}`
  const range = A.series.length ? `${monthLabel(A.series[0].p)} - ${monthLabel(A.series[A.series.length - 1].p)} (${A.series.length} periode)` : '-'
  const dif = diffSummary(kind)
  const edited = dif.total ? ` <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">${ic('AlertTriangle', 12)} Data diedit: ${dif.total} perubahan dari sumber</span>` : ''
  const head = `<p class="text-deep/70">Periode ${range}. ${src}${edited} <button type="button" data-act="pic-open-tab" data-id="hitung" class="font-bold text-azure underline-offset-2 hover:underline">Lihat cara perhitungannya</button></p>`
  if (!A.series.length) return `${head}<p class="mt-6 rounded-2xl bg-mist/60 p-6 text-center font-bold text-ocean">Tidak ada data untuk pilihan ini.</p>`
  const warn = A.two ? '' : `<p class="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Hanya ada 1 periode pada pilihan ini, jadi peningkatan belum dapat dihitung.</p>`
  const NOTE = 'periode terakhir vs pertama'
  const dash = (a, b, fmt) => `Awal ${fmt(a)} → Akhir ${fmt(b)}`
  let kpis, charts

  if (kind === 'portofolio') {
    const k = A.kpi
    kpis = [
      { label: 'Total Views', icon: 'Eye', value: compact(k.views.total), pct: k.views.pct, note: NOTE, sub: dash(k.views.first, k.views.last, compact) },
      { label: 'Jangkauan (Awareness)', icon: 'Radio', value: compact(k.reach.total), pct: k.reach.pct, note: NOTE, sub: dash(k.reach.first, k.reach.last, compact) },
      { label: 'Kunjungan Profil', icon: 'MousePointerClick', value: compact(k.visits.total), pct: k.visits.pct, note: NOTE, sub: dash(k.visits.first, k.visits.last, compact) },
      { label: 'Follower Baru', icon: 'UserPlus', value: compact(k.followers.total), pct: k.followers.pct, note: NOTE, sub: dash(k.followers.first, k.followers.last, compact) },
    ]
    picCharts = [
      { id: 'pc-1', data: A.series, series: [{ key: 'views', color: '#2aa4ff', name: 'Views' }, { key: 'reach', color: '#154472', name: 'Jangkauan' }], type: 'area' },
      { id: 'pc-2', data: A.series, series: [{ key: 'visits', color: '#6ad8ef', name: 'Kunjungan Profil' }], type: 'bar' },
    ]
    charts = `
      <div class="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        ${chartCard('pc-1', 'Views &amp; Jangkauan per bulan', 'h-72', legendOf([['#2aa4ff', 'Views'], ['#154472', 'Jangkauan']]))}
        ${barList('Kontribusi Views per Brand', 'Porsi tiap brand dari total views', sortRows(A.table, { k: 'share', dir: -1 }).map((r) => ({ label: r.name, v: r.share, text: `${pDec(r.share, 1)}%` })))}
      </div>
      <div class="mt-6">${chartCard('pc-2', 'Kunjungan Profil per bulan', 'h-56')}</div>
      ${tableCard(kind, 'Rincian per Brand', 'Klik judul kolom untuk mengurutkan.')}`
  } else if (kind === 'performa') {
    const f = A.first
    const l = A.last
    const rate = (a, b) => `${pDec(a)}% → ${pDec(b)}% (${b - a >= 0 ? '+' : '-'}${pDec(Math.abs(b - a))} poin)`
    kpis = [
      { label: 'Follower', icon: 'UserPlus', value: compact(l.followers), pct: A.two ? pPct(l.followers, f.followers) : null, note: NOTE, sub: dash(f.followers, l.followers, compact) },
      { label: 'Engagement Rate', icon: 'Heart', value: `${pDec(l.er)}%`, pct: A.two ? pPct(l.er, f.er) : null, note: NOTE, sub: rate(f.er, l.er) },
      { label: 'Konversi', icon: 'MousePointerClick', value: `${pDec(l.conv)}%`, pct: A.two ? pPct(l.conv, f.conv) : null, note: NOTE, sub: rate(f.conv, l.conv) },
      { label: 'Omzet', icon: 'TrendingUp', value: rpShort(l.revenue), pct: A.two ? pPct(l.revenue, f.revenue) : null, note: NOTE, sub: dash(f.revenue, l.revenue, rpShort) },
    ]
    const rateFmt = (t) => pDec(t, 1)
    picCharts = [
      { id: 'pc-1', data: A.series, series: [{ key: 'er', color: '#2aa4ff', name: 'Engagement Rate (%)' }, { key: 'conv', color: '#154472', name: 'Konversi (%)' }], type: 'area', fmt: rateFmt },
      { id: 'pc-2', data: A.series, series: [{ key: 'revenue', color: '#6ad8ef', name: 'Omzet' }], type: 'bar' },
    ]
    const ranked = sortRows(A.table.filter((r) => r.score != null), { k: 'score', dir: -1 })
    charts = `
      <div class="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        ${chartCard('pc-1', 'Engagement Rate &amp; Konversi per bulan (%)', 'h-72', legendOf([['#2aa4ff', 'Engagement Rate'], ['#154472', 'Konversi']]))}
        ${ranked.length ? barList('Peringkat Peningkatan Brand', 'Skor = rata-rata peningkatan 4 metrik', ranked.map((r) => ({ label: r.name, v: r.score, text: fmtPct(r.score) }))) : ''}
      </div>
      <div class="mt-6">${chartCard('pc-2', 'Omzet per bulan', 'h-56')}</div>
      ${tableCard(kind, 'Peningkatan per Brand', 'Awal → akhir tiap brand pada periode terpilih. Klik judul kolom untuk mengurutkan.')}`
  } else {
    const t = A.totals
    const f = A.first
    const l = A.last
    kpis = [
      { label: 'Total Sesi Live', icon: 'Video', value: nf.format(t.sessions), pct: A.two ? pPct(l.sessions, f.sessions) : null, note: 'sesi bulan terakhir vs pertama', sub: `${t.talents} talent - ${pDec(t.hours, 1)} jam siaran` },
      { label: 'Rata-rata Penonton / Sesi', icon: 'Eye', value: nf.format(Math.round(t.avg)), pct: A.two ? pPct(l.avg, f.avg) : null, note: NOTE, sub: dash(Math.round(f.avg), Math.round(l.avg), (n) => nf.format(n)) },
      { label: 'Total Pesanan', icon: 'UserPlus', value: nf.format(t.orders), pct: A.two ? pPct(l.ordersPS, f.ordersPS) : null, note: 'pesanan/sesi, terakhir vs pertama', sub: dash(pDec(f.ordersPS, 1), pDec(l.ordersPS, 1), (n) => n) },
      { label: 'Total GMV', icon: 'TrendingUp', value: rpShort(t.gmv), pct: A.two ? pPct(l.gmvPS, f.gmvPS) : null, note: 'GMV/sesi, terakhir vs pertama', sub: dash(f.gmvPS, l.gmvPS, rpShort) },
    ]
    picCharts = [
      { id: 'pc-1', data: A.series, series: [{ key: 'avg', color: '#2aa4ff', name: 'Rata-rata Penonton' }, { key: 'peak', color: '#154472', name: 'Penonton Puncak' }], type: 'area' },
      { id: 'pc-2', data: A.series, series: [{ key: 'gmv', color: '#6ad8ef', name: 'GMV' }], type: 'bar' },
    ]
    charts = `
      <div class="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        ${chartCard('pc-1', 'Penonton per sesi (rata-rata bulanan)', 'h-72', legendOf([['#2aa4ff', 'Rata-rata Penonton'], ['#154472', 'Penonton Puncak']]))}
        ${barList('GMV per Talent', 'Total GMV pada periode terpilih', sortRows(A.table, { k: 'gmv', dir: -1 }).map((r) => ({ label: r.name, v: r.gmv, text: rpShort(r.gmv) })))}
      </div>
      <div class="mt-6">${chartCard('pc-2', 'GMV per bulan', 'h-56')}</div>
      ${tableCard(kind, 'Peringkat Talent', 'Bandingkan talent pada periode terpilih. Klik judul kolom untuk mengurutkan.')}`
  }
  return `${head}${warn}<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">${kpis.map(kpiCard).join('')}</div>${charts}${formulaNote(kind)}`
}

function picResults(kind) {
  const ds = picDataset(kind)
  const st = S.pic[kind]
  const sc = PIC[kind]
  const who = uniqSorted(ds.rows.map((r) => r[sc.whoKey]))
  if (st.who !== 'all' && !who.includes(st.who)) st.who = 'all'
  const n = uniqSorted(ds.rows.map((r) => r.period)).length
  const wins = [['all', 'Semua'], ['6', '6 Bulan'], ['3', '3 Bulan']]
  return `
  <div class="flex flex-wrap items-end justify-between gap-4">
    <h2 class="font-display text-2xl font-extrabold text-navy sm:text-3xl">${sc.resultTitle}</h2>
    <div class="flex flex-wrap items-center gap-3">
      <label for="pic-who" class="sr-only">Pilih ${sc.whoLabel}</label>
      <select id="pic-who" data-pic-filter="who" class="rounded-full border-2 border-mist bg-white px-4 py-2 text-sm font-bold text-navy outline-none transition focus:border-azure focus:ring-4 focus:ring-azure/20">
        <option value="all">${sc.whoAll}</option>
        ${who.map((w) => `<option value="${esc(w)}" ${st.who === w ? 'selected' : ''}>${esc(w)}</option>`).join('')}
      </select>
      <div role="tablist" aria-label="Rentang periode" class="flex rounded-full bg-mist p-1">
        ${wins.map(([id, label]) => `<button type="button" role="tab" data-act="pic-win" data-id="${id}" aria-selected="${st.win === id}" ${id !== 'all' && +id >= n ? 'disabled' : ''} class="rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${st.win === id ? 'bg-gradient-to-r from-sky to-azure text-white shadow' : 'text-ocean hover:bg-white'}">${label}</button>`).join('')}
      </div>
    </div>
  </div>
  <div id="pic-body" class="mt-3">${picBody(kind)}</div>`
}

/* ---------- Tampilan: unggah file ---------- */
const statusBox = (type, html) => {
  const cls = { ok: 'bg-mist text-ocean', warn: 'bg-amber-50 text-amber-800', error: 'bg-red-50 text-red-600', busy: 'bg-mist text-ocean' }[type]
  const icon = { ok: 'CheckCircle2', warn: 'AlertTriangle', error: 'AlertTriangle', busy: 'Loader2' }[type]
  return `<div class="flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${cls}"><span class="mt-0.5 shrink-0 ${type === 'busy' ? 'animate-spin' : ''}">${ic(icon, 18)}</span><div class="leading-relaxed">${html}</div></div>`
}

function sourceBadge(kind) {
  const s = picDataset(kind).source
  if (s.type === 'sample' && picStore[kind]) return `
    <div class="flex flex-wrap items-center gap-3">
      <span class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">${ic('Pencil', 16)} Data contoh (sudah diedit)</span>
      <button type="button" data-act="pic-reset" class="inline-flex items-center gap-2 rounded-full border-2 border-azure px-4 py-2 text-sm font-bold text-azure transition hover:bg-azure hover:text-white">${ic('RotateCcw', 14)} Kembalikan ke data contoh</button>
    </div>`
  if (s.type === 'sample') return `<span class="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-bold text-ocean">${ic('Info', 16)} Menampilkan data contoh</span>`
  return `
    <div class="flex flex-wrap items-center gap-3">
      <span class="inline-flex max-w-full items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-bold text-ocean">${ic(/pdf$/i.test(s.name) ? 'FileText' : 'FileSpreadsheet', 16)} <span class="truncate">${esc(s.name)}</span> - ${nf.format(s.count)} baris</span>
      <button type="button" data-act="pic-reset" class="inline-flex items-center gap-2 rounded-full border-2 border-azure px-4 py-2 text-sm font-bold text-azure transition hover:bg-azure hover:text-white">${ic('Trash2', 14)} Hapus &amp; pakai data contoh</button>
    </div>`
}

function formatGuide(kind) {
  const sc = PIC[kind]
  return `
  <details class="group mt-6 rounded-2xl bg-mist/50 p-5">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-navy">Format data yang dibutuhkan <span class="transition group-open:rotate-180">${ic('ChevronDown', 18)}</span></summary>
    <div class="mt-4 overflow-x-auto">
      <table class="w-full min-w-[620px] text-left text-sm">
        <thead><tr class="border-b-2 border-mist text-deep/70"><th class="px-3 py-2 font-bold">Kolom</th><th class="px-3 py-2 font-bold">Tipe data</th><th class="px-3 py-2 font-bold">Aturan isi</th><th class="px-3 py-2 font-bold">Contoh</th></tr></thead>
        <tbody>
          ${sc.cols.map((c) => `<tr class="border-b border-white"><td class="px-3 py-2 font-bold text-navy">${esc(c.label)}${c.req ? '' : ' <span class="text-xs font-normal text-deep/60">(opsional)</span>'}</td><td class="px-3 py-2">${c.typeLabel}</td><td class="px-3 py-2 text-deep/80">${c.rule}</td><td class="px-3 py-2 font-bold text-ocean">${typeof c.ex === 'number' && c.type === 'dec' ? pDec(c.ex) : esc(c.ex)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <ul class="mt-4 list-disc space-y-1.5 pl-5 text-sm text-deep/80">
      <li>Baris pertama berisi judul kolom persis seperti di atas (urutan kolom bebas). Satu baris = satu ${kind === 'live' ? 'sesi live' : 'brand pada satu periode'}.</li>
      <li>Angka tanpa simbol. Titik ribuan (52.000) dan koma desimal (4,35) maupun titik desimal (4.35) sama-sama dikenali. Tanda "Rp" dan "%" otomatis diabaikan.</li>
      <li>Butuh minimal 2 periode berbeda agar peningkatan dapat dihitung.</li>
      <li>File PDF harus berisi teks yang dapat dipilih (bukan hasil scan), dengan tabel yang judul kolomnya satu baris. Gunakan contoh PDF sebagai acuan.</li>
    </ul>
  </details>`
}

function uploadCard(kind) {
  const sc = PIC[kind]
  return `
  <div class="rounded-[2rem] border border-mist bg-white p-6 shadow-sm sm:p-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="font-display text-2xl font-extrabold text-navy">Unggah Data untuk Dianalisis</h2>
        <p class="mt-1 text-deep/70">Format PDF atau Excel. Sistem menghitung peningkatannya otomatis.</p>
      </div>
      <div id="pic-source">${sourceBadge(kind)}</div>
    </div>
    <div class="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <label data-drop="${kind}" for="pic-file" class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-sky bg-mist/40 p-8 text-center transition hover:border-azure hover:bg-mist focus-within:ring-4 focus-within:ring-azure/20 [&.drag]:border-azure [&.drag]:bg-mist">
        <span class="grid size-14 place-items-center rounded-full bg-gradient-to-r from-sky to-azure text-white shadow-lg shadow-cyan/30">${ic('Upload', 24)}</span>
        <span class="font-display text-lg font-extrabold text-navy">Tarik file ke sini atau klik untuk memilih</span>
        <span class="text-sm text-deep/70">PDF atau Excel (.xlsx / .xls), maksimal 10 MB</span>
        <input id="pic-file" data-pic-file="${kind}" type="file" accept=".xlsx,.xls,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" class="sr-only" />
      </label>
      <div class="flex flex-col justify-center gap-3">
        <p class="text-sm font-bold text-navy">Belum punya format datanya?</p>
        <a href="templates/template-${sc.file}.xlsx" download class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky to-azure px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan/30 transition hover:-translate-y-0.5 hover:shadow-xl">${ic('FileSpreadsheet', 18)} Unduh Template Excel</a>
        <a href="templates/contoh-${sc.file}.pdf" download class="inline-flex items-center justify-center gap-2 rounded-full border-2 border-azure px-6 py-3 text-sm font-bold text-azure transition hover:bg-azure hover:text-white">${ic('FileText', 18)} Unduh Contoh PDF</a>
      </div>
    </div>
    <div id="pic-status" role="status" aria-live="polite" class="mt-5 empty:hidden"></div>
    ${formatGuide(kind)}
  </div>`
}

/* ---------- Halaman ---------- */
function picSection(kind) {
  const sc = PIC[kind]
  Object.assign(S.pic[kind], { tab: 'data', edit: false, page: 0, q: '', undo: [] })
  return `
  <section class="bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-16 pt-36 text-white">
    <div class="mx-auto max-w-[1300px]">
      ${backLinkDark('#/pic')}
      <p class="text-sm font-bold uppercase tracking-widest text-sky">Portal PIC</p>
      <h1 class="mt-2 font-display text-4xl font-extrabold sm:text-5xl">${sc.title}</h1>
      <p class="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">${sc.desc}</p>
    </div>
  </section>
  <section class="mx-auto max-w-[1300px] px-6 py-12">
    <div id="pic-upload">${uploadCard(kind)}</div>
    <div id="pic-results" class="mt-12">${picResults(kind)}</div>
    <div id="pic-data">${dataPanel(kind)}</div>
    <div class="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-mist p-8">
      <p class="font-display text-xl font-extrabold text-navy">Selesai melihat analisis ini?</p>
      <a href="#/pic" class="inline-flex items-center gap-2 rounded-full border-2 border-azure px-7 py-3.5 font-bold text-azure transition hover:bg-azure hover:text-white">${ic('ArrowLeft', 18)} Kembali ke Beranda</a>
    </div>
  </section>`
}

function picHome() {
  const home = { who: 'all', win: 'all' }
  const p = analyzePortofolio(picDataset('portofolio').rows, home)
  const f = analyzePerforma(picDataset('performa').rows, home)
  const l = analyzeLive(picDataset('live').rows, home)
  const scores = f.table.map((r) => r.score).filter((x) => x != null)
  const cards = [
    { kind: 'portofolio', stat: `${compact(p.kpi.views.total)} views`, pct: p.kpi.views.pct, label: 'peningkatan views' },
    { kind: 'performa', stat: scores.length ? fmtPct(scores.reduce((a, c) => a + c, 0) / scores.length) : '-', pct: null, label: 'rata-rata skor peningkatan brand' },
    { kind: 'live', stat: rpShort(l.totals.gmv), pct: l.two ? pPct(l.last.gmvPS, l.first.gmvPS) : null, label: 'peningkatan GMV per sesi' },
  ]
  const steps = [['Unduh template', 'Isi data sesuai kolom pada template Excel.'], ['Unggah PDF atau Excel', 'Tarik file ke area unggah pada menu analisis.'], ['Lihat peningkatannya', 'Sistem menghitung dan menampilkan grafik otomatis.']]
  return `
  <section class="bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-24 pt-36 text-white">
    <div class="mx-auto max-w-[1300px]">
      <p class="text-sm font-bold uppercase tracking-widest text-sky">Portal PIC${account && account.jabatan ? ' - ' + esc(account.jabatan) : ''}</p>
      <h1 class="mt-2 font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl">Halo, ${esc(account ? account.name.split(' ')[0] : 'PIC')}</h1>
      <p class="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">Pantau cakupan portofolio, peningkatan performa brand, dan analisis live talent dalam satu tempat.</p>
    </div>
  </section>
  <section class="mx-auto -mt-12 max-w-[1300px] px-6 pb-16">
    <div class="grid gap-6 md:grid-cols-3">
      ${cards.map((c) => {
        const sc = PIC[c.kind]
        return `
        <a href="#/pic/${sc.slug}" class="group flex flex-col rounded-[2rem] bg-white p-7 shadow-xl shadow-deep/10 transition hover:-translate-y-1.5 hover:shadow-2xl">
          <span class="grid size-14 place-items-center rounded-2xl bg-gradient-to-r from-sky to-azure text-white shadow-lg shadow-cyan/30">${ic(sc.icon, 26)}</span>
          <h2 class="mt-5 font-display text-2xl font-extrabold text-navy">${sc.title}</h2>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-deep/70">${sc.desc}</p>
          <div class="mt-5 rounded-2xl bg-mist/60 px-4 py-3">
            <p class="font-display text-2xl font-extrabold text-navy">${c.stat}</p>
            <p class="text-xs font-bold text-ocean">${c.pct != null ? fmtPct(c.pct) + ' ' : ''}${c.label}</p>
          </div>
          <span class="mt-5 inline-flex items-center gap-2 font-bold text-azure">Buka analisis <span class="transition group-hover:translate-x-1">${ic('ArrowRight', 18)}</span></span>
        </a>`
      }).join('')}
    </div>
    <div class="mt-12 rounded-[2rem] bg-mist p-8">
      <h2 class="font-display text-xl font-extrabold text-navy">Cara memakai</h2>
      <ol class="mt-5 grid gap-5 sm:grid-cols-3">
        ${steps.map(([t, d], i) => `<li class="flex gap-4"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-sky to-azure font-extrabold text-white">${i + 1}</span><div><p class="font-bold text-navy">${t}</p><p class="text-sm text-deep/70">${d}</p></div></li>`).join('')}
      </ol>
      <p class="mt-5 text-xs text-deep/60">Data yang ditampilkan saat ini berupa contoh sampai Anda mengunggah file. File diproses di browser Anda dan tidak dikirim ke server.</p>
    </div>
  </section>`
}

/* ---------- Grafik: ukur semua dulu, baru gambar (hindari layout berulang) ---------- */
function drawPicCharts() {
  const jobs = picCharts.map((c) => ({ c, el: document.getElementById(c.id) })).filter((j) => j.el)
  const sizes = jobs.map((j) => ({ W: j.el.clientWidth, H: j.el.clientHeight }))
  jobs.forEach((j, i) => drawChart(j.el, j.c.data, j.c.series, j.c.type, { ...sizes[i], fmt: j.c.fmt }))
}

/* ---------- Interaksi ---------- */
const picKind = () => {
  const r = parseRoute()
  return r.kind === 'picsec' ? r.slug : null
}

const setStatus = (type, html) => {
  const el = $('#pic-status')
  if (el) el.innerHTML = html ? statusBox(type, html) : ''
}

function refreshPic(kind) {
  $('#pic-source').innerHTML = sourceBadge(kind)
  $('#pic-results').innerHTML = picResults(kind)
  const pd = $('#pic-data')
  if (pd) pd.innerHTML = dataPanel(kind)
  drawPicCharts()
}

let picBusy = false
async function handlePicFile(kind, file) {
  if (!file || picBusy || picKind() !== kind) return
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (!['xlsx', 'xls', 'pdf'].includes(ext)) return setStatus('error', 'Format tidak didukung. Unggah file <b>PDF</b> atau <b>Excel (.xlsx / .xls)</b>.')
  if (file.size > 10 * 1024 * 1024) return setStatus('error', 'Ukuran file melebihi 10 MB.')
  picBusy = true
  setStatus('busy', `Membaca <b>${esc(file.name)}</b>...`)
  try {
    const res = await (ext === 'pdf' ? readPdf : readExcel)(file, PIC[kind])
    if (picKind() !== kind) return
    const rows = res.rows.map((r, i) => ({ id: i + 1, ...r }))
    const by = account ? account.name : '-'
    picStore[kind] = {
      rows, orig: rows.map((r) => ({ ...r })), nextId: rows.length + 1,
      source: { type: 'file', name: file.name, at: wib(), by, count: rows.length, skipped: res.skipped, skips: res.skips },
      log: [{ t: Date.now(), by, a: 'unggah', label: file.name, to: `${rows.length} baris terbaca, ${res.skipped} dilewati` }],
    }
    S.pic[kind].undo = []
    S.pic[kind].edit = false
    savePicStore()
    refreshPic(kind)
    const periods = uniqSorted(res.rows.map((r) => r.period)).length
    const entities = new Set(res.rows.map((r) => r[PIC[kind].whoKey])).size
    let msg = `Berhasil membaca <b>${nf.format(res.rows.length)} baris</b> dari ${esc(file.name)} (${entities} ${PIC[kind].whoLabel}, ${periods} periode). Analisis sudah diperbarui di bawah.`
    if (periods < 2) msg += ' Catatan: baru ada 1 periode, peningkatan belum dapat dihitung.'
    if (res.skipped) msg += `<br>${res.skipped} baris dilewati (${res.warns.map(esc).join('; ')}).`
    setStatus(res.skipped || periods < 2 ? 'warn' : 'ok', msg)
  } catch (e) {
    setStatus('error', esc(e && e.message ? e.message : 'File tidak dapat dibaca.'))
  } finally {
    picBusy = false
  }
}

const picActions = {
  'pic-win': (el) => {
    const kind = picKind()
    if (!kind || el.disabled) return
    S.pic[kind].win = el.dataset.id
    $$('[data-act="pic-win"]').forEach((b) => {
      const on = b === el
      b.setAttribute('aria-selected', String(on))
      ;['bg-gradient-to-r', 'from-sky', 'to-azure', 'text-white', 'shadow'].forEach((c) => b.classList.toggle(c, on))
      ;['text-ocean', 'hover:bg-white'].forEach((c) => b.classList.toggle(c, !on))
    })
    $('#pic-body').innerHTML = picBody(kind)
    drawPicCharts()
    picDataSync(kind)
  },
  'pic-sort': (el) => {
    const kind = picKind()
    if (!kind) return
    const s = S.pic[kind].sort
    const k = el.dataset.k
    S.pic[kind].sort = { k, dir: s.k === k ? -s.dir : k === 'name' ? 1 : -1 }
    $('#pic-table').innerHTML = tableHtml(kind)
    $(`[data-act="pic-sort"][data-k="${k}"]`)?.focus()
  },
}

document.addEventListener('change', (e) => {
  const t = e.target
  if (!(t instanceof HTMLElement)) return
  if (t.matches('input[data-pic-file]')) {
    const f = t.files && t.files[0]
    handlePicFile(t.dataset.picFile, f)
    t.value = ''
  } else if (t.matches('[data-pic-filter]')) {
    const kind = picKind()
    if (!kind) return
    S.pic[kind][t.dataset.picFilter] = t.value
    $('#pic-body').innerHTML = picBody(kind)
    drawPicCharts()
    picDataSync(kind)
  }
})

const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')
document.addEventListener('dragover', (e) => {
  if (!hasFiles(e) || !picKind()) return
  e.preventDefault()
  const z = e.target.closest && e.target.closest('[data-drop]')
  if (z) z.classList.add('drag')
})
document.addEventListener('dragleave', (e) => {
  const z = e.target.closest && e.target.closest('[data-drop]')
  if (z && !z.contains(e.relatedTarget)) z.classList.remove('drag')
})
document.addEventListener('drop', (e) => {
  if (!hasFiles(e) || !picKind()) return
  e.preventDefault() // cegah browser membuka file dan meninggalkan halaman
  const z = e.target.closest && e.target.closest('[data-drop]')
  if (z) {
    z.classList.remove('drag')
    handlePicFile(z.dataset.drop, e.dataTransfer.files[0])
  }
})
