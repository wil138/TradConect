// javascripts/analytics.js
(function() {
    'use strict';

    // Instancias de gráficos para poder destruirlas al recargar
    let salesChartInstance = null;
    let statusChartInstance = null;

    // ============================================
    // FUNCIONES DE RENDERIZADO
    // ============================================

    function getDateRange() {
        const start = document.getElementById('analyticsStartDate')?.value || null;
        const end = document.getElementById('analyticsEndDate')?.value || null;
        return { start, end };
    }

    // Actualizar KPIs a partir de datos de ventas por fecha
    function updateKPIs(salesData) {
        if (!salesData || salesData.length === 0) {
            document.getElementById('kpiTotalSales').textContent = '$0.00';
            document.getElementById('kpiTotalOrders').textContent = '0';
            document.getElementById('kpiTotalItems').textContent = '0';
            document.getElementById('kpiAvgTicket').textContent = '$0.00';
            return;
        }

        let totalSales = 0, totalOrders = 0, totalItems = 0;
        salesData.forEach(row => {
            totalSales += parseFloat(row.total_ventas || 0);
            totalOrders += parseInt(row.total_pedidos || 0);
            totalItems += parseFloat(row.cantidad_items || 0);
        });
        const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        document.getElementById('kpiTotalSales').textContent = `$${totalSales.toFixed(2)}`;
        document.getElementById('kpiTotalOrders').textContent = totalOrders;
        document.getElementById('kpiTotalItems').textContent = totalItems.toFixed(0);
        document.getElementById('kpiAvgTicket').textContent = `$${avgTicket.toFixed(2)}`;
    }

    // Gráfico de ventas por mes (barras)
    function renderSalesChart(data) {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null;
        }

        const labels = data.map(row => {
            if (row.fecha__mes) {
                const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                return `${monthNames[row.fecha__mes - 1]} ${row.fecha__año || ''}`;
            }
            return row.fecha__fecha || 'N/A';
        });
        const values = data.map(row => parseFloat(row.total_ventas || 0));

        salesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: values,
                    backgroundColor: 'rgba(30, 74, 118, 0.6)',
                    borderColor: '#1e4a76',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Gráfico de distribución de estados (dona)
    function renderStatusChart(data) {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;

        if (statusChartInstance) {
            statusChartInstance.destroy();
            statusChartInstance = null;
        }

        const labels = data.map(row => row.estado_pedido__estado_nombre || 'Sin estado');
        const counts = data.map(row => parseInt(row.cantidad_pedidos || 0));
        const colors = ['#1e4a76', '#2e7d8a', '#4a9e6e', '#d4a843', '#c44536'];

        statusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // Lista de top productos
    function renderTopProducts(data) {
        const container = document.getElementById('topProductsList');
        if (!container) return;
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No hay datos.</p>';
            return;
        }
        let html = '<ul class="list-group">';
        data.forEach((item, index) => {
            const name = item.producto__nombre_producto || 'Producto';
            const qty = parseFloat(item.total_vendido || 0).toFixed(0);
            const revenue = parseFloat(item.total_ingreso || 0).toFixed(2);
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><strong>#${index+1}</strong> ${name}</span>
                    <span class="badge bg-primary">${qty} uds</span>
                    <span class="badge bg-success">$${revenue}</span>
                </li>
            `;
        });
        html += '</ul>';
        container.innerHTML = html;
    }

    // Ventas por categoría
    function renderCategories(data) {
        const container = document.getElementById('categoryList');
        if (!container) return;
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No hay datos.</p>';
            return;
        }
        let html = '<table class="table table-sm"><thead><tr><th>Categoría</th><th>Ventas ($)</th><th>Cantidad</th></tr></thead><tbody>';
        data.forEach(row => {
            const cat = row.producto__categoria || 'Sin categoría';
            const revenue = parseFloat(row.total_ingreso || 0).toFixed(2);
            const qty = parseFloat(row.total_cantidad || 0).toFixed(0);
            html += `<tr><td>${cat}</td><td>$${revenue}</td><td>${qty}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Ventas por empresa
    function renderCompanies(data) {
        const container = document.getElementById('companyList');
        if (!container) return;
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No hay datos.</p>';
            return;
        }
        let html = '<table class="table table-striped"><thead><tr><th>Empresa</th><th>RUC</th><th>Total Comprado</th><th>Pedidos</th></tr></thead><tbody>';
        data.forEach(row => {
            const name = row.empresa__razon_social || 'N/A';
            const ruc = row.empresa__ruc || '';
            const total = parseFloat(row.total_comprado || 0).toFixed(2);
            const orders = parseInt(row.total_pedidos || 0);
            html += `<tr><td>${name}</td><td>${ruc}</td><td>$${total}</td><td>${orders}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // ============================================
    // CARGA PRINCIPAL DE DATOS (usando window.api)
    // ============================================

    async function loadAnalytics() {
        // Verificar que api esté disponible
        if (!window.api) {
            console.error('❌ window.api no está disponible');
            document.querySelectorAll('.data-box .loading').forEach(el => {
                el.textContent = '❌ API no disponible';
            });
            return;
        }

        const { start, end } = getDateRange();

        // Mostrar indicadores de carga
        document.querySelectorAll('.loading').forEach(el => el.textContent = 'Cargando...');

        try {
            // 1. Ventas por mes (granularidad: month)
            const salesResult = await window.api.getSalesByDate('month', start, end);
            if (salesResult.success) {
                const salesData = salesResult.data;
                updateKPIs(salesData);
                renderSalesChart(salesData);
            } else {
                console.warn('Error en sales-by-date:', salesResult.error);
            }

            // 2. Distribución de estados
            const statusResult = await window.api.getOrderStatusDistribution();
            if (statusResult.success) {
                renderStatusChart(statusResult.data);
            } else {
                console.warn('Error en order-status:', statusResult.error);
            }

            // 3. Top 5 productos
            const topResult = await window.api.getTopProducts(5, start, end);
            if (topResult.success) {
                renderTopProducts(topResult.data);
            } else {
                console.warn('Error en top-products:', topResult.error);
            }

            // 4. Ventas por categoría
            const catResult = await window.api.getSalesByCategory(start, end);
            if (catResult.success) {
                renderCategories(catResult.data);
            } else {
                console.warn('Error en sales-by-category:', catResult.error);
            }

            // 5. Ventas por empresa
            const compResult = await window.api.getSalesByCompany(start, end);
            if (compResult.success) {
                renderCompanies(compResult.data);
            } else {
                console.warn('Error en sales-by-company:', compResult.error);
            }

        } catch (error) {
            console.error('Error cargando analytics:', error);
            document.querySelectorAll('.data-box .loading').forEach(el => {
                el.textContent = '❌ Error al cargar datos';
            });
        }
    }

    // ============================================
    // EXPOSICIÓN DEL MÓDULO
    // ============================================

    window.analytics = {
        init: function() {
            console.log('📊 Inicializando módulo analytics');

            // Establecer fechas por defecto (últimos 12 meses)
            const now = new Date();
            const endDate = now.toISOString().split('T')[0];
            const startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            const start = startDate.toISOString().split('T')[0];

            const startInput = document.getElementById('analyticsStartDate');
            const endInput = document.getElementById('analyticsEndDate');
            if (startInput) startInput.value = start;
            if (endInput) endInput.value = endDate;

            // Vincular evento de refresh
            const refreshBtn = document.getElementById('analyticsRefreshBtn');
            if (refreshBtn) {
                refreshBtn.removeEventListener('click', loadAnalytics); // evitar duplicados
                refreshBtn.addEventListener('click', loadAnalytics);
            }

            // Cargar datos por primera vez
            loadAnalytics();
        },

        destroy: function() {
            console.log('🧹 Destruyendo módulo analytics');
            if (salesChartInstance) {
                salesChartInstance.destroy();
                salesChartInstance = null;
            }
            if (statusChartInstance) {
                statusChartInstance.destroy();
                statusChartInstance = null;
            }
            const refreshBtn = document.getElementById('analyticsRefreshBtn');
            if (refreshBtn) {
                refreshBtn.removeEventListener('click', loadAnalytics);
            }
        }
    };

})();