// Interacciones de la landing, sin consultar ni modificar datos de negocio.
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('landing-wrapper');
    if (!root) return;
    const requestedRole = new URLSearchParams(window.location.search).get('registro');
    if (['client', 'provider'].includes(requestedRole)) {
        openRegisterModal();
        document.getElementById('regRole').value = requestedRole;
        document.getElementById('regName').focus();
        const url = new URL(window.location.href);
        url.searchParams.delete('registro');
        history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
    const journeys = {
        client: [
            ['Encuentra productos', 'Encuentra lo que tu cocina necesita', 'Explora el marketplace y revisa la informaci\u00f3n disponible antes de elegir.', ['Busca productos', 'Explora categor\u00edas', 'Organiza tu carrito']],
            ['Organiza tus pedidos', 'Tus compras, en un solo lugar', 'Consulta tus pedidos y revisa su estado para planificar el abastecimiento.', ['Historial de compras', 'Detalle de productos', 'Documentos en CSV e impresi\u00f3n']],
            ['Entiende tus compras', 'Convierte tu historial en informaci\u00f3n', 'Revisa importes por fecha y moneda para entender c\u00f3mo compra tu negocio.', ['Compras por mes', 'Productos y categor\u00edas', 'Reportes descargables']]
        ],
        provider: [
            ['Presenta tus productos', 'Haz visible tu oferta', 'Administra tus productos e inventario para preparar tu oferta a los restaurantes.', ['Gesti\u00f3n del cat\u00e1logo', 'Existencias disponibles', 'Informaci\u00f3n de productos']],
            ['Gestiona tus pedidos', 'Da seguimiento a cada venta', 'Revisa los pedidos recibidos y actualiza sus estados desde tu espacio de trabajo.', ['Pedidos por estado', 'Detalle de cada venta', 'Documentos para tu operaci\u00f3n']],
            ['Analiza tus ventas', 'Conoce el movimiento de tu negocio', 'Consulta importes, productos y clientes en el per\u00edodo que necesites.', ['Ventas por mes y moneda', 'Productos destacados', 'Reportes en CSV e impresi\u00f3n']]
        ]
    };
    let role = 'client', step = 0;
    function renderTour() {
        const journey = journeys[role];
        root.querySelectorAll('[data-tour-role]').forEach(button => {
            const active = button.dataset.tourRole === role;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        root.querySelectorAll('[data-tour-step]').forEach(button => {
            const index = Number(button.dataset.tourStep), active = index === step;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
            document.getElementById(`tourStep${index}`).textContent = journey[index][0];
        });
        document.getElementById('tourHeading').textContent = journey[step][1];
        document.getElementById('tourDescription').textContent = journey[step][2];
        const list = document.getElementById('tourHighlights');
        list.replaceChildren(...journey[step][3].map(text => {
            const item = document.createElement('li'); item.textContent = text; return item;
        }));
        document.getElementById('tourRegister').textContent = role === 'client' ? 'Crear mi cuenta de restaurante' : 'Crear mi cuenta de proveedor';
    }
    root.querySelectorAll('[data-tour-role]').forEach(button => button.addEventListener('click', () => { role = button.dataset.tourRole; renderTour(); }));
    root.querySelectorAll('[data-tour-step]').forEach(button => button.addEventListener('click', () => { step = Number(button.dataset.tourStep); renderTour(); }));
    document.getElementById('tourRegister').addEventListener('click', () => {
        openRegisterModal();
        document.getElementById('regRole').value = role;
        document.getElementById('regName').focus();
    });
    const orders = document.getElementById('planningOrders'), minutes = document.getElementById('planningMinutes');
    function updateEstimate() {
        document.getElementById('planningOrdersValue').value = orders.value;
        document.getElementById('planningMinutesValue').value = minutes.value;
        document.getElementById('planningResult').value = `${(Number(orders.value) * Number(minutes.value) * 4 / 60).toLocaleString('es-NI', { maximumFractionDigits: 1 })} horas / mes`;
    }
    orders.addEventListener('input', updateEstimate);
    minutes.addEventListener('input', updateEstimate);
    updateEstimate();
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    document.getElementById('landingFaqSearch').addEventListener('input', event => {
        const term = normalize(event.target.value.trim());
        let count = 0;
        root.querySelectorAll('.faq-item').forEach(item => {
            item.hidden = !normalize(item.textContent).includes(term);
            if (!item.hidden) count++;
        });
        document.getElementById('faqSearchStatus').textContent = term ? `${count} respuestas encontradas` : '';
    });
    const confirm = document.getElementById('regConfirmPassword');
    const password = document.getElementById('regPassword');
    function checkConfirmation() { confirm.setCustomValidity(confirm.value && confirm.value !== password.value ? 'Las contrase\u00f1as no coinciden.' : ''); }
    confirm.addEventListener('input', checkConfirmation);
    password.addEventListener('input', checkConfirmation);
    // Los FAQ existentes tambi\u00e9n se pueden abrir con teclado.
    root.querySelectorAll('.faq-question').forEach(question => {
        question.tabIndex = 0;
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        question.addEventListener('click', () => {
            const expanded = question.getAttribute('aria-expanded') !== 'true';
            question.nextElementSibling.style.display = expanded ? 'block' : 'none';
            question.setAttribute('aria-expanded', String(expanded));
            const icon = question.querySelector('i');
            if (icon) icon.className = expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        });
        question.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); question.click(); }
        });
    });
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (document.getElementById('landingRegisterModal').style.display === 'flex') closeRegisterModal();
        if (document.getElementById('landingLoginModal').style.display === 'flex') closeLoginModal();
    });
});
