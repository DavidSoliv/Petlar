// Chat demonstrativo do PetLar. Substitua a resposta local pela API/backend quando o banco estiver conectado.
(() => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  if (!form || !input || !messages) return;

  const respostas = [
    { termos: ['adoção', 'adotar', 'adocao'], texto: 'Para adotar, escolha um pet, leia as informações do perfil e entre em contato com a ONG ou responsável indicado. Combine uma conversa e siga os critérios de adoção informados.' },
    { termos: ['cadastro', 'cadastrar', 'publicar', 'animal', 'pet'], texto: 'Você pode começar pela página “Cadastrar um pet”. Prepare fotos nítidas e informações verdadeiras. O envio e a publicação reais serão ativados quando o backend estiver conectado.', link: ['Cadastrar um pet', 'cadastrar-animal.html'] },
    { termos: ['ong', 'organização', 'organizacao'], texto: 'Na página de ONGs você pode consultar as organizações demonstrativas e abrir seus perfis. Os contatos oficiais precisam ser preenchidos pelos responsáveis.' , link: ['Ver ONGs', 'ongs.html'] },
    { termos: ['oi', 'olá', 'ola', 'ajuda', 'obrigado', 'obrigada'], texto: 'Estou aqui para ajudar! Você pode perguntar sobre adoção, cadastro de um animal ou como encontrar uma ONG.' }
  ];
  function adicionar(texto, tipo) {
    const bloco = document.createElement('div'); bloco.className = `message message-${tipo}`;
    const conteudo = document.createElement('span'); conteudo.textContent = texto;
    const hora = document.createElement('small'); hora.textContent = tipo === 'user' ? 'Você · agora' : 'PetLar · agora';
    bloco.append(conteudo, hora); messages.appendChild(bloco); messages.scrollTop = messages.scrollHeight;
  }
  function responder(texto) {
    const normalizado = texto.toLocaleLowerCase('pt-BR');
    const resposta = respostas.find(item => item.termos.some(t => normalizado.includes(t)));
    adicionar(resposta ? resposta.texto : 'Posso ajudar com informações gerais sobre adoção, cadastro de pets e ONGs. Para conversar com o responsável por um animal, use o contato disponível no perfil dele.', 'bot');
    if (resposta?.link) {
      const msg = messages.lastElementChild;
      const link = document.createElement('a'); link.href = resposta.link[1]; link.textContent = resposta.link[0]; link.className = 'chat-inline-link';
      msg.querySelector('span').append(document.createElement('br'), link);
    }
  }
  function enviar(texto) { const limpo = texto.trim(); if (!limpo) return; adicionar(limpo, 'user'); input.value = ''; responder(limpo); input.focus(); }
  form.addEventListener('submit', event => { event.preventDefault(); enviar(input.value); });
  document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => enviar(button.dataset.question || '')));
})();
