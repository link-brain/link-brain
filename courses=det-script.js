document.addEventListener('DOMContentLoaded', async function() {

    // 1. تعريف عناصر DOM الأساسية والمتغيرات العامة (معرفة فوراً)
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
        featuresBtns: document.querySelectorAll('.features-btn'),
        featuresPopup: document.getElementById('featuresPopup'),
        closeFeatures: document.getElementById('closeFeatures'),
        featuresList: document.getElementById('featuresList')
    };

    // التحقق من وجود العناصر الأساسية جدًا مبكرًا
    if (!elements.googleLoginBtn || !elements.chatBtn) {
        console.error('عناصر DOM مفقودة:', { googleLoginBtn: !!elements.googleLoginBtn, chatBtn: !!elements.chatBtn });
        // لا يمكن استدعاء showToast هنا لأنها قد لا تكون معرفة بعد
        return; // توقف التنفيذ إذا كانت العناصر الأساسية مفقودة
    }

    // تعيين السنة الحالية (لا يعتمد على Firebase)
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    // متغيرات Firebase ستُعرّف لاحقاً
    let auth, db, provider;
    let firebaseInitialized = false;

    // متغيرات لتتبع الصفحات والتقييمات الخاصة بـ Firebase
    let lastVisible = null;
    let unsubscribeMessages = null;
    const messagesPerPage = 20;
    let hasMoreMessages = true;
    let DOMPurify; // ستعرف بعد الاستيراد
    let unsubscribeRatings = {}; // تعريفها في النطاق الخارجي

    // --- 2. تعريف جميع الدوال المساعدة للواجهة (معرفة قبل أي استدعاء لها) ---
    // هذه الدوال لا تعتمد على Firebase لذا يمكن تعريفها هنا.

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

    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) {
            const isActive = elements.roadmapPopup.classList.toggle('active');
            elements.roadmapPopup.setAttribute('aria-hidden', !isActive);
        }
    }

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

    function setupTooltips() {
        document.querySelectorAll('.features-tooltip').forEach(tooltip => {
            const popperInstance = Popper.createPopper(tooltip, tooltip.querySelector('.tooltip-content') || tooltip, {
                placement: 'top',
                modifiers: [
                    { name: 'offset', options: { offset: [0, 8] } },
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

    // وظائف ميزة عرض الميزات (تم دمجها هنا)
    function openFeaturesPopup(event) {
        if (!elements.featuresPopup || !elements.featuresList) return;
        const featuresText = event.target.dataset.features;
        if (featuresText) {
            elements.featuresList.innerHTML = '';
            const featuresArray = featuresText.split('\n');
            featuresArray.forEach(feature => {
                const sanitizedFeature = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(feature.trim()) : feature.trim();
                const li = document.createElement('li');
                li.textContent = sanitizedFeature;
                elements.featuresList.appendChild(li);
            });
            elements.featuresPopup.classList.add('active');
            elements.featuresPopup.setAttribute('aria-hidden', 'false');
        }
    }

    function closeFeaturesPopup() {
        if (elements.featuresPopup) {
            elements.featuresPopup.classList.remove('active');
            elements.featuresPopup.setAttribute('aria-hidden', 'true');
        }
    }

    // --- 3. إعداد مستمعي الأحداث الأساسية (غير المعتمدة على Firebase) ---
    //    هذه تعمل حتى لو فشل تحميل Firebase
    function setupBaseEventListeners() {
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }
        if (elements.viewRoadmapBtn) {
            elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
        }
        if (elements.closeRoadmap) {
            elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);
        }
        if (elements.featuresBtns) {
            elements.featuresBtns.forEach(button => {
                button.addEventListener('click', openFeaturesPopup);
            });
        }
        if (elements.closeFeatures) {
            elements.closeFeatures.addEventListener('click', closeFeaturesPopup);
        }
        setupTabs();
        setupTooltips();
        window.addEventListener('resize', closeMobileMenu);
    }

    // استدعاء setupBaseEventListeners فوراً
    setupBaseEventListeners();


    // --- 4. تهيئة Firebase واستيراد مكتباته داخل كتلة try...catch ---
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
            authDomain: "edumates-983dd.firebaseapp.com",
            projectId: "edumates-983dd",
            storageBucket: "edumates-983dd.firebasestorage.app",
            messagingSenderId: "172548876353",
            appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
            measurementId: "G-L1KCZTW8R9"
        };

        // استيراد المكتبات
        const firebaseAppModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const firebaseAnalyticsModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
        const firestoreModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
        const domPurifyModule = await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js");

        // تعيين المكتبات المستوردة للمتغيرات العامة
        const { initializeApp } = firebaseAppModule;
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = firebaseAuthModule;
        const { getAnalytics } = firebaseAnalyticsModule;
        const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc } = firestoreModule;
        DOMPurify = domPurifyModule.default; // DOMPurify عادة ما يتم استيراده كافتراضي

        // تهيئة التطبيق بعد الاستيراد الناجح
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();
        const analytics = getAnalytics(app); //Analytics is initialized but not used in this script
        db = getFirestore(app);
        firebaseInitialized = true;

        // --- 5. تعريف جميع الدوال التي تعتمد على Firebase هنا ---
        //    الآن وبعد أن أصبحت Firebase و DOMPurify مهيأة ومعرفة، يمكن تعريف هذه الدوال بأمان.

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
            console.log('handleAuthStateChanged fired. User object received:', user); // سطر المراقبة 1
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

        // ملاحظة: toggleChatPopup تم تعريفها بالفعل في النطاق الخارجي (الجزء 2)
        // ولكننا نحتاج دوال التابعة لها هنا

        async function sendMessage() {
            console.log('sendMessage called. auth.currentUser is:', auth.currentUser); // سطر المراقبة 2
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
                showToast('حدث خطأ أثناء إرسال الرسالة', 'error');
            } finally {
                elements.sendMessageBtn.disabled = false;
            }
        }

        function scrollChatToBottom() {
            if (elements.chatMessages) {
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            }
        }

        async function loadMessages() {
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

        async function handleRating(event) {
            event.stopPropagation();
            event.preventDefault();
            console.log('handleRating called. auth.currentUser is:', auth.currentUser); // سطر المراقبة 3
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
                }, { merge: true });
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
                const ratingsQuery = query(collection(db, 'ratings'), where('linkId', '==', linkId));
                const ratingsSnapshot = await getDocs(ratingsQuery);
                let totalRating = 0;
                let ratingCount = 0;
                ratingsSnapshot.forEach(doc => {
                    console.log(`Rating for ${linkId} from user ${doc.data().userId}: ${doc.data().rating}`);
                    totalRating += doc.data().rating;
                    ratingCount++;
                });
                const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
                console.log(`Calculated average for ${linkId}: ${averageRating} from ${ratingCount} ratings.`);
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
                    unsubscribeRatings[linkId] = onSnapshot(
                        query(collection(db, 'ratings'), where('linkId', '==', linkId)),
                        () => updateRatingUI(linkId),
                        (error) => {
                            console.error(`خطأ في مستمع تقييم ${linkId}:`, error.code, error.message);
                            showToast('حدث خطأ أثناء تحميل التقييمات', 'error');
                        }
                    );
                }
            });
        }

        // --- 6. إعداد مستمعي الأحداث المعتمدة على Firebase ---
        //    يجب أن يتم هذا الجزء *فقط* بعد التأكد من تهيئة Firebase ودوائله بنجاح.
        function setupFirebaseEventListeners() {
            // مستمع زر تسجيل الدخول
            if (elements.googleLoginBtn) {
                elements.googleLoginBtn.addEventListener('click', handleAuth);
            }
            // مستمع زر الدردشة
            if (elements.chatBtn) {
                elements.chatBtn.addEventListener('click', toggleChatPopup);
            }
            if (elements.closeChat) {
                elements.closeChat.addEventListener('click', toggleChatPopup);
            }
            // مستمع زر إرسال الرسالة
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
            // مستمع زر تحميل المزيد في الدردشة
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

            // هذا المستمع يجب أن يتم بعد تهيئة Auth
            onAuthStateChanged(auth, handleAuthStateChanged);

            // تهيئة التقييمات عند تحميل الصفحة إذا كان المستخدم مسجل الدخول بالفعل
            if (auth.currentUser) {
                initializeRatings();
            }
        }

        // استدعاء setupFirebaseEventListeners بعد تهيئة Firebase بنجاح
        setupFirebaseEventListeners();

    } catch (error) {
        console.error('خطأ في استيراد مكتبات Firebase أو DOMPurify:', error);
        showToast('خطأ في تحميل المكتبات الأساسية، يرجى إعادة تحميل الصفحة', 'error');
        // في حالة فشل Firebase، قم بتعطيل الأزرار التي تعتمد عليه أو إظهار رسالة واضحة
        if (elements.googleLoginBtn) elements.googleLoginBtn.disabled = true;
        if (elements.chatBtn) elements.chatBtn.disabled = true;
        if (elements.sendMessageBtn) elements.sendMessageBtn.disabled = true;
        elements.ratingStars.forEach(star => star.classList.add('disabled'));
    }

    // تنظيف مستمعي الأحداث عند إغلاق الصفحة (تبقى في النهاية)
    window.addEventListener('unload', () => {
        if (unsubscribeMessages) unsubscribeMessages();
        Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
    });
});
