function addMobileDownloadLinks(container) {
    if (!container) return;

    const links = window.TRADCONNECT_CONFIG?.mobileAppLinks || {};
    const stores = [
        ['android', 'Descargar para Android', 'fa-brands fa-google-play'],
        ['ios', 'Descargar para iPhone', 'fa-brands fa-apple']
    ];
    const anchors = stores.flatMap(([platform, label, icon]) => {
        const value = links[platform];
        if (typeof value !== 'string' || !value.trim()) return [];

        let url;
        try {
            url = new URL(value, window.location.href);
        } catch {
            console.error(`Enlace de descarga inválido para ${platform}.`);
            return [];
        }
        if (url.protocol !== 'https:') {
            console.error(`El enlace de descarga para ${platform} debe usar HTTPS.`);
            return [];
        }

        const link = document.createElement('a');
        link.className = 'mobile-app-download';
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `<i class="${icon}" aria-hidden="true"></i><span>${label}</span>`;
        return [link];
    });

    if (anchors.length) {
        container.replaceChildren(...anchors);
    }
}

window.mobile = {
    init() {
        const roleElement = document.getElementById('mobileAccessRole');
        if (roleElement) {
            const user = appUtils.readJSON('user', {});
            const roleName = typeof user.rol_nombre === 'string' && user.rol_nombre.trim()
                ? user.rol_nombre.trim()
                : 'Personal';
            roleElement.textContent = roleName;
        }
        addMobileDownloadLinks(document.getElementById('mobileAppDownloads'));
    }
};

addMobileDownloadLinks(document.getElementById('landingMobileDownloads'));
