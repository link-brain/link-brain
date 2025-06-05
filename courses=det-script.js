document.addEventListener('DOMContentLoaded', async function() {
    // تهيئة Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    // استيراد مكتبات Firebase
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");

    // تهيئة التطبيق
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const analytics = getAnalytics(app);

    // عناصر DOM
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        watchCoursesBtn: document.querySelector('.watch-courses-btn'),
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.querySelector('.roadmap-popup'),
        closeRoadmap: document.querySelector('.close-roadmap'),
        toggleFeatures: document.querySelectorAll('.toggle-features'),
        googleLoginBtn: document.getElementById('googleLoginBtn')
    };

    // تعيين السنة الحالية
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners();

    // وظائف القائمة المتنقلة
    function toggleMobileMenu() {
        if (!elements.navLinks || !elements.watchCoursesBtn) return;
        const isOpen = elements.navLinks.style.display === 'flex';
        elements.navLinks.style.display = isOpen ? 'none' : 'flex';
        elements.watchCoursesBtn.style.display = isOpen ? 'none' : 'block';
        elements.mobileMenuBtn.innerHTML = isOpen ?
            '<i class="fas fa-bars"></i>' :
            '<i class="fas fa-times"></i>';
    }

    function closeMobileMenu() {
        if (window.innerWidth <= 768 && elements.navLinks && elements.watchCoursesBtn) {
            elements.navLinks.style.display = 'none';
            elements.watchCoursesBtn.style.display = 'none';
            elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }

    // وظائف خارطة الطريق
    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) {
            elements.roadmapPopup.classList.toggle('active');
        }
    }

    // وظائف تبديل الميزات
    function toggleFeatures(event) {
        const toggle = event.currentTarget;
        const featuresList = toggle.nextElementSibling;
        const isActive = featuresList.classList.contains('active');

        // إغلاق جميع قوائم الميزات الأخرى
        document.querySelectorAll('.features-list').forEach(list => {
            list.classList.remove('active');
        });
        document.querySelectorAll('.toggle-features').forEach(t => {
            t.classList.remove('active');
        });

        // تبديل قائمة الميزات الحالية
        if (!isActive) {
            featuresList.classList.add('active');
            toggle.classList.add('active');
        }
    }

    // تسجيل الدخول بجوجل
    async function handleGoogleLogin() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            updateUIAfterLogin(user);
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
        }
    }

    // تحديث واجهة المستخدم بعد التسجيل
    function updateUIAfterLogin(user) {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/30'}" 
                     alt="صورة المستخدم" class="user-avatar">
                <span>${user.displayName || 'مستخدم'}</span>
                <i class="fas fa-sign-out-alt logout-icon"></i>
            `;
            
            // إضافة حدث تسجيل الخروج
            const logoutIcon = elements.googleLoginBtn.querySelector('.logout-icon');
            if (logoutIcon) {
                logoutIcon.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await signOut(auth);
                        location.reload();
                    } catch (error) {
                        console.error('خطأ في تسجيل الخروج:', error);
                    }
                });
            }
        }
    }

    // إعداد مستمعي الأحداث
    function setupEventListeners() {
        // القائمة المتنقلة
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }

        // إغلاق القائمة عند النقر على رابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // خارطة الطريق
        if (elements.viewRoadmapBtn) {
            elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
        }

        if (elements.closeRoadmap) {
            elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);
        }

        // ميزات التبديل
        elements.toggleFeatures.forEach(toggle => {
            toggle.addEventListener('click', toggleFeatures);
        });

        // تسجيل الدخول بجوجل
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
        }
    }

    // تتبع حالة المصادقة
    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
        }
    });
});
