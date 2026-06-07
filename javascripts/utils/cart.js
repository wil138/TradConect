// utils/cart.js - CON SELECCIÓN DE SUCURSAL Y CIERRE AL HACER CLIC FUERA
window.CartModule = {
    cart: [],
    selectedBranch: null,
    pendingCheckout: false,
    
    init: function() {
        this.loadCart();
        this.loadSelectedBranch();
        this.updateCartUI();
        this.setupGlobalListeners();
    },
    
    setupGlobalListeners: function() {
        // Cerrar carrito al hacer clic en el overlay
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeCart();
            });
        }
        
        // Escuchar tecla ESC para cerrar carrito
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    },
    
    loadCart: function() {
        const saved = localStorage.getItem('marketplaceCart');
        this.cart = saved ? JSON.parse(saved) : [];
    },
    
    saveCart: function() {
        localStorage.setItem('marketplaceCart', JSON.stringify(this.cart));
        this.updateCartUI();
    },
    
    loadSelectedBranch: function() {
        const saved = localStorage.getItem('selectedBranch');
        if (saved) {
            try {
                this.selectedBranch = JSON.parse(saved);
            } catch(e) {
                this.selectedBranch = null;
            }
        }
    },
    
    saveSelectedBranch: function() {
        if (this.selectedBranch) {
            localStorage.setItem('selectedBranch', JSON.stringify(this.selectedBranch));
        } else {
            localStorage.removeItem('selectedBranch');
        }
    },
    
    closeCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        this.pendingCheckout = false; // Resetear checkout pendiente
    },
    
    updateCartUI: function() {
        const count = this.cart.reduce((s, i) => s + (i.quantity || 1), 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) cartCount.innerText = count;
        
        const container = document.getElementById('cartItems');
        if (!container) return;
        
        const subtotal = this.cart.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
        const ahorro = this.cart.reduce((s, i) => {
            if (i.originalPrice) {
                return s + ((i.originalPrice - i.price) * (i.quantity || 1));
            }
            return s;
        }, 0);
        
        if (this.cart.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p><button onclick="window.CartModule.toggleCart()" style="margin-top: 15px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">Cerrar</button></div>';
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div style="display: flex; gap: 12px;">
                        <img src="${item.img || ''}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/60'">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 4px;">${this.escapeHtml(item.name)}</div>
                            <div style="font-size: 0.7rem; color: #64748b; margin-bottom: 6px;">${item.vendor || 'Proveedor Local'}</div>
                            <div style="margin-bottom: 8px;">
                                ${item.originalPrice ? `
                                    <span style="text-decoration: line-through; font-size: 0.7rem; color: #94a3b8;">$${item.originalPrice.toFixed(2)}</span>
                                    <span style="color: #ef4444; font-weight: 700;"> $${item.price.toFixed(2)}</span>
                                ` : `
                                    <span style="font-weight: 700;">$${item.price.toFixed(2)}</span>
                                `}
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;">-</button>
                                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                                    <button class="cart-qty-btn" data-id="${item.id}" data-delta="1" style="width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer;">+</button>
                                </div>
                                <div style="font-weight: 700;">$${(item.price * item.quantity).toFixed(2)}</div>
                                <button class="cart-remove-btn" data-id="${item.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem;">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Eventos del carrito
            document.querySelectorAll('.cart-qty-btn').forEach(btn => {
                btn.removeEventListener('click', this.handleQuantityClick);
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    const delta = parseInt(btn.dataset.delta);
                    this.updateCartQuantity(id, delta);
                });
            });
            
            document.querySelectorAll('.cart-remove-btn').forEach(btn => {
                btn.removeEventListener('click', this.handleRemoveClick);
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFromCart(parseInt(btn.dataset.id));
                });
            });
        }
        
        // Actualizar resumen
        this.updateCartSummary(subtotal, ahorro);
    },
    
    updateCartSummary: function(subtotal, ahorro) {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;
        
        let summaryDiv = document.getElementById('cartSummaryDetails');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.id = 'cartSummaryDetails';
            const totalRow = cartFooter.querySelector('.total-row');
            if (totalRow) {
                cartFooter.insertBefore(summaryDiv, totalRow);
            }
        }
        
        const envio = 0;
        const total = subtotal - ahorro + envio;
        
        summaryDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
                <span style="color: #64748b;">Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${ahorro > 0 ? `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px; color: #10b981;">
                    <span><i class="fas fa-tags"></i> Descuentos:</span>
                    <span>-$${ahorro.toFixed(2)}</span>
                </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
                <span style="color: #64748b;">Envío:</span>
                <span style="color: #10b981;">Gratis</span>
            </div>
            <div style="border-top: 1px dashed #cbd5e1; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem;">
                <span>Total a pagar:</span>
                <span style="color: #2563eb;">$${total.toFixed(2)}</span>
            </div>
        `;
        
        const cartTotalElement = document.getElementById('cartTotal');
        if (cartTotalElement) {
            cartTotalElement.innerHTML = `$${total.toFixed(2)}`;
        }
        
        // Mostrar sucursal seleccionada
        let branchInfoDiv = document.getElementById('selectedBranchInfo');
        if (!branchInfoDiv) {
            branchInfoDiv = document.createElement('div');
            branchInfoDiv.id = 'selectedBranchInfo';
            const btnCheckout = cartFooter.querySelector('.btn-checkout');
            if (btnCheckout) {
                cartFooter.insertBefore(branchInfoDiv, btnCheckout);
            } else {
                cartFooter.appendChild(branchInfoDiv);
            }
        }
        
        if (this.selectedBranch) {
            branchInfoDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <i class="fas fa-location-dot" style="color: #2563eb;"></i>
                        <strong>Entrega en:</strong> ${this.escapeHtml(this.selectedBranch.nombreSucursal)}
                        <br>
                        <small style="color: #64748b;">${this.escapeHtml(this.selectedBranch.direccionExacta)}</small>
                    </div>
                    <button onclick="window.CartModule.selectBranch()" style="background: none; border: none; color: #2563eb; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-edit"></i> Cambiar
                    </button>
                </div>
            `;
        } else {
            branchInfoDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <i class="fas fa-map-marker-alt" style="color: #f59e0b;"></i>
                        <strong>No has seleccionado sucursal de entrega</strong>
                    </div>
                    <button onclick="window.CartModule.selectBranch()" class="btn-select-branch">
                        <i class="fas fa-plus"></i> Seleccionar
                    </button>
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
        this.showToast("Producto eliminado del carrito", "info");
    },
    
    addToCart: function(product, quantity = 1) {
        if (!product || !product.id) return;
        
        const existing = this.cart.find(i => i.id === product.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + quantity;
        } else {
            this.cart.push({ 
                id: product.id, 
                name: product.name || product.nombreproducto,
                price: product.price || product.precioventa,
                originalPrice: product.originalPrice,
                vendor: product.vendor,
                img: product.img,
                quantity: quantity || 1
            });
        }
        this.saveCart();
        this.showToast(`${product.name || product.nombreproducto} añadido al carrito`);
        
        // Abrir carrito automáticamente al añadir (opcional)
        // this.openCart();
    },
    
    openCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
    },
    
    selectBranch: function() {
        const branches = window.userBranches || [];
        
        if (branches.length === 0) {
            this.showToast("No tienes sucursales registradas. Ve a Mi Perfil > Sucursales para agregar una.", "error");
            // Cerrar carrito y redirigir al perfil
            this.closeCart();
            if (window.router && window.router.cargarModulo) {
                window.router.cargarModulo('profile');
                setTimeout(() => {
                    const branchTab = document.querySelector('[data-tab="branches"]');
                    if (branchTab) branchTab.click();
                }, 200);
            }
            return;
        }
        
        this.showBranchSelectorModal(branches);
    },
    
    showBranchSelectorModal: function(branches) {
        // Remover modal existente
        const existingModal = document.getElementById('branchSelectorModal');
        if (existingModal) existingModal.remove();
        
        const modalHTML = `
            <div id="branchSelectorModal" class="branch-selector-modal">
                <div class="branch-selector-content">
                    <div class="branch-selector-header">
                        <h3><i class="fas fa-location-dot"></i> Selecciona sucursal de entrega</h3>
                        <span class="branch-selector-close" onclick="document.getElementById('branchSelectorModal').remove()">&times;</span>
                    </div>
                    <div id="branchOptionsList">
                        ${branches.filter(b => b.estado === 'Activo').map(branch => `
                            <div class="branch-option" data-id="${branch.id}">
                                <div class="branch-option-name">
                                    <i class="fas fa-store"></i> ${this.escapeHtml(branch.nombreSucursal)}
                                </div>
                                <div class="branch-option-address">
                                    <i class="fas fa-location-dot"></i> ${this.escapeHtml(branch.direccionExacta)} (${this.escapeHtml(branch.municipio)})
                                </div>
                                ${branch.telefonoSucursal ? `
                                <div class="branch-option-phone">
                                    <i class="fas fa-phone"></i> ${this.escapeHtml(branch.telefonoSucursal)}
                                </div>
                                ` : ''}
                                ${branch.horarioAtencion ? `
                                <div class="branch-option-schedule">
                                    <i class="fas fa-clock"></i> ${this.escapeHtml(branch.horarioAtencion)}
                                </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="branch-selector-footer">
                        <button class="btn-cancel-branch" onclick="document.getElementById('branchSelectorModal').remove()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Agregar evento a cada opción
        document.querySelectorAll('.branch-option').forEach(option => {
            option.addEventListener('click', () => {
                const branchId = parseInt(option.dataset.id);
                const selected = branches.find(b => b.id === branchId);
                if (selected) {
                    this.selectedBranch = selected;
                    this.saveSelectedBranch();
                    this.updateCartUI();
                    document.getElementById('branchSelectorModal').remove();
                    this.showToast(`Sucursal seleccionada: ${selected.nombreSucursal}`, "success");
                    
                    // Si hay un checkout pendiente, proceder
                    if (this.pendingCheckout) {
                        this.pendingCheckout = false;
                        this.proceedCheckout();
                    }
                }
            });
        });
        
        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('branchSelectorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    },
    
    checkout: function() {
        if (this.cart.length === 0) {
            this.showToast("Carrito vacío", "error");
            return false;
        }
        
        if (!this.selectedBranch) {
            this.pendingCheckout = true;
            this.showToast("Por favor selecciona una sucursal de entrega", "info");
            this.selectBranch();
            return false;
        }
        
        return this.proceedCheckout();
    },
    
    proceedCheckout: async function() {
        const subtotal = this.cart.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
        const ahorro = this.cart.reduce((s, i) => {
            if (i.originalPrice) {
                return s + ((i.originalPrice - i.price) * (i.quantity || 1));
            }
            return s;
        }, 0);
        const total = subtotal - ahorro;
        
        // Mostrar resumen del pedido
        const orderSummary = this.cart.map(item => 
            `- ${item.quantity}x ${item.name}: $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        const confirmMsg = `✅ Confirmar pedido\n\n` +
            `📦 Productos:\n${orderSummary}\n\n` +
            `📮 Sucursal de entrega:\n${this.selectedBranch.nombreSucursal}\n${this.selectedBranch.direccionExacta}\n\n` +
            `💰 Total: $${total.toFixed(2)}\n\n` +
            `¿Deseas confirmar este pedido?`;
        
        if (confirm(confirmMsg)) {
            // Crear pedido
            const pedidoData = {
                items: this.cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.quantity,
                    precio_unitario: item.price
                })),
                sucursal_entrega_id: this.selectedBranch.id,
                total: total,
                fecha: new Date().toISOString()
            };
            
            // Guardar pedido en localStorage
            const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            const newOrder = {
                id: `ORD-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                items: this.cart.length,
                total: total.toFixed(2),
                status: 'Pendiente',
                sucursal: this.selectedBranch.nombreSucursal,
                sucursalId: this.selectedBranch.id,
                products: this.cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
            };
            orders.unshift(newOrder);
            localStorage.setItem('userOrders', JSON.stringify(orders));
            
            // Limpiar carrito
            this.cart = [];
            this.saveCart();
            this.closeCart(); // Usar closeCart en lugar de toggleCart
            this.showToast(`🎉 ¡Pedido realizado exitosamente! Se entregará en ${this.selectedBranch.nombreSucursal}`, "success");
            
            // Notificar al router que hay un nuevo pedido
            if (window.updateOrdersBadge) {
                window.updateOrdersBadge();
            }
            
            return true;
        }
        return false;
    },
    
    clearCart: function() {
        this.cart = [];
        this.saveCart();
    },
    
    toggleCart: function() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) {
            if (sidebar.classList.contains('open')) {
                this.closeCart();
            } else {
                sidebar.classList.add('open');
                if (overlay) overlay.classList.add('active');
            }
        }
    },
    
    showToast: function(msg, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.innerText = msg;
            toast.style.display = 'flex';
            toast.style.background = type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#10b981';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(msg);
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

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.CartModule && window.CartModule.init) {
        window.CartModule.init();
    }
});