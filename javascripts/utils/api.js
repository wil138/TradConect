// javascripts/utils/api.js
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const config = { ...options, headers };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            // Si es 401 y no es dump-all (que ya incluye credenciales)
            if (response.status === 401 && endpoint !== '/auth/dump-all/') {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    const newToken = localStorage.getItem('access_token');
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    const retry = await fetch(`${API_BASE_URL}${endpoint}`, config);
                    const retryData = await retry.json();
                    if (retry.ok) return { success: true, data: retryData };
                    throw new Error(retryData.error || 'Error');
                } else {
                    this.logout();
                    throw new Error('Sesión expirada');
                }
            }
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.detail || 'Error');
            return { success: true, data };
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            return { success: false, error: error.message };
        }
    },

    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
            });
            if (res.status === 404) return false;
            const data = await res.json();
            if (res.ok && data.access) {
                localStorage.setItem('access_token', data.access);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    // 🔥 LOGIN usando dump_all_data
    async login(usernameOrEmail, password) {
        const result = await this.request('/auth/dump-all/', {
            method: 'POST',
            body: JSON.stringify({ username: usernameOrEmail, password })
        });
        if (result.success) {
            const data = result.data;
            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            localStorage.setItem('company', JSON.stringify(data.empresa));
            localStorage.setItem('userName', data.usuario.nombreusuario);
            localStorage.setItem('userEmail', data.usuario.correoelectronico);
            // Mapeo de rol: 'Proveedor' -> provider, 'Restaurante' -> client
            const role = data.usuario.rolid?.nombrerol === 'Proveedor' ? 'provider' : 'client';
            localStorage.setItem('userRole', role);
            localStorage.setItem('catalogos', JSON.stringify(data.catalogos));
            if (data.empresa) {
                localStorage.setItem('sucursales', JSON.stringify(data.sucursales || []));
                localStorage.setItem('productos', JSON.stringify(data.productos || []));
                localStorage.setItem('pedidos_comprador', JSON.stringify(data.pedidos_comprador || []));
                localStorage.setItem('pedidos_proveedor', JSON.stringify(data.pedidos_proveedor || []));
                localStorage.setItem('inventario', JSON.stringify(data.inventario || []));
                localStorage.setItem('promociones', JSON.stringify(data.promociones || []));
                localStorage.setItem('estadisticas', JSON.stringify(data.estadisticas || {}));
            }
            return { success: true, user: data.usuario, company: data.empresa };
        }
        return result;
    },

    // 🔥 REGISTRO + dump_all_data automático
    async register(userData) {
        const regResult = await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        if (regResult.success) {
            // Después de registrar, hacemos login para obtener todos los datos
            return await this.login(userData.correo, userData.contrasena);
        }
        return regResult;
    },

    // Métodos para escritura (actualizaciones)
    async updateCompany(companyId, companyData) {
        const result = await this.request(`/empresas/${companyId}/`, {
            method: 'PUT',
            body: JSON.stringify(companyData)
        });
        if (result.success) localStorage.setItem('company', JSON.stringify(result.data));
        return result;
    },
    async createBranch(branchData) {
        const result = await this.request('/sucursales/', {
            method: 'POST',
            body: JSON.stringify(branchData)
        });
        if (result.success) {
            const branches = JSON.parse(localStorage.getItem('sucursales') || '[]');
            branches.push(result.data);
            localStorage.setItem('sucursales', JSON.stringify(branches));
        }
        return result;
    },
    async updateBranch(branchId, branchData) {
        const result = await this.request(`/sucursales/${branchId}/`, {
            method: 'PUT',
            body: JSON.stringify(branchData)
        });
        if (result.success) {
            const branches = JSON.parse(localStorage.getItem('sucursales') || '[]');
            const index = branches.findIndex(b => b.id === branchId);
            if (index !== -1) branches[index] = result.data;
            localStorage.setItem('sucursales', JSON.stringify(branches));
        }
        return result;
    },
    async deleteBranch(branchId) {
        const result = await this.request(`/sucursales/${branchId}/`, {
            method: 'DELETE'
        });
        if (result.success) {
            const branches = JSON.parse(localStorage.getItem('sucursales') || '[]');
            const filtered = branches.filter(b => b.id !== branchId);
            localStorage.setItem('sucursales', JSON.stringify(filtered));
        }
        return result;
    },

    logout() {
        localStorage.clear();
        window.location.reload();
    }
};

window.api = api;