// javascripts/utils/landing_spa.js

function showToast(msg, isErr = false) {
    const toast = document.getElementById('toastMessage');
    const text = document.getElementById('toastText');
    if (toast && text) {
        text.innerText = msg;
        toast.style.display = 'flex';
        toast.style.background = isErr ? '#ef4444' : '#10b981';
        setTimeout(() => toast.style.display = 'none', 3000);
    } else alert(msg);
}

async function showSpaAndInit(userName, userRole, userEmail = null) {
    const landingWrapper = document.getElementById('landing-wrapper');
    const spaWrapper = document.getElementById('spa-wrapper');
    if (landingWrapper) landingWrapper.style.display = 'none';
    if (spaWrapper) spaWrapper.style.display = 'block';

    // Guardar en localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    if (userEmail) localStorage.setItem('userEmail', userEmail);

    // Actualizar header del SPA
    const userNameSpan = document.getElementById('spaUserName');
    const userRoleSpan = document.getElementById('spaUserRole');
    if (userNameSpan) userNameSpan.innerText = userName || 'Usuario';
    if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Restaurante';

    // Forzar actualización del menú y elementos condicionales
    if (typeof window.updateRoleFromStorage === 'function') {
        window.updateRoleFromStorage();
    } else {
        if (typeof renderMenu === 'function') renderMenu();
        if (typeof updateConditionalElements === 'function') updateConditionalElements();
    }

    // Inicializar carrito
    if (window.CartModule && typeof window.CartModule.init === 'function') {
        window.CartModule.init();
    }

    // Inicializar router
    if (window.router && typeof window.router.init === 'function') {
        setTimeout(() => window.router.init(), 100);
    }
}

async function handleLogin(usernameOrEmail, password) {
    if (!usernameOrEmail || !password) {
        showToast('Ingrese usuario/email y contraseña', true);
        return;
    }
    
    const loginBtn = document.querySelector('#landingLoginForm button[type="submit"]');
    const originalText = loginBtn?.innerHTML;
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
        loginBtn.disabled = true;
    }
    
    let result;
    if (window.api && typeof window.api.login === 'function') {
        result = await window.api.login(usernameOrEmail, password);
    } else {
        // Fallback a simulación local
        const users = JSON.parse(localStorage.getItem('fakeUsers') || '[]');
        const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
        result = user ? { success: true, user: { nombreusuario: user.name, correoelectronico: user.email, rol: user.role } } : { success: false, error: 'Credenciales inválidas' };
    }
    
    if (loginBtn) {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
    
    if (result.success) {
        const role = result.user.rol || result.user.role || 'client';
        localStorage.setItem('access_token', result.token || 'fake-token');
        await showSpaAndInit(result.user.nombreusuario || result.user.username, role, result.user.correoelectronico);
        closeLoginModal();
        showToast(`✅ Bienvenido ${result.user.nombreusuario || result.user.username}`);
    } else {
        let errorMsg = result.error || 'Credenciales inválidas';
        if (errorMsg.includes('401') || errorMsg.includes('inválidas')) errorMsg = 'Usuario o contraseña incorrectos';
        else if (errorMsg.includes('network')) errorMsg = 'Error de conexión con el servidor';
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
    
    const registerBtn = document.querySelector('#landingRegisterForm button[type="submit"]');
    const originalText = registerBtn?.innerHTML;
    if (registerBtn) {
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        registerBtn.disabled = true;
    }
    
    let result;
    if (window.api && typeof window.api.register === 'function') {
        result = await window.api.register(data);
    } else {
        // Fallback a simulación local
        const users = JSON.parse(localStorage.getItem('fakeUsers') || '[]');
        if (users.find(u => u.email === data.correo || u.username === data.nombre_usuario)) {
            result = { success: false, error: 'El correo o usuario ya está registrado' };
        } else {
            const newUser = {
                name: data.razon_social,
                email: data.correo,
                username: data.nombre_usuario,
                password: data.contrasena,
                role: data.rol
            };
            users.push(newUser);
            localStorage.setItem('fakeUsers', JSON.stringify(users));
            result = { success: true, user: { nombreusuario: data.nombre_usuario, correoelectronico: data.correo, rol: data.rol } };
        }
    }
    
    if (registerBtn) {
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }
    
    if (result.success) {
        localStorage.setItem('access_token', result.token || 'fake-token');
        await showSpaAndInit(result.user.nombreusuario, result.user.rol, result.user.correoelectronico);
        closeRegisterModal();
        showToast(`✅ Registro exitoso como ${isProvider ? 'Proveedor' : 'Restaurante'}`);
    } else {
        let errorMsg = result.error || 'Error en el registro';
        if (errorMsg.includes('unique') || errorMsg.includes('already exists'))
            errorMsg = 'El correo o nombre de usuario ya está registrado';
        showToast(errorMsg, true);
    }
}

// Funciones para modales (con los nuevos IDs con prefijo landing-)
function closeLoginModal() {
    const modal = document.getElementById('landingLoginModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('landingLoginForm')?.reset();
}

function openLoginModal() {
    const modal = document.getElementById('landingLoginModal');
    if (modal) modal.style.display = 'flex';
    setTimeout(() => document.getElementById('landingLoginUsername')?.focus(), 100);
}

function closeRegisterModal() {
    const modal = document.getElementById('landingRegisterModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('landingRegisterForm')?.reset();
}

function openRegisterModal() {
    const modal = document.getElementById('landingRegisterModal');
    if (modal) modal.style.display = 'flex';
}

function logout() {
    localStorage.clear();
    window.location.reload();
}

// Toggle de contraseña
function initPasswordToggles() {
    document.querySelectorAll('.landing-toggle-pass').forEach(icon => {
        icon.removeEventListener('click', window._togglePassHandler);
        window._togglePassHandler = function() {
            const targetId = this.dataset.target;
            const targetInput = document.getElementById(targetId);
            if (targetInput) {
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    this.classList.replace('fa-eye-slash', 'fa-eye');
                } else {
                    targetInput.type = 'password';
                    this.classList.replace('fa-eye', 'fa-eye-slash');
                }
            }
        };
        icon.addEventListener('click', window._togglePassHandler);
    });
}

// FAQ acordeón
function initFaqAccordion() {
    document.querySelectorAll('.landing-faq-question').forEach(q => {
        q.removeEventListener('click', window._faqHandler);
        window._faqHandler = function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            } else {
                answer.style.display = 'block';
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        };
        q.addEventListener('click', window._faqHandler);
    });
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar toggles y FAQ
    initPasswordToggles();
    initFaqAccordion();

    // Login form (landing)
    const loginForm = document.getElementById('landingLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('landingLoginUsername')?.value;
            const password = document.getElementById('landingLoginPassword')?.value;
            handleLogin(username, password);
        });
    }

    // Register form (landing)
    const registerForm = document.getElementById('landingRegisterForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                correo: document.getElementById('regEmail')?.value,
                contrasena: document.getElementById('regPassword')?.value,
                confirmar_contrasena: document.getElementById('regPassword')?.value,
                razon_social: document.getElementById('regName')?.value,
                nombre_usuario: document.getElementById('regUsername')?.value,
                telefono: '',
                ruc: '',
                direccion_fiscal: ''
            };
            const userType = document.getElementById('regRole')?.value;
            handleRegister(userData, userType === 'provider');
        });
    }

    // Botones de la landing
    document.getElementById('landingLoginBtn')?.addEventListener('click', openLoginModal);
    document.getElementById('landingOpenRegisterBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        openRegisterModal();
    });

    // Switches entre modales
    document.getElementById('landingSwitchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeLoginModal();
        openRegisterModal();
    });
    document.getElementById('landingSwitchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeRegisterModal();
        openLoginModal();
    });

    // Cerrar modales con X
    document.getElementById('landingCloseLoginBtn')?.addEventListener('click', closeLoginModal);
    document.getElementById('landingCloseRegisterBtn')?.addEventListener('click', closeRegisterModal);

    // Cerrar modales clickeando fuera
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('landingLoginModal')) closeLoginModal();
        if (e.target === document.getElementById('landingRegisterModal')) closeRegisterModal();
    });

    // Botón cerrar sesión en el sidebar
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Restaurar sesión si existe token
    const token = localStorage.getItem('access_token');
    if (token) {
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');
        if (userName && userRole) {
            const landing = document.getElementById('landing-wrapper');
            const spa = document.getElementById('spa-wrapper');
            if (landing) landing.style.display = 'none';
            if (spa) spa.style.display = 'block';
            
            // Actualizar header
            const userNameSpan = document.getElementById('spaUserName');
            const userRoleSpan = document.getElementById('spaUserRole');
            if (userNameSpan) userNameSpan.innerText = userName;
            if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Restaurante';
            
            // Forzar actualización del menú
            if (typeof window.updateRoleFromStorage === 'function') window.updateRoleFromStorage();
            if (window.router?.init) setTimeout(() => window.router.init(), 100);
        }
    }
});

// Exportar funciones globales
window.closeLoginModal = closeLoginModal;
window.openLoginModal = openLoginModal;
window.closeRegisterModal = closeRegisterModal;
window.openRegisterModal = openRegisterModal;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showToast = showToast;
window.logout = logout;
window.showSpaAndInit = showSpaAndInit;