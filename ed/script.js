const questions = [
  {
    key: "topic",
    label: "ما المجال الذي تتعلمه؟",
    options: ["frontend", "backend"]
  },
  {
    key: "style",
    label: "تفضل التعلم كيف؟",
    options: ["فيديوهات", "مواقع", "كليهما"]
  },
  {
    key: "videoDuration",
    label: "كم متوسط مدة الفيديوهات التي تريدها؟",
    options: ["أقل من 5 ساعات", "أكثر من 5 ساعات", "الأقصى"]
  }
];

const learningPlans = {
  frontend: {
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
  backend: {
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
    <h1>خريطة الطريق الذكية-edumates</h1>
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
    <h1>خريطة الطريق الذكية-edumates</h1>
    <div class="question-box">
      <h2>جاري إنشاء الخطة...</h2>
      <div class="progress-bar">
        <div class="progress" style="width: 100%"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const { topic, style, videoDuration } = answers;
    const plan = learningPlans[topic];

    let planContent = `
      <div class="plan-content">
        <h2>خريطة التعلم الخاصة بك</h2>
        <h3>المجال: ${topic === "frontend" ? "Frontend (واجهات المستخدم)" : "Backend (واجهات الخلفية)"}</h3>
        <h3>أسلوب التعلم: ${style}</h3>
        <h3>مدة الفيديوهات: ${videoDuration}</h3>
        <h3>خريطة التعلم:</h3>
    `;

    plan.مواضيع.forEach((step, index) => {
      planContent += `
        <div class="roadmap-step">
          <h4>الخطوة ${index + 1}: ${step.عنوان}</h4>
          <h5>المصادر المقترحة:</h5>
      `;

      const resourcesList = getResourcesForTopic(topic, step.موضوع, style, videoDuration);

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
        <p>نصيحة: حاول تخصيص وقت مناسب للتعلم والممارسة لتحقيق أفضل النتائج.</p>
      </div>
      <button class="restart-btn" onclick="location.reload()">إنشاء خطة جديدة</button>
    `;

    $("#app").innerHTML = `
      <h1>خريطة الطريق الذكية-edumates</h1>
      <div class="plan-box">
        ${planContent}
      </div>
    `;
  }, 2000);
}

function getResourcesForTopic(topic, subject, style, videoDuration) {
  if (!resources[topic] || !resources[topic][subject]) {
    return [];
  }

  const subjectResources = resources[topic][subject];

  let selectedResources = [];

  let stylesToFetch = [];

  if (style === "فيديوهات") {
    stylesToFetch = ["فيديوهات"];
  } else if (style === "مواقع") {
    stylesToFetch = ["مواقع"];
  } else if (style === "كليهما") {
    stylesToFetch = ["فيديوهات", "مواقع"];
  }

  for (let s of stylesToFetch) {
    if (subjectResources[s]) {
      let res = subjectResources[s];
      if (s === "فيديوهات") {
        res = res.filter(resource => {
          let durationOk = true;
          let hours = 0;
          if (resource.مدة && resource.مدة.match(/\d+/)) {
            hours = parseInt(resource.مدة.match(/\d+/)[0]);
          } else if (resource.مدة !== "غير محدد") {
            return false;
          }
          if (videoDuration === "أقل من 5 ساعات") {
            durationOk = hours < 5;
          } else if (videoDuration === "أكثر من 5 ساعات") {
            durationOk = hours > 5;
          } else if (videoDuration === "الأقصى") {
            durationOk = true;
          }
          return durationOk || resource.مدة === "غير محدد";
        });
      }
      selectedResources = selectedResources.concat(res);
    }
  }

  return selectedResources;
}

async function loadResources() {
  const response = await fetch("resources.json");
  resources = await response.json();
  console.log("تم تحميل المصادر:", resources);

  showQuestion();
}

loadResources();
