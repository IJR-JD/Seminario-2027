import * as THREE from 'three';

const bounds={x:92,z:76};
const crossings=[-47,0,47];
const river=z=>Math.abs(z)<3.3;
const bridge=x=>crossings.some(center=>Math.abs(x-center)<2.1);
const walkable=(x,z)=>shore(x,z)<.91&&(!river(z)||bridge(x));
const landmarks=[
  [[-13,7],[-6,5],[4,6],[13,7],[14,-1],[7,-4],[-2,-2],[-12,-1],[-14,-10],[-5,-14],[5,-14],[13,-10]],
  [[-11,5],[10,-8]], [[-10,6],[8,-10]],
  [[-10,-5],[10,8]], [[-11,-6],[10,9]], [[-10,-6],[9,9]],
];
const summits=[{x:25,z:-53,h:13,r:16},{x:-33,z:52,h:10,r:15},{x:68,z:-22,h:7,r:13}];
const towers=[{x:23,z:24,h:8},{x:25,z:-53,h:6}];
const passage={x:14,z:46};
const secrets=[
  {id:'summit',x:25,z:-55,name:'The Sky Ledger',note:'The island survey ends at this lookout.',tower:1},
  {id:'grotto',x:14,z:46,name:'The Echo Seal',note:'A tiny seal rests beneath the stone arch.'},
  {id:'tide',x:-65,z:-7,name:'The Tide Almanac',note:'A mariner marked the route to the old observatory in the margin.'},
  {id:'lantern',x:20,z:41,name:'The Last Lantern',note:'A lantern still burns for the first explorer who crossed the island.'},
  {id:'bell',x:-14,z:-46,name:'The Buried Bell',note:'Its inscription reads: Every journey begins with a single instruction.'},
  {id:'glass',x:63,z:11,name:'Glass Compass',note:'The needle points toward the furnaces, even when cold.'},
];
const shore=(x,z)=>Math.hypot(x/bounds.x,z/bounds.z);
const terrain=(x,z)=>.85+1.05*Math.sin(x*.09)*Math.sin(z*.15)+.55*Math.cos(z*.17)+
  summits.reduce((height,peak)=>height+peak.h*Math.max(0,1-Math.hypot(x-peak.x,z-peak.z)/peak.r)**1.45,0);
const lowCeiling=(x,z)=>Math.abs(x-passage.x)<1.7&&Math.abs(z-passage.z)<2.2;
const towerFloor=tower=>terrain(tower.x,tower.z)+tower.h;
const elevation=(x,z)=>river(z)&&bridge(x)?1.15:terrain(x,z);
const colors=['#528665','#b08656','#528baa','#618850','#71628f','#9b5d47'];
const controls={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};

export function createOverworld({canvas,stage,makeHero,onNear,onEnter,onDiscovery,onTraversal}){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#b6dfe8');
  scene.fog=new THREE.FogExp2('#b6dfe8',.006);
  const follow=new THREE.PerspectiveCamera(49,1,.1,260);
  const survey=new THREE.OrthographicCamera(-1,1,1,-1,.1,240);
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
  const material=color=>new THREE.MeshStandardMaterial({color});
  function box(width,height,depth,mat,x,y,z){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),mat);
    mesh.position.set(x,y,z);
    scene.add(mesh);
    return mesh;
  }
  const water=new THREE.Mesh(new THREE.PlaneGeometry(420,420),new THREE.MeshStandardMaterial({color:'#258dac',roughness:.48}));
  water.rotation.x=-Math.PI/2;
  water.position.y=-1;
  scene.add(water);
  const ground=new THREE.PlaneGeometry(194,162,162,135);
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
    color.multiplyScalar(.94+.10*Math.sin(x*1.16+z*.73));
    shades.push(color.r,color.g,color.b);
  }
  ground.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
  ground.computeVertexNormals();
  const island=new THREE.Mesh(ground,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  scene.add(island);
  const wood=material('#a07750'), timber=material('#503c34'), ivory=material('#ddc398');
  const roofMats=['#885d49','#ab7346','#54678d','#526956','#534e6b','#763f3c'].map(material);
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
  function tree(x,z,scale,tint){
    const y=elevation(x,z);
    box(.31*scale,1.65*scale,.31*scale,trunk,x,y+.8*scale,z);
    const crown=new THREE.Mesh(new THREE.ConeGeometry(1.1*scale,2.6*scale,6),material(tint));
    crown.position.set(x,y+2.15*scale,z);
    scene.add(crown);
  }
  for(let i=0;i<105;i++){
    const angle=i*2.39996,r=.35+.51*((i*17)%107)/107;
    const x=Math.cos(angle)*bounds.x*r,z=Math.sin(angle)*bounds.z*r;
    if(Math.abs(z)<7||crossings.some(center=>Math.abs(x-center)<18&&Math.abs(Math.abs(z)-27)<18))continue;
    tree(x,z,.62+(i%5)*.12,i%2?'#38694a':'#497953');
  }
  const pickables=[],portals=new Map(),keys=new Set();
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
    if(key==='jump'&&!climb&&!crouched&&!air&&!velocity)velocity=7.6;
    if(key==='crouch'&&!climb&&!air&&!velocity){
      if(crouched&&lowCeiling(position.x,position.z))return;
      crouched=!crouched;
    }
    if(key==='climb'&&!climb&&!air&&!velocity&&!crouched){
      const index=ladder();
      if(index===null||index<0||(deck!==null&&deck!==index))return;
      const tower=towers[index],descending=deck!==null;
      const z=descending?tower.z+2.5:tower.z+1.35;
      climb={index,descending,start:hero.position.clone(),end:new THREE.Vector3(tower.x,descending?elevation(tower.x,z):towerFloor(tower),z),time:0};
      target=null;
      waypoints=[];
    }
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
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(image),depthTest:false}));
    sprite.scale.set(zone?6.4:1.28,.70,1);
    return sprite;
  }
  function addZones(zones){
    for(const [zoneIndex,zone] of zones.entries()){
      const x0=crossings[zoneIndex%3],z0=zoneIndex<3?-27:27;
      const banner=label(zone.name,true);
      const entrance=z0+(z0<0?13:-13),height=elevation(x0,entrance);
      banner.position.set(x0,height+3.4,entrance);
      scene.add(banner);
      const stone=material(colors[zoneIndex]);
      const gold=material('#f4d594');
      for(const side of [-1,1]){
        const x=x0+side*3.8,y=elevation(x,entrance);
        box(.8,2.9,.85,stone,x,y+1.45,entrance);
        box(1.1,.28,1.08,gold,x,y+2.95,entrance);
        tree(x0+side*17,z0,.88,zoneIndex===5?'#925b41':'#456f52');
      }
      for(const [j,index] of zone.rooms.entries()){
        const [dx,dz]=landmarks[zoneIndex][j];
        const x=x0+dx,z=z0+dz;
        const y=elevation(x,z);
        const base=box(2.45,.32,2.3,stone,x,y+.13,z);
        const height=2.8+(j%3)*.5+(zoneIndex===4?1.0:0);
        const hallZ=z-2.8;
        const floor=elevation(x,hallZ);
        box(3.45,height,2.6,stone,x,floor+height/2,hallZ);
        const roof=new THREE.Mesh(new THREE.ConeGeometry(2.65,1.55,4),roofMats[zoneIndex]);
        roof.rotation.y=Math.PI/4;
        roof.position.set(x,floor+height+.62,hallZ);
        scene.add(roof);
        for(const side of [-1,1]){
          box(.38,.52,.06,glow,x+side*.95,floor+height*.64,hallZ+1.32);
          box(.29,2.2,.33,ivory,x+side*1.12,y+1.1,z);
          box(.44,.17,.47,stone,x+side*1.12,y+2.23,z);
        }
        box(2.62,.25,.40,ivory,x,y+2.34,z);
        if(zoneIndex===2||zoneIndex===4){
          const towerX=x+2.7;
          const towerY=elevation(towerX,hallZ);
          box(1.34,height+2.3,1.34,stone,towerX,towerY+(height+2.3)/2,hallZ);
          const beacon=new THREE.Mesh(lampGeo,glow);
          beacon.position.set(towerX,towerY+height+2.68,hallZ);
          scene.add(beacon);
        }
        if(zoneIndex===0||zoneIndex===3){
          const awning=box(1.5,.1,1.26,roofMats[zoneIndex],x,floor+1.82,hallZ+1.88);
          awning.rotation.x=.20;
        }
        if(zoneIndex===5){
          for(const offset of [-.7,.7])box(.46,2.1,.48,timber,x+offset,floor+height+.5,hallZ);
        }
        const ring=new THREE.Mesh(new THREE.TorusGeometry(.85,.12,10,28),new THREE.MeshStandardMaterial({emissiveIntensity:.5}));
        ring.position.set(x,y+1.12,z);
        scene.add(ring);
        const sign=label(String(index+1).padStart(2,'0'));
        sign.position.set(x,y+2.35,z);
        scene.add(sign);
        portals.set(index,{index,x,z,y,ring});
        for(const mesh of [base,ring,sign]){
          mesh.userData.room=index;
          pickables.push(mesh);
        }
      }
    }
  }
  const ray=new THREE.Raycaster();
  canvas.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'||event.button!==0)return;
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
      if(groundHit&&walkable(groundHit.point.x,groundHit.point.z))routeTo(groundHit.point.x,groundHit.point.z);
      return;
    }
    const room=hit.object.userData.room;
    if(near===room)onEnter(room);
    else travel(room);
  });
  canvas.addEventListener('keydown',event=>{
    const key=event.key.length===1?event.key.toLowerCase():event.key;
    if([' ','c','f','q','e','+','=','-'].includes(key)){
      event.preventDefault();
      if(event.repeat)return;
      if(key==='q'||key==='e')adjustCamera(key==='q'?.3:-.3);
      else if(['+','=','-'].includes(key))adjustCamera(0,key==='-'?1.18:1/1.18);
      else action({' ':'jump',c:'crouch',f:'climb'}[key]);
      return;
    }
    if(controls[key]){
      event.preventDefault();
      target=null;
      waypoints=[];
      keys.add(key);
    }else if(key==='Enter'&&near!==undefined){
      event.preventDefault();
      onEnter(near);
    }
  });
  canvas.addEventListener('keyup',event=>keys.delete(event.key.length===1?event.key.toLowerCase():event.key));
  canvas.addEventListener('blur',()=>keys.clear());
  function routeTo(x,z){
    waypoints=[];
    const differentBank=Math.sign(z)!==Math.sign(position.z)&&Math.abs(z)>3.3&&Math.abs(position.z)>3.3;
    if(Math.abs(position.z)<=3.3){
      const crossing=crossings.reduce((best,current)=>Math.abs(position.x-current)<Math.abs(position.x-best)?current:best);
      waypoints.push(new THREE.Vector3(crossing,0,Math.sign(z)*5));
    }else if(differentBank){
      const crossing=crossings.reduce((best,current)=>
        Math.abs(current-position.x)+Math.abs(current-x)<Math.abs(best-position.x)+Math.abs(best-x)?current:best);
      waypoints.push(new THREE.Vector3(crossing,0,Math.sign(position.z)*5),new THREE.Vector3(crossing,0,Math.sign(z)*5));
    }
    if(Math.abs(z)<3.3&&Math.abs(position.z)>3.3)waypoints.push(new THREE.Vector3(x,0,Math.sign(position.z)*5));
    waypoints.push(new THREE.Vector3(x,0,z));
    target=waypoints.shift();
  }
  function travel(index){
    const portal=portals.get(index);
    if(portal)routeTo(portal.x,portal.z+1.35);
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
    position.set(portal?.x??0,0,(portal?.z??0)+1.15);
    target=null;
    waypoints=[];
    gait=0;pace=0;air=0;velocity=0;deck=null;climb=null;crouched=false;
    baseHeight=hero.scale.y;
    keys.clear();
    near=undefined;
    yaw=0;pitch=.62;zoom=1;
    last=0;
    for(const item of portals.values()){
      const color=marks.has(item.index)?'#ffcb58':available(item.index)?'#79ecc1':'#748693';
      item.ring.material.color.set(color);
      item.ring.material.emissive.set(color);
    }
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
    trail.set(0,0,0);
    for(const key of keys){
      const [x,z]=controls[key];
      trail.x+=x*Math.cos(yaw)+z*Math.sin(yaw);
      trail.z+=z*Math.cos(yaw)-x*Math.sin(yaw);
    }
    if(target)trail.subVectors(target,position);
    if(climb)trail.set(0,0,0);
    if(air>0||velocity!==0){
      velocity-=delta*18;
      air+=velocity*delta;
      if(air<=0){air=0;velocity=0;}
    }
    const distance=trail.length();
    if(distance>.025){
      const heading=Math.atan2(trail.x,trail.z);
      hero.rotation.y+=Math.atan2(Math.sin(heading-hero.rotation.y),Math.cos(heading-hero.rotation.y))*Math.min(1,delta*14);
      const speed=crouched?3.5:target?9:8;
      const stride=target?Math.min(distance,delta*speed):delta*speed;
      trail.normalize();
      const nextX=position.x+trail.x*stride,nextZ=position.z+trail.z*stride;
      const onDeck=deck===null||(Math.abs(nextX-towers[deck].x)<1.72&&Math.abs(nextZ-towers[deck].z)<1.72);
      if(walkable(nextX,nextZ)&&onDeck&&(crouched||!lowCeiling(nextX,nextZ)))position.set(nextX,0,nextZ);
      else if(target&&!crouched&&lowCeiling(nextX,nextZ)&&!lowCeiling(target.x,target.z)){
        const side=passage.x+(position.x<passage.x?-2.8:2.8);
        const exit=passage.z+(target.z<passage.z?-3:3);
        waypoints.unshift(new THREE.Vector3(side,0,exit),target);
        target=new THREE.Vector3(side,0,position.z);
      }else {target=null;waypoints=[];}
    }else if(target)target=waypoints.shift()??null;
    hero.position.copy(position);
    hero.position.y=(deck===null?elevation(position.x,position.z):towerFloor(towers[deck]))+air;
    hero.scale.y=THREE.MathUtils.lerp(hero.scale.y,baseHeight*(crouched?.56:1),Math.min(1,delta*15));
    if(climb){
      const tower=towers[climb.index];
      climb.time=Math.min(1,climb.time+delta*.55);
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
    onTraversal?.(climb?'Climbing':ladder()>=0?'Ladder nearby · F':lowCeiling(position.x,position.z)?'Low passage · C':crouched?'Crouching':air>0?'Jumping':'');
    if(mapMode){
      const extent=Math.max(82,99/aspect)*zoom;
      survey.left=-extent*aspect;survey.right=extent*aspect;
      survey.top=extent;survey.bottom=-extent;
      survey.position.set(0,155,.01);
      survey.up.set(Math.sin(yaw),0,-Math.cos(yaw));
      survey.lookAt(0,0,0);
    }else{
      look.lerp(hero.position,1-Math.exp(-delta*8));
      const distance=(aspect<1?15:13)*zoom,horizontal=Math.cos(pitch)*distance;
      follow.position.set(look.x+Math.sin(yaw)*horizontal,look.y+Math.sin(pitch)*distance+.8,look.z+Math.cos(yaw)*horizontal);
      follow.lookAt(look.x,look.y+.9,look.z);
      follow.aspect=aspect;
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    pace+=(Number(distance>.025)-pace)*Math.min(1,delta*12);
    gait+=delta*pace*14;
    const swing=climb?Math.sin(climb.time*45)*.62:Math.sin(gait)*pace*.54;
    hero.position.y+=Math.abs(Math.sin(gait))*.09*pace;
    hero.userData.cape.rotation.x=.13+Math.cos(gait)*.13*pace;
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
    hero.userData.legs.forEach((part,i)=>{part.rotation.x=air>0?(i?-.7:-.4):i?swing:-swing});
    hero.userData.arms.forEach((part,i)=>{part.rotation.x=climb?-1.6+(i?swing:-swing):air>0?-.72:i?-swing*.5:swing*.5});
    let closest,best=2.15;
    for(const item of portals.values()){
      const distance=Math.hypot(position.x-item.x,position.z-item.z);
      if(distance<best){best=distance;closest=item.index;}
      item.ring.position.y=item.y+1.12+.12*Math.sin(now*.002+item.index);
      item.ring.rotation.z=now*.00065;
      item.ring.material.emissiveIntensity=distance<2.15?.92:.45+.17*Math.sin(now*.003+item.index);
    }
    if(closest!==near){
      near=closest;
      onNear(near);
    }
    renderer.render(scene,camera);
  }
  function setMapMode(enabled){
    mapMode=enabled;
    camera=enabled?survey:follow;
  }
  return {addZones,visit,travel,frame,setMapMode,adjustCamera,action,discoveries:()=>[discovered.size,secrets.length]};
}
