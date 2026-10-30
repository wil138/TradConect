const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const vm = require('node:vm');

class Element {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.children = [];
        this.attributes = {};
        this.value = '';
        this.disabled = false;
        this.textContent = '';
    }

    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() {}
}

function createFeedback() {
    const results = new Element('div');
    const status = new Element('p');
    const form = new Element('form');
    const fields = new Element('div');
    const requests = [];
    const ctx = vm.createContext({
        window: {},
        document: {
            createElement: tag => new Element(tag),
            getElementById: id => ({
                feedbackResults: results,
                feedbackStatus: status,
                feedbackForm: form,
                feedbackFields: fields
            })[id] || null
        },
        api: {
            request: async (...args) => {
                requests.push(args);
                return {success: true, data: {}};
            }
        },
        console
    });
    vm.runInContext(readFileSync('javascripts/feedback.js', 'utf8'), ctx);
    ctx.window.feedback.generation = 1;
    ctx.window.feedback.load = async () => {};
    return {feedback: ctx.window.feedback, results, requests, status, form};
}

function findByClass(node, className) {
    if (node.className === className) return node;
    for (const child of node.children) {
        const found = findByClass(child, className);
        if (found) return found;
    }
    return null;
}

test('comments render safely with rating, replies and a participant-only reply form', async () => {
    const {feedback, results, requests, status} = createFeedback();
    feedback.renderComment({
        id: 'review-1',
        pedido_id_sql: 8,
        usuario_nombre: 'Ana',
        calificacion: 5,
        opinion_libre: '<script>texto</script>',
        interacciones: [{
            id: 'reply-1',
            usuario_nombre: 'Luis',
            mensaje: 'Gracias por compartirlo.',
            fecha: '2026-10-30T20:00:00Z'
        }]
    }, 1);

    const card = results.children[0];
    assert.equal(findByClass(card, 'feedback-comment-message').textContent, '<script>texto</script>');
    assert.equal(findByClass(card, 'feedback-comment-reply').children[0].textContent, 'Luis');
    const form = findByClass(card, 'feedback-comment-reply-form');
    const textarea = form.children[0];
    textarea.value = '  Vamos a darle seguimiento.  ';
    let prevented = false;
    await form.onsubmit({preventDefault() { prevented = true; }});

    assert.equal(prevented, true);
    assert.equal(requests[0][0], '/nosql/mi-empresa/comentarios/review-1/interacciones/');
    assert.equal(JSON.parse(requests[0][1].body).mensaje, 'Vamos a darle seguimiento.');
    assert.equal(status.textContent, 'Respuesta enviada.');
});

test('company feedback exposes all 12 business collections and keeps non-conversation records read-only', () => {
    const {feedback, form} = createFeedback();
    assert.equal(Object.keys(feedback.types).length, 11);
    assert.equal(feedback.types.comentarios_post_compra, 'Comentarios y respuestas');
    feedback.type = () => 'transacciones_no_exitosas';
    feedback.renderFields();
    assert.equal(form.hidden, true);
});
