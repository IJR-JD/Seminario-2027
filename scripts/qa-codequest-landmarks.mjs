import assert from 'node:assert/strict';
import * as THREE from 'three';
import {landmarks,landmarkSolids,landmarkSurfaces,landmarkGround,landmarkRoute,landmarkSegment,landmarkClear,restoreLandmarks} from '../projects/codequest-rpg/island-landmarks.mjs';
import {createMonuments} from '../projects/codequest-rpg/island-monuments.mjs';
import {createIslandWater,waveHeight,waterProximity,particleCapacity} from '../projects/codequest-rpg/island-water.mjs';
import {elevation} from '../projects/codequest-rpg/island-vertical.mjs';
assert.equal(landmarks.length,4);assert.equal(landmarkSurfaces.length,9);
assert.deepEqual(restoreLandmarks(['giza','giza','bad']),['giza']);
for(const l of landmarks){
 assert(landmarkGround(l.approach.x,l.approach.z),l.id+' approach blocked');
 const start={x:-105,z:-66.3};let previous=start;
 for(const p of landmarkRoute(start,l.approach)){assert(landmarkSegment(previous,p));previous=p;}
 assert(Math.hypot(previous.x-l.approach.x,previous.z-l.approach.z)<.1);
 console.log('PASS landmark route '+l.name+' @ '+l.x+','+l.z);
}
for(const p of landmarkSolids){assert(!landmarkClear(p.x,p.z));assert(landmarkClear(p.x,p.z,p.y+.08,0)||landmarkSolids.some(q=>q!==p&&Math.abs(p.x-q.x)<q.hx&&Math.abs(p.z-q.z)<q.hz&&q.y>p.y));}
assert(landmarkSegment({x:0,z:-6},{x:0,z:6},-Infinity,1.12),'Central crossing must accommodate rover');
const scene=new THREE.Scene(),materials=new Map();
const material=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);scene.add(m);return m;};
const label=()=>new THREE.Object3D();
assert.equal(createMonuments(scene,{box,material,elevation,label}).count,4);
scene.updateMatrixWorld(true);scene.traverse(m=>assert(m.matrixWorld.elements.every(Number.isFinite)));
assert(scene.children.length>250);
assert(Math.abs(waveHeight(0,0,0)+1)<.0001);assert.notEqual(waveHeight(1,2,0),waveHeight(1,2,1));
assert(waterProximity(0,3.3)>waterProximity(0,25));
const fx=createIslandWater(scene);let max=0;
for(let i=0;i<240;i++){fx.update(i/60,1/60,{x:i*.12,z:3.3,y:1});max=Math.max(max,fx.stats().active);}
assert(max>0&&max<=particleCapacity);assert.equal(fx.stats().capacity,particleCapacity);
console.log('PASS 4 procedural monument models, 9 physical surfaces, navigable central bridge, animated wave field and bounded particle pool; max active '+max);
