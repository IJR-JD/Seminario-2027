import assert from 'node:assert/strict';
import {courses,platformList,elevation,motion,makeVertical,verticalStep,horizontalStep,landingSurface,slabBlocked,slabCeiling,recordPad,restoreParkour} from '../projects/codequest-rpg/island-vertical.mjs';
import {groundSafe,routeAdventure} from '../projects/codequest-rpg/island-adventure.mjs';
import {islandDistricts} from '../projects/codequest-rpg/island-villages.mjs';
assert.equal(courses.length,6);assert.equal(platformList.length,36);assert.equal(new Set(platformList.map(p=>p.id)).size,36);
for(const c of courses){
 assert(groundSafe(c.entry.x,c.entry.z));assert(Math.hypot(c.entry.x-islandDistricts[c.zone].anchor.x,c.entry.z-islandDistricts[c.zone].anchor.z)<64);
 let x=c.entry.x,z=c.entry.z,s=makeVertical(elevation(x,z)),progress=0;
 for(const p of c.pads){
  assert(groundSafe(p.x,p.z));assert(p.y>elevation(p.x,p.z));
  let landed=false,peak=s.y;
  for(let i=0;i<180;i++){
   const d=Math.hypot(p.x-x,p.z-z),dt=1/120;
   if(d>.001){const move=Math.min(d,5.8*dt);x+=(p.x-x)*move/d;z+=(p.z-z)*move/d;}
   s=verticalStep(s,{x,z,ground:elevation(x,z),surfaces:platformList,dt,jump:i===0});
   peak=Math.max(peak,s.y);
   if(s.landed){assert.equal(s.support,p.id,c.id+' pad '+p.index+' failed from peak '+peak);landed=true;break;}
  }
  assert(landed);progress=recordPad(progress,p);
 }
 assert.equal(progress,6);assert(restoreParkour([c.id,c.id,'bad']).length===1);
 console.log('PASS '+c.name+' six actual ballistic landings; entry '+c.entry.x.toFixed(1)+','+c.entry.z.toFixed(1));
}
function jump(dt,cut=false){
 let s=makeVertical(0),peak=0;
 for(let i=0;i<Math.ceil(2/dt);i++){
  s=verticalStep(s,{x:0,z:0,ground:0,dt,jump:i===0,release:cut&&i===Math.ceil(.1/dt)});
  peak=Math.max(peak,s.y);
  if(s.landed)return peak;
 }
 throw Error('Never landed');
}
assert(jump(1/60)>2.6);assert(jump(1/60,true)<jump(1/60));
assert(Math.abs(jump(1/60)-jump(1/120))<.1);
let s=makeVertical(4,0,true,'test');
s=verticalStep(s,{x:3,z:0,ground:0,surfaces:[{id:'test',x:0,z:0,hx:1,hz:1,y:4}],dt:.03});
assert(!s.grounded&&s.vy<0&&s.y>3.9);
s=verticalStep(s,{x:3,z:0,ground:0,dt:.03,jump:true});assert(s.vy>0,'Coyote jump failed');
let v={x:0,z:0};v=horizontalStep(v,{x:1,z:0},8,true,.05);assert(v.x>0&&v.x<8);
for(let i=0;i<20;i++)v=horizontalStep(v,{x:0,z:0},8,true,.05);assert.equal(v.x,0);
assert.equal(landingSurface([{id:'test',x:0,z:0,hx:1,hz:1,y:2}],0,0,1,3),null);
console.log('PASS six distributed courses, 36 walkable platforms, sequential reward, variable jump, coyote time, frame-rate stability, acceleration and braking.');

for(const p of platformList){
 const a={x:p.x-p.hx-.6,z:p.z},b={x:p.x,z:p.z};
 assert(slabBlocked([p],a,b,p.y-.5),'side sweep '+p.id);
 assert(!slabBlocked([p],a,b,p.y+.06),'clear top '+p.id);
 assert(!slabBlocked([p],a,b,p.y-3),'clear underpass '+p.id);
 assert.equal(slabCeiling([p],p.x,p.z,p.y-2,p.y-1,1.55),p.y-.28);
 assert.equal(landingSurface([p],p.x,p.z,p.y+.8,p.y-.8,p.x-p.hx-4,p.z),null,'no lateral snap '+p.id);
 assert.equal(landingSurface([p],p.x,p.z,p.y+.8,p.y-.8)?.id,p.id);
}
console.log('PASS all 36 swept side contacts, underside contacts, clear underpasses and descending foot trajectories.');
