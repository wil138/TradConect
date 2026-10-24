const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const vm = require('node:vm');
function context() {
    const values = new Map();
    const ctx = vm.createContext({ window: {}, console, AbortController,
        localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } });
    vm.runInContext(readFileSync('javascripts/utils/common.js', 'utf8'), ctx);
    ctx.appUtils = ctx.window.appUtils;
    return ctx;
}
function dateOffset(days, hour = 12) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour, 0, 0, 0);
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00:00`;
}

test('dashboard derives pending orders, customers and sales from company orders in selected currency', () => {
    const ctx = context();
    ctx.localStorage.setItem('marketplaceCurrency', '1');
    ctx.localStorage.setItem('pedidos_proveedor', JSON.stringify([
        {id:1, monedaid:1, restauranteid:'a', estado_actual:'Pendiente', totalneto:'100', fechapedido:dateOffset(1)},
        {id:2, monedaid:1, restauranteid:'a', estado_actual:'Entregado', totalneto:'50', fechapedido:dateOffset(2)},
        {id:3, monedaid:1, restauranteid:'b', estado_actual:'Cancelado', totalneto:'80', fechapedido:dateOffset(3)},
        {id:4, monedaid:2, restauranteid:'c', estado_actual:'Pendiente', totalneto:'900', fechapedido:dateOffset(4)}
    ]));
    vm.runInContext(readFileSync('javascripts/dashboard.js', 'utf8'), ctx);
    const dashboard = ctx.window.dashboard;
    dashboard.loadFromStorage();
    assert.equal(dashboard.data.total_ventas, 150);
    assert.equal(dashboard.data.total_pedidos, 3);
    assert.equal(dashboard.data.pendientes, 1);
    assert.equal(dashboard.data.clientes, 1);
    assert.equal(dashboard.salesData.data.reduce((a,b) => a+b, 0), 150);
    assert.deepEqual(JSON.parse(JSON.stringify(dashboard.dailySalesData.data.filter(value => value > 0))), [50, 100]);
    assert.equal(dashboard.dailySalesData.labels.length, 7);
    assert.equal(dashboard.dailySalesData.data.length, 7);
});
test('daily sales group same-date orders and exclude cancelled, invalid-date and other-currency orders', () => {
    const ctx = context();
    ctx.localStorage.setItem('marketplaceCurrency', '1');
    ctx.localStorage.setItem('pedidos_proveedor', JSON.stringify([
        {id:1, monedaid:1, estado_actual:'Pendiente', totalneto:'30', fechapedido:dateOffset(2, 8)},
        {id:2, monedaid:1, estado_actual:'Entregado', totalneto:'20', fechapedido:dateOffset(2, 16)},
        {id:3, monedaid:1, estado_actual:'Cancelado', totalneto:'90', fechapedido:dateOffset(2, 18)},
        {id:4, monedaid:1, estado_actual:'Enviado', totalneto:'40', fechapedido:'fecha-invalida'},
        {id:5, monedaid:2, estado_actual:'Entregado', totalneto:'70', fechapedido:dateOffset(1)}
    ]));
    vm.runInContext(readFileSync('javascripts/dashboard.js', 'utf8'), ctx);
    const dashboard = ctx.window.dashboard;
    dashboard.loadFromStorage();
    assert.deepEqual(JSON.parse(JSON.stringify(dashboard.dailySalesData.data)), [0, 0, 0, 0, 50, 0, 0]);
    assert.equal(dashboard.dailySalesData.labels.length, 7);
});
test('daily sales chart uses the dashboard purple palette', () => {
    const ctx = context();
    let chartConfig;
    ctx.Chart = function(_canvas, config) { chartConfig = config; };
    ctx.document = {getElementById: id => id === 'dailySalesChart' ? {} : null};
    vm.runInContext(readFileSync('javascripts/dashboard.js', 'utf8'), ctx);
    ctx.window.dashboard.dailySalesData = {labels: ['lun', 'mar'], data: [5, 8]};
    ctx.window.dashboard.createDailySalesChart();
    assert.equal(chartConfig.data.datasets[0].borderColor, '#7c3aed');
    assert.equal(chartConfig.data.datasets[0].backgroundColor, 'rgba(167, 139, 250, 0.72)');
});
test('landing strategic ecosystem displays four original partner category marks', () => {
    const html = readFileSync('index.html', 'utf8');
    const section = html.match(/<h2 class="section-title">Aliados estratégicos<\/h2>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(section);
    assert.equal((section.match(/class="partner-logo-card"/g) || []).length, 4);
    assert.match(section, /Producción local/);
    assert.match(section, /Gastronomía/);
    assert.match(section, /Abastecimiento/);
    assert.match(section, /Distribución local/);
    assert.doesNotMatch(section, /placehold\.co/);
});
test('dashboard business alerts report order progress and low stock from stored API data', () => {
    const ctx = context();
    ctx.localStorage.setItem('userRole', 'provider');
    ctx.localStorage.setItem('pedidos_proveedor', JSON.stringify([
        {id: 1, monedaid: 1, estado_actual: 'Pendiente'},
        {id: 2, monedaid: 1, estado_actual: 'Enviado'},
        {id: 3, monedaid: 1, estado_actual: 'Cancelado'}
    ]));
    ctx.localStorage.setItem('inventario', JSON.stringify([
        {productoid: 7, stockdisponible: 2, stockminimo: 5}
    ]));
    ctx.localStorage.setItem('productos', JSON.stringify([
        {id: 7, nombreproducto: 'Arroz'}
    ]));
    vm.runInContext(readFileSync('javascripts/dashboard.js', 'utf8'), ctx);
    const dashboard = ctx.window.dashboard;
    dashboard.loadFromStorage();
    const alerts = dashboard.getBusinessAlerts();
    assert.equal(alerts.length, 4);
    assert.match(alerts[0].message, /1 pedido requiere seguimiento/);
    assert.match(alerts[1].message, /0 confirmados · 1 enviado/);
    assert.match(alerts[2].message, /1 pedido cancelado/);
    assert.match(alerts[3].message, /Arroz: quedan 2; mínimo 5/);
});
test('dashboard order statuses distinguish preparation and transit badge colors', () => {
    const ctx = context();
    vm.runInContext(readFileSync('javascripts/dashboard.js', 'utf8'), ctx);
    const dashboard = ctx.window.dashboard;
    assert.equal(dashboard._getBadgeClass('En preparación'), 'badge-preparing');
    assert.equal(dashboard._getBadgeClass('En camino'), 'badge-in-transit');
});
test('stored data recovers from invalid JSON and wrong collection types', () => {
    const ctx = context();
    ctx.localStorage.setItem('items', '{broken');
    assert.equal(ctx.appUtils.readJSON('items', []).length, 0);
    ctx.localStorage.setItem('items', '{}');
    assert.equal(ctx.appUtils.readJSON('items', []).length, 0);
    assert.equal(ctx.appUtils.escapeHtml(0), '0');
    assert.equal(ctx.appUtils.escapeHtml('<"\'&>'), '&lt;&quot;&#39;&amp;&gt;');
});
test('API accepts empty successful responses and reports non-JSON responses', async () => {
    const ctx = context();
    vm.runInContext(readFileSync('javascripts/utils/api.js', 'utf8'), ctx);
    assert.equal(JSON.stringify(await ctx.window.api.readResponse({ text: async () => '', status: 204 })), '{}');
    await assert.rejects(ctx.window.api.readResponse({ text: async () => '<html>', status: 502 }), /HTTP 502/);
});

test('API counts failures by endpoint and status without retaining error messages', async () => {
    const ctx = context();
    ctx.localStorage.setItem('access_token', 'test-token');
    ctx.fetch = async () => ({ ok: false, status: 400, text: async () => JSON.stringify({ detail: 'Invalid payload with private data' }) });
    vm.runInContext(readFileSync('javascripts/utils/api.js', 'utf8'), ctx);

    const result = await ctx.window.api.request('/productos/?search=private-data');
    assert.equal(result.success, false);
    const stats = ctx.window.api.getErrorStats();
    assert.equal(stats.total, 1);
    assert.equal(stats.byEndpoint['/productos/'], 1);
    assert.equal(stats.byStatus.HTTP_400, 1);
    assert.equal(stats.lastErrorAt.length > 0, true);
    assert.equal(JSON.stringify(stats).includes('private-data'), false);

    ctx.window.api.resetErrorStats();
    assert.equal(ctx.window.api.getErrorStats().total, 0);
});

test('all router fragments exist with exact filename casing and contain no startup scripts', () => {
    const ctx = context();
    vm.runInContext(readFileSync('javascripts/utils/router.js', 'utf8'), ctx);
    const { readdirSync } = require('node:fs');
    for (const path of Object.values(ctx.window.router.routes)) {
        assert.ok(existsSync(path), path);
        assert.ok(readdirSync('fragments').includes(path.split('/')[1]), path);
        assert.doesNotMatch(readFileSync(path, 'utf8'), /<script\b/i);
    }
});

test('refresh uses JWT snapshot endpoint and preserves existing tokens', async () => {
    const ctx = context();
    ctx.localStorage.setItem('access_token', 'existing-access');
    ctx.localStorage.setItem('refresh_token', 'existing-refresh');
    ctx.fetch = async (url, options) => {
        assert.equal(url, 'http://localhost:8001/api/auth/my-data/');
        assert.equal(options.method, 'GET');
        assert.equal(options.headers.Authorization, 'Bearer existing-access');
        return { ok: true, status: 200, text: async () => JSON.stringify({usuario: {nombreusuario: 'Ana'}, productos: [{id: 1}]}) };
    };
    vm.runInContext(readFileSync('javascripts/utils/api.js', 'utf8'), ctx);
    assert.equal(await ctx.window.api.refreshFullData(), true);
    assert.equal(ctx.localStorage.getItem('access_token'), 'existing-access');
    assert.equal(ctx.localStorage.getItem('refresh_token'), 'existing-refresh');
    assert.equal(JSON.parse(ctx.localStorage.getItem('productos'))[0].id, 1);
});

test('API maps administrative roles independently from clients', () => {
    const ctx = context();
    vm.runInContext(readFileSync('javascripts/utils/api.js', 'utf8'), ctx);
    assert.equal(ctx.window.api.resolveRole('Admin'), 'admin');
    assert.equal(ctx.window.api.resolveRole('Gerencia'), 'staff');
    assert.equal(ctx.window.api.resolveRole('Cliente'), 'client');
    assert.equal(ctx.window.api.resolveRole('Proveedor'), 'provider');
    assert.equal(typeof ctx.window.api.getProducts, 'function');
    assert.equal(typeof ctx.window.api.getInventory, 'function');
});

test('sidebar shows the signed-in account name, role, company and avatar initial', () => {
    const values = new Map([
        ['userName', 'Ana López'],
        ['userEmail', 'ana@example.com'],
        ['userRole', 'provider'],
        ['user', JSON.stringify({ nombreusuario: 'Ana López', rol_nombre: 'Proveedor' })],
        ['company', JSON.stringify({ razonsocial: 'Alimentos del Norte' })]
    ]);
    const elements = Object.fromEntries(
        ['sidebarUserName', 'sidebarUserRole', 'sidebarUserCompany', 'sidebarUserAvatar']
            .map(id => [id, { textContent: '', title: '' }])
    );
    const ctx = vm.createContext({
        window: {},
        console,
        localStorage: {
            getItem: key => values.get(key) ?? null,
            setItem: (key, value) => values.set(key, value)
        },
        document: {
            getElementById: id => elements[id] || null,
            addEventListener() {}
        }
    });
    vm.runInContext(readFileSync('javascripts/utils/common.js', 'utf8'), ctx);
    ctx.appUtils = ctx.window.appUtils;
    vm.runInContext(readFileSync('javascripts/utils/rolusuario.js', 'utf8'), ctx);
    ctx.window.renderSidebarUser();

    assert.equal(elements.sidebarUserName.textContent, 'Ana López');
    assert.equal(elements.sidebarUserRole.textContent, 'Proveedor');
    assert.equal(elements.sidebarUserCompany.textContent, 'Alimentos del Norte');
    assert.equal(elements.sidebarUserAvatar.textContent, 'A');
});

test('theme control is placed in the authenticated sidebar, not the SPA header', () => {
    const html = readFileSync('index.html', 'utf8');
    const sidebar = html.match(/<div class="sidebar">([\s\S]*?)<\/div>\s*<div class="overlay"/)?.[1];
    const header = html.match(/<div class="user-actions">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(sidebar);
    assert.match(sidebar, /class="theme-toggle sidebar-theme-toggle" data-theme-toggle/);
    assert.match(sidebar, /id="logoutBtnSidebar"/);
    assert.ok(header);
    assert.doesNotMatch(header, /data-theme-toggle/);
});

test('checkout preserves string company IDs and fractional quantities without accepting client prices', () => {
    const ctx = context();
    ctx.document = {readyState:'loading', addEventListener() {}};
    vm.runInContext(readFileSync('javascripts/utils/cart.js', 'utf8'), ctx);
    const cart = ctx.window.CartModule;
    cart.selectedBranch = {id: 2}; cart.selectedPaymentMethod = {id: 3};
    const payload = cart.orderPayload({proveedorId: 'emp_001', items: [{id: 7, quantity: 1.25, price: 0.01, sucursalOrigenId: 4}]});
    assert.equal(payload.proveedor_id, 'emp_001');
    assert.equal(payload.items[0].cantidad, 1.25);
    assert.equal(payload.sucursal_origen_id, 4);
    assert.equal('precio_unitario' in payload.items[0], false);
});

test('money uses selected currency rather than an unconditional dollar sign', () => {
    const ctx = context();
    ctx.localStorage.setItem('catalogos', JSON.stringify({monedas:[{id:1,simbolo:'C$'},{id:2,simbolo:'$'}]}));
    assert.equal(ctx.appUtils.money(12.5,1), 'C$12.50');
    assert.equal(ctx.appUtils.money(12.5,2), '$12.50');
});

test('clearing cart requires confirmation and does not depend on checkout variables', () => {
    const ctx = context();
    ctx.document = {readyState:'loading', addEventListener() {}};
    ctx.confirm = () => false;
    vm.runInContext(readFileSync('javascripts/utils/cart.js', 'utf8'), ctx);
    const cart = ctx.window.CartModule;
    cart.cart = [{id:7}]; cart.saveCart = () => {}; cart.showToast = () => {};
    cart.clearCart(); assert.equal(cart.cart.length, 1);
    ctx.confirm = () => true;
    cart.clearCart(); assert.equal(cart.cart.length, 0);
});

test('partial checkout retains products whose order failed', async () => {
    const ctx = context();
    ctx.document = {readyState:'loading', addEventListener() {}};
    ctx.api = {quoteOrder:async()=>({success:true,data:{}}),refreshMyData:async()=>true};
    vm.runInContext(readFileSync('javascripts/utils/cart.js', 'utf8'), ctx);
    const cart = ctx.window.CartModule;
    cart.selectedBranch={id:1}; cart.selectedPaymentMethod={id:1};
    cart.cart=[{id:1,proveedorId:'a',sucursalOrigenId:1},{id:2,proveedorId:'b',sucursalOrigenId:2}];
    cart.showToast=()=>{}; cart.saveCart=()=>{}; cart.closeCart=()=>{};
    cart.showCheckoutConfirmationModal=async()=>true;
    cart._createOrderForProveedor=async group=>({success:group.proveedorId==='a',orderId:10});
    await cart.proceedCheckout();
    assert.equal(cart.cart.length,1); assert.equal(cart.cart[0].id,2);
});

test('frontend accepts central configuration from its API server and uses its base path', async () => {
    const ctx = context(); ctx.URL = URL; ctx.setTimeout = setTimeout; ctx.clearTimeout = clearTimeout;
    const calls = [];
    ctx.fetch = async url => {
        calls.push(url);
        const data = url.endsWith('/configuracion/') ? {api_base_url:'http://localhost:8001/proxy/api/'} : [];
        return {ok:true,status:200,text:async()=>JSON.stringify(data)};
    };
    vm.runInContext(readFileSync('javascripts/utils/api.js','utf8'),ctx);
    assert.equal((await ctx.window.api.loadConfiguration()).success,true);
    await ctx.window.api.publicRequest('/categorias/',{},false);
    assert.equal(calls[0],'http://localhost:8001/api/configuracion/');
    assert.equal(calls[1],'http://localhost:8001/proxy/api/categorias/');
    assert.equal(ctx.window.TRADCONNECT_CONFIG.apiBaseUrl,'http://localhost:8001/proxy/api');
});

test('frontend rejects a configuration pointing to another server', async () => {
    const ctx = context(); ctx.URL = URL; ctx.setTimeout = setTimeout; ctx.clearTimeout = clearTimeout;
    ctx.fetch = async () => ({ok:true,status:200,text:async()=>JSON.stringify({api_base_url:'https://untrusted.example/api'})});
    vm.runInContext(readFileSync('javascripts/utils/api.js','utf8'),ctx);
    assert.equal((await ctx.window.api.loadConfiguration()).success,false);
});
