/* Helper, komponen kecil, header, footer, dan data akun */

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const A = (f) => `images/${f}`
const brand = { name: 'muda group', mark: A('3c86d.svg') }

const ic = (name, size = 18, cls = '', fill = 'none') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${ICONS[name]}</svg>`

const gradBtn = (href, label, cls = '') =>
  `<a href="${href}" class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky to-azure px-7 py-3.5 font-bold text-white shadow-lg shadow-cyan/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan/40 active:translate-y-0 ${cls}">${label}</a>`

const backLinkDark = (href) =>
  `<a href="${href}" class="mb-8 inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-bold transition hover:-translate-x-1 hover:border-sky hover:bg-white/10">${ic('ArrowLeft', 16)} Kembali ke Beranda</a>`

const sectionTitle = (title, sub = '') => `
  <div class="mb-12 text-center">
    <h2 class="font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl">${title}</h2>
    ${sub ? `<p class="mx-auto mt-3 max-w-xl text-deep/70">${sub}</p>` : ''}
  </div>`

const logo = (dark = false, href = '#beranda') => `
  <a href="${href}" class="flex items-center gap-2">
    <img src="${brand.mark}" alt="" class="h-10 w-10 object-contain" />
    <span class="font-bold text-2xl tracking-tight ${dark ? 'text-navy' : 'text-white'}">${brand.name}</span>
  </a>`

const notFound = (title, text, href) => `
  <section class="bg-gradient-to-b from-navy to-ocean px-6 pb-24 pt-44 text-center text-white">
    <h1 class="font-display text-4xl font-extrabold sm:text-5xl">${title}</h1>
    <p class="mx-auto mt-4 max-w-md text-white/80">${text}</p>
    ${gradBtn(href, 'Kembali ke Beranda', 'mt-8')}
  </section>`

/* ---------- Akun (disimpan di localStorage browser) ---------- */
const USERS_KEY = 'muda_users'
const SESSION_KEY = 'muda_session'

const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => (w[0] || '').toUpperCase()).join('')

const readUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}

const sha = async (t) => {
  if (!globalThis.crypto || !crypto.subtle) return btoa(unescape(encodeURIComponent(t)))
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('')
}

let account = null
try {
  const e = localStorage.getItem(SESSION_KEY)
  account = e ? (readUsers()[e] || {}).user || (PIC_ACCOUNTS.find((a) => a.email === e) || {}).user || null : null
} catch { account = null }

const isPic = () => !!account && account.role === 'pic'

function setAccount(u) {
  account = u
  try { u ? localStorage.setItem(SESSION_KEY, u.email) : localStorage.removeItem(SESSION_KEY) } catch { /* abaikan */ }
  drawHeader()
  drawFooter()
}

/* ---------- Header ---------- */
function drawHeader() {
  const items = isPic() ? picNav : navItems
  spy = { scrolled: null, cur: null }
  $('#site-header').innerHTML = `
    <div class="mx-auto flex max-w-[1300px] items-center justify-between gap-6 px-6 py-5">
      ${logo(false, isPic() ? '#/pic' : '#beranda')}
      <nav class="hidden items-center gap-1 lg:flex">
        ${items.map((n) => `<a href="${n.href}" data-nav="${n.href}" class="relative px-4 py-2 text-sm font-bold text-white/90 transition hover:text-white after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded after:bg-gradient-to-r after:from-navy after:to-sky after:origin-left after:transition-transform after:duration-300 after:scale-x-0 hover:after:scale-x-100">${n.label}</a>`).join('')}
      </nav>
      <div id="auth-desktop" class="hidden items-center gap-4 lg:flex"></div>
      <button class="text-white lg:hidden" aria-label="Menu" data-act="menu-toggle">${ic('Menu', 24)}</button>
    </div>
    <div id="mobile-menu" class="hidden flex-col gap-1 border-t border-white/10 bg-deep px-6 pb-5 lg:hidden [&:not(.hidden)]:flex">
      ${items.map((n) => `<a href="${n.href}" data-act="menu-close" class="py-2 font-bold text-white">${n.label}</a>`).join('')}
      <div id="auth-mobile" class="mt-2 flex items-center gap-4 border-t border-white/10 pt-4"></div>
    </div>`
  drawAuth()
  updateSpy()
}

function drawAuth() {
  const d = $('#auth-desktop')
  const m = $('#auth-mobile')
  if (!d || !m) return
  if (account) {
    d.innerHTML = `
      <div id="acct" class="relative">
        <button data-act="acct-toggle" aria-expanded="false" class="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-4 text-sm font-bold text-white transition hover:bg-white/20">
          <span class="grid size-8 place-items-center rounded-full bg-cyan text-xs font-extrabold">${esc(initials(account.name))}</span>
          <span class="max-w-[120px] truncate">${esc(account.name.split(' ')[0])}</span>
          ${ic('ChevronDown', 14)}
        </button>
        <div id="acct-panel" class="absolute right-0 top-full mt-2 hidden w-64 animate-[fadeUp_.25s_ease-out] rounded-2xl bg-white p-4 text-navy shadow-2xl">
          <p class="truncate font-display text-lg font-extrabold">${esc(account.name)}</p>
          <p class="truncate text-sm text-deep/70">${esc(account.email)}</p>
          ${isPic() ? `<p class="mt-2 inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-extrabold text-azure">${ic('Briefcase', 12)} PIC${account.jabatan ? ' - ' + esc(account.jabatan) : ''}</p>` : ''}
          ${account.company ? `<p class="mt-1 truncate text-xs font-bold text-ocean">${esc(account.company)}</p>` : ''}
          <button data-act="logout" class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-mist py-2.5 text-sm font-bold text-navy transition hover:bg-azure hover:text-white">${ic('LogOut', 16)} Keluar</button>
        </div>
      </div>`
    m.innerHTML = `
      <span class="flex items-center gap-2 font-bold text-white"><span class="grid size-8 place-items-center rounded-full bg-cyan text-xs">${esc(initials(account.name))}</span>${esc(account.name.split(' ')[0])}</span>
      <button data-act="logout" class="ml-auto flex items-center gap-1 text-sm font-bold text-sky">${ic('LogOut', 16)} Keluar</button>`
  } else {
    d.innerHTML = `
      <a href="#/masuk" class="text-sm font-bold text-white hover:text-sky">Masuk</a>
      <a href="#/daftar" class="rounded-[10px] bg-cyan px-5 py-2 text-sm font-bold text-white shadow-md shadow-cyan/30 transition hover:bg-sky">Daftar</a>`
    m.innerHTML = `
      <a href="#/masuk" data-act="menu-close" class="font-bold text-white">Masuk</a>
      <a href="#/daftar" data-act="menu-close" class="rounded-[10px] bg-cyan px-5 py-2 text-sm font-bold text-white">Daftar</a>`
  }
}

/* Menu aktif mengikuti bagian yang sedang dilihat.
   Semua pembacaan layout dilakukan dulu, penulisan class hanya saat nilainya berubah,
   sehingga tidak memicu layout ulang berulang saat scroll. */
let spy = { scrolled: null, cur: null }
function updateSpy() {
  const header = $('#site-header')
  if (!header) return
  const scrolled = window.scrollY > 20
  let cur = ''
  if (isPic()) {
    cur = location.hash || '#/pic'
  } else {
    for (const n of navItems) {
      const el = document.getElementById(n.href.slice(1))
      if (el && el.getBoundingClientRect().top <= 140) cur = n.href
    }
    if (location.hash === '#/kontak') cur = '#/kontak'
  }

  if (scrolled !== spy.scrolled) {
    spy.scrolled = scrolled
    header.classList.toggle('bg-deep/90', scrolled)
    header.classList.toggle('shadow-lg', scrolled)
    header.classList.toggle('shadow-deep/30', scrolled)
    header.classList.toggle('bg-deep/50', !scrolled)
  }
  if (cur !== spy.cur) {
    spy.cur = cur
    $$('[data-nav]').forEach((a) => {
      const on = a.dataset.nav === cur
      a.classList.toggle('text-white', on)
      a.classList.toggle('after:scale-x-100', on)
      a.classList.toggle('after:scale-x-0', !on)
    })
  }
}

/* ---------- Footer ---------- */
function drawFooter() {
  if (isPic()) {
    $('#footer').innerHTML = `
      <div class="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-4 px-6 py-8">
        ${logo(false, '#/pic')}
        <p class="text-xs text-white/60">Portal PIC - data bersifat rahasia, hanya untuk pimpinan muda group.</p>
      </div>
      <p class="border-t border-white/10 py-5 text-center text-xs text-white/50">&copy; 2026 muda group. Hak cipta dilindungi.</p>`
    return
  }
  const socials = ['9f756.svg', 'd9b41.svg', '24d93.svg', 'c3f2a.svg']
  $('#footer').innerHTML = `
    <div class="mx-auto grid max-w-[1300px] gap-10 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
      <div>
        ${logo()}
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-white/70">Agensi pemasaran digital yang membantu bisnis tumbuh dan sukses secara online.</p>
        <div class="mt-5 flex gap-3">
          ${socials.map((s) => `<a href="#beranda" aria-label="Media sosial" class="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-cyan"><img loading="lazy" decoding="async" src="${A(s)}" alt="" class="size-4" /></a>`).join('')}
        </div>
      </div>
      ${footerLinks.map((c) => `
        <div>
          <h4 class="mb-4 font-bold">${c.title}</h4>
          <ul class="space-y-2 text-sm text-white/70">
            ${c.links.map((l) => `<li><a href="${l.href}" class="transition hover:text-sky">${l.label}</a></li>`).join('')}
          </ul>
        </div>`).join('')}
      <div class="space-y-3 text-sm text-white/70">
        <h4 class="mb-4 font-bold text-white"><a href="#/kontak" class="transition hover:text-sky">Kontak</a></h4>
        <p class="flex items-center gap-2">${ic('Mail', 16)} ${company.email}</p>
        <p class="flex items-center gap-2">${ic('Phone', 16)} ${company.phone}</p>
        <p class="flex items-center gap-2">${ic('MapPin', 16)} Indonesia</p>
      </div>
    </div>
    <p class="border-t border-white/10 py-5 text-center text-xs text-white/50">&copy; 2026 muda group. Hak cipta dilindungi.</p>`
}
