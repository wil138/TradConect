// javascripts/utils/api.js - VERSIÓN CON REFRESCO AUTOMÁTICO TRAS CRUD (dump-all)
let API_BASE_URL = (window.TRADCONNECT_CONFIG?.apiBaseUrl || 'http://localhost:8001/api').replace(/\/$/, '');

const apiErrorStats = { total: 0, byEndpoint: {}, byStatus: {}, lastErrorAt: null };

function recordApiError(endpoint, status) {
    const path = String(endpoint).split('?')[0];
    const statusKey = Number.isInteger(status) ? `HTTP_${status}` : status || 'NETWORK_OR_RESPONSE';
    apiErrorStats.total++;
    apiErrorStats.byEndpoint[path] = (apiErrorStats.byEndpoint[path] || 0) + 1;
    apiErrorStats.byStatus[statusKey] = (apiErrorStats.byStatus[statusKey] || 0) + 1;
    apiErrorStats.lastErrorAt = new Date().toISOString();
}

const api = {
    loadConfiguration() {
        if (this._configurationRequest) return this._configurationRequest;
        this._configurationRequest = (async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            try {
                const response = await fetch(`${API_BASE_URL}/configuracion/`, {
                    headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal
                });
                const data = await this.readResponse(response);
                if (!response.ok || typeof data.api_base_url !== 'string') throw new Error('Configuración de API no disponible.');
                const next = new URL(data.api_base_url);
                if (next.origin !== new URL(API_BASE_URL).origin || !['http:', 'https:'].includes(next.protocol)) {
                    throw new Error('La configuración debe pertenecer al mismo servidor de la API.');
                }
                API_BASE_URL = next.href.replace(/\/$/, '');
                window.TRADCONNECT_CONFIG = { ...window.TRADCONNECT_CONFIG, apiBaseUrl: API_BASE_URL, links: data };
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                clearTimeout(timer);
            }
        })();
        return this._configurationRequest;
    },
    getConnectionStatus() {
        return this.publicRequest('/conexiones/', { method: 'GET' }, false);
    },
    getErrorStats() {
        return {
            total: apiErrorStats.total,
            byEndpoint: { ...apiErrorStats.byEndpoint },
            byStatus: { ...apiErrorStats.byStatus },
            lastErrorAt: apiErrorStats.lastErrorAt
        };
    },
    resetErrorStats() {
        apiErrorStats.total = 0;
        apiErrorStats.byEndpoint = {};
        apiErrorStats.byStatus = {};
        apiErrorStats.lastErrorAt = null;
    },
    invalidateMarketplaceCache() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith('marketplace_') || key?.startsWith('cache_/marketplace/')) localStorage.removeItem(key);
        }
    },
    resolveRole(name) {
        const value = String(name).toLowerCase();
        return value === 'proveedor' ? 'provider' : ['cliente','restaurante'].includes(value) ? 'client' : ['admin','administrador'].includes(value) ? 'admin' : 'staff';
    },
    formatError(data) {
        const value = data.error || data.detail || data.message || data;
        return typeof value === 'string' ? value : JSON.stringify(value);
    },
    async readResponse(response) {
        const text = await response.text();
        if (!text.trim()) return {};
        try { return JSON.parse(text); }
        catch { throw new Error(`Respuesta no v?lida del servidor (HTTP ${response.status})`); }
    },
    // =========================================================
    // MÉTODO PRINCIPAL DE PETICIONES (AUTENTICADAS)
    // =========================================================
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        const isPublic = endpoint === '/auth/login/' || endpoint === '/auth/register/' || endpoint === '/auth/refresh/';
        if (!isPublic && !token) {
            recordApiError(endpoint, 'CLIENT_AUTH');
            throw new Error('No hay token de autenticación. Inicia sesión.');
        }

        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config = { ...options, headers };
        let status = null;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            status = response.status;

            if (response.status === 401 && !isPublic && endpoint !== '/auth/refresh/') {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    const newToken = localStorage.getItem('access_token');
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    const retry = await fetch(`${API_BASE_URL}${endpoint}`, config);
                    status = retry.status;
                    const retryData = await this.readResponse(retry);
                    if (retry.ok) return { success: true, data: retryData };
                    throw new Error(this.formatError(retryData));
                } else {
                    this.logout();
                    throw new Error('Sesión expirada');
                }
            }

            const data = await this.readResponse(response);
            if (!response.ok) {
                const errorMsg = data.error || data.detail || data.message || Object.entries(data).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' ') : String(messages)}`).join('; ') || 'Error en la petición';
                throw new Error(errorMsg);
            }
            if (options.method && !['GET','HEAD'].includes(options.method.toUpperCase())) this.invalidateMarketplaceCache();
            return { success: true, data };
        } catch (error) {
            recordApiError(endpoint, status);
            console.error(`API Error [${endpoint}]:`, error);
            return { success: false, error: typeof error.message === 'string' ? error.message : JSON.stringify(error.message) };
        }
    },

    // =========================================================
    // MÉTODO PARA PETICIONES PÚBLICAS (SIN AUTENTICACIÓN)
    // =========================================================
    async publicRequest(endpoint, options = {}, useCache = true, cacheKey = null) {
        const cacheKeyFinal = cacheKey || `cache_${endpoint}`;
        if (useCache) {
            const cached = localStorage.getItem(cacheKeyFinal);
            if (cached) {
                try {
                    const { timestamp, data } = JSON.parse(cached);
                    if (Date.now() - timestamp < 300000) {
                        console.log(`📦 Usando caché para ${endpoint}`);
                        return { success: true, data, fromCache: true };
                    }
                } catch (e) { }
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };
        const config = { ...options, headers };
        let status = null;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            status = response.status;
            const data = await this.readResponse(response);
            if (!response.ok) {
                const errorMsg = data.error || data.detail || data.message || Object.entries(data).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' ') : String(messages)}`).join('; ') || 'Error en la petición';
                throw new Error(errorMsg);
            }
            if (useCache) {
                localStorage.setItem(cacheKeyFinal, JSON.stringify({ timestamp: Date.now(), data }));
            }
            return { success: true, data, fromCache: false };
        } catch (error) {
            recordApiError(endpoint, status);
            console.error(`Public API Error [${endpoint}]:`, error);
            const cached = localStorage.getItem(cacheKeyFinal);
            if (useCache && cached) {
                try {
                    const { data } = JSON.parse(cached);
                    console.warn(`⚠️ Usando caché expirada para ${endpoint}`);
                    return { success: true, data, fromCache: true, expired: true };
                } catch (e) { }
            }
            return { success: false, error: typeof error.message === 'string' ? error.message : JSON.stringify(error.message) };
        }
    },

    // =========================================================
    // REFRESH TOKEN
    // =========================================================
    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        let status = null;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ refresh })
            });
            status = res.status;
            if (res.status === 404) {
                console.error('❌ Endpoint de refresh no encontrado.');
                recordApiError('/auth/refresh/', status);
                return false;
            }
            const data = await res.json();
            if (res.ok && data.access) {
                localStorage.setItem('access_token', data.access);
                return true;
            }
            recordApiError('/auth/refresh/', status);
            return false;
        } catch (error) {
            recordApiError('/auth/refresh/', status);
            console.error('❌ Error en refresh:', error);
            return false;
        }
    },

    // =========================================================
    // REFRESCO COMPLETO DE DATOS (dump-all) - GET autenticado
    // =========================================================
    async refreshFullData() {
        try {
            const result = await this.request('/auth/my-data/', { method: 'GET' });
            if (result.success) {
                const data = result.data;
                console.log("🔄 Refrescando todos los datos desde dump-all");

                if (data.tokens) {
                    localStorage.setItem('access_token', data.tokens.access);
                    localStorage.setItem('refresh_token', data.tokens.refresh);
                }

                const usuario = data.usuario || {};
                const empresa = data.empresa || {};
                localStorage.setItem('user', JSON.stringify(usuario));
                localStorage.setItem('company', JSON.stringify(empresa));
                localStorage.setItem('userName', usuario.nombreusuario || 'Usuario');
                localStorage.setItem('userEmail', usuario.correoelectronico || '');

                const role = this.resolveRole(usuario.rol_nombre || '');
                localStorage.setItem('userRole', role);

                localStorage.setItem('catalogos', JSON.stringify(data.catalogos || {}));
                localStorage.setItem('marketplaceCurrency', String(data.moneda_catalogo_id || 1));
                localStorage.setItem('sucursales', JSON.stringify(data.sucursales || []));
                localStorage.setItem('productos', JSON.stringify(data.productos || []));
                localStorage.setItem('inventario', JSON.stringify(data.inventario || []));
                localStorage.setItem('promociones', JSON.stringify(data.promociones || []));
                localStorage.setItem('estadisticas', JSON.stringify(data.estadisticas || {}));
                localStorage.setItem('pedidos_comprador', JSON.stringify(data.pedidos_comprador || []));
                localStorage.setItem('pedidos_proveedor', JSON.stringify(data.pedidos_proveedor || []));

                console.log("✅ Datos refrescados correctamente");
                return true;
            }
            return false;
        } catch (error) {
            console.error("❌ Error al refrescar datos:", error);
            return false;
        }
    },

    async refreshMyData() {
        return await this.refreshFullData();
    },

    // =========================================================
    // AUTENTICACIÓN
    // =========================================================
    async login(usernameOrEmail, password) {
        const result = await this.publicRequest(
            '/auth/dump-all/',
            {
                method: 'POST',
                body: JSON.stringify({ username: usernameOrEmail, password })
            },
            false,
            null
        );

        if (result.success) {
            const data = result.data;
            console.log("✅ Datos recibidos de dump-all:", data);

            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);

            const usuario = data.usuario || {};
            const empresa = data.empresa || {};
            localStorage.setItem('user', JSON.stringify(usuario));
            localStorage.setItem('company', JSON.stringify(empresa));
            localStorage.setItem('userName', usuario.nombreusuario || 'Usuario');
            localStorage.setItem('userEmail', usuario.correoelectronico || '');

            const role = this.resolveRole(usuario.rol_nombre || '');
                localStorage.setItem('userRole', role);

            localStorage.setItem('catalogos', JSON.stringify(data.catalogos || {}));
                localStorage.setItem('marketplaceCurrency', String(data.moneda_catalogo_id || 1));
            localStorage.setItem('sucursales', JSON.stringify(data.sucursales || []));
            localStorage.setItem('productos', JSON.stringify(data.productos || []));
            localStorage.setItem('inventario', JSON.stringify(data.inventario || []));
            localStorage.setItem('promociones', JSON.stringify(data.promociones || []));
            localStorage.setItem('estadisticas', JSON.stringify(data.estadisticas || {}));
            localStorage.setItem('pedidos_comprador', JSON.stringify(data.pedidos_comprador || []));
            localStorage.setItem('pedidos_proveedor', JSON.stringify(data.pedidos_proveedor || []));

            console.log("📦 Datos guardados en localStorage");
            return { success: true, user: usuario, company: empresa };
        }
        return result;
    },

    async register(userData) {
        const regResult = await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (regResult.success) {
            const login = await this.login(userData.correo, userData.contrasena);
            if (!login.success) return { success: false, error: 'Tu cuenta fue creada. Inicia sesión para continuar; no necesitas registrarte nuevamente.' };
            return login;
        }
        return regResult;
    },

    // =========================================================
    // MÉTODOS PRIVADOS
    // =========================================================
    async changePassword(oldPassword, newPassword) {
        const result = await this.request('/auth/change-password/', {method: 'POST', body: JSON.stringify({old_password: oldPassword, new_password: newPassword})});
        if (result.success && result.data.tokens) {
            localStorage.setItem('access_token', result.data.tokens.access);
            localStorage.setItem('refresh_token', result.data.tokens.refresh);
        }
        return result;
    },

    async updateProfile(userData) {
        const result = await this.request('/auth/update-profile/', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // EMPRESAS
    async updateCompany(companyId, companyData) {
        const result = await this.request(`/empresas/${companyId}/`, {
            method: 'PATCH',
            body: JSON.stringify(companyData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // SUCURSALES
    async getBranchesByCompany(companyId) {
        return await this.request(`/empresas/${companyId}/sucursales/`, { method: 'GET' });
    },

    async createBranch(branchData) {
        const result = await this.request('/sucursales/', {
            method: 'POST',
            body: JSON.stringify(branchData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async updateBranch(branchId, branchData) {
        const result = await this.request(`/sucursales/${branchId}/`, {
            method: 'PUT',
            body: JSON.stringify(branchData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async deleteBranch(branchId) {
        const result = await this.request(`/sucursales/${branchId}/`, {
            method: 'DELETE'
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // PRODUCTOS
    getProducts() { return this.request('/productos/'); },
    getInventory() { return this.request('/inventario/'); },
    quoteOrder(data) { return this.request('/pedidos/cotizar/', { method: 'POST', body: JSON.stringify(data) }); },
    async createProduct(productData) {
        const result = await this.request('/productos/', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async updateProduct(productId, productData) {
        const result = await this.request(`/productos/${productId}/`, {
            method: 'PATCH',
            body: JSON.stringify(productData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async deleteProduct(productId) {
        const result = await this.request(`/productos/${productId}/`, {
            method: 'DELETE'
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // INVENTARIO
    async createInventory(inventoryData) {
        const result = await this.request('/inventario/', {
            method: 'POST',
            body: JSON.stringify(inventoryData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async updateInventory(inventoryId, inventoryData) {
        const result = await this.request(`/inventario/${inventoryId}/`, {
            method: 'PATCH',
            body: JSON.stringify(inventoryData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // PEDIDOS
    async createOrder(orderData) {
        const result = await this.request('/pedidos/', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async updateOrderStatus(orderId, estadoId, comentario = '') {
        const result = await this.request(`/pedidos/${orderId}/update_status/`, {
            method: 'PUT',
            body: JSON.stringify({ estado_id: estadoId, comentario })
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // PROMOCIONES
    async getCategories() {
        return await this.request('/categorias/', { method: 'GET' });
    },

    async getPromotions() {
        return await this.request('/promociones/', { method: 'GET' });
    },

    async createPromotion(promotionData) {
        const result = await this.request('/promociones/', {
            method: 'POST',
            body: JSON.stringify(promotionData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async updatePromotion(promotionId, promotionData) {
        const result = await this.request(`/promociones/${promotionId}/`, {
            method: 'PUT',
            body: JSON.stringify(promotionData)
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    async deletePromotion(promotionId) {
        const result = await this.request(`/promociones/${promotionId}/`, {
            method: 'DELETE'
        });
        if (result.success) {
            await this.refreshFullData();
        }
        return result;
    },

    // MARKETPLACE (público con caché)
    async getMarketplaceProducts(filters = {}, forceRefresh = false) {
        let endpoint = '/marketplace/';
        const params = new URLSearchParams();
        if (filters.category) params.append('categoria', filters.category);
        if (filters.proveedor) params.append('proveedor', filters.proveedor);
        if (filters.search) params.append('search', filters.search);
        const query = params.toString();
        if (query) endpoint += `?${query}`;
        const cacheKey = `marketplace_${query || 'all'}`;
        this._marketplaceRequests ||= new Map();
        if (this._marketplaceRequests.has(query)) return this._marketplaceRequests.get(query);
        const pending = (async () => {
            const result = await this.publicRequest(endpoint, { method: 'GET', cache: forceRefresh ? 'no-store' : 'default' }, !forceRefresh, cacheKey);
            if (result.success && !Array.isArray(result.data)) return { success: false, error: 'El catálogo recibido no es válido.' };
            if (result.success && !result.fromCache) {
                try { localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result.data })); } catch { /* La carga no depende de la caché. */ }
            }
            return result;
        })();
        this._marketplaceRequests.set(query, pending);
        try { return await pending; }
        finally { this._marketplaceRequests.delete(query); }
    },

    // =========================================================
    // NUEVOS MÉTODOS PARA ANÁLISIS (DATA WAREHOUSE)
    // =========================================================
    /**
     * Obtiene ventas agrupadas por fecha (día, mes, año)
     * @param {string} granularity - 'day', 'month', 'year'
     * @param {string} start - fecha inicio (YYYY-MM-DD)
     * @param {string} end - fecha fin (YYYY-MM-DD)
     * @returns {Promise<Object>} { success, data }
     */
    async analyticsData(start = null, end = null) {
        const role = localStorage.getItem('userRole') === 'provider' ? 'proveedor' : 'cliente';
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        return this.request(`/nosql/${role}/analitica/?${params}`);
    },
    async getSalesByDate(granularity = 'month', start = null, end = null) {
        const result = await this.analyticsData(start, end);
        return result.success ? {...result, data: result.data.ventas} : result;
    },
    async getTopProducts(limit = 5, start = null, end = null) {
        const result = await this.analyticsData(start, end);
        return result.success ? {...result, data: result.data.productos.slice(0, limit)} : result;
    },
    async getSalesByCategory(start = null, end = null) {
        const result = await this.analyticsData(start, end);
        return result.success ? {...result, data: result.data.categorias} : result;
    },
    async getSalesByCompany(start = null, end = null) {
        const result = await this.analyticsData(start, end);
        return result.success ? {...result, data: result.data.clientes} : result;
    },
    async getOrderStatusDistribution() {
        const result = await this.analyticsData();
        return result.success ? {...result, data: result.data.estados} : result;
    },

    getDocumentSchemas() {
        return this.request('/nosql/esquemas/');
    },
    listDocuments(collection, offset = 0) {
        return this.request(`/nosql/${encodeURIComponent(collection)}/?limit=50&offset=${offset}`);
    },
    createDocument(collection, data) {
        return this.request(`/nosql/${encodeURIComponent(collection)}/`, {
            method: 'POST', body: JSON.stringify(data)
        });
    },
    logout() {
        localStorage.clear();
        if (window.router && typeof window.router.redirectToLogin === 'function') {
            window.router.redirectToLogin();
        } else {
            window.location.reload();
        }
    }
};

// Exponer globalmente
window.api = api;
window.addEventListener?.('DOMContentLoaded', () => { api.loadConfiguration(); }, { once: true });
console.log('✅ API Module con refresco automático usando dump-all');
