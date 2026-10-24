const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {readFileSync} = require('node:fs');

test('notification bell displays escaped business alerts and current active count', () => {
    const nodes = {
        notificationCount: {hidden: true, textContent: ''},
        notificationList: {innerHTML: ''},
        notificationSummary: {textContent: ''}
    };
    const ctx = vm.createContext({
        window: {
            dashboard: {
                userRole: 'provider',
                loadFromStorage() {},
                getBusinessAlerts: () => [{
                    type: 'warning',
                    title: '<Stock bajo>',
                    message: 'Arroz <2',
                    module: 'inventory'
                }]
            }
        },
        document: {
            readyState: 'loading',
            addEventListener() {},
            getElementById: id => nodes[id] || null
        },
        localStorage: {getItem: key => key === 'access_token' ? 'token' : 'provider'},
        appUtils: {escapeHtml: value => String(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;')}
    });
    vm.runInContext(readFileSync('javascripts/notifications.js', 'utf8'), ctx);
    ctx.window.notifications.refresh();
    assert.equal(nodes.notificationCount.hidden, false);
    assert.equal(nodes.notificationCount.textContent, '1');
    assert.equal(nodes.notificationSummary.textContent, '1 aviso activo');
    assert.match(nodes.notificationList.innerHTML, /&lt;Stock bajo&gt;/);
    assert.match(nodes.notificationList.innerHTML, /data-notification-module="inventory"/);
    assert.ok(!nodes.notificationList.innerHTML.includes('<Stock bajo>'));
});
