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
 * 10 مفاهيمية + 10 أوامر + 10 مخرجات/نتائج
 **********************/
const mcqData = [
  // القسم الأول: مفاهيم
  { q: "ما هو Git؟", opts: ["نظام تحكم في الإصدارات", "لغة برمجة", "محرر نصوص"], ans: 0 },
  { q: "ما الفرق بين Git وGitHub؟", opts: ["Git أداة محلية، GitHub منصة سحابية", "كلاهما نفس الشيء", "GitHub أداة محلية"], ans: 0 },
  { q: "ما هو Repository في Git؟", opts: ["مستودع للملفات والتاريخ", "ملف واحد", "أمر"], ans: 0 },
  { q: "ما هو Commit في Git؟", opts: ["تسجيل تغيير", "حذف ملف", "دمج فروع"], ans: 0 },
  { q: "ما هو Branch في Git؟", opts: ["فرع مستقل للتطوير", "ملف رئيسي", "أمر دمج"], ans: 0 },
  { q: "ما هو Merge في Git؟", opts: ["دمج تغييرات من فرع إلى آخر", "حذف فرع", "إنشاء فرع"], ans: 0 },
  { q: "ما هو Pull Request؟", opts: ["طلب دمج تغييرات", "أمر commit", "إنشاء repo"], ans: 0 },
  { q: "ما هو Staging Area؟", opts: ["منطقة تحضير للـ commits", "مكان الـ merge", "ملفات محذوفة"], ans: 0 },
  { q: "ما هو Remote Repository؟", opts: ["مستودع بعيد مثل على GitHub", "مستودع محلي", "فرع رئيسي"], ans: 0 },
  { q: "ما هو Clone في Git؟", opts: ["نسخ repo من بعيد إلى محلي", "إنشاء فرع", "حذف repo"], ans: 0 },

  // القسم الثاني: أوامر
  { q: "أمر تهيئة مستودع جديد:", opts: ["git init", "git start", "git new"], ans: 0 },
  { q: "أمر إضافة جميع الملفات إلى staging:", opts: ["git add .", "git commit", "git push"], ans: 0 },
  { q: "أمر تسجيل commit:", opts: ["git commit -m 'msg'", "git add", "git pull"], ans: 0 },
  { q: "أمر إنشاء فرع جديد والتبديل إليه:", opts: ["git branch new", "git checkout -b new", "git merge new"], ans: 1 },
  { q: "أمر التبديل إلى فرع:", opts: ["git checkout branch", "git branch", "git pull branch"], ans: 0 },
  { q: "أمر دمج فرع:", opts: ["git merge branch", "git push branch", "git clone branch"], ans: 0 },
  { q: "أمر جلب تغييرات من remote:", opts: ["git pull", "git push", "git add"], ans: 0 },
  { q: "أمر دفع التغييرات إلى remote:", opts: ["git push", "git pull", "git commit"], ans: 0 },
  { q: "أمر عرض حالة الملفات:", opts: ["git status", "git log", "git diff"], ans: 0 },
  { q: "أمر عرض تاريخ الـ commits:", opts: ["git log", "git status", "git branch"], ans: 0 },

  // القسم الثالث: مخرجات/نتائج
  { q: "ماذا يعرض أمر 'git status'؟", opts: ["حالة الملفات المعدلة وغير متتبعة", "تاريخ الـ commits", "قائمة الفروع"], ans: 0 },
  { q: "ماذا يعرض أمر 'git log'؟", opts: ["تاريخ الـ commits مع تفاصيل", "حالة الملفات", "الاختلافات"], ans: 0 },
  { q: "ماذا يعرض أمر 'git diff'؟", opts: ["الاختلافات بين الملفات", "قائمة الفروع", "روابط remote"], ans: 0 },
  { q: "ماذا يعرض أمر 'git branch'؟", opts: ["قائمة الفروع", "تاريخ الـ commits", "حالة الملفات"], ans: 0 },
  { q: "ماذا يعرض أمر 'git remote -v'؟", opts: ["روابط الـ remotes", "فروع محلية", "تاريخ الـ commits"], ans: 0 },
  { q: "ماذا يفعل أمر 'git clone url'؟", opts: ["ينسخ repo من بعيد إلى محلي", "ينشئ فرع جديد", "يدمج فروع"], ans: 0 },
  { q: "ماذا يفعل أمر 'git push origin main'؟", opts: ["يدفع التغييرات إلى main على origin", "يجلب تغييرات", "يحذف فرع"], ans: 0 },
  { q: "ماذا يفعل أمر 'git pull origin main'؟", opts: ["يجلب ويدمج تغييرات من main", "يدفع تغييرات", "يحذف فرع"], ans: 0 },
  { q: "ماذا يفعل أمر 'git checkout -b new'؟", opts: ["ينشئ فرع جديد ويبدل إليه", "يعرض قائمة الفروع", "يحذف فرع"], ans: 0 },
  { q: "ماذا يفعل أمر 'git merge main'؟", opts: ["يدمج تغييرات main في الفرع الحالي", "يحذف فرع main", "يضيف ملفات جديدة"], ans: 0 },
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
  // Reset previous styles
  document.querySelectorAll("#mcq-form label").forEach(label => {
    label.classList.remove("correct", "incorrect");
  });
  mcqData.forEach((item, idx)=>{
    const checked = document.querySelector(`input[name="q${idx+1}"]:checked`);
    if(checked) {
      const label = checked.parentElement;
      if(Number(checked.value) === item.ans) {
        score++;
        label.classList.add("correct");
      } else {
        label.classList.add("incorrect");
      }
    }
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * مهام عملية (10) + حقل نصي + تصحيح تلقائي
 **********************/
const tasksData = [
  {
    title: "تهيئة مستودع جديد",
    desc: "اكتب أمر Git لتهيئة مستودع جديد.",
    expected: "git init",
    starter: "# اكتب الأمر هنا"
  },
  {
    title: "إضافة جميع الملفات",
    desc: "اكتب أمر إضافة جميع الملفات إلى منطقة التحضير (staging).",
    expected: "git add .",
    starter: ""
  },
  {
    title: "تسجيل تغييرات",
    desc: "اكتب أمر تسجيل التغييرات مع رسالة 'Initial commit'.",
    expected: "git commit -m 'Initial commit'",
    starter: ""
  },
  {
    title: "إنشاء فرع جديد",
    desc: "اكتب أمر إنشاء فرع جديد باسم 'feature' والتبديل إليه.",
    expected: "git checkout -b feature",
    starter: ""
  },
  {
    title: "عرض حالة الملفات",
    desc: "اكتب أمر عرض حالة الملفات في المستودع.",
    expected: "git status",
    starter: ""
  },
  {
    title: "دمج فرع",
    desc: "اكتب أمر دمج فرع 'main' في الفرع الحالي.",
    expected: "git merge main",
    starter: ""
  },
  {
    title: "جلب تغييرات",
    desc: "اكتب أمر جلب ودمج التغييرات من فرع 'main' في remote 'origin'.",
    expected: "git pull origin main",
    starter: ""
  },
  {
    title: "دفع التغييرات",
    desc: "اكتب أمر دفع التغييرات إلى فرع 'main' في remote 'origin'.",
    expected: "git push origin main",
    starter: ""
  },
  {
    title: "عرض تاريخ التغييرات",
    desc: "اكتب أمر عرض تاريخ التغييرات (commits).",
    expected: "git log",
    starter: ""
  },
  {
    title: "نسخ مستودع",
    desc: "اكتب أمر نسخ مستودع من رابط مثل 'https://github.com/user/repo.git'.",
    expected: "git clone https://github.com/user/repo.git",
    starter: ""
  },
];

const tasksWrap = document.getElementById("tasks");
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
        <textarea class="code" id="code_${idx}" placeholder="اكتب أمر Git فقط...">${t.starter}</textarea>
        <div class="actions-row" style="margin-top:8px">
          <button class="btn" data-action="check" data-i="${idx}">تحقق تلقائي</button>
          <span id="status_${idx}" class="status">بانتظار التحقق…</span>
        </div>
      </div>
    </div>
  `;
  tasksWrap.appendChild(card);
});

function checkTask(i){
  const code = document.getElementById(`code_${i}`).value.trim().toLowerCase();
  const expected = tasksData[i].expected.toLowerCase();
  const ok = code === expected;
  const st = document.getElementById(`status_${i}`);
  if(ok){
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

tasksWrap.addEventListener("click",(e)=>{
  const btn = e.target.closest("button.btn");
  if(!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if(action==="check") checkTask(i);
});

let practicalScore = 0;
document.getElementById("save-practical").addEventListener("click", ()=>{
  let score = 0;
  for(let i=0;i<tasksData.length;i++){
    if(checkTask(i)) score++;
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
