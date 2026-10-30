const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');

function loadApi(fetch) {
    const stored = new Map();
    const context = vm.createContext({
        window: {
            TRADCONNECT_CONFIG: { apiBaseUrl: 'http://localhost:8001/api' },
            addEventListener() {},
            location: { reload() {} }
        },
        localStorage: {
            get length() { return stored.size; },
            getItem(key) { return stored.get(key) || null; },
            setItem(key, value) { stored.set(key, String(value)); },
            removeItem(key) { stored.delete(key); },
            key(index) { return [...stored.keys()][index] || null; },
            clear() { stored.clear(); }
        },
        fetch,
        AbortController,
        URL,
        setTimeout,
        clearTimeout,
        console: { log() {}, warn() {}, error() {} }
    });

    vm.runInContext(
        readFileSync('javascripts/utils/api.js', 'utf8'),
        context,
        { filename: 'javascripts/utils/api.js' }
    );
    return context.window.api;
}

function jsonResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        async text() { return JSON.stringify(data); }
    };
}

test('frontend loads API configuration and checks the backend connection', async () => {
    const requests = [];
    const api = loadApi(async (url, options) => {
        requests.push({ url, options });
        if (url.endsWith('/configuracion/')) {
            return jsonResponse({ api_base_url: 'http://localhost:8001/api' });
        }
        if (url.endsWith('/conexiones/')) {
            return jsonResponse({ api: 'available', database: 'connected' });
        }
        throw new Error(`Unexpected request: ${url}`);
    });

    const configuration = await api.loadConfiguration();
    const connection = await api.getConnectionStatus();

    assert.equal(configuration.success, true);
    assert.equal(requests[0].url, 'http://localhost:8001/api/configuracion/');
    assert.equal(requests[1].url, 'http://localhost:8001/api/conexiones/');
    assert.equal(connection.success, true);
    assert.deepEqual(
        JSON.parse(JSON.stringify(connection.data)),
        { api: 'available', database: 'connected' }
    );
});

test('frontend surfaces backend connection errors and records their status', async () => {
    const api = loadApi(async () => jsonResponse(
        {
            api: 'available',
            database: 'unavailable',
            error: 'No se pudo conectar a la base de datos.'
        },
        503
    ));

    const result = await api.getConnectionStatus();

    assert.equal(result.success, false);
    assert.equal(result.error, 'No se pudo conectar a la base de datos.');
    assert.equal(api.getErrorStats().byStatus.HTTP_503, 1);
});
