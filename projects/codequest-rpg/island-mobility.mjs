// Original arcade mobility and academic-sector progression; deterministic pure rules.
import {islandDistricts,allRoomLocations,villageHouses} from './island-villages.mjs';
import {courses,platformList,elevation,approachVelocity} from './island-vertical.mjs';
import {groundSafe,segmentSafe,shrines,travelGates,circuits,traps,wallLane} from './island-adventure.mjs';
import {anchors,gear} from './island-airgear.mjs';
import {pythonWaystations,shore} from './island-exploration.mjs';
const skillDefs=[
 ['servo','Sprint servos','Sprint faster with powered boots.','Canopy Relay'],
 ['spring','Spring boots','Higher jump impulse for manual parkour.','Sunstone Sky Terrace'],
 ['turbo','Rover turbo','Hold Shift in a rover for extra torque.','Aether Motor Dock'],
 ['stabilizer','Air stabilizer','Stronger directional control during airborne jumps.','Signal Sky Garden'],
 ['hover','Hoverboard licence','Unlock personal hoverboards at mobility depots.','Clockwork Hover Lab'],
 ['thruster','Thruster regulator','Jetpack consumes less fuel.','Ember High Foundry']
];
let offset=0;
export const sectors=islandDistricts.map((d,i)=>{
 const rooms=Array.from({length:d.lots.length},(_,j)=>offset+j);offset+=rooms.length;
 const [skill,name,description,frontier]=skillDefs[i];return {id:d.id,zone:i,name:d.name,rooms,skill,skillName:name,description,frontier};
});
export function sectorProgress(completed){
 const done=new Set(completed);
 return sectors.map(s=>{const count=s.rooms.filter(i=>done.has(i)).length;return {...s,count,total:s.rooms.length,unlocked:count===s.rooms.length};});
}
export const earnedSkills=completed=>new Set(sectorProgress(completed).filter(s=>s.unlocked).map(s=>s.skill));
export const vehicleTypes={
 bike:{name:'Trail bike',speed:20,acceleration:18,brake:29,turn:5.5,radius:.40},
 rover:{name:'Explorer rover',speed:22,acceleration:13,brake:24,turn:3.4,radius:.72},
 hover:{name:'Hoverboard',speed:26,acceleration:20,brake:26,turn:5.7,radius:.38,skill:'hover'}
};
export const canDrive=(type,skills)=>!!vehicleTypes[type]&&(!vehicleTypes[type].skill||skills.has(vehicleTypes[type].skill));
const reserved=[...allRoomLocations(),...villageHouses,...shrines,...travelGates,...gear,...pythonWaystations,...traps,...circuits.flatMap(c=>[...c.steps,c.reward]),...platformList,
 {x:23,z:24},{x:25,z:-53},{x:14,z:46},{x:-76,z:11},{x:24,z:-44},{x:-33,z:66},{x:-38,z:77},{x:126,z:29},{x:25,z:-55},{x:-65,z:-7},{x:20,z:41},{x:-14,z:-46},{x:63,z:11},{x:wallLane.x,z:wallLane.z}];
export function createDepots(){
 const sites=[];
 for(const c of courses){
  let found=null;
  for(let r=7;r<=25&&!found;r+=2)for(let i=0;i<24&&!found;i++){
   const theta=i*Math.PI/12,x=Math.round(c.entry.x+Math.cos(theta)*r),z=Math.round(c.entry.z+Math.sin(theta)*r);
   const points=[{x,z},{x:x-2.8,z:z+2},{x:x+2.8,z:z+2},{x,z:z-3.3}];
   if(points.every(p=>shore(p.x,p.z)<.88&&Math.abs(p.z)>6&&groundSafe(p.x,p.z)&&reserved.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>4.2)&&anchors.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>2.5)&&sites.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>10))&&
    points.every(p=>segmentSafe({x,z},p)))found={id:'depot-'+c.zone,zone:c.zone,x,z,vehicles:[{id:'bike-'+c.zone,type:'bike',...points[1]},{id:'rover-'+c.zone,type:'rover',...points[2]},{id:'hover-'+c.zone,type:'hover',...points[3]}]};
  }
  if(!found)throw Error('No safe mobility depot '+c.id);sites.push(found);
 }
 return sites;
}
export const depots=createDepots();
export const vehicles=depots.flatMap(d=>d.vehicles.map(v=>({...v,zone:d.zone})));
export const frontiers=depots.map(d=>{
 // Each region is above its depot, with a continuous central deck and two wings.
 // Altitude exceeds ordinary jetpack reach. Locked surfaces never join collision.
 const y=elevation(d.x,d.z)+19;
 return {id:'frontier-'+d.zone,zone:d.zone,name:sectors[d.zone].frontier,x:d.x,z:d.z,y,skill:sectors[d.zone].skill,
  surfaces:[{id:'frontier-'+d.zone+'-main',x:d.x,z:d.z,hx:3.2,hz:3.2,y},
    {id:'frontier-'+d.zone+'-west',x:d.x-5.3,z:d.z,hx:2.2,hz:2.2,y},
    {id:'frontier-'+d.zone+'-east',x:d.x+5.3,z:d.z,hx:2.2,hz:2.2,y}],
  beacon:{x:d.x+5.3,z:d.z}};
});
export const frontierSurfaces=skills=>frontiers.filter(f=>skills.has(f.skill)).flatMap(f=>f.surfaces);
export const frontierStorage='cq-mobility-frontiers-v8';
export const restoreFrontiers=value=>[...new Set((Array.isArray(value)?value:[]).filter(id=>frontiers.some(f=>f.id===id)))];
export function vehicleStep(state,input,type,skills,dt,{boost=false,brake=false}={}){
 const cfg=vehicleTypes[type],n=Math.hypot(input.x,input.z),speed=cfg.speed*(type==='rover'&&boost&&skills.has('turbo')?1.35:1);
 const tx=n>.01&&!brake?input.x/n*speed:0,tz=n>.01&&!brake?input.z/n*speed:0;
 const accel=n>.01&&!brake?cfg.acceleration:cfg.brake;
 const vx=approachVelocity(state.vx,tx,accel,dt),vz=approachVelocity(state.vz,tz,accel,dt);
 const target=Math.hypot(vx,vz)>.15?Math.atan2(vx,vz):state.yaw;
 const yaw=state.yaw+Math.atan2(Math.sin(target-state.yaw),Math.cos(target-state.yaw))*Math.min(1,cfg.turn*dt);
 return {x:state.x+vx*dt,z:state.z+vz*dt,vx,vz,yaw,speed:Math.hypot(vx,vz)};
}
export function vehiclePathSafe(type,a,b){
 const r=vehicleTypes[type].radius;
 return [[0,0],[r,0],[-r,0],[0,r],[0,-r]].every(([dx,dz])=>segmentSafe({x:a.x+dx,z:a.z+dz},{x:b.x+dx,z:b.z+dz}));
}
export function movementMode({speed=0,sprint=false,grounded=true,vy=0,landing=0,slide=0,vehicle=null,turn=0}){
 if(vehicle)return 'ride-'+vehicle;
 if(slide>0)return 'slide';
 if(!grounded)return vy>2?'takeoff':vy>-2?'jump-apex':'fall';
 if(landing>0)return 'land';
 if(speed<.2)return 'idle';
 if(Math.abs(turn)>.8)return 'turn';
 return sprint?'sprint':speed>5?'run':'walk';
}
