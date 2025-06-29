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
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
    // استيراد DOMPurify
    const DOMPurify = await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js");

    // تهيئة التطبيق
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const analytics = getAnalytics(app);
    const db = getFirestore(app);

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
                document.getElementById(contentId).classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                elements.tabs.forEach(t => {
                    if (t !== tab) t.setAttribute('aria-selected', 'false');
                });
            });
        });
    }

    setupTabs();

    // إعداد Tooltips باستخدام Popper.js
    function setupTooltips() {
        document.querySelectorAll('.features-tooltip').forEach(tooltip => {
            const popperInstance = Popper.createPopper(tooltip, tooltip, {
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
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
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
                if (e.key === 'Enter') sendMessage();
            });
        }
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', loadMessages);
        }
        elements.ratingStars.forEach(star => {
            star.addEventListener('click', handleRating);
            star.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleRating(e);
                }
            });
        });
        auth.onAuthStateChanged(handleAuthStateChanged);
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
            elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars" aria-label="فتح القائمة"></i>';
        }
    }

    // وظائف خارطة الطريق
    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) {
            const isActive = elements.roadmapPopup.classList.toggle('active');
            elements.roadmapPopup.setAttribute('aria-hidden', !isActive);
        }
    }

    // وظائف المصادقة
    async function handleAuth() {
        const user = auth.currentUser;
        if (user) {
            try {
                await signOut(auth);
                showToast('تم تسجيل الخروج بنجاح');
            } catch (error) {
                console.error('خطأ في تسجيل الخروج:', error);
                showToast('حدث خطأ أثناء تسجيل الخروج');
            }
        } else {
            try {
                await signInWithPopup(auth, provider);
                showToast('تم تسجيل الدخول بنجاح');
            } catch (error) {
                console.error('خطأ في تسجيل الدخول:', error);
                showToast('حدث خطأ أثناء تسجيل الدخول');
            }
        }
    }

    function handleAuthStateChanged(user) {
        if (elements.googleLoginBtn) {
            if (user) {
                elements.googleLoginBtn.innerHTML = `
                    <img src="${user.photoURL || 'https://via.placeholder.com/30'}" alt="صورة المستخدم" class="user-avatar">
                    <span>${user.displayName || 'مستخدم'}</span>
                    <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>
                `;
                elements.googleLoginBtn.classList.add('user-logged-in');
            } else {
                elements.googleLoginBtn.innerHTML = `
                    <i class="fab fa-google"></i> تسجيل الدخول
                `;
                elements.googleLoginBtn.classList.remove('user-logged-in');
            }
        }
    }

    // وظائف المحادثة
    function toggleChatPopup() {
        if (elements.chatPopup) {
            const isActive = elements.chatPopup.classList.toggle('active');
            elements.chatPopup.setAttribute('aria-hidden', !isActive);
            if (isActive) {
                elements.messageInput.focus();
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
                elements.loadMoreBtn.style.display = 'none';
            }
        }
    }

    function scrollChatToBottom() {
        if (elements.chatMessages) {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }
    }

    async function sendMessage() {
        const user = auth.currentUser;
        if (!user) {
            showToast('يرجى تسجيل الدخول لإرسال الرسائل');
            return;
        }

        const messageText = elements.messageInput.value.trim();
        if (!messageText) {
            showToast('يرجى إدخال رسالة غير فارغة');
            return;
        }

        if (messageText.length > 500) {
            showToast('الرسالة طويلة جدًا، الحد الأقصى 500 حرف');
            return;
        }

        try {
            elements.sendMessageBtn.disabled = true;
            await addDoc(collection(db, 'messages'), {
                text: DOMPurify.sanitize(messageText),
                userId: user.uid,
                userName: user.displayName || 'مستخدم',
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });
            elements.messageInput.value = '';
            scrollChatToBottom();
            showToast('تم إرسال الرسالة بنجاح');
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
            showToast('حدث خطأ أثناء إرسال الرسالة');
        } finally {
            elements.sendMessageBtn.disabled = false;
        }
    }

    async function loadMessages() {
        if (!hasMoreMessages) return;

        elements.chatLoading.classList.add('active');
        let messagesQuery = query(
            collection(db, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(messagesPerPage)
        );

        if (lastVisible) {
            messagesQuery = query(messagesQuery, startAfter(lastVisible));
        }

        try {
            unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
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
                            <span class="message-sender">${DOMPurify.sanitize(msg.userName)}</span>
                            <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
                        </div>
                        <p class="message-text">${DOMPurify.sanitize(msg.text)}</p>
                    `;
                    elements.chatMessages.appendChild(messageElement);
                });

                elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
                elements.chatLoading.classList.remove('active');
                scrollChatToBottom();
            }, (error) => {
                console.error('خطأ في تحميل الرسائل:', error);
                showToast('حدث خطأ أثناء تحميل الرسائل');
                elements.chatLoading.classList.remove('active');
            });
        } catch (error) {
            console.error('خطأ في إعداد مستمع الرسائل:', error);
            showToast('حدث خطأ أثناء تحميل الرسائل');
            elements.chatLoading.classList.remove('active');
        }
    }

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'الآن';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // وظائف التقييم
    async function handleRating(event) {
        const user = auth.currentUser;
        if (!user) {
            showToast('يرجى تسجيل الدخول لتقييم الموارد');
            return;
        }

        const star = event.target;
        const ratingValue = parseInt(star.dataset.value);
        const linkId = star.closest('.resource-card').dataset.linkId;

        try {
            const ratingRef = doc(db, 'ratings', `${linkId}_${user.uid}`);
            await setDoc(ratingRef, {
                userId: user.uid,
                linkId: linkId,
                rating: ratingValue,
                timestamp: serverTimestamp()
            });
            showToast('تم تسجيل تقييمك بنجاح');
            updateRatingUI(linkId);
        } catch (error) {
            console.error('خطأ في تسجيل التقييم:', error);
            showToast('حدث خطأ أثناء تسجيل التقييم');
        }
    }

    async function updateRatingUI(linkId) {
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
            console.error('خطأ في تحديث واجهة التقييم:', error);
            showToast('حدث خطأ أثناء تحديث التقييم');
        }
    }

    function updateStarUI(linkId, averageRating) {
        const stars = document.querySelectorAll(`[data-link-id="${linkId}"] .rating-stars i`);
        stars.forEach(star => {
            const value = parseInt(star.dataset.value);
            star.classList.toggle('rated', value <= Math.round(averageRating));
        });
    }

    // تهيئة التقييمات لجميع الموارد
    function initializeRatings() {
        document.querySelectorAll('.resource-card').forEach(card => {
            const linkId = card.dataset.linkId;
            if (!unsubscribeRatings[linkId]) {
                unsubscribeRatings[linkId] = onSnapshot(
                    query(collection(db, 'ratings'), where('linkId', '==', linkId)),
                    () => updateRatingUI(linkId),
                    (error) => {
                        console.error(`خطأ في مستمع تقييم ${linkId}:`, error);
                        showToast('حدث خطأ أثناء تحميل التقييمات');
                    }
                );
            }
        });
    }

    initializeRatings();

    // تنظيف مستمعي التقييمات عند إغلاق الصفحة
    window.addEventListener('unload', () => {
        if (unsubscribeMessages) unsubscribeMessages();
        Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
    });
});
