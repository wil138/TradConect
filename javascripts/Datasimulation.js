// Datasimulation.js - Versión SPA
window.dashboard = {
    // Datos simulados
    getMessage: function() {
        return {
            vs: "+12.5% vs ayer ",
            urge: "4 urgente",
            critic: "Inventario critico",
            newc: "+3 esta semana"
        };
    },
    
    getTransactionalData: function() {
        return {
            ventas: 12450,
            pedidos: 18,
            stock: 5,
            clientes: 12,
            horas: [5, 12, 25, 18, 32, 15, 18]
        };
    },
    
    getMultidimensionalData: function() {
        return {
            historial: [4000, 32000, 17000, 58000, 55000, 67000],
            regiones: [40, 40, 15, 10, 10],
            forecast: [67000, 72000, 60000, 80000]
        };
    },
    
    // Configuración base de gráficos
    baseOptions: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio,
        plugins: {
            legend: { labels: { color: "#555" } }
        },
        scales: {
            x: { ticks: { color: "#888" }, grid: { display: false } },
            y: { ticks: { color: "#888" }, grid: { color: "#eee" } }
        }
    },
    
    // Inicializar dashboard
    init: function() {
        console.log("Dashboard: Inicializando");
        
        // Esperar un momento para asegurar que el DOM está listo
        setTimeout(() => {
            this.cargarKPIs();
            this.cargarGraficos();
        }, 50);
    },
    
    // Cargar indicadores KPI
    cargarKPIs: function() {
        const m = this.getMultidimensionalData();
        const c = this.getMessage();
        const t = this.getTransactionalData();
        
        const elementos = {
            "vs": c.vs,
            "urge": c.urge,
            "critic": c.critic,
            "newc": c.newc,
            "ventas": "$" + t.ventas,
            "pedidos": t.pedidos,
            "stock": t.stock,
            "clientes": t.clientes
        };
        
        for (const [id, valor] of Object.entries(elementos)) {
            const el = document.getElementById(id);
            if (el) el.innerText = valor;
        }
    },
    
    // Cargar todos los gráficos
    cargarGraficos: function() {
        // Verificar que Chart.js está disponible
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js no está disponible");
            return;
        }
        
        const t = this.getTransactionalData();
        const m = this.getMultidimensionalData();
        
        // Gráfico Operacional (Barras)
        const transChart = document.getElementById("transChart");
        if (transChart) {
            new Chart(transChart, {
                type: "bar",
                data: {
                    labels: ["08", "10", "12", "14", "16", "18", "20"],
                    datasets: [{
                        data: t.horas,
                        backgroundColor: "#3b82f6",
                        borderRadius: 6
                    }]
                },
                options: this.baseOptions
            });
        }
        
        // Gráfico de Tendencia (Línea)
        const growthChart = document.getElementById("growthChart");
        if (growthChart) {
            new Chart(growthChart, {
                type: "line",
                data: {
                    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
                    datasets: [{
                        data: m.historial,
                        borderColor: "#a78bfa",
                        tension: 0.4,
                        fill: true,
                        backgroundColor: "rgba(124,58,237,0.1)"
                    }]
                },
                options: this.baseOptions
            });
        }
        
        // Gráfico de Regiones (Doughnut)
        const regionChart = document.getElementById("regionChart");
        if (regionChart) {
            new Chart(regionChart, {
                type: "doughnut",
                data: {
                    labels: ["Managua", "León", "Granada", "Estelí", "Matagalpa"],
                    datasets: [{
                        data: m.regiones,
                        backgroundColor: ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd", "#eee"]
                    }]
                }
            });
        }
        
        // Gráfico de Proyección (Línea)
        const forecastChart = document.getElementById("forecastChart");
        if (forecastChart) {
            new Chart(forecastChart, {
                type: "line",
                data: {
                    labels: ["Jul", "Ago", "Sep", "Oct"],
                    datasets: [{
                        data: m.forecast,
                        borderColor: "#7c3aed",
                        borderDash: [5, 5],
                        tension: 0.4
                    }]
                },
                options: this.baseOptions
            });
        }
    }
};