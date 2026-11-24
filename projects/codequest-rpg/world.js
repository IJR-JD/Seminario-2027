import {createOverworld} from './overworld.mjs?v=adventure3';
import {createIslandAvatar} from './island-avatar.mjs';
import {shrines,travelGates,circuits} from './island-adventure.mjs';
import {pythonWaystations} from './island-exploration.mjs';
import {allRoomLocations} from './island-villages.mjs';
import {starTargets,starsFor,starsText} from './room-stars.mjs';
import {insertCommand} from './command-editor.mjs';
import {logicRooms,compileLogic,sense,pulse,logicMove,cellKey,RouteHazard} from './logic.mjs?v=edgefall1';
import * as THREE from 'three';
import {directions,expedition,surfaceAt} from './expedition.mjs';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id), clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const STORAGE='ijr-codequest-world-v2',HERO='ijr-codequest-world-hero-v1';
const W=9,H=9;
const levels=[{"title":"The First Steps","zone":"Meadow of Beginnings","theme":"meadow","start":[1,7],"goal":[3,7],"obstacles":[],"crystals":[],"checkpoints":[],"concept":"01 · One direction","description":"Walk to the glowing beacon.","objective":"Reach X 3 · Z 7","instruction":"Read the starting and target coordinates, then choose a direction and distance.","hint":"Identify the X direction. A single variable assignment moves the hero.","require":[]},{"title":"A Name for Distance","zone":"Meadow of Beginnings","theme":"meadow","start":[1,7],"goal":[5,7],"obstacles":[],"crystals":[],"checkpoints":[],"concept":"02 · Distance as a value","description":"Let a variable decide how far you go.","objective":"Reach X 5 · Z 7","instruction":"Write a single directional variable with a numeric value.","hint":"Compare the starting X and the target X. Choose the matching direction and value.","require":[]},{"title":"The First Turn","zone":"Willow Crossroads","theme":"meadow","start":[1,7],"goal":[4,4],"obstacles":[],"crystals":[],"checkpoints":[],"concept":"03 · Two assignments","description":"A new path bends toward the north.","objective":"Reach X 4 · Z 4","instruction":"Use two directional variables on separate lines.","hint":"Think about the horizontal change and vertical change as two separate assignments.","require":[]},{"title":"Across the Stream","zone":"Willow Crossroads","theme":"river","start":[1,7],"goal":[6,3],"obstacles":[[3,3],[3,4],[3,5],[3,6],[3,7],[3,8]],"crystals":[],"checkpoints":[],"concept":"04 · Order of movement","description":"The river blocks the direct path. Find the bridge at Z 2.","objective":"Cross the bridge and reach the beacon","instruction":"Plan a safe route across the stream using directional assignments.","hint":"Observe where the safe crossing lies. The order of your directional assignments matters.","require":[]},{"title":"Stones in the Valley","zone":"Mossy Passage","theme":"forest","start":[1,7],"goal":[7,3],"obstacles":[[3,7],[3,6],[3,5],[5,2],[5,3],[5,4],[5,5]],"crystals":[],"checkpoints":[],"concept":"05 · Navigating obstacles","description":"Stone walls split the valley into winding passages.","objective":"Find a safe route around stone walls","instruction":"Avoid the stones by dividing the route into several assignments.","hint":"Examine the stone obstacles from above and split the trip into smaller segments.","require":[]},{"title":"Crystals of the Glade","zone":"The Crystal Glade","theme":"forest","start":[1,7],"goal":[7,2],"obstacles":[[4,4],[4,5],[4,6]],"crystals":[[2,5],[6,3]],"checkpoints":[],"concept":"06 · Collect by visiting","description":"The beacon only awakens when both crystals are collected.","objective":"Collect two crystals before reaching the beacon","instruction":"Visit each crystal tile. Collection happens automatically upon arrival.","hint":"Crystals are picked up when the hero walks onto them. Plan to visit both before the beacon.","require":[]},{"title":"The Forest Gate","zone":"Ancient Woodland","theme":"forest","start":[1,7],"goal":[7,1],"obstacles":[[3,5],[3,6],[3,7],[5,2],[5,3],[5,4]],"crystals":[],"checkpoints":[[3,3]],"concept":"07 · Checkpoints","description":"Pass through the waypoint to activate the destination.","objective":"Touch the waypoint, then the beacon","instruction":"Visit the checkpoint before reaching the beacon.","hint":"First visit the marked checkpoint. Then continue toward the destination without crossing walls.","require":[]},{"title":"A Calculated Path","zone":"Sunstone Ruins","theme":"ruins","start":[1,7],"goal":[7,4],"obstacles":[[4,6],[4,7],[5,6],[6,6]],"crystals":[],"checkpoints":[],"concept":"08 · Arithmetic in movement","description":"Build your travel distance from two smaller values.","objective":"Use an arithmetic expression to reach the beacon","instruction":"Use an arithmetic expression to determine a movement distance.","hint":"Use a simple calculation as the numeric value of a direction. Remember that the value is a distance.","require":[],"arithmetic":true},{"title":"The Narrow Pass","zone":"Sunstone Ruins","theme":"ruins","start":[1,7],"goal":[7,1],"obstacles":[[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6]],"crystals":[],"checkpoints":[[1,3]],"concept":"09 · Repeated direction assignments","description":"Use several short movements to go around the old walls.","objective":"Reach the waypoint and solve the maze","instruction":"Break a long trip into separate directional assignments.","hint":"Look for the open corridor around the barrier. You may reuse a direction on another line.","require":[]},{"title":"The Three Signals","zone":"Valley of Signals","theme":"river","start":[1,7],"goal":[7,2],"obstacles":[[4,4],[4,5],[4,6],[4,7]],"crystals":[[2,5],[5,2],[7,3]],"checkpoints":[],"concept":"10 · Multi-stop paths","description":"Collect three signals distributed across the valley.","objective":"Collect all three signals","instruction":"Collect all signals automatically by walking across their locations.","hint":"Think about each crystal as a stop along the route, not just the final destination.","require":[]},{"title":"The Coordinate Trial","zone":"Highland Observatory","theme":"ruins","start":[1,7],"goal":[7,1],"obstacles":[[3,3],[3,4],[3,5],[3,6],[5,2],[5,3],[5,4]],"crystals":[],"checkpoints":[[2,2],[6,6]],"concept":"11 · Waypoints and planning","description":"Two waypoints. A difficult route. Your variables are the map.","objective":"Activate both waypoints and reach the beacon","instruction":"Reach the checkpoints and destination with a planned sequence of movement variables.","hint":"Plan both checkpoints as intermediate objectives. Longer paths are fine when safe.","require":[]},{"title":"The Last Beacon","zone":"Citadel of Code","theme":"citadel","start":[1,7],"goal":[7,1],"obstacles":[[3,5],[3,6],[3,7],[4,3],[4,4],[4,5],[5,5],[6,5]],"crystals":[[2,3],[7,3]],"checkpoints":[[6,2]],"concept":"12 · Final exploration","description":"The finale combines variables, careful navigation, crystals, and a waypoint.","objective":"Collect both crystals, activate the waypoint and reach the final beacon","instruction":"Build a complete route through the final world. Every objective matters.","hint":"Use the map to plan a complete itinerary through both crystals and the checkpoint.","require":[]}];
const classicCount=levels.length;
levels.push(...expedition,...logicRooms);
const roomLots=allRoomLocations();
const logicStart=classicCount+expedition.length;
const foundryStart=logicStart+4;
const heroDefaults={name:'Code Explorer',style:'guardian',personality:'brave',skin:'#d7a880',armor:'#48796b',hair:'#292b31',cape:'#b4a27f',hairStyle:'short',accessory:'satchel',height:100,build:100};
let hero={...heroDefaults},completed=new Set(),level=0,worldGroup,actor,actorParts,goalMesh,crystalMeshes=[],checkpointMeshes=[],tileMeshes=[],activeRun=0,running=false,stopped=false,positions={x:0,z:0},variables={},collected=new Set(),visited=new Set(),actions=0,hasArithmetic=false,success=false,previewActor;
const bestSteps=new Map();
let overworld,portalChanged,portalEntered,portalPrompt;
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');completed=new Set((saved.completed||[]).filter(i=>Number.isInteger(i)&&i>=0&&i<levels.length));for(const [id,steps] of Object.entries(saved.bestSteps??{})){const index=Number(id);if(completed.has(index)&&Number.isInteger(steps)&&steps>0&&steps<=75)bestSteps.set(index,steps);}level=clamp(saved.level||0,0,levels.length-1);if(!isAvailable(level))level=0}catch{}
try{hero={...hero,...JSON.parse(localStorage.getItem(HERO)||'{}')}}catch{}
function isAvailable(i){
  return Number.isInteger(i)&&i>=0&&i<levels.length;
}
const setbacks=new Map();
let flightFuel=0, logicState, conditionUsed=false, devices=[], spikeTraps=[];
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
const trim=makeMat(settings.style==='mage'?'#d5a5fd':settings.style==='scout'?'#b3e8bf':'#ffe19b',.26);
const sigil=new THREE.Mesh(new THREE.OctahedronGeometry(.125),trim);
sigil.position.set(0,1.14,.235);
group.add(sigil);
addBox(group,.61,.09,.47,dark,0,.74,0);
for(const arm of arms)addBox(arm,.22,.15,.29,trim,0,-.27,0);
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
let frameWidth=1,frameHeight=1,coordinateGroup,coordinatesVisible=true;
const compassArrows=[...document.querySelectorAll('[data-axis]')].map(element=>{
  const [x,z]=directions[element.dataset.axis];
  return {vector:new THREE.Vector3(x,0,z),arrow:element.firstElementChild};
});
const screenDirection=new THREE.Vector3();
function orientCompass(){
  for(const {vector,arrow} of compassArrows){
    screenDirection.copy(vector).transformDirection(camera.matrixWorldInverse);
    arrow.style.transform='rotate('+Math.atan2(screenDirection.x,screenDirection.y)+'rad)';
  }
}
$('toggleCoordinates').onclick=()=>{
  coordinatesVisible=!coordinatesVisible;
  if(coordinateGroup)coordinateGroup.visible=coordinatesVisible;
  $('toggleCoordinates').setAttribute('aria-pressed',String(coordinatesVisible));
};
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
  for(const x of [-1.55,width+.55]) for(const z of [-1.55,depth+.55]) for(const y of [0,top+2.9]){
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
  $('gameCanvas').style.touchAction=mode==='map'?'pan-y':'none';
  $('cameraHelp').textContent=mode==='map'?'Up and right match the movement variables':'Drag to rotate · scroll or pinch to zoom';
  recenterCamera();
}

scene.add(new THREE.HemisphereLight('#ffffff','#718d79',2.4));const sun=new THREE.DirectionalLight('#fff5d7',2.4);sun.position.set(-4,13,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;scene.add(sun);sun.shadow.bias=-.0004;
const colorThemes={meadow:['#85ae77','#91b87e','#709c6a','#d3b98c'],river:['#93b69a','#8ebc9b','#6f9d79','#bdcbb8'],forest:['#71976e','#7fa477','#53785a','#c8b78f'],ruins:['#baad87','#c7ba98','#8d9177','#9b9a85'],citadel:['#8eafa4','#a3b7a3','#687f73','#c4ac77']};
const key=(x,z)=>x+','+z;
const heroSeed=(x,z,n)=>Math.abs(Math.sin(x*123.7+z*71.3+n*52.1));
function lantern(group,x,z){const wood=makeMat('#615846'),glow=makeMat('#f9d88b',.4);addCyl(group,.05,.07,1.2,wood,x,.6,z);addBox(group,.24,.32,.22,glow,x,1.28,z)}
function addCoordinates(cfg){
  const width=cfg.width??W,depth=cfg.depth??H;
  const elevation=cfg.surfaces?Math.max(...cfg.surfaces.values()):0;
  coordinateGroup=new THREE.Group();
  coordinateGroup.visible=coordinatesVisible;
  worldGroup.add(coordinateGroup);
  function tick(text,x,z,color){
    const canvas=document.createElement('canvas');
    canvas.width=128;canvas.height=64;
    const context=canvas.getContext('2d');
    context.fillStyle=color;
    context.fillRect(3,4,122,56);
    context.fillStyle='#fff';
    context.font='bold 34px system-ui';
    context.textAlign='center';
    context.textBaseline='middle';
    context.fillText(text,64,32);
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;
    const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));
    marker.position.set(x,elevation+.12,z);
    marker.scale.set(.83,.41,1);
    coordinateGroup.add(marker);
  }
  for(let x=0;x<width;x++){
    tick('X'+x,x,-.95,'#245962');
    tick('X'+x,x,depth-.05,'#245962');
  }
  for(let z=0;z<depth;z++){
    tick('Z'+z,-.95,z,'#63442f');
    tick('Z'+z,width-.05,z,'#63442f');
  }
}
function decorateWorld(cfg){
if(worldGroup){
  const materials=new Set();
  scene.remove(worldGroup);
  worldGroup.traverse(object=>{
    object.geometry?.dispose();
    if(object.material)materials.add(object.material);
  });
  for(const material of materials){material.map?.dispose();material.dispose();}
}worldGroup=new THREE.Group();scene.add(worldGroup);const palette=colorThemes[cfg.theme];scene.background.set(cfg.conditional?(cfg.hazards?'#cca38c':cfg.zone==='Signal Grove'?'#b7cfbb':'#a6aec9'):cfg.surfaces?(cfg.theme==='citadel'?'#a4cadb':'#daccac'):cfg.theme==='ruins'?'#d8d0bc':cfg.theme==='citadel'?'#c4d1c4':'#bed2ce');
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
function compileRoom(source,cfg){
  if(!cfg.conditional)return compile(source,cfg.powers);
  return compileLogic(source,({text,line})=>{
    const power=text.match(/^(pulse|shield)\(\)$/);
    if(power&&cfg.powers.includes(power[1]))return {kind:power[1],line};
    try{return {...compile(text,cfg.powers)[0],line}}
    catch(error){throw Error(error.message.replace(/^Line 1:/,'Line '+line+':'))}
  });
}

function addLogicDevices(cfg){
  devices=[];
  spikeTraps=[];
  if(cfg.conditional){
    const grove=cfg.zone==='Signal Grove';
    const stone=makeMat(grove?'#3f665e':'#343c60',.55);
    const inset=makeMat(grove?'#eeca85':'#9c86d4',.32);
    for(const [x,z] of [[.8,.4],[cfg.width-2,.4],[.8,cfg.depth-.6],[cfg.width-2,cfg.depth-.6]]){
      addCyl(worldGroup,.36,.59,2.1,stone,x,.85,z,6);
      addCyl(worldGroup,.48,.38,.22,inset,x,1.62,z,6);
      if(grove){
        addCyl(worldGroup,.02,.87,1.55,makeMat('#5c8969'),x,2.45,z,5);
      }else{
        const light=new THREE.Mesh(new THREE.OctahedronGeometry(.34),inset);
        light.position.set(x,2.13,z);
        worldGroup.add(light);
      }
    }
  }
  if(cfg.traps){
    const base=makeMat('#683b36',.44);
    const spike=makeMat('#ff916d',.3);
    for(const [x,z] of cfg.traps){
      const y=surfaceAt(cfg,x,z);
      const plate=addBox(worldGroup,.94,.14,.94,base,x,y+.08,z);
      const bolts=new THREE.Group();
      bolts.position.set(x,y+.09,z);
      for(const dx of [-.25,.25])for(const dz of [-.25,.25]){
        addCyl(bolts,.015,.13,.46,spike,dx,0,dz,4);
      }
      worldGroup.add(bolts);
      const marker=new THREE.Mesh(new THREE.TorusGeometry(.30,.027,8,24),new THREE.MeshBasicMaterial({color:'#ffb276'}));
      marker.rotation.x=-Math.PI/2;
      marker.position.set(x,y+.155,z);
      worldGroup.add(marker);
      spikeTraps.push({x,z,y,plate,bolts,marker});
    }
  }
  for(const [kind,cells,color] of [['lock',cfg.locks,'#bb81ff'],['sentry',cfg.sentries,'#ff765e']]){
    for(const [x,z] of cells??[]){
      const root=new THREE.Group();
      root.position.set(x,surfaceAt(cfg,x,z),z);
      const base=makeMat('#243349',.35);
      addCyl(root,.38,.47,.18,base,0,.09,0,8);
      const rotor=new THREE.Group();
      rotor.position.y=.62;
      rotor.add(new THREE.Mesh(new THREE.OctahedronGeometry(.38),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.6,roughness:.3})));
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.027,10,36),new THREE.MeshBasicMaterial({color}));
      ring.rotation.x=Math.PI/2;
      rotor.add(ring);
      if(kind==='sentry'){
        const face=addSphere(rotor,.23,base,0,0,.19);
        face.scale.set(1,.68,.7);
        const eye=makeMat('#fff1ac',.3);
        for(const side of [-1,1])addSphere(rotor,.045,eye,side*.083,.025,.35);
        for(const side of [-1,1])addBox(rotor,.22,.09,.44,base,side*.38,0,0);
      }
      root.add(rotor);
      worldGroup.add(root);
      devices.push({root,rotor,kind,x,z});
    }
  }
}
function syncLogic(){
  for(const device of devices){
    device.rotor.visible=device.kind!=='lock'||!logicState.open.has(cellKey(device.x,device.z));
  }
  $('shieldState').textContent=logicState.shield?'Charged':'Ready';
  $('shieldHud').hidden=!levels[level].powers?.includes('shield');
}
async function powerEffect(color,runId){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.035,10,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false}));
  ring.position.copy(actor.position);
  ring.position.y+=.65;
  ring.rotation.x=Math.PI/2;
  scene.add(ring);
  const start=performance.now();
  try{
    while(runId===activeRun&&!stopped){
      const progress=Math.min(1,(performance.now()-start)/300);
      ring.scale.setScalar(.3+1.3*progress);
      ring.material.opacity=.85*(1-progress);
      if(progress===1)break;
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
  }finally{
    scene.remove(ring);
    ring.geometry.dispose();
    ring.material.dispose();
  }
}
function coordinateText(cfg,x,z){
  return 'X '+x+' · Z '+z+(cfg.surfaces?' · H '+surfaceAt(cfg,x,z):'');
}
function setActorPosition(x,z){positions={x,z};const cfg=levels[level];actor.position.set(x,cfg.surfaces?surfaceAt(cfg,x,z):0,z);$('coordinateLabel').textContent=coordinateText(cfg,x,z);}
function resetLevel(preserveEditor=false){updateRating();$('conditionCue').hidden=true;conditionUsed=false;logicState={open:new Set(),shield:false};syncLogic();traceLine(0);stopped=true;activeRun++;running=false;$('editor').readOnly=false;const cfg=levels[level];flightFuel=cfg.flightBudget??0;variables={};collected.clear();visited.clear();hasArithmetic=false;actions=0;success=false;setActorPosition(...cfg.start);actor.rotation.y=Math.PI/2;clearPose();actor.visible=true;if(!preserveEditor)$('editor').value=cfg.powers?'# Plan a route with movement and the available abilities.\n\n':'# Write your own movement variables below\n# Each line makes your hero move.\n\n';updateLines();for(const mesh of crystalMeshes)mesh.visible=true;for(const mesh of checkpointMeshes){mesh.traverse(o=>{if(o.material?.color)o.material.color.set('#6887af')})}updateHud();$('variableView').textContent='No variables defined';$('consoleView').textContent='Ready · '+cfg.title;$('nextLevel').hidden=true;$('returnToIsland').hidden=true;$('runCode').disabled=false;status('READY');message('Write code and press Run program.');$('toggleHint').textContent='Show a clue';$('hintText').hidden=true}
function updateHud(){const cfg=levels[level];$('setbackHud').hidden=false;$('setbackCount').textContent=setbacks.get(level)??0;$('flightHud').hidden=!cfg.flightBudget;$('flightRange').textContent=flightFuel+' / '+(cfg.flightBudget??0);$('itemHud').hidden=cfg.crystals.length===0;$('itemCount').textContent=collected.size+' / '+cfg.crystals.length}
function updateRating(steps){
  const best=bestSteps.get(level);
  const {three,two}=starTargets(level);
  $('roomRating').textContent=(steps===undefined?'':starsText(starsFor(level,steps))+' · '+steps+' steps. ')+
    '3★ ≤ '+three+' · 2★ ≤ '+two+' · 1★ above '+two+
    (best===undefined?'':' · Best: '+starsText(starsFor(level,best))+' in '+best+' steps');
}
function updateLevelUI(){updateRating();const cfg=levels[level];$('zoneLabel').textContent=(cfg.conditional?'LOGIC WORLDS · ':cfg.powers?'EXPEDITION · ':'CHAPTER 01 · ')+cfg.zone.toUpperCase();$('worldTitle').textContent=cfg.title;$('worldDesc').textContent=cfg.description;$('levelIndex').textContent=String(level+1).padStart(2,'0')+' / '+levels.length;$('missionLabel').textContent=cfg.objective;$('objective').textContent=cfg.objective;$('instruction').textContent=cfg.instruction;$('hintText').textContent=cfg.hint;$('concept').textContent=cfg.concept;$('briefConcept').textContent=cfg.concept.split(' · ').at(-1);
$('editorContext').textContent=cfg.conditional?'LOGIC · SENSORS':cfg.powers?'EXPEDITION · '+cfg.powers.join(' / '):'CHAPTER 01 · VARIABLES';
$('abilityPanel').hidden=!cfg.powers?.length;
$('abilityPanel').textContent=cfg.powers?.map(mode=>['pulse','shield'].includes(mode)?mode+'()':mode+'(direction, distance)').join('  ·  ')??'';
const flags=$('objectiveFlags');flags.innerHTML='';const notes=['Target ('+cfg.goal.join(', ')+')'];if(cfg.obstacles.length)notes.push('Avoid obstacles');if(cfg.crystals.length)notes.push('Collect '+cfg.crystals.length+' crystals');if(cfg.checkpoints.length)notes.push(cfg.ordered?'Relays: '+cfg.checkpoints.map(p=>'('+p.join(', ')+')').join(' → '):'Activate '+cfg.checkpoints.length+' waypoints');if(cfg.arithmetic)notes.push('Use arithmetic');for(const note of notes){const span=document.createElement('span');span.textContent=note;flags.append(span)}
decorateWorld(cfg);addCoordinates(cfg);addLogicDevices(cfg);resetLevel();renderEditor();updateLevelProgress()}
function showIslandToast(message){
  const toast=$('islandDiscoveryToast');
  toast.textContent=message;
  toast.hidden=false;
  clearTimeout(toast.hideTimer);
  toast.hideTimer=setTimeout(()=>{toast.hidden=true;},5500);
}
function openMissions(){
  const picker=$('missionPicker');
  const next=levels.findIndex((_,i)=>i<classicCount&&!completed.has(i));
  const recommended=level>=foundryStart?levels.findIndex((_,i)=>i>=foundryStart&&!completed.has(i)):level>=logicStart?levels.findIndex((_,i)=>i>=logicStart&&i<foundryStart&&!completed.has(i)):level>=classicCount?levels.findIndex((_,i)=>i>=classicCount&&i<logicStart&&!completed.has(i)):next;
  $('missionHero').textContent=hero.name.trim()||heroDefaults.name;
  $('missionProgress').textContent=completed.size+' / '+levels.length+' retos · '+[...bestSteps].reduce((sum,[index,steps])=>sum+starsFor(index,steps),0)+' / '+(levels.length*3)+' ★';
  const list=$('levelList');
  list.replaceChildren();
  const regions=$('regionLinks');
  regions.replaceChildren();
  let region;
  const zones=[];
  const zoneForRoom=new Map();
  const enter=$('enterPortal');
  let activeZone;
  function selectZone(zone,focus=false){
    for(const entry of zones){
      entry.section.hidden=entry!==zone;
      entry.button.setAttribute('aria-pressed',String(entry===zone));
    }
    if(focus)zone.button.focus();
  }
  const addRegion=(name,description)=>{
    const section=document.createElement('section');
    section.className='mapRegion';
    section.hidden=true;
    const index=zones.length;
    const button=document.createElement('button');
    button.type='button';
    const label=document.createElement('strong');
    label.textContent=name;
    const progress=document.createElement('small');
    button.append(label,progress);
    const zone={name,button,section,progress,done:0,total:0,rooms:[]};
    zones.push(zone);
    button.onclick=()=>selectZone(zone);
    button.onkeydown=event=>{
      const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3}[event.key];
      if(!step)return;
      event.preventDefault();
      const next=zones[index+step];
      if(next&&!(Math.abs(step)===1&&Math.floor(index/3)!==Math.floor((index+step)/3)))selectZone(next,true);
    };
    regions.append(button);
    const heading=document.createElement('h3');
    heading.textContent=name;
    const note=document.createElement('p');
    note.textContent=description;
    const rooms=document.createElement('div');
    rooms.className='regionRooms';
    section.append(heading,note,rooms);
    list.append(section);
    region={zone,rooms};
  };
  levels.forEach((mission,i)=>{
    if(i===0)addRegion('Meadow Trail','Movement variables · 12 rooms');
    if(i===classicCount)addRegion('Sunstone Heights','Terraces and phase gates');
    if(i===classicCount+2)addRegion('Aether Reach','Flight range and ordered relays');
    if(i===logicStart)addRegion('Signal Grove','Conditions, sensors and prism locks');
    if(i===logicStart+2)addRegion('Clockwork Bastion','Sentinels, shields and nested decisions');
    if(i===foundryStart)addRegion('Ember Foundry','Pressure spikes, gaps and guarded routes');
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
    const place=roomLots[i];
    button.dataset.floor=String(place.upper?2:1);
    button.dataset.topic=place.topic;
    const building=document.createElement('small');
    building.className='missionFloor';
    building.textContent=place.topic+' · '+(place.upper?'Second floor · F to climb':'Ground-floor entrance');
    const state=document.createElement('span');
    state.className='missionState';
    state.textContent=completed.has(i)?'Complete':!available?'Locked':i===recommended?'Play next':'Available';
    if(i===level)state.textContent+=' · Current';
    const rating=document.createElement('small');
    const {three}=starTargets(i);
    rating.textContent=bestSteps.has(i)?starsText(starsFor(i,bestSteps.get(i)))+' · '+bestSteps.get(i)+' steps':'3★ target: '+three+' steps';
    details.append(title,concept,building,state,rating);
    button.append(number,details);
    button.addEventListener('click',()=>{
      if(overworld){
        overworld.travel(i);
        setDirectory(false);
        if(roomLots[i].upper)showIslandToast('Second-floor room · Approach the building ladder and press F to climb');
        $('overworldCanvas').focus();
      }else portalEntered(i);
    });
    region.zone.rooms.push(i);
    zoneForRoom.set(i,region.zone);
    region.zone.total++;
    if(completed.has(i))region.zone.done++;
    if(i===level)activeZone=region.zone;
    region.rooms.append(button);
  });
  for(const zone of zones)zone.progress.textContent=zone.done+' / '+zone.total+' complete';
  picker.returnValue='';
  picker.showModal();
  selectZone(activeZone??zones[0]);
  let promptKey;
  portalEntered=i=>{
    if(!isAvailable(i))return;
    if(i!==level){
      level=i;
      updateLevelUI();
      store();
      recenterCamera();
    }
    picker.close('play');
  };
  portalChanged=i=>{
    $('portalStatus').textContent=i===undefined?'':levels[i].title;
    if(i!==undefined)selectZone(zoneForRoom.get(i));
  };
  portalPrompt=prompt=>{
    enter.hidden=!prompt;
    if(!prompt)return;
    enter.style.left=prompt.x+'%';
    enter.style.top=prompt.y+'%';
    const key=prompt.room??prompt.guide;
    if(promptKey===key)return;
    promptKey=key;
    const room=prompt.room, best=bestSteps.get(room);
    $('doorAction').textContent=room===undefined?'R · Hablar':'Enter para ingresar';
    $('doorTitle').textContent=room===undefined?prompt.guide:levels[room].title;
    $('doorStars').textContent=room===undefined?'':(roomLots[room].upper?'2F · ':'1F · ')+(best===undefined?
      '☆☆☆ · 3★ en '+starTargets(room).three+' pasos':starsText(starsFor(room,best))+' · '+best+' pasos');
  };
  enter.hidden=true;
  enter.onclick=()=>{overworld?.interact();if(picker.open)$('overworldCanvas').focus();};
  const directory=$('islandDirectory'),directoryToggle=$('islandDirectoryToggle');
  const trailPanel=$('islandTrailPanel'),trailToggle=$('islandTrailToggle');
  const trailList=$('islandTrailList');
  const adventurePanel=$('islandAdventurePanel'),adventureToggle=$('islandAdventureToggle');
  let journalSignature='';
  function renderAdventure(state){
    $('adventureProgress').textContent=state.powers.length+'/3 powers · '+state.circuits.length+'/4 trials';
    $('adventureFuel').textContent=state.powers.includes('fly')?'Flight '+state.flight.toFixed(1)+'s':'';
    document.querySelectorAll('[data-power]').forEach(button=>{
      const id=button.dataset.power;button.dataset.unlocked=String(state.powers.includes(id));
      button.setAttribute('aria-pressed',String(id==='fly'?state.flying:id==='wall'?state.wallRunning:false));
      button.title=state.powers.includes(id)?(id==='dash'&&!state.dashReady?'Recharging':'Power unlocked'):'Find the shrine to unlock';
    });
    $('adventureGate').dataset.unlocked=String(!!state.gate);
    const signature=JSON.stringify([state.powers,state.circuits,state.progress,state.setbacks]);
    if(signature===journalSignature)return;
    journalSignature=signature;
    const list=$('adventureList');list.replaceChildren();
    for(const item of [...shrines,...circuits,...travelGates]){
      const shrine=shrines.includes(item),circuit=circuits.includes(item);
      const done=shrine?state.powers.includes(item.id):circuit?state.circuits.includes(item.id):false;
      const entry=document.createElement('article');entry.className='islandTrailEntry';entry.dataset.found=String(done);
      const title=document.createElement('h4');title.textContent=(done?'✓ ':shrine?'✦ ':circuit?'◇ ':'◎ ')+item.name;
      const body=document.createElement('p');body.textContent=item.description??'Paired gate · press G beside the arch to travel.';
      const location=document.createElement('small');location.textContent='X '+item.x+' · Z '+item.z+(circuit?' · '+(state.progress[item.id]??0)+'/'+item.steps.length+' pads':'');
      const route=document.createElement('button');route.type='button';route.dataset.adventureRoute=item.id;route.textContent='Walk to '+item.name;
      route.onclick=()=>{if(overworld?.locateAdventure(item.id)){setAdventurePanel(false);$('overworldCanvas').focus();}};
      entry.append(title,body,location,route);list.append(entry);
    }
  }
  function setAdventurePanel(open){
    adventurePanel.hidden=!open;adventureToggle.setAttribute('aria-expanded',String(open));
    if(open){setDirectory(false);setTrailPanel(false);if(overworld)renderAdventure(overworld.adventureState());}
  }
  function renderPythonTrail(){
    if(!overworld)return;
    const progress=overworld.trailState();
    const discovered=new Set(progress.ids);
    $('islandTrailProgress').textContent=discovered.size+' / '+progress.total+' Python Trail';
    trailList.replaceChildren();
    for(const station of pythonWaystations){
      const found=discovered.has(station.id);
      const entry=document.createElement('article');
      entry.className='islandTrailEntry';
      entry.dataset.found=String(found);
      const heading=document.createElement('h4');
      heading.textContent=(found?'✓ ':'◇ ')+station.name+' · '+station.concept;
      const clue=document.createElement('p');
      clue.textContent=found?station.note:station.clue;
      const coords=document.createElement('small');
      coords.textContent='X '+station.x+' · Z '+station.z+(found?' · Discovered':' · Unexplored');
      const button=document.createElement('button');
      button.type='button';
      const selected=progress.waypoint===station.id;
      button.setAttribute('aria-pressed',String(selected));
      button.textContent=selected?'Clear waypoint':'Set waypoint';
      button.onclick=()=>{
        const active=overworld.setWaypoint(station.id);
        renderPythonTrail();
        if(active)setTrailPanel(false); // Reveal the 3D route immediately after selection.
        $('overworldCanvas').focus();
      };
      entry.append(heading,clue,coords);
      if(found){
        const example=document.createElement('code');
        example.textContent=station.example;
        entry.append(example);
      }
      entry.append(button);
      trailList.append(entry);
    }
  }
  const cameraToggle=$('islandCamera');
  function setDirectory(open){
    directory.hidden=!open;
    directoryToggle.setAttribute('aria-expanded',String(open));
    if(open){trailPanel.hidden=true;trailToggle.setAttribute('aria-expanded','false');setAdventurePanel(false);}
  }
  function setTrailPanel(open){
    trailPanel.hidden=!open;
    trailToggle.setAttribute('aria-expanded',String(open));
    if(open){setDirectory(false);setAdventurePanel(false);renderPythonTrail();}
  }
  setDirectory(false);
  setTrailPanel(false);
  setAdventurePanel(false);
  adventureToggle.onclick=()=>setAdventurePanel(adventurePanel.hidden);
  directoryToggle.onclick=()=>setDirectory(directory.hidden);
  trailToggle.onclick=()=>setTrailPanel(trailPanel.hidden);
  cameraToggle.setAttribute('aria-pressed','false');
  cameraToggle.textContent='Island map';
  $('islandZoomIn').onclick=()=>{overworld?.adjustCamera(0,1/1.18);$('overworldCanvas').focus();};
  $('islandZoomOut').onclick=()=>{overworld?.adjustCamera(0,1.18);$('overworldCanvas').focus();};
  document.querySelectorAll('#islandDpad [data-walk]').forEach(button=>{
    const key=button.dataset.walk;
    const release=()=>{overworld?.setMovementKey(key,false);button.dataset.active='false';};
    button.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      overworld?.setMovementKey(key,true);
      button.dataset.active='true';
    });
    button.addEventListener('pointerup',release);
    button.addEventListener('pointercancel',release);
    button.addEventListener('lostpointercapture',release);
    button.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!event.repeat){
        event.preventDefault();overworld?.setMovementKey(key,true);
      }
    });
    button.addEventListener('keyup',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();release();}
    });
    button.addEventListener('blur',release);
  });
  document.querySelectorAll('[data-traversal]').forEach(button=>{
    button.onclick=()=>{overworld?.action(button.dataset.traversal);$('overworldCanvas').focus();};
  });
  cameraToggle.onclick=()=>{
    const map=cameraToggle.getAttribute('aria-pressed')!=='true';
    overworld.setMapMode(map);
    cameraToggle.setAttribute('aria-pressed',String(map));
    cameraToggle.textContent=map?'Follow camera':'Island map';
    $('overworldCanvas').focus();
  };
  if(!overworld){
    try{
      overworld=createOverworld({canvas:$('overworldCanvas'),stage:$('overworldStage'),makeHero:settings=>createIslandAvatar(settings??hero),
        onNear:i=>portalChanged(i),onEnter:i=>portalEntered(i),
        onTraversal:state=>{
          const output=$('islandTraversalStatus');
          if(output.textContent!==state)output.textContent=state;
        },
        onPrompt:prompt=>portalPrompt(prompt),
        onDialogue:guide=>showIslandToast(guide.name+' · '+guide.line),
        onAdventure:renderAdventure,onAdventureToast:showIslandToast,
        onTrailChange:()=>renderPythonTrail(),
        onWayfinder:hint=>{$('islandTrailDistance').textContent=hint;},
        onWaystation:(station,found,total)=>{
          showIslandToast('Python Trail '+found+' / '+total+' · '+station.name+' · '+station.note);
          renderPythonTrail();
        },
        onDiscovery:(relic,found,total)=>{
          $('islandDiscoveries').textContent=found+' / '+total+' discoveries';
          showIslandToast(relic.name+' · '+relic.note);
        }});
      overworld.addZones(zones);
    }catch(error){
      overworld=null;
      $('overworldStage').hidden=true;
    }
  }
  portalChanged(undefined);
  if(overworld){
    cameraToggle.hidden=false;
    trailToggle.hidden=false;adventureToggle.hidden=false;renderAdventure(overworld.adventureState());
    const [found,total]=overworld.discoveries();
    $('islandDiscoveries').textContent=found+' / '+total+' discoveries';
    $('islandDiscoveryToast').hidden=true;
    overworld.setMapMode(false);
    overworld.visit(level,isAvailable,bestSteps);
    renderPythonTrail();
    $('overworldCanvas').focus();
  }else{
    cameraToggle.hidden=true;
    trailToggle.hidden=true;adventureToggle.hidden=true;
    setDirectory(true);
    $('portalStatus').classList.add('visible');
    $('portalStatus').textContent='3D map unavailable. Select a room below.';
    (activeZone??zones[0]).button.focus();
  }
}
$('missionPicker').addEventListener('close',()=>{
  if($('missionPicker').returnValue==='play'||!document.activeElement.closest('button')){
    $('openMissions').focus();
  }
});

$('returnToIsland').onclick=openMissions;

function store(){try{localStorage.setItem(STORAGE,JSON.stringify({completed:[...completed],level,bestSteps:Object.fromEntries(bestSteps)}))}catch{}}
function checkWaypoint(){const cfg=levels[level];cfg.checkpoints.forEach(([x,z],i)=>{if(x===positions.x&&z===positions.z&&!visited.has(i)){if(cfg.ordered&&i!==visited.size){log('Relay '+(i+1)+' is out of order. Visit relay '+(visited.size+1)+' first.');return;}visited.add(i);checkpointMeshes[i].traverse(o=>{if(o.material?.color)o.material.color.set('#66bd89')});banner('WAYPOINT ACTIVATED');log('Waypoint '+(i+1)+' activated')}})}
async function moveStep(dx,dz,token,runId){
  const x=positions.x+dx,z=positions.z+dz;
  const cfg=levels[level];
  if(x<0||x>=W||z<0||z>=H)throw new RouteHazard('fall',x,z,'You walked off the platform at ('+x+', '+z+').');
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
      if(mode==='jump')actor.position.y+=1.55*arc;
      if(mode==='fly')actor.position.y+=1.9*Math.sin(Math.PI*eased)**.65+.09*arc*Math.sin(p*24);
      actor.rotation.z=mode==='fly'?Math.sin(p*Math.PI*2)*.2:mode==='jump'?Math.sin(p*Math.PI*2)*.1:0;
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
  actor.rotation.z=0;
  for(const trap of spikeTraps){
    trap.plate.position.y=trap.y+.08;
    trap.bolts.position.y=trap.y+.09;
    trap.marker.scale.setScalar(1);
  }
  $('cameraStage').dataset.motion='';
  for(const limb of [...actor.userData.legs,...actor.userData.arms]){
    limb.rotation.x=0;
    limb.rotation.z=0;
  }
  actor.userData.cape.rotation.x=.13;
}

function collectCrystal(){const cfg=levels[level];const index=cfg.crystals.findIndex(([x,z])=>x===positions.x&&z===positions.z);if(index<0||collected.has(index))return;collected.add(index);crystalMeshes[index].visible=false;updateHud();banner('CRYSTAL FOUND · '+collected.size+'/'+cfg.crystals.length);log('Crystal '+(index+1)+' collected')}
function validateSuccess(program){const cfg=levels[level],atGoal=positions.x===cfg.goal[0]&&positions.z===cfg.goal[1],gotItems=collected.size===cfg.crystals.length,gotWaypoints=visited.size===cfg.checkpoints.length,mathOk=!cfg.arithmetic||hasArithmetic;if(atGoal&&gotItems&&gotWaypoints&&mathOk&&(!cfg.conditional||conditionUsed))return true;const reasons=[];if(cfg.conditional&&!conditionUsed)reasons.push('Run at least one if condition');if(!atGoal)reasons.push('Reach ('+cfg.goal.join(', ')+'); currently ('+positions.x+', '+positions.z+')');if(!gotItems)reasons.push('Walk over every crystal');if(!gotWaypoints)reasons.push('Visit all waypoints');if(!mathOk)reasons.push('Use a calculation in a direction value');log('MISSION NOT COMPLETE · '+reasons.join(' · '));message(reasons.join(' · '));return false}
async function animateCondition(cfg,instruction,expression,pass,branch,runId){
  const cue=$('conditionCue');
  const result=$('conditionResult');
  $('conditionExpression').textContent='Line '+instruction.line+' · '+expression;
  result.textContent='Scanning…';
  cue.dataset.result='scan';
  cue.hidden=false;
  const [dx,dz]=directions[instruction.direction];
  const x=positions.x+dx,z=positions.z+dz;
  const y=(surfaceAt(cfg,x,z)??actor.position.y)+.16;
  const material=new THREE.MeshBasicMaterial({color:'#8edcff',transparent:true,opacity:.9,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.37,.035,8,32),material);
  ring.rotation.x=-Math.PI/2;
  ring.position.set(x,y,z);
  scene.add(ring);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start=performance.now();
  try{
    while(runId===activeRun&&!stopped){
      const t=Math.min(1,(performance.now()-start)/(reduced?440:700));
      if(t>=.32&&cue.dataset.result==='scan'){
        cue.dataset.result=pass?'true':'false';
        result.textContent=(pass?'TRUE':'FALSE')+' → '+branch;
        material.color.set(pass?'#69ffb3':'#ffbc73');
      }
      if(!reduced){
        const travel=Math.min(1,t/.32);
        ring.scale.setScalar(.72+Math.sin(Math.PI*t)*.6);
        ring.position.x=positions.x+dx*travel;
        ring.position.z=positions.z+dz*travel;
        ring.position.y=y+.26*Math.sin(Math.PI*t);
        ring.material.opacity=.9-.52*t;
      }
      if(t===1)break;
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
  }finally{
    scene.remove(ring);
    ring.geometry.dispose();
    material.dispose();
  }
}

async function executeBlock(program,cfg,runId){
  for(const instruction of program){
    if(stopped||runId!==activeRun)return;
    traceLine(instruction.line);
    status('LINE '+instruction.line);
    const {kind,name,value,line}=instruction;
    if(kind==='if'){
      conditionUsed=true;
      const reading=sense(cfg,logicState,positions,instruction.sensor,instruction.direction);
      const pass=reading!==instruction.negate;
      const expression=(instruction.negate?'not ':'')+instruction.sensor+'('+instruction.direction+')';
      const branch=pass?'IF':instruction.no.length?'ELSE':'SKIP';
      log('Line '+line+' · '+expression+' → '+pass+' · '+branch);
      await animateCondition(cfg,instruction,expression,pass,branch,runId);
      await executeBlock(pass?instruction.yes:instruction.no,cfg,runId);
      continue;
    }
    if(kind==='pulse'||kind==='shield'){
      if(++actions>75)throw Error('Too many actions (limit 75)');
      if(kind==='pulse')pulse(cfg,logicState,positions);
      else logicState.shield=true;
      syncLogic();
      log('Line '+line+' · '+kind+'()');
      await powerEffect(kind==='pulse'?'#b899ff':'#78e8fc',runId);
      continue;
    }
    const count=evaluate(value,variables);
    if(!Number.isSafeInteger(count)||count<0)throw Error('Line '+line+': distance must be a nonnegative whole number.');
    const walk=kind==='direction';
    if(walk)variables[name]=count;
    if(/[+*/-]/.test(value))hasArithmetic=true;
    $('variableView').textContent=Object.entries(variables).map(([key,value])=>key+' = '+value).join('\n');
    log('Line '+line+' · '+(walk?name+' = '+count:kind+'('+name+', '+count+')'));
    for(let n=0;n<(walk?count:1)&&!stopped&&runId===activeRun;n++){
      if(++actions>75)throw Error('Too many movements (limit 75)');
      if(!cfg.surfaces){
        await moveStep(...directions[name],name,runId);
        continue;
      }
      const plan=logicMove(cfg,logicState,positions,name,walk?1:count,walk?'walk':kind,flightFuel);
      await animateMove(plan,name,walk?'walk':kind,runId);
      if(runId!==activeRun||stopped)return;
      logicState.shield=false;
      syncLogic();
    }
  }
}
async function run(){
  if(running)return;
  resetLevel(true);
  const runId=activeRun,cfg=levels[level];
  stopped=false;
  running=true;
  $('runCode').disabled=true;
  $('editor').readOnly=true;
  status('EXECUTING');
  try{
    const program=compileRoom($('editor').value,cfg);
    if(!program.length)throw Error('Write at least one instruction.');
    await executeBlock(program,cfg,runId);
    if(stopped||runId!==activeRun)return;
    success=validateSuccess();
    if(success){
      completed.add(level);
      if(!bestSteps.has(level)||actions<bestSteps.get(level))bestSteps.set(level,actions);
      updateRating(actions);
      store();
      banner('LEVEL COMPLETE!');
      status('MISSION COMPLETE');
      message(starsText(starsFor(level,actions))+' · '+actions+' steps. All objectives verified.');
      $('nextLevel').hidden=level===levels.length-1;$('returnToIsland').hidden=false;
      updateLevelProgress();
    }else status('TRY AGAIN');
  }catch(error){
    if(runId===activeRun&&error instanceof RouteHazard){
      await resolveHazard(error,runId);
    }else if(runId===activeRun){
      status('FIX YOUR CODE');
      log('ERROR · '+error.message);
      message(error.message);
    }
  }finally{
    if(runId===activeRun){
      running=false;
      $('editor').readOnly=false;
      $('runCode').disabled=false;
    }
  }
}
async function resolveHazard(hazard,runId){
  setbacks.set(level,(setbacks.get(level)??0)+1);
  updateHud();
  const fall=hazard.kind==='fall';
  status(fall?'FALL':'TRAP HIT');
  message(hazard.message);
  const origin=actor.position.clone();
  const destination=new THREE.Vector3(hazard.x,origin.y,hazard.z);
  const dx=destination.x-origin.x,dz=destination.z-origin.z;
  actor.rotation.y=Math.atan2(dx,dz);
  const trap=spikeTraps.find(item=>item.x===hazard.x&&item.z===hazard.z);
  const start=performance.now();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('cameraStage').dataset.motion='setback';
  while(runId===activeRun&&!stopped){
    const t=Math.min(1,(performance.now()-start)/(reduced?160:920));
    const impact=Math.max(0,(t-.28)/.72);
    if(trap){
      const extension=reduced?1:Math.min(1,impact*9)*(1-Math.max(0,impact-.7)/.3);
      trap.plate.position.y=trap.y+.08-.055*extension;
      trap.bolts.position.y=trap.y+.09+.48*extension;
      trap.marker.scale.setScalar(1+.25*extension);
    }
    if(!reduced){
      if(fall){
        actor.position.lerpVectors(origin,destination,Math.min(1,t/.34));
        actor.position.y+=Math.sin(Math.PI*Math.min(1,t/.34))*.10-6.2*impact**2;
        actor.rotation.x=impact*4.8;
        actor.rotation.z=Math.sin(impact*Math.PI)*.85;
      }else{
        const approach=Math.min(1,t/.28);
        actor.position.lerpVectors(origin,destination,approach);
        actor.position.x-=dx*.38*impact;
        actor.position.z-=dz*.38*impact;
        actor.position.y+=Math.sin(Math.PI*impact)*.95;
        actor.rotation.x=-impact*1.35;
        actor.rotation.z=impact*.55;
      }
      for(const [i,arm] of actor.userData.arms.entries())arm.rotation.z=(i?1:-1)*impact*1.35;
      actor.userData.cape.rotation.x=.13+.65*impact;
    }
    if(t===1)break;
    await new Promise(resolve=>requestAnimationFrame(resolve));
  }
  if(runId!==activeRun||stopped)return;
  resetLevel(true);
  status('TRY AGAIN');
  log('SETBACK · '+hazard.message);
  message(hazard.message+' Returned to the room entrance. Your code is saved in the editor.');
  banner('RETURNED TO START');
}
function updateLevelProgress(){
  $('progressFill').style.width=(100*completed.size/levels.length)+'%';
  $('progressText').textContent=completed.size+' of '+levels.length+' complete';
}

$('runCode').onclick=run;$('stopCode').onclick=()=>{stopped=true;activeRun++;running=false;setActorPosition(positions.x,positions.z);clearPose();traceLine(0);$('conditionCue').hidden=true;$('editor').readOnly=false;status('STOPPED');message('Program stopped. Reset or run again.');$('runCode').disabled=false};$('resetWorld').onclick=()=>resetLevel(true);$('nextLevel').onclick=()=>{if(level<levels.length-1&&completed.has(level)){level++;updateLevelUI();store();recenterCamera()}};
$('toggleHint').onclick=()=>{const element=$('hintText');element.hidden=!element.hidden;$('toggleHint').textContent=element.hidden?'Show a clue':'Hide clue'};
const editor=$('editor');
const gutter=$('lineGutter');
function traceLine(line){
  for(const row of gutter.children)row.classList.toggle('current',Number(row.textContent)===line);
  if(line){
    const row=gutter.children[line-1];
    if(row){
      const target=row.offsetTop-gutter.firstElementChild.offsetTop;
      if(target<editor.scrollTop||target+row.offsetHeight>editor.scrollTop+editor.clientHeight){
        editor.scrollTop=target;
        gutter.scrollTop=target;
      }
    }
  }
}
function updateLines(){
  const count=editor.value.split('\n').length;
  $('editorLines').textContent=count+' lines';
  gutter.replaceChildren(...Array.from({length:count},(_,i)=>{
    const number=document.createElement('span');
    number.textContent=i+1;
    return number;
  }));
  gutter.scrollTop=editor.scrollTop;
}
function renderEditor(){
  const cfg=levels[level],palette=$('commandPalette');
  palette.replaceChildren();
  const snippets=[['↑ Up','up = 1'],['→ Right','right = 1'],['↓ Down','down = 1'],['← Left','left = 1']];
  for(const power of cfg.powers??[])snippets.push([power,['pulse','shield'].includes(power)?power+'()':power+'(right, 1)']);
  if(cfg.conditional){
    for(const sensor of ['clear','locked','danger'])snippets.push(['if '+sensor,'if '+sensor+'(right):\n    right = 0']);
    snippets.push(['if / else','if clear(right):\n    right = 0\nelse:\n    down = 0']);
  }
  for(const [label,code] of snippets){
    const button=document.createElement('button');
    button.type='button';
    button.textContent=label;
    button.title=code;
    button.addEventListener('pointerdown',event=>event.preventDefault());
    button.onclick=()=>{
      if(editor.readOnly)return;
      const result=insertCommand(editor.value,editor.selectionStart,editor.selectionEnd,code);
      editor.setRangeText(result.value,0,editor.value.length,'end');
      editor.focus();
      editor.setSelectionRange(result.start,result.end);
      updateLines();
    };
    palette.append(button);
  }
  $('logicGuide').hidden=!cfg.conditional;
  updateLines();
}
editor.addEventListener('input',updateLines);
editor.addEventListener('scroll',()=>{gutter.scrollTop=editor.scrollTop});
editor.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){
    event.preventDefault();
    run();
  }else if(event.key==='Enter'&&!editor.readOnly){
    const line=editor.value.slice(0,editor.selectionStart).split('\n').at(-1);
    event.preventDefault();
    editor.setRangeText('\n'+line.match(/^ */)[0]+(line.trimEnd().endsWith(':')?'    ':''),editor.selectionStart,editor.selectionEnd,'end');
    updateLines();
  }
});
// The run controls now live directly in the shared command dock.
const roomStudio=$('roomStudio'),focusRoom=$('focusRoom');
function setRoomFocus(enabled){
  roomStudio.classList.toggle('roomFocus',enabled);
  focusRoom.setAttribute('aria-pressed',String(enabled));
  focusRoom.textContent=enabled?'Show commands':'Focus view';
  focusRoom.title=enabled?'Restore the programming workspace':'Expand the 3D viewport';
  resize();
}
focusRoom.onclick=()=>setRoomFocus(focusRoom.getAttribute('aria-pressed')!=='true');
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&roomStudio.classList.contains('roomFocus')&&!$('missionPicker').open){
    setRoomFocus(false);
  }
});
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
  const halfHeight=Math.max(frameHeight,frameWidth/aspect)*1.045;
  camera.left=-halfHeight*aspect;
  camera.right=halfHeight*aspect;
  camera.top=halfHeight;
  camera.bottom=-halfHeight;
  camera.updateProjectionMatrix();
}
recenterCamera();
new ResizeObserver(resize).observe($('cameraStage'));
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();
if($('missionPicker').open&&overworld){overworld.frame(performance.now());return;}
for(const device of devices){
  device.rotor.rotation.y=t*(device.kind==='sentry'?2:.8);
  device.rotor.position.y=.68+Math.sin(t*2+device.x)*.15;
}if(actor&&!running){actor.position.y=(levels[level].surfaces?surfaceAt(levels[level],positions.x,positions.z):0)+.035*Math.sin(t*(hero.personality==='playful'?4:2));actor.userData.cape.rotation.x=.12+.035*Math.sin(t*2)}if(goalMesh){goalMesh.children[0].rotation.z+=.008;goalMesh.children[goalMesh.children.length-1].position.y=.97+.08*Math.sin(t*2)}for(const c of crystalMeshes)if(c.visible){c.rotation.y+=.015;c.position.y=c.userData.baseY+.075*Math.sin(t*3+c.userData.i)}controls.update();camera.updateMatrixWorld();orientCompass();renderer.render(scene,camera);if(previewRenderer&&!$('heroOverlay').hidden){const host=$('heroPreview'),w=host.clientWidth,h=host.clientHeight;if(w&&h){previewRenderer.setSize(w,h,false);previewCamera.aspect=w/h;previewCamera.updateProjectionMatrix();if(previewActor)previewActor.rotation.y+=.012;previewRenderer.render(previewScene,previewCamera)}}}animate();
