document.addEventListener('DOMContentLoaded', () => {
  // تهيئة التقييمات
  wireRatings();
  // أي مميزات ثانية
  wireFeatureToggles();
});

function wireRatings() {
  document.querySelectorAll('.rating-stars').forEach(container => {
    const li = container.closest('[data-link-id]');
    if (!li) return;

    const linkId = li.getAttribute('data-link-id');
    if (!linkId) return;

    // تحميل التقييم الحالي من فايربيز
    loadRatings(linkId, container);

    // استخدام Event Delegation بدل listeners كثيرة
    container.addEventListener('click', e => {
      if (!e.target.matches('i.fas.fa-star')) return;

      const rating = parseInt(e.target.dataset.value, 10);
      if (rating >= 1 && rating <= 5) {
        // تلوين النجوم محليًا مباشرة
        highlightStars(container, rating);
        // حفظ التقييم في نفس الكولكشن (ما غيرت الاسم)
        submitRating(linkId, rating);
      }
    });
  });
}

// وظيفة تلوين النجوم
function highlightStars(container, value) {
  container.querySelectorAll('i.fas.fa-star').forEach((star, index) => {
    star.classList.toggle('active', index < value);
  });
}
