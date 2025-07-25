document.addEventListener('DOMContentLoaded', async function() {
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

    // استيراد مكتبات Firebase
    let firebaseInitialized = false;
    let DOMPurify = window.DOMPurify; // Assume DOMPurify is loaded via <script> tag

    try {
        // التحقق من توفر DOMPurify
        if (!DOMPurify || !DOMPurify.sanitize) {
            console.warn('DOMPurify غير متاح، سيتم استخدام تهيئة بسيطة');
            DOMPurify = { sanitize: (input) => input ? input.toString().replace(/</g, '<').replace(/>/g, '>') : '' };
        }

        // تحميل مكتبات Firebase
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
        const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

        // تهيئة التطبيق
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const analytics = getAnalytics(app);
        const db = getFirestore(app);
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');

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

        // التحقق من وجود عناصر DOM الخاصة بالمحادثة
        if (!elements.googleLoginBtn || !elements.chatBtn || !elements.chatPopup || !elements.chatMessages || !elements.messageInput || !elements.sendMessageBtn || !elements.closeChat || !elements.chatLoading || !elements.loadMoreBtn) {
            console.error('عناصر DOM الخاصة بالمحادثة مفقودة:', {
                googleLoginBtn: !!elements.googleLoginBtn,
                chatBtn: !!elements.chatBtn,
                chatPopup: !!elements.chatPopup,
                chatMessages: !!elements.chatMessages,
                messageInput: !!elements.messageInput,
                sendMessageBtn: !!elements.sendMessageBtn,
                closeChat: !!elements.closeChat,
                chatLoading: !!elements.chatLoading,
                loadMoreBtn: !!elements.loadMoreBtn
            });
            showToast('خطأ في تحميل واجهة المحادثة، يرجى التحقق من عناصر الصفحة', 'error');
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
                    return input ? input.toString().replace(/</g, '<').replace(/>/g, '>') : '';
                }
                return DOMPurify.sanitize(input || '');
            } catch (error) {
                console.error('خطأ في تعقيم المدخلات:', error);
                return input ? input.toString().replace(/</g, '<').replace(/>/g, '>') : '';
            }
        }

        async function handleAuth() {
            if (!firebaseInitialized) {
                console.error('Firebase not initialized');
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                return;
            }

            const user = auth.currentUser;
            try {
                if (user) {
                    await signOut(auth);
                    showToast('تم تسجيل الخروج بنجاح', 'success');
                } else {
                    await signInWithPopup(auth, provider);
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
                    console.log('User logged in:', user.displayName);
                } else {
                    elements.googleLoginBtn.innerHTML = `
                        <i class="fab fa-google"></i> تسجيل الدخول
                    `;
                    elements.googleLoginBtn.classList.remove('user-logged-in');
                    clearRatingsUI();
                    console.log('User logged out');
                }
            } catch (error) {
                console.error('خطأ في تحديث واجهة المستخدم للمصادقة:', error);
                showToast('خطأ في تحديث واجهة تسجيل الدخول', 'error');
            }
        }

        // وظائف المحادثة
        function toggleChatPopup() {
            console.log('toggleChatPopup called');
            if (!elements.chatPopup) {
                console.error('chatPopup element is missing');
                showToast('خطأ: نافذة المحادثة غير موجودة', 'error');
                return;
            }
            const isActive = elements.chatPopup.classList.toggle('active');
            elements.chatPopup.setAttribute('aria-hidden', !isActive);
            console.log('Chat popup active:', isActive);
            if (isActive) {
                if (elements.messageInput) {
                    elements.messageInput.focus();
                    console.log('Focused on messageInput');
                } else {
                    console.error('messageInput element is missing');
                    showToast('خطأ: حقل إدخال الرسالة غير موجود', 'error');
                }
                if (!elements.chatMessages.hasChildNodes()) {
                    console.log('No messages in chat, loading messages');
                    loadMessages();
                } else {
                    scrollChatToBottom();
                }
            } else {
                if (unsubscribeMessages) {
                    console.log('Unsubscribing from messages');
                    unsubscribeMessages();
                    unsubscribeMessages = null;
                }
                elements.chatMessages.innerHTML = '';
                hasMoreMessages = true;
                lastVisible = null;
                if (elements.loadMoreBtn) {
                    elements.loadMoreBtn.style.display = 'none';
                    console.log('Load more button hidden');
                }
            }
        }

        function scrollChatToBottom() {
            if (elements.chatMessages) {
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
                console.log('Scrolled chat to bottom');
            } else {
                console.error('chatMessages element is missing');
                showToast('خطأ: منطقة الرسائل غير موجودة', 'error');
            }
        }

        async function sendMessage() {
            console.log('sendMessage called');
            if (!firebaseInitialized) {
                console.error('Firebase not initialized');
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                return;
            }

            const user = auth.currentUser;
            if (!user) {
                console.error('No authenticated user');
                showToast('يرجى تسجيل الدخول لإرسال الرسائل', 'error');
                return;
            }

            if (!elements.messageInput) {
                console.error('messageInput element is missing');
                showToast('خطأ: حقل إدخال الرسالة غير موجود', 'error');
                return;
            }

            const messageText = elements.messageInput.value.trim();
            if (!messageText) {
                console.error('Message text is empty');
                showToast('يرجى إدخال رسالة غير فارغة', 'error');
                return;
            }

            if (messageText.length > 500) {
                console.error('Message text exceeds 500 characters');
                showToast('الرسالة طويلة جدًا، الحد الأقصى 500 حرف', 'error');
                return;
            }

            try {
                elements.sendMessageBtn.disabled = true;
                console.log('Sending message:', messageText);
                await addDoc(collection(db, 'messages'), {
                    text: sanitizeInput(messageText),
                    userId: user.uid,
                    userName: sanitizeInput(user.displayName || 'مستخدم'),
                    userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                    timestamp: serverTimestamp()
                });
                console.log('Message sent successfully');
                elements.messageInput.value = '';
                scrollChatToBottom();
                showToast('تم إرسال الرسالة بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في إرسال الرسالة:', error.code, error.message);
                if (error.code === 'permission-denied') {
                    showToast('ليس لديك إذن لإرسال الرسائل، تحقق من إعدادات Firebase', 'error');
                } else if (error.code === 'unavailable') {
                    showToast('Firestore غير متاح، تحقق من اتصالك بالإنترنت', 'error');
                } else {
                    showToast('حدث خطأ أثناء إرسال الرسالة: ' + error.message, 'error');
                }
            } finally {
                elements.sendMessageBtn.disabled = false;
                console.log('sendMessageBtn re-enabled');
            }
        }

        async function loadMessages() {
            console.log('loadMessages called');
            if (!firebaseInitialized) {
                console.error('Firebase not initialized');
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                return;
            }

            if (!hasMoreMessages) {
                console.log('No more messages to load');
                showToast('لا توجد رسائل إضافية لتحميلها', 'info');
                return;
            }

            if (!elements.chatLoading || !elements.chatMessages) {
                console.error('chatLoading or chatMessages element is missing');
                showToast('خطأ: عناصر المحادثة غير موجودة', 'error');
                return;
            }

            elements.chatLoading.classList.add('active');
            console.log('chatLoading activated');
            let messagesQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'desc'), // Changed to 'desc' for newest messages first
                limit(messagesPerPage)
            );

            if (lastVisible) {
                messagesQuery = query(messagesQuery, startAfter(lastVisible));
                console.log('Loading messages after lastVisible');
            }

            try {
                unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                    console.log('onSnapshot triggered, docs count:', snapshot.size);
                    if (snapshot.empty) {
                        console.log('No messages found');
                        hasMoreMessages = false;
                        elements.loadMoreBtn.style.display = 'none';
                        elements.chatLoading.classList.remove('active');
                        showToast('لا توجد رسائل لتحميلها', 'info');
                        return;
                    }

                    const messages = [];
                    snapshot.forEach((doc) => {
                        messages.push({ id: doc.id, ...doc.data() });
                        lastVisible = doc;
                    });
                    console.log('Messages loaded:', messages.length);

                    // Clear existing messages to avoid duplicates
                    if (!lastVisible) {
                        elements.chatMessages.innerHTML = '';
                    }

                    messages.forEach((msg) => {
                        const messageElement = document.createElement('div');
                        messageElement.className = `message ${msg.userId === auth.currentUser?.uid ? 'user-message' : ''}`;
                        messageElement.innerHTML = `
                            <div class="message-header">
                                <img src="${msg.userPhoto || 'https://via.placeholder.com/30'}" alt="صورة المستخدم" class="message-avatar">
                                <span class="message-sender">${sanitizeInput(msg.userName || 'مستخدم')}</span>
                                <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
                            </div>
                            <p class="message-text">${sanitizeInput(msg.text)}</p>
                        `;
                        elements.chatMessages.appendChild(messageElement);
                    });

                    elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
                    elements.chatLoading.classList.remove('active');
                    console.log('chatLoading deactivated');
                    scrollChatToBottom();
                }, (error) => {
                    console.error('خطأ في تحميل الرسائل:', interviewing_user: 1,
                    content: "هااااااااا"
                });
            } catch (error) {
                console.error('خطأ في إعداد مستمع الرسائل:', error.code, error.message);
                if (error.code === 'permission-denied') {
                    showToast('ليس لديك إذن لقراءة الرسائل، تحقق من إعدادات Firebase', 'error');
                } else if (error.code === 'unavailable') {
                    showToast('Firestore غير متاح، تحقق من اتصالك بالإنترنت', 'error');
                } else {
                    showToast('حدث خطأ أثناء تحميل الرسائل: ' + error.message, 'error');
                }
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
                const ratingRef = doc(db, 'ratings', `${linkId}_${user.uid}`);
                await setDoc(ratingRef, {
                    userId: user.uid,
                    linkId: linkId,
                    rating: ratingValue,
                    timestamp: serverTimestamp()
                });
                showToast('تم تسجيل تقييمك بنجاح', 'success');
                await updateRatingUI(linkId);
            } catch (error) {
                console.error('خطأ في تسجيل التقييم:', error.code, error.message);
                if (error.code === 'permission-denied') {
                    showToast('ليس لديك إذن لتسجيل التقييم', 'error');
                } else {
                    showToast('حدث خطأ أثناء تسجيل التقييم: ' + error.message, 'error');
                }
            }
        }

        async function updateRatingUI(linkId) {
            if (!firebaseInitialized) {
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                return;
            }

            try {
                const ratingsQuery = query(collection(db, 'ratings'), where('linkId', '==', linkId));
                const ratingsSnapshot = await getDocs(ratingsQuery);
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
                showToast('حدث خطأ أثناء تحديث التقييم: ' + error.message, 'error');
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

        // تهيئة التقييمات لجميع الموارد
        function initializeRatings() {
            if (!firebaseInitialized) {
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                return;
            }

            document.querySelectorAll('.resource-card').forEach(card => {
                const linkId = card.dataset.linkId;
                if (!unsubscribeRatings[linkId]) {
                    unsubscribeRatings[linkId] = onSnapshot(
                        query(collection(db, 'ratings'), where('linkId', '==', linkId)),
                        () => updateRatingUI(linkId),
                        (error) => {
                            console.error(`خطأ في مستمع تقييم ${linkId}:`, error.code, error.message);
                            showToast('حدث خطأ أثناء تحميل التقييمات: ' + error.message, 'error');
                        }
                    );
                }
            });
        }

        // إعداد مستمعي الأحداث
        function setupEventListeners() {
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
                console.log('Mobile menu button listener attached');
            }
            if (elements.viewRoadmapBtn) {
                elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
                console.log('View roadmap button listener attached');
            }
            if (elements.closeRoadmap) {
                elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);
                console.log('Close roadmap button listener attached');
            }
            if (elements.googleLoginBtn) {
                elements.googleLoginBtn.addEventListener('click', handleAuth);
                console.log('Google login button listener attached');
            }
            if (elements.chatBtn) {
                elements.chatBtn.addEventListener('click', toggleChatPopup);
                console.log('Chat button listener attached');
            }
            if (elements.closeChat) {
                elements.closeChat.addEventListener('click', toggleChatPopup);
                console.log('Close chat button listener attached');
            }
            if (elements.sendMessageBtn) {
                elements.sendMessageBtn.addEventListener('click', sendMessage);
                console.log('Send message button listener attached');
            }
            if (elements.messageInput) {
                elements.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        console.log('Enter key pressed in messageInput');
                        sendMessage();
                    }
                });
                console.log('Message input keypress listener attached');
            }
            if (elements.loadMoreBtn) {
                elements.loadMoreBtn.addEventListener('click', loadMessages);
                console.log('Load more button listener attached');
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
            onAuthStateChanged(auth, handleAuthStateChanged);
            window.addEventListener('resize', closeMobileMenu);
        }

        // وظيفة لإغلاق قائمة الجوال
        function toggleMobileMenu() {
            if (elements.navLinks) {
                elements.navLinks.classList.toggle('active');
                console.log('Mobile menu toggled');
            }
        }

        function closeMobileMenu() {
            if (elements.navLinks && window.innerWidth > 768) {
                elements.navLinks.classList.remove('active');
                console.log('Mobile menu closed on resize');
            }
        }

        function toggleRoadmapPopup() {
            if (elements.roadmapPopup) {
                elements.roadmapPopup.classList.toggle('active');
                console.log('Roadmap popup toggled');
            }
        }

        // تهيئة التطبيق
        try {
            setupEventListeners();
            if (auth.currentUser) {
                initializeRatings();
                console.log('User is authenticated, initializing ratings');
            }
        } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            showToast('حدث خطأ أثناء تهيئة التطبيق: ' + error.message, 'error');
        }

        // تنظيف مستمعي الأحداث عند إغلاق الصفحة
        window.addEventListener('unload', () => {
            if (unsubscribeMessages) unsubscribeMessages();
            Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
            console.log('Cleaned up event listeners on unload');
        });
    } catch (error) {
        console.error('خطأ في استيراد المكتبات:', error);
        showToast('خطأ في تحميل المكتبات الأساسية، يرجى إعادة تحميل الصفحة', 'error');
    }
});
