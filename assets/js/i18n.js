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
    localStorage.setItem('portfolio-lang', lang);

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
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    }, { passive: true });
  });

  const architecture = document.querySelector('.architecture');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (architecture && finePointer && !prefersReducedMotion) {
    architecture.addEventListener('pointermove', (event) => {
      const bounds = architecture.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      architecture.style.setProperty('--mx', `${x * 100}%`);
      architecture.style.setProperty('--my', `${y * 100}%`);
      architecture.style.setProperty('--ry', `${(x - .5) * 3.2}deg`);
      architecture.style.setProperty('--rx', `${(.5 - y) * 3.2}deg`);
    }, { passive: true });
    architecture.addEventListener('pointerleave', () => {
      architecture.style.setProperty('--ry', '0deg');
      architecture.style.setProperty('--rx', '0deg');
      architecture.style.setProperty('--mx', '80%');
      architecture.style.setProperty('--my', '10%');
    });
  }
})();
