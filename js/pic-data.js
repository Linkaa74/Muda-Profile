/* Portal PIC: lihat & edit data, telusur perhitungan, riwayat perubahan, ekspor Excel.
   Prinsip transparansi: angka di dasbor selalu berasal dari data yang terlihat di tabel ini,
   setiap perubahan dicatat (hanya bisa bertambah), dan perbedaan dengan file sumber selalu ditampilkan. */

const PAGE_SIZE = 20
const LOG_MAX = 500
const ANALYZE = { portofolio: analyzePortofolio, performa: analyzePerforma, live: analyzeLive }
const TAB_ON = 'bg-gradient-to-r from-sky to-azure text-white shadow'
const BTN_OUT = 'inline-flex items-center gap-2 rounded-full border-2 border-azure px-5 py-2.5 text-sm font-bold text-azure transition hover:bg-azure hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-azure'
const fmtDT = (t) => new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })

const FMT = { int: (v) => nf.format(Math.round(v)), rate: (v) => `${pDec(v)}%`, rp: (v) => rpFull(v), d1: (v) => pDec(v, 1) }
const CALC = {
  portofolio: {
    agg: 'Nilai tiap periode adalah jumlah seluruh baris pada periode itu (untuk brand terpilih, atau semua brand).',
    cols: [['views', 'Views', 'int'], ['reach', 'Jangkauan', 'int'], ['visits', 'Kunjungan Profil', 'int'], ['followers', 'Follower Baru', 'int']],
  },
  performa: {
    agg: 'Follower dan Omzet dijumlahkan antar brand. Engagement Rate dan Konversi memakai rata-rata sederhana antar brand pada periode itu.',
    cols: [['followers', 'Follower', 'int'], ['er', 'Engagement Rate', 'rate'], ['conv', 'Konversi', 'rate'], ['revenue', 'Omzet', 'rp']],
  },
  live: {
    agg: 'Nilai tiap bulan dihitung per sesi: rata-rata penonton adalah rata-rata seluruh sesi pada bulan itu; Pesanan/sesi dan GMV/sesi adalah total bulan itu dibagi jumlah sesi.',
    cols: [['sessions', 'Jumlah Sesi', 'int'], ['avg', 'Rata-rata Penonton', 'int'], ['ordersPS', 'Pesanan / Sesi', 'd1'], ['gmvPS', 'GMV / Sesi', 'rp']],
  },
}

/* ---------- Data: akses tulis, riwayat, selisih dengan sumber ---------- */
const showVal = (c, v) => (c.type === 'int' ? nf.format(v) : c.type === 'dec' ? pDec(v) : esc(v))
const plainVal = (c, v) => (c.type === 'int' ? nf.format(v) : c.type === 'dec' ? pDec(v) : String(v))
const inputVal = (c, v) => (c.type === 'dec' ? pDec(v) : String(v))
const rowLabel = (kind, r) => `${r[PIC[kind].whoKey]} - ${kind === 'live' ? r.date : r.period}`
const snapshot = (kind, r) => PIC[kind].cols.map((c) => `${c.label}: ${plainVal(c, r[c.k])}`).join(', ')

function writable(kind) {
  if (!picStore[kind]) {
    const rows = sampleRows(kind).map((r) => ({ ...r }))
    picStore[kind] = { rows, nextId: rows.length + 1, source: { type: 'sample' }, log: [] }
  }
  return picStore[kind]
}

function logAdd(w, e) {
  w.log.push({ t: Date.now(), by: account ? account.name : '-', ...e })
  if (w.log.length > LOG_MAX) {
    w.trimmed = (w.trimmed || 0) + w.log.length - LOG_MAX
    w.log.splice(0, w.log.length - LOG_MAX)
  }
}

function diffSummary(kind) {
  const om = new Map(origRows(kind).map((r) => [r.id, r]))
  const seen = new Set()
  let cells = 0
  let added = 0
  for (const r of picDataset(kind).rows) {
    seen.add(r.id)
    const o = om.get(r.id)
    if (!o) { added++; continue }
    for (const c of PIC[kind].cols) if (r[c.k] !== o[c.k]) cells++
  }
  let deleted = 0
  for (const id of om.keys()) if (!seen.has(id)) deleted++
  return { cells, added, deleted, total: cells + added + deleted }
}

function editCell(kind, id, k, raw) {
  const sc = PIC[kind]
  const col = sc.cols.find((c) => c.k === k)
  const res = coerce(col, raw)
  if (!res.ok) return res
  const w = writable(kind)
  const row = w.rows.find((r) => r.id === id)
  if (!row) return { ok: false, err: 'Baris tidak ditemukan.' }
  if (row[k] === res.v) return { ok: true, same: true, v: res.v }
  const from = row[k]
  row[k] = res.v
  if (kind === 'live' && k === 'date') row.period = res.v.slice(0, 7)
  logAdd(w, { a: 'ubah', id, label: rowLabel(kind, row), k: col.label, from: plainVal(col, from), to: plainVal(col, res.v) })
  S.pic[kind].undo.push({ type: 'set', id, k, val: from })
  return { ok: true, v: res.v }
}

/* Setelah data berubah: simpan, hitung ulang analisis, perbarui label sumber & kualitas */
function afterData(kind) {
  savePicStore()
  $('#pic-results').innerHTML = picResults(kind)
  $('#pic-source').innerHTML = sourceBadge(kind)
  $('#pic-prov').innerHTML = provHtml(kind)
  $('#pic-tabs').innerHTML = tabsHtml(kind)
  drawPicCharts()
  const u = $('[data-act="pic-undo"]')
  if (u) u.disabled = !S.pic[kind].undo.length
}

function picDataSync(kind) {
  const b = $('#pic-tabbody')
  if (S.pic[kind].tab === 'hitung' && b) b.innerHTML = calcTabHtml(kind)
}

/* ---------- Tampilan: sumber & kualitas data ---------- */
function provHtml(kind) {
  const ds = picDataset(kind)
  const s = ds.source
  const sc = PIC[kind]
  const d = diffSummary(kind)
  const sample = s.type === 'sample'
  const tile = (label, val, sub = '') => `<div class="rounded-2xl bg-mist/50 px-4 py-3"><p class="text-xs font-bold text-deep/60">${label}</p><p class="mt-0.5 break-words font-bold text-navy">${val}</p>${sub ? `<p class="text-xs text-deep/60">${sub}</p>` : ''}</div>`
  const periods = uniqSorted(ds.rows.map((r) => r.period)).length
  const ents = new Set(ds.rows.map((r) => r[sc.whoKey])).size
  const skips = s.skips || []
  const skipHtml = !sample && s.skipped
    ? `<details class="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <summary class="cursor-pointer font-bold">${nf.format(s.skipped)} baris dilewati saat membaca file (klik untuk melihat alasannya)</summary>
        <ul class="mt-2 list-disc space-y-1 pl-5">${skips.map((x) => `<li>Baris ${x.row}: ${esc(x.why)}</li>`).join('')}${s.skipped > skips.length ? `<li>...dan ${s.skipped - skips.length} baris lainnya</li>` : ''}</ul>
        <p class="mt-2">Baris yang dilewati tidak ikut dihitung. Jika perlu, tambahkan kembali lewat Mode Edit.</p>
      </details>`
    : ''
  return `
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      ${tile('Sumber data', sample ? 'Data contoh (ilustrasi)' : esc(s.name), sample ? 'Dibuat otomatis oleh sistem' : `Diunggah ${esc(s.at)} oleh ${esc(s.by || '-')}`)}
      ${tile('Baris data', `${nf.format(ds.rows.length)} baris`, sample ? '' : `${nf.format(s.count)} terbaca dari file, ${nf.format(s.skipped || 0)} dilewati`)}
      ${tile('Cakupan', `${ents} ${sc.whoLabel}, ${periods} periode`)}
      ${tile('Perubahan dari sumber', d.total ? `${d.total} perubahan` : 'Tidak ada', d.total ? `${d.cells} sel diubah, ${d.added} baris ditambah, ${d.deleted} baris dihapus` : 'Data sama dengan sumber')}
    </div>${skipHtml}`
}

/* ---------- Tampilan: tab Data (lihat & edit) ---------- */
function filteredRows(kind) {
  const q = (S.pic[kind].q || '').trim().toLowerCase()
  const rows = picDataset(kind).rows
  if (!q) return rows
  return rows.filter((r) => PIC[kind].cols.some((c) => String(r[c.k]).toLowerCase().includes(q)))
}

function rowsHtml(kind) {
  const st = S.pic[kind]
  const sc = PIC[kind]
  const all = filteredRows(kind)
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  st.page = Math.max(0, Math.min(st.page, pages - 1))
  const from = st.page * PAGE_SIZE
  const slice = all.slice(from, from + PAGE_SIZE)
  const om = new Map(origRows(kind).map((r) => [r.id, r]))
  if (!all.length) return `<p class="rounded-2xl bg-mist/60 p-6 text-center font-bold text-ocean">${picDataset(kind).rows.length ? 'Tidak ada baris yang cocok dengan pencarian.' : 'Belum ada data. Aktifkan Mode Edit lalu tambah baris, atau unggah file.'}</p>`
  const cell = (c, r) => {
    const o = om.get(r.id)
    const isNew = !o
    const changed = !!o && o[c.k] !== r[c.k]
    const tip = isNew ? 'Baris baru (tidak ada di file sumber)' : changed ? `Nilai asli: ${plainVal(c, o[c.k])}` : ''
    const body = st.edit
      ? `<input data-pic-cell data-id="${r.id}" data-k="${c.k}" value="${esc(inputVal(c, r[c.k]))}" inputmode="${c.type === 'int' || c.type === 'dec' ? 'decimal' : 'text'}" aria-label="${esc(c.label)}, baris ${r.id}" class="w-full min-w-[96px] rounded-lg border border-mist bg-white px-2 py-1.5 text-sm outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/20 ${c.type === 'int' || c.type === 'dec' ? 'text-right' : ''}" />`
      : showVal(c, r[c.k])
    return `<td title="${esc(tip)}" class="${st.edit ? 'px-2 py-1.5' : 'px-3 py-2.5'} ${c.type === 'int' || c.type === 'dec' ? 'text-right' : ''} ${isNew ? 'bg-mist' : changed ? 'bg-amber-50' : ''}">${body}</td>`
  }
  return `
  <div class="relative overflow-x-auto rounded-2xl border border-mist">
    <table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-mist/50 text-deep/70"><tr>
        <th scope="col" class="px-3 py-3 font-bold">#</th>
        ${sc.cols.map((c) => `<th scope="col" class="px-3 py-3 font-bold ${c.type === 'int' || c.type === 'dec' ? 'text-right' : ''}">${esc(c.label)}</th>`).join('')}
        ${st.edit ? '<th scope="col" class="px-3 py-3 font-bold"><span class="sr-only">Aksi</span></th>' : ''}
      </tr></thead>
      <tbody>
        ${slice.map((r) => `<tr class="border-t border-mist/70 transition hover:bg-mist/30"><td class="px-3 py-2.5 text-xs text-deep/50">${r.id}</td>${sc.cols.map((c) => cell(c, r)).join('')}${st.edit ? `<td class="px-2 py-1.5 text-right"><button type="button" data-act="pic-del-row" data-id="${r.id}" aria-label="Hapus baris ${r.id}" class="inline-grid size-8 place-items-center rounded-full text-red-600 transition hover:bg-red-50">${ic('Trash2', 16)}</button></td>` : ''}</tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-deep/70">
    <span>Menampilkan ${nf.format(from + 1)}-${nf.format(from + slice.length)} dari ${nf.format(all.length)} baris. <span class="inline-block size-3 rounded bg-amber-50 align-middle ring-1 ring-amber-200"></span> nilai diubah, <span class="inline-block size-3 rounded bg-mist align-middle ring-1 ring-sky/40"></span> baris baru.</span>
    <span class="flex items-center gap-2">
      <button type="button" data-act="pic-page" data-d="-1" ${st.page === 0 ? 'disabled' : ''} aria-label="Halaman sebelumnya" class="grid size-9 place-items-center rounded-full border-2 border-mist text-azure transition hover:bg-mist disabled:opacity-40">${ic('ChevronLeft', 16)}</button>
      <span class="font-bold text-navy">${st.page + 1} / ${pages}</span>
      <button type="button" data-act="pic-page" data-d="1" ${st.page >= pages - 1 ? 'disabled' : ''} aria-label="Halaman berikutnya" class="grid size-9 place-items-center rounded-full border-2 border-mist text-azure transition hover:bg-mist disabled:opacity-40">${ic('ChevronRight', 16)}</button>
    </span>
  </div>`
}

function dataTabHtml(kind) {
  const st = S.pic[kind]
  const sc = PIC[kind]
  const sample = picDataset(kind).source.type === 'sample'
  const note = st.edit
    ? `<p class="flex items-start gap-3 rounded-2xl bg-mist/60 px-5 py-3 text-sm text-deep/80"><span class="mt-0.5 shrink-0 text-azure">${ic('Info', 18)}</span><span><b class="text-navy">Mode Edit aktif.</b> Ubah nilai langsung di tabel (tekan Enter atau pindah kolom untuk menyimpan). Setiap perubahan langsung menghitung ulang analisis dan dicatat di Riwayat.${sample ? ' Anda sedang mengedit <b>data contoh</b>.' : ''}</span></p>`
    : `<p class="flex items-start gap-3 rounded-2xl bg-mist/60 px-5 py-3 text-sm text-deep/80"><span class="mt-0.5 shrink-0 text-azure">${ic('Info', 18)}</span><span>Tabel ini adalah data persis yang dipakai untuk semua angka dan grafik di atas. Aktifkan <b class="text-navy">Mode Edit</b> untuk mengoreksi.</span></p>`
  return `
  ${note}
  <div class="mt-4 flex flex-wrap items-center gap-3">
    <label class="relative">
      <span class="sr-only">Cari data</span>
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-deep/50">${ic('Search', 16)}</span>
      <input id="pic-search" type="search" value="${esc(st.q)}" placeholder="Cari ${sc.whoLabel} atau periode..." class="w-64 rounded-full border-2 border-mist bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-azure focus:ring-4 focus:ring-azure/20" />
    </label>
    ${st.edit ? `
      <button type="button" data-act="pic-add-row" class="${BTN_OUT}">${ic('Plus', 16)} Tambah baris</button>
      <button type="button" data-act="pic-undo" ${st.undo.length ? '' : 'disabled'} class="${BTN_OUT}">${ic('Undo2', 16)} Urungkan</button>
      <button type="button" data-act="pic-restore" class="${BTN_OUT}">${ic('RotateCcw', 16)} Pulihkan ke sumber</button>` : ''}
  </div>
  <div id="pic-rows" class="mt-4">${rowsHtml(kind)}</div>`
}

/* ---------- Tampilan: tab Perhitungan (penelusuran angka) ---------- */
const plainTable = (head, body, rightFrom = 1) => `
  <div class="relative overflow-x-auto rounded-2xl border border-mist">
    <table class="w-full min-w-[640px] text-left text-sm">
      <thead class="bg-mist/50 text-deep/70"><tr>${head.map((h, i) => `<th scope="col" class="px-3 py-3 font-bold ${i >= rightFrom && rightFrom >= 0 ? 'text-right' : ''}">${h}</th>`).join('')}</tr></thead>
      <tbody>${body.map((r) => `<tr class="border-t border-mist/70 align-top">${r.map((c, i) => `<td class="px-3 py-2.5 ${i === 0 ? 'font-bold text-navy' : i >= rightFrom && rightFrom >= 0 ? 'text-right' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>`

function scopeCount(kind, rows, st) {
  const ps = new Set(pickWin(uniqSorted(rows.map((r) => r.period)), st.win))
  const key = PIC[kind].whoKey
  return rows.filter((r) => ps.has(r.period) && (st.who === 'all' || r[key] === st.who)).length
}

function entityHtml(kind, A) {
  const rows = [...A.table].sort((x, y) => x.name.localeCompare(y.name, 'id'))
  if (!rows.length) return ''
  const sc = PIC[kind]
  let head
  let body
  if (kind === 'performa') {
    head = ['Brand', 'Follower', 'Engagement Rate', 'Konversi', 'Omzet', 'Skor Peningkatan (rata-rata keempatnya)']
    body = rows.map((r) => {
      const g = [r.gr.followers, r.gr.er, r.gr.conv, r.gr.revenue]
      const v = g.filter((x) => x != null)
      return [esc(r.name), ...g.map((x) => fmtPct(x, 1)), v.length ? `<code>(${v.map((x) => pDec(x, 1)).join(' + ')}) / ${v.length} = ${fmtPct(r.score, 2)}</code>` : '-']
    })
    return plainTable(head, body, -1)
  }
  const live = kind === 'live'
  const fm = live ? FMT.rp : FMT.int
  head = [sc.whoLabel === 'talent' ? 'Talent' : 'Brand', 'Periode awal - akhir', live ? 'GMV/sesi awal' : 'Views awal', live ? 'GMV/sesi akhir' : 'Views akhir', 'Perhitungan']
  body = rows.map((r) => [
    esc(r.name),
    r.growth == null ? 'hanya 1 periode' : `${monthLabel(r.pa)} - ${monthLabel(r.pb)}`,
    fm(r.a), fm(r.b),
    r.growth == null ? '-' : `<code>(${fm(r.b)} - ${fm(r.a)}) / ${fm(r.a)} x 100 = ${fmtPct(r.growth, 2)}</code>`,
  ])
  return plainTable(head, body, 2)
}

function calcTabHtml(kind) {
  const st = S.pic[kind]
  const sc = PIC[kind]
  const ds = picDataset(kind)
  const spec = CALC[kind]
  const A = picView.kind === kind && picView.A ? picView.A : ANALYZE[kind](ds.rows, st)
  if (!A.series.length) return '<p class="rounded-2xl bg-mist/60 p-6 text-center font-bold text-ocean">Tidak ada data untuk pilihan filter saat ini.</p>'
  const changed = diffSummary(kind).total > 0
  const A0 = changed ? ANALYZE[kind](origRows(kind), st) : null
  const o0 = A0 && A0.series.length > 1 ? A0 : null
  const f = A.series[0]
  const l = A.series[A.series.length - 1]
  const two = A.series.length > 1
  const chips = [['Filter', st.who === 'all' ? sc.whoAll : esc(st.who)], ['Periode', `${f.label} - ${l.label} (${A.series.length} periode)`], ['Baris dipakai', `${nf.format(scopeCount(kind, ds.rows, st))} dari ${nf.format(ds.rows.length)} baris`]]
  const metric = spec.cols.map(([k, label, fk]) => {
    const fm = FMT[fk]
    const a = f[k]
    const b = l[k]
    const p = two ? pPct(b, a) : null
    const o = o0 ? pPct(o0.series[o0.series.length - 1][k], o0.series[0][k]) : null
    const formula = p == null ? (two ? 'Nilai awal 0, peningkatan tidak dapat dihitung' : 'Perlu minimal 2 periode') : `<code>(${fm(b)} - ${fm(a)}) / ${fm(a)} x 100 = ${fmtPct(p, 2)}</code>${fk === 'rate' ? `<div class="text-xs text-deep/60">Selisih: ${b - a >= 0 ? '+' : '-'}${pDec(Math.abs(b - a))} poin persentase</div>` : ''}`
    const row = [label, fm(a), fm(b), formula, gCell(p)]
    if (changed) row.push(o0 ? gCell(o, p == null || o == null ? '' : `beda ${p - o >= 0 ? '+' : '-'}${pDec(Math.abs(p - o))} poin`) : '-')
    return row
  })
  const mHead = ['Metrik', `Awal (${f.label})`, `Akhir (${l.label})`, 'Perhitungan', 'Peningkatan', ...(changed ? ['Dengan data asli'] : [])]
  const perPeriod = A.series.map((x) => [x.label, ...spec.cols.map(([k, , fk]) => FMT[fk](x[k]))])
  return `
  <div class="flex flex-wrap gap-2">${chips.map(([a, b]) => `<span class="rounded-full bg-mist px-4 py-1.5 text-sm"><span class="text-deep/60">${a}:</span> <b class="text-navy">${b}</b></span>`).join('')}</div>
  ${changed ? `<p class="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 px-5 py-3 text-sm text-amber-800"><span class="mt-0.5 shrink-0">${ic('AlertTriangle', 18)}</span><span>Data sudah berbeda dari file sumber, jadi kolom <b>Dengan data asli</b> ditampilkan sebagai pembanding.</span></p>` : ''}
  <h3 class="mt-6 font-display text-lg font-extrabold text-navy">1. Perhitungan peningkatan</h3>
  <p class="mb-3 text-sm text-deep/70">Rumus: (nilai akhir - nilai awal) / nilai awal x 100. Angka di bawah sama persis dengan kartu di atas.</p>
  ${plainTable(mHead, metric, 1)}
  <h3 class="mt-8 font-display text-lg font-extrabold text-navy">2. Nilai per periode (dasar grafik dan perhitungan)</h3>
  <p class="mb-3 text-sm text-deep/70">${spec.agg}</p>
  ${plainTable(['Periode', ...spec.cols.map((c) => c[1])], perPeriod, 1)}
  <h3 class="mt-8 font-display text-lg font-extrabold text-navy">3. Rincian per ${sc.whoLabel}</h3>
  <p class="mb-3 text-sm text-deep/70">Tiap ${sc.whoLabel} dibandingkan antara periode pertama dan terakhir miliknya sendiri pada rentang terpilih.</p>
  ${entityHtml(kind, A)}
  <p class="mt-6 text-xs text-deep/60">Tips: pilih ${sc.whoLabel} tertentu pada filter di atas untuk melihat bagian 1 dan 2 khusus untuk ${sc.whoLabel} tersebut.</p>`
}

/* ---------- Tampilan: tab Riwayat ---------- */
function logTabHtml(kind) {
  const ds = picDataset(kind)
  const names = { unggah: 'Unggah file', ubah: 'Ubah nilai', tambah: 'Tambah baris', hapus: 'Hapus baris', urungkan: 'Urungkan', pulihkan: 'Pulihkan ke sumber' }
  const info = `<p class="flex items-start gap-3 rounded-2xl bg-mist/60 px-5 py-3 text-sm text-deep/80"><span class="mt-0.5 shrink-0 text-azure">${ic('Info', 18)}</span><span>Riwayat bersifat tambah-saja: mengurungkan atau memulihkan data <b class="text-navy">tidak menghapus</b> catatan sebelumnya. Unduh Excel untuk menyimpan salinannya.</span></p>`
  if (!ds.log.length) return `${info}<p class="mt-4 rounded-2xl border border-mist p-6 text-center font-bold text-ocean">Belum ada perubahan. Data masih sama dengan sumbernya.</p>`
  const log = [...ds.log].reverse()
  const shown = log.slice(0, 100)
  const body = shown.map((e) => [fmtDT(e.t), esc(e.by), names[e.a] || e.a, `${esc(e.label || '')}${e.id ? ` <span class="text-xs text-deep/50">(#${e.id})</span>` : ''}`, esc(e.k || ''), e.a === 'ubah' || e.a === 'urungkan' ? `${esc(e.from)} → <b>${esc(e.to)}</b>` : esc(e.from || e.to || '')])
  return `${info}
  <div class="mt-4">${plainTable(['Waktu (WIB)', 'Oleh', 'Aksi', 'Baris', 'Kolom', 'Sebelum → Sesudah'], body, -1)}</div>
  <p class="mt-3 text-xs text-deep/60">Menampilkan ${shown.length} dari ${log.length} catatan terbaru${ds.trimmed ? `. ${ds.trimmed} catatan lama dipangkas karena batas penyimpanan` : ''}.</p>`
}

/* ---------- Tampilan: panel utama ---------- */
function tabsHtml(kind) {
  const st = S.pic[kind]
  const ds = picDataset(kind)
  const tabs = [['data', `Data (${nf.format(ds.rows.length)})`, 'FileSpreadsheet'], ['hitung', 'Perhitungan', 'BarChart3'], ['riwayat', `Riwayat (${ds.log.length})`, 'FileText']]
  return `<div role="tablist" aria-label="Bagian data" class="inline-flex flex-wrap rounded-3xl bg-mist p-1">${tabs.map(([id, label, icon]) => `<button type="button" role="tab" data-act="pic-tab" data-id="${id}" aria-selected="${st.tab === id}" class="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${st.tab === id ? TAB_ON : 'text-ocean hover:bg-white'}">${ic(icon, 15)} ${label}</button>`).join('')}</div>`
}

function tabBody(kind) {
  const t = S.pic[kind].tab
  return t === 'hitung' ? calcTabHtml(kind) : t === 'riwayat' ? logTabHtml(kind) : dataTabHtml(kind)
}

function dataPanel(kind) {
  const st = S.pic[kind]
  return `
  <section aria-labelledby="pic-data-title" class="mt-12 rounded-[2rem] border border-mist bg-white p-6 shadow-sm sm:p-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 id="pic-data-title" class="font-display text-2xl font-extrabold text-navy">Data &amp; Transparansi Perhitungan</h2>
        <p class="mt-1 max-w-2xl text-deep/70">Lihat data yang dipakai, ubah bila perlu, dan telusuri bagaimana setiap angka dihitung. Semua perubahan tercatat.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button type="button" data-act="pic-edit-toggle" aria-pressed="${st.edit}" class="${st.edit ? 'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky to-azure px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan/30 transition hover:-translate-y-0.5' : BTN_OUT}">${ic(st.edit ? 'Eye' : 'Pencil', 16)} ${st.edit ? 'Selesai Edit' : 'Mode Edit'}</button>
        <button type="button" data-act="pic-export" class="${BTN_OUT}">${ic('Download', 16)} Unduh Excel</button>
      </div>
    </div>
    <div id="pic-prov" class="mt-6">${provHtml(kind)}</div>
    <div id="pic-tabs" class="mt-6">${tabsHtml(kind)}</div>
    <div id="pic-tabbody" class="mt-6">${tabBody(kind)}</div>
  </section>`
}

/* ---------- Konfirmasi ---------- */
let confirmCb = null
function picConfirm(title, text, yes, cb) {
  confirmCb = cb
  document.body.insertAdjacentHTML('beforeend', `
  <div id="confirm-modal" class="fixed inset-0 z-50 grid place-items-center bg-deep/70 p-6 backdrop-blur-sm">
    <div role="alertdialog" aria-modal="true" aria-labelledby="pc-title" class="w-full max-w-sm animate-[fadeUp_.25s_ease-out] rounded-3xl bg-white p-7 text-center shadow-2xl">
      <h2 id="pc-title" class="font-display text-2xl font-extrabold text-navy">${title}</h2>
      <p class="mt-2 text-deep/70">${text}</p>
      <div class="mt-6 grid grid-cols-2 gap-3">
        <button id="confirm-no" data-act="confirm-no" class="rounded-full border-2 border-azure py-3 font-bold text-azure transition hover:bg-mist">Batal</button>
        <button data-act="pic-confirm-yes" class="rounded-full bg-gradient-to-r from-sky to-azure py-3 font-bold text-white transition hover:shadow-lg">${yes}</button>
      </div>
    </div>
  </div>`)
  $('#confirm-no').focus()
}

/* ---------- Ekspor Excel: data + perhitungan + riwayat + ringkasan ---------- */
async function exportXlsx(kind, btn) {
  const label = btn.innerHTML
  btn.disabled = true
  btn.textContent = 'Menyiapkan...'
  try {
    await loadScript('js/vendor/xlsx.full.min.js')
    const sc = PIC[kind]
    const ds = picDataset(kind)
    const st = S.pic[kind]
    const spec = CALC[kind]
    const A = picView.kind === kind && picView.A ? picView.A : ANALYZE[kind](ds.rows, st)
    const d = diffSummary(kind)
    const wb = XLSX.utils.book_new()
    const add = (name, aoa, widths) => {
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      if (widths) ws['!cols'] = widths.map((w) => ({ wch: w }))
      XLSX.utils.book_append_sheet(wb, ws, name)
    }
    add('Data', [sc.cols.map((c) => c.label), ...ds.rows.map((r) => sc.cols.map((c) => r[c.k]))], sc.cols.map((c) => Math.max(14, c.label.length + 4)))
    const f = A.series[0]
    const l = A.series[A.series.length - 1]
    const calc = [['Perhitungan peningkatan', `${sc.title} - filter: ${st.who === 'all' ? sc.whoAll : st.who}`], [], ['Metrik', f ? `Awal (${f.label})` : 'Awal', l ? `Akhir (${l.label})` : 'Akhir', 'Peningkatan (%)', 'Rumus']]
    if (f) {
      spec.cols.forEach(([k, name]) => {
        const p = A.two ? pPct(l[k], f[k]) : null
        calc.push([name, f[k], l[k], p == null ? '' : Math.round(p * 100) / 100, '(akhir - awal) / awal x 100'])
      })
      calc.push([], ['Nilai per periode'], ['Periode', ...spec.cols.map((c) => c[1])], ...A.series.map((x) => [x.label, ...spec.cols.map(([k]) => x[k])]))
    }
    add('Perhitungan', calc, [26, 18, 18, 18, 30])
    const names = { unggah: 'Unggah file', ubah: 'Ubah nilai', tambah: 'Tambah baris', hapus: 'Hapus baris', urungkan: 'Urungkan', pulihkan: 'Pulihkan ke sumber' }
    add('Riwayat', [['Waktu (WIB)', 'Oleh', 'Aksi', 'Baris', 'Kolom', 'Sebelum', 'Sesudah'], ...ds.log.map((e) => [fmtDT(e.t), e.by, names[e.a] || e.a, e.label || '', e.k || '', e.from || '', e.to || ''])], [22, 20, 18, 30, 20, 24, 24])
    const s = ds.source
    add('Ringkasan', [
      ['Analisis', sc.title], ['Sumber data', s.type === 'sample' ? 'Data contoh (ilustrasi)' : s.name], ['Diunggah', s.type === 'sample' ? '-' : `${s.at} oleh ${s.by || '-'}`],
      ['Baris saat ini', ds.rows.length], ['Baris dilewati saat membaca file', s.skipped || 0],
      ['Perubahan dari sumber', `${d.total} (${d.cells} sel diubah, ${d.added} baris ditambah, ${d.deleted} baris dihapus)`],
      ['Rumus peningkatan', sc.formula], ['Diekspor oleh', account ? (account.jabatan && account.jabatan !== account.name ? `${account.name} (${account.jabatan})` : account.name) : '-'], ['Diekspor pada', wib()],
    ], [34, 90])
    XLSX.writeFile(wb, `${sc.file}-${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast('File Excel berhasil dibuat.')
  } catch (e) {
    toast(e && e.message ? e.message : 'Gagal membuat file Excel.')
  } finally {
    btn.disabled = false
    btn.innerHTML = label
  }
}

/* ---------- Aksi ---------- */
const gotoTab = (kind, id) => {
  S.pic[kind].tab = id
  $('#pic-tabs').innerHTML = tabsHtml(kind)
  $('#pic-tabbody').innerHTML = tabBody(kind)
}

Object.assign(picActions, {
  'pic-tab': (el) => {
    const kind = picKind()
    if (kind) gotoTab(kind, el.dataset.id)
  },
  'pic-open-tab': (el) => {
    const kind = picKind()
    if (!kind) return
    gotoTab(kind, el.dataset.id)
    $('#pic-data').scrollIntoView({ behavior: smooth, block: 'start' })
  },
  'pic-edit-toggle': () => {
    const kind = picKind()
    if (!kind) return
    const st = S.pic[kind]
    st.edit = !st.edit
    st.undo = []
    st.tab = 'data'
    $('#pic-data').innerHTML = dataPanel(kind)
  },
  'pic-page': (el) => {
    const kind = picKind()
    if (!kind) return
    S.pic[kind].page += +el.dataset.d
    $('#pic-rows').innerHTML = rowsHtml(kind)
  },
  'pic-add-row': () => {
    const kind = picKind()
    if (!kind) return
    const sc = PIC[kind]
    const w = writable(kind)
    if (w.rows.length >= MAX_ROWS) return toast(`Maksimal ${nf.format(MAX_ROWS)} baris.`)
    const base = w.rows.length ? w.rows[w.rows.length - 1] : { ...Object.fromEntries(sc.cols.map((c) => [c.k, c.ex])), period: kind === 'live' ? '2026-01' : undefined }
    const row = { ...base, id: w.nextId++ }
    if (kind === 'live') row.period = String(row.date).slice(0, 7)
    w.rows.push(row)
    logAdd(w, { a: 'tambah', id: row.id, label: rowLabel(kind, row), to: snapshot(kind, row) })
    S.pic[kind].undo.push({ type: 'del', id: row.id })
    S.pic[kind].q = ''
    S.pic[kind].page = 1e9
    afterData(kind)
    $('#pic-rows').innerHTML = rowsHtml(kind)
    const inp = $(`[data-pic-cell][data-id="${row.id}"]`)
    if (inp) inp.focus()
    toast('Baris baru disalin dari baris terakhir. Ubah nilainya sesuai kebutuhan.')
  },
  'pic-del-row': (el) => {
    const kind = picKind()
    if (!kind) return
    const w = writable(kind)
    const id = +el.dataset.id
    const idx = w.rows.findIndex((r) => r.id === id)
    if (idx < 0) return
    const [row] = w.rows.splice(idx, 1)
    logAdd(w, { a: 'hapus', id, label: rowLabel(kind, row), from: snapshot(kind, row) })
    S.pic[kind].undo.push({ type: 'ins', row, idx })
    afterData(kind)
    $('#pic-rows').innerHTML = rowsHtml(kind)
    toast('Baris dihapus. Klik "Urungkan" untuk membatalkan.')
  },
  'pic-undo': () => {
    const kind = picKind()
    if (!kind) return
    const st = S.pic[kind]
    const op = st.undo.pop()
    if (!op) return
    const w = writable(kind)
    if (op.type === 'set') {
      const row = w.rows.find((r) => r.id === op.id)
      if (row) {
        const col = PIC[kind].cols.find((c) => c.k === op.k)
        const cur = row[op.k]
        row[op.k] = op.val
        if (kind === 'live' && op.k === 'date') row.period = String(op.val).slice(0, 7)
        logAdd(w, { a: 'urungkan', id: op.id, label: rowLabel(kind, row), k: col.label, from: plainVal(col, cur), to: plainVal(col, op.val) })
      }
    } else if (op.type === 'del') {
      const idx = w.rows.findIndex((r) => r.id === op.id)
      if (idx >= 0) {
        const [row] = w.rows.splice(idx, 1)
        logAdd(w, { a: 'urungkan', id: row.id, label: rowLabel(kind, row), k: 'Baris', from: 'ditambahkan', to: 'dihapus' })
      }
    } else if (op.type === 'ins') {
      w.rows.splice(op.idx, 0, op.row)
      logAdd(w, { a: 'urungkan', id: op.row.id, label: rowLabel(kind, op.row), k: 'Baris', from: 'dihapus', to: 'dikembalikan' })
    }
    afterData(kind)
    $('#pic-rows').innerHTML = rowsHtml(kind)
  },
  'pic-restore': () => {
    const kind = picKind()
    if (!kind) return
    picConfirm('Pulihkan ke data sumber?', 'Semua perubahan manual akan dibatalkan dan data kembali sama dengan sumbernya. Catatan riwayat tetap tersimpan.', 'Pulihkan', () => {
      const w = writable(kind)
      const d = diffSummary(kind)
      w.rows = origRows(kind).map((r) => ({ ...r }))
      w.nextId = w.rows.reduce((m, r) => Math.max(m, r.id), 0) + 1
      logAdd(w, { a: 'pulihkan', label: 'Seluruh data dikembalikan ke sumber', from: `${d.total} perubahan dibatalkan` })
      S.pic[kind].undo = []
      afterData(kind)
      $('#pic-rows').innerHTML = rowsHtml(kind)
      toast('Data dipulihkan ke sumber.')
    })
  },
  'pic-reset': () => {
    const kind = picKind()
    if (!kind) return
    picConfirm('Hapus data ini?', 'Data yang diunggah beserta riwayat perubahannya akan dihapus dan tampilan kembali ke data contoh. Unduh Excel dulu bila perlu.', 'Hapus', () => {
      delete picStore[kind]
      savePicStore()
      Object.assign(S.pic[kind], { edit: false, undo: [], q: '', page: 0, tab: 'data' })
      refreshPic(kind)
      setStatus('ok', 'Data dihapus. Menampilkan data contoh.')
    })
  },
  'pic-confirm-yes': () => {
    const m = $('#confirm-modal')
    if (m) m.remove()
    const f = confirmCb
    confirmCb = null
    if (f) f()
  },
  'pic-export': (el) => {
    const kind = picKind()
    if (kind) exportXlsx(kind, el)
  },
})

/* ---------- Event: edit sel, pencarian ---------- */
document.addEventListener('focusin', (e) => {
  const t = e.target
  if (t instanceof HTMLInputElement && t.matches('[data-pic-cell]')) t.dataset.orig = t.value
})

document.addEventListener('keydown', (e) => {
  const t = e.target
  if (!(t instanceof HTMLInputElement) || !t.matches('[data-pic-cell]')) return
  if (e.key === 'Enter') { e.preventDefault(); t.blur() }
  if (e.key === 'Escape') { t.value = t.dataset.orig ?? t.value; t.blur() }
})

document.addEventListener('change', (e) => {
  const t = e.target
  if (!(t instanceof HTMLInputElement) || !t.matches('[data-pic-cell]')) return
  const kind = picKind()
  if (!kind) return
  const id = +t.dataset.id
  const k = t.dataset.k
  const col = PIC[kind].cols.find((c) => c.k === k)
  const res = editCell(kind, id, k, t.value)
  if (!res.ok) {
    toast(res.err)
    t.value = t.dataset.orig ?? ''
    t.classList.add('border-red-500')
    setTimeout(() => t.classList.remove('border-red-500'), 1600)
    return
  }
  t.value = inputVal(col, res.v)
  t.dataset.orig = t.value
  const o = origRows(kind).find((r) => r.id === id)
  const td = t.closest('td')
  if (td && o) {
    const ch = o[k] !== res.v
    td.classList.toggle('bg-amber-50', ch)
    td.title = ch ? `Nilai asli: ${plainVal(col, o[k])}` : ''
  }
  if (!res.same) afterData(kind)
})

let searchTimer = 0
document.addEventListener('input', (e) => {
  const t = e.target
  if (!(t instanceof HTMLInputElement) || t.id !== 'pic-search') return
  const kind = picKind()
  if (!kind) return
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    S.pic[kind].q = t.value
    S.pic[kind].page = 0
    const r = $('#pic-rows')
    if (r) r.innerHTML = rowsHtml(kind)
  }, 150)
})
