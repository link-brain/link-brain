
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
    let app, auth, provider, analytics, db, DOMPurify;
    try {
        const firebaseApp = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const firebaseAuth = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const firebaseAnalytics = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
        const firebaseFirestore = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
        DOMPurify = (await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js")).default;

        // تهيئة التطبيق
        app = firebaseApp.initializeApp(firebaseConfig);
        auth = firebaseAuth.getAuth(app);
        provider = new firebaseAuth.GoogleAuthProvider();
        analytics = firebaseAnalytics.getAnalytics(app);
        db = firebaseFirestore.getFirestore(app);
        firebaseInitialized = true;
    } catch (error) {
        console.error('خطأ في استيراد أو تهيئة Firebase:', error);
        showToast('فشل تحميل التطبيق، تحقق من الاتصال بالإنترنت أو إعدادات Firebase', 'error');
        return;
    }

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
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        ratingStars: document.querySelectorAll('.rating-stars i'),
        featuresButtons: document.querySelectorAll('.features-btn'),
        featuresPopup: document.getElementById('featuresPopup'),
        closeFeatures: document.getElementById('closeFeatures'),
        featuresList: document.getElementById('featuresList')
    };

    // التحقق من وجود العناصر
    if (!elements.googleLoginBtn || !elements.chatBtn || !elements.featuresPopup) {
        console.error('عناصر DOM مفقودة:', {
            googleLoginBtn: !!elements.googleLoginBtn,
            chatBtn: !!elements.chatBtn,
            featuresPopup: !!elements.featuresPopup
        });
        showToast('خطأ في تحميل واجهة المستخدم، يرجى إعادة تحميل الصفحة', 'error');
        return;
    }

    // تعيين السنة الحالية
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    // إعداد علامات التبويب
    function setupTabs() {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elements.tabs.forEach(t => t.classList.remove('active'));
                elements.tabContents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const contentId = tab.getAttribute('data-tab');
                const contentElement = document.getElementById(contentId);
                if (contentElement) {
                    contentElement.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                    elements.tabs.forEach(t => {
                        if (t !== tab) t.setAttribute('aria-selected', 'false');
                    });
                } else {
                    console.error('عنصر المحتوى مفقود:', contentId);
                }
            });
        });
    }

    setupTabs();

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
            elements.loadMoreBtn.addEventListener('click', loadMoreMessages);
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
        auth.onAuthStateChanged(handleAuthStateChanged);
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
            const isActive = elements получение данных о дорожной карте
            elements.roadmapPopup.classList.toggle('active');
            elements.roadmapPopup.setAttribute('aria-hidden', !isActive);
            if (isActive) {
                loadRoadmapContent();
            }
        }
    }

    async function loadRoadmapContent() {
        const roadmapContent = document.querySelector('.roadmap-content');
        if (!roadmapContent) {
            console.error('عنصر محتوى خارطة الطريق مفقود');
            showToast('خطأ في تحميل خارطة الطريق', 'error');
            return;
        }

        // محاولة تحميل البيانات من Firestore
        try {
            const roadmapQuery = firebaseFirestore.query(firebaseFirestore.collection(db, 'roadmap'), firebaseFirestore.orderBy('order'));
            const roadmapSnapshot = await firebaseFirestore.getDocs(roadmapQuery);
            if (roadmapSnapshot.empty) {
                // الرجوع إلى المحتوى الثابت إذا لم يتم العثور على بيانات
                roadmapContent.innerHTML = `
                    <h2>خارطة طريق تطوير الواجهات الأمامية</h2>
                    <div class="roadmap-item">
                        <h3>1. HTML</h3>
                        <p>تعلم HTML الدلالي، النماذج، إمكانية الوصول، وأساسيات تحسين محركات البحث.</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>2. CSS</h3>
                        <p>أتقن التخطيطات (Flexbox، Grid)، التصميم المتجاوب، والرسوم المتحركة.</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>3. JavaScript</h3>
                        <p>افهم ES6+، التلاعب بـ DOM، الأحداث، والبرمجة غير المتزامنة.</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>4. التحكم في الإصدارات</h3>
                        <p>تعلم Git وGitHub للتحكم في الإصدارات والتعاون.</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>5. أطر عمل الواجهات</h3>
                        <p>استكشف React، Vue، أو Angular مع إدارة الحالة.</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>6. أدوات البناء</h3>
                        <p>تعلم Webpack، Vite، أو Parcel لإدارة الحزم.</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>7. الاختبار</h3>
                        <p>افهم اختبار الوحدات (Jest) واختبار النهاية إلى النهاية (Cypress).</p>
                    </div>
                    <div class="roadmap-item">
                        <h3>8. النشر</h3>
                        <p>تعلم النشر باستخدام Netlify، Vercel، أو Firebase Hosting.</p>
                    </div>
                `;
            } else {
                roadmapContent.innerHTML = '<h2>خارطة طريق تطوير الواجهات الأمامية</h2>';
                roadmapSnapshot.forEach(doc => {
                    const data = doc.data();
                    roadmapContent.innerHTML += `
                        <div class="roadmap-item">
                            <h3>${DOMPurify.sanitize(data.title)}</h3>
                            <p>${DOMPurify.sanitize(data.description)}</p>
                        </div>
                    `;
                });
            }
        } catch (error) {
            console.error('خطأ في تحميل خارطة الطريق من Firestore:', error);
            showToast('فشل تحميل خارطة الطريق، يتم استخدام المحتوى الثابت', 'warning');
            // الرجوع إلى المحتوى الثابت في حالة الفشل
            roadmapContent.innerHTML = `
                <h2>خارطة طريق تطوير الواجهات الأمامية</h2>
                <div class="roadmap-item">
                    <h3>1. HTML</h3>
                    <p>تعلم HTML الدلالي، النماذج، إمكانية الوصول، وأساسيات تحسين محركات البحث.</p>
                </div>
                <div class="roadmap-item">
                    <h3>2. CSS</h3>
                    <p>أتقن التخطيطات (Flexbox، Grid)، التصميم المتجاوب، والرسوم المتحركة.</p>
                </div>
                <div class="roadmap-item">
                    <h3>3. JavaScript</h3>
                    <p>افهم ES6+، التلاعب بـ DOM، الأحداث، والبرمجة غير المتزامنة.</p>
                </div>
                <div class="roadmap-item">
                    <h3>4. التحكم في الإصدارات</h3>
                    <p>تعلم Git وGitHub للتحكم في الإصدارات والتعاون.</p>
                </div>
                <div class="roadmap-item">
                    <h3>5. أطر عمل الواجهات</h3>
                    <p>استكشف React، Vue، أو Angular مع إدارة الحالة.</p>
                </div>
                <div class="roadmap-item">
                    <h3>6. أدوات البناء</h3>
                    <p>تعلم Webpack، Vite، أو Parcel لإدارة الحزم.</p>
                </div>
                <div class="roadmap-item">
                    <h3>7. الاختبار</h3>
                    <p>افهم اختبار الوحدات (Jest) واختبار النهاية إلى النهاية (Cypress).</p>
                </div>
                <div class="roadmap-item">
                    <h3>8. النشر</h3>
                    <p>تعلم النشر باستخدام Netlify، Vercel، أو Firebase Hosting.</p>
                </div>
            `;
        }
    }

    // وظائف الميزات
    function showFeaturesPopup(event) {
        const features = event.target.getAttribute('data-features')?.split('\n') || [];
        if (features.length === 0) {
            showToast('لا توجد ميزات متاحة لهذا المورد', 'warning');
            return;
        }
        elements.featuresList.innerHTML = features.map(feature => `<li>${DOMPurify.sanitize(feature)}</li>`).join('');
        toggleFeaturesPopup();
    }

    function toggleFeaturesPopup() {
        if (elements.featuresPopup) {
            const isActive = elements.featuresPopup.classList.toggle('active');
            elements.featuresPopup.setAttribute('aria-hidden', !isActive);
        }
    }

    // وظائف المصادقة
    async function handleAuth() {
        if (!firebaseInitialized) {
            showToast('Firebase غير مهيأ، يرجى إعادة تحميل الصفحة', 'error');
            console.error('Firebase غير مهيأ');
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                await auth.signOut();
                showToast('تم تسجيل الخروج بنجاح', 'success');
            } else {
                await auth.signInWithPopup(provider);
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
            } else if (error.code === 'auth/popup-blocked') {
                showToast('تم حظر نافذة تسجيل الدخول بواسطة المتصفح، يرجى السماح بالنوافذ المنبثقة', 'error');
            } else {
                showToast(`خطأ في تسجيل الدخول/الخروج: ${error.message}`, 'error');
            }
        }
    }

    function handleAuthStateChanged(user) {
        if (!elements.googleLoginBtn) {
            console.error('زر تسجيل الدخول مفقود');
            return;
        }

        try {
            if (user) {
                elements.googleLoginBtn.innerHTML = `
                    <img src="${user.photoURL || 'https://via.placeholder.com/30'}" alt="صورة المستخدم" class="user-avatar">
                    <span>${DOMPurify.sanitize(user.displayName || 'مستخدم')}</span>
                    <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>
                `;
                elements.googleLoginBtn.classList.add('user-logged-in');
                elements.chatBtn.disabled = false;
                initializeRatings();
                if (elements.chatPopup.classList.contains('active')) {
                    loadMessages();
                }
            } else {
                elements.googleLoginBtn.innerHTML = `
                    <i class="fab fa-google"></i> تسجيل الدخول
                `;
                elements.googleLoginBtn.classList.remove('user-logged-in');
                elements.chatBtn.disabled = true;
                clearRatingsUI();
                if (unsubscribeMessages) {
                    unsubscribeMessages();
                    unsubscribeMessages = null;
                }
                elements.chatPopup.classList.remove('active');
                elements.chatPopup.setAttribute('aria-hidden', 'true');
            }
        } catch (error) {
            console.error('خطأ في معالجة حالة المصادقة:', error);
            showToast('خطأ في تحديث حالة تسجيل الدخول', 'error');
        }
    }

    // وظائف التقييم
    async function handleRating(event) {
        if (!auth.currentUser) {
            showToast('يرجى تسجيل الدخول لتقييم الموارد', 'error');
            return;
        }

        const star = event.target;
        const ratingValue = parseInt(star.dataset.rating);
        const resourceCard = star.closest('.resource-card');
        const resourceId = resourceCard?.dataset.resourceId;

        if (!resourceId) {
            console.error('معرف المورد مفقود:', resourceCard);
            showToast('خطأ: معرف المورد غير محدد', 'error');
            return;
        }

        try {
            await firebaseFirestore.setDoc(firebaseFirestore.doc(db, 'ratings', `${auth.currentUser.uid}_${resourceId}`), {
                userId: auth.currentUser.uid,
                resourceId,
                rating: ratingValue,
                timestamp: firebaseFirestore.serverTimestamp()
            });

            showToast('تم تسجيل تقييمك بنجاح', 'success');
            updateRatingUI(resourceId);
        } catch (error) {
            console.error('خطأ في تسجيل التقييم:', error);
            showToast(`فشل تسجيل التقييم: ${error.message}`, 'error');
        }
    }

    async function initializeRatings() {
        const resources = document.querySelectorAll('.resource-card');
        resources.forEach(async resource => {
            const resourceId = resource.dataset.resourceId;
            if (!resourceId) {
                console.warn('معرف المورد مفقود للعنصر:', resource);
                return;
            }

            // إلغاء الاشتراك السابق إن وجد
            if (unsubscribeRatings[resourceId]) {
                unsubscribeRatings[resourceId]();
            }

            // الاشتراك في تحديثات التقييم
            const ratingsQuery = firebaseFirestore.query(firebaseFirestore.collection(db, 'ratings'), firebaseFirestore.where('resourceId', '==', resourceId));
            unsubscribeRatings[resourceId] = firebaseFirestore.onSnapshot(ratingsQuery, snapshot => {
                updateRatingUI(resourceId);
            }, error => {
                console.error('خطأ في الاشتراك في تحديثات التقييم:', error);
                showToast('فشل تحميل التقييمات', 'error');
            });
        });
    }

    async function updateRatingUI(resourceId) {
        const resourceCard = document.querySelector(`.resource-card[data-resource-id="${resourceId}"]`);
        if (!resourceCard) {
            console.warn('بطاقة المورد غير موجودة:', resourceId);
            return;
        }

        const stars = resourceCard.querySelectorAll('.rating-stars i');
        const averageRatingElement = resourceCard.querySelector('.average-rating');
        const ratingCountElement = resourceCard.querySelector('.rating-count');

        try {
            const ratingsQuery = firebaseFirestore.query(firebaseFirestore.collection(db, 'ratings'), firebaseFirestore.where('resourceId', '==', resourceId));
            const ratingsSnapshot = await firebaseFirestore.getDocs(ratingsQuery);
            const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
            const averageRating = ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : '0.0';
            const ratingCount = ratings.length;

            if (averageRatingElement) {
                averageRatingElement.textContent = averageRating;
            }
            if (ratingCountElement) {
                ratingCountElement.textContent = `(${ratingCount} تقييم)`;
            }

            // تحديث نجوم المستخدم
            stars.forEach(star => {
                star.classList.add('disabled');
                star.classList.remove('rated');
            });

            if (auth.currentUser) {
                const userRatingDoc = await firebaseFirestore.getDocs(firebaseFirestore.query(
                    firebaseFirestore.collection(db, 'ratings'),
                    firebaseFirestore.where('userId', '==', auth.currentUser.uid),
                    firebaseFirestore.where('resourceId', '==', resourceId)
                ));
                const userRating = userRatingDoc.docs[0]?.data().rating || 0;

                stars.forEach(star => {
                    const starValue = parseInt(star.dataset.rating);
                    star.classList.toggle('rated', starValue <= userRating);
                    star.classList.remove('disabled');
                });
            }
        } catch (error) {
            console.error('خطأ في تحديث واجهة التقييم:', error);
            showToast(`فشل تحديث التقييمات: ${error.message}`, 'error');
        }
    }

    function clearRatingsUI() {
        const resources = document.querySelectorAll('.resource-card');
        resources.forEach(resource => {
            const stars = resource.querySelectorAll('.rating-stars i');
            const averageRatingElement = resource.querySelector('.average-rating');
            const ratingCountElement = resource.querySelector('.rating-count');

            stars.forEach(star => {
                star.classList.remove('rated');
                star.classList.add('disabled');
            });
            if (averageRatingElement) {
                averageRatingElement.textContent = '0.0';
            }
            if (ratingCountElement) {
                ratingCountElement.textContent = '(0 تقييم)';
            }
        });

        // إلغاء جميع الاشتراكات في التقييمات
        Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
        unsubscribeRatings = {};
    }

    // وظائف المحادثة
    async function sendMessage() {
        if (!auth.currentUser) {
            showToast('يرجى تسجيل الدخول لإرسال رسالة', 'error');
            return;
        }

        const messageText = elements.messageInput.value.trim();
        if (!messageText) {
            showToast('يرجى إدخال رسالة', 'error');
            return;
        }

        try {
            await firebaseFirestore.addDoc(firebaseFirestore.collection(db, 'messages'), {
                text: DOMPurify.sanitize(messageText),
                userId: auth.currentUser.uid,
                userName: DOMPurify.sanitize(auth.currentUser.displayName || 'مستخدم'),
                userPhoto: auth.currentUser.photoURL || 'https://via.placeholder.com/30',
                timestamp: firebaseFirestore.serverTimestamp()
            });
            elements.messageInput.value = '';
            showToast('تم إرسال الرسالة بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
            showToast(`فشل إرسال الرسالة: ${error.message}`, 'error');
        }
    }

    function toggleChatPopup() {
        if (!auth.currentUser) {
            showToast('يرجى تسجيل الدخول لاستخدام المحادثة', 'error');
            return;
        }

        const isActive = elements.chatPopup.classList.toggle('active');
        elements.chatPopup.setAttribute('aria-hidden', !isActive);
        if (isActive) {
            loadMessages();
        } else if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }
    }

    async function loadMessages() {
        if (!auth.currentUser || !firebaseInitialized) return;

        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }

        elements.chatLoading.classList.add('active');
        const messagesQuery = firebaseFirestore.query(
            firebaseFirestore.collection(db, 'messages'),
            firebaseFirestore.orderBy('timestamp', 'desc'),
            firebaseFirestore.limit(messagesPerPage)
        );

        unsubscribeMessages = firebaseFirestore.onSnapshot(messagesQuery, snapshot => {
            elements.chatMessages.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.userId === auth.currentUser.uid ? 'user-message' : ''}`;
                messageElement.innerHTML = `
                    <div class="message-header">
                        <img src="${message.userPhoto}" alt="صورة المستخدم" class="message-avatar">
                        <span class="message-sender">${DOMPurify.sanitize(message.userName)}</span>
                        <span class="message-time">${message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString('ar-EG') : 'الآن'}</span>
                    </div>
                    <p class="message-text">${DOMPurify.sanitize(message.text)}</p>
                `;
                elements.chatMessages.prepend(messageElement);
            });
            elements.chatLoading.classList.remove('active');
            elements.loadMoreBtn.style.display = snapshot.size >= messagesPerPage ? 'block' : 'none';
            hasMoreMessages = snapshot.size >= messagesPerPage;
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
        }, error => {
            console.error('خطأ في تحميل الرسائل:', error);
            showToast(`فشل تحميل الرسائل: ${error.message}`, 'error');
            elements.chatLoading.classList.remove('active');
        });
    }

    async function loadMoreMessages() {
        if (!hasMoreMessages || !auth.currentUser || !firebaseInitialized) return;

        elements.chatLoading.classList.add('active');
        const messagesQuery = firebaseFirestore.query(
            firebaseFirestore.collection(db, 'messages'),
            firebaseFirestore.orderBy('timestamp', 'desc'),
            firebaseFirestore.startAfter(lastVisible),
            firebaseFirestore.limit(messagesPerPage)
        );

        try {
            const snapshot = await firebaseFirestore.getDocs(messagesQuery);
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.userId === auth.currentUser.uid ? 'user-message' : ''}`;
                messageElement.innerHTML = `
                    <div class="message-header">
                        <img src="${message.userPhoto}" alt="صورة المستخدم" class="message-avatar">
                        <span class="message-sender">${DOMPurify.sanitize(message.userName)}</span>
                        <span class="message-time">${message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString('ar-EG') : 'الآن'}</span>
                    </div>
                    <p class="message-text">${DOMPurify.sanitize(message.text)}</p>
                `;
                elements.chatMessages.appendChild(messageElement);
            });

            elements.chatLoading.classList.remove('active');
            hasMoreMessages = snapshot.size >= messagesPerPage;
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
            elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
        } catch (error) {
            console.error('خطأ في تحميل المزيد من الرسائل:', error);
            showToast(`فشل تحميل المزيد من الرسائل: ${error.message}`, 'error');
            elements.chatLoading.classList.remove('active');
        }
    }

    // تهيئة مستمعي الأحداث
    setupEventListeners();
});
