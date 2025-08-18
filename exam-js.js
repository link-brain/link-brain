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
  { q: "ما نوع البيانات الأساسي للمتغيرات في JavaScript؟", opts: ["String, Number, Boolean", "Int, Float, Char", "Text, Digit, True"], ans: 0 },
  { q: "أي دالة تُستخدم لتحويل نص إلى عدد صحيح؟", opts: ["parseInt()", "toString()", "parseFloat()"], ans: 0 },
  { q: "ما الذي يُستخدم لتحديد عنصر في DOM؟", opts: ["getElementById()", "getElement()", "selectElement()"], ans: 0 },
  { q: "أي كائن يُستخدم للتعامل مع المصفوفات؟", opts: ["Array", "List", "Object"], ans: 0 },
  { q: "ما الكلمة المفتاحية لتعريف دالة؟", opts: ["function", "def", "func"], ans: 0 },
  { q: "أي خاصية تُرجع طول المصفوفة؟", opts: ["length", "size", "count"], ans: 0 },
  { q: "ما المشغل الذي يتحقق من المساواة مع النوع؟", opts: ["==", "===", "="], ans: 1 },
  { q: "أي حدث يُطلق عند النقر على عنصر؟", opts: ["click", "hover", "press"], ans: 0 },
  { q: "ما الذي يُستخدم لتكرار عناصر المصفوفة؟", opts: ["forEach", "forLoop", "repeat"], ans: 0 },
  { q: "أي كائن يُستخدم لتخزين البيانات كأزواج مفتاح-قيمة؟", opts: ["Object", "Array", "Map"], ans: 0 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q: "اكمل: let x = 5; _____ x; يزيد x بمقدار 1", opts: ["++", "+=", "--"], ans: 0 },
  { q: "اكمل: document._____('id').textContent = 'مرحبا';", opts: ["getElementById", "querySelector", "getElementsByClassName"], ans: 0 },
  { q: "اكمل: let arr = [1, 2, 3]; arr._____ (4); لإضافة 4", opts: ["push", "add", "append"], ans: 0 },
  { q: "اكمل: if (x _____ 10) { return true; } للتحقق إذا كان x أكبر من 10", opts: [">", "<", "=="], ans: 0 },
  { q: "اكمل: function sum(a, b) { return _____ ; } لإرجاع مجموع a وb", opts: ["a + b", "a - b", "a * b"], ans: 0 },
  { q: "اكمل: let obj = {name: 'أحمد'}; _____ = 'علي'; لتغيير name", opts: ["obj.name", "obj['name']", "obj.setName"], ans: 0 },
  { q: "اكمل: arr._____ (item => item * 2); لمضاعفة كل عنصر", opts: ["map", "forEach", "filter"], ans: 0 },
  { q: "اكمل: element.addEventListener('click', _____ ); لتسجيل حدث", opts: ["function()", "event()", "click()"], ans: 0 },
  { q: "اكمل: let x = '10'; _____ (x); لتحويل إلى عدد", opts: ["parseInt", "toNumber", "parseFloat"], ans: 0 },
  { q: "اكمل: let arr = [1, 2, 3]; arr._____ (0, 1); للحذف", opts: ["splice", "slice", "remove"], ans: 0 },

  // القسم الثالث: مخرجات
  { q: "console.log(typeof 'مرحبا'); يعرض:", opts: ["string", "text", "undefined"], ans: 0 },
  { q: "let x = 5; x += 2; console.log(x); يعرض:", opts: ["7", "5", "2"], ans: 0 },
  { q: "[1, 2, 3].length يعرض:", opts: ["3", "2", "4"], ans: 0 },
  { q: "console.log(5 === '5'); يعرض:", opts: ["false", "true", "undefined"], ans: 0 },
  { q: "let arr = [1, 2]; arr.push(3); console.log(arr); يعرض:", opts: ["[1, 2, 3]", "[1, 2]", "[3, 1, 2]"], ans: 0 },
  { q: "let x = 10; if(x > 5) console.log('كبير'); يعرض:", opts: ["كبير", "صغير", "لا شيء"], ans: 0 },
  { q: "[1, 2, 3].map(x => x * 2); يعرض:", opts: ["[2, 4, 6]", "[1, 2, 3]", "[3, 6, 9]"], ans: 0 },
  { q: "let obj = {a: 1}; console.log(obj.a); يعرض:", opts: ["1", "a", "undefined"], ans: 0 },
  { q: "parseInt('15px'); يعرض:", opts: ["15", "15px", "NaN"], ans: 0 },
  { q: "console.log([1, 2, 3].join('-')); يعرض:", opts: ["1-2-3", "123", "[1,2,3]"], ans: 0 },
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
  mcqForm.appendChild(qBox);
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
    title: "إظهار رسالة تنبيه",
    desc: "اكتب JavaScript لإظهار رسالة تنبيه (alert) تحتوي على النص 'مرحبا'.",
    check: (code) => {
      return code.replace(/\s+/g, "").includes('alert("مرحبا")') || code.replace(/\s+/g, "").includes("alert('مرحبا')");
    },
    starter: "// اكتب هنا كودك\n",
    html: `<p>اضغط تشغيل لعرض التنبيه</p>`
  },
  {
    title: "تغيير نص عنصر",
    desc: "اكتب كود لتغيير نص عنصر بـ id='target' إلى 'مرحبا بالعالم'.",
    check: (code) => {
      const normalized = code.replace(/\s+/g, "");
      return normalized.includes("getElementById('target').textContent='مرحبابالعالم'") || 
             normalized.includes('getElementById("target").textContent="مرحبابالعالم"');
    },
    starter: "// اكتب هنا كودك\n",
    html: `<div id="target">النص الأصلي</div>`
  },
  {
    title: "إضافة عنصر إلى مصفوفة",
    desc: "أضف العدد 4 إلى مصفوفة arr = [1, 2, 3] باستخدام push().",
    check: (code) => {
      return code.replace(/\s+/g, "").includes("arr.push(4)");
    },
    starter: "let arr = [1, 2, 3];\n// اكتب هنا كودك\n",
    html: `<p id="output">اضغط تشغيل لعرض المصفوفة</p>`
  },
  {
    title: "دالة جمع",
    desc: "اكتب دالة sum تأخذ متغيرين a وb وتُرجع مجموعهما.",
    check: (code) => {
      const normalized = code.replace(/\s+/g, "");
      return normalized.includes("functionsum(a,b){returna+b") || normalized.includes("sum=(a,b)=>a+b");
    },
    starter: "// اكتب هنا كودك\n",
    html: `<p id="output">اضغط تشغيل لعرض 3 + 5 = <span id="result"></span></p>`
  },
  {
    title: "حدث النقر",
    desc: "أضف مستمع حدث click لعنصر بـ id='btn' لتغيير نصه إلى 'تم النقر'.",
    check: (code) => {
      const normalized = code.replace(/\s+/g, "");
      return normalized.includes("getElementById('btn').addEventListener('click'") && 
             (normalized.includes("textContent='تمالنقر'") || normalized.includes('textContent="تمالنقر"'));
    },
    starter: "// اكتب هنا كودك\n",
    html: `<button id="btn">اضغط هنا</button>`
  },
  {
    title: "مضاعفة مصفوفة",
    desc: "استخدم map() لمضاعفة عناصر المصفوفة [1, 2, 3] لتصبح [2, 4, 6].",
    check: (code) => {
      return code.replace(/\s+/g, "").includes("[1,2,3].map(x=>x*2)");
    },
    starter: "let arr = [1, 2, 3];\n// اكتب هنا كودك\n",
    html: `<p id="output">اضغط تشغيل لعرض المصفوفة</p>`
  },
  {
    title: "تحقق من العدد",
    desc: "اكتب كودًا للتحقق إذا كان العدد x=10 أكبر من 5، وإظهار 'كبير' في id='output'.",
    check: (code) => {
      const normalized = code.replace(/\s+/g, "");
      return normalized.includes("letx=10") && normalized.includes("x>5") && 
             (normalized.includes("getElementById('output').textContent='كبير'") || 
              normalized.includes('getElementById("output").textContent="كبير"'));
    },
    starter: "let x = 10;\n// اكتب هنا كودك\n",
    html: `<p id="output"></p>`
  },
  {
    title: "إنشاء عنصر",
    desc: "أنشئ عنصر <p> بنص 'جديد' وأضفه إلى id='container'.",
    check: (code) => {
      const normalized = code.replace(/\s+/g, "");
      return normalized.includes("createElement('p')") && 
             (normalized.includes("textContent='جديد'") || normalized.includes('textContent="جديد"')) && 
             normalized.includes("getElementById('container').appendChild");
    },
    starter: "// اكتب هنا كودك\n",
    html: `<div id="container"></div>`
  },
  {
    title: "تحويل نص إلى عدد",
    desc: "حول النص '42' إلى عدد باستخدام parseInt() واعرضه في id='output'.",
    check: (code) => {
      const normalized = code.replace(/\s+/g, "");
      return normalized.includes("parseInt('42')") && 
             (normalized.includes("getElementById('output').textContent") || 
              normalized.includes('getElementById("output").textContent'));
    },
    starter: "// اكتب هنا كودك\n",
    html: `<p id="output"></p>`
  },
  {
    title: "إزالة عنصر من مصفوفة",
    desc: "أزل العنصر الأول من المصفوفة [1, 2, 3] باستخدام splice().",
    check: (code) => {
      return code.replace(/\s+/g, "").includes("[1,2,3].splice(0,1)");
    },
    starter: "let arr = [1, 2, 3];\n// اكتب هنا كودك\n",
    html: `<p id="output">اضغط تشغيل لعرض المصفوفة</p>`
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
});

function runTask(i) {
  const code = document.getElementById(`code_${i}`).value;
  const iframe = document.getElementById(`prev_${i}`);
  const baseStyles = `
    body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }
    #output, #container, #btn { border: 1px solid #ccc; padding: 10px; }
    button { cursor: pointer; }
  `;
  const sanitizedCode = code.replace(/[<>]/g, "");
  // تضمين console.log لعرض المخرجات في الـ iframe
  const consoleScript = `
    <script>
      const log = console.log;
      console.log = (...args) => {
        const output = document.createElement('p');
        output.textContent = args.join(' ');
        document.body.appendChild(output);
        log(...args);
      };
    </script>
  `;
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>${baseStyles}</style></head><body>${tasksData[i].html}${consoleScript}<script>${sanitizedCode}</script></body></html>`;
}

function checkTask(i) {
  const code = document.getElementById(`code_${i}`).value;
  let ok = false;
  try {
    ok = tasksData[i].check(code);
    console.log(`Task ${i + 1}: Code = ${code}, Result = ${ok}`);
  } catch (e) {
    console.error(`Error in task ${i + 1}:`, e);
    ok = false;
  }
  const st = document.getElementById(`status_${i}`);
  if (ok) {
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