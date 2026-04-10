function updateProfile(event) {
    event.preventDefault();
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    
    // Simulación de guardado
    console.log("Actualizando perfil:", { name, email });
    alert("Perfil actualizado correctamente");
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', updateProfile);
    }
});