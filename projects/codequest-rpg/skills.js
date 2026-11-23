import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import {motion, samplePose} from './skill-motion.js';

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const pulse=(t,c,w)=>Math.max(0,1-Math.abs(t-c)/w);
const HERO='ijr-codequest-world-hero-v1';
const DEFAULT={name:'Code Explorer',style:'guardian',personality:'brave',skin:'#d7a880',armor:'#48796b',hair:'#292b31',cape:'#b4a27f',hairStyle:'short',accessory:'satchel',height:100,build:100};
let avatar={...DEFAULT};
try{const stored=JSON.parse(localStorage.getItem(HERO)||'{}');if(stored&&typeof stored==='object')avatar={...avatar,...stored}}catch{}
const definitions={
warrior:[
{id:'combo',title:'Triple Slash',subtitle:'Three consecutive blade strikes',length:3.25,signature:'combo(hits=3, strength=2)',phases:['Wind-up','Slash I','Slash II','Finisher','Recovery']},
{id:'spin',title:'Cyclone Blade',subtitle:'A full-body spinning sword attack',length:3.35,signature:'spin_blade(turns=2)',phases:['Charge','Spin I','Spin II','Shockwave','Recovery']},
{id:'ground',title:'Earthbreaker',subtitle:'Heavy overhead strike and expanding impact ring',length:3.2,signature:'earthbreaker(force=3)',phases:['Raise sword','Leap','Smash','Ground ring','Recovery']}],
wizard:[
{id:'fireball',title:'Fireball',subtitle:'Charge an ember, launch it and trigger an impact',length:3.6,signature:'fireball(power=3, distance=5)',phases:['Gather flame','Charge orb','Launch projectile','Detonation','Dissipation']},
{id:'frost',title:'Frost Nova',subtitle:'A cold ring expands across the training circle',length:3.2,signature:'frost_nova(radius=4)',phases:['Focus','Crystal forming','Ice wave','Frozen sparks','Recovery']},
{id:'meteor',title:'Meteor Shower',subtitle:'Three blazing meteors with staggered impacts',length:4.15,signature:'meteor_shower(count=3)',phases:['Summon','Meteor I','Meteor II','Meteor III','Afterglow']}],
scout:[
{id:'dashstrike',title:'Shadow Dash',subtitle:'An evasive dash followed by a rapid hit',length:3.15,signature:'shadow_dash(distance=3)',phases:['Crouch','Dash','Backstab','Return','Recovery']},
{id:'arrows',title:'Triple Arrow',subtitle:'Three precisely timed ranged projectiles',length:3.8,signature:'multi_shot(count=3)',phases:['Draw','Arrow I','Arrow II','Arrow III','Reset']},
{id:'afterimage',title:'Afterimage Step',subtitle:'Quick evasive footwork and ghost trails',length:3.4,signature:'afterimage(steps=3)',phases:['Prepare','Evade left','Evade right','Cross strike','Recovery']}]
};
const shared={
dash:{id:'dash',title:'Quick Dash',subtitle:'A rapid repositioning move available to every hero',length:2.3,signature:'quick_dash(distance=2)',phases:['Anticipate','Acceleration','Slide','Recover']},
barrier:{id:'barrier',title:'Barrier Pulse',subtitle:'A protective spherical shield and expanding pulse',length:3.15,signature:'barrier(duration=2)',phases:['Focus','Shield growth','Pulse','Fade']}
};
const CLASS={warrior:{color:0xe7b874,label:'WARRIOR · SWORD TECHNIQUES'},wizard:{color:0xf5a65e,label:'WIZARD · ELEMENTAL MAGIC'},scout:{color:0x7ed7bf,label:'SCOUT · PRECISION & MOBILITY'}};
const mat=(hex,rough=.6)=>new THREE.MeshStandardMaterial({color:hex,roughness:rough,metalness:.1});
const glow=(hex,opacity=1)=>new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
const scene=new THREE.Scene();scene.background=new THREE.Color('#1c3038');scene.fog=new THREE.FogExp2('#1c3038',.052);
const camera=new THREE.PerspectiveCamera(42,1,.1,60);camera.position.set(6.7,5.8,10.5);
const renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,$('scene'));controls.enableDamping=true;controls.target.set(0,1,0);controls.minDistance=6;controls.maxDistance=20;controls.maxPolarAngle=Math.PI/2.03;
scene.add(new THREE.HemisphereLight('#b3d7ff','#75604e',1.85));
const sun=new THREE.DirectionalLight('#fff3d5',2.5);sun.position.set(-5,11,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.035;sun.shadow.camera.left=-11;sun.shadow.camera.right=11;sun.shadow.camera.top=11;sun.shadow.camera.bottom=-11;scene.add(sun);
const world=new THREE.Group();scene.add(world);
const stone=mat('#84998b',.95),floorA=mat('#cedac9',1),floorB=mat('#aabfad',1),dark=mat('#435e50',.9);
function cub(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
function ball(g,r,m,x,y,z){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o}
function cyl(g,a,b,h,m,x,y,z,segments=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,segments),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
const groundTint=mat('#33484e',1), brass=mat('#ad8a52',.36);
cyl(world,100,100,.25,groundTint,0,-.76,0,48);
cyl(world,7.25,7.55,.42,dark,0,-.41,0,64);
cyl(world,7.24,7.24,.20,stone,0,-.11,0,64);
const tileGroups=[[],[]];
for(let x=-6;x<=6;x++)for(let z=-6;z<=6;z++){
  if(Math.hypot(x,z)<6.7)tileGroups[Math.abs(x+z)%2].push([x,z]);
}
const tileGeometry=new THREE.BoxGeometry(.97,.045,.97);
tileGroups.forEach((tiles,i)=>{
  const mesh=new THREE.InstancedMesh(tileGeometry,i?floorA:floorB,tiles.length);
  const matrix=new THREE.Matrix4();
  tiles.forEach(([x,z],j)=>mesh.setMatrixAt(j,matrix.makeTranslation(x,-.043,z)));
  mesh.receiveShadow=true;
  world.add(mesh);
});
const lantern=glow('#ffc985');
for(let i=0;i<10;i++){
  const angle=i*Math.PI/5, x=6.5*Math.cos(angle), z=6.5*Math.sin(angle);
  cyl(world,.31,.42,.30,stone,x,.11,z,6);
  cyl(world,.19,.27,.73,dark,x,.55,z,6);
  cyl(world,.25,.20,.11,brass,x,.95,z,6);
  ball(world,.135,lantern,x,1.1,z).castShadow=false;
  const ridge=cyl(world,.25,1.45,3.1+1.2*Math.sin(i*1.7),groundTint,x*2.27,.2,z*2.27,5);
  ridge.rotation.z=.17*Math.cos(i);
}
for(const radius of [2.25,2.42,6.95]){
  const band=new THREE.Mesh(new THREE.RingGeometry(radius,radius+.025,96),glow('#78caba',.55));
  band.rotation.x=-Math.PI/2;
  band.position.y=.009;
  world.add(band);
}
for(let i=0;i<24;i++){
  const angle=i*Math.PI/12;
  const mark=cub(world,.055,.014,i%3===0?.25:.095,brass,2.55*Math.sin(angle),0,2.55*Math.cos(angle));
  mark.rotation.y=angle;
  mark.castShadow=false;
}
const rim=new THREE.DirectionalLight('#76dce9',1.35);
rim.position.set(1,4,-6);
scene.add(rim);
const heroRoot=new THREE.Group(),targetRoot=new THREE.Group();scene.add(heroRoot,targetRoot);targetRoot.position.set(3,0,0);
let bodyRig,weapon;
function makeHero(){
  const materials=new Set();
  heroRoot.traverse(object=>{
    object.geometry?.dispose();
    if(object.material)materials.add(object.material);
  });
  materials.forEach(material=>material.dispose());
  heroRoot.clear();
  const skin=mat(avatar.skin,.85), armor=mat(avatar.armor), hair=mat(avatar.hair);
  const cape=mat(avatar.cape,.94), metal=mat('#c5d8df',.32), boots=mat('#25343c',.9);
  const face=mat('#162c33'), accent=mat(CLASS[heroClass].color,.36);
  const warrior=heroClass==='warrior', wizard=heroClass==='wizard';
  const torso=new THREE.Group(), head=new THREE.Group();
  torso.position.y=.99;
  heroRoot.add(torso);
  head.position.y=.55;
  torso.add(head);
  cyl(torso,warrior?.40:.31,.25,.59,armor,0,.04,0,8).scale.z=.68;
  cub(torso,.52,.10,.34,boots,0,-.24,0);
  cub(torso,.15,.12,.04,accent,0,-.23,.18);
  const crest=ball(torso,.093,accent,0,.16,.239);
  crest.scale.z=.32;
  const faceMesh=ball(head,.235,skin,0,.16,0);
  faceMesh.scale.set(.94,1.12,.93);
  for(const x of [-.088,.088])ball(head,.022,face,x,.184,.199);
  if(avatar.hairStyle!=='none'){
    ball(head,.252,hair,0,.31,-.027).scale.set(1,.54,.95);
    if(avatar.hairStyle==='crest')cub(head,.13,.18,.25,hair,0,.44,-.035);
    if(avatar.hairStyle==='long')for(const x of [-.17,.17])cub(head,.11,.34,.17,hair,x,.15,-.13);
  }
  if(wizard){
    cyl(head,.31,.33,.045,armor,0,.39,0);
    cyl(head,.035,.217,.37,armor,0,.56,-.02).rotation.z=.23;
    cyl(head,.197,.222,.046,accent,0,.415,0);
  }
  const arms=[], elbows=[], legs=[], knees=[];
  for(const side of [-1,1]){
    const shoulder=new THREE.Group(), elbow=new THREE.Group();
    shoulder.position.set(side*(warrior?.41:.34),.22,0);
    elbow.position.y=-.28;
    torso.add(shoulder);
    shoulder.add(elbow);
    ball(shoulder,warrior?.177:.124,warrior?metal:armor,0,0,0).scale.y=.72;
    cyl(shoulder,.105,.08,.26,armor,0,-.13,0);
    cyl(elbow,.09,.069,.23,warrior?metal:boots,0,-.1,0);
    ball(elbow,.082,skin,0,-.246,0);
    arms.push(shoulder);
    elbows.push(elbow);
    const leg=new THREE.Group(), knee=new THREE.Group();
    leg.position.set(side*.145,.72,0);
    knee.position.y=-.33;
    heroRoot.add(leg);
    leg.add(knee);
    cyl(leg,.114,.084,.33,armor,0,-.15,0);
    cyl(knee,.087,.076,.33,boots,0,-.17,0);
    cub(knee,.167,.115,.26,boots,0,-.326,.045);
    legs.push(leg);
    knees.push(knee);
  }
  const cloak=new THREE.Group();
  cloak.position.set(0,.255,-.23);
  torso.add(cloak);
  const capeLength=wizard?.94:warrior?.71:.49;
  for(let i=0;i<5;i++){
    const panel=cub(cloak,.11,capeLength-.05*Math.abs(i-2),.034,cape,(i-2)*.105,-capeLength/2,-.022*Math.abs(i-2));
    panel.rotation.z=(i-2)*.035;
  }
  weapon=new THREE.Group();
  weapon.position.y=-.246;
  elbows[1].add(weapon);
  if(warrior){
    cyl(weapon,.044,.046,.24,boots,0,-.015,0);
    cub(weapon,.34,.066,.10,accent,0,.11,0);
    cub(weapon,.113,.69,.055,metal,0,.48,0);
    cyl(weapon,0,.08,.15,metal,0,.9,0,4).rotation.y=Math.PI/4;
    cub(weapon,.021,.66,.061,accent,0,.48,0);
  }else if(wizard){
    cyl(weapon,.037,.052,1.52,boots,0,.35,0);
    cyl(weapon,.068,.05,.17,accent,0,1.04,0);
    const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.142),glow('#ffbe75'));
    crystal.position.y=1.2;
    weapon.add(crystal);
  }else{
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,-.53,0),new THREE.Vector3(0,0,.48),new THREE.Vector3(0,.53,0));
    weapon.add(new THREE.Mesh(new THREE.TubeGeometry(curve,24,.038,8,false),accent));
    cyl(weapon,.009,.009,1.06,metal,0,0,0,6);
    cub(weapon,.083,.18,.075,boots,0,0,.22);
  }
  bodyRig={torso,head,arms,elbows,legs,knees,cloak};
}
function makeTarget(){targetRoot.clear();const stand=cyl(targetRoot,.5,.72,.45,stone,0,.2,0);const dummy=mat('#a77962');cyl(targetRoot,.33,.38,1.05,dummy,0,1.02,0,10);ball(targetRoot,.25,mat('#ba977c'),0,1.73,0);for(const x of [-.45,.45])cub(targetRoot,.2,.64,.22,dummy,x,1.08,0);const sign=new THREE.Mesh(new THREE.TorusGeometry(.24,.06,9,32),glow('#e9c0a0'));sign.position.set(0,1.09,.38);targetRoot.add(sign)}
makeTarget();
let heroClass='warrior',skill=definitions.warrior[0],elapsed=0,playing=false,previewRate=1;
let fx=[], activePhase=-1;
const targetPoint=new THREE.Vector3(3,1.14,0);
const weaponPoint=new THREE.Vector3();
const bladeTip=new THREE.Vector3(0,.94,0);
const meleePosition={combo:.25,spin:.62,ground:.78,afterimage:1.35};
const player=$('scrub');
const code=$('motionCode');

function contactPoint(){
  return heroClass==='warrior'?weapon.localToWorld(bladeTip.clone()):weapon.getWorldPosition(new THREE.Vector3());
}

function cleanFx(){
  for(const object of fx){
    scene.remove(object);
    object.geometry.dispose();
    object.material.dispose();
  }
  fx=[];
}
function resetPose(){
  heroRoot.scale.set(Number(avatar.build)/100,Number(avatar.height)/100,Number(avatar.build)/100);
  poseAt(0);
  targetRoot.rotation.set(0,0,0);
}
function poseAt(time){
  const [x,y,z,yaw,lean,right,left]=samplePose(motion[skill.id],time,skill.length);
  const {torso,head,arms,elbows,legs,knees,cloak}=bodyRig;
  const effort=Math.min(1,Math.abs(lean)*1.7+y);
  const travel=motion[skill.id].poses.some(frame=>Math.abs(frame[3])>.4)||skill.id==='dash';
  const stride=travel?Math.sin(time*14)*effort:0;
  heroRoot.position.set(-2+x,y,z);
  heroRoot.rotation.set(0,Math.PI/2+yaw,0);
  torso.position.y=.99-effort*.10;
  torso.rotation.set(lean,.23*(right-left),.12*stride);
  head.rotation.set(-lean*.55,-torso.rotation.y*.7,0);
  arms[0].rotation.set(left,0,.12+effort*.2);
  arms[1].rotation.set(right,0,-.12+Math.sin(right-left)*.45);
  elbows[0].rotation.x=-.2-Math.abs(left)*.34;
  elbows[1].rotation.x=-.2-Math.abs(right)*.26;
  legs.forEach((leg,i)=>{
    const direction=i===0?-1:1;
    leg.rotation.set(-effort*.3+direction*stride*.68,0,direction*.07);
    knees[i].rotation.x=effort*.58+Math.max(0,-direction*stride)*.7;
  });
  cloak.rotation.set(.13+effort*.52,.34*stride,0);
  weapon.rotation.z=heroClass==='warrior'?-1.18+right*.25:heroClass==='scout'?.18:0;
}
function selectClass(c){heroClass=c;document.querySelectorAll('[data-class]').forEach(b=>b.classList.toggle('selected',b.dataset.class===c));$('classIndicator').textContent=c.toUpperCase();$('stageCategory').textContent=CLASS[c].label;makeHero();selectSkill(definitions[c][0].id);renderList()}
function skillById(id){return shared[id]||definitions[heroClass].find(s=>s.id===id)}
const prerequisites={combo:[],spin:['combo'],ground:['combo'],fireball:[],frost:['fireball'],meteor:['fireball'],dashstrike:[],arrows:['dashstrike'],afterimage:['dashstrike']};
const classStyles={warrior:'guardian',wizard:'mage',scout:'scout'};
const progressKey='ijr-codequest-skill-previews-v1';
let seen=new Set();
try{
  const saved=JSON.parse(localStorage.getItem(progressKey)||'[]');
  if(Array.isArray(saved))seen=new Set(saved);
}catch{}
function renderList(){
  const host=$('skillButtons');
  const items=definitions[heroClass];
  host.replaceChildren();
  $('skillCount').textContent=items.filter(item=>seen.has(item.id)).length+' / '+items.length+' previewed';
  for(const [index,item] of items.entries()){
    const button=document.createElement('button');
    button.dataset.skill=item.id;
    button.className=index===0?'treeRoot':'treeBranch';
    button.setAttribute('aria-pressed',String(item.id===skill.id));
    button.classList.toggle('selected',item.id===skill.id);
    button.classList.toggle('previewed',seen.has(item.id));
    const name=document.createElement('b');
    name.textContent=item.title;
    const desc=document.createElement('small');
    const parent=prerequisites[item.id][0];
    desc.textContent=(parent?'Builds on '+items[0].title:'Foundation')+(seen.has(item.id)?' · Previewed':'');
    button.append(name,desc);
    button.onclick=()=>selectSkill(item.id);
    host.append(button);
  }
}
function selectSkill(id){
  const next=skillById(id);
  if(!next)return;
  skill=next;
  targetPoint.x=meleePosition[id]??3;
  targetRoot.position.x=targetPoint.x;
  player.max=skill.length;
  showCode();
  playing=false;
  elapsed=0;
  activePhase=-1;
  cleanFx();
  resetPose();
  $('skillName').textContent=skill.title;
  $('skillDescription').textContent=skill.subtitle;
  $('signature').textContent=skill.signature;
  $('animationStatus').textContent='READY';
  $('replay').textContent='▶ Preview animation';
  $('phaseList').replaceChildren(...skill.phases.map(label=>{
    const node=document.createElement('span');
    node.textContent=label;
    return node;
  }));
  document.querySelectorAll('[data-skill]').forEach(button=>{
    const selected=button.dataset.skill===id;
    button.classList.toggle('selected',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
  updateTimeline(0);
}
function replay(){
  elapsed=0;
  resetPose();
  buildEffects();
  updateTimeline(0);
  playing=true;
  $('animationStatus').textContent='PLAYING';
  $('replay').textContent='↻ Replay animation';
}
function effect(geometry,color,start,duration,update){
  const object=new THREE.Mesh(geometry,glow(color,0));
  object.visible=false;
  scene.add(object);
  object.userData={start,duration,update};
  fx.push(object);
  return object;
}
function wave(start,center,color,radius){
  const ring=effect(new THREE.RingGeometry(.81,1,64),color,start,.72,(mesh,u)=>{
    mesh.scale.setScalar(.25+smooth(u)*radius);
    mesh.material.opacity=.83*(1-u)**2;
  });
  ring.rotation.x=-Math.PI/2;
  ring.position.set(center.x,.034,center.z);
}
function sparks(start,center,color){
  for(let i=0;i<9;i++){
    const angle=i*2.39996;
    const speed=.65+(i%4)*.28;
    effect(new THREE.OctahedronGeometry(.047+i%3*.013),color,start,.56,(mesh,u)=>{
      mesh.position.set(center.x+Math.cos(angle)*u*speed,Math.max(.07,center.y+u*(1.4+speed)-2.8*u*u),center.z+Math.sin(angle)*u*speed);
      mesh.scale.setScalar(1-u*.85);
      mesh.rotation.set(u*5,i+u*7,0);
      mesh.material.opacity=1-u;
    });
  }
}
function trail(start,color){
  const points=[];
  for(let i=0;i<10;i++){
    poseAt(start-.18+i*.029);
    points.push(contactPoint());
  }
  const arc=new THREE.CatmullRomCurve3(points);
  effect(new THREE.TubeGeometry(arc,24,.07,7,false),color,start-.16,.39,(mesh,u)=>{
    mesh.material.opacity=Math.sin(Math.PI*u)*.94;
  });
}
function movementEchoes(times,color){
  times.forEach(time=>{
    poseAt(time);
    heroRoot.updateMatrixWorld(true);
    const positions=[bodyRig.head,bodyRig.torso,...bodyRig.elbows].map(part=>part.getWorldPosition(new THREE.Vector3()));
    positions.forEach((position,i)=>{
      const ghost=effect(new THREE.IcosahedronGeometry(i===1?.28:.13,1),color,time,.36,(mesh,u)=>{
        mesh.scale.setScalar(1+u*.56);
        mesh.material.opacity=.37*(1-u)**2;
      });
      ghost.position.copy(position);
      if(i===1)ghost.geometry.scale(.75,1.32,.75);
    });
  });
}
function buildEffects(){
  cleanFx();
  const id=skill.id, track=motion[id], color=CLASS[heroClass].color;
  track.launches?.forEach((start,i)=>{
    const finish=track.hits[i];
    poseAt(start);
    const from=id==='meteor'?new THREE.Vector3(.8+i*1.65,5.4,-2+i*.95):weapon.getWorldPosition(new THREE.Vector3());
    if(id==='fireball')from.y+=.27;
    const to=targetPoint.clone();
    const geometry=id==='arrows'?new THREE.ConeGeometry(.056,.48,6):new THREE.IcosahedronGeometry(id==='meteor'?.29:.19,1);
    const direction=to.clone().sub(from).normalize();
    for(let j=0;j<4;j++){
      effect(geometry.clone(),color,start+j*.028,finish-start-j*.028,(mesh,u)=>{
        const travel=u*(1-j*.075);
        mesh.position.lerpVectors(from,to,travel);
        if(id==='fireball')mesh.position.y+=.58*Math.sin(Math.PI*travel);
        if(id==='arrows')mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
        else mesh.rotation.set(travel*6,travel*8,0);
        mesh.scale.setScalar(1-j*.17);
        mesh.material.opacity=(1-j*.19)*Math.min(1,(1-u)*12);
      });
    }
    geometry.dispose();
  });
  if(id==='fireball'){
    effect(new THREE.IcosahedronGeometry(.19,2),color,.48,.99,(mesh,u)=>{
      weapon.getWorldPosition(weaponPoint);
      mesh.position.copy(weaponPoint);
      mesh.position.y+=.27;
      mesh.scale.setScalar(.24+u*.76+Math.sin(u*20)*.08);
      mesh.rotation.y=u*6;
      mesh.material.opacity=Math.min(1,u*4);
    });
  }
  if(id==='barrier'){
    effect(new THREE.IcosahedronGeometry(1.12,2),'#8af2dd',.53,2.28,(mesh,u)=>{
      mesh.position.copy(heroRoot.position);
      mesh.position.y+=1.02;
      mesh.scale.setScalar(.18+smooth(u*2.8)*1.05);
      mesh.rotation.y=u*2;
      mesh.material.opacity=.67*Math.sin(Math.PI*u)**.82;
    }).material.wireframe=true;
  }
  if(['dash','dashstrike','afterimage'].includes(id)){
    const times=id==='afterimage'?[.55,.67,1.19,1.32,1.89,2.03]:id==='dash'?[.57,.66,.76,.86]:[.65,.78,.91,1.02];
    movementEchoes(times,color);
  }
  track.hits?.forEach(time=>{
    poseAt(time);
    const center=['frost','barrier','spin'].includes(id)?heroRoot.position.clone():['combo','ground','dashstrike','afterimage'].includes(id)?contactPoint():targetPoint;
    if(['combo','ground','spin','dashstrike','afterimage'].includes(id))trail(time,color);
    if(id!=='arrows'&&id!=='combo'&&id!=='dashstrike')wave(time,center,color,id==='frost'?3.8:2.05);
    sparks(time,new THREE.Vector3(center.x,Math.max(.25,center.y),center.z),color);
  });
  poseAt(0);
}
function showCode(){
  const track=motion[skill.id];
  const first=track.poses[0];
  code.textContent=[
    '// [second, forward, jump, lateral, turn, lean, right arm, left arm]',
    'const firstPose = '+JSON.stringify(first)+';',
    'const phaseStarts = '+JSON.stringify(track.phases)+';',
    'const impactTimes = '+JSON.stringify(track.hits??[])+';',
  ].join('\n');
}
function updateTimeline(time){
  player.value=time;
  const phase=motion[skill.id].phases.findLastIndex(start=>time>=start);
  if(phase!==activePhase){
    activePhase=phase;
    Array.from($('phaseList').children).forEach((node,i)=>node.classList.toggle('active',i===phase));
    $('phaseLabel').textContent=skill.phases[phase];
  }
  player.setAttribute('aria-valuetext',time.toFixed(2)+' seconds · '+skill.phases[phase]);
  $('timelineFill').style.width=100*time/skill.length+'%';
  $('timeReadout').textContent=time.toFixed(1)+' / '+skill.length.toFixed(1)+' s';
}
function applyMotion(time){
  poseAt(time);
  for(const object of fx){
    const {start,duration,update}=object.userData;
    const u=(time-start)/duration;
    object.visible=u>=0&&u<1;
    if(object.visible)update(object,u);
  }
  const miss=['frost','barrier'].includes(skill.id);
  const impact=miss?0:Math.max(0,...(motion[skill.id].hits||[]).map(hit=>time>=hit?.18*pulse(time,hit+.08,.08):0));
  targetRoot.rotation.z=-impact;
  updateTimeline(time);
}
document.querySelectorAll('[data-class]').forEach(b=>b.addEventListener('click',()=>selectClass(b.dataset.class)));
document.querySelectorAll('.sharedButtons button').forEach(b=>b.addEventListener('click',()=>selectSkill(b.dataset.skill)));
$('replay').onclick=replay;
player.oninput=()=>{
  const time=Number(player.value);
  if(!fx.length&&time>0)buildEffects();
  elapsed=time;
  playing=false;
  $('animationStatus').textContent='PAUSED';
  applyMotion(time);
};
$('pause').onclick=()=>{if(playing){playing=false;$('animationStatus').textContent='PAUSED'}else if(elapsed===0){replay()}else if(elapsed<skill.length){playing=true;$('animationStatus').textContent='PLAYING'}};
$('reset').onclick=()=>selectSkill(skill.id);
$('speed').onchange=()=>{previewRate=Number($('speed').value)};
function loadForm(){const lookup={name:'name',classSelect:'style',skin:'skin',armor:'armor',hair:'hair',cape:'cape',hairStyle:'hairStyle',personality:'personality'};for(const [id,key] of Object.entries(lookup))$(id).value=id==='classSelect'?classStyles[heroClass]:avatar[key]}
function creatorOpen(){loadForm();$('creatorOverlay').hidden=false}
$('openCreator').onclick=creatorOpen;$('changeHero').onclick=creatorOpen;
$('closeCreator').onclick=()=>{$('creatorOverlay').hidden=true};
$('saveCreator').onclick=()=>{const ids={name:'name',skin:'skin',armor:'armor',hair:'hair',cape:'cape',hairStyle:'hairStyle',personality:'personality'};for(const [id,key] of Object.entries(ids))avatar[key]=$(id).value;avatar.style=$('classSelect').value;try{localStorage.setItem(HERO,JSON.stringify(avatar))}catch{}$('creatorOverlay').hidden=true;selectClass(({guardian:'warrior',mage:'wizard',scout:'scout'})[avatar.style]||'warrior')};
function resize(){const rect=$('stage').getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe($('stage'));
let lastTime=performance.now();
document.addEventListener('visibilitychange',()=>{lastTime=performance.now()});
function frame(now){requestAnimationFrame(frame);const dt=Math.max(0,Math.min(.12,(now-lastTime)/1000));lastTime=now;
if(playing){elapsed=Math.min(skill.length,elapsed+dt*previewRate);applyMotion(elapsed);if(elapsed>=skill.length){playing=false;seen.add(skill.id);try{localStorage.setItem(progressKey,JSON.stringify([...seen]))}catch{}renderList();$('animationStatus').textContent='COMPLETE';$('replay').textContent='↻ Replay animation'}}
else if(elapsed===0){bodyRig.torso.position.y=.99+.018*Math.sin(now*.0023);bodyRig.cloak.rotation.x=.14+.04*Math.sin(now*.003);}
controls.update();renderer.render(scene,camera);
}requestAnimationFrame(frame);
selectClass(({guardian:'warrior',mage:'wizard',scout:'scout'})[avatar.style]||'warrior');
