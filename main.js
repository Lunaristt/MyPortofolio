// ── SECTION LOADER ──
// Fetches each section partial and injects it into #app in order.
// All observers and GitHub logic run only after all sections are mounted.

const SECTIONS = ['home.html', 'about.html', 'education.html', 'work.html', 'org.html', 'repo.html'];

async function loadSections() {
  const app = document.getElementById('app');

  for (const file of SECTIONS) {
    try {
      const res = await fetch(file);
      const html = await res.text();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      // Append each child node (the <section> element) into #app
      while (temp.firstElementChild) {
        app.appendChild(temp.firstElementChild);
      }
    } catch (err) {
      console.error(`Failed to load section: ${file}`, err);
    }
  }

  // All sections are in the DOM — now boot everything
  initCursor();
  initNav();
  initReveal();
  initPhotoReveal();
  loadGitHub();
}


// ── CURSOR ──
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  })();
}


// ── ACTIVE NAV ON SCROLL ──
function initNav() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}


// ── SCROLL REVEAL ──
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i % 4) * 0.12 + 's';
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Expose so GitHub repo cards can be observed after dynamic injection
  window._revealObserver = observer;
}


// ── ABOUT PHOTO REVEAL ──
function initPhotoReveal() {
  const photo = document.getElementById('profilePhoto');
  if (!photo) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.3 });

  observer.observe(photo);
}


// ── GITHUB API ──
const GITHUB_USER = 'Lunaristt';

async function loadGitHub() {
  try {
    // Load profile photo
    const profileRes = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
    if (profileRes.ok) {
      const profile = await profileRes.json();
      const photo = document.getElementById('profilePhoto');
      if (photo) {
        photo.src = profile.avatar_url;
        photo.onerror = () => {
          photo.parentElement.innerHTML =
            `<div class="about-photo-placeholder">No photo available</div>`;
        };
      }
      const footerGH = document.getElementById('footerGH');
      if (footerGH) footerGH.textContent = 'github.com/' + profile.login;
    }

    // Load repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`
    );
    const grid = document.getElementById('reposGrid');
    const loadMsg = document.getElementById('loadingMsg');
    if (loadMsg) loadMsg.remove();

    if (!reposRes.ok) {
      grid.innerHTML = '<p class="loading-msg">Could not load repositories.</p>';
      return;
    }

    const repos = await reposRes.json();
    const filtered = repos.filter(r => !r.fork);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="loading-msg">No public repositories found.</p>';
      return;
    }

    filtered.forEach((repo, idx) => {
      const card = document.createElement('a');
      card.className = 'repo-card reveal';
      card.href = repo.html_url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.transitionDelay = (idx % 4) * 0.1 + 's';
      card.innerHTML = `
        <div class="repo-name">${repo.name}</div>
        <div class="repo-desc">${repo.description || 'No description provided.'}</div>
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-lang">${repo.language}</span>` : ''}
          ${repo.updated_at ? `<span>${new Date(repo.updated_at).getFullYear()}</span>` : ''}
        </div>`;
      grid.appendChild(card);
      if (window._revealObserver) window._revealObserver.observe(card);
    });

  } catch (err) {
    console.error(err);
    const msg = document.getElementById('loadingMsg');
    if (msg) msg.textContent = 'Failed to load GitHub data.';
  }
}


// ── BOOT ──
loadSections();
