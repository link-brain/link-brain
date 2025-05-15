document.getElementById('quiz-form').addEventListener('submit', function (e) {
  e.preventDefault();

  let score = 0;
  const total = 30;

  // السؤال 1: اختيار متعدد
  if (document.querySelector('input[name="q1"]:checked')?.value === 'c') {
    score++;
  }

  // السؤال 2: إدخال نص
  const q2Answer = document.querySelector('input[name="q2"]').value.trim().toLowerCase();
  if (q2Answer === '<h1>' || q2Answer === '&lt;h1&gt;') {
    score++;
  }

  // السؤال 3: اختيار متعدد
  if (document.querySelector('input[name="q3"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 4: صح/خطأ
  if (document.querySelector('input[name="q4"]:checked')?.value === 'false') {
    score++;
  }

  // السؤال 5: اختيار متعدد
  if (document.querySelector('input[name="q5"]:checked')?.value === 'b') {
    score++;
  }

  // السؤال 6: إدخال نص
  const q6Answer = document.querySelector('input[name="q6"]').value.trim().toLowerCase();
  if (q6Answer === '<ul>' || q6Answer === '&lt;ul&gt;') {
    score++;
  }

  // السؤال 7: اختيار متعدد
  if (document.querySelector('input[name="q7"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 8: صح/خطأ
  if (document.querySelector('input[name="q8"]:checked')?.value === 'true') {
    score++;
  }

  // السؤال 9: إدخال نص
  const q9Answer = document.querySelector('input[name="q9"]').value.trim().toLowerCase();
  if (q9Answer === 'alt') {
    score++;
  }

  // السؤال 10: اختيار متعدد
  if (document.querySelector('input[name="q10"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 11: إدخال نص
  const q11Answer = document.querySelector('input[name="q11"]').value.trim().toLowerCase();
  if (q11Answer === '<th>' || q11Answer === '&lt;th&gt;') {
    score++;
  }

  // السؤال 12: اختيار متعدد
  if (document.querySelector('input[name="q12"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 13: صح/خطأ
  if (document.querySelector('input[name="q13"]:checked')?.value === 'false') {
    score++;
  }

  // السؤال 14: إدخال نص
  const q14Answer = document.querySelector('input[name="q14"]').value.trim().toLowerCase();
  if (q14Answer === '<p>' || q14Answer === '&lt;p&gt;') {
    score++;
  }

  // السؤال 15: اختيار متعدد
  if (document.querySelector('input[name="q15"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 16: إدخال نص
  const q16Answer = document.querySelector('input[name="q16"]').value.trim().toLowerCase();
  if (q16Answer === 'id') {
    score++;
  }

  // السؤال 17: اختيار متعدد
  if (document.querySelector('input[name="q17"]:checked')?.value === 'b') {
    score++;
  }

  // السؤال 18: صح/خطأ
  if (document.querySelector('input[name="q18"]:checked')?.value === 'false') {
    score++;
  }

  // السؤال 19: إدخال نص
  const q19Answer = document.querySelector('input[name="q19"]').value.trim().toLowerCase();
  if (q19Answer === '<button>' || q19Answer === '&lt;button&gt;') {
    score++;
  }

  // السؤال 20: اختيار متعدد
  if (document.querySelector('input[name="q20"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 21: إدخال نص
  const q21Answer = document.querySelector('input[name="q21"]').value.trim().toLowerCase();
  if (q21Answer === 'type') {
    score++;
  }

  // السؤال 22: اختيار متعدد
  if (document.querySelector('input[name="q22"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 23: صح/خطأ
  if (document.querySelector('input[name="q23"]:checked')?.value === 'true') {
    score++;
  }

  // السؤال 24: إدخال نص
  const q24Answer = document.querySelector('input[name="q24"]').value.trim().toLowerCase();
  if (q24Answer === '<td>' || q24Answer === '&lt;td&gt;') {
    score++;
  }

  // السؤال 25: اختيار متعدد
  if (document.querySelector('input[name="q25"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 26: إدخال نص
  const q26Answer = document.querySelector('input[name="q26"]').value.trim().toLowerCase();
  if (q26Answer === 'class') {
    score++;
  }

  // السؤال 27: اختيار متعدد
  if (document.querySelector('input[name="q27"]:checked')?.value === 'b') {
    score++;
  }

  // السؤال 28: إدخال نص
  const q28Answer = document.querySelector('input[name="q28"]').value.trim().toLowerCase();
  if (q28Answer === '<form>' || q28Answer === '&lt;form&gt;') {
    score++;
  }

  // السؤال 29: اختيار متعدد
  if (document.querySelector('input[name="q29"]:checked')?.value === 'a') {
    score++;
  }

  // السؤال 30: اختيار متعدد
  if (document.querySelector('input[name="q30"]:checked')?.value === 'a') {
    score++;
  }

  // عرض النتيجة
  const resultBox = document.getElementById('result');
  resultBox.classList.remove('hidden');
  resultBox.textContent = `درجتك: ${score} من ${total}`;

  // إظهار زر إعادة الاختبار
  document.getElementById('retake').classList.remove('hidden');
});

// إعادة الاختبار
document.getElementById('retake').addEventListener('click', function () {
  document.getElementById('quiz-form').reset();
  const resultBox = document.getElementById('result');
  resultBox.classList.add('hidden');
  resultBox.textContent = '';
  document.getElementById('retake').classList.add('hidden');
});