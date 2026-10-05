(() => {
  const supported = new Set(['en', 'zh-Hant']);
  const root = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-lang-option]')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyLanguage(language) {
    const lang = supported.has(language) ? language : 'en';
    const key = lang === 'zh-Hant' ? 'zh' : 'en';

    root.lang = lang;
    root.dataset.lang = lang;
    try { localStorage.setItem('portfolio-lang', lang); } catch (_) { /* Storage may be disabled. */ }

    document.querySelectorAll('[data-en][data-zh]').forEach((element) => {
      element.textContent = element.dataset[key];
    });

    document.querySelectorAll('[data-en-html][data-zh-html]').forEach((element) => {
      element.innerHTML = element.dataset[`${key}Html`];
    });

    document.querySelectorAll('[data-alt-en][data-alt-zh]').forEach((element) => {
      element.alt = element.dataset[`alt${key === 'zh' ? 'Zh' : 'En'}`];
    });

    languageButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.langOption === lang));
    });

    document.title = lang === 'zh-Hant'
      ? '王璽鑄｜數位 IC、記憶體可靠度與 HBM-PIM'
      : 'Xi-Zhu Wang | Digital IC, Memory Reliability & HBM-PIM';
  }

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.langOption));
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  applyLanguage(root.dataset.lang);

  const progress = document.querySelector('.scroll-progress');
  let ticking = false;
  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0;
    progress?.style.setProperty('--progress', `${value}%`);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const nav = document.querySelector('.nav');
  nav.id = 'section-navigation';
  const menu = document.createElement('button');
  menu.className = 'menu-toggle';
  menu.type = 'button';
  menu.textContent = '☰';
  menu.setAttribute('aria-label', 'Navigation / 導覽');
  menu.setAttribute('aria-controls', nav.id);
  menu.setAttribute('aria-expanded', 'false');
  document.querySelector('.header-actions').prepend(menu);
  function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
  const sectionById = new Map(
    navLinks
      .map((link) => [link.getAttribute('href').slice(1), link])
      .filter(([id]) => document.getElementById(id))
  );
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.removeAttribute('aria-current'));
    sectionById.get(visible.target.id)?.setAttribute('aria-current', 'true');
  }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, .15, .35] });
  sectionById.forEach((_, id) => sectionObserver.observe(document.getElementById(id)));

  const revealGroups = [
    ['.hero-copy, .architecture', 90],
    ['.section-heading, .research-copy, .contact-inner > *', 80],
    ['.competency-grid article, .scope-grid article, .project-card, .implementation-card, .repo-group, .flow-grid div, .skills-grid div, .timeline article', 65]
  ];
  const revealElements = [];
  revealGroups.forEach(([selector, stagger]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--delay', `${Math.min(index % 4, 3) * stagger}ms`);
      revealElements.push(element);
    });
  });

  root.classList.add('js-ready');
  if (prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: .06 });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  document.querySelectorAll('.project-card').forEach((card, index) => {
    card.dataset.index = String(index + 1).padStart(2, '0');
  });

  // Native dialog supplies Escape dismissal, focus containment and focus return.
  const dialog = document.createElement('dialog');
  dialog.className = 'layout-dialog';
  dialog.setAttribute('aria-label', 'Physical layout viewer / 實體佈局檢視');
  dialog.innerHTML = '<button type="button" class="layout-close" aria-label="Close image / 關閉圖片">×</button><img alt=""><p></p>';
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.querySelectorAll('.implementation-card figure').forEach((figure) => {
    const image = figure.querySelector('img');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'layout-zoom';
    button.setAttribute('aria-label', `View full layout / 放大佈局圖: ${image.alt}`);
    image.replaceWith(button);
    button.append(image);
    const hint = document.createElement('span');
    hint.textContent = '↗';
    hint.setAttribute('aria-hidden', 'true');
    button.append(hint);
    button.addEventListener('click', () => {
      dialog.querySelector('img').src = image.src;
      dialog.querySelector('img').alt = image.alt;
      dialog.querySelector('p').textContent = figure.closest('article').querySelector('h3').textContent;
      dialog.showModal();
    });
  });

  document.querySelectorAll('[data-precision]').forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.dataset.precision;
      document.querySelectorAll('[data-precision]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('.precision-demo').classList.toggle('int4', mode === 'INT4');
      document.getElementById('retention-number').textContent = mode === 'INT4' ? '59.7%' : '100.0%';
      const summary = document.getElementById('precision-summary');
      summary.dataset.en = mode === 'INT4' ? 'INT4: 59.7% GSM8K retention, with higher peak throughput in this example. Lower precision requires task-quality validation.' : 'FP16 is the quality reference. INT4 trades some quality for higher peak throughput in this example.';
      summary.dataset.zh = mode === 'INT4' ? 'INT4：此例保留 59.7% GSM8K 品質並提升峰值吞吐量；降低精度需要驗證任務品質。' : 'FP16 為品質基準；此例中，INT4 以部分品質換取更高峰值吞吐量。';
      summary.textContent = summary.dataset[root.lang === 'zh-Hant' ? 'zh' : 'en'];
    });
  });
})();
