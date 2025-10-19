
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
  { q:"أي وسم يُستخدم لإنشاء رابط؟", opts:["&lt;link&gt;","&lt;a&gt;","&lt;href&gt;"], ans:1 },
  { q:"أي وسم يُستخدم لإضافة صورة؟", opts:["&lt;img&gt;","&lt;pic&gt;","&lt;image&gt;"], ans:0 },
  { q:"ما الخاصية التي تحدد نص بديل للصورة؟", opts:["src","alt","href"], ans:1 },
  { q:"كم عدد وسوم العناوين في HTML؟", opts:["4","8","6"], ans:2 },
  { q:"أي وسم يُستخدم لإضافة صف جديد في الجدول؟", opts:["&lt;tr&gt;","&lt;td&gt;","&lt;row&gt;"], ans:0 },
  { q:"أي وسم يُستخدم لنص مائل (دلالي)؟", opts:["&lt;i&gt;","&lt;em&gt;","&lt;italic&gt;"], ans:1 },
  { q:"أي خاصية CSS تحدد لون الخلفية؟", opts:["background-color","bg","color-bg"], ans:0 },
  { q:"أي عنصر لتجميع عناصر نموذج؟", opts:["&lt;form&gt;","&lt;fieldset&gt;","&lt;input&gt;"], ans:0 },
  { q:"أي خاصية تحدد رابط الانتقال في &lt;a&gt;؟", opts:["href","src","link"], ans:0 },
  { q:"الامتداد الافتراضي لملفات HTML هو:", opts:[".html",".ht",".xml"], ans:0 },

  // القسم الثاني: عملية بالكود (فهم/إكمال)
  { q:"اكمل: &lt;a _____='page.html'&gt;اضغط هنا&lt;/a&gt;", opts:["src","href","link"], ans:1 },
  { q:"ما الوسم الواجب إغلاقه هنا: &lt;p&gt;مرحبا", opts:["&lt;/div&gt;","&lt;/p&gt;","&lt;/h1&gt;"], ans:1 },
  { q:"&lt;h1&gt;Hello&lt;/h1&gt; يعرض:", opts:["صورة Hello","نص كبير Hello","لا شيء"], ans:1 },
  { q:"اكمل: &lt;img _____='cat.jpg' alt='قطة'&gt;", opts:["href","src","link"], ans:1 },
  { q:"style='color:red' على عنصر نصي يجعل:", opts:["النص أحمر","الخلفية حمراء","لا شيء"], ans:0 },
  { q:"قائمة غير مرتبة تُنشأ بـ:", opts:["&lt;ul&gt;","&lt;ol&gt;","&lt;list&gt;"], ans:0 },
  { q:"خلية بيانات الجدول هي:", opts:["&lt;tr&gt;","&lt;td&gt;","&lt;cell&gt;"], ans:1 },
  { q:"خاصية عرض الصورة:", opts:["width","size","length"], ans:0 },
  { q:"&lt;br&gt; يعني:", opts:["فاصل أفقي","سطر جديد","صورة"], ans:1 },
  { q:"&lt;!DOCTYPE html&gt; تعني:", opts:["تعليق","HTML5","رابط"], ans:1 },

  // القسم الثالث: مخرجات
  { q:"&lt;b&gt;مرحبا&lt;/b&gt; يعرض:", opts:["مرحبا عريض","مرحبا مائل","لا شيء"], ans:0 },
  { q:"&lt;em&gt;Hello&lt;/em&gt; يعرض:", opts:["Hello مائل","Hello عريض","لا شيء"], ans:0 },
  { q:"&lt;hr&gt; يفعل:", opts:["خط أفقي","سطر جديد","صورة"], ans:0 },
  { q:"&lt;u&gt;كلمة&lt;/u&gt; يعرض:", opts:["تسطير الكلمة","خط عريض","لا شيء"], ans:0 },
  { q:"&lt;sup&gt;2&lt;/sup&gt; يعرض:", opts:["نص صغير أعلى السطر","نص صغير أسفل السطر","لا شيء"], ans:0 },
  { q:"&lt;sub&gt;H2O&lt;/sub&gt; يعرض:", opts:["نص صغير أعلى","نص صغير أسفل","لا شيء"], ans:1 },
  { q:"&lt;mark&gt;مهم&lt;/mark&gt; يعرض:", opts:["خلفية صفراء للنص","نص مائل","لا شيء"], ans:0 },
  { q:"&lt;blockquote&gt;اقتباس&lt;/blockquote&gt;:", opts:["يعرض اقتباس","نص صغير","لا شيء"], ans:0 },
  { q:"&lt;code&gt;alert('Hi')&lt;/code&gt;:", opts:["يعرض نص برمجي","ينفذ الكود","لا شيء"], ans:0 },
  { q:"&lt;abbr title='HyperText Markup Language'&gt;HTML&lt;/abbr&gt;:", opts:["Tooltip توضيحي","لون مختلف","لا شيء"], ans:0 },
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
 * مهام عملية (10) + محرر CodeMirror + تصحيح تلقائي
 **********************/
const tasksData = [
  {
    title: "عنوان رئيسي",
    desc: "أنشئ عنوانًا رئيسيًا باستخدام &lt;h1&gt; يحتوي النص: EduMates",
    check: (doc)=>{
      const h1 = doc.querySelector("h1");
      return !!(h1 && h1.textContent.trim().toLowerCase() === "edumates");
    },
    starter: "<!-- اكتب هنا كودك -->"
  },
  {
    title: "رابط خارجي",
    desc: "أنشئ رابطًا إلى https://example.com يفتح في نافذة جديدة (target=&quot;_blank&quot;) ونصه: زيارة",
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
    desc: "أنشئ قائمة غير مرتبة &lt;ul&gt; تحتوي ثلاث عناصر &lt;li&gt; على الأقل.",
    check: (doc)=>{
      const ul = doc.querySelector("ul");
      return !!(ul && ul.querySelectorAll("li").length>=3);
    },
    starter: ""
  },
  {
    title: "جدول بسيط",
    desc: "أنشئ جدولًا &lt;table&gt; يحتوي صفّيْن على الأقل وكل صف به خليتان &lt;td&gt; على الأقل.",
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
    desc: "أنشئ نموذجًا &lt;form&gt; يحتوي حقل بريد إلكتروني &lt;input type=&quot;email&quot; required&gt; وزر إرسال.",
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
    desc: "أنشئ زرًا &lt;button&gt; نصه &quot;تشغيل&quot; ومعرفه id=&quot;run&quot;.",
    check: (doc)=>{
      const b = doc.querySelector("button#run");
      return !!(b && b.textContent.trim()==="تشغيل");
    },
    starter: ""
  },
  {
    title: "كتلة ذات فئة",
    desc: "أنشئ عنصر &lt;div&gt; بالفئة class=&quot;card&quot; ويحتوي نصًا داخليًا غير فارغ.",
    check: (doc)=>{
      const d = doc.querySelector("div.card");
      return !!(d && d.textContent.trim().length>0);
    },
    starter: ""
  },
  {
    title: "فيديو مع عناصر تحكم",
    desc: "أدرج عنصر &lt;video&gt; مع خاصية controls ومصدر &lt;source src=&quot;media/intro.mp4&quot; type=&quot;video/mp4&quot;&gt;.",
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

  // Initialize CodeMirror for each textarea
  const textarea = document.getElementById(`code_${idx}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "htmlmixed",
    theme: "default",
    lineNumbers: true,
    indentWithTabs: true,
    indentUnit: 2,
    matchBrackets: true,
    autoCloseTags: true
  });
  editors.push(editor);
});

function parseHTMLtoDoc(html){
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
  return doc;
}

function runTask(i){
  const code = editors[i].getValue();
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body>${code}</body></html>`;
}

function checkTask(i){
  const code = editors[i].getValue();
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

