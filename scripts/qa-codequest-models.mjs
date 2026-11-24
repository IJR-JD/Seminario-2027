import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createIslandAvatar,animateIslandAvatar} from '../projects/codequest-rpg/island-avatar.mjs';
import {createVehicleFleet} from '../projects/codequest-rpg/island-vehicles.mjs';
import {vehicles,vehicleTypes,vehicleStep,earnedSkills,sectors} from '../projects/codequest-rpg/island-mobility.mjs';
import {elevation} from '../projects/codequest-rpg/island-vertical.mjs';
const poses=['idle','walk','run','sprint','turn','jump','takeoff','jump-apex','fall','land','climb','crouch','slide','roll','mount','dismount','ride-bike','ride-rover','ride-hover','dash','fly','grapple','jetpack','wall'];
function finite(root){
 root.updateMatrixWorld(true);
 root.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite),'Non-finite transform: '+o.name);});
}
for(const settings of [{},{style:'guardian',height:97,build:94,accessory:'satchel'},{hairStyle:'crest',accessory:'staff'},{hairStyle:'long',accessory:'scarf'}]){
 const hero=createIslandAvatar(settings);
 for(const key of ['arms','legs','knees','elbows','wings'])assert.equal(hero.userData[key].length,2);
 for(const mode of poses){
  for(let i=0;i<24;i++)animateIslandAvatar(hero,{mode,time:i/60,delta:1/60,pace:.8,phase:i*.24,landing:.2,roll:.2,turn:.5,gear:['grapple','jetpack']});
  finite(hero);
 }
}
const scene=new THREE.Scene(),{fleet,update}=createVehicleFleet(scene,vehicles,elevation);
const skills=earnedSkills(sectors.flatMap(s=>s.rooms));
assert.equal(fleet.length,18);
for(const v of fleet){
 assert.equal(v.wheels.length,v.type==='bike'?2:v.type==='rover'?4:0);
 for(let i=0;i<30;i++){Object.assign(v,vehicleStep(v,{x:1,z:1},v.type,skills,1/60,{boost:true}));update(v,1/60,.4);}
 finite(v.root);
 assert(v.speed<=vehicleTypes[v.type].speed*(v.type==='rover'?1.35:1)+1e-9);
}
console.log('PASS 24 animation states x 4 avatar presets, 18 vehicle models, finite transforms and speed bounds.');
