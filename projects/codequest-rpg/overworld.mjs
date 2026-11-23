import * as THREE from 'three';

const bounds={x:14,z:13};
const colors=['#528665','#b08656','#528baa','#618850','#71628f','#9b5d47'];
const controls={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};

export function createOverworld({canvas,stage,makeHero,onNear,onEnter}){
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#122837');
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,100);
  camera.position.set(0,35,30);
  camera.lookAt(0,0,0);
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
  box(29,.5,27,material('#31554d'),0,-.33,0);
  box(28,.05,1.8,material('#b29a72'),0,-.035,0);
  box(1.5,.05,26,material('#b29a72'),0,-.032,0);
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
      const x0=(zoneIndex%3-1)*9.5,z0=zoneIndex<3?-6.6:6.6;
      box(8.7,.13,11.5,material(colors[zoneIndex]),x0,-.065,z0);
      const banner=label(zone.name,true);
      banner.position.set(x0,1.15,z0+4.95);
      scene.add(banner);
      const rock=material(colors[zoneIndex]);
      for(const side of [-1,1]){
        const landmark=new THREE.Mesh(new THREE.DodecahedronGeometry(.64),rock);
        landmark.position.set(x0+side*3.65,.60,z0+3.55);
        landmark.scale.y=1.6;
        scene.add(landmark);
      }
      for(const x of [x0-4,x0+4]){
        for(const z of [z0-5,z0+5]){
          box(.28,.9,.28,material('#354653'),x,.45,z);
          const light=new THREE.Mesh(new THREE.OctahedronGeometry(.27),new THREE.MeshBasicMaterial({color:'#ffdb8f'}));
          light.position.set(x,1.04,z);
          scene.add(light);
        }
      }
      for(const [j,index] of zone.rooms.entries()){
        const x=x0+(j%3-1)*2.35,z=z0+(Math.floor(j/3)-1.5)*2.25;
        const base=box(1.38,.22,1.12,material('#243b48'),x,.11,z);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.085,10,28),new THREE.MeshStandardMaterial({emissiveIntensity:.5}));
        ring.position.set(x,.79,z);
        scene.add(ring);
        const sign=label(String(index+1).padStart(2,'0'));
        sign.position.set(x,1.67,z);
        scene.add(sign);
        portals.set(index,{index,x,z,ring});
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
    if(!hit)return;
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
    if(portal)target=new THREE.Vector3(portal.x,0,portal.z+.8);
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
    position.set(portal?.x??0,0,(portal?.z??0)+.95);
    target=null;
    keys.clear();
    near=undefined;
    last=0;
    for(const item of portals.values()){
      const color=marks.has(item.index)?'#ffcb58':available(item.index)?'#79ecc1':'#748693';
      item.ring.material.color.set(color);
      item.ring.material.emissive.set(color);
    }
    frame(performance.now());
  }
  function frame(now){
    const width=stage.clientWidth,height=stage.clientHeight;
    if(!hero||!width||!height)return;
    const aspect=width/height;
    const extent=Math.max(12.5,15/aspect);
    camera.left=-extent*aspect;
    camera.right=extent*aspect;
    camera.top=extent;
    camera.bottom=-extent;
    camera.updateProjectionMatrix();
    if(canvas.clientWidth!==frame.width||canvas.clientHeight!==frame.height){
      renderer.setSize(width,height,false);
      frame.width=canvas.clientWidth;
      frame.height=canvas.clientHeight;
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
      position.addScaledVector(trail.normalize(),stride);
      position.x=THREE.MathUtils.clamp(position.x,-bounds.x,bounds.x);
      position.z=THREE.MathUtils.clamp(position.z,-bounds.z,bounds.z);
    }else if(target)target=null;
    hero.position.copy(position);
    const swing=distance>.025?Math.sin(now*.014)*.54:0;
    hero.userData.legs.forEach((part,i)=>{part.rotation.x=i?swing:-swing});
    hero.userData.arms.forEach((part,i)=>{part.rotation.x=i?-swing*.5:swing*.5});
    let closest,best=1.45;
    for(const item of portals.values()){
      const distance=Math.hypot(position.x-item.x,position.z-item.z);
      if(distance<best){best=distance;closest=item.index;}
      item.ring.position.y=.78+.075*Math.sin(now*.002+item.index);
    }
    if(closest!==near){
      near=closest;
      onNear(near);
    }
    renderer.render(scene,camera);
  }
  return {addZones,visit,travel,frame};
}
