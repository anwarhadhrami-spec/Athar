(() => {
  "use strict";
  const TIMES = ["صنهار", "الغدو", "نص الليل", "الشروق"];
  const CYCLE_DAYS = 12;
  const STORE_KEY = "wellSharePlanner.v1";
  const TYPES = [{key:"ham"},{key:"qura"}];
  const $ = id => document.getElementById(id);

  // قوائم الآدز لكل نوع
  const ADS = {
    ham: ["العبطة","خلف","عبد","مالك","محمد","قيس","هرموز","هيرين","البال","الخيلانيين","مساك","عامر"],
    qura: ["عبد","مالك","محمد","قيس","هرموز","هيرين","البال","الخيلانيين","مساك","عامر","العبطة","خلف"]
  };

  function localDateString(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return `${y}-${m}-${d}`;}
  function parseDate(value){if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const [y,m,d]=value.split("-").map(Number);const date=new Date(y,m-1,d,12);return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?date:null;}
  function addDays(date,days){const copy=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);copy.setDate(copy.getDate()+days);return copy;}
  function daysBetween(a,b){return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);}
  function formatDate(date){return new Intl.DateTimeFormat("ar-OM",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(date);}
  function readStore(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||"{}");}catch(_){return {};}}
  let store=readStore();

  function getConfig(key){
    const item=store[key];
    if(!item||!parseDate(item.date)||!Number.isInteger(Number(item.time))||Number(item.time)<0||Number(item.time)>3) return null;
    return {date:item.date,time:Number(item.time)};
  }

  function occurrence(config,n,key){
    const date=addDays(parseDate(config.date),n*CYCLE_DAYS);
    const time=(config.time+n)%TIMES.length;
    const adList=ADS[key]||[];
    const ad=adList[n % adList.length];
    return {date,time,n,ad};
  }

  function currentTimeSlot(){const h=new Date().getHours();if(h>=5&&h<11)return 0;if(h>=11&&h<14)return 1;if(h>=14&&h<18)return 2;return 3;}

  function nextOccurrence(config,key){
    const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
    const diff=daysBetween(parseDate(config.date),today);
    let n=Math.max(0,Math.ceil(diff/CYCLE_DAYS));
    let candidate=occurrence(config,n,key);
    if(daysBetween(candidate.date,today)===0&&candidate.time<currentTimeSlot()){n++;candidate=occurrence(config,n,key);}
    return candidate;
  }

  function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;","&gt;":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

  function render(key){
    const config=getConfig(key),nextEl=$(`${key}-next`),scheduleEl=$(`${key}-schedule`);
    if(!config){
      nextEl.innerHTML='<span class="eyebrow">الحصة القادمة</span><p class="empty">أدخل التاريخ والوقت ثم اضغط حفظ.</p>';
      scheduleEl.innerHTML='<p class="empty" style="padding:10px">لا توجد مواعيد محفوظة بعد.</p>';
      return;
    }
    const next=nextOccurrence(config,key),today=new Date(),todayNoon=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12),remaining=daysBetween(todayNoon,next.date);
    nextEl.innerHTML=`<span class="eyebrow">الحصة القادمة</span><p class="next-date">${escapeHtml(formatDate(next.date))}</p><span class="next-time">${TIMES[next.time]}</span><p class="countdown">${remaining===0?"موعد الحصة اليوم":`باقي ${remaining} يومًا على موعد الحصة`}</p>`;
    const rows=[];
    for(let i=0;i<12;i++){
      const item=occurrence(config,next.n+i,key);
      rows.push(`<tr class="${i===0?"is-next":""}"><td>${i+1}${i===0?' <span class="pill">القادمة</span>':""}</td><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(item.ad||"")}</td><td>${TIMES[item.time]}</td></tr>`);
    }
    scheduleEl.innerHTML=`<table><thead><tr><th>#</th><th>التاريخ</th><th>الآد</th><th>الوقت</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
  }

  function setForm(key,config){$(`${key}-date`).value=config?.date||"";$(`${key}-time`).value=String(config?.time??0);}

  function saveType(key){
    const date=$(`${key}-date`).value,time=Number($(`${key}-time`).value);
    if(!parseDate(date)){$(`${key}-status`).textContent="يرجى إدخال تاريخ صحيح.";return;}
    store[key]={date,time};
    try{localStorage.setItem(STORE_KEY,JSON.stringify(store));$(`${key}-status`).textContent="تم حفظ البيانات على هذا الجهاز.";render(key);}catch(_){$(`${key}-status`).textContent="تعذر الحفظ. تحقق من إعدادات المتصفح.";}
  }

  TYPES.forEach(({key})=>{setForm(key,getConfig(key));$(`save-${key}`).addEventListener("click",()=>saveType(key));render(key);});

  $("export-data").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"well-share-planner",version:1,data:store},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="well-share-backup.json";a.click();URL.revokeObjectURL(url);$("backup-status").textContent="تم تجهيز ملف النسخة الاحتياطية.";});

  $("import-data").addEventListener("change",async event=>{const file=event.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text()),data=parsed.data||parsed,next={};for(const {key} of TYPES){if(data[key]&&parseDate(data[key].date)&&Number.isInteger(Number(data[key].time))&&Number(data[key].time)>=0&&Number(data[key].time)<=3)next[key]={date:data[key].date,time:Number(data[key].time)};}if(!Object.keys(next).length)throw Error("invalid");store=next;localStorage.setItem(STORE_KEY,JSON.stringify(store));TYPES.forEach(({key})=>{setForm(key,getConfig(key));render(key);$(`${key}-status`).textContent="تمت استعادة البيانات.";});$("backup-status").textContent="تمت استعادة النسخة الاحتياطية بنجاح.";}catch(_){$("backup-status").textContent="تعذر استعادة الملف. اختر نسخة احتياطية صحيحة من التطبيق.";}event.target.value="";});

  $("clear-data").addEventListener("click",()=>{if(!confirm("هل تريد مسح بيانات النوعين من هذا الجهاز؟ تأكد من تصدير نسخة احتياطية أولًا إن احتجت إليها."))return;store={};localStorage.removeItem(STORE_KEY);TYPES.forEach(({key})=>{setForm(key,null);render(key);$(`${key}-status`).textContent="تم مسح البيانات.";});$("backup-status").textContent="";});

  if("serviceWorker" in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
})();
