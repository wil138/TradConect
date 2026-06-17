// dashboard.js - SIN AUTO-REFRESH (solo por acciones del usuario)
window.dashboard = {
    data: null,
    salesData: null,
    
    init: function() {
        console.log("📊 Dashboard: Inicializando");
        setTimeout(async () => {
            await this.loadDashboardData();
            this.cargarKPIs();
            this.cargarGraficos();
        }, 100);
    },

    loadDashboardData: async function() {
        try {
            console.log("🔄 Cargando datos del dashboard desde API...");
            const summaryResult = await api.getDashboardSummary();
            if (summaryResult.success) {
                this.data = summaryResult.data;
                console.log("✅ Datos del dashboard cargados:", this.data);
            } else {
                console.warn("⚠️ API no disponible, usando datos locales");
                this.data = this.getLocalData();
            }

            const chartResult = await api.getSalesChart();
            if (chartResult.success) {
                this.salesData = chartResult.data;
            } else {
                this.salesData = this.getLocalSalesData();
            }
        } catch (error) {
            console.error("❌ Error cargando dashboard:", error);
            this.data = this.getLocalData();
            this.salesData = this.getLocalSalesData();
        }
    },

    getLocalData: function() {
        return {
            vs: "+12.5% vs ayer",
            urge: "4 urgente",
            critic: "Inventario crítico",
            newc: "+3 esta semana",
            ventas: 12450,
            pedidos: 18,
            stock: 5,
            clientes: 12
        };
    },

    getLocalSalesData: function() {
        return {
            historial: [4000, 32000, 17000, 58000, 55000, 67000],
            regiones: [40, 40, 15, 10, 10],
            forecast: [67000, 72000, 60000, 80000],
            horas: [5, 12, 25, 18, 32, 15, 18]
        };
    },
    
    cargarKPIs: function() {
        const data = this.data || this.getLocalData();
        const salesData = this.salesData || this.getLocalSalesData();
        
        const elementos = {
            "vs": typeof data.vs === 'string' ? data.vs : `+${data.crecimiento || 12.5}%`,
            "urge": typeof data.urge === 'string' ? data.urge : `${data.urgentes || 4} urgente`,
            "critic": data.critic || "Inventario crítico",
            "newc": typeof data.newc === 'string' ? data.newc : `+${data.nuevos || 3} esta semana`,
            "ventas": "$" + (data.ventas || 12450),
            "pedidos": data.pedidos || 18,
            "stock": data.stock || 5,
            "clientes": data.clientes || 12
        };
        
        console.log("📈 Actualizando KPIs:", elementos);
        
        for (const [id, valor] of Object.entries(elementos)) {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = valor;
                el.style.color = '#333';
            }
        }
    },
    
    cargarGraficos: function() {
        if (typeof Chart === 'undefined') {
            console.warn("⚠️ Chart.js no está disponible");
            return;
        }
        
        const salesData = this.salesData || this.getLocalSalesData();
        
        console.log("📊 Renderizando gráficos con datos:", salesData);
        
        this.createTransactionalChart(salesData.horas || [5, 12, 25, 18, 32, 15, 18]);
        this.createGrowthChart(salesData.historial || [4000, 32000, 17000, 58000, 55000, 67000]);
        this.createRegionChart(salesData.regiones || [40, 40, 15, 10, 10]);
        this.createForecastChart(salesData.forecast || [67000, 72000, 60000, 80000]);
    },

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

    createGrowthChart: function(historial) {
        const canvas = document.getElementById("growthChart");
        if (!canvas) return;
        if (canvas.chart) canvas.chart.destroy();
        canvas.chart = new Chart(canvas, {
            type: "line",
            data: {
                labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
                datasets: [{
                    label: "Tendencia de ventas",
                    data: historial,
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

    refresh: async function() {
        console.log("🔄 Refrescando dashboard (acción manual)...");
        await this.loadDashboardData();
        this.cargarKPIs();
        this.cargarGraficos();
    }
};