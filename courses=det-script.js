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

    // متغيرات عالمية
    let unsubscribeMessages = null;
    let unsubscribeRatings = {};
    let hasMoreMessages = true;
    let lastVisible = null;
    const messagesPerPage = 10;

    // استيراد مكتبات Firebase
    let firebaseInitialized = false;
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
        const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
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
            ratingStars: document.querySelectorAll('.rating-stars i')
        };

        // التحقق من وجود العناصر
        if (!elements.googleLoginBtn || !elements.chatBtn) {
            console.error('عناصر DOM مفقودة:', { googleLoginBtn: !!elements.googleLoginBtn, chatBtn: !!elements.chatBtn });
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

        // إعداد Tooltips باستخدام Popper.js
        function setupTooltips() {
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
                    showToast('تم تسجيل الدخول بنجاح', 'success');
                }
            } catch (error) {
                console.error('خطأ في عملية المصادقة:', error.code, error.message);
                showToast(`خطأ في تسجيل الدخول/الخروج: ${error.message}`, 'error');
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
                    elements.googleLoginBtn.classList.add('login-success-animation');
                    setTimeout(() => {
                        elements.googleLoginBtn.classList.remove('login-success-animation');
                    }, 2000);
                    initializeRatings();
                } else {
                    elements.googleLoginBtn.innerHTML = `<i class="fab fa-google"></i> تسجيل الدخول`;
                    elements.googleLoginBtn.classList.remove('user-logged-in');
                    clearRatingsUI();
                }
            } catch (error) {
                console.error('خطأ في تحديث واجهة المستخدم للمصادقة:', error);
                showToast('خطأ في تحديث واجهة تسجيل الدخول', 'error');
            }
        }

        // إعداد مستمع حالة المصادقة
        onAuthStateChanged(auth, handleAuthStateChanged);

        // وظائف المحادثة
        function toggleChatPopup() {
            if (!elements.chatPopup) return;
            const isActive = elements.chatPopup.classList.toggle('active');
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
                console.error('Firebase غير مهيأ');
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
                await addDoc(collection(db, 'messages'), {
                    text: DOMPurify.sanitize(messageText),
                    userId: user.uid,
                    userName: DOMPurify.sanitize(user.displayName || 'مستخدم'),
                    userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                    timestamp: serverTimestamp()
                });
                elements.messageInput.value = '';
                scrollChatToBottom();
                showToast('تم إرسال الرسالة بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في إرسال الرسالة:', error.code, error.message);
                showToast(`خطأ في إرسال الرسالة: ${error.message}`, 'error');
            } finally {
                elements.sendMessageBtn.disabled = false;
            }
        }

        async牢 loadMessages() {
            if (!firebaseInitialized) {
                showToast('خطأ في تهيئة Firebase، يرجى إعادة تحميل الصفحة', 'error');
                return;
            }

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
                showToast('خطأ في تحديد المورد', 'error');
                return;
            }

            const linkId = resourceCard.dataset.linkId;

            try {
                // التحقق من وجود تقييم سابق
                const ratingRef = doc(db, 'ratings', `${linkId}_${user.uid}`);
                const ratingDoc = await getDoc(ratingRef);
                if (ratingDoc.exists()) {
                    showToast('لقد قمت بتقييم هذا المورد مسبقًا', 'info');
                    return;
                }

                // تسجيل التقييم
                await setDoc(ratingRef, {
                    userId: user.uid,
                    linkId: linkId,
                    rating: ratingValue,
                    timestamp: serverTimestamp()
                });

                // تعطيل نجوم التقييم بعد التقييم
                const stars = resourceCard.querySelectorAll('.rating-stars i');
                stars.forEach(s => {
                    s.classList.add('disabled');
                    s.style.pointerEvents = 'none';
                });

                showToast('تم تسجيل تقييمك بنجاح', 'success');
                await updateRatingUI(linkId);
            } catch (error) {
                console.error('خطأ في تسجيل التقييم:', error.code, error.message);
                showToast(`خطأ في تسجيل التقييم: ${error.message}`, 'error');
            }
        }

        async function updateRatingUI(linkId) {
            const ratingsQuery = query(collection(db, 'ratings'), where('linkId', '==', linkId));
            const snapshot = await getDocs(ratingsQuery);
            let total = 0;
            let count = 0;

            snapshot.forEach(doc => {
                total += doc.data().rating;
                count++;
            });

            const avg = count > 0 ? (total / count).toFixed(1) : '0.0';
            const ratingElement = document.querySelector(`[data-link-id="${linkId}"] .average-rating`);
            const countElement = document.querySelector(`[data-link-id="${linkId}"] .rating-count`);

            if (ratingElement && countElement) {
                ratingElement.textContent = avg;
                countElement.textContent = `(${count} تقييم)`;
                updateStarUI(linkId, parseFloat(avg));
            }
        }

        function updateStarUI(linkId, averageRating) {
            const stars = document.querySelectorAll(`[data-link-id="${linkId}"] .rating-stars i`);
            stars.forEach(star => {
                const value = parseInt(star.dataset.value);
                star.classList.toggle('rated', value <= Math.round(averageRating));
                // التحقق من وجود تقييم سابق للمستخدم الحالي
                if (auth.currentUser) {
                    getDoc(doc(db, 'ratings', `${linkId}_${auth.currentUser.uid}`)).then(ratingDoc => {
                        if (ratingDoc.exists()) {
                            star.classList.add('disabled');
                            star.style.pointerEvents = 'none';
                        }
                    });
                }
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
                    stars.forEach(star => {
                        star.classList.remove('rated', 'disabled');
                        star.style.pointerEvents = 'auto';
                    });
                }
            });
        }

        function initializeRatings() {
            document.querySelectorAll('.resource-card').forEach(card => {
                const linkId = card.dataset.linkId;
                if (!unsubscribeRatings[linkId]) {
                    unsubscribeRatings[linkId] = onSnapshot(
                        query(collection(db, 'ratings'), where('linkId', '==', linkId)),
                        () => updateRatingUI(linkId)
                    );
                }
                // التحقق من التقييمات السابقة للمستخدم
                if (auth.currentUser) {
                    getDoc(doc(db, 'ratings', `${linkId}_${auth.currentUser.uid}`)).then(ratingDoc => {
                        if (ratingDoc.exists()) {
                            const stars = card.querySelectorAll('.rating-stars i');
                            stars.forEach(star => {
                                star.classList.add('disabled');
                                star.style.pointerEvents = 'none';
                            });
                        }
                    });
                }
            });

            // إضافة مستمع الأحداث للنجوم
            elements.ratingStars.forEach(star => {
                star.addEventListener('click', handleRating);
            });
        }

        // إعداد مستمعات الأحداث
        function setupEventListeners() {
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
            if (elements.viewRoadmapBtn) {
                elements.viewRoadmapBtn.addEventListener('click', () => {
                    if (elements.roadmapPopup) {
                        elements.roadmapPopup.classList.toggle('active');
                        elements.roadmapPopup.setAttribute('aria-hidden', !elements.roadmapPopup.classList.contains('active'));
                    }
                });
            }
            if (elements.closeRoadmap) {
                elements.closeRoadmap.addEventListener('click', () => {
                    if (elements.roadmapPopup) {
                        elements.roadmapPopup.classList.remove('active');
                        elements.roadmapPopup.setAttribute('aria-hidden', 'true');
                    }
                });
            }
            if (elements.loadMoreBtn) {
                elements.loadMoreBtn.addEventListener('click', loadMessages);
            }
        }

        // بدء التطبيق
        try {
            setupEventListeners();
            if (auth.currentUser) {
                initializeRatings();
            }
        } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            showToast('حدث خطأ أثناء تهيئة التطبيق', 'error');
        }

        // تنظيف المستمعات عند إغلاق الصفحة
        window.addEventListener('unload', () => {
            if (unsubscribeMessages) unsubscribeMessages();
            Object.values(unsubscribeRatings).forEach(unsub => unsub());
        });

    } catch (error) {
        console.error('خطأ في تحميل Firebase أو المكتبات الأساسية:', error);
        showToast('خطأ في تحميل Firebase أو المكتبات الأساسية', 'error');
    }
});
