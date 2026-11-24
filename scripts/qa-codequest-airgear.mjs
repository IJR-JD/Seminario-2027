import assert from 'node:assert/strict';
import {gear,anchors,jetCapacity,selectAnchor,swingStart,swingStep,jetStep,validGearSite} from '../projects/codequest-rpg/island-airgear.mjs';
import {groundSafe,airClear,buildingFootprints,restoreProgress} from '../projects/codequest-rpg/island-adventure.mjs';
assert.equal(gear.length,2);assert.equal(anchors.length,11);
for(const p of [...gear,...anchors])assert(groundSafe(p.x,p.z),'Unsafe site '+p.id);
assert(gear.every(validGearSite));
const origin={x:0,y:3,z:0},anchor={id:'test',x:9,y:15,z:0};
assert.equal(selectAnchor(origin,[anchor],{x:1,z:0}),anchor);
assert.equal(selectAnchor(origin,[{...anchor,x:50}],{x:1,z:0}),null);
let s=swingStart(origin,anchor,{x:1,z:0});
for(let i=0;i<240;i++){
 s=swingStep(s,anchor,{x:.3,z:.6},1/60);
 assert(Object.values(s).every(Number.isFinite));
 assert(Math.hypot(s.x-anchor.x,s.y-anchor.y,s.z-anchor.z)<=s.length+.04,'Rope constraint violated');
}
assert(s.time>3.99);assert(s.x!==origin.x);assert(s.length>=5);
let j=jetStep(jetCapacity,2,1,1);assert(j.height===7&&j.fuel<jetCapacity);
j=jetStep(j.fuel,j.height,1,10);assert.equal(j.height,13);assert.equal(j.fuel,0);
j=jetStep(3,7,-1,2);assert.equal(j.height,2);assert(j.fuel>0);
for(const b of buildingFootprints){
 assert(!airClear(b.x,b.z,1,()=>0));assert(airClear(b.x,b.z,12,()=>0));
}
assert(!airClear(200,200,12,()=>0));
assert.deepEqual(restoreProgress({powers:['dash','grapple','jetpack','fake'],circuits:['wind'],setbacks:2}),{powers:['dash','grapple','jetpack'],circuits:['wind'],setbacks:2});
console.log('PASS aerial equipment: 2 sites, 11 anchors, bounded rope dynamics, jet fuel, roof clearance, save compatibility.');
