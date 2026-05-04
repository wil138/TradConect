window.analytics = {
    instances: {},
    
    statsData: {
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
    },

    init: function() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            return;
        }

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

        const categories = this.statsData.categories;

        this.instances.cat = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(c => c.name),
                datasets: [{
                    data: categories.map(c => c.totalValue),
                    backgroundColor: categories.map(c => c.color),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            usePointStyle: true,
                            font: { size: 10 }
                        }
                    },
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

        const health = this.statsData.stockHealth;

        this.instances.stock = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Bajo (< 20)', 'Medio (20-100)', 'Alto (> 100)'],
                datasets: [{
                    data: [health.low, health.medium, health.high],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            usePointStyle: true,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    },

    renderRangoPrecios: function() {
        const ctx = document.getElementById('chartPrecios');
        if (!ctx) return;
        if (this.instances.precios) this.instances.precios.destroy();

        const segments = this.statsData.priceSegments;

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
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: { size: 10 }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { display: false }
                    }
                }
            }
        });
    },

    renderTopValorizados: function() {
        const ctx = document.getElementById('chartTop10');
        if (!ctx) return;
        if (this.instances.top) this.instances.top.destroy();

        const top10 = this.statsData.topProducts;
        
        const categoryColors = {
            'Construcción': '#2563eb',
            'Metales': '#f59e0b',
            'Acabados': '#8b5cf6',
            'Plomería': '#10b981',
            'Herramientas': '#ef4444'
        };

        this.instances.top = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(p => p.name.substring(0, 15) + '...'),
                datasets: [{
                    label: 'Valor Total ($)',
                    data: top10.map(p => p.value),
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
                                    `Valor: ${window.analytics.formatCurrency(item.value)}`,
                                    `Stock: ${item.stock} unidades`,
                                    `Categoría: ${item.category}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            },
                            font: { size: 9 }
                        }
                    },
                    y: {
                        ticks: {
                            font: { size: 9 }
                        }
                    }
                }
            }
        });
    },

    renderDetailTable: function() {
        const tbody = document.getElementById('analyticsTableBody');
        if (!tbody) return;

        const categories = this.statsData.categories;
        const grandTotal = categories.reduce((sum, cat) => sum + cat.totalValue, 0);

        tbody.innerHTML = categories.map(cat => {
            const percentage = ((cat.totalValue / grandTotal) * 100).toFixed(1);
            
            // Determinar estado basado en stock
            const avgStock = cat.stockTotal / cat.count;
            let status, statusClass;
            
            if (avgStock < 20) {
                status = '⚠️ Crítico';
                statusClass = 'badge-pendiente';
            } else if (avgStock < 50) {
                status = '📊 Atención';
                statusClass = 'badge-warning';
            } else {
                status = '✅ Saludable';
                statusClass = 'badge-entregado';
            }

            return `
                <tr>
                    <td><strong>${cat.name}</strong></td>
                    <td>${cat.count}</td>
                    <td>${cat.stockTotal}</td>
                    <td class="price-cell">${this.formatCurrency(cat.totalValue)}</td>
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
        }).join('');
    },

    formatCurrency: function(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    // ACCIONES DE LOS BOTONES
    
    refreshAll: function() {
        // Mostrar notificación
        this.showNotification('Actualizando datos...', 'info');
        
        // Simular actualización (conectar con API real)
        setTimeout(() => {
            // Destruir instancias existentes
            Object.values(this.instances).forEach(instance => {
                if (instance) instance.destroy();
            });
            this.instances = {};
            
            // Reinicializar
            this.init();
            
            this.showNotification('✅ Datos actualizados correctamente', 'success');
        }, 800);
    },

    exportData: function() {
        const exportData = {
            exportDate: new Date().toISOString(),
            summary: this.statsData.summary,
            categories: this.statsData.categories,
            stockHealth: this.statsData.stockHealth,
            priceSegments: this.statsData.priceSegments,
            topProducts: this.statsData.topProducts
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
        // Eliminar notificación anterior si existe
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
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            case 'info':
                notification.style.background = '#3b82f6';
                break;
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