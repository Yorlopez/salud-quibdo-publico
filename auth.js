document.addEventListener('DOMContentLoaded', () => {
    // El cliente de Supabase ahora se inicializa en supabase-script.js y está disponible globalmente como window.supabaseClient
    // --- DOM Elements ---
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const signInBtn = document.getElementById('sign-in-btn');
    const registerBtn = document.getElementById('register-btn');
    const appointmentBtn = document.getElementById('appointment-btn');
    const volunteerBtn = document.getElementById('volunteer-btn');
    const signOutBtn = document.getElementById('sign-out-btn');

    const userSection = document.getElementById('user-section');
    const authButtons = document.getElementById('auth-buttons');
    const userNameEl = document.getElementById('user-name');
    const dashboardLink = document.getElementById('dashboard-link');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');
    const googleSignInBtnLogin = document.getElementById('google-signin-btn-login');
    const googleSignInBtnRegister = document.getElementById('google-signin-btn-register');

    const volunteerModal = document.getElementById('volunteer-modal');
    const closeVolunteerModalBtn = document.getElementById('close-volunteer-modal-btn');
    const volunteerForm = document.getElementById('volunteer-form');
    const volunteerError = document.getElementById('volunteer-error');
    const volunteerSuccess = document.getElementById('volunteer-success');

    const tabs = document.querySelectorAll('.auth-tab');
    const tabContents = document.querySelectorAll('.auth-tab-content');

    // --- Functions ---
    const openModal = (defaultTab = 'login') => {
        if (authModal) {
            authModal.style.display = 'flex';
            switchTab(defaultTab);
        }
    };

    const openVolunteerModal = () => {
        if (volunteerModal) {
            volunteerModal.style.display = 'flex';
        }
    };

    const closeModal = () => {
        if (authModal) {
            authModal.style.display = 'none';
            loginError.style.display = 'none';
            registerError.style.display = 'none';
            registerSuccess.style.display = 'none';
            loginForm.reset();
            registerForm.reset();
        }
    };

    const closeVolunteerModal = () => {
        if (volunteerModal) {
            volunteerModal.style.display = 'none';
            volunteerError.style.display = 'none';
            volunteerSuccess.style.display = 'none';
            volunteerForm.reset();
        }
    };

    const switchTab = (tabId) => {
        tabContents.forEach(content => content.style.display = 'none');
        tabs.forEach(tab => tab.classList.remove('active'));

        document.getElementById(tabId).style.display = 'block';
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    };

    const updateUI = async (user) => {
        if (user) {
            // Obtener el rol del usuario usando la función segura desde el backend
            const { data: userRole, error } = await window.supabaseClient.rpc('get_my_role_checked');
            if (error) {
                console.error("Error fetching user role:", error.message);
            }

            if (authButtons) authButtons.style.display = 'none';
            if (userSection) userSection.style.display = 'flex';
            // Intenta obtener el nombre completo de los metadatos (común con OAuth), si no, usa el email.
            if (userNameEl) userNameEl.textContent = user.user_metadata?.full_name || user.email;
            if (appointmentBtn) appointmentBtn.textContent = 'Agendar Consulta';

            // --- SOLUCIÓN DEFINITIVA: Forzar la recarga de los metadatos del usuario ---
            // El objeto 'user' de onAuthStateChange puede tener metadatos obsoletos.
            // getUser() siempre trae la información más reciente desde la base de datos.
            const { data: { user: freshUser }, error: freshUserError } = await window.supabaseClient.auth.getUser();
            if (freshUserError || !freshUser) {
                console.error("Error refreshing user data:", freshUserError?.message);
                // Si falla, continuamos con los datos que tenemos, aunque puedan estar obsoletos.
            }
            const currentUser = freshUser || user; // Usamos el usuario actualizado si está disponible.

            // --- MEJORA: Manejar el caso de médicos pendientes de aprobación ---
            const isDoctor = currentUser.user_metadata?.user_type === 'doctor';
            const isPending = currentUser.user_metadata?.verification_status === 'pending';

            if (isDoctor && isPending) {
                dashboardLink.style.display = 'inline-flex';
                dashboardLink.textContent = 'Verificación Pendiente';
                dashboardLink.href = '#'; // No lleva a ningún lado
                dashboardLink.title = 'Tu cuenta de médico está siendo revisada. Recibirás un correo cuando sea aprobada.';
                dashboardLink.style.cursor = 'help';
                return; // Salimos de la función para no aplicar la lógica de roles de abajo.
            }

            // Mostrar el enlace al panel y dirigir al correcto
            // Usamos el rol seguro que obtuvimos de la base de datos
            if (dashboardLink) {
                dashboardLink.style.display = 'inline-flex';
                if (userRole === 'admin' && dashboardLink) {
                    dashboardLink.href = 'admin.html';
                    dashboardLink.textContent = 'Panel Admin';
                } else if (userRole === 'doctor') {
                    dashboardLink.href = 'dashboard-medico.html';
                    dashboardLink.textContent = 'Mi Panel';
                } else {
                    dashboardLink.href = 'dashboard-paciente.html';
                    dashboardLink.textContent = 'Mi Panel';
                }
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userSection) userSection.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (appointmentBtn) appointmentBtn.textContent = 'Accede para agendar';
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            loginError.textContent = 'Error: ' + error.message;
            loginError.style.display = 'block';
        } else {
            closeModal();
            // No es necesario llamar a updateUI aquí.
            // El listener onAuthStateChange se encargará de actualizar la UI
            // con la información de sesión completa y correcta.
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        if (error) {
            registerError.textContent = 'Error: ' + error.message;
            registerError.style.display = 'block';
        } else {
            registerSuccess.textContent = '¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.';
            registerSuccess.style.display = 'block';
            registerForm.reset();
        }
    };

    const handleLogout = async () => {
        await window.supabaseClient.auth.signOut();
        updateUI(null);
    };

    const handleVolunteerSignUp = async (e) => {
        e.preventDefault();
        volunteerError.style.display = 'none';
        volunteerSuccess.style.display = 'none';

        const name = volunteerForm.name.value;
        const email = volunteerForm.email.value;
        const password = volunteerForm.password.value;
        const license = volunteerForm.license.value;
        const specialty = volunteerForm.specialty.value;

        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    user_type: 'doctor',
                    verification_status: 'pending', // Doctors start as pending verification
                    professional_license: license,
                    specialty: specialty,
                },
                // Añadimos esta opción para asegurar que la redirección del correo
                // de confirmación apunte al sitio desplegado, no a localhost.
                emailRedirectTo: window.location.origin,
            }
        });

        if (error) {
            volunteerError.textContent = 'Error en el registro: ' + error.message;
            volunteerError.style.display = 'block';
            return;
        }

        // On success, we don't log them in. We show a message.
        if (data.user) {
            volunteerSuccess.innerHTML = `
                <strong>¡Gracias por tu interés, ${name}!</strong>
                <p style="margin-top: 0.5rem;">Hemos recibido tu solicitud. Nuestro equipo la revisará y te contactaremos por correo electrónico una vez que tu cuenta sea verificada y activada. Este proceso puede tardar unos días.</p>
            `;
            volunteerSuccess.style.display = 'block';
            volunteerForm.reset();
            // Optionally, close the modal after a few seconds
            setTimeout(closeVolunteerModal, 8000);
        }
    };

    const handleGoogleLogin = async () => {
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    prompt: 'login',
                },
                // Asegura que la redirección después del login con Google funcione en producción.
                redirectTo: window.location.origin
            }
        });

        if (error) {
            // Muestra el error en la pestaña activa
            const activeError = document.querySelector('.auth-tab-content[style*="display: block"] .auth-error');
            if (activeError) {
                activeError.textContent = 'Error con Google: ' + error.message;
                activeError.style.display = 'block';
            }
        }
    };

    // --- Event Listeners ---
    signInBtn?.addEventListener('click', () => openModal('login'));
    registerBtn?.addEventListener('click', () => openModal('register'));
    volunteerBtn?.addEventListener('click', openVolunteerModal);
    appointmentBtn?.addEventListener('click', async (e) => {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
            window.location.href = 'index2.html';
        } else {
            openModal('login');
        }
    });

    signOutBtn?.addEventListener('click', handleLogout);
    closeModalBtn?.addEventListener('click', closeModal);
    closeVolunteerModalBtn?.addEventListener('click', closeVolunteerModal);
    window.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
        if (e.target === volunteerModal) closeVolunteerModal();
    });

    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    volunteerForm?.addEventListener('submit', handleVolunteerSignUp);
    googleSignInBtnLogin?.addEventListener('click', handleGoogleLogin);
    googleSignInBtnRegister?.addEventListener('click', handleGoogleLogin);

    // --- Initial Check ---
    window.supabaseClient.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        updateUI(user);
        // Se elimina la redirección automática para dar al usuario control sobre la navegación.
        // Después de iniciar sesión, la función updateUI mostrará el enlace correcto al panel,
        // y el usuario puede hacer clic en él cuando lo desee.
    });
});