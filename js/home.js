// Funcionalidades exclusivas da página inicial do PetLar.
document.addEventListener('DOMContentLoaded', () => {
  const petsContainer = document.getElementById('home-pets');
  const ongsContainer = document.getElementById('home-ongs');
  const animais = Array.isArray(window.PETLAR_ANIMAIS) ? window.PETLAR_ANIMAIS : [];
  const ongs = Array.isArray(window.PETLAR_ONGS) ? window.PETLAR_ONGS : [];

  // Usamos uma função de callback explícita para preservar o objeto PetLar como contexto.
  if (petsContainer && window.PetLar && typeof window.PetLar.petCard === 'function') {
    petsContainer.innerHTML = animais.slice(0, 5).map(animal => window.PetLar.petCard(animal)).join('');
  }

  if (ongsContainer && window.PetLar && typeof window.PetLar.orgCard === 'function') {
    ongsContainer.innerHTML = ongs.slice(0, 5).map(ong => window.PetLar.orgCard(ong)).join('');
  }

  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      const categoria = button.dataset.category || '';
      window.location.href = `animais.html?especie=${encodeURIComponent(categoria)}`;
    });
  });

  const searchForm = document.getElementById('home-search');
  const searchInput = document.getElementById('home-query');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      window.location.href = `animais.html?q=${encodeURIComponent(searchInput.value.trim())}`;
    });
  }
});
