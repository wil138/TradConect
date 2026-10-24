// Exportación local: únicamente campos explícitos, nunca tokens ni datos administrativos.
window.reportExport = {
    csvCell(value) {
        let text = String(value ?? '');
        // Evita fórmulas al abrir valores de texto en una hoja de cálculo.
        if (typeof value !== 'number' && /^[\s]*[=+\-@]/.test(text)) text = "'" + text;
        return '"' + text.replaceAll('"', '""') + '"';
    },
    toCSV(report) {
        const rows = [[report.title], ...report.meta.map(value => [value]), []];
        for (const section of report.sections) {
            rows.push([section.title], section.headers, ...section.rows, []);
        }
        return '\uFEFF' + rows.map(row => row.map(value => this.csvCell(value)).join(';')).join('\r\n');
    },
    toHTML(report) {
        const escape = appUtils.escapeHtml;
        const sections = report.sections.map(section => `<h2>${escape(section.title)}</h2><table><thead><tr>${section.headers.map(value => `<th>${escape(value)}</th>`).join('')}</tr></thead><tbody>${section.rows.length ? section.rows.map(row => `<tr>${row.map(value => `<td>${escape(value)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${section.headers.length}">Sin datos para esta selección.</td></tr>`}</tbody></table>`).join('');
        return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escape(report.title)}</title><style>body{font:13px Arial,sans-serif;color:#2c3e50;padding:28px}h1,h2{color:#1e4a76}h1{font-size:24px}h2{font-size:17px;margin-top:28px}p{line-height:1.6}table{width:100%;border-collapse:collapse;margin:16px 0;overflow-wrap:anywhere}th,td{text-align:left;border:1px solid #e2e8f0;padding:9px}th{background:#eef2ff}thead{display:table-header-group}tr{break-inside:avoid}@page{size:A4 landscape;margin:12mm}@media print{body{padding:0}}</style></head><body><h1>TradConnect · ${escape(report.title)}</h1>${report.meta.map(value => `<p>${escape(value)}</p>`).join('')}${sections}<p>Reporte informativo generado el ${escape(new Date().toLocaleString('es-NI'))}. No sustituye una factura fiscal.</p></body></html>`;
    },
    deliver(report, format, name) {
        if (format === 'print') {
            const preview = window.open('', '_blank');
            if (!preview) { appUtils.showToast('Permite ventanas emergentes para imprimir el reporte.', 'warning'); return; }
            preview.opener = null;
            preview.document.write(this.toHTML(report));
            preview.document.close();
            preview.focus();
            preview.print();
            return;
        }
        const blob = new Blob([this.toCSV(report)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    currency(id) {
        const catalog = appUtils.readJSON('catalogos', {});
        const currency = (catalog.monedas || []).find(item => String(item.id) === String(id));
        return currency?.nombremoneda || (id == null ? 'No especificada' : `Moneda ID ${id}`);
    },
    orderReport(orders, role, filter = 'Todos', detailed = false) {
        const sections = [{ title: 'Pedidos', headers: ['Pedido', 'Fecha', 'Proveedor', 'Cliente', 'Estado', 'Moneda', 'Subtotal', 'Impuesto', 'Total'], rows: orders.map(order => [order.id, order.fechapedido, order.proveedor_nombre, order.restaurante_nombre, order.estado_actual, this.currency(order.monedaid), order.subtotal, order.impuesto, order.totalneto]) }];
        if (detailed) sections.push({ title: 'Productos del pedido', headers: ['Pedido', 'Producto', 'Cantidad', 'Precio unitario', 'Descuento (%)', 'Importe'], rows: orders.flatMap(order => (order.detalles || []).map(item => {
            const price = Number(item.preciounitario ?? item.precio_unitario ?? 0), quantity = Number(item.cantidad || 0), discount = Number(item.descuentoaplicado || 0);
            return [order.id, item.producto_nombre, quantity, price, discount, (price * quantity * (1 - discount / 100)).toFixed(2)];
        })) });
        return { title: detailed ? `Pedido ${orders[0]?.id ?? ''}` : 'Reporte de pedidos', meta: [`Rol: ${role === 'provider' ? 'Proveedor' : 'Cliente'}`, `Selección: ${filter}`, `Pedidos incluidos: ${orders.length}`], sections };
    },
    analyticsReport(snapshot) {
        const { data, start, end, currency, role } = snapshot;
        const sections = [
            { title: 'Importes por mes (sin cancelados)', headers: ['Mes', 'Importe', 'Pedidos', 'Cantidad'], rows: data.ventas.map(row => [row.fecha__fecha || `${row.fecha__año}-${row.fecha__mes}`, row.total_ventas, row.total_pedidos, row.cantidad_items]) },
            { title: 'Distribución de estados (incluye cancelados)', headers: ['Estado', 'Pedidos'], rows: data.estados.map(row => [row.estado_pedido__estado_nombre, row.cantidad_pedidos]) },
            { title: 'Top 5 productos', headers: ['Producto', 'Cantidad', 'Importe de líneas'], rows: data.productos.map(row => [row.producto__nombre_producto, row.total_vendido, row.total_ingreso]) },
            { title: 'Categorías', headers: ['Categoría', 'Cantidad', 'Importe de líneas'], rows: data.categorias.map(row => [row.producto__categoria, row.total_cantidad, row.total_ingreso]) },
            { title: role === 'provider' ? 'Clientes' : 'Proveedores', headers: ['Empresa', 'RUC', 'Importe', 'Pedidos'], rows: data.clientes.map(row => [row.empresa__razon_social, row.empresa__ruc, row.total_comprado, row.total_pedidos]) }
        ];
        if (data.feedback?.disponible) sections.push({ title: 'Calidad de servicio', headers: ['Promedio / 5', 'Evaluaciones', 'Reclamos', 'Pendientes', 'Resueltos'], rows: [[data.feedback.puntuacion ?? 'Sin evaluaciones', data.feedback.evaluaciones, data.feedback.reclamos, data.feedback.pendientes, data.feedback.resueltos]] });
        return { title: role === 'provider' ? 'Análisis de ventas' : 'Análisis de compras', meta: [`Período: ${start || 'Sin límite'} a ${end || 'Sin límite'}`, `Moneda: ${currency}`, 'Pedidos con impuestos; líneas con descuento. Las cantidades pueden combinar unidades diferentes.', ...(!data.feedback?.disponible ? ['Calidad de servicio: datos no disponibles.'] : [])], sections };
    }
};
