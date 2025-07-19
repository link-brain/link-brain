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
    let firebaseInitialized = false;
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
        const { getFirestore, collection, getDocs, doc, setDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
        const DOMPurify = await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js");

        // تهيئة التطبيق
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const analytics = getAnalytics(app);
        const db = getFirestore(app);
        firebaseInitialized = true;

        // عناصر DOM
        const elements = {
            currentYear: document.querySelector('.current-year'),
            mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
            navLinks: document.querySelector('.nav-links'),
            viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
            roadmapPopup: document.querySelector('#roadmapPopup'),
            closeRoadmap: document.querySelector('#closeRoadmap'),
            googleLoginBtn: document.getElementById('googleLoginBtn'),
            chatBtn: document.getElementById('chatBtn'),
            chatPopup: document.getElementById('chatPopup'),
            closeChat: document.getElementById('closeChat'),
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            sendMessageBtn: document.getElementById('sendMessageBtn'),
            chatLoading: document.getElementById('chatLoading'),
            loadMoreBtn: document.getElementById('loadMoreBtn'),
            languageSections: document.querySelectorAll('.language-section'),
            ratingStars: document.querySelectorAll('.rating-stars i'),
            featuresButtons: document.querySelectorAll('.features-btn'),
            featuresPopup: document.getElementById('featuresPopup'),
            closeFeatures: document.getElementById('closeFeatures'),
            featuresList: document.getElementById('featuresList')
        };

        // التحقق من وجود العناصر
        if (!elements.googleLoginBtn || !elements.chatBtn || !elements.featuresPopup || !elements.chatPopup || !elements.roadmapPopup) {
            console.error('عناصر DOM مفقودة:', {
                googleLoginBtn: !!elements.googleLoginBtn,
                chatBtn: !!elements.chatBtn,
                featuresPopup: !!elements.featuresPopup,
                chatPopup: !!elements.chatPopup,
                roadmapPopup: !!elements.roadmapPopup
            });
            showToast('خطأ في تحميل واجهة المستخدم، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }

        // تعيين السنة الحالية
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }

        // إظهار رسالة تأكيد عائمة
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 3000);
            }, 100);
        }

        // متغيرات لتتبع الصفحات والتقييمات
        let lastVisible = null;
        let unsubscribeMessages = null;
        const messagesPerPage = 20;
        let hasMoreMessages = true;
        let unsubscribeRatings = {};

        // إعداد علامات التبويب بشكل مستقل لكل قسم
        function setupTabs() {
            elements.languageSections.forEach(section => {
                const tabs = section.querySelectorAll('.tab');
                const tabContents = section.querySelectorAll('.tab-content');
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        tabs.forEach(t => t.classList.remove('active'));
                        tabContents.forEach(c => c.classList.remove('active'));
                        tab.classList.add('active');
                        const contentId = tab.getAttribute('data-tab');
                        const contentElement = section.querySelector(`#${contentId}`);
                        if (contentElement) {
                            contentElement.classList.add('active');
                            tab.setAttribute('aria-selected', 'true');
                            tabs.forEach(t => {
                                if (t !== tab) t.setAttribute('aria-selected', 'false');
                            });
                        } else {
                            console.error('عنصر المحتوى مفقود:', contentId);
                            showToast('خطأ في تحميل المحتوى', 'error');
                        }
                    });
                });
                // إظهار أول علامة تبويب بشكل افتراضي
                if (tabs.length > 0 && tabContents.length > 0) {
                    tabs[0].classList.add('active');
                    tabContents[0].classList.add('active');
                    tabs[0].setAttribute('aria-selected', 'true');
                }
            });
        }

        // تحميل الموارد لكل قسم
        async function loadResources() {
            try {
                const sections = {
                    'html-videos': 'html_videos',
                    'html-websites': 'html_websites',
                    'html-quizzes': 'html_quizzes',
                    'css-videos': 'css_videos',
                    'css-websites': 'css_websites',
                    'css-quizzes': 'css_quizzes',
                    'js-videos': 'js_videos',
                    'js-websites': 'js_websites',
                    'js-quizzes': 'js_quizzes'
                };
                for (const [tabId, collectionName] of Object.entries(sections)) {
                    const tabContent = document.getElementById(tabId);
                    if (!tabContent) continue;
                    const resourceGrid = tabContent.querySelector('.resource-grid');
                    resourceGrid.innerHTML = '<div class="chat-loading active">جاري تحميل الموارد...</div>';
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    resourceGrid.innerHTML = '';
                    if (querySnapshot.empty) {
                        resourceGrid.innerHTML = '<p>لا توجد موارد متاحة حاليًا</p>';
                        continue;
                    }
                    querySnapshot.forEach(doc => {
                        const resource = doc.data();
                        const resourceElement = document.createElement('div');
                        resourceElement.classList.add('resource-card');
                        resourceElement.dataset.resourceId = doc.id;
                        resourceElement.innerHTML = `
                            <div class="resource-content">
                                <h4><a href="${resource.url || '#'}" target="_blank">${DOMPurify.sanitize(resource.title)}</a></h4>
                                <p>${DOMPurify.sanitize(resource.description)}</p>
                                <div class="rating-stars">
                                    <i class="fas fa-star" data-value="1"></i>
                                    <i class="fas fa-star" data-value="2"></i>
                                    <i class="fas fa-star" data-value="3"></i>
                                    <i class="fas fa-star" data-value="4"></i>
                                    <i class="fas fa-star" data-value="5"></i>
                                    <span class="average-rating">0</span>
                                    <span class="rating-count">(0)</span>
                                </div>
                                <button class="features-btn" data-features="${DOMPurify.sanitize(resource.features?.join('\n') || '')}">عرض الميزات</button>
                            </div>
                        `;
                        resourceGrid.appendChild(resourceElement);
                    });
                }
            } catch (error) {
                console.error('خطأ في تحميل الموارد:', error);
                showToast('فشل في تحميل الموارد', 'error');
            }
        }

        // إعداد مستمعي الأحداث
        function setupEventListeners() {
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            }
            if (elements.viewRoadmapBtn) {
                elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
            }
            if (elements.closeRoadmap) {
                elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);
            }
            if (elements.googleLoginBtn) {
                elements.googleLoginBtn.addEventListener('click', handleAuth);
            }
            if (elements.chatBtn) {
                elements.chatBtn.addEventListener('click', toggleChatPopup);
            }
            if (elements.closeChat) {
                elements.closeChat.addEventListener('click', toggleChatPopup);
            }
            if (elements.sendMessageBtn) {
                elements.sendMessageBtn.addEventListener('click', sendMessage);
            }
            if (elements.messageInput) {
                elements.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });
            }
            if (elements.loadMoreBtn) {
                elements.loadMoreBtn.addEventListener('click', loadMessages);
            }
            elements.ratingStars.forEach(star => {
                star.addEventListener('click', handleRating);
                star.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRating(e);
                    }
                });
            });
            elements.featuresButtons.forEach(button => {
                button.addEventListener('click', showFeaturesPopup);
            });
            if (elements.closeFeatures) {
                elements.closeFeatures.addEventListener('click', toggleFeaturesPopup);
            }
            onAuthStateChanged(auth, handleAuthStateChanged);
            window.addEventListener('resize', closeMobileMenu);
        }

        // وظائف القائمة المتنقلة
        function toggleMobileMenu() {
            if (!elements.navLinks) return;
            const isOpen = elements.navLinks.classList.contains('active');
            elements.navLinks.classList.toggle('active');
            elements.mobileMenuBtn.innerHTML = isOpen ?
                '<i class="fas fa-bars" aria-label="فتح القائمة"></i>' :
                '<i class="fas fa-times" aria-label="إغلاق القائمة"></i>';
        }

        function closeMobileMenu() {
            if (window.innerWidth <= 768 && elements.navLinks) {
                elements.navLinks.classList.remove('active');
                if (elements.mobileMenuBtn) {
                    elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars" aria-label="فتح القائمة"></i>';
                }
            }
        }

        // وظائف خارطة الطريق
        function toggleRoadmapPopup() {
            if (elements.roadmapPopup) {
                const isActive = elements.roadmapPopup.classList.toggle('active');
                elements.roadmapPopup.setAttribute('aria-hidden', !isActive);
                if (isActive) {
                    elements.roadmapPopup.focus();
                }
            } else {
                console.error('نافذة خارطة الطريق مفقودة');
                showToast('خطأ في تحميل خارطة الطريق', 'error');
            }
        }

        // وظائف الميزات
        function showFeaturesPopup(event) {
            const features = event.target.getAttribute('data-features')?.split('\n') || [];
            if (features.length === 0) {
                showToast('لا توجد ميزات متاحة', 'error');
                return;
            }
            elements.featuresList.innerHTML = features.map(feature => `<li>${DOMPurify.sanitize(feature)}</li>`).join('');
            toggleFeaturesPopup();
        }

        function toggleFeaturesPopup() {
            if (elements.featuresPopup) {
                const isActive = elements.featuresPopup.classList.toggle('active');
                elements.featuresPopup.setAttribute('aria-hidden', !isActive);
            } else {
                console.error('نافذة الميزات مفقودة');
                showToast('خطأ في تحميل الميزات', 'error');
            }
        }

        // وظائف المصادقة
        async function handleAuth() {
            if (!firebaseInitialized) {
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                console.error('Firebase غير مهيأ');
                return;
            }

            const user = auth.currentUser;
            try {
                if (user) {
                    await signOut(auth);
                    showToast('تم تسجيل الخروج بنجاح', 'success');
                } else {
                    await signInWithPopup(auth, provider);
                    showToast(`مرحبًا، ${DOMPurify.sanitize(auth.currentUser?.displayName || 'مستخدم')}!`, 'success');
                    elements.googleLoginBtn.classList.add('login-animation');
                    setTimeout(() => elements.googleLoginBtn.classList.remove('login-animation'), 500);
                }
            } catch (error) {
                console.error('خطأ في عملية المصادقة:', error.code, error.message);
                if (error.code === 'auth/network-request-failed') {
                    showToast('فشل الاتصال بالشبكة، يرجى التحقق من الإنترنت', 'error');
                } else if (error.code === 'auth/popup-closed-by-user') {
                    showToast('تم إغلاق نافذة تسجيل الدخول', 'error');
                } else {
                    showToast('حدث خطأ أثناء تسجيل الدخول/الخروج', 'error');
                }
            }
        }

        function handleAuthStateChanged(user) {
            if (!elements.googleLoginBtn) return;
            try {
                if (user) {
                    elements.googleLoginBtn.innerHTML = `
                        <img src="${user.photoURL || 'https://via.placeholder.com/30'}" alt="صورة المستخدم" class="user-avatar">
                        <span>${DOMPurify.sanitize(user.displayName || 'مستخدم')}</span>
                        <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>
                    `;
                    elements.googleLoginBtn.classList.add('user-logged-in');
                    initializeRatings();
                    initializeChat();
                    loadResources();
                } else {
                    elements.googleLoginBtn.innerHTML = `
                        <i class="fab fa-google"></i> تسجيل الدخول
                    `;
                    elements.googleLoginBtn.classList.remove('user-logged-in');
                    clearRatingsUI();
                    if (unsubscribeMessages) {
                        unsubscribeMessages();
                        unsubscribeMessages = null;
                    }
                }
            } catch (error) {
                console.error('خطأ في معالجة حالة المصادقة:', error);
                showToast('خطأ في تحديث حالة تسجيل الدخول', 'error');
            }
        }

        // وظائف التقييم
        function initializeRatings() {
            elements.ratingStars.forEach(star => {
                const resourceId = star.closest('.resource-card')?.dataset.resourceId;
                if (resourceId && auth.currentUser) {
                    const ratingRef = doc(db, 'ratings', `${auth.currentUser.uid}_${resourceId}`);
                    unsubscribeRatings[resourceId] = onSnapshot(ratingRef, (doc) => {
                        if (doc.exists()) {
                            const rating = doc.data().rating;
                            star.closest('.rating-stars').querySelectorAll('i').forEach(s => {
                                s.classList.toggle('rated',
