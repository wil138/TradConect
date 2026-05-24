// landing_spa.js - Versión corregida (TODO en una sola página)
// Helper toast
const toastEl = document.getElementById('toastMessage');
const toastText = document.getElementById('toastText');

function showToast(msg, isErr = false) {
    if (!toastEl) return;
    toastText.innerText = msg;
    toastEl.style.display = 'flex';
    toastEl.style.backgroundColor = isErr ? '#dc2626' : '#2563eb';
    setTimeout(() => toastEl.style.display = 'none', 3000);
}

// Elementos
const landingWrapper = document.getElementById('landing-wrapper');
const spaWrapper = document.getElementById('spa-wrapper');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const footer = document.querySelector('.modern-footer');

// Función para mostrar la SPA e inicializarla (sin redirección)
async function showSpaAndInit(userName, userRole, userData = null) {
    // Ocultar landing, mostrar SPA
    if (landingWrapper) landingWrapper.style.display = 'none';
    if (spaWrapper) spaWrapper.style.display = 'block';
    if (footer) footer.style.display = 'block';

    // Actualizar header de SPA
    const userNameSpan = document.getElementById('spaUserName');
    const userRoleSpan = document.getElementById('spaUserRole');
    if (userNameSpan) userNameSpan.textContent = userName;
    if (userRoleSpan) userRoleSpan.textContent = userRole === 'provider' ? 'Proveedor' : 'Cliente';

    // Actualizar localStorage
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    if (userData?.email) localStorage.setItem('userEmail', userData.email);
    if (userData?.empresa) localStorage.setItem('userEmpresa', JSON.stringify(userData.empresa));

    // Forzar actualización del menú y elementos condicionales
    if (typeof window.ToggleRole === 'function') {
        window.currentRole = userRole;
        if (typeof renderMenu === 'function') renderMenu();
        if (typeof updateConditionalElements === 'function') updateConditionalElements();
        if (typeof updateHeaderRoleText === 'function') updateHeaderRoleText();
    }

    // Inicializar router si es necesario
    if (window.router && typeof window.router.cargarModulo === 'function') {
        const moduloInicial = userRole === 'client' ? 'marketplace' : 'dashboard';
        // Pequeño retraso para permitir que el DOM se actualice
        setTimeout(() => {
            window.router.cargarModulo(moduloInicial);
        }, 50);
    } else {
        console.error('Router no disponible');
    }

    // Actualizar contador del carrito
    if (typeof updateCartCount === 'function') updateCartCount();
}

function closeLoginModal() { 
    if (loginModal) loginModal.style.display = 'none'; 
}

function openLoginModal() { 
    if (loginModal) loginModal.style.display = 'flex'; 
}

function closeRegisterModal() { 
    if (registerModal) registerModal.style.display = 'none'; 
}

function openRegisterModal() { 
    if (registerModal) registerModal.style.display = 'flex'; 
}

// ========================================
// LOGIN CON API
// ========================================
async function handleLogin(email, password) {
    const result = await window.api.login(email, password);
    
    if (result.success) {
        await showSpaAndInit(result.user.username, result.user.role, result.user);
        closeLoginModal();
        showToast(`✅ Bienvenido ${result.user.username}`);
    } else {
        showToast(result.error, true);
    }
}

// ========================================
// REGISTRO CON API
// ========================================
async function handleRegister(userData, isProvider) {
    const data = {
        nombre_usuario: userData.nombre_usuario,
        correo: userData.correo,
        contrasena: userData.contrasena,
        razon_social: userData.razon_social,
        ruc: userData.ruc || `TEMP${Date.now()}`,
        telefono: userData.telefono || '',
        correo_empresa: userData.correo,
        direccion_fiscal: userData.direccion_fiscal || '',
        rol: isProvider ? 'provider' : 'client'
    };
    
    const result = await window.api.register(data);
    
    if (result.success) {
        await showSpaAndInit(result.user.username, result.user.role, result.user);
        closeRegisterModal();
        showToast(`🎉 Registro exitoso como ${isProvider ? 'Proveedor' : 'Cliente'}. ¡Bienvenido!`);
    } else {
        showToast(result.error, true);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

// Login
document.getElementById('loginFormModal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmailModal').value.trim();
    const pwd = document.getElementById('loginPasswordModal').value.trim();
    if (!email.includes('@') || pwd.length < 4) {
        showToast('Credenciales inválidas', true);
        return;
    }
    handleLogin(email, pwd);
});

// Registro
document.getElementById('registerFormModal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regNameModal').value.trim();
    const email = document.getElementById('regEmailModal').value.trim();
    const userType = document.getElementById('regTypeModal').value;
    const pwd = document.getElementById('regPasswordModal').value;
    const confirm = document.getElementById('regConfirmModal').value;
    const phone = document.getElementById('regPhoneModal')?.value.trim() || '';

    if (!name || !email || !userType || !pwd) { 
        showToast('Completa todos los campos obligatorios', true); 
        return; 
    }
    if (!email.includes('@')) { 
        showToast('Correo inválido', true); 
        return; 
    }
    if (pwd !== confirm) { 
        showToast('Las contraseñas no coinciden', true); 
        return; 
    }
    if (pwd.length < 4) { 
        showToast('La contraseña debe tener al menos 4 caracteres', true); 
        return; 
    }

    const userData = {
        nombre_usuario: email.split('@')[0],
        correo: email,
        contrasena: pwd,
        razon_social: name,
        telefono: phone,
        ruc: `TEMP${Date.now()}`
    };

    handleRegister(userData, userType === 'proveedor');
});

// Botones landing
document.getElementById('loginBtnLanding')?.addEventListener('click', openLoginModal);
document.getElementById('openRegisterBtnHero')?.addEventListener('click', (e) => {
    e.preventDefault();
    openRegisterModal();
});
document.getElementById('supplierInfoBtn')?.addEventListener('click', () => {
    showToast('🔹 ¿Eres proveedor? Regístrate y accede a cientos de restaurantes.');
    openRegisterModal();
});
document.getElementById('switchToRegisterLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeLoginModal();
    openRegisterModal();
});
document.getElementById('closeModalBtn')?.addEventListener('click', closeLoginModal);
document.getElementById('closeRegisterModalBtn')?.addEventListener('click', closeRegisterModal);

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => { 
    if(e.target === loginModal) closeLoginModal();
    if(e.target === registerModal) closeRegisterModal();
});

// Contacto
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('📩 Mensaje enviado. Nos pondremos en contacto pronto.');
    e.target.reset();
});

// Cerrar sesión desde el header SPA
document.getElementById('logoutButtonSpa')?.addEventListener('click', () => {
    window.api.logout();
    // Mostrar landing nuevamente
    if (landingWrapper) landingWrapper.style.display = 'block';
    if (spaWrapper) spaWrapper.style.display = 'none';
    showToast('👋 Sesión cerrada correctamente');
});

// ========================================
// VERIFICAR SESIÓN EXISTENTE
// ========================================
async function checkExistingSession() {
    const token = localStorage.getItem('access_token');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userName) {
        try {
            // Verificar que el token sigue siendo válido
            const profile = await window.api.getProfile();
            await showSpaAndInit(userName, userRole, profile);
        } catch (error) {
            // Token inválido, limpiar y mostrar landing
            window.api.logout();
            if (landingWrapper) landingWrapper.style.display = 'block';
            if (spaWrapper) spaWrapper.style.display = 'none';
        }
    } else {
        if (landingWrapper) landingWrapper.style.display = 'block';
        if (spaWrapper) spaWrapper.style.display = 'none';
    }
}

// Iniciar verificación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Asegurar que el footer siempre visible
    if (footer) footer.style.display = 'block';
    checkExistingSession();
});