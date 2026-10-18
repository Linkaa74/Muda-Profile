/* Template setiap halaman. Interaksi ada di widgets.js */

const S = {
  team: 0,
  faq: { cat: 'Perusahaan', q: '', open: null },
  range: '3b',
  ups: 0,
}

const fieldCls = 'w-full rounded-xl border border-transparent bg-[#d9d9d9]/60 px-4 py-3 text-deep outline-none transition placeholder:text-deep/40 focus:border-azure focus:bg-white focus:ring-4 focus:ring-azure/20 mt-2 font-normal'
const stars = (n, size = 18) => [0, 1, 2, 3, 4].map((i) => ic('Star', size, '', i < n ? 'currentColor' : 'none')).join('')

/* ---------- Beranda ---------- */
function heroSection() {
  return `
  <section id="beranda" class="relative overflow-hidden bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] pb-28 pt-40 text-white">
    <div class="mx-auto grid max-w-[1300px] items-center gap-12 px-6 lg:grid-cols-2">
      <div>
        <h1 class="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
          BRAND IS INNOVATION<br /><span class="text-sky">MAKE YOUR BRAND RENOWN</span>
        </h1>
        <p class="mt-6 max-w-lg text-lg leading-relaxed text-white/85">Agensi pemasaran digital kami membantu bisnis tumbuh dan sukses secara online melalui berbagai layanan seperti SEO, iklan berbayar, media sosial, dan pembuatan konten.</p>
        <div class="mt-9 flex flex-wrap gap-4">
          ${gradBtn('#kontak', 'Mulai Booking Jasa')}
          <a href="#portofolio" class="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 font-bold transition hover:border-white hover:bg-white/10">Lihat Portofolio ${ic('ArrowRight', 18)}</a>
        </div>
      </div>
      <div class="relative mx-auto aspect-square w-full max-w-[520px]">
        <img src="${A('422b6.svg')}" alt="" class="absolute inset-0 size-full" />
        <img src="${A('97049.svg')}" alt="" class="absolute inset-0 size-full" />
        <img src="${A('e73e1.webp')}" alt="Tim muda group" class="absolute inset-[6%] size-[88%] rounded-full object-cover" />
      </div>
    </div>
    <div class="relative z-10 mx-auto mt-20 max-w-[1300px] px-6">
      <p class="mb-6 text-center text-sm font-bold uppercase tracking-widest text-white/70">Dipercaya oleh mitra kami</p>
      <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-3xl bg-white px-8 py-6 shadow-2xl">
        ${clients.map((c) => `<img loading="lazy" decoding="async" src="${A(c)}" alt="Logo klien" class="h-14 max-w-[130px] object-contain grayscale transition hover:grayscale-0" />`).join('')}
      </div>
    </div>
  </section>`
}

function reviewCard(r) {
  return `
  <figure class="w-[320px] shrink-0 rounded-3xl border border-mist bg-white p-6 shadow-sm">
    <div class="flex text-[#f5b301]">${stars(r.rating)}</div>
    <blockquote class="mt-3 text-sm leading-relaxed text-deep/85">"${esc(r.text)}"</blockquote>
    <figcaption class="mt-5 flex items-center gap-3">
      <span class="grid size-10 place-items-center rounded-full bg-gradient-to-br from-sky to-azure font-bold text-white">${esc(r.name[0])}</span>
      <span><span class="block text-sm font-bold text-deep">${esc(r.name)}</span><span class="block text-xs text-deep/60">${esc(r.role)}</span></span>
    </figcaption>
  </figure>`
}

function reviewMarquee() {
  const rows = [reviews.slice(0, 5), reviews.slice(5)]
  return `
  <div class="space-y-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
    ${rows.map((row, i) => `
      <div class="flex w-max gap-5 hover:[animation-play-state:paused]" style="animation: marquee ${i === 0 ? 45 : 55}s linear infinite ${i === 0 ? 'normal' : 'reverse'}">
        ${[...row, ...row, ...row, ...row].map(reviewCard).join('')}
      </div>`).join('')}
  </div>`
}

function aboutSection() {
  const cards = [
    { badge: 'Visi', text: 'Menjadi perusahaan teknologi adidaya global yang unggul, inovatif, dan berlandaskan nilai-nilai keimanan serta kemanusiaan, untuk menghadirkan kemajuan dan kebermanfaatan bagi mitra, masyarakat, dan lingkungan.' },
    { badge: 'Anak Perusahaan', text: 'Layanan profesional yang berfokus pada pengelolaan dan pengembangan media sosial suatu brand, perusahaan, atau individu agar dapat membangun citra positif, meningkatkan interaksi dengan audiens, serta mencapai tujuan pemasaran secara efektif di dunia digital.' },
  ]
  const subs = subsidiaryLogos.map((l) => {
    const cls = 'relative grid h-24 place-items-center rounded-2xl bg-ocean px-4 shadow-md transition hover:-translate-y-1 hover:bg-navy hover:shadow-xl'
    const img = `<img loading="lazy" decoding="async" src="${A(l.file)}" alt="Logo ${l.name}" class="${l.h} w-auto max-w-full object-contain" />`
    return `<li>${l.href
      ? `<a href="${l.href}" title="Lihat portofolio ${l.name}" class="${cls} group focus:outline-none focus-visible:ring-4 focus-visible:ring-sky">${img}<span class="absolute bottom-1.5 flex items-center gap-1 text-[10px] font-bold text-sky opacity-0 transition group-hover:opacity-100">Lihat portofolio ${ic('ArrowRight', 10)}</span></a>`
      : `<div class="${cls}">${img}</div>`}</li>`
  }).join('')
  return `
  <section id="tentang" class="bg-white py-24">
    <div class="mx-auto max-w-[1300px] px-6">
      ${sectionTitle('ABOUT US')}
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div class="relative">
          <div class="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-mist to-sky/40"></div>
          <img loading="lazy" decoding="async" src="${A('4513c.webp')}" alt="Tim muda group sedang berdiskusi" class="relative aspect-[4/3] w-full rounded-[2.5rem] object-cover shadow-xl" />
        </div>
        <div class="space-y-6">
          ${cards.map((b) => `
            <div class="rounded-3xl border border-mist bg-gradient-to-br from-white to-mist/60 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div class="mb-4 flex items-center gap-3">${logo(true)}<span class="rounded-full bg-ocean px-3 py-1 text-xs font-bold text-white">${b.badge}</span></div>
              <p class="leading-relaxed text-deep/85">${b.text}</p>
            </div>`).join('')}
          <div>
            <p class="mb-3 text-sm font-bold uppercase tracking-widest text-ocean">Brand dalam naungan kami</p>
            <ul class="grid grid-cols-3 gap-3">${subs}</ul>
          </div>
        </div>
      </div>
      <div class="mt-24">
        <div class="mb-10 text-center">
          <h3 class="font-display text-3xl font-extrabold text-navy sm:text-4xl">Apa Kata Mereka</h3>
          <p class="mt-2 flex items-center justify-center gap-2 text-deep/70"><span class="flex text-[#f5b301]">${stars(5)}</span> 4,8 dari 10 ulasan klien</p>
        </div>
      </div>
    </div>
    ${reviewMarquee()}
  </section>`
}

function servicesSection() {
  return `
  <section id="layanan" class="bg-mist/50 py-24">
    <div class="mx-auto max-w-[1300px] px-6">
      ${sectionTitle('OUR SERVICE', 'Pilih layanan yang paling sesuai dengan kebutuhan brand Anda.')}
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        ${services.map((s) => `
          <article class="group flex flex-col rounded-3xl bg-white p-4 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div class="relative aspect-[431/205] overflow-hidden rounded-[15px]">
              <img loading="lazy" decoding="async" src="${A('fce45.webp')}" alt="${esc(s.title)}" style="top:${s.top}" class="absolute left-0 h-[377%] w-full max-w-none transition duration-500 group-hover:scale-105" />
            </div>
            <h3 class="mt-5 font-display text-xl font-extrabold text-deep">${s.title}</h3>
            <p class="mt-2 flex-1 leading-relaxed text-deep/80">${s.desc}</p>
            <a href="#/layanan/${s.slug}" class="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky to-azure py-3.5 font-bold text-white transition group-hover:shadow-lg group-hover:shadow-cyan/40">Lihat Cakupan ${ic('ArrowRight', 18, 'transition group-hover:translate-x-1')}</a>
          </article>`).join('')}
      </div>
    </div>
  </section>`
}

function teamInner() {
  const m = team[S.team]
  return `
  <div class="relative mx-auto w-full max-w-md lg:sticky lg:top-8">
    <div class="absolute inset-x-4 bottom-0 top-10 rounded-[2rem] bg-gradient-to-b from-mist to-sky/50"></div>
    <img src="${A(m.photo)}" alt="${esc(m.role)}" class="relative mx-auto h-[500px] w-auto object-contain mix-blend-multiply [mask-image:linear-gradient(to_bottom,black_85%,transparent)]" />
    <div class="absolute inset-x-0 -bottom-5 mx-auto w-[85%] rounded-2xl bg-cyan px-5 py-4 text-center shadow-lg">
      <p class="font-display text-xl font-extrabold text-white">${esc(m.role)}</p>
    </div>
  </div>
  <div class="pt-4 lg:pt-0">
    <div class="overflow-hidden rounded-3xl border border-mist shadow-sm">
      <div class="hidden grid-cols-[0.9fr_1.4fr] bg-navy px-6 py-3 text-sm font-bold text-white sm:grid"><span>Posisi</span><span>Fokus Jobdesk</span></div>
      <ul role="listbox" aria-label="Daftar posisi tim">
        ${team.map((t, i) => `
          <li role="option" aria-selected="${i === S.team}">
            <button data-act="team-select" data-i="${i}" class="grid w-full gap-1 border-b border-mist px-6 py-4 text-left transition last:border-0 sm:grid-cols-[0.9fr_1.4fr] sm:items-center sm:gap-4 ${i === S.team ? 'border-l-4 border-l-azure bg-mist' : 'hover:bg-mist/60 hover:pl-8'}">
              <span class="font-bold text-deep">${esc(t.role)}</span>
              <span class="text-sm text-deep/70">${esc(t.focus)}</span>
            </button>
          </li>`).join('')}
      </ul>
    </div>
    <div class="mt-6 animate-[fadeUp_.4s_ease-out] rounded-3xl bg-gradient-to-br from-navy to-ocean p-7 text-white">
      <p class="text-xs font-bold uppercase tracking-widest text-sky">Preview Pekerjaan</p>
      <h3 class="mt-1 font-display text-2xl font-extrabold">${esc(m.role)}</h3>
      <ol class="mt-5 space-y-4">
        ${m.preview.map((p, i) => `
          <li class="flex gap-4 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15">
            <span class="grid size-9 shrink-0 place-items-center rounded-full bg-sky font-bold text-navy">${i + 1}</span>
            <span><span class="block font-bold">${esc(p.title)}</span><span class="mt-0.5 block text-sm leading-relaxed text-white/80">${esc(p.text)}</span></span>
          </li>`).join('')}
      </ol>
      <div class="mt-5 flex flex-wrap gap-2">${m.tools.map((t) => `<span class="rounded-full border border-white/30 px-3 py-1 text-xs font-bold">${esc(t)}</span>`).join('')}</div>
    </div>
  </div>`
}

function teamSection() {
  return `
  <section id="tim" class="bg-white py-24">
    <div class="mx-auto max-w-[1300px] px-6">
      ${sectionTitle('MEET OUR TEAM', 'Pilih posisi untuk melihat fokus jobdesk dan preview pekerjaannya.')}
      <div id="team-root" class="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">${teamInner()}</div>
    </div>
  </section>`
}

function portfolioSection() {
  return `
  <section id="portofolio" class="bg-mist/50 py-24">
    <div class="mx-auto max-w-[1300px] px-6">
      ${sectionTitle('PORTOFOLIO', 'Klik brand untuk melihat perkembangan awareness Instagram mereka.')}
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${brands.map((b) => {
          const g = growthPct(buildSeries(b, '3b').map((d) => d.views))
          return `
          <a href="#/portofolio/${b.slug}" class="group flex flex-col rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div class="grid h-36 place-items-center overflow-hidden rounded-2xl border border-mist bg-gradient-to-br from-white to-mist/70 px-8 py-6">
              <img loading="lazy" decoding="async" src="${A(b.logo)}" alt="Logo ${b.name}" class="max-h-20 w-auto max-w-[160px] object-contain transition duration-300 group-hover:scale-105" />
            </div>
            <div class="mt-5 flex items-start justify-between gap-3">
              <div><h3 class="font-display text-xl font-extrabold text-deep">${b.name}</h3><p class="text-sm text-deep/60">${b.category}</p></div>
              <span class="flex shrink-0 items-center gap-1 rounded-full bg-mist px-3 py-1 text-sm font-bold text-ocean">${ic('TrendingUp', 14)} +${g.toFixed(0)}%</span>
            </div>
            <p class="mt-3 text-sm text-deep/70">Kenaikan views Instagram, 3 bulan terakhir</p>
            <span class="mt-5 inline-flex items-center gap-2 font-bold text-azure">Lihat perkembangan ${ic('ArrowRight', 18, 'transition group-hover:translate-x-1')}</span>
          </a>`
        }).join('')}
      </div>
    </div>
  </section>`
}

function clientFormSection() {
  return `
  <section id="kontak" class="bg-white py-24">
    <div class="mx-auto max-w-3xl px-6">
      ${sectionTitle('CLIENT FORM', 'Ceritakan kebutuhan Anda, tim kami akan menghubungi dalam 1x24 jam.')}
      <form id="contact-form" class="relative overflow-hidden rounded-[2rem] border border-mist bg-white p-8 shadow-xl sm:p-10">
        <h3 class="mb-6 text-center font-display text-2xl font-extrabold text-deep">Hubungi Kami</h3>
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block text-sm font-bold">Nama Depan<input required name="first" placeholder="Budi" class="${fieldCls}" /></label>
          <label class="block text-sm font-bold">Nama Belakang<input required name="last" placeholder="Santoso" class="${fieldCls}" /></label>
        </div>
        <label class="mt-5 block text-sm font-bold">Email<input required type="email" name="email" placeholder="nama@perusahaan.com" class="${fieldCls}" /></label>
        <label class="mt-5 block text-sm font-bold">Bidang Usaha Anda<input name="industry" placeholder="Contoh: Kuliner, Pendidikan" class="${fieldCls}" /></label>
        <label class="mt-5 block text-sm font-bold">Paket upsociety yang Anda minati
          <select required name="service" class="${fieldCls}">
            <option value="" disabled selected>Pilih paket</option>
            ${upsPlans.map((pl) => `<option value="${pl.name}">${pl.name} - ${pl.price}/bulan</option>`).join('')}
            <option value="Belum yakin, konsultasi dulu">Belum yakin, konsultasi dulu</option>
          </select>
        </label>
        <label class="mt-5 block text-sm font-bold">Add-on <span class="font-normal text-deep/60">(opsional)</span>
          <select name="addon" class="${fieldCls}">${addOns.map((a) => `<option>${a}</option>`).join('')}</select>
        </label>
        <label class="mt-5 block text-sm font-bold">Pesan<textarea name="message" rows="4" placeholder="Tulis pesan Anda..." class="${fieldCls} resize-none"></textarea></label>
        <input name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <button type="submit" id="cf-btn" class="mt-8 w-full rounded-full bg-gradient-to-r from-sky to-azure py-4 font-bold text-white shadow-lg shadow-cyan/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60">Kirim Pesan</button>
        <div id="cf-status" aria-live="polite"></div>
      </form>
    </div>
  </section>`
}

function homePage() {
  return heroSection() + aboutSection() + servicesSection() + teamSection() + portfolioSection() + clientFormSection()
}

/* ---------- FAQ ---------- */
function faqItem(f, i, open) {
  return `
  <div data-faq="${i}" class="border-b border-black/70">
    <button data-act="faq-toggle" data-i="${i}" aria-expanded="${open}" class="group flex w-full items-center justify-between gap-6 py-4 text-left">
      <span data-faq-q class="text-lg transition-colors group-hover:text-azure ${open ? 'font-bold text-azure' : 'text-ocean'}">${esc(f.q)}</span>
      <span data-faq-icon class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-[#2f93e5] text-[#2f93e5] transition duration-300 group-hover:bg-[#2f93e5] group-hover:text-white ${open ? 'rotate-180 bg-[#2f93e5] text-white' : ''}">${ic('ChevronDown', 18)}</span>
    </button>
    <div data-faq-panel class="grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}">
      <p class="overflow-hidden pr-14 leading-relaxed text-deep/80"><span class="block pb-5">${esc(f.a)}</span></p>
    </div>
  </div>`
}

function faqBody() {
  const term = S.faq.q.trim().toLowerCase()
  const list = faqs.map((f, i) => ({ f, i })).filter(({ f }) => (term ? (f.q + f.a).toLowerCase().includes(term) : f.cat === S.faq.cat))
  return `
  <div class="grid gap-4 sm:grid-cols-3">
    ${faqCategories.map((c) => `
      <button data-act="faq-cat" data-id="${c.id}" class="border-4 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 ${S.faq.cat === c.id && !term ? 'border-sky bg-[#2f93e5]' : 'border-transparent bg-[#2f93e5]/70 hover:border-sky/60 hover:bg-[#2f93e5]'}">${c.label}</button>`).join('')}
  </div>
  <div class="mx-auto mt-14 max-w-4xl">
    <h2 class="text-4xl font-bold text-ocean">What's the fuss?</h2>
    <p class="mb-6 text-ocean">${term ? `${list.length} hasil untuk "${esc(S.faq.q)}"` : 'Apakah pertanyaan ini yang anda cari?'}</p>
    ${list.length === 0 ? '<p class="py-8 text-deep/70">Tidak ada pertanyaan yang cocok. Coba kata kunci lain atau <a href="#kontak" class="font-bold text-azure underline">hubungi kami</a>.</p>' : ''}
    ${list.map(({ f, i }) => faqItem(f, i, S.faq.open === i)).join('')}
  </div>`
}

function faqPage() {
  return `
  <section class="bg-[#2e3e4d] px-6 pb-14 pt-36 text-center text-white">
    <a href="#beranda" class="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-bold text-white transition hover:-translate-x-1 hover:border-sky hover:bg-white/10">${ic('ArrowLeft', 16)} Kembali ke Beranda</a>
    <h1 class="font-['Passion_One'] text-5xl uppercase tracking-wide sm:text-7xl lg:text-8xl">Tanyakan kepada FAQ</h1>
    <p class="mx-auto mt-3 max-w-2xl text-white/90">Temukan jawaban atas pertanyaan yang paling sering diajukan seputar layanan, paket, dan kerja sama dengan muda group.</p>
    <label class="relative mx-auto mt-6 block max-w-2xl">
      <span class="absolute left-5 top-1/2 -translate-y-1/2 text-white">${ic('Search', 20)}</span>
      <input id="faq-q" value="" placeholder="Cari pertanyaan..." aria-label="Cari pertanyaan" class="w-full rounded-full bg-ocean py-3.5 pl-13 pr-6 text-white outline-none transition placeholder:text-white/60 focus:ring-4 focus:ring-sky/40" />
    </label>
  </section>
  <section class="mx-auto max-w-5xl px-6 py-12">
    <div id="faq-body">${faqBody()}</div>
    <div class="mt-14 rounded-3xl bg-mist p-8 text-center">
      <p class="font-display text-xl font-extrabold text-navy">Belum menemukan jawabannya?</p>
      ${gradBtn('#kontak', 'Hubungi Kami', 'mt-4')}
    </div>
  </section>`
}

/* ---------- Detail layanan ---------- */
function serviceDetail(slug) {
  const sv = services.find((x) => x.slug === slug)
  if (!sv) return notFound('Layanan tidak ditemukan', 'Halaman yang Anda cari tidak tersedia. Silakan pilih layanan dari beranda.', '#layanan')
  const others = services.filter((x) => x.slug !== sv.slug)
  return `
  <section class="bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-20 pt-36 text-white">
    <div class="mx-auto max-w-[1300px]">
      ${backLinkDark('#layanan')}
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-sky">Layanan Kami</p>
          <h1 class="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">${sv.title}</h1>
          <p class="mt-5 max-w-xl text-lg leading-relaxed text-white/85">${sv.intro}</p>
          <div class="mt-8 flex flex-wrap gap-4">${gradBtn('#kontak', 'Mulai Booking Jasa')}</div>
        </div>
        <div class="relative aspect-[431/205] overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
          <img src="${A('fce45.webp')}" alt="${esc(sv.title)}" style="top:${sv.top}" class="absolute left-0 h-[377%] w-full max-w-none" />
        </div>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-[1300px] px-6 py-16">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-3xl bg-mist p-6"><p class="text-xs font-bold uppercase tracking-widest text-ocean">Cocok untuk</p><p class="mt-2 font-bold text-deep">${sv.forWho}</p></div>
      <div class="rounded-3xl bg-mist p-6"><p class="text-xs font-bold uppercase tracking-widest text-ocean">Estimasi durasi</p><p class="mt-2 font-bold text-deep">${sv.duration}</p></div>
    </div>
    <h2 class="mb-8 mt-16 font-display text-3xl font-extrabold text-navy sm:text-4xl">Cakupan Layanan</h2>
    <div class="grid gap-6 md:grid-cols-2">
      ${sv.scope.map((c, i) => `
        <article class="group rounded-3xl border border-mist bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <span class="grid size-11 place-items-center rounded-full bg-gradient-to-r from-sky to-azure font-bold text-white">${i + 1}</span>
          <h3 class="mt-4 font-display text-xl font-extrabold text-deep">${c.title}</h3>
          <p class="mt-2 leading-relaxed text-deep/80">${c.text}</p>
        </article>`).join('')}
    </div>
    <h2 class="mb-8 mt-16 font-display text-3xl font-extrabold text-navy sm:text-4xl">Alur Kerja</h2>
    <ol class="grid gap-6 md:grid-cols-4">
      ${sv.steps.map((st, i) => `
        <li class="relative rounded-3xl bg-gradient-to-b from-navy to-ocean p-6 text-white">
          <span class="font-display text-4xl font-extrabold text-sky">0${i + 1}</span>
          <h3 class="mt-2 font-bold">${st.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-white/80">${st.text}</p>
        </li>`).join('')}
    </ol>
    <h2 class="mb-8 mt-16 font-display text-3xl font-extrabold text-navy sm:text-4xl">Hasil yang Anda Dapatkan</h2>
    <ul class="grid gap-4 sm:grid-cols-2">
      ${sv.results.map((r) => `<li class="flex items-start gap-3 rounded-2xl bg-mist/60 p-5 text-deep">${ic('CheckCircle2', 20, 'mt-0.5 shrink-0 text-azure')} ${r}</li>`).join('')}
    </ul>
    <div class="mt-16 rounded-[2rem] bg-gradient-to-r from-navy to-ocean p-10 text-center text-white">
      <h2 class="font-display text-3xl font-extrabold">Siap memulai ${sv.title.toLowerCase()}?</h2>
      <p class="mx-auto mt-3 max-w-lg text-white/80">Ceritakan kebutuhan Anda dan tim kami akan menghubungi dalam 1x24 jam kerja.</p>
      <div class="mt-6 flex flex-wrap justify-center gap-4">
        ${gradBtn('#kontak', 'Hubungi Kami')}
        <a href="#layanan" class="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 font-bold transition hover:border-white hover:bg-white/10">${ic('ArrowLeft', 18)} Kembali ke Beranda</a>
      </div>
    </div>
    <h2 class="mb-6 mt-16 font-display text-2xl font-extrabold text-navy">Layanan lainnya</h2>
    <div class="grid gap-6 md:grid-cols-2">
      ${others.map((o) => `
        <a href="#/layanan/${o.slug}" class="group flex items-center justify-between gap-4 rounded-3xl border border-mist p-6 transition hover:-translate-y-1 hover:shadow-xl">
          <span><span class="block font-display text-lg font-extrabold text-deep">${o.title}</span><span class="mt-1 block text-sm text-deep/70">${o.desc.slice(0, 80)}...</span></span>
          ${ic('ArrowRight', 24, 'shrink-0 text-azure transition group-hover:translate-x-1')}
        </a>`).join('')}
    </div>
  </section>`
}

/* ---------- Detail portofolio ---------- */
function postCarousel() {
  const stats = [{ l: 2480, c: 142 }, { l: 3915, c: 208 }, { l: 5320, c: 317 }]
  const btn = 'grid size-11 place-items-center rounded-full border-2 border-azure text-azure transition hover:bg-azure hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-azure'
  return `
  <div>
    <div class="mb-5 flex items-center justify-between">
      <h2 class="font-display text-2xl font-extrabold text-navy sm:text-3xl">Contoh Postingan</h2>
      <div class="flex gap-2">
        <button id="post-prev" data-act="post-step" data-d="-1" disabled aria-label="Sebelumnya" class="${btn}">${ic('ChevronLeft', 24)}</button>
        <button id="post-next" data-act="post-step" data-d="1" aria-label="Berikutnya" class="${btn}">${ic('ChevronRight', 24)}</button>
      </div>
    </div>
    <div id="post-track" class="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      ${postImages.map((img, i) => `
        <figure class="w-[82%] shrink-0 snap-start overflow-hidden rounded-3xl border border-mist bg-white shadow-md sm:w-[44%] lg:w-[36%]">
          <img loading="lazy" decoding="async" src="${A(img)}" alt="Contoh postingan ${i + 1}" draggable="false" class="aspect-[4/5] w-full object-cover" />
          <figcaption class="flex items-center justify-between px-5 py-4 text-sm font-bold text-deep">
            <span>Postingan ${i + 1}</span>
            <span class="flex items-center gap-4 text-ocean"><span class="flex items-center gap-1">${ic('Heart', 16)} ${nf.format(stats[i].l)}</span><span class="flex items-center gap-1">${ic('MessageCircle', 16)} ${stats[i].c}</span></span>
          </figcaption>
        </figure>`).join('')}
    </div>
    <div class="mt-2 flex justify-center gap-2">
      ${postImages.map((_, i) => `<button data-act="post-go" data-i="${i}" aria-label="Slide ${i + 1}" class="post-dot h-2.5 rounded-full transition-all ${i === 0 ? 'w-8 bg-azure' : 'w-2.5 bg-sky/50'}"></button>`).join('')}
    </div>
  </div>`
}

function portfolioBody(b) {
  const data = buildSeries(b, S.range)
  const cfg = ranges.find((x) => x.id === S.range)
  const kpis = [
    { label: 'Total Views', icon: 'Eye', key: 'views' },
    { label: 'Jangkauan (Awareness)', icon: 'Radio', key: 'reach' },
    { label: 'Kunjungan Profil', icon: 'MousePointerClick', key: 'visits' },
  ].map((k) => {
    const xs = data.map((d) => d[k.key])
    return { ...k, total: xs.reduce((a, c) => a + c, 0), pct: growthPct(xs) }
  })
  const followers = Math.round(kpis[2].total * 0.14)
  const cards = [...kpis.map((k) => ({ label: k.label, icon: k.icon, value: compact(k.total), pct: k.pct })), { label: 'Follower Baru', icon: 'UserPlus', value: compact(followers), pct: kpis[2].pct * 0.8 }]
  const funnel = [
    { label: 'Views', value: kpis[0].total },
    { label: 'Jangkauan', value: kpis[1].total },
    { label: 'Kunjungan profil', value: kpis[2].total },
    { label: 'Follower baru', value: followers },
  ]
  return `
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h2 class="font-display text-2xl font-extrabold text-navy sm:text-3xl">Perkembangan Awareness</h2>
    <div role="tablist" class="flex rounded-full bg-mist p-1">
      ${ranges.map((r) => `<button role="tab" aria-selected="${S.range === r.id}" data-act="range" data-id="${r.id}" class="rounded-full px-5 py-2 text-sm font-bold transition ${S.range === r.id ? 'bg-gradient-to-r from-sky to-azure text-white shadow' : 'text-ocean hover:bg-white'}">${r.label}</button>`).join('')}
    </div>
  </div>
  <p class="mt-2 text-deep/70">Data Instagram ${cfg.long}. Angka bersifat contoh.</p>
  <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    ${cards.map((k) => `
      <div class="rounded-3xl border border-mist bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div class="flex items-center justify-between"><span class="text-sm font-bold text-deep/70">${k.label}</span><span class="grid size-10 place-items-center rounded-full bg-mist text-azure">${ic(k.icon, 18)}</span></div>
        <p class="mt-3 font-display text-3xl font-extrabold text-navy">${k.value}</p>
        <p class="mt-1 flex items-center gap-1 text-sm font-bold text-ocean">${ic('TrendingUp', 14)} +${k.pct.toFixed(1)}% <span class="font-normal text-deep/60">sepanjang periode</span></p>
      </div>`).join('')}
  </div>
  <div class="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
    <div class="rounded-3xl border border-mist bg-white p-6 shadow-sm">
      <h3 class="font-display text-lg font-extrabold text-deep">Views &amp; Jangkauan per ${cfg.unit}</h3>
      <div id="chart-views" class="relative mt-4 h-72"></div>
      <div class="mt-3 flex gap-5 text-sm font-bold"><span class="flex items-center gap-2 text-azure"><i class="size-3 rounded-full bg-azure"></i> Views</span><span class="flex items-center gap-2 text-navy"><i class="size-3 rounded-full bg-navy"></i> Jangkauan</span></div>
    </div>
    <div class="rounded-3xl bg-gradient-to-br from-navy to-ocean p-6 text-white shadow-sm">
      <h3 class="font-display text-lg font-extrabold">Alur Awareness</h3>
      <p class="text-sm text-white/70">Dari views hingga follower baru</p>
      <ul class="mt-5 space-y-4">
        ${funnel.map((f) => `
          <li>
            <div class="mb-1 flex justify-between text-sm font-bold"><span>${f.label}</span><span>${compact(f.value)}</span></div>
            <div class="h-3 overflow-hidden rounded-full bg-white/15"><div class="h-full rounded-full bg-gradient-to-r from-sky to-cyan transition-all duration-700" style="width:${Math.max(4, (f.value / funnel[0].value) * 100)}%"></div></div>
          </li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="mt-6 rounded-3xl border border-mist bg-white p-6 shadow-sm">
    <h3 class="font-display text-lg font-extrabold text-deep">Kunjungan Profil per ${cfg.unit}</h3>
    <div id="chart-visits" class="relative mt-4 h-56"></div>
  </div>`
}

function portfolioDetail(slug) {
  const b = brands.find((x) => x.slug === slug)
  if (!b) return notFound('Brand tidak ditemukan', 'Halaman yang Anda cari tidak tersedia. Silakan pilih brand dari portofolio.', '#portofolio')
  return `
  <section class="bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-20 pt-36 text-white">
    <div class="mx-auto max-w-[1300px]">
      ${backLinkDark('#portofolio')}
      <div class="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        <div class="grid h-40 w-56 place-items-center overflow-hidden rounded-3xl bg-white px-8 py-6 shadow-2xl"><img src="${A(b.logo)}" alt="Logo ${b.name}" class="max-h-24 w-auto max-w-[160px] object-contain" /></div>
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-sky">Studi Kasus Instagram - ${b.category}</p>
          <h1 class="mt-2 font-display text-4xl font-extrabold sm:text-5xl">${b.name}</h1>
          <p class="mt-1 font-bold text-sky">${b.handle}</p>
          <p class="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">${b.about}</p>
        </div>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-[1300px] px-6 py-14">
    <div id="pd-body" data-slug="${b.slug}">${portfolioBody(b)}</div>
    <div class="mt-14">${postCarousel()}</div>
    <div class="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-mist p-8">
      <p class="font-display text-xl font-extrabold text-navy">Ingin hasil serupa untuk brand Anda?</p>
      <div class="flex flex-wrap gap-3">
        ${gradBtn('#kontak', 'Hubungi Kami')}
        <a href="#portofolio" class="inline-flex items-center gap-2 rounded-full border-2 border-azure px-7 py-3.5 font-bold text-azure transition hover:bg-azure hover:text-white">${ic('ArrowLeft', 18)} Kembali ke Beranda</a>
      </div>
    </div>
  </section>`
}

/* ---------- UPsociety ---------- */
function upsInner() {
  const i = S.ups
  const n = upsSlides.length
  const prev = upsSlides[(i - 1 + n) % n]
  const next = upsSlides[(i + 1) % n]
  const round = 'grid size-11 place-items-center rounded-full bg-white text-ocean shadow-lg transition hover:bg-azure hover:text-white lg:hidden'
  const side = 'group relative hidden h-[60%] overflow-hidden rounded-2xl opacity-50 transition hover:opacity-90 lg:block'
  const full = !!document.fullscreenElement
  return `
  <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5 lg:grid-cols-[1fr_5fr_1fr]">
    <button data-act="ups-step" data-d="-1" aria-label="Slide sebelumnya" class="${side}">
      <img src="${A(prev.src)}" alt="" class="absolute inset-0 size-full object-cover" />
      <span class="absolute inset-0 grid place-items-center bg-deep/20">${ic('ChevronLeft', 44, 'text-white drop-shadow-lg transition group-hover:-translate-x-1')}</span>
    </button>
    <button data-act="ups-step" data-d="-1" aria-label="Slide sebelumnya" class="${round}">${ic('ChevronLeft', 24)}</button>
    <div id="ups-stage" class="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
      <img src="${A(upsSlides[i].src)}" alt="Slide ${i + 1}: ${upsSlides[i].title}" draggable="false" class="aspect-video w-full animate-[fadeUp_.45s_ease-out] select-none object-cover" />
      <button data-act="ups-full" aria-label="Layar penuh" class="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-deep/70 text-white backdrop-blur transition hover:bg-azure">${ic(full ? 'Minimize2' : 'Maximize2', 18)}</button>
      <div class="absolute inset-x-0 bottom-0 h-1.5 bg-white/30"><div class="h-full bg-gradient-to-r from-sky to-azure transition-all duration-500" style="width:${((i + 1) / n) * 100}%"></div></div>
    </div>
    <button data-act="ups-step" data-d="1" aria-label="Slide berikutnya" class="${side}">
      <img src="${A(next.src)}" alt="" class="absolute inset-0 size-full object-cover" />
      <span class="absolute inset-0 grid place-items-center bg-deep/20">${ic('ChevronRight', 44, 'text-white drop-shadow-lg transition group-hover:translate-x-1')}</span>
    </button>
    <button data-act="ups-step" data-d="1" aria-label="Slide berikutnya" class="${round}">${ic('ChevronRight', 24)}</button>
  </div>
  <div class="mt-6 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
    ${upsSlides.map((sl, k) => `
      <button data-act="ups-go" data-i="${k}" aria-label="Ke slide ${k + 1}: ${sl.title}" class="relative w-32 shrink-0 overflow-hidden rounded-xl border-2 transition hover:-translate-y-1 ${k === i ? 'border-azure shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}">
        <img loading="lazy" decoding="async" src="${A(sl.src)}" alt="" class="aspect-video w-full object-cover" />
        <span class="absolute left-1 top-1 rounded bg-deep/70 px-1.5 text-[10px] font-bold text-white">${k + 1}</span>
      </button>`).join('')}
  </div>`
}

function upsocietyPage() {
  const n = upsSlides.length
  return `
  <section class="bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-16 pt-36 text-white">
    <div class="mx-auto max-w-[1300px]">
      ${backLinkDark('#tentang')}
      <div class="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        <div class="grid h-28 w-72 place-items-center rounded-2xl bg-navy shadow-2xl ring-4 ring-white/10"><img src="${A('logos/sub-upsociety.png')}" alt="Logo upsociety" class="h-10 w-auto" /></div>
        <div>
          <p class="text-sm font-bold uppercase tracking-widest text-sky">Anak Perusahaan muda group</p>
          <h1 class="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Social Media Specialist</h1>
          <p class="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">Layanan profesional yang berfokus pada pengelolaan dan pengembangan media sosial suatu brand, perusahaan, atau individu agar dapat membangun citra positif, meningkatkan interaksi dengan audiens, serta mencapai tujuan pemasaran secara efektif di dunia digital.</p>
          <div class="mt-6 flex flex-wrap gap-2">${upsSectors.map((s) => `<span class="rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold transition hover:bg-sky hover:text-navy">${s}</span>`).join('')}</div>
        </div>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-[1300px] px-6 py-14">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-3xl font-extrabold text-navy sm:text-4xl">Portofolio upsociety 2025</h2>
        <p class="mt-1 text-deep/70">Geser slide dengan panah, titik, thumbnail, swipe, atau tombol keyboard kiri dan kanan.</p>
      </div>
      <span id="ups-counter" class="rounded-full bg-mist px-4 py-2 text-sm font-bold text-ocean">Slide ${S.ups + 1} / ${n} - ${upsSlides[S.ups].title}</span>
    </div>
    <div id="ups-box" class="relative rounded-3xl bg-gradient-to-b from-white to-mist/60 p-4 sm:p-8"><div id="ups-inner">${upsInner()}</div></div>

    <div class="mt-20 text-center">
      <p class="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-ocean">${ic('Sparkles', 16)} Kami Berbeda</p>
      <h2 class="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl">Gratis Trial 1 Bulan Pertama</h2>
      <p class="mx-auto mt-3 max-w-xl text-deep/70">Untuk seluruh pelaku usaha, tanpa syarat dan ketentuan. Harga flat per bulan.</p>
    </div>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      ${upsPlans.map((pl) => `
        <article class="group relative flex flex-col rounded-3xl border p-6 transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${pl.hot ? 'border-transparent bg-gradient-to-b from-navy to-ocean text-white' : 'border-mist bg-white'}">
          ${pl.hot ? '<span class="absolute -top-3 right-5 rounded-full bg-cyan px-3 py-1 text-xs font-bold text-white">Populer</span>' : ''}
          <h3 class="font-display text-xl font-extrabold">${pl.name}</h3>
          <p class="mt-1 text-xs ${pl.hot ? 'text-white/70' : 'text-deep/60'}">Mulai dari</p>
          <p class="font-display text-2xl font-extrabold ${pl.hot ? 'text-sky' : 'text-azure'}">${pl.price}</p>
          <ul class="mt-5 flex-1 space-y-2 text-sm">
            ${pl.items.map((it) => `<li class="flex items-start gap-2">${ic('CheckCircle2', 16, `mt-0.5 shrink-0 ${pl.hot ? 'text-sky' : 'text-azure'}`)} ${it}</li>`).join('')}
          </ul>
          <a href="#kontak" class="mt-6 rounded-full py-3 text-center font-bold transition ${pl.hot ? 'bg-white text-navy hover:bg-sky' : 'bg-gradient-to-r from-sky to-azure text-white hover:shadow-lg'}">Pilih Paket</a>
        </article>`).join('')}
    </div>
    <div class="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-mist p-8">
      <p class="font-display text-xl font-extrabold text-navy">Siap mengembangkan media sosial brand Anda?</p>
      <div class="flex flex-wrap gap-3">
        ${gradBtn('#kontak', 'Hubungi Kami')}
        <a href="#tentang" class="inline-flex items-center gap-2 rounded-full border-2 border-azure px-7 py-3.5 font-bold text-azure transition hover:bg-azure hover:text-white">${ic('ArrowLeft', 18)} Kembali ke Beranda</a>
      </div>
    </div>
  </section>`
}

/* ---------- Kontak ---------- */
const contactRow = (icon, label, value, copy, href = '') => `
  <div class="group flex items-start gap-4 rounded-2xl border border-mist bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky to-azure text-white">${ic(icon, 22)}</span>
    <div class="min-w-0 flex-1">
      <p class="text-xs font-bold uppercase tracking-widest text-ocean">${label}</p>
      ${href ? `<a href="${href}" class="mt-1 block break-words font-bold text-navy hover:text-azure">${value}</a>` : `<p class="mt-1 font-bold text-navy">${value}</p>`}
    </div>
    <button data-act="copy" data-v="${esc(copy)}" class="rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-ocean transition hover:bg-azure hover:text-white">Salin</button>
  </div>`

function contactPage() {
  return `
  <section class="bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-28 pt-36 text-white">
    <div class="mx-auto grid max-w-[1300px] items-center gap-12 lg:grid-cols-2">
      <div>
        ${backLinkDark('#beranda')}
        <p class="text-sm font-bold uppercase tracking-widest text-sky">Kontak &amp; Profil</p>
        <h1 class="mt-2 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">Mari ngobrol, <span class="text-sky">kami siap mendengar</span></h1>
        <p class="mt-5 max-w-lg text-lg leading-relaxed text-white/85">Punya ide, pertanyaan, atau ingin konsultasi paket? Hubungi tim muda group lewat kanal di bawah ini. Kami membalas dalam 1x24 jam kerja.</p>
        <div class="mt-8 flex flex-wrap gap-4">
          <a href="https://wa.me/${company.wa}" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 rounded-full bg-cyan px-7 py-3.5 font-bold text-white shadow-lg shadow-cyan/30 transition hover:-translate-y-0.5 hover:bg-sky">${ic('MessageCircle', 18)} Chat WhatsApp</a>
          <a href="mailto:${company.email}" class="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 font-bold transition hover:border-white hover:bg-white/10">${ic('Mail', 18)} Kirim Email</a>
        </div>
      </div>
      <div class="relative">
        <img src="${A('contact/1766066014237-00645c74e9c6.jpg')}" alt="Staf layanan pelanggan muda group dengan headset" class="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl ring-4 ring-white/10" />
        <div class="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-navy shadow-xl sm:-left-8">
          <span class="relative flex size-3"><span class="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span><span class="relative inline-flex size-3 rounded-full bg-green-500"></span></span>
          <div><p class="text-sm font-extrabold">Tim kami online</p><p class="text-xs text-deep/70">${company.hours}</p></div>
        </div>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-[1300px] px-6 py-20">
    <div class="grid gap-5 md:grid-cols-2">
      ${contactRow('MapPin', 'Alamat kantor', company.address, company.address)}
      ${contactRow('Phone', 'Telepon / WhatsApp', company.phone, company.phone, `tel:${company.wa}`)}
      ${contactRow('Mail', 'Email', company.email, company.email, `mailto:${company.email}`)}
      ${contactRow('Radio', 'Jam operasional', company.hours, company.hours)}
    </div>
    <div class="mt-24 grid items-center gap-12 lg:grid-cols-2">
      <img src="${A('contact/1758518727734-98f0a55983b6.jpg')}" alt="Tim muda group berdiskusi di kantor" loading="lazy" class="aspect-[16/10] w-full rounded-[2rem] object-cover shadow-xl" />
      <div>
        <p class="text-sm font-bold uppercase tracking-widest text-ocean">Profil perusahaan</p>
        <h2 class="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl">muda group</h2>
        <p class="mt-4 leading-relaxed text-deep/80">muda group adalah agensi pemasaran digital yang membantu brand tumbuh melalui media sosial, pembuatan konten, iklan berbayar, dan strategi kreatif. Kami bernaung di bawah beberapa anak perusahaan, salah satunya upsociety, spesialis pengelolaan media sosial.</p>
        <ul class="mt-6 grid gap-3 sm:grid-cols-2">
          ${[['Visi', 'Menjadikan setiap brand dikenal dan dipercaya.'], ['Misi', 'Kreatif, terukur, dan dekat dengan klien.'], ['Fokus', 'Media sosial, konten, dan performa.'], ['Klien', 'UMKM hingga lembaga publik.']].map(([t, d]) => `<li class="rounded-2xl bg-mist/60 p-4"><p class="font-display text-lg font-extrabold text-navy">${t}</p><p class="text-sm text-deep/75">${d}</p></li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="mt-20 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-gradient-to-r from-navy to-ocean p-8 text-white">
      <p class="font-display text-xl font-extrabold">Sudah tahu paket yang Anda butuhkan?</p>
      <div class="flex flex-wrap gap-3">
        ${gradBtn('#kontak', 'Isi Client Form')}
        <a href="#beranda" class="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 font-bold transition hover:border-white hover:bg-white/10">${ic('ArrowLeft', 18)} Kembali ke Beranda</a>
      </div>
    </div>
  </section>`
}

/* ---------- Daftar & Masuk ---------- */
const authInput = 'w-full rounded-xl border-2 border-transparent bg-mist/40 px-4 py-3 text-navy outline-none transition placeholder:text-deep/40 focus:border-azure focus:bg-white'

const authField = (label, id, control, hint = '') => `
  <div>
    <label for="${id}" class="mb-1.5 block text-sm font-bold text-navy">${label}</label>
    ${control}
    <p data-err="${id}" role="alert" class="mt-1 text-xs font-bold text-red-600">${hint ? `<span class="font-normal text-deep/60">${hint}</span>` : ''}</p>
  </div>`

const textInput = (id, attrs = '') => `<input id="${id}" name="${id}" class="${authInput}" ${attrs} />`

const pwInput = (id, autocomplete) => `
  <div class="relative">
    <input id="${id}" name="${id}" type="password" autocomplete="${autocomplete}" placeholder="Minimal 8 karakter" class="${authInput} pr-12" />
    <button type="button" data-act="pw-toggle" aria-label="Tampilkan kata sandi" class="absolute right-3 top-1/2 -translate-y-1/2 text-deep/60 hover:text-azure">${ic('Eye', 18)}</button>
  </div>`

const authShell = (title, sub, body) => `
  <section class="min-h-screen bg-gradient-to-b from-navy via-ocean to-[#3b7dbd] px-6 pb-20 pt-36">
    <div class="mx-auto max-w-xl">
      <div class="animate-[fadeUp_.5s_ease-out] rounded-[2rem] bg-white p-7 shadow-2xl sm:p-10">
        <h1 class="font-display text-3xl font-extrabold text-navy sm:text-4xl">${title}</h1>
        <p class="mt-2 text-deep/70">${sub}</p>
        <div class="mt-8">${body}</div>
      </div>
    </div>
  </section>`

const authSubmit = (label) => `<button id="auth-btn" class="w-full rounded-full bg-gradient-to-r from-sky to-azure py-3.5 font-bold text-white shadow-lg shadow-azure/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60">${label}</button>`

/* Pilihan peran: Klien / User atau PIC / Pimpinan */
const roleTabs = (base, role) => `
  <div role="tablist" aria-label="Pilih jenis akun" class="mb-7 grid grid-cols-2 rounded-full bg-mist p-1 text-sm font-bold">
    ${[['user', 'Klien / User', 'User', `#/${base}`], ['pic', 'PIC / Pimpinan', 'Briefcase', `#/${base}/pic`]].map(([id, label, icon, href]) => `
      <a role="tab" aria-selected="${role === id}" href="${href}" class="flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-center transition ${role === id ? 'bg-gradient-to-r from-sky to-azure text-white shadow' : 'text-ocean hover:bg-white'}">${ic(icon, 16)} ${label}</a>`).join('')}
  </div>`

const agreeField = (text) => `
  <div>
    <label class="flex cursor-pointer items-start gap-3 text-sm text-deep/80">
      <input type="checkbox" name="agree" class="mt-0.5 size-4 accent-azure" />
      ${text}
    </label>
    <p data-err="agree" role="alert" class="mt-1 text-xs font-bold text-red-600"></p>
  </div>`

function registerPage(role = 'user') {
  const pic = role === 'pic'
  const fields = pic ? `
      ${authField('Nama lengkap', 'name', textInput('name', 'autocomplete="name" placeholder="Nama sesuai identitas"'))}
      ${authField('Email kantor', 'email', textInput('email', 'type="email" autocomplete="email" placeholder="nama@perusahaan.com"'))}
      <div class="grid gap-5 sm:grid-cols-2">
        ${authField('Jabatan', 'jabatan', textInput('jabatan', 'autocomplete="organization-title" placeholder="mis. Direktur Utama"'))}
        ${authField('Perusahaan', 'company', textInput('company', 'autocomplete="organization" placeholder="mis. muda group"'))}
      </div>` : `
      ${authField('Nama lengkap', 'name', textInput('name', 'autocomplete="name" placeholder="Nama sesuai identitas"'))}
      <div class="grid gap-5 sm:grid-cols-2">
        ${authField('Email', 'email', textInput('email', 'type="email" autocomplete="email" placeholder="nama@email.com"'))}
        ${authField('Nomor HP', 'phone', textInput('phone', 'type="tel" autocomplete="tel" placeholder="0812xxxxxxxx"'))}
      </div>
      ${authField('Nama brand / perusahaan', 'company', textInput('company', 'autocomplete="organization" placeholder="mis. Milkypedia"'), 'Opsional')}`
  return authShell(pic ? 'Daftar Akun PIC' : 'Daftar Akun', pic ? 'Portal khusus pimpinan: pantau cakupan portofolio, performa brand, dan analisis live talent.' : 'Buat akun muda group untuk memantau layanan dan booking jasa Anda.', `
    ${roleTabs('daftar', role)}
    <form id="register-form" data-role="${role}" novalidate class="space-y-5">
      ${fields}
      <div class="grid gap-5 sm:grid-cols-2">
        ${authField('Kata sandi', 'pw', pwInput('pw', 'new-password'))}
        ${authField('Ulangi kata sandi', 'pw2', pwInput('pw2', 'new-password'))}
      </div>
      ${agreeField(pic ? 'Saya memahami data di portal PIC bersifat rahasia dan hanya untuk keperluan internal.' : 'Saya menyetujui syarat dan ketentuan serta kebijakan privasi muda group.')}
      ${authSubmit(pic ? 'Daftar sebagai PIC' : 'Daftar')}
      <p class="text-center text-sm text-deep/70">Sudah punya akun? <a href="#/masuk${pic ? '/pic' : ''}" class="font-bold text-azure hover:underline">Masuk</a></p>
    </form>
    <button type="button" data-act="back-confirm" class="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-azure py-3 font-bold text-azure transition hover:bg-azure hover:text-white">${ic('ArrowLeft', 18)} Kembali ke Beranda</button>`)
}

function loginPage(role = 'user') {
  const pic = role === 'pic'
  return authShell(pic ? 'Masuk Portal PIC' : 'Masuk', pic ? 'Khusus pimpinan dan penanggung jawab (PIC) muda group.' : 'Selamat datang kembali di muda group.', `
    ${roleTabs('masuk', role)}
    <form id="login-form" data-role="${role}" novalidate class="space-y-5">
      ${authField(pic ? 'Email kantor' : 'Email', 'email', textInput('email', `type="email" autocomplete="email" placeholder="${pic ? 'nama@perusahaan.com' : 'nama@email.com'}"`))}
      ${authField('Kata sandi', 'pw', pwInput('pw', 'current-password'))}
      <p id="login-error" role="alert" class="hidden rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"></p>
      ${authSubmit(pic ? 'Masuk ke Portal PIC' : 'Masuk')}
      <p class="text-center text-sm text-deep/70">Belum punya akun? <a href="#/daftar${pic ? '/pic' : ''}" class="font-bold text-azure hover:underline">Daftar</a></p>
    </form>
    <a href="#beranda" class="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-azure py-3 font-bold text-azure transition hover:bg-azure hover:text-white">${ic('ArrowLeft', 18)} Kembali ke Beranda</a>`)
}

function confirmModal() {
  return `
  <div id="confirm-modal" class="fixed inset-0 z-50 grid place-items-center bg-deep/70 p-6 backdrop-blur-sm" data-act="confirm-no-bg">
    <div role="alertdialog" aria-modal="true" aria-labelledby="cb-title" class="w-full max-w-sm animate-[fadeUp_.25s_ease-out] rounded-3xl bg-white p-7 text-center shadow-2xl">
      <h2 id="cb-title" class="font-display text-2xl font-extrabold text-navy">Yakin ingin kembali?</h2>
      <p class="mt-2 text-deep/70">Data yang sudah Anda isi di formulir pendaftaran tidak akan tersimpan.</p>
      <div class="mt-6 grid grid-cols-2 gap-3">
        <button id="confirm-no" data-act="confirm-no" class="rounded-full border-2 border-azure py-3 font-bold text-azure transition hover:bg-mist">Tidak</button>
        <button data-act="confirm-yes" class="rounded-full bg-gradient-to-r from-sky to-azure py-3 font-bold text-white transition hover:shadow-lg">Iya</button>
      </div>
    </div>
  </div>`
}
