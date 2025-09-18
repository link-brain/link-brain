
const questions = [
  {
    key: "topic",
    label: "ماذا تريد أن تتعلم؟",
    options: ["frontend", "backend"]
  },
  {
    key: "approach",
    label: "ما هو أسلوبك المفضل؟",
    options: ["نظري", "عملي"]
  },
  {
    key: "level",
    label: "ما هو مستواك الحالي؟",
    options: ["مبتدئ", "متوسط"]
  },
  {
    key: "style",
    label: "تفضل التعلم كيف؟",
    options: ["فيديوهات", "مواقع", "كتب"]
  },
  {
    key: "time",
    label: "كم ساعة تستطيع أن تتعلم أسبوعياً؟",
    options: ["1-3", "4-6", "7-10", "10+"]
  }
];

const learningPlans = {
  frontend: {
    مبتدئ: {
      مواضيع: [
        {
          عنوان: "أساسيات HTML",
          موضوع: "html"
        },
        {
          عنوان: "أساسيات CSS",
          موضوع: "css"
        },
        {
          عنوان: "أساسيات JavaScript",
          موضوع: "javascript"
        },
        {
          عنوان: "أساسيات Git",
          موضوع: "git"
        }
      ]
    },
    متوسط: {
      مواضيع: [
        {
          عنوان: "HTML5 المتقدم",
          موضوع: "html"
        },
        {
          عنوان: "CSS المتقدم",
          موضوع: "css"
        },
        {
          عنوان: "JavaScript المتقدم",
          موضوع: "javascript"
        },
        {
          عنوان: "مشروع متكامل",
          موضوع: "git"
        }
      ]
    }
  },
  backend: {
    مبتدئ: {
      مواضيع: [
        {
          عنوان: "مقدمة في Backend وAPIs",
          موضوع: "https-apis"
        },
        {
          عنوان: "أساسيات Python",
          موضوع: "python"
        },
        {
          عنوان: "قواعد البيانات الأساسية",
          موضوع: "databases"
        },
        {
          عنوان: "مشروع بسيط",
          موضوع: "git"
        }
      ]
    },
    متوسط: {
      مواضيع: [
        {
          عنوان: "Python المتقدم",
          موضوع: "python"
        },
        {
          عنوان: "قواعد البيانات المتقدمة",
          موضوع: "databases"
        },
        {
          عنوان: "أنماط التصميم والأمان",
          موضوع: "https-apis"
        },
        {
          عنوان: "مشروع متكامل",
          موضوع: "git"
        }
      ]
    }
  }
};

let step = 0;
let answers = {};
let resources = {};

function $(selector) {
  return document.querySelector(selector);
}

function showQuestion() {
  const question = questions[step];
  const progressPercent = ((step + 1) / questions.length) * 100;
  
  let html = `
    <h2>${question.label}</h2>
    <div class="progress-bar">
      <div class="progress" style="width: ${progressPercent}%"></div>
    </div>
    <div class="options">
  `;

  question.options.forEach(opt => {
    html += `
      <label class="option">
        <input type="radio" name="answer" value="${opt}"/>
        ${opt}
      </label>
    `;
  });

  html += `</div>
    <button id="next">${step === questions.length - 1 ? "إنشاء الخطة" : "التالي"}</button>
  `;

  $("#app").innerHTML = `
    <h1>Edvion - مخطّط التعلّم الذكي</h1>
    <div class="question-box">${html}</div>
  `;

  $("#next").onclick = nextStep;
  $("#next").disabled = true;
  
  const radioButtons = document.querySelectorAll('input[name="answer"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
      $("#next").disabled = false;
    });
  });
}

function nextStep() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert("يرجى اختيار إجابة قبل المتابعة");
    return;
  }

  answers[questions[step].key] = selected.value;

  if (step < questions.length - 1) {
    step++;
    showQuestion();
  } else {
    generatePlan();
  }
}

function generatePlan() {
  $("#app").innerHTML = `
    <h1>Edvion - مخطّط التعلّم الذكي</h1>
    <div class="question-box">
      <h2>جاري إنشاء الخطة...</h2>
      <div class="progress-bar">
        <div class="progress" style="width: 100%"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const { topic, level, style, time, approach } = answers;
    const plan = learningPlans[topic][level];

    let planContent = `
      <div class="plan-content">
        <h2>خريطة التعلم الخاصة بك</h2>
        <h3>المجال: ${topic === "frontend" ? "Frontend (واجهات المستخدم)" : "Backend (واجهات الخلفية)"}</h3>
        <h3>المستوى: ${level}</h3>
        <h3>أسلوب التعلم: ${style}</h3>
        <h3>التوجه: ${approach}</h3>
        <h3>الوقت المتاح: ${time} ساعة أسبوعياً</h3>
        <h3>خريطة التعلم:</h3>
    `;

    plan.مواضيع.forEach((step, index) => {
      planContent += `
        <div class="roadmap-step">
          <h4>الخطوة ${index + 1}: ${step.عنوان}</h4>
          <h5>المصادر المقترحة:</h5>
      `;

      const resourcesList = getResourcesForTopic(topic, step.موضوع, style, level, approach, time);

      if (resourcesList && resourcesList.length > 0) {
        resourcesList.forEach(resource => {
          planContent += `
            <a href="${resource.url}" target="_blank" class="resource-link">
              ${resource.title}
              <div class="resource-details">
                ${resource.مدة ? `<span>المدة: ${resource.مدة}</span>` : ''}
                ${resource.تقييم ? `<span>التقييم: ${resource.تقييم}/5</span>` : ''}
              </div>
              <div class="resource-meta">
                ${resource.الكلمات_المفتاحية ? resource.الكلمات_المفتاحية.map(kw => `<span class="resource-tag">${kw}</span>`).join('') : ''}
              </div>
            </a>
          `;
        });
      } else {
        planContent += `<p>🚫 لا توجد مصادر متاحة لهذا الجزء.</p>`;
      }

      planContent += `</div>`;
    });

    planContent += `
        <p>نصيحة: حاول تخصيص ${time} ساعة أسبوعياً للتعلم والممارسة لتحقيق أفضل النتائج.</p>
      </div>
      <button class="restart-btn" onclick="location.reload()">إنشاء خطة جديدة</button>
    `;

    $("#app").innerHTML = `
      <h1>Edvion - مخطّط التعلّم الذكي</h1>
      <div class="plan-box">
        ${planContent}
      </div>
    `;
  }, 2000);
}

function getResourcesForTopic(topic, subject, style, level, approach, time) {
  if (!resources[topic] || !resources[topic][subject]) {
    return [];
  }

  const subjectResources = resources[topic][subject];
  if (!subjectResources[style]) {
    return [];
  }

  let maxHours = Infinity;
  if (time === "1-3") maxHours = 3;
  else if (time === "4-6") maxHours = 6;
  else if (time === "7-10") maxHours = 10;

  return subjectResources[style].filter(resource => {
    const levelOk = !resource.مستوى || resource.مستوى.includes(level);
    const approachOk = !resource.نوع || resource.نوع.includes(approach) || resource.نوع === "نظري وعملي";
    
    let hours = 0;
    if (resource.مدة && resource.مدة.match(/\d+/)) {
      hours = parseInt(resource.مدة.match(/\d+/)[0]);
    }
    const timeOk = hours <= maxHours || resource.مدة === "غير محدد";

    return levelOk && approachOk && timeOk;
  });
}

async function loadResources() {
  const response = await fetch("resources.json");
  resources = await response.json();
  console.log("تم تحميل المصادر:", resources);

  // هنا تبدأ تشغيل الأسئلة بعد تحميل الملف
  showQuestion();
}

// تشغيل تحميل البيانات أول ما يفتح الموقع
loadResources();