import * as THREE from 'three';
// Original block-style character: independent of the room solver's model.
export function createIslandAvatar(settings={}){
 const root=new THREE.Group(),rig=new THREE.Group();root.add(rig);
 const color=(value,fallback)=>new THREE.MeshStandardMaterial({color:value||fallback,roughness:.72});
 const skin=color(settings.skin,'#d7a880'),armor=color(settings.armor,'#48796b'),hair=color(settings.hair,'#292b31'),capeMat=color(settings.cape,'#b4a27f'),dark=color('#263746'),trim=color('#d7be82'),eye=color('#273342');
 const box=(parent,w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m;};
 const pivot=(x,y,z)=>{const p=new THREE.Group();p.position.set(x,y,z);rig.add(p);return p;};
 box(rig,.76,.72,.43,armor,0,1.15,0);
 box(rig,.78,.13,.46,dark,0,.83,0);
 box(rig,.28,.22,.045,trim,0,1.26,.24);
 const head=pivot(0,1.65,0);
 box(head,.58,.53,.53,skin,0,.18,0);
 box(head,.60,.15,.55,hair,0,.43,0);
 if(settings.hairStyle==='none')head.children.at(-1).visible=false;
 if(settings.hairStyle==='crest')box(head,.16,.20,.48,hair,0,.56,0);
 if(settings.hairStyle==='long')for(const s of [-1,1])box(head,.12,.41,.48,hair,s*.29,.15,-.04);
 for(const s of [-1,1])box(head,.065,.085,.022,eye,s*.13,.20,.276);
 box(head,.16,.024,.025,eye,0,.075,.277);
 const arms=[],legs=[];
 for(const s of [-1,1]){
  const leg=pivot(s*.20,.78,0);box(leg,.32,.57,.35,dark,0,-.27,0);box(leg,.34,.19,.44,trim,0,-.65,.045);legs.push(leg);
  const arm=pivot(s*.54,1.45,0);box(arm,.25,.43,.32,armor,0,-.18,0);box(arm,.24,.23,.30,skin,0,-.48,0);arms.push(arm);
  if(settings.style==='guardian')box(arm,.36,.19,.40,trim,0,-.02,0);
 }
 const cape=pivot(0,1.48,-.25);box(cape,.64,.75,.055,capeMat,0,-.37,0);
 if(settings.accessory==='satchel')box(rig,.29,.30,.23,trim,.40,.95,-.22);
 if(settings.accessory==='scarf')box(rig,.80,.12,.48,capeMat,0,1.49,0);
 if(settings.accessory==='staff')box(arms[1],.07,1.15,.07,trim,.19,-.25,.12);
 const wings=[];for(const s of [-1,1]){
  const w=pivot(s*.40,1.25,-.26);box(w,.85,.26,.10,trim,s*.41,0,0);box(w,.60,.17,.085,capeMat,s*.59,-.19,0);w.visible=false;wings.push(w);
 }
 root.scale.set((Number(settings.build)||100)/100,(Number(settings.height)||100)/100,(Number(settings.build)||100)/100);
 root.userData={rig,arms,legs,cape,head,wings};return root;
}
export function animateIslandAvatar(hero,{time=0,delta=.016,pace=0,mode='idle',phase=0}={}){
 const {rig,arms,legs,cape,head,wings}=hero.userData;
 const smooth=Math.min(1,delta*17),mix=(obj,axis,value)=>obj.rotation[axis]+=(value-obj.rotation[axis])*smooth;
 const swing=Math.sin(phase)*(mode==='sprint'?1.05:.65)*pace;
 const idle=Math.sin(time*2.2)*.025;
 for(let i=0;i<2;i++){
  const sign=i?1:-1;let leg=sign*swing,arm=-sign*swing*.82,spread=0;
  if(mode==='climb'){leg=sign*Math.sin(phase)*.62;arm=-2.1-sign*Math.sin(phase)*.45;}
  if(mode==='jump'){leg=i?-.85:.45;arm=-1.0;}
  if(mode==='dash'){leg=sign*.36;arm=.9;}
  if(mode==='fly'){leg=.25;arm=-.20;spread=sign*.60;}
  if(mode==='wall'){leg=sign*swing;arm=-1.1;spread=sign*.28;}
  if(mode==='crouch'){leg=sign*swing*.42+.28;arm=-.45;}
  mix(legs[i],'x',leg);mix(arms[i],'x',arm+idle);mix(arms[i],'z',spread);
  wings[i].visible=mode==='fly';mix(wings[i],'z',Math.sin(time*8)*.25*sign);
 }
 mix(rig,'x',mode==='dash'?-.42:mode==='fly'?-.18:mode==='sprint'?-.12:mode==='crouch'?.20:0);
 mix(rig,'z',mode==='wall'?.23:0);mix(cape,'x',mode==='fly'?.8:mode==='dash'?.95:idle+pace*.20);
 mix(head,'y',mode==='idle'?Math.sin(time*.85)*.13:0);
 rig.position.y=mode==='climb'||mode==='fly'?0:Math.abs(Math.sin(phase))*.055*pace+idle*.16;
}
