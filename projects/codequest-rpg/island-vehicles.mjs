import * as THREE from 'three';
import {vehicleTypes} from './island-mobility.mjs';
// Shared geometry/materials: parked models are static, only the mounted model
// needs wheel/suspension animation. Original block-style vehicles.
export function createVehicleFleet(scene,definitions,elevation){
 const cache=new Map(),materials=new Map();
 const geom=(key,fn)=>{if(!cache.has(key))cache.set(key,fn());return cache.get(key);};
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.74}));return materials.get(color);};
 const box=(g,w,h,d,color,x,y,z)=>{const m=new THREE.Mesh(geom('b:'+w+','+h+','+d,()=>new THREE.BoxGeometry(w,h,d)),mat(color));m.position.set(x,y,z);g.add(m);return m;};
 const wheel=(g,x,z,r,width)=>{const pivot=new THREE.Group();pivot.position.set(x,r,z);g.add(pivot);const tire=new THREE.Mesh(geom('t:'+r+','+width,()=>new THREE.CylinderGeometry(r,r,width,12)),mat('#29343a'));tire.rotation.z=Math.PI/2;pivot.add(tire);const hub=new THREE.Mesh(geom('h:'+r+','+width,()=>new THREE.CylinderGeometry(r*.55,r*.55,width+.035,10)),mat('#b5c2c1'));hub.rotation.z=Math.PI/2;pivot.add(hub);return pivot;};
 const colors=['#5e9c7e','#c5a16d','#679bb7','#80a36f','#9782b0','#bb795b'];
 const fleet=definitions.map(v=>{
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);scene.add(root);
  const color=colors[v.zone],metal='#94a5a8',dark='#263841',wheels=[];
  if(v.type==='bike'){
   for(const z of [-.72,.72])wheels.push(wheel(body,0,z,.30,.16));
   box(body,.24,.27,1.12,color,0,.48,0);box(body,.34,.14,.48,dark,0,.78,-.16);
   box(body,.12,.60,.15,metal,0,.66,.55);box(body,.68,.075,.10,dark,0,.96,.54);
   box(body,.27,.20,.13,'#f6e1a4',0,.67,.73);
   box(body,.30,.08,.45,metal,0,.56,-.72);box(body,.27,.10,.42,color,0,.58,.72);box(body,.13,.12,.08,'#c65b45',0,.69,-.94);for(const x of [-.19,.19])box(body,.065,.10,.38,metal,x,.34,-.05);
  }else if(v.type==='rover'){
   for(const x of [-.66,.66])for(const z of [-.77,.77])wheels.push(wheel(body,x,z,.33,.24));
   box(body,1.27,.30,1.65,color,0,.43,0);box(body,1.18,.15,.78,dark,0,.68,-.23);
   box(body,1.10,.22,.54,color,0,.72,.59);box(body,.95,.11,.12,metal,0,.41,.90);
   for(const x of [-.43,.43]){box(body,.24,.19,.12,'#f5e0a5',x,.64,.89);box(body,.08,.52,.10,metal,x,.96,-.51);}
   box(body,1.0,.08,.10,metal,0,1.22,-.51);box(body,.32,.12,.18,dark,0,.94,.28);
   for(const x of [-.64,.64]){box(body,.24,.14,.55,color,x,.66,.73);box(body,.24,.14,.55,color,x,.66,-.73);box(body,.15,.16,.11,'#c65b45',x*.72,.55,-.87);}
   box(body,1.11,.09,.11,metal,0,.39,-.91);for(const x of [-.28,0,.28])box(body,.09,.14,.05,dark,x,.59,.93);
  }else{
   box(body,.65,.14,1.42,color,0,.32,0);box(body,.56,.07,1.26,dark,0,.43,0);for(const z of [-.42,0,.42])box(body,.42,.025,.065,metal,0,.481,z);
   for(const x of [-.28,.28]){box(body,.13,.13,1.34,'#8adbdc',x,.30,0);box(body,.15,.11,.21,metal,x,.31,.61);}
  }
  root.position.set(v.x,elevation(v.x,v.z),v.z);return {...v,root,body,wheels,yaw:0,vx:0,vz:0,speed:0,parked:true};
 });
 function update(v,dt,turn=0){v.root.position.set(v.x,elevation(v.x,v.z),v.z);v.root.rotation.y=v.yaw;v.body.rotation.z+=(Math.max(-.22,Math.min(.22,-turn*.16))-v.body.rotation.z)*(1-Math.exp(-dt*8));
 const slope=(elevation(v.x+Math.sin(v.yaw)*.6,v.z+Math.cos(v.yaw)*.6)-elevation(v.x-Math.sin(v.yaw)*.6,v.z-Math.cos(v.yaw)*.6))/1.2;
 v.body.rotation.x+=(-Math.atan(slope)-v.body.rotation.x)*(1-Math.exp(-dt*6));for(const w of v.wheels)w.rotation.x+=v.speed*dt/.32;}
 return {fleet,update};
}
