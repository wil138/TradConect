// javascripts/utils/landing_spa.js
function showToast(msg, isErr = false) {
    const toast = document.getElementById('toastMessage');
    const text = document.getElementById('toastText');
    if (toast && text) {
        text.innerText = msg;
        toast.style.display = 'flex';
        toast.style.background = isErr ? '#ef4444' : '#10b981';
        setTimeout(() => toast.style.display = 'none', 3000);
    } else {
        alert(msg);
    }
}

async function showSpaAndInit(userName, userRole, userEmail = null) {
    const landingWrapper = document.getElementById('landing-wrapper');
    const spaWrapper = document.getElementById('spa-wrapper');
    if (landingWrapper) landingWrapper.style.display = 'none';
    if (spaWrapper) spaWrapper.style.display = 'block';

    // Actualizar header del SPA
    const userNameSpan = document.getElementById('spaUserName');
    const userRoleSpan = document.getElementById('spaUserRole');
    const userAvatarSpan = document.getElementById('spaUserAvatar');
    if (userNameSpan) userNameSpan.innerText = userName || 'Usuario';
    if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Restaurante';
    if (userAvatarSpan) userAvatarSpan.innerText = (userName?.substring(0, 2) || 'U').toUpperCase();

    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    if (userEmail) localStorage.setItem('userEmail', userEmail);

    if (typeof window.updateRoleFromStorage === 'function') {
        window.updateRoleFromStorage();
    } else {
        if (typeof renderMenu === 'function') renderMenu();
        if (typeof updateConditionalElements === 'function') updateConditionalElements();
    }

    if (window.CartModule && typeof window.CartModule.init === 'function') {
        window.CartModule.init();
    }

    if (window.router && typeof window.router.init === 'function') {
        setTimeout(() => window.router.init(), 100);
    }
}

async function handleLogin(usernameOrEmail, password) {
    if (!usernameOrEmail || !password) {
        showToast('Ingrese usuario/email y contraseña', true);
        return;
    }
    const loginBtn = document.querySelector('#loginFormModal button[type="submit"]');
    const originalText = loginBtn?.innerHTML;
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
        loginBtn.disabled = true;
    }
    const result = await window.api.login(usernameOrEmail, password);
    if (loginBtn) {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
    if (result.success) {
        const role = result.user?.rolid?.nombrerol === 'Proveedor' ? 'provider' : 'client';
        await showSpaAndInit(result.user.nombreusuario, role, result.user.correoelectronico);
        closeLoginModal();
        showToast(`✅ Bienvenido ${result.user.nombreusuario}`);
    } else {
        let errorMsg = result.error || 'Credenciales inválidas';
        if (errorMsg.includes('401') || errorMsg.includes('inválidas')) {
            errorMsg = 'Usuario o contraseña incorrectos';
        } else if (errorMsg.includes('network')) {
            errorMsg = 'Error de conexión con el servidor';
        }
        showToast(errorMsg, true);
    }
}

async function handleRegister(userData, isProvider) {
    if (!userData.correo || !userData.contrasena || !userData.razon_social) {
        showToast('Complete todos los campos requeridos', true);
        return;
    }
    if (userData.contrasena !== userData.confirmar_contrasena) {
        showToast('Las contraseñas no coinciden', true);
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.correo)) {
        showToast('Ingrese un correo electrónico válido', true);
        return;
    }
    const data = {
        nombre_usuario: userData.nombre_usuario || userData.correo.split('@')[0],
        correo: userData.correo,
        contrasena: userData.contrasena,
        razon_social: userData.razon_social,
        ruc: userData.ruc || `TEMP${Date.now()}`,
        telefono: userData.telefono || '',
        rol: isProvider ? 'provider' : 'restaurant',
        direccion_fiscal: userData.direccion_fiscal || ''
    };
    const registerBtn = document.querySelector('#registerFormModal button[type="submit"]');
    const originalText = registerBtn?.innerHTML;
    if (registerBtn) {
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        registerBtn.disabled = true;
    }
    const result = await window.api.register(data);
    if (registerBtn) {
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }
    if (result.success) {
        const role = result.user?.rolid?.nombrerol === 'Proveedor' ? 'provider' : 'client';
        await showSpaAndInit(result.user.nombreusuario, role, result.user.correoelectronico);
        closeRegisterModal();
        showToast(`✅ Registro exitoso como ${isProvider ? 'Proveedor' : 'Restaurante'}`);
    } else {
        let errorMsg = result.error || 'Error en el registro';
        if (errorMsg.includes('unique') || errorMsg.includes('already exists')) {
            errorMsg = 'El correo o nombre de usuario ya está registrado';
        }
        showToast(errorMsg, true);
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('loginFormModal')?.reset();
}
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
    setTimeout(() => document.getElementById('loginUsernameModal')?.focus(), 100);
}
function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('registerFormModal')?.reset();
}
function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.style.display = 'flex';
}
function logout() {
    localStorage.clear();
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginFormModal');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsernameModal')?.value;
            const password = document.getElementById('loginPasswordModal')?.value;
            handleLogin(username, password);
        });
    }
    const registerForm = document.getElementById('registerFormModal');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                correo: document.getElementById('regEmailModal')?.value,
                contrasena: document.getElementById('regPasswordModal')?.value,
                confirmar_contrasena: document.getElementById('regConfirmModal')?.value,
                razon_social: document.getElementById('regNameModal')?.value,
                telefono: document.getElementById('regPhoneModal')?.value,
                nombre_usuario: document.getElementById('regNameModal')?.value,
                ruc: document.getElementById('regRucModal')?.value || '',
                direccion_fiscal: document.getElementById('regAddressModal')?.value || ''
            };
            const userType = document.getElementById('regTypeModal')?.value;
            handleRegister(userData, userType === 'provider');
        });
    }
    document.getElementById('loginBtnLanding')?.addEventListener('click', openLoginModal);
    document.getElementById('openRegisterBtnHero')?.addEventListener('click', (e) => {
        e.preventDefault();
        openRegisterModal();
    });
    document.getElementById('switchToRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeLoginModal();
        openRegisterModal();
    });
    document.getElementById('closeModalBtn')?.addEventListener('click', closeLoginModal);
    document.getElementById('closeRegisterModalBtn')?.addEventListener('click', closeRegisterModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('loginModal')) closeLoginModal();
        if (e.target === document.getElementById('registerModal')) closeRegisterModal();
    });
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    // Restaurar sesión si existe token
    const token = localStorage.getItem('access_token');
    if (token) {
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');
        if (userName) {
            const landing = document.getElementById('landing-wrapper');
            const spa = document.getElementById('spa-wrapper');
            if (landing) landing.style.display = 'none';
            if (spa) spa.style.display = 'block';
            const userNameSpan = document.getElementById('spaUserName');
            const userRoleSpan = document.getElementById('spaUserRole');
            const userAvatarSpan = document.getElementById('spaUserAvatar');
            if (userNameSpan) userNameSpan.innerText = userName;
            if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Restaurante';
            if (userAvatarSpan) userAvatarSpan.innerText = (userName.substring(0, 2) || 'U').toUpperCase();
            if (typeof window.updateRoleFromStorage === 'function') window.updateRoleFromStorage();
            if (window.router && typeof window.router.init === 'function') {
                setTimeout(() => window.router.init(), 100);
            }
        }
    }
});

window.closeLoginModal = closeLoginModal;
window.openLoginModal = openLoginModal;
window.closeRegisterModal = closeRegisterModal;
window.openRegisterModal = openRegisterModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showToast = showToast;
window.logout = logout;