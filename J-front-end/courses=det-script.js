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
    const analytics = getAnalytics(app);
    const db = getFirestore(app);
    //----------------------------------
    
    //----------------------------------
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
    //-----------------------
    // ✅ عند تحميل الصفحة، تحقق إذا تم حفظ الاسم مسبقًا
         const savedName = localStorage.getItem('chatUserName');
        if (savedName) {
           const nameField = document.getElementById('usernameInput');
        if (nameField) {
           nameField.value = savedName;
           nameField.style.display = 'none';
  }
}
    //----------------------
    // تحديث روابط الاختبارات ديناميكيًا
    function updateExamLinks() {
        const examLinks = [
            { text: 'اختبار HTML', href: 'exam-html.html' },
            { text: 'اختبار CSS', href: 'exam-css.html' },
            { text: 'اختبار JavaScript', href: 'exam-js.html' },
            { text: 'اختبار Git', href: 'exam-git.html' },
            { text: 'اختبار Frameworks', href: 'exam-frameworks.html' },
            { text: 'اختبار Tools', href: 'exam-tools.html' },
            { text: 'اختبار Design', href: 'exam-design.html' },
            { text: 'اختبار Performance', href: 'exam-performance.html' },
            { text: 'اختبار Accessibility', href: 'exam-accessibility.html' },
            { text: 'اختبار Testing', href: 'exam-testing.html' },
            { text: 'اختبار Deployment', href: 'exam-deployment.html' }
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

    // إعداد مستمعي الأحداث
    setupEventListeners();

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
            const isActive = elements.chatPopup.classList.toggle('active');
            elements.chatPopup.setAttribute('aria-hidden', !isActive);
            console.log('Chat popup toggled:', isActive ? 'Opened' : 'Closed');
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
        elements.messageInput.disabled = true;

        // 🔹 الحصول على الاسم من الإدخال أو من التخزين المحلي أو من حساب المستخدم
        const nameField = document.getElementById('usernameInput');
        const saveBtn = document.getElementById('saveUsernameBtn');
        let chatUserName =
            localStorage.getItem('chatUserName') ||
            nameField?.value.trim() ||
            user.displayName ||
            'مستخدم';

        // 🔹 إذا كتب المستخدم اسمه الآن لأول مرة → احفظه وأخفِ الحقل والزر
        if (nameField && nameField.value.trim() !== '') {
            localStorage.setItem('chatUserName', nameField.value.trim());
            nameField.style.display = 'none';
            if (saveBtn) saveBtn.style.display = 'none';
        }

        // 🔹 إرسال الرسالة
        await addDoc(collection(db, 'messages'), {
            text: messageText,
            userId: user.uid,
            userName: chatUserName,
            userPhoto: user.photoURL || 'https://via.placeholder.com/30',
            timestamp: serverTimestamp()
        });

        // 🔹 مسح حقل الرسالة بعد الإرسال
        elements.messageInput.value = '';
        console.log('Message sent successfully');
        
    } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        alert('حدث خطأ أثناء إرسال الرسالة: ' + error.message);
    } finally {
        elements.sendMessageBtn.disabled = false;
        elements.messageInput.disabled = false;
        elements.messageInput.focus();
    }
}

    function loadMessages() {
    elements.chatLoading.classList.add('active');
    
    // تحميل جميع الرسائل مرة واحدة بدون تقسيم
    let messagesQuery = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'asc')
    );

    unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        elements.chatMessages.innerHTML = ''; // تنظيف الرسائل القديمة
        
        if (snapshot.empty) {
            elements.chatLoading.classList.remove('active');
            console.log('No messages found');
            return;
        }

        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        elements.chatLoading.classList.remove('active');

        // إضافة جميع الرسائل
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
    });
    
}    // وظيفة لتطهير النصوص
    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str.replace(/[<>]/g, '');
        return div.innerHTML;
    }

    // وظائف تبديل الميزات
    function toggleFeatures(event) {
        const toggle = event.currentTarget;
        const featuresList = toggle.nextElementSibling.nextElementSibling; // تعديل لتخطي div التقييم
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
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
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
                    }
                });
            }
        }
    }

    // إدارة تقييم الروابط
    async function submitRating(linkId, rating) {
        const user = auth.currentUser;
        if (!user) {
            alert('يرجى تسجيل الدخول لتقييم الرابط');
            return;
        }

        try {
            // التحقق مما إذا كان المستخدم قد قيّم الرابط مسبقًا
            const existingRatingQuery = query(
                collection(db, 'ratings'),
                where('linkId', '==', linkId),
                where('userId', '==', user.uid)
            );
            const existingRatingSnapshot = await getDocs(existingRatingQuery);

            if (!existingRatingSnapshot.empty) {
                alert('لقد قيّمت هذا الرابط مسبقًا');
                return;
            }

            await addDoc(collection(db, 'ratings'), {
                linkId: linkId,
                userId: user.uid,
                rating: rating,
                timestamp: serverTimestamp()
            });
            console.log(`تم تقييم الرابط ${linkId} بـ ${rating} نجوم`);
        } catch (error) {
            console.error('خطأ في إرسال التقييم:', error);
            alert('حدث خطأ أثناء إرسال التقييم: ' + error.message);
        }
    }

    function updateStarDisplay(starsContainer, rating, ratingCount, userRating = null) {
        const stars = starsContainer.querySelectorAll('i');
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            // تلوين النجوم بناءً على تقييم المستخدم إذا موجود
            if (userRating && starValue <= userRating) {
                star.classList.add('rated');
                star.style.color = 'var(--accent-orange)';
            }
            // تلوين النجوم بناءً على المتوسط فقط إذا كان هناك تقييمات
            else if (rating > 0 && starValue <= Math.floor(rating)) {
                star.classList.add('rated');
                star.style.color = 'var(--accent-orange)';
            }
            // إذا لم يكن هناك تقييمات أو تقييم المستخدم، كل النجوم رمادية
            else {
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
        const user = auth.currentUser;
        if (!user) {
            alert('قم بتسجيل الدخول لفتح المحادثة');
            return;
        }

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

    // ⬅️ تم حذف جزء loadMoreBtn من هنا

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

        starsContainer.querySelectorAll('i').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-value'));
                submitRating(linkId, rating);
            });
        });
    });
}
 
    // تتبع حالة المصادقة
    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
            if (elements.chatPopup.classList.contains('active') && !unsubscribeMessages) {
                loadMessages();
            }
            // تحديث تقييمات المستخدم
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
            // إلغاء الاشتراك في تقييمات المستخدم
            Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
            unsubscribeRatings = {};
            // إعادة تحميل التقييمات العامة
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        }
    });
});

// Roadmap popup behavior (robust)
document.addEventListener('DOMContentLoaded', function() {
  // افتح popup عند الضغط على أي عنصر من الرودماب
  document.querySelectorAll('.roadmap-item').forEach(item => {
    item.addEventListener('click', function(e) {
      // تأكد أن الضغط لم يكن على رابط داخل العنصر
      if (e.target.tagName.toLowerCase() === 'a') return;
      const skill = item.dataset.skill;
      if (!skill) return;
      const popup = document.getElementById('popup-' + skill);
      if (popup) {
        popup.classList.add('active');
        popup.setAttribute('aria-hidden', 'false');
        const btn = popup.querySelector('.view-sources, .close-popup');
        if (btn) btn.focus();
      }
    });
  });

  // إغلاق Popup عند الضغط على الخلفية أو زر الإغلاق
  document.querySelectorAll('.roadmap-detail-popup').forEach(p => {
    p.addEventListener('click', function(ev) {
      if (ev.target === p || ev.target.classList.contains('close-popup')) {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // ربط أزرار "رؤية المصادر" بالتمرير للجزء المناسب وإغلاق النافذة
  document.querySelectorAll('.view-sources').forEach(btn => {
    btn.addEventListener('click', function(ev) {
      ev.preventDefault();
      const targetId = btn.dataset.target;
      if (targetId) {
        const targetElem = document.getElementById(targetId);
        if (targetElem) {
          document.querySelectorAll('.roadmap-detail-popup.active').forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-hidden', 'true');
          });
          targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const fallback = document.getElementById('additional-resources');
          if (fallback) fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // إغلاق بالضغط على Esc
  document.addEventListener('keydown', function(ev) {
    if (ev.key === 'Escape') {
      document.querySelectorAll('.roadmap-detail-popup.active').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-hidden', 'true');
      });
    }
  });
});



// === Roadmap main close button ===
document.addEventListener('DOMContentLoaded', function () {
  const roadmapModal = document.getElementById('roadmapPopup');
  if (roadmapModal) {
    // إضافة زر إغلاق إذا لم يكن موجود
    if (!roadmapModal.querySelector('.close-roadmap')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-roadmap';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'إغلاق الرودماب');
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '10px';
      closeBtn.style.left = '10px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '1.5rem';
      closeBtn.style.cursor = 'pointer';
      roadmapModal.prepend(closeBtn);
      closeBtn.addEventListener('click', function () {
        roadmapModal.classList.remove('active');
      });
    }
  }

  // تعديل أزرار رؤية المصادر
  document.querySelectorAll('.view-sources').forEach(btn => {
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      const targetId = btn.dataset.target;
      // إغلاق النوافذ المنبثقة
      document.querySelectorAll('.roadmap-detail-popup.active').forEach(p => {
        p.classList.remove('active');
      });
      // إغلاق نافذة الرودماب الرئيسية
      if (roadmapModal) {
        roadmapModal.classList.remove('active');
      }
      // الانتقال للقسم المطلوب بعد الإغلاق
      if (targetId) {
        const targetElem = document.getElementById(targetId);
        if (targetElem) {
          setTimeout(() => {
            targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    });
  });
});
function setupRoadmapChecks() {
  document.querySelectorAll('.roadmap-item').forEach(item => {
    const skill = item.getAttribute('data-skill');
    const checkBtn = item.querySelector('.check-btn');

    // استعادة الحالة من localStorage
    if (localStorage.getItem(`roadmap-${skill}`) === 'completed') {
      item.classList.add('completed');
      checkBtn.textContent = 'تم ✔';
    }

    // عند الضغط على الزر
    checkBtn.addEventListener('click', () => {
      const isCompleted = item.classList.toggle('completed');
      if (isCompleted) {
        localStorage.setItem(`roadmap-${skill}`, 'completed');
        checkBtn.textContent = 'تم ✔';
      } else {
        localStorage.removeItem(`roadmap-${skill}`);
        checkBtn.textContent = 'تحقق';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', setupRoadmapChecks);
