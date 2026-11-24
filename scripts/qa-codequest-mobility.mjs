import assert from 'node:assert/strict';
import {sectors,sectorProgress,earnedSkills,depots,vehicles,vehicleTypes,canDrive,frontiers,frontierSurfaces,restoreFrontiers,vehicleStep,vehiclePathSafe,movementMode} from '../projects/codequest-rpg/island-mobility.mjs';
import {groundSafe,routeAdventure} from '../projects/codequest-rpg/island-adventure.mjs';
import {makeVertical,verticalStep,horizontalStep,elevation} from '../projects/codequest-rpg/island-vertical.mjs';
assert.equal(sectors.length,6);assert.deepEqual(sectors.flatMap(s=>s.rooms),Array.from({length:22},(_,i)=>i));
for(const s of sectors){
 assert(!earnedSkills(s.rooms.slice(0,-1)).has(s.skill));assert(earnedSkills(s.rooms).has(s.skill));
 assert.equal(frontierSurfaces(earnedSkills(s.rooms)).length,3);
 assert.equal(sectorProgress(s.rooms).filter(p=>p.unlocked).length,1);
}
const all=earnedSkills(sectors.flatMap(s=>s.rooms));assert.equal(all.size,6);assert.equal(frontierSurfaces(all).length,18);
assert.equal(depots.length,6);assert.equal(vehicles.length,18);assert.equal(new Set(vehicles.map(v=>v.id)).size,18);
for(const d of depots){
 assert(groundSafe(d.x,d.z));for(const v of d.vehicles){assert(groundSafe(v.x,v.z));assert(vehiclePathSafe(v.type,v,v));}
 const f=frontiers[d.zone];assert(f.y-elevation(f.x,f.z)>13);
 for(const p of f.surfaces){assert(p.y===f.y);assert(p.hx>2);}
 assert(f.surfaces[0].x+f.surfaces[0].hx>=f.surfaces[2].x-f.surfaces[2].hx);
}
assert(!canDrive('hover',new Set()));assert(canDrive('hover',all));assert(canDrive('bike',new Set()));assert(canDrive('rover',new Set()));
for(const type of Object.keys(vehicleTypes)){
 let v={x:0,z:0,vx:0,vz:0,yaw:0,speed:0};
 for(let i=0;i<100;i++)v=vehicleStep(v,{x:1,z:0},type,all,.05);
 assert(Math.abs(v.speed-vehicleTypes[type].speed)<.001);
 for(let i=0;i<100;i++)v=vehicleStep(v,{x:1,z:0},type,all,.05,{brake:true});
 assert.equal(v.speed,0);
}
let v={x:0,z:0,vx:0,vz:0,yaw:0,speed:0};
for(let i=0;i<100;i++)v=vehicleStep(v,{x:1,z:0},'rover',all,.05,{boost:true});
assert(v.speed>vehicleTypes.rover.speed);
assert(!vehiclePathSafe('rover',{x:12,z:-4},{x:12,z:4}),'River collision failed');
assert.deepEqual(restoreFrontiers(['frontier-0','frontier-0','bad']),['frontier-0']);
const jump=(scale)=>{let s=makeVertical(0);return verticalStep(s,{x:0,z:0,ground:0,dt:.01,jump:true,jumpScale:scale}).vy;};assert(jump(1.2)>jump(1));
assert(horizontalStep({x:0,z:0},{x:1,z:0},8,false,.05,1.65).x>horizontalStep({x:0,z:0},{x:1,z:0},8,false,.05).x);
for(const [input,mode] of [[{},'idle'],[{speed:8},'run'],[{speed:15,sprint:true},'sprint'],[{grounded:false,vy:5},'takeoff'],[{grounded:false,vy:0},'jump-apex'],[{grounded:false,vy:-6},'fall'],[{landing:.1},'land'],[{slide:.2},'slide'],[{vehicle:'bike'},'ride-bike']])assert.equal(movementMode(input),mode);
console.log('PASS 6 sector-earned skills, 6 gated frontiers, 18 physical surfaces, 18 vehicles, acceleration/braking, river collision, skill upgrades and locomotion states.');
