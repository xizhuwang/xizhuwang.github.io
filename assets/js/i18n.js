(() => {
  const supported = new Set(['en', 'zh-Hant']);
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-lang-option]')];

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

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.langOption === lang));
    });

    document.title = lang === 'zh-Hant'
      ? '王璽鑄｜數位 IC、SoC 與 HBM-PIM'
      : 'Xi-Zhu Wang | Digital IC, SoC & HBM-PIM';
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.langOption));
  });

  document.getElementById('year').textContent = new Date().getFullYear();
  applyLanguage(root.dataset.lang);
})();
