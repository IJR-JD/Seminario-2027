import assert from 'node:assert/strict';
import {gear,anchors,anchorLinks,grappleRange,jetCapacity,selectAnchor,swingStart,swingStep,jetStep,validGearSite} from '../projects/codequest-rpg/island-airgear.mjs';
import {groundSafe,airClear,buildingFootprints,restoreProgress} from '../projects/codequest-rpg/island-adventure.mjs';
assert.equal(gear.length,2);assert(anchors.length>=65,'Island must have a dense network, found '+anchors.length);
assert.equal(new Set(anchors.map(a=>a.id)).size,anchors.length);
assert.equal(new Set(anchors.map(a=>a.kind)).size,4);
assert(anchors.some(a=>a.x<-100)&&anchors.some(a=>a.x>100)&&anchors.some(a=>a.z<-65)&&anchors.some(a=>a.z>65));
const links=anchorLinks(anchors,28),visited=new Set([anchors[0].id]);
let changed=true;while(changed){changed=false;for(const [a,b] of links){if(visited.has(a)&&!visited.has(b)){visited.add(b);changed=true;}if(visited.has(b)&&!visited.has(a)){visited.add(a);changed=true;}}}
assert.equal(visited.size,anchors.length,'Disconnected anchors: '+anchors.filter(a=>!visited.has(a.id)).map(a=>a.id).join(','));
const workshop=gear.find(p=>p.id==='grapple');assert(anchors.filter(p=>Math.hypot(p.x-workshop.x,p.z-workshop.z)<22).length>=2,'Workshop needs alternate reachable anchors');
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
const transfer=swingStart(s,{...anchor,id:'second',x:12,z:5},{x:0,z:1},s);assert.deepEqual([transfer.vx,transfer.vy,transfer.vz],[s.vx,s.vy,s.vz]);
assert.equal(selectAnchor(origin,[anchor],{x:1,z:0},anchor.id),null);
assert(s.time>3.99);assert(s.x!==origin.x);assert(s.length>=5);
let j=jetStep(jetCapacity,2,1,1);assert(j.height===7&&j.fuel<jetCapacity);
j=jetStep(j.fuel,j.height,1,10);assert.equal(j.height,13);assert.equal(j.fuel,0);
j=jetStep(3,7,-1,2);assert.equal(j.height,2);assert(j.fuel>0);
for(const b of buildingFootprints){
 assert(!airClear(b.x,b.z,1,()=>0));assert(airClear(b.x,b.z,12,()=>0));
}
assert(!airClear(200,200,12,()=>0));
assert.deepEqual(restoreProgress({powers:['dash','grapple','jetpack','fake'],circuits:['wind'],setbacks:2}),{powers:['dash','grapple','jetpack'],circuits:['wind'],setbacks:2});
console.log('PASS aerial equipment: 2 sites, '+anchors.length+' anchors, '+links.length+' network links, bounded rope dynamics, jet fuel, roof clearance, save compatibility.');
