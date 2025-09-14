// popup-rating.js
// نافذة منبثقة بعد 20 ثانية لحفظ تقييم + ملاحظة في Firestore collection "feedback"

(async function () {
  // ====== Firebase Init ======
  const firebaseConfig = {
    apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
    authDomain: "edumates-983dd.firebaseapp.com",
    projectId: "edumates-983dd",
    storageBucket: "edumates-983dd.firebasestorage.app",
    messagingSenderId: "172548876353",
    appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
    measurementId: "G-L1KCZTW8R9"
  };

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
  const { getFirestore, collection, addDoc, serverTimestamp } =
    await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  let rating = 0;

  function createStyles() {
    const css = `
      .sr-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999}
      .sr-popup{max-width:520px;width:92%;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.3);padding:18px;direction:rtl;font-family:Tahoma, Arial, sans-serif}
      .sr-popup h3{margin:0 0 8px;font-size:18px}
      .sr-stars{display:flex;gap:8px;align-items:center;justify-content:center;margin:10px 0}
      .sr-star{font-size:28px;cursor:pointer;user-select:none}
      .sr-star.filled::before{content:'★'}
      .sr-star.empty::before{content:'☆'}
      .sr-text{width:100%;min-height:80px;padding:10px;border-radius:8px;border:1px solid #ddd;resize:vertical}
      .sr-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
      .sr-btn{padding:8px 12px;border-radius:8px;border:none;cursor:pointer}
      .sr-btn.submit{background:#0b74de;color:white}
      .sr-btn.later{background:#efefef}
    `;
    const s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'sr-popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'sr-popup';

    popup.innerHTML = `
      <h3>قيّم موقعنا</h3>
      <p>ساعدنا بتحسين الموقع — اختر تقييمك وأترك ملاحظة قصيرة.</p>
      <div class="sr-stars"></div>
      <textarea class="sr-text" placeholder="ما الذي نقترح تغييره أو إضافته؟"></textarea>
      <div class="sr-actions">
        <button class="sr-btn later">لا الآن</button>
        <button class="sr-btn submit">إرسال</button>
      </div>
    `;

    overlay.appendChild(popup);

    const starsContainer = popup.querySelector('.sr-stars');
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('span');
      s.className = 'sr-star empty';
      s.setAttribute('data-value', i);
      s.addEventListener('click', onStarClick);
      starsContainer.appendChild(s);
    }

    const btnLater = popup.querySelector('.later');
    const btnSubmit = popup.querySelector('.submit');
    const textarea = popup.querySelector('.sr-text');

    btnLater.addEventListener('click', () => { document.body.removeChild(overlay); });
    btnSubmit.addEventListener('click', async () => {
      const comment = textarea.value.trim();
      await submitFeedback(rating, comment);
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });

    return overlay;
  }

  function onStarClick(e) {
    const val = Number(this.getAttribute('data-value'));
    rating = val;
    const stars = this.parentElement.querySelectorAll('.sr-star');
    stars.forEach((el) => {
      const v = Number(el.getAttribute('data-value'));
      if (v <= val) {
        el.classList.add('filled'); el.classList.remove('empty');
      } else {
        el.classList.add('empty'); el.classList.remove('filled');
      }
    });
  }

  async function submitFeedback(ratingValue, comment) {
    try {
      await addDoc(collection(db, "feedback"), {
        rating: ratingValue || 0,
        comment: comment || '',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });
      console.info("✅ تم حفظ التقييم في Firestore");
    } catch (e) {
      console.error("❌ خطأ أثناء الحفظ:", e);
    }
  }

  function init() {
    createStyles();
    setTimeout(() => {
      const popup = buildPopup();
      document.body.appendChild(popup);
    }, 20000); // 20 ثانية
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
