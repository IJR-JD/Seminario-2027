/* IJR · Seminario 2027 · Motion Lab v2
   Pedagogical motion, not decorative autoplay.
   Every narrated beat has a matching model component, with reduced-motion and
   visibility-aware playback. Scientific values remain in lesson-figures-v1.js.
*/
(()=>{"use strict";
const SVG_NS="http://www.w3.org/2000/svg";
const sequences={
 algoritmos:[
  {mode:"flow",beats:["Identify the input: base and height.","Apply the calculation in the processing stage.","Send the calculated area to the output."]},
  {mode:"flow",beats:["Begin at the START terminator.","Calculate using the available input values.","Finish after displaying the result."]}
 ],
 operations:[{mode:"flow",beats:["Define the values in Python variables.","Evaluate the expression using the intended operator.","Use print() to inspect the result."]}],
 types:[
  {mode:"flow",beats:["Name the variable: score.","Associate the name with the current value.","Read the value through its variable name."]},
  {mode:"flow",beats:["An integer stores a whole number.","A float represents a real-valued decimal.","A string represents text, even when it contains digits.","A Boolean records a true/false value.","None represents the absence of a value."]},
  {mode:"flow",beats:["Start with the text '12'.","Convert its type with int().","Only then perform numerical addition."]}
 ],
 arrays:[{mode:"table",beats:["Read the positions from zero.","Select an element by its index.","The order of list values is preserved."]}],
 logic:[
  {mode:"flow",beats:["Locate the Excel workbook and its sheet.","Load the sheet with Pandas.","Inspect the resulting DataFrame.","Only then perform an analysis."]},
  {mode:"table",beats:["Each column describes a different variable.","Each row contains one complete observation.","Select the B observation to compare its variables."]},
  {mode:"table",beats:["Evaluate the score condition for each row.","True identifies a row that matches the criterion.","The selected subset preserves the original variables."]}
 ],
 conditions:[
  {mode:"flow",beats:["Start from a structured CSV file.","Load its records using read_csv().","Inspect its dimensions and first rows.","Select the variable needed for analysis."]},
  {mode:"table",beats:["Identify the observation ID.","Read the group associated with each record.","Keep the age and score attached to the same student."]}
 ],
 loops:[
  {mode:"points",beats:["Read each observed score on the number line.","Consider how the scores cluster near the center.","Choose the central-tendency measure in context."]},
  {mode:"table",beats:["Read the first observed score.","Apply the threshold to every row.","True rows form the selected subset."]}
 ],
 functions:[
  {mode:"flow",beats:["Pass the inputs a and b to the function.","Run the named calculation.","Return a reusable value to the caller."]},
  {mode:"flow",beats:["Define the function body once.","Call the function with actual arguments.","Execute the stored instructions.","Return the computed result."]},
  {mode:"flow",beats:["print() shows a value on screen.","return sends a value back for further computation."]}
 ],
 statistics:[
  {mode:"flow",beats:["Start from the five observations.","Add them to get a total of 50.","Count the five observations.","Divide 50 by 5 to obtain a mean of 10."]},
  {mode:"bars",beats:["Compare the original observations: 8, 12, 10, 14, 6.","Their sum is 50, across five values.","The equal share is 10 for every observation."]},
  {mode:"points",beats:["Locate the minimum observation: 6.","Locate the maximum observation: 14.","The span is 14 minus 6, or 8."]},
  {mode:"flow",beats:["Compute the mean of the list.","Visit each observation with a loop.","Check whether each value exceeds the mean.","Increase the counter only for matching observations."]}
 ],
 descriptive:[
  {mode:"points",beats:["Locate the ordered observations: 2, 4, 6, 8, 30.","The middle observation gives a median of 6.","The arithmetic mean is 10, pulled toward the extreme value."]},
  {mode:"bars",beats:["Group A contains values 4, 6 and 8.","Group B contains 2, 6 and 10.","Both groups average 6, but B has a greater spread."]}
 ],
 "position-outliers":[
  {mode:"box",beats:["Minimum: 2 — start from the smallest value.","Q1: 4 — the lower quartile.","Median: 6 — the central observation.","Q3: 8 — the upper quartile.","IQR = 8 − 4 = 4; upper fence = 8 + 1.5 × 4 = 14.","Value 30 lies beyond the upper fence: an outlier."]},
  {mode:"points",beats:["Observe the ordered values 10, 20, 30, 40 and 50.","At the 90th percentile, interpolate between 40 and 50.","With linear interpolation, P90 = 46."]}
 ],
 "pandas-dataframes":[
  {mode:"table",beats:["A DataFrame organizes variables into named columns.","Its rows are individual observations.","The illustrated table has shape (3, 3)."]},
  {mode:"flow",beats:["Load the comma-separated source.","Read it into a DataFrame.","Inspect columns, types and shape.","Only then select variables for analysis."]}
 ],
 "data-cleaning":[
  {mode:"table",beats:["Inspect the original score field.","Notice the missing score for record B.","Document the mean-imputation example: 80.","Check that the cleaned table preserves the record."]},
  {mode:"flow",beats:["Count the original four values.","Detect that one value is repeated.","Keep the three unique values only when appropriate."]}
 ],
 "filter-transform":[
  {mode:"table",beats:["Inspect all scores before filtering.","Evaluate score ≥ 80 for each row.","Retain the two True rows as a subset."]},
  {mode:"table",beats:["Read the original scores 70, 90 and 80.","Sort values in descending order.","Derive the new normalized score column, preserving row correspondence."]}
 ],
 "group-aggregate":[
  {mode:"bars",beats:["Group A: (70 + 90) / 2 gives a mean of 80.","Group B: (60 + 80) / 2 gives a mean of 70.","Compare both means alongside the number of records."]},
  {mode:"table",beats:["Each group names a category.","Count the records in each category.","Both illustrated groups contain two observations."]}
 ],
 visualization:[
  {mode:"flow",beats:["Use a histogram to study a distribution.","Use bars to compare categories.","Use a scatter plot to compare two numerical variables."]},
  {mode:"scatter",beats:["Read one paired observation from both axes.","Trace the next values to see the pattern.","A positive association is visible in the sample.","Association alone does not establish causality."]}
 ],
 "analyst-project":[
  {mode:"flow",beats:["State the analytical question clearly.","Load and validate the source data.","Compute the relevant evidence.","Communicate results with limitations."]},
  {mode:"scatter",beats:["Plot paired observations with labeled axes.","Inspect the direction of the relationship.","Explain uncertainty and avoid causal overclaims."]}
 ]
};
const prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)");
const el=(name,cls,text)=>{const node=document.createElement(name);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const icon=(d)=>'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="'+d+'" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/></svg>';
const ic={
 back:"M15 5l-7 7 7 7",next:"M9 5l7 7-7 7",
 play:"M8 5l11 7-11 7V5",pause:"M8 5v14M16 5v14",
 replay:"M4 11a8 8 0 1 1 2 6M4 4v7h7"
};
const ns=(tag,attrs={})=>{const n=document.createElementNS(SVG_NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const box=(n)=>{try{const r=n.getBBox();return {x:r.x,y:r.y,w:r.width,h:r.height};}catch{return null;}};
const num=(n,k)=>Number(n.getAttribute(k));
function points(svg,mode){
 if(mode==="box")return [
  {x:132,y:174,w:22,h:23},{x:175,y:140,w:22,h:90},
  {x:216,y:138,w:25,h:90},{x:258,y:140,w:24,h:90},
  {x:389,y:86,w:27,h:160},{x:732,y:167,w:30,h:33}
 ];
 if(mode==="table"){
  const candidates=[...svg.querySelectorAll("rect")].filter(n=>{
   const w=num(n,"width"),h=num(n,"height"),y=num(n,"y");
   return w>400&&w<850&&h>=88&&h<285&&y>=65;
  }).sort((a,b)=>num(b,"width")-num(a,"width"));
  const main=candidates[0];
  if(main){
   const x=num(main,"x"),y=num(main,"y"),w=num(main,"width");
   const rows=Math.max(1,Math.floor(num(main,"height")/44)-1);
   const list=[{x,y,w,h:44}];
   for(let i=0;i<rows;i++)list.push({x,y:y+44*(i+1),w,h:44});
   return list;
  }
 }
 if(mode==="points"||mode==="scatter"){
  const nodes=[...svg.querySelectorAll("circle")];
  if(nodes.length)return nodes.map(c=>({x:num(c,"cx")-15,y:num(c,"cy")-15,w:30,h:30}));
 }
 if(mode==="bars"){
  const nodes=[...svg.querySelectorAll("rect")].filter(n=>{
   const fill=n.getAttribute("fill"),w=num(n,"width"),h=num(n,"height");
   return ["#181818","#e7e7e5"].includes(fill)&&w>=45&&w<=150&&h>12&&h<220;
  });
  if(nodes.length)return nodes.map(n=>({x:num(n,"x"),y:num(n,"y"),w:num(n,"width"),h:num(n,"height")}));
 }
 const nodes=[...svg.querySelectorAll(".sv27-box")];
 if(nodes.length)return nodes.map(box).filter(Boolean);
 const circles=[...svg.querySelectorAll("circle")];
 if(circles.length)return circles.map(c=>({x:num(c,"cx")-13,y:num(c,"cy")-13,w:26,h:26}));
 return [{x:160,y:108,w:200,h:126},{x:525,y:108,w:195,h:126}];
}
function descriptionFor(fig){
 const id=fig.dataset.motionId||"";
 const [topic,portion="0"]=id.split("/");
 const scenes=sequences[topic];
 if(!scenes)return null;
 let index=0;
 if(portion.startsWith("stage-")){
  const stage=Number(portion.slice(6))||0;
  index=Math.min(scenes.length-1,Math.floor(stage/Math.ceil(12/scenes.length)));
  if(topic==="operations"||topic==="arrays")index=0;
 }else index=Math.max(0,Math.min(scenes.length-1,Number(portion)||0));
 return {topic,index,scene:scenes[index],id};
}
const instanceMap=new WeakMap();
const active=new Set();
let observer;
const observe=()=>observer||(observer=new IntersectionObserver(entries=>{
 for(const e of entries){
  const instance=instanceMap.get(e.target);
  if(!instance||instance.disposed)continue;
  instance.visible=e.isIntersecting;
  if(e.isIntersecting){
   if(!instance.manuallyTouched&&!instance.finished&&!prefersReduced.matches)instance.play(false);
  }else instance.pause(false);
 }
},{threshold:.3,rootMargin:"0px 0px -6% 0px"}));
function mount(fig){
 if(instanceMap.has(fig)||!fig.querySelector("svg"))return;
 const meta=descriptionFor(fig);
 if(!meta||!meta.scene||meta.scene.beats.length<2)return;
 const {scene}=meta;
 const svg=fig.querySelector("svg");
 const coords=points(svg,scene.mode);
 const chartNodes=scene.mode==="bars"?[...svg.querySelectorAll("rect")].filter(n=>
  ["#181818","#e7e7e5"].includes(n.getAttribute("fill"))&&num(n,"width")>=45&&num(n,"width")<=150&&num(n,"height")>12):
  (scene.mode==="points"||scene.mode==="scatter")?[...svg.querySelectorAll("circle")]:[];
 const overlay=ns("g",{"class":"sv28-overlay","aria-hidden":"true"});
 const cursor=ns("g",{"class":"sv28-focus-track"});
 const halo=ns("rect",{"class":"sv28-focus-rect","rx":11,"x":0,"y":0});
 const mark=ns("circle",{"class":"sv28-orbit","cx":0,"cy":0,"r":5});
 cursor.append(halo,mark);overlay.append(cursor);
 if(scene.mode==="box"){
  const bracket=ns("path",{"class":"sv28-iqr-bracket","d":"M186 125V104H272V125","stroke":"#111","stroke-width":"2.5","fill":"none"});
  overlay.append(bracket);
 }
 if(scene.mode==="scatter"){
  const plotCoords=coords.map(p=>(p.x+p.w/2)+","+(p.y+p.h/2));
  const trace=ns("polyline",{"class":"sv28-scatter-trace","points":plotCoords.join(" "),"fill":"none","stroke":"#222","stroke-width":"2","stroke-dasharray":"6 5"});
  overlay.append(trace);
 }
 svg.append(overlay);
 const dock=el("section","sv28-dock");
 dock.setAttribute("aria-label","Illustration playback and explanation");
 const head=el("div","sv28-dock-top");
 const title=el("span","sv28-eyebrow","MOTION LAB  /  STEP-BY-STEP MODEL");
 const count=el("span","sv28-count","01 / 03");
 head.append(title,count);
 const body=el("div","sv28-dock-body");
 const narrated=el("p","sv28-narration");
 narrated.setAttribute("aria-live","off");
 body.append(narrated);
 const nav=el("div","sv28-navigation");
 const controls=el("div","sv28-transport");
 const mkBtn=(className,html,label,fn)=>{
  const b=el("button",className);b.type="button";b.innerHTML=html;
  b.setAttribute("aria-label",label);b.title=label;b.addEventListener("click",fn);return b;
 };
 const prev=mkBtn("sv28-button",icon(ic.back),"Previous explanation step",()=>go(-1));
 const playButton=mkBtn("sv28-button sv28-button-main",icon(ic.play)+"<span>Play</span>","Play animation",()=>toggle());
 const next=mkBtn("sv28-button",icon(ic.next),"Next explanation step",()=>go(1));
 const replay=mkBtn("sv28-button",icon(ic.replay),"Replay animation",()=>replayAll());
 const speed=mkBtn("sv28-button sv28-speed","1×","Change animation speed",()=>toggleSpeed());
 controls.append(prev,playButton,next,replay,speed);
 const progress=el("div","sv28-progress");
 progress.setAttribute("role","progressbar");progress.setAttribute("aria-label","Illustration sequence progress");
 progress.setAttribute("aria-valuemin","1");progress.setAttribute("aria-valuemax",String(scene.beats.length));
 const fill=el("span","sv28-progress-fill");progress.append(fill);
 nav.append(controls,progress);
 dock.append(head,body,nav);
 const host=fig.closest(".diagram-stage,.sv27-workshop-body")||fig.parentElement;
 host.insertAdjacentElement("afterend",dock);
 let position=0,timer=null,playing=false,finished=false,manuallyTouched=false,disposed=false,visible=false,rate=1;
 const inst={fig,dock,visible,playing,finished,manuallyTouched,disposed,play,pause,dispose};
 function setStep(i,manual=false){
  if(disposed)return;
  position=Math.max(0,Math.min(scene.beats.length-1,i));
  if(manual){manuallyTouched=true;inst.manuallyTouched=true;}
  const explanation=scene.beats[position];
  narrated.textContent=explanation;
  count.textContent=String(position+1).padStart(2,"0")+" / "+String(scene.beats.length).padStart(2,"0");
  const coord=coords[scene.mode==="box"?Math.min(position,coords.length-1):position%coords.length];
  const pad=scene.mode==="table"?3:8;
  const ox=Math.max(12,coord.x-pad),oy=Math.max(53,coord.y-pad);
  const ww=Math.min(854-ox,coord.w+pad*2),hh=Math.min(270-oy,coord.h+pad*2);
  cursor.style.transform="translate("+ox+"px,"+oy+"px)";
  halo.setAttribute("width",String(Math.max(20,ww)));
  halo.setAttribute("height",String(Math.max(20,hh)));
  mark.setAttribute("cx",String(Math.max(12,ww-3)));mark.setAttribute("cy","0");
  fill.style.width=String(100*(position+1)/scene.beats.length)+"%";
  progress.setAttribute("aria-valuenow",String(position+1));
  progress.setAttribute("aria-valuetext",explanation);
  fig.dataset.motionStep=String(position+1);
  if(!prefersReduced.matches&&(manual||playing)&&typeof chartNodes[0]?.animate==="function"){
   const selected=chartNodes[position%chartNodes.length];
   const duration=Math.round(760/rate);
   if(scene.mode==="bars")selected.animate([
    {transform:"scaleY(.22)",opacity:.58},{transform:"scaleY(1)",opacity:1}
   ],{duration,easing:"cubic-bezier(.16,.82,.25,1)"});
   else selected.animate([
    {transform:"scale(.6)",opacity:.45},{transform:"scale(1.18)",opacity:1,offset:.67},
    {transform:"scale(1)",opacity:1}
   ],{duration,easing:"ease-out"});
  }
  if(scene.mode==="box"){
   const bracket=overlay.querySelector(".sv28-iqr-bracket");
   if(bracket)bracket.classList.toggle("sv28-revealed",position>=4);
  }
  if(scene.mode==="scatter"){
   const line=overlay.querySelector(".sv28-scatter-trace");
   if(line&&position===scene.beats.length-1&&!prefersReduced.matches){
    try{const len=line.getTotalLength();line.animate([
     {strokeDasharray:String(len),strokeDashoffset:String(len)},
     {strokeDasharray:String(len),strokeDashoffset:"0"}
    ],{duration:Math.round(1150/rate),easing:"ease-in-out"});}
    catch{}
   }
  }
  prev.disabled=position===0;
  next.disabled=position===scene.beats.length-1;
  if(position===scene.beats.length-1){finished=true;inst.finished=true;}
  if(!playing||manual)narrated.setAttribute("aria-live",manual?"polite":"off");
 }
 function refreshPlay(){
  playButton.innerHTML=icon(playing?ic.pause:ic.play)+"<span>"+(playing?"Pause":position===scene.beats.length-1?"Replay":"Play")+"</span>";
  playButton.setAttribute("aria-label",playing?"Pause animation":"Play animation");
  playButton.setAttribute("aria-pressed",String(playing));
 }
 function pause(manual=true){
  if(timer!==null){window.clearTimeout(timer);timer=null;}
  playing=false;inst.playing=false;
  if(manual){manuallyTouched=true;inst.manuallyTouched=true;}
  refreshPlay();
 }
 function schedule(){
  if(!playing||disposed)return;
  if(position>=scene.beats.length-1){pause(false);return;}
  timer=window.setTimeout(()=>{
   timer=null;
   if(!playing||disposed)return;
   setStep(position+1);
   schedule();
  },Math.round(1900/rate));
 }
 function play(manual=true){
  if(disposed)return;
  if(prefersReduced.matches){setStep(position+1,true);refreshPlay();return;}
  if(manual){manuallyTouched=true;inst.manuallyTouched=true;}
  if(position===scene.beats.length-1){finished=false;inst.finished=false;setStep(0);}
  pause(false);
  playing=true;inst.playing=true;refreshPlay();schedule();
 }
 function toggle(){if(playing)pause();else play();}
 function go(amount){
  pause();finished=false;inst.finished=false;
  setStep(position+amount,true);
 }
 function replayAll(){
  pause();finished=false;inst.finished=false;
  setStep(0,true);if(!prefersReduced.matches)play(true);
 }
 function toggleSpeed(){
  rate=rate===1?1.5:rate===1.5?0.75:1;
  speed.textContent=String(rate).replace(".5",".5")+"×";
  speed.setAttribute("aria-label","Animation speed "+rate+" times");
  if(playing){if(timer!==null)window.clearTimeout(timer);schedule();}
 }
 function dispose(){
  if(disposed)return;
  disposed=true;inst.disposed=true;
  pause(false);observer?.unobserve(fig);
  overlay.remove();dock.remove();active.delete(inst);
 }
 instanceMap.set(fig,inst);
 active.add(inst);
 refreshPlay();setStep(0);
 // Controls stay usable under reduced motion; auto-play is intentionally disabled.
 if(!prefersReduced.matches){observe().observe(fig);}
 else{title.textContent="MOTION LAB  /  INTERACTIVE STEP-BY-STEP";playButton.title="Next frame (reduced motion)";}
}
function scan(){
 for(const figure of document.querySelectorAll(".sv27-figure[data-motion-id]"))mount(figure);
 for(const inst of [...active])if(!inst.fig.isConnected)inst.dispose();
}
function init(){
 scan();
 const stage=document.querySelector(".sv27-workshop-body");
 if(stage){
  new MutationObserver(()=>{
   for(const inst of [...active])if(!inst.fig.isConnected)inst.dispose();
   scan();
  }).observe(stage,{childList:true});
 }
 document.addEventListener("visibilitychange",()=>{if(document.hidden)for(const inst of active)inst.pause(false);});
 if(prefersReduced.addEventListener)prefersReduced.addEventListener("change",()=>{if(prefersReduced.matches)for(const inst of active)inst.pause(false);});
 window.IJR_MOTION_LAB={version:2,stories:Object.keys(sequences).length,count:()=>active.size};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();