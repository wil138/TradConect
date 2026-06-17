// utils/cart.js - VERSIÓN COMPLETA V3.1 (con mejora de sucursal origen)
window.CartModule = {
    cart: [],
    selectedBranch: null,
    selectedPaymentMethod: null,
    pendingCheckout: false,

    init: function() {
        console.log("🛒 CartModule init");
        this.loadCart();
        this.loadSelectedBranch();
        this.loadSelectedPaymentMethod();
        this.updateCartUI();
        this.setupGlobalListeners();
    },

    loadCart: function() {
        const saved = localStorage.getItem('marketplaceCart');
        this.cart = saved ? JSON.parse(saved) : [];
        console.log(`📦 Carrito: ${this.cart.length} items`);
    },

    saveCart: function() {
        localStorage.setItem('marketplaceCart', JSON.stringify(this.cart));
        this.updateCartUI();
    },

    loadSelectedBranch: function() {
        const saved = localStorage.getItem('selectedBranch');
        if (saved) {
            try { this.selectedBranch = JSON.parse(saved); } catch(e) { this.selectedBranch = null; }
        }
        console.log("📍 Sucursal de entrega:", this.selectedBranch);
    },

    saveSelectedBranch: function() {
        if (this.selectedBranch) {
            localStorage.setItem('selectedBranch', JSON.stringify(this.selectedBranch));
        } else {
            localStorage.removeItem('selectedBranch');
        }
    },

    loadSelectedPaymentMethod: function() {
        const saved = localStorage.getItem('selectedPaymentMethod');
        if (saved) {
            try { this.selectedPaymentMethod = JSON.parse(saved); } catch(e) { this.selectedPaymentMethod = null; }
        }
        if (!this.selectedPaymentMethod) {
            const catalogos = JSON.parse(localStorage.getItem('catalogos') || '{}');
            if (catalogos.metodos_pago && catalogos.metodos_pago.length > 0) {
                this.selectedPaymentMethod = catalogos.metodos_pago[0];
                this.saveSelectedPaymentMethod();
            }
        }
        console.log("💳 Método de pago:", this.selectedPaymentMethod);
    },

    saveSelectedPaymentMethod: function() {
        if (this.selectedPaymentMethod) {
            localStorage.setItem('selectedPaymentMethod', JSON.stringify(this.selectedPaymentMethod));
        } else {
            localStorage.removeItem('selectedPaymentMethod');
        }
    },

    setupGlobalListeners: function() {
        const overlay = document.querySelector('.overlay');
        if (overlay) overlay.addEventListener('click', () => this.closeCart());
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeCart(); });
        
        window.addEventListener('storage', (e) => {
            if (e.key === 'marketplaceCart') {
                this.loadCart();
                this.updateCartUI();
            }
        });
    },

    closeCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        this.pendingCheckout = false;
    },

    openCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        this.updateCartUI();
    },

    toggleCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar.classList.contains('open')) this.closeCart();
        else this.openCart();
    },

    updateCartUI: function() {
        const count = this.cart.reduce((s, i) => s + (i.quantity || 1), 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) cartCount.innerText = count;

        const container = document.getElementById('cartItems');
        if (!container) return;

        const subtotal = this.cart.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
        const ahorro = this.cart.reduce((s, i) => {
            if (i.originalPrice) return s + ((i.originalPrice - i.price) * (i.quantity || 1));
            return s;
        }, 0);

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart" style="font-size:3rem; color:#cbd5e1;"></i>
                    <p style="color:#64748b;">Tu carrito está vacío</p>
                    <button onclick="window.CartModule.closeCart()" class="btn-close-cart" style="background:#2563eb; color:white; border:none; padding:8px 24px; border-radius:6px; cursor:pointer; margin-top:10px;">
                        Explorar productos
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item" style="padding:12px; border-bottom:1px solid #f1f5f9;">
                    <div style="display: flex; gap: 12px;">
                        <img src="${item.img || 'https://placehold.co/60x60?text=Producto'}" 
                             alt="${this.escapeHtml(item.name)}" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; background:#f1f5f9;"
                             onerror="this.src='https://placehold.co/60x60?text=Producto'">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size:0.95rem;">${this.escapeHtml(item.name)}</div>
                            <div style="font-size: 0.7rem; color: #64748b;">${this.escapeHtml(item.proveedorNombre || 'Proveedor')}</div>
                            <div style="margin: 5px 0;">
                                ${item.originalPrice ? `
                                    <span style="text-decoration: line-through; font-size: 0.75rem; color:#94a3b8;">$${item.originalPrice.toFixed(2)}</span>
                                    <span style="color: #ef4444; font-weight:700;"> $${item.price.toFixed(2)}</span>
                                ` : `<span style="font-weight:700;">$${item.price.toFixed(2)}</span>`}
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1" 
                                            style="background:#f1f5f9; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-weight:700;">
                                        −
                                    </button>
                                    <span style="margin:0 8px; min-width:20px; text-align:center;">${item.quantity}</span>
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="1" 
                                            style="background:#f1f5f9; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-weight:700;">
                                        +
                                    </button>
                                </div>
                                <div><strong>$${(item.price * item.quantity).toFixed(2)}</strong></div>
                                <button class="cart-remove-btn" data-id="${item.id}" 
                                        style="background:none; border:none; color:#94a3b8; cursor:pointer; padding:4px 8px;">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.cart-qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    const delta = parseInt(btn.dataset.delta);
                    this.updateCartQuantity(id, delta);
                });
            });
            
            document.querySelectorAll('.cart-remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFromCart(parseInt(btn.dataset.id));
                });
            });
        }
        this.updateCartSummary(subtotal, ahorro);
    },

    updateCartSummary: function(subtotal, ahorro) {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;

        let summaryDiv = document.getElementById('cartSummaryDetails');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.id = 'cartSummaryDetails';
            summaryDiv.style.padding = '12px 16px';
            const totalRow = cartFooter.querySelector('.total-row');
            if (totalRow) cartFooter.insertBefore(summaryDiv, totalRow);
            else cartFooter.prepend(summaryDiv);
        }
        const total = subtotal - ahorro;
        summaryDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size:0.9rem;"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
            ${ahorro > 0 ? `<div style="display: flex; justify-content: space-between; font-size:0.9rem; color: #10b981;"><span>Descuentos:</span><span>-$${ahorro.toFixed(2)}</span></div>` : ''}
            <div style="border-top: 1px dashed #cbd5e1; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size:1.1rem;">
                <span>Total:</span>
                <span style="color:#2563eb;">$${total.toFixed(2)}</span>
            </div>
        `;
        const cartTotalSpan = document.getElementById('cartTotal');
        if (cartTotalSpan) cartTotalSpan.innerText = `$${total.toFixed(2)}`;

        let branchDiv = document.getElementById('selectedBranchInfo');
        if (!branchDiv) {
            branchDiv = document.createElement('div');
            branchDiv.id = 'selectedBranchInfo';
            branchDiv.style.padding = '8px 16px';
            const btnCheckout = cartFooter.querySelector('.btn-checkout');
            if (btnCheckout) cartFooter.insertBefore(branchDiv, btnCheckout);
            else cartFooter.appendChild(branchDiv);
        }
        if (this.selectedBranch) {
            branchDiv.innerHTML = `
                <div style="margin-top: 8px; padding: 10px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #2563eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <i class="fas fa-location-dot" style="color:#2563eb;"></i>
                            <strong>Entrega:</strong> ${this.escapeHtml(this.selectedBranch.nombresucursal)}
                            <br><small style="color:#64748b;">${this.escapeHtml(this.selectedBranch.direccionexacta || '')}</small>
                        </div>
                        <button onclick="window.CartModule.selectBranch()" 
                                style="background:#2563eb; color:white; border:none; padding:4px 12px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                            Cambiar
                        </button>
                    </div>
                </div>
            `;
        } else {
            branchDiv.innerHTML = `
                <div style="margin-top: 8px; padding: 10px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <i class="fas fa-map-marker-alt" style="color:#f59e0b;"></i>
                            <strong>Sin sucursal de entrega</strong>
                        </div>
                        <button onclick="window.CartModule.selectBranch()" 
                                style="background:#2563eb; color:white; border:none; padding:4px 14px; border-radius:4px; cursor:pointer; font-size:0.8rem;">
                            Seleccionar
                        </button>
                    </div>
                </div>
            `;
        }

        const catalogos = JSON.parse(localStorage.getItem('catalogos') || '{}');
        const metodosPago = catalogos.metodos_pago || [];
        let paymentDiv = document.getElementById('paymentMethodSelector');
        if (!paymentDiv) {
            paymentDiv = document.createElement('div');
            paymentDiv.id = 'paymentMethodSelector';
            paymentDiv.style.padding = '8px 16px';
            const btnCheckout = cartFooter.querySelector('.btn-checkout');
            if (btnCheckout) cartFooter.insertBefore(paymentDiv, btnCheckout);
            else cartFooter.appendChild(paymentDiv);
        }
        if (metodosPago.length > 0) {
            const currentId = this.selectedPaymentMethod ? this.selectedPaymentMethod.id : metodosPago[0].id;
            paymentDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding:8px; background:#f8fafc; border-radius:6px; margin-top:8px;">
                    <div><i class="fas fa-credit-card" style="color:#64748b;"></i> <strong style="font-size:0.9rem;">Pago:</strong></div>
                    <select id="paymentMethodSelect" style="padding:4px 12px; border-radius:4px; border:1px solid #cbd5e1; background:white; font-size:0.85rem;">
                        ${metodosPago.map(m => `
                            <option value="${m.id}" ${m.id === currentId ? 'selected' : ''}>
                                ${this.escapeHtml(m.nombremetodo || m.nombre || 'Método')}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
            const select = document.getElementById('paymentMethodSelect');
            if (select) {
                select.addEventListener('change', (e) => {
                    const id = parseInt(e.target.value);
                    const selected = metodosPago.find(m => m.id === id);
                    if (selected) {
                        this.selectedPaymentMethod = selected;
                        this.saveSelectedPaymentMethod();
                    }
                });
            }
        } else {
            paymentDiv.innerHTML = `
                <div style="padding:8px; background:#fee2e2; border-radius:6px; margin-top:8px; color:#dc2626; font-size:0.9rem;">
                    <i class="fas fa-exclamation-triangle"></i> No hay métodos de pago disponibles
                </div>
            `;
        }
    },

    updateCartQuantity: function(id, delta) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(1, (item.quantity || 1) + delta);
            this.saveCart();
            this.showToast("Carrito actualizado");
        }
    },

    removeFromCart: function(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.showToast("Producto eliminado", "info");
    },

    addToCart: function(product, quantity = 1) {
        if (!product || !product.id) {
            this.showToast("Producto inválido", "error");
            return;
        }

        // Normalizar datos del producto, priorizando sucursalOrigenId del producto
        const normalizedProduct = {
            id: product.id,
            name: product.name || product.nombreproducto || 'Producto',
            price: parseFloat(product.price || product.precio_final || product.precio || 0),
            originalPrice: product.originalPrice || product.precio_original || null,
            proveedorId: product.proveedorId || product.proveedor_id || product.empresaid || null,
            proveedorNombre: product.proveedorNombre || product.empresa_razonsocial || product.proveedor || 'Proveedor',
            sucursalOrigenId: product.sucursalOrigenId || product.sucursal_origen_id || null,
            img: product.img || product.imagenurl || product.imagen || 'https://placehold.co/60x60?text=Producto',
            quantity: parseInt(quantity) || 1,
            inventario: product.inventario || []
        };

        // Si no tiene sucursal origen, intentar obtener del inventario del producto
        if (!normalizedProduct.sucursalOrigenId && normalizedProduct.inventario && normalizedProduct.inventario.length > 0) {
            normalizedProduct.sucursalOrigenId = normalizedProduct.inventario[0].sucursal_id;
        }

        const existing = this.cart.find(i => i.id === normalizedProduct.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + normalizedProduct.quantity;
        } else {
            this.cart.push(normalizedProduct);
        }
        this.saveCart();
        this.showToast(`${normalizedProduct.name} añadido al carrito`);
    },

    clearCart: function() {
        if (this.cart.length === 0) return;
        if (confirm('¿Seguro que quieres vaciar el carrito?')) {
            this.cart = [];
            this.saveCart();
            this.showToast("Carrito vaciado", "info");
        }
    },

    selectBranch: function() {
        const branches = JSON.parse(localStorage.getItem('sucursales') || '[]');
        if (branches.length === 0) {
            this.showToast("No tienes sucursales. Ve a Mi Perfil > Sucursales.", "error");
            return;
        }
        this.showBranchSelectorModal(branches);
    },

    showBranchSelectorModal: function(branches) {
        const existing = document.getElementById('branchSelectorModal');
        if (existing) existing.remove();

        const activeBranches = branches.filter(b => b.estado === 'Activo' || b.estado === true);
        if (activeBranches.length === 0) {
            this.showToast("No hay sucursales activas", "error");
            return;
        }

        const modalHTML = `
            <div id="branchSelectorModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:9999; display:flex; justify-content:center; align-items:center;">
                <div style="background:white; border-radius:16px; max-width:500px; width:90%; max-height:80vh; overflow-y:auto; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;"><i class="fas fa-location-dot" style="color:#2563eb;"></i> Selecciona sucursal de entrega</h3>
                        <button onclick="document.getElementById('branchSelectorModal').remove()" 
                                style="background:none; border:none; font-size:28px; cursor:pointer; color:#94a3b8; padding:0 8px;">
                            &times;
                        </button>
                    </div>
                    <div style="margin-bottom:16px; font-size:0.9rem; color:#64748b;">
                        Selecciona la sucursal donde quieres recibir tu pedido.
                    </div>
                    ${activeBranches.map(branch => `
                        <div class="branch-option" data-id="${branch.id}" 
                             style="padding:14px 16px; border:2px solid ${this.selectedBranch?.id === branch.id ? '#2563eb' : '#e2e8f0'}; 
                                    border-radius:10px; margin-bottom:8px; cursor:pointer; 
                                    transition:all 0.2s; background:${this.selectedBranch?.id === branch.id ? '#f0f7ff' : 'white'};
                                    display:flex; align-items:center; gap:12px;">
                            <i class="fas fa-store" style="color:${this.selectedBranch?.id === branch.id ? '#2563eb' : '#94a3b8'}; font-size:1.2rem;"></i>
                            <div>
                                <div style="font-weight:600;">${this.escapeHtml(branch.nombresucursal)}</div>
                                <div style="font-size:0.85rem; color:#64748b;">${this.escapeHtml(branch.direccionexacta || branch.direccion || 'Sin dirección')}</div>
                                ${branch.telefono ? `<div style="font-size:0.8rem; color:#94a3b8;"><i class="fas fa-phone"></i> ${this.escapeHtml(branch.telefono)}</div>` : ''}
                            </div>
                            ${this.selectedBranch?.id === branch.id ? '<i class="fas fa-check-circle" style="color:#10b981; margin-left:auto;"></i>' : ''}
                        </div>
                    `).join('')}
                    <div style="display:flex; gap:10px; margin-top:16px; justify-content:flex-end;">
                        <button onclick="document.getElementById('branchSelectorModal').remove()" 
                                style="padding:10px 24px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.querySelectorAll('#branchSelectorModal .branch-option').forEach(option => {
            option.addEventListener('click', () => {
                const branchId = parseInt(option.dataset.id);
                const selected = branches.find(b => b.id === branchId);
                if (selected) {
                    this.selectedBranch = selected;
                    this.saveSelectedBranch();
                    this.updateCartUI();
                    document.getElementById('branchSelectorModal').remove();
                    this.showToast(`✅ Sucursal: ${selected.nombresucursal}`, 'success');
                    if (this.pendingCheckout) {
                        this.pendingCheckout = false;
                        this.proceedCheckout();
                    }
                }
            });
            option.addEventListener('mouseenter', () => {
                if (!option.style.borderColor || option.style.borderColor === '#e2e8f0') {
                    option.style.borderColor = '#94a3b8';
                }
            });
            option.addEventListener('mouseleave', () => {
                if (option.dataset.id !== this.selectedBranch?.id) {
                    option.style.borderColor = '#e2e8f0';
                }
            });
        });
    },

    checkout: function() {
        if (this.cart.length === 0) {
            this.showToast("Carrito vacío", "error");
            return false;
        }
        if (!this.selectedBranch) {
            this.pendingCheckout = true;
            this.showToast("Selecciona sucursal de entrega", "info");
            this.selectBranch();
            return false;
        }
        if (!this.selectedPaymentMethod) {
            this.showToast("Selecciona método de pago", "error");
            return false;
        }
        return this.proceedCheckout();
    },

    proceedCheckout: async function() {
        console.log("🚀 Procesando pedidos...");

        const groups = {};
        for (const item of this.cart) {
            const key = item.proveedorId || 'unknown';
            if (!groups[key]) {
                groups[key] = {
                    proveedorId: key,
                    proveedorNombre: item.proveedorNombre || 'Proveedor',
                    items: []
                };
            }
            groups[key].items.push(item);
        }
        const proveedorGroups = Object.values(groups);
        console.log("📦 Grupos por proveedor:", proveedorGroups);

        if (!await this.showCheckoutConfirmationModal(proveedorGroups)) {
            return false;
        }

        let allSuccess = true;
        let ordersCreated = [];
        let ordersFailed = [];

        for (const group of proveedorGroups) {
            try {
                console.log(`📝 Creando pedido para proveedor: ${group.proveedorNombre}`);
                const result = await this._createOrderForProveedor(group);
                if (result.success) {
                    ordersCreated.push({ id: result.orderId, proveedor: group.proveedorNombre });
                    this.showToast(`✅ Pedido #${result.orderId} - ${group.proveedorNombre}`, 'success');
                } else {
                    allSuccess = false;
                    ordersFailed.push({ proveedor: group.proveedorNombre, error: result.error });
                    this.showToast(`❌ Error con ${group.proveedorNombre}: ${result.error}`, 'error');
                }
            } catch (error) {
                allSuccess = false;
                ordersFailed.push({ proveedor: group.proveedorNombre, error: error.message });
                this.showToast(`❌ Error con ${group.proveedorNombre}: ${error.message}`, 'error');
            }
        }

        if (ordersCreated.length > 0) {
            this.cart = [];
            this.saveCart();
            this.closeCart();
            await api.refreshMyData();
            
            if (window.orders && window.orders.loadOrders) {
                window.orders.loadOrders();
                window.orders.renderOrders();
            }
            
            if (allSuccess) {
                this.showToast(`🎉 ${ordersCreated.length} pedido(s) creados exitosamente`, 'success');
            } else {
                this.showToast(`⚠️ ${ordersCreated.length} pedido(s) creados, ${ordersFailed.length} fallaron`, 'info');
            }
            return true;
        }
        
        this.showToast(`❌ No se pudieron crear pedidos`, 'error');
        return false;
    },

    showCheckoutConfirmationModal: function(proveedorGroups) {
        return new Promise((resolve) => {
            const existing = document.getElementById('checkoutConfirmationModal');
            if (existing) existing.remove();

            const subtotal = this.cart.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
            const ahorro = this.cart.reduce((s, i) => {
                if (i.originalPrice) return s + ((i.originalPrice - i.price) * (i.quantity || 1));
                return s;
            }, 0);
            const total = subtotal - ahorro;

            const modalHTML = `
                <div id="checkoutConfirmationModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:9999; display:flex; justify-content:center; align-items:center;">
                    <div style="background:white; border-radius:16px; max-width:600px; width:90%; max-height:85vh; overflow-y:auto; padding:30px; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h3 style="margin:0;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Confirmar Pedido</h3>
                            <button onclick="document.getElementById('checkoutConfirmationModal').remove()" 
                                    style="background:none; border:none; font-size:28px; cursor:pointer; color:#94a3b8;">&times;</button>
                        </div>
                        
                        <div style="background:#f8fafc; padding:16px; border-radius:10px; margin-bottom:16px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span><strong>Subtotal:</strong></span>
                                <span>$${subtotal.toFixed(2)}</span>
                            </div>
                            ${ahorro > 0 ? `
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#10b981;">
                                    <span><strong>Descuentos:</strong></span>
                                    <span>-$${ahorro.toFixed(2)}</span>
                                </div>
                            ` : ''}
                            <div style="border-top:1px solid #e2e8f0; padding-top:10px; display:flex; justify-content:space-between;">
                                <span style="font-weight:800; font-size:1.1em;">Total:</span>
                                <span style="font-weight:800; font-size:1.1em; color:#2563eb;">$${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <h4 style="margin-top:0; margin-bottom:10px; font-size:0.95rem;">📦 Resumen de Pedidos:</h4>
                            ${proveedorGroups.map(group => {
                                const groupTotal = group.items.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
                                return `
                                    <div style="padding:10px 14px; background:#f1f5f9; border-left:4px solid #2563eb; margin-bottom:8px; border-radius:4px;">
                                        <div><strong>${this.escapeHtml(group.proveedorNombre)}</strong></div>
                                        <div style="font-size:0.85rem; color:#64748b;">${group.items.length} producto(s) - $${groupTotal.toFixed(2)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <div style="background:#fef3c7; padding:12px 16px; border-radius:8px; margin-bottom:20px; border-left:4px solid #f59e0b;">
                            <i class="fas fa-info-circle" style="color:#d97706;"></i>
                            <strong style="color:#d97706; font-size:0.9rem;">Nota:</strong>
                            <span style="font-size:0.9rem; color:#92400e;">Se creará un pedido por cada proveedor.</span>
                        </div>

                        <div style="display:flex; gap:12px; justify-content:flex-end;">
                            <button id="btnCancelCheckout" 
                                    style="padding:12px 28px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; font-weight:600; color:#475569;">
                                Cancelar
                            </button>
                            <button id="btnConfirmCheckout" 
                                    style="padding:12px 32px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:700; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                                <i class="fas fa-check"></i> Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            document.getElementById('btnCancelCheckout').addEventListener('click', () => {
                document.getElementById('checkoutConfirmationModal').remove();
                resolve(false);
            });

            document.getElementById('btnConfirmCheckout').addEventListener('click', () => {
                document.getElementById('checkoutConfirmationModal').remove();
                resolve(true);
            });
        });
    },

    _createOrderForProveedor: async function(group) {
        const sucursalOrigenId = group.items[0]?.sucursalOrigenId;

        if (!group.proveedorId) {
            return { success: false, error: 'Falta ID de proveedor' };
        }
        if (!this.selectedBranch || !this.selectedBranch.id) {
            return { success: false, error: 'Falta sucursal de entrega' };
        }
        if (!this.selectedPaymentMethod || !this.selectedPaymentMethod.id) {
            return { success: false, error: 'Falta método de pago' };
        }
        if (group.items.length === 0) {
            return { success: false, error: 'Sin productos en el pedido' };
        }

        console.log(`🏢 Proveedor ID: ${group.proveedorId}`);
        console.log(`📍 Sucursal Origen: ${sucursalOrigenId}`);
        console.log(`📍 Sucursal Entrega: ${this.selectedBranch.id}`);
        console.log(`💳 Método Pago: ${this.selectedPaymentMethod.id}`);

        const itemsData = group.items.map(item => ({
            producto_id: parseInt(item.id),
            cantidad: parseInt(item.quantity || 1),
            precio_unitario: parseFloat(item.price || 0),
            descuento: item.originalPrice ? parseFloat((item.originalPrice - item.price)) : 0
        }));

        const payload = {
            proveedor_id: parseInt(group.proveedorId),
            sucursal_origen_id: parseInt(sucursalOrigenId) || 1,
            sucursal_entrega_id: parseInt(this.selectedBranch.id),
            metodo_pago_id: parseInt(this.selectedPaymentMethod.id) || 1,
            moneda_id: 1,
            comentario: `Pedido - ${new Date().toLocaleString()} - ${group.proveedorNombre}`,
            items: itemsData
        };

        console.log("📤 Enviando payload:", JSON.stringify(payload, null, 2));

        const result = await api.createOrder(payload);
        console.log("📥 Respuesta:", result);

        if (result.success) {
            return { success: true, orderId: result.data.id };
        } else {
            let errorMsg = result.error || 'Error al crear pedido';
            if (result.data && result.data.detail) {
                errorMsg = result.data.detail;
            } else if (result.data && typeof result.data === 'object') {
                const errors = [];
                for (const [key, value] of Object.entries(result.data)) {
                    if (Array.isArray(value)) {
                        errors.push(`${key}: ${value.join(', ')}`);
                    } else {
                        errors.push(`${key}: ${value}`);
                    }
                }
                if (errors.length > 0) errorMsg = errors.join('; ');
            }
            return { success: false, error: errorMsg };
        }
    },

    showToast: function(msg, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                info: '#3b82f6',
                warning: '#f59e0b'
            };
            toast.style.background = colors[type] || '#10b981';
            clearTimeout(this._toastTimeout);
            this._toastTimeout = setTimeout(() => {
                toast.style.display = 'none';
            }, 4000);
        } else {
            console.log(`[${type}] ${msg}`);
        }
    },

    escapeHtml: function(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Exponer funciones globales
window.toggleCart = () => window.CartModule.toggleCart();
window.checkout = () => window.CartModule.checkout();
window.addToCart = (product, quantity) => window.CartModule.addToCart(product, quantity);
window.removeFromCart = (id) => window.CartModule.removeFromCart(id);
window.clearCart = () => window.CartModule.clearCart();
window.selectBranch = () => window.CartModule.selectBranch();

// Inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.CartModule && window.CartModule.init) {
            window.CartModule.init();
        }
    });
} else {
    if (window.CartModule && window.CartModule.init) {
        window.CartModule.init();
    }
}
console.log('✅ CartModule loaded (mejorado)');

