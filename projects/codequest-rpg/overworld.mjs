import * as THREE from 'three';
import {islandBounds as bounds,islandCrossings as crossings,shore,isIslandWalkable as walkable,pythonWaystations,planIslandRoute,trailDirection} from './island-exploration.mjs';
import {islandDistricts,villageHouses,secondFloorHeight,roomLocation} from './island-villages.mjs';
import {adventureKey,shrines,travelGates,circuits,traps,wallLane,flightLimit,dashDuration,dashCooldown,blocked,groundSafe,airSafe,onWallLane,trapActive,restoreProgress,padResult,routeAdventure,segmentSafe} from './island-adventure.mjs';
import {animateIslandAvatar} from './island-avatar.mjs';
import {gear,anchors,jetCapacity,selectAnchor,swingStart,swingStep,jetStep} from './island-airgear.mjs';
import {createIslandDetail} from './island-detail.mjs';

const river=z=>Math.abs(z)<3.3;
const bridge=x=>crossings.some(center=>Math.abs(x-center)<2.1);
const summits=[{x:25,z:-53,h:13,r:16},{x:-33,z:52,h:10,r:15},{x:68,z:-22,h:7,r:13}];
const originalTowers=[{x:23,z:24,h:8},{x:25,z:-53,h:6}];
const passage={x:14,z:46};
const guides=[
  {name:'Ivo, the ferryman',x:-76,z:11,color:'#a16b35',line:'Three bridges cross the river. The western bridge leads to Meadow Trail.'},
  {name:'Mara, the cartographer',x:24,z:-44,color:'#576d9c',line:'Look for ladders at the watchtowers. The northern summit hides an old survey.'},
  {name:'Nia, the gardener',x:-33,z:66,color:'#5d874d',line:'Follow the southern trail to the orchard. Try crouching beneath low stone arches.'},
];
const secrets=[
  {id:'orchard',x:-38,z:77,name:'Orchard Waymark',note:'A carved arrow marks the route toward the western bridge.'},
  {id:'coast',x:126,z:29,name:'East Cape Log',note:'The lookout recorded a light across the river at dusk.'},
  {id:'summit',x:25,z:-55,name:'The Sky Ledger',note:'The island survey ends at this lookout.',tower:1},
  {id:'grotto',x:14,z:46,name:'The Echo Seal',note:'A tiny seal rests beneath the stone arch.'},
  {id:'tide',x:-65,z:-7,name:'The Tide Almanac',note:'A mariner marked the route to the old observatory in the margin.'},
  {id:'lantern',x:20,z:41,name:'The Last Lantern',note:'A lantern still burns for the first explorer who crossed the island.'},
  {id:'bell',x:-14,z:-46,name:'The Buried Bell',note:'Its inscription reads: Every journey begins with a single instruction.'},
  {id:'glass',x:63,z:11,name:'Glass Compass',note:'The needle points toward the furnaces, even when cold.'},
];
const terrain=(x,z)=>.85+1.05*Math.sin(x*.09)*Math.sin(z*.15)+.55*Math.cos(z*.17)+
  summits.reduce((height,peak)=>height+peak.h*Math.max(0,1-Math.hypot(x-peak.x,z-peak.z)/peak.r)**1.45,0);
const lowCeiling=(x,z)=>Math.abs(x-passage.x)<1.7&&Math.abs(z-passage.z)<2.2;
const towerFloor=tower=>terrain(tower.x,tower.z)+tower.h;
const elevation=(x,z)=>river(z)&&bridge(x)?1.15:terrain(x,z);
const colors=['#528665','#b08656','#528baa','#618850','#71628f','#9b5d47'];
const controls={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};

export function createOverworld({canvas,stage,makeHero,onNear,onEnter,onDiscovery,onTraversal,onPrompt,onDialogue,onWaystation,onTrailChange,onWayfinder,onAdventure,onAdventureToast}){
  const towers=originalTowers.map(t=>({...t}));
  let adventure=restoreProgress(null);
  try{adventure=restoreProgress(JSON.parse(localStorage.getItem(adventureKey)||'null'));}catch{}
  const unlocked=new Set(adventure.powers),solved=new Set(adventure.circuits);
  const trialState=new Map(circuits.map(c=>[c.id,{next:0,used:!c.requires}]));
  let dashLeft=0,dashWait=0,flightLeft=flightLimit,flying=false,wallRunning=false,gateLock=0,damageLock=0;
  let jetting=false,jetFuel=jetCapacity,jetHeight=2,swing=null,releaseMotion=null,jetInput=0;
  const dashVector=new THREE.Vector3(),safeSpot=new THREE.Vector3();
  let lastAdventure='',activeGate=null,activePad=null;
  function saveAdventure(){
    adventure.powers=[...unlocked];adventure.circuits=[...solved];
    try{localStorage.setItem(adventureKey,JSON.stringify(adventure));}catch{}
  }
  function notify(message){onAdventureToast?.(message);}
  function adventureState(){
    return {powers:[...unlocked],circuits:[...solved],setbacks:adventure.setbacks,
      flying,wallRunning,jetting,jetFuel:Math.ceil(jetFuel*10)/10,grappling:!!swing,anchor:swing?.anchor.id??null,flight:Math.ceil(flightLeft*10)/10,dashReady:dashWait<=0,gate:activeGate?.name??null,
      progress:Object.fromEntries([...trialState].map(([id,p])=>[id,p.next]))};
  }
  function publishAdventure(){
    const state=adventureState(),signature=JSON.stringify(state);
    if(signature!==lastAdventure){lastAdventure=signature;onAdventure?.(state);}
  }
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#b6dfe8');
  const landscapeFog=new THREE.FogExp2('#b6dfe8',.006);
  scene.fog=landscapeFog;
  const follow=new THREE.PerspectiveCamera(49,1,.1,260);
  const survey=new THREE.OrthographicCamera(-1,1,1,-1,.1,400);
  let mapMode=false;
  let camera=follow;
  const look=new THREE.Vector3();
  let yaw=0,pitch=.62,zoom=1,drag,discardClick=false;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene.add(new THREE.HemisphereLight('#fff4dc','#7489a4',2.35));
  const light=new THREE.DirectionalLight('#fff8de',2.15);
  light.position.set(-7,16,10);
  scene.add(light);
  const materialCache=new Map(),boxGeometryCache=new Map();
  const material=color=>{
    if(!materialCache.has(color))materialCache.set(color,new THREE.MeshStandardMaterial({color}));
    return materialCache.get(color);
  };
  function box(width,height,depth,mat,x,y,z){
    const key=width+','+height+','+depth;
    if(!boxGeometryCache.has(key))boxGeometryCache.set(key,new THREE.BoxGeometry(width,height,depth));
    const mesh=new THREE.Mesh(boxGeometryCache.get(key),mat);
    mesh.position.set(x,y,z);
    scene.add(mesh);
    return mesh;
  }
  const details=createIslandDetail(scene,{elevation,groundSafe,blocked,landmarks:[...shrines,...gear,...travelGates,...circuits,...pythonWaystations]});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(420,420),new THREE.MeshStandardMaterial({color:'#258dac',roughness:.48}));
  water.rotation.x=-Math.PI/2;
  water.position.y=-1;
  scene.add(water);
  const ground=new THREE.PlaneGeometry(318,260,212,174);
  ground.rotateX(-Math.PI/2);
  const vertices=ground.attributes.position;
  const shades=[];
  const green=new THREE.Color('#638c51'),sand=new THREE.Color('#d6bf8c'),rock=new THREE.Color('#a19a71');
  const color=new THREE.Color(), granite=new THREE.Color('#929a9b');
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i),z=vertices.getZ(i),edge=shore(x,z);
    vertices.setY(i,terrain(x,z)-Math.max(0,edge-.89)*25-4*THREE.MathUtils.smoothstep(4.5-Math.abs(z),0,1.6));
    const path=Math.abs(Math.abs(z)-7)<1.2||crossings.some(center=>Math.abs(x-center-1.1*Math.sin(z*.22))<1.25);
    color.copy(path?rock:green).lerp(sand,THREE.MathUtils.smoothstep(edge,.76,.96));
    color.lerp(granite,THREE.MathUtils.smoothstep(vertices.getY(i),3.7,9));
    color.multiplyScalar(.97+.045*Math.sin(x*.19+z*.13)*Math.cos(x*.29-z*.21));
    shades.push(color.r,color.g,color.b);
  }
  ground.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
  ground.computeVertexNormals();
  const island=new THREE.Mesh(ground,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,map:details.ground}));
  scene.add(island);
  const wood=material('#a07750'), timber=material('#503c34'), ivory=material('#ddc398');
  const roofMats=['#885d49','#ab7346','#54678d','#526956','#534e6b','#763f3c'].map(material);
  roofMats.forEach(m=>{m.map=details.roof;m.needsUpdate=true;});
  wood.map=details.wood;wood.needsUpdate=true;
  const roofGeometry=new THREE.ConeGeometry(3.32,1.82,4);
  const glow=new THREE.MeshBasicMaterial({color:'#ffd79a'});
  const lampGeo=new THREE.OctahedronGeometry(.25);
  const waterFoam=new THREE.MeshBasicMaterial({color:'#bce8e9',transparent:true,opacity:.44,depthWrite:false});
  const ripples=[];
  for(let i=0;i<27;i++){
    const x=-68+i*5.2;
    if(bridge(x))continue;
    const foam=box(1.6,.014,.06,waterFoam,x,-.98,(i%5-2)*.68);
    ripples.push(foam);
  }
  for(const x of crossings){
    for(let z=-4.5;z<=4.5;z+=.5)box(4.25,.15,.48,wood,x,1.075,z);
    for(const dx of [-2.02,2.02]){
      box(.14,.15,9.3,timber,x+dx,2.05,0);
      for(let z=-4.5;z<=4.5;z+=1.5){
        box(.17,1.3,.19,timber,x+dx,1.6,z);
        if(Math.abs(z)===4.5){
          const lamp=new THREE.Mesh(lampGeo,glow);
          lamp.position.set(x+dx,2.38,z);
          scene.add(lamp);
        }
      }
    }
  }
  const cliff=material('#747d83');
  const rail=material('#d9b779');
  for(const tower of towers){
    const floor=towerFloor(tower);
    const foot=terrain(tower.x,tower.z);
    for(const dx of [-1.6,1.6])for(const dz of [-1.6,1.6]){
      box(.38,tower.h,.38,timber,tower.x+dx,foot+tower.h/2,tower.z+dz);
    }
    box(4,.26,4,wood,tower.x,floor-.13,tower.z);
    box(4,.24,.13,rail,tower.x,floor+.78,tower.z-1.9);
    for(const dx of [-1.9,1.9])box(.13,.24,4,rail,tower.x+dx,floor+.78,tower.z);
    for(const dx of [-.42,.42])box(.11,tower.h,.12,timber,tower.x+dx,foot+tower.h/2,tower.z+1.94);
    for(let i=.25;i<tower.h;i+=.32)box(.92,.085,.12,rail,tower.x,foot+i,tower.z+1.94);
    const beacon=new THREE.Mesh(lampGeo,glow);
    beacon.position.set(tower.x,floor+1.34,tower.z-1.7);
    scene.add(beacon);
  }
  const passageY=terrain(passage.x,passage.z);
  for(const dx of [-1.92,1.92])box(.62,1.35,4.8,cliff,passage.x+dx,passageY+.64,passage.z);
  box(4.5,.62,4.8,cliff,passage.x,passageY+1.48,passage.z);
  for(const peak of summits){
    for(let i=0;i<9;i++){
      const angle=i*2.4;
      const x=peak.x+Math.cos(angle)*peak.r*.62,z=peak.z+Math.sin(angle)*peak.r*.62;
      const boulder=new THREE.Mesh(new THREE.DodecahedronGeometry(.95+i%3*.28),cliff);
      boulder.position.set(x,terrain(x,z)+.28,z);
      boulder.scale.set(1,.68,1.25);
      boulder.rotation.y=angle;
      scene.add(boulder);
    }
  }
  const discovered=new Set();
  try{
    for(const id of JSON.parse(localStorage.getItem('cq-island-discoveries')||'[]')){
      if(secrets.some(secret=>secret.id===id))discovered.add(id);
    }
  }catch{}
  const relics=secrets.map(secret=>{
    const y=secret.tower===undefined?elevation(secret.x,secret.z):towerFloor(towers[secret.tower]);
    box(1,.33,1,ivory,secret.x,y+.15,secret.z);
    const gem=new THREE.Mesh(new THREE.IcosahedronGeometry(.37),new THREE.MeshStandardMaterial({color:'#f1c36b',emissive:'#e59d44',emissiveIntensity:.65,roughness:.35}));
    gem.position.set(secret.x,y+1,secret.z);
    gem.visible=!discovered.has(secret.id);
    scene.add(gem);
    return {...secret,gem,y};
  });
  const trunk=material('#645044');
  const crownGeometryCache=new Map();
  function tree(x,z,scale,tint){
    const y=elevation(x,z);
    box(.31*scale,1.65*scale,.31*scale,trunk,x,y+.8*scale,z);
    if(!crownGeometryCache.has(scale))crownGeometryCache.set(scale,new THREE.ConeGeometry(1.1*scale,2.6*scale,6));
    const crown=new THREE.Mesh(crownGeometryCache.get(scale),material(tint));
    crown.position.set(x,y+2.05*scale,z);scene.add(crown);
    const upper=new THREE.Mesh(crownGeometryCache.get(scale),material(tint));
    upper.scale.set(.72,.72,.72);upper.position.set(x,y+3.0*scale,z);scene.add(upper);
  }
  for(let i=0;i<105;i++){
    const angle=i*2.39996,r=.35+.51*((i*17)%107)/107;
    const x=Math.cos(angle)*bounds.x*r,z=Math.sin(angle)*bounds.z*r;
    if(Math.abs(z)<7||crossings.some(center=>Math.abs(x-center)<18&&Math.abs(Math.abs(z)-27)<18)||blocked(x,z)||[...shrines,...travelGates,...circuits,...pythonWaystations].some(p=>Math.hypot(x-p.x,z-p.z)<9))continue;
    tree(x,z,.62+(i%5)*.12,i%2?'#38694a':'#497953');
  }
  const actors=guides.map(guide=>{
    const model=makeHero({name:guide.name,style:'guardian',personality:'calm',skin:'#b68969',armor:guide.color,hair:'#302c2c',cape:'#8d7b60',hairStyle:'short',accessory:'satchel',height:97,build:94});
    scene.add(model);
    return {...guide,model};
  });
  const grain=material('#ad854e'), stonework=material('#758088');
  for(let i=0;i<16;i++)tree(-52+(i%4)*4.5,72+Math.floor(i/4)*4.5,.9,'#638754');
  for(let i=0;i<7;i++)box(1.4,.38,1.2,stonework,118+i*1.8,terrain(118+i*1.8,25)+.17,25);
  for(let i=0;i<5;i++){
    const x=-80+i*2,z=7.25;
    box(1.7,.82,1.5,grain,x,terrain(x,z)+.41,z);
  }
  const trailDone=new Set();
  try{
    const saved=JSON.parse(localStorage.getItem('cq-island-python-trail-v1')||'[]');
    if(Array.isArray(saved))for(const id of saved){
      if(pythonWaystations.some(station=>station.id===id))trailDone.add(id);
    }
  }catch{}
  const trailStone=material('#647d85'),trailGold=material('#e9c879');
  const trailMarkers=pythonWaystations.map((station,index)=>{
    const y=elevation(station.x,station.z);
    const pedestal=box(1.85,.44,1.85,trailStone,station.x,y+.20,station.z);
    box(.92,2.7,.92,trailStone,station.x,y+1.58,station.z);
    const cap=new THREE.Mesh(new THREE.OctahedronGeometry(.66),new THREE.MeshStandardMaterial({
      color:trailDone.has(station.id)?'#6a8491':'#ffe19c',emissive:'#a87432',emissiveIntensity:trailDone.has(station.id)?.12:.75
    }));
    cap.position.set(station.x,y+3.4,station.z);
    scene.add(cap);
    const numeral=label(String(index+1));
    numeral.position.set(station.x,y+4.9,station.z);
    scene.add(numeral);
    pedestal.userData.waystation=station.id;
    cap.userData.waystation=station.id;
    return {...station,y,cap,pedestal};
  });
  const guideBeam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,10,8),
    new THREE.MeshBasicMaterial({color:'#ffe6a6',transparent:true,opacity:.42,depthWrite:false}));
  guideBeam.visible=false;
  scene.add(guideBeam);
  let activeTrail=null,lastWayfinder='';
  function trailState(){
    return {ids:[...trailDone],total:pythonWaystations.length,waypoint:activeTrail?.id??null};
  }
  function setWaypoint(id){
    const station=pythonWaystations.find(item=>item.id===id);
    activeTrail=station&&activeTrail?.id!==id?station:null;
    guideBeam.visible=Boolean(activeTrail);
    if(activeTrail)guideBeam.position.set(activeTrail.x,elevation(activeTrail.x,activeTrail.z)+5,activeTrail.z);
    if(!activeTrail){lastWayfinder='';onWayfinder?.('');}
    onTrailChange?.(trailState());
    return activeTrail?.id??null;
  }
  // Adventure landmarks have distinct silhouettes, colors, and physical interaction zones.
  const shrineModels=[...shrines,...gear].map(p=>{
    const y=elevation(p.x,p.z),mat=material(p.color);
    box(3,.25,3,stonework,p.x,y+.12,p.z);
    for(const side of [-1,1])box(.38,2.55,.42,mat,p.x+side*1.10,y+1.35,p.z);
    box(2.6,.26,.45,mat,p.x,y+2.65,p.z);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.55),new THREE.MeshStandardMaterial({color:p.color,emissive:p.color,emissiveIntensity:.6}));
    gem.position.set(p.x,y+1.65,p.z);scene.add(gem);
    const sign=label(p.name,true);sign.position.set(p.x,y+3.75,p.z);sign.scale.set(3.8,.58,1);scene.add(sign);
    return {...p,y,gem};
  });
  const gateModels=travelGates.map(p=>{
    const y=elevation(p.x,p.z),mat=material('#53647a');
    box(3.6,.25,2.6,stonework,p.x,y+.12,p.z);
    for(const side of [-1,1])box(.48,3.5,.55,mat,p.x+side*1.58,y+1.75,p.z);
    box(3.65,.4,.55,mat,p.x,y+3.5,p.z);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.35,.15,10,40),new THREE.MeshStandardMaterial({color:p.color,emissive:p.color,emissiveIntensity:.75}));
    ring.position.set(p.x,y+1.73,p.z);scene.add(ring);
    const core=new THREE.Mesh(new THREE.CircleGeometry(1.24,32),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.20,side:THREE.DoubleSide,depthWrite:false}));
    core.position.copy(ring.position);scene.add(core);
    const sign=label(p.name,true);sign.position.set(p.x,y+4.55,p.z);sign.scale.set(4.4,.58,1);scene.add(sign);
    return {...p,y,ring,core};
  });
  const padModels=circuits.flatMap(c=>c.steps.map((p,index)=>{
    const y=elevation(p.x,p.z),base=box(2,.23,2,stonework,p.x,y+.10,p.z);
    const top=box(1.55,.08,1.55,new THREE.MeshStandardMaterial({color:c.color,emissive:c.color,emissiveIntensity:.12}),p.x,y+.265,p.z);
    const sign=label(String(index+1));sign.position.set(p.x,y+1.2,p.z);sign.scale.set(.82,.48,1);scene.add(sign);
    return {...p,y,circuit:c,index,top,base};
  }));
  const rewards=circuits.map(c=>{
    const p=c.reward,y=elevation(p.x,p.z);
    box(1.45,.4,1.45,stonework,p.x,y+.2,p.z);
    const gem=new THREE.Mesh(new THREE.IcosahedronGeometry(.48),new THREE.MeshStandardMaterial({color:c.color,emissive:c.color,emissiveIntensity:.6}));
    gem.position.set(p.x,y+1.15,p.z);gem.visible=!solved.has(c.id);scene.add(gem);
    const sign=label(c.name,true);sign.position.set(p.x,y+2.65,p.z);sign.scale.set(4.3,.6,1);scene.add(sign);
    return {...p,y,circuit:c,gem};
  });
  const trapModels=traps.map(t=>{
    const y=elevation(t.x,t.z);
    box(2.5,.12,2.5,material('#623f46'),t.x,y+.06,t.z);
    const spikes=[];
    for(const dx of [-.7,0,.7])for(const dz of [-.7,0,.7]){
      const spike=new THREE.Mesh(new THREE.ConeGeometry(.23,.95,4),material('#d9a29a'));
      spike.position.set(t.x+dx,y-.35,t.z+dz);scene.add(spike);spikes.push(spike);
    }
    return {...t,y,spikes};
  });
  for(let z=wallLane.minZ;z<=wallLane.maxZ;z+=2){
    const y=elevation(wallLane.x,z);
    box(.75,3.3,2.05,material('#665b85'),wallLane.x,y+1.55,z);
    box(.15,.14,1.75,material('#c3aaff'),wallLane.x-.43,y+1.6,z);
  }
  // Elevated attachment towers: original tether anchors with glowing target rings.
  const anchorModels=anchors.map(p=>{
    const y=elevation(p.x,p.z),top=y+p.h;
    const steel=material('#586e78'),brace=material('#8b9e9d'),copper=material('#bb9b65');
    box(2.5,.35,2.5,steel,p.x,y+.15,p.z);
    for(const side of [-1,1]){
      box(.28,p.h,.28,steel,p.x+side*.62,y+p.h/2,p.z);
      for(let h=1;h<p.h;h+=2.2){
        const beam=box(.12,2.45,.12,brace,p.x,y+h,p.z);
        beam.rotation.z=side*.48;
      }
    }
    box(2.2,.22,1.4,copper,p.x,top-.35,p.z);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.13,10,24),new THREE.MeshStandardMaterial({color:'#8cece7',emissive:'#55c8d6',emissiveIntensity:.65}));
    ring.position.set(p.x,top,p.z);scene.add(ring);
    return {...p,y:top,ring};
  });
  const ropeGeometry=new THREE.BufferGeometry();
  ropeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  const rope=new THREE.Line(ropeGeometry,new THREE.LineBasicMaterial({color:'#c7fcff'}));rope.frustumCulled=false;rope.visible=false;scene.add(rope);
  const jetFx=Array.from({length:2},()=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.19,.85,7),new THREE.MeshBasicMaterial({color:'#ffb46e',transparent:true,opacity:.8}));m.rotation.z=Math.PI;m.visible=false;scene.add(m);return m;});
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,24),new THREE.MeshBasicMaterial({color:'#213c42',transparent:true,opacity:.32,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;scene.add(shadow);
  const speedFx=Array.from({length:8},(_,i)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(.10,.10,.6),new THREE.MeshBasicMaterial({color:'#8ae7ff',transparent:true,opacity:.6,depthWrite:false}));
    mesh.visible=false;scene.add(mesh);return mesh;
  });
  const pickables=[],portals=new Map(),keys=new Set();
  pickables.push(...trailMarkers.flatMap(marker=>[marker.pedestal,marker.cap]));
  const projected=new THREE.Vector3();
  let nearbyGuide;
  const position=new THREE.Vector3();
  const trail=new THREE.Vector3();
  let hero,target,near,last=0,waypoints=[],gait=0,pace=0;
  let crouched=false,air=0,velocity=0,climb=null,deck=null,baseHeight=1;
  function ladder(){
    if(deck!==null&&Math.hypot(position.x-towers[deck].x,position.z-(towers[deck].z+1.35))<1.2)return deck;
    return towers.findIndex(tower=>Math.hypot(position.x-tower.x,position.z-(tower.z+2.15))<1.65);
  }
  function action(key){
    if(!hero)return;
    if(key==='grapple'){
      if(!unlocked.has('grapple')){notify('Find the Tether Workshop to unlock the harness.');return;}
      if(swing){releaseMotion={vx:swing.state.vx,vy:swing.state.vy,vz:swing.state.vz};swing=null;rope.visible=false;return;}
      if(climb||deck!==null||crouched||jetting||flying||wallRunning)return;
      const heading={x:Math.sin(hero.rotation.y),z:Math.cos(hero.rotation.y)};
      const origin={x:position.x,y:elevation(position.x,position.z)+Math.max(air,2.5),z:position.z};
      const anchor=selectAnchor(origin,anchorModels,heading);
      if(!anchor){notify('No anchor in range · approach a cyan tower.');return;}
      swing={anchor,state:swingStart(origin,anchor,heading)};releaseMotion=null;target=null;waypoints=[];dashLeft=0;velocity=0;notify('Tether attached · steer with WASD, T to release.');return;
    }
    if(key==='jetpack'){
      if(!unlocked.has('jetpack')){notify('Find the Jetpack Forge to unlock the thrusters.');return;}
      if(jetting){jetting=false;jetInput=0;if(!groundSafe(position.x,position.z)){position.copy(safeSpot);air=0;}else velocity=0;return;}
      if(climb||deck!==null||crouched||swing||releaseMotion||flying||wallRunning||jetFuel<.5)return;
      jetting=true;jetHeight=Math.max(2,air);velocity=0;dashLeft=0;target=null;waypoints=[];notify('Jetpack active · Space ascend / C descend / J land.');return;
    }
    if((swing||releaseMotion||jetting)&&!['jump','crouch'].includes(key))return;
    if(jetting&&(key==='jump'||key==='crouch')){jetInput=key==='jump'?1:-1;return;}
    if(swing||releaseMotion)return;
    if(key==='gate'){
      if(activeGate&&gateLock<=0&&!climb&&deck===null&&!flying){
        const destination=gateModels.find(g=>g.id===activeGate.to);
        if(destination){position.set(destination.x,0,destination.z+1.8);safeSpot.copy(position);target=null;waypoints=[];keys.clear();gateLock=2.2;activeGate=null;air=velocity=0;dashLeft=0;wallRunning=false;notify('Portal travel · '+destination.name);}
      }else notify('Approach a travel gate, then press G.');
      return;
    }
    if(key==='dash'){
      if(!unlocked.has('dash')){notify('Find the Wind Shrine to unlock Dash.');return;}
      if(dashWait>0||climb||deck!==null||flying||wallRunning||crouched)return;
      dashVector.set(Math.sin(hero.rotation.y),0,Math.cos(hero.rotation.y));
      dashLeft=dashDuration;dashWait=dashCooldown;target=null;waypoints=[];return;
    }
    if(key==='fly'){
      if(!unlocked.has('fly')){notify('Find the Sky Shrine to unlock Flight.');return;}
      if(flying){landFlight();return;}
      if(climb||deck!==null||crouched||wallRunning||flightLeft<.5)return;
      flying=true;dashLeft=0;velocity=0;target=null;waypoints=[];return;
    }
    if(key==='wall'){
      if(!unlocked.has('wall')){notify('Find the Stone Shrine to unlock Wall run.');return;}
      if(wallRunning){wallRunning=false;return;}
      if(deck!==null||climb||flying||crouched||!onWallLane(position.x,position.z)){notify('Wall run starts beside the marked violet wall.');return;}
      wallRunning=true;dashLeft=0;target=null;waypoints=[];return;
    }
    if(key==='jump'&&!climb&&!crouched&&!air&&!velocity&&!flying&&!wallRunning)velocity=7.6;
    if(key==='crouch'&&!climb&&!air&&!velocity&&!flying&&!wallRunning){
      if(crouched&&lowCeiling(position.x,position.z))return;
      crouched=!crouched;
    }
    if(key==='climb'&&!climb&&!air&&!velocity&&!crouched&&!flying&&!wallRunning){
      const index=ladder();
      if(index===null||index<0||(deck!==null&&deck!==index))return;
      const tower=towers[index],descending=deck!==null;
      const z=descending?tower.z+2.5:tower.z+1.35;
      climb={index,descending,start:hero.position.clone(),end:new THREE.Vector3(tower.x,descending?elevation(tower.x,z):towerFloor(tower),z),time:0,started:performance.now()};
      target=null;
      waypoints=[];
    }
  }
  function setMovementKey(key,pressed){
    if(!Object.hasOwn(controls,key))return;
    if(pressed){target=null;waypoints=[];keys.add(key);}
    else keys.delete(key);
  }
  function adjustCamera(turn=0,scale=1){
    yaw+=turn;
    zoom=THREE.MathUtils.clamp(zoom*scale,.45,2.2);
  }
  function label(text,zone=false){
    const image=document.createElement('canvas');
    image.width=zone?512:128;image.height=64;
    const ctx=image.getContext('2d');
    ctx.fillStyle='#132633';
    ctx.roundRect(7,3,image.width-14,58,15);
    ctx.fill();
    ctx.fillStyle='#ffffff';
    ctx.font='bold 40px system-ui';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(text,image.width/2,33);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(image),depthTest:zone?false:true}));
    sprite.scale.set(zone?6.4:1.28,.70,1);
    return sprite;
  }
  // Identical low-poly masonry, roofs and trim for the six educational districts.
  // All 22 lesson IDs remain stable; a second-storey portal only changes physical access.
  function addVillageHouse({x,z,zoneIndex,storeys,upper,roomIndex,topic}){
    const facade=material(colors[zoneIndex]),accent=roofMats[zoneIndex],gold=material('#f4d594');
    facade.map=details.stone;facade.needsUpdate=true;
    const y=elevation(x,z),hallZ=z-2.7,hallY=elevation(x,hallZ);
    const height=storeys===2?6.15:3.05;
    const base=box(3.2,.28,2.9,facade,x,y+.12,z+.15);
    const hall=box(3.85,height,3.25,facade,x,hallY+height/2,hallZ);
    const roof=new THREE.Mesh(roofGeometry,accent);
    roof.rotation.y=Math.PI/4;
    roof.position.set(x,hallY+height+.85,hallZ);
    scene.add(roof);
    // Architectural trim: plinth, corner pilasters, framed windows, sills and eaves.
    box(4.02,.35,3.48,stonework,x,hallY+.17,hallZ);
    box(4.12,.18,3.58,timber,x,hallY+height-.07,hallZ);
    for(const sx of [-1,1])for(const sz of [-1,1]){
      box(.18,height-.25,.18,ivory,x+sx*1.89,hallY+height/2,hallZ+sz*1.59);
    }
    for(let floor=0;floor<storeys;floor++)for(const side of [-1,1]){
      const wy=hallY+1.58+floor*2.99,wx=x+side*1.08,wz=hallZ+1.72;
      box(.66,.84,.10,timber,wx,wy,wz);
      box(.48,.65,.12,glow,wx,wy,wz+.06);
      box(.045,.66,.14,timber,wx,wy,wz+.13);
      box(.50,.045,.14,timber,wx,wy,wz+.13);
      box(.75,.11,.24,ivory,wx,wy-.43,wz+.07);
      box(.12,.72,.70,timber,x+side*1.96,wy,hallZ);
      box(.13,.52,.50,glow,x+side*2.03,wy,hallZ);
    }
    // Consistent front porch, stone columns and warm windows on every house.
    for(const side of [-1,1]){
      box(.29,2.45,.28,ivory,x+side*1.37,y+1.2,z+.15);
      box(.43,.18,.44,gold,x+side*1.37,y+2.5,z+.15);
      box(.46,.66,.075,glow,x+side*1.08,hallY+1.58,hallZ+1.66);
      if(storeys===2){
        box(.49,.68,.08,glow,x+side*1.08,hallY+4.57,hallZ+1.66);
        box(3.95,.18,3.45,ivory,x,hallY+3.06,hallZ);
      }
    }
    let ladderIndex=null;
    if(storeys===2){
      // The actual collision deck matches the original lookout ladder mechanics.
      ladderIndex=towers.length;
      towers.push({x,z,h:secondFloorHeight,kind:'village',room:roomIndex});
      const floorY=towerFloor(towers[ladderIndex]);
      box(4.2,.25,3.1,wood,x,floorY-.13,z+.42);
      for(const side of [-1,1])box(.11,.65,2.9,timber,x+side*2.0,floorY+.36,z+.42);
      // Balcony front rail has a real gap directly ahead of the climb.
      for(const side of [-1,1])box(1.12,.15,.12,timber,x+side*1.48,floorY+.68,z+1.89);
      for(const dx of [-.43,.43])box(.12,secondFloorHeight,.13,timber,x+dx,y+secondFloorHeight/2,z+2.08);
      for(let step=.25;step<secondFloorHeight;step+=.32){
        box(.91,.08,.14,ivory,x,y+step,z+2.08);
      }
      // The raised doorway is visually distinct from the ground-floor facade.
      box(1.56,2.35,.13,material('#344a4d'),x,floorY+1.17,hallZ+1.69);
      box(1.82,.19,.20,gold,x,floorY+2.42,hallZ+1.73);
      if(!upper)box(1.56,2.35,.13,material('#344a4d'),x,y+1.17,hallZ+1.69);
    }else{
      box(1.56,2.35,.10,material('#344a4d'),x,y+1.17,hallZ+1.68);
    }
    if(zoneIndex===2||zoneIndex===4){
      const bx=x+2.5,bz=hallZ,by=elevation(bx,bz);
      box(.9,height+1.2,.90,facade,bx,by+(height+1.2)/2,bz);
      const beacon=new THREE.Mesh(lampGeo,glow);
      beacon.position.set(bx,by+height+1.4,bz);
      scene.add(beacon);
    }
    if(zoneIndex===5){
      for(const side of [-1,1])box(.38,1.7,.43,timber,x+side*.82,hallY+height+.7,hallZ);
    }
    if(roomIndex===undefined)return;
    const portalY=y+(upper?secondFloorHeight:0);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.02,.105,12,40),
      new THREE.MeshStandardMaterial({emissiveIntensity:.5}));
    ring.position.set(x,portalY+1.12,z);
    scene.add(ring);
    portals.set(roomIndex,{index:roomIndex,x,z,y:portalY,ring,
      deck:upper?ladderIndex:null,upper:!!upper,topic,storeys});
    const roomNumber=label(String(roomIndex+1).padStart(2,'0'));
    roomNumber.position.set(x,hallY+height+2.25,hallZ);
    roomNumber.visible=false; // Follow camera shows only the reachable door's label.
    portals.get(roomIndex).numberLabel=roomNumber;
    scene.add(roomNumber);
    for(const mesh of [base,ring,hall,roof]){
      mesh.userData.room=roomIndex;
      pickables.push(mesh);
    }
  }
  function addZones(zones){
    for(const [zoneIndex,zone] of zones.entries()){
      const design=islandDistricts[zoneIndex];
      if(!design||design.lots.length!==zone.rooms.length){
        throw Error('District / lesson count mismatch in '+zone.name);
      }
      const x0=design.anchor.x,z0=design.anchor.z;
      const entrance=z0+(z0<0?23:-23),gateY=elevation(x0,entrance);
      const banner=label(zone.name,true);
      banner.position.set(x0,gateY+4.0,entrance);
      scene.add(banner);
      const stone=material(colors[zoneIndex]),gold=material('#f4d594');
      for(const side of [-1,1]){
        const x=x0+side*4.6,y=elevation(x,entrance);
        box(.8,2.85,.82,stone,x,y+1.42,entrance);
        box(1.05,.25,1.08,gold,x,y+2.97,entrance);
        tree(x0+side*9,entrance+Math.sign(z0)*4,.86,zoneIndex===5?'#925b41':'#456f52');
      }
      for(const [j,index] of zone.rooms.entries()){
        const lot=roomLocation(zoneIndex,j);
        addVillageHouse({...lot,zoneIndex,roomIndex:index});
      }
      // Walkable stone paving marks the route between the houses of each topic.
      for(let j=0;j<design.lots.length-1;j++){
        const first=design.lots[j],next=design.lots[j+1];
        if(first.topic!==next.topic)continue;
        const n=Math.ceil(Math.hypot(next.x-first.x,next.z-first.z)/2.5);
        for(let i=0;i<=n;i++){
          const t=i/n,x=first.x+(next.x-first.x)*t;
          const z=first.z+(next.z-first.z)*t+3.65;
          box(2.0,.07,1.5,material('#aea58b'),x,elevation(x,z)+.025,z);
        }
      }
      // One readable sign per subtopic cluster, not one label on every house.
      for(const topic of design.topics){
        const group=design.lots.filter(lot=>lot.topic===topic);
        const cx=group.reduce((sum,lot)=>sum+lot.x,0)/group.length;
        const cz=group.reduce((sum,lot)=>sum+lot.z,0)/group.length;
        const sign=label(topic,true);
        const tallest=Math.max(...group.map(lot=>lot.storeys));
        sign.position.set(cx,elevation(cx,cz)+ (tallest===2?9.5:5.8),cz-2.4);
        scene.add(sign);
      }
      for(const extra of villageHouses.filter(house=>house.zone===zoneIndex)){
        addVillageHouse({...extra,zoneIndex,storeys:2,upper:false});
      }
    }
  }
  const ray=new THREE.Raycaster();
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const x=event.clientX-drag.x,y=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(x,y)<4)return;
    drag.moved=true;
    drag.x=event.clientX;drag.y=event.clientY;
    adjustCamera(-x*.007);
    pitch=THREE.MathUtils.clamp(pitch+y*.006,.24,1.27);
  });
  canvas.addEventListener('pointerup',()=>{discardClick=Boolean(drag?.moved);drag=null;});
  canvas.addEventListener('pointerleave',()=>{drag=null;});
  canvas.addEventListener('pointercancel',()=>{drag=null;discardClick=false;});
  canvas.addEventListener('wheel',event=>{
    event.preventDefault();
    adjustCamera(0,Math.exp(THREE.MathUtils.clamp(event.deltaY,-220,220)*.0015));
  },{passive:false});
  canvas.addEventListener('click',event=>{
    if(discardClick){discardClick=false;return;}
    canvas.focus();
    const rect=canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),camera);
    const hit=ray.intersectObjects(pickables)[0];
    if(!hit){
      const groundHit=ray.intersectObject(island)[0];
      if(groundHit&&groundSafe(groundHit.point.x,groundHit.point.z))routeTo(groundHit.point.x,groundHit.point.z);
      return;
    }
    if(hit.object.userData.waystation){setWaypoint(hit.object.userData.waystation);return;}
    const room=hit.object.userData.room;
    if(near===room)onEnter(room);
    else travel(room);
  });
  canvas.addEventListener('keydown',event=>{
    const key=event.key.length===1?event.key.toLowerCase():event.key;
    if([' ','c','f','q','e','r','x','v','b','g','t','j','+','=','-'].includes(key)){
      event.preventDefault();
      if(event.repeat)return;
      if(key==='q'||key==='e')adjustCamera(key==='q'?.3:-.3);
      else if(['+','=','-'].includes(key))adjustCamera(0,key==='-'?1.18:1/1.18);
      else if(key==='r'){if(nearbyGuide)onDialogue?.(nearbyGuide);}
      else action({' ':'jump',c:'crouch',f:'climb',x:'dash',v:'fly',b:'wall',g:'gate',t:'grapple',j:'jetpack'}[key]);
      return;
    }
    if(key==='Shift'){keys.add(key);return;}
    if(controls[key]){
      event.preventDefault();
      target=null;
      waypoints=[];
      keys.add(key);
    }else if(key==='Enter'&&(near!==undefined||nearbyGuide)){
      event.preventDefault();
      interact();
    }
  });
  canvas.addEventListener('keyup',event=>{const k=event.key.length===1?event.key.toLowerCase():event.key;keys.delete(k);if(k===' '||k==='c')jetInput=0;});
  canvas.addEventListener('blur',()=>{keys.clear();jetInput=0;});
  function routeTo(x,z){
    waypoints=[];
    try{
      waypoints=routeAdventure({x:position.x,z:position.z},{x,z}).map(point=>new THREE.Vector3(point.x,0,point.z));
      target=waypoints.shift()??null;
    }catch{
      target=null;
    }
  }
  function travel(index){
    const portal=portals.get(index);
    if(portal&&deck===null)routeTo(portal.x,portal.z+(portal.upper?2.65:1.35));
  }
  function landFlight(){
    flying=false;velocity=0;air=0;
    if(!groundSafe(position.x,position.z)){position.copy(safeSpot);notify('Flight ended over water · returned to safe ground.');}
  }
  function locateAdventure(id){
    const p=[...shrines,...gear,...travelGates,...circuits].find(item=>item.id===id);
    if(!p)return false;
    if(deck!==null||climb||flying||jetting||swing||releaseMotion){notify('Return to ground before setting a route.');return false;}
    routeTo(p.x,p.z);return Boolean(target);
  }
  function visit(index,available,marks){
    if(hero){
      scene.remove(hero);
      hero.traverse(mesh=>{
        mesh.geometry?.dispose();
        mesh.material?.dispose();
      });
    }
    hero=makeHero();
    scene.add(hero);
    const portal=portals.get(index);
    position.set(portal?.x??0,0,(portal?.z??0)+(portal?.upper?2.7:1.15));
    target=null;
    waypoints=[];
    gait=0;pace=0;air=0;velocity=0;deck=null;climb=null;crouched=false;
    dashLeft=0;dashWait=0;flightLeft=flightLimit;flying=false;wallRunning=false;gateLock=0;damageLock=0;activePad=null;activeGate=null;safeSpot.copy(position);
    jetting=false;jetFuel=jetCapacity;jetHeight=2;jetInput=0;swing=null;releaseMotion=null;rope.visible=false;
    baseHeight=hero.scale.y;
    keys.clear();
    near=undefined;
    activeTrail=null;guideBeam.visible=false;
    lastWayfinder='';onWayfinder?.('');
    yaw=0;pitch=.62;zoom=1;
    last=0;
    for(const item of portals.values()){
      const color=marks.has(item.index)?'#ffcb58':available(item.index)?'#79ecc1':'#748693';
      item.ring.material.color.set(color);
      item.ring.material.emissive.set(color);
    }
    onTrailChange?.(trailState());
    look.copy(position).setY(elevation(position.x,position.z));
    frame(performance.now());
  }
  function frame(now){
    const width=stage.clientWidth,height=stage.clientHeight;
    if(!hero||!width||!height)return;
    const aspect=width/height;
    if(width!==frame.width||height!==frame.height){
      renderer.setSize(width,height,false);
      frame.width=width;
      frame.height=height;
    }
    const delta=last?Math.min(.05,(now-last)/1000):0;
    last=now;
    dashWait=Math.max(0,dashWait-delta);gateLock=Math.max(0,gateLock-delta);damageLock=Math.max(0,damageLock-delta);
    if(flying){flightLeft=Math.max(0,flightLeft-delta);air=THREE.MathUtils.lerp(air,3.1,Math.min(1,delta*5));if(flightLeft<=0)landFlight();}
    else if(!air&&!velocity)flightLeft=Math.min(flightLimit,flightLeft+delta*.8);
    if(wallRunning&&!onWallLane(position.x,position.z))wallRunning=false;
    trail.set(0,0,0);
    for(const key of keys){
      if(key==='Shift')continue;
      const [x,z]=controls[key];
      trail.x+=x*Math.cos(yaw)+z*Math.sin(yaw);
      trail.z+=z*Math.cos(yaw)-x*Math.sin(yaw);
    }
    if(target)trail.subVectors(target,position);
    const dashing=dashLeft>0;
    if(jetting){const j=jetStep(jetFuel,jetHeight,jetInput,delta);jetFuel=j.fuel;jetHeight=j.height;air=jetHeight;if(!jetFuel){jetting=false;jetInput=0;if(!groundSafe(position.x,position.z)){position.copy(safeSpot);air=0;}velocity=0;}}
    else if(!air&&!swing&&!releaseMotion&&groundSafe(position.x,position.z))jetFuel=Math.min(jetCapacity,jetFuel+delta*1.25);
    const airborneGear=!!(swing||releaseMotion);
    if(dashing){trail.copy(dashVector);dashLeft=Math.max(0,dashLeft-delta);}
    if(wallRunning){trail.x=0;trail.z=Math.sign(trail.z);}
    if(climb)trail.set(0,0,0);
    if(!flying&&!jetting&&!airborneGear&&(air>0||velocity!==0)){
      velocity-=delta*18;
      air+=velocity*delta;
      if(air<=0){air=0;velocity=0;}
    }
    const distance=trail.length();
    if(airborneGear){
      const input=trail.clone();if(input.length()>1)input.normalize();
      const current=swing?swingStep(swing.state,swing.anchor,input,delta):{x:position.x+releaseMotion.vx*delta,y:elevation(position.x,position.z)+air+(releaseMotion.vy-=14*delta)*delta,z:position.z+releaseMotion.vz*delta};
      const groundY=elevation(current.x,current.z);
      if(!airSafe(current.x,current.z)||current.y<groundY+.28||current.y>groundY+30){
        if(!groundSafe(position.x,position.z))position.copy(safeSpot);
        swing=null;releaseMotion=null;air=0;velocity=0;
      }else{
        position.set(current.x,0,current.z);air=current.y-groundY;
        if(swing){swing.state=current;if(current.time>9){releaseMotion={vx:current.vx,vy:current.vy,vz:current.vz};swing=null;}}
        const v=swing?.state??releaseMotion;
        if(v)hero.rotation.y=Math.atan2(v.vx,v.vz);
      }
    }else if(distance>.025){
      const heading=Math.atan2(trail.x,trail.z);
      hero.rotation.y+=Math.atan2(Math.sin(heading-hero.rotation.y),Math.cos(heading-hero.rotation.y))*Math.min(1,delta*14);
      const speed=dashing?27:jetting?19:flying?15:wallRunning?12:crouched?3.5:target?14:keys.has('Shift')?15:8;
      const stride=target?Math.min(distance,delta*speed):delta*speed;
      trail.normalize();
      const nextX=position.x+trail.x*stride,nextZ=position.z+trail.z*stride;
      const onDeck=deck===null||(Math.abs(nextX-towers[deck].x)<1.72&&Math.abs(nextZ-towers[deck].z)<1.72);
      const valid=flying||jetting?airSafe(nextX,nextZ):wallRunning?onWallLane(nextX,nextZ)&&groundSafe(nextX,nextZ):segmentSafe(position,{x:nextX,z:nextZ});
      if(valid&&onDeck&&(flying||jetting||crouched||!lowCeiling(nextX,nextZ))){
        position.set(nextX,0,nextZ);
        if(groundSafe(nextX,nextZ)&&!flying&&!jetting&&!wallRunning&&!air&&!trapModels.some(t=>Math.hypot(t.x-nextX,t.z-nextZ)<t.r+1.2))safeSpot.copy(position);
      }
      else if(target&&!crouched&&lowCeiling(nextX,nextZ)&&!lowCeiling(target.x,target.z)){
        const side=passage.x+(position.x<passage.x?-2.8:2.8);
        const exit=passage.z+(target.z<passage.z?-3:3);
        waypoints.unshift(new THREE.Vector3(side,0,exit),target);
        target=new THREE.Vector3(side,0,position.z);
      }else {target=null;waypoints=[];}
    }else if(target)target=waypoints.shift()??null;
    hero.position.copy(position);
    hero.position.y=(deck===null?elevation(position.x,position.z):towerFloor(towers[deck]))+air+(wallRunning?1.35:0);
    hero.scale.y=THREE.MathUtils.lerp(hero.scale.y,baseHeight*(crouched?.56:1),Math.min(1,delta*15));
    if(climb){
      const tower=towers[climb.index];
      // Wall-clock interpolation keeps ladders usable on slow school GPUs.
      climb.time=Math.min(1,Math.max(0,(now-climb.started)/1800));
      const t=climb.time;
      hero.position.lerpVectors(climb.start,climb.end,t);
      if(t<.16)hero.position.z=THREE.MathUtils.lerp(climb.start.z,tower.z+2, t/.16);
      else if(t<.84)hero.position.z=tower.z+2;
      else hero.position.z=THREE.MathUtils.lerp(tower.z+2,climb.end.z,(t-.84)/.16);
      hero.rotation.y=Math.PI;
      if(t===1){
        position.set(climb.end.x,0,climb.end.z);
        deck=climb.descending?null:climb.index;
        climb=null;
      }
    }
    // Shrine proximity unlocks powers; gates require explicit activation.
    activeGate=null;
    const time=now/1000;
    for(const p of shrineModels){
      p.gem.rotation.y=time*1.6;p.gem.position.y=p.y+1.65+.15*Math.sin(time*3);
      if(!unlocked.has(p.id)&&deck===null&&!flying&&!jetting&&!swing&&!releaseMotion&&air<.7&&!climb&&Math.hypot(position.x-p.x,position.z-p.z)<1.85){
        unlocked.add(p.id);saveAdventure();notify(p.name+' · '+p.description);
      }
      p.gem.material.emissiveIntensity=unlocked.has(p.id)?.18:.75;
    }
    for(const g of gateModels){
      g.ring.rotation.z=time*.6;g.core.material.opacity=.17+.07*Math.sin(time*3);
      if(deck===null&&!climb&&!flying&&!jetting&&!swing&&!releaseMotion&&air<.7&&Math.hypot(position.x-g.x,position.z-g.z)<2.5)activeGate=g;
    }
    for(const c of circuits){
      const state=trialState.get(c.id);
      if(state.next>0&&!state.used&&Math.hypot(position.x-c.x,position.z-c.z)<70){
        if(c.requires==='dash'&&dashing||c.requires==='fly'&&flying&&Math.abs(position.z)<3.3||c.requires==='wall'&&wallRunning)state.used=true;
      }
    }
    let touched=null;
    for(const p of padModels){
      const c=p.circuit,state=trialState.get(c.id);
      p.top.material.emissiveIntensity=solved.has(c.id)||p.index<state.next?.7:.12;
      if(!solved.has(c.id)&&deck===null&&!climb&&!flying&&Math.hypot(position.x-p.x,position.z-p.z)<1.05&&(air<.65||wallRunning))touched=p;
    }
    if(touched!==activePad&&touched){
      const c=touched.circuit,state=trialState.get(c.id);
      if(c.requires&&!unlocked.has(c.requires))notify('Unlock '+c.requires+' before this trial.');
      else{
        const outcome=padResult(state.next,touched.index,c.steps.length);state.next=outcome.next;
        if(outcome.wrong){state.used=!c.requires;notify(c.name+' · Wrong order. Begin again at pad 1.');}
        else if(outcome.complete)notify(c.name+' · All pads active. Claim the crystal'+(state.used?'!':' after using the required power.'));
        else notify(c.name+' · '+state.next+'/'+c.steps.length+' pads active.');
      }
    }
    activePad=touched;
    for(const p of rewards){
      p.gem.rotation.y=time*1.5;p.gem.position.y=p.y+1.15+.14*Math.sin(time*3);
      const state=trialState.get(p.circuit.id);
      if(!solved.has(p.circuit.id)&&state.next===p.circuit.steps.length&&state.used&&!flying&&deck===null&&Math.hypot(position.x-p.x,position.z-p.z)<1.5){
        solved.add(p.circuit.id);p.gem.visible=false;saveAdventure();notify(p.circuit.name+' complete · Adventure crystal earned!');
      }
      p.gem.material.emissiveIntensity=state.next===p.circuit.steps.length&&state.used?1:.13;
    }
    for(const t of trapModels){
      const active=trapActive(t,time);
      for(const spike of t.spikes)spike.position.y=THREE.MathUtils.lerp(spike.position.y,t.y+(active?.5:-.4),Math.min(1,delta*15));
      if(active&&!damageLock&&!climb&&deck===null&&!flying&&!wallRunning&&air<.72&&Math.hypot(position.x-t.x,position.z-t.z)<t.r){
        position.copy(safeSpot);target=null;waypoints=[];dashLeft=0;air=velocity=0;damageLock=1.5;
        for(const [id,state] of trialState)if(!solved.has(id)){state.next=0;state.used=!circuits.find(c=>c.id===id).requires;}
        adventure.setbacks++;saveAdventure();notify('Trap triggered · returned to safe ground. Circuit reset.');
      }
    }
    shadow.position.set(position.x,elevation(position.x,position.z)+.035,position.z);
    shadow.visible=deck===null&&!river(position.z);
    shadow.scale.setScalar(flying?.65:1);shadow.material.opacity=flying?.18:.32;
    for(const [i,fx] of speedFx.entries()){
      fx.visible=dashing||flying||wallRunning;
      fx.position.set(hero.position.x+Math.sin(i*2.4)*.65-Math.sin(hero.rotation.y)*(i*.25+.4),hero.position.y+.8+(i%3)*.24,hero.position.z+Math.cos(i*2.4)*.65-Math.cos(hero.rotation.y)*(i*.25+.4));
      fx.rotation.y=hero.rotation.y;
    }
    rope.visible=!!swing;
    if(swing){const p=ropeGeometry.attributes.position;p.setXYZ(0,hero.position.x,hero.position.y+1.45,hero.position.z);p.setXYZ(1,swing.anchor.x,swing.anchor.y,swing.anchor.z);p.needsUpdate=true;}
    for(const [i,fx] of jetFx.entries()){fx.visible=jetting;fx.position.set(hero.position.x+(i?1:-1)*.27*Math.cos(hero.rotation.y)-.30*Math.sin(hero.rotation.y),hero.position.y+.43,hero.position.z-(i?1:-1)*.27*Math.sin(hero.rotation.y)-.30*Math.cos(hero.rotation.y));fx.scale.y=.65+.4*Math.sin(time*24+i);}
    for(const a of anchorModels){a.ring.rotation.y=time*.7;a.ring.material.emissiveIntensity=swing?.anchor===a?1.5:.55+.16*Math.sin(time*3);}
    details.update(time,delta,mapMode);
    onTraversal?.(swing?'Tether swing · T release':releaseMotion?'Aerial release':jetting?'Jetpack · '+jetFuel.toFixed(1)+'s':climb?'Climbing':flying?'Flying · '+flightLeft.toFixed(1)+'s':wallRunning?'Wall running':dashing?'Dash':activeGate?'Travel gate · G':ladder()>=0?'Ladder nearby · F':lowCeiling(position.x,position.z)?'Low passage · C':crouched?'Crouching':air>0?'Jumping':'');
    publishAdventure();
    if(mapMode){
      const extent=Math.max(132,163/aspect)*zoom;
      survey.left=-extent*aspect;survey.right=extent*aspect;
      survey.top=extent;survey.bottom=-extent;
      survey.position.set(0,222,.01);
      survey.up.set(Math.sin(yaw),0,-Math.cos(yaw));
      survey.lookAt(0,0,0);
    }else{
      look.lerp(hero.position,1-Math.exp(-delta*8));
      const distance=(aspect<1?15:13)*zoom*(swing||jetting||releaseMotion?1.20:1),horizontal=Math.cos(pitch)*distance;
      follow.position.set(look.x+Math.sin(yaw)*horizontal,look.y+Math.sin(pitch)*distance+.8,look.z+Math.cos(yaw)*horizontal);
      follow.lookAt(look.x,look.y+.9,look.z);
      follow.aspect=aspect;
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    pace+=(Number(distance>.025)-pace)*Math.min(1,delta*12);
    gait+=delta*pace*(keys.has('Shift')&&!crouched?21:14);
    const mode=swing?'grapple':jetting?'jetpack':releaseMotion?'jump':climb?'climb':flying?'fly':wallRunning?'wall':dashing?'dash':crouched?'crouch':air>0?'jump':keys.has('Shift')&&distance>.025?'sprint':distance>.025?'walk':'idle';
    animateIslandAvatar(hero,{time:now/1000,delta,pace,mode,phase:climb?climb.time*45:gait,gear:[...unlocked]});
    for(const [i,ripple] of ripples.entries())ripple.scale.x=.75+.35*Math.sin(now*.0018+i);
    for(const relic of relics){
      if(!relic.gem.visible)continue;
      relic.gem.rotation.y=now*.0016;
      relic.gem.position.y=relic.y+.95+.16*Math.sin(now*.003);
      if(Math.hypot(position.x-relic.x,position.z-relic.z)<1.6&&Math.abs(hero.position.y-relic.y)<1.15){
        relic.gem.visible=false;
        discovered.add(relic.id);
        try{localStorage.setItem('cq-island-discoveries',JSON.stringify([...discovered]));}catch{}
        onDiscovery?.(relic,discovered.size,secrets.length);
      }
    }
    for(const marker of trailMarkers){
      const found=trailDone.has(marker.id);
      if(!found){
        marker.cap.rotation.y=now*.0013;
        marker.cap.position.y=marker.y+3.4+.13*Math.sin(now*.002+marker.x);
        if(deck===null&&!climb&&Math.hypot(position.x-marker.x,position.z-marker.z)<2.4&&
           Math.abs(hero.position.y-marker.y)<1.3){
          trailDone.add(marker.id);
          marker.cap.material.color.set('#6a8491');
          marker.cap.material.emissiveIntensity=.12;
          try{localStorage.setItem('cq-island-python-trail-v1',JSON.stringify([...trailDone]));}catch{}
          if(activeTrail?.id===marker.id)setWaypoint(marker.id);
          onWaystation?.(marker,trailDone.size,pythonWaystations.length);
          onTrailChange?.(trailState());
        }
      }
    }
    if(activeTrail){
      const hint=trailDirection(position,activeTrail);
      const label=activeTrail.name+' · '+hint.distance+' units · '+hint.bearing;
      if(label!==lastWayfinder){lastWayfinder=label;onWayfinder?.(label);}
      guideBeam.material.opacity=.28+.14*Math.sin(now*.0025);
    }

    nearbyGuide=undefined;
    for(const [i,guide] of actors.entries()){
      const t=now*.0008+i*2;
      const gx=guide.x+Math.sin(t)*1.8,gz=guide.z+Math.cos(t)*1.1;
      guide.model.position.set(gx,elevation(gx,gz)+Math.abs(Math.sin(t*7))*.05,gz);
      guide.model.rotation.y=Math.atan2(Math.cos(t)*1.8,-Math.sin(t)*1.1);
      animateIslandAvatar(guide.model,{time:now/1000,delta,pace:.65,mode:'walk',phase:t*7});
      if(Math.hypot(position.x-gx,position.z-gz)<3.15)nearbyGuide=guide;
    }
    let closest,best=2.9;
    for(const item of portals.values()){
      const distance=Math.hypot(position.x-item.x,position.z-(item.z+1.15));
      if(distance<best&&deck===item.deck&&!climb&&!flying&&!jetting&&!swing&&!releaseMotion&&!wallRunning&&air<.8){best=distance;closest=item.index;}
      item.ring.position.y=item.y+1.12+.12*Math.sin(now*.002+item.index);
      item.ring.rotation.z=now*.00065;
      item.ring.material.emissiveIntensity=deck===item.deck&&distance<2.15?.92:.45+.17*Math.sin(now*.003+item.index);
    }
    if(closest!==near){
      near=closest;
      onNear(near);
    }
    for(const item of portals.values()){
      item.numberLabel.visible=mapMode; // Room names remain in the contextual door prompt.
    }
    if(onPrompt){
      let point;
      if(near!==undefined){
        const door=portals.get(near);
        point=projected.set(door.x,door.y+2.8,door.z).project(camera);
      }else if(nearbyGuide){
        const loc=nearbyGuide.model.position;
        point=projected.set(loc.x,loc.y+2.35,loc.z).project(camera);
      }
      onPrompt(point&&Math.abs(point.x)<.94&&Math.abs(point.y)<.92&&Math.abs(point.z)<1?
        {room:near,guide:nearbyGuide?.name,x:(point.x+1)*50,y:(1-point.y)*50}:null);
    }
    renderer.render(scene,camera);
  }
  function setMapMode(enabled){
    mapMode=enabled;
    camera=enabled?survey:follow;
    // An overhead camera is far above the terrain: keeping distance fog here
    // obscures the entire island and makes the survey view unusable.
    scene.fog=enabled?null:landscapeFog;
  }
  function interact(){
    if(near!==undefined)onEnter(near);
    else if(activeGate)action('gate');
    else if(nearbyGuide)onDialogue?.(nearbyGuide);
  }
  return {addZones,visit,travel,frame,setMapMode,adjustCamera,action,setMovementKey,interact,trailState,setWaypoint,adventureState,locateAdventure,
    districtMap:()=>[...portals.values()].map(({index,x,z,upper,deck,topic,storeys})=>({index,x,z,upper,deck,topic,storeys})),
    discoveries:()=>[discovered.size,secrets.length]};
}
