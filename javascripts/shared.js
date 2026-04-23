// Shared methods for inventory and invoices

// Render the sidebar
function renderSidebar(roleText) {
    return `
        <div class="sidebar">
            <div class="institucion">
                <div class="logo">
                    <div class="logocolor">
                        <span class="iniciallogo">CC</span>
                    </div>
                    <span class="nombrelogo">Commerce</span>
                    <span class="nombrelogo">Conect</span>
                </div>
            </div>
            <div class="rol-selector" onclick="ToggleRole()">
                <span id="role-text">modo: ${roleText}</span>
            </div>
            <div id="menu"></div>
        </div>
    `;
}

// Render the header
function renderHeader() {
    return `
        <header class="main-header">
            <div class="header-top">
                <button class="menu-btn" id="renderMenu" onclick="toggleMenu()">☰</button>
                <div class="search-container">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Buscar en Commerce Connect...">
                </div>
                <div class="user-actions">
                    <i class="far fa-bell"></i>
                    <div class="user-profile">
                        <div class="user-info-text">
                            <span class="user-name">Juan Pérez</span>
                            <span class="user-status">Premium</span>
                        </div>
                        <div class="user-avatar">JP</div>
                    </div>
                </div>
            </div>
        </header>
    `;
}
// html
{/* <script src="javascripts/shared.js"></script>
    <script>
        document.body.insertAdjacentHTML('afterbegin', renderSidebar('proveedor'));
        document.querySelector('.main').insertAdjacentHTML('afterbegin', renderHeader());
    </script> */}