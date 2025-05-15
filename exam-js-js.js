document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('quiz-form');
  if (!form) {
    console.error('Form with ID "quiz-form" not found');
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('Form submitted');

    let score = 0;
    const total = 30;

    try {
      // إزالة أي تمييز سابق للإجابات الخاطئة
      document.querySelectorAll('.question').forEach(q => q.classList.remove('incorrect'));

      // السؤال 1: اختيار متعدد
      const q1 = document.querySelector('input[name="q1"]:checked');
      if (q1?.value === 'a') {
        score++;
      } else {
        document.getElementById('q1').classList.add('incorrect');
      }

      // السؤال 2: إدخال نص
      const q2 = document.querySelector('input[name="q2"]');
      if (q2 && q2.value.trim().toLowerCase() === 'const') {
        score++;
      } else {
        document.getElementById('q2').classList.add('incorrect');
      }

      // السؤال 3: اختيار متعدد
      const q3 = document.querySelector('input[name="q3"]:checked');
      if (q3?.value === 'a') {
        score++;
      } else {
        document.getElementById('q3').classList.add('incorrect');
      }

      // السؤال 4: صح/خطأ
      const q4 = document.querySelector('input[name="q4"]:checked');
      if (q4?.value === 'true') {
        score++;
      } else {
        document.getElementById('q4').classList.add('incorrect');
      }

      // السؤال 5: اختيار متعدد
      const q5 = document.querySelector('input[name="q5"]:checked');
      if (q5?.value === 'a') {
        score++;
      } else {
        document.getElementById('q5').classList.add('incorrect');
      }

      // السؤال 6: إدخال نص
      const q6 = document.querySelector('input[name="q6"]');
      if (q6 && q6.value.trim().toLowerCase() === 'getelementbyid') {
        score++;
      } else {
        document.getElementById('q6').classList.add('incorrect');
      }

      // السؤال 7: اختيار متعدد
      const q7 = document.querySelector('input[name="q7"]:checked');
      if (q7?.value === 'a') {
        score++;
      } else {
        document.getElementById('q7').classList.add('incorrect');
      }

      // السؤال 8: صح/خطأ
      const q8 = document.querySelector('input[name="q8"]:checked');
      if (q8?.value === 'false') {
        score++;
      } else {
        document.getElementById('q8').classList.add('incorrect');
      }

      // السؤال 9: إدخال نص
      const q9 = document.querySelector('input[name="q9"]');
      if (q9 && q9.value.trim().toLowerCase() === 'function') {
        score++;
      } else {
        document.getElementById('q9').classList.add('incorrect');
      }

      // السؤال 10: اختيار متعدد
      const q10 = document.querySelector('input[name="q10"]:checked');
      if (q10?.value === 'a') {
        score++;
      } else {
        document.getElementById('q10').classList.add('incorrect');
      }

      // السؤال 11: إدخال نص
      const q11 = document.querySelector('input[name="q11"]');
      if (q11 && q11.value.trim().toLowerCase() === 'join') {
        score++;
      } else {
        document.getElementById('q11').classList.add('incorrect');
      }

      // السؤال 12: اختيار متعدد
      const q12 = document.querySelector('input[name="q12"]:checked');
      if (q12?.value === 'c') {
        score++;
      } else {
        document.getElementById('q12').classList.add('incorrect');
      }

      // السؤال 13: صح/خطأ
      const q13 = document.querySelector('input[name="q13"]:checked');
      if (q13?.value === 'true') {
        score++;
      } else {
        document.getElementById('q13').classList.add('incorrect');
      }

      // السؤال 14: إدخال نص
      const q14 = document.querySelector('input[name="q14"]');
      if (q14 && q14.value.trim().toLowerCase() === 'pop') {
        score++;
      } else {
        document.getElementById('q14').classList.add('incorrect');
      }

      // السؤال 15: اختيار متعدد
      const q15 = document.querySelector('input[name="q15"]:checked');
      if (q15?.value === 'a') {
        score++;
      } else {
        document.getElementById('q15').classList.add('incorrect');
      }

      // السؤال 16: كود
      const q16 = document.querySelector('textarea[name="q16"]');
      if (q16 && q16.value.trim().toLowerCase().includes('addeventlistener') && q16.value.includes('click') && q16.value.includes('backgroundcolor') && q16.value.includes('red')) {
        score++;
      } else {
        document.getElementById('q16').classList.add('incorrect');
      }

      // السؤال 17: اختيار متعدد
      const q17 = document.querySelector('input[name="q17"]:checked');
      if (q17?.value === 'c') {
        score++;
      } else {
        document.getElementById('q17').classList.add('incorrect');
      }

      // السؤال 18: صح/خطأ
      const q18 = document.querySelector('input[name="q18"]:checked');
      if (q18?.value === 'false') {
        score++;
      } else {
        document.getElementById('q18').classList.add('incorrect');
      }

      // السؤال 19: إدخال نص
      const q19 = document.querySelector('input[name="q19"]');
      if (q19 && q19.value.trim().toLowerCase() === 'let') {
        score++;
      } else {
        document.getElementById('q19').classList.add('incorrect');
      }

      // السؤال 20: اختيار متعدد
      const q20 = document.querySelector('input[name="q20"]:checked');
      if (q20?.value === 'c') {
        score++;
      } else {
        document.getElementById('q20').classList.add('incorrect');
      }

      // السؤال 21: كود
      const q21 = document.querySelector('textarea[name="q21"]');
      if (q21 && q21.value.trim().toLowerCase().includes('foreach') && q21.value.includes('createelement') && q21.value.includes('appendchild')) {
        score++;
      } else {
        document.getElementById('q21').classList.add('incorrect');
      }

      // السؤال 22: اختيار متعدد
      const q22 = document.querySelector('input[name="q22"]:checked');
      if (q22?.value === 'a') {
        score++;
      } else {
        document.getElementById('q22').classList.add('incorrect');
      }

      // السؤال 23: صح/خطأ
      const q23 = document.querySelector('input[name="q23"]:checked');
      if (q23?.value === 'true') {
        score++;
      } else {
        document.getElementById('q23').classList.add('incorrect');
      }

      // السؤال 24: إدخال نص
      const q24 = document.querySelector('input[name="q24"]');
      if (q24 && q24.value.trim().toLowerCase() === 'find') {
        score++;
      } else {
        document.getElementById('q24').classList.add('incorrect');
      }

      // السؤال 25: اختيار متعدد
      const q25 = document.querySelector('input[name="q25"]:checked');
      if (q25?.value === 'c') {
        score++;
      } else {
        document.getElementById('q25').classList.add('incorrect');
      }

      // السؤال 26: كود
      const q26 = document.querySelector('textarea[name="q26"]');
      if (q26 && q26.value.trim().toLowerCase().includes('addeventlistener') && q26.value.includes('input') && q26.value.includes('reverse') && q26.value.includes('textcontent')) {
        score++;
      } else {
        document.getElementById('q26').classList.add('incorrect');
      }

      // السؤال 27: إدخال نص
      const q27 = document.querySelector('input[name="q27"]');
      if (q27 && q27.value.trim().toLowerCase() === 'export') {
        score++;
      } else {
        document.getElementById('q27').classList.add('incorrect');
      }

      // السؤال 28: كود
      const q28 = document.querySelector('textarea[name="q28"]');
      if (q28 && q28.value.trim().toLowerCase().includes('sort') && q28.value.includes('textcontent')) {
        score++;
      } else {
        document.getElementById('q28').classList.add('incorrect');
      }

      // السؤال 29: إدخال نص
      const q29 = document.querySelector('input[name="q29"]');
      if (q29 && q29.value.trim().toLowerCase() === 'createelement') {
        score++;
      } else {
        document.getElementById('q29').classList.add('incorrect');
      }

      // السؤال 30: كود
      const q30 = document.querySelector('textarea[name="q30"]');
      if (q30 && q30.value.trim().toLowerCase().includes('setinterval') && q30.value.includes('textcontent')) {
        score++;
      } else {
        document.getElementById('q30').classList.add('incorrect');
      }

      // عرض النتيجة
      const resultBox = document.getElementById('result');
      if (resultBox) {
        console.log('Result calculated: ', score);
        resultBox.classList.remove('hidden');
        resultBox.textContent = `درجتك: ${score} من ${total}`;
      } else {
        console.error('Result element with ID "result" not found');
      }

      // إظهار زر إعادة الاختبار
      const retakeButton = document.getElementById('retake');
      if (retakeButton) {
        retakeButton.classList.remove('hidden');
      } else {
        console.error('Retake button with ID "retake" not found');
      }
    } catch (error) {
      console.error('Error processing quiz:', error);
    }
  });

  // إعادة الاختبار
  const retakeButton = document.getElementById('retake');
  if (retakeButton) {
    retakeButton.addEventListener('click', function () {
      console.log('Retake quiz');
      form.reset();
      const resultBox = document.getElementById('result');
      if (resultBox) {
        resultBox.classList.add('hidden');
        resultBox.textContent = '';
      }
      retakeButton.classList.add('hidden');
      document.querySelectorAll('.question').forEach(q => q.classList.remove('incorrect'));
    });
  } else {
    console.error('Retake button with ID "retake" not found');
  }
});