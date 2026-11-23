import * as THREE from 'three';

const bounds={x:40,z:32};
const shore=(x,z)=>Math.hypot(x/bounds.x,z/bounds.z);
const elevation=(x,z)=>.8+1.05*Math.sin(x*.125)*Math.sin(z*.18)+.55*Math.cos(z*.19);
const colors=['#528665','#b08656','#528baa','#618850','#71628f','#9b5d47'];
const controls={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};

export function createOverworld({canvas,stage,makeHero,onNear,onEnter}){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#b6dfe8');
  scene.fog=new THREE.FogExp2('#b6dfe8',.008);
  const follow=new THREE.PerspectiveCamera(49,1,.1,260);
  const survey=new THREE.OrthographicCamera(-1,1,1,-1,.1,240);
  let mapMode=false;
  let camera=follow;
  const look=new THREE.Vector3();
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
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
  const ground=new THREE.PlaneGeometry(86,70,86,70);
  ground.rotateX(-Math.PI/2);
  const vertices=ground.attributes.position;
  const shades=[];
  const green=new THREE.Color('#638c51'),sand=new THREE.Color('#d6bf8c'),rock=new THREE.Color('#a19a71');
  const color=new THREE.Color();
  for(let i=0;i<vertices.count;i++){
    const x=vertices.getX(i),z=vertices.getZ(i),edge=shore(x,z);
    vertices.setY(i,elevation(x,z)-Math.max(0,edge-.89)*22);
    const path=Math.abs(z-2*Math.sin(x*.13))<1.2||[-21,0,21].some(center=>Math.abs(x-center-1.1*Math.sin(z*.22))<1);
    color.copy(path?rock:green).lerp(sand,THREE.MathUtils.smoothstep(edge,.76,.96));
    color.multiplyScalar(.94+.10*Math.sin(x*1.16+z*.73));
    shades.push(color.r,color.g,color.b);
  }
  ground.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
  ground.computeVertexNormals();
  const island=new THREE.Mesh(ground,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  scene.add(island);
  const trunk=material('#645044');
  function tree(x,z,scale,tint){
    const y=elevation(x,z);
    box(.31*scale,1.65*scale,.31*scale,trunk,x,y+.8*scale,z);
    const crown=new THREE.Mesh(new THREE.ConeGeometry(1.1*scale,2.6*scale,6),material(tint));
    crown.position.set(x,y+2.15*scale,z);
    scene.add(crown);
  }
  for(let i=0;i<52;i++){
    const angle=i*2.39996,r=.35+.51*((i*17)%53)/53;
    const x=Math.cos(angle)*bounds.x*r,z=Math.sin(angle)*bounds.z*r;
    if(Math.abs(z)<3||[-21,0,21].some(center=>Math.abs(x-center)<8&&Math.abs(Math.abs(z)-13)<8))continue;
    tree(x,z,.62+(i%5)*.12,i%2?'#38694a':'#497953');
  }
  const pickables=[],portals=new Map(),keys=new Set();
  const position=new THREE.Vector3();
  const trail=new THREE.Vector3();
  let hero,target,near,last=0;
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
      const x0=(zoneIndex%3-1)*21,z0=zoneIndex<3?-13:13;
      const banner=label(zone.name,true);
      const entrance=z0+(z0<0?7:-7),height=elevation(x0,entrance);
      banner.position.set(x0,height+3.4,entrance);
      scene.add(banner);
      const stone=material(colors[zoneIndex]);
      const gold=material('#f4d594');
      for(const side of [-1,1]){
        const x=x0+side*3.8,y=elevation(x,entrance);
        box(.8,2.9,.85,stone,x,y+1.45,entrance);
        box(1.1,.28,1.08,gold,x,y+2.95,entrance);
        tree(x0+side*7,z0,.88,zoneIndex===5?'#925b41':'#456f52');
      }
      for(const [j,index] of zone.rooms.entries()){
        const x=x0+(j%3-1)*4.2,z=z0+(Math.floor(j/3)-1.5)*4;
        const y=elevation(x,z);
        const base=box(2,.35,1.65,material('#344553'),x,y+.12,z);
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
      if(groundHit&&shore(groundHit.point.x,groundHit.point.z)<.89)target=groundHit.point.clone().setY(0);
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
      keys.add(key);
    }else if(key==='Enter'&&near!==undefined){
      event.preventDefault();
      onEnter(near);
    }
  });
  canvas.addEventListener('keyup',event=>keys.delete(event.key.length===1?event.key.toLowerCase():event.key));
  canvas.addEventListener('blur',()=>keys.clear());
  function travel(index){
    const portal=portals.get(index);
    if(portal)target=new THREE.Vector3(portal.x,0,portal.z+1.1);
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
      hero.rotation.y=Math.atan2(trail.x,trail.z);
      const stride=(target?Math.min(distance,delta*9):delta*8);
      trail.normalize();
      const nextX=position.x+trail.x*stride,nextZ=position.z+trail.z*stride;
      if(shore(nextX,nextZ)<.9)position.set(nextX,0,nextZ);
      else target=null;
    }else if(target)target=null;
    hero.position.copy(position);
    hero.position.y=elevation(position.x,position.z);
    if(mapMode){
      const extent=Math.max(34,44/aspect);
      survey.left=-extent*aspect;survey.right=extent*aspect;
      survey.top=extent;survey.bottom=-extent;
      survey.position.set(0,105,.01);
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
    const swing=distance>.025?Math.sin(now*.014)*.54:0;
    hero.userData.legs.forEach((part,i)=>{part.rotation.x=i?swing:-swing});
    hero.userData.arms.forEach((part,i)=>{part.rotation.x=i?-swing*.5:swing*.5});
    let closest,best=2.15;
    for(const item of portals.values()){
      const distance=Math.hypot(position.x-item.x,position.z-item.z);
      if(distance<best){best=distance;closest=item.index;}
      item.ring.position.y=item.y+1.12+.075*Math.sin(now*.002+item.index);
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
  return {addZones,visit,travel,frame,setMapMode};
}
