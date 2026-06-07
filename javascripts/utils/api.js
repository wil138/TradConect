// javascripts/utils/api.js - VERSIÓN CORREGIDA
const API_BASE_URL = 'http://localhost:8000';
class TradConnectAPI {
    
    constructor() {
        this.token = localStorage.getItem('access_token');
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
            this.logout();
            throw new Error('Sesión expirada');
        }
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Error ${response.status}`);
        }
        return response.json();
    }

    // ========================================
    // AUTENTICACIÓN - CORREGIDO
    // ========================================
    
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                return { success: false, error: error.detail || 'Credenciales inválidas' };
            }
            
            const data = await response.json();
            
            this.token = data.access_token;
            localStorage.setItem('access_token', data.access_token);
            
            // CORREGIDO: data.user.rol (no data.user.role)
            const userRole = data.user?.rol?.toLowerCase() || 'client';
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userName', data.user?.nombre_usuario || data.user?.nombre || data.user?.username);
            localStorage.setItem('userEmail', data.user?.email || data.user?.correo_electronico);
            localStorage.setItem('userId', data.user?.id);
            
            if (data.user?.empresa_id) {
                localStorage.setItem('userEmpresa', JSON.stringify({
                    id: data.user.empresa_id,
                    razon_social: data.user.razon_social
                }));
            }
            
            return { 
                success: true, 
                user: {
                    id: data.user.id,
                    username: data.user.nombre_usuario || data.user.username,
                    email: data.user.email || data.user.correo_electronico,
                    role: userRole
                } 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async register(userData) {
        try {
            // CORREGIDO: Usar los nombres de campos que espera el backend
            let rol = 'Cliente';
            if (userData.rol === 'provider') rol = 'Proveedor';
            
            const payload = {
                nombre_usuario: userData.nombre_usuario,
                email: userData.correo,  // ← CORREGIDO: email (no correo en el payload)
                password: userData.contrasena,  // ← CORREGIDO: password (no contrasena)
                rol: rol,
                razon_social: userData.razon_social,
                ruc: userData.ruc || `TEMP${Date.now()}`,
                telefono: userData.telefono || '',
                correo_empresa: userData.correo,
                direccion_fiscal: userData.direccion_fiscal || ''
            };
            
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                // CORREGIDO: Mostrar error más específico
                const errorMsg = error.detail || 
                    (Array.isArray(error) ? error.map(e => e.msg).join(', ') : 'Error en registro');
                return { success: false, error: errorMsg };
            }
            
            // Auto-login después del registro
            return this.login(userData.correo, userData.contrasena);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        
        return {
            id: data.id,
            username: data.nombre_usuario,
            email: data.correo_electronico,
            role: localStorage.getItem('userRole'),
            empresa: {
                id: data.empresa_id,
                razon_social: data.razon_social,
                ruc: data.ruc,
                telefono: data.telefono,
                direccion_fiscal: data.direccion_fiscal
            }
        };
    }
    
    async updateProfile(profileData) {
        const response = await fetch(`${API_BASE_URL}/usuarios/me`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                nombre_usuario: profileData.username,
                email: profileData.email,
                telefono: profileData.telefono,
                direccion_fiscal: profileData.direccion_fiscal,
                razon_social: profileData.razon_social,
                ruc: profileData.ruc
            })
        });
        return this.handleResponse(response);
    }
    
    async changePassword(currentPassword, newPassword) {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ 
                password_actual: currentPassword,  // ← CORREGIDO según schema
                password_nueva: newPassword 
            })
        });
        return this.handleResponse(response);
    }
    
    logout() {
        this.token = null;
        localStorage.clear();
        window.location.reload();
    }
    
    // ========================================
    // SUCURSALES
    // ========================================
    
    async getMyBranches() {
        const response = await fetch(`${API_BASE_URL}/sucursales/`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        
        return (data || []).map(b => ({
            id: b.id,
            nombre: b.nombre_sucursal,
            direccion: b.direccion,
            telefono: b.telefono,
            horario_apertura: b.horario_apertura,
            horario_cierre: b.horario_cierre,
            es_principal: b.es_principal,
            latitud: b.latitud,
            longitud: b.longitud,
            estado: b.estado
        }));
    }
    
    async createBranch(branchData) {
        const response = await fetch(`${API_BASE_URL}/sucursales/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                nombre_sucursal: branchData.nombre,
                direccion: branchData.direccion,
                telefono: branchData.telefono,
                horario_apertura: branchData.horario_apertura,
                horario_cierre: branchData.horario_cierre,
                es_principal: branchData.es_principal || false,
                latitud: branchData.latitud || null,
                longitud: branchData.longitud || null
            })
        });
        return this.handleResponse(response);
    }
    
    async updateBranch(branchId, branchData) {
        const response = await fetch(`${API_BASE_URL}/sucursales/${branchId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                nombre_sucursal: branchData.nombre,
                direccion: branchData.direccion,
                telefono: branchData.telefono,
                horario_apertura: branchData.horario_apertura,
                horario_cierre: branchData.horario_cierre,
                es_principal: branchData.es_principal,
                estado: branchData.estado,
                latitud: branchData.latitud,
                longitud: branchData.longitud
            })
        });
        return this.handleResponse(response);
    }
    
    async deleteBranch(branchId) {
        const response = await fetch(`${API_BASE_URL}/sucursales/${branchId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    async getBranchStats() {
        const response = await fetch(`${API_BASE_URL}/sucursales/stats`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    // ========================================
    // PRODUCTOS (Marketplace - Público)
    // ========================================
    
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.categoria) params.append('categoria', filters.categoria);
        
        const response = await fetch(`${API_BASE_URL}/productos/?${params}`);
        const data = await this.handleResponse(response);
        
        // CORREGIDO: Manejar tanto array como objeto con results
        const productos = Array.isArray(data) ? data : (data.results || []);
        
        return {
            results: productos.map(p => ({
                id: p.id,
                nombreproducto: p.nombre_producto,
                precioventa: p.precio_venta,
                categoria_nombre: p.nombre_categoria,
                nombre_unidad: p.nombre_unidad,
                stock_disponible: p.stock_disponible || 0,
                nombre_proveedor: p.nombre_proveedor,
                imagenurl: p.imagen_url || null,
                descripcion: p.descripcion || ''
            })),
            total: productos.length
        };
    }
    
    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/productos/categorias`);
        const data = await this.handleResponse(response);
        
        return (data || []).map(c => ({
            id: c.id,
            name: c.nombre_categoria,
            icono: c.icono || 'fa-tag'
        }));
    }
    
    // ========================================
    // PRODUCTOS (Proveedor - Autenticado)
    // ========================================
    
    async getMyProducts() {
        const response = await fetch(`${API_BASE_URL}/productos/`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        
        const productos = Array.isArray(data) ? data : (data.results || []);
        
        return productos.map(p => ({
            id: p.id,
            nombreproducto: p.nombre_producto,
            precioventa: p.precio_venta,
            categoria_nombre: p.nombre_categoria,
            stock_disponible: p.stock_disponible || 0,
            descripcion: p.descripcion || '',
            cantidad_minima_pedido: p.cantidad_minima_pedido,
            es_perecedero: p.es_perecedero,
            dias_vida_util: p.dias_vida_util
        }));
    }
    
    async createProduct(productData) {
        const payload = {
            nombre_producto: productData.nombreproducto,
            descripcion: productData.descripcion || '',
            precio_venta: productData.precioventa,
            categoria_id: productData.categoriaid,
            unidad_medida_id: productData.unidadmedidaid || 1,
            cantidad_minima_pedido: productData.cantidadminimapedido || 1,
            es_perecedero: productData.esperecedero || false,
            dias_vida_util: productData.diasvidautil || null
        };
        
        const response = await fetch(`${API_BASE_URL}/productos/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        });
        return this.handleResponse(response);
    }
    
    async updateProduct(productId, productData) {
        const payload = {
            nombre_producto: productData.nombreproducto,
            precio_venta: productData.precioventa,
            categoria_id: productData.categoriaid,
            unidad_medida_id: productData.unidadmedidaid
        };
        
        const response = await fetch(`${API_BASE_URL}/productos/${productId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        });
        return this.handleResponse(response);
    }
    
    async deleteProduct(productId) {
        const response = await fetch(`${API_BASE_URL}/productos/${productId}`, {
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
        const data = await this.handleResponse(response);
        
        const pedidos = Array.isArray(data) ? data : (data.results || []);
        
        return pedidos.map(order => ({
            id: order.id,
            fechapedido: order.fecha_pedido,
            totalneto: order.total_neto,
            estado_nombre: order.estado_nombre || order.estado,
            restaurante_nombre: order.restaurante_nombre || order.restaurante,
            proveedor_nombre: order.proveedor_nombre || order.proveedor
        }));
    }
    
    async getOrderDetail(orderId) {
        const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}`, {
            headers: this.getHeaders()
        });
        const data = await this.handleResponse(response);
        
        return {
            id: data.id || data.pedido?.id,
            fechapedido: data.fecha_pedido || data.pedido?.fecha_pedido,
            totalneto: data.total_neto || data.pedido?.total_neto,
            estado_nombre: data.estado_nombre || data.pedido?.estado_nombre,
            restaurante_nombre: data.restaurante_nombre || data.pedido?.restaurante,
            proveedor_nombre: data.proveedor_nombre || data.pedido?.proveedor,
            detalles: (data.detalles || data.pedido?.detalles || []).map(d => ({
                producto_nombre: d.producto_nombre || d.nombre_producto,
                cantidad: d.cantidad,
                preciounitario: d.precio_unitario || d.preciounitario,
                subtotal: d.subtotal
            }))
        };
    }
    
    async createOrder(orderData) {
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('No hay productos en el pedido');
        }
        
        // Obtener datos del usuario logueado
        const empresaData = JSON.parse(localStorage.getItem('userEmpresa') || '{}');
        
        const payload = {
            proveedor_id: orderData.proveedor_id || 1,
            sucursal_origen_id: orderData.sucursal_origen_id || 1,
            sucursal_entrega_id: orderData.sucursal_entrega_id || (empresaData.id || 1),
            metodo_pago_id: orderData.metodo_pago_id || 1,
            comentario: orderData.comentario || 'Pedido desde marketplace',
            productos: orderData.items.map(item => ({
                producto_id: item.producto_id,
                cantidad: item.cantidad
            }))
        };
        
        const response = await fetch(`${API_BASE_URL}/pedidos/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        });
        return this.handleResponse(response);
    }
    
    async updateOrderStatus(orderId, estadoId, comentario = null) {
        const payload = {
            estado_id: estadoId,
            comentario: comentario
        };
        
        const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}/estado`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
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
        const data = await this.handleResponse(response);
        
        const facturas = Array.isArray(data) ? data : (data.results || []);
        
        return facturas.map(f => ({
            id: f.id,
            numerofactura: f.numero_factura,
            fechaemision: f.fecha_emision,
            totalfacturado: f.total_facturado,
            pedidoid: f.pedido_id
        }));
    }
    
    async getInvoiceDetail(invoiceId) {
        const response = await fetch(`${API_BASE_URL}/facturas/${invoiceId}`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    
    // ========================================
    // DASHBOARD
    // ========================================
    
    async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
}

window.api = new TradConnectAPI();