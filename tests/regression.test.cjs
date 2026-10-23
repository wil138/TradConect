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
