// utils/table.js
function setupTableFilters({ containerSelector, tabSelector, searchInputSelector, filterCallback }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Eventos de pestañas
    container.querySelectorAll(tabSelector).forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll(tabSelector).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterCallback();
        });
    });

    // Búsqueda
    const searchInput = container.querySelector(searchInputSelector);
    if (searchInput) {
        searchInput.addEventListener('input', filterCallback);
    }
}

function getActiveFilter(containerSelector, tabSelector) {
    const activeBtn = document.querySelector(`${containerSelector} ${tabSelector}.active`);
    return activeBtn ? activeBtn.dataset.filter : 'todos';
}

function getSearchTerm(containerSelector, searchInputSelector) {
    const input = document.querySelector(`${containerSelector} ${searchInputSelector}`);
    return input ? input.value.toLowerCase() : '';
}

