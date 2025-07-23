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
        const DOMPurify = (await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js")).default;

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
        if (!elements.googleLoginBtn || !elements.chatBtn || !elements.featuresPopup) {
            console.error('عناصر DOM مفقودة:', { googleLoginBtn: !!elements.googleLoginBtn, chatBtn: !!elements.chatBtn, featuresPopup: !!elements.featuresPopup });
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
               i class="fas fa-times" aria-label="إغلاق القائمة"></i>';
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
                    loadRoadmapContent();
                }
            }
        }

        // تحميل محتوى خارطة الطريق
        async function loadRoadmapContent() {
            const roadmapContent = document.querySelector('.roadmap-content');
            if (!roadmapContent) return;

            try {
                const roadmapQuery = query(collection(db, 'roadmap'), orderBy('order'));
                const roadmapSnapshot = await getDocs(roadmapQuery);
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
            } catch (error) {
                console.error('خطأ في تحميل خارطة الطريق:', error);
                showToast('فشل تحميل خارطة الطريق', 'error');
            }
        }

        // وظائف الميزات
        function showFeaturesPopup(event) {
            const features = event.target.getAttribute('data-features').split('\n');
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
                    elements.chatBtn.disabled = false;
                    initializeRatings();
                    loadMessages();
                } else {
                    elements.googleLoginBtn.innerHTML = `
                        <i class="fab fa-google"></i> تسجيل الدخول
                    `;
                    elements.googleLoginBtn.classList.remove('user-logged-in');
                    elements.chatBtn.disabled = true;
                    clearRatingsUI();
                    if (unsubscribeMessages) unsubscribeMessages();
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
            const resourceId = star.closest('.resource-card').dataset.resourceId;

            try {
                await setDoc(doc(db, 'ratings', `${auth.currentUser.uid}_${resourceId}`), {
                    userId: auth.currentUser.uid,
                    resourceId,
                    rating: ratingValue,
                    timestamp: serverTimestamp()
                });

                showToast('تم تسجيل تقييمك بنجاح', 'success');
                updateRatingUI(resourceId);
            } catch (error) {
                console.error('خطأ في تسجيل التقييم:', error);
                showToast('فشل تسجيل التقييم', 'error');
            }
        }

        async function initializeRatings() {
            const resources = document.querySelectorAll('.resource-card');
            resources.forEach(async resource => {
                const resourceId = resource.dataset.resourceId;
                if (!resourceId) return;

                // إلغاء الاشتراك السابق إن وجد
                if (unsubscribeRatings[resourceId]) {
                    unsubscribeRatings[resourceId]();
                }

                // الاشتراك في تحديثات التقييم
                const ratingsQuery = query(collection(db, 'ratings'), where('resourceId', '==', resourceId));
                unsubscribeRatings[resourceId] = onSnapshot(ratingsQuery, snapshot => {
                    updateRatingUI(resourceId);
                });
            });
        }

        async function updateRatingUI(resourceId) {
            const resourceCard = document.querySelector(`.resource-card[data-resource-id="${resourceId}"]`);
            if (!resourceCard) return;

            const stars = resourceCard.querySelectorAll('.rating-stars i');
            const averageRatingElement = resourceCard.querySelector('.average-rating');
            const ratingCountElement = resourceCard.querySelector('.rating-count');

            try {
                const ratingsQuery = query(collection(db, 'ratings'), where('resourceId', '==', resourceId));
                const ratingsSnapshot = await getDocs(ratingsQuery);
                const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
                const averageRating = ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : '0.0';
                const ratingCount = ratings.length;

                averageRatingElement.textContent = averageRating;
                ratingCountElement.textContent = `(${ratingCount} تقييم)`;

                // تحديث نجوم المستخدم
                if (auth.currentUser) {
                    const userRatingDoc = await getDocs(query(collection(db, 'ratings'), where('userId', '==', auth.currentUser.uid), where('resourceId', '==', resourceId)));
                    const userRating = userRatingDoc.docs[0]?.data().rating || 0;

                    stars.forEach(star => {
                        const starValue = parseInt(star.dataset.rating);
                        star.classList.toggle('rated', starValue <= userRating);
                        star.classList.toggle('disabled', !auth.currentUser);
                    });
                }
            } catch (error) {
                console.error('خطأ في تحديث واجهة التقييم:', error);
                showToast('فشل تحديث التقييمات', 'error');
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
                averageRatingElement.textContent = '0.0';
                ratingCountElement.textContent = '(0 تقييم)';
            });
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
                await addDoc(collection(db, 'messages'), {
                    text: DOMPurify.sanitize(messageText),
                    userId: auth.currentUser.uid,
                    userName: DOMPurify.sanitize(auth.currentUser.displayName || 'مستخدم'),
                    userPhoto: auth.currentUser.photoURL || 'https://via.placeholder.com/30',
                    timestamp: serverTimestamp()
                });
                elements.messageInput.value = '';
                showToast('تم إرسال الرسالة بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في إرسال الرسالة:', error);
                showToast('فشل إرسال الرسالة', 'error');
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
            }
        }

        async function loadMessages() {
            if (!auth.currentUser) return;

            if (unsubscribeMessages) unsubscribeMessages();

            elements.chatLoading.classList.add('active');
            const messagesQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(messagesPerPage)
            );

            unsubscribeMessages = onSnapshot(messagesQuery, snapshot => {
                elements.chatMessages.innerHTML = '';
                snapshot.forEach(doc => {
                    const message = doc.data();
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${message.userId === auth.currentUser.uid ? 'user-message' : ''}`;
                    messageElement.innerHTML = `
                        <div class="message-header">
                            <img src="${message.userPhoto}" alt="صورة المستخدم" class="message-avatar">
                            <span class="message-sender">${DOMPurify.sanitize(message.userName)}</span>
                            <span class="message-time">${new Date(message.timestamp?.toDate()).toLocaleTimeString('ar-EG')}</span>
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
                showToast('فشل تحميل الرسائل', 'error');
                elements.chatLoading.classList.remove('active');
            });
        }

        async function loadMoreMessages() {
            if (!hasMoreMessages || !auth.currentUser) return;

            elements.chatLoading.classList.add('active');
            const messagesQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'desc'),
                startAfter(lastVisible),
                limit(messagesPerPage)
            );

            const snapshot = await getDocs(messagesQuery);
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.userId === auth.currentUser.uid ? 'user-message' : ''}`;
                messageElement.innerHTML = `
                    <div class="message-header">
                        <img src="${message.userPhoto}" alt="صورة المستخدم" class="message-avatar">
                        <span class="message-sender">${DOMPurify.sanitize(message.userName)}</span>
                        <span class="message-time">${new Date(message.timestamp?.toDate()).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <p class="message-text">${DOMPurify.sanitize(message.text)}</p>
                `;
                elements.chatMessages.appendChild(messageElement);
            });

            elements.chatLoading.classList.remove('active');
            hasMoreMessages = snapshot.size >= messagesPerPage;
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
            elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
        }

        // تهيئة مستمعي الأحداث
        setupEventListeners();
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showToast('خطأ في تهيئة التطبيق، يرجى إعادة تحميل الصفحة', 'error');
    }
});
