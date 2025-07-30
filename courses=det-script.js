// استيراد مكتبات Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD3-3DWygRsa6XtdXkqPH-03u8g1BOdKVE",
    authDomain: "edumates-academy.firebaseapp.com",
    projectId: "edumates-academy",
    storageBucket: "edumates-academy.appspot.com",
    messagingSenderId: "470232849413",
    appId: "1:470232849413:web:35cf4dc85e5bcdb09b8056"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
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
        { text: 'اختبار HTML', href: 'exam-html.html' },
        { text: 'اختبار CSS', href: 'exam-css.html' },
        { text: 'اختبار JavaScript', href: 'exam-js.html' }
    ];

    document.querySelectorAll('.features-list a').forEach(link => {
        examLinks.forEach(exam => {
            if (link.textContent.trim() === exam.text) {
                link.setAttribute('href', exam.href);
                console.log(`تم تحديث رابط ${exam.text} إلى ${exam.href}`);
            }
        });
    });
}

// استدعاء الدالة لتحديث الروابط عند تحميل الصفحة
updateExamLinks();

// متغيرات لتتبع الصفحات
let lastVisible = null;
let unsubscribeMessages = null;
const messagesPerPage = 20;
let hasMoreMessages = true;
let unsubscribeRatings = {};

// وظيفة إشعارات التوست
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

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
        console.log('Roadmap popup toggled:', isActive ? 'Opened' : 'Closed');
    } else {
        console.error('Roadmap popup element not found');
    }
}

// وظائف المحادثة
function toggleChatPopup() {
    if (elements.chatPopup) {
        const isVisible = elements.chatPopup.style.display === "block";
        elements.chatPopup.style.display = isVisible ? "none" : "block";
        elements.chatPopup.setAttribute('aria-hidden', isVisible);
        console.log('Chat popup toggled:', !isVisible ? 'Opened' : 'Closed');
        if (!isVisible) {
            elements.messageInput.focus();
            if (!elements.chatMessages.hasChildNodes()) {
                loadMessages();
            }
            scrollChatToBottom();
        } else if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }
    } else {
        console.error('Chat popup element not found');
    }
}

function scrollChatToBottom() {
    if (elements.chatMessages) {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        console.log('Scrolled to bottom of chat');
    }
}

async function sendMessage() {
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
            text: messageText,
            userId: user.uid,
            userName: user.displayName || 'مستخدم',
            userPhoto: user.photoURL || 'https://via.placeholder.com/30',
            timestamp: serverTimestamp()
        });
        elements.messageInput.value = '';
        scrollChatToBottom();
        showToast('تم إرسال الرسالة بنجاح', 'success');
        console.log('Message sent and scrolled to bottom');
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        showToast('حدث خطأ أثناء إرسال الرسالة: ' + error.message, 'error');
    } finally {
        elements.sendMessageBtn.disabled = false;
    }
}

function loadMessages() {
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

    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        if (snapshot.empty) {
            hasMoreMessages = false;
            elements.loadMoreBtn.style.display = 'none';
            elements.chatLoading.classList.remove('active');
            console.log('No more messages to load');
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
            console.log('Cleared chat messages on initial load');
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
            console.log(`Added message from ${message.userName} at ${message.timestamp ? new Date(message.timestamp.toMillis()).toISOString() : 'now'}`);
        });

        scrollChatToBottom();
    }, (error) => {
        console.error('خطأ في تحميل الرسائل:', error);
        elements.chatLoading.classList.remove('active');
        showToast('حدث خطأ أثناء تحميل الرسائل: ' + error.message, 'error');
    });
}

// وظيفة لتطهير النصوص
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str.replace(/[<>]/g, '');
    return div.innerHTML;
}

// وظائف تبديل الميزات
function toggleFeatures(event) {
    const toggle = event.currentTarget;
    const featuresList = toggle.nextElementSibling.nextElementSibling;
    const isActive = featuresList.classList.contains('active');

    document.querySelectorAll('.features-list').forEach(list => {
        list.classList.remove('active');
    });
    document.querySelectorAll('.toggle-features').forEach(t => {
        t.classList.remove('active');
    });

    if (!isActive) {
        featuresList.classList.add('active');
        toggle.classList.add('active');
    }
}

// تسجيل الدخول بجوجل
async function handleGoogleLogin() {
    try {
        elements.googleLoginBtn.disabled = true;
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        updateUIAfterLogin(user);
        showToast(`مرحباً ${user.displayName} 👋`, 'success');
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        showToast('فشل تسجيل الدخول: ' + error.message, 'error');
    } finally {
        elements.googleLoginBtn.disabled = false;
    }
}

// تحديث واجهة المستخدم بعد التسجيل
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
                    showToast('حدث خطأ أثناء تسجيل الخروج: ' + error.message, 'error');
                }
            });
        }
    }
}

// إدارة تقييم الروابط
async function submitRating(linkId, rating) {
    const user = auth.currentUser;
    if (!user) {
        showToast('يرجى تسجيل الدخول لتقييم الرابط', 'error');
        return;
    }

    try {
        const existingRatingQuery = query(
            collection(db, 'ratings'),
            where('linkId', '==', linkId),
            where('userId', '==', user.uid)
        );
        const existingRatingSnapshot = await getDocs(existingRatingQuery);

        if (!existingRatingSnapshot.empty) {
            showToast('لقد قيّمت هذا الرابط مسبقًا', 'error');
            return;
        }

        await addDoc(collection(db, 'ratings'), {
            linkId: linkId,
            userId: user.uid,
            rating: rating,
            timestamp: serverTimestamp()
        });
        console.log(`تم تقييم الرابط ${linkId} بـ ${rating} نجوم`);
        showToast('تم تسجيل تقييمك، شكرًا لك!', 'success');
    } catch (error) {
        console.error('خطأ في إرسال التقييم:', error);
        showToast('حدث خطأ أثناء إرسال التقييم: ' + error.message, 'error');
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
        collection(db, 'ratings'),
        where('linkId', '==', linkId)
    );

    unsubscribeRatings[linkId] = onSnapshot(ratingsQuery, async (snapshot) => {
        let totalRating = 0;
        let ratingCount = 0;
        let userRating = null;

        const user = auth.currentUser;
        if (user) {
            const userRatingQuery = query(
                collection(db, 'ratings'),
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
        showToast('حدث خطأ أثناء تحميل التقييمات: ' + error.message, 'error');
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            console.log('Mobile menu button clicked');
            toggleMobileMenu();
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    if (elements.viewRoadmapBtn) {
        elements.viewRoadmapBtn.addEventListener('click', () => {
            console.log('View roadmap button clicked');
            toggleRoadmapPopup();
        });
    }

    if (elements.closeRoadmap) {
        elements.closeRoadmap.addEventListener('click', () => {
            console.log('Close roadmap button clicked');
            toggleRoadmapPopup();
        });
    }

    if (elements.chatBtn) {
        elements.chatBtn.addEventListener('click', () => {
            console.log('Chat button clicked');
            toggleChatPopup();
        });
    }

    if (elements.closeChat) {
        elements.closeChat.addEventListener('click', () => {
            console.log('Close chat button clicked');
            toggleChatPopup();
        });
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

    // إضافة مستمعي الأحداث للنجوم
    document.querySelectorAll('.rating-stars').forEach(starsContainer => {
        const linkId = starsContainer.parentElement.getAttribute('data-link-id');
        loadRatings(linkId, starsContainer);

        starsContainer.querySelectorAll('i').forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                submitRating(linkId, rating);
            });
        });
    });

    // إغلاق نافذة المحادثة عند النقر خارجها
    window.addEventListener("click", (e) => {
        if (elements.chatPopup && !elements.chatPopup.contains(e.target) && e.target.id !== "chatBtn") {
            elements.chatPopup.style.display = "none";
            elements.chatPopup.setAttribute("aria-hidden", true);
            console.log('Closed chat popup by clicking outside');
        }
    });
}

// تتبع حالة المصادقة
auth.onAuthStateChanged(user => {
    if (user) {
        updateUIAfterLogin(user);
        if (elements.chatPopup.style.display === "block" && !unsubscribeMessages) {
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
