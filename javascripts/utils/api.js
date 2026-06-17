// javascripts/utils/api.js - VERSIÓN CON REFRESCO AUTOMÁTICO TRAS CRUD (usa dump-all)
const API_BASE_URL = 'https://ntzjmczt-8000.use.devtunnels.ms/api';

const api = {
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
            throw new Error('No hay token de autenticación. Inicia sesión.');
        }
        
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const config = { ...options, headers };
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (response.status === 401 && !isPublic && endpoint !== '/auth/refresh/') {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    const newToken = localStorage.getItem('access_token');
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    const retry = await fetch(`${API_BASE_URL}${endpoint}`, config);
                    const retryData = await retry.json();
                    if (retry.ok) return { success: true, data: retryData };
                    throw new Error(retryData.error || retryData.detail || 'Error en reintento');
                } else {
                    this.logout();
                    throw new Error('Sesión expirada');
                }
            }
            
            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.error || data.detail || data.message || 'Error en la petición';
                throw new Error(errorMsg);
            }
            return { success: true, data };
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            return { success: false, error: error.message };
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
                } catch (e) {}
            }
        }

        const headers = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers 
        };
        const config = { ...options, headers };
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.error || data.detail || data.message || 'Error en la petición';
                throw new Error(errorMsg);
            }
            if (useCache) {
                localStorage.setItem(cacheKeyFinal, JSON.stringify({ timestamp: Date.now(), data }));
            }
            return { success: true, data, fromCache: false };
        } catch (error) {
            console.error(`Public API Error [${endpoint}]:`, error);
            const cached = localStorage.getItem(cacheKeyFinal);
            if (cached) {
                try {
                    const { data } = JSON.parse(cached);
                    console.warn(`⚠️ Usando caché expirada para ${endpoint}`);
                    return { success: true, data, fromCache: true, expired: true };
                } catch (e) {}
            }
            return { success: false, error: error.message };
        }
    },

    // =========================================================
    // REFRESH TOKEN
    // =========================================================
    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ refresh })
            });
            if (res.status === 404) {
                console.error('❌ Endpoint de refresh no encontrado.');
                return false;
            }
            const data = await res.json();
            if (res.ok && data.access) {
                localStorage.setItem('access_token', data.access);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error en refresh:', error);
            return false;
        }
    },

    // =========================================================
    // REFRESCO COMPLETO DE DATOS (dump-all) - GET autenticado
    // =========================================================
    async refreshFullData() {
        try {
            const result = await this.request('/auth/dump-all/', { method: 'GET' });
            if (result.success) {
                const data = result.data;
                console.log("🔄 Refrescando todos los datos desde dump-all");

                // Actualizar tokens (por si acaso)
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

                const rolNombre = usuario.rol_nombre || '';
                let role = 'client';
                if (rolNombre.toLowerCase() === 'proveedor') {
                    role = 'provider';
                } else if (rolNombre.toLowerCase() === 'restaurante') {
                    role = 'client';
                }
                localStorage.setItem('userRole', role);

                localStorage.setItem('catalogos', JSON.stringify(data.catalogos || {}));
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

    // =========================================================
    // REFRESCO DE DATOS (alias de refreshFullData para mantener compatibilidad)
    // =========================================================
    async refreshMyData() {
        // Usamos dump-all para obtener todos los datos, incluyendo pedidos
        return await this.refreshFullData();
    },

    // =========================================================
    // AUTENTICACIÓN (PÚBLICOS)
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

            const rolNombre = usuario.rol_nombre || '';
            let role = 'client';
            if (rolNombre.toLowerCase() === 'proveedor') {
                role = 'provider';
            } else if (rolNombre.toLowerCase() === 'restaurante') {
                role = 'client';
            }
            localStorage.setItem('userRole', role);

            localStorage.setItem('catalogos', JSON.stringify(data.catalogos || {}));
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
            return await this.login(userData.correo, userData.contrasena);
        }
        return regResult;
    },

    // =========================================================
    // MÉTODOS PRIVADOS (POST, PUT, DELETE, GET autenticados)
    // =========================================================
    async changePassword(oldPassword, newPassword) {
        return await this.request('/auth/change-password/', {
            method: 'POST',
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });
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
            method: 'PUT',
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
            method: 'PUT',
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
        return await this.publicRequest(endpoint, { method: 'GET' }, !forceRefresh, cacheKey);
    },

    // =========================================================
    // LOGOUT
    // =========================================================
    logout() {
        localStorage.clear();
        window.location.href = '/login.html';
    }
};

// Exponer globalmente
window.api = api;
console.log('✅ API Module con refresco automático usando dump-all');