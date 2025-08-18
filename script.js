/**********************
 * تبويبات الواجهة
 **********************/
const tabs = document.querySelectorAll(".tab-btn");
const tabViews = document.querySelectorAll(".tab");
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    tabViews.forEach(v => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/**********************
 * أسئلة الاختيار (30)
 * 10 مفاهيمية + 10 عملية بالكود + 10 مخرجات
 **********************/
const mcqData = [
  // القسم الأول: مفاهيمية
  { q: "ما الخاصية التي تحدد لون النص؟", opts: ["color", "font-color", "text-color"], ans: 0 },
  { q: "أي قيمة لـ display تجعل العنصر يختفي تمامًا؟", opts: ["hidden", "none", "invisible"], ans: 1 },
  { q: "ما الخاصية التي تحدد المسافة بين الحروف؟", opts: ["letter-spacing", "word-spacing", "line-height"], ans: 0 },
  { q: "أي وحدة قياس نسبية تعتمد على حجم الخط الأب؟", opts: ["px", "rem", "vw"], ans: 1 },
  { q: "ما الخاصية التي تضيف ظلًا للعنصر؟", opts: ["box-shadow", "text-shadow", "shadow"], ans: 0 },
  { q: "أي خاصية تحدد ترتيب العناصر المتراكمة؟", opts: ["z-index", "stack-order", "layer"], ans: 0 },
  { q: "ما نموذج الصندوق في CSS؟", opts: ["Content, Padding, Border, Margin", "Width, Height, Color", "Font, Line, Block"], ans: 0 },
  { q: "أي قيمة لـ position تجعل العنصر ثابتًا في مكانه؟", opts: ["static", "fixed", "absolute"], ans: 1 },
  { q: "ما الخاصية التي تحدد نصف قطر الزوايا؟", opts: ["border-radius", "corner-radius", "border-curve"], ans: 0 },
  { q: "أي خاصية تتحكم بشفافية العنصر؟", opts: ["opacity", "visibility", "alpha"], ans: 0 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q: "اكمل: .box { _____ : center; } لتوسيط نص", opts: ["text-align", "align-items", "justify-content"], ans: 0 },
  { q: "اكمل: .box { display: _____ ; } لجعل العناصر في صف", opts: ["block", "flex", "inline"], ans: 1 },
  { q: ".box { margin: 10px _____ ; } لتوسيط العنصر أفقيًا", opts: ["auto", "center", "0"], ans: 0 },
  { q: "اكمل: .box { border: 1px _____ black; }", opts: ["solid", "thick", "color"], ans: 0 },
  { q: "لإضافة انتقال سلس: .box { _____ : all 0.3s; }", opts: ["animation", "transition", "transform"], ans: 1 },
  { q: ".box:hover { color: red; } يؤثر على:", opts: ["النص عند التمرير", "الخلفية", "لا شيء"], ans: 0 },
  { q: "اكمل: .box { font: italic 16px _____ ; }", opts: ["Arial", "bold", "center"], ans: 0 },
  { q: ".box { float: _____ ; } لتحريك العنصر يسارًا", opts: ["right", "left", "none"], ans: 1 },
  { q: "اكمل: .box { display: grid; grid-template-columns: _____ ; } لثلاثة أعمدة متساوية", opts: ["1fr 1fr 1fr", "auto auto auto", "33% 33% 33%"], ans: 0 },
  { q: ".box { position: absolute; top: 0; _____ : 0; } للتثبيت أعلى يسار", opts: ["left", "right", "bottom"], ans: 0 },

  // القسم الثالث: مخرجات
  { q: ".box { text-decoration: underline; } يعرض:", opts: ["نص مسطر", "نص مائل", "لا شيء"], ans: 0 },
  { q: ".box { font-weight: bold; } يعرض:", opts: ["نص عريض", "نص صغير", "لا شيء"], ans: 0 },
  { q: ".box { display: none; } يؤدي إلى:", opts: ["إخفاء العنصر", "شفافية", "لا شيء"], ans: 0 },
  { q: ".box { background: linear-gradient(red, blue); } يعرض:", opts: ["تدرج لوني", "لون أحادي", "لا شيء"], ans: 0 },
  { q: ".box { border-radius: 50%; } يعرض:", opts: ["دائرة/بيضاوية", "مربع", "لا شيء"], ans: 0 },
  { q: ".box { box-shadow: 2px 2px 5px gray; } يعرض:", opts: ["ظل خارجي", "حد داخلي", "لا شيء"], ans: 0 },
  { q: ".box { display: flex; justify-content: center; } يعرض:", opts: ["توسيط أفقي", "توسيط رأسي", "لا شيء"], ans: 0 },
  { q: ".box { opacity: 0.5; } يعرض:", opts: ["نصف شفاف", "مختفي", "لا شيء"], ans: 0 },
  { q: ".box { transform: rotate(45deg); } يعرض:", opts: ["دوران 45 درجة", "تحريك", "لا شيء"], ans: 0 },
  { q: ".box { width: 100vw; } يعرض:", opts: ["عرض يملأ الشاشة", "عرض ثابت", "لا شيء"], ans: 0 },
];

const mcqForm = document.getElementById("mcq-form");
mcqData.forEach((item, idx) => {
  const qBox = document.createElement("div");
  qBox.className = "q";
  qBox.innerHTML = `<h4>${idx + 1}- ${item.q}</h4>`;
  item.opts.forEach((opt, i) => {
    const id = `q${idx + 1}_o${i}`;
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.innerHTML = `<input type="radio" name="q${idx + 1}" id="${id}" value="${i}"> ${escapeHTML(opt)}`;
    qBox.appendChild(label);
  });
  mcqForm.appendChild(qBox); // تصحيح الخطأ هنا
});

function escapeHTML(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let mcqScore = 0;
document.getElementById("save-mcq").addEventListener("click", () => {
  let score = 0;
  mcqData.forEach((item, idx) => {
    const checked = document.querySelector(`input[name="q${idx + 1}"]:checked`);
    if (checked && Number(checked.value) === item.ans) score++;
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * مهام عملية (10) + محرر + تصحيح تلقائي
 **********************/
const tasksData = [
  {
    title: "توسيط نص",
    desc: "اكتب CSS لتوسيط نص داخل عنصر .box أفقيًا باستخدام text-align.",
    check: (style) => {
      return style.cssText.includes("text-align: center");
    },
    starter: ".box {\n  /* اكتب هنا كودك */\n}",
    html: `<div class="box">مرحبا</div>`
  },
  {
    title: "خلفية ملونة",
    desc: "طبق لون خلفية أحمر (#ff0000) على عنصر .box باستخدام background-color.",
    check: (style) => {
      return style.cssText.includes("background-color: #ff0000") || style.cssText.includes("background-color: rgb(255, 0, 0)");
    },
    starter: ".box {\n\n}",
    html: `<div class="box">صندوق</div>`
  },
  {
    title: "حدود مستديرة",
    desc: "أضف حدودًا مستديرة (10px) لعنصر .box باستخدام border-radius.",
    check: (style) => {
      return style.cssText.includes("border-radius: 10px");
    },
    starter: ".box {\n\n}",
    html: `<div class="box">صندوق</div>`
  },
  {
    title: "شبكة بثلاثة أعمدة",
    desc: "طبق شبكة بثلاثة أعمدة متساوية على .container باستخدام display: grid و grid-template-columns.",
    check: (style) => {
      return style.cssText.includes("display: grid") && style.cssText.includes("grid-template-columns: 1fr 1fr 1fr");
    },
    starter: ".container {\n\n}",
    html: `<div class="container"><div>1</div><div>2</div><div>3</div></div>`
  },
  {
    title: "توسيط بـ Flexbox",
    desc: "قم بتوسيط عنصر داخل .container أفقيًا وعموديًا باستخدام display: flex و justify-content و align-items.",
    check: (style) => {
      return style.cssText.includes("display: flex") && style.cssText.includes("justify-content: center") && style.cssText.includes("align-items: center");
    },
    starter: ".container {\n\n}",
    html: `<div class="container"><div>مرحبا</div></div>`
  },
  {
    title: "ظل خارجي",
    desc: "أضف ظلًا خارجيًا لعنصر .box باستخدام box-shadow (2px 2px 5px gray).",
    check: (style) => {
      return style.cssText.includes("box-shadow: 2px 2px 5px gray");
    },
    starter: ".box {\n\n}",
    html: `<div class="box">صندوق</div>`
  },
  {
    title: "انتقال سلس",
    desc: "أضف انتقالًا سلسًا لتغيير لون النص إلى أحمر عند التمرير باستخدام transition و :hover.",
    check: (style) => {
      return style.cssText.includes("transition:") && style.cssText.includes("color: red");
    },
    starter: ".box {\n\n}\n.box:hover {\n\n}",
    html: `<div class="box">مرحبا</div>`
  },
  {
    title: "تثبيت عنصر",
    desc: "ثبت عنصر .box أعلى يسار الشاشة باستخدام position: fixed و top: 0 و left: 0.",
    check: (style) => {
      return style.cssText.includes("position: fixed") && style.cssText.includes("top: 0") && style.cssText.includes("left: 0");
    },
    starter: ".box {\n\n}",
    html: `<div class="box">ثابت</div>`
  },
  {
    title: "نص عريض",
    desc: "اجعل النص داخل .box عريضًا باستخدام font-weight.",
    check: (style) => {
      return style.cssText.includes("font-weight: bold") || style.cssText.includes("font-weight: 700");
    },
    starter: ".box {\n\n}",
    html: `<div class="box">مرحبا</div>`
  },
  {
    title: "تحويل دوران",
    desc: "قم بتدوير عنصر .box بمقدار 45 درجة باستخدام transform: rotate.",
    check: (style) => {
      return style.cssText.includes("transform: rotate(45deg)");
    },
    starter: ".box {\n\n}",
    html: `<div class="box">دوران</div>`
  },
];

const tasksWrap = document.getElementById("tasks");
tasksData.forEach((t, idx) => {
  const card = document.createElement("div");
  card.className = "task card";
  card.innerHTML = `
    <header>
      <h4>${idx + 1}- ${t.title}</h4>
      <p class="hint">${t.desc}</p>
    </header>
    <div class="body">
      <div>
        <textarea class="code" id="code_${idx}" placeholder="اكتب كود CSS فقط...">${t.starter}</textarea>
        <div class="actions-row" style="margin-top:8px">
          <button class="btn" data-action="run" data-i="${idx}">تشغيل</button>
          <button class="btn" data-action="check" data-i="${idx}">تحقق تلقائي</button>
          <span id="status_${idx}" class="status">بانتظار التحقق…</span>
        </div>
      </div>
      <div>
        <div class="iframe-wrap">
          <iframe id="prev_${idx}" style="width:100%; height:220px; border:0"></iframe>
        </div>
      </div>
    </div>
  `;
  tasksWrap.appendChild(card);
});

function parseCSSToStyle(css) {
  const style = document.createElement("style");
  style.textContent = css;
  return style;
}

function runTask(i) {
  const code = document.getElementById(`code_${i}`).value;
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>${code}</style></head><body>${tasksData[i].html}</body></html>`;
}

function checkTask(i) {
  const code = document.getElementById(`code_${i}`).value;
  const style = parseCSSToStyle(code);
  let ok = false;
  try { ok = tasksData[i].check(style); } catch (e) { ok = false; }
  const st = document.getElementById(`status_${i}`);
  if (ok) { st.textContent = "✔ تم بنجاح"; st.classList.add("ok"); st.classList.remove("bad"); }
  else { st.textContent = "✘ لم يتحقق الشرط بعد"; st.classList.add("bad"); st.classList.remove("ok"); }
  return ok;
}

tasksWrap.addEventListener("click", (e) => {
  const btn = e.target.closest("button.btn");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if (action === "run") runTask(i);
  if (action === "check") checkTask(i);
});

let practicalScore = 0;
document.getElementById("save-practical").addEventListener("click", () => {
  let score = 0;
  for (let i = 0; i < tasksData.length; i++) {
    if (checkTask(i)) score++;
  }
  practicalScore = score;
  document.getElementById("practical-score").textContent = `تم الحفظ: ${score} / 10`;
});

/**********************
 * النتيجة النهائية
 **********************/
function levelOf(total) {
  if (total <= 15) return "مبتدئ 🐣";
  if (total <= 26) return "جيد 🙂";
  if (total <= 35) return "ممتاز 😎";
  return "أسطوري 🔥";
}

document.getElementById("calc-final").addEventListener("click", () => {
  document.getElementById("res-mcq").textContent = mcqScore;
  document.getElementById("res-practical").textContent = practicalScore;
  const total = mcqScore + practicalScore;
  document.getElementById("res-total").textContent = total;
  document.getElementById("res-level").textContent = levelOf(total);
});