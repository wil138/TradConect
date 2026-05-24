// api.js - Cliente API para Django REST Framework
const API_BASE_URL = 'http://localhost:8000/api';

class TradConnectAPI {
    constructor() {
        this.token = localStorage.getItem('access_token');
        this.refreshToken = localStorage.getItem('refresh_token');
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async handleResponse(response) {
        if (response.status === 401) {
            const refreshed = await this.refreshToken();
            if (refreshed) {
                const newResponse = await fetch(response.url, {
                    method: response.method,
                    headers: this.getHeaders(),
                    body: response.body
                });
                return this.handleResponse(newResponse);
            } else {
                this.logout();
                throw new Error('Sesión expirada');
            }
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.detail || `HTTP ${response.status}`);
        }
        
        return response.json();
    }

    async refreshToken() {
        try {
            const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: this.refreshToken })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.token = data.access;
                localStorage.setItem('access_token', data.access);
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
        return false;
    }

    // ========================================
    // AUTENTICACIÓN
    // ========================================
    
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email, contrasena: password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.access) {
            this.token = data.access;
            this.refreshToken = data.refresh;
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.username);
            localStorage.setItem('userEmail', data.user.email);
            
            return { success: true, user: data.user };
        }
        
        return { success: false, error: data.error || 'Credenciales inválidas' };
    }
    
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.access) {
            this.token = data.access;
            this.refreshToken = data.refresh;
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.username);
            localStorage.setItem('userEmail', data.user.email);
            
            return { success: true, user: data.user };
        }
        
        return { success: false, error: data.error || 'Error en el registro' };
    }
    
    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/auth/me/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    logout() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('currentModule');
        localStorage.removeItem('marketplaceCart');
    }
    
    // ========================================
    // MARKETPLACE
    // ========================================
    
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.categoria && filters.categoria !== 'Todos') params.append('categoria', filters.categoria);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.page_size) params.append('page_size', filters.page_size);
        
        const response = await fetch(`${API_BASE_URL}/marketplace/products/?${params}`);
        return this.handleResponse(response);
    }
    
    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/marketplace/categories/`);
        return this.handleResponse(response);
    }
    
    // ========================================
    // PRODUCTOS (PROVEEDOR)
    // ========================================
    
    async getMyProducts() {
        const response = await fetch(`${API_BASE_URL}/productos/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    async createProduct(productData) {
        const response = await fetch(`${API_BASE_URL}/productos/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(productData)
        });
        return this.handleResponse(response);
    }
    
    async updateProduct(productId, productData) {
        const response = await fetch(`${API_BASE_URL}/productos/${productId}/`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(productData)
        });
        return this.handleResponse(response);
    }
    
    async deleteProduct(productId) {
        const response = await fetch(`${API_BASE_URL}/productos/${productId}/`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    // ========================================
    // PEDIDOS
    // ========================================
    
    async getMyOrders() {
        const response = await fetch(`${API_BASE_URL}/pedidos/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    async getOrderDetail(orderId) {
        const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/pedidos/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(orderData)
        });
        return this.handleResponse(response);
    }
    
    // ========================================
    // FACTURAS
    // ========================================
    
    async getMyInvoices() {
        const response = await fetch(`${API_BASE_URL}/facturas/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    // ========================================
    // DASHBOARD PROVEEDOR
    // ========================================
    
    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/provider-dashboard/stats/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    async getRecentOrders() {
        const response = await fetch(`${API_BASE_URL}/provider-dashboard/recent_orders/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    async getSalesChart() {
        const response = await fetch(`${API_BASE_URL}/provider-dashboard/sales_chart/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    // ========================================
    // CATÁLOGOS
    // ========================================
    
    async getUnidadesMedida() {
        const response = await fetch(`${API_BASE_URL}/unidades-medida/`);
        return this.handleResponse(response);
    }
}

// Instancia global
window.api = new TradConnectAPI();