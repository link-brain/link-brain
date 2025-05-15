document.getElementById('quiz-form').addEventListener('submit', function (e) {
  e.preventDefault();

  let score = 0;
  const total = 30;

  // إزالة أي تمييز سابق للإجابات الخاطئة
  document.querySelectorAll('.question').forEach(q => q.classList.remove('incorrect'));

  // السؤال 1: اختيار متعدد
  if (document.querySelector('input[name="q1"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q1').classList.add('incorrect');
  }

  // السؤال 2: إدخال نص
  const q2Answer = document.querySelector('input[name="q2"]').value.trim().toLowerCase();
  if (q2Answer === '!important') {
    score++;
  } else {
    document.getElementById('q2').classList.add('incorrect');
  }

  // السؤال 3: اختيار متعدد
  if (document.querySelector('input[name="q3"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q3').classList.add('incorrect');
  }

  // السؤال 4: صح/خطأ
  if (document.querySelector('input[name="q4"]:checked')?.value === 'true') {
    score++;
  } else {
    document.getElementById('q4').classList.add('incorrect');
  }

  // السؤال 5: اختيار متعدد
  if (document.querySelector('input[name="q5"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q5').classList.add('incorrect');
  }

  // السؤال 6: إدخال نص
  const q6Answer = document.querySelector('input[name="q6"]').value.trim().toLowerCase();
  if (q6Answer === 'transition') {
    score++;
  } else {
    document.getElementById('q6').classList.add('incorrect');
  }

  // السؤال 7: اختيار متعدد
  if (document.querySelector('input[name="q7"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q7').classList.add('incorrect');
  }

  // السؤال 8: صح/خطأ
  if (document.querySelector('input[name="q8"]:checked')?.value === 'true') {
    score++;
  } else {
    document.getElementById('q8').classList.add('incorrect');
  }

  // السؤال 9: إدخال نص
  const q9Answer = document.querySelector('input[name="q9"]').value.trim().toLowerCase();
  if (q9Answer === 'transform') {
    score++;
  } else {
    document.getElementById('q9').classList.add('incorrect');
  }

  // السؤال 10: اختيار متعدد
  if (document.querySelector('input[name="q10"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q10').classList.add('incorrect');
  }

  // السؤال 11: إدخال نص
  const q11Answer = document.querySelector('input[name="q11"]').value.trim().toLowerCase();
  if (q11Answer === 'text-shadow') {
    score++;
  } else {
    document.getElementById('q11').classList.add('incorrect');
  }

  // السؤال 12: اختيار متعدد
  if (document.querySelector('input[name="q12"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q12').classList.add('incorrect');
  }

  // السؤال 13: صح/خطأ
  if (document.querySelector('input[name="q13"]:checked')?.value === 'true') {
    score++;
  } else {
    document.getElementById('q13').classList.add('incorrect');
  }

  // السؤال 14: إدخال نص
  const q14Answer = document.querySelector('input[name="q14"]').value.trim().toLowerCase();
  if (q14Answer === 'border-style') {
    score++;
  } else {
    document.getElementById('q14').classList.add('incorrect');
  }

  // السؤال 15: اختيار متعدد
  if (document.querySelector('input[name="q15"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q15').classList.add('incorrect');
  }

  // السؤال 16: كود
  const q16Answer = document.querySelector('textarea[name="q16"]').value.trim().toLowerCase();
  const q16Correct = `<div class="container"><div class="box"></div></div>
.container { display: flex; justify-content: center; align-items: center; height: 100vh; }
.box { width: 100px; height: 100px; }`.toLowerCase().replace(/\s+/g, ' ');
  if (q16Answer.replace(/\s+/g, ' ').includes('display: flex') && q16Answer.includes('justify-content: center') && q16Answer.includes('align-items: center')) {
    score++;
  } else {
    document.getElementById('q16').classList.add('incorrect');
  }

  // السؤال 17: اختيار متعدد
  if (document.querySelector('input[name="q17"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q17').classList.add('incorrect');
  }

  // السؤال 18: صح/خطأ
  if (document.querySelector('input[name="q18"]:checked')?.value === 'false') {
    score++;
  } else {
    document.getElementById('q18').classList.add('incorrect');
  }

  // السؤال 19: إدخال نص
  const q19Answer = document.querySelector('input[name="q19"]').value.trim().toLowerCase();
  if (q19Answer === 'transition-delay') {
    score++;
  } else {
    document.getElementById('q19').classList.add('incorrect');
  }

  // السؤال 20: اختيار متعدد
  if (document.querySelector('input[name="q20"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q20').classList.add('incorrect');
  }

  // السؤال 21: كود
  const q21Answer = document.querySelector('textarea[name="q21"]').value.trim().toLowerCase();
  if (q21Answer.includes('button:hover') && q21Answer.includes('background-color: red')) {
    score++;
  } else {
    document.getElementById('q21').classList.add('incorrect');
  }

  // السؤال 22: اختيار متعدد
  if (document.querySelector('input[name="q22"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q22').classList.add('incorrect');
  }

  // السؤال 23: صح/خطأ
  if (document.querySelector('input[name="q23"]:checked')?.value === 'true') {
    score++;
  } else {
    document.getElementById('q23').classList.add('incorrect');
  }

  // السؤال 24: إدخال نص
  const q24Answer = document.querySelector('input[name="q24"]').value.trim().toLowerCase();
  if (q24Answer === 'letter-spacing') {
    score++;
  } else {
    document.getElementById('q24').classList.add('incorrect');
  }

  // السؤال 25: اختيار متعدد
  if (document.querySelector('input[name="q25"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q25').classList.add('incorrect');
  }

  // السؤال 26: كود
  const q26Answer = document.querySelector('textarea[name="q26"]').value.trim().toLowerCase();
  if (q26Answer.includes(':hover') && q26Answer.includes('transform: rotate(360deg)')) {
    score++;
  } else {
    document.getElementById('q26').classList.add('incorrect');
  }

  // السؤال 27: اختيار متعدد
  if (document.querySelector('input[name="q27"]:checked')?.value === 'a') {
    score++;
  } else {
    document.getElementById('q27').classList.add('incorrect');
  }

  // السؤال 28: كود
  const q28Answer = document.querySelector('textarea[name="q28"]').value.trim().toLowerCase();
  if (q28Answer.includes('<ul') && q28Answer.includes('display: flex') && q28Answer.includes('list-style: none')) {
    score++;
  } else {
    document.getElementById('q28').classList.add('incorrect');
  }

  // السؤال 29: إدخال نص
  const q29Answer = document.querySelector('input[name="q29"]').value.trim().toLowerCase();
  if (q29Answer === 'min-width') {
    score++;
  } else {
    document.getElementById('q29').classList.add('incorrect');
  }

  // السؤال 30: كود
  const q30Answer = document.querySelector('textarea[name="q30"]').value.trim().toLowerCase();
  if (q30Answer.includes('@keyframes') && q30Answer.includes('opacity: 0') && q30Answer.includes('opacity: 1') && q30Answer.includes('animation')) {
    score++;
  } else {
    document.getElementById('q30').classList.add('incorrect');
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
  // إزالة تمييز الإجابات الخاطئة
  document.querySelectorAll('.question').forEach(q => q.classList.remove('incorrect'));
});