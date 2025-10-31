// Usamos el objeto global 'supabase' que carga el script de la CDN
// El cliente de Supabase ahora se inicializa en supabase-script.js y está disponible globalmente como window.supabaseClient

document.addEventListener('DOMContentLoaded', () => {
    const consultaForm = document.getElementById('consulta-form');

    // Esta lógica maneja el envío del formulario en cualquier página donde exista.
    if (consultaForm) {
        consultaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = consultaForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            // Necesitamos el ID del usuario para asociar la solicitud.
            const { data: { user } } = await window.supabaseClient.auth.getUser();

            if (!user) {
                alert('Error: Debes iniciar sesión para enviar una solicitud. Serás redirigido.');
                window.location.href = 'index.html'; // Redirige a la página principal para iniciar sesión
                return;
            }

            const formData = {
                motivo: document.getElementById('motivo').value,
                sintomas: document.getElementById('sintomas').value,
                fecha_preferida: document.getElementById('fecha').value,
                hora_preferida: document.getElementById('hora').value,
                user_id: user.id,
                estado: 'pendiente',
                fecha_solicitud: new Date().toISOString()
            };

            // Enviar datos a la tabla 'consultas' en tu base de datos de Supabase.
            const { data, error } = await window.supabaseClient
                .from('consultas')
                .insert([formData]);

            if (error) {
                alert('Error al enviar la solicitud: ' + error.message);
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            // --- Manejo de éxito ---
            const formContainer = consultaForm.closest('.modal-content');

            if (formContainer && window.location.pathname.includes('index2.html')) {
                // Si estamos en index2.html, reemplazamos el formulario con un mensaje de éxito.
                formContainer.innerHTML = `
                    <div class="section-header" style="text-align: center;">
                        <h2 style="color: var(--green-700);">¡Solicitud Enviada!</h2>
                        <p style="font-size: var(--font-size-base); margin-top: var(--space-4);">
                            Hemos recibido tu solicitud. Uno de nuestros médicos la revisará y se pondrá en contacto contigo a través de tu correo electrónico.
                        </p>
                        <div style="margin-top: var(--space-8);">
                            <a href="index.html" class="btn-primary">Volver a la Página Principal</a>
                        </div>
                    </div>
                `;
            } else {
                // Comportamiento alternativo para una implementación en modal
                alert('¡Solicitud enviada con éxito!');
                const consultaModal = document.getElementById('consulta-modal');
                if (consultaModal) {
                    consultaModal.style.display = 'none';
                }
                consultaForm.reset();
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // --- Lógica específica para el modal (si se vuelve a usar en index.html) ---
    const consultaModal = document.getElementById('consulta-modal');
    if (consultaModal) {
        // Cierra el modal si se hace clic fuera de su contenido
        window.addEventListener('click', (e) => {
            if (e.target === consultaModal) {
                consultaModal.style.display = 'none';
            }
        });
    }
});