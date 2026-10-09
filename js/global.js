// Navegação responsiva, acessibilidade e utilitários compartilhados do PetLar.
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const aberto = navigation.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(aberto));
      menuButton.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
  }

  document.querySelectorAll('[data-font]').forEach(button => {
    button.addEventListener('click', () => {
      const atual = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      const passo = button.dataset.font === 'up' ? 1 : -1;
      document.documentElement.style.fontSize = `${Math.min(22, Math.max(12, atual + passo))}px`;
    });
  });

  const motionButton = document.querySelector('[data-motion]');
  if (motionButton) {
    motionButton.addEventListener('click', () => {
      const reduzido = document.body.classList.toggle('reduce-motion');
      motionButton.setAttribute('aria-pressed', String(reduzido));
    });
  }

  document.querySelectorAll('[data-newsletter]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const mensagem = form.parentElement?.querySelector('.newsletter-message');
      if (mensagem) mensagem.textContent = 'Obrigado! Este protótipo ainda não envia e-mails.';
      form.reset();
    });
  });

  // Acesso seguro ao armazenamento local: alguns navegadores podem bloqueá-lo.
  const lerFavoritos = () => {
    try {
      const valor = window.localStorage.getItem('petlar-favorites');
      const lista = valor ? JSON.parse(valor) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (erro) {
      console.warn('O armazenamento local não está disponível neste navegador.', erro);
      return [];
    }
  };
  const salvarFavoritos = lista => {
    try {
      window.localStorage.setItem('petlar-favorites', JSON.stringify(lista));
      return true;
    } catch (erro) {
      console.warn('Não foi possível salvar os favoritos neste navegador.', erro);
      return false;
    }
  };

  const svgHeart = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>';

  // Pets publicados neste navegador e exemplos de outras espécies.
  const extras = [
    {id:'coelho-nuvem',name:'Nuvem',species:'Coelho',age:'8 meses',sex:'Fêmea',size:'Pequeno',city:'São Paulo, SP',source:'ONG',guardian:'Lar dos Bichinhos',image:'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=85',description:'Coelhinha curiosa e tranquila, procura um lar seguro.',color:'Castanho e branco',coat:'Curta',eyes:'Castanhos',vaccinated:'Não informado',neutered:'Não informado'},
    {id:'ave-sol',name:'Sol',species:'Ave',age:'1 ano',sex:'Não informado',size:'Pequeno',city:'Campinas, SP',source:'ONG',guardian:'Asas Livres',image:'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=85',description:'Ave colorida que precisa de cuidados responsáveis e espaço adequado.',color:'Amarelo e verde',coat:'Penas',eyes:'Escuros',vaccinated:'Não informado',neutered:'Não se aplica'},
    {id:'coelho-pipoca',name:'Pipoca',species:'Coelho',age:'2 anos',sex:'Macho',size:'Pequeno',city:'Curitiba, PR',source:'Pessoa',guardian:'Responsável',image:'https://images.unsplash.com/photo-1535241749838-299277b6305f?auto=format&fit=crop&w=900&q=85',description:'Coelho dócil que procura uma família preparada para cuidar dele.',color:'Branco',coat:'Fofa',eyes:'Escuros',vaccinated:'Não informado',neutered:'Não informado'},
    {id:'ave-azul',name:'Azul',species:'Ave',age:'6 meses',sex:'Não informado',size:'Pequeno',city:'Rio de Janeiro, RJ',source:'Pessoa',guardian:'Responsável',image:'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=900&q=85',description:'Ave pequena. Informe-se sobre a espécie e os cuidados antes da adoção.',color:'Azul',coat:'Penas',eyes:'Escuros',vaccinated:'Não informado',neutered:'Não se aplica'}
  ];
  try {
    const publicados = JSON.parse(localStorage.getItem('petlar-animais-publicados') || '[]');
    window.PETLAR_ANIMAIS = [...(window.PETLAR_ANIMAIS || []), ...extras, ...(Array.isArray(publicados) ? publicados : [])];
  } catch (_) { window.PETLAR_ANIMAIS = [...(window.PETLAR_ANIMAIS || []), ...extras]; }

  window.PetLar = {
    animal(id) {
      return (Array.isArray(window.PETLAR_ANIMAIS) ? window.PETLAR_ANIMAIS : []).find(animal => animal.id === id);
    },
    ong(id) {
      return (Array.isArray(window.PETLAR_ONGS) ? window.PETLAR_ONGS : []).find(ong => ong.id === id);
    },
    favorites: lerFavoritos,
    toggleFavorite(id) {
      const atuais = lerFavoritos();
      const proximos = atuais.includes(id) ? atuais.filter(item => item !== id) : [...atuais, id];
      salvarFavoritos(proximos);
      return proximos;
    },
    svg(name) {
      return name === 'heart' ? svgHeart : '';
    },
    petCard(animal) {
      const favoritado = lerFavoritos().includes(animal.id);
      return `<article class="card pet-card">
        <a href="animal-detalhes.html?id=${encodeURIComponent(animal.id)}" aria-label="Ver detalhes de ${animal.name}">
          <img class="pet-photo" src="${animal.image}" alt="Fotografia de ${animal.name}" loading="lazy">
        </a>
        <button type="button" class="favorite ${favoritado ? 'active' : ''}" data-favorite="${animal.id}" aria-label="${favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-pressed="${favoritado}">${svgHeart}</button>
        <div class="pet-info"><span class="tag ${animal.source === 'Pessoa' ? 'person' : ''}">${animal.source || 'Pet'}</span> <span class="tag ${animal.status === 'Adotado' ? 'status-adopted' : ''}">${animal.status || 'Disponível'}</span>
          <h3><a href="animal-detalhes.html?id=${encodeURIComponent(animal.id)}">${animal.name}</a></h3>
          <p>${animal.age || 'Idade não informada'} · ${animal.sex || 'Sexo não informado'}</p>
          <p>${animal.city || 'Localização não informada'}</p>
          <p>${animal.species || 'Espécie não informada'} · ${animal.size || 'Porte não informado'}</p>
        </div></article>`;
    },
    orgCard(ong, large = false) {
      return `<article class="card org-card ${large ? 'large' : ''}">
        <img src="${ong.image || ''}" alt="Imagem representativa de ${ong.name}" loading="lazy">
        <h3>${ong.name}</h3><p>${ong.city || 'Localização não informada'}</p>
        <p>${Number(ong.count) || 0} pets disponíveis <small>(dado demonstrativo)</small></p>
        <a class="btn btn-green" href="ong-detalhes.html?id=${encodeURIComponent(ong.id)}">Conhecer ONG</a>
        <a href="animais-ong.html?id=${encodeURIComponent(ong.id)}">Ver animais</a>
      </article>`;
    }
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const id = button.dataset.favorite;
    const favoritos = window.PetLar.toggleFavorite(id);
    const ativo = favoritos.includes(id);
    button.classList.toggle('active', ativo);
    button.setAttribute('aria-pressed', String(ativo));
    button.setAttribute('aria-label', ativo ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  });
})();
