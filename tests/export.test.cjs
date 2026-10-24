const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
function load() {
    const ctx = vm.createContext({ window: {}, localStorage: { getItem: () => null } });
    vm.runInContext(readFileSync('javascripts/utils/common.js', 'utf8'), ctx);
    ctx.appUtils = ctx.window.appUtils;
    vm.runInContext(readFileSync('javascripts/utils/export.js', 'utf8'), ctx);
    ctx.reportExport = ctx.window.reportExport;
    vm.runInContext(readFileSync('javascripts/orders.js', 'utf8'), ctx);
    return ctx;
}
test('CSV preserves accents, quotes, separators, lines and neutralizes formulas', () => {
    const { reportExport: exporter } = load();
    const csv = exporter.toCSV({title: 'Análisis', meta: [], sections: [{title:'Datos', headers:['Nombre'], rows:[['=SUM(A1)'], ['  @cmd'], ['Arroz; "fresco"\nnuevo'], [12.5]]}]});
    assert.ok(csv.startsWith('\uFEFF'));
    assert.ok(csv.includes('"\'=SUM(A1)"'));
    assert.ok(csv.includes('"\'  @cmd"'));
    assert.ok(csv.includes('"Arroz; ""fresco""\nnuevo"'));
    assert.ok(csv.includes('"12.5"'));
});
test('print report escapes HTML and excludes unselected private properties', () => {
    const { reportExport: exporter } = load();
    const report = exporter.orderReport([{id: 7, proveedor_nombre: '<script>alert(1)</script>', totalneto: '23', access_token: 'SECRET', detalles:[{producto_nombre:'Arroz', cantidad:2, preciounitario:10, descuentoaplicado:10}]}], 'client', 'Todos', true);
    const html = exporter.toHTML(report);
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('SECRET'));
    assert.equal(report.sections[1].rows[0][5], '18.00');
});
test('order export uses current filters and ignores IDs absent from role-scoped data', () => {
    const ctx = load();
    let exported;
    ctx.reportExport.deliver = report => { exported = report; };
    ctx.appUtils.showToast = () => {};
    const orders = ctx.window.orders;
    orders.userRole = 'client'; orders.currentFilter = 'Entregado';
    orders.orders = [{id:1, estado_actual:'Entregado'}, {id:2, estado_actual:'Cancelado'}];
    orders.exportReport('csv');
    assert.equal(exported.sections[0].rows.length, 1);
    assert.equal(exported.sections[0].rows[0][0], 1);
    exported = null;
    orders.exportReport('csv', 99);
    assert.equal(exported, null);
});
test('analytics exports selected period and currency with separate totals', () => {
    const { reportExport: exporter } = load();
    const report = exporter.analyticsReport({role:'client', start:'2026-01-01', end:'2026-02-01', currency:'Córdoba', data:{ventas:[{fecha__fecha:'2026-01',total_ventas:'23',total_pedidos:1,cantidad_items:2}], estados:[], productos:[], categorias:[], clientes:[], feedback:{disponible:false}}});
    assert.equal(report.title, 'Análisis de compras');
    assert.ok(report.meta.includes('Moneda: Córdoba'));
    assert.equal(report.sections[0].rows[0][1], '23');
    assert.equal(report.sections[4].title, 'Proveedores');
});
