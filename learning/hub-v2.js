(()=>{"use strict";
const course=window.SEMINAR_2027_COURSE||[],target=document.getElementById("topicGrid");
if(!target)return;
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function previewStages(slug){try{return JSON.parse(sessionStorage.getItem("ijr2027_preview_"+slug)||"[]")}catch{return []}}
const cards=new Map();
for(const [i,t] of course.entries()){
 const el=document.createElement("article");el.className="topic-card";el.id="topic-"+t.slug;
 el.innerHTML='<div class="topline"><span>TOPIC '+String(t.order).padStart(2,"0")+' · '+safe(t.nav.toUpperCase())+'</span><span class="topic-count">0 / 12</span></div>'+
 '<h3>'+safe(t.title)+'</h3><p>'+safe(t.lead)+'</p>'+
 '<div class="bar"><span style="width:0%"></span></div>'+
 '<div class="links"><a class="button" href="theory.html?topic='+encodeURIComponent(t.slug)+'">01 · Theory</a>'+
 '<a class="button button-dark" href="workshop.html?topic='+encodeURIComponent(t.slug)+'">02 · Workshop</a></div>';
 cards.set(t.slug,el);target.appendChild(el);
}
const count=document.getElementById("globalCount"), percent=document.getElementById("globalPercent"),bar=document.getElementById("globalBar");
function paint(items,sourceLabel){
 let total=0;for(const t of course){
 const n=new Set(items[t.slug]||[]).size;total+=n;
 const card=cards.get(t.slug);card.querySelector(".topic-count").textContent=n+" / 12";
 card.querySelector(".bar span").style.width=Math.round(n/12*100)+"%";
 }
 const all=course.length*12;percent.textContent=Math.round(total/all*100)+"%";
 count.textContent=total+" / "+all+" etapas · "+sourceLabel;
 bar.style.width=Math.round(total/all*100)+"%";
}
function local(){const o={};for(const t of course)o[t.slug]=previewStages(t.slug);paint(o,"vista previa local");}
local();
if(!window.IJR_AUTH)return;
let lastIdentity=null;
window.IJR_AUTH.subscribe(async state=>{
 const status=document.getElementById("hubIdentityStatus");
 if(state.status==="not_configured"){status.textContent="Registro institucional pendiente: falta autorizar la conexión Supabase 2027.";local();return;}
 if(state.status==="not_enrolled"){status.textContent=state.reason;local();return;}
 if(state.status!=="verified"){status.textContent="Inicia sesión mediante el enlace enviado a tu @ijr.edu.co.";local();return;}
 status.textContent="Cuenta verificada: "+state.user.email+" · "+state.profile.class_group+" — cargando progreso…";
 if(lastIdentity===state.user.id)return;lastIdentity=state.user.id;
 try{
  const {data,error}=await window.IJR_AUTH.client.from("seminar_practice_progress").select("topic_slug,stage_key");
  if(error)throw error;
  const o={};for(const t of course)o[t.slug]=[];
  for(const row of data||[]){if(o[row.topic_slug])o[row.topic_slug].push(row.stage_key);}
  paint(o,"guardado en Supabase 2027");
  status.textContent="Progreso sincronizado de "+state.user.email+" · "+state.profile.class_group+".";
 }catch(e){status.textContent="No se pudo sincronizar el progreso: "+e.message;paint({},"sin datos sincronizados");}
});
})();