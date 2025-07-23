// ============== تهيئة Firebase ==============
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

// ============== حالة التطبيق ==============
const state = {
    currentUser: null,
    lastMessageDoc: null,
    unsubscribeRatings: {},
    unsubscribeChat: null,
    authInProgress: false,
    messagesLimit: 15
};

// ============== نظام المصادقة الكامل ==============
async function handleAuth() {
    if (state.authInProgress) return;
    state.authInProgress = true;

    try {
        if (state.currentUser) {
            await auth.signOut();
            showToast('تم تسجيل الخروج بنجاح', 'success');
        } else {
            const result = await auth.signInWithPopup(provider);
            if (result.user) {
                showToast(`مرحباً ${result.user.displayName || ''}`, 'success');
                initializeUserData(result.user);
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
    const errorMap = {
        'auth/popup-closed-by-user': 'تم إغلاق نافذة التسجيل',
        'auth/cancelled-popup-request': 'تم إلغاء الطلب',
        'auth/network-request-failed': 'خطأ في الشبكة'
    };
    showToast(errorMap[error.code] || 'حدث خطأ في المصادقة', 'error');
}

function initializeUserData(user) {
    // يمكنك إضافة بيانات إضافية للمستخدم هنا
    const userRef = db.collection('users').doc(user.uid);
    userRef.set({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName,
        email: user.email
    }, { merge: true });
}

// ============== نظام التقييمات الكامل ==============
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
        }, error => {
            console.error("Rating Listener Error:", error);
        });
}

async function handleRating(e) {
    if (!state.currentUser) {
        showToast('يجب تسجيل الدخول لتتمكن من التقييم', 'error');
        return;
    }

    const star = e.target.closest('i');
    if (!star) return;

    const ratingValue = parseInt(star.dataset.value);
    const card = star.closest('.resource-card');
    const linkId = card.dataset.linkId;

    try {
        const ratingId = `${linkId}_${state.currentUser.uid}`;
        const ratingRef = db.collection('ratings').doc(ratingId);

        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(ratingRef);
            if (doc.exists) {
                throw new Error('لقد قمت بتقييم هذا المحتوى مسبقاً');
            }
            transaction.set(ratingRef, {
                userId: state.currentUser.uid,
                userEmail: state.currentUser.email,
                userName: state.currentUser.displayName || 'مستخدم',
                linkId: linkId,
                rating: ratingValue,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        showToast('شكراً لتقييمك!', 'success');
    } catch (error) {
        console.error("Rating Error:", error);
        showToast(error.message, 'error');
    }
}

function updateRatingUI(linkId, ratings) {
    const card = document.querySelector(`.resource-card[data-link-id="${linkId}"]`);
    if (!card) return;

    const total = ratings.reduce((sum, doc) => sum + doc.data().rating, 0);
    const average = ratings.length > 0 ? (total / ratings.length).toFixed(1) : '0.0';
    const count = ratings.length;

    card.querySelector('.average-rating').textContent = average;
    card.querySelector('.rating-count').textContent = `(${count} تقييم${count !== 1 ? 'ات' : ''})`;

    const stars = card.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
        const value = parseInt(star.dataset.value);
        star.classList.toggle('rated', value <= Math.round(average));
    });
}

// ============== نظام المحادثة الكامل ==============
function setupChat() {
    elements.chatBtn.addEventListener('click', toggleChat);
    elements.closeChat.addEventListener('click', toggleChat);
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    elements.loadMoreBtn.addEventListener('click', loadMoreMessages);
}

function toggleChat() {
    const isActive = elements.chatPopup.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';

    if (isActive) {
        loadMessages();
        elements.messageInput.focus();
    } else {
        cleanupChat();
    }
}

function loadMessages(loadMore = false) {
    if (!loadMore) {
        elements.chatMessages.innerHTML = '';
        state.lastMessageDoc = null;
    }

    let query = db.collection('messages')
                 .orderBy('timestamp', 'desc')
                 .limit(state.messagesLimit);

    if (loadMore && state.lastMessageDoc) {
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
        elements.loadMoreBtn.style.display = snapshot.size >= state.messagesLimit ? 'block' : 'none';

        if (!loadMore) {
            scrollChatToBottom();
        }
    }, error => {
        console.error("Chat Error:", error);
        showToast('حدث خطأ في تحميل المحادثة', 'error');
    });
}

function addMessageToDOM(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.userId === state.currentUser?.uid ? 'user-message' : ''}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <img src="${message.userPhoto || 'https://via.placeholder.com/30'}" 
                 alt="صورة ${message.userName}" class="message-avatar">
            <span class="message-sender">${message.userName}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <p class="message-text">${window.DOMPurify.sanitize(message.text)}</p>
    `;
    elements.chatMessages.appendChild(messageEl);
}

async function sendMessage() {
    const messageText = elements.messageInput.value.trim();
    
    if (!messageText) {
        showToast('لا يمكن إرسال رسالة فارغة', 'error');
        return;
    }

    if (!state.currentUser) {
        showToast('يجب تسجيل الدخول لإرسال الرسائل', 'error');
        return;
    }

    try {
        elements.sendMessageBtn.disabled = true;
        
        await db.collection('messages').add({
            text: window.DOMPurify.sanitize(messageText),
            userId: state.currentUser.uid,
            userName: state.currentUser.displayName || 'مستخدم',
            userPhoto: state.currentUser.photoURL || 'https://via.placeholder.com/30',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        elements.messageInput.value = '';
    } catch (error) {
        console.error("Send Message Error:", error);
        showToast('فشل إرسال الرسالة', 'error');
    } finally {
        elements.sendMessageBtn.disabled = false;
    }
}

function scrollChatToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ============== الوظائف المساعدة ==============
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => toast.remove(), 3000);
    }, 100);
}

function formatTime(timestamp) {
    if (!timestamp) return 'الآن';
    
    try {
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;
        
        // إذا كانت الرسالة من اليوم
        if (diff < 86400000) {
            return date.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('ar-EG', {
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (error) {
        console.error("Time Format Error:", error);
        return '';
    }
}

// ============== تهيئة التطبيق ==============
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
    setupEventListeners();
    setupTabs();
    setupChat();
    updateYear();
}

function updateAuthUI() {
    if (!elements.googleLoginBtn) return;
    
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

function setupEventListeners() {
    if (elements.googleLoginBtn) {
        elements.googleLoginBtn.addEventListener('click', handleAuth);
    }
    
    document.querySelectorAll('.rating-stars i').forEach(star => {
        star.addEventListener('click', handleRating);
    });
}

function setupTabs() {
    if (!elements.tabs) return;
    
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const contentElement = document.getElementById(tabId);
            if (contentElement) contentElement.classList.add('active');
        });
    });
}

function updateYear() {
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function cleanupRatingsListeners() {
    Object.values(state.unsubscribeRatings).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
    });
    state.unsubscribeRatings = {};
}

function cleanupChat() {
    if (state.unsubscribeChat) {
        state.unsubscribeChat();
        state.unsubscribeChat = null;
    }
    elements.chatMessages.innerHTML = '';
    state.lastMessageDoc = null;
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init);
