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
  { q:"أي من هذه هو نوع بيانات أساسي في Python؟", opts:["int","str","list"], ans:0 },
  { q:"ما الدالة المستخدمة لطباعة نص؟", opts:["print()","show()","display()"], ans:0 },
  { q:"كم عدد أنواع المتغيرات في Python؟", opts:["غير محدود","ثابت","3"], ans:0 },
  { q:"أي رمز يُستخدم للتعليق؟", opts:["//","#","/* */"], ans:1 },
  { q:"ما النوع الذي يحتوي قائمة؟", opts:["tuple","dict","list"], ans:2 },
  { q:"الدوال في Python تُعرّف بـ:", opts:["function","def","proc"], ans:1 },
  { q:"أي مكتبة للرياضيات؟", opts:["math","calc","num"], ans:0 },
  { q:"ما الرمز للقسمة الصحيحة؟", opts:["/","//","%"], ans:1 },
  { q:"القوائم تُنشأ بـ:", opts:["[]","{}","()"], ans:0 },
  { q:"الامتداد الافتراضي لملفات Python هو:", opts:[".py",".p",".plt"], ans:0 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q:"اكمل: print(_____)", opts:["'Hello'","hello","\"Hi\""], ans:0 },
  { q:"ما الخطأ في: x = 5 print(x)", opts:["نقص ;","نقص :","لا خطأ"], ans:1 },
  { q:"x = 10; print(x) يعرض:", opts:["خطأ","10","x"], ans:1 },
  { q:"اكمل: lst = [1,2,_____]", opts:[")","]","3"], ans:1 },
  { q:"len('abc') يُرجع:", opts:["3","abc","خطأ"], ans:0 },
  { q:"قائمة مرتبة تُنشأ بـ:", opts:["list()","[]","dict()"], ans:1 },
  { q:"x = 5; y = 3; print(x + y) يعرض:", opts:["8","53","خطأ"], ans:0 },
  { q:"نوع المتغير x=3.14:", opts:["int","float","str"], ans:1 },
  { q:"if x > 0: print('yes') يعني:", opts:["دائماً","إذا x>0","خطأ"], ans:1 },
  { q:"#!/usr/bin/env python3 تعني:", opts:["تعليق","Shebang","رابط"], ans:1 },

  // القسم الثالث: مخرجات
  { q:"print('Hi') يعرض:", opts:["Hi","'Hi'","لا شيء"], ans:0 },
  { q:"print(2+3) يعرض:", opts:["5","23","خطأ"], ans:0 },
  { q:"x='a'; print(x*3) يعرض:", opts:["aaa","a a a","خطأ"], ans:0 },
  { q:"print(len([1,2])) يعرض:", opts:["2","[1,2]","خطأ"], ans:0 },
  { q:"print(10//3) يعرض:", opts:["3","3.333","خطأ"], ans:0 },
  { q:"print(10%3) يعرض:", opts:["1","3","خطأ"], ans:0 },
  { q:"print('py' + 'thon') يعرض:", opts:["python","py thon","خطأ"], ans:0 },
  { q:"x=5; if x>3: print('yes') يعرض:", opts:["yes","no","خطأ"], ans:0 },
  { q:"for i in range(3): print(i) يعرض:", opts:["0 1 2","3","خطأ"], ans:0 },
  { q:"def f(): return 42; print(f()) يعرض:", opts:["42","f()","خطأ"], ans:0 },
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
    const opts = document.querySelectorAll(`input[name="q${idx+1}"]`);
    opts.forEach(opt=>{
      const label = opt.parentElement;
      label.style.background = ""; // إعادة التهيئة
      label.style.color = "";
      if(opt.checked){
        if(Number(opt.value) === item.ans){
          score++;
          label.style.background = "#d1fae5"; // أخضر فاتح
          label.style.color = "#15803d";      // أخضر غامق
        }else{
          label.style.background = "#fee2e2"; // أحمر فاتح
          label.style.color = "#b91c1c";      // أحمر غامق
        }
      }
    });
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * مهام عملية (10) + محرر CodeMirror + تصحيح تلقائي بـ Pyodide
 **********************/
let pyodide = null;
async function loadPyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
    });
  }
  return pyodide;
}

const tasksData = [
  {
    title: "طباعة نص أساسي",
    desc: "اكتب كوداً يطبع 'Hello, Python!' باستخدام print().",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "Hello, Python!";
    },
    starter: "# اكتب هنا كودك"
  },
  {
    title: "حساب مجموع",
    desc: "اكتب كوداً يحسب مجموع 5 + 7 ويطبعه.",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "12";
    },
    starter: ""
  },
  {
    title: "قائمة بسيطة",
    desc: "أنشئ قائمة [1, 2, 3] واطبع طولها بـ len().",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "3";
    },
    starter: ""
  },
  {
    title: "شرط إذا",
    desc: "اكتب if x > 0: print('إيجابي') حيث x=10.",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "إيجابي";
    },
    starter: ""
  },
  {
    title: "حلقة for",
    desc: "اكتب for i in range(3): print(i) لطباعة 0 1 2.",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "0\n1\n2";
    },
    starter: ""
  },
  {
    title: "دالة بسيطة",
    desc: "عرّف def add(a, b): return a + b ثم print(add(2, 3)).",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "5";
    },
    starter: ""
  },
  {
    title: "قاموس",
    desc: "أنشئ dict = {'name': 'Python'} واطبع dict['name'].",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "Python";
    },
    starter: ""
  },
  {
    title: "قراءة إدخال",
    desc: "استخدم name = input() ثم print('Hi, ' + name) (افترض إدخال 'User').",
    check: async (code) => {
      const py = await loadPyodide();
      py.runPython(`
import sys
sys.stdin = open('/dev/null', 'r')  # محاكاة
name = 'User'
print('Hi, ' + name)
      `);
      const output = py.runPython(code + "\n# Check");
      return py.runPython("output.strip() == 'Hi, User'").toString() === "True";
    },
    starter: ""
  },
  {
    title: "قائمة مرتبة",
    desc: "رتب قائمة [3,1,2] بـ sorted() واطبعها.",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "[1, 2, 3]";
    },
    starter: ""
  },
  {
    title: "معالجة نص",
    desc: "اكتب s = 'hello'; print(s.upper()).",
    check: async (code) => {
      const output = await runPython(code);
      return output.trim() === "HELLO";
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
        <textarea class="code" id="code_${idx}" placeholder="اكتب كود Python فقط...">${t.starter}</textarea>
        <div class="actions-row" style="margin-top:8px">
          <button class="btn" data-action="run" data-i="${idx}">تشغيل</button>
          <button class="btn" data-action="check" data-i="${idx}">تحقق تلقائي</button>
          <span id="status_${idx}" class="status">بانتظار التحقق…</span>
        </div>
      </div>
      <div>
        <div class="output-wrap">
          <pre id="output_${idx}" style="width:100%; height:220px; border:0; padding:10px; background:#f8f9fa; overflow:auto; white-space:pre-wrap;"></pre>
        </div>
      </div>
    </div>
  `;
  tasksWrap.appendChild(card);

  // Initialize CodeMirror for each textarea
  const textarea = document.getElementById(`code_${idx}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "python",
    theme: "default",
    lineNumbers: true,
    indentWithTabs: true,
    indentUnit: 4,
    matchBrackets: true
  });
  editors.push(editor);
});

async function runPython(code) {
  try {
    const py = await loadPyodide();
    // التقاط الإخراج
    py.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()
    `);
    py.runPython(code);
    const output = py.runPython("mystdout.getvalue()");
    py.runPython("sys.stdout = old_stdout");
    return output.toString();
  } catch (e) {
    return "خطأ: " + e.message;
  }
}

async function runTask(i) {
  const code = editors[i].getValue();
  const outputEl = document.getElementById(`output_${i}`);
  const output = await runPython(code);
  outputEl.textContent = output;
}

async function checkTask(i) {
  const code = editors[i].getValue();
  let ok = false;
  try {
    ok = await tasksData[i].check(code);
  } catch (e) {
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

tasksWrap.addEventListener("click", async (e) => {
  const btn = e.target.closest("button.btn");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if (action === "run") await runTask(i);
  if (action === "check") await checkTask(i);
});

let practicalScore = 0;
document.getElementById("save-practical").addEventListener("click", async () => {
  let score = 0;
  for (let i = 0; i < tasksData.length; i++) {
    if (await checkTask(i)) score++;
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