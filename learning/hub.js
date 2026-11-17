(()=>{"use strict";
const topics=window.SEMINAR_TOPICS||{};
const order=["algoritmos","variables"];
const getTopic=()=>{const key=new URLSearchParams(location.search).get("topic");return topics[key]||topics.algoritmos};
const keyFor=id=>"seminario2027_progress_"+id+"_v1";
const readProgress=id=>{try{const v=JSON.parse(localStorage.getItem(keyFor(id))||"[]");return Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=0&&n<12):[]}catch{return []}};
const saveProgress=(id,list)=>{try{localStorage.setItem(keyFor(id),JSON.stringify([...new Set(list)]))}catch{}};
const el=id=>document.getElementById(id);
const set=(id,value)=>{const n=el(id);if(n)n.textContent=String(value)};
const escapeHtml=v=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const percentage=n=>Math.round(n*100/12);
function renderHub(){
 const grid=el("topicGrid");if(!grid)return;
 let doneTotal=0;
 for(const id of order){
 const topic=topics[id];if(!topic)continue;
 const done=readProgress(id).length;doneTotal+=done;
 const card=document.createElement("article");card.className="topic-card";
 card.innerHTML='<div class="topline"><span>TOPIC '+escapeHtml(topic.number)+' · '+escapeHtml(topic.level.toUpperCase())+'</span><span>'+done+' / 12 etapas</span></div>'+
 '<h3>'+escapeHtml(topic.title)+'</h3><p>'+escapeHtml(topic.intro)+'</p>'+
 '<div class="bar" aria-label="'+done+' de 12 etapas"><span style="width:'+percentage(done)+'%"></span></div>'+
 '<div class="links"><a class="button" href="theory.html?topic='+encodeURIComponent(id)+'">01 · Theory</a>'+
 '<a class="button button-dark" href="workshop.html?topic='+encodeURIComponent(id)+'">02 · Workshop</a></div>';
 grid.appendChild(card);
 }
 const total=order.length*12;
 set("globalPercent",Math.round(doneTotal*100/total)+"%");
 set("globalCount",doneTotal+" / "+total+" etapas completadas");
 el("globalBar").style.width=Math.round(doneTotal*100/total)+"%";
}
function renderTheory(){
 if(!el("theoryTitle"))return;
 const topic=getTopic();
 document.title="Theory · "+topic.title+" · Seminario 2027";
 set("crumb",topic.title);
 set("theoryEyebrow","THEORY · TOPIC "+topic.number+" · "+topic.level.toUpperCase());
 set("theoryTitle",topic.title);
 set("theoryIntro",topic.intro);
 set("learningGoal",topic.goal);
 set("theoryNumber",topic.number+" / 02");
 set("theoryDuration",topic.duration);
 set("theoryCode",topic.example);
 set("theoryExpected",topic.expected);
 el("theoryWorkshopLink").href="workshop.html?topic="+encodeURIComponent(topic.id);
 const grid=el("conceptGrid");
 topic.concepts.forEach((c)=>{
 const box=document.createElement("article");box.className="panel";
 box.innerHTML="<h2>"+escapeHtml(c.title)+"</h2><p>"+escapeHtml(c.body)+"</p><div class='example'><strong>Ejemplo trabajado</strong>"+escapeHtml(c.example)+"</div>";
 grid.appendChild(box);
 });
 const syntax=el("syntaxRows");topic.syntax.forEach(([code,desc])=>{
 const row=document.createElement("tr");
 row.innerHTML="<td><code>"+escapeHtml(code)+"</code></td><td>"+escapeHtml(desc)+"</td>";
 syntax.appendChild(row);
 });
}
function renderWorkshop(){
 if(!el("stageList"))return;
 const topic=getTopic();document.title="Workshop · "+topic.title+" · Seminario 2027";
 const tasks=topic.problems;let index=0,running=false,pending=null,worker=null,firstRun=true,sequence=0;
 const completed=new Set(readProgress(topic.id));
 const editor=el("codeEditor");const run=el("runButton");const play=el("runGutter");
 const validate=el("validateButton");const prev=el("previousStage");const next=el("nextStage");const choiceWrap=el("choiceWrap");
 const status=el("runtimeStatus");const out=el("outputText");const feedback=el("feedback");
 set("sideTitle",topic.title);set("workshopTitle",topic.title);set("workshopEyebrow","TOPIC "+topic.number+" · GUIDED PYTHON NOTEBOOK");
 el("theoryReturn").href="theory.html?topic="+encodeURIComponent(topic.id);
 function refreshProgress(){
 const done=completed.size;
 set("topicPercent",percentage(done)+"%");set("topicCount",done+" / 12 etapas");
 el("topicBar").style.width=percentage(done)+"%";
 set("stageStatus",done===tasks.length?"12 / 12 completadas en este navegador":"Progreso local: "+done+" / 12 · Sin entrega oficial");
 [...el("stageList").children].forEach((btn,n)=>{
 btn.classList.toggle("done",completed.has(n));btn.classList.toggle("active",n===index);
 btn.setAttribute("aria-current",n===index?"step":"false");
 btn.querySelector(".stage-check").textContent=completed.has(n)?"✓":"○";
 });
 }
 function clearFeedback(){feedback.textContent="";feedback.className="feedback";}
 function refreshStage(){
 pending=null;clearFeedback();
 const task=tasks[index];set("stageBadge","STAGE "+String(index+1).padStart(2,"0")+" / 12");
 set("stageKind",task.kind==="code"?"PYTHON CODING":"CONCEPT CHECK");
 set("problemTitle",task.title);set("problemPrompt",task.prompt);
 el("hintText").textContent=task.hint;el("hintText").classList.add("hidden");
 el("hintButton").textContent="Mostrar pista";
 const isCode=task.kind==="code";
 el("codeWrap").classList.toggle("hidden",!isCode);
 choiceWrap.classList.toggle("hidden",isCode);
 run.classList.toggle("hidden",!isCode);play.classList.toggle("hidden",!isCode);
 set("cellLabel",isCode?"Python 3 code cell · from blank":"Multiple-choice response");
 set("outputType",isCode?"Python output":"Answer feedback");
 editor.value="";
 choiceWrap.replaceChildren();
 if(!isCode)task.options.forEach((label,n)=>{
 const option=document.createElement("label");option.className="choice-option";
 const input=document.createElement("input");input.type="radio";input.name="stageAnswer";input.value=String(n);
 const span=document.createElement("span");span.textContent=label;
 option.append(input,span);choiceWrap.appendChild(option);
 });
 out.textContent=isCode?"Escribe tu solución, pulsa Run y después Validate.":"Selecciona la respuesta y pulsa Validate.";
 prev.disabled=index===0;next.disabled=index===tasks.length-1;
 refreshProgress();
 }
 function markComplete(){
 completed.add(index);
 saveProgress(topic.id,[...completed]);refreshProgress();
 }
 function setBusy(value){
 running=value;
 run.disabled=value;play.disabled=value;validate.disabled=value;prev.disabled=value||index===0;next.disabled=value||index===tasks.length-1;
 [...el("stageList").children].forEach(b=>b.disabled=value);
 }
 function report(ok,message){
 feedback.textContent=message;feedback.className="feedback "+(ok?"ok":"bad");
 }
 async function executePython(){
 if(running)return;
 const code=editor.value.trim();
 if(!code){report(false,"Escribe el código completo antes de ejecutarlo.");return;}
 pending=null;setBusy(true);clearFeedback();
 status.textContent=" · Iniciando Python…";out.textContent="Preparando el entorno…";
 try{
  if(!worker)worker=new Worker("python-worker.js");
  const req=++sequence;
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{worker?.terminate();worker=null;reject(new Error("Tiempo de ejecución agotado. Evita ciclos infinitos y vuelve a intentarlo."));},firstRun?35000:12000);
   worker.onmessage=({data})=>{if(data.id!==req)return;clearTimeout(timer);resolve(data)};
   worker.onerror=(event)=>{clearTimeout(timer);worker?.terminate();worker=null;reject(new Error("No se pudo iniciar Python. Comprueba la conexión a internet."))};
   worker.postMessage({type:"run",id:req,code});
  });
  firstRun=false;
  if(result.status!=="ok"){out.textContent=result.error||"Error de Python";report(false,"Corrige el programa y vuelve a ejecutar.");}
  else{out.textContent=result.output||"(Sin salida de print)";pending={stage:index,code:editor.value,output:result.output};report(true,"Código ejecutado. Revisa el resultado y pulsa Validate.");}
  status.textContent=" · Python preparado";
 }catch(error){out.textContent=error.message;status.textContent=" · Runtime no disponible";report(false,"No se pudo ejecutar: "+error.message);}
 finally{setBusy(false)}
 }
 function validateStage(){
 if(running)return;
 const task=tasks[index];
 if(task.kind==="choice"){
  const checked=choiceWrap.querySelector('input[name="stageAnswer"]:checked');
  if(!checked){report(false,"Selecciona una opción antes de validar.");return;}
  const correct=Number(checked.value)===task.answer;
  out.textContent=correct?"Respuesta correcta.":("Respuesta correcta: "+task.options[task.answer]+".");
  report(correct,(correct?"✓ Etapa validada. ":"Revisa la explicación. ")+task.reason);
  if(correct)markComplete();
 }else{
  if(!pending||pending.stage!==index||pending.code!==editor.value){
   report(false,"Primero ejecuta esta versión del código con Run.");return;
  }
  const clean=s=>String(s).replace(/\r/g,"").trim().replace(/[ \t]+$/gm,"");
  const correct=clean(pending.output)===clean(task.expected);
  report(correct,(correct?"✓ Etapa validada. ":"El resultado todavía no coincide. ")+task.reason+(correct?"":" Salida esperada: "+task.expected.replace(/\n/g," | ")));
  if(correct)markComplete();
 }
 }
 function gotoStage(n){if(running||n<0||n>=tasks.length)return;index=n;refreshStage();window.scrollTo({top:0,behavior:"smooth"})}
 const sidebar=el("stageList");
 tasks.forEach((task,n)=>{
 const btn=document.createElement("button");btn.type="button";btn.className="stage";
 btn.innerHTML='<span class="stage-index">'+String(n+1).padStart(2,"0")+'</span><span>'+escapeHtml(task.title)+'</span><span class="stage-check">○</span>';
 btn.addEventListener("click",()=>gotoStage(n));sidebar.appendChild(btn);
 });
 el("hintButton").addEventListener("click",()=>{
 const hint=el("hintText");const hidden=hint.classList.toggle("hidden");
 el("hintButton").textContent=hidden?"Mostrar pista":"Ocultar pista";
 });
 el("resetStage").addEventListener("click",()=>{if(running)return;pending=null;editor.value="";choiceWrap.querySelectorAll("input").forEach(i=>i.checked=false);out.textContent="Etapa reiniciada. Puedes volver a practicar.";clearFeedback();});
 run.addEventListener("click",executePython);play.addEventListener("click",executePython);
 validate.addEventListener("click",validateStage);
 prev.addEventListener("click",()=>gotoStage(index-1));next.addEventListener("click",()=>gotoStage(index+1));
 editor.addEventListener("keydown",event=>{if(event.key==="Tab"){event.preventDefault();const a=editor.selectionStart,b=editor.selectionEnd;editor.setRangeText("    ",a,b,"end");}});
 editor.addEventListener("input",()=>{pending=null;});
 refreshStage();
}
renderHub();renderTheory();renderWorkshop();
})();
