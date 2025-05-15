document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM الرئيسية
    const elements = {
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        authButtons: document.querySelector('.auth-buttons'),
        currentYear: document.querySelector('.current-year')
    };

    // تطبيق إدارة القائمة المتنقلة
    const app = {
        init() {
            this.setupEventListeners();
            this.setCurrentYear();
        },

        setupEventListeners() {
            // القائمة المتنقلة
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
            }

            // إغلاق القائمة عند النقر على رابط
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', this.closeMobileMenu);
            });
        },

        setCurrentYear() {
            if (elements.currentYear) {
                elements.currentYear.textContent = new Date().getFullYear();
            }
        },

        toggleMobileMenu() {
            if (!elements.navLinks || !elements.authButtons) return;
            const isOpen = elements.navLinks.style.display === 'flex';
            elements.navLinks.style.display = isOpen ? 'none' : 'flex';
            elements.authButtons.style.display = isOpen ? 'none' : 'flex';
            elements.mobileMenuBtn.innerHTML = isOpen ?
                '<i class="fas fa-bars"></i>' :
                '<i class="fas fa-times"></i>';
        },

        closeMobileMenu() {
            if (window.innerWidth <= 768 && elements.navLinks && elements.authButtons) {
                elements.navLinks.style.display = 'none';
                elements.authButtons.style.display = 'none';
                elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    };

    // بدء التطبيق
    app.init();
});