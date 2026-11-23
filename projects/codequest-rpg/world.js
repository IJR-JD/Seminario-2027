import * as THREE from 'three';
import {directions,expedition,planMove,surfaceAt} from './expedition.mjs';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id), clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const STORAGE='ijr-codequest-world-v2',HERO='ijr-codequest-world-hero-v1';
const W=9,H=9;
const levels=[{"title":"The First Steps","zone":"Meadow of Beginnings","theme":"meadow","start":[1,7],"goal":[3,7],"obstacles":[],"crystals":[],"checkpoints":[],"concept":"01 · One direction","description":"Walk to the glowing beacon.","objective":"Reach X 3 · Z 7","instruction":"Read the starting and target coordinates, then choose a direction and distance.","hint":"Identify the X direction. A single variable assignment moves the hero.","require":[]},{"title":"A Name for Distance","zone":"Meadow of Beginnings","theme":"meadow","start":[1,7],"goal":[5,7],"obstacles":[],"crystals":[],"checkpoints":[],"concept":"02 · Distance as a value","description":"Let a variable decide how far you go.","objective":"Reach X 5 · Z 7","instruction":"Write a single directional variable with a numeric value.","hint":"Compare the starting X and the target X. Choose the matching direction and value.","require":[]},{"title":"The First Turn","zone":"Willow Crossroads","theme":"meadow","start":[1,7],"goal":[4,4],"obstacles":[],"crystals":[],"checkpoints":[],"concept":"03 · Two assignments","description":"A new path bends toward the north.","objective":"Reach X 4 · Z 4","instruction":"Use two directional variables on separate lines.","hint":"Think about the horizontal change and vertical change as two separate assignments.","require":[]},{"title":"Across the Stream","zone":"Willow Crossroads","theme":"river","start":[1,7],"goal":[6,3],"obstacles":[[3,3],[3,4],[3,5],[3,6],[3,7],[3,8]],"crystals":[],"checkpoints":[],"concept":"04 · Order of movement","description":"The river blocks the direct path. Find the bridge at Z 2.","objective":"Cross the bridge and reach the beacon","instruction":"Plan a safe route across the stream using directional assignments.","hint":"Observe where the safe crossing lies. The order of your directional assignments matters.","require":[]},{"title":"Stones in the Valley","zone":"Mossy Passage","theme":"forest","start":[1,7],"goal":[7,3],"obstacles":[[3,7],[3,6],[3,5],[5,2],[5,3],[5,4],[5,5]],"crystals":[],"checkpoints":[],"concept":"05 · Navigating obstacles","description":"Stone walls split the valley into winding passages.","objective":"Find a safe route around stone walls","instruction":"Avoid the stones by dividing the route into several assignments.","hint":"Examine the stone obstacles from above and split the trip into smaller segments.","require":[]},{"title":"Crystals of the Glade","zone":"The Crystal Glade","theme":"forest","start":[1,7],"goal":[7,2],"obstacles":[[4,4],[4,5],[4,6]],"crystals":[[2,5],[6,3]],"checkpoints":[],"concept":"06 · Collect by visiting","description":"The beacon only awakens when both crystals are collected.","objective":"Collect two crystals before reaching the beacon","instruction":"Visit each crystal tile. Collection happens automatically upon arrival.","hint":"Crystals are picked up when the hero walks onto them. Plan to visit both before the beacon.","require":[]},{"title":"The Forest Gate","zone":"Ancient Woodland","theme":"forest","start":[1,7],"goal":[7,1],"obstacles":[[3,5],[3,6],[3,7],[5,2],[5,3],[5,4]],"crystals":[],"checkpoints":[[3,3]],"concept":"07 · Checkpoints","description":"Pass through the waypoint to activate the destination.","objective":"Touch the waypoint, then the beacon","instruction":"Visit the checkpoint before reaching the beacon.","hint":"First visit the marked checkpoint. Then continue toward the destination without crossing walls.","require":[]},{"title":"A Calculated Path","zone":"Sunstone Ruins","theme":"ruins","start":[1,7],"goal":[7,4],"obstacles":[[4,6],[4,7],[5,6],[6,6]],"crystals":[],"checkpoints":[],"concept":"08 · Arithmetic in movement","description":"Build your travel distance from two smaller values.","objective":"Use an arithmetic expression to reach the beacon","instruction":"Use an arithmetic expression to determine a movement distance.","hint":"Use a simple calculation as the numeric value of a direction. Remember that the value is a distance.","require":[],"arithmetic":true},{"title":"The Narrow Pass","zone":"Sunstone Ruins","theme":"ruins","start":[1,7],"goal":[7,1],"obstacles":[[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6]],"crystals":[],"checkpoints":[[1,3]],"concept":"09 · Repeated direction assignments","description":"Use several short movements to go around the old walls.","objective":"Reach the waypoint and solve the maze","instruction":"Break a long trip into separate directional assignments.","hint":"Look for the open corridor around the barrier. You may reuse a direction on another line.","require":[]},{"title":"The Three Signals","zone":"Valley of Signals","theme":"river","start":[1,7],"goal":[7,2],"obstacles":[[4,4],[4,5],[4,6],[4,7]],"crystals":[[2,5],[5,2],[7,3]],"checkpoints":[],"concept":"10 · Multi-stop paths","description":"Collect three signals distributed across the valley.","objective":"Collect all three signals","instruction":"Collect all signals automatically by walking across their locations.","hint":"Think about each crystal as a stop along the route, not just the final destination.","require":[]},{"title":"The Coordinate Trial","zone":"Highland Observatory","theme":"ruins","start":[1,7],"goal":[7,1],"obstacles":[[3,3],[3,4],[3,5],[3,6],[5,2],[5,3],[5,4]],"crystals":[],"checkpoints":[[2,2],[6,6]],"concept":"11 · Waypoints and planning","description":"Two waypoints. A difficult route. Your variables are the map.","objective":"Activate both waypoints and reach the beacon","instruction":"Reach the checkpoints and destination with a planned sequence of movement variables.","hint":"Plan both checkpoints as intermediate objectives. Longer paths are fine when safe.","require":[]},{"title":"The Last Beacon","zone":"Citadel of Code","theme":"citadel","start":[1,7],"goal":[7,1],"obstacles":[[3,5],[3,6],[3,7],[4,3],[4,4],[4,5],[5,5],[6,5]],"crystals":[[2,3],[7,3]],"checkpoints":[[6,2]],"concept":"12 · Final exploration","description":"The finale combines variables, careful navigation, crystals, and a waypoint.","objective":"Collect both crystals, activate the waypoint and reach the final beacon","instruction":"Build a complete route through the final world. Every objective matters.","hint":"Use the map to plan a complete itinerary through both crystals and the checkpoint.","require":[]}];
const classicCount=levels.length;
levels.push(...expedition);
const heroDefaults={name:'Code Explorer',style:'guardian',personality:'brave',skin:'#d7a880',armor:'#48796b',hair:'#292b31',cape:'#b4a27f',hairStyle:'short',accessory:'satchel',height:100,build:100};
let hero={...heroDefaults},completed=new Set(),level=0,worldGroup,actor,actorParts,goalMesh,crystalMeshes=[],checkpointMeshes=[],tileMeshes=[],activeRun=0,running=false,stopped=false,positions={x:0,z:0},variables={},collected=new Set(),visited=new Set(),actions=0,hasArithmetic=false,success=false,previewActor;
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');completed=new Set((saved.completed||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<levels.length));level=clamp(saved.level||0,0,levels.length-1);if(!isAvailable(level))level=0}catch{}
try{hero={...hero,...JSON.parse(localStorage.getItem(HERO)||'{}')}}catch{}
function isAvailable(i){
  return i===0||i===classicCount||completed.has(i)||completed.has(i-1);
}
let flightFuel=0;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const log=m=>{const pre=$('consoleView');pre.textContent=(pre.textContent==='Choose a path to begin.'?'':pre.textContent+'\n')+m;pre.scrollTop=pre.scrollHeight;};
const status=m=>{$('executionStatus').textContent=m;};
const message=m=>{$('worldMessage').textContent=m;};
const banner=m=>{const b=$('worldBanner');b.textContent=m;b.classList.add('show');clearTimeout(banner.timer);banner.timer=setTimeout(()=>b.classList.remove('show'),1900);};
function makeMat(color,roughness=.87){return new THREE.MeshStandardMaterial({color,roughness})}
function addBox(group,w,h,d,material,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh}
function addSphere(group,r,material,x,y,z){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),material);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);return mesh}
function addCyl(group,rt,rb,height,material,x,y,z,sides=10){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,height,sides),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
function col(v){try{return new THREE.Color(v)}catch{return new THREE.Color('#cccccc')}}
function createHero(settings=hero){const group=new THREE.Group();const skin=makeMat(col(settings.skin)),armor=makeMat(col(settings.armor),.63),hair=makeMat(col(settings.hair)),cloth=makeMat(col(settings.cape)),dark=makeMat('#303a35'),metal=makeMat('#d9d9bf',.28),eye=makeMat('#273d37');const legs=[],arms=[];
for(const dx of [-.17,.17]){const leg=addBox(group,.22,.56,.25,dark,dx,.37,0);legs.push(leg);addBox(leg,.25,.16,.31,metal,0,-.26,.08)}
const chest=addBox(group,.74,.75,.43,armor,0,1.03,0);addBox(group,.66,.1,.5,metal,0,1.35,0);const head=addSphere(group,.31,skin,0,1.71,0);head.scale.set(1,1.1,.95);
for(const dx of [-.12,.12])addSphere(group,.043,eye,dx,1.75,.284);
for(const dx of [-.48,.48]){const arm=addBox(group,.20,.67,.27,armor,dx,1.04,0);arms.push(arm)}
addBox(group,.38,.10,.40,armor,0,1.40,0);
if(settings.hairStyle!=='none'){const hairTop=addSphere(group,settings.hairStyle==='crest'?.37:.335,hair,0,1.96,0);hairTop.scale.set(1,.55,1);if(settings.hairStyle==='long')for(const dx of [-.24,.24])addBox(group,.17,.55,.2,hair,dx,1.65,-.13);if(settings.hairStyle==='crest')addBox(group,.12,.4,.4,hair,0,2.17,0)}
if(settings.style==='guardian'){for(const dx of [-.5,.5])addSphere(group,.22,metal,dx,1.31,0)}else if(settings.style==='scout'){addBox(group,.92,.13,.47,dark,0,1.48,-.08)}else{addCyl(group,.04,.04,.7,metal,.58,1.29,0);addSphere(group,.14,makeMat('#bca5e2'),.58,1.7,0)}
if(settings.accessory==='scarf')addBox(group,.81,.12,.51,cloth,0,1.42,.05);
if(settings.accessory==='staff'){const pole=addCyl(group,.04,.04,1.65,dark,.65,.97,0);addSphere(group,.12,metal,.65,1.84,0)}
if(settings.accessory==='satchel')addBox(group,.33,.31,.23,metal,.48,.85,-.29);
const cape=addBox(group,.67,.86,.08,cloth,0,.96,-.31);cape.rotation.x=.13;
group.scale.set(Number(settings.build)/100,Number(settings.height)/100,Number(settings.build)/100);
group.userData={legs,arms,cape};return group}
function updateHero(){if(actor){scene.remove(actor);actor.traverse(o=>o.geometry?.dispose())}actor=createHero();scene.add(actor);actor.position.set(positions.x,levels[level].surfaces?surfaceAt(levels[level],positions.x,positions.z):0,positions.z);actor.rotation.y=Math.PI/2;refreshPreview()}
const scene=new THREE.Scene();scene.background=new THREE.Color('#bed2ce');
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,65);
const renderer=new THREE.WebGLRenderer({canvas:$('gameCanvas'),antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,$('gameCanvas'));
controls.enableDamping=true;
controls.enablePan=false;
controls.minZoom=.8;
controls.maxZoom=2.3;
controls.maxPolarAngle=Math.PI/2.5;

let cameraMode='3d';
let frameWidth=1,frameHeight=1;
function recenterCamera(){
  const map=cameraMode==='map';
  controls.enableDamping=false;
  controls.reset();
  const cfg=levels[level],width=cfg.width??W,depth=cfg.depth??H;
  const top=cfg.surfaces?Math.max(...cfg.surfaces.values()):0;
  controls.target.set((width-1)/2,map?0:(top+2)/2,(depth-1)/2);
  camera.position.copy(controls.target).add(map?new THREE.Vector3(0,18,0):new THREE.Vector3(4,16,9));
  // OrbitControls uses Y-up and keeps the overhead view slightly off its pole.
  camera.zoom=1;
  controls.enabled=!map;
  controls.update();
  controls.enableDamping=true;

  const inverseRotation=camera.quaternion.clone().invert();
  frameWidth=0;
  frameHeight=0;
  for(const x of [-.6,width-.4]) for(const z of [-.6,depth-.4]) for(const y of [0,top+2.9]){
    const corner=new THREE.Vector3(x,y,z).sub(controls.target).applyQuaternion(inverseRotation);
    frameWidth=Math.max(frameWidth,Math.abs(corner.x));
    frameHeight=Math.max(frameHeight,Math.abs(corner.y));
  }
  resize();
}
function setCameraMode(mode){
  cameraMode=mode;
  for(const button of document.querySelectorAll('[data-camera]')){
    button.setAttribute('aria-pressed',String(button.dataset.camera===mode));
  }
  $('mapDirections').hidden=mode!=='map';
  $('gameCanvas').style.touchAction=mode==='map'?'pan-y':'none';
  $('cameraHelp').textContent=mode==='map'?'Up and right match the movement variables':'Drag to rotate · scroll or pinch to zoom';
  recenterCamera();
}

scene.add(new THREE.HemisphereLight('#ffffff','#718d79',2.4));const sun=new THREE.DirectionalLight('#fff5d7',2.4);sun.position.set(-4,13,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;scene.add(sun);sun.shadow.bias=-.0004;
const colorThemes={meadow:['#85ae77','#91b87e','#709c6a','#d3b98c'],river:['#93b69a','#8ebc9b','#6f9d79','#bdcbb8'],forest:['#71976e','#7fa477','#53785a','#c8b78f'],ruins:['#baad87','#c7ba98','#8d9177','#9b9a85'],citadel:['#8eafa4','#a3b7a3','#687f73','#c4ac77']};
const key=(x,z)=>x+','+z;
const heroSeed=(x,z,n)=>Math.abs(Math.sin(x*123.7+z*71.3+n*52.1));
function lantern(group,x,z){const wood=makeMat('#615846'),glow=makeMat('#f9d88b',.4);addCyl(group,.05,.07,1.2,wood,x,.6,z);addBox(group,.24,.32,.22,glow,x,1.28,z)}
function decorateWorld(cfg){
if(worldGroup){
  const materials=new Set();
  scene.remove(worldGroup);
  worldGroup.traverse(object=>{
    object.geometry?.dispose();
    if(object.material)materials.add(object.material);
  });
  for(const material of materials)material.dispose();
}worldGroup=new THREE.Group();scene.add(worldGroup);const palette=colorThemes[cfg.theme];scene.background.set(cfg.surfaces?(cfg.theme==='citadel'?'#a4cadb':'#daccac'):cfg.theme==='ruins'?'#d8d0bc':cfg.theme==='citadel'?'#c4d1c4':'#bed2ce');
const base=makeMat(palette[2]),grass=[makeMat(palette[0]),makeMat(palette[1]),makeMat(palette[2])],path=makeMat(palette[3]),stone=makeMat('#77877c'),stoneTop=makeMat('#a6b3aa'),trunk=makeMat('#746b50'),leaf=makeMat(cfg.theme==='forest'?'#456c4d':'#57845d');if(!cfg.surfaces)addBox(worldGroup,12,.66,12,base,4,-.45,4);tileMeshes=[];const obstacleSet=new Set(cfg.obstacles.map(p=>key(...p)));const otherUsed=new Set([key(...cfg.start),key(...cfg.goal),...cfg.crystals.map(p=>key(...p)),...cfg.checkpoints.map(p=>key(...p))]);
const heightAt=(x,z)=>cfg.surfaces?surfaceAt(cfg,x,z):0;
const islandMaterials=[makeMat('#729589'),makeMat('#86aa9d'),makeMat('#9caa80'),makeMat('#d2b787'),makeMat('#e3cd9e')];
const gateMaterial=makeMat('#7855a8');
if(cfg.surfaces){
  const width=cfg.width,depth=cfg.depth;
  sun.position.set(width*.25,18,depth*.8);
  sun.target.position.set((width-1)/2,0,(depth-1)/2);
  scene.add(sun.target);
}else{
  sun.position.set(-4,13,7);
  sun.target.position.set(4,0,4);
  scene.add(sun.target);
}
for(let x=0;x<(cfg.width??W);x++)for(let z=0;z<(cfg.depth??H);z++){
const height=heightAt(x,z);
if(height===undefined)continue;
if(cfg.surfaces){
  addBox(worldGroup,.99,.72,.99,base,x,height-.49,z);
  const gate=cfg.gates?.some(([gx,gz])=>gx===x&&gz===z);
  if(gate){
    addBox(worldGroup,.86,.09,.86,gateMaterial,x,height+.03,z);
    const portal=new THREE.Mesh(new THREE.TorusGeometry(.35,.025,8,20),new THREE.MeshBasicMaterial({color:'#cc9cff'}));
    portal.rotation.y=Math.PI/2;
    portal.position.set(x,height+.55,z);
    worldGroup.add(portal);
  }
}
const obs=obstacleSet.has(key(x,z));const tile=addBox(worldGroup,.98,.13,.98,obs?stone:(cfg.surfaces?islandMaterials[height]:grass[(x*7+z*3)%grass.length]),x,height-.06,z);tileMeshes.push(tile);
if(obs){const b=addBox(worldGroup,.81,.58,.81,stone,x,height+.23,z);b.rotation.y=heroSeed(x,z,1)*.12;addBox(worldGroup,.74,.14,.74,stoneTop,x,height+.56,z)}
else if(!otherUsed.has(key(x,z))&&heroSeed(x,z,1)>.79){for(let j=0;j<3;j++){const fx=x+(heroSeed(x,z,j+2)-.5)*.55,fz=z+(heroSeed(x,z,j+5)-.5)*.55;const flower=new THREE.Mesh(new THREE.DodecahedronGeometry(.055,0),makeMat(j%2?'#efd18b':'#f5ede3'));flower.position.set(fx,height+.14,fz);worldGroup.add(flower)}}
}
if(!cfg.surfaces){
const border=makeMat('#5d7465');for(let x=-1;x<=9;x++){if(x%2===0){addBox(worldGroup,.12,.55,.12,border,x,.17,-.75);addBox(worldGroup,.12,.55,.12,border,x,.17,8.75)}}for(let z=-1;z<=9;z++){if(z%2===0){addBox(worldGroup,.12,.55,.12,border,-.75,.17,z);addBox(worldGroup,.12,.55,.12,border,8.75,.17,z)}}
for(let i=0;i<24;i++){const x=(heroSeed(i,1,3)*11)-1.5,z=(heroSeed(i,2,4)*11)-1.5;if(x>-.7&&x<8.7&&z>-.7&&z<8.7)continue;const trunkMesh=addCyl(worldGroup,.1,.18,.8,trunk,x,.30,z,7);addCyl(worldGroup,0,.6,1.8,leaf,x,1.44,z,6);addCyl(worldGroup,0,.43,1.2,leaf,x,2.07,z,6)}
for(const [x,z] of [[-.7,-.7],[8.7,8.7]])lantern(worldGroup,x,z);
if(cfg.theme==='river'){const river=makeMat('#65a7ad',.24);addBox(worldGroup,1.15,.03,10,river,3,-.07,4);addBox(worldGroup,1.14,.07,1.03,path,3,.01,2)}
if(cfg.theme==='ruins'||cfg.theme==='citadel'){for(let i=0;i<7;i++){const x=-1.3+i*1.7;addCyl(worldGroup,.2,.25,1.6,stone,x,.4,-1.15);addBox(worldGroup,.55,.2,.55,stoneTop,x,1.27,-1.15)}}
}
goalMesh=new THREE.Group();const circle=new THREE.Mesh(new THREE.TorusGeometry(.35,.058,12,44),new THREE.MeshBasicMaterial({color:'#e3e1a4'}));circle.rotation.x=Math.PI/2;circle.position.y=.20;goalMesh.add(circle);const inner=addCyl(goalMesh,.24,.32,.22,makeMat('#f4e3ac',.35),0,.13,0);const pillar=addCyl(goalMesh,.07,.1,.75,makeMat('#456454'),0,.47,0);const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.26),new THREE.MeshStandardMaterial({color:'#ffefb6',emissive:'#dfbd5f',emissiveIntensity:1.2}));beacon.position.y=.97;goalMesh.add(beacon);goalMesh.position.set(...[cfg.goal[0],heightAt(...cfg.goal),cfg.goal[1]]);worldGroup.add(goalMesh);
crystalMeshes=[];cfg.crystals.forEach(([x,z],i)=>{const obj=new THREE.Mesh(new THREE.OctahedronGeometry(.23),new THREE.MeshStandardMaterial({color:'#9bd9d7',emissive:'#4fa7a4',emissiveIntensity:.7,metalness:.25,roughness:.2}));obj.position.set(x,heightAt(x,z)+.58,z);obj.userData.baseY=obj.position.y;obj.userData.i=i;worldGroup.add(obj);crystalMeshes.push(obj)});
checkpointMeshes=[];cfg.checkpoints.forEach(([x,z],i)=>{const group=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.06,10,36),new THREE.MeshBasicMaterial({color:'#6887af'}));ring.rotation.x=Math.PI/2;ring.position.y=.2;group.add(ring);const p=addCyl(group,.07,.09,.8,makeMat('#50687e'),0,.4,0);addSphere(group,.12,makeMat('#c1d4eb'),0,.86,0);group.position.set(x,heightAt(x,z),z);worldGroup.add(group);checkpointMeshes.push(group)});
}
let previewScene,previewCamera,previewRenderer;
function setupPreview(){previewScene=new THREE.Scene();previewScene.background=new THREE.Color('#b9d0bf');previewScene.add(new THREE.HemisphereLight('#ffffff','#7b8a78',3));const light=new THREE.DirectionalLight('#fff7df',2);light.position.set(4,7,8);previewScene.add(light);previewCamera=new THREE.PerspectiveCamera(38,1,.1,30);previewCamera.position.set(3.3,2.8,5.4);previewCamera.lookAt(0,1,0);previewRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});previewRenderer.setPixelRatio(Math.min(devicePixelRatio,1.5));$('heroPreview').appendChild(previewRenderer.domElement);refreshPreview()}
function refreshPreview(){if(!previewScene)return;if(previewActor){previewScene.remove(previewActor);previewActor.traverse(o=>o.geometry?.dispose())}previewActor=createHero();previewScene.add(previewActor)}
function initHeroForm(){const controls={name:'heroName',style:'heroStyle',personality:'heroPersonality',skin:'skinColor',armor:'armorColor',hair:'hairColor',cape:'capeColor',hairStyle:'hairStyle',accessory:'heroAccessory',height:'heroHeight',build:'heroBuild'};
for(const [key,id] of Object.entries(controls)){$(id).value=hero[key];$(id).oninput=()=>{hero[key]=['height','build'].includes(key)?Number($(id).value):$(id).value;refreshPreview()}}}
function saveHero(){try{localStorage.setItem(HERO,JSON.stringify(hero))}catch{}updateHero();$('heroOverlay').hidden=true;$('intro').hidden=true}
function randomizeHero(){const pick=a=>a[Math.floor(Math.random()*a.length)];hero={...hero,name:pick(['Nova','Atlas','Ari','Rune','Kai','Mira']),style:pick(['guardian','scout','mage']),personality:pick(['brave','calm','playful']),skin:pick(['#d7a880','#edc6aa','#aa775e','#6b4d3f','#f0d2bc']),armor:pick(['#48796b','#567ba0','#9a688a','#ae7656','#b2a254']),hair:pick(['#292b31','#6e4830','#ab835b','#d0b990']),cape:pick(['#b4a27f','#6684a0','#c46b64','#637659']),hairStyle:pick(['short','crest','long','none']),accessory:pick(['satchel','scarf','staff','none']),height:Math.floor(90+Math.random()*25),build:Math.floor(87+Math.random()*32)};initHeroForm();refreshPreview()}
const parserTokenize=s=>{const tokens=[],pattern=/\s*(\*\*|[()+\-*/]|(?:\d+(?:\.\d+)?)|(?:[A-Za-z_]\w*))/gy;let pos=0;while(pos<s.length){pattern.lastIndex=pos;const match=pattern.exec(s);if(!match)throw Error('Unknown expression: '+s.slice(pos));tokens.push(match[1]);pos=pattern.lastIndex;}return tokens};
function evaluate(input,scope){const tokens=parserTokenize(input);let p=0;
function factor(){const token=tokens[p++];if(token===undefined)throw Error('Missing value');if(token==='-')return -factor();if(token==='+')return factor();if(token==='('){const result=add();if(tokens[p++]!==')')throw Error('Missing closing parenthesis');return result}if(/^\d/.test(token))return Number(token);if(/^[A-Za-z_]/.test(token)){if(!Object.prototype.hasOwnProperty.call(scope,token))throw Error('Define '+token+' before using it');return scope[token]}throw Error('Invalid expression '+token)}
function exponent(){const a=factor();return tokens[p]==='**'?(p++,a**exponent()):a}
function mul(){let a=exponent();while(tokens[p]==='*'||tokens[p]==='/'){const op=tokens[p++],b=exponent();if(op==='/'&&b===0)throw Error('Cannot divide by zero');a=op==='*'?a*b:a/b}return a}
function add(){let a=mul();while(tokens[p]==='+'||tokens[p]==='-'){const op=tokens[p++],b=mul();a=op==='+'?a+b:a-b}return a}
const value=add();if(p!==tokens.length||!Number.isFinite(value)||Math.abs(value)>10000)throw Error('Invalid or oversized expression');return value}
function compile(src,roomPowers=[]){const program=[];for(const [i,raw] of src.split(/\r?\n/).entries()){const line=raw.split('#')[0].trim();if(!line)continue;const action=line.match(/^(jump|dash|fly)\(\s*(up|right|left|down)\s*,\s*(.+)\)$/);
if(action&&roomPowers.includes(action[1])){
  program.push({kind:action[1],name:action[2],value:action[3],line:i+1});
  continue;
}
const m=line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);if(!m)throw Error('Line '+(i+1)+': write up = 1, right = 1, left = 1 or down = 1');if(!['up','right','left','down'].includes(m[1]))throw Error('Line '+(i+1)+': choose only up, right, left, or down');program.push({kind:'direction',name:m[1],value:m[2],line:i+1})}if(program.length>65)throw Error('Maximum 65 lines per program');return program}
function coordinateText(cfg,x,z){
  return 'X '+x+' · Z '+z+(cfg.surfaces?' · H '+surfaceAt(cfg,x,z):'');
}
function setActorPosition(x,z){positions={x,z};const cfg=levels[level];actor.position.set(x,cfg.surfaces?surfaceAt(cfg,x,z):0,z);$('coordinateLabel').textContent=coordinateText(cfg,x,z);}
function resetLevel(preserveEditor=false){stopped=true;activeRun++;running=false;const cfg=levels[level];flightFuel=cfg.flightBudget??0;variables={};collected.clear();visited.clear();hasArithmetic=false;actions=0;success=false;setActorPosition(...cfg.start);actor.rotation.y=Math.PI/2;clearPose();actor.visible=true;if(!preserveEditor)$('editor').value=cfg.powers?'# Plan a route with movement and the available abilities.\n\n':'# Write your own movement variables below\n# Each line makes your hero move.\n\n';$('editorLines').textContent=$('editor').value.split('\n').length+' lines';for(const mesh of crystalMeshes)mesh.visible=true;for(const mesh of checkpointMeshes){mesh.traverse(o=>{if(o.material?.color)o.material.color.set('#6887af')})}updateHud();$('variableView').textContent='No variables defined';$('consoleView').textContent='Ready · '+cfg.title;$('nextLevel').hidden=true;$('runCode').disabled=false;status('READY');message('Write code and press Run program.');$('toggleHint').textContent='Show a clue';$('hintText').hidden=true}
function updateHud(){const cfg=levels[level];$('flightHud').hidden=!cfg.flightBudget;$('flightRange').textContent=flightFuel+' / '+(cfg.flightBudget??0);$('itemHud').hidden=cfg.crystals.length===0;$('itemCount').textContent=collected.size+' / '+cfg.crystals.length}
function updateLevelUI(){const cfg=levels[level];$('zoneLabel').textContent=(cfg.powers?'EXPEDITION · ':'CHAPTER 01 · ')+cfg.zone.toUpperCase();$('worldTitle').textContent=cfg.title;$('worldDesc').textContent=cfg.description;$('levelIndex').textContent=String(level+1).padStart(2,'0')+' / '+levels.length;$('missionLabel').textContent=cfg.objective;$('objective').textContent=cfg.objective;$('instruction').textContent=cfg.instruction;$('hintText').textContent=cfg.hint;$('concept').textContent=cfg.concept;
$('editorContext').textContent=cfg.powers?'EXPEDITION · '+cfg.powers.join(' / '):'CHAPTER 01 · VARIABLES';
$('abilityPanel').hidden=!cfg.powers;
$('abilityPanel').textContent=cfg.powers?.map(mode=>mode+'(direction, distance)').join('  ·  ')??'';
const flags=$('objectiveFlags');flags.innerHTML='';const notes=['Target ('+cfg.goal.join(', ')+')'];if(cfg.obstacles.length)notes.push('Avoid obstacles');if(cfg.crystals.length)notes.push('Collect '+cfg.crystals.length+' crystals');if(cfg.checkpoints.length)notes.push(cfg.ordered?'Relays: '+cfg.checkpoints.map(p=>'('+p.join(', ')+')').join(' → '):'Activate '+cfg.checkpoints.length+' waypoints');if(cfg.arithmetic)notes.push('Use arithmetic');for(const note of notes){const span=document.createElement('span');span.textContent=note;flags.append(span)}
decorateWorld(cfg);resetLevel();updateLevelProgress()}
function openMissions(){
  const picker=$('missionPicker');
  const next=levels.findIndex((_,i)=>i<classicCount&&!completed.has(i));
  const recommended=level>=classicCount?(levels.findIndex((_,i)=>i>=classicCount&&!completed.has(i))) : next;
  $('missionHero').textContent=hero.name.trim()||heroDefaults.name;
  $('missionProgress').textContent=completed.size+' of '+levels.length+' missions complete';
  const list=$('levelList');
  list.replaceChildren();
  const regions=$('regionLinks');
  regions.replaceChildren();
  let suggestedButton;
  let region;
  const addRegion=(name,description)=>{
    const section=document.createElement('section');
    section.className='mapRegion';
    section.tabIndex=-1;
    const shortcut=document.createElement('button');
    shortcut.type='button';
    shortcut.textContent=name;
    shortcut.addEventListener('click',()=>{
      section.focus({preventScroll:true});
      section.scrollIntoView({block:'nearest'});
    });
    regions.append(shortcut);
    const heading=document.createElement('h3');
    heading.textContent=name;
    const note=document.createElement('p');
    note.textContent=description;
    region=document.createElement('div');
    region.className='regionRooms';
    section.append(heading,note,region);
    list.append(section);
  };
  levels.forEach((mission,i)=>{
    if(i===0)addRegion('Meadow Trail','Movement variables · 12 rooms');
    if(i===classicCount)addRegion('Sunstone Heights','Terraces and phase gates');
    if(i===classicCount+2)addRegion('Aether Reach','Flight range and ordered relays');
    const available=isAvailable(i);
    const button=document.createElement('button');
    button.type='button';
    button.className='missionCard';
    button.disabled=!available;
    if(i===level)button.setAttribute('aria-current','true');
    const number=document.createElement('span');
    number.className='missionNumber';
    number.textContent=String(i+1).padStart(2,'0');
    const details=document.createElement('span');
    const title=document.createElement('strong');
    title.textContent=mission.title;
    const concept=document.createElement('small');
    concept.textContent=mission.concept.split(' · ').at(-1);
    const state=document.createElement('span');
    state.className='missionState';
    state.textContent=completed.has(i)?'Complete':!available?'Locked':i===recommended?'Play next':'Available';
    if(i===level)state.textContent+=' · Current';
    details.append(title,concept,state);
    button.append(number,details);
    button.addEventListener('click',()=>{
      if(i!==level){
        level=i;
        updateLevelUI();
        store();
        recenterCamera();
      }
      picker.close('play');
    });
    if(available&&(i===recommended||(recommended<0&&i===level)))suggestedButton=button;
    region.append(button);
  });
  picker.returnValue='';
  picker.showModal();
  suggestedButton?.focus();
}
$('missionPicker').addEventListener('close',()=>{
  if($('missionPicker').returnValue==='play'||!document.activeElement.closest('button')){
    $('openMissions').focus();
  }
});

function store(){try{localStorage.setItem(STORAGE,JSON.stringify({completed:[...completed],level}))}catch{}}
function checkWaypoint(){const cfg=levels[level];cfg.checkpoints.forEach(([x,z],i)=>{if(x===positions.x&&z===positions.z&&!visited.has(i)){if(cfg.ordered&&i!==visited.size){log('Relay '+(i+1)+' is out of order. Visit relay '+(visited.size+1)+' first.');return;}visited.add(i);checkpointMeshes[i].traverse(o=>{if(o.material?.color)o.material.color.set('#66bd89')});banner('WAYPOINT ACTIVATED');log('Waypoint '+(i+1)+' activated')}})}
async function moveStep(dx,dz,token,runId){
  const x=positions.x+dx,z=positions.z+dz;
  const cfg=levels[level];
  if(x<0||x>=W||z<0||z>=H)throw Error('World boundary at ('+x+', '+z+')');
  if(cfg.obstacles.some(([bx,bz])=>bx===x&&bz===z))throw Error('Obstacle blocks ('+x+', '+z+')');
  await animateMove({x,z,start:0,end:0,cost:0,contacts:[{x,z}]},token,'walk',runId);
}
async function animateMove(plan,direction,mode,runId){
  const cfg=levels[level];
  const from=actor.position.clone();
  from.y=plan.start;
  const to=new THREE.Vector3(plan.x,plan.end,plan.z);
  const distance=from.distanceTo(to);
  const rotations={right:Math.PI/2,left:-Math.PI/2,up:Math.PI,down:0};
  const initial=actor.rotation.y;
  const turn=Math.atan2(Math.sin(rotations[direction]-initial),Math.cos(rotations[direction]-initial));
  const duration={walk:260,jump:420+distance*65,dash:140+distance*32,fly:420+distance*85}[mode];
  const began=performance.now();
  const trail=mode==='dash'||mode==='fly'?makeMotionTrail(mode):[];
  let nextContact=0;
  const land=({x,z})=>{
    positions={x,z};
    $('coordinateLabel').textContent=coordinateText(cfg,x,z);
    checkWaypoint();
    collectCrystal();
  };
  $('cameraStage').dataset.motion=mode;
  try{
    for(;;){
      if(stopped||runId!==activeRun)return;
      const p=clamp((performance.now()-began)/duration,0,1);
      const eased=p*p*(3-2*p);
      const progress=mode==='dash'?1-(1-p)**2:mode==='walk'?p:eased;
      const arc=Math.sin(Math.PI*p);
      actor.position.lerpVectors(from,to,progress);
      if(mode==='jump')actor.position.y+=1.25*arc;
      if(mode==='fly')actor.position.y+=1.9*Math.sin(Math.PI*eased)**.65;
      if(mode==='walk')actor.position.y+=.07*Math.sin(Math.PI*2*p)**2;
      actor.rotation.y=initial+turn*Math.min(p*5,1);
      actor.rotation.x=arc*({walk:.12,jump:-.17,dash:.55,fly:.6}[mode]);
      const {legs,arms,cape}=actor.userData;
      const stride=Math.sin(p*Math.PI*2)*.58;
      legs.forEach((leg,i)=>{leg.rotation.x=mode==='walk'?(i?1:-1)*stride:(i?.5:-.7)*arc});
      arms.forEach((arm,i)=>{
        arm.rotation.x=mode==='walk'?(i?-1:1)*stride*.67:-.45*arc;
        arm.rotation.z=(i?-1:1)*arc*(mode==='fly'?.85:.09);
      });
      cape.rotation.x=.13+arc*(mode==='fly'||mode==='dash'?.8:.25);
      trail.forEach((particle,i)=>{
        const offset=(i+1)*(mode==='dash'?.18:.27);
        const [dx,dz]=directions[direction];
        particle.position.copy(actor.position).add(new THREE.Vector3(-dx*offset,.55-i*.04,-dz*offset));
        particle.material.opacity=arc*(.53-i*.065);
      });
      while(nextContact<plan.contacts.length&&progress+1e-6>=(nextContact+1)/plan.contacts.length){
        land(plan.contacts[nextContact++]);
      }
      if(p>=1)break;
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    flightFuel-=plan.cost;
    updateHud();
    message('Hero reached ('+plan.x+', '+plan.z+')');
  }finally{
    for(const particle of trail){
      scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    }
    if(runId===activeRun)clearPose();
  }
}
function makeMotionTrail(mode){
  return Array.from({length:5},(_,i)=>{
    const material=new THREE.MeshBasicMaterial({color:mode==='fly'?'#feebb6':'#d5b4ff',transparent:true,opacity:0,depthWrite:false});
    const particle=new THREE.Mesh(new THREE.SphereGeometry(.115-i*.014,8,6),material);
    scene.add(particle);
    return particle;
  });
}
function clearPose(){
  actor.rotation.x=0;
  $('cameraStage').dataset.motion='';
  for(const limb of [...actor.userData.legs,...actor.userData.arms]){
    limb.rotation.x=0;
    limb.rotation.z=0;
  }
  actor.userData.cape.rotation.x=.13;
}

function collectCrystal(){const cfg=levels[level];const index=cfg.crystals.findIndex(([x,z])=>x===positions.x&&z===positions.z);if(index<0||collected.has(index))return;collected.add(index);crystalMeshes[index].visible=false;updateHud();banner('CRYSTAL FOUND · '+collected.size+'/'+cfg.crystals.length);log('Crystal '+(index+1)+' collected')}
function validateSuccess(program){const cfg=levels[level],atGoal=positions.x===cfg.goal[0]&&positions.z===cfg.goal[1],gotItems=collected.size===cfg.crystals.length,gotWaypoints=visited.size===cfg.checkpoints.length,mathOk=!cfg.arithmetic||hasArithmetic;if(atGoal&&gotItems&&gotWaypoints&&mathOk)return true;const reasons=[];if(!atGoal)reasons.push('Reach ('+cfg.goal.join(', ')+'); currently ('+positions.x+', '+positions.z+')');if(!gotItems)reasons.push('Walk over every crystal');if(!gotWaypoints)reasons.push('Visit all waypoints');if(!mathOk)reasons.push('Use a calculation in a direction value');log('MISSION NOT COMPLETE · '+reasons.join(' · '));message(reasons.join(' · '));return false}
async function run(){if(running)return;resetLevel(true);stopped=false;const runId=activeRun;running=true;$('runCode').disabled=true;status('EXECUTING');let program;try{program=compile($('editor').value,levels[level].powers);if(!program.length)throw Error('Write at least one movement variable.');for(const instruction of program){if(stopped||runId!==activeRun)break;status('LINE '+instruction.line);const count=evaluate(instruction.value,variables);if(!Number.isInteger(count)||count<0||count>12)throw Error('Line '+instruction.line+': distance must be a whole number from 0 to 12');if(instruction.kind==='direction')variables[instruction.name]=count;if(/[+*/-]/.test(instruction.value))hasArithmetic=true;$('variableView').textContent=Object.entries(variables).map(([k,v])=>k+' = '+v).join('\n');log('Line '+instruction.line+' · '+(instruction.kind==='direction'?instruction.name+' = '+count:instruction.kind+'('+instruction.name+', '+count+')'));const cfg=levels[level];
if(instruction.kind!=='direction'){
  const plan=planMove(cfg,positions,instruction.name,count,instruction.kind,flightFuel);
  if(++actions>75)throw Error('Too many movements (limit 75)');
  await animateMove(plan,instruction.name,instruction.kind,runId);
}else for(let n=0;n<count&&!stopped&&runId===activeRun;n++){
  if(++actions>75)throw Error('Too many movements (limit 75)');
  if(cfg.surfaces){
    await animateMove(planMove(cfg,positions,instruction.name,1,'walk',flightFuel),instruction.name,'walk',runId);
  }else await moveStep(...directions[instruction.name],instruction.name,runId);
}if(count===0)await sleep(90)}if(stopped||runId!==activeRun)return;success=validateSuccess(program);if(success){completed.add(level);store();banner(level===levels.length-1?'CHAPTER COMPLETE!':'LEVEL COMPLETE!');status('MISSION COMPLETE');message('Excellent! Every objective was verified.');$('nextLevel').hidden=level===levels.length-1;updateLevelProgress()}else status('TRY AGAIN')}catch(err){if(runId===activeRun){status('FIX YOUR CODE');log('ERROR · '+err.message);message(err.message)}}finally{if(runId===activeRun){running=false;$('runCode').disabled=false}}}
function updateLevelProgress(){
  $('progressFill').style.width=(100*completed.size/levels.length)+'%';
  $('progressText').textContent=completed.size+' of '+levels.length+' complete';
}

$('runCode').onclick=run;$('stopCode').onclick=()=>{stopped=true;activeRun++;running=false;setActorPosition(positions.x,positions.z);clearPose();status('STOPPED');message('Program stopped. Reset or run again.');$('runCode').disabled=false};$('resetWorld').onclick=()=>resetLevel(true);$('nextLevel').onclick=()=>{if(level<levels.length-1&&completed.has(level)){level++;updateLevelUI();store();recenterCamera()}};
$('toggleHint').onclick=()=>{const element=$('hintText');element.hidden=!element.hidden;$('toggleHint').textContent=element.hidden?'Show a clue':'Hide clue'};
$('editor').addEventListener('input',()=>{$('editorLines').textContent=$('editor').value.split('\n').length+' lines'});
$('editor').addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const t=$('editor'),a=t.selectionStart,b=t.selectionEnd;t.value=t.value.slice(0,a)+'    '+t.value.slice(b);t.selectionStart=t.selectionEnd=a+4}});
document.querySelectorAll('[data-addcmd]').forEach(button=>button.addEventListener('click',()=>{const textarea=$('editor'),cmd=button.dataset.addcmd;textarea.setRangeText((textarea.value.endsWith('\n')?'':'\n')+cmd,textarea.selectionStart,textarea.selectionEnd,'end');textarea.focus();textarea.dispatchEvent(new Event('input'))}));
function openGuide(){const intro=$('intro');if(!intro.hidden)intro.hidden=true;$('guideOverlay').hidden=false}
$('openGuide').onclick=openGuide;$('navGuide').onclick=openGuide;$('closeGuide').onclick=()=>{$('guideOverlay').hidden=true};$('guideDone').onclick=()=>{$('guideOverlay').hidden=true};
$('navLevels').onclick=openMissions;
$('openMissions').onclick=openMissions;
$('navHero').onclick=()=>{if(!running)openCreator()};
$('startAdventure').onclick=openCreator;
$('continueAdventure').onclick=()=>{$('intro').hidden=true;openMissions()};
let creatorSnapshot,creatorFromIntro;
function openCreator(){
  creatorSnapshot={...hero};
  creatorFromIntro=!$('intro').hidden;
  $('intro').hidden=true;
  $('heroOverlay').hidden=false;
  refreshPreview();
  $('heroName').focus();
}
$('closeCreator').onclick=()=>{
  hero=creatorSnapshot;
  initHeroForm();
  $('heroOverlay').hidden=true;
  $('intro').hidden=!creatorFromIntro;
  $(creatorFromIntro?'startAdventure':'navHero').focus();
};
$('saveHero').onclick=()=>{saveHero();openMissions()};
$('randomHero').onclick=randomizeHero;
for(const button of document.querySelectorAll('[data-camera]')){
  button.addEventListener('click',()=>setCameraMode(button.dataset.camera));
}
$('resetCamera').onclick=recenterCamera;
setupPreview();initHeroForm();updateHero();updateLevelUI();
function resize(){
  const {clientWidth:w,clientHeight:h}=$('cameraStage');
  if(!w||!h)return;
  renderer.setSize(w,h,false);
  const aspect=w/h;
  const halfHeight=Math.max(frameHeight,frameWidth/aspect)*1.1;
  camera.left=-halfHeight*aspect;
  camera.right=halfHeight*aspect;
  camera.top=halfHeight;
  camera.bottom=-halfHeight;
  camera.updateProjectionMatrix();
}
recenterCamera();
new ResizeObserver(resize).observe($('cameraStage'));
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();if(actor&&!running){actor.position.y=(levels[level].surfaces?surfaceAt(levels[level],positions.x,positions.z):0)+.035*Math.sin(t*(hero.personality==='playful'?4:2));actor.userData.cape.rotation.x=.12+.035*Math.sin(t*2)}if(goalMesh){goalMesh.children[0].rotation.z+=.008;goalMesh.children[goalMesh.children.length-1].position.y=.97+.08*Math.sin(t*2)}for(const c of crystalMeshes)if(c.visible){c.rotation.y+=.015;c.position.y=c.userData.baseY+.075*Math.sin(t*3+c.userData.i)}controls.update();renderer.render(scene,camera);if(previewRenderer&&!$('heroOverlay').hidden){const host=$('heroPreview'),w=host.clientWidth,h=host.clientHeight;if(w&&h){previewRenderer.setSize(w,h,false);previewCamera.aspect=w/h;previewCamera.updateProjectionMatrix();if(previewActor)previewActor.rotation.y+=.012;previewRenderer.render(previewScene,previewCamera)}}}animate();
