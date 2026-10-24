window.notifications = {
    init() {
        const toggle = document.getElementById('notificationToggle');
        const menu = document.getElementById('notificationMenu');
        const panel = document.getElementById('notificationPanel');
        if (!toggle || !menu || !panel || this.initialized) return;
        this.initialized = true;
        toggle.addEventListener('click', () => {
            const isOpen = panel.hidden;
            panel.hidden = !isOpen;
            toggle.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) this.refresh();
        });
        document.addEventListener('click', event => {
            if (menu.contains(event.target)) return;
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
        });
        document.getElementById('notificationList').addEventListener('click', event => {
            const button = event.target.closest('[data-notification-module]');
            if (!button) return;
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            window.router?.navigateTo(button.dataset.notificationModule);
        });
        window.addEventListener('storage', event => {
            if (['pedidos_proveedor', 'pedidos_comprador', 'inventario', 'productos', 'userRole'].includes(event.key) || event.key === null) {
                this.refresh();
            }
        });
        this.refresh();
    },

    refresh() {
        const count = document.getElementById('notificationCount');
        const list = document.getElementById('notificationList');
        const summary = document.getElementById('notificationSummary');
        if (!count || !list || !summary) return;
        const authenticated = Boolean(localStorage.getItem('access_token') || localStorage.getItem('userRole'));
        const dashboard = window.dashboard;
        let alerts = [];
        if (authenticated && dashboard?.getBusinessAlerts) {
            dashboard.userRole = localStorage.getItem('userRole') || 'client';
            dashboard.loadFromStorage();
            alerts = dashboard.getBusinessAlerts();
        }
        count.hidden = !alerts.length;
        count.textContent = alerts.length > 99 ? '99+' : String(alerts.length);
        summary.textContent = alerts.length
            ? `${alerts.length} aviso${alerts.length === 1 ? '' : 's'} activo${alerts.length === 1 ? '' : 's'}`
            : 'No hay avisos pendientes';
        list.innerHTML = alerts.length
            ? alerts.map(alert => `
                <article class="notification-item notification-item-${alert.type}">
                    <span class="notification-item-icon" aria-hidden="true"><i class="fas ${this.iconFor(alert.type)}"></i></span>
                    <div class="notification-item-copy">
                        <strong>${appUtils.escapeHtml(alert.title)}</strong>
                        <p>${appUtils.escapeHtml(alert.message)}</p>
                    </div>
                    <button type="button" data-notification-module="${appUtils.escapeHtml(alert.module)}">Revisar</button>
                </article>
            `).join('')
            : '<p class="notification-empty">Aquí aparecerán avisos de pedidos y existencias.</p>';
    },

    iconFor(type) {
        return ({ warning: 'fa-triangle-exclamation', info: 'fa-circle-info', danger: 'fa-circle-exclamation' })[type] || 'fa-bell';
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.notifications.init(), { once: true });
} else {
    window.notifications.init();
}
