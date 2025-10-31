// Script principal para Salud Quibdó
document.addEventListener('DOMContentLoaded', function() {
    // Inicialización
    initializeScrollEffects();
    initializeMobileMenu();
    initializeChatbot();
    initializeAnimations();
    loadPublicStats(); // Cargar estadísticas públicas
    
    console.log('Salud Quibdó cargado correctamente');
});

// Efectos de scroll suave
function initializeScrollEffects() {
    // Scroll suave para enlaces de navegación
    // Hacemos el selector más específico para que solo afecte a los enlaces de la barra de navegación principal.
    // Esto evita que el script interfiera con otros botones (como "Mi Panel") que inicialmente tienen un href="#".
    const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
    const header = document.querySelector('.header');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Evita errores con enlaces vacíos

            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header background on scroll
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Cambiar opacidad del header según scroll
        if (currentScroll > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// Menú móvil
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu'); // Asumiendo que ahora existe en el HTML
    // Si el botón no existe, no hacemos nada.
    if (!mobileMenuBtn) return;

    mobileMenuBtn.addEventListener('click', () => {
        // Solo intentamos acceder a mobileMenu si el botón es clickeado.
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            document.body.classList.toggle('mobile-menu-open');
        }
    });

    // Cerrar menú al hacer click en un enlace (usando delegación de eventos)
    document.body.addEventListener('click', (e) => {
        // Si el click es en un enlace dentro del menú móvil
        if (e.target.matches('.mobile-nav a')) {
            document.body.classList.remove('mobile-menu-open');
        }
        // Si el click es fuera del menú y el menú está abierto
        const isMenuOpen = document.body.classList.contains('mobile-menu-open');
        if (isMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
            document.body.classList.remove('mobile-menu-open');
        }
    }); // Cierre del addEventListener
}

// Funcionalidad del chatbot
function initializeChatbot() {
    const chatbotBtn = document.querySelector('.chatbot-button');
    const chatbotCTAs = document.querySelectorAll('.btn-white');
    
    if (chatbotBtn) {
        chatbotBtn.addEventListener('click', openChatbot);
    }
    
    chatbotCTAs.forEach(btn => {
        btn.addEventListener('click', openChatbot);
    });
    
    function openChatbot() {
        // Crear modal del chatbot
        const modal = document.createElement('div');
        modal.id = 'chatbot-modal-container'; // Usar ID para evitar duplicados
        modal.className = 'chatbot-modal-overlay';
        modal.innerHTML = `
            <div class="chatbot-modal-content">
                <div class="chatbot-header">
                    <h3>Asistente de Salud</h3>
                    <button class="chatbot-close" aria-label="Cerrar chat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="chatbot-messages">
                    <div class="chatbot-message bot-message">
                        <div class="message-content">
                            ¡Hola! Soy tu asistente de salud de Salud Quibdó. Puedo orientarte sobre síntomas o dudas generales. ¿En qué te puedo ayudar hoy?
                        </div>
                        <div class="message-time">${getCurrentTime()}</div>
                    </div>
                </div>
                <div class="chatbot-input">
                    <input type="text" placeholder="Escribe tu consulta aquí..." maxlength="500">
                    <button class="send-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
                <div class="chatbot-disclaimer">
                    <small>⚠️ Este chatbot proporciona información general. Para emergencias médicas, llama al 123.</small>
                </div>
            </div>
        `;
        
        setupChatbotStyles(modal);
        document.body.appendChild(modal);
        
        // Animar entrada
        const modalContent = modal.querySelector('.chatbot-modal-content');
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
        
        setupChatbotHandlers(modal);
    }
    
    function setupChatbotStyles(modal) {
        const style = document.createElement('style');
        style.textContent = `
            .chatbot-modal-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000; /* Asegurar que esté por encima de otros modales */
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: var(--space-4);
            }
            .chatbot-modal-content {
                background: var(--white);
                border-radius: var(--radius-xl);
                width: 100%;
                max-width: 28rem;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                box-shadow: var(--shadow-2xl);
                transform: translateY(2rem);
                transition: transform 0.3s ease;
            }
            .chatbot-header {
                padding: var(--space-6);
                border-bottom: 1px solid var(--gray-200);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chatbot-header h3 {
                margin: 0;
                color: var(--gray-900);
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-semibold);
            }
            
            .chatbot-close {
                background: none;
                border: none;
                color: var(--gray-500);
                cursor: pointer;
                padding: var(--space-2);
                border-radius: var(--radius);
                transition: all 0.2s;
            }
            
            .chatbot-close:hover {
                background: var(--gray-100);
                color: var(--gray-700);
            }
            
            .chatbot-messages {
                flex: 1;
                padding: var(--space-4);
                overflow-y: auto;
                max-height: 24rem;
                display: flex;
                flex-direction: column;
                gap: var(--space-4);
            }
            
            .chatbot-message {
                display: flex;
                flex-direction: column;
                max-width: 85%;
            }
            
            .bot-message {
                align-self: flex-start;
            }
            
            .user-message {
                align-self: flex-end;
            }
            
            .message-content {
                padding: var(--space-3) var(--space-4);
                border-radius: var(--radius-lg);
                font-size: var(--font-size-sm);
                line-height: 1.5;
            }
            
            .bot-message .message-content {
                background: var(--blue-50);
                color: var(--gray-800);
                border-bottom-left-radius: var(--space-1);
            }
            
            .user-message .message-content {
                background: var(--blue-600);
                color: var(--white);
                border-bottom-right-radius: var(--space-1);
            }
            
            .message-time {
                font-size: var(--font-size-sm);
                color: var(--gray-500);
                margin-top: var(--space-1);
                align-self: flex-start;
            }
            
            .user-message .message-time {
                align-self: flex-end;
            }
            
            .chatbot-input {
                padding: var(--space-4);
                border-top: 1px solid var(--gray-200);
                display: flex;
                gap: var(--space-3);
                align-items: center;
            }
            
            .chatbot-input input {
                flex: 1;
                padding: var(--space-3);
                border: 1px solid var(--gray-300);
                border-radius: var(--radius-lg);
                outline: none;
                font-size: var(--font-size-sm);
            }
            
            .chatbot-input input:focus {
                border-color: var(--blue-600);
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
            
            .send-btn {
                background: var(--blue-600);
                color: var(--white);
                border: none;
                padding: var(--space-3);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .send-btn:hover {
                background: var(--blue-700);
            }
            
            .send-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .chatbot-disclaimer {
                padding: var(--space-3) var(--space-4);
                background: var(--orange-50);
                border-top: 1px solid var(--gray-200);
                color: var(--orange-800);
                font-size: var(--font-size-sm);
                text-align: center;
            }
            
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-3) var(--space-4);
                background: var(--gray-100);
                border-radius: var(--radius-lg);
                margin-bottom: var(--space-3);
            }
            
            .typing-dots {
                display: flex;
                gap: var(--space-1);
            }
            
            .typing-dot {
                width: 0.375rem;
                height: 0.375rem;
                background: var(--gray-500);
                border-radius: 50%;
                animation: typingPulse 1.5s infinite;
            }
            
            .typing-dot:nth-child(2) {
                animation-delay: 0.3s;
            }
            
            .typing-dot:nth-child(3) {
                animation-delay: 0.6s;
            }
            
            @keyframes typingPulse {
                0%, 60%, 100% {
                    opacity: 0.3;
                    transform: scale(1);
                }
                30% {
                    opacity: 1;
                    transform: scale(1.2);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    function setupChatbotHandlers(modal) {
        const closeBtn = modal.querySelector('.chatbot-close');
        const input = modal.querySelector('.chatbot-input input');
        const sendBtn = modal.querySelector('.send-btn');
        const messagesContainer = modal.querySelector('.chatbot-messages');
        
        // Cerrar modal
        closeBtn.addEventListener('click', () => closeChatbotModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeChatbotModal(modal);
        });
        
        // Enviar mensaje
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        function sendMessage() {
            const message = input.value.trim();
            if (!message || sendBtn.disabled) return; // No enviar si está vacío o si ya se está esperando una respuesta
            
            // Añadir mensaje del usuario
            addMessage(message, 'user');
            input.value = ''; // Limpiar el input
            
            // Mostrar indicador de escritura
            toggleTypingIndicator(true);
            
            // Llamar al backend para obtener una respuesta de la IA
            generateBotResponse(message)
              .then(response => {
                toggleTypingIndicator(false);
                addMessage(response, 'bot');
              })
              .catch(error => {
                console.error("Error al generar respuesta del bot:", error);
                toggleTypingIndicator(false); // Asegurarse de ocultar el indicador en caso de error
                addMessage(error.message || "Lo siento, estoy teniendo problemas de conexión. Por favor, intenta de nuevo más tarde.", 'bot');
              });
        }
        
        function addMessage(content, sender) {
            const messageDiv = document.createElement('div');
        
            // SANITIZAR: Crear un nodo de texto previene la inyección de HTML.
            const tempDiv = document.createElement('div');
            tempDiv.textContent = content;
            const sanitizedContent = tempDiv.innerHTML.replace(/\n/g, '<br>');
        
            messageDiv.className = `chatbot-message ${sender}-message`;
            messageDiv.innerHTML = `
                <div class="message-content">${sanitizedContent}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function toggleTypingIndicator(show) {
            let indicator = messagesContainer.querySelector('.typing-indicator');
            if (show) {
                sendBtn.disabled = true;
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.className = 'typing-indicator';
                    indicator.innerHTML = `
                        <div class="typing-dots">
                            <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                        </div>`;
                    messagesContainer.appendChild(indicator);
                }
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                sendBtn.disabled = false;
                if (indicator) indicator.remove();
            }
        }
        
        input.focus();
    }
    
    function closeChatbotModal(modal) {
        // Limpiar cualquier temporizador pendiente al cerrar
        modal.style.opacity = '0';
        modal.querySelector('.chatbot-modal-content').style.transform = 'translateY(2rem)';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Refactorización de generateBotResponse con timeout y mensaje de espera
    async function generateBotResponse(userMessage) {
        if (!window.supabaseClient) {
            console.error("Supabase client no está disponible.");
            return Promise.reject(new Error("Error: No se pudo conectar con el servidor."));
        }
    
        const TIMEOUT_DURATION = 20000; // 20 segundos
        let waitingMessageTimeout;
    
        // Promesa para la llamada a la función de Supabase
        const fetchResponse = async () => {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            const userId = user ? user.id : 'anonymous';
    
            // Mostrar un mensaje de espera si la respuesta tarda más de 4 segundos
            waitingMessageTimeout = setTimeout(() => {
                const messagesContainer = document.querySelector('.chatbot-messages');
                if (messagesContainer.querySelector('.typing-indicator')) {
                    const waitingMessage = document.createElement('div');
                    waitingMessage.className = 'chatbot-message bot-message';
                    waitingMessage.innerHTML = `
                        <div class="message-content" style="background-color: var(--gray-100);">
                            Estoy pensando tu respuesta, dame un momento... A veces mi primer café del día tarda en hacer efecto.
                        </div>`;
                    messagesContainer.insertBefore(waitingMessage, messagesContainer.querySelector('.typing-indicator'));
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }, 4000);
    
            // Llamada a la nueva función unificada 'api' y su ruta '/chatbot'
            const { data, error } = await window.supabaseClient.functions.invoke('api/chatbot', { 
                method: 'POST', // Es importante especificar el método
                body: JSON.stringify({ message: userMessage, user_id: userId }) 
            });
    
            clearTimeout(waitingMessageTimeout); // Cancelar el mensaje de espera si la respuesta llega a tiempo
    
            if (error) throw error;
    
            return data.response || "No he podido entender tu mensaje. ¿Puedes reformularlo?";
        };
    
        // Promesa para el timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                clearTimeout(waitingMessageTimeout);
                reject(new Error("La solicitud tardó demasiado en responder. Por favor, intenta de nuevo."));
            }, TIMEOUT_DURATION);
        });
    
        // Competir entre la llamada a la API y el timeout
        return Promise.race([fetchResponse(), timeoutPromise]);
    }
}

// Animaciones al hacer scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Aplicar animaciones a elementos específicos
    const animatedElements = document.querySelectorAll(
        '.service-card, .testimonial-card, .resource-card, .stat, .coverage-item'
    );
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(2rem)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// Utilidades
function getCurrentTime() {
    return new Date().toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Contador animado para las estadísticas
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
    
    function animateCounter(element) {
        const text = element.textContent;

        // Si el texto contiene un '/', asumimos que es "24/7" y no lo animamos para evitar errores.
        if (text.includes('/')) {
            return;
        }

        const number = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/\d/g, '');
        
        if (isNaN(number)) return;
        
        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, duration / steps);
    }
}

// Inicializar contador cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(animateCounters, 1000);
});

// Service Worker para funcionalidad offline (opcional)
// El registro del Service Worker está comentado para evitar errores en el entorno de desarrollo local.
// Para activarlo, necesitarás crear un archivo 'sw.js' y servir tu proyecto desde un servidor (no abriendo el archivo HTML directamente).
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(() => console.log('Service Worker registrado'))
//             .catch(() => console.log('Error al registrar Service Worker'));
//     });
// }

// Cargar estadísticas para la página principal
async function loadPublicStats() {
    // Esperar a que el cliente de Supabase esté disponible
    if (!window.supabaseClient) {
        console.log('Supabase client not ready, retrying in 100ms...');
        setTimeout(loadPublicStats, 100);
        return;
    }

    const { data, error } = await window.supabaseClient.rpc('get_platform_stats');

    if (error) {
        console.error('Error al cargar estadísticas públicas:', error.message);
        // Los valores por defecto (o los hardcodeados si no los cambiamos) se mantendrán
        return;
    }

    const consultationsEl = document.getElementById('consultations-count');
    const doctorsEl = document.getElementById('doctors-count');

    if (consultationsEl) consultationsEl.textContent = data.total_consultations || 0;
    if (doctorsEl) doctorsEl.textContent = data.total_doctors || 0;

    animateCounters(); // Llamar a la animación después de establecer los números
}