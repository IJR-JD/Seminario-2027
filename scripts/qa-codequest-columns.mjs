import assert from 'node:assert/strict';
import {createColumnPhysics,isColumn} from '../projects/codequest-rpg/island-columns.mjs';
import {depots,frontiers,vehicleTypes} from '../projects/codequest-rpg/island-mobility.mjs';
import {courses,elevation} from '../projects/codequest-rpg/island-vertical.mjs';
import {routeAdventure,groundSafe,segmentSafe} from '../projects/codequest-rpg/island-adventure.mjs';
const physics=createColumnPhysics();
assert(isColumn(.20,1.2,.20));assert(!isColumn(3.24,.28,3.24));
const c=physics.add(0,3,0,.4,6,.4);
const A={x:-2,y:0,z:0},B={x:2,y:0,z:0};
assert.equal(physics.hit(A,B)?.id,c.id,'dash cannot tunnel');
assert(!physics.hit({...A,z:.65},{...B,z:.65}),'walking through gap');
assert(physics.hit({...A,z:.65},{...B,z:.65},{radius:1.12}),'vehicle width matters');
assert(!physics.hit({...A,y:6.05},{...B,y:6.05}),'overflight above column');
assert(physics.hit({...A,y:7},{...B,y:0}),'diagonal aerial impact');
assert(!physics.hit({x:.3,z:0,y:0},{x:1,z:0,y:0}),'outward recovery');
assert(physics.hit({x:.3,z:0,y:0},{x:.1,z:0,y:0}),'cannot go deeper');
let enabled=false;physics.add(10,1,0,.5,2,.5,()=>enabled);
assert(!physics.hit({x:8,y:0,z:0},{x:12,y:0,z:0}));enabled=true;
assert(physics.hit({x:8,y:0,z:0},{x:12,y:0,z:0}));
assert.equal(physics.surfaces(0,0)[0].y,6);
const supports=createColumnPhysics();
for(const course of courses)for(const p of course.pads)for(const dx of [-1,1])for(const dz of [-1,1]){
 const base=elevation(p.x,p.z),h=Math.max(.2,p.y-base-.25),x=p.x+dx*1.2,z=p.z+dz*1.2,y=base+(p.y-base-.25)/2;
 const col=supports.add(x,y,z,.20,h,.20);
 assert(supports.hit({x:x-.5,y:col.minY+.05,z},{x:x+.5,y:col.minY+.05,z}));
 assert(!supports.hit({x:x-.5,y:p.y+.05,z},{x:x+.5,y:p.y+.05,z}));
}
assert.equal(supports.count(),144);
const start=courses[0].entry,end=courses[0].pads[0];
let prev=start;const route=routeAdventure(start,end,{segment:(a,b)=>segmentSafe(a,b)&&!supports.hit(a,b,{ground:elevation})});
for(const point of route){assert(!supports.hit(prev,point,{ground:elevation}));prev=point;}
console.log('PASS 144 real parkour column dimensions, continuous contact, free gaps, overflight, vehicle radius, gated supports and obstacle-aware route.');

for(const f of frontiers){
 const c=createColumnPhysics(),base=elevation(f.x,f.z);
 for(const dx of [-1,1])for(const dz of [-1,1])c.add(f.x+dx*1.15,(base+f.y)/2,f.z+dz*2.85,.24,f.y-base,.24);
 for(const v of depots[f.zone].vehicles)assert(!c.hit(v,v,{ground:elevation,radius:vehicleTypes[v.type].radius,height:1.3}),'Vehicle clearance '+v.id);
}
console.log('PASS all 18 vehicle parking footprints clear of physical lift columns.');
