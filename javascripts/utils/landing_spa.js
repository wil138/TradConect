function showToast(msg, isErr = false) {
    const toast = document.getElementById('toastMessage');
    const text = document.getElementById('toastText');
    if (toast && text) {
        text.innerText = msg;
        toast.style.display = 'flex';
        toast.style.background = isErr ? '#ef4444' : '#10b981';
        setTimeout(() => toast.style.display = 'none', 3000);
    }
}

async function showSpaAndInit(userName, userRole, userEmail = null) {
    const landingWrapper = document.getElementById('landing-wrapper');
    const spaWrapper = document.getElementById('spa-wrapper');

    if (landingWrapper) landingWrapper.style.display = 'none';
    if (spaWrapper) spaWrapper.style.display = 'block';

    const userNameSpan = document.getElementById('spaUserName');
    const userRoleSpan = document.getElementById('spaUserRole');

    if (userNameSpan) userNameSpan.innerText = userName;
    if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Cliente';

    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    if (userEmail) localStorage.setItem('userEmail', userEmail);

    if (typeof renderMenu === 'function') renderMenu();
    if (typeof updateConditionalElements === 'function') updateConditionalElements();

    if (window.CartModule && typeof window.CartModule.init === 'function') {
        window.CartModule.init();
    }

    const moduloInicial = userRole === 'client' ? 'marketplace' : 'dashboard';
    if (window.router && typeof window.router.cargarModulo === 'function') {
        setTimeout(() => window.router.cargarModulo(moduloInicial), 100);
    }
}

async function handleLogin(username, password) {
    if (!username || !password) {
        showToast('Ingrese email y contraseña', true);
        return;
    }

    const result = await window.api.login(email, password);

    if (result.success) {
        await showSpaAndInit(result.user.username, result.user.role, result.user.email);
        closeLoginModal();
        showToast(`✅ Bienvenido ${result.user.username}`);
    } else {
        showToast(result.error, true);
    }
}

async function handleRegister(userData, isProvider) {
    if (!userData.correo || !userData.contrasena || !userData.razon_social) {
        showToast('Complete todos los campos requeridos', true);
        return;
    }

    const data = {
        nombre_usuario: userData.nombre_usuario || userData.correo.split('@')[0],
        correo: userData.correo,
        contrasena: userData.contrasena,
        razon_social: userData.razon_social,
        ruc: `TEMP${Date.now()}`,
        telefono: userData.telefono || '',
        rol: isProvider ? 'provider' : 'client'
    };

    const result = await window.api.register(data);

    if (result.success) {
        await showSpaAndInit(result.user.username, result.user.role, result.user.email);
        closeRegisterModal();
        showToast(`✅ Registro exitoso como ${isProvider ? 'Proveedor' : 'Cliente'}`);
    } else {
        showToast(result.error, true);
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'flex';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form - usando los IDs correctos del modal
    const loginForm = document.getElementById('loginFormModal');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmailModal')?.value;
            const password = document.getElementById('loginPasswordModal')?.value;
            handleLogin(email, password);
        });
    }

    // Register form - usando los IDs correctos del modal
    const registerForm = document.getElementById('registerFormModal');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                correo: document.getElementById('regEmailModal')?.value,
                contrasena: document.getElementById('regPasswordModal')?.value,
                razon_social: document.getElementById('regNameModal')?.value,
                telefono: document.getElementById('regPhoneModal')?.value,
                nombre_usuario: document.getElementById('regNameModal')?.value
            };
            const confirmPassword = document.getElementById('regConfirmModal')?.value;
            const userType = document.getElementById('regTypeModal')?.value;

            if (userData.contrasena !== confirmPassword) {
                showToast('Las contraseñas no coinciden', true);
                return;
            }

            handleRegister(userData, userType === 'proveedor');
        });
    }

    // Botones de landing
    const loginBtn = document.getElementById('loginBtnLanding');
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);

    const registerBtn = document.getElementById('openRegisterBtnHero');
    if (registerBtn) registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openRegisterModal();
    });

    const supplierBtn = document.getElementById('supplierInfoBtn');
    if (supplierBtn) supplierBtn.addEventListener('click', () => {
        const typeSelect = document.getElementById('regTypeModal');
        if (typeSelect) typeSelect.value = 'proveedor';
        openRegisterModal();
    });

    // Cerrar modales al hacer clic fuera
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeLoginModal();
        });
    }

    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) closeRegisterModal();
        });
    }

    // Verificar sesión existente
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (token && userName) {
        const landing = document.getElementById('landing-wrapper');
        const spa = document.getElementById('spa-wrapper');
        if (landing) landing.style.display = 'none';
        if (spa) spa.style.display = 'block';

        if (typeof renderMenu === 'function') renderMenu();
        if (typeof updateConditionalElements === 'function') updateConditionalElements();

        if (window.CartModule && typeof window.CartModule.init === 'function') {
            window.CartModule.init();
        }

        if (window.router && typeof window.router.cargarModulo === 'function') {
            const modulo = localStorage.getItem('currentModule') || (userRole === 'client' ? 'marketplace' : 'dashboard');
            setTimeout(() => window.router.cargarModulo(modulo), 100);
        }
    }
});

// Exponer funciones globales
window.closeLoginModal = closeLoginModal;
window.openLoginModal = openLoginModal;
window.closeRegisterModal = closeRegisterModal;
window.openRegisterModal = openRegisterModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;