// dashboard.js - VERSIÓN COMPLETAMENTE BASADA EN localStorage (sin peticiones extra)
window.dashboard = {
    data: null,
    salesData: null,
    recentOrders: [],
    userRole: 'provider', // o 'client' según corresponda

    init: function() {
        console.log("📊 Dashboard: Inicializando");
        this.userRole = localStorage.getItem('userRole') || 'provider';
        // Cargar datos desde localStorage (ya actualizados por refreshFullData)
        this.loadFromStorage();
        // Renderizar todo
        this.renderKPIs();
        this.renderCharts();
        this.renderRecentOrders();
        // Escuchar cambios en localStorage (para actualizar si otro módulo modifica datos)
        this.setupStorageListener();
    },

    // ========== CARGA DESDE LOCALSTORAGE ==========
    loadFromStorage: function() {
        // Productos
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        // Inventario (para stock)
        const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
        // Pedidos según rol
        const key = this.userRole === 'provider' ? 'pedidos_proveedor' : 'pedidos_comprador';
        const pedidos = JSON.parse(localStorage.getItem(key) || '[]');

        // Estadísticas (si existen, pueden usarse para complementar)
        const stats = JSON.parse(localStorage.getItem('estadisticas') || '{}');

        console.log(`📦 Datos cargados: ${productos.length} productos, ${pedidos.length} pedidos`);

        // ====== CALCULAR KPIs ======
        const total_ventas = pedidos.reduce((sum, p) => sum + (parseFloat(p.totalneto) || 0), 0);
        const total_pedidos = pedidos.length;
        // Productos con stock bajo (umbral 10)
        const stockBajo = inventario.filter(i => (i.stockdisponible || 0) < 10).length;

        // ====== DATOS PARA GRÁFICO DE VENTAS MENSUALES ======
        const ventasPorMes = {};
        pedidos.forEach(p => {
            if (p.fechapedido) {
                const fecha = new Date(p.fechapedido);
                const mes = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}`;
                ventasPorMes[mes] = (ventasPorMes[mes] || 0) + (parseFloat(p.totalneto) || 0);
            }
        });
        // Ordenar por mes
        const mesesOrdenados = Object.keys(ventasPorMes).sort();
        const labels = mesesOrdenados.map(m => {
            const [year, month] = m.split('-');
            return new Date(year, month-1).toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        });
        const data = mesesOrdenados.map(m => ventasPorMes[m]);

        // ====== PEDIDOS RECIENTES (últimos 5) ======
        const recent = [...pedidos]
            .sort((a, b) => new Date(b.fechapedido) - new Date(a.fechapedido))
            .slice(0, 5);

        // Guardar en this
        this.data = { total_ventas, total_pedidos, stockBajo };
        this.salesData = { labels, data };
        this.recentOrders = recent;

        // También actualizar estadísticas en localStorage si quieres cachear los cálculos
        const updatedStats = {
            ...stats,
            total_ventas,
            total_pedidos,
            stock_bajo: stockBajo,
            ventas_mensuales: ventasPorMes
        };
        localStorage.setItem('estadisticas', JSON.stringify(updatedStats));

        console.log("📊 Datos procesados:", this.data);
        console.log("📈 Ventas por mes:", this.salesData);
    },

    // ========== RENDERIZADO DE KPIs ==========
    renderKPIs: function() {
        const data = this.data || { total_ventas: 0, total_pedidos: 0, stockBajo: 0 };

        const kpis = {
            "ventas": `$${data.total_ventas.toFixed(2)}`,
            "pedidos": data.total_pedidos,
            "stock": data.stockBajo,
            // Otros indicadores (puedes calcular o dejar estáticos)
            "vs": "+12.5% vs ayer",   // Podrías calcular tendencia comparando con mes anterior
            "urge": `${data.stockBajo} urgente`,
            "critic": data.stockBajo > 10 ? "Inventario crítico" : "Inventario saludable",
            "newc": "+3 esta semana", // Podrías calcular nuevos pedidos en los últimos 7 días
            "clientes": 12            // Si tienes clientes en dump-all, puedes calcular
        };

        for (const [id, valor] of Object.entries(kpis)) {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = valor;
                el.style.color = '#333';
            }
        }
    },

    // ========== GRÁFICOS ==========
    renderCharts: function() {
        if (typeof Chart === 'undefined') {
            console.warn("⚠️ Chart.js no está disponible");
            return;
        }

        const sales = this.salesData || { labels: ['Ene','Feb','Mar','Abr','May','Jun'], data: [0,0,0,0,0,0] };

        // Si no hay datos, mostrar mensaje o gráfico vacío
        if (sales.data.length === 0) {
            sales.labels = ['Sin datos'];
            sales.data = [0];
        }

        // Gráfico de transacciones (puedes usar datos de ventas por hora si los tienes en pedidos)
        this.createTransactionalChart([5, 12, 25, 18, 32, 15, 18]); // fijo o calcular
        // Gráfico de crecimiento (ventas mensuales)
        this.createGrowthChart(sales.labels, sales.data);
        // Gráfico de regiones (si tienes datos de región en pedidos, puedes calcular)
        this.createRegionChart([40, 40, 15, 10, 10]); // fijo o calcular
        // Gráfico de forecast (puedes calcular proyección simple)
        this.createForecastChart([67000, 72000, 60000, 80000]); // fijo o calcular
    },

    // ========== PEDIDOS RECIENTES ==========
    renderRecentOrders: function() {
        const tbody = document.getElementById('recentOrdersBody') || document.querySelector('.recent-orders-table tbody');
        if (!tbody) return;

        if (!this.recentOrders || this.recentOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">No hay pedidos recientes</td></tr>`;
            return;
        }

        tbody.innerHTML = this.recentOrders.map(order => {
            const estado = order.estado_actual || 'Pendiente';
            const badgeClass = this._getBadgeClass(estado);
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.fechapedido).toLocaleDateString('es-NI')}</td>
                    <td>${order.cliente_nombre || order.proveedor_nombre || 'Cliente'}</td>
                    <td>$${parseFloat(order.totalneto || 0).toFixed(2)}</td>
                    <td><span class="badge ${badgeClass}">${estado}</span></td>
                </tr>
            `;
        }).join('');
    },

    _getBadgeClass: function(estado) {
        const map = {
            'Pendiente': 'badge-warning',
            'Confirmado': 'badge-info',
            'Enviado': 'badge-primary',
            'Entregado': 'badge-success',
            'Cancelado': 'badge-danger',
        };
        return map[estado] || 'badge-secondary';
    },

    // ========== GRÁFICOS (mismos de antes) ==========
    createTransactionalChart: function(horas) {
        const canvas = document.getElementById("transChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
                datasets: [{
                    label: "Ventas por hora",
                    data: horas,
                    backgroundColor: "#3b82f6",
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#555" } } },
                scales: {
                    x: { ticks: { color: "#888" }, grid: { display: false } },
                    y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
                }
            }
        });
    },

    createGrowthChart: function(labels, data) {
        const canvas = document.getElementById("growthChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Ventas mensuales",
                    data: data,
                    borderColor: "#a78bfa",
                    backgroundColor: "rgba(124,58,237,0.1)",
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: "#7c3aed",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#555" } } },
                scales: {
                    x: { ticks: { color: "#888" }, grid: { display: false } },
                    y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
                }
            }
        });
    },

    createRegionChart: function(regiones) {
        const canvas = document.getElementById("regionChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Managua", "León", "Granada", "Estelí", "Matagalpa"],
                datasets: [{
                    label: "Distribución por región",
                    data: regiones,
                    backgroundColor: ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
                    borderColor: "#fff",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { color: "#555", padding: 20 } }
                }
            }
        });
    },

    createForecastChart: function(forecast) {
        const canvas = document.getElementById("forecastChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: ["Jul", "Ago", "Sep", "Oct"],
                datasets: [{
                    label: "Proyección",
                    data: forecast,
                    borderColor: "#7c3aed",
                    borderDash: [5, 5],
                    backgroundColor: "rgba(124,58,237,0.05)",
                    tension: 0.4,
                    pointBackgroundColor: "#7c3aed",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#555" } } },
                scales: {
                    x: { ticks: { color: "#888" }, grid: { display: false } },
                    y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
                }
            }
        });
    },

    // ========== ESCUCHAR CAMBIOS EN LOCALSTORAGE ==========
    setupStorageListener: function() {
        window.addEventListener('storage', (e) => {
            // Si cambian productos, pedidos o inventario, recargar
            if (['productos', 'pedidos_proveedor', 'pedidos_comprador', 'inventario'].includes(e.key)) {
                console.log("🔄 Detected storage change, refreshing dashboard...");
                this.loadFromStorage();
                this.renderKPIs();
                this.renderCharts();
                this.renderRecentOrders();
            }
        });
    },

    // ========== REFRESCAR MANUALMENTE ==========
    refresh: async function() {
        console.log("🔄 Refrescando dashboard (acción manual)...");
        // Primero refrescar datos desde la API (dump-all)
        try {
            await api.refreshFullData();
        } catch (e) {
            console.warn("⚠️ Error al refrescar datos, usando localStorage existente");
        }
        this.loadFromStorage();
        this.renderKPIs();
        this.renderCharts();
        this.renderRecentOrders();
        this.showNotification('✅ Dashboard actualizado', 'success');
    },

    showNotification: function(msg, type) {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            toast.style.background = type === 'error' ? '#dc2626' : '#10b981';
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(msg);
        }
    }
};

// Inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.dashboard.init());
} else {
    window.dashboard.init();
}