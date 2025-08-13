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
  { q:"أي وسم يُستخدم لإنشاء رابط؟", opts:["<link>","<a>","<href>"], ans:1 },
  { q:"أي وسم يُستخدم لإضافة صورة؟", opts:["<img>","<pic>","<image>"], ans:0 },
  { q:"ما الخاصية التي تحدد نص بديل للصورة؟", opts:["src","alt","href"], ans:1 },
  { q:"كم عدد وسوم العناوين في HTML؟", opts:["4","8","6"], ans:2 },
  { q:"أي وسم يُستخدم لإضافة صف جديد في الجدول؟", opts:["<tr>","<td>","<row>"], ans:0 },
  { q:"أي وسم يُستخدم لنص مائل (دلالي)؟", opts:["<i>","<em>","<italic>"], ans:1 },
  { q:"أي خاصية CSS تحدد لون الخلفية؟", opts:["background-color","bg","color-bg"], ans:0 },
  { q:"أي عنصر لتجميع عناصر نموذج؟", opts:["<form>","<fieldset>","<input>"], ans:0 },
  { q:"أي خاصية تحدد رابط الانتقال في <a>؟", opts:["href","src","link"], ans:0 },
  { q:"الامتداد الافتراضي لملفات HTML هو:", opts:[".html",".ht",".xml"], ans:0 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q:"اكمل: <a _____='page.html'>اضغط هنا</a>", opts:["src","href","link"], ans:1 },
  { q:"ما الوسم الواجب إغلاقه هنا: <p>مرحبا", opts:["</div>","</p>","</h1>"], ans:1 },
  { q:"<h1>Hello</h1> يعرض:", opts:["صورة Hello","نص كبير Hello","لا شيء"], ans:1 },
  { q:"اكمل: <img _____='cat.jpg' alt='قطة'>", opts:["href","src","link"], ans:1 },
  { q:"style='color:red' على عنصر نصي يجعل:", opts:["النص أحمر","الخلفية حمراء","لا شيء"], ans:0 },
  { q:"قائمة غير مرتبة تُنشأ بـ:", opts:["<ul>","<ol>","<list>"], ans:0 },
  { q:"خلية بيانات الجدول هي:", opts:["<tr>","<td>","<cell>"], ans:1 },
  { q:"خاصية عرض الصورة:", opts:["width","size","length"], ans:0 },
  { q:"<br> يعني:", opts:["فاصل أفقي","سطر جديد","صورة"], ans:1 },
  { q:"<!DOCTYPE html> تعني:", opts:["تعليق","HTML5","رابط"], ans:1 },

  // القسم الثالث: مخرجات
  { q:"<b>مرحبا</b> يعرض:", opts:["مرحبا عريض","مرحبا مائل","لا شيء"], ans:0 },
  { q:"<em>Hello</em> يعرض:", opts:["Hello مائل","Hello عريض","لا شيء"], ans:0 },
  { q:"<hr> يفعل:", opts:["خط أفقي","سطر جديد","صورة"], ans:0 },
  { q:"<u>كلمة</u> يعرض:", opts:["تسطير الكلمة","خط عريض","لا شيء"], ans:0 },
  { q:"<sup>2</sup> يعرض:", opts:["نص صغير أعلى السطر","نص صغير أسفل السطر","لا شيء"], ans:0 },
  { q:"<sub>H2O</sub> يعرض:", opts:["نص صغير أعلى","نص صغير أسفل","لا شيء"], ans:1 },
  { q:"<mark>مهم</mark> يعرض:", opts:["خلفية صفراء للنص","نص مائل","لا شيء"], ans:0 },
  { q:"<blockquote>اقتباس</blockquote>:", opts:["يعرض اقتباس","نص صغير","لا شيء"], ans:0 },
  { q:"<code>alert('Hi')</code>:", opts:["يعرض نص برمجي","ينفذ الكود","لا شيء"], ans:0 },
  { q:"<abbr title='HyperText Markup Language'>HTML</abbr>:", opts:["Tooltip توضيحي","لون مختلف","لا شيء"], ans:0 },
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
    label.innerHTML = `<input type="radio" name="q${idx+1}" id="${id}" value="${i}"> ${escapeHTML(opt)}`;
    qBox.appendChild(label);
  });
  mcqForm.appendChild(qBox);
});

function escapeHTML(str){
  return str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

let mcqScore = 0;
document.getElementById("save-mcq").addEventListener("click", ()=>{
  let score = 0;
  mcqData.forEach((item, idx)=>{
    const checked = document.querySelector(`input[name="q${idx+1}"]:checked`);
    if(checked && Number(checked.value) === item.ans) score++;
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * مهام عملية (10) + محرر + تصحيح تلقائي
 **********************/
const tasksData = [
  {
    title: "عنوان رئيسي",
    desc: "أنشئ عنوانًا رئيسيًا باستخدام <h1> يحتوي النص: EduMates",
    check: (doc)=>{
      const h1 = doc.querySelector("h1");
      return !!(h1 && h1.textContent.trim().toLowerCase() === "edumates");
    },
    starter: "<!-- اكتب هنا كودك -->"
  },
  {
    title: "رابط خارجي",
    desc: "أنشئ رابطًا إلى https://example.com يفتح في نافذة جديدة (target=\"_blank\") ونصه: زيارة",
    check: (doc)=>{
      const a = Array.from(doc.querySelectorAll("a")).find(x=>x.textContent.trim()==="زيارة");
      return !!(a && a.getAttribute("href")==="https://example.com" && a.getAttribute("target")==="_blank");
    },
    starter: ""
  },
  {
    title: "صورة بوصف بديل",
    desc: "أدرج صورة بمسار img/cat.jpg وبها خاصية alt ليست فارغة.",
    check: (doc)=>{
      const img = doc.querySelector("img[src='img/cat.jpg']");
      return !!(img && img.hasAttribute("alt") && img.getAttribute("alt").trim().length>0);
    },
    starter: ""
  },
  {
    title: "قائمة غير مرتبة",
    desc: "أنشئ قائمة غير مرتبة <ul> تحتوي ثلاث عناصر <li> على الأقل.",
    check: (doc)=>{
      const ul = doc.querySelector("ul");
      return !!(ul && ul.querySelectorAll("li").length>=3);
    },
    starter: ""
  },
  {
    title: "جدول بسيط",
    desc: "أنشئ جدولًا <table> يحتوي صفّيْن على الأقل وكل صف به خليتان <td> على الأقل.",
    check: (doc)=>{
      const table = doc.querySelector("table");
      if(!table) return false;
      const rows = table.querySelectorAll("tr");
      if(rows.length < 2) return false;
      return Array.from(rows).every(r=>r.querySelectorAll("td").length>=2);
    },
    starter: ""
  },
  {
    title: "نموذج وبريد Required",
    desc: "أنشئ نموذجًا <form> يحتوي حقل بريد إلكتروني <input type=\"email\" required> وزر إرسال.",
    check: (doc)=>{
      const form = doc.querySelector("form");
      if(!form) return false;
      const email = form.querySelector("input[type='email']");
      const btn = form.querySelector("button, input[type='submit']");
      return !!(email && email.hasAttribute("required") && btn);
    },
    starter: ""
  },
  {
    title: "زر ومعرف",
    desc: "أنشئ زرًا <button> نصه \"تشغيل\" ومعرفه id=\"run\".",
    check: (doc)=>{
      const b = doc.querySelector("button#run");
      return !!(b && b.textContent.trim()==="تشغيل");
    },
    starter: ""
  },
  {
    title: "كتلة ذات فئة",
    desc: "أنشئ عنصر <div> بالفئة class=\"card\" ويحتوي نصًا داخليًا غير فارغ.",
    check: (doc)=>{
      const d = doc.querySelector("div.card");
      return !!(d && d.textContent.trim().length>0);
    },
    starter: ""
  },
  {
    title: "فيديو مع عناصر تحكم",
    desc: "أدرج عنصر <video> مع خاصية controls ومصدر <source src=\"media/intro.mp4\" type=\"video/mp4\">.",
    check: (doc)=>{
      const v = doc.querySelector("video[controls]");
      if(!v) return false;
      const s = v.querySelector("source[src='media/intro.mp4'][type='video/mp4']");
      return !!s;
    },
    starter: ""
  },
  {
    title: "هيكل دلالي أساسي",
    desc: "استخدم عناصر دلالية: header, nav, main, footer موجودة جميعًا داخل المستند.",
    check: (doc)=>{
      return ["header","nav","main","footer"].every(sel=>!!doc.querySelector(sel));
    },
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
        <textarea class="code" id="code_${idx}" placeholder="اكتب كود HTML فقط...">${t.starter}</textarea>
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

function parseHTMLtoDoc(html){
  const parser = new DOMParser();
  // نضع الكود داخل body لضمان استعلامات أبسط
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  return doc;
}

function runTask(i){
  const code = document.getElementById(`code_${i}`).value;
  const iframe = document.getElementById(`prev_${i}`);
  // نعرضه داخل iframe مع HTML أساسي
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body>${code}</body></html>`;
}

function checkTask(i){
  const code = document.getElementById(`code_${i}`).value;
  const doc = parseHTMLtoDoc(code);
  let ok = false;
  try{ ok = tasksData[i].check(doc); }catch(e){ ok = false; }
  const st = document.getElementById(`status_${i}`);
  if(ok){ st.textContent = "✔ تم بنجاح"; st.classList.add("ok"); st.classList.remove("bad"); }
  else{ st.textContent = "✘ لم يتحقق الشرط بعد"; st.classList.add("bad"); st.classList.remove("ok"); }
  return ok;
}

tasksWrap.addEventListener("click",(e)=>{
  const btn = e.target.closest("button.btn");
  if(!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if(action==="run") runTask(i);
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
  // 0-15 مبتدئ, 16-26 جيد, 27-35 ممتاز, 36-40 أسطوري
  if(total<=15) return "مبتدئ 🐣";
  if(total<=26) return "جيد 🙂";
  if(total<=35) return "ممتاز 😎";
  return "أسطوري 🔥";
}

document.getElementById("calc-final").addEventListener("click", ()=>{
  // عرض النتائج الحالية
  document.getElementById("res-mcq").textContent = mcqScore;
  document.getElementById("res-practical").textContent = practicalScore;
  const total = mcqScore + practicalScore;
  document.getElementById("res-total").textContent = total;
  document.getElementById("res-level").textContent = levelOf(total);
});
