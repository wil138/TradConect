// javascripts/profile.js
window.profile = {
    currentUserId: null,
    currentUser: null,
    branches: [],
    
    init: function() {
        console.log("Profile: Inicializando");
        this.loadUserData();
        this.setupForm();
        this.setupCompanyForm();
        this.setupBranchForm();
        this.setupTabs();
        this.setupModal();
        this.loadBranches();
    },
    
    loadUserData: function() {
        // Cargar usuario actual desde localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserEmail = localStorage.getItem('currentUser');
        
        if (currentUserEmail) {
            this.currentUser = users.find(u => u.email === currentUserEmail);
            if (this.currentUser) {
                this.currentUserId = this.currentUser.id;
                this.loadPersonalData();
                this.loadCompanyData();
            }
        }
    },
    
    loadPersonalData: function() {
        if (this.currentUser) {
            document.getElementById('profileName').value = this.currentUser.name || '';
            document.getElementById('profileEmail').value = this.currentUser.email || '';
            document.getElementById('profilePhone').value = this.currentUser.phone || '';
        }
    },
    
    loadCompanyData: function() {
        const companies = JSON.parse(localStorage.getItem('companies') || '[]');
        const userCompany = companies.find(c => c.usuarioId === this.currentUserId);
        
        if (userCompany) {
            document.getElementById('companyRazonSocial').value = userCompany.razonSocial || '';
            document.getElementById('companyRUC').value = userCompany.ruc || '';
            document.getElementById('companyPhone').value = userCompany.telefono || '';
            document.getElementById('companyEmail').value = userCompany.correoEmpresa || '';
            document.getElementById('companyAddress').value = userCompany.direccionFiscal || '';
            document.getElementById('companyLogoUrl').value = userCompany.logoUrl || '';
        }
    },
    
    setupForm: function() {
        const form = document.getElementById('profileForm');
        if (form) {
            form.addEventListener('submit', (e) => this.updateProfile(e));
        }
    },
    
    setupCompanyForm: function() {
        const form = document.getElementById('companyForm');
        if (form) {
            form.addEventListener('submit', (e) => this.updateCompany(e));
        }
    },
    
    updateProfile: function(event) {
        event.preventDefault();
        
        const name = document.getElementById('profileName')?.value;
        const email = document.getElementById('profileEmail')?.value;
        const phone = document.getElementById('profilePhone')?.value;
        
        if (this.currentUser) {
            this.currentUser.name = name;
            this.currentUser.email = email;
            this.currentUser.phone = phone;
            
            // Actualizar en localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const index = users.findIndex(u => u.id === this.currentUserId);
            if (index !== -1) {
                users[index] = this.currentUser;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', email);
            }
            
            this.showToast("Perfil actualizado correctamente", "success");
            
            // Actualizar nombre en header
            if (window.updateHeaderUser) {
                window.updateHeaderUser(this.currentUser);
            }
        }
    },
    
    updateCompany: function(event) {
        event.preventDefault();
        
        const companyData = {
            usuarioId: this.currentUserId,
            razonSocial: document.getElementById('companyRazonSocial')?.value,
            ruc: document.getElementById('companyRUC')?.value,
            telefono: document.getElementById('companyPhone')?.value,
            correoEmpresa: document.getElementById('companyEmail')?.value,
            direccionFiscal: document.getElementById('companyAddress')?.value,
            logoUrl: document.getElementById('companyLogoUrl')?.value,
            estado: 'Activo'
        };
        
        let companies = JSON.parse(localStorage.getItem('companies') || '[]');
        const existingIndex = companies.findIndex(c => c.usuarioId === this.currentUserId);
        
        if (existingIndex !== -1) {
            companyData.id = companies[existingIndex].id;
            companies[existingIndex] = companyData;
        } else {
            companyData.id = Date.now();
            companies.push(companyData);
        }
        
        localStorage.setItem('companies', JSON.stringify(companies));
        this.showToast("Datos de empresa guardados correctamente", "success");
    },
    
    // MÉTODOS PARA SUCURSALES
    loadBranches: function() {
        const allBranches = JSON.parse(localStorage.getItem('branches') || '[]');
        this.branches = allBranches.filter(b => b.empresaId === this.currentUserId);
        this.renderBranches();
        
        // Guardar sucursales globalmente para que el carrito pueda acceder
        window.userBranches = this.branches;
    },
    
    renderBranches: function() {
        const container = document.getElementById('branchesList');
        if (!container) return;
        
        if (this.branches.length === 0) {
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
                    <h4><i class="fas fa-store"></i> ${this.escapeHtml(branch.nombreSucursal)}</h4>
                    <span class="branch-status ${branch.estado === 'Activo' ? 'activo' : 'inactivo'}">
                        ${branch.estado || 'Activo'}
                    </span>
                </div>
                <div class="branch-detail">
                    <i class="fas fa-map-pin"></i>
                    <span><strong>Municipio:</strong> ${this.escapeHtml(branch.municipio)}</span>
                </div>
                <div class="branch-detail">
                    <i class="fas fa-location-dot"></i>
                    <span><strong>Dirección:</strong> ${this.escapeHtml(branch.direccionExacta)}</span>
                </div>
                ${branch.telefonoSucursal ? `
                <div class="branch-detail">
                    <i class="fas fa-phone"></i>
                    <span><strong>Teléfono:</strong> ${this.escapeHtml(branch.telefonoSucursal)}</span>
                </div>
                ` : ''}
                ${branch.horarioAtencion ? `
                <div class="branch-detail">
                    <i class="fas fa-clock"></i>
                    <span><strong>Horario:</strong> ${this.escapeHtml(branch.horarioAtencion)}</span>
                </div>
                ` : ''}
                ${branch.esBodega ? `
                <div class="branch-detail">
                    <i class="fas fa-warehouse"></i>
                    <span><strong>Bodega:</strong> Sí</span>
                </div>
                ` : ''}
                <div class="branch-actions">
                    <button class="btn-edit" onclick="profile.editBranch(${branch.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="profile.deleteBranch(${branch.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    setupBranchForm: function() {
        const form = document.getElementById('branchForm');
        if (form) {
            form.addEventListener('submit', (e) => this.saveBranch(e));
        }
    },
    
    saveBranch: function(event) {
        event.preventDefault();
        
        const branchId = document.getElementById('branchId')?.value;
        const fechaRegistro = new Date().toISOString();
        
        const branchData = {
            empresaId: this.currentUserId,
            nombreSucursal: document.getElementById('branchName')?.value,
            municipio: document.getElementById('branchMunicipio')?.value,
            direccionExacta: document.getElementById('branchAddress')?.value,
            telefonoSucursal: document.getElementById('branchPhone')?.value,
            horarioAtencion: document.getElementById('branchSchedule')?.value,
            esBodega: document.getElementById('branchIsWarehouse')?.checked,
            estado: document.getElementById('branchStatus')?.value,
            fechaRegistro: fechaRegistro
        };
        
        let branches = JSON.parse(localStorage.getItem('branches') || '[]');
        
        if (branchId) {
            // Actualizar sucursal existente
            const index = branches.findIndex(b => b.id == branchId);
            if (index !== -1) {
                branchData.id = parseInt(branchId);
                branchData.fechaRegistro = branches[index].fechaRegistro;
                branches[index] = branchData;
                this.showToast("Sucursal actualizada correctamente", "success");
            }
        } else {
            // Nueva sucursal
            branchData.id = Date.now();
            branches.push(branchData);
            this.showToast("Sucursal agregada correctamente", "success");
        }
        
        localStorage.setItem('branches', JSON.stringify(branches));
        this.loadBranches();
        this.closeBranchModal();
    },
    
    editBranch: function(branchId) {
        const branch = this.branches.find(b => b.id === branchId);
        if (branch) {
            document.getElementById('branchId').value = branch.id;
            document.getElementById('branchName').value = branch.nombreSucursal;
            document.getElementById('branchMunicipio').value = branch.municipio;
            document.getElementById('branchAddress').value = branch.direccionExacta;
            document.getElementById('branchPhone').value = branch.telefonoSucursal || '';
            document.getElementById('branchSchedule').value = branch.horarioAtencion || '';
            document.getElementById('branchIsWarehouse').checked = branch.esBodega || false;
            document.getElementById('branchStatus').value = branch.estado || 'Activo';
            
            document.getElementById('branchModalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Sucursal';
            this.openBranchModal();
        }
    },
    
    deleteBranch: function(branchId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
            let branches = JSON.parse(localStorage.getItem('branches') || '[]');
            branches = branches.filter(b => b.id !== branchId);
            localStorage.setItem('branches', JSON.stringify(branches));
            this.loadBranches();
            this.showToast("Sucursal eliminada correctamente", "success");
        }
    },
    
    setupModal: function() {
        const modal = document.getElementById('branchModal');
        const openBtn = document.getElementById('openBranchModalBtn');
        const closeBtn = document.querySelector('.branch-modal-close');
        const cancelBtn = document.getElementById('cancelBranchBtn');
        
        if (openBtn) {
            openBtn.onclick = () => this.openBranchModal();
        }
        
        if (closeBtn) {
            closeBtn.onclick = () => this.closeBranchModal();
        }
        
        if (cancelBtn) {
            cancelBtn.onclick = () => this.closeBranchModal();
        }
        
        window.onclick = (event) => {
            if (event.target === modal) {
                this.closeBranchModal();
            }
        };
    },
    
    openBranchModal: function() {
        const modal = document.getElementById('branchModal');
        if (modal) {
            this.resetBranchForm();
            document.getElementById('branchModalTitle').innerHTML = '<i class="fas fa-store"></i> Nueva Sucursal';
            modal.classList.add('show');
        }
    },
    
    closeBranchModal: function() {
        const modal = document.getElementById('branchModal');
        if (modal) {
            modal.classList.remove('show');
            this.resetBranchForm();
        }
    },
    
    resetBranchForm: function() {
        const form = document.getElementById('branchForm');
        if (form) {
            form.reset();
            document.getElementById('branchId').value = '';
        }
    },
    
    setupTabs: function() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    },
    
    switchTab: function(tabId) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        
        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        if (tabId === 'personal') {
            document.getElementById('personalTab').classList.add('active');
        } else if (tabId === 'company') {
            document.getElementById('companyTab').classList.add('active');
        } else if (tabId === 'branches') {
            document.getElementById('branchesTab').classList.add('active');
            this.loadBranches();
        }
    },
    
    showToast: function(message, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const toastText = document.getElementById('toastText');
        if (toast && toastText) {
            toastText.textContent = message;
            toast.className = `toast ${type}`;
            toast.style.display = 'flex';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        } else {
            alert(message);
        }
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.profile && window.profile.init) {
        window.profile.init();
    }
});