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
            tabs: document.querySelectorAll('.tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            ratingStars: document.querySelectorAll('.rating-stars i'),
            featuresButtons: document.querySelectorAll('.features-btn'),
            featuresPopup: document.getElementById('featuresPopup'),
            closeFeatures: document.getElementById('closeFeatures'),
            featuresList: document.getElementById('featuresList')
        };

        // التحقق من وجود العناصر
        if (!elements.googleLoginBtn || !elements.chatBtn || !elements.featuresPopup || !elements.chatPopup) {
            console.error('عناصر DOM مفقودة:', {
                googleLoginBtn: !!elements.googleLoginBtn,
                chatBtn: !!elements.chatBtn,
                featuresPopup: !!elements.featuresPopup,
                chatPopup: !!elements.chatPopup
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
                        showToast('خطأ في تحميل المحتوى', 'error');
                    }
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
        function initializeChat() {
            if (!auth.currentUser || !elements.chatMessages) return;
            const messagesQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(messagesPerPage)
            );
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
                await addDoc(collection(db, 'messages'), {
                    text: messageText,
                    userId: auth.currentUser.uid,
                    userName: auth.currentUser.displayName || 'مستخدم',
                    userPhoto: auth.currentUser.photoURL || null,
                    timestamp: serverTimestamp()
                });
                elements.messageInput.value = '';
                showToast('تم إرسال الرسالة بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في إرسال الرسالة:', error);
                showToast('فشل في إرسال الرسالة', 'error');
            } finally {
                elements.sendMessageBtn.disabled = false;
            }
        }

        async function loadMessages() {
            if (!auth.currentUser || !hasMoreMessages) return;
            elements.chatLoading.classList.add('active');
            const nextQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'desc'),
                startAfter(lastVisible),
                limit(messagesPerPage)
            );
            try {
                const snapshot = await getDocs(nextQuery);
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
                    elements.chatMessages.appendChild(messageElement);
                });
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
                hasMoreMessages = snapshot.docs.length === messagesPerPage;
                elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
            } catch (error) {
                console.error('خطأ في تحميل المزيد من الرسائل:', error);
                showToast('فشل في تحميل المزيد من الرسائل', 'error');
            } finally {
                elements.chatLoading.classList.remove('active');
            }
        }

        // بدء التطبيق
        setupTabs();
        setupEventListeners();
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showToast('خطأ في تحميل التطبيق، يرجى إعادة تحميل الصفحة', 'error');
    }
});
