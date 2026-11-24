import * as THREE from 'three';
import {animateIslandAvatar} from './island-avatar.mjs';
import {horizontalStep} from './island-vertical.mjs';
import {bounds,landmarks,floorKey,floorPlan,indoorSafe,indoorRoute,nearestInteriorAction} from './island-interiors.mjs';
// Cutaway interior scenes are created only when visited. The exterior world is
// retained untouched, and the same WebGL renderer is reused.
export function createInterior({building,makeHero,available,marks,textures,initialFloor=1,onState,onTalk,onRoom,onExit,onVisit}){
 let scene,camera,hero,npc,plan,position,route=[],floor=1,gait=0,pace=0,lastState='',disposed=false,velocity={x:0,z:0},projectionAspect=0;
 const input=new THREE.Vector3();
 const materialCache=new Map(),geometryCache=new Map();
 const mats=(color,map=null,emissive=false)=>{
  const k=color+':'+(map?.uuid??'')+':'+emissive;
  if(!materialCache.has(k))materialCache.set(k,new THREE.MeshStandardMaterial({color,map,roughness:.85,emissive:emissive?color:'#000000',emissiveIntensity:emissive?.55:0}));
  return materialCache.get(k);
 };
 function box(w,h,d,x,y,z,color,map=null,emissive=false){
  const k=[w,h,d].join(',');
  if(!geometryCache.has(k))geometryCache.set(k,new THREE.BoxGeometry(w,h,d));
  const m=new THREE.Mesh(geometryCache.get(k),mats(color,map,emissive));m.position.set(x,y,z);scene.add(m);return m;
 }
 let portalRing,ground,stairMarker;
 const ownedTextures=new Set();
 function sign(text,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#142c35e8';ctx.roundRect(4,4,504,88,14);ctx.fill();ctx.strokeStyle='#d2b77b';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#f6e8c8';ctx.font='bold 35px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48,478);const t=new THREE.CanvasTexture(c);ownedTextures.add(t);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sprite.scale.set(3.2,.60,1);sprite.position.set(x,y,z);scene.add(sprite);return sprite;}

 function destroyFloor(){
  if(!scene)return;
  const geo=new Set(),mat=new Set();
  scene.traverse(o=>{if(o.geometry)geo.add(o.geometry);if(o.material)mat.add(o.material);});
  geo.forEach(g=>g.dispose());mat.forEach(m=>m.dispose());ownedTextures.forEach(t=>t.dispose());ownedTextures.clear();geometryCache.clear();materialCache.clear();
 }
 function build(next,fromStairs=false){
  destroyFloor();floor=next;plan=floorPlan(building,floor);scene=new THREE.Scene();scene.background=new THREE.Color('#293b43');
  scene.add(new THREE.HemisphereLight('#fff4db','#7892a0',2.2));
  const sun=new THREE.DirectionalLight('#fff0ce',2.1);sun.position.set(-4,9,7);scene.add(sun);
  projectionAspect=0;camera=new THREE.OrthographicCamera(-9,9,8,-8,.1,70);camera.position.set(0,15,15);camera.lookAt(0,.5,-.3);
  const {theme}=plan,wood='#967651',dark='#51483f',gold='#d8bb80',stone='#b0a799',glow='#fce0a1';
  ground=box(11.25,.22,13.25,0,-.12,0,wood,textures.wood);
  for(let z=-6;z<6.4;z+=.65)box(10.8,.018,.025,0,.004,z,'#6f5945');
  // Rear and side walls are fully modeled; the near wall is cut away for play.
  box(11.25,3.45,.30,0,1.72,-6.55,theme.color,textures.stone);
  for(const s of [-1,1]){
   box(.30,3.45,13.1,s*5.6,1.72,0,theme.color,textures.stone);
   box(.39,.24,13.1,s*5.51,.12,0,dark);
   box(.42,.20,13.1,s*5.51,3.38,0,gold);
   box(4.1,.55,.27,s*3.5,.27,6.55,theme.color,textures.stone);
   for(const z of [-4.5,0,4.5]){box(.16,1.5,1.55,s*5.40,2,z,dark);box(.18,1.22,1.27,s*5.30,2,z,glow,null,true);box(.22,1.22,.05,s*5.18,2,z,dark);}
  }
  box(11.1,.24,.42,0,.12,-6.38,dark);box(11.1,.20,.42,0,3.38,-6.38,gold);
  for(const x of [-3.5,3.5]){box(1.85,1.4,.12,x,2,-6.36,dark);box(1.57,1.15,.13,x,2,-6.26,glow,null,true);box(.07,1.15,.16,x,2,-6.15,dark);}
  // Walkable rug and tile border.
  box(3.4,.025,7.4,0,.018,.1,theme.color);
  for(const x of [-1.65,1.65])box(.09,.03,7.25,x,.034,.1,gold);
  for(const z of [-3.5,3.7])box(3.25,.03,.09,0,.034,z,gold);
  for(const o of plan.obstacles){
   if(o.type==='shelf'){
    // Open-front bookshelf: the books sit inside the actual shelf rather than inside a solid block.
    box(.15,2.5,o.hz*2,o.x-o.hx+.075,1.25,o.z,dark,textures.wood);
    for(const side of [-1,1])box(o.hx*2,2.5,.14,o.x,1.25,o.z+side*(o.hz-.07),dark,textures.wood);
    box(o.hx*2,.13,o.hz*2,o.x,2.45,o.z,wood,textures.wood);
    for(let y=.5;y<2.4;y+=.58){
     box(1.55,.09,3.3,o.x,y,o.z,wood);
     for(let i=0;i<7;i++){const z=o.z-1.34+i*.4,h=.27+(i%3)*.06;box(.52,h,.28,o.x+.28,y+h/2+.05,z,['#b36d50','#5d8f91','#bdad64','#7980a5'][i%4]);}
    }
   }else if(o.type==='table'||o.type==='workbench'){
    box(o.hx*2,.14,o.hz*2,o.x,.92,o.z,wood,textures.wood);
    for(const dx of [-1,1])for(const dz of [-1,1])box(.14,.86,.14,o.x+dx*(o.hx-.17),.43,o.z+dz*(o.hz-.17),dark);
    if(o.type==='workbench'){
     for(let i=0;i<4;i++){const z=o.z-1.05+i*.65;box(.48,.21,.45,o.x,.1+1,z,theme.color);box(.26,.10,.27,o.x,1.28,z,gold);}
    }else{box(.7,.06,.55,o.x,1.03,o.z,'#eee1c1');box(.05,.07,.5,o.x,1.07,o.z,dark);}
   }else if(o.type==='crate'){box(1.2,1.0,1.2,o.x,.5,o.z,wood,textures.wood);box(1.22,.10,1.22,o.x,.84,o.z,gold);for(const side of [-1,1])box(.10,1.02,1.23,o.x+side*.43,.51,o.z,dark);}
  }
  // Six distinct prop families, placed against walls, away from the movement lane.
  const px=2.2,pz=-5.65;
  if(theme.props==='garden'){
   for(let i=0;i<3;i++){box(.45,.48,.45,px+i*.75,.24,pz,'#8d6549');box(.65,.7,.65,px+i*.75,.85,pz,'#588856');}
  }else if(theme.props==='forge'){
   box(1.45,1.0,.9,px,.5,pz,'#57626a');box(.9,.34,.62,px,1.18,pz,'#e5a05d',null,true);
  }else if(theme.props==='lab'||theme.props==='workshop'){
   for(let i=0;i<3;i++){box(.44,1.25,.45,px+i*.62,.63,pz,'#667983');box(.31,.45,.35,px+i*.62,1.5,pz,'#76d5dc',null,true);}
  }else{
   box(1.6,.78,.8,px,.39,pz,wood);for(let i=0;i<4;i++)box(.32,.12,.51,px-.55+i*.34,.86,pz,['#a96e55','#65928a','#bfaa72'][i%3]);
  }
  for(const x of [-2.1,2.1]){box(.14,1.3,.14,x,.65,-5.8,dark);box(.40,.42,.40,x,1.42,-5.8,glow,null,true);}
  portalRing=null;stairMarker=null;
  if(plan.room!==null){
   const color=marks.has(plan.room)?'#f7cb67':available(plan.room)?'#7beacb':'#829097';
   box(2.7,.23,1.6,0,.12,-4.9,'#63757a');box(.37,2.7,.5,-1.22,1.35,-5.4,gold);box(.37,2.7,.5,1.22,1.35,-5.4,gold);box(2.8,.33,.55,0,2.74,-5.4,gold);
   portalRing=new THREE.Mesh(new THREE.TorusGeometry(.95,.11,12,40),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8}));portalRing.position.set(0,1.45,-5.18);scene.add(portalRing);sign('ROOM '+String(plan.room+1).padStart(2,'0'),0,3.16,-5.15);
  }
  if(plan.stairs){
   for(let i=0;i<6;i++)box(1.4,.12+i*.15,.32,4.15,(.12+i*.15)/2,-4.15-i*.27,dark,textures.wood);
   stairMarker=box(1.65,.045,1.4,4.15,.04,-3.65,'#d7ba77',null,true);sign(floor===1?'UPSTAIRS':'DOWNSTAIRS',4.15,1.95,-4.05);
  }
  if(plan.exit){box(2.1,.05,1.0,0,.05,5.5,'#81b5a4',null,true);box(.17,2.5,.20,-1.1,1.25,6.32,gold);box(.17,2.5,.20,1.1,1.25,6.32,gold);box(2.38,.18,.22,0,2.5,6.32,gold);}
  hero=makeHero();scene.add(hero);
  npc=makeHero({style:'guardian',skin:'#c29a78',armor:theme.color,hair:'#3c3430',cape:'#b4a27f',accessory:'satchel',height:96,build:94});npc.position.set(plan.npc.x,0,plan.npc.z);scene.add(npc);sign(plan.npc.name,plan.npc.x,2.65,plan.npc.z);
  position=new THREE.Vector3(fromStairs?landmarks.stairs.x:0,0,fromStairs?landmarks.stairs.z:landmarks.entry.z);
  hero.position.copy(position);hero.rotation.y=Math.PI;route=[];gait=pace=0;velocity={x:0,z:0};lastState='';onVisit?.(floorKey(building.id,floor));publish();
 }
 function state(){return {id:building.id,name:building.name,floor,totalFloors:building.storeys,room:plan.room,available:plan.room!==null&&available(plan.room),npc:plan.npc.name,action:nearestInteriorAction(plan,position),x:Math.round(position.x*10)/10,z:Math.round(position.z*10)/10};}
 function publish(){const s=state(),signature=JSON.stringify(s);if(signature!==lastState){lastState=signature;onState?.(s);}}
 function walkTo(id){
  const target={talk:landmarks.npc,exit:landmarks.exit,stairs:landmarks.stairs,room:landmarks.portal}[id];
  if(!target||(id==='room'&&plan.room===null)||(id==='exit'&&!plan.exit)||(id==='stairs'&&!plan.stairs))return false;
  route=indoorRoute(plan,position,target);return route.length>0;
 }
 function interact(id=nearestInteriorAction(plan,position)){
  if(!id||nearestInteriorAction(plan,position)!==id)return false;
  if(id==='talk'){onTalk?.(plan.npc);return true;}
  if(id==='stairs'&&plan.stairs){build(floor===1?2:1,true);return true;}
  if(id==='exit'&&plan.exit){onExit?.();return true;}
  if(id==='room'&&plan.room!==null&&available(plan.room)){onRoom?.(plan.room);return true;}
  return false;
 }
 const ray=new THREE.Raycaster();
 function click(x,y){
  ray.setFromCamera(new THREE.Vector2(x,y),camera);const hit=ray.intersectObject(ground)[0];
  if(hit&&indoorSafe(plan,hit.point.x,hit.point.z))route=indoorRoute(plan,position,hit.point);
 }
 function frame({renderer,width,height,delta,now,keys,controls}){
  if(disposed)return;
  input.set(0,0,0);
  for(const k of keys){const v=controls[k];if(v){input.x+=v[0];input.z+=v[1];}}
  if(input.lengthSq()>0)route=[];
  if(route.length){input.set(route[0].x-position.x,0,route[0].z-position.z);if(input.length()<.09){route.shift();input.set(0,0,0);}}
  const d=input.length(),speed=keys.has('Shift')?5.5:route.length?5.5:3.8;
  input.normalize();
  if(route.length){const step=Math.min(d,speed*delta);velocity={x:delta?input.x*step/delta:0,z:delta?input.z*step/delta:0};}
  else velocity=horizontalStep(velocity,input,speed,true,delta);
  const nx=position.x+velocity.x*delta,nz=position.z+velocity.z*delta;
  if(indoorSafe(plan,nx,position.z))position.x=nx;else velocity.x=0;
  if(indoorSafe(plan,position.x,nz))position.z=nz;else velocity.z=0;
  const actual=Math.hypot(velocity.x,velocity.z),moving=actual>.08;
  if(moving){const yaw=Math.atan2(velocity.x,velocity.z);hero.rotation.y+=Math.atan2(Math.sin(yaw-hero.rotation.y),Math.cos(yaw-hero.rotation.y))*(1-Math.exp(-delta*13));}
  hero.position.copy(position);pace+=(Math.min(1,actual/3.8)-pace)*(1-Math.exp(-delta*12));gait+=delta*actual*2.7;
  animateIslandAvatar(hero,{time:now/1000,delta,pace,mode:moving?(actual>4.5?'run':'walk'):'idle',phase:gait});
  npc.rotation.y=Math.atan2(position.x-npc.position.x,position.z-npc.position.z);
  animateIslandAvatar(npc,{time:now/1000,delta,mode:'idle'});
  if(portalRing){portalRing.rotation.z=now*.0006;portalRing.position.y=1.45+.10*Math.sin(now*.003);}
  if(stairMarker)stairMarker.material.emissiveIntensity=.4+.18*Math.sin(now*.003);
  const aspect=width/height;if(aspect!==projectionAspect){projectionAspect=aspect;const extent=Math.max(8.0,6.5/aspect);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();}
  publish();renderer.render(scene,camera);
 }
 build(initialFloor,initialFloor===2);
 return {frame,click,state,walkTo,interact,dispose(){disposed=true;destroyFloor();}};
}
