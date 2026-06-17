// analytics.js - VERSIÓN CONECTADA A API REAL
window.analytics = {
    instances: {},
    statsData: null, // se llena desde API

    init: function() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            return;
        }
        // Cargar datos desde la API
        this.loadData();
    },

    loadData: async function() {
        try {
            const result = await api.getDashboardStats(); // usa /dw/stats/
            if (result.success) {
                this.statsData = result.data;
                console.log("✅ Datos de analytics cargados:", this.statsData);
                this.renderAll();
            } else {
                console.warn("⚠️ No se pudieron cargar datos, usando fallback local");
                this.statsData = this.getFallbackData();
                this.renderAll();
            }
        } catch (error) {
            console.error("❌ Error cargando analytics:", error);
            this.statsData = this.getFallbackData();
            this.renderAll();
        }
    },

    getFallbackData: function() {
        // Datos de ejemplo si la API falla
        return {
            summary: {
                totalCapital: 458920.50,
                totalProducts: 156,
                productsAtRisk: 23,
                avgValue: 2941.80,
                riskPercentage: 14.7
            },
            categories: [
                { name: 'Construcción', count: 42, stockTotal: 1250, totalValue: 125400.00, color: '#2563eb' },
                { name: 'Metales', count: 35, stockTotal: 890, totalValue: 98750.00, color: '#f59e0b' },
                { name: 'Acabados', count: 28, stockTotal: 670, totalValue: 89200.00, color: '#8b5cf6' },
                { name: 'Plomería', count: 31, stockTotal: 750, totalValue: 76550.00, color: '#10b981' },
                { name: 'Herramientas', count: 20, stockTotal: 340, totalValue: 69020.50, color: '#ef4444' }
            ],
            stockHealth: { low: 23, medium: 89, high: 44 },
            priceSegments: { economico: 48, estandar: 72, premium: 36 },
            topProducts: [
                { name: 'Cemento Portland 50kg', category: 'Construcción', value: 28500, stock: 150 },
                { name: 'Varilla Corrugada 1/2"', category: 'Metales', value: 24300, stock: 200 },
                { name: 'Tubo PVC 4"', category: 'Plomería', value: 19800, stock: 180 },
                { name: 'Pintura Latex Blanca', category: 'Acabados', value: 17500, stock: 95 },
                { name: 'Ladrillo Rojo', category: 'Construcción', value: 16800, stock: 500 },
                { name: 'Perfil Aluminio 3m', category: 'Metales', value: 15200, stock: 80 },
                { name: 'Cerámica 60x60', category: 'Acabados', value: 14100, stock: 120 },
                { name: 'Válvula de Bola 2"', category: 'Plomería', value: 12800, stock: 65 },
                { name: 'Taladro Industrial', category: 'Herramientas', value: 11500, stock: 25 },
                { name: 'Yeso Construction 40kg', category: 'Construcción', value: 10200, stock: 300 }
            ]
        };
    },

    renderAll: function() {
        if (!this.statsData) return;
        this.updateKPIs();
        this.renderCapitalPorCategoria();
        this.renderSaludStock();
        this.renderRangoPrecios();
        this.renderTopValorizados();
        this.renderDetailTable();
        this.handleResize();
    },

    handleResize: function() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                Object.values(this.instances).forEach(instance => {
                    if (instance && typeof instance.resize === 'function') {
                        instance.resize();
                    }
                });
            }, 250);
        });
    },

    updateKPIs: function() {
        const data = this.statsData.summary;
        const totalCapitalEl = document.getElementById('totalCapital');
        const totalProductsEl = document.getElementById('totalProducts');
        const productsAtRiskEl = document.getElementById('productsAtRisk');
        const avgValueEl = document.getElementById('avgValue');
        const capitalTrendEl = document.getElementById('capitalTrend');

        if (totalCapitalEl) totalCapitalEl.textContent = this.formatCurrency(data.totalCapital);
        if (totalProductsEl) totalProductsEl.textContent = data.totalProducts;
        if (productsAtRiskEl) productsAtRiskEl.textContent = data.productsAtRisk;
        if (avgValueEl) avgValueEl.textContent = this.formatCurrency(data.avgValue);
        
        if (capitalTrendEl) {
            if (data.riskPercentage > 20) {
                capitalTrendEl.innerHTML = `⚠️ ${data.riskPercentage}% productos en riesgo`;
                capitalTrendEl.style.color = '#ef4444';
            } else if (data.riskPercentage > 10) {
                capitalTrendEl.innerHTML = `⚡ ${data.riskPercentage}% productos en riesgo`;
                capitalTrendEl.style.color = '#f59e0b';
            } else {
                capitalTrendEl.innerHTML = `✅ Inventario saludable`;
                capitalTrendEl.style.color = '#10b981';
            }
        }
    },

    renderCapitalPorCategoria: function() {
        const ctx = document.getElementById('chartCategorias');
        if (!ctx) return;
        if (this.instances.cat) this.instances.cat.destroy();

        const categories = this.statsData.categories || [];
        const colors = ['#2563eb', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#06b6d4'];
        const categoryData = categories.map((cat, i) => ({
            ...cat,
            color: cat.color || colors[i % colors.length]
        }));

        this.instances.cat = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.map(c => c.name),
                datasets: [{
                    data: categoryData.map(c => c.totalValue || c.ventas || 0),
                    backgroundColor: categoryData.map(c => c.color),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, font: { size: 10 } } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${window.analytics.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    renderSaludStock: function() {
        const ctx = document.getElementById('chartStock');
        if (!ctx) return;
        if (this.instances.stock) this.instances.stock.destroy();

        const health = this.statsData.stockHealth || { low: 0, medium: 0, high: 0 };
        // Mapeo: si viene pendiente/entregado/cancelado, lo convertimos a bajo/medio/alto según convenga
        // O simplemente usamos los valores tal cual si existen
        const low = health.low || 0;
        const medium = health.medium || 0;
        const high = health.high || 0;

        this.instances.stock = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Bajo (< 20)', 'Medio (20-100)', 'Alto (> 100)'],
                datasets: [{
                    data: [low, medium, high],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 10, usePointStyle: true, font: { size: 10 } } }
                }
            }
        });
    },

    renderRangoPrecios: function() {
        const ctx = document.getElementById('chartPrecios');
        if (!ctx) return;
        if (this.instances.precios) this.instances.precios.destroy();

        const segments = this.statsData.priceSegments || { economico: 0, estandar: 0, premium: 0 };

        this.instances.precios = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Económico (< $10)', 'Estándar ($10-$50)', 'Premium (> $50)'],
                datasets: [{
                    data: [segments.economico, segments.estandar, segments.premium],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.6)',
                        'rgba(139, 92, 246, 0.6)',
                        'rgba(245, 158, 11, 0.6)'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 10, font: { size: 10 } } }
                },
                scales: { r: { beginAtZero: true, ticks: { display: false } } }
            }
        });
    },

    renderTopValorizados: function() {
        const ctx = document.getElementById('chartTop10');
        if (!ctx) return;
        if (this.instances.top) this.instances.top.destroy();

        const top10 = this.statsData.topProducts || [];
        const categoryColors = {
            'Construcción': '#2563eb',
            'Metales': '#f59e0b',
            'Acabados': '#8b5cf6',
            'Plomería': '#10b981',
            'Herramientas': '#ef4444',
            'General': '#1e293b'
        };

        this.instances.top = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(p => (p.name || '').substring(0, 15) + '...'),
                datasets: [{
                    label: 'Valor Total ($)',
                    data: top10.map(p => p.value || p.ventas || 0),
                    backgroundColor: top10.map(p => categoryColors[p.category] || '#1e293b'),
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = top10[context.dataIndex];
                                return [
                                    `Valor: ${window.analytics.formatCurrency(item.value || item.ventas || 0)}`,
                                    `Stock: ${item.stock || item.pedidos || 0} unidades`,
                                    `Categoría: ${item.category || 'General'}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { callback: function(value) { return '$' + value.toLocaleString(); }, font: { size: 9 } }
                    },
                    y: { ticks: { font: { size: 9 } } }
                }
            }
        });
    },

    renderDetailTable: function() {
        const tbody = document.getElementById('analyticsTableBody');
        if (!tbody) return;

        const categories = this.statsData.categories || [];
        const grandTotal = categories.reduce((sum, cat) => sum + (cat.totalValue || cat.ventas || 0), 0);

        tbody.innerHTML = categories.map(cat => {
            const value = cat.totalValue || cat.ventas || 0;
            const percentage = grandTotal ? ((value / grandTotal) * 100).toFixed(1) : 0;
            const stock = cat.stockTotal || cat.count || 0;
            const products = cat.count || 0;

            let status, statusClass;
            if (stock < 20) {
                status = '⚠️ Crítico';
                statusClass = 'badge-pendiente';
            } else if (stock < 50) {
                status = '📊 Atención';
                statusClass = 'badge-warning';
            } else {
                status = '✅ Saludable';
                statusClass = 'badge-entregado';
            }

            return `
                <tr>
                    <td><strong>${cat.name}</strong></td>
                    <td>${products}</td>
                    <td>${stock}</td>
                    <td class="price-cell">${this.formatCurrency(value)}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 100%; background: #2563eb; border-radius: 3px;"></div>
                            </div>
                            <span style="font-size: 0.85rem; font-weight: 600;">${percentage}%</span>
                        </div>
                    </td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="6">No hay datos</td></tr>';
    },

    formatCurrency: function(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    refreshAll: function() {
        this.showNotification('Actualizando datos...', 'info');
        this.loadData().then(() => {
            this.showNotification('✅ Datos actualizados correctamente', 'success');
        }).catch(() => {
            this.showNotification('❌ Error al actualizar', 'error');
        });
    },

    exportData: function() {
        const exportData = {
            exportDate: new Date().toISOString(),
            ...this.statsData
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification('📥 Reporte exportado exitosamente', 'success');
    },

    printCharts: function() {
        window.print();
    },

    showNotification: function(message, type) {
        const existing = document.querySelector('.analytics-notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        notification.className = `analytics-notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        switch(type) {
            case 'success': notification.style.background = '#10b981'; break;
            case 'error': notification.style.background = '#ef4444'; break;
            case 'info': notification.style.background = '#3b82f6'; break;
        }
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.analytics.init());
} else {
    window.analytics.init();
}