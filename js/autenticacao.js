// Validações de interface para cadastro e login.
// Importante: este arquivo não cria contas nem autentica usuários sem um backend seguro.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-toggle-password]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      const mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';
      button.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      button.innerHTML = mostrar ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0112 5c6.5 0 10 7 10 7a15.5 15.5 0 01-3.2 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
      button.setAttribute('aria-pressed', String(mostrar));
    });
  });

  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', () => {
      let valor = cpfInput.value.replace(/\D/g, '').slice(0, 11);
      if (valor.length > 9) valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
      else if (valor.length > 6) valor = valor.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
      else if (valor.length > 3) valor = valor.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
      cpfInput.value = valor;
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', event => {
      event.preventDefault();
      const message = document.getElementById('register-message');
      const password = document.getElementById('register-password');
      const confirmPassword = document.getElementById('confirm-password');
      const birthInput = document.getElementById('birth');
      const cpf = cpfInput ? cpfInput.value.replace(/\D/g, '') : '';
      if (!message || !password || !confirmPassword || !birthInput) return;

      if (password.value !== confirmPassword.value) {
        message.textContent = 'As senhas não coincidem.';
        confirmPassword.focus();
        return;
      }
      if (cpfInput && (cpf.length !== 11 || /^(\d)\1+$/.test(cpf))) {
        message.textContent = 'Confira o CPF informado.';
        cpfInput.focus();
        return;
      }
      const nascimento = birthInput.value ? new Date(`${birthInput.value}T00:00:00`) : null;
      if (!nascimento || Number.isNaN(nascimento.getTime()) || nascimento > new Date()) {
        message.textContent = 'Informe uma data de nascimento válida.';
        birthInput.focus();
        return;
      }
      const conta = { nome: document.getElementById('full-name')?.value.trim() || 'Usuário PetLar', email: document.getElementById('register-email')?.value.trim().toLowerCase(), senha: password.value, nascimento: birthInput.value, cpf: cpfInput?.value.trim() || '', sexo: document.getElementById('gender')?.value || '' };
      localStorage.setItem('petlar-conta', JSON.stringify(conta));
      message.textContent = 'Cadastro concluído! Agora entre com seu e-mail e senha.';
      setTimeout(() => { window.location.href = 'login.html'; }, 700);
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      const message = document.getElementById('login-message');
      const email = document.getElementById('login-email')?.value.trim().toLowerCase();
      const senha = document.getElementById('login-password')?.value || '';
      let conta = null;
      try { conta = JSON.parse(localStorage.getItem('petlar-conta') || 'null'); } catch (_) {}
      const emailDemo = 'manusilva@gmail.com';
      const senhaDemo = '12345';
      const valido = (email === emailDemo && senha === senhaDemo) || (conta && email === conta.email && senha === conta.senha);
      if (!valido) { if (message) message.textContent = 'E-mail ou senha incorretos. Confira os dados e tente novamente.'; return; }
      localStorage.setItem('petlar-sessao', JSON.stringify({ email, nome: conta?.nome || 'Manu Silva' }));
      const next = new URLSearchParams(window.location.search).get('next');
      const allowed = new Set(['index.html','animais.html','animais-ong.html','animal-detalhes.html','cadastrar-animal.html','favoritos.html','perfil.html','chat.html','ongs.html','ong-detalhes.html','sobre.html','como-funciona.html','contato.html']);
      // Sem destino explícito, a pessoa entra primeiro no próprio perfil.
      const destino = next ? next.split(/[?#]/)[0].split('/').pop() : '';
      window.location.href = next && allowed.has(destino) ? next : 'perfil.html';
    });
  }

  const forgotPassword = document.getElementById('forgot-password');
  if (forgotPassword) {
    forgotPassword.addEventListener('click', event => {
      event.preventDefault();
      const message = document.getElementById('login-message');
      if (message) message.textContent = 'A recuperação de senha precisa ser configurada em um serviço de autenticação.';
    });
  }
});
