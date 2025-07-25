document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded, initializing application');

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
    let auth, db, provider;

    // التحقق من توفر DOMPurify
    let DOMPurify = window.DOMPurify;
    if (!DOMPurify || !DOMPurify.sanitize) {
        console.warn('DOMPurify not available, using fallback sanitization');
        DOMPurify = { sanitize: (input) => input ? input.toString().replace(/</g, '<').replace(/>/g, '>') : '' };
    }

    // تحميل مكتبات Firebase
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
        const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();
        getAnalytics(app);
        db = getFirestore(app);
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error loading Firebase libraries:', error);
        showToast('خطأ في تحميل مكتبات Firebase، يرجى إعادة تحميل الصفحة', 'error');
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
        ratingStars: document.querySelectorAll('.rating-stars i')
    };

    // التحقق من وجود عناصر DOM
    const requiredElements = [
        'googleLoginBtn', 'chatBtn', 'chatPopup', 'chatMessages', 
        'messageInput', 'sendMessageBtn', 'closeChat', 'chatLoading', 'loadMoreBtn'
    ];
    for (const key of requiredElements) {
        if (!elements[key]) {
            console.error(`Missing DOM element: ${key}`);
            showToast(`خطأ: عنصر ${key} غير موجود في الصفحة`, 'error');
            return;
        }
    }
    console.log('All required DOM elements found');

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
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    // إعداد علامات التبويب
    function setupTabs() {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                event.stopPropagation();
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
                    console.error('Tab content missing:', contentId);
                }
            });
        });
    }

    setupTabs();

    // إعداد Tooltips باستخدام Popper.js
    function setupTooltips() {
        if (typeof Popper === 'undefined') {
            console.warn('Popper.js not loaded, skipping tooltips setup');
            return;
        }
        document.querySelectorAll('.features-tooltip').forEach(tooltip => {
            const popperInstance = Popper.createPopper(tooltip, tooltip.querySelector('.tooltip-content') || tooltip, {
                placement: 'top',
                modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
            });
            tooltip.addEventListener('mouseenter', () => {
                tooltip.setAttribute('data-show', '');
                popperInstance.update();
            });
            tooltip.addEventListener('mouseleave', () => tooltip.removeAttribute('data-show'));
            tooltip.addEventListener('focus', () => {
                tooltip.setAttribute('data-show', '');
                popperInstance.update();
            });
            tooltip.addEventListener('blur', () => tooltip.removeAttribute('data-show'));
        });
    }

    setupTooltips();

    // وظائف المصادقة
    function sanitizeInput(input) {
        try {
            return DOMPurify.sanitize(input || '');
        } catch (error) {
            console.error('Error sanitizing input:', error);
            return input ? input.toString().replace(/</g, '<').replace(/>/g, '>') : '';
        }
    }

    async function handleAuth(event) {
        event.stopPropagation();
        if (!firebaseInitialized) {
            console.error('Firebase not initialized');
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }
        try {
            const user = auth.currentUser;
            if (user) {
                await signOut(auth);
                showToast('تم تسجيل الخروج بنجاح', 'success');
            } else {
                await signInWithPopup(auth, provider);
                showToast('تم تسجيل الدخول بنجاح', 'success');
            }
        } catch (error) {
            console.error('Authentication error:', error.code, error.message);
            if (error.code === 'auth/network-request-failed') {
                showToast('فشل الاتصال بالشبكة، يرجى التحقق من الإنترنت', 'error');
            } else if (error.code === 'auth/popup-closed-by-user') {
                showToast('تم إغلاق نافذة تسجيل الدخول', 'error');
            } else {
                showToast('حدث خطأ أثناء تسجيل الدخول/الخروج: ' + error.message, 'error');
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
            console.error('Error updating auth UI:', error);
            showToast('خطأ في تحديث واجهة تسجيل الدخول', 'error');
        }
    }

    // وظائف المحادثة
    function toggleChatPopup(event) {
        if (event) event.stopPropagation();
        console.log('toggleChatPopup called');
        if (!elements.chatPopup) {
            console.error('chatPopup element missing');
            showToast('خطأ: نافذة المحادثة غير موجودة', 'error');
            return;
        }

        const isCurrentlyActive = elements.chatPopup.classList.contains('active');
        console.log('Current chat popup state:', isCurrentlyActive);

        if (!isCurrentlyActive) {
            elements.chatPopup.classList.add('active');
            elements.chatPopup.setAttribute('aria-hidden', 'false');
            console.log('Chat popup opened');
            const computedStyle = window.getComputedStyle(elements.chatPopup);
            console.log('Chat popup display style:', computedStyle.display);
            if (computedStyle.display !== 'flex') {
                console.error('Chat popup not visible, forcing display');
                elements.chatPopup.style.display = 'flex';
            }
            if (elements.messageInput) {
                elements.messageInput.focus();
                console.log('Focused on messageInput');
            }
            if (!elements.chatMessages.hasChildNodes()) {
                console.log('No messages in chat, loading messages');
                loadMessages();
            } else {
                scrollChatToBottom();
            }
        } else {
            elements.chatPopup.classList.remove('active');
            elements.chatPopup.setAttribute('aria-hidden', 'true');
            elements.chatPopup.style.display = 'none';
            console.log('Chat popup closed');
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
            }
        }
    }

    function scrollChatToBottom() {
        if (elements.chatMessages) {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            console.log('Scrolled chat to bottom');
        } else {
            console.error('chatMessages element missing');
            showToast('خطأ: منطقة الرسائل غير موجودة', 'error');
        }
    }

    let lastVisible = null;
    let unsubscribeMessages = null;
    const messagesPerPage = 20;
    let hasMoreMessages = true;

    async function sendMessage(event) {
        if (event) event.stopPropagation();
        console.log('sendMessage called');
        if (!firebaseInitialized) {
            console.error('Firebase not initialized');
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }
        if (!auth.currentUser) {
            console.error('No authenticated user');
            showToast('يرجى تسجيل الدخول لإرسال الرسائل', 'error');
            return;
        }
        if (!elements.messageInput) {
            console.error('messageInput element missing');
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
                userId: auth.currentUser.uid,
                userName: sanitizeInput(auth.currentUser.displayName || 'مستخدم'),
                userPhoto: auth.currentUser.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });
            console.log('Message sent successfully');
            elements.messageInput.value = '';
            scrollChatToBottom();
            showToast('تم إرسال الرسالة بنجاح', 'success');
        } catch (error) {
            console.error('Error sending message:', error.code, error.message);
            if (error.code === 'permission-denied') {
                showToast('ليس لديك إذن لإرسال الرسائل، تحقق من إعدادات Firebase', 'error');
            } else if (error.code === 'unavailable') {
                showToast('Firestore غير متاح، تحقق من اتصالك بالإنترنت', 'error');
            } else {
                showToast('حدث خطأ أثناء إرسال الرسالة', 'error');
            }
        } finally {
            elements.sendMessageBtn.disabled = false;
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
        elements.chatLoading.classList.add('active');
        let messagesQuery = query(
            collection(db, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(messagesPerPage)
        );
        if (lastVisible) {
            messagesQuery = query(messagesQuery, startAfter(lastVisible));
        }
        try {
            unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                console.log('onSnapshot triggered, docs count:', snapshot.size);
                if (snapshot.empty) {
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
                scrollChatToBottom();
            }, (error) => {
                console.error('Error loading messages:', error.code, error.message);
                if (error.code === 'permission-denied') {
                    showToast('ليس لديك إذن لقراءة الرسائل، تحقق من إعدادات Firebase', 'error');
                } else if (error.code === 'unavailable') {
                    showToast('Firestore غير متاح، تحقق من اتصالك بالإنترنت', 'error');
                } else {
                    showToast('حدث خطأ أثناء تحميل الرسائل', 'error');
                }
                elements.chatLoading.classList.remove('active');
            });
        } catch (error) {
            console.error('Error setting up messages listener:', error);
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
            console.error('Error formatting timestamp:', error);
            return 'غير متاح';
        }
    }

    // وظائف التقييم
    let unsubscribeRatings = {};

    async function handleRating(event) {
        if (!firebaseInitialized) {
            showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
            return;
        }
        if (!auth.currentUser) {
            showToast('يرجى تسجيل الدخول لتقييم الموارد', 'error');
            return;
        }
        const star = event.target;
        const ratingValue = parseInt(star.dataset.value);
        const resourceCard = star.closest('.resource-card');
        if (!resourceCard) {
            console.error('Resource card missing');
            showToast('خطأ في تحديد المورد', 'error');
            return;
        }
        const linkId = resourceCard.dataset.linkId;
        try {
            const ratingRef = doc(db, 'ratings', `${linkId}_${auth.currentUser.uid}`);
            await setDoc(ratingRef, {
                userId: auth.currentUser.uid,
                linkId: linkId,
                rating: ratingValue,
                timestamp: serverTimestamp()
            });
            showToast('تم تسجيل تقييمك بنجاح', 'success');
            await updateRatingUI(linkId);
        } catch (error) {
            console.error('Error saving rating:', error.code, error.message);
            showToast('حدث خطأ أثناء تسجيل التقييم', 'error');
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
            }
        } catch (error) {
            console.error('Error updating rating UI:', error);
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
                unsubscribeRatings[linkId] = onSnapshot(
                    query(collection(db, 'ratings'), where('linkId', '==', linkId)),
                    () => updateRatingUI(linkId),
                    (error) => {
                        console.error(`Error in rating listener for ${linkId}:`, error);
                        showToast('حدث خطأ أثناء تحميل التقييمات', 'error');
                    }
                );
            }
        });
    }

    // إعداد مستمعي الأحداث
    function setupEventListeners() {
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                elements.navLinks.classList.toggle('active');
                console.log('Mobile menu toggled');
            });
        }
        if (elements.viewRoadmapBtn) {
            elements.viewRoadmapBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                elements.roadmapPopup.classList.toggle('active');
                console.log('Roadmap popup toggled');
            });
        }
        if (elements.closeRoadmap) {
            elements.closeRoadmap.addEventListener('click', (event) => {
                event.stopPropagation();
                elements.roadmapPopup.classList.remove('active');
                console.log('Roadmap popup closed');
            });
        }
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.addEventListener('click', handleAuth);
            console.log('Google login button listener attached');
        }
        if (elements.chatBtn) {
            elements.chatBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log('Chat button clicked');
                toggleChatPopup(event);
            });
            console.log('Chat button listener attached');
        }
        if (elements.closeChat) {
            elements.closeChat.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log('Close chat button clicked');
                toggleChatPopup(event);
            });
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
                    sendMessage(e);
                }
            });
            console.log('Message input keypress listener attached');
        }
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                loadMessages();
            });
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
        elements.chatPopup.addEventListener('click', (event) => {
            if (event.target === elements.chatPopup) {
                console.log('Clicked outside chat popup, closing');
                toggleChatPopup(event);
            }
        });
        onAuthStateChanged(auth, handleAuthStateChanged);
        window.addEventListener('resize', () => {
            if (elements.navLinks && window.innerWidth > 768) {
                elements.navLinks.classList.remove('active');
                console.log('Mobile menu closed on resize');
            }
        });
    }

    // تهيئة التطبيق
    try {
        setupEventListeners();
        if (auth.currentUser) {
            initializeRatings();
            console.log('User is authenticated, initializing ratings');
        }
    } catch (error) {
        console.error('Error initializing application:', error);
        showToast('حدث خطأ أثناء تهيئة التطبيق', 'error');
    }

    // تنظيف مستمعي الأحداث
    window.addEventListener('unload', () => {
        if (unsubscribeMessages) unsubscribeMessages();
        Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
        console.log('Cleaned up event listeners on unload');
    });
});
