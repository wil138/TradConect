// Búsqueda pública sobre ejemplos editoriales; no consulta comentarios privados.
document.addEventListener('DOMContentLoaded', () => {
    const search = document.getElementById('commentSearch');
    const type = document.getElementById('commentType');
    if (!search || !type) return;
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const cards = [...document.querySelectorAll('[data-comment-type]')];
    function filter() {
        const term = normalize(search.value.trim());
        let count = 0;
        for (const card of cards) {
            card.hidden = !((type.value === 'todos' || type.value === card.dataset.commentType) && normalize(card.textContent).includes(term));
            if (!card.hidden) count++;
        }
        document.getElementById('commentCount').textContent = count ? `${count} ejemplos encontrados` : 'No hay ejemplos con estos filtros. Prueba otra palabra o selecciona Todos.';
    }
    search.addEventListener('input', filter);
    type.addEventListener('change', filter);
    filter();
});
