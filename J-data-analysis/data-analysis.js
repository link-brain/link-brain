// data-analysis-det-script.js
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
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    // تهيئة التطبيق
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    let analytics = null;
    try {
        if (location.protocol === 'https:' || location.hostname === 'localhost') {
            analytics = getAnalytics(app);
        }
    } catch (e) {
        console.warn('Analytics معطّل:', e);
    }
    const db = getFirestore(app);

    // عناصر DOM
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.querySelector('#roadmapPopup'),
        closeRoadmap: document.querySelector('#closeRoadmap'),
        toggleFeatures: document.querySelectorAll('.toggle-features'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),
        loadMoreBtn: document.getElementById('loadMoreBtn')
    };

    // تعيين السنة الحالية
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    // تحديث روابط الاختبارات ديناميكيًا
    function updateExamLinks() {
        const examLinks = [
            { text: 'اختبار Python Data', href: 'exam-python-data.html' },
            { text: 'اختبار Pandas', href: 'exam-pandas.html' },
            { text: 'اختبار SQL Data', href: 'exam-sql-data.html' },
            { text: 'اختبار Visualization', href: 'exam-visualization.html' }
        ];

        document.querySelectorAll('.features-list a').forEach(link => {
            examLinks.forEach(exam => {
                if (link.textContent.trim() === exam.text) {
                    link.setAttribute('href', exam.href);
                }
            });
        });
    }
    updateExamLinks();

    // متغيرات المحادثة
    let lastVisible = null;
    let unsubscribeMessages = null;
    const messagesPerPage = 20;
    let hasMoreMessages = true;
    let unsubscribeRatings = {};

    // وظائف القائمة المتنقلة
    function toggleMobileMenu() {
        if (!elements.navLinks) return;
        const isOpen = elements.navLinks.classList.contains('active');
        elements.navLinks.classList.toggle('active');
        elements.mobileMenuBtn.innerHTML = isOpen ?
            '<i class="fas fa-bars"></i>' :
            '<i class="fas fa-times"></i>';
    }
    function closeMobileMenu() {
        if (window.innerWidth <= 768 && elements.navLinks) {
            elements.navLinks.classList.remove('active');
            elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }

    // وظائف خارطة الطريق
    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) {
            const isActive = elements.roadmapPopup.classList.toggle('active');
            elements.roadmapPopup.setAttribute('aria-hidden', !isActive);
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
            alert('يرجى تسجيل الدخول لإرسال الرسائل');
            return;
        }
        const messageText = elements.messageInput.value.trim();
        if (!messageText) {
            alert('يرجى إدخال رسالة غير فارغة');
            return;
        }
        if (messageText.length > 500) {
            alert('الرسالة طويلة جدًا، الحد الأقصى 500 حرف');
            return;
        }

        try {
            elements.sendMessageBtn.disabled = true;
            await addDoc(collection(db, 'data-analysis-messages'), {   // تم التغيير إلى مجموعة خاصة بتحليل البيانات
                text: messageText,
                userId: user.uid,
                userName: user.displayName || 'مستخدم',
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });
            elements.messageInput.value = '';
            scrollChatToBottom();
        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
            alert('حدث خطأ أثناء إرسال الرسالة: ' + error.message);
        } finally {
            elements.sendMessageBtn.disabled = false;
        }
    }

    function loadMessages() {
        if (!hasMoreMessages) return;
        elements.chatLoading.classList.add('active');
        let messagesQuery = query(
            collection(db, 'data-analysis-messages'),   // تم التغيير إلى مجموعة خاصة
            orderBy('timestamp', 'asc'),
            limit(messagesPerPage)
        );
        if (lastVisible) {
            messagesQuery = query(messagesQuery, startAfter(lastVisible));
        }

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
            });
            lastVisible = snapshot.docs[snapshot.docs.length - 1];
            elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
            elements.chatLoading.classList.remove('active');

            if (!elements.chatMessages.hasChildNodes()) {
                elements.chatMessages.innerHTML = '';
            }
            messages.forEach((message) => {
                if (!message.text || !message.timestamp) return;
                const isCurrentUser = auth.currentUser && message.userId === auth.currentUser.uid;
                const messageElement = document.createElement('div');
                messageElement.className = `message ${isCurrentUser ? 'user-message' : ''}`;
                messageElement.innerHTML = `
                    <div class="message-header">
                        <img src="${message.userPhoto}" alt="صورة ${sanitizeHTML(message.userName)}" class="message-avatar">
                        <span class="message-sender">${sanitizeHTML(message.userName)}</span>
                        <span class="message-time">${
                            message.timestamp ? new Date(message.timestamp.toMillis()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'
                        }</span>
                    </div>
                    <p class="message-text">${sanitizeHTML(message.text)}</p>
                `;
                elements.chatMessages.appendChild(messageElement);
            });
            scrollChatToBottom();
        }, (error) => {
            console.error('خطأ في تحميل الرسائل:', error);
            elements.chatLoading.classList.remove('active');
            alert('حدث خطأ أثناء تحميل الرسائل: ' + error.message);
        });
    }

    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str.replace(/[<>]/g, '');
        return div.innerHTML;
    }

    function toggleFeatures(event) {
        const li = event.currentTarget.closest('li');
        const featuresList = li.querySelector('.features-list');
        const isActive = featuresList.classList.contains('active');
        document.querySelectorAll('.features-list').forEach(list => list.classList.remove('active'));
        document.querySelectorAll('.toggle-features').forEach(t => t.classList.remove('active'));
        if (!isActive) {
            featuresList.classList.add('active');
            event.currentTarget.classList.add('active');
        }
    }

    async function handleGoogleLogin() {
        try {
            elements.googleLoginBtn.disabled = true;
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            updateUIAfterLogin(user);
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
        } finally {
            elements.googleLoginBtn.disabled = false;
        }
    }

    function updateUIAfterLogin(user) {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/30'}" 
                     alt="صورة ${sanitizeHTML(user.displayName || 'مستخدم')}" class="user-avatar">
                <span>${sanitizeHTML(user.displayName || 'مستخدم')}</span>
                <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>
            `;
            const logoutIcon = elements.googleLoginBtn.querySelector('.logout-icon');
            if (logoutIcon) {
                logoutIcon.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await signOut(auth);
                        location.reload();
                    } catch (error) {
                        console.error('خطأ في تسجيل الخروج:', error);
                    }
                });
            }
        }
    }

    async function submitRating(linkId, rating) {
        const user = auth.currentUser;
        if (!user) {
            alert('يرجى تسجيل الدخول لتقييم الرابط');
            return;
        }
        try {
            const existingRatingQuery = query(
                collection(db, 'data-analysis-rate'),    // تم التغيير إلى مجموعة خاصة
                where('linkId', '==', linkId),
                where('userId', '==', user.uid)
            );
            const existingRatingSnapshot = await getDocs(existingRatingQuery);
            if (!existingRatingSnapshot.empty) {
                alert('لقد قيّمت هذا الرابط مسبقًا');
                return;
            }
            await addDoc(collection(db, 'data-analysis-rate'), {   // تم التغيير إلى مجموعة خاصة
                linkId: linkId,
                userId: user.uid,
                rating: rating,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('خطأ في إرسال التقييم:', error);
            alert('حدث خطأ أثناء إرسال التقييم: ' + error.message);
        }
    }

    function updateStarDisplay(starsContainer, rating, ratingCount, userRating = null) {
        const stars = starsContainer.querySelectorAll('i');
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (userRating && starValue <= userRating) {
                star.classList.add('rated');
                star.style.color = 'var(--accent-orange)';
            } else if (rating > 0 && starValue <= Math.floor(rating)) {
                star.classList.add('rated');
                star.style.color = 'var(--accent-orange)';
            } else {
                star.classList.remove('rated');
                star.style.color = 'var(--text-light)';
            }
        });
        const averageRatingElement = starsContainer.querySelector('.average-rating');
        const ratingCountElement = starsContainer.querySelector('.rating-count');
        averageRatingElement.textContent = rating ? rating.toFixed(1) : '0.0';
        ratingCountElement.textContent = `(${ratingCount} تقييم)`;
    }

    async function loadRatings(linkId, starsContainer) {
        const ratingsQuery = query(
            collection(db, 'data-analysis-rate'),   // تم التغيير إلى مجموعة خاصة
            where('linkId', '==', linkId)
        );
        unsubscribeRatings[linkId] = onSnapshot(ratingsQuery, async (snapshot) => {
            let totalRating = 0;
            let ratingCount = 0;
            let userRating = null;
            const user = auth.currentUser;
            if (user) {
                const userRatingQuery = query(
                    collection(db, 'data-analysis-rate'),   // تم التغيير إلى مجموعة خاصة
                    where('linkId', '==', linkId),
                    where('userId', '==', user.uid)
                );
                const userRatingSnapshot = await getDocs(userRatingQuery);
                if (!userRatingSnapshot.empty) {
                    userRating = userRatingSnapshot.docs[0].data().rating;
                }
            }
            snapshot.forEach(doc => {
                totalRating += doc.data().rating;
                ratingCount++;
            });
            const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
            updateStarDisplay(starsContainer, averageRating, ratingCount, userRating);
        }, (error) => {
            console.error('خطأ في تحميل التقييمات:', error);
            updateStarDisplay(starsContainer, 0, 0);
        });
    }

    function setupEventListeners() {
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        }
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        if (elements.viewRoadmapBtn) {
            elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
        }
        if (elements.closeRoadmap) {
            elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);
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
        elements.toggleFeatures.forEach(toggle => {
            toggle.addEventListener('click', toggleFeatures);
        });
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
        }
        document.querySelectorAll('.rating-stars').forEach(starsContainer => {
            const linkId = starsContainer.parentElement.getAttribute('data-link-id');
            loadRatings(linkId, starsContainer);
            starsContainer.querySelectorAll('i').forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.getAttribute('data-value'));
                    submitRating(linkId, rating);
                });
            });
        });
    }
    setupEventListeners();

    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
            if (elements.chatPopup.classList.contains('active') && !unsubscribeMessages) {
                loadMessages();
            }
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        } else {
            elements.chatMessages.innerHTML = '';
            hasMoreMessages = true;
            lastVisible = null;
            elements.loadMoreBtn.style.display = 'none';
            if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }
            Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
            unsubscribeRatings = {};
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.roadmap-item').forEach(item => {
        item.addEventListener('click', () => {
            const skill = item.getAttribute('data-skill');
            const popup = document.getElementById('popup-' + skill);
            if (popup) {
                popup.classList.add('active');
                popup.setAttribute('aria-hidden', 'false');
            }
        });
    });
    document.querySelectorAll('.roadmap-detail-popup .close-popup').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const popup = e.target.closest('.roadmap-detail-popup');
            if (popup) {
                popup.classList.remove('active');
                popup.setAttribute('aria-hidden', 'true');
            }
        });
    });
});