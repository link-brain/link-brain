document.addEventListener('DOMContentLoaded', function() {
    // تهيئة Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.appspot.com",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    let firebaseInitialized = false;
    let app, auth, provider, analytics, db;

    // محاولة تهيئة Firebase
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        provider = new firebase.auth.GoogleAuthProvider();
        analytics = firebase.analytics();
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase تم تهيئته بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة Firebase:', error);
        showToast('خطأ في تحميل Firebase، بعض الوظائف قد لا تعمل', 'error');
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
        ratingStars: document.querySelectorAll('.rating-stars i')
    };

    // سجل للتحقق من وجود العناصر
    console.log('عناصر DOM:', {
        chatBtn: !!elements.chatBtn,
        chatPopup: !!elements.chatPopup
    });

    // التحقق من وجود العناصر
    if (!elements.googleLoginBtn || !elements.chatBtn) {
        console.error('عناصر DOM مفقودة:', { googleLoginBtn: !!elements.googleLoginBtn, chatBtn: !!elements.chatBtn });
        showToast('خطأ في تحميل واجهة المستخدم، يرجى إعادة تحميل الصفحة', 'error');
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

    // إعداد Tooltips باستخدام Popper.js
    function setupTooltips() {
        if (typeof Popper === 'undefined') {
            console.warn('Popper.js غير محمل، سيتم تخطي إعداد Tooltips');
            return;
        }

        document.querySelectorAll('.features-tooltip').forEach(tooltip => {
            const popperInstance = Popper.createPopper(tooltip, tooltip.querySelector('.tooltip-content') || tooltip, {
                placement: 'top',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 8],
                        },
                    },
                ],
            });
            tooltip.addEventListener('mouseenter', () => {
                tooltip.setAttribute('data-show', '');
                popperInstance.update();
            });
            tooltip.addEventListener('mouseleave', () => {
                tooltip.removeAttribute('data-show');
            });
            tooltip.addEventListener('focus', () => {
                tooltip.setAttribute('data-show', '');
                popperInstance.update();
            });
            tooltip.addEventListener('blur', () => {
                tooltip.removeAttribute('data-show');
            });
        });
    }

    setupTooltips();

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

    // وظائف المصادقة
    function sanitizeInput(input) {
        try {
            if (!DOMPurify || !DOMPurify.sanitize) {
                console.warn('DOMPurify غير متاح، سيتم استخدام تهيئة بسيطة');
                return input ? input.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            }
            return DOMPurify.sanitize(input || '');
        } catch (error) {
            console.error('خطأ في تعقيم المدخلات:', error);
            return input ? input.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        }
    }

    async function handleAuth() {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            console.error('Firebase غير مهيأ');
            return;
        }

        const user = auth.currentUser;
        try {
            if (user) {
                await auth.signOut();
                showToast('تم تسجيل الخروج بنجاح', 'success');
            } else {
                await auth.signInWithPopup(provider);
                showToast('تم تسجيل الدخول بنجاح', 'success');
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
                    <span>${sanitizeInput(user.displayName || 'مستخدم')}</span>
                    <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>
                `;
                elements.googleLoginBtn.classList.add('user-logged-in');
                initializeRatings();
            } else {
                elements.googleLoginBtn.innerHTML = `
                    <i class="fab fa-google"></i> تسجيل الدخول
                `;
                elements.googleLoginBtn.classList.remove('user-logged-in');
                clearRatingsUI();
            }
        } catch (error) {
            console.error('خطأ في تحديث واجهة المستخدم للمصادقة:', error);
            showToast('خطأ في تحديث واجهة تسجيل الدخول', 'error');
        }
    }

    // وظائف المحادثة
    function toggleChatPopup() {
        console.log('تم استدعاء toggleChatPopup');
        if (!elements.chatPopup) {
            console.error('chatPopup غير موجود في DOM');
            return;
        }
        const isActive = elements.chatPopup.classList.toggle('active');
        console.log('حالة chatPopup:', isActive ? 'مفتوحة' : 'مغلقة');
        elements.chatPopup.setAttribute('aria-hidden', !isActive);
        if (isActive) {
            if (elements.messageInput) elements.messageInput.focus();
            if (!elements.chatMessages.hasChildNodes()) {
                loadMessages();
            }
            scrollChatToBottom();
        } else if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
            elements.chatMessages.innerHTML = '';
            hasMoreMessages = true;
            lastVisible = null;
            if (elements.loadMoreBtn) elements.loadMoreBtn.style.display = 'none';
        }
    }

    function scrollChatToBottom() {
        if (elements.chatMessages) {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }
    }

    async function sendMessage() {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            showToast('يرجى تسجيل الدخول لإرسال الرسائل', 'error');
            return;
        }

        const messageText = elements.messageInput.value.trim();
        if (!messageText) {
            showToast('يرجى إدخال رسالة غير فارغة', 'error');
            return;
        }

        if (messageText.length > 500) {
            showToast('الرسالة طويلة جدًا، الحد الأقصى 500 حرف', 'error');
            return;
        }

        try {
            elements.sendMessageBtn.disabled = true;
            await db.collection('messages').add({
                text: sanitizeInput(messageText),
                userId: user.uid,
                userName: sanitizeInput(user.displayName || 'مستخدم'),
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            elements.messageInput.value = '';
            scrollChatToBottom();
            showToast('تم إرسال الرسالة بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error.code, error.message);
            showToast('حدث خطأ أثناء إرسال الرسالة', 'error');
        } finally {
            elements.sendMessageBtn.disabled = false;
        }
    }

    async function loadMessages() {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }

        if (!hasMoreMessages) return;

        elements.chatLoading.classList.add('active');
        let messagesQuery = db.collection('messages')
            .orderBy('timestamp', 'asc')
            .limit(messagesPerPage);

        if (lastVisible) {
            messagesQuery = messagesQuery.startAfter(lastVisible);
        }

        try {
            unsubscribeMessages = messagesQuery.onSnapshot((snapshot) => {
                if (snapshot.empty) {
                    hasMoreMessages = false;
                    elements.loadMoreBtn.style.display = 'none';
                    elements.chatLoading.classList.remove('active');
                    return;
                }

                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push({ id: doc.id, ...doc.data() });
                    lastVisible = doc;
                });

                messages.forEach((msg) => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${msg.userId === auth.currentUser?.uid ? 'user-message' : ''}`;
                    messageElement.innerHTML = `
                        <div class="message-header">
                            <img src="${msg.userPhoto}" alt="صورة المستخدم" class="message-avatar">
                            <span class="message-sender">${sanitizeInput(msg.userName)}</span>
                            <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
                        </div>
                        <p class="message-text">${sanitizeInput(msg.text)}</p>
                    `;
                    elements.chatMessages.appendChild(messageElement);
                });

                elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
                elements.chatLoading.classList.remove('active');
                scrollChatToBottom();
            }, (error) => {
                console.error('خطأ في تحميل الرسائل:', error.code, error.message);
                showToast('حدث خطأ أثناء تحميل الرسائل', 'error');
                elements.chatLoading.classList.remove('active');
            });
        } catch (error) {
            console.error('خطأ في إعداد مستمع الرسائل:', error.code, error.message);
            showToast('حدث خطأ أثناء تحميل الرسائل', 'error');
            elements.chatLoading.classList.remove('active');
        }
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'الآن';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('خطأ في تنسيق الطابع الزمني:', error);
            return 'غير متاح';
        }
    }

    // وظائف التقييم
    async function handleRating(event) {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            showToast('يرجى تسجيل الدخول لتقييم الموارد', 'error');
            return;
        }

        const star = event.target;
        const ratingValue = parseInt(star.dataset.value);
        const resourceCard = star.closest('.resource-card');
        if (!resourceCard) {
            console.error('بطاقة المورد مفقودة');
            showToast('خطأ في تحديد المورد', 'error');
            return;
        }
        const linkId = resourceCard.dataset.linkId;

        try {
            const ratingRef = db.doc(`ratings/${linkId}_${user.uid}`);
            await ratingRef.set({
                userId: user.uid,
                linkId: linkId,
                rating: ratingValue,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('تم تسجيل تقييمك بنجاح', 'success');
            await updateRatingUI(linkId);
        } catch (error) {
            console.error('خطأ في تسجيل التقييم:', error.code, error.message);
            if (error.code === 'permission-denied') {
                showToast('ليس لديك إذن لتسجيل التقييم', 'error');
            } else {
                showToast('حدث خطأ أثناء تسجيل التقييم', 'error');
            }
        }
    }

    async function updateRatingUI(linkId) {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }

        try {
            const ratingsQuery = db.collection('ratings').where('linkId', '==', linkId);
            const ratingsSnapshot = await ratingsQuery.get();
            let totalRating = 0;
            let ratingCount = 0;

            ratingsSnapshot.forEach(doc => {
                totalRating += doc.data().rating;
                ratingCount++;
            });

            const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
            const ratingElement = document.querySelector(`[data-link-id="${linkId}"] .average-rating`);
            const countElement = document.querySelector(`[data-link-id="${linkId}"] .rating-count`);

            if (ratingElement && countElement) {
                ratingElement.textContent = averageRating;
                countElement.textContent = `(${ratingCount} تقييم)`;
                updateStarUI(linkId, parseFloat(averageRating));
            } else {
                console.error('عناصر التقييم مفقودة:', { ratingElement, countElement });
            }
        } catch (error) {
            console.error('خطأ في تحديث واجهة التقييم:', error.code, error.message);
            showToast('حدث خطأ أثناء تحديث التقييم', 'error');
        }
    }

    function updateStarUI(linkId, averageRating) {
        const stars = document.querySelectorAll(`[data-link-id="${linkId}"] .rating-stars i`);
        stars.forEach(star => {
            const value = parseInt(star.dataset.value);
            star.classList.toggle('rated', value <= Math.round(averageRating));
        });
    }

    function clearRatingsUI() {
        document.querySelectorAll('.resource-card').forEach(card => {
            const linkId = card.dataset.linkId;
            const ratingElement = card.querySelector('.average-rating');
            const countElement = card.querySelector('.rating-count');
            const stars = card.querySelectorAll('.rating-stars i');
            if (ratingElement && countElement) {
                ratingElement.textContent = '0.0';
                countElement.textContent = '(0 تقييم)';
                stars.forEach(star => star.classList.remove('rated'));
            }
        });
    }

    function initializeRatings() {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }

        document.querySelectorAll('.resource-card').forEach(card => {
            const linkId = card.dataset.linkId;
            if (!unsubscribeRatings[linkId]) {
                unsubscribeRatings[linkId] = db.collection('ratings')
                    .where('linkId', '==', linkId)
                    .onSnapshot(() => updateRatingUI(linkId), (error) => {
                        console.error(`خطأ في مستمع تقييم ${linkId}:`, error.code, error.message);
                        showToast('حدث خطأ أثناء تحميل التقييمات', 'error');
                    });
            }
        });
    }

    // إعداد مستمعي الأحداث
    function setupEventListeners() {
        console.log('يتم إعداد مستمعي الأحداث');
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
            console.log('تم العثور على chatBtn، يتم ربط الحدث');
            elements.chatBtn.addEventListener('click', () => {
                console.log('تم النقر على chatBtn');
                toggleChatPopup();
            });
        } else {
            console.error('chatBtn غير موجود، يتم استخدام MutationObserver');
            const observer = new MutationObserver(() => {
                const chatBtn = document.getElementById('chatBtn');
                if (chatBtn) {
                    console.log('تم العثور على chatBtn ديناميكيًا');
                    chatBtn.addEventListener('click', () => {
                        console.log('تم النقر على chatBtn');
                        toggleChatPopup();
                    });
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
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
        if (firebaseInitialized) {
            auth.onAuthStateChanged(handleAuthStateChanged);
        }
        window.addEventListener('resize', closeMobileMenu);
    }

    function toggleMobileMenu() {
        if (elements.navLinks) {
            elements.navLinks.classList.toggle('active');
        }
    }

    function closeMobileMenu() {
        if (elements.navLinks && window.innerWidth > 768) {
            elements.navLinks.classList.remove('active');
        }
    }

    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) {
            elements.roadmapPopup.classList.toggle('active');
        }
    }

    // تهيئة التطبيق
    setupEventListeners();
    if (firebaseInitialized && auth.currentUser) {
        initializeRatings();
    }

    // تنظيف مستمعي الأحداث عند إغلاق الصفحة
    window.addEventListener('unload', () => {
        if (unsubscribeMessages) unsubscribeMessages();
        Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
    });
});
