// 1. تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
    authDomain: "edumates-983dd.firebaseapp.com",
    projectId: "edumates-983dd",
    storageBucket: "edumates-983dd.appspot.com",
    messagingSenderId: "172548876353",
    appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
    measurementId: "G-L1KCZTW8R9"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// 2. متغيرات التطبيق
const state = {
    currentUser: null,
    lastMessageDoc: null,
    unsubscribeRatings: {},
    unsubscribeChat: null
};

// 3. عناصر DOM
const elements = {
    googleLoginBtn: document.getElementById('googleLoginBtn'),
    chatBtn: document.getElementById('chatBtn'),
    chatPopup: document.getElementById('chatPopup'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    closeChat: document.getElementById('closeChat'),
    ratingStars: document.querySelectorAll('.rating-stars i'),
    resourceCards: document.querySelectorAll('.resource-card'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content')
};

// 4. نظام المصادقة
async function handleAuth() {
    try {
        if (state.currentUser) {
            await auth.signOut();
            showToast('تم تسجيل الخروج بنجاح', 'success');
        } else {
            await auth.signInWithPopup(provider);
            showToast('مرحباً بك!', 'success');
        }
    } catch (error) {
        console.error('Auth Error:', error);
        showToast('فشلت عملية المصادقة', 'error');
    }
}

function setupAuthStateListener() {
    auth.onAuthStateChanged(user => {
        state.currentUser = user;
        updateAuthUI();
        if (user) {
            initializeRatings();
        } else {
            cleanupRatingsListeners();
        }
    });
}

function updateAuthUI() {
    if (state.currentUser) {
        elements.googleLoginBtn.innerHTML = `
            <img src="${state.currentUser.photoURL || 'https://via.placeholder.com/30'}" 
                 alt="صورة المستخدم" class="user-avatar">
            <span>${state.currentUser.displayName || 'مستخدم'}</span>
            <i class="fas fa-sign-out-alt"></i>
        `;
        elements.googleLoginBtn.classList.add('user-logged-in');
    } else {
        elements.googleLoginBtn.innerHTML = `<i class="fab fa-google"></i> تسجيل الدخول`;
        elements.googleLoginBtn.classList.remove('user-logged-in');
    }
}

// 5. نظام التقييمات
function initializeRatings() {
    elements.resourceCards.forEach(card => {
        const linkId = card.dataset.linkId;
        setupRatingListener(linkId);
    });
}

function setupRatingListener(linkId) {
    if (state.unsubscribeRatings[linkId]) return;

    state.unsubscribeRatings[linkId] = db.collection('ratings')
        .where('linkId', '==', linkId)
        .onSnapshot(snapshot => {
            updateRatingUI(linkId, snapshot.docs);
        });
}

async function handleRating(e) {
    if (!state.currentUser) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        return;
    }

    const star = e.target.closest('i');
    const ratingValue = parseInt(star.dataset.value);
    const card = star.closest('.resource-card');
    const linkId = card.dataset.linkId;

    try {
        // التحقق من التقييم السابق
        const existingRating = await db.collection('ratings')
            .where('userId', '==', state.currentUser.uid)
            .where('linkId', '==', linkId)
            .get();

        if (!existingRating.empty) {
            showToast('لقد قيمت هذا المورد مسبقاً', 'warning');
            return;
        }

        // إضافة التقييم الجديد
        await db.collection('ratings').add({
            userId: state.currentUser.uid,
            linkId: linkId,
            rating: ratingValue,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userName: state.currentUser.displayName || 'مستخدم'
        });
    } catch (error) {
        console.error('Rating Error:', error);
        showToast('حدث خطأ في التقييم', 'error');
    }
}

function updateRatingUI(linkId, ratings) {
    const card = document.querySelector(`.resource-card[data-link-id="${linkId}"]`);
    if (!card) return;

    const total = ratings.reduce((sum, doc) => sum + doc.data().rating, 0);
    const average = ratings.length > 0 ? (total / ratings.length).toFixed(1) : '0.0';
    const count = ratings.length;

    // تحديث واجهة المستخدم
    const ratingElement = card.querySelector('.average-rating');
    const countElement = card.querySelector('.rating-count');
    const stars = card.querySelectorAll('.rating-stars i');

    if (ratingElement) ratingElement.textContent = average;
    if (countElement) countElement.textContent = `(${count} تقييم${count !== 1 ? 'ات' : ''})`;
    
    stars.forEach(star => {
        const value = parseInt(star.dataset.value);
        star.classList.toggle('rated', value <= Math.round(average));
        star.classList.toggle('disabled', !!state.currentUser);
    });
}

function cleanupRatingsListeners() {
    Object.values(state.unsubscribeRatings).forEach(unsubscribe => unsubscribe());
    state.unsubscribeRatings = {};
}

// 6. نظام المحادثة
function setupChat() {
    elements.chatBtn.addEventListener('click', toggleChat);
    elements.closeChat.addEventListener('click', toggleChat);
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    elements.loadMoreBtn.addEventListener('click', loadMoreMessages);
}

function toggleChat() {
    const isActive = elements.chatPopup.classList.toggle('active');
    if (isActive) {
        loadMessages();
        elements.messageInput.focus();
    } else {
        if (state.unsubscribeChat) {
            state.unsubscribeChat();
            state.unsubscribeChat = null;
        }
        elements.chatMessages.innerHTML = '';
        state.lastMessageDoc = null;
    }
}

function loadMessages() {
    let query = db.collection('messages')
                 .orderBy('timestamp', 'desc')
                 .limit(15);

    if (state.lastMessageDoc) {
        query = query.startAfter(state.lastMessageDoc);
    }

    state.unsubscribeChat = query.onSnapshot(snapshot => {
        if (snapshot.empty) {
            elements.loadMoreBtn.style.display = 'none';
            return;
        }

        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                addMessageToDOM(change.doc.data());
            }
        });

        state.lastMessageDoc = snapshot.docs[snapshot.docs.length - 1];
        elements.loadMoreBtn.style.display = 'block';
    }, error => {
        console.error('Chat Error:', error);
        showToast('حدث خطأ في تحميل المحادثة', 'error');
    });
}

function loadMoreMessages() {
    loadMessages();
}

function addMessageToDOM(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.userId === state.currentUser?.uid ? 'user-message' : ''}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <img src="${message.userPhoto || 'https://via.placeholder.com/30'}" 
                 alt="صورة المستخدم" class="message-avatar">
            <span class="message-sender">${message.userName}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <p class="message-text">${message.text}</p>
    `;
    elements.chatMessages.appendChild(messageEl);
}

async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message || !state.currentUser) return;

    try {
        await db.collection('messages').add({
            text: DOMPurify.sanitize(message),
            userId: state.currentUser.uid,
            userName: state.currentUser.displayName || 'مستخدم',
            userPhoto: state.currentUser.photoURL || 'https://via.placeholder.com/30',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        elements.messageInput.value = '';
    } catch (error) {
        console.error('Send Message Error:', error);
        showToast('فشل إرسال الرسالة', 'error');
    }
}

// 7. أدوات مساعدة
function formatTime(timestamp) {
    if (!timestamp) return 'الآن';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function setupTabs() {
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            // إزالة النشاط من جميع الألسنة
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            // إضافة النشاط للسان المحدد
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 8. التهيئة الرئيسية
function init() {
    setupAuthStateListener();
    setupTabs();
    setupChat();
    
    // إعداد مستمعي الأحداث للتقييمات
    elements.ratingStars.forEach(star => {
        star.addEventListener('click', handleRating);
    });

    // إعداد مستمعي الأحداث للمصادقة
    elements.googleLoginBtn.addEventListener('click', handleAuth);

    // تحديث السنة في الفوتر
    document.querySelector('.current-year').textContent = new Date().getFullYear();
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', init);
