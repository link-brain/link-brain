document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        watchCoursesBtn: document.querySelector('.watch-courses-btn'),
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.querySelector('.roadmap-popup'),
        closeRoadmap: document.querySelector('.close-roadmap'),
        toggleFeatures: document.querySelectorAll('.toggle-features'),
        quizButtons: document.querySelectorAll('.quiz-btn'),
        loginLink: document.querySelector('.login-link'),
        chatLink: document.querySelector('.chat-link'),
        loginPopup: document.querySelector('.login-popup'),
        closeLogin: document.querySelector('.close-login'),
        chatPopup: document.querySelector('.chat-popup'),
        closeChat: document.querySelector('.close-chat'),
        loginBtn: document.querySelector('.login-btn'),
        chatSendBtn: document.querySelector('.chat-send-btn'),
        chatInput: document.querySelector('.chat-input'),
        errorMessage: document.querySelector('.error-message')
    };

    // App Logic
    const app = {
        init() {
            this.setupEventListeners();
            this.setCurrentYear();
        },

        setupEventListeners() {
            // Mobile Menu Toggle
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
            }

            // Close Menu on Link Click
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', this.closeMobileMenu);
            });

            // Roadmap Popup Toggle
            if (elements.viewRoadmapBtn) {
                elements.viewRoadmapBtn.addEventListener('click', this.toggleRoadmapPopup);
            }

            if (elements.closeRoadmap) {
                elements.closeRoadmap.addEventListener('click', this.toggleRoadmapPopup);
            }

            // Features Toggle
            elements.toggleFeatures.forEach(toggle => {
                toggle.addEventListener('click', this.toggleFeatures);
            });

            // Quiz Buttons
            elements.quizButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const language = button.parentElement.parentElement.previousElementSibling.textContent.trim();
                    window.location.href = `/quiz/${language.toLowerCase()}`;
                });
            });

            // Watch Courses Button
            if (elements.watchCoursesBtn) {
                elements.watchCoursesBtn.addEventListener('click', () => {
                    window.location.href = '/courses';
                });
            }

            // Login Popup
            if (elements.loginLink) {
                elements.loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleLoginPopup();
                });
            }

            if (elements.closeLogin) {
                elements.closeLogin.addEventListener('click', this.toggleLoginPopup);
            }

            if (elements.loginBtn) {
                elements.loginBtn.addEventListener('click', this.handleLogin);
            }

            // Chat Popup
            if (elements.chatLink) {
                elements.chatLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleChatPopup();
                });
            }

            if (elements.closeChat) {
                elements.closeChat.addEventListener('click', this.toggleChatPopup);
            }

            if (elements.chatSendBtn && elements.chatInput) {
                elements.chatSendBtn.addEventListener('click', this.handleChatMessage);
                elements.chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleChatMessage();
                });
            }
        },

        setCurrentYear() {
            if (elements.currentYear) {
                elements.currentYear.textContent = new Date().getFullYear();
            }
        },

        toggleMobileMenu() {
            if (!elements.navLinks || !elements.watchCoursesBtn) return;
            const isOpen = elements.navLinks.style.display === 'flex';
            elements.navLinks.style.display = isOpen ? 'none' : 'flex';
            elements.watchCoursesBtn.style.display = isOpen ? 'none' : 'block';
            elements.mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        },

        closeMobileMenu() {
            if (window.innerWidth <= 768 && elements.navLinks && elements.watchCoursesBtn) {
                elements.navLinks.style.display = 'none';
                elements.watchCoursesBtn.style.display = 'none';
                elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        },

        toggleRoadmapPopup() {
            if (elements.roadmapPopup) {
                elements.roadmapPopup.classList.toggle('active');
            }
        },

        toggleLoginPopup() {
            if (elements.loginPopup) {
                elements.loginPopup.classList.toggle('active');
                elements.errorMessage.textContent = '';
            }
        },

        toggleChatPopup() {
            if (elements.chatPopup) {
                elements.chatPopup.classList.toggle('active');
                elements.chatInput.value = '';
            }
        },

        handleLogin() {
            const email = document.querySelector('.login-form input[type="email"]').value;
            const password = document.querySelector('.login-form input[type="password"]').value;
            if (!email || !password) {
                elements.errorMessage.textContent = 'يرجى ملء جميع الحقول';
                return;
            }
            // Simulate login (replace with actual API call in production)
            alert('تم تسجيل الدخول بنجاح!');
            elements.loginPopup.classList.remove('active');
        },

        handleChatMessage() {
            const message = elements.chatInput.value.trim();
            if (!message) return;
            const messagesDiv = document.querySelector('.chat-messages');
            const messageP = document.createElement('p');
            messageP.textContent = `أنت: ${message}`;
            messagesDiv.appendChild(messageP);
            elements.chatInput.value = '';
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            // Simulate bot response (replace with actual chat API in production)
            setTimeout(() => {
                const botMessage = document.createElement('p');
                botMessage.textContent = 'البوت: شكرًا على رسالتك! كيف يمكنني مساعدتك أكثر؟';
                messagesDiv.appendChild(botMessage);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }, 1000);
        },

        toggleFeatures(event) {
            const toggle = event.currentTarget;
            const featuresList = toggle.nextElementSibling;
            const isActive = featuresList.classList.contains('active');

            // Close all other features lists
            document.querySelectorAll('.features-list').forEach(list => {
                list.classList.remove('active');
            });
            document.querySelectorAll('.toggle-features').forEach(t => {
                t.classList.remove('active');
            });

            // Toggle current features list
            if (!isActive) {
                featuresList.classList.add('active');
                toggle.classList.add('active');
            }
        }
    };

    // Initialize App
    app.init();
});
