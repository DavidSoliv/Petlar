// Proteção de navegação do PetLar: só login e cadastro ficam públicos.
(() => {
  const openPages = new Set(['login.html', 'cadastro.html']);
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const logged = !!localStorage.getItem('petlar-sessao');
  const destination = current + location.search + location.hash;
  const loginUrl = 'login.html?next=' + encodeURIComponent(destination);
  // Proteção antecipada: páginas internas não devem aparecer antes do login.
  if (!openPages.has(current) && !logged) { location.replace(loginUrl); return; }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || localStorage.getItem('petlar-sessao')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
    const file = href.split(/[?#]/)[0].split('/').pop().toLowerCase();
    if (!openPages.has(file)) { event.preventDefault(); location.href = 'login.html?next=' + encodeURIComponent(href); }
  });
  document.addEventListener('click', event => {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite && !localStorage.getItem('petlar-sessao')) {
      event.preventDefault(); event.stopImmediatePropagation();
      location.href = 'login.html?next=' + encodeURIComponent('favoritos.html');
    }
  }, true);
})();
