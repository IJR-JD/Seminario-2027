// Stable building identities, interior layouts and navigation independent of WebGL.
import {allRoomLocations,villageHouses} from './island-villages.mjs';
export const interiorStorage='cq-interiors-v6';
export const themes=[
 {name:'Explorer Guild',color:'#698d72',role:'Pathfinder',hint:'A variable stores a value. Change the value, then predict how far the avatar moves.',props:'library'},
 {name:'Sunstone Archive',color:'#c69b66',role:'Archivist',hint:'A phase gate changes state. Check the current phase before choosing the next action.',props:'archive'},
 {name:'Aether Workshop',color:'#6e9db7',role:'Flight Engineer',hint:'Track flight range and the order of relays before you start moving.',props:'workshop'},
 {name:'Signal Conservatory',color:'#638a72',role:'Signal Keeper',hint:'Use a condition to decide whether a route is safe. Compare sensor values first.',props:'garden'},
 {name:'Clockwork Laboratory',color:'#8e83aa',role:'Mechanic',hint:'Nested decisions evaluate one condition inside another. Trace each branch separately.',props:'lab'},
 {name:'Ember Forge',color:'#b97965',role:'Forge Master',hint:'Read the trap state and choose the correct ability before crossing a dangerous tile.',props:'forge'}
];
const names=['Ari','Mira','Rowan','Lio','Nora','Tess','Kai','Iris','Remy','Sage'];
export const buildings=[
 ...allRoomLocations().map((lot,i)=>({...lot,id:'room-'+String(i+1).padStart(2,'0'),room:i,name:themes[lot.zoneIndex].name+' '+String(i+1).padStart(2,'0')})),
 ...villageHouses.map((lot,i)=>({...lot,zoneIndex:lot.zone,storeys:2,upper:false,id:'hall-'+(i+1),name:themes[lot.zone].name+' · '+['Common Hall','Reading Room','Supply Lodge','Archive Hall','Hangar','Greenhouse','Observatory','Foundry Hall'][i]}))
];
export const bounds={x:5.4,z:6.4};
export const landmarks={entry:{x:0,z:5.2},exit:{x:0,z:5.5},stairs:{x:4.15,z:-3.65},portal:{x:0,z:-4.65},npc:{x:-3.15,z:-1.8},desk:{x:-3.5,z:-3.5}};
export const floorKey=(id,floor)=>id+':'+floor;
export function floorPlan(building,floor){
 const theme=themes[building.zoneIndex];
 if(!theme)throw Error('Invalid interior building');
 if(!Number.isInteger(floor)||floor<1||floor>building.storeys)throw Error('Invalid interior floor');
 const room=building.room!==undefined&&floor===(building.upper?2:1)?building.room:null;
 const npc={id:floorKey(building.id,floor),name:names[(Math.max(0,buildings.findIndex(b=>b.id===building.id))+floor-1)%names.length]+' · '+theme.role,line:theme.hint+(room!==null?' The mission portal is at the far end of this floor.':building.storeys===2?' Explore both floors to find more information.':' Use the exit to return to the island.'),...landmarks.npc};
 const obstacles=[
  {x:-4.35,z:-4.2,hx:.75,hz:1.65,type:'shelf'},
  {x:4.35,z:1.4,hx:.72,hz:1.75,type:'workbench'},
  {x:-3.5,z:floor===2?3.35:2.55,hx:1.0,hz:.58,type:'table'},
  {x:-4.25,z:-.45,hx:.6,hz:.6,type:'crate'},
  {x:2.95,z:-5.65,hx:1.22,hz:.48,type:'display'}
 ];
 return {building,floor,theme,room,npc,obstacles,stairs:building.storeys===2,exit:floor===1};
}
export function indoorSafe(plan,x,z){
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=bounds.x-.36&&Math.abs(z)<=bounds.z-.36&&!plan.obstacles.some(o=>Math.abs(x-o.x)<o.hx+.32&&Math.abs(z-o.z)<o.hz+.32);
}
export function indoorSegment(plan,a,b){
 if(![a?.x,a?.z,b?.x,b?.z].every(Number.isFinite))return false;
 const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.2));
 for(let i=0;i<=n;i++){const t=i/n;if(!indoorSafe(plan,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}return true;
}
export function indoorRoute(plan,start,end){
 if(!indoorSafe(plan,start.x,start.z)||!indoorSafe(plan,end.x,end.z))return [];
 if(indoorSegment(plan,start,end))return [end];
 const step=.5,key=p=>p.x+','+p.z,round=p=>({x:Math.round(p.x/step)*step,z:Math.round(p.z/step)*step});
 const root=round(start),queue=[],parents=new Map(),seen=new Set();
 for(const dx of [-step,0,step])for(const dz of [-step,0,step]){
  const p={x:root.x+dx,z:root.z+dz};if(indoorSegment(plan,start,p)){queue.push(p);seen.add(key(p));parents.set(key(p),null);}
 }
 let finish;
 for(let i=0;i<queue.length&&i<900;i++){
  const p=queue[i];if(indoorSegment(plan,p,end)){finish=p;break;}
  for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){
   const q={x:p.x+dx,z:p.z+dz},k=key(q);if(!seen.has(k)&&indoorSegment(plan,p,q)){seen.add(k);parents.set(k,p);queue.push(q);}
  }
 }
 if(!finish)return [];
 const result=[end];for(let p=finish;p;p=parents.get(key(p)))result.push(p);return result.reverse();
}
export function nearestInteriorAction(plan,pos){
 const items=[{id:'talk',...landmarks.npc,r:1.6}];
 if(plan.exit)items.push({id:'exit',...landmarks.exit,r:1.4});
 if(plan.stairs)items.push({id:'stairs',...landmarks.stairs,r:1.4});
 if(plan.room!==null)items.push({id:'room',...landmarks.portal,r:1.6});
 return items.map(p=>({...p,d:Math.hypot(pos.x-p.x,pos.z-p.z)})).filter(p=>p.d<=p.r).sort((a,b)=>a.d-b.d)[0]?.id??null;
}
export function loadInteriorProgress(value){
 const keys=new Set(buildings.flatMap(b=>Array.from({length:b.storeys},(_,i)=>floorKey(b.id,i+1))));
 return {visited:[...new Set((Array.isArray(value?.visited)?value.visited:[]).filter(k=>keys.has(k)))],talked:[...new Set((Array.isArray(value?.talked)?value.talked:[]).filter(k=>keys.has(k)))]};
}
