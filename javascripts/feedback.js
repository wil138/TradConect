window.feedback = {
    generation: 0, offset: 0, options: {},
    types: {incidencias_entregas: 'Reclamos de entrega', evaluaciones_proveedores: 'Evaluar proveedor', comentarios_post_compra: 'Comentario de compra', preferencias_negocio: 'Preferencias de entrega', necesidades_no_satisfechas: 'Insumos no encontrados'},
    fields: {
        incidencias_entregas: {pedido_id_sql: 'pedido', tipo_incidencia: 'text', tipo_reclamo: 'text'},
        evaluaciones_proveedores: {pedido_id_sql: 'pedido', calidad: 'score', tiempo_entrega: 'score', precio: 'score', atencion: 'score', comentario: 'optional'},
        comentarios_post_compra: {pedido_id_sql: 'pedido', opinion_libre: 'text', calificacion: 'score'},
        preferencias_negocio: {horario_entrega_preferido: 'text'},
        necesidades_no_satisfechas: {insumo_buscado: 'text', cantidades_requeridas: 'number', unidad: 'text', categoria_id_sql: 'categoria'}
    },
    status(text) { const node = document.getElementById('feedbackStatus'); if (node) node.textContent = text; },
    type() { return document.getElementById('feedbackType').value; },
    async init() {
        const generation = ++this.generation;
        this.provider = localStorage.getItem('userRole') === 'provider';
        document.getElementById('feedbackTitle').textContent = this.provider ? 'Reclamos y opiniones de clientes' : 'Atención y preferencias';
        const select = document.getElementById('feedbackType');
        for (const [name, label] of Object.entries(this.types)) {
            if (!this.provider || ['incidencias_entregas', 'evaluaciones_proveedores', 'comentarios_post_compra'].includes(name)) select.add(new Option(label, name));
        }
        document.getElementById('feedbackForm').hidden = this.provider;
        if (!this.provider) {
            const result = await api.request('/nosql/cliente/opciones/');
            if (generation !== this.generation) return;
            if (!result.success) { this.status(result.error); document.getElementById('feedbackForm').hidden = true; return; }
            this.options = result.data;
        }
        select.onchange = () => { this.offset = 0; this.renderFields(); this.load(); };
        document.getElementById('feedbackForm').onsubmit = event => { event.preventDefault(); this.save(event.currentTarget); };
        document.getElementById('feedbackPrevious').onclick = () => { this.offset = Math.max(0, this.offset - 50); this.load(); };
        document.getElementById('feedbackNext').onclick = () => { this.offset += 50; this.load(); };
        this.offset = 0; this.renderFields(); await this.load();
    },
    destroy() { ++this.generation; },
    renderFields() {
        const container = document.getElementById('feedbackFields'); container.replaceChildren();
        if (this.provider) return;
        for (const [name, kind] of Object.entries(this.fields[this.type()])) {
            const label = document.createElement('label'); label.textContent = name.replaceAll('_', ' ');
            const input = document.createElement(['pedido', 'categoria', 'score'].includes(kind) ? 'select' : 'input');
            input.name = name; input.required = kind !== 'optional';
            if (input.tagName === 'SELECT') {
                input.add(new Option('Seleccionar', ''));
                const values = kind === 'pedido' ? this.options.pedidos.map(p => [p.id, '#' + p.id + ' — ' + p.proveedor]) : kind === 'categoria' ? this.options.categorias.map(c => [c.id, c.nombrecategoria]) : [1,2,3,4,5].map(n => [n,n]);
                for (const [value, text] of values) input.add(new Option(text, value));
            } else { input.type = kind === 'number' ? 'number' : 'text'; input.min = 1; input.maxLength = 2000; }
            label.append(input); container.append(label);
        }
    },
    async save(form) {
        const type = this.type(), generation = this.generation;
        const payload = Object.fromEntries(new FormData(form));
        for (const key of ['pedido_id_sql', 'categoria_id_sql', 'calidad', 'tiempo_entrega', 'precio', 'atencion', 'calificacion', 'cantidades_requeridas']) if (key in payload) payload[key] = Number(payload[key]);
        const button = form.querySelector('button'); button.disabled = true;
        try {
            const result = await api.request('/nosql/mi-empresa/' + type + '/', {method: 'POST', body: JSON.stringify(payload)});
            if (generation !== this.generation || type !== this.type()) return;
            if (!result.success) { this.status(result.error); return; }
            form.reset(); this.offset = 0; await this.load(); this.status('Registro enviado correctamente.');
        } finally { button.disabled = false; }
    },
    async load() {
        const type = this.type(), generation = this.generation, offset = this.offset;
        this.status('Cargando…');
        const result = await api.request('/nosql/mi-empresa/' + type + '/?offset=' + offset);
        if (generation !== this.generation || type !== this.type() || offset !== this.offset) return;
        const container = document.getElementById('feedbackResults'); container.replaceChildren();
        document.getElementById('feedbackPrevious').disabled = offset === 0;
        document.getElementById('feedbackNext').disabled = !result.success || result.data.results.length < 50;
        if (!result.success) { this.status(result.error); return; }
        this.status(result.data.results.length ? 'Registros actualizados.' : 'No hay registros en esta página.');
        for (const item of result.data.results) {
            const card = document.createElement('article');
            const pre = document.createElement('p');
            pre.className = 'feedback-description';
            pre.textContent = Object.entries(item).filter(([key, value]) => !['_id', 'usuario_id', 'cliente_empresa_id', 'proveedor_empresa_id', 'empresa_id'].includes(key) && value != null).map(([key, value]) => key.replaceAll('_', ' ') + ': ' + value).join('\n');
            card.append(pre);
            if (this.provider && type === 'incidencias_entregas') {
                const form = document.createElement('form'), select = document.createElement('select'), response = document.createElement('textarea'), button = document.createElement('button');
                select.setAttribute('aria-label', 'Estado del reclamo');
                for (const state of ['Pendiente', 'En proceso', 'Resuelta']) select.add(new Option(state, state));
                select.value = item.estado;
                response.required = true; response.maxLength = 2000; response.value = item.respuesta_proveedor || ''; response.placeholder = 'Respuesta para el cliente'; response.setAttribute('aria-label', 'Respuesta para el cliente');
                button.textContent = 'Guardar respuesta'; button.type = 'submit';
                form.append(select, response, button);
                form.onsubmit = async event => {
                    event.preventDefault(); button.disabled = true;
                    try {
                        const result = await api.request('/nosql/mi-empresa/reclamos/' + encodeURIComponent(item._id) + '/', {method: 'PATCH', body: JSON.stringify({estado: select.value, respuesta_proveedor: response.value})});
                        if (generation !== this.generation) return;
                        if (result.success) await this.load(); else this.status(result.error);
                    } finally { button.disabled = false; }
                };
                card.append(form);
            }
            container.append(card);
        }
    }
};
