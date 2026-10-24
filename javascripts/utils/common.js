// Utilidades compartidas por los m?dulos de la aplicaci?n.
window.appUtils = {
    readJSON(key, fallback = null) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            if (value === null) return fallback;
            if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
            if (fallback && !Array.isArray(fallback) && typeof fallback === 'object' &&
                (typeof value !== 'object' || Array.isArray(value))) return fallback;
            return value;
        } catch { return fallback; }
    },
    currencySymbol(currencyId = null) {
        const selected = String(currencyId || localStorage.getItem('marketplaceCurrency') || 1);
        const currency = this.readJSON('catalogos', {}).monedas?.find(item => String(item.id) === selected);
        return currency?.simbolo || 'C$';
    },
    money(value, currencyId = null) { return this.currencySymbol(currencyId) + Number(value || 0).toFixed(2); },
    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
    },
    showToast(message, type = 'success') {
        const toast = document.getElementById('toastMessage');
        const text = document.getElementById('toastText');
        if (!toast || !text) { console.info(message); return; }
        text.textContent = message;
        toast.style.display = 'flex';
        toast.style.background = ({ error: '#dc2626', warning: '#f59e0b', info: '#3b82f6' })[type] || '#10b981';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
};
