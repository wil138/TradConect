// javascripts/analytics.js
(function() {
    'use strict';

    // Instancias de gráficos para poder destruirlas al recargar
    let generation = 0;
    let exportSnapshot = null;
    function enableExports(enabled) {
        for (const id of ['analyticsExportCSV', 'analyticsExportPrint']) {
            const button = document.getElementById(id);
            if (button) button.disabled = !enabled;
        }
    }
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
            document.getElementById('kpiTotalSales').textContent = '0.00';
            document.getElementById('kpiTotalOrders').textContent = '0';
            document.getElementById('kpiTotalItems').textContent = '0';
            document.getElementById('kpiAvgTicket').textContent = '0.00';
            return;
        }

        let totalSales = 0, totalOrders = 0, totalItems = 0;
        salesData.forEach(row => {
            totalSales += parseFloat(row.total_ventas || 0);
            totalOrders += parseInt(row.total_pedidos || 0);
            totalItems += parseFloat(row.cantidad_items || 0);
        });
        const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        document.getElementById('kpiTotalSales').textContent = `${totalSales.toFixed(2)}`;
        document.getElementById('kpiTotalOrders').textContent = totalOrders;
        document.getElementById('kpiTotalItems').textContent = totalItems.toFixed(2);
        document.getElementById('kpiAvgTicket').textContent = `${avgTicket.toFixed(2)}`;
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
                    label: 'Ventas (moneda seleccionada)',
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
            const name = appUtils.escapeHtml(item.producto__nombre_producto || 'Producto');
            const qty = parseFloat(item.total_vendido || 0).toFixed(2);
            const revenue = parseFloat(item.total_ingreso || 0).toFixed(2);
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span><strong>#${index+1}</strong> ${name}</span>
                    <span class="badge bg-primary">${qty} uds</span>
                    <span class="badge bg-success">${revenue}</span>
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
        let html = '<table class="table table-sm"><thead><tr><th>Categoría</th><th>Ventas (moneda seleccionada)</th><th>Cantidad</th></tr></thead><tbody>';
        data.forEach(row => {
            const cat = appUtils.escapeHtml(row.producto__categoria) || 'Sin categoría';
            const revenue = parseFloat(row.total_ingreso || 0).toFixed(2);
            const qty = parseFloat(row.total_cantidad || 0).toFixed(2);
            html += `<tr><td>${cat}</td><td>${revenue}</td><td>${qty}</td></tr>`;
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
            const name = appUtils.escapeHtml(row.empresa__razon_social || 'N/A');
            const ruc = appUtils.escapeHtml(row.empresa__ruc || '');
            const total = parseFloat(row.total_comprado || 0).toFixed(2);
            const orders = parseInt(row.total_pedidos || 0);
            html += `<tr><td>${name}</td><td>${ruc}</td><td>${total}</td><td>${orders}</td></tr>`;
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
        if (start && end && start > end) {
            appUtils.showToast('La fecha inicial debe ser anterior a la fecha final', 'warning');
            return;
        }

        exportSnapshot = null;
        enableExports(false);
        document.getElementById('analyticsExportSummary').textContent = 'Preparando el reporte del período seleccionado...';
        const requestId = ++generation;
        const status = document.getElementById('analyticsStatus');
        status.textContent = 'Cargando datos reales...';
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        const currency = document.getElementById('analyticsCurrency').value;
        if (currency) params.set('moneda', currency);
        const role = localStorage.getItem('userRole') === 'provider' ? 'provider' : 'client';
        const result = await api.request(`/nosql/${role === 'provider' ? 'proveedor' : 'cliente'}/analitica/?` + params);
        if (requestId !== generation) return;
        if (!result.success) {
            document.getElementById('analyticsExportSummary').textContent = 'No se pudo preparar el reporte. Vuelve a actualizar los datos.';
            updateKPIs([]); renderSalesChart([]); renderStatusChart([]);
            renderTopProducts([]); renderCategories([]); renderCompanies([]);
            document.getElementById('analyticsFeedback').textContent = 'Sin datos disponibles.';
            status.textContent = result.error; return;
        }
        const data = result.data;
        const select = document.getElementById('analyticsCurrency');
        select.replaceChildren();
        for (const item of data.monedas) select.add(new Option(item.nombremoneda, item.id));
        select.value = data.moneda;
        updateKPIs(data.ventas); renderSalesChart(data.ventas); renderStatusChart(data.estados);
        renderTopProducts(data.productos); renderCategories(data.categorias); renderCompanies(data.clientes);
        const feedback = data.feedback;
        document.getElementById('analyticsFeedback').textContent = feedback.disponible
            ? `Promedio: ${feedback.puntuacion == null ? 'Sin evaluaciones' : Number(feedback.puntuacion).toFixed(2) + '/5'} | Evaluaciones: ${feedback.evaluaciones} | Reclamos: ${feedback.reclamos} | Pendientes: ${feedback.pendientes} | Resueltos: ${feedback.resueltos}`
            : 'Reclamos y evaluaciones no disponibles: revisa la conexión MongoDB.';
        exportSnapshot = { data, start, end, role, currency: select.selectedOptions[0]?.textContent || String(data.moneda) };
        enableExports(true);
        document.getElementById('analyticsExportSummary').textContent = `${start || 'Sin límite'} — ${end || 'Sin límite'} · ${exportSnapshot.currency} · Último reporte actualizado`;
        status.textContent = 'Datos actualizados. Importes en la moneda seleccionada.';
    }

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
            return loadAnalytics();
        },

        exportReport: function(format) {
            if (!exportSnapshot) { appUtils.showToast('Actualiza los datos antes de exportar.', 'warning'); return; }
            reportExport.deliver(reportExport.analyticsReport(exportSnapshot), format, 'analitica');
        },

        destroy: function() {
            exportSnapshot = null;
            enableExports(false);
            ++generation;
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