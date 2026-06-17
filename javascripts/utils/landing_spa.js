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

async function showSpaAndInit() {
    console.log("🔄 showSpaAndInit - Mostrando SPA");
    
    const landingWrapper = document.getElementById('landing-wrapper');
    const spaWrapper = document.getElementById('spa-wrapper');
    
    if (landingWrapper) landingWrapper.style.display = 'none';
    if (spaWrapper) spaWrapper.style.display = 'block';

    // Leer datos ya guardados por api.js
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userRole = localStorage.getItem('userRole') || 'client';
    const userEmail = localStorage.getItem('userEmail') || '';

    console.log("📌 Datos usuario:", { userName, userRole, userEmail });

    // Actualizar header del SPA
    const userNameSpan = document.getElementById('spaUserName');
    const userRoleSpan = document.getElementById('spaUserRole');
    if (userNameSpan) userNameSpan.innerText = userName;
    if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Restaurante';

    // Renderizar menú
    if (typeof window.updateRoleFromStorage === 'function') {
        window.updateRoleFromStorage();
    } else if (typeof renderMenu === 'function') {
        renderMenu();
    }

    // Actualizar elementos condicionales (carrito)
    if (typeof window.updateConditionalElements === 'function') {
        window.updateConditionalElements();
    } else if (typeof updateConditionalElements === 'function') {
        updateConditionalElements();
    }

    // Inicializar router después de un pequeño delay
    if (window.router && typeof window.router.init === 'function') {
        setTimeout(() => window.router.init(), 150);
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
    
    // Usar la API real que ya maneja el rol correctamente
    let result;
    if (window.api && typeof window.api.login === 'function') {
        result = await window.api.login(usernameOrEmail, password);
    } else {
        // Fallback solo si no existe API
        const users = JSON.parse(localStorage.getItem('fakeUsers') || '[]');
        const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
        if (user) {
            result = { 
                success: true, 
                user: { 
                    nombreusuario: user.name || user.username, 
                    correoelectronico: user.email, 
                    rol: user.role
                }
            };
        } else {
            result = { success: false, error: 'Credenciales inválidas' };
        }
    }
    
    if (loginBtn) {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
    
    if (result.success) {
        // api.js ya guardó todo en localStorage incluyendo el rol correcto
        await showSpaAndInit();
        closeLoginModal();
        const userName = localStorage.getItem('userName') || usernameOrEmail;
        showToast(`✅ Bienvenido ${userName}`);
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
        rol: isProvider ? 'proveedor' : 'restaurante',
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
        // Fallback local
        const users = JSON.parse(localStorage.getItem('fakeUsers') || '[]');
        if (users.find(u => u.email === data.correo || u.username === data.nombre_usuario)) {
            result = { success: false, error: 'El correo o usuario ya está registrado' };
        } else {
            const newUser = {
                id: users.length + 1,
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
        // Después del registro, el api.register ya hace login automático
        await showSpaAndInit();
        closeRegisterModal();
        const roleName = isProvider ? 'Proveedor' : 'Restaurante';
        showToast(`✅ Registro exitoso como ${roleName}`);
    } else {
        let errorMsg = result.error || 'Error en el registro';
        if (errorMsg.includes('unique') || errorMsg.includes('already exists'))
            errorMsg = 'El correo o nombre de usuario ya está registrado';
        showToast(errorMsg, true);
    }
}

// Funciones para modales (con IDs con prefijo landing-)
function closeLoginModal() {
    const modal = document.getElementById('landingLoginModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('landingLoginForm');
    if (form) form.reset();
}

function openLoginModal() {
    const modal = document.getElementById('landingLoginModal');
    if (modal) modal.style.display = 'flex';
    setTimeout(() => {
        const input = document.getElementById('landingLoginUsername');
        if (input) input.focus();
    }, 100);
}

function closeRegisterModal() {
    const modal = document.getElementById('landingRegisterModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('landingRegisterForm');
    if (form) form.reset();
}

function openRegisterModal() {
    const modal = document.getElementById('landingRegisterModal');
    if (modal) modal.style.display = 'flex';
}

function logout() {
    if (window.api && typeof window.api.logout === 'function') {
        window.api.logout();
    } else {
        localStorage.clear();
        window.location.reload();
    }
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
            if (answer && answer.style.display === 'block') {
                answer.style.display = 'none';
                if (icon) icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            } else if (answer) {
                answer.style.display = 'block';
                if (icon) icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        };
        q.addEventListener('click', window._faqHandler);
    });
}

// Verificar y restaurar sesión al cargar
function checkAndRestoreSession() {
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    console.log("🔍 Verificando sesión - token:", !!token, "userName:", userName, "userRole:", userRole);
    
    if (token && userName && userRole) {
        const landingWrapper = document.getElementById('landing-wrapper');
        const spaWrapper = document.getElementById('spa-wrapper');
        
        if (landingWrapper) landingWrapper.style.display = 'none';
        if (spaWrapper) spaWrapper.style.display = 'block';
        
        // Actualizar header
        const userNameSpan = document.getElementById('spaUserName');
        const userRoleSpan = document.getElementById('spaUserRole');
        if (userNameSpan) userNameSpan.innerText = userName;
        if (userRoleSpan) userRoleSpan.innerText = userRole === 'provider' ? 'Proveedor' : 'Restaurante';
        
        // Renderizar menú según rol guardado
        if (typeof window.updateRoleFromStorage === 'function') {
            window.updateRoleFromStorage();
        } else if (typeof renderMenu === 'function') {
            renderMenu();
        }
        
        // Inicializar router
        if (window.router && typeof window.router.init === 'function') {
            setTimeout(() => window.router.init(), 100);
        }
        
        return true;
    }
    return false;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 landing_spa.js inicializado");
    
    // Inicializar toggles y FAQ
    initPasswordToggles();
    initFaqAccordion();

    // Login form (landing)
    const loginForm = document.getElementById('landingLoginForm');
    if (loginForm) {
        if (window._loginHandler) loginForm.removeEventListener('submit', window._loginHandler);
        window._loginHandler = (e) => {
            e.preventDefault();
            const username = document.getElementById('landingLoginUsername')?.value;
            const password = document.getElementById('landingLoginPassword')?.value;
            handleLogin(username, password);
        };
        loginForm.addEventListener('submit', window._loginHandler);
    }

    // Register form (landing)
    const registerForm = document.getElementById('landingRegisterForm');
    if (registerForm) {
        if (window._registerHandler) registerForm.removeEventListener('submit', window._registerHandler);
        window._registerHandler = (e) => {
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
        };
        registerForm.addEventListener('submit', window._registerHandler);
    }

    // Botones de la landing
    const loginBtn = document.getElementById('landingLoginBtn');
    if (loginBtn) {
        if (window._openLoginHandler) loginBtn.removeEventListener('click', window._openLoginHandler);
        window._openLoginHandler = () => openLoginModal();
        loginBtn.addEventListener('click', window._openLoginHandler);
    }
    
    const registerHeroBtn = document.getElementById('landingOpenRegisterBtn');
    if (registerHeroBtn) {
        if (window._openRegisterHandler) registerHeroBtn.removeEventListener('click', window._openRegisterHandler);
        window._openRegisterHandler = (e) => {
            e.preventDefault();
            openRegisterModal();
        };
        registerHeroBtn.addEventListener('click', window._openRegisterHandler);
    }

    // Switches entre modales
    const switchToRegister = document.getElementById('landingSwitchToRegister');
    if (switchToRegister) {
        if (window._switchToRegisterHandler) switchToRegister.removeEventListener('click', window._switchToRegisterHandler);
        window._switchToRegisterHandler = (e) => {
            e.preventDefault();
            closeLoginModal();
            openRegisterModal();
        };
        switchToRegister.addEventListener('click', window._switchToRegisterHandler);
    }
    
    const switchToLogin = document.getElementById('landingSwitchToLogin');
    if (switchToLogin) {
        if (window._switchToLoginHandler) switchToLogin.removeEventListener('click', window._switchToLoginHandler);
        window._switchToLoginHandler = (e) => {
            e.preventDefault();
            closeRegisterModal();
            openLoginModal();
        };
        switchToLogin.addEventListener('click', window._switchToLoginHandler);
    }

    // Cerrar modales con X
    const closeLoginX = document.getElementById('landingCloseLoginBtn');
    if (closeLoginX) {
        if (window._closeLoginHandler) closeLoginX.removeEventListener('click', window._closeLoginHandler);
        window._closeLoginHandler = () => closeLoginModal();
        closeLoginX.addEventListener('click', window._closeLoginHandler);
    }
    
    const closeRegisterX = document.getElementById('landingCloseRegisterBtn');
    if (closeRegisterX) {
        if (window._closeRegisterHandler) closeRegisterX.removeEventListener('click', window._closeRegisterHandler);
        window._closeRegisterHandler = () => closeRegisterModal();
        closeRegisterX.addEventListener('click', window._closeRegisterHandler);
    }

    // Cerrar modales clickeando fuera
    window.addEventListener('click', (e) => {
        const loginModal = document.getElementById('landingLoginModal');
        const registerModal = document.getElementById('landingRegisterModal');
        if (e.target === loginModal) closeLoginModal();
        if (e.target === registerModal) closeRegisterModal();
    });

    // Botón cerrar sesión en el sidebar
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    if (logoutBtn) {
        if (window._logoutHandler) logoutBtn.removeEventListener('click', window._logoutHandler);
        window._logoutHandler = () => logout();
        logoutBtn.addEventListener('click', window._logoutHandler);
    }

    // Restaurar sesión si existe
    const sessionRestored = checkAndRestoreSession();
    if (!sessionRestored) {
        // Asegurar que el landing se vea
        const landingWrapper = document.getElementById('landing-wrapper');
        const spaWrapper = document.getElementById('spa-wrapper');
        if (landingWrapper) landingWrapper.style.display = 'block';
        if (spaWrapper) spaWrapper.style.display = 'none';
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
window.checkAndRestoreSession = checkAndRestoreSession;