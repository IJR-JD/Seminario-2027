// Pure adventure configuration and gameplay rules; no WebGL dependency.
import {isIslandWalkable,shore,planIslandRoute} from './island-exploration.mjs';
import {allRoomLocations,villageHouses} from './island-villages.mjs';
export const adventureKey='cq-island-adventure-v3';
export const shrines=[
 {id:'dash',name:'Wind Shrine',x:-112,z:-55,color:'#50d9ff',key:'X',description:'Dash: burst forward. Cross the wind challenge before the spikes rise.'},
 {id:'fly',name:'Sky Shrine',x:48,z:-51,color:'#ffdb7a',key:'V',description:'Flight: toggle wings for up to six seconds. Cross water and land safely.'},
 {id:'wall',name:'Stone Shrine',x:-57,z:35,color:'#b8a2ff',key:'B',description:'Wall run: activate on a marked wall lane, then run along its face.'}
];
export const travelGates=[
 {id:'meadow',name:'Meadow Gate',x:-119,z:-35,to:'signal',color:'#8bf6db'},
 {id:'signal',name:'Signal Gate',x:-91,z:43,to:'meadow',color:'#8bf6db'},
 {id:'sky',name:'Sky Gate',x:52,z:-83,to:'ember',color:'#ffd37c'},
 {id:'ember',name:'Ember Gate',x:104,z:46,to:'sky',color:'#ffd37c'}
];
export const circuits=[
 {id:'sequence',name:'Signal Circuit',color:'#83e8a9',x:-110,z:42,steps:[{x:-114,z:39},{x:-106,z:39},{x:-110,z:48}],reward:{x:-110,z:54},description:'Activate the three numbered pads in order, then claim the crystal.'},
 {id:'wind',name:'Wind Trial',color:'#50d9ff',x:-85,z:-82,steps:[{x:-92,z:-81},{x:-84,z:-81},{x:-84,z:-88}],reward:{x:-77,z:-88},requires:'dash',description:'Unlock Dash, activate pads 1–3, avoid the pulsing spikes, and reach the reward.'},
 {id:'sky',name:'Sky Relay',color:'#ffdb7a',x:48,z:-32,steps:[{x:48,z:-32},{x:48,z:8},{x:55,z:14}],reward:{x:60,z:19},requires:'fly',description:'Unlock Flight. Activate the northern pad, cross the river, and finish the relay on the southern bank.'},
 {id:'wall',name:'Wall Circuit',color:'#b8a2ff',x:-57,z:48,steps:[{x:-59,z:45},{x:-59,z:51},{x:-59,z:57}],reward:{x:-59,z:62},requires:'wall',description:'Unlock Wall run. Activate the first pad, use the marked wall lane, then reach the final pad and crystal.'}
];
export const wallLane={x:-56,z:51,minZ:43,maxZ:59,sideX:-58.5};
export const traps=[
 {x:-88,z:-81,r:1.25,phase:0},{x:-84,z:-85,r:1.2,phase:1.2},
 {x:54,z:17,r:1.3,phase:.7},{x:-63,z:59,r:1.2,phase:1.8}
];
export const flightLimit=6,dashDuration=.32,dashCooldown=1.4;
export const buildingFootprints=[...allRoomLocations(),...villageHouses].map(({x,z,storeys=2})=>({x,z:z-2.7,hx:2.23,hz:1.95,height:storeys===2?8.1:5.1}));
export const blocked=(x,z)=>buildingFootprints.some(b=>Math.abs(x-b.x)<b.hx&&Math.abs(z-b.z)<b.hz)||(Math.abs(x-wallLane.x)<.7&&z>wallLane.minZ-1&&z<wallLane.maxZ+1);
export const groundSafe=(x,z)=>isIslandWalkable(x,z)&&!blocked(x,z);
export const airSafe=(x,z)=>Number.isFinite(x)&&Number.isFinite(z)&&shore(x,z)<.89&&!blocked(x,z);
export const onWallLane=(x,z)=>Math.abs(x-wallLane.sideX)<1.7&&z>=wallLane.minZ&&z<=wallLane.maxZ;
export const trapActive=(trap,time)=>((time+trap.phase)%3.2+3.2)%3.2<1.1;
export const newProgress=()=>({powers:[],circuits:[],setbacks:0});
export function restoreProgress(value){
 const base=newProgress();
 if(!value||typeof value!=='object')return base;
 if(Array.isArray(value.powers))base.powers=[...new Set(value.powers.filter(id=>shrines.some(s=>s.id===id)||['grapple','jetpack'].includes(id)))];
 if(Array.isArray(value.circuits))base.circuits=[...new Set(value.circuits.filter(id=>circuits.some(s=>s.id===id)))];
 if(Number.isSafeInteger(value.setbacks)&&value.setbacks>=0)base.setbacks=value.setbacks;
 return base;
}
export function padResult(progress,index,count){
 if(index===progress)return {next:progress+1,complete:progress+1===count,wrong:false};
 if(index<progress)return {next:progress,complete:progress===count,wrong:false};
 return {next:0,complete:false,wrong:true};
}
export function segmentSafe(a,b){
 const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.45);
 for(let i=0;i<=n;i++){const t=n?i/n:0;if(!groundSafe(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}
 return true;
}
// A bounded grid search reroutes click-to-walk around solid village facades.
export function routeAdventure(start,end){
 if(!groundSafe(start.x,start.z)||!groundSafe(end.x,end.z))throw Error('Destination is not walkable');
 const route=planIslandRoute(start,end);let previous=start;
 if(route.every(p=>{const ok=segmentSafe(previous,p);previous=p;return ok;}))return route;
 const step=2,grid=p=>({x:Math.round(p.x/step)*step,z:Math.round(p.z/step)*step}),key=p=>p.x+','+p.z;
 const initial=grid(start),goal=grid(end);
 const neighbors=p=>[[2,0],[-2,0],[0,2],[0,-2],[2,2],[2,-2],[-2,2],[-2,-2]].map(([x,z])=>({x:p.x+x,z:p.z+z}));
 const candidates=[initial,...neighbors(initial)].filter(p=>segmentSafe(start,p));
 const queue=[],parents=new Map(),seen=new Set();
 for(const p of candidates){const k=key(p);if(!seen.has(k)){seen.add(k);queue.push(p);parents.set(k,null);}}
 let finish;
 for(let i=0;i<queue.length&&i<24000;i++){
  const p=queue[i];
  if(Math.hypot(p.x-goal.x,p.z-goal.z)<=4&&segmentSafe(p,end)){finish=p;break;}
  for(const n of neighbors(p)){const k=key(n);if(!seen.has(k)&&segmentSafe(p,n)){seen.add(k);parents.set(k,p);queue.push(n);}}
 }
 if(!finish)throw Error('No safe path found');
 const path=[end];for(let p=finish;p;p=parents.get(key(p)))path.push(p);path.reverse();
 const smooth=[];let p=start;
 for(let i=0;i<path.length;){let j=path.length-1;while(j>i&&!segmentSafe(p,path[j]))j--;smooth.push(path[j]);p=path[j];i=j+1;}
 return smooth;
}

// Aerial gear can clear the roof; ordinary walking and low flight stay solid.
export function airClear(x,z,y,elevation){
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(y)||shore(x,z)>=.91)return false;
 for(const b of buildingFootprints)if(Math.abs(x-b.x)<b.hx&&Math.abs(z-b.z)<b.hz&&y<elevation(b.x,b.z)+b.height+.35)return false;
 if(Math.abs(x-wallLane.x)<.7&&z>wallLane.minZ-1&&z<wallLane.maxZ+1&&y<elevation(x,z)+3.65)return false;
 return true;
}
