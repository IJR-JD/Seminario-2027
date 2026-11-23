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
const secrets=[
  {id:'tide',x:-65,z:-7,name:'The Tide Almanac',note:'A mariner marked the route to the old observatory in the margin.'},
  {id:'lantern',x:20,z:41,name:'The Last Lantern',note:'A lantern still burns for the first explorer who crossed the island.'},
  {id:'bell',x:-14,z:-46,name:'The Buried Bell',note:'Its inscription reads: Every journey begins with a single instruction.'},
  {id:'glass',x:63,z:11,name:'Glass Compass',note:'The needle points toward the furnaces, even when cold.'},
];
const shore=(x,z)=>Math.hypot(x/bounds.x,z/bounds.z);
const terrain=(x,z)=>.85+1.05*Math.sin(x*.09)*Math.sin(z*.15)+.55*Math.cos(z*.17);
const elevation=(x,z)=>river(z)&&bridge(x)?1.15:terrain(x,z);
const colors=['#528665','#b08656','#528baa','#618850','#71628f','#9b5d47'];
const controls={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};

export function createOverworld({canvas,stage,makeHero,onNear,onEnter,onDiscovery}){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#b6dfe8');
  scene.fog=new THREE.FogExp2('#b6dfe8',.006);
  const follow=new THREE.PerspectiveCamera(49,1,.1,260);
  const survey=new THREE.OrthographicCamera(-1,1,1,-1,.1,240);
  let mapMode=false;
  let camera=follow;
  const look=new THREE.Vector3();
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
  const color=new THREE.Color();
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i),z=vertices.getZ(i),edge=shore(x,z);
    vertices.setY(i,terrain(x,z)-Math.max(0,edge-.89)*25-4*THREE.MathUtils.smoothstep(4.5-Math.abs(z),0,1.6));
    const path=Math.abs(Math.abs(z)-7)<1.2||crossings.some(center=>Math.abs(x-center-1.1*Math.sin(z*.22))<1.25);
    color.copy(path?rock:green).lerp(sand,THREE.MathUtils.smoothstep(edge,.76,.96));
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
  const discovered=new Set();
  try{
    for(const id of JSON.parse(localStorage.getItem('cq-island-discoveries')||'[]')){
      if(secrets.some(secret=>secret.id===id))discovered.add(id);
    }
  }catch{}
  const relics=secrets.map(secret=>{
    const y=elevation(secret.x,secret.z);
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
  canvas.addEventListener('click',event=>{
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
    gait=0;pace=0;
    keys.clear();
    near=undefined;
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
      trail.x+=x;
      trail.z+=z;
    }
    if(target)trail.subVectors(target,position);
    const distance=trail.length();
    if(distance>.025){
      const heading=Math.atan2(trail.x,trail.z);
      hero.rotation.y+=Math.atan2(Math.sin(heading-hero.rotation.y),Math.cos(heading-hero.rotation.y))*Math.min(1,delta*14);
      const stride=(target?Math.min(distance,delta*9):delta*8);
      trail.normalize();
      const nextX=position.x+trail.x*stride,nextZ=position.z+trail.z*stride;
      if(walkable(nextX,nextZ))position.set(nextX,0,nextZ);
      else {target=null;waypoints=[];}
    }else if(target)target=waypoints.shift()??null;
    hero.position.copy(position);
    hero.position.y=elevation(position.x,position.z);
    if(mapMode){
      const extent=Math.max(82,99/aspect);
      survey.left=-extent*aspect;survey.right=extent*aspect;
      survey.top=extent;survey.bottom=-extent;
      survey.position.set(0,155,.01);
      survey.lookAt(0,0,0);
    }else{
      look.lerp(hero.position,1-Math.exp(-delta*8));
      const distance=aspect<1?14:11;
      follow.position.set(look.x,look.y+distance*.72,look.z+distance);
      follow.lookAt(look.x,look.y+.8,look.z-2);
      follow.aspect=aspect;
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    pace+=(Number(distance>.025)-pace)*Math.min(1,delta*12);
    gait+=delta*pace*14;
    const swing=Math.sin(gait)*pace*.54;
    hero.position.y+=Math.abs(Math.sin(gait))*.09*pace;
    hero.userData.cape.rotation.x=.13+Math.cos(gait)*.13*pace;
    for(const [i,ripple] of ripples.entries())ripple.scale.x=.75+.35*Math.sin(now*.0018+i);
    for(const relic of relics){
      if(!relic.gem.visible)continue;
      relic.gem.rotation.y=now*.0016;
      relic.gem.position.y=relic.y+.95+.16*Math.sin(now*.003);
      if(Math.hypot(position.x-relic.x,position.z-relic.z)<1.6){
        relic.gem.visible=false;
        discovered.add(relic.id);
        try{localStorage.setItem('cq-island-discoveries',JSON.stringify([...discovered]));}catch{}
        onDiscovery?.(relic,discovered.size,secrets.length);
      }
    }
    hero.userData.legs.forEach((part,i)=>{part.rotation.x=i?swing:-swing});
    hero.userData.arms.forEach((part,i)=>{part.rotation.x=i?-swing*.5:swing*.5});
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
  return {addZones,visit,travel,frame,setMapMode,discoveries:()=>[discovered.size,secrets.length]};
}
