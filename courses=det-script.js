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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// عناصر DOM
const DOM = {
    googleLoginBtn: document.getElementById('googleLoginBtn'),
    chatBtn: document.getElementById('chatBtn'),
    chatPopup: document.getElementById('chatPopup'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    ratingStars: document.querySelectorAll('.rating-stars i'),
    resourceCards: document.querySelectorAll('.resource-card')
};

// متغيرات الحالة
let currentUser = null;
let lastMessageDoc = null;
const MESSAGES_LIMIT = 20;

// ============== نظام المصادقة ==============
async function handleAuth() {
    try {
        if (currentUser) {
            await auth.signOut();
            showToast('تم تسجيل الخروج بنجاح', 'success');
        } else {
            await auth.signInWithPopup(provider);
            showToast('مرحباً! تم تسجيل الدخول', 'success');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showToast('حدث خطأ في المصادقة', 'error');
    }
}

auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    if (user) initRatings();
});

function updateAuthUI() {
    if (currentUser) {
        DOM.googleLoginBtn.innerHTML = `
            <img src="${currentUser.photoURL || 'https://via.placeholder.com/30'}" 
                 alt="صورة المستخدم" class="user-avatar">
            <span>${currentUser.displayName || 'مستخدم'}</span>
            <i class="fas fa-sign-out-alt"></i>
        `;
        DOM.googleLoginBtn.classList.add('user-logged-in');
    } else {
        DOM.googleLoginBtn.innerHTML = `<i class="fab fa-google"></i> تسجيل الدخول`;
        DOM.googleLoginBtn.classList.remove('user-logged-in');
    }
}

// ============== نظام التقييمات ==============
async function initRatings() {
    DOM.resourceCards.forEach(card => {
        const linkId = card.dataset.linkId;
        listenToRatings(linkId);
    });
}

async function listenToRatings(linkId) {
    db.collection('ratings')
        .where('linkId', '==', linkId)
        .onSnapshot(snapshot => {
            updateRatingUI(linkId, snapshot.docs);
        });
}

async function handleRating(e) {
    if (!currentUser) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        return;
    }

    const star = e.target.closest('i');
    const ratingValue = parseInt(star.dataset.value);
    const card = star.closest('.resource-card');
    const linkId = card.dataset.linkId;

    try {
        // تحقق من التقييم السابق
        const existingRating = await db.collection('ratings')
            .where('userId', '==', currentUser.uid)
            .where('linkId', '==', linkId)
            .get();

        if (!existingRating.empty) {
            showToast('لقد قيمت هذا المورد مسبقاً', 'warning');
            return;
        }

        // إضافة التقييم الجديد
        await db.collection('ratings').add({
            userId: currentUser.uid,
            linkId: linkId,
            rating: ratingValue,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast('تم تسجيل تقييمك بنجاح', 'success');
    } catch (error) {
        console.error('Rating error:', error);
        showToast('حدث خطأ في التقييم', 'error');
    }
}

function updateRatingUI(linkId, ratings) {
    const card = document.querySelector(`[data-link-id="${linkId}"]`);
    if (!card) return;

    const total = ratings.reduce((sum, doc) => sum + doc.data().rating, 0);
    const average = (total / ratings.length).toFixed(1);
    const count = ratings.length;

    card.querySelector('.average-rating').textContent = average;
    card.querySelector('.rating-count').textContent = `(${count} تقييمات)`;

    // تحديث النجوم
    const stars = card.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
        star.classList.toggle('rated', parseInt(star.dataset.value) <= Math.round(average));
    });
}

// ============== نظام المحادثة ==============
async function loadMessages() {
    let query = db.collection('messages')
                 .orderBy('timestamp', 'desc')
                 .limit(MESSAGES_LIMIT);

    if (lastMessageDoc) {
        query = query.startAfter(lastMessageDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return;

    lastMessageDoc = snapshot.docs[snapshot.docs.length - 1];
    
    snapshot.forEach(doc => {
        addMessageToDOM(doc.data());
    });
}

function addMessageToDOM(msg) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${msg.userId === currentUser?.uid ? 'user-message' : ''}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <img src="${msg.userPhoto}" alt="صورة المستخدم" class="message-avatar">
            <span class="message-sender">${msg.userName}</span>
            <span class="message-time">${formatTime(msg.timestamp)}</span>
        </div>
        <p class="message-text">${msg.text}</p>
    `;
    DOM.chatMessages.prepend(messageEl);
}

async function sendMessage() {
    const text = DOM.messageInput.value.trim();
    if (!text || !currentUser) return;

    try {
        await db.collection('messages').add({
            text: DOMPurify.sanitize(text),
            userId: currentUser.uid,
            userName: currentUser.displayName || 'مستخدم',
            userPhoto: currentUser.photoURL || 'https://via.placeholder.com/30',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        DOM.messageInput.value = '';
    } catch (error) {
        console.error('Message error:', error);
        showToast('فشل إرسال الرسالة', 'error');
    }
}

// ============== أدوات مساعدة ==============
function formatTime(timestamp) {
    if (!timestamp) return 'الآن';
    const date = timestamp.toDate();
    return date.toLocaleString('ar-EG', {
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

// ============== إعداد مستمعي الأحداث ==============
DOM.googleLoginBtn.addEventListener('click', handleAuth);
DOM.chatBtn.addEventListener('click', toggleChatPopup);
DOM.sendMessageBtn.addEventListener('click', sendMessage);
DOM.messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

DOM.ratingStars.forEach(star => {
    star.addEventListener('click', handleRating);
});

// ============== التهيئة الأولية ==============
function init() {
    // تحديث السنة في الفوتر
    document.querySelector('.current-year').textContent = new Date().getFullYear();
    
    // تهيئة علامات التبويب
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
