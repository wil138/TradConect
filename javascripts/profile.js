// profile.js - Perfil de usuario, empresa y sucursales (con API)
window.profile = {
    currentUser: null,
    currentCompany: null,
    branches: [],

    init: function() {
        console.log("👤 Profile: Inicializando");
        this.loadAllDataFromAPI();
        this.renderProfileHeader();
        this.setupTabs();
        this.setupForms();
        this.setupBranchModal();
    },

    // ========== CARGA DE DATOS ==========
    loadAllDataFromAPI: async function() {
        try {
            console.log("🔄 Cargando datos de perfil desde API...");
            const success = await api.refreshMyData();
            if (success) {
                this.loadFromLocalStorage();
                console.log("✅ Datos de perfil actualizados");
            } else {
                console.warn("⚠️ Error al refrescar datos, usando localStorage existente");
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error("❌ Error en loadAllDataFromAPI:", error);
            this.loadFromLocalStorage();
        }
        this.renderProfileHeader();
        this.renderPersonalData();
        this.renderCompanyData();
        this.renderBranches();
    },

    loadFromLocalStorage: function() {
        const userStr = localStorage.getItem('user');
        if (userStr) this.currentUser = JSON.parse(userStr);
        const companyStr = localStorage.getItem('company');
        if (companyStr) this.currentCompany = JSON.parse(companyStr);
        const branchesStr = localStorage.getItem('sucursales');
        this.branches = branchesStr ? JSON.parse(branchesStr) : [];
        window.userBranches = this.branches;
        console.log("📦 Datos cargados de localStorage:", {
            user: this.currentUser?.nombreusuario,
            company: this.currentCompany?.razonsocial,
            branches: this.branches.length
        });
    },

    // ========== RENDERIZADO DE CABECERA ==========
    renderProfileHeader: function() {
        if (!this.currentUser) return;
        const headerName = document.getElementById('profileHeaderName');
        if (headerName) headerName.textContent = this.currentUser.nombreusuario || 'Usuario';
        const headerRole = document.getElementById('profileHeaderRole');
        if (headerRole) {
            const role = localStorage.getItem('userRole');
            headerRole.textContent = role === 'provider' ? 'Proveedor' : 'Cliente (Restaurante)';
        }
        const avatar = document.getElementById('profileAvatar');
        if (avatar) {
            const initials = this.getInitials(this.currentUser.nombreusuario);
            avatar.innerHTML = initials ? `<span class="avatar-initials">${initials}</span>` : '<i class="fas fa-user"></i>';
            avatar.style.backgroundColor = this.getColorFromName(this.currentUser.nombreusuario);
        }
        const badge = document.getElementById('profileBadge');
        if (badge) {
            const isVerified = this.currentUser.verificado || this.currentUser.estado === 'Activo';
            badge.innerHTML = isVerified 
                ? '<i class="fas fa-check-circle"></i> Verificado' 
                : '<i class="fas fa-clock"></i> Por verificar';
            badge.className = isVerified ? 'profile-badge verified' : 'profile-badge pending';
        }
    },

    // ========== UTILIDADES ==========
    getInitials: function(name) {
        if (!name) return '?';
        return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
    },

    getColorFromName: function(name) {
        const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
        let hash = 0;
        if (name) for (let i=0; i<name.length; i++) hash = name.charCodeAt(i) + ((hash<<5)-hash);
        return colors[Math.abs(hash) % colors.length];
    },

    // ========== RENDERIZADO DE DATOS PERSONALES Y EMPRESA ==========
    renderPersonalData: function() {
        if (!this.currentUser) return;
        this.setValue('profileName', this.currentUser.nombreusuario || '');
        this.setValue('profileEmail', this.currentUser.correoelectronico || '');
        this.setValue('profilePhone', this.currentUser.telefono || '');
        const memberSince = this.currentUser.fecharegistro 
            ? new Date(this.currentUser.fecharegistro).toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' })
            : 'No disponible';
        this.setValue('profileMemberSince', memberSince);
    },

    renderCompanyData: function() {
        if (!this.currentCompany) {
            ['companyRazonSocial','companyRUC','companyPhone','companyEmail','companyAddress','companyLogoUrl'].forEach(id => this.setValue(id, ''));
            return;
        }
        this.setValue('companyRazonSocial', this.currentCompany.razonsocial || '');
        this.setValue('companyRUC', this.currentCompany.ruc || '');
        this.setValue('companyPhone', this.currentCompany.telefono || '');
        this.setValue('companyEmail', this.currentCompany.correoempresa || '');
        this.setValue('companyAddress', this.currentCompany.direccionfiscal || '');
        this.setValue('companyLogoUrl', this.currentCompany.logourl || '');
        if (document.getElementById('companyWebsite')) {
            this.setValue('companyWebsite', this.currentCompany.sitio_web || '');
        }
    },

    setValue: function(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    },

    getValue: function(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    },

    // ========== SUCURSALES ==========
    renderBranches: function() {
        const container = document.getElementById('branchesList');
        if (!container) return;
        if (!this.branches || this.branches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-store-slash"></i>
                    <p>No tienes sucursales registradas</p>
                    <button class="btn-primary" onclick="document.getElementById('openBranchModalBtn').click()">
                        Agregar tu primera sucursal
                    </button>
                </div>
            `;
            return;
        }
        container.innerHTML = this.branches.map(branch => `
            <div class="branch-card" data-id="${branch.id}">
                <div class="branch-card-header">
                    <h4><i class="fas fa-store"></i> ${this.escapeHtml(branch.nombresucursal || branch.nombre || 'Sin nombre')}</h4>
                    <span class="branch-status ${branch.estado === 'Activo' ? 'activo' : 'inactivo'}">
                        <i class="fas ${branch.estado === 'Activo' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${branch.estado === 'Activo' ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <div class="branch-detail">
                    <i class="fas fa-map-pin"></i>
                    <span><strong>Municipio:</strong> ${this.escapeHtml(branch.municipio || branch.municipioid?.nombre || 'N/A')}</span>
                </div>
                <div class="branch-detail">
                    <i class="fas fa-location-dot"></i>
                    <span><strong>Dirección:</strong> ${this.escapeHtml(branch.direccionexacta || branch.direccion || 'No especificada')}</span>
                </div>
                ${branch.telefonosucursal || branch.telefono ? `
                    <div class="branch-detail">
                        <i class="fas fa-phone"></i>
                        <span><strong>Teléfono:</strong> ${this.escapeHtml(branch.telefonosucursal || branch.telefono)}</span>
                    </div>
                ` : ''}
                <div class="branch-actions">
                    <button class="btn-edit" onclick="window.profile.editBranch(${branch.id})" title="Editar"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn-delete" onclick="window.profile.deleteBranch(${branch.id})" title="Eliminar"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `).join('');
    },

    // ========== OPERACIONES CON SUCURSALES ==========
    saveBranch: async function() {
        const branchId = this.getValue('branchId');
        const branchName = this.getValue('branchName');
        const branchAddress = this.getValue('branchAddress');
        if (!branchName || !branchName.trim()) {
            this.showToast('El nombre de la sucursal es obligatorio', 'error');
            return;
        }
        if (!branchAddress || !branchAddress.trim()) {
            this.showToast('La dirección es obligatoria', 'error');
            return;
        }

        const branchData = {
            nombresucursal: branchName,
            municipioid: parseInt(this.getValue('branchMunicipio')) || 1,
            direccionexacta: branchAddress,
            telefonosucursal: this.getValue('branchPhone'),
            estado: this.getValue('branchStatus') === 'Activo' ? 'Activo' : 'Inactivo'
        };

        try {
            let result;
            if (branchId) {
                result = await api.updateBranch(parseInt(branchId), branchData);
            } else {
                result = await api.createBranch(branchData);
            }
            if (result.success) {
                await this.loadAllDataFromAPI();
                this.showToast(branchId ? "✅ Sucursal actualizada" : "✅ Sucursal creada", "success");
                this.closeBranchModal();
            } else {
                this.showToast(result.error || "Error al guardar", "error");
            }
        } catch (error) {
            console.error(error);
            this.showToast('Error de conexión', 'error');
        }
    },

    editBranch: function(branchId) {
        const branch = this.branches.find(b => b.id === branchId);
        if (!branch) return;
        this.setValue('branchId', branch.id);
        this.setValue('branchName', branch.nombresucursal || branch.nombre);
        this.setValue('branchMunicipio', branch.municipioid?.id || branch.municipio || '');
        this.setValue('branchAddress', branch.direccionexacta || branch.direccion || '');
        this.setValue('branchPhone', branch.telefonosucursal || branch.telefono || '');
        this.setValue('branchStatus', branch.estado === 'Activo' ? 'Activo' : 'Inactivo');
        const modalTitle = document.getElementById('branchModalTitle');
        if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Sucursal';
        this.openBranchModal();
    },

    deleteBranch: async function(branchId) {
        const branch = this.branches.find(b => b.id === branchId);
        if (!branch) return;
        if (!confirm(`¿Eliminar "${branch.nombresucursal}"?`)) return;
        try {
            const result = await api.deleteBranch(branchId);
            if (result.success) {
                await this.loadAllDataFromAPI();
                this.showToast("✅ Sucursal eliminada", "success");
            } else {
                this.showToast(result.error || "Error al eliminar", "error");
            }
        } catch (error) {
            console.error(error);
            this.showToast('Error de conexión', 'error');
        }
    },

    // ========== ACTUALIZACIÓN DE PERFIL Y EMPRESA ==========
    updateProfile: async function() {
        const nombreusuario = this.getValue('profileName');
        const correoelectronico = this.getValue('profileEmail');
        const telefono = this.getValue('profilePhone') || '';
        if (!nombreusuario || !nombreusuario.trim()) {
            this.showToast('El nombre es obligatorio', 'error');
            return;
        }
        if (!correoelectronico || !correoelectronico.trim()) {
            this.showToast('El correo es obligatorio', 'error');
            return;
        }
        if (!this.isValidEmail(correoelectronico)) {
            this.showToast('Correo no válido', 'error');
            return;
        }

        try {
            const result = await api.updateProfile({ nombreusuario, correoelectronico, telefono });
            if (result.success) {
                await this.loadAllDataFromAPI();
                this.showToast('✅ Perfil actualizado', 'success');
            } else {
                this.showToast(result.error || 'Error al actualizar', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showToast('Error de conexión', 'error');
        }
    },

    updateCompany: async function() {
        if (!this.currentCompany) {
            this.showToast("No hay datos de empresa", "error");
            return;
        }
        const razonSocial = this.getValue('companyRazonSocial');
        if (!razonSocial || !razonSocial.trim()) {
            this.showToast("La razón social es obligatoria", "error");
            return;
        }

        const companyData = {
            razonsocial: razonSocial,
            ruc: this.getValue('companyRUC'),
            telefono: this.getValue('companyPhone'),
            correoempresa: this.getValue('companyEmail'),
            direccionfiscal: this.getValue('companyAddress'),
            logourl: this.getValue('companyLogoUrl'),
            estado: true
        };

        try {
            const result = await api.updateCompany(this.currentCompany.id, companyData);
            if (result.success) {
                await this.loadAllDataFromAPI();
                this.showToast("✅ Empresa actualizada", "success");
            } else {
                this.showToast(result.error || "Error al actualizar", "error");
            }
        } catch (error) {
            console.error(error);
            this.showToast('Error de conexión', 'error');
        }
    },

    // ========== CAMBIAR CONTRASEÑA ==========
    changePassword: async function() {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (!currentPassword || !currentPassword.trim()) {
            this.showToast('Ingresa tu contraseña actual', 'error');
            return;
        }
        if (!newPassword || !newPassword.trim()) {
            this.showToast('Ingresa tu nueva contraseña', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        if (newPassword.length < 8) {
            this.showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        if (currentPassword === newPassword) {
            this.showToast('La nueva contraseña no puede ser igual a la actual', 'error');
            return;
        }

        try {
            const result = await api.changePassword(currentPassword, newPassword);
            if (result.success) {
                this.showToast('✅ Contraseña actualizada', 'success');
                document.getElementById('securityForm').reset();
            } else {
                this.showToast(result.error || 'Error al cambiar contraseña', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showToast('Error de conexión', 'error');
        }
    },

    // ========== UI: TABS, FORMULARIOS Y MODAL ==========
    setupForms: function() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) profileForm.addEventListener('submit', (e) => { e.preventDefault(); this.updateProfile(); });
        const companyForm = document.getElementById('companyForm');
        if (companyForm) companyForm.addEventListener('submit', async (e) => { e.preventDefault(); await this.updateCompany(); });
        const branchForm = document.getElementById('branchForm');
        if (branchForm) branchForm.addEventListener('submit', async (e) => { e.preventDefault(); await this.saveBranch(); });
        const securityForm = document.getElementById('securityForm');
        if (securityForm) securityForm.addEventListener('submit', (e) => { e.preventDefault(); this.changePassword(); });
    },

    setupTabs: function() {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    },

    switchTab: function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`${tabId}Tab`);
        if (activeBtn) activeBtn.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        if (tabId === 'branches') {
            this.loadAllDataFromAPI(); // Recargar sucursales
        }
    },

    setupBranchModal: function() {
        const modal = document.getElementById('branchModal');
        const openBtn = document.getElementById('openBranchModalBtn');
        const closeBtn = document.querySelector('.branch-modal-close');
        const cancelBtn = document.getElementById('cancelBranchBtn');

        if (openBtn) openBtn.onclick = () => this.openBranchModal();
        if (closeBtn) closeBtn.onclick = () => this.closeBranchModal();
        if (cancelBtn) cancelBtn.onclick = () => this.closeBranchModal();
        if (modal) modal.addEventListener('click', (event) => {
            if (event.target === modal) this.closeBranchModal();
        });
    },

    openBranchModal: function() {
        const modal = document.getElementById('branchModal');
        if (modal) {
            const modalTitle = document.getElementById('branchModalTitle');
            if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-store"></i> Nueva Sucursal';
            document.getElementById('branchId').value = '';
            document.getElementById('branchName').value = '';
            document.getElementById('branchMunicipio').value = '';
            document.getElementById('branchAddress').value = '';
            document.getElementById('branchPhone').value = '';
            document.getElementById('branchStatus').value = 'Activo';
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    },

    closeBranchModal: function() {
        const modal = document.getElementById('branchModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    },

    // ========== UTILIDADES GENERALES ==========
    isValidEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showToast: function(message, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (toast && text) {
            text.textContent = message;
            toast.style.display = 'flex';
            toast.style.background = type === 'error' ? '#dc2626' : type === 'warning' ? '#f59e0b' : '#10b981';
            clearTimeout(this._toastTimeout);
            this._toastTimeout = setTimeout(() => toast.style.display = 'none', 3000);
        } else {
            alert(message);
        }
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (window.profile && window.profile.init) window.profile.init();
});