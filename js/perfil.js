// Perfil PetLar: dados pessoais, foto e gestão dos animais publicados.
document.addEventListener('DOMContentLoaded', () => {
            const byId = id => document.getElementById(id);
            const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; } };
            const session = read('petlar-sessao', null);
            if (!session) { location.replace('login.html?next=perfil.html'); return; }
            const account = read('petlar-conta', {});
            let profile = read('petlar-perfil', {});
            const fields = {
                'profile-name': profile.nome || account.nome || session.nome || 'Meu perfil',
                'profile-email': session.email || account.email || '',
                'profile-birth': profile.nascimento || account.nascimento || '',
                'profile-gender': profile.sexo || account.sexo || '',
                'profile-cpf': profile.cpf || account.cpf || '',
                'profile-phone': profile.telefone || account.telefone || '',
                'profile-address': profile.endereco || account.endereco || '',
                'profile-city': profile.cidade || account.cidade || '',
                'profile-state': profile.estado || account.estado || ''
            };
            Object.entries(fields).forEach(([id, value]) => { if (byId(id)) byId(id).value = value; });
            const displayName = byId('profile-display-name');
            const displayEmail = byId('profile-display-email');
            if (displayName) displayName.textContent = fields['profile-name'];
            if (displayEmail) displayEmail.textContent = fields['profile-email'];
            const avatar = byId('profile-avatar');
            if (avatar && (profile.foto || account.foto)) avatar.src = profile.foto || account.foto;
            byId('profile-name') ? .addEventListener('input', () => { if (displayName) displayName.textContent = byId('profile-name').value || 'Meu perfil'; });
            byId('profile-photo') ? .addEventListener('change', event => {
                const file = event.target.files && event.target.files[0];
                if (!file) return;
                const message = byId('profile-message');
                if (!file.type.startsWith('image/')) { message.textContent = 'Escolha um arquivo de imagem.'; return; }
                if (file.size > 2 * 1024 * 1024) { message.textContent = 'Escolha uma imagem de até 2 MB.'; return; }
                const reader = new FileReader();
                reader.onload = () => {
                    try { profile = {...profile, foto: reader.result };
                        localStorage.setItem('petlar-perfil', JSON.stringify(profile));
                        avatar.src = reader.result;
                        message.textContent = 'Foto de perfil atualizada!'; } catch (_) { message.textContent = 'Não foi possível guardar a foto neste navegador. Escolha uma imagem menor.'; }
                };
                reader.readAsDataURL(file);
            });
            byId('profile-form') ? .addEventListener('submit', event => {
                event.preventDefault();
                const next = {...profile, nome: byId('profile-name').value.trim(), email: fields['profile-email'], nascimento: byId('profile-birth').value, sexo: byId('profile-gender').value, cpf: byId('profile-cpf').value.trim(), telefone: byId('profile-phone').value.trim(), endereco: byId('profile-address').value.trim(), cidade: byId('profile-city').value.trim(), estado: byId('profile-state').value.trim(), foto: profile.foto || '' };
                try { localStorage.setItem('petlar-perfil', JSON.stringify(next));
                    localStorage.setItem('petlar-sessao', JSON.stringify({...session, nome: next.nome }));
                    profile = next;
                    displayName.textContent = next.nome;
                    byId('profile-message').textContent = 'Seus dados foram salvos!'; } catch (_) { byId('profile-message').textContent = 'Não foi possível salvar os dados neste navegador.'; }
            });
            byId('profile-logout') ? .addEventListener('click', () => { localStorage.removeItem('petlar-sessao');
                location.href = 'login.html'; });

            // Renderiza apenas os animais publicados pela conta conectada.
            const posts = byId('profile-posts');

            function renderPets() {
                if (!posts) return;
                const all = read('petlar-animais-publicados', []);
                const mine = all.filter(p => p.ownerEmail === session.email || (!p.ownerEmail && p.guardian === session.nome));
                if (!mine.length) { posts.innerHTML = '<p class="muted">Seus animais cadastrados aparecerão aqui.</p>'; return; }
                posts.innerHTML = mine.map(p => {
                            const status = p.status || 'Disponível';
                            const photos = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
                            return `<article class="profile-pet-item profile-pet-card ${status === 'Adotado' ? 'is-adopted' : ''}"><div class="profile-pet-photos">${photos.slice(0,3).map((src,i) => `<img src="${src}" alt="Foto ${i+1} de ${escapeText(p.name)}">`).join('')}</div><div class="profile-pet-copy"><strong>${escapeText(p.name || 'Meu pet')}</strong><span>${escapeText(p.species || '')} · ${escapeText(p.age || '')} · ${escapeText(p.city || '')}</span><label for="status-${escapeText(p.id)}">Status da adoção</label><select id="status-${escapeText(p.id)}" data-pet-status="${escapeText(p.id)}"><option value="Disponível" ${status === 'Disponível' ? 'selected' : ''}>Disponível para adoção</option><option value="Em processo" ${status === 'Em processo' ? 'selected' : ''}>Adoção em processo</option><option value="Adotado" ${status === 'Adotado' ? 'selected' : ''}>Adotado ❤️</option></select><div class="profile-pet-actions"><a class="btn btn-outline" href="animal-detalhes.html?id=${encodeURIComponent(p.id)}">Ver anúncio</a><a class="btn btn-green" href="cadastrar-animal.html?editar=${encodeURIComponent(p.id)}">Editar</a><button class="btn btn-outline" type="button" data-delete-pet="${escapeText(p.id)}">Excluir</button></div></div></article>`;
    }).join('');
    posts.querySelectorAll('[data-pet-status]').forEach(select => select.addEventListener('change', () => {
      const list = read('petlar-animais-publicados', []); const pet = list.find(p => p.id === select.dataset.petStatus);
      if (pet && pet.ownerEmail === session.email) { pet.status = select.value; localStorage.setItem('petlar-animais-publicados', JSON.stringify(list)); }
      select.closest('.profile-pet-card')?.classList.toggle('is-adopted', select.value === 'Adotado');
      byId('profile-message').textContent = select.value === 'Adotado' ? 'Que alegria! O status foi atualizado para adotado.' : 'Status do animal atualizado.';
    }));
    posts.querySelectorAll('[data-delete-pet]').forEach(button => button.addEventListener('click', () => {
      const petId = button.dataset.deletePet; const card = button.closest('.profile-pet-card');
      if (!confirm('Tem certeza de que deseja excluir este anúncio? Essa ação não pode ser desfeita.')) return;
      const list = read('petlar-animais-publicados', []); const pet = list.find(p => p.id === petId);
      if (!pet || pet.ownerEmail !== session.email) { byId('profile-message').textContent = 'Não foi possível excluir este anúncio.'; return; }
      localStorage.setItem('petlar-animais-publicados', JSON.stringify(list.filter(p => p.id !== petId)));
      card?.remove(); byId('profile-message').textContent = 'Anúncio excluído.';
      if (!posts.querySelector('.profile-pet-card')) posts.innerHTML = '<p class="muted">Seus animais cadastrados aparecerão aqui.</p>';
    }));
  }
  function escapeText(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  renderPets();
});