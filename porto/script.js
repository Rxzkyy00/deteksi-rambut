// ===== Data proyek: edit sesuai karya Anda =====
const projects = [
  { title: 'CleanCorp', desc: 'Peusahaan yang bergerak di bidang kebersihan dan penataan ruang', img: 'cp.png', url: '#' },
  { title: 'Aplikasi Catatan Harian', desc: 'Aplikasi web ringan untuk mencatat, memberi tag, dan mencari catatan dengan cepat.', img: 'https://placehold.co/800x500/111111/E23636?text=Proyek+2', url: '#' },
  { title: 'Landing Page Startup', desc: 'Halaman pendaratan responsif dengan animasi halus dan konversi tinggi.', img: 'https://placehold.co/800x500/111111/E23636?text=Proyek+3', url: '#' },
]

const grid = document.getElementById('project-grid');
grid.innerHTML = projects.map((p, i) => `
  <article class="card reveal group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950" style="transition-delay:${i * 80}ms">
    <div class="overflow-hidden">
      <img src="${p.img}" alt="Thumbnail ${p.title}" loading="lazy" class="h-52 w-full object-cover" />
    </div>
    <div class="flex flex-1 flex-col p-6">
      <h3 class="text-xl font-bold text-white">${p.title}</h3>
      <p class="mt-2 flex-1 text-sm leading-relaxed text-gray-400">${p.desc}</p>
      <a href="${p.url}" target="_blank" rel="noopener"
         class="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-web px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-webdark">
        Lihat Proyek
        <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </div>
  </article>`).join('');

// Reveal saat scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Progress bar scroll di header
const bar = document.getElementById('progress');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
}, { passive: true });

// Tahun di footer
document.getElementById('year').textContent = new Date().getFullYear();
