// Formularios derivados de los esquemas del backend; acceso administrativo.
window.documents = {
    schemas: {}, offset: 0, generation: 0, loadGeneration: 0,
    collections: {
        usuarios_empresas_roles: ['Usuarios, empresas y roles', 'Usuarios y empresas'],
        preferencias_negocio: ['Preferencias de negocio', 'Preferencias'],
        preferencias_categorias: ['Preferencias de categorías', 'Preferencias'],
        preferencias_productos: ['Preferencias de productos', 'Preferencias'],
        preferencias_metodos_pago: ['Preferencias de métodos de pago', 'Preferencias'],
        evaluaciones_proveedores: ['Evaluaciones de proveedores', 'Evaluaciones y comentarios'],
        comentarios_post_compra: ['Comentarios poscompra', 'Evaluaciones y comentarios'],
        interacciones_comentario: ['Interacciones de comentarios', 'Evaluaciones y comentarios'],
        transacciones_no_exitosas: ['Transacciones no exitosas', 'Transacciones y necesidades'],
        sustituciones_ofrecidas: ['Sustituciones ofrecidas', 'Transacciones y necesidades'],
        necesidades_no_satisfechas: ['Necesidades no satisfechas', 'Transacciones y necesidades'],
        incidencias_entregas: ['Incidencias de entrega', 'Incidencias y evidencias'],
        evidencias_incidencia: ['Evidencias de incidencias', 'Incidencias y evidencias']
    },
    collectionLabel(name) { return this.collections[name]?.[0] || name.replaceAll('_', ' '); },
    fieldLabel(name) {
        const words = {id: 'ID', sql: 'SQL', ruc: 'RUC', url: 'URL', razon: 'razón', categorias: 'categorías', categoria: 'categoría', metodos: 'métodos', metodo: 'método', telefono: 'teléfono', direccion: 'dirección', calificacion: 'calificación', interaccion: 'interacción', puntuacion: 'puntuación', atencion: 'atención', actualizacion: 'actualización', asignacion: 'asignación', descripcion: 'descripción', opinion: 'opinión', post: 'poscompra'};
        if (name === 'password_hash') return 'Hash de contraseña';
        const text = name.replace(/^_/, '').split('_').map(word => words[word] || word).join(' ');
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    async init() {
        const generation = ++this.generation;
        this.setEnabled(false);
        const user = appUtils.readJSON('user', {});
        if (!['admin', 'administrador'].includes(String(user.rol_nombre || '').toLowerCase())) {
            document.getElementById('mongoForm').hidden = true;
            this.status('Esta sección requiere una cuenta administradora.');
            return;
        }
        this.status('Cargando colecciones...');
        const result = await api.getDocumentSchemas();
        if (generation !== this.generation) return;
        if (!result.success) { this.status(result.error); return; }
        this.schemas = result.data;
        const select = document.getElementById('mongoCollection');
        select.replaceChildren();
        const groups = new Map();
        const names = [...Object.keys(this.collections).filter(name => name in this.schemas), ...Object.keys(this.schemas).filter(name => !(name in this.collections))];
        for (const name of names) {
            const groupName = this.collections[name]?.[1] || 'Otras colecciones';
            if (!groups.has(groupName)) {
                const group = document.createElement('optgroup'); group.label = groupName;
                groups.set(groupName, group); select.append(group);
            }
            groups.get(groupName).append(new Option(this.collectionLabel(name), name));
        }
        if (!names.length) { this.status('No hay colecciones disponibles.'); return; }
        document.getElementById('mongoForm').hidden = false;
        this.setEnabled(true);
        select.onchange = () => { this.offset = 0; this.renderFields(); this.load(); };
        document.getElementById('mongoForm').onsubmit = event => { event.preventDefault(); this.save(); };
        document.getElementById('mongoPrevious').onclick = () => { this.offset = Math.max(0, this.offset - 50); this.load(); };
        document.getElementById('mongoNext').onclick = () => { this.offset += 50; this.load(); };
        this.offset = 0;
        this.renderFields();
        await this.load();
    },
    destroy() { ++this.generation; ++this.loadGeneration; },
    setEnabled(enabled) {
        for (const id of ['mongoCollection', 'mongoPrevious', 'mongoNext']) document.getElementById(id).disabled = !enabled;
        document.querySelector('#mongoForm button[type="submit"]').disabled = !enabled;
    },
    status(message) { const node = document.getElementById('mongoStatus'); if (node) node.textContent = message; },
    collection() { return document.getElementById('mongoCollection').value; },
    fieldSchema(property, schema) {
        let field = property.anyOf?.find(item => item.type !== 'null') || property;
        if (field.$ref) field = schema.$defs[field.$ref.split('/').pop()];
        return field;
    },
    renderFields() {
        const schema = this.schemas[this.collection()];
        const container = document.getElementById('mongoFields');
        container.replaceChildren();
        for (const [name, property] of Object.entries(schema.properties)) {
            const field = this.fieldSchema(property, schema);
            const label = document.createElement('label');
            label.textContent = this.fieldLabel(name);
            const input = document.createElement(field.enum || field.type === 'boolean' ? 'select' : 'input');
            input.name = name;
            input.required = (schema.required || []).includes(name);
            input.dataset.kind = field.type || 'string';
            if (input.tagName === 'SELECT') {
                input.add(new Option('Seleccionar', ''));
                for (const value of field.enum || ['true', 'false']) input.add(new Option(String(value), String(value)));
            } else {
                input.type = name === 'password_hash' ? 'password' : field.format === 'date-time' ? 'datetime-local' : field.format === 'email' ? 'email' : ['integer', 'number'].includes(field.type) ? 'number' : 'text';
                if (input.type === 'number') { input.step = field.type === 'integer' ? '1' : 'any'; }
                if (field.minimum !== undefined) input.min = field.minimum;
                if (field.maximum !== undefined) input.max = field.maximum;
                if (field.type === 'array') input.placeholder = 'Lista JSON: ["valor"]';
                if (name === 'password_hash') { input.autocomplete = 'new-password'; input.placeholder = 'Hash Django reconocido; no contraseña en texto'; }
            }
            label.append(input);
            container.append(label);
        }
    },
    async save() {
        const collection = this.collection();
        const form = document.getElementById('mongoForm');
        const button = form.querySelector('button[type="submit"]');
        const payload = {};
        try {
            for (const input of document.getElementById('mongoFields').querySelectorAll('[name]')) {
                if (!input.value) continue;
                let value = input.value;
                if (input.dataset.kind === 'array') value = JSON.parse(value);
                else if (input.dataset.kind === 'boolean') value = value === 'true';
                else if (['integer', 'number'].includes(input.dataset.kind)) value = Number(value);
                else if (input.type === 'datetime-local') value = new Date(value).toISOString();
                payload[input.name] = value;
            }
            button.disabled = true;
            const generation = this.generation;
            const result = await api.createDocument(collection, payload);
            if (generation !== this.generation || collection !== this.collection()) return;
            if (!result.success) { this.status(result.error); return; }
            form.reset();
            this.offset = 0;
            await this.load();
            this.status('Documento guardado: ' + result.data._id);
        } catch (error) { this.status('Revisa los datos: ' + error.message); }
        finally { button.disabled = false; }
    },
    async load() {
        const collection = this.collection(), generation = this.generation, offset = this.offset;
        const loadId = ++this.loadGeneration;
        document.getElementById('mongoPrevious').disabled = true;
        document.getElementById('mongoNext').disabled = true;
        this.status('Cargando documentos...');
        const result = await api.listDocuments(collection, offset);
        if (loadId !== this.loadGeneration || generation !== this.generation || collection !== this.collection() || offset !== this.offset) return;
        const container = document.getElementById('mongoResults');
        container.replaceChildren();
        document.getElementById('mongoPrevious').disabled = offset === 0;
        document.getElementById('mongoNext').disabled = !result.success || result.data.results.length < 50;
        if (!result.success) { this.status(result.error); return; }
        this.status(result.data.results.length ? `${this.collectionLabel(collection)}: ${result.data.results.length} documentos. Página ${Math.floor(offset / 50) + 1}.` : 'No hay documentos en esta página.');
        const fields = Object.keys(this.schemas[collection].properties).filter(name => name !== 'password_hash');
        const columns = fields.filter(name => !name.endsWith('_id') && !name.endsWith('_id_sql')).slice(0, 3);
        if (!columns.length) columns.push(...fields.slice(0, 3));
        const wrapper = document.createElement('div'); wrapper.className = 'table-wrapper';
        const table = document.createElement('table'), head = document.createElement('thead'), header = document.createElement('tr');
        for (const label of ['Identificador', ...columns.map(name => this.fieldLabel(name)), 'Detalle']) {
            const th = document.createElement('th'); th.scope = 'col'; th.textContent = label; header.append(th);
        }
        head.append(header); table.append(head);
        const body = document.createElement('tbody');
        for (const item of result.data.results) {
            const row = document.createElement('tr');
            for (const name of ['_id', ...columns]) {
                const cell = document.createElement('td');
                cell.textContent = this.displayValue(item[name]); row.append(cell);
            }
            const cell = document.createElement('td'), details = document.createElement('details'), summary = document.createElement('summary'), list = document.createElement('dl');
            summary.textContent = 'Ver detalle';
            for (const name of ['_id', ...fields]) {
                if (!(name in item)) continue;
                const term = document.createElement('dt'), value = document.createElement('dd');
                term.textContent = this.fieldLabel(name); value.textContent = this.displayValue(item[name]);
                list.append(term, value);
            }
            details.append(summary, list); cell.append(details); row.append(cell); body.append(row);
        }
        table.append(body); wrapper.append(table); container.append(wrapper);
    },
    displayValue(value) {
        if (value == null) return '—';
        if (typeof value === 'boolean') return value ? 'Sí' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
};
