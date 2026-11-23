/* Seminario 2027 QA interface enhancement v1.
 * Progressive enhancement only: no changes to academic exercises or grading rules.
 */
(()=>{"use strict";
function button(text,action,label){
 const b=document.createElement("button");
 b.type="button";b.textContent=text;
 b.setAttribute("aria-label",label||text);b.addEventListener("click",action);
 return b;
}
function enhanceEditor(id,runId){
 const editor=document.getElementById(id);
 if(!editor||editor.dataset.qaEnhanced==="1")return;
 const toolbar=editor.closest(".live-editor,.cell-main")?.querySelector(".cell-toolbar");
 if(!toolbar)return;
 editor.dataset.qaEnhanced="1";
 const shell=document.createElement("div");shell.className="code-surface";
 const numbers=document.createElement("div");numbers.className="code-lines";
 numbers.setAttribute("aria-hidden","true");
 editor.parentNode.insertBefore(shell,editor);
 shell.append(numbers,editor);
 const controls=document.createElement("div");controls.className="code-utilities";controls.setAttribute("role","group");
 controls.setAttribute("aria-label","Herramientas del editor Python");
 const assist=document.createElement("span");assist.className="editor-assist";
 assist.textContent="Ctrl + Enter: ejecutar · Tab: 4 espacios";
 let fontSize=15,lastCount=-1;
 const redraw=()=>{
  const count=Math.min(1000,Math.max(1,editor.value.split("\n").length));
  if(count!==lastCount){
   numbers.textContent=Array.from({length:count},(_,i)=>String(i+1)).join("\n");
   lastCount=count;
  }
  numbers.scrollTop=editor.scrollTop;
 };
 const decrease=button("A−",()=>changeSize(-1),"Reducir el texto del código");
 const increase=button("A+",()=>changeSize(1),"Ampliar el texto del código");
 const fullscreen=button("Ampliar editor",()=>{
  const expanded=shell.classList.toggle("is-expanded");
  fullscreen.textContent=expanded?"Contraer editor":"Ampliar editor";
  fullscreen.setAttribute("aria-pressed",String(expanded));
  requestAnimationFrame(redraw);
 },"Expandir o contraer el editor");
 fullscreen.setAttribute("aria-pressed","false");
 const copy=button("Copiar",async()=>{
  if(!editor.value){copy.textContent="Sin código";return;}
  try{await navigator.clipboard.writeText(editor.value);copy.textContent="Copiado ✓";}
  catch{copy.textContent="Selecciona código para copiar";editor.focus();editor.select();}
  setTimeout(()=>copy.textContent="Copiar",1700);
 },"Copiar el contenido del editor");
 function changeSize(delta){
  fontSize=Math.min(21,Math.max(13,fontSize+delta));
  shell.style.setProperty("--editor-font-size",fontSize+"px");
  redraw();
 }
 controls.append(decrease,increase,fullscreen,copy,assist);
 toolbar.appendChild(controls);
 editor.addEventListener("input",redraw);
 editor.addEventListener("scroll",redraw,{passive:true});
 editor.addEventListener("focus",redraw);
 editor.addEventListener("keydown",event=>{
  if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){
   event.preventDefault();
   const run=document.getElementById(runId);
   if(run&&!run.disabled&&getComputedStyle(run).display!=="none")run.click();
   return;
  }
  // The integrated workshop already handles Tab. Add it to the theory lab.
  if(id==="theoryCode"&&event.key==="Tab"&&!event.shiftKey){
   event.preventDefault();
   editor.setRangeText("    ",editor.selectionStart,editor.selectionEnd,"end");
   editor.dispatchEvent(new Event("input",{bubbles:true}));
  }
 });
 if(id==="codeEditor"){
  const prompt=document.getElementById("problemTitle");
  if(prompt)new MutationObserver(()=>requestAnimationFrame(redraw)).observe(prompt,{childList:true,subtree:true,characterData:true});
  ["previousStage","nextStage","stageList","resetStage"].forEach(k=>
   document.getElementById(k)?.addEventListener("click",()=>requestAnimationFrame(redraw)));
 }
 redraw();
}
function enhanceStageRail(){
 const rail=document.getElementById("stageList");if(!rail)return;
 let scheduled=false;
 function revealActive(){
  scheduled=false;
  if(rail.scrollWidth<=rail.clientWidth+3)return;
  const active=rail.querySelector(".stage.active");if(!active)return;
  const a=active.getBoundingClientRect(),r=rail.getBoundingClientRect();
  if(a.left<r.left+9||a.right>r.right-9){
   const amount=a.left-r.left-(r.width-a.width)/2;
   rail.scrollBy({left:amount,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }
 }
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(revealActive);}};
 new MutationObserver(schedule).observe(rail,{subtree:true,attributes:true,attributeFilter:["class"]});
 window.addEventListener("resize",schedule,{passive:true});
 schedule();
}
function enhanceScrollRegions(){
 const areas=[...document.querySelectorAll(".p60-mini-table,.diagram-stage")];
 for(const el of areas){
  const isTable=el.classList.contains("p60-mini-table");
  const scrolling=el.scrollWidth>el.clientWidth+5;
  if(isTable||scrolling){
   el.tabIndex=0;
   el.setAttribute("role","region");
   el.setAttribute("aria-label",isTable?"Tabla de datos desplazable":"Diagrama: desplázate horizontalmente para ver la figura completa");
  }else{
   el.removeAttribute("tabindex");
   el.removeAttribute("role");
   el.removeAttribute("aria-label");
  }
  if(isTable){
   if(!el.previousElementSibling?.classList?.contains("p60-table-hint")){
    const hint=document.createElement("p");
    hint.className="p60-table-hint";
    hint.textContent="Tabla de cinco variables. Si no caben todas las columnas, desplázala horizontalmente.";
    el.parentNode.insertBefore(hint,el);
   }
  }else{
   const card=el.closest(".diagram-card-v2");
   let cue=card?.querySelector(".diagram-scroll-cue");
   if(scrolling&&!cue&&card){
    cue=document.createElement("p");cue.className="diagram-scroll-cue";
    cue.textContent="↔ Desliza horizontalmente para consultar toda la figura.";
    el.insertAdjacentElement("afterend",cue);
   }else if(!scrolling&&cue)cue.remove();
  }
 }
}
function enhanceProgress(){
 [["topicPercent","topicBar"],["globalPercent","globalBar"]].forEach(([label,barId])=>{
  const labelEl=document.getElementById(label),bar=document.getElementById(barId);
  if(!labelEl||!bar||bar.dataset.qaProgress)return;
  bar.dataset.qaProgress="1";
  const outer=bar.parentElement;
  outer.setAttribute("role","progressbar");
  outer.setAttribute("aria-label","Avance de práctica");
  outer.setAttribute("aria-valuemin","0");outer.setAttribute("aria-valuemax","100");
  const update=()=>outer.setAttribute("aria-valuenow",String(Math.min(100,Math.max(0,parseInt(labelEl.textContent,10)||0))));
  new MutationObserver(update).observe(labelEl,{childList:true,subtree:true,characterData:true});update();
 });
}
function start(){
 enhanceEditor("theoryCode","theoryRun");
 enhanceEditor("codeEditor","runButton");
 enhanceStageRail();enhanceScrollRegions();enhanceProgress();
 window.addEventListener("resize",()=>requestAnimationFrame(enhanceScrollRegions),{passive:true});
 setTimeout(enhanceScrollRegions,300);
 // The Pandas theory renders its tables after the initial DOM-ready event.
 if(document.querySelector("#main")){
  let scheduled=false;
  new MutationObserver(mutations=>{
   if(scheduled||!mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(".p60-mini-table")||n.querySelector?.(".p60-mini-table")))))return;
   scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhanceScrollRegions();});
  }).observe(document.querySelector("#main"),{childList:true,subtree:true});
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();
