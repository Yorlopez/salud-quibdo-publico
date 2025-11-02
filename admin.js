// El cliente de Supabase ahora se inicializa en supabase-script.js y está disponible globalmente como window.supabaseClient
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin panel script loaded.');
 
    // 1. Verificar si el usuario es un administrador usando la función segura
    const { data: userRole, error: roleError } = await window.supabaseClient.rpc('get_my_role_checked');
 
    if (roleError) {
        console.error('Error fetching user role:', roleError);
        alert('Acceso denegado. No se pudo verificar tu rol.');
        window.location.href = 'index.html';
        return;
    }
 
    console.log('User role is:', userRole);
 
    // La función RPC devolverá null si el usuario no tiene un rol o no está logueado.
    if (userRole !== 'admin') {
        alert('Acceso denegado. Esta página es solo para administradores.');
        window.location.href = 'index.html';
        return;
    }

    // Cargar estadísticas de la plataforma
    loadPlatformStats();

    // 2. Cargar los voluntarios pendientes
    loadPendingVolunteers();
});

async function loadPlatformStats() {
    const container = document.getElementById('stats-container');
    if (!container) return;

    const { data, error } = await window.supabaseClient.rpc('get_platform_stats');

    if (error) {
        container.innerHTML = `<p class="auth-error" style="display:block;">Error al cargar estadísticas: ${error.message}</p>`;
        return;
    }

    const stats = data;
    const avgRating = (stats.average_rating || 0).toFixed(1);

    container.innerHTML = `
        <div class="stat"><div class="stat-number" data-target="${stats.total_users || 0}">0</div><div class="stat-label">Usuarios Totales</div></div>
        <div class="stat"><div class="stat-number" data-target="${stats.total_doctors || 0}">0</div><div class="stat-label">Médicos Aprobados</div></div>
        <div class="stat"><div class="stat-number" data-target="${stats.total_patients || 0}">0</div><div class="stat-label">Pacientes Registrados</div></div>
        <div class="stat"><div class="stat-number" data-target="${stats.total_consultations || 0}">0</div><div class="stat-label">Consultas Totales</div></div>
        <div class="stat"><div class="stat-number" data-target="${stats.pending_consultations || 0}">0</div><div class="stat-label">Consultas Pendientes</div></div>
        <div class="stat"><div class="stat-number" data-target="${stats.completed_consultations || 0}">0</div><div class="stat-label">Consultas Completadas</div></div>
        <div class="stat"><div class="stat-number" data-target="${avgRating}">0.0</div><div class="stat-label">Calificación Promedio ★</div></div>
    `;

    // Animate counters
    document.querySelectorAll('.stat-number').forEach(animateCounter);
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    if (isNaN(target)) {
        element.textContent = element.dataset.target;
        return;
    }
    
    const duration = 1500;
    let start = 0;
    const isFloat = target % 1 !== 0;
    const stepTime = 16; // ~60fps
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = isFloat ? target.toFixed(1) : target;
            clearInterval(timer);
        } else {
            element.textContent = isFloat ? start.toFixed(1) : Math.floor(start);
        }
    }, stepTime);
}

async function loadPendingVolunteers() {
    const container = document.getElementById('admin-container');
    container.innerHTML = '<p>Cargando voluntarios pendientes...</p>';

    // Obtener el token de sesión del usuario admin actual
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const accessToken = session?.access_token;

        const response = await fetch(`${window.SUPABASE_URL}/functions/v1/api/volunteers/pending`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const { volunteers: data, error } = await response.json(); // Esto puede fallar si la respuesta no es JSON
            if (error) {
        container.innerHTML = `<p class="auth-error" style="display:block;">Error al cargar voluntarios: ${error.message}</p>`;
        return;
    }

            if (!data || data.length === 0) {
        container.innerHTML = '<p>No hay voluntarios pendientes de aprobación en este momento.</p>';
        return;
    }

    // 3. Crear y mostrar la tabla con los datos
    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Licencia Profesional</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(volunteer => `
                <tr data-id="${volunteer.user_id}">
                    <td>${volunteer.full_name || 'No especificado'}</td>
                    <td>${volunteer.email}</td>
                    <td>${volunteer.specialty}</td>
                    <td>${volunteer.license}</td>
                    <td class="action-cell">
                        <button class="btn-approve">Aprobar</button>
                        <button class="btn-reject">Rechazar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);

    // 4. Añadir funcionalidad a los botones de "Aprobar"
    document.querySelectorAll('.btn-approve').forEach(button => {
        button.addEventListener('click', async (e) => {
            const row = e.target.closest('tr');
            const volunteerId = row.dataset.id;
            
            e.target.disabled = true;
            e.target.textContent = 'Aprobando...';

            await approveVolunteer(volunteerId, e.target);
        });
    });

    document.querySelectorAll('.btn-reject').forEach(button => {
        button.addEventListener('click', async (e) => {
            const row = e.target.closest('tr');
            const volunteerId = row.dataset.id;
            const volunteerName = row.cells[0].textContent;

            if (confirm(`¿Estás seguro de que quieres rechazar y eliminar la solicitud de ${volunteerName}? Esta acción no se puede deshacer.`)) {
                e.target.disabled = true;
                e.target.textContent = 'Rechazando...';
                row.querySelector('.btn-approve').disabled = true;

                await rejectVolunteer(volunteerId, e.target);
            }
        });
    });
}

async function approveVolunteer(volunteerId, buttonElement) {
    // Llamar a la función segura que creamos para aprobar
    const { error } = await window.supabaseClient.rpc('approve_volunteer', { volunteer_id: volunteerId });

    if (error) {
        alert(`Error al aprobar voluntario: ${error.message}`);
        buttonElement.disabled = false;
        buttonElement.textContent = 'Aprobar';
    } else {
        alert('¡Voluntario aprobado con éxito!');
        buttonElement.closest('tr').remove(); // Eliminar la fila de la tabla
        if (document.querySelector('.admin-table tbody').rows.length === 0) {
            loadPendingVolunteers(); // Recargar para mostrar el mensaje de "no hay pendientes"
        }
        // Forzar la actualización de la sesión para todos los clientes.
        // Esto asegura que si el médico aprobado tiene la app abierta,
        // su rol se actualizará sin necesidad de volver a iniciar sesión.
        await window.supabaseClient.auth.refreshSession();
    }
}

async function rejectVolunteer(volunteerId, buttonElement) {
    // Llamar a la función segura que creamos para rechazar
    const { error } = await window.supabaseClient.rpc('reject_volunteer', { volunteer_id: volunteerId });

    if (error) {
        alert(`Error al rechazar voluntario: ${error.message}`);
        buttonElement.disabled = false;
        buttonElement.textContent = 'Rechazar';
        buttonElement.closest('tr').querySelector('.btn-approve').disabled = false;
    } else {
        alert('¡Voluntario rechazado y eliminado con éxito!');
        buttonElement.closest('tr').remove(); // Eliminar la fila de la tabla
        if (document.querySelector('.admin-table tbody').rows.length === 0) {
            loadPendingVolunteers(); // Recargar para mostrar el mensaje de "no hay pendientes"
        }
    }
}