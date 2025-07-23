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

// 2. حالة التطبيق
const state = {
    currentUser: null,
    lastMessageDoc: null,
    unsubscribeRatings: {},
    unsubscribeChat: null,
    authInProgress: false
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

// 4. نظام المصادقة المعدل
async function handleAuth() {
    if (state.authInProgress) return;
    
    try {
        state.authInProgress = true;
        
        if (state.currentUser) {
            await auth.signOut();
            showToast('تم تسجيل الخروج بنجاح', 'success');
        } else {
            const result = await auth.signInWithPopup(provider);
            if (result.user) {
                showToast('مرحباً بك!', 'success');
            }
        }
    } catch (error) {
        handleAuthError(error);
    } finally {
        state.authInProgress = false;
    }
}

function handleAuthError(error) {
    console.error("Auth Error:", error);
    
    switch(error.code) {
        case 'auth/popup-closed-by-user':
            showToast('تم إغلاق نافذة التسجيل', 'info');
            break;
        case 'auth/cancelled-popup-request':
            // لا تعرض رسالة للمستخدم في هذه الحالة
            break;
        default:
            showToast('حدث خطأ أثناء المصادقة: ' + error.message, 'error');
    }
}

// 5. نظام التقييمات المعدل
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
        // التحقق من التقييم السابق باستخدام transaction
        const ratingDocId = `${linkId}_${state.currentUser.uid}`;
        const ratingRef = db.collection('ratings').doc(ratingDocId);

        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(ratingRef);
            
            if (doc.exists) {
                throw new Error('لقد قيمت هذا المورد مسبقاً');
            }

            transaction.set(ratingRef, {
                userId: state.currentUser.uid,
                linkId: linkId,
                rating: ratingValue,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userName: state.currentUser.displayName || 'مستخدم'
            });
        });

        showToast('تم تسجيل تقييمك بنجاح', 'success');
    } catch (error) {
        console.error("Rating Error:", error);
        showToast(error.message || 'حدث خطأ في التقييم', 'error');
    }
}

// 6. نظام المحادثة المعدل
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
        cleanupChat();
    }
}

function cleanupChat() {
    if (state.unsubscribeChat) {
        state.unsubscribeChat();
        state.unsubscribeChat = null;
    }
    elements.chatMessages.innerHTML = '';
    state.lastMessageDoc = null;
}

async function sendMessage() {
    const messageText = elements.messageInput.value.trim();
    
    if (!messageText || !state.currentUser) {
        showToast('الرسالة لا يمكن أن تكون فارغة', 'error');
        return;
    }

    try {
        const sanitizedMessage = window.DOMPurify.sanitize(messageText);
        
        await db.collection('messages').add({
            text: sanitizedMessage,
            userId: state.currentUser.uid,
            userName: state.currentUser.displayName || 'مستخدم',
            userPhoto: state.currentUser.photoURL || 'https://via.placeholder.com/30',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        elements.messageInput.value = '';
    } catch (error) {
        console.error("Send Message Error:", error);
        showToast('فشل إرسال الرسالة', 'error');
    }
}

// 7. الوظائف المساعدة المحدثة
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatTime(timestamp) {
    if (!timestamp) return 'الآن';
    
    try {
        const date = timestamp.toDate();
        return date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error("Time Format Error:", error);
        return '';
    }
}

// 8. التهيئة الرئيسية
function init() {
    // متابعة حالة المصادقة
    auth.onAuthStateChanged(user => {
        state.currentUser = user;
        updateAuthUI();
        
        if (user) {
            initializeRatings();
        } else {
            cleanupRatingsListeners();
        }
    });

    // إعداد واجهة المستخدم
    setupTabs();
    setupChat();
    setupEventListeners();
    
    // تحديث السنة في الفوتر
    document.querySelector('.current-year').textContent = new Date().getFullYear();
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', init);
