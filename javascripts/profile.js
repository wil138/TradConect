// profile.js - Versión SPA
window.profile = {
    init: function() {
        console.log("Profile: Inicializando");
        this.setupForm();
    },
    
    setupForm: function() {
        const form = document.getElementById('profileForm');
        if (form) {
            form.addEventListener('submit', (e) => this.updateProfile(e));
        }
    },
    
    updateProfile: function(event) {
        event.preventDefault();
        const name = document.getElementById('profileName')?.value;
        const email = document.getElementById('profileEmail')?.value;
        
        console.log("Actualizando perfil:", { name, email });
        alert("Perfil actualizado correctamente");
    }
};