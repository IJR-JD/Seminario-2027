// Shared quality and interaction policy. No DOM or WebGL dependency in the pure rules.
export const qualityModes=['auto','sharp','performance'];
export function renderRatio(mode,dpr,width,height,adaptive=1.5){
 const preferred=mode==='performance'?1:mode==='sharp'?Math.max(2,dpr):Math.max(1,Math.min(2,adaptive));
 const budget=mode==='sharp'?6500000:mode==='performance'?2300000:3600000;
 return Math.max(.85,Math.min(preferred,Math.sqrt(budget/Math.max(1,width*height)),2.5));
}
export function createRenderQuality(renderer,canvas){
 let mode='auto',width=0,height=0,ratio=0,adaptive=1.5,ema=16.7,frames=0,last=0,checked=0,slow=0,fast=0;
 try{const saved=localStorage.getItem('cq-render-quality');if(qualityModes.includes(saved))mode=saved;}catch{}
 function resize(w,h){
  if(w<=0||h<=0)return;
  const next=Math.round(renderRatio(mode,globalThis.devicePixelRatio||1,w,h,adaptive)*100)/100;
  if(next===ratio&&w===width&&h===height)return;
  if(next!==ratio){renderer.setPixelRatio(next);ratio=next;}
  renderer.setSize(w,h,false);width=w;height=h;
  canvas.dataset.renderRatio=String(ratio);canvas.dataset.quality=mode;
 }
 function tick(now,w,h){
  if(last&&now-last<250){ema+=(now-last-ema)*.06;frames++;}else{frames=0;slow=fast=0;}
  last=now;
  if(now-checked>1800&&frames>20){
   checked=now;canvas.dataset.frameMs=ema.toFixed(1);
   if(mode==='auto'){
    if(ema>27){slow++;fast=0;}else if(ema<17.8){fast++;slow=0;}else slow=fast=0;
    if(slow>=2){adaptive=Math.max(1,adaptive-.25);slow=0;}
    if(fast>=3){adaptive=Math.min(2,adaptive+.25);fast=0;}
   }
  }
  resize(w,h);
 }
 function setMode(next){if(!qualityModes.includes(next))return;mode=next;adaptive=1.5;slow=fast=0;try{localStorage.setItem('cq-render-quality',next);}catch{}resize(width,height);}
 return {resize,tick,setMode,mode:()=>mode};
}
export function contextAction(s){
 if(s.lifting)return {key:'',text:'Lift in motion'};
 if(s.riding)return {key:'M',text:s.parking?'Dismount when stopped':'Park / dismount'};
 if(s.portal!==undefined)return s.available?{key:'Enter',text:'Enter '+s.title}:{key:'',text:'Locked · '+(s.requirement||'complete its prerequisite rooms')};
 if(s.building)return {key:'H',text:'Enter building'};
 if(s.gate)return {key:'G',text:'Travel through gate'};
 if(s.ladder)return {key:'F',text:'Climb / descend'};
 if(s.parkour)return {key:'Space',text:'Jump toward the highlighted deck · K assisted jump'};
 if(s.vehicle)return {key:'M',text:'Mount vehicle'};
 if(s.guide)return {key:'R',text:'Talk to '+s.guide};
 if(s.route)return {key:'',text:'Following route · WASD to take control'};
 return null;
}
export function labelBudget(entries,{map=false,limit=7}={}){
 return entries.filter(e=>map?e.major:e.distance<=24&&e.visible!==false).sort((a,b)=>a.distance-b.distance).slice(0,map?10:limit).map(e=>e.id);
}
export function toastAllowed(previous,message,now){return !previous||previous.message!==message||now-previous.time>=6500;}
