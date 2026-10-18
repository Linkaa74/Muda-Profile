/* Interaksi, grafik, router, form, dan inisialisasi */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const smooth = reduceMotion ? 'auto' : 'smooth'
let current = ''

/* ---------- Grafik SVG ---------- */
function drawChart(el, data, series, type, opts = {}) {
  if (!el || !data.length) return
  const W = Math.max(280, opts.W ?? el.clientWidth)
  const H = opts.H ?? el.clientHeight
  const fmt = opts.fmt || ((t) => compact(Math.round(t)))
  const max = (Math.max(...data.flatMap((d) => series.map((s) => d[s.key]))) || 1) * 1.08
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f)
  const labels = ticks.map(fmt)
  const m = { t: 10, r: 10, b: 24, l: Math.max(44, Math.max(...labels.map((l) => l.length)) * 6.4 + 12) } // margin kiri mengikuti lebar label
  const iw = W - m.l - m.r
  const ih = H - m.t - m.b
  const x = (i) => m.l + (type === 'bar' ? (i + 0.5) * (iw / data.length) : (data.length > 1 ? i / (data.length - 1) : 0.5) * iw)
  const y = (v) => m.t + ih - (v / max) * ih
  const step = Math.ceil(data.length / 8)
  let g = ticks.map((t, ti) => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}" stroke="#d7eeff" /><text x="${m.l - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="#0c3d65" opacity=".6">${labels[ti]}</text>`).join('')
  g += data.map((d, i) => (i % step === 0 ? `<text x="${x(i)}" y="${H - 6}" text-anchor="${type !== 'bar' && data.length > 1 ? (i === data.length - 1 ? 'end' : i === 0 ? 'start' : 'middle') : 'middle'}" font-size="11" fill="#0c3d65" opacity=".6">${d.label}</text>` : '')).join('')
  let defs = ''
  if (type === 'bar') {
    const bw = Math.max(3, (iw / data.length) * 0.6)
    g += series.map((s) => data.map((d, i) => `<rect x="${x(i) - bw / 2}" y="${y(d[s.key])}" width="${bw}" height="${m.t + ih - y(d[s.key])}" rx="3" fill="${s.color}"><title>${d.label}: ${nf.format(d[s.key])}</title></rect>`).join('')).join('')
  } else {
    series.forEach((s, k) => {
      const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d[s.key]).toFixed(1)}`)
      defs += `<linearGradient id="gr${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".35"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient>`
      g += `<polygon points="${m.l},${m.t + ih} ${pts.join(' ')} ${x(data.length - 1)},${m.t + ih}" fill="url(#gr${k})" />`
      g += `<polyline points="${pts.join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />`
      g += data.map((d, i) => `<circle cx="${x(i)}" cy="${y(d[s.key])}" r="6" fill="transparent"><title>${s.name} ${d.label}: ${nf.format(d[s.key])}</title></circle>`).join('')
    })
  }
  el.innerHTML = `<svg width="${W}" height="${H}" role="img" aria-label="Grafik">${defs ? `<defs>${defs}</defs>` : ''}${g}</svg>`
}

function drawCharts() {
  const body = $('#pd-body')
  if (!body) return
  const b = brands.find((x) => x.slug === body.dataset.slug)
  const data = buildSeries(b, S.range)
  const a = $('#chart-views')
  const c = $('#chart-visits')
  const sa = { W: a.clientWidth, H: a.clientHeight }
  const sc = { W: c.clientWidth, H: c.clientHeight }
  drawChart(a, data, [{ key: 'views', color: '#2aa4ff', name: 'Views' }, { key: 'reach', color: '#154472', name: 'Jangkauan' }], 'area', sa)
  drawChart(c, data, [{ key: 'visits', color: '#6ad8ef' }], 'bar', sc)
}

/* ---------- Toast ---------- */
function toast(msg) {
  const t = document.createElement('div')
  t.setAttribute('role', 'status')
  t.className = 'fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[fadeUp_.25s_ease-out] rounded-full bg-deep px-5 py-3 text-sm font-bold text-white shadow-2xl'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2200)
}

/* ---------- Router ---------- */
function parseRoute() {
  const h = location.hash
  if (h === '#/faq') return { kind: 'faq' }
  if (h === '#/upsociety') return { kind: 'ups' }
  if (h === '#/kontak') return { kind: 'contact' }
  if (h === '#/daftar') return { kind: 'register' }
  if (h === '#/daftar/pic') return { kind: 'register', slug: 'pic' }
  if (h === '#/masuk') return { kind: 'login' }
  if (h === '#/masuk/pic') return { kind: 'login', slug: 'pic' }
  if (h === '#/pic') return { kind: 'pic' }
  const pm = h.match(/^#\/pic\/(portofolio|performa|live)$/)
  if (pm) return { kind: 'picsec', slug: pm[1] }
  let m = h.match(/^#\/layanan\/([\w-]+)$/)
  if (m) return { kind: 'service', slug: m[1] }
  m = h.match(/^#\/portofolio\/([\w-]+)$/)
  if (m) return { kind: 'portfolio', slug: m[1] }
  return { kind: 'home' }
}

function scrollToHash(behavior) {
  const id = location.hash.replace(/^#/, '')
  const el = /^[A-Za-z][\w-]*$/.test(id) ? document.getElementById(id) : null
  if (el) el.scrollIntoView({ behavior, block: 'start' })
  else if (behavior === 'instant') window.scrollTo({ top: 0, behavior: 'instant' })
}

/* Penjaga halaman: PIC hanya melihat portal PIC; halaman PIC butuh login PIC */
function guardRoute(r) {
  const pic = r.kind === 'pic' || r.kind === 'picsec'
  if (isPic()) return pic ? null : '#/pic'
  return pic ? '#/masuk/pic' : null
}

function render() {
  let r = parseRoute()
  const to = guardRoute(r)
  if (to) {
    history.replaceState(null, '', to)
    r = parseRoute()
  }
  const key = r.kind + (r.slug || '')
  const app = $('#app')

  if (key === current && r.kind === 'home') {
    scrollToHash(smooth)
    return
  }
  current = key

  if (r.kind === 'faq') S.faq = { cat: 'Perusahaan', q: '', open: null }
  if (r.kind === 'portfolio') S.range = '3b'
  if (r.kind === 'ups') S.ups = 0

  const pages = {
    home: homePage,
    faq: faqPage,
    ups: upsocietyPage,
    contact: contactPage,
    register: () => registerPage(r.slug === 'pic' ? 'pic' : 'user'),
    login: () => loginPage(r.slug === 'pic' ? 'pic' : 'user'),
    pic: picHome,
    picsec: () => picSection(r.slug),
    service: () => serviceDetail(r.slug),
    portfolio: () => portfolioDetail(r.slug),
  }
  app.innerHTML = pages[r.kind]()
  document.title = r.kind === 'pic' || r.kind === 'picsec' ? 'Portal PIC - muda group' : 'muda group - Agensi Pemasaran Digital'

  if (r.kind === 'home') scrollToHash('instant')
  else window.scrollTo({ top: 0, behavior: 'instant' })
  if (r.kind === 'portfolio') {
    drawCharts()
    initPostTrack()
  }
  if (r.kind === 'picsec') drawPicCharts()
  updateSpy()
}

/* ---------- Carousel postingan ---------- */
function initPostTrack() {
  const tr = $('#post-track')
  if (!tr) return
  let raf = 0
  const sync = () => {
    raf = 0
    const kids = Array.from(tr.children)
    const idx = kids.reduce((best, c, i) => (Math.abs(c.offsetLeft - tr.scrollLeft - kids[0].offsetLeft) < Math.abs(kids[best].offsetLeft - tr.scrollLeft - kids[0].offsetLeft) ? i : best), 0)
    $$('.post-dot').forEach((d, i) => {
      d.classList.toggle('w-8', i === idx)
      d.classList.toggle('bg-azure', i === idx)
      d.classList.toggle('w-2.5', i !== idx)
      d.classList.toggle('bg-sky/50', i !== idx)
    })
    $('#post-prev').disabled = tr.scrollLeft <= 4
    $('#post-next').disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4
  }
  tr.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync) }, { passive: true })
  sync()
}

/* ---------- UPsociety ---------- */
function upsGo(i) {
  const n = upsSlides.length
  S.ups = (i + n) % n
  $('#ups-inner').innerHTML = upsInner()
  $('#ups-counter').textContent = `Slide ${S.ups + 1} / ${n} - ${upsSlides[S.ups].title}`
}

let touchX = null

/* ---------- Form: kirim ke Google Sheets ---------- */
const wib = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
const sendSheet = (payload) =>
  fetch(SHEETS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })

async function submitContact(form) {
  const d = new FormData(form)
  if (d.get('website')) return
  const btn = $('#cf-btn')
  const st = $('#cf-status')
  btn.disabled = true
  btn.textContent = 'Mengirim...'
  try {
    await sendSheet({
      tipe: 'kontak',
      waktu: wib(),
      nama: `${d.get('first')} ${d.get('last')}`.trim(),
      email: d.get('email'),
      bidang: d.get('industry'),
      layanan: d.get('service'),
      addon: d.get('addon'),
      pesan: d.get('message'),
    })
    form.reset()
    st.innerHTML = '<p class="mt-4 rounded-xl bg-mist px-4 py-3 text-center text-sm font-bold text-ocean">Terima kasih! Pesan Anda sudah terkirim. Tim kami akan menghubungi dalam 1x24 jam.</p>'
  } catch {
    st.innerHTML = '<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600">Pesan gagal terkirim. Periksa koneksi lalu coba lagi.</p>'
  }
  btn.disabled = false
  btn.textContent = 'Kirim Pesan'
}

function showErrors(form, errs) {
  $$('[data-err]', form).forEach((p) => {
    if (p._hint === undefined) p._hint = p.innerHTML
    const id = p.dataset.err
    p.innerHTML = errs[id] ? esc(errs[id]) : p._hint
    const inp = form.elements[id]
    if (inp && inp.type !== 'checkbox') {
      inp.classList.toggle('border-red-500', !!errs[id])
      inp.setAttribute('aria-invalid', errs[id] ? 'true' : 'false')
    }
  })
}

async function submitRegister(form) {
  const pic = form.dataset.role === 'pic'
  const v = (n) => (form.elements[n] ? form.elements[n].value : '')
  const f = { name: v('name').trim(), email: v('email').trim().toLowerCase(), phone: v('phone').trim(), company: v('company').trim(), jabatan: v('jabatan').trim(), pw: v('pw'), pw2: v('pw2'), agree: form.elements.agree.checked }
  const e = {}
  if (f.name.length < 3) e.name = 'Masukkan nama lengkap (min. 3 karakter).'
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Format email tidak valid.'
  else if (readUsers()[f.email] || PIC_ACCOUNTS.some((a) => a.email === f.email)) e.email = 'Email ini sudah terdaftar. Silakan masuk.'
  if (pic) {
    if (f.jabatan.length < 3) e.jabatan = 'Masukkan jabatan Anda.'
    if (f.company.length < 2) e.company = 'Masukkan nama perusahaan.'
  } else if (!/^(\+62|62|0)8\d{7,12}$/.test(f.phone.replace(/[\s-]/g, ''))) e.phone = 'Gunakan nomor HP Indonesia, mis. 0812xxxxxxxx.'
  if (f.pw.length < 8) e.pw = 'Kata sandi minimal 8 karakter.'
  if (f.pw2 !== f.pw) e.pw2 = 'Konfirmasi kata sandi tidak sama.'
  if (!f.agree) e.agree = 'Anda perlu menyetujui syarat dan ketentuan.'
  showErrors(form, e)
  if (Object.keys(e).length) return
  const btn = $('#auth-btn')
  btn.disabled = true
  btn.textContent = 'Mendaftarkan...'
  const user = pic
    ? { name: f.name, email: f.email, company: f.company, jabatan: f.jabatan, role: 'pic' }
    : { name: f.name, email: f.email, phone: f.phone, company: f.company, role: 'user' }
  const users = readUsers()
  users[f.email] = { user, hash: await sha(f.pw) }
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) } catch { /* abaikan */ }
  // Data PIC bersifat internal: tidak dikirim ke Google Sheets
  if (!pic) sendSheet({ tipe: 'daftar', waktu: wib(), nama: user.name, email: user.email, telepon: user.phone, brand: user.company }).catch(() => {})
  setAccount(user)
  location.hash = pic ? '#/pic' : '#beranda'
}

async function submitLogin(form) {
  const err = $('#login-error')
  const fail = (t) => {
    err.textContent = t
    err.classList.remove('hidden')
    btn.disabled = false
    btn.textContent = 'Masuk'
  }
  const btn = $('#auth-btn')
  const key = form.elements.email.value.trim().toLowerCase()
  const pw = form.elements.pw.value
  if (!key || !pw) { err.textContent = 'Email dan kata sandi wajib diisi.'; err.classList.remove('hidden'); return }
  btn.disabled = true
  btn.textContent = 'Memeriksa...'
  const pic = form.dataset.role === 'pic'
  const demo = PIC_ACCOUNTS.find((a) => a.email === key)
  const rec = demo || readUsers()[key]
  if (!rec) return fail(pic ? 'Akun PIC belum terdaftar. Silakan daftar sebagai PIC.' : 'Akun belum terdaftar. Silakan daftar terlebih dahulu.')
  const isPicRec = !!demo || rec.user.role === 'pic'
  if (pic !== isPicRec) return fail(pic ? 'Ini bukan akun PIC. Pilih tab "Klien / User" untuk masuk.' : 'Ini akun PIC. Pilih tab "PIC / Pimpinan" untuk masuk.')
  const h = await sha(pw)
  const ok = demo ? h === (globalThis.crypto && crypto.subtle ? demo.hash : demo.hashB64) : rec.hash === h
  if (!ok) return fail('Kata sandi salah.')
  setAccount(rec.user)
  location.hash = pic ? '#/pic' : '#beranda'
}

/* ---------- Event: klik ---------- */
const actions = {
  'menu-toggle': () => $('#mobile-menu').classList.toggle('hidden'),
  'menu-close': () => $('#mobile-menu').classList.add('hidden'),
  'acct-toggle': (el) => {
    const p = $('#acct-panel')
    p.classList.toggle('hidden')
    el.setAttribute('aria-expanded', String(!p.classList.contains('hidden')))
  },
  logout: () => {
    const wasPic = isPic()
    setAccount(null)
    if (wasPic) location.hash = '#beranda'
    toast('Anda sudah keluar.')
  },
  'team-select': (el) => {
    S.team = +el.dataset.i
    $('#team-root').innerHTML = teamInner()
  },
  'faq-toggle': (el) => {
    const i = +el.dataset.i
    const was = S.faq.open
    S.faq.open = was === i ? null : i
    $$('[data-faq]').forEach((row) => {
      const on = +row.dataset.faq === S.faq.open
      row.querySelector('button').setAttribute('aria-expanded', String(on))
      const q = row.querySelector('[data-faq-q]')
      q.classList.toggle('font-bold', on)
      q.classList.toggle('text-azure', on)
      q.classList.toggle('text-ocean', !on)
      const ic2 = row.querySelector('[data-faq-icon]')
      ;['rotate-180', 'bg-[#2f93e5]', 'text-white'].forEach((c) => ic2.classList.toggle(c, on))
      const pn = row.querySelector('[data-faq-panel]')
      pn.classList.toggle('grid-rows-[1fr]', on)
      pn.classList.toggle('opacity-100', on)
      pn.classList.toggle('grid-rows-[0fr]', !on)
      pn.classList.toggle('opacity-0', !on)
    })
  },
  'faq-cat': (el) => {
    S.faq.cat = el.dataset.id
    S.faq.open = null
    $('#faq-body').innerHTML = faqBody()
  },
  range: (el) => {
    S.range = el.dataset.id
    $('#pd-body').innerHTML = portfolioBody(brands.find((x) => x.slug === $('#pd-body').dataset.slug))
    drawCharts()
  },
  'post-step': (el) => {
    const tr = $('#post-track')
    tr.scrollBy({ left: +el.dataset.d * tr.clientWidth * 0.8, behavior: smooth })
  },
  'post-go': (el) => {
    const tr = $('#post-track')
    const c = tr.children[+el.dataset.i]
    tr.scrollTo({ left: c.offsetLeft - tr.children[0].offsetLeft, behavior: smooth })
  },
  'ups-step': (el) => upsGo(S.ups + +el.dataset.d),
  'ups-go': (el) => upsGo(+el.dataset.i),
  'ups-full': () => {
    const st = $('#ups-stage')
    if (document.fullscreenElement) document.exitFullscreen()
    else if (st.requestFullscreen) st.requestFullscreen().catch(() => {})
  },
  copy: async (el) => {
    try {
      await navigator.clipboard.writeText(el.dataset.v)
      toast('Tersalin ke papan klip.')
    } catch {
      toast('Salin manual: ' + el.dataset.v)
    }
  },
  'pw-toggle': (el) => {
    const inp = el.previousElementSibling
    const show = inp.type === 'password'
    inp.type = show ? 'text' : 'password'
    el.innerHTML = ic(show ? 'EyeOff' : 'Eye', 18)
    el.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi')
  },
  'back-confirm': () => {
    document.body.insertAdjacentHTML('beforeend', confirmModal())
    $('#confirm-no').focus()
  },
  'confirm-no': () => $('#confirm-modal')?.remove(),
  'confirm-yes': () => {
    $('#confirm-modal')?.remove()
    location.hash = '#beranda'
  },
}

Object.assign(actions, picActions)

document.addEventListener('click', (e) => {
  const t = e.target
  if (!(t instanceof Element)) return

  const panel = $('#acct-panel')
  if (panel && !panel.classList.contains('hidden') && !t.closest('#acct')) panel.classList.add('hidden')

  const act = t.closest('[data-act]')
  if (act && actions[act.dataset.act]) {
    if (act.dataset.act !== 'confirm-no-bg') actions[act.dataset.act](act)
  } else if (t.id === 'confirm-modal') {
    t.remove()
  }

  const a = t.closest('a[href^="#"]')
  if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && a.target !== '_blank') {
    const href = a.getAttribute('href')
    if (/^#[A-Za-z][\w-]*$/.test(href)) {
      const el = document.getElementById(href.slice(1))
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: smooth, block: 'start' })
        if (location.hash !== href) history.pushState(null, '', href)
        if (current !== 'home') { current = ''; render() }
      }
    }
  }
})

document.addEventListener('submit', (e) => {
  const f = e.target
  if (!(f instanceof HTMLFormElement)) return
  if (f.id === 'contact-form') { e.preventDefault(); submitContact(f) }
  else if (f.id === 'register-form') { e.preventDefault(); submitRegister(f) }
  else if (f.id === 'login-form') { e.preventDefault(); submitLogin(f) }
})

let faqTimer = 0
document.addEventListener('input', (e) => {
  const t = e.target
  if (t.id === 'faq-q') {
    S.faq.q = t.value
    S.faq.open = null
    clearTimeout(faqTimer)
    faqTimer = setTimeout(() => { const b = $('#faq-body'); if (b) b.innerHTML = faqBody() }, 120)
  }
  if (t.closest && t.closest('#login-form')) $('#login-error')?.classList.add('hidden')
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $('#confirm-modal')?.remove()
  if (parseRoute().kind === 'ups' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    if (e.key === 'ArrowLeft') upsGo(S.ups - 1)
    if (e.key === 'ArrowRight') upsGo(S.ups + 1)
  }
})

document.addEventListener('touchstart', (e) => {
  touchX = e.target.closest && e.target.closest('#ups-stage') ? e.touches[0].clientX : null
}, { passive: true })
document.addEventListener('touchend', (e) => {
  if (touchX === null) return
  const dx = e.changedTouches[0].clientX - touchX
  touchX = null
  if (Math.abs(dx) > 40) upsGo(S.ups + (dx < 0 ? 1 : -1))
}, { passive: true })

document.addEventListener('fullscreenchange', () => {
  if ($('#ups-inner')) $('#ups-inner').innerHTML = upsInner()
})

let ticking = false
addEventListener('scroll', () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => { ticking = false; updateSpy() })
}, { passive: true })

let rz = 0
let lastW = innerWidth
addEventListener('resize', () => {
  if (innerWidth === lastW) return // bilah alamat HP mengubah tinggi saat scroll: abaikan
  lastW = innerWidth
  clearTimeout(rz)
  rz = setTimeout(() => { drawCharts(); drawPicCharts() }, 150)
}, { passive: true })

addEventListener('hashchange', render)

/* ---------- Mulai ---------- */
drawHeader()
drawFooter()
render()
