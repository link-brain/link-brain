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
        toggleFeatures: document.querySelectorAll('.toggle-features')
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
            elements.mobileMenuBtn.innerHTML = isOpen ?
                '<i class="fas fa-bars"></i>' :
                '<i class="fas fa-times"></i>';
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