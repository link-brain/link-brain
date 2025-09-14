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
  { q: "ما الخاصية التي تحدد لون النص؟", opts: ["color", "background-color", "font-color"], ans: 0 },
  { q: "ما نموذج الصندوق في CSS؟", opts: ["Box Model", "Flex Model", "Grid Model"], ans: 0 },
  { q: "أي خاصية تحدد المسافة الداخلية؟", opts: ["margin", "padding", "border"], ans: 1 },
  { q: "ما الوحدة التي تعتمد على حجم الشاشة؟", opts: ["px", "rem", "vw"], ans: 2 },
  { q: "ما الخاصية التي تجعل العنصر يطفو؟", opts: ["float", "position", "display"], ans: 0 },
  { q: "أي قيمة لـ position تجعل العنصر خارج التدفق؟", opts: ["static", "relative", "absolute"], ans: 2 },
  { q: "ما الخاصية التي تحدد نوع الخط؟", opts: ["font-family", "font-style", "font-weight"], ans: 0 },
  { q: "ما الخاصية التي تحكم محاذاة النص؟", opts: ["text-align", "align-items", "justify-content"], ans: 0 },
  { q: "ما الخاصية التي تضيف ظلًا للعنصر؟", opts: ["box-shadow", "text-shadow", "shadow"], ans: 0 },
  { q: "ما المحدد الذي يستهدف عنصرًا بمعرف معين؟", opts: [".", "#", "*"], ans: 1 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q: "اكمل: .box { _____ : red; } لتغيير لون الخلفية", opts: ["color", "background-color", "border-color"], ans: 1 },
  { q: "اكمل: .box { margin: _____ ; } لتوسيط العنصر أفقيًا", opts: ["0 auto", "center", "0"], ans: 0 },
  { q: "ما الخاصية الناقصة: .box { display: flex; _____ : center; } لتوسيط العناصر أفقيًا", opts: ["align-items", "justify-content", "text-align"], ans: 1 },
  { q: ".box { font-size: _____ ; } لتحديد حجم خط 16 بكسل", opts: ["16px", "1.6rem", "16em"], ans: 0 },
  { q: "اكمل: .box { border: 1px _____ red; } لتحديد لون الحدود", opts: ["solid", "dashed", "dotted"], ans: 0 },
  { q: ".box { position: _____ ; top: 10px; } لتحريك العنصر نسبة لموقعه الأصلي", opts: ["absolute", "relative", "fixed"], ans: 1 },
  { q: "اكمل: .box { display: _____ ; } لجعل العنصر كتلة", opts: ["inline", "block", "flex"], ans: 1 },
  { q: ".box { _____ : 0 auto; } لتوسيط كتلة أفقيًا", opts: ["padding", "margin", "border"], ans: 1 },
  { q: ".box { overflow: _____ ; } لإخفاء المحتوى الزائد", opts: ["hidden", "scroll", "visible"], ans: 0 },
  { q: ".box { _____ : 50%; } لجعل العنصر دائريًا", opts: ["border-radius", "border", "box-shadow"], ans: 0 },

  // القسم الثالث: مخرجات
  { q: ".box { color: blue; } يعرض:", opts: ["نص أزرق", "خلفية زرقاء", "لا شيء"], ans: 0 },
  { q: ".box { background-color: red; } يعرض:", opts: ["نص أحمر", "خلفية حمراء", "حدود حمراء"], ans: 1 },
  { q: ".box { text-align: center; } يعرض:", opts: ["نص في المنتصف", "نص يسار", "نص يمين"], ans: 0 },
  { q: ".box { font-weight: bold; } يعرض:", opts: ["نص عريض", "نص مائل", "لا شيء"], ans: 0 },
  { q: ".box { border: 1px solid black; } يعرض:", opts: ["حدود سوداء", "خلفية سوداء", "نص أسود"], ans: 0 },
  { q: ".box { display: none; } يعرض:", opts: ["يخفي العنصر", "يظهر العنصر", "لا شيء"], ans: 0 },
  { q: ".box { float: left; } يعرض:", opts: ["عنصر يطفو يسارًا", "عن� يطفو يمينًا", "لا شيء"], ans: 0 },
  { q: ".box { box-shadow: 2px 2px 5px gray; } يعرض:", opts: ["ظل للعنصر", "حدود رمادية", "لا شيء"], ans: 0 },
  { q: ".box { text-decoration: underline; } يعرض:", opts: ["نص مسطر", "نص عريض", "لا شيء"], ans: 0 },
  { q: ".box { display: flex; justify-content: space-between; } يعرض:", opts: ["عناصر متباعدة", "عناصر متلاصقة", "لا شيء"], ans: 0 },
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
    label.innerHTML = `<input type="radio" name="q${idx + 1}" id="${id}" value="${i}"> ${opt}`;
    qBox.appendChild(label);
  });
  mcqForm.appendChild(qBox);
});

let mcqScore = 0;
let answersShown = false;

document.getElementById("save-mcq").addEventListener("click", () => {
  // إضافة كلاس لعرض الإجابات
  mcqForm.classList.add("show-answers");
  answersShown = true;
  
  let score = 0;
  mcqData.forEach((item, idx) => {
    const questionElem = mcqForm.children[idx];
    const options = questionElem.querySelectorAll("input[type=radio]");
    let hasAnswer = false;
    
    options.forEach((opt, i) => {
      const label = opt.parentElement;
      
      // وضع علامة على الإجابة الصحيحة دائماً (بشكل خفيف)
      if (i === item.ans) {
        label.classList.add("correct-answer");
      }
      
      // إذا كانت الإجابة مختارة
      if (opt.checked) {
        hasAnswer = true;
        if (Number(opt.value) === item.ans) {
          // إجابة صحيحة
          score++;
          label.classList.add("correct");
        } else {
          // إجابة خاطئة
          label.classList.add("incorrect");
        }
      }
    });
    
    // إذا لم يتم الإجابة على السؤال، لا نضيف أي تلوين
    if (!hasAnswer) {
      options.forEach((opt, i) => {
        const label = opt.parentElement;
        label.classList.add("not-answered");
      });
    }
  });
  
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم التصحيح: ${score} / 30`;
  
  // تغيير نص الزر بعد التصحيح
  document.getElementById("save-mcq").textContent = "إعادة تعيين الإجابات";
});

// إضافة إمكانية إعادة تعيين الإجابات
document.getElementById("save-mcq").addEventListener("dblclick", () => {
  if (answersShown) {
    mcqForm.classList.remove("show-answers");
    
    mcqData.forEach((item, idx) => {
      const questionElem = mcqForm.children[idx];
      const options = questionElem.querySelectorAll("input[type=radio]");
      
      options.forEach(opt => {
        opt.checked = false;
        const label = opt.parentElement;
        label.classList.remove("correct", "incorrect", "correct-answer", "not-answered");
      });
    });
    
    document.getElementById("mcq-score").textContent = "0 / 30";
    document.getElementById("save-mcq").textContent = "حفظ إجابات الاختيار";
    answersShown = false;
    mcqScore = 0;
  }
});

/**********************
 * مهام عملية (10) + محرر CodeMirror + تصحيح تلقائي
 **********************/
const tasksData = [
  {
    title: "توسيط نص",
    desc: "قم بتوسيط النص داخل عنصر &lt;div class=&quot;box&quot;&gt; باستخدام text-align.",
    html: `<div class="box">مرحبا</div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.textAlign === "center";
    },
    starter: ".box {\n  /* اكتب كود CSS هنا */\n}"
  },
  {
    title: "خلفية ملونة",
    desc: "اجعل خلفية &lt;div class=&quot;box&quot;&gt; حمراء باستخدام background-color.",
    html: `<div class="box">مرحبا</div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.backgroundColor === "rgb(255, 0, 0)";
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "حدود منقطة",
    desc: "أضف حدودًا منقطة سوداء بسمك 2px لعنصر &lt;div class=&quot;box&quot;&gt;.",
    html: `<div class="box">مرحبا</div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.borderStyle === "dotted" && computed.borderWidth === "2px" && computed.borderColor === "rgb(0, 0, 0)";
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "توسيط كتلة",
    desc: "قم بتوسيط &lt;div class=&quot;box&quot;&gt; أفقيًا باستخدام margin وتحديد عرض 200px.",
    html: `<div class="box">مرحبا</div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.marginLeft === "auto" && computed.marginRight === "auto" && computed.width === "200px";
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "نص عريض",
    desc: "اجعل النص داخل &lt;p class=&quot;box&quot;&gt; عريضًا باستخدام font-weight.",
    html: `<p class="box">مرحبا</p>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.fontWeight === "700" || computed.fontWeight === "bold";
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "تخطيط Flex",
    desc: "اجعل العناصر داخل &lt;div class=&quot;box&quot;&gt; متباعدة بالتساوي باستخدام display: flex و justify-content.",
    html: `<div class="box"><span>1</span><span>2</span><span>3</span></div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.display === "flex" && computed.justifyContent === "space-between";
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "ظل صندوق",
    desc: "أضف ظلًا لعنصر &lt;div class=&quot;box&quot;&gt; باستخدام box-shadow (2px 2px 5px gray).",
    html: `<div class="box">مرحبا</div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.boxShadow.includes("2px 2px 5px");
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "تغيير نوع الخط",
    desc: "غير نوع الخط لـ &lt;p class=&quot;box&quot;&gt; إلى Arial باستخدام font-family.",
    html: `<p class="box">مرحبا</p>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.fontFamily.includes("Arial");
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "موقع ثابت",
    desc: "اجعل &lt;div class=&quot;box&quot;&gt; ثابتًا في أعلى الصفحة باستخدام position: fixed و top: 0.",
    html: `<div class="box">مرحبا</div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.position === "fixed" && computed.top === "0px";
    },
    starter: ".box {\n  \n}"
  },
  {
    title: "شبكة Grid",
    desc: "اجعل &lt;div class=&quot;box&quot;&gt; يحتوي على تخطيط شبكي بثلاثة أعمدة متساوية باستخدام display: grid.",
    html: `<div class="box"><div>1</div><div>2</div><div>3</div></div>`,
    check: (doc, style) => {
      const box = doc.querySelector(".box");
      const computed = window.getComputedStyle(box);
      return computed.display === "grid" && computed.gridTemplateColumns.includes("1fr 1fr 1fr");
    },
    starter: ".box {\n  \n}"
  },
];

const tasksWrap = document.getElementById("tasks");
const editors = [];
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

  // Initialize CodeMirror for each textarea
  const textarea = document.getElementById(`code_${idx}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "css",
    theme: "default",
    lineNumbers: true,
    indentWithTabs: true,
    indentUnit: 2,
    matchBrackets: true
  });
  editors.push(editor);
});

function parseHTMLtoDoc(html, css) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<html><head><style>${css}</style></head><body>${html}</body></html>`, "text/html");
  return doc;
}

function runTask(i) {
  const code = editors[i].getValue();
  const html = tasksData[i].html;
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>${code}</style></head><body>${html}</body></html>`;
}

function checkTask(i) {
  const code = editors[i].getValue();
  const html = tasksData[i].html;
  const doc = parseHTMLtoDoc(html, code);
  let ok = false;
  try
