// Original, scaled landmark interpretations. Keep existing room, anchor and depot IDs.
import {groundSafe,segmentSafe,routeAdventure,shrines,travelGates,circuits,traps,wallLane} from './island-adventure.mjs';
import {allRoomLocations,villageHouses} from './island-villages.mjs';
import {courses,platformList,elevation} from './island-vertical.mjs';
import {anchors,gear} from './island-airgear.mjs';
import {depots,vehicles} from './island-mobility.mjs';
import {pythonWaystations,shore} from './island-exploration.mjs';
const reserved=[...allRoomLocations(),...villageHouses,...shrines,...travelGates,...gear,...pythonWaystations,...traps,...circuits.flatMap(c=>[...c.steps,c.reward]),...platformList,...courses.map(c=>c.entry),...depots,...vehicles,
 {x:23,z:24},{x:25,z:-53},{x:14,z:46},{x:-76,z:11},{x:24,z:-44},{x:-33,z:66},{x:-38,z:77},{x:126,z:29},{x:25,z:-55},{x:-65,z:-7},{x:20,z:41},{x:-14,z:-46},{x:63,z:11},{x:wallLane.x,z:wallLane.z}];
const specs=[
 {id:'giza',name:'Giza Pyramid Complex',kind:'pyramids',preferred:{x:-18,z:-26},radius:10,description:'Three sandstone pyramids, a stepped ascent and a survey plaza.'},
 {id:'liberty',name:'Liberty Monument',kind:'liberty',preferred:{x:114,z:-25},radius:6.4,description:'Copper-green statue, raised torch, crown and tablet on a stone pedestal.'},
 {id:'eiffel',name:'Eiffel Tower',kind:'eiffel',preferred:{x:23,z:77},radius:7.5,description:'Four lattice legs, iron trusses and three observation levels.'}
];
export function createLandmarks(){
 const sites=[];
 for(const spec of specs){
  let best=null;
  for(let z=-99;z<=99;z+=3)for(let x=-127;x<=127;x+=3){
   const r=spec.radius,p={x,z};
   if(Math.abs(z)<r+8||shore(x,z)>.79)continue;
   if(reserved.some(q=>Math.hypot(x-q.x,z-q.z)<r+3.5)||anchors.some(q=>Math.hypot(x-q.x,z-q.z)<r+1.6)||sites.some(q=>Math.hypot(x-q.x,z-q.z)<r+q.radius+6))continue;
   if(![[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,-r*.7],[-r*.7,r*.7],[r*.7,-r*.7]].every(([dx,dz])=>groundSafe(x+dx,z+dz)))continue;
   const approach={x,z:z+r+1.8};
   if(!groundSafe(approach.x,approach.z)||!segmentSafe(approach,{x,z:z+r*.8}))continue;
   const base=Math.max(elevation(x,z),...[-1,1].flatMap(dx=>[-1,1].map(dz=>elevation(x+dx*r*.65,z+dz*r*.65))));
   if(base-elevation(x,z)>1.5)continue;
   const score=Math.hypot(x-spec.preferred.x,z-spec.preferred.z)+Math.abs(base-elevation(x,z))*4;
   if(!best||score<best.score)best={...spec,x,z,y:base,approach,score};
  }
  if(!best)throw Error('No safe landmark site: '+spec.id);
  sites.push(best);
 }
 sites.push({id:'tower-bridge',name:'Tower Bridge · London',kind:'bridge',x:0,z:0,y:1.15,radius:5,approach:{x:0,z:6.1},description:'Twin neo-Gothic towers, blue suspension chains and a usable river crossing.'});
 return sites;
}
export const landmarks=createLandmarks();
export const landmarkStorage='cq-landmarks-v9';
export const restoreLandmarks=value=>[...new Set((Array.isArray(value)?value:[]).filter(id=>landmarks.some(p=>p.id===id)))];
export const pyramidParts=l=>[{x:l.x,z:l.z-1,w:10,h:8.4,main:true},{x:l.x-6.9,z:l.z+4.6,w:4.8,h:4.0},{x:l.x+6.9,z:l.z+4.6,w:4.8,h:4.0}];
export const landmarkSolids=landmarks.flatMap(l=>{
 if(l.kind==='pyramids')return pyramidParts(l).flatMap(p=>p.main?Array.from({length:6},(_,i)=>({x:p.x,z:p.z,hx:(p.w-i*1.52)/2,hz:(p.w-i*1.52)/2,y:l.y+(i+1)*1.4,id:'giza-step-'+i})): [{x:p.x,z:p.z,hx:p.w/2,hz:p.w/2,y:l.y+p.h,id:'small-pyramid-'+p.x}]);
 if(l.kind==='liberty')return [{x:l.x,z:l.z,hx:2.8,hz:2.8,y:l.y+15,id:'liberty-core'}];
 if(l.kind==='eiffel')return [-1,1].flatMap(dx=>[-1,1].map(dz=>({x:l.x+dx*4.7,z:l.z+dz*4.7,hx:.85,hz:.85,y:l.y+4.8,id:'eiffel-foot-'+dx+'-'+dz})));
 return [-1,1].flatMap(dx=>[-1,1].map(dz=>({x:l.x+dx*3.65,z:dz*3.95,hx:1.05,hz:1.35,y:12.5,id:'bridge-tower-'+dx+'-'+dz})));
});
const eiffel=landmarks.find(l=>l.kind==='eiffel');
export const landmarkSurfaces=[...landmarkSolids.filter(p=>p.id.startsWith('giza-step-')),...[[4.8,6.7],[9.2,3.95],[15,1.95]].map(([h,w],i)=>({id:'eiffel-level-'+i,x:eiffel.x,z:eiffel.z,hx:w/2,hz:w/2,y:eiffel.y+h+.145}))];
export function landmarkClear(x,z,y=-Infinity,margin=.20){
 return !landmarkSolids.some(p=>Math.abs(x-p.x)<p.hx+margin&&Math.abs(z-p.z)<p.hz+margin&&y<p.y-.07);
}
export function landmarkSegment(a,b,y=-Infinity,margin=.20){
 const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.30));
 for(let i=0;i<=n;i++){const t=i/n;if(!landmarkClear(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,y,margin))return false;}
 return true;
}
export const landmarkGround=(x,z)=>groundSafe(x,z)&&landmarkClear(x,z);
export function landmarkRoute(start,end){return routeAdventure(start,end,{walkable:landmarkGround,segment:(a,b)=>segmentSafe(a,b)&&landmarkSegment(a,b)});}
