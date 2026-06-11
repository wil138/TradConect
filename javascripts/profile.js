// javascripts/profile.js
window.profile = {
    currentUser: null,
    currentCompany: null,
    branches: [],
    
    init: async function() {
        console.log("Profile: Inicializando");
        this.loadAllData();
        this.setupTabs();
        this.setupForms();
        this.setupBranchModal();
    },
    
    loadAllData: function() {
        const userStr = localStorage.getItem('user');
        if (userStr) this.currentUser = JSON.parse(userStr);
        const companyStr = localStorage.getItem('company');
        if (companyStr) this.currentCompany = JSON.parse(companyStr);
        const branchesStr = localStorage.getItem('sucursales');
        if (branchesStr) {
            this.branches = JSON.parse(branchesStr);
            window.userBranches = this.branches;
        } else {
            this.branches = [];
        }
        this.renderBranches();
        this.renderPersonalData();
        this.renderCompanyData();
    },
    
    renderPersonalData: function() {
        if (this.currentUser) {
            this.setValue('profileName', this.currentUser.nombreusuario || '');
            this.setValue('profileEmail', this.currentUser.correoelectronico || '');
        }
    },
    
    renderCompanyData: function() {
        if (this.currentCompany) {
            this.setValue('companyRazonSocial', this.currentCompany.razonsocial || '');
            this.setValue('companyRUC', this.currentCompany.ruc || '');
            this.setValue('companyPhone', this.currentCompany.telefono || '');
            this.setValue('companyEmail', this.currentCompany.correoempresa || '');
            this.setValue('companyAddress', this.currentCompany.direccionfiscal || '');
            this.setValue('companyLogoUrl', this.currentCompany.logourl || '');
        } else {
            ['companyRazonSocial','companyRUC','companyPhone','companyEmail','companyAddress','companyLogoUrl'].forEach(id => this.setValue(id, ''));
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
    
    setupForms: function() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) profileForm.addEventListener('submit', (e) => { e.preventDefault(); this.updateProfile(); });
        const companyForm = document.getElementById('companyForm');
        if (companyForm) companyForm.addEventListener('submit', async (e) => { e.preventDefault(); await this.updateCompany(); });
        const branchForm = document.getElementById('branchForm');
        if (branchForm) branchForm.addEventListener('submit', async (e) => { e.preventDefault(); await this.saveBranch(); });
    },
    
    updateProfile: function() {
        this.showToast("Los datos personales se actualizan desde la empresa", "info");
    },
    
    updateCompany: async function() {
        if (!this.currentCompany) {
            this.showToast("No hay datos de empresa para actualizar", "error");
            return;
        }
        const companyData = {
            razonsocial: this.getValue('companyRazonSocial'),
            ruc: this.getValue('companyRUC'),
            telefono: this.getValue('companyPhone'),
            correoempresa: this.getValue('companyEmail'),
            direccionfiscal: this.getValue('companyAddress'),
            logourl: this.getValue('companyLogoUrl'),
            estado: true
        };
        const result = await api.updateCompany(this.currentCompany.id, companyData);
        if (result.success) {
            this.currentCompany = result.data;
            localStorage.setItem('company', JSON.stringify(this.currentCompany));
            this.showToast("Datos de empresa actualizados", "success");
        } else {
            this.showToast(result.error || "Error al actualizar", "error");
        }
    },
    
    loadBranches: function() {
        const branchesStr = localStorage.getItem('sucursales');
        this.branches = branchesStr ? JSON.parse(branchesStr) : [];
        this.renderBranches();
        window.userBranches = this.branches;
    },
    
    renderBranches: function() {
        const container = document.getElementById('branchesList');
        if (!container) return;
        if (!this.branches.length) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-store-slash"></i><p>No tienes sucursales registradas</p><button class="btn-primary" onclick="document.getElementById('openBranchModalBtn').click()">Agregar tu primera sucursal</button></div>`;
            return;
        }
        container.innerHTML = this.branches.map(branch => `
            <div class="branch-card" data-id="${branch.id}">
                <div class="branch-card-header">
                    <h4><i class="fas fa-store"></i> ${this.escapeHtml(branch.nombresucursal || branch.nombre)}</h4>
                    <span class="branch-status ${branch.estado === 'Activo' ? 'activo' : 'inactivo'}">${branch.estado === 'Activo' ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div class="branch-detail"><i class="fas fa-map-pin"></i><span><strong>Municipio:</strong> ${this.escapeHtml(branch.municipio || branch.municipioid?.nombre || 'N/A')}</span></div>
                <div class="branch-detail"><i class="fas fa-location-dot"></i><span><strong>Dirección:</strong> ${this.escapeHtml(branch.direccionexacta || branch.direccion || '')}</span></div>
                ${branch.telefonosucursal || branch.telefono ? `<div class="branch-detail"><i class="fas fa-phone"></i><span><strong>Teléfono:</strong> ${this.escapeHtml(branch.telefonosucursal || branch.telefono)}</span></div>` : ''}
                <div class="branch-actions"><button class="btn-edit" onclick="profile.editBranch(${branch.id})"><i class="fas fa-edit"></i> Editar</button><button class="btn-delete" onclick="profile.deleteBranch(${branch.id})"><i class="fas fa-trash"></i> Eliminar</button></div>
            </div>
        `).join('');
    },
    
    saveBranch: async function() {
        const branchId = this.getValue('branchId');
        const branchData = {
            nombresucursal: this.getValue('branchName'),
            municipioid: parseInt(this.getValue('branchMunicipio')) || 1,
            direccionexacta: this.getValue('branchAddress'),
            telefonosucursal: this.getValue('branchPhone'),
            estado: this.getValue('branchStatus') === 'Activo' ? 'Activo' : 'Inactivo'
        };
        let result;
        if (branchId) result = await api.updateBranch(branchId, branchData);
        else result = await api.createBranch(branchData);
        if (result.success) {
            this.showToast(branchId ? "Sucursal actualizada" : "Sucursal creada", "success");
            this.loadBranches();
            this.closeBranchModal();
        } else {
            this.showToast(result.error || "Error al guardar", "error");
        }
    },
    
    editBranch: function(branchId) {
        const branch = this.branches.find(b => b.id === branchId);
        if (branch) {
            this.setValue('branchId', branch.id);
            this.setValue('branchName', branch.nombresucursal || branch.nombre);
            this.setValue('branchMunicipio', branch.municipioid?.id || branch.municipio || '');
            this.setValue('branchAddress', branch.direccionexacta || branch.direccion || '');
            this.setValue('branchPhone', branch.telefonosucursal || branch.telefono || '');
            this.setValue('branchStatus', branch.estado === 'Activo' ? 'Activo' : 'Inactivo');
            document.getElementById('branchModalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Sucursal';
            this.openBranchModal();
        }
    },
    
    deleteBranch: async function(branchId) {
        if (confirm('¿Eliminar esta sucursal?')) {
            const result = await api.deleteBranch(branchId);
            if (result.success) {
                this.showToast("Sucursal eliminada", "success");
                this.loadBranches();
            } else {
                this.showToast(result.error || "Error al eliminar", "error");
            }
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
        window.onclick = (event) => { if (event.target === modal) this.closeBranchModal(); };
    },
    
    openBranchModal: function() {
        const modal = document.getElementById('branchModal');
        if (modal) {
            this.resetBranchForm();
            document.getElementById('branchModalTitle').innerHTML = '<i class="fas fa-store"></i> Nueva Sucursal';
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    },
    
    closeBranchModal: function() {
        const modal = document.getElementById('branchModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            this.resetBranchForm();
        }
    },
    
    resetBranchForm: function() {
        this.setValue('branchId', '');
        this.setValue('branchName', '');
        this.setValue('branchMunicipio', '');
        this.setValue('branchAddress', '');
        this.setValue('branchPhone', '');
        this.setValue('branchStatus', 'Activo');
        const checkbox = document.getElementById('branchIsWarehouse');
        if (checkbox) checkbox.checked = false;
    },
    
    setupTabs: function() {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.getAttribute('data-tab')));
        });
    },
    
    switchTab: function(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}Tab`)?.classList.add('active');
        if (tabId === 'branches') this.loadBranches();
    },
    
    showToast: function(message, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const toastText = document.getElementById('toastText');
        if (toast && toastText) {
            toastText.textContent = message;
            toast.className = `toast ${type}`;
            toast.style.display = 'flex';
            setTimeout(() => toast.style.display = 'none', 3000);
        } else alert(message);
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};