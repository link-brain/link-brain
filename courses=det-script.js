document.addEventListener('DOMContentLoaded', async () => {
    // --- تهيئة Firebase ---
    // تأكد من استبدال هذه القيم بالقيم الخاصة بمشروعك على Firebase
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY", // استبدل بالقيمة الصحيحة
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    let app, auth, db, provider;
    let getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged;
    let getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc;
    let DOMPurify;

    try {
        // --- استيراد مكتبات Firebase و DOMPurify ---
        const firebaseAppModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const firebaseFirestoreModule = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
        
        // استيراد DOMPurify لتأمين المدخلات
        DOMPurify = (await import('https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js')).default;

        // تهيئة Firebase
        app = firebaseAppModule.initializeApp(firebaseConfig);
        auth = firebaseAuthModule.getAuth(app);
        db = firebaseFirestoreModule.getFirestore(app);
        provider = new firebaseAuthModule.GoogleAuthProvider();

        // استخراج الدوال المستخدمة
        ({ getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = firebaseAuthModule);
        ({ getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs, doc, setDoc } = firebaseFirestoreModule);

    } catch (error) {
        console.error("خطأ فادح في استيراد أو تهيئة المكتبات الأساسية:", error);
        showToast("حدث خطأ في تحميل التطبيق، يرجى إعادة المحاولة.", 'error');
        return;
    }

    // --- اختيار عناصر DOM ---
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        
        // عناصر خارطة الطريق
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.getElementById('roadmapPopup'),
        closeRoadmap: document.getElementById('closeRoadmap'),
        
        // عناصر المحادثة
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),

        // عناصر التبويبات
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),

        // عناصر التقييم
        resourceCards: document.querySelectorAll('.resource-card'),

        // عناصر نافذة الميزات
        featuresBtns: document.querySelectorAll('.features-btn'),
        featuresPopup: document.getElementById('featuresPopup'),
        featuresList: document.getElementById('featuresList'),
        closeFeatures: document.getElementById('closeFeatures'),
    };

    // --- متغيرات الحالة ---
    let lastVisibleMessage = null;
    let unsubscribeMessages = null;
    const messagesPerPage = 20;
    let hasMoreMessages = true;
    let ratingListeners = {};

    // --- وظائف مساعدة ---

    /**
     * إظهار رسالة إشعار مؤقتة (Toast)
     * @param {string} message - الرسالة المراد عرضها
     * @param {'success' | 'error' | 'info'} type - نوع الإشعار
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        // تعديل لون الخلفية بناءً على النوع
        if (type === 'error') toast.style.backgroundColor = 'var(--accent-red)';
        if (type === 'success') toast.style.backgroundColor = 'var(--accent-green)';
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    /**
     * تنسيق الطابع الزمني إلى صيغة مقروءة
     * @param {object} timestamp - كائن الطابع الزمني من Firestore
     */
    function formatTimestamp(timestamp) {
        if (!timestamp || typeof timestamp.toDate !== 'function') return 'الآن';
        try {
            return timestamp.toDate().toLocaleString('ar-EG', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return 'غير متاح';
        }
    }

    // --- وظائف الواجهة الرئيسية ---

    /**
     * فتح وإغلاق نافذة منبثقة
     * @param {HTMLElement} popupElement - عنصر النافذة المنبثقة
     */
    function togglePopup(popupElement) {
        if (!popupElement) return;
        const isActive = popupElement.classList.toggle('active');
        popupElement.setAttribute('aria-hidden', !isActive);
        if (isActive) {
            // التركيز على أول عنصر قابل للتركيز داخل النافذة
            const focusable = popupElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }
    }

    // --- وظائف المصادقة (Authentication) ---
    
    /**
     * التعامل مع عملية تسجيل الدخول أو الخروج
     */
    async function handleAuth() {
        try {
            if (auth.currentUser) {
                await signOut(auth);
                showToast('تم تسجيل الخروج بنجاح.', 'success');
            } else {
                await signInWithPopup(auth, provider);
                showToast('أهلاً بك! تم تسجيل الدخول بنجاح.', 'success');
            }
        } catch (error) {
            console.error('خطأ في المصادقة:', error);
            showToast('حدث خطأ أثناء عملية المصادقة. حاول مرة أخرى.', 'error');
        }
    }

    /**
     * تحديث واجهة المستخدم بناءً على حالة تسجيل الدخول
     * @param {object|null} user - كائن المستخدم أو null
     */
    function updateUIOnAuthStateChange(user) {
        if (user) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || ''}" alt="صورة المستخدم" class="user-avatar">
                <span>${DOMPurify.sanitize(user.displayName || 'مستخدم')}</span>
                <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>`;
            elements.googleLoginBtn.classList.add('user-logged-in');
            initializeAllRatings(); // تفعيل التقييمات للمستخدم
        } else {
            elements.googleLoginBtn.innerHTML = `<i class="fab fa-google"></i> تسجيل الدخول`;
            elements.googleLoginBtn.classList.remove('user-logged-in');
            clearAllRatingsUI(); // تعطيل التقييمات عند الخروج
        }
    }

    // --- وظائف المحادثة (Chat) ---

    /**
     * إرسال رسالة إلى Firestore
     */
    async function sendMessage() {
        const user = auth.currentUser;
        if (!user) {
            showToast('يرجى تسجيل الدخول أولاً لإرسال رسالة.', 'error');
            return;
        }

        const messageText = elements.messageInput.value.trim();
        if (!messageText) return;

        elements.sendMessageBtn.disabled = true;
        try {
            await addDoc(collection(db, 'messages'), {
                text: DOMPurify.sanitize(messageText),
                userId: user.uid,
                userName: DOMPurify.sanitize(user.displayName),
                userPhoto: user.photoURL,
                timestamp: serverTimestamp()
            });
            elements.messageInput.value = '';
            elements.messageInput.focus();
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
            showToast('لم نتمكن من إرسال رسالتك. حاول مرة أخرى.', 'error');
        } finally {
            elements.sendMessageBtn.disabled = false;
        }
    }

    /**
     * عرض رسالة واحدة في واجهة المحادثة
     * @param {object} msg - بيانات الرسالة
     */
    function displayMessage(msg) {
        const isCurrentUser = msg.userId === auth.currentUser?.uid;
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'user-message' : ''}`;
        messageElement.innerHTML = `
            <div class="message-header">
                <img src="${msg.userPhoto}" alt="صورة المستخدم" class="message-avatar">
                <span class="message-sender">${DOMPurify.sanitize(msg.userName)}</span>
                <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
            </div>
            <p class="message-text">${DOMPurify.sanitize(msg.text)}</p>`;
        elements.chatMessages.appendChild(messageElement);
    }
    
    /**
     * تحميل رسائل المحادثة من Firestore مع الترقيم
     */
    function loadMessages() {
        if (unsubscribeMessages) unsubscribeMessages(); // إلغاء المستمع القديم

        elements.chatLoading.classList.add('active');
        
        const q = query(
            collection(db, 'messages'),
            orderBy('timestamp', 'desc'),
            limit(messagesPerPage)
        );

        unsubscribeMessages = onSnapshot(q, (snapshot) => {
            elements.chatLoading.classList.remove('active');
            elements.chatMessages.innerHTML = ''; // مسح الرسائل القديمة لعرض الجديدة
            if (snapshot.empty) {
                elements.chatMessages.innerHTML = '<p style="text-align:center;color:var(--text-medium);">لا توجد رسائل بعد. كن أول من يبدأ المحادثة!</p>';
                return;
            }
            
            // عرض الرسائل بترتيبها الصحيح (من الأقدم للأحدث)
            snapshot.docs.reverse().forEach(doc => {
                displayMessage({ id: doc.id, ...doc.data() });
            });
            
            // تمرير للأسفل تلقائيًا
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

        }, (error) => {
            console.error("خطأ في تحميل الرسائل:", error);
            showToast('حدث خطأ أثناء تحميل الرسائل.', 'error');
            elements.chatLoading.classList.remove('active');
        });
    }

    /**
     * فتح وإغلاق نافذة المحادثة وتحميل الرسائل عند الفتح
     */
    function handleChatPopupToggle() {
        const popup = elements.chatPopup;
        const isActive = popup.classList.contains('active');

        if (!isActive) { // عند الفتح
            popup.classList.add('active');
            popup.setAttribute('aria-hidden', 'false');
            elements.messageInput.focus();
            if (auth.currentUser) {
                loadMessages();
            } else {
                elements.chatMessages.innerHTML = '<p style="text-align:center;color:var(--text-medium);">يرجى تسجيل الدخول لعرض المحادثة والمشاركة فيها.</p>';
            }
        } else { // عند الإغلاق
            popup.classList.remove('active');
            popup.setAttribute('aria-hidden', 'true');
            if (unsubscribeMessages) {
                unsubscribeMessages(); // إيقاف الاستماع للتحديثات لتوفير الموارد
                unsubscribeMessages = null;
            }
            elements.chatMessages.innerHTML = ''; // تنظيف المحتوى
        }
    }


    // --- وظائف التقييم (Rating) ---

    /**
     * التعامل مع حدث النقر على نجمة للتقييم
     * @param {Event} event - حدث النقر
     */
    async function handleRating(event) {
        const user = auth.currentUser;
        if (!user) {
            showToast('يرجى تسجيل الدخول للتقييم.', 'error');
            return;
        }

        const star = event.target;
        const ratingValue = parseInt(star.dataset.value);
        const resourceCard = star.closest('.resource-card');
        const linkId = resourceCard.dataset.linkId;
        
        // منع التقييم المتكرر السريع
        if (resourceCard.classList.contains('rating-in-progress')) return;
        resourceCard.classList.add('rating-in-progress');

        try {
            const ratingRef = doc(db, 'ratings', `${linkId}_${user.uid}`);
            await setDoc(ratingRef, {
                linkId,
                userId: user.uid,
                rating: ratingValue,
                timestamp: serverTimestamp()
            });
            showToast('شكراً لتقييمك!', 'success');
        } catch (error) {
            console.error('خطأ في تسجيل التقييم:', error);
            showToast('حدث خطأ أثناء حفظ تقييمك.', 'error');
        } finally {
             setTimeout(() => resourceCard.classList.remove('rating-in-progress'), 1000);
        }
    }

    /**
     * تحديث واجهة التقييم (النجوم والمتوسط) لمورد معين
     * @param {string} linkId - معرف المورد
     */
    async function updateRatingUI(linkId) {
        const card = document.querySelector(`.resource-card[data-link-id="${linkId}"]`);
        if (!card) return;

        const q = query(collection(db, 'ratings'), where('linkId', '==', linkId));
        
        try {
            const snapshot = await getDocs(q);
            let totalRating = 0;
            const ratingCount = snapshot.size;

            snapshot.forEach(doc => {
                totalRating += doc.data().rating;
            });
            
            const averageRating = ratingCount > 0 ? (totalRating / ratingCount) : 0;

            card.querySelector('.average-rating').textContent = averageRating.toFixed(1);
            card.querySelector('.rating-count').textContent = `(${ratingCount} تقييم)`;
            
            const stars = card.querySelectorAll('.rating-stars i');
            stars.forEach(star => {
                star.classList.toggle('rated', parseInt(star.dataset.value) <= Math.round(averageRating));
            });

        } catch (error) {
            console.error(`خطأ في تحديث واجهة التقييم للمورد ${linkId}:`, error);
        }
    }

    /**
     * تهيئة الاستماع لتحديثات التقييم لجميع الموارد
     */
    function initializeAllRatings() {
        elements.resourceCards.forEach(card => {
            const linkId = card.dataset.linkId;
            if (linkId && !ratingListeners[linkId]) {
                 // تحديث فوري أول مرة
                updateRatingUI(linkId);
                // ثم الاستماع للتغييرات
                ratingListeners[linkId] = onSnapshot(
                    query(collection(db, 'ratings'), where('linkId', '==', linkId)),
                    () => updateRatingUI(linkId)
                );
            }
        });
    }

    /**
     * مسح بيانات التقييم من الواجهة وإلغاء المستمعين
     */
    function clearAllRatingsUI() {
        // إلغاء جميع المستمعين السابقين
        Object.values(ratingListeners).forEach(unsubscribe => unsubscribe());
        ratingListeners = {};

        elements.resourceCards.forEach(card => {
            card.querySelector('.average-rating').textContent = '0.0';
            card.querySelector('.rating-count').textContent = '(0 تقييم)';
            card.querySelectorAll('.rating-stars i').forEach(star => star.classList.remove('rated'));
        });
    }


    // --- إعداد المستمعين للأحداث (Event Listeners) ---
    function setupEventListeners() {
        // القائمة المتنقلة
        elements.mobileMenuBtn.addEventListener('click', () => elements.navLinks.classList.toggle('active'));

        // المصادقة
        elements.googleLoginBtn.addEventListener('click', handleAuth);
        onAuthStateChanged(auth, updateUIOnAuthStateChange);

        // النوافذ المنبثقة (خارطة الطريق والميزات)
        elements.viewRoadmapBtn.addEventListener('click', () => togglePopup(elements.roadmapPopup));
        elements.closeRoadmap.addEventListener('click', () => togglePopup(elements.roadmapPopup));
        
        elements.closeFeatures.addEventListener('click', () => togglePopup(elements.featuresPopup));
        elements.featuresBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const featuresText = btn.dataset.features;
                const featuresHtml = featuresText.split('\\n').map(feature => `<li>${DOMPurify.sanitize(feature)}</li>`).join('');
                elements.featuresList.innerHTML = featuresHtml;
                togglePopup(elements.featuresPopup);
            });
        });

        // المحادثة
        elements.chatBtn.addEventListener('click', handleChatPopupToggle);
        elements.closeChat.addEventListener('click', handleChatPopupToggle);
        elements.sendMessageBtn.addEventListener('click', sendMessage);
        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // التبويبات
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elements.tabs.forEach(t => t.classList.remove('active'));
                elements.tabContents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });

        // التقييم
        elements.resourceCards.forEach(card => {
            card.querySelectorAll('.rating-stars i').forEach(star => {
                star.addEventListener('click', handleRating);
            });
        });

        // إغلاق النوافذ المنبثقة عند الضغط على مفتاح Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.popup.active').forEach(popup => togglePopup(popup));
            }
        });
    }

    // --- بدء تشغيل التطبيق ---
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }
    setupEventListeners();
    initializeAllRatings(); // تهيئة أولية للتقييمات عند تحميل الصفحة
});
