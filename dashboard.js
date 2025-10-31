// El cliente de Supabase ahora se inicializa en supabase-script.js y está disponible globalmente como window.supabaseClient

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; border-radius: 0.5rem; color: white;
        background-color: ${type === 'error' ? '#b91c1c' : (type === 'success' ? '#047857' : '#1d4ed8')};
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; opacity: 0;
        transform: translateX(100%); transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

async function checkAuthAndRedirect(requiredPage) {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        alert('Debes iniciar sesión para ver esta página.');
        window.location.href = 'index.html';
        return null;
    }

    // Usar la función RPC segura y verificada para obtener el rol
    const { data: userRole, error: roleError } = await window.supabaseClient.rpc('get_my_role_checked');
    if (roleError) {
        alert('Error al verificar permisos. Serás redirigido.');
        window.location.href = 'index.html';
        return null;
    }
    if (requiredPage === 'dashboard-medico.html' && userRole !== 'doctor') {
        alert('Acceso denegado. Esta página es solo para médicos.');
        window.location.href = 'index.html';
        return null;
    }
    // Si la página requerida es la del paciente y el rol no es 'paciente', redirigir.
    // (Asumimos que 'paciente' es el rol por defecto si no es 'admin' o 'doctor')
    if (requiredPage === 'dashboard-paciente.html' && (userRole === 'doctor' || userRole === 'admin')) {
        window.location.href = 'index.html'; // O a la página de inicio de sesión
        return null;
    }

    return user;
}

document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    let user;

    if (path.includes('dashboard-paciente.html')) {
        user = await checkAuthAndRedirect('dashboard-paciente.html');
        if (user) {
            loadPatientDashboard(user);
            initializeHealthMonitoring();
            loadUserProfile(user, 'patient');
        }
    } else if (path.includes('dashboard-medico.html')) {
        user = await checkAuthAndRedirect('dashboard-medico.html');
        if (user) {
            loadDoctorDashboard(user);
            loadUserProfile(user, 'doctor');
            loadDoctorAvailability(user);
        }
    }
});

async function loadUserProfile(user, role) {
    const avatarEl = document.getElementById(`${role}-avatar`);
    const nameEl = document.getElementById(`${role}-name`);
    const emailEl = document.getElementById(`${role}-email`); // Only for patient

    if (nameEl) {
        nameEl.textContent = user.user_metadata?.full_name || user.email;
    }
    if (emailEl) {
        emailEl.textContent = user.email;
    }
    if (avatarEl && user.user_metadata?.avatar_url) {
        // Add a timestamp to bypass cache
        avatarEl.src = `${user.user_metadata.avatar_url}?t=${new Date().getTime()}`;
    }

    setupProfilePictureUpload(user, avatarEl);

    if (role === 'patient') {
        setupPatientHistoryView(user);
        // Hacer visible el botón de historial clínico
        const historyBtn = document.getElementById('view-my-history-btn');
        if (historyBtn) historyBtn.style.display = 'inline-flex';
    }
}

function setupProfilePictureUpload(user, avatarEl) {
    const uploadInput = document.getElementById('avatar-upload');
    if (!uploadInput) return;

    uploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        showNotification('Subiendo imagen...', 'info');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await window.supabaseClient.storage
            .from('perfiles') // Make sure you have a 'perfiles' bucket in Supabase Storage
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            showNotification(`Error al subir la imagen: ${uploadError.message}`, 'error');
            return;
        }

        // Get public URL
        const { data: urlData } = window.supabaseClient.storage
            .from('perfiles')
            .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
            showNotification('Error: No se pudo obtener la URL pública de la imagen.', 'error');
            return;
        }

        const publicURL = urlData.publicUrl;

        // Update user metadata
        const { data: updateData, error: metaError } = await window.supabaseClient.auth.updateUser({
            data: { avatar_url: publicURL }
        });

        if (metaError) {
            showNotification(`Error al actualizar perfil: ${metaError.message}`, 'error');
            return;
        }

        // Update avatar on page
        avatarEl.src = `${publicURL}?t=${new Date().getTime()}`;
        showNotification('Foto de perfil actualizada.', 'success');
    });
}

function createConsultaCard(consulta, userType = 'patient') {
    const card = document.createElement('div');
    card.className = 'consulta-card';

    const estadoClass = consulta.estado === 'pendiente' ? 'pendiente' : (consulta.estado === 'aceptada' ? 'aceptada' : 'completada');
    let footerHTML = '';

    if (userType === 'patient' && consulta.estado === 'aceptada' && consulta.meeting_link) {
        footerHTML = `
            <a href="${consulta.meeting_link}" target="_blank" class="btn-join">Unirse a la Videollamada</a>
        `;
    } else if (userType === 'patient' && consulta.estado === 'completada' && consulta.notes) {
        footerHTML = `
            <div class="notes-section"><strong>Notas del Médico:</strong> ${consulta.notes}</div>
        `;
        footerHTML += `
            <button class="btn-rate" data-consulta-id="${consulta.id}" data-doctor-id="${consulta.doctor_id}">Calificar al Médico</button>
        `;

        // Si además de completada, tiene una receta asociada
        if (consulta.recetas && consulta.recetas.length > 0) {
            footerHTML += `
            <button class="btn-view-receta" data-receta-id="${consulta.recetas[0].id}">Ver Receta</button>`;
        }
    } else if (userType === 'doctor' && consulta.estado === 'pendiente') {
        footerHTML = `
            <button class="btn-accept" data-id="${consulta.id}">Aceptar Consulta</button>
        `;
    } else if (userType === 'doctor' && consulta.estado === 'aceptada' && consulta.meeting_link) {
        footerHTML = `
            <div class="doctor-actions">
                <a href="${consulta.meeting_link}" target="_blank" class="btn-join">Iniciar Videollamada</a>
                <button class="btn-complete" data-id="${consulta.id}">Completar Consulta</button>
            </div>
        `;
    }

    // Botón para ver Historia Clínica (para doctores)
    if (userType === 'doctor') {
        footerHTML += `<button class="btn-ghost btn-view-history" data-patient-id="${consulta.user_id}">Ver Historia Clínica</button>`;
    }

    card.innerHTML = `
        <div class="consulta-card-header">
            <h3>${consulta.motivo}</h3>
            <span class="status-badge ${estadoClass}">${consulta.estado}</span>
        </div>
        <div class="consulta-card-body">
            <p><strong>Síntomas:</strong> ${consulta.sintomas}</p>
            <p><strong>Fecha Solicitud:</strong> ${new Date(consulta.fecha_solicitud).toLocaleDateString()}</p>
            <p><strong>Preferencia:</strong> ${new Date(consulta.fecha_preferida).toLocaleDateString()} a las ${consulta.hora_preferida}</p>
        </div>
        <div class="consulta-card-footer">
            ${footerHTML}
        </div>
    `;

    if (userType === 'doctor' && consulta.estado === 'pendiente') {
        card.querySelector('.btn-accept').addEventListener('click', async (e) => {
            const consultaId = e.target.dataset.id;
            acceptConsulta(consultaId);
        });
    } else if (userType === 'doctor' && consulta.estado === 'aceptada') {
        card.querySelector('.btn-complete').addEventListener('click', (e) => {
            showCompleteConsultaForm(card, consulta); // Pasamos el objeto completo
        });
    } else if (userType === 'patient' && consulta.estado === 'completada') {
        const rateBtn = card.querySelector('.btn-rate');
        if (rateBtn) {
            rateBtn.addEventListener('click', (e) => {
                const consultaId = e.target.dataset.consultaId;
                const doctorId = e.target.dataset.doctorId;
                showRatingModal(consultaId, doctorId);
            });
        }
    }

    if (userType === 'patient' && consulta.estado === 'completada' && consulta.recetas && consulta.recetas.length > 0) {
        card.querySelector('.btn-view-receta').addEventListener('click', async (e) => {
            const recetaId = e.target.dataset.recetaId;
            showRecetaModal(consulta.recetas[0]); // Pasamos el objeto de la receta
        });
    }

    if (userType === 'doctor') {
        const historyBtn = card.querySelector('.btn-view-history');
        if (historyBtn) {
            historyBtn.addEventListener('click', (e) => {
                const patientId = e.target.dataset.patientId;
                showPatientHistoryModal(patientId);
            });
        }
    }

    return card;
}

async function loadPatientDashboard(user) {
    if (!user) return;

    const container = document.getElementById('consultas-container');
    container.innerHTML = '<p>Cargando tus consultas...</p>';

    const { data, error } = await window.supabaseClient
        .from('consultas')
        .select('*, recetas(*)') // Pedimos las consultas y sus recetas asociadas
        .eq('user_id', user.id)
        .order('fecha_solicitud', { ascending: false });

    if (error) {
        container.innerHTML = `<p class="error-msg">Error al cargar las consultas: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<p>No tienes ninguna solicitud de consulta todavía.</p>';
        return;
    }

    container.innerHTML = '';
    data.forEach(consulta => {
        container.appendChild(createConsultaCard(consulta, 'patient'));
    });
}

async function loadDoctorDashboard(user) {
    if (!user) return;

    // Poblar el encabezado del perfil del doctor
    document.getElementById('doctor-name').textContent = user.user_metadata?.full_name || user.email;
    document.getElementById('doctor-specialty').textContent = user.user_metadata?.specialty || 'Especialidad no definida';

    const pendientesContainer = document.getElementById('pendientes-container');
    const aceptadasContainer = document.getElementById('aceptadas-container');

    pendientesContainer.innerHTML = '<p>Cargando consultas pendientes...</p>';
    aceptadasContainer.innerHTML = '<p>Cargando tus consultas aceptadas...</p>';

    // Cargar ambas listas de consultas en paralelo para mayor eficiencia
    const [pendientesResult, aceptadasResult] = await Promise.all([
        window.supabaseClient.from('consultas').select('*').eq('estado', 'pendiente').order('fecha_solicitud', { ascending: true }),
        window.supabaseClient.from('consultas').select('*').eq('estado', 'aceptada').eq('doctor_id', user.id).order('fecha_preferida', { ascending: true })
    ]);

    const { data: pendientes, error: pendientesError } = pendientesResult;
    if (pendientesError) {
        pendientesContainer.innerHTML = `<p class="error-msg">Error: ${pendientesError.message}</p>`;
    } else {
        document.getElementById('pending-count').textContent = pendientes.length;
        pendientesContainer.innerHTML = '';
        if (pendientes.length === 0) {
            pendientesContainer.innerHTML = '<p>No hay consultas pendientes por ahora. ¡Excelente trabajo!</p>';
        } else {
            pendientes.forEach(c => pendientesContainer.appendChild(createConsultaCard(c, 'doctor')));
        }
    }

    const { data: aceptadas, error: aceptadasError } = aceptadasResult;
    if (aceptadasError) {
        aceptadasContainer.innerHTML = `<p class="error-msg">Error: ${aceptadasError.message}</p>`;
    } else {
        document.getElementById('accepted-count').textContent = aceptadas.length;
        aceptadasContainer.innerHTML = '';
        if (aceptadas.length === 0) {
            aceptadasContainer.innerHTML = '<p>No tienes consultas programadas.</p>';
        } else {
            aceptadas.forEach(c => aceptadasContainer.appendChild(createConsultaCard(c, 'doctor')));
        }
    }
}

async function acceptConsulta(consultaId) {
    showMeetLinkModal(consultaId);
}

function showMeetLinkModal(consultaId) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    modalOverlay.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Añadir Enlace de Videollamada</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="meet-link-form">
                    <p style="color: var(--gray-600); margin-bottom: var(--space-4);">
                        Por favor, crea una videollamada (ej. Google Meet) y pega el enlace a continuación para aceptar la consulta.
                    </p>
                    <div class="form-group">
                        <label for="meet-link-input">Enlace de la videollamada</label>
                        <input type="url" id="meet-link-input" placeholder="https://meet.google.com/..." required>
                        <div class="modal-error" style="display: none;"></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-ghost close-modal">Cancelar</button>
                <button type="submit" form="meet-link-form" class="btn-primary">Aceptar y Enviar Enlace</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    const form = modalOverlay.querySelector('#meet-link-form');
    const input = modalOverlay.querySelector('#meet-link-input');
    const errorDiv = modalOverlay.querySelector('.modal-error');
    const submitBtn = modalOverlay.querySelector('button[type="submit"]');

    const closeModal = () => modalOverlay.remove();

    modalOverlay.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const meetLink = input.value.trim();

        // Validación mejorada del enlace
        try {
            const url = new URL(meetLink);
            if (url.hostname !== 'meet.google.com') {
                throw new Error("El enlace debe ser de meet.google.com");
            }
        } catch (err) {
            errorDiv.textContent = "Enlace no válido. Por favor, pega un enlace completo de Google Meet.";
            errorDiv.style.display = 'block';
            input.focus();
            return;
        }

        errorDiv.style.display = 'none';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) { showNotification('Sesión expirada. Por favor, inicia sesión de nuevo.', 'error'); closeModal(); return; }

        const { error } = await window.supabaseClient.from('consultas').update({ estado: 'aceptada', doctor_id: user.id, meeting_link: meetLink }).eq('id', consultaId);

        if (error) {
            showNotification(`Error al aceptar la consulta: ${error.message}`, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Aceptar y Enviar Enlace';
        } else {
            showNotification("¡Consulta aceptada! Se ha enviado una notificación por correo al paciente.", 'success');
            closeModal();
            loadDoctorDashboard();
        }
    });
    input.focus();
}

function showRatingModal(consultaId, doctorId) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h2>Calificar Atención</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <p>Por favor, califica la atención recibida en una escala de 1 a 5 estrellas.</p>
                <div class="rating-stars">
                    ${[...Array(5)].map((_, i) => `<span class="star" data-value="${i + 1}">&#9733;</span>`).join('')}
                </div>
                <textarea id="rating-comment" placeholder="Añade un comentario (opcional)..."></textarea>
            </div>
            <div class="modal-footer" style="justify-content: flex-end;">
                <button type="button" class="btn-ghost close-modal">Cancelar</button>
                <button type="button" id="submit-rating-btn" class="btn-primary" disabled>Enviar Calificación</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const stars = modalOverlay.querySelectorAll('.star');
    const submitBtn = modalOverlay.querySelector('#submit-rating-btn');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            stars.forEach(s => {
                s.classList.toggle('hover', s.dataset.value <= star.dataset.value);
            });
        });
        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.value);
            submitBtn.disabled = false;
            stars.forEach(s => {
                s.classList.toggle('selected', s.dataset.value <= currentRating);
            });
        });
    });

    const closeModal = () => modalOverlay.remove();
    modalOverlay.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModal));

    submitBtn.addEventListener('click', async () => {
        const comment = modalOverlay.querySelector('#rating-comment').value;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            showNotification('Debes iniciar sesión para calificar.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Calificación';
            return;
        }

        const { error } = await window.supabaseClient
            .from('calificaciones') // Assumes a 'calificaciones' table
            .insert([{
                consulta_id: consultaId,
                doctor_id: doctorId,
                paciente_id: user.id, // <-- AÑADIDO: Se envía el ID del paciente.
                puntuacion: currentRating,
                comentario: comment
            }]);

        if (error) {
            showNotification('Error al enviar la calificación: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Calificación';
        } else {
            showNotification('¡Gracias por tu calificación!', 'success');
            closeModal();
            // Optionally, disable the rate button on the card
            const rateButton = document.querySelector(`.btn-rate[data-consulta-id="${consultaId}"]`);
            if (rateButton) {
                rateButton.disabled = true;
                rateButton.textContent = 'Calificado';
            }
        }
    });
}

async function loadDoctorAvailability(user) {
    const container = document.getElementById('availability-form-container');
    if (!container) return;

    const { data, error } = await window.supabaseClient
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', user.id);

    if (error) {
        container.innerHTML = `<p class="error-msg">Error al cargar la disponibilidad: ${error.message}</p>`;
        return;
    }

    const availabilityByDay = data.reduce((acc, item) => {
        acc[item.day_of_week] = item;
        return acc;
    }, {});

    const days = [
        { name: 'Lunes', value: 1 }, { name: 'Martes', value: 2 }, { name: 'Miércoles', value: 3 },
        { name: 'Jueves', value: 4 }, { name: 'Viernes', value: 5 }, { name: 'Sábado', value: 6 },
        { name: 'Domingo', value: 0 },
    ];

    container.innerHTML = `
        <form id="availability-form" class="availability-form">
            ${days.map(day => {
                const avail = availabilityByDay[day.value];
                const isChecked = !!avail;
                const startTime = avail ? avail.start_time.substring(0, 5) : '08:00';
                const endTime = avail ? avail.end_time.substring(0, 5) : '17:00';
                return `
                    <div class="day-row">
                        <label class="day-label">
                            <input type="checkbox" class="day-checkbox" data-day="${day.value}" ${isChecked ? 'checked' : ''}>
                            <span>${day.name}</span>
                        </label>
                        <div class="time-inputs" style="${!isChecked ? 'display: none;' : ''}">
                            <input type="time" class="start-time" value="${startTime}" data-day="${day.value}">
                            <span>-</span>
                            <input type="time" class="end-time" value="${endTime}" data-day="${day.value}">
                        </div>
                    </div>
                `;
            }).join('')}
            <div class="form-actions">
                <button type="submit" class="btn-primary">Guardar Cambios</button>
            </div>
        </form>
    `;

    const form = container.querySelector('#availability-form');
    form.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const timeInputs = e.target.closest('.day-row').querySelector('.time-inputs');
            timeInputs.style.display = e.target.checked ? 'flex' : 'none';
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveDoctorAvailability(user, form);
    });
}

async function saveDoctorAvailability(user, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    const availabilityData = [];
    const daysToDelete = [];

    form.querySelectorAll('.day-row').forEach(row => {
        const checkbox = row.querySelector('.day-checkbox');
        const day = parseInt(checkbox.dataset.day);
        
        if (checkbox.checked) {
            const startTime = row.querySelector('.start-time').value;
            const endTime = row.querySelector('.end-time').value;
            if (startTime && endTime && startTime < endTime) {
                availabilityData.push({ doctor_id: user.id, day_of_week: day, start_time: startTime, end_time: endTime });
            }
        } else {
            daysToDelete.push(day);
        }
    });

    const { error: deleteError } = await window.supabaseClient.from('doctor_availability').delete().eq('doctor_id', user.id).in('day_of_week', daysToDelete);
    if (deleteError) {
        showNotification('Error al actualizar: ' + deleteError.message, 'error');
        submitBtn.disabled = false; submitBtn.textContent = 'Guardar Cambios'; return;
    }

    if (availabilityData.length > 0) {
        const { error: upsertError } = await window.supabaseClient.from('doctor_availability').upsert(availabilityData, { onConflict: 'doctor_id,day_of_week' });
        if (upsertError) {
            showNotification('Error al guardar: ' + upsertError.message, 'error');
            submitBtn.disabled = false; submitBtn.textContent = 'Guardar Cambios'; return;
        }
    }

    showNotification('Disponibilidad actualizada con éxito.', 'success');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar Cambios';
}

function showRecetaModal(receta) {
    // Crear el overlay del modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay receta-modal';

    // Crear el contenido del modal
    // Generar la lista de medicamentos
    const medicamentosHTML = receta.medicamentos.map(med => `
        <tr>
            <td>${med.nombre}</td>
            <td>${med.dosis}</td>
            <td>${med.frecuencia}</td>
        </tr>
    `).join('');

    const printableHTML = `
        <div class="receta-document">
            <div class="receta-header">
                <div class="logo">
                    <svg class="heart-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                    </svg>
                    <h1>Salud Quibdó</h1>
                </div>
                <h2>Receta Médica Digital</h2>
            </div>
            <div class="receta-info">
                <p><strong>Fecha de Emisión:</strong> ${new Date(receta.fecha_emision).toLocaleDateString()}</p>
                <p><strong>ID de Consulta:</strong> ${receta.consulta_id}</p>
            </div>
            <div class="receta-body">
                <h3>Prescripción</h3>
                <table class="medicamentos-table">
                    <thead>
                        <tr>
                            <th>Medicamento</th>
                            <th>Dosis</th>
                            <th>Frecuencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${medicamentosHTML}
                    </tbody>
                </table>
                ${receta.instrucciones_adicionales ? `
                <div class="instrucciones">
                    <h4>Instrucciones Adicionales</h4>
                    <p>${receta.instrucciones_adicionales}</p>
                </div>` : ''}
            </div>
            <div class="receta-footer">
                <p>Esta es una receta digital generada por la plataforma Salud Quibdó. Para emergencias, llame al 123.</p>
            </div>
        </div>
    `;

    modalOverlay.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>Receta Médica</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${printableHTML}
            </div>
            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button id="print-receta-btn" class="btn-primary">Imprimir / Guardar PDF</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // Funcionalidad para cerrar el modal
    const closeModal = () => modalOverlay.remove();
    modalOverlay.querySelector('.close-modal').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    modalOverlay.querySelector('#print-receta-btn').addEventListener('click', () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Receta Médica</title>');
        // Link to the main stylesheet for printing
        printWindow.document.write('<link rel="stylesheet" href="styles.css" type="text/css">');
        printWindow.document.write('</head><body style="background-color: white;">');
        printWindow.document.write(printableHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => { // Wait for content to load
            printWindow.print();
        }, 500);
    });
}

function showCompleteConsultaForm(card, consulta) {
    const footer = card.querySelector('.consulta-card-footer');
    footer.innerHTML = `
        <form class="complete-form">
            <div class="form-group">
                <label for="notes-${consulta.id}">Notas de la consulta (Resumen y diagnóstico):</label>
                <textarea id="notes-${consulta.id}" placeholder="Añade un resumen, diagnóstico y recomendaciones..." required></textarea>
            </div>

            <!-- Sección de Receta Electrónica -->
            <div class="form-group">
                <label>Receta Electrónica (opcional)</label>
                <div id="medicamentos-container">
                    <!-- Los medicamentos se añadirán aquí dinámicamente -->
                </div>
                <button type="button" id="add-medicamento-btn" class="btn-ghost" style="margin-top: 0.5rem; width: 100%; text-align: left; padding-left: 0;">+ Añadir Medicamento</button>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary">Guardar y Completar</button>
                <button type="button" class="btn-cancel">Cancelar</button>
            </div>
        </form>
    `;
    
    const form = footer.querySelector('.complete-form');
    const medicamentosContainer = footer.querySelector('#medicamentos-container');

    // Función para añadir una nueva fila de medicamento
    const addMedicamentoRow = () => {
        const row = document.createElement('div');
        row.className = 'medicamento-row';
        row.innerHTML = `
            <input type="text" class="med-nombre" placeholder="Nombre del medicamento" required style="flex: 3;">
            <input type="text" class="med-dosis" placeholder="Dosis (ej: 500mg)" required style="flex: 2;">
            <input type="text" class="med-frecuencia" placeholder="Frecuencia (ej: c/8h)" required style="flex: 2;">
            <button type="button" class="btn-reject" style="padding: 0.5rem;">X</button>
        `;
        medicamentosContainer.appendChild(row);

        row.querySelector('.btn-reject').addEventListener('click', () => {
            row.remove();
        });
    };

    footer.querySelector('#add-medicamento-btn').addEventListener('click', addMedicamentoRow);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const notes = footer.querySelector('textarea').value;

        // Recolectar medicamentos
        const medicamentos = [];
        medicamentosContainer.querySelectorAll('.medicamento-row').forEach(row => {
            const nombre = row.querySelector('.med-nombre').value;
            const dosis = row.querySelector('.med-dosis').value;
            const frecuencia = row.querySelector('.med-frecuencia').value;
            if (nombre && dosis && frecuencia) {
                medicamentos.push({ nombre, dosis, frecuencia });
            }
        });

        // 1. Crear la receta si hay medicamentos
        if (medicamentos.length > 0) {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            const { error: recetaError } = await window.supabaseClient
                .from('recetas')
                .insert([{
                    consulta_id: consulta.id,
                    paciente_id: consulta.user_id,
                    doctor_id: user.id,
                    medicamentos: medicamentos,
                }]);
            
            if (recetaError) {
                showNotification('Error al guardar la receta: ' + recetaError.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar y Completar';
                return;
            }
        }

        // 2. Completar la consulta principal
        await completeConsulta(consulta.id, notes);
    });

    footer.querySelector('.btn-cancel').addEventListener('click', () => {
        loadDoctorDashboard(); // Recarga el panel para cancelar
    });
}

async function completeConsulta(consultaId, notes) {
    const { error } = await window.supabaseClient
        .from('consultas')
        .update({
            estado: 'completada',
            notes: notes,
            // La siguiente línea causa un error porque la columna 'completed_at' no existe en tu tabla 'consultas'.
            // La solución recomendada es añadir la columna en tu base de datos de Supabase.
            // completed_at: new Date().toISOString()
        })
        .eq('id', consultaId);

    if (error) {
        showNotification(`Error al completar la consulta: ${error.message}`, 'error');
    } else {
        showNotification('Consulta completada y notas guardadas.', 'success');
        loadDoctorDashboard(); // Recargar el panel
    }
}

function initializeHealthMonitoring() {
    const metricTypeSelect = document.getElementById('metric-type');
    const metricValueFields = document.getElementById('metric-value-fields');
    const metricForm = document.getElementById('metric-form');

    if (!metricTypeSelect || !metricForm) return;

    // Función para actualizar campos del formulario según el tipo de métrica
    const updateMetricFields = () => {
        const type = metricTypeSelect.value;
        metricValueFields.innerHTML = ''; // Limpiar campos anteriores

        if (type === 'presion_arterial') {
            metricValueFields.innerHTML = `
                <div class="form-grid" style="margin-bottom: 1rem;">
                    <div class="form-group">
                        <label for="sistolica">Sistólica (mmHg)</label>
                        <input type="number" id="sistolica" name="sistolica" placeholder="120" required>
                    </div>
                    <div class="form-group">
                        <label for="diastolica">Diastólica (mmHg)</label>
                        <input type="number" id="diastolica" name="diastolica" placeholder="80" required>
                    </div>
                </div>
            `;
        } else if (type) {
            let placeholder = '';
            let label = 'Valor';
            if (type === 'glucosa') { label = 'Glucosa (mg/dL)'; placeholder = '95'; }
            if (type === 'peso') { label = 'Peso (kg)'; placeholder = '70.5'; }
            if (type === 'temperatura') { label = 'Temperatura (°C)'; placeholder = '36.6'; }

            metricValueFields.innerHTML = `
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label for="valor">${label}</label>
                    <input type="number" step="0.1" id="valor" name="valor" placeholder="${placeholder}" required>
                </div>
            `;
        }
    };

    metricTypeSelect.addEventListener('change', updateMetricFields);

    // Manejar envío del formulario
    metricForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = metricForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return;

        const tipo_metrica = metricTypeSelect.value;
        let valor;

        if (tipo_metrica === 'presion_arterial') {
            valor = {
                sistolica: document.getElementById('sistolica').value,
                diastolica: document.getElementById('diastolica').value
            };
        } else {
            valor = {
                valor: document.getElementById('valor').value
            };
        }

        const { error } = await window.supabaseClient
            .from('metricas_pacientes')
            .insert([{
                paciente_id: user.id,
                tipo_metrica: tipo_metrica,
                valor: valor
            }]);

        if (error) {
            alert('Error al guardar la métrica: ' + error.message);
        } else {
            metricForm.reset();
            metricValueFields.innerHTML = '';
            await loadMetricsHistory(); // Refrescar la lista del historial
            showNotification('Métrica guardada con éxito.', 'success');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Registro';
    });

    // Carga inicial del historial
    loadMetricsHistory();
}

async function loadMetricsHistory() {
    const historyList = document.getElementById('metrics-history-list');
    if (!historyList) return;

    historyList.innerHTML = '<p>Cargando historial...</p>';

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;

    const { data: metrics, error } = await window.supabaseClient
        .from('metricas_pacientes')
        .select('*')
        .eq('paciente_id', user.id)
        .order('fecha_registro', { ascending: false })
        .limit(10); // Limitar a los 10 más recientes para no sobrecargar

    if (error) {
        historyList.innerHTML = `<p class="error-msg">Error al cargar el historial.</p>`;
        return;
    }

    if (metrics.length === 0) {
        historyList.innerHTML = '<p>Aún no has registrado ninguna métrica.</p>';
        return;
    }

    // Configurar el gráfico dinámico
    const chartSelect = document.getElementById('chart-metric-select');
    if (chartSelect) {
        const updateChart = () => {
            const selectedMetric = chartSelect.value;
            renderHealthChart(metrics, selectedMetric);
        };
        chartSelect.addEventListener('change', updateChart);
        updateChart(); // Renderizar el gráfico inicial
    }

    historyList.innerHTML = metrics.map(metric => {
        let valorStr = '';
        if (metric.tipo_metrica === 'presion_arterial') {
            valorStr = `${metric.valor.sistolica}/${metric.valor.diastolica} mmHg`;
        } else {
            valorStr = `${metric.valor.valor}`;
            if (metric.tipo_metrica === 'glucosa') valorStr += ' mg/dL';
            if (metric.tipo_metrica === 'peso') valorStr += ' kg';
            if (metric.tipo_metrica === 'temperatura') valorStr += ' °C';
        }
        
        const tipoStr = metric.tipo_metrica.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return `
            <div class="metric-history-item">
                <div class="metric-history-info">
                    <span style="font-weight: 500;">${tipoStr}: <strong>${valorStr}</strong></span>
                    <small style="color: var(--gray-500);">${new Date(metric.fecha_registro).toLocaleString('es-CO')}</small>
                </div>
            </div>
        `;
    }).join('');
}

function renderHealthChart(metrics, metricType) {
    const ctx = document.getElementById('health-chart');
    if (!ctx) return;

    // Destruir gráfico anterior si existe para evitar duplicados
    if (window.myHealthChart) {
        window.myHealthChart.destroy();
    }

    // Filtramos y ordenamos los datos para el tipo de métrica seleccionado
    const chartMetrics = metrics
        .filter(m => m.tipo_metrica === metricType)
        .sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro)); // Ordenar por fecha ascendente

    const labels = chartMetrics.map(m => new Date(m.fecha_registro).toLocaleDateString('es-CO'));
    let datasets = [];

    if (metricType === 'presion_arterial') {
        datasets = [
            {
                label: 'Sistólica (mmHg)',
                data: chartMetrics.map(m => parseFloat(m.valor.sistolica)),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Diastólica (mmHg)',
                data: chartMetrics.map(m => parseFloat(m.valor.diastolica)),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: false,
                tension: 0.3
            }
        ];
    } else {
        let label = '';
        let color = 'rgb(37, 99, 235)';
        if (metricType === 'peso') { label = 'Peso (kg)'; color = 'rgb(37, 99, 235)'; }
        if (metricType === 'glucosa') { label = 'Glucosa (mg/dL)'; color = 'rgb(217, 119, 6)'; }
        if (metricType === 'temperatura') { label = 'Temperatura (°C)'; color = 'rgb(22, 163, 74)'; }

        datasets = [{
            label: `Evolución de ${label}`,
            data: chartMetrics.map(m => parseFloat(m.valor.valor)),
            borderColor: color,
            backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
            fill: true,
            tension: 0.3
        }];
    }

    window.myHealthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    });
}

function setupPatientHistoryView(user) {
    const viewHistoryBtn = document.getElementById('view-my-history-btn');
    if (!viewHistoryBtn) return;

    viewHistoryBtn.addEventListener('click', () => {
        showPatientHistoryModal(user.id, { readOnly: true });
    });
}

async function showPatientHistoryModal(patientId, options = {}) {
    const readOnly = options.readOnly || false;

    // 1. Obtener el perfil del paciente
    const { data: profileData, error: profileError } = await window.supabaseClient
        .from('perfiles_pacientes')
        .select('*')
        .eq('id', patientId)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { // Ignorar error si el perfil no existe aún
        showNotification('Error al cargar la historia clínica: ' + profileError.message, 'error');
        return;
    }

    // 2. Crear el modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay history-modal';

    const formatArrayForTextarea = (arr) => (arr || []).join(', ');

    modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${readOnly ? 'Mi Historia Clínica' : 'Historia Clínica del Paciente'}</h2>
                <button class="close-modal">&times;</button>
            </div>
            <form id="history-form" class="modal-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="fecha_nacimiento">Fecha de Nacimiento</label>
                        <input type="date" id="fecha_nacimiento" value="${profileData?.fecha_nacimiento || ''}" ${readOnly ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label for="genero">Género</label>
                        <input type="text" id="genero" placeholder="Masculino, Femenino, Otro" value="${profileData?.genero || ''}" ${readOnly ? 'disabled' : ''}>
                    </div>
                </div>
                <div class="form-group">
                    <label for="alergias">Alergias (separadas por coma)</label>
                    <textarea id="alergias" placeholder="Ej: Penicilina, Maní, Polvo" ${readOnly ? 'disabled' : ''}>${formatArrayForTextarea(profileData?.alergias)}</textarea>
                </div>
                <div class="form-group">
                    <label for="condiciones_preexistentes">Condiciones Preexistentes (separadas por coma)</label>
                    <textarea id="condiciones_preexistentes" placeholder="Ej: Hipertensión, Diabetes tipo 2" ${readOnly ? 'disabled' : ''}>${formatArrayForTextarea(profileData?.condiciones_preexistentes)}</textarea>
                </div>
                <div class="form-group">
                    <label for="medicamentos_actuales">Medicamentos Actuales (separados por coma)</label>
                    <textarea id="medicamentos_actuales" placeholder="Ej: Losartán 50mg, Metformina 850mg" ${readOnly ? 'disabled' : ''}>${formatArrayForTextarea(profileData?.medicamentos_actuales)}</textarea>
                </div>
                <div class="form-group">
                    <label for="historial_familiar">Historial Familiar Relevante</label>
                    <textarea id="historial_familiar" placeholder="Describa antecedentes familiares importantes" ${readOnly ? 'disabled' : ''}>${profileData?.historial_familiar || ''}</textarea>
                </div>
            </form>
            <div class="modal-footer">
                ${!readOnly ? `<button type="submit" form="history-form" class="btn-primary">Guardar Cambios</button>` : ''}
                <button type="button" class="btn-ghost close-modal">${readOnly ? 'Cerrar' : 'Cancelar'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    if (!readOnly) {
        // 3. Añadir manejadores de eventos para guardar
        const form = modalOverlay.querySelector('#history-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = modalOverlay.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';

            const parseTextareaToArray = (str) => str.split(',').map(item => item.trim()).filter(item => item);

            const profilePayload = {
                p_id: patientId,
                p_fecha_nacimiento: document.getElementById('fecha_nacimiento').value || null,
                p_genero: document.getElementById('genero').value || null,
                p_alergias: parseTextareaToArray(document.getElementById('alergias').value),
                p_condiciones_preexistentes: parseTextareaToArray(document.getElementById('condiciones_preexistentes').value),
                p_medicamentos_actuales: parseTextareaToArray(document.getElementById('medicamentos_actuales').value),
                p_historial_familiar: document.getElementById('historial_familiar').value || null
            };

            const { error: rpcError } = await window.supabaseClient
                .rpc('upsert_patient_profile', profilePayload);

            if (rpcError) {
                showNotification('Error al guardar la historia clínica: ' + rpcError.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Guardar Cambios';
            } else {
                showNotification('Historia clínica actualizada con éxito.', 'success');
                modalOverlay.remove();
            }
        });
    }

    const closeModal = () => modalOverlay.remove();
    modalOverlay.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}