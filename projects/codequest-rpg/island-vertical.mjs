// Deterministic vertical parkour layout and locomotion. No WebGL dependency.
import {groundSafe,shrines,travelGates,circuits,traps,wallLane} from './island-adventure.mjs';
import {anchors,gear} from './island-airgear.mjs';
import {islandDistricts,allRoomLocations,villageHouses} from './island-villages.mjs';
import {pythonWaystations,shore,inRiver,onBridge} from './island-exploration.mjs';
export const summits=[{x:25,z:-53,h:13,r:16},{x:-33,z:52,h:10,r:15},{x:68,z:-22,h:7,r:13}];
export const terrain=(x,z)=>.85+1.05*Math.sin(x*.09)*Math.sin(z*.15)+.55*Math.cos(z*.17)+
 summits.reduce((height,peak)=>height+peak.h*Math.max(0,1-Math.hypot(x-peak.x,z-peak.z)/peak.r)**1.45,0);
export const elevation=(x,z)=>inRiver(z)&&onBridge(x)?1.15:terrain(x,z);
export const motion={gravity:20,jump:10.8,fallCap:24,coyote:.12,buffer:.15,groundAcceleration:44,airAcceleration:18,friction:48};
export const parkourStorage='cq-vertical-trails-v7';
const names=['Canopy Steps','Sunstone Terraces','Aether Ascent','Signal Canopy','Clockwork Rise','Ember Traverse'];
const colors=['#75c6a0','#e0b87b','#79c8e6','#94c981','#b6a0e0','#ef9c77'];
const other=[{x:23,z:24},{x:25,z:-53},{x:14,z:46},{x:-76,z:11},{x:24,z:-44},{x:-33,z:66},{x:-38,z:77},{x:126,z:29},{x:25,z:-55},{x:-65,z:-7},{x:20,z:41},{x:-14,z:-46},{x:63,z:11}];
const major=[...allRoomLocations(),...villageHouses,...shrines,...travelGates,...gear,...pythonWaystations,...traps,...circuits.flatMap(c=>[...c.steps,c.reward]),...other];
const clear=(p,r=2.1)=>shore(p.x,p.z)<.86&&Math.abs(p.z)>7&&
 [[0,0],[-r,-r],[-r,r],[r,-r],[r,r]].every(([dx,dz])=>groundSafe(p.x+dx,p.z+dz))&&
 major.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>5.8)&&anchors.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>3.0)&&
 Math.hypot(p.x-wallLane.x,p.z-wallLane.z)>11;
export function createCourses(){
 const courses=[];
 for(const [zone,district] of islandDistricts.entries()){
  let best=null;
  // Each six-platform course occupies a clear, mostly level corridor close to
  // its own district; deterministic offsets and rotation prevent overlaps.
  for(let radius=9;radius<=58;radius+=3)for(let bearing=0;bearing<16;bearing++){
   const angle=bearing*Math.PI/8,cx=Math.round(district.anchor.x+Math.cos(angle)*radius),cz=Math.round(district.anchor.z+Math.sin(angle)*radius);
   for(let direction=0;direction<8;direction++){
    const theta=direction*Math.PI/4,dx=Math.cos(theta),dz=Math.sin(theta);
    const entry={x:cx-dx*4.7,z:cz-dz*4.7};
    const pads=Array.from({length:6},(_,i)=>({x:cx+dx*4.65*i,z:cz+dz*4.65*i}));
    if(!clear(entry,1)||!pads.every(p=>clear(p)))continue;
    if([entry,...pads].some(p=>courses.some(c=>[c.entry,...c.pads].some(q=>Math.hypot(p.x-q.x,p.z-q.z)<7))))continue;
    const start=elevation(entry.x,entry.z);
    const base=Math.max(start,...pads.map(p=>elevation(p.x,p.z)));
    if(base-start>1.05)continue;
    const heights=pads.map((p,i)=>({...p,id:'parkour-'+zone+'-'+i,course:zone,index:i,hx:1.62,hz:1.62,y:base+.80+i*1.16}));
    if(heights.some(p=>p.y<elevation(p.x,p.z)+.45))continue;
    const score=radius+Math.abs(base-start)*5;
    if(!best||score<best.score)best={id:'course-'+zone,zone,name:names[zone],color:colors[zone],entry,pads:heights,score};
   }
   if(best&&radius>best.score+3)break;
  }
  if(!best)throw Error('No safe vertical corridor for '+district.id);
  courses.push(best);
 }
 return courses;
}
export const courses=createCourses();
export const platformList=courses.flatMap(c=>c.pads);
export const onPlatform=(p,x,z,margin=.05)=>Math.abs(x-p.x)<=p.hx+margin&&Math.abs(z-p.z)<=p.hz+margin;
// Sweep the foot trajectory against the real deck top and the body against its slab.
export function slabBlocked(surfaces,a,b,feet,height=1.55,radius=.20){
 const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.12));
 for(const p of surfaces){
  if(feet>=p.y-.055||feet+height<=p.y-(p.thickness??.28)+.015)continue;
  if(onPlatform(p,a.x,a.z,radius))continue; // escape a pre-existing overlap
  for(let i=1;i<=n;i++){const t=i/n;if(onPlatform(p,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,radius))return true;}
 }return false;
}
export function slabCeiling(surfaces,x,z,feet,nextFeet,height=1.55,radius=.20){
 if(nextFeet<=feet)return null;
 let stop=null;for(const p of surfaces){const bottom=p.y-(p.thickness??.28);if(onPlatform(p,x,z,radius)&&feet+height<=bottom+.025&&nextFeet+height>bottom&&(stop===null||bottom<stop))stop=bottom;}
 return stop;
}
export function landingSurface(surfaces,x,z,fromY,toY,fromX=x,fromZ=z){
 if(toY>fromY)return null;
 let best=null;for(const p of surfaces){if(fromY<p.y-.07||toY>p.y+.001)continue;const t=fromY===toY?1:Math.max(0,Math.min(1,(fromY-p.y)/(fromY-toY)));if(onPlatform(p,fromX+(x-fromX)*t,fromZ+(z-fromZ)*t)&&onPlatform(p,x,z)&&(!best||p.y>best.y))best=p;}return best;
}
export function approachVelocity(current,target,accel,dt){
 const delta=target-current,step=accel*dt;
 return Math.abs(delta)<=step?target:current+Math.sign(delta)*step;
}
export function horizontalStep(v,input,speed,grounded,dt,airFactor=1){
 const n=Math.hypot(input.x,input.z),scale=n>1?1/n:1;
 const a=n>.001?(grounded?motion.groundAcceleration:motion.airAcceleration*airFactor):grounded?motion.friction:4;
 const tx=input.x*scale*speed,tz=input.z*scale*speed;
 return {x:approachVelocity(v.x,tx,a,dt),z:approachVelocity(v.z,tz,a,dt)};
}
export function makeVertical(y,vy=0,grounded=true,support=null){return {y,vy,grounded,support,coyote:grounded?motion.coyote:0,buffer:0,landed:false,airJumps:0};}
export function verticalStep(prev,{x,z,ground,surfaces=[],dt,jump=false,release=false,jumpScale=1,fromX=x,fromZ=z,bodyHeight=1.55,doubleJump=false}){
 const s={...prev,landed:false};
 s.buffer=jump?motion.buffer:Math.max(0,s.buffer-dt);
 s.coyote=s.grounded?motion.coyote:Math.max(0,s.coyote-dt);
 const support=s.support?surfaces.find(p=>p.id===s.support&&onPlatform(p,x,z)):null;
 if(s.grounded&&!s.support)s.y=ground;
 if(s.grounded&&s.support&&!support){const adjacent=surfaces.find(p=>onPlatform(p,x,z)&&Math.abs(p.y-s.y)<.035);if(adjacent){s.support=adjacent.id;s.y=adjacent.y;}else{s.grounded=false;s.support=null;}}
 if(s.grounded&&support)s.y=support.y;
 if(s.buffer>0&&(s.grounded||s.coyote>0)){
  s.vy=motion.jump*jumpScale;s.grounded=false;s.support=null;s.coyote=0;s.buffer=0;s.airJumps=0;
 }else if(doubleJump&&jump&&!s.grounded&&(s.airJumps??0)<1){
  s.vy=motion.jump*.88*jumpScale;s.airJumps=1;s.buffer=0;s.coyote=0;
 }
 if(release&&s.vy>6.8)s.vy=6.8;
 if(s.grounded){s.vy=0;s.airJumps=0;return s;}
 const from=s.y;
 s.vy=Math.max(-motion.fallCap,s.vy-motion.gravity*dt);
 s.y+=s.vy*dt;
 const ceiling=slabCeiling(surfaces,x,z,from,s.y,bodyHeight);if(ceiling!==null){s.y=ceiling-bodyHeight-.02;s.vy=0;}
 const hit=landingSurface(surfaces,x,z,from,s.y,fromX,fromZ);
 if(hit&&s.vy<=0){s.y=hit.y;s.vy=0;s.grounded=true;s.support=hit.id;s.landed=true;}
 else if(s.y<=ground){s.y=ground;s.vy=0;s.grounded=true;s.support=null;s.landed=true;}
 if(s.landed)s.airJumps=0;
 return s;
}
export function restoreParkour(value){
 return [...new Set((Array.isArray(value)?value:[]).filter(id=>courses.some(c=>c.id===id)))];
}
export function recordPad(progress,pad){
 if(!pad)return progress;
 if(pad.index===0)return 1;
 return progress===pad.index?progress+1:progress;
}
