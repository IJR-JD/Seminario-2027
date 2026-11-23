(()=>{"use strict";
const lessons=window.SEMINAR_2027_COURSE||[],checks=window.IJR_2027_CHECKS||{outputs:{},choices:{}};
const requested=new URLSearchParams(location.search).get("topic")||"algoritmos";
const key=window.SEMINAR_2027_TRACK==="statistics"&&requested==="variables"?"types":requested;
const lesson=lessons.find(t=>t.slug===key)||lessons[0];
if(!lesson)return;
const tasks=lesson.exercises||[];
const validStageKeys=new Set(tasks.map(task=>task.key));
const previewKey='ijr2027_preview_'+(window.SEMINAR_2027_TRACK==='programming'?'coding_':'')+lesson.slug;
const $=id=>document.getElementById(id);
let stage=0,activeCode={},runResult=null,loading=false,auth=window.IJR_AUTH||null,preview=true;
let completed=new Set(),source="Vista previa de práctica";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function readPreview(){try{const keys=JSON.parse(sessionStorage.getItem(previewKey)||"[]");return Array.isArray(keys)?keys.filter(key=>validStageKeys.has(key)):[]}catch{return []}}
function storePreview(){try{sessionStorage.setItem(previewKey,JSON.stringify([...completed].filter(key=>validStageKeys.has(key))))}catch{}}
const sidebar=$("stageList");const editor=$("codeEditor");
const runButton=$("runButton"),gutter=$("runGutter"),validation=$("validateButton");
const feedback=$("feedback"),output=$("outputText");
if(!document.getElementById("theoryTitle"))document.title="Workshop · "+lesson.title+" · Seminario 2027";
// The 12-stage workshop is embedded inside Theory as well as on its legacy standalone URL.
// The embedded layout has no separate theoryReturn anchor.
const theoryReturn=$("theoryReturn");
if(theoryReturn)theoryReturn.href="theory.html?topic="+encodeURIComponent(lesson.slug);
function set(id,s){const e=$(id);if(e)e.textContent=String(s??"")}
function repaintProgress(){
 const done=completed.size;set("topicPercent",Math.round(done*100/12)+"%");
 $("topicBar").style.width=Math.round(done*100/12)+"%";
 set("topicCount",done+" / "+tasks.length+" etapas");
 set("stageStatus",done+"/"+tasks.length+" completadas · "+source+" (no es calificación oficial)");
 [...sidebar.children].forEach((b,i)=>{
  const e=tasks[i];b.classList.toggle("active",i===stage);b.classList.toggle("done",completed.has(e.key));
  b.setAttribute("aria-current",i===stage?"step":"false");
  b.querySelector(".stage-check").textContent=completed.has(e.key)?"✓":"○";
 });
}
function status(text,good=false){feedback.textContent=text;feedback.className="feedback "+(good?"ok":"bad");}
function setBusy(b){
 loading=b;runButton.disabled=b;gutter.disabled=b;validation.disabled=b;
 $("previousStage").disabled=b||stage===0;$("nextStage").disabled=b||stage===tasks.length-1;
 [...sidebar.children].forEach(button=>button.disabled=b);
}
function renderStageFiles(files){
 const area=$("workshopDownloads");if(!area)return;
 area.replaceChildren();area.hidden=!Array.isArray(files)||files.length===0;
 if(area.hidden)return;
 const heading=document.createElement("span");heading.textContent="Generated files:";area.appendChild(heading);
 files.forEach(name=>{
  const btn=document.createElement("button");btn.type="button";btn.textContent="Download "+name;
  btn.addEventListener("click",async()=>{
   btn.disabled=true;
   try{await window.IJR_RUNNER.downloadFile(name);}catch(error){status("No se pudo descargar "+name+": "+(error.message||String(error)));}
   finally{btn.disabled=false;}
  });area.appendChild(btn);
 });
}
function displayStage(){
 const task=tasks[stage];runResult=null;feedback.textContent="";feedback.className="feedback";renderStageFiles([]);
 set("sideTitle",lesson.title);set("workshopTitle",lesson.title);
 set("workshopEyebrow","TOPIC "+String(lesson.order).padStart(2,"0")+" · PYTHON GUIDED WORKSHOP");
 const cls=window.SEMINAR_2027_TRACK==="statistics"&&lesson.slug==="logic"?" · CLASS "+(stage<6?"1 · Libraries + XLSX":"2 · Pandas"):"";
 set("stageBadge","STAGE "+String(stage+1).padStart(2,"0")+" / 12"+cls);
 set("stageKind",task.mode==="choice"?"CONCEPT CHECK":"PYTHON CODE CELL");
 set("problemTitle",task.title);set("problemPrompt",task.prompt);
 const hint=task.hint||(task.mode==="code"
  ?"1. Identifica los datos de entrada. 2. Busca el operador o función en Theory. 3. Escribe el programa completo. 4. Ejecuta y compara la salida."
  :"Descarta las opciones que contradigan la definición explicada en Theory.");
 set("hintText",hint);$("hintText").classList.add("hidden");$("hintButton").textContent="Show hint";
 const coding=task.mode!=="choice";$("codeWrap").classList.toggle("hidden",!coding);
 $("choiceWrap").classList.toggle("hidden",coding);
 runButton.classList.toggle("hidden",!coding);gutter.classList.toggle("hidden",!coding);
 set("cellLabel",coding?"Python 3 code cell · write your solution":"Concept check · choose an answer");
 $("choiceWrap").replaceChildren();
 if(!coding){
  (task.choices||[]).forEach((label,i)=>{
   const opt=document.createElement("label");opt.className="choice-option";
   const input=document.createElement("input");input.type="radio";input.name="stageAnswer";input.value=String(i);
   const word=document.createElement("span");word.textContent=label;
   opt.append(input,word);$("choiceWrap").appendChild(opt);
  });
  set("outputType","Feedback");set("outputText","Selecciona una opción y pulsa Validate.");
 }else{
  set("outputType","Python console");set("outputText","Edita la celda vacía, pulsa ▶ Run y luego Validate.");
 }
 editor.value=activeCode[task.key]||"";
 $("previousStage").disabled=stage===0;$("nextStage").disabled=stage===tasks.length-1;
 set("workshopRuntimeStatus"," · Run → inspect → validate");
 repaintProgress();
}
async function execute(){
 if(loading)return;
 const task=tasks[stage];if(task.mode==="choice")return;
 const code=editor.value;
 if(!code.trim()){status("Escribe una solución antes de ejecutar la celda.");return;}
 if(!window.IJR_RUNNER){status("El intérprete de Python no está disponible. Recarga la página.");return;}
 setBusy(true);set("workshopRuntimeStatus"," · Starting Python…");set("outputText","Loading Python runtime…");renderStageFiles([]);
 try{
  const result=await window.IJR_RUNNER.run(code,{timeoutMs:90000});
  runResult=result.ok?{key:task.key,code,output:result.output}:null;renderStageFiles(result.ok?result.files:[]);
  set("outputText",result.output||(result.ok?"(No output generated)":"Python execution error"));
  set("workshopRuntimeStatus",result.ok?" · Python executed":" · Fix Python error");
  status(result.ok?"El código se ejecutó. Comprueba la salida y pulsa Validate.":"La ejecución falló. Lee el error, corrige y vuelve a ejecutar.",result.ok);
 }catch(err){runResult=null;set("outputText",err.message||String(err));set("workshopRuntimeStatus"," · Python unavailable");status("No se completó la ejecución: "+err.message);}
 finally{setBusy(false)}
}
function norm(s){return String(s??"").replace(/\r/g,"").trim().replace(/[ \t]+$/gm,"")}
// Accept equivalent numeric representations and Python container representations while
// retaining strict comparisons for text, booleans and different container types.
function comparable(line){
 const s=line.trim();
 if(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(s))return {type:"number",value:Number(s)};
 const tuple=s.startsWith("(")&&s.endsWith(")");
 if(tuple||((s.startsWith("[")&&s.endsWith("]"))||(s.startsWith("{")&&s.endsWith("}")))){
  try{
   const json=(tuple?"["+s.slice(1,-1)+"]":s).replace(/'/g,'"').replace(/\bTrue\b/g,"true").replace(/\bFalse\b/g,"false").replace(/\bNone\b/g,"null");
   const parsed=JSON.parse(json);
   const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==="object"?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)])):value;
   return {type:tuple?"tuple":"container",value:JSON.stringify(canonical(parsed))};
  }catch{return {type:"text",value:s};}
 }
 return {type:"text",value:s};
}
function outputMatches(expected,actual){
 const a=norm(expected),b=norm(actual);
 if(a===b)return true;
 const la=a.split("\n"),lb=b.split("\n");if(la.length!==lb.length)return false;
 return la.every((line,i)=>{
  const x=comparable(line),y=comparable(lb[i]);if(x.type!==y.type)return false;
  return x.type==="number"?Number.isFinite(x.value)&&Number.isFinite(y.value)&&Math.abs(x.value-y.value)<=1e-9*Math.max(1,Math.abs(x.value)):x.value===y.value;
 });
}
async function complete(){
 const task=tasks[stage];completed.add(task.key);
 if(preview){storePreview();source="Vista previa temporal";repaintProgress();return;}
 if(auth&&auth.state.status==="verified"){
  try{await auth.saveStage(lesson.slug,task.key);source="Sincronizado con Supabase";repaintProgress();}
  catch(err){source="Sin sincronizar";repaintProgress();status("Solución correcta, pero no se pudo guardar el avance: "+err.message);}
 }
}
async function validate(){
 if(loading)return;
 const task=tasks[stage];
 if(task.mode==="choice"){
  const checked=$("choiceWrap").querySelector('input[name="stageAnswer"]:checked');
  if(!checked){status("Selecciona una respuesta antes de validar.");return;}
  const answer=checks.choices?.[task.key];
  if(Number.isInteger(answer)){
   const correct=Number(checked.value)===answer;
   if(correct){set("outputText","Correct answer: "+task.choices[answer]);status("✓ Respuesta correcta. Etapa validada.",true);await complete();}
   else{set("outputText","Respuesta seleccionada: "+task.choices[Number(checked.value)]);status("Esta opción no coincide con la respuesta esperada. Revisa Theory e inténtalo nuevamente.");}
  }else{
   set("outputText","Respuesta elegida: "+task.choices[Number(checked.value)]);
   status("Esta pregunta no tiene una respuesta de referencia configurada. No se marcará como validada; solicita revisión docente.");
  }
  return;
 }
 if(!runResult||runResult.key!==task.key||runResult.code!==editor.value){status("Ejecuta esta versión del código con ▶ Run antes de validar.");return;}
 const expected=checks.outputs?.[task.key];
 if(typeof expected==="string"){
  const correct=outputMatches(expected,runResult.output);
  if(correct){status("✓ Salida comprobada automáticamente. Etapa validada.",true);await complete();}
  else status("La salida no coincide con el resultado esperado. Revisa entradas, procedimiento y sintaxis. Inténtalo de nuevo.");
 }else{
  status("La celda se ejecutó, pero esta actividad no tiene una rúbrica automática configurada. No se marcará como validada; solicita revisión docente.");
 }
}
function navigate(i){if(loading||i<0||i>=tasks.length)return;activeCode[tasks[stage].key]=editor.value;stage=i;displayStage();(document.getElementById("practice")||document.documentElement).scrollIntoView({block:"start",behavior:"smooth"});}
tasks.forEach((task,i)=>{
 const btn=document.createElement("button");btn.type="button";btn.className="stage";
 btn.innerHTML='<span class="stage-index">'+String(i+1).padStart(2,"0")+'</span><span>'+esc(task.title)+'</span><span class="stage-check">○</span>';
 btn.addEventListener("click",()=>navigate(i));sidebar.appendChild(btn);
});
$("hintButton").addEventListener("click",()=>{const h=$("hintText");const hidden=h.classList.toggle("hidden");$("hintButton").textContent=hidden?"Show hint":"Hide hint";});
editor.addEventListener("input",()=>{runResult=null;activeCode[tasks[stage].key]=editor.value;});
editor.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();editor.setRangeText("    ",editor.selectionStart,editor.selectionEnd,"end");}});
$("resetStage").addEventListener("click",()=>{if(loading)return;editor.value="";activeCode[tasks[stage].key]="";runResult=null;$("choiceWrap").querySelectorAll("input").forEach(i=>i.checked=false);set("outputText","Celda reiniciada. Vuelve a resolver el reto.");feedback.textContent="";});
runButton.addEventListener("click",execute);gutter.addEventListener("click",execute);
validation.addEventListener("click",validate);
$("previousStage").addEventListener("click",()=>navigate(stage-1));$("nextStage").addEventListener("click",()=>navigate(stage+1));
completed=new Set(readPreview());source="Vista previa temporal";displayStage();
if(auth){auth.subscribe(async s=>{
 if(s.status!=="verified"){preview=true;completed=new Set(readPreview());source=s.status==="not_configured"?"Supabase aún no configurado":"Vista previa temporal";repaintProgress();return;}
 preview=false;source="Cargando progreso de correo institucional…";repaintProgress();
 try{const p=await auth.progress(lesson.slug);if(auth.state.user?.id!==s.user.id)return;completed=new Set(p.filter(key=>validStageKeys.has(key)));source="Sincronizado con Supabase 2027";}
 catch(e){completed=new Set();source="Sincronización no disponible: "+e.message;}
 repaintProgress();
 });}
})();