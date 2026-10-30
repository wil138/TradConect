window.feedback = {
    generation: 0, offset: 0, options: {},
    types: {
        incidencias_entregas: 'Reclamos de entrega',
        evaluaciones_proveedores: 'Evaluaciones de proveedores',
        comentarios_post_compra: 'Comentarios y respuestas',
        preferencias_negocio: 'Preferencias de entrega',
        preferencias_categorias: 'Categorías preferidas',
        preferencias_productos: 'Productos preferidos',
        preferencias_metodos_pago: 'Métodos de pago preferidos',
        necesidades_no_satisfechas: 'Insumos no encontrados',
        transacciones_no_exitosas: 'Transacciones no completadas',
        sustituciones_ofrecidas: 'Sustituciones ofrecidas',
        evidencias_incidencia: 'Evidencias de reclamos'
    },
    labels: {
        pedido_id_sql: 'Pedido', tipo_incidencia: 'Tipo de incidencia', tipo_reclamo: 'Tipo de reclamo',
        calidad: 'Calidad', tiempo_entrega: 'Tiempo de entrega', precio: 'Precio', atencion: 'Atención',
        comentario: 'Comentario', opinion_libre: 'Tu opinión', calificacion: 'Calificación',
        horario_entrega_preferido: 'Horario de entrega preferido', insumo_buscado: 'Insumo buscado',
        cantidades_requeridas: 'Cantidad requerida', unidad: 'Unidad', categoria_id_sql: 'Categoría',
        puntuacion: 'Puntuación promedio', estado: 'Estado', fecha: 'Fecha',
        fecha_actualizacion: 'Última actualización', fecha_intento: 'Fecha del intento',
        fecha_respuesta: 'Fecha de respuesta', respuesta_proveedor: 'Respuesta del proveedor',
        cliente_nombre: 'Cliente', proveedor_nombre: 'Proveedor', usuario_nombre: 'Autor',
        motivo: 'Motivo', monto_tentativo: 'Monto tentativo',
        producto_solicitado: 'Producto solicitado',
        producto_alternativo_ofrecido: 'Producto alternativo ofrecido',
        nombre_archivo: 'Archivo de evidencia', url: 'Ubicación de evidencia'
    },
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
        select.replaceChildren();
        for (const [name, label] of Object.entries(this.types)) {
            if (!this.provider || [
                'incidencias_entregas', 'evaluaciones_proveedores',
                'comentarios_post_compra', 'transacciones_no_exitosas',
                'sustituciones_ofrecidas', 'evidencias_incidencia'
            ].includes(name)) select.add(new Option(label, name));
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
        const fields = this.fields[this.type()];
        document.getElementById('feedbackForm').hidden = this.provider || !fields;
        if (!fields || this.provider) return;
        for (const [name, kind] of Object.entries(fields)) {
            const label = document.createElement('label'); label.textContent = this.labels[name] || name.replaceAll('_', ' ');
            const input = document.createElement(
                ['pedido', 'categoria', 'score'].includes(kind)
                    ? 'select'
                    : ['opinion_libre', 'comentario'].includes(name)
                        ? 'textarea'
                        : 'input'
            );
            input.name = name; input.required = kind !== 'optional';
            if (input.tagName === 'SELECT') {
                input.add(new Option('Seleccionar', ''));
                const values = kind === 'pedido' ? (this.options.pedidos || []).map(p => [p.id, '#' + p.id + ' — ' + p.proveedor]) : kind === 'categoria' ? (this.options.categorias || []).map(c => [c.id, c.nombrecategoria]) : [1,2,3,4,5].map(n => [n,n]);
                for (const [value, text] of values) input.add(new Option(text, value));
            } else {
                if (input.tagName === 'TEXTAREA') input.rows = 4;
                else input.type = kind === 'number' ? 'number' : 'text';
                if (kind === 'number') input.min = 1;
                input.maxLength = name === 'opinion_libre' || name === 'comentario' ? 2000 : 250;
            }
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
        const results = result.success && Array.isArray(result.data?.results) ? result.data.results : [];
        document.getElementById('feedbackNext').disabled = !result.success || results.length < 50;
        if (!result.success) { this.status(result.error); return; }
        this.status(results.length ? `${results.length} registros cargados.` : 'No hay registros en esta página.');
        for (const item of results) {
            if (type === 'comentarios_post_compra') {
                this.renderComment(item, generation);
                continue;
            }
            const card = document.createElement('article');
            const pre = document.createElement('p');
            pre.className = 'feedback-description';
            pre.textContent = Object.entries(item)
                .filter(([key, value]) => ![
                    'id', '_id', 'usuario_id', 'cliente_empresa_id',
                    'proveedor_empresa_id', 'empresa_id', 'preferencia_id',
                    'incidencia_id', 'transaccion_id', 'comentario_id'
                ].includes(key) && value != null)
                .map(([key, value]) => {
                    const label = this.labels[key] || key.replaceAll('_', ' ');
                    const display = key.startsWith('fecha') && value
                        ? new Date(value).toLocaleString('es-NI')
                        : typeof value === 'object' ? JSON.stringify(value) : String(value);
                    return `${label}: ${display}`;
                }).join('\n');
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
    },
    renderComment(item, generation) {
        const container = document.getElementById('feedbackResults');
        const card = document.createElement('article');
        card.className = 'feedback-comment';

        const heading = document.createElement('h3');
        heading.textContent = item.usuario_nombre || item.cliente_nombre || 'Cliente';
        const metadata = document.createElement('p');
        metadata.className = 'feedback-comment-meta';
        const rating = Number(item.calificacion);
        const stars = Number.isFinite(rating) ? `${'★'.repeat(Math.max(0, Math.min(5, Math.round(rating))))}${'☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(rating))))}` : 'Sin calificación';
        const date = item.fecha ? new Date(item.fecha).toLocaleDateString('es-NI') : 'Fecha no disponible';
        metadata.textContent = `${stars} · ${date} · Pedido #${item.pedido_id_sql ?? '—'}`;
        const message = document.createElement('p');
        message.className = 'feedback-comment-message';
        message.textContent = item.opinion_libre || 'Sin comentario escrito.';
        card.append(heading, metadata, message);

        const thread = document.createElement('section');
        thread.className = 'feedback-comment-thread';
        const threadTitle = document.createElement('h4');
        const interactions = Array.isArray(item.interacciones) ? item.interacciones : [];
        threadTitle.textContent = interactions.length ? `Respuestas (${interactions.length})` : 'Conversación';
        thread.append(threadTitle);
        for (const interaction of interactions) {
            const reply = document.createElement('article');
            reply.className = 'feedback-comment-reply';
            const author = document.createElement('strong');
            author.textContent = interaction.usuario_nombre || 'Participante';
            const replyMessage = document.createElement('p');
            replyMessage.textContent = interaction.mensaje || 'Respuesta vacía.';
            const replyDate = document.createElement('small');
            replyDate.textContent = interaction.fecha ? new Date(interaction.fecha).toLocaleString('es-NI') : '';
            reply.append(author, replyMessage, replyDate);
            thread.append(reply);
        }

        const form = document.createElement('form');
        form.className = 'feedback-comment-reply-form';
        const input = document.createElement('textarea');
        input.name = 'mensaje';
        input.rows = 2;
        input.maxLength = 2000;
        input.required = true;
        input.placeholder = 'Escribe una respuesta (máximo 2000 caracteres)';
        input.setAttribute('aria-label', 'Respuesta al comentario');
        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = 'Responder';
        form.append(input, button);
        form.onsubmit = async event => {
            event.preventDefault();
            const messageValue = input.value.trim();
            if (!messageValue) { input.focus(); return; }
            button.disabled = true;
            try {
                const result = await api.request(
                    '/nosql/mi-empresa/comentarios/' + encodeURIComponent(item.id) + '/interacciones/',
                    {method: 'POST', body: JSON.stringify({mensaje: messageValue})}
                );
                if (generation !== this.generation) return;
                if (!result.success) { this.status(result.error, 'error'); return; }
                await this.load();
                this.status('Respuesta enviada.');
            } finally {
                button.disabled = false;
            }
        };
        thread.append(form);
        card.append(thread);
        container.append(card);
    }
};
