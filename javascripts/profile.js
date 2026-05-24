window.profile = {
    userData: null,
    empresaData: null,

    init: async function() {
        console.log("Profile: Inicializando");
        await this.loadUserData();
        this.setupForm();
        this.setupPasswordChange();
    },

    loadUserData: async function() {
        try {
            const data = await window.api.getProfile();
            this.userData = data;
            this.empresaData = data.empresa || {};
            this.renderUserData();
        } catch (error) {
            this.showNotification('Error al cargar perfil: ' + error.message, 'error');
        }
    },

    renderUserData: function() {
        document.getElementById('profileName').value = this.userData.username || '';
        document.getElementById('profileEmail').value = this.userData.email || '';
        document.getElementById('profileEmpresa').value = this.empresaData.razon_social || '';
        document.getElementById('profileRuc').value = this.empresaData.ruc || '';
        document.getElementById('profilePhone').value = this.empresaData.telefono || '';
        document.getElementById('profileAddress').value = this.empresaData.direccion_fiscal || '';
        document.getElementById('profileRole').textContent = this.userData.role === 'provider' ? 'Proveedor' : 'Cliente';
        
        const avatar = document.getElementById('profileAvatar');
        if (avatar && this.empresaData.logourl) avatar.src = this.empresaData.logourl;
        
        this.renderRoleStats();
    },

    renderRoleStats: async function() {
        const container = document.getElementById('profileStats');
        if (!container) return;
        const role = this.userData?.role;
        if (role === 'provider') {
            try {
                const stats = await window.api.getDashboardStats();
                container.innerHTML = `<h3>Estadísticas de tu negocio</h3><div class="kpis">...</div>`;
                // similar a antes pero con datos reales
            } catch(e) {}
        } else {
            container.innerHTML = `<div class="card"><i class="fas fa-shopping-cart"></i> Como cliente puedes explorar el marketplace.</div>`;
        }
    },

    setupForm: function() {
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateProfile();
        });
    },

    updateProfile: async function() {
        const updates = {
            username: document.getElementById('profileName').value,
            email: document.getElementById('profileEmail').value,
            empresa: {
                razon_social: document.getElementById('profileEmpresa').value,
                ruc: document.getElementById('profileRuc').value,
                telefono: document.getElementById('profilePhone').value,
                direccion_fiscal: document.getElementById('profileAddress').value
            }
        };
        try {
            await window.api.updateProfile(updates);
            this.showNotification('Perfil actualizado correctamente', 'success');
            localStorage.setItem('userName', updates.username);
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    },

    setupPasswordChange: function() {
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
            document.getElementById('passwordModal').classList.add('active');
        });
        document.getElementById('passwordChangeForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPwd = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            if (newPwd !== confirm) {
                this.showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            try {
                await window.api.updateProfile({ contrasena: newPwd });
                this.showNotification('Contraseña actualizada', 'success');
                document.getElementById('passwordModal').classList.remove('active');
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        });
    },

    showNotification: function(msg, type) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
        toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:${type === 'success' ? '#10b981' : '#ef4444'}; color:white; padding:12px 20px; border-radius:8px; z-index:10000;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};