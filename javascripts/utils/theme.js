// Tema compartido por el shell SPA y las páginas informativas.
window.theme = {
    key: 'tradconnect_theme',
    preference: null,
    media: window.matchMedia('(prefers-color-scheme: dark)'),
    read() {
        try { return localStorage.getItem(this.key); } catch { return null; }
    },
    apply(value) {
        const dark = value === 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            button.setAttribute('aria-pressed', String(dark));
            button.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
            button.title = dark ? 'Activar modo claro' : 'Activar modo oscuro';
            button.textContent = dark ? '\u2600 Modo claro' : '\u263e Modo oscuro';
        });
        // Actualiza también los gráficos que ya están visibles, sin recargar módulos.
        const Chart = window.Chart;
        if (!Chart) return;
        const color = dark ? '#cbd5e1' : '#64748b';
        const grid = dark ? '#334155' : '#e2e8f0';
        Chart.defaults.color = color;
        Chart.defaults.borderColor = grid;
        Object.values(Chart.instances || {}).forEach(chart => {
            if (chart.$tradconnectTheme === value) return;
            chart.$tradconnectTheme = value;
            if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = color;
            for (const scale of Object.values(chart.options.scales || {})) {
                if (scale.ticks) scale.ticks.color = color;
                if (scale.grid) scale.grid.color = grid;
            }
            chart.update('none');
        });
    },
    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.apply(this.preference || (this.media.matches ? 'dark' : 'light'));
        document.documentElement.dataset.themeReady = 'true';
        document.addEventListener('click', event => {
            if (!event.target.closest('[data-theme-toggle]')) return;
            this.preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem(this.key, this.preference); } catch { /* El tema funciona sin almacenamiento. */ }
            this.apply(this.preference);
        });
        const main = document.getElementById('main-view');
        if (main) {
            this.observer = new MutationObserver(() => {
                cancelAnimationFrame(this.frame);
                this.frame = requestAnimationFrame(() => this.apply(document.documentElement.dataset.theme));
            });
            this.observer.observe(main, { childList: true, subtree: true });
        }
        this.media.addEventListener('change', event => {
            if (!this.preference) this.apply(event.matches ? 'dark' : 'light');
        });
        window.addEventListener('storage', event => {
            if (event.key !== this.key && event.key !== null) return;
            this.preference = ['dark', 'light'].includes(event.newValue) ? event.newValue : null;
            this.apply(this.preference || (this.media.matches ? 'dark' : 'light'));
        });
    }
};
window.theme.preference = window.theme.read();
if (!['dark', 'light'].includes(window.theme.preference)) window.theme.preference = null;
document.documentElement.dataset.theme = window.theme.preference || (window.theme.media.matches ? 'dark' : 'light');
document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
