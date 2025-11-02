// script.js - Salud Quibdó Chatbot (CORREGIDO Y FUNCIONANDO)

document.addEventListener('DOMContentLoaded', function() {
    initializeScrollEffects();
    initializeMobileMenu();
    initializeChatbot();
    initializeAnimations();
    loadPublicStats();
    console.log('Salud Quibdó cargado correctamente');
});

// === EFECTOS DE SCROLL ===
function initializeScrollEffects() {
    const navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
    const header = document.querySelector('.header');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
    });
}

// === MENÚ MÓVIL ===
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (!mobileMenuBtn) return;

    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-menu-open');
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.mobile-nav a')) {
            document.body.classList.remove('mobile-menu-open');
        }
        const isOpen = document.body.classList.contains('mobile-menu-open');
        if (isOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
            document.body.classList.remove('mobile-menu-open');
        }
    });
}

// === CHATBOT PRINCIPAL (CORREGIDO) ===
function initializeChatbot() {
    const chatbotBtn = document.querySelector('.chatbot-button');
    const chatbotCTAs = document.querySelectorAll('.btn-white');
    
    if (chatbotBtn) chatbotBtn.addEventListener('click', openChatbot);
    chatbotCTAs.forEach(btn => btn.addEventListener('click', openChatbot));

    function openChatbot() {
        if (document.getElementById('chatbot-modal-container')) return;

        const modal = document.createElement('div');
        modal.id = 'chatbot-modal-container';
        modal.className = 'chatbot-modal-overlay';
        modal.innerHTML = `
            <div class="chatbot-modal-content">
                <div class="chatbot-header">
                    <h3>Asistente de Salud</h3>
                    <button class="chatbot-close" aria-label="Cerrar chat">×</button>
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
                    <button class="send-btn">Enviar</button>
                </div>
                <div class="chatbot-disclaimer">
                    <small>Este chatbot proporciona información general. Para emergencias médicas, llama al 123.</small>
                </div>
            </div>
        `;

        setupChatbotStyles(modal);
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.chatbot-modal-content').style.transform = 'translateY(0)';
        }, 10);

        setupChatbotHandlers(modal);
    }

    function setupChatbotStyles(modal) {
        const style = document.createElement('style');
        style.textContent = `
            /* === ESTILOS DEL CHATBOT === */
            .chatbot-modal-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5); display: flex;
                align-items: center; justify-content: center;
                z-index: 1000; opacity: 0; transition: opacity 0.3s;
                padding: 1rem;
            }
            .chatbot-modal-content {
                background: white; border-radius: 1rem; width: 100%;
                max-width: 28rem; max-height: 80vh; display: flex;
                flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                transform: translateY(2rem); transition: transform 0.3s;
            }
            .chatbot-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
            .chatbot-header h3 { margin: 0; font-size: 1.125rem; font-weight: 600; }
            .chatbot-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
            .chatbot-close:hover { color: #374151; }
            .chatbot-messages { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
            .chatbot-message { display: flex; flex-direction: column; max-width: 85%; }
            .bot-message { align-self: flex-start; }
            .user-message { align-self: flex-end; }
            .message-content { padding: 0.75rem 1rem; border-radius: 1rem; font-size: 0.875rem; line-height: 1.5; }
            .bot-message .message-content { background: #dbeafe; color: #1f2937; border-bottom-left-radius: 0.25rem; }
            .user-message .message-content { background: #2563eb; color: white; border-bottom-right-radius: 0.25rem; }
            .message-time { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
            .user-message .message-time { align-self: flex-end; }
            .chatbot-input { padding: 1rem; border-top: 1px solid #e5e7eb; display: flex; gap: 0.75rem; }
            .chatbot-input input { flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 1rem; outline: none; font-size: 0.875rem; }
            .chatbot-input input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
            .send-btn { background: #2563eb; color: white; border: none; padding: 0.75rem; border-radius: 1rem; cursor: pointer; }
            .send-btn:hover { background: #1d4ed8; }
            .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .chatbot-disclaimer { padding: 0.75rem 1rem; background: #fff7ed; border-top: 1px solid #e5e7eb; color: #c2410c; font-size: 0.75rem; text-align: center; }
            .typing-indicator { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: #f3f4f6; border-radius: 1rem; }
            .typing-dots { display: flex; gap: 0.25rem; }
            .typing-dot { width: 0.375rem; height: 0.375rem; background: #6b7280; border-radius: 50%; animation: pulse 1.5s infinite; }
            .typing-dot:nth-child(2) { animation-delay: 0.3s; }
            .typing-dot:nth-child(3) { animation-delay: 0.6s; }
            @keyframes pulse { 0%,60%,100% { opacity: 0.3; transform: scale(1); } 30% { opacity: 1; transform: scale(1.2); } }
        `;
        document.head.appendChild(style);
    }

    function setupChatbotHandlers(modal) {
        const closeBtn = modal.querySelector('.chatbot-close');
        const input = modal.querySelector('.chatbot-input input');
        const sendBtn = modal.querySelector('.send-btn');
        const messagesContainer = modal.querySelector('.chatbot-messages');

        closeBtn.addEventListener('click', () => closeChatbotModal(modal));
        modal.addEventListener('click', (e) => { if (e.target === modal) closeChatbotModal(modal); });

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

        function sendMessage() {
            const message = input.value.trim();
            if (!message || sendBtn.disabled) return;

            addMessage(message, 'user');
            input.value = '';
            toggleTypingIndicator(true);

            generateBotResponse(message)
                .then(response => {
                    toggleTypingIndicator(false);
                    addMessage(response, 'bot');
                })
                .catch(error => {
                    toggleTypingIndicator(false);
                    addMessage("Lo siento, estoy teniendo problemas. Intenta de nuevo.", 'bot');
                    console.error("Error:", error);
                });
        }

        function addMessage(content, sender) {
            const div = document.createElement('div');
            div.className = `chatbot-message ${sender}-message`;
            div.innerHTML = `
                <div class="message-content">${content.replace(/\n/g, '<br>')}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
            messagesContainer.appendChild(div);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function toggleTypingIndicator(show) {
            let indicator = messagesContainer.querySelector('.typing-indicator');
            if (show) {
                sendBtn.disabled = true;
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.className = 'typing-indicator';
                    indicator.innerHTML = `<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
                    messagesContainer.appendChild(indicator);
                }
            } else {
                sendBtn.disabled = false;
                if (indicator) indicator.remove();
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        input.focus();
    }

    function closeChatbotModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('.chatbot-modal-content').style.transform = 'translateY(2rem)';
        setTimeout(() => modal.remove(), 300);
    }

    // === LLAMADA CORREGIDA A SUPABASE (SIN JSON.stringify) ===
    async function generateBotResponse(userMessage) {
        if (!window.supabaseClient) {
            throw new Error("Cliente de Supabase no disponible.");
        }

        const { data: { user } } = await window.supabaseClient.auth.getUser();
        const userId = user ? user.id : 'anonymous';

        const { data, error } = await window.supabaseClient.functions.invoke('server/chatbot', {
            body: { message: userMessage, user_id: userId }
        });

        if (error) throw error;
        return data.response || "No pude entender tu mensaje. ¿Puedes reformularlo?";
    }
}

// === ANIMACIONES ===
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.service-card, .testimonial-card, .resource-card, .stat, .coverage-item').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(2rem)';
        el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
        observer.observe(el);
    });
}

// === UTILIDADES ===
function getCurrentTime() {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                if (text.includes('/')) return;
                const number = parseInt(text.replace(/\D/g, '')) || 0;
                const suffix = text.replace(/\d/g, '');
                let current = 0;
                const increment = number / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        current = number;
                        clearInterval(timer);
                    }
                    entry.target.textContent = Math.floor(current) + suffix;
                }, 33);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

document.addEventListener('DOMContentLoaded', () => setTimeout(animateCounters, 1000));

// === ESTADÍSTICAS PÚBLICAS ===
async function loadPublicStats() {
    if (!window.supabaseClient) {
        setTimeout(loadPublicStats, 100);
        return;
    }
    const { data, error } = await window.supabaseClient.rpc('get_platform_stats');
    if (error) return console.error('Error stats:', error);

    const consultationsEl = document.getElementById('consultations-count');
    const doctorsEl = document.getElementById('doctors-count');
    if (consultationsEl) consultationsEl.textContent = data.total_consultations || 0;
    if (doctorsEl) doctorsEl.textContent = data.total_doctors || 0;
    animateCounters();
}