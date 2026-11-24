// Original radial equipment interface. The world remains the authority for unlocks.
export const gearItems=[
 {id:'dash',label:'Dash',icon:'↯',key:'X',type:'power',description:'A quick burst in your facing direction.'},
 {id:'fly',label:'Flight',icon:'↑',key:'V',type:'power',description:'Toggle sustained flight.'},
 {id:'grapple',label:'Tether',icon:'⌁',key:'T',type:'power',description:'Attach to an anchor or release the tether.'},
 {id:'jetpack',label:'Jetpack',icon:'⇈',key:'J',type:'power',description:'Toggle thrusters. Space rises, C descends.'},
 {id:'rover',label:'Rover',icon:'▣',key:'M',type:'vehicle',description:'Explore in the four-wheel rover.'},
 {id:'bike',label:'Trail bike',icon:'◎',key:'M',type:'vehicle',description:'Explore the island on two wheels.'},
 {id:'hover',label:'Hoverboard',icon:'≋',key:'M',type:'vehicle',description:'Glide along the ground on a personal hoverboard.'},
 {id:'wall',label:'Wall run',icon:'▥',key:'B',type:'power',description:'Run along the marked violet wall.'}
];
export function gearStatus(item,a,m){
 if(item.type==='vehicle'){
  if(item.id==='hover'&&!(m.availableSkills??m.skills).includes('hover'))return 'locked';
  if(m.type===item.id)return 'active';
  return m.vehicle||m.lifting?'unavailable':'ready';
 }
 if(!a.powers.includes(item.id))return 'locked';
 const active={fly:a.flying,wall:a.wallRunning,grapple:a.grappling,jetpack:a.jetting}[item.id];
 if(active)return 'active';
 if(m.vehicle||m.lifting)return 'unavailable';
 if(item.id==='dash'&&!a.dashReady)return 'cooldown';
 if(item.id==='fly'&&a.flight<.5||item.id==='jetpack'&&a.jetFuel<.5)return 'cooldown';
 return 'ready';
}
export function radialIndex(dx,dy,count=gearItems.length){
 if(Math.hypot(dx,dy)<25)return -1;
 return Math.round((Math.atan2(dx,-dy)+Math.PI*2)/(Math.PI*2/count))%count;
}
export function createGearWheel({picker,canvas,button,panel,getWorld,onMessage}){
 const ring=panel.querySelector('.gearRing'),title=panel.querySelector('#gearTitle'),detail=panel.querySelector('#gearDetail');
 let opened=false,held=false,selected=-1,states=[],previousFocus=null,animation=null,snapshot=null;
 const dial=ring.querySelector('.gearDial'),ns='http://www.w3.org/2000/svg';
 const glyphs={dash:'M14 2 4 14h8l-2 8 10-12h-8z',fly:'M12 20V4m-7 7 7-7 7 7M3 18h4m10 0h4',grapple:'M8 14 4 10l5-5 5 5m-4 4 4 4 6-6M4 10v5l5 5',jetpack:'M9 4h6v12H9zM4 9h3v9H4zm13 0h3v9h-3zM10 19l2 3 2-3',rover:'M3 10l3-5h12l3 5v8H3zM3 11h18M6 18v3m12-3v3M7 14h2m6 0h2',bike:'M7 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0M25 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0M3 17l6-9 5 9H3m11 0 3-11h3m-13 2h5',hover:'M3 14h18l-3 4H6zM5 21h4m6 0h4M12 3v7m-4-4h8',wall:'M18 3v18M4 6l4 4 5-4M8 10l-2 6 5 4m-3-10 6 5'};
 function point(r,t){return [200+r*Math.sin(t),200-r*Math.cos(t)].join(' ');}
 const arcs=gearItems.map((item,i)=>{const t=i*Math.PI/4,l=t-Math.PI/8+.018,h=t+Math.PI/8-.018,p=document.createElementNS(ns,'path');p.setAttribute('d','M '+point(190,l)+' A 190 190 0 0 1 '+point(190,h)+' L '+point(86,h)+' A 86 86 0 0 0 '+point(86,l)+' Z');p.setAttribute('class','gearWedge');p.dataset.type=item.type;dial.append(p);return p;});
 const nodes=gearItems.map((item,i)=>{
  const el=document.createElement('button');el.type='button';el.className='gearSlot';el.dataset.gear=item.id;
  const angle=i*Math.PI*2/gearItems.length;
  el.style.setProperty('--slot',String(i));el.dataset.type=item.type;el.style.setProperty('--sx',String(Math.sin(angle)));el.style.setProperty('--sy',String(-Math.cos(angle)));
  const icon=document.createElement('span');icon.className='gearIcon';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','-1 0 26 24');const path=document.createElementNS(ns,'path');path.setAttribute('d',glyphs[item.id]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.6');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);icon.append(svg);icon.setAttribute('aria-hidden','true');
  const name=document.createElement('strong');name.textContent=item.label;
  const status=document.createElement('small');status.className='gearStatus';el.append(icon,name,status);ring.append(el);
  el.addEventListener('pointerenter',()=>choose(i));el.addEventListener('focus',()=>choose(i));
  el.addEventListener('click',()=>{choose(i);close(true);});return el;
 });
 function choose(i){
  if(selected===i&&title.textContent!=='Equipment'&&i>=0)return;
  selected=i;for(const [j,node] of nodes.entries()){node.setAttribute('aria-pressed',String(i===j));arcs[j].classList.toggle('selected',i===j);}
  const category=panel.querySelector('#gearCategory'),energy=panel.querySelector('#gearEnergy');energy.hidden=true;category.textContent=i<0?'SELECT EQUIPMENT':gearItems[i].type.toUpperCase();
  if(i<0){title.textContent='Equipment';detail.textContent='Point at a slot, then release Tab. Esc cancels.';return;}
  const item=gearItems[i],state=states[i];title.textContent=item.label;
  if(item.id==='fly'||item.id==='jetpack'){energy.hidden=false;const value=item.id==='fly'?snapshot.flight/6:snapshot.jetFuel/9;energy.firstElementChild.style.width=(Math.max(0,Math.min(1,value))*100)+'%';}
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){title.animate([{opacity:.35,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:145,easing:'ease-out'});}
  detail.textContent=state==='locked'?(item.type==='power'?'Locked · select to locate its unlock site.':'Locked · complete the required sector.'):state==='unavailable'?'Park your vehicle or finish the lift first.':state==='cooldown'?'Recharging · try again shortly.':item.type==='vehicle'?(state==='active'?'Park / dismount current vehicle.':'Mount nearby or walk to the closest available vehicle.'):item.description+' · '+item.key;
 }
 function refresh(){
  const w=getWorld();if(!w)return;
  const a=w.adventureState(),m=w.mobilityState();snapshot=a;states=gearItems.map(i=>gearStatus(i,a,m));
  for(const [i,node] of nodes.entries()){node.dataset.state=states[i];node.querySelector('.gearStatus').textContent=states[i]==='ready'?'Available':states[i]==='active'?'Active':states[i]==='locked'?'Locked':states[i]==='cooldown'?'Recharging':'Unavailable';}
  for(const el of panel.querySelectorAll('[data-wheel-action]')){
   const id=el.dataset.wheelAction;el.disabled=id==='transfer'?!(a.grappling&&a.nextAnchor):id==='gate'?!a.gate||!!m.vehicle:id==='frontier'?!m.canLift:id==='brake'||id==='vehicle'?!m.vehicle:false;
  }
 }
 function open(hold=false){
  const w=getWorld();if(!picker.open||!w||w.interiorState()||canvas.closest('[hidden]'))return false;
  if(opened)return true;
  const shortcuts=picker.querySelector('.adventureHotbar');if(shortcuts)shortcuts.open=false;
  previousFocus=document.activeElement;opened=true;held=hold;w.clearGearInput();refresh();choose(-1);
  animation?.cancel();panel.hidden=false;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)animation=panel.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});
  button.setAttribute('aria-expanded','true');picker.dataset.gearOpen='true';if(!hold)panel.focus();return true;
 }
 function close(commit=false,restoreFocus=true,gameFocus=commit){
  if(!opened)return;
  const w=getWorld(),i=selected,state=states[i];opened=false;held=false;animation?.cancel();panel.hidden=true;button.setAttribute('aria-expanded','false');picker.dataset.gearOpen='false';w?.clearGearInput();
  if(restoreFocus&&picker.open)(gameFocus||previousFocus!==button?canvas:button).focus();
  if(!commit||i<0||!w)return;
  const item=gearItems[i];
  if(state==='cooldown'||state==='unavailable'){onMessage?.('Equipment unavailable in the current movement state.');return;}
  if(state==='locked'){if(item.type==='power'){if(!w.locateAdventure(item.id))onMessage?.('Return to ground to locate the unlock site.');else onMessage?.('Following route to unlock '+item.label+'.');}else onMessage?.('Complete the required sector to unlock the hoverboard.');return;}
  if(item.type==='vehicle'){if(!w.selectVehicleType(item.id))onMessage?.('Return to ground or park your current vehicle first.');}
  else w.selectGearPower(item.id);
 }
 button.onclick=()=>opened?close(false):open(false);
 panel.querySelector('#gearCancel').onclick=()=>close(false);
 for(const el of panel.querySelectorAll('[data-wheel-action]'))el.onclick=()=>{const action=el.dataset.wheelAction;close(false,true,true);getWorld()?.action(action);};
 ring.addEventListener('pointermove',event=>{
  if(!held||event.pointerType==='touch')return;
  const rect=ring.getBoundingClientRect();choose(radialIndex(event.clientX-rect.left-rect.width/2,event.clientY-rect.top-rect.height/2));
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Tab'&&!event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&document.activeElement===canvas&&!opened){if(open(true)){event.preventDefault();event.stopImmediatePropagation();}return;}
  if(!opened)return;
  if(event.key==='Tab'&&held){event.preventDefault();event.stopImmediatePropagation();return;}
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close(false);return;}
  if(event.key==='Enter'&&(held||document.activeElement===panel)){event.preventDefault();event.stopImmediatePropagation();close(true);return;}
  if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key)){
   event.preventDefault();event.stopImmediatePropagation();const step=event.key==='ArrowRight'||event.key==='ArrowDown'?1:-1;choose(selected<0?0:(selected+step+nodes.length)%nodes.length);return;
  }
  if(held){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 document.addEventListener('keyup',event=>{if(event.key==='Tab'&&opened&&held){event.preventDefault();event.stopImmediatePropagation();close(true);}},true);
 picker.addEventListener('close',()=>close(false,false));
 window.addEventListener('blur',()=>close(false,false));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)close(false,false);});
 return {isOpen:()=>opened,cancel:()=>close(false,false)};
}
