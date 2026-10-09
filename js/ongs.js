document.addEventListener('DOMContentLoaded', () => { const q = document.getElementById('ong-query'),
        box = document.getElementById('ong-results');

    function render() { const s = q.value.trim().toLowerCase(); const list = window.PETLAR_ONGS.filter(o => (o.name + ' ' + o.city).toLowerCase().includes(s));
        box.innerHTML = list.length ? list.map(o => PetLar.orgCard(o, true)).join('') : '<div class="empty-state">Nenhuma ONG encontrada.</div>' }
    document.getElementById('ong-search').addEventListener('submit', e => { e.preventDefault();
        render() });
    q.addEventListener('input', render);
    render() });