import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const pulse=(t,c,w)=>Math.max(0,1-Math.abs(t-c)/w);
const mix=(a,b,t)=>a+(b-a)*t;
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
const scene=new THREE.Scene();scene.background=new THREE.Color('#c4d5ca');scene.fog=new THREE.Fog('#c4d5ca',14,34);
const camera=new THREE.PerspectiveCamera(42,1,.1,60);camera.position.set(6.7,5.8,10.5);
const renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,$('scene'));controls.enableDamping=true;controls.target.set(0,1,0);controls.minDistance=6;controls.maxDistance=20;controls.maxPolarAngle=Math.PI/2.03;
scene.add(new THREE.HemisphereLight('#ffffff','#6a8e7b',2.8));
const sun=new THREE.DirectionalLight('#fff3d5',2.5);sun.position.set(-5,11,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-11;sun.shadow.camera.right=11;sun.shadow.camera.top=11;sun.shadow.camera.bottom=-11;scene.add(sun);
const world=new THREE.Group();scene.add(world);
const stone=mat('#84998b',.95),floorA=mat('#cedac9',1),floorB=mat('#aabfad',1),dark=mat('#435e50',.9);
function cub(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
function ball(g,r,m,x,y,z){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o}
function cyl(g,a,b,h,m,x,y,z,segments=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,segments),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
cub(world,15,.44,13,stone,0,-.38,0);
for(let x=-6;x<=6;x++)for(let z=-5;z<=5;z++)cub(world,.96,.08,.96,(x+z)%2?floorA:floorB,x,-.12,z);
for(const x of [-6.5,6.5])for(let z=-5;z<=5;z+=2){cyl(world,.09,.11,.8,dark,x,.23,z)}
for(const z of [-5.5,5.5])for(let x=-6;x<=6;x+=2){cyl(world,.09,.11,.8,dark,x,.23,z)}
for(const x of [-5,0,5])for(const z of [-4.5,4.5]){cyl(world,.20,.28,.72,stone,x,.29,z);ball(world,.2,mat('#f5d9a4'),x,.83,z)}
const rune=new THREE.Mesh(new THREE.TorusGeometry(2.2,.03,10,80),glow('#6e9e87',.55));rune.rotation.x=Math.PI/2;rune.position.y=.03;world.add(rune);
const heroRoot=new THREE.Group(),targetRoot=new THREE.Group();scene.add(heroRoot,targetRoot);targetRoot.position.set(3,0,0);
let bodyRig,weapon,baseColor,headMesh;
function makeHero(){heroRoot.clear();const skin=mat(avatar.skin,.9),armor=mat(avatar.armor),hair=mat(avatar.hair),capeMat=mat(avatar.cape,.94),metal=mat('#dbe3dd',.32),boots=mat('#3d4644',.9);
const torso=new THREE.Group();torso.position.set(0,.96,0);heroRoot.add(torso);
cub(torso,.65,.74,.41,armor,0,0,0);cub(torso,.69,.09,.45,metal,0,.34,0);
headMesh=ball(torso,.27,skin,0,.77,0);headMesh.scale.set(1,1.08,1);
for(const x of [-.11,.11])ball(torso,.038,mat('#24443a'),x,.82,.246);
if(avatar.hairStyle!=='none'){const h=ball(torso,.305,hair,0,1,.01);h.scale.y=.53;if(avatar.hairStyle==='crest')cub(torso,.15,.28,.32,hair,0,1.13,0);if(avatar.hairStyle==='long')for(const x of [-.20,.20])cub(torso,.12,.48,.16,hair,x,.79,-.15)}
const arms=[],legs=[];
for(const x of [-.45,.45]){const arm=new THREE.Group();arm.position.set(x,.24,0);torso.add(arm);cub(arm,.20,.63,.22,armor,0,-.22,0);arms.push(arm)}
for(const x of [-.18,.18]){const leg=new THREE.Group();leg.position.set(x,.47,0);heroRoot.add(leg);cub(leg,.21,.60,.26,boots,0,-.22,0);legs.push(leg)}
const cloak=cub(torso,.64,.78,.08,capeMat,0,-.2,-.29);cloak.rotation.x=.13;
const hand=arms[1];weapon=new THREE.Group();weapon.position.set(.02,-.55,.02);hand.add(weapon);
const warrior=heroClass==='warrior',wizard=heroClass==='wizard';
if(warrior){cyl(weapon,.055,.055,.43,boots,0,-.02,0);cub(weapon,.14,1.08,.095,metal,0,.58,0);cub(weapon,.43,.10,.18,mat('#d6bb73',.35),0,.05,0)}
else if(wizard){cyl(weapon,.055,.07,1.72,mat('#4c564a'),0,.42,0);ball(weapon,.15,glow('#f6c87d'),0,1.34,0)}
else{cub(weapon,.11,.85,.09,mat('#8a6947'),0,.45,0);cub(weapon,.07,.07,.7,metal,0,.75,0);cub(torso,.4,.38,.25,mat('#adbaa6'),-.12,-.11,-.29)}
heroRoot.scale.set(Number(avatar.build)/100,Number(avatar.height)/100,Number(avatar.build)/100);
bodyRig={torso,arms,legs,cloak};heroRoot.rotation.y=Math.PI/2;heroRoot.position.set(-2,0,0);
}
function makeTarget(){targetRoot.clear();const stand=cyl(targetRoot,.5,.72,.45,stone,0,.2,0);const dummy=mat('#a77962');cyl(targetRoot,.33,.38,1.05,dummy,0,1.02,0,10);ball(targetRoot,.25,mat('#ba977c'),0,1.73,0);for(const x of [-.45,.45])cub(targetRoot,.2,.64,.22,dummy,x,1.08,0);const sign=new THREE.Mesh(new THREE.TorusGeometry(.24,.06,9,32),glow('#e9c0a0'));sign.position.set(0,1.09,.38);targetRoot.add(sign)}
makeTarget();
let heroClass='warrior',skillId='combo',skill=definitions.warrior[0],elapsed=0,playing=false,previewRate=1,last=0,fx=[],beamCount=0,hitAt=-1,hitCount=0;
function cleanFx(){for(const object of fx){scene.remove(object);object.geometry?.dispose();if(Array.isArray(object.material))object.material.forEach(x=>x.dispose());else object.material?.dispose()}fx=[];hitCount=0;hitAt=-1}
function makeEffect(geo,material){const o=new THREE.Mesh(geo,material);o.frustumCulled=false;scene.add(o);fx.push(o);return o}
function resetPose(){heroRoot.position.set(-2,0,0);heroRoot.rotation.set(0,Math.PI/2,0);heroRoot.scale.set(Number(avatar.build)/100,Number(avatar.height)/100,Number(avatar.build)/100);targetRoot.rotation.set(0,0,0);targetRoot.scale.setScalar(1);bodyRig.torso.rotation.set(0,0,0);bodyRig.arms.forEach(a=>a.rotation.set(0,0,0));bodyRig.legs.forEach(a=>a.rotation.set(0,0,0));weapon.rotation.set(0,0,0);weapon.position.set(.02,-.55,.02)}
function selectClass(c){heroClass=c;document.querySelectorAll('[data-class]').forEach(b=>b.classList.toggle('selected',b.dataset.class===c));$('classIndicator').textContent=c.toUpperCase();$('stageCategory').textContent=CLASS[c].label;makeHero();renderList();selectSkill(definitions[c][0].id)}
function skillById(id){return shared[id]||definitions[heroClass].find(s=>s.id===id)}
function renderList(){const host=$('skillButtons');host.innerHTML='';const items=definitions[heroClass];$('skillCount').textContent=items.length+' class skills';for(const item of items){const b=document.createElement('button');b.dataset.skill=item.id;const name=document.createElement('b');name.textContent=item.title;const desc=document.createElement('small');desc.textContent=item.subtitle;b.append(name,desc);b.onclick=()=>selectSkill(item.id);host.append(b)}}
function selectSkill(id){const next=skillById(id);if(!next)return;skillId=id;skill=next;playing=false;elapsed=0;hitAt=-1;cleanFx();resetPose();$('skillName').textContent=skill.title;$('skillDescription').textContent=skill.subtitle;$('signature').textContent=skill.signature;$('animationStatus').textContent='READY';$('replay').textContent='▶ Preview animation';$('timeReadout').textContent='0.0 / '+skill.length.toFixed(1)+' s';$('timelineFill').style.width='0%';document.querySelectorAll('[data-skill]').forEach(b=>b.classList.toggle('selected',b.dataset.skill===id));const phases=$('phaseList');phases.innerHTML='';for(const label of skill.phases){const span=document.createElement('span');span.textContent=label;phases.append(span)}$('phaseLabel').textContent=skill.phases[0];}
function replay(){elapsed=0;cleanFx();resetPose();playing=true;$('animationStatus').textContent='PLAYING';$('replay').textContent='↻ Replay animation'}
function flash(text){$('impactText').textContent=text;$('impactText').classList.add('show');clearTimeout(flash.timeout);flash.timeout=setTimeout(()=>$('impactText').classList.remove('show'),300)}
function slashArc(x,z,t,intensity=1){const o=makeEffect(new THREE.TorusGeometry(.78,.045,8,50,Math.PI*1.2),glow(heroClass==='warrior'?'#f6e7ba':'#b9ffec',.9));o.position.set(x,1.25,z);o.rotation.set(.35,Math.PI/2,-1.1);o.scale.setScalar(intensity);o.userData.born=t;o.userData.kind='slash';return o}
function orb(color,r=.25){return makeEffect(new THREE.IcosahedronGeometry(r,2),glow(color,.96))}
function ring(color){const o=makeEffect(new THREE.TorusGeometry(.5,.045,10,56),glow(color,.8));o.rotation.x=Math.PI/2;o.position.set(3,.3,0);o.userData.kind='ring';return o}
function spawnAt(index,kind,t){if(index<=hitCount)return;hitCount=index;if(kind==='slash'){slashArc(2.05,0,t,1+index*.1);flash('SLASH '+index)}else if(kind==='arrows'){const a=orb('#8eefe0',.12);a.userData={kind:'arrow',born:t,start:new THREE.Vector3(-1.7,1.55,.04*(index-2)),dest:new THREE.Vector3(3,1.4,.04*(index-2))};flash('ARROW '+index)}else if(kind==='meteor'){const m=orb('#ff6e3a',.35);m.userData={kind:'meteor',born:t,start:new THREE.Vector3(2+index*.4,5.4,-1),dest:new THREE.Vector3(3,1,0)};flash('METEOR '+index)}}
function applyMotion(t,dt){resetPose();const id=skill.id,p=t/skill.length,phaseIndex=Math.min(skill.phases.length-1,Math.floor(p*skill.phases.length));document.querySelectorAll('#phaseList span').forEach((el,i)=>el.classList.toggle('active',i===phaseIndex));$('phaseLabel').textContent=skill.phases[phaseIndex];let x=-2,y=0,angle=0;
const arms=bodyRig.arms,legs=bodyRig.legs;
if(id==='combo'){const windows=[[.55,.95],[1.18,1.57],[1.83,2.37]];windows.forEach(([a,b],i)=>{const u=clamp((t-a)/(b-a),0,1);if(u>0&&u<1){arms[1].rotation.x=-2.2*Math.sin(u*Math.PI);arms[1].rotation.z=(-1.1+2.3*u)*(i%2?-1:1);bodyRig.torso.rotation.y=.5*Math.sin(u*Math.PI)*(i%2?-1:1);x+=.45*Math.sin(u*Math.PI);if(i===2)y+=.23*Math.sin(u*Math.PI)}});for(let i=0;i<3;i++)if(t>=windows[i][0]+.24)spawnAt(i+1,'slash',t)}
else if(id==='spin'){const u=clamp((t-.5)/1.8,0,1);angle=u*Math.PI*4* smooth(u);arms[1].rotation.z=-1.4;arms[0].rotation.z=.6;x+=.4*Math.sin(u*Math.PI);if(t>=2.35&&hitCount<1){hitCount=1;ring('#fbe3a0');flash('CYCLONE!')}}
else if(id==='ground'){const u=clamp((t-.65)/1.25,0,1);y=.85*Math.sin(Math.PI*u);arms[1].rotation.x=u<.55?-2.4:1.3;bodyRig.torso.rotation.x=.3*Math.sin(u*Math.PI);if(t>=1.95&&hitCount<1){hitCount=1;ring('#f4be78');flash('EARTHBREAK!')}}
else if(id==='fireball'){const charge=clamp((t-.4)/1.15,0,1);arms[1].rotation.x=-.7*charge;arms[1].rotation.z=-.6*charge;if(t>=.42&&hitCount<1){hitCount=1;const f=orb('#ff953a',.23);f.userData={kind:'fire',born:1.48,start:new THREE.Vector3(-1.55,1.45,0),dest:new THREE.Vector3(3,1.2,0)};}if(t>2.6&&hitCount<2){hitCount=2;ring('#ffb34d');flash('FIRE IMPACT')}}
else if(id==='frost'){arms[0].rotation.x=-.85*smooth(t/1.1);arms[1].rotation.x=-.85*smooth(t/1.1);if(t>=1.15&&hitCount<1){hitCount=1;const r=ring('#83e5f5');r.position.set(-1.8,.2,0);flash('FROST NOVA')}}
else if(id==='meteor'){arms[1].rotation.x=-1.7*smooth(t/.9);for(let i=0;i<3;i++)if(t>=1.2+i*.68)spawnAt(i+1,'meteor',t)}
else if(id==='dashstrike'||id==='afterimage'||id==='dash'){const count=id==='afterimage'?3:1;const moments=id==='afterimage'?[.55,1.2,1.86]:[.65];moments.forEach((start,i)=>{const u=clamp((t-start)/.48,0,1);if(u>0&&u<1){const sx=id==='afterimage'?(i%2?-1:1)*1.35:3;x+=sx*Math.sin(Math.PI*u);y+=.18*Math.sin(Math.PI*u);bodyRig.torso.rotation.z=-.30*Math.sin(Math.PI*u)}if(t>=start+.1&&hitCount<i+1){hitCount=i+1;const ghost=orb('#97edcf',.26);ghost.userData={kind:'ghost',born:t,start:new THREE.Vector3(x,1.1,0)};if(id==='dashstrike'&&i===0)flash('SHADOW STRIKE')}})}
else if(id==='arrows'){arms[1].rotation.x=-1.15*smooth(t/.8);for(let i=0;i<3;i++)if(t>=.9+i*.7)spawnAt(i+1,'arrows',t)}
else if(id==='barrier'){arms[0].rotation.z=.7;arms[1].rotation.z=-.7;if(t>.55&&hitCount<1){hitCount=1;const shield=makeEffect(new THREE.SphereGeometry(1.12,32,22),glow('#a2efd1',.20));shield.userData={kind:'shield',born:t};flash('BARRIER')}}
heroRoot.position.set(x,y,0);heroRoot.rotation.y=Math.PI/2+angle;
legs.forEach((l,i)=>l.rotation.x=(i?1:-1)*.17*Math.sin(t*12));bodyRig.cloak.rotation.x=.13+.22*Math.sin(t*7);
for(const f of fx){const kind=f.userData.kind,born=f.userData.born||0,age=t-born;if(kind==='slash'){f.scale.setScalar(.7+age*1.5);f.material.opacity=clamp(1-age*2.5,0,1)}else if(kind==='ring'){f.scale.setScalar(1+Math.max(0,age)*4);f.material.opacity=clamp(.85-age*.8,0,1)}else if(kind==='fire'||kind==='arrow'||kind==='meteor'){const duration=kind==='meteor'?.58:kind==='arrow'?.52:1.23;const k=smooth(Math.max(0,age)/duration),from=f.userData.start,to=f.userData.dest;f.position.lerpVectors(from,to,k);if(kind==='meteor')f.position.y+=.5*Math.sin(k*Math.PI);if(kind==='fire'){f.scale.setScalar(age<0?.65+.1*Math.sin(t*17):1+.25*Math.sin(t*30));f.material.opacity=age<0?.85:clamp((1-k)*1.5,0,1)}else f.material.opacity=clamp((1-k)*1.5,0,1)}else if(kind==='ghost'){f.position.copy(f.userData.start);f.material.opacity=clamp(.45-age*.9,0,1);f.scale.setScalar(1+age*1.7)}else if(kind==='shield'){f.position.set(-2,1,0);f.material.opacity=clamp(.3-age*.09,0,.3);f.scale.setScalar(.5+smooth(age/.7)*.8)}}
targetRoot.rotation.z=.09*pulse(t,id==='combo'?2.12:id==='fireball'?2.65:1.7,.17);
$('timelineFill').style.width=(100*clamp(p,0,1))+'%';$('timeReadout').textContent=t.toFixed(1)+' / '+skill.length.toFixed(1)+' s';
}
document.querySelectorAll('[data-class]').forEach(b=>b.addEventListener('click',()=>selectClass(b.dataset.class)));
document.querySelectorAll('.sharedButtons button').forEach(b=>b.addEventListener('click',()=>selectSkill(b.dataset.skill)));
$('replay').onclick=replay;
$('pause').onclick=()=>{if(playing){playing=false;$('animationStatus').textContent='PAUSED'}else if(elapsed<skill.length){playing=true;$('animationStatus').textContent='PLAYING'}};
$('reset').onclick=()=>selectSkill(skill.id);
$('speed').onchange=()=>{previewRate=Number($('speed').value)};
function loadForm(){const lookup={name:'name',classSelect:'style',skin:'skin',armor:'armor',hair:'hair',cape:'cape',hairStyle:'hairStyle',personality:'personality'};for(const [id,key] of Object.entries(lookup))$(id).value=id==='classSelect'?({warrior:'guardian',wizard:'mage',scout:'scout'}[heroClass]):avatar[key]}
function creatorOpen(){loadForm();$('creatorOverlay').hidden=false}
$('openCreator').onclick=creatorOpen;$('changeHero').onclick=creatorOpen;
$('closeCreator').onclick=()=>{$('creatorOverlay').hidden=true};
$('saveCreator').onclick=()=>{const ids={name:'name',skin:'skin',armor:'armor',hair:'hair',cape:'cape',hairStyle:'hairStyle',personality:'personality'};for(const [id,key] of Object.entries(ids))avatar[key]=$(id).value;avatar.style=$('classSelect').value;try{localStorage.setItem(HERO,JSON.stringify(avatar))}catch{}$('creatorOverlay').hidden=true;selectClass(({guardian:'warrior',mage:'wizard',scout:'scout'})[avatar.style]||'warrior')};
function resize(){const rect=$('stage').getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe($('stage'));
let lastTime=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.06,(now-lastTime)/1000);lastTime=now;
if(playing){elapsed=Math.min(skill.length,elapsed+dt*previewRate);applyMotion(elapsed,dt);if(elapsed>=skill.length){playing=false;$('animationStatus').textContent='COMPLETE';$('replay').textContent='↻ Replay animation'}}
else if(elapsed===0){resetPose();bodyRig.torso.position.y=.04*Math.sin(now*.0023);bodyRig.cloak.rotation.x=.14+.04*Math.sin(now*.003);}
controls.update();renderer.render(scene,camera);
}requestAnimationFrame(frame);
selectClass(({guardian:'warrior',mage:'wizard',scout:'scout'})[avatar.style]||'warrior');
