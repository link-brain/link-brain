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
        const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
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
            });
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
                                s.classList.toggle('rated', s.dataset.value <= rating);
                            });
                        }
                    });
                }
            });
        }

        function clearRatingsUI() {
            elements.ratingStars.forEach(star => {
                star.classList.remove('rated');
            });
            Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
            unsubscribeRatings = {};
        }

        async function handleRating(event) {
            if (!auth.currentUser) {
                showToast('يرجى تسجيل الدخول لتقييم المورد', 'error');
                return;
            }
            const star = event.target;
            const resourceId = star.closest('.resource-card')?.dataset.resourceId;
            const ratingValue = parseInt(star.dataset.value);
            if (!resourceId || !ratingValue) {
                showToast('خطأ في تحديد المورد أو التقييم', 'error');
                return;
            }
            try {
                await setDoc(doc(db, 'ratings', `${auth.currentUser.uid}_${resourceId}`), {
                    rating: ratingValue,
                    userId: auth.currentUser.uid,
                    resourceId: resourceId,
                    timestamp: serverTimestamp()
                });
                showToast('تم تسجيل التقييم بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في تسجيل التقييم:', error);
                showToast('فشل في تسجيل التقييم', 'error');
            }
        }

        // وظائف المحادثة
        async function initializeChat() {
            if (!auth.currentUser || !elements.chatMessages) {
                showToast('يرجى تسجيل الدخول للوصول إلى المحادثة', 'error');
                return;
            }
            elements.chatLoading.classList.add('active');
            const messagesQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(messagesPerPage)
            );
            try {
                // تأخير طفيف لضمان استقرار الاتصال
                await new Promise(resolve => setTimeout(resolve, 500));
                unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                    elements.chatMessages.innerHTML = '';
                    snapshot.forEach(doc => {
                        const message = doc.data();
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');
                        if (message.userId === auth.currentUser.uid) {
                            messageElement.classList.add('user-message');
                        }
                        messageElement.innerHTML = `
                            <div class="message-header">
                                <img src="${message.userPhoto || 'https://via.placeholder.com/30'}" alt="صورة المستخدم" class="message-avatar">
                                <span class="message-sender">${DOMPurify.sanitize(message.userName || 'مستخدم')}</span>
                                <span class="message-time">${new Date(message.timestamp?.toMillis() || Date.now()).toLocaleTimeString('ar-EG')}</span>
                            </div>
                            <p class="message-text">${DOMPurify.sanitize(message.text)}</p>
                        `;
                        elements.chatMessages.prepend(messageElement);
                    });
                    lastVisible = snapshot.docs[snapshot.docs.length - 1];
                    hasMoreMessages = snapshot.docs.length === messagesPerPage;
                    elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
                    elements.chatLoading.classList.remove('active');
                }, (error) => {
                    console.error('خطأ في تحميل الرسائل:', error);
                    showToast('فشل في تحميل الرسائل', 'error');
                    elements.chatLoading.classList.remove('active');
                });
            } catch (error) {
                console.error('خطأ في تهيئة المحادثة:', error);
                showToast('فشل في تهيئة المحادثة', 'error');
                elements.chatLoading.classList.remove('active');
            }
        }

        async function sendMessage() {
            if (!auth.currentUser) {
                showToast('يرجى تسجيل الدخول لإرسال رسالة', 'error');
                return;
            }
            const messageText = elements.messageInput.value.trim();
            if (!messageText) {
                showToast('يرجى كتابة رسالة', 'error');
                return;
            }
            try {
                elements.sendMessageBtn.disabled = true;
                await addDoc(collection(db, మ

System: بناءً على طلبك، سأقدم التعديلات اللازمة لمعالجة المشاكل المذكورة مع الحفاظ على التحسينات السابقة. سأركز على إصلاح المحادثة، تحسين زر إغلاق خارطة الطريق، ضمان بقاء أقسام الكورسات معروضة، وإصلاح صفحة الكورسات. سأقدم ملفات محدثة لـ `courses-styles.css` و`courses=det.html` و`courses=det-script.js` مع التركيز على الحلول.

### الحلول المقترحة:
1. **إصلاح المحادثة**:
   - إضافة معالجة أخطاء أفضل في `initializeChat` و`sendMessage`.
   - إضافة تأخير طفيف لتحميل الرسائل لضمان استقرار الاتصال.
   - التأكد من تحميل DOMPurify بشكل صحيح.
   - تحسين إدارة الحالة عند تسجيل الدخول/الخروج.

2. **إضافة زر إغلاق لخارطة الطريق**:
   - التحقق من أن زر `closeRoadmap` مرئي ويعمل بشكل صحيح.
   - تحسين أنماط الـ CSS للزر ليكون واضحًا وسهل الاستخدام.

3. **بقاء الكورسات معروضة**:
   - تعديل `setupTabs` لتكون مستقلة لكل قسم لغة (HTML، CSS، JavaScript).
   - ضمان بقاء جميع أقسام اللغات مرئية عند التنقل بين علامات التبويب.

4. **إصلاح صفحة الكورسات**:
   - تحسين تخطيط الشبكة في `courses-styles.css` ليكون متجاوبًا ومنظمًا.
   - إصلاح التباعد والمحاذاة وإزالة أي تعارضات في الـ CSS.

### التعديلات:

#### 1. ملف `courses-styles.css`
تحسين تخطيط الشبكة، إصلاح التباعد، وتحسين أنماط زر إغلاق خارطة الطريق.

<xaiArtifact artifact_id="9ece6baf-5c6c-47f2-ac76-c13044b346e1" artifact_version_id="18769500-7043-4668-bf86-ca69c876b21a" title="courses-styles.css" contentType="text/css">
:root {
    --primary-blue: #3f51b5;
    --primary-light: #757de8;
    --primary-dark: #002984;
    --primary-bg: #f8fafc;
    --accent-green: #4caf50;
    --accent-yellow: #ffca28;
    --accent-red: #f44336;
    --white: #ffffff;
    --light-bg: #f5f7fa;
    --card-bg: #ffffff;
    --text-dark: #1f2937;
    --text-medium: #4b5563;
    --text-light: #6b7280;
    --border-color: #e5e7eb;
    --box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --border-radius: 16px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Noto Sans Arabic', 'Tajawal', 'Segoe UI', sans-serif;
    background-color: var(--primary-bg);
    color: var(--text-dark);
    direction: rtl;
    line-height: 1.7;
}

/* Navigation Bar */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 5%;
    background: linear-gradient(to right, var(--primary-dark), var(--primary-blue));
    color: var(--white);
    box-shadow: var(--box-shadow);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.logo {
    font-size: 2rem;
    font-weight: 800;
    color: var(--white);
    text-decoration: none;
}

.nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-link {
    text-decoration: none;
    color: var(--white);
    font-weight: 600;
    font-size: 1.1rem;
    transition: var(--transition);
    padding: 0.6rem 0;
    position: relative;
}

.nav-link:hover {
    color: var(--accent-yellow);
}

.nav-link.active {
    color: var(--accent-yellow);
    font-weight: 700;
}

.nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: 0;
    width: 100%;
    height: 4px;
    background-color: var(--accent-yellow);
    border-radius: 4px;
}

.nav-link:focus-visible {
    outline: 3px solid var(--accent-yellow);
    outline-offset: 3px;
}

.auth-buttons {
    display: flex;
    gap: 1.5rem;
}

.btn {
    padding: 0.8rem 2rem;
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition: var(--transition);
}

.btn:focus-visible {
    outline: 3px solid var(--accent-yellow);
    outline-offset: 3px;
}

.watch-courses-btn, .view-roadmap-btn, .quiz-btn {
    background: linear-gradient(to right, var(--primary-blue), var(--primary-light));
    color: var(--white);
    box-shadow: var(--box-shadow);
    padding: 1.2rem 2.5rem;
    font-size: 1.2rem;
}

.watch-courses-btn:hover, .view-roadmap-btn:hover, .quiz-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-3px);
}

.mobile-menu-btn {
    display: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: var(--white);
}

/* Google Login and Chat Buttons */
.google-login-btn, .chat-btn {
    background-color: var(--white);
    color: var(--primary-blue);
    border: 3px solid var(--primary-blue);
    padding: 0.8rem 2rem;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    gap: 0.7rem;
    font-weight: 700;
    font-size: 1rem;
    transition: var(--transition);
}

.google-login-btn:hover, .chat-btn:hover,
.google-login-btn:focus-visible, .chat-btn:focus-visible {
    background-color: var(--primary-blue);
    color: var(--white);
    transform: translateY(-3px);
}

.google-login-btn i, .chat-btn i {
    font-size: 1.3rem;
}

.user-logged-in {
    background: linear-gradient(to right, var(--primary-blue), var(--primary-light));
    color: var(--white);
    padding: 0.6rem 1.5rem;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    gap: 0.7rem;
    font-weight: 700;
}

.user-logged-in:hover {
    background: var(--primary-dark);
}

.user-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--white);
}

.logout-icon {
    margin-right: 0.7rem;
    transition: var(--transition);
}

.logout-icon:hover {
    color: var(--accent-red);
    transform: scale(1.2);
}

/* Breadcrumbs */
.breadcrumbs {
    padding: 1.2rem 5%;
    background-color: var(--light-bg);
    font-size: 1rem;
    color: var(--text-medium);
}

.breadcrumbs a {
    color: var(--primary-blue);
    text-decoration: none;
    transition: var(--transition);
}

.breadcrumbs a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

.breadcrumbs span {
    color: var(--text-dark);
    font-weight: 600;
}

/* Course Details Section */
.course-details-section {
    padding: 4rem 5%;
    background: linear-gradient(to bottom, var(--primary-bg), var(--light-bg));
}

.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

.section-header h2 {
    font-size: 2.8rem;
    color: var(--primary-dark);
    margin-bottom: 1.2rem;
    font-weight: 800;
}

.section-header p {
    color: var(--text-medium);
    font-size: 1.3rem;
    max-width: 900px;
    margin: 0 auto;
}

.language-section {
    margin-bottom: 4rem;
}

.language-section h3 {
    font-size: 2rem;
    color: var(--primary-blue);
    margin-bottom: 2rem;
    position: relative;
}

.language-section h3::after {
    content: '';
    position: absolute;
    bottom: -8px;
    right: 0;
    width: 100px;
    height: 5px;
    background: linear-gradient(to right, var(--primary-blue), var(--primary-light));
    border-radius: 4px;
}

/* Tabs */
.tab-container {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    border-bottom: 3px solid var(--border-color);
}

.tab {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-medium);
    cursor: pointer;
    transition: var(--transition);
    border-bottom: 4px solid transparent;
    background: var(--white);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.tab.active {
    color: var(--primary-blue);
    border-bottom: 4px solid var(--primary-blue);
    background: var(--light-bg);
}

.tab:hover {
    color: var(--primary-blue);
    background: var(--light-bg);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

/* Resource Grid */
.resource-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
}

.resource-card {
    background-color: var(--card-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    overflow: hidden;
    transition: var(--transition);
    padding: 2rem;
}

.resource-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.resource-content {
    padding: 0;
}

.resource-content h4 {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
}

.resource-content h4 a {
    color: var(--primary-blue);
    text-decoration: none;
    transition: var(--transition);
}

.resource-content h4 a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

.resource-content p {
    font-size: 1.1rem;
    color: var(--text-medium);
    margin-bottom: 1rem;
}

/* Rating Stars */
.rating-stars {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.8rem;
}

.rating-stars i {
    font-size: 1.4rem;
    color: var(--text-light);
    cursor: pointer;
    transition: var(--transition);
}

.rating-stars i:hover {
    color: var(--accent-yellow);
    transform: scale(1.2);
}

.rating-stars i.rated {
    color: var(--accent-yellow);
}

.rating-stars .average-rating {
    font-size: 1.1rem;
    color: var(--text-dark);
    margin-right: 0.8rem;
    font-weight: 700;
}

.rating-stars .rating-count {
    font-size: 0.9rem;
    color: var(--text-medium);
}

/* Chat Popup */
.chat-popup {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
}

.chat-popup.active {
    display: flex;
}

.chat-content {
    background-color: var(--white);
    width: 90%;
    max-width: 600px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 2rem;
    position: relative;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.close-chat, .close-roadmap, .close-features {
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-size: 1.5rem;
    color: var(--text-dark);
    cursor: pointer;
    transition: var(--transition);
    background-color: var(--light-bg);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-chat:hover, .close-roadmap:hover, .close-features:hover {
    color: var(--accent-red);
    transform: scale(1.2);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: var(--light-bg);
    border-radius: 8px;
}

.message {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: var(--white);
}

.user-message {
    background-color: var(--primary-light);
    color: var(--white);
    margin-left: 2rem;
}

.message-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.message-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
}

.message-sender {
    font-weight: 600;
    color: var(--primary-dark);
}

.message-time {
    font-size: 0.9rem;
    color: var(--text-light);
}

.message-text {
    font-size: 1rem;
    color: var(--text-dark);
}

.chat-input {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.chat-input input {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 1rem;
}

.send-message-btn {
    background: linear-gradient(to right, var(--primary-blue), var(--primary-light));
    color: var(--white);
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
}

.send-message-btn:hover {
    background: var(--primary-dark);
}

.load-more-btn {
    display: block;
    margin: 1rem auto;
    padding: 0.8rem 2rem;
    background: var(--primary-blue);
    color: var(--white);
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
}

.load-more-btn:hover {
    background: var(--primary-dark);
}

.chat-loading {
    display: none;
    text-align: center;
    padding: 1rem;
    color: var(--text-medium);
}

.chat-loading.active {
    display: block;
}

/* Roadmap Popup */
.roadmap-popup {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
}

.roadmap-popup.active {
    display: flex;
}

.roadmap-content {
    background-color: var(--white);
    width: 90%;
    max-width: 800px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 2rem;
    max-height: 80vh;
    overflow-y: auto;
}

.roadmap-item {
    margin-bottom: 2rem;
}

.roadmap-item h3 {
    font-size: 1.6rem;
    color: var(--primary-blue);
    margin-bottom: 0.5rem;
}

.roadmap-item p {
    font-size: 1.1rem;
    color: var(--text-medium);
}

/* Features Popup */
.features-popup {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
}

.features-popup.active {
    display: flex;
}

.features-content {
    background-color: var(--white);
    width: 90%;
    max-width: 500px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 2rem;
}

.features-list {
    list-style: none;
    padding: 0;
}

.features-list li {
    font-size: 1.1rem;
    color: var(--text-dark);
    margin-bottom: 0.8rem;
    padding-right: 1.5rem;
    position: relative;
}

.features-list li::before {
    content: '✔';
    position: absolute;
    right: 0;
    color: var(--accent-green);
}

/* Footer */
.site-footer {
    background: linear-gradient(to right, var(--primary-dark), var(--primary-blue));
    color: var(--text-light);
    padding: 5rem 0 0;
}

.footer-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 5%;
    gap: 3rem;
}

.footer-brand {
    flex: 1;
    min-width: 300px;
}

.footer-logo {
    color: var(--white);
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
}

.footer-description {
    margin-bottom: 2rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.8);
}

.social-links {
    display: flex;
    gap: 1.5rem;
}

.social-link {
    color: var(--white);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    font-size: 1.3rem;
}

.social-link:hover,
.social-link:focus-visible {
    background-color: var(--white);
    color: var(--primary-blue);
    transform: translateY(-5px);
}

.footer-links {
    flex: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 3rem;
}

.footer-column {
    flex: 1;
    min-width: 200px;
}

.footer-title {
    color: var(--white);
    font-size: 1.4rem;
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 0.8rem;
}

.footer-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 70px;
    height: 3px;
    background-color: var(--white);
}

.footer-column ul {
    list-style: none;
}

.footer-column li {
    margin-bottom: 1rem;
}

.footer-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 1.1rem;
    transition: var(--transition);
}

.footer-link:hover,
.footer-link:focus-visible {
    color: var(--white);
    padding-right: 8px;
}

.footer-column i {
    margin-left: 0.8rem;
}

.footer-bottom {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 2rem 5%;
    margin-top: 4rem;
    text-align: center;
}

.copyright {
    margin: 0;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
}

/* Responsive Design */
@media (max-width: 992px) {
    .resource-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
}

@media (max-width: 768px) {
    .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        width: 100%;
        background-color: var(--white);
        flex-direction: column;
        align-items: center;
        padding: 1.5rem;
        box-shadow: var(--box-shadow);
    }
    .nav-links.active {
        display: flex;
    }
    .auth-buttons {
        flex-direction: column;
        width: 100%;
        align-items: center;
    }
    .google-login-btn, .chat-btn {
        width: 100%;
        justify-content: center;
    }
    .mobile-menu-btn {
        display: block;
    }
    .course-details-section {
        padding: 3rem 5%;
    }
    .section-header h2 {
        font-size: 2.2rem;
    }
    .section-header p {
        font-size: 1.1rem;
    }
    .quiz-btn {
        padding: 1rem 2rem;
        font-size: 1.1rem;
    }
}

@media (max-width: 576px) {
    .resource-grid {
        grid-template-columns: 1fr;
    }
    .chat-content, .roadmap-content {
        width: 95%;
        padding: 1.8rem;
    }
}
