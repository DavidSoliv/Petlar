// Cadastro e edição de anúncios pessoais. Os dados ficam no navegador até a integração com o banco.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pet-form');
  if (form) {
    const byId = id => document.getElementById(id);
    const message = byId('pet-form-message');
    const photoInput = byId('pet-photo-file');
    const preview = byId('pet-photo-preview');
    const params = new URLSearchParams(location.search);
    const editId = params.get('editar');
    const readList = () => { try { const data = JSON.parse(localStorage.getItem('petlar-animais-publicados') || '[]'); return Array.isArray(data) ? data : []; } catch (_) { return []; } };
    const session = (() => { try { return JSON.parse(localStorage.getItem('petlar-sessao') || '{}'); } catch (_) { return {}; } })();
    let existing = null;
    let selectedPhotos = [];
    if (editId) {
      existing = readList().find(p => p.id === editId && (!p.ownerEmail || p.ownerEmail === session.email));
      if (!existing) { message.textContent = 'Não foi possível encontrar esse anúncio na sua conta.'; }
      else {
        byId('pet-edit-id').value = existing.id;
        const values = { 'pet-name': existing.name, 'pet-species': existing.species, 'pet-age': existing.age, 'pet-sex': existing.sex, 'pet-size': existing.size, 'pet-color': existing.color, 'pet-coat': existing.coat, 'pet-eyes': existing.eyes, 'pet-vaccinated': existing.vaccinated, 'pet-neutered': existing.neutered, 'pet-city': existing.city, 'pet-description': existing.description, 'pet-contact': existing.contact, 'pet-contact-type': existing.contactType || (String(existing.contact || '').includes('@') ? 'email' : 'whatsapp') };
        Object.entries(values).forEach(([id, value]) => { if (byId(id) && value != null) byId(id).value = value; });
        selectedPhotos = Array.isArray(existing.images) && existing.images.length ? existing.images.slice(0,3) : (existing.image ? [existing.image] : []);
        renderPreview(); photoInput.required = false;
        byId('pet-submit').textContent = 'Salvar alterações';
        document.querySelector('.page-title').textContent = 'Editar anúncio';
        document.querySelector('.page-hero p').textContent = 'Atualize as informações e as fotos do seu animal.';
      }
    } else { photoInput.required = true; }

    function renderPreview() {
      if (!preview) return;
      preview.innerHTML = selectedPhotos.map((src, i) => `<div class="pet-preview-item"><img src="${src}" alt="Foto ${i+1} do animal"><span>Foto ${i+1}</span><button type="button" data-remove-photo="${i}" aria-label="Remover foto ${i+1}">×</button></div>`).join('');
      preview.querySelectorAll('[data-remove-photo]').forEach(button => button.addEventListener('click', () => {
        selectedPhotos.splice(Number(button.dataset.removePhoto), 1); renderPreview();
        if (!selectedPhotos.length && !editId) photoInput.required = true;
      }));
    }
    async function compressPhoto(file) {
      // Reduz as imagens antes de guardar no navegador, para caberem as três fotos no armazenamento local.
      if (!('createImageBitmap' in window)) return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close?.();
      return canvas.toDataURL('image/jpeg', 0.78);
    }
    photoInput?.addEventListener('change', async () => {
      const files = Array.from(photoInput.files || []);
      if (files.length + selectedPhotos.length > 3) { message.textContent = 'Você pode usar no máximo 3 fotos no total. Remova uma foto antes de adicionar outras.'; photoInput.value = ''; return; }
      for (const file of files) {
        if (!file.type.startsWith('image/')) { message.textContent = 'Escolha apenas arquivos de imagem.'; photoInput.value = ''; return; }
        if (file.size > 2 * 1024 * 1024) { message.textContent = 'Cada foto precisa ter até 2 MB.'; photoInput.value = ''; return; }
      }
      try {
        const data = await Promise.all(files.map(compressPhoto));
        selectedPhotos = [...selectedPhotos, ...data].slice(0,3); renderPreview(); message.textContent = '';
        photoInput.required = selectedPhotos.length === 0 && !editId;
      } catch (_) { message.textContent = 'Não foi possível ler uma das fotos. Tente novamente.'; }
      photoInput.value = '';
    });

    byId('pet-contact-type')?.addEventListener('change', () => {
      const isEmail = byId('pet-contact-type').value === 'email';
      byId('pet-contact').type = isEmail ? 'email' : 'tel';
      byId('pet-contact').placeholder = isEmail ? 'nome@exemplo.com' : '(11) 99999-9999';
      byId('pet-contact').autocomplete = isEmail ? 'email' : 'tel';
    });
    byId('pet-contact-type')?.dispatchEvent(new Event('change'));
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!selectedPhotos.length) { message.textContent = 'Adicione pelo menos uma foto do animal.'; return; }
      const list = readList();
      const id = byId('pet-edit-id').value || 'publicado-' + Date.now();
      const previous = list.find(p => p.id === id);
      const pet = {
        ...(previous || {}), id,
        name: byId('pet-name').value.trim(), species: byId('pet-species').value,
        age: byId('pet-age').value.trim(), sex: byId('pet-sex').value, size: byId('pet-size').value,
        city: byId('pet-city').value.trim(), source: 'Pessoa', status: previous?.status || 'Disponível',
        guardian: session.nome || 'Responsável', ownerEmail: session.email || '',
        images: selectedPhotos.slice(0,3), image: selectedPhotos[0],
        description: byId('pet-description').value.trim(), color: byId('pet-color').value.trim(),
        coat: byId('pet-coat').value.trim() || 'Não informado', eyes: byId('pet-eyes').value.trim() || 'Não informado',
        vaccinated: byId('pet-vaccinated').value, neutered: byId('pet-neutered').value,
        contactType: byId('pet-contact-type').value, contact: byId('pet-contact').value.trim()
      };
      try {
        const index = list.findIndex(p => p.id === id);
        if (index >= 0) list[index] = pet; else list.unshift(pet);
        localStorage.setItem('petlar-animais-publicados', JSON.stringify(list));
        location.href = 'perfil.html?animalSalvo=' + encodeURIComponent(id);
      } catch (_) { message.textContent = 'Não foi possível salvar. Tente usar fotos menores.'; }
    });
  }
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', event => { event.preventDefault(); const status = document.getElementById('contact-status'); if (status) status.textContent = 'Mensagem registrada nesta demonstração.'; });
});
