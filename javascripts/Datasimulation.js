



// ===============================
// 🔌 DATA SIMULADA
// ===============================
function getmenssage() {
    return {
        vs: "+12.5% vs ayer ",
        urge: "4 urgente",
        critic: "Inventario critico",
        newc: "+3 esta semana"

    }
}
function getTransactionalData() {
    return {
        ventas: 12450,
        pedidos: 18,
        stock: 5,
        clientes: 12,
        horas: [5, 12, 25, 18, 32, 15, 18]
    };
}

function getMultidimensionalData() {
    return {
        historial: [4000, 32000, 17000, 58000, 55000, 67000],
        regiones: [40, 40, 15, 10, 10],
        forecast: [67000, 72000, 60000, 80000]
    };
}

// ===============================
// 📊 KPI
// ===============================


const m = getMultidimensionalData();

const c = getmenssage();
document.getElementById("vs").innerText = c.vs;
document.getElementById("urge").innerText = c.urge;
document.getElementById("critic").innerText = c.critic;
document.getElementById("newc").innerText = c.newc;

const t = getTransactionalData();
document.getElementById("ventas").innerText = "$" + t.ventas;
document.getElementById("pedidos").innerText = t.pedidos;
document.getElementById("stock").innerText = t.stock;
document.getElementById("clientes").innerText = t.clientes;

// ===============================
// 📈 CONFIG BASE
// ===============================

const baseOptions = {
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
};

// ===============================
// 📊 GRÁFICOS
// ===============================

// 🔵 Operacional
new Chart(document.getElementById("transChart"), {
    type: "bar",
    data: {
        labels: ["08", "10", "12", "14", "16", "18", "20"],
        datasets: [{
            data: t.horas,
            backgroundColor: "#3b82f6",
            borderRadius: 6
        }]
    },
    options: baseOptions
});

// 🟣 Tendencia
new Chart(document.getElementById("growthChart"), {
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
    options: baseOptions
});

// 🟣 Regiones
new Chart(document.getElementById("regionChart"), {
    type: "doughnut",
    data: {
        labels: ["Managua", "León", "Granada", "Estelí", "Matagalpa"],
        datasets: [{
            data: m.regiones,
            backgroundColor: [
                "#7c3aed", "#a78bfa", "#c4b5fd", "#ddd", "#eee"
            ]
        }]
    }
});

// 🟣 Proyección
new Chart(document.getElementById("forecastChart"), {
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
    options: baseOptions
});


