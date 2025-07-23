// ===== التهيئة الأساسية =====
const firebaseConfig = {
  apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
  authDomain: "edumates-983dd.firebaseapp.com",
  projectId: "edumates-983dd",
  storageBucket: "edumates-983dd.appspot.com",
  messagingSenderId: "172548876353",
  appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
  measurementId: "G-L1KCZTW8R9"
};

// تهيئة Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// ===== حالة التطبيق =====
const state = {
  currentUser: null,
  chat: {
    lastVisible: null,
    unsubscribe: null
  },
  ratings: {}
};

// ===== عناصر DOM =====
const elements = {
  // المصادقة
  authBtn: document.getElementById('googleLoginBtn'),
  
  // المحادثة
  chatBtn: document.getElementById('chatBtn'),
  chatPopup: document.getElementById('chatPopup'),
  chatMessages: document.getElementById('chatMessages'),
  messageInput: document.getElementById('messageInput'),
  sendBtn: document.getElementById('sendMessageBtn'),
  closeChatBtn: document.getElementById('closeChat'),
  
  // التقييمات
  ratingStars: document.querySelectorAll('.rating-stars i'),
  resourceCards: document.querySelectorAll('.resource-card')
};

// ===== نظام المصادقة =====
async function handleAuth() {
  try {
    if (state.currentUser) {
      await auth.signOut();
      showToast('تم تسجيل الخروج بنجاح', 'success');
    } else {
      const result = await auth.signInWithPopup(provider);
      if (result.user) {
        showToast(`مرحباً ${result.user.displayName || 'بالضيف'}`, 'success');
      }
    }
  } catch (error) {
    console.error('Auth Error:', error);
    showToast('حدث خطأ في المصادقة', 'error');
  }
}

// متابعة حالة المستخدم
auth.onAuthStateChanged(user => {
  state.currentUser = user;
  updateAuthUI();
  
  if (user) {
    initRatings();
  } else {
    clearRatings();
  }
});

function updateAuthUI() {
  if (state.currentUser) {
    elements.authBtn.innerHTML = `
      <img src="${state.currentUser.photoURL || 'https://via.placeholder.com/30'}" 
           class="user-avatar">
      <span>${state.currentUser.displayName || 'مستخدم'}</span>
      <i class="fas fa-sign-out-alt"></i>
    `;
    elements.authBtn.classList.add('logged-in');
  } else {
    elements.authBtn.innerHTML = `<i class="fab fa-google"></i> تسجيل الدخول`;
    elements.authBtn.classList.remove('logged-in');
  }
}

// ===== نظام التقييمات =====
function initRatings() {
  elements.resourceCards.forEach(card => {
    const resourceId = card.dataset.linkId;
    setupRatingListener(resourceId);
  });
}

function setupRatingListener(resourceId) {
  state.ratings[resourceId] = db.collection('ratings')
    .where('resourceId', '==', resourceId)
    .onSnapshot(snapshot => {
      updateRatingUI(resourceId, snapshot.docs);
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
  const resourceId = card.dataset.linkId;

  try {
    // التحقق من التقييم السابق
    const query = await db.collection('ratings')
      .where('userId', '==', state.currentUser.uid)
      .where('resourceId', '==', resourceId)
      .get();

    if (!query.empty) {
      showToast('لقد قيمت هذا المورد مسبقاً', 'warning');
      return;
    }

    // إضافة التقييم الجديد
    await db.collection('ratings').add({
      userId: state.currentUser.uid,
      resourceId: resourceId,
      rating: ratingValue,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Rating Error:', error);
    showToast('حدث خطأ في التقييم', 'error');
  }
}

function updateRatingUI(resourceId, ratings) {
  const card = document.querySelector(`[data-link-id="${resourceId}"]`);
  if (!card) return;

  // حساب المتوسط
  const total = ratings.reduce((sum, doc) => sum + doc.data().rating, 0);
  const avg = ratings.length > 0 ? (total / ratings.length).toFixed(1) : '0.0';
  const count = ratings.length;

  // تحديث الواجهة
  card.querySelector('.average-rating').textContent = avg;
  card.querySelector('.rating-count').textContent = `(${count})`;

  // تحديث النجوم
  const stars = card.querySelectorAll('.rating-stars i');
  stars.forEach(star => {
    const value = parseInt(star.dataset.value);
    star.classList.toggle('rated', value <= Math.round(avg));
  });
}

function clearRatings() {
  elements.resourceCards.forEach(card => {
    card.querySelector('.average-rating').textContent = '0.0';
    card.querySelector('.rating-count').textContent = '(0)';
    card.querySelectorAll('.rating-stars i').forEach(star => {
      star.classList.remove('rated');
    });
  });
}

// ===== نظام المحادثة =====
function setupChat() {
  elements.chatBtn.addEventListener('click', toggleChat);
  elements.closeChatBtn.addEventListener('click', toggleChat);
  elements.sendBtn.addEventListener('click', sendMessage);
  elements.messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

function toggleChat() {
  const isOpen = elements.chatPopup.classList.toggle('active');
  
  if (isOpen) {
    loadMessages();
    elements.messageInput.focus();
  } else {
    if (state.chat.unsubscribe) {
      state.chat.unsubscribe();
      state.chat.unsubscribe = null;
    }
  }
}

function loadMessages() {
  state.chat.unsubscribe = db.collection('messages')
    .orderBy('timestamp', 'asc')
    .limit(25)
    .onSnapshot(snapshot => {
      elements.chatMessages.innerHTML = '';
      
      snapshot.forEach(doc => {
        addMessageToDOM(doc.data());
      });
      
      scrollChatToBottom();
      state.chat.lastVisible = snapshot.docs[snapshot.docs.length - 1];
    });
}

function addMessageToDOM(message) {
  const msgElement = document.createElement('div');
  msgElement.className = `message ${message.userId === state.currentUser?.uid ? 'user' : ''}`;
  
  msgElement.innerHTML = `
    <div class="message-header">
      <img src="${message.userPhoto || 'https://via.placeholder.com/30'}" 
           class="avatar">
      <span class="sender">${message.userName}</span>
      <span class="time">${formatTime(message.timestamp)}</span>
    </div>
    <p class="text">${message.text}</p>
  `;
  
  elements.chatMessages.appendChild(msgElement);
}

async function sendMessage() {
  const text = elements.messageInput.value.trim();
  
  if (!text || !state.currentUser) {
    showToast('لا يمكن إرسال رسالة فارغة', 'error');
    return;
  }

  try {
    await db.collection('messages').add({
      text: text,
      userId: state.currentUser.uid,
      userName: state.currentUser.displayName || 'مستخدم',
      userPhoto: state.currentUser.photoURL || '',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    elements.messageInput.value = '';
    scrollChatToBottom();
    
  } catch (error) {
    console.error('Message Error:', error);
    showToast('فشل إرسال الرسالة', 'error');
  }
}

function scrollChatToBottom() {
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ===== أدوات مساعدة =====
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function formatTime(timestamp) {
  if (!timestamp) return 'الآن';
  
  const date = timestamp.toDate();
  return date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===== تهيئة التطبيق =====
function init() {
  // إعداد مستمعي الأحداث
  elements.authBtn.addEventListener('click', handleAuth);
  
  elements.ratingStars.forEach(star => {
    star.addEventListener('click', handleRating);
  });
  
  setupChat();
  
  // تحديث السنة في الفوتر
  document.querySelector('.current-year').textContent = new Date().getFullYear();
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', init);
