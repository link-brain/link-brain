
/**********************
 * تبويبات الواجهة
 **********************/
const tabs = document.querySelectorAll(".tab-btn");
const tabViews = document.querySelectorAll(".tab");
tabs.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    tabs.forEach(b=>b.classList.remove("active"));
    tabViews.forEach(v=>v.classList.remove("active"));
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
  { q:"ما نوع البيانات للقيمة null؟", opts:["undefined","null","object"], ans:2 },
  { q:"ما الدالة التي تُستخدم لتحويل نص إلى عدد؟", opts:["parseInt","toString","typeof"], ans:0 },
  { q:"ما الكائن الذي يمثل المستند في المتصفح؟", opts:["window","document","navigator"], ans:1 },
  { q:"ما الحلقة التي تُستخدم لتكرار مصفوفة؟", opts:["for...in","for...of","while"], ans:1 },
  { q:"ما الخاصية التي تحدد عدد عناصر المصفوفة؟", opts:["length","size","count"], ans:0 },
  { q:"ما الدالة التي تضيف عنصرًا في نهاية المصفوفة؟", opts:["push","pop","shift"], ans:0 },
  { q:"ما نوع العملية === ؟", opts:["مقارنة القيمة فقط","مقارنة القيمة والنوع","تساوي"], ans:1 },
  { q:"ما الكائن الذي يحتوي دوال رياضية؟", opts:["Math","Number","Object"], ans:0 },
  { q:"ما الحدث الذي يُطلق عند النقر على عنصر؟", opts:["click","change","submit"], ans:0 },
  { q:"ما الطريقة لتحديد عنصر بمعرفه؟", opts:["getElementById","querySelector","getElementsByClassName"], ans:0 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q:"اكمل: let x = 5; x _____ 2; // ينتج 7", opts:["+=","-=","*="], ans:0 },
  { q:"اكمل: let arr = [1,2]; arr._____ (3); // يضيف 3", opts:["pop","push","shift"], ans:1 },
  { q:"اكمل: document._____ ('id'); // تحديد عنصر", opts:["querySelector","getElementById","getElementsByClassName"], ans:1 },
  { q:"اكمل: let x = '10'; _____ (x); // ينتج عدد 10", opts:["parseInt","toString","typeof"], ans:0 },
  { q:"اكمل: if (x _____ 5) { ... } // مقارنة تساوي", opts:[">","===","<"], ans:1 },
  { q:"اكمل: arr._____ (0, 1); // حذف العنصر الأول", opts:["slice","splice","shift"], ans:1 },
  { q:"اكمل: element.addEventListener('_____', fn); // نقر", opts:["click","change","submit"], ans:0 },
  { q:"اكمل: let str = 'hi'; str._____ ; // طول النص", opts:["length","size","count"], ans:0 },
  { q:"اكمل: Math._____ (3.7); // ينتج 4", opts:["floor","ceil","round"], ans:1 },
  { q:"اكمل: arr._____ (x => x * 2); // مضاعفة العناصر", opts:["map","filter","reduce"], ans:0 },

  // القسم الثالث: مخرجات
  { q:"console.log(typeof 'hello'); يعرض:", opts:["string","number","undefined"], ans:0 },
  { q:"let x = 5; console.log(x + '5'); يعرض:", opts:["10","55","5"], ans:1 },
  { q:"let arr = [1,2,3]; console.log(arr.length); يعرض:", opts:["3","2","4"], ans:0 },
  { q:"console.log(!!0); يعرض:", opts:["true","false","0"], ans:1 },
  { q:"let x = 10; x++; console.log(x); يعرض:", opts:["10","11","9"], ans:1 },
  { q:"console.log(5 === '5'); يعرض:", opts:["true","false","undefined"], ans:1 },
  { q:"let arr = [1,2]; arr.push(3); console.log(arr); يعرض:", opts:["[1,2,3]","[3,1,2]","[1,2]"], ans:0 },
  { q:"console.log(Math.round(4.6)); يعرض:", opts:["4","5","4.6"], ans:1 },
  { q:"let str = 'hello'; console.log(str[0]); يعرض:", opts:["h","e","undefined"], ans:0 },
  { q:"let arr = [1,2,3]; console.log(arr.map(x => x * 2)); يعرض:", opts:["[2,4,6]","[1,2,3]","[3,6,9]"], ans:0 },
];

const mcqForm = document.getElementById("mcq-form");
mcqData.forEach((item, idx)=>{
  const qBox = document.createElement("div");
  qBox.className = "q";
  qBox.innerHTML = `<h4>${idx+1}- ${item.q}</h4>`;
  item.opts.forEach((opt, i)=>{
    const id = `q${idx+1}_o${i}`;
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.innerHTML = `<input type="radio" name="q${idx+1}" id="${id}" value="${i}"> ${opt}`;
    qBox.appendChild(label);
  });
  mcqForm.appendChild(qBox);
});
let mcqScore = 0;
document.getElementById("save-mcq").addEventListener("click", ()=>{
  let score = 0;
  mcqData.forEach((item, idx)=>{
    const options = document.querySelectorAll(`input[name="q${idx+1}"]`);
    options.forEach(opt=>{
      const label = opt.parentElement;
      // رجّع اللون للوضع الافتراضي قبل التلوين
      label.style.color = "";

      // لو الخيار هو الصحيح → أخضر
      if(Number(opt.value) === item.ans){
        label.style.color = "green";
      }

      // لو الطالب اختار غلط → أحمر
      if(opt.checked && Number(opt.value) !== item.ans){
        label.style.color = "red";
      }
    });

    const checked = document.querySelector(`input[name="q${idx+1}"]:checked`);
    if(checked && Number(checked.value) === item.ans) score++;
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * مهام عملية (10) + محرر CodeMirror + تصحيح تلقائي
 **********************/
const tasksData = [
  {
    title: "إضافة نص إلى عنصر",
    desc: "أضف النص 'مرحبا' إلى &lt;div id=&quot;output&quot;&gt; باستخدام JavaScript.",
    html: `<div id="output"></div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return div.textContent === "مرحبا";
    },
    starter: "// اكتب كود JavaScript هنا\n"
  },
  {
    title: "تغيير لون الخلفية",
    desc: "غير لون خلفية &lt;div id=&quot;output&quot;&gt; إلى أحمر باستخدام style.backgroundColor.",
    html: `<div id="output">مرحبا</div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return window.getComputedStyle(div).backgroundColor === "rgb(255, 0, 0)";
    },
    starter: ""
  },
  {
    title: "إنشاء مصفوفة",
    desc: "أنشئ مصفوفة تحتوي على [1, 2, 3] واعرضها في &lt;div id=&quot;output&quot;&gt; كنص.",
    html: `<div id="output"></div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return div.textContent === "1,2,3" || div.textContent === "[1,2,3]";
    },
    starter: ""
  },
  {
    title: "حدث النقر",
    desc: "أضف حدث نقر لـ &lt;button id=&quot;btn&quot;&gt; يغير نص &lt;div id=&quot;output&quot;&gt; إلى 'تم النقر'.",
    html: `<button id="btn">اضغط</button><div id="output"></div>`,
    check: (doc, output)=>{
      const btn = doc.getElementById("btn");
      const div = doc.getElementById("output");
      btn.click();
      return div.textContent === "تم النقر";
    },
    starter: ""
  },
  {
    title: "حساب مجموع",
    desc: "احسب مجموع [1, 2, 3, 4] واعرضه في &lt;div id=&quot;output&quot;&gt;.",
    html: `<div id="output"></div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return div.textContent === "10";
    },
    starter: ""
  },
  {
    title: "تصفية المصفوفة",
    desc: "صفِّ المصفوفة [1, 2, 3, 4, 5] لتحتوي الأعداد الأكبر من 3 واعرضها في &lt;div id=&quot;output&quot;&gt;.",
    html: `<div id="output"></div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return div.textContent === "4,5" || div.textContent === "[4,5]";
    },
    starter: ""
  },
  {
    title: "مضاعفة الأعداد",
    desc: "ضاعف أعداد المصفوفة [1, 2, 3] باستخدام map واعرض النتيجة في &lt;div id=&quot;output&quot;&gt;.",
    html: `<div id="output"></div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return div.textContent === "2,4,6" || div.textContent === "[2,4,6]";
    },
    starter: ""
  },
  {
    title: "تغيير فئة CSS",
    desc: "أضف الفئة 'active' إلى &lt;div id=&quot;output&quot;&gt; باستخدام classList.add.",
    html: `<div id="output">مرحبا</div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      return div.classList.contains("active");
    },
    starter: ""
  },
  {
    title: "إنشاء عنصر",
    desc: "أنشئ عنصر &lt;p&gt; يحتوي النص 'جديد' وأضفه إلى &lt;div id=&quot;output&quot;&gt;.",
    html: `<div id="output"></div>`,
    check: (doc, output)=>{
      const div = doc.getElementById("output");
      const p = div.querySelector("p");
      return p && p.textContent === "جديد";
    },
    starter: ""
  },
  {
    title: "عد تنازلي",
    desc: "أنشئ عدًا تنازليًا من 3 إلى 1 يظهر في &lt;div id=&quot;output&quot;&gt; كل ثانية باستخدام setInterval.",
    html: `<div id="output"></div>`,
    check: (doc, output, iframeWindow)=>{
      const div = doc.getElementById("output");
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(div.textContent === "1");
        }, 3500);
      });
    },
    starter: ""
  },
];

const tasksWrap = document.getElementById("tasks");
const editors = [];
tasksData.forEach((t, idx)=>{
  const card = document.createElement("div");
  card.className = "task card";
  card.innerHTML = `
    <header>
      <h4>${idx+1}- ${t.title}</h4>
      <p class="hint">${t.desc}</p>
    </header>
    <div class="body">
      <div>
        <textarea class="code" id="code_${idx}" placeholder="اكتب كود JavaScript فقط...">${t.starter}</textarea>
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
    mode: "javascript",
    theme: "default",
    lineNumbers: true,
    indentWithTabs: true,
    indentUnit: 2,
    matchBrackets: true
  });
  editors.push(editor);
});

function parseHTMLtoDoc(html, js){
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<html><head><style>.active { color: red; }</style></head><body>${html}<script>${js}</script></body></html>`, "text/html");
  return doc;
}

async function runTask(i){
  const code = editors[i].getValue();
  const html = tasksData[i].html;
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>.active { color: red; }</style></head><body>${html}<script>${code}</script></body></html>`;
}

async function checkTask(i){
  const code = editors[i].getValue();
  const html = tasksData[i].html;
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>.active { color: red; }</style></head><body>${html}<script>${code}</script></body></html>`;
  await new Promise(resolve => setTimeout(resolve, 100)); // Wait for iframe to load
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  const iframeWindow = iframe.contentWindow;
  let ok = false;
  try {
    if (tasksData[i].check.length === 3) {
      ok = await tasksData[i].check(doc, code, iframeWindow);
    } else {
      ok = tasksData[i].check(doc, code);
    }
  } catch(e) {
    ok = false;
  }
  const st = document.getElementById(`status_${i}`);
  if(ok) {
    st.textContent = "✔ تم بنجاح";
    st.classList.add("ok");
    st.classList.remove("bad");
  } else {
    st.textContent = "✘ لم يتحقق الشرط بعد";
    st.classList.add("bad");
    st.classList.remove("ok");
  }
  return ok;
}

tasksWrap.addEventListener("click", async (e)=>{
  const btn = e.target.closest("button.btn");
  if(!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if(action==="run") await runTask(i);
  if(action==="check") await checkTask(i);
});

let practicalScore = 0;
document.getElementById("save-practical").addEventListener("click", async ()=>{
  let score = 0;
  for(let i=0; i<tasksData.length; i++){
    if(await checkTask(i)) score++;
  }
  practicalScore = score;
  document.getElementById("practical-score").textContent = `تم الحفظ: ${score} / 10`;
});

/**********************
 * النتيجة النهائية
 **********************/
function levelOf(total){
  if(total<=15) return "مبتدئ 🐣";
  if(total<=26) return "جيد 🙂";
  if(total<=35) return "ممتاز 😎";
  return "أسطوري 🔥";
}

document.getElementById("calc-final").addEventListener("click", ()=>{
  document.getElementById("res-mcq").textContent = mcqScore;
  document.getElementById("res-practical").textContent = practicalScore;
  const total = mcqScore + practicalScore;
  document.getElementById("res-total").textContent = total;
  document.getElementById("res-level").textContent = levelOf(total);
});

