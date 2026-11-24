// Original radial equipment interface. The world remains the authority for unlocks.
export const gearItems=[
 {id:'dash',label:'Dash',icon:'↯',key:'X',type:'power',description:'A quick burst in your facing direction.'},
 {id:'fly',label:'Flight',icon:'↑',key:'V',type:'power',description:'Toggle sustained flight.'},
 {id:'grapple',label:'Tether',icon:'⌁',key:'T',type:'power',description:'Attach to an anchor or release the tether.'},
 {id:'jetpack',label:'Jetpack',icon:'⇈',key:'J',type:'power',description:'Toggle thrusters. Space rises, C descends.'},
 {id:'rover',label:'Rover',icon:'▣',key:'M',type:'vehicle',description:'Explore in the four-wheel rover.'},
 {id:'bike',label:'Trail bike',icon:'◎',key:'M',type:'vehicle',description:'Explore the island on two wheels.'},
 {id:'hover',label:'Hoverboard',icon:'≋',key:'M',type:'vehicle',description:'Requires the hoverboard licence.'},
 {id:'wall',label:'Wall run',icon:'▥',key:'B',type:'power',description:'Run along the marked violet wall.'}
];
export function gearStatus(item,a,m){
 if(item.type==='vehicle'){
  if(item.id==='hover'&&!m.skills.includes('hover'))return 'locked';
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
 let opened=false,held=false,selected=-1,states=[],previousFocus=null;
 const nodes=gearItems.map((item,i)=>{
  const el=document.createElement('button');el.type='button';el.className='gearSlot';el.dataset.gear=item.id;
  const angle=i*Math.PI*2/gearItems.length;
  el.style.setProperty('--sx',String(Math.sin(angle)));el.style.setProperty('--sy',String(-Math.cos(angle)));
  const icon=document.createElement('span');icon.className='gearIcon';icon.textContent=item.icon;icon.setAttribute('aria-hidden','true');
  const name=document.createElement('strong');name.textContent=item.label;
  const status=document.createElement('small');status.className='gearStatus';el.append(icon,name,status);ring.append(el);
  el.addEventListener('pointerenter',()=>choose(i));el.addEventListener('focus',()=>choose(i));
  el.addEventListener('click',()=>{choose(i);close(true);});return el;
 });
 function choose(i){
  selected=i;for(const [j,node] of nodes.entries())node.setAttribute('aria-pressed',String(i===j));
  if(i<0){title.textContent='Equipment';detail.textContent='Point at a slot, then release Tab. Esc cancels.';return;}
  const item=gearItems[i],state=states[i];title.textContent=item.label;
  detail.textContent=state==='locked'?(item.type==='power'?'Locked · select to locate its unlock site.':'Locked · complete the required sector.'):state==='unavailable'?'Park your vehicle or finish the lift first.':state==='cooldown'?'Recharging · try again shortly.':item.type==='vehicle'?(state==='active'?'Park / dismount current vehicle.':'Mount nearby or walk to the closest available vehicle.'):item.description+' · '+item.key;
 }
 function refresh(){
  const w=getWorld();if(!w)return;
  const a=w.adventureState(),m=w.mobilityState();states=gearItems.map(i=>gearStatus(i,a,m));
  for(const [i,node] of nodes.entries()){node.dataset.state=states[i];node.querySelector('.gearStatus').textContent=states[i]==='ready'?'Available':states[i]==='active'?'Active':states[i]==='locked'?'Locked':states[i]==='cooldown'?'Recharging':'Unavailable';}
  for(const el of panel.querySelectorAll('[data-wheel-action]')){
   const id=el.dataset.wheelAction;el.disabled=id==='transfer'?!(a.grappling&&a.nextAnchor):id==='gate'?!a.gate||!!m.vehicle:id==='frontier'?!m.canLift:id==='brake'||id==='vehicle'?!m.vehicle:false;
  }
 }
 function open(hold=false){
  const w=getWorld();if(!picker.open||!w||w.interiorState()||canvas.closest('[hidden]'))return false;
  if(opened)return true;
  previousFocus=document.activeElement;opened=true;held=hold;w.clearGearInput();refresh();choose(-1);
  panel.hidden=false;button.setAttribute('aria-expanded','true');picker.dataset.gearOpen='true';if(!hold)panel.focus();return true;
 }
 function close(commit=false,restoreFocus=true){
  if(!opened)return;
  const w=getWorld(),i=selected,state=states[i];opened=false;held=false;panel.hidden=true;button.setAttribute('aria-expanded','false');picker.dataset.gearOpen='false';w?.clearGearInput();
  if(restoreFocus&&picker.open)(previousFocus===button?button:canvas).focus();
  if(!commit||i<0||!w)return;
  const item=gearItems[i];
  if(state==='cooldown'||state==='unavailable'){onMessage?.('Equipment unavailable in the current movement state.');return;}
  if(state==='locked'){if(item.type==='power'){if(!w.locateAdventure(item.id))onMessage?.('Return to ground to locate the unlock site.');}else onMessage?.('Complete the required sector to unlock the hoverboard.');return;}
  if(item.type==='vehicle'){if(!w.selectVehicleType(item.id))onMessage?.('Return to ground or park your current vehicle first.');}
  else w.action(item.id);
 }
 button.onclick=()=>opened?close(false):open(false);
 panel.querySelector('#gearCancel').onclick=()=>close(false);
 for(const el of panel.querySelectorAll('[data-wheel-action]'))el.onclick=()=>{const action=el.dataset.wheelAction;close(false);getWorld()?.action(action);};
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
