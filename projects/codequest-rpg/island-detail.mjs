import * as THREE from 'three';
// Procedural original textures and batched detail geometry, no asset downloads.
export function createIslandDetail(scene,{elevation,groundSafe,blocked,landmarks=[]}){
 let seed=18927;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function texture(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d');
  c.fillStyle=kind==='ground'?'#d0d4c4':kind==='stone'?'#c4c1b5':kind==='wood'?'#c4b19a':'#c5bfc0';c.fillRect(0,0,256,256);
  for(let i=0;i<3200;i++){
   const v=120+Math.floor(rand()*120);c.fillStyle='rgba('+v+','+v+','+v+',.19)';
   c.fillRect(rand()*256,rand()*256,1+rand()*5,1+rand()*4);
  }
  if(kind==='stone'||kind==='roof'){
   const row=kind==='stone'?32:22;
   for(let y=0;y<256;y+=row){
    c.strokeStyle='#77776f88';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();
    for(let x=-(y/row%2)*32;x<256;x+=64){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+row);c.stroke();}
    c.strokeStyle='#f0eee466';c.beginPath();c.moveTo(0,y+3);c.lineTo(256,y+3);c.stroke();
   }
  }
  if(kind==='wood')for(let i=0;i<48;i++){c.strokeStyle='#806c5688';c.lineWidth=1+rand()*2;c.beginPath();c.moveTo(i*6,0);c.bezierCurveTo(i*6+3,85,i*6-3,170,i*6,256);c.stroke();}
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
 }
 const ground=texture('ground');ground.repeat.set(95,78);
 const stone=texture('stone'),wood=texture('wood'),roof=texture('roof');
 const waterCanvas=document.createElement('canvas');waterCanvas.width=waterCanvas.height=128;
 const wc=waterCanvas.getContext('2d');wc.fillStyle='#b6dce3';wc.fillRect(0,0,128,128);
 for(let i=0;i<75;i++){const x=rand()*128,y=rand()*128;wc.strokeStyle=i%3?'#e5f7f599':'#789dae88';wc.lineWidth=.7+rand()*1.4;wc.beginPath();wc.moveTo(x,y);wc.quadraticCurveTo(x+7,y-3,x+15+rand()*16,y);wc.stroke();}
 const water=new THREE.CanvasTexture(waterCanvas);water.wrapS=water.wrapT=THREE.RepeatWrapping;water.repeat.set(76,76);water.colorSpace=THREE.SRGBColorSpace;
 const dummy=new THREE.Object3D();
 const batch=(geometry,mat,items)=>{
  if(!items.length)return null;
  const mesh=new THREE.InstancedMesh(geometry,mat,items.length);
  items.forEach((p,i)=>{
   dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx||0,p.ry||0,p.rz||0);dummy.scale.set(p.sx||1,p.sy||1,p.sz||1);dummy.updateMatrix();
   mesh.setMatrixAt(i,dummy.matrix);if(p.color)mesh.setColorAt(i,new THREE.Color(p.color));
  });
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);return mesh;
 };
 const grass=[],flowers=[],rocks=[],pebbles=[],tufts=[];
 for(let i=0;i<4700;i++){
  const x=(rand()-.5)*285,z=(rand()-.5)*226;
  if(!groundSafe(x,z)||Math.abs(z)<9||landmarks.some(p=>Math.hypot(x-p.x,z-p.z)<4.2))continue;
  const y=elevation(x,z),s=.45+rand()*.65;
  if(i%11===0){rocks.push({x,y:y+.13,z,sx:s*.65,sy:s*.4,sz:s,ry:rand()*6.28,color:['#8c9180','#a7a68e','#767e78'][i%3]});continue;}
  if(i%9===0){flowers.push({x,y:y+.20,z,sx:.10,sy:.10,sz:.10,color:['#f6d583','#e7c2f1','#f2a787','#f4f2db'][i%4]});}
  for(let k=0;k<3;k++)grass.push({x:x+(rand()-.5)*.25,y:y+.16*s,z:z+(rand()-.5)*.25,sx:.09*s,sy:.34*s,sz:.07*s,ry:rand()*6.28,rz:(rand()-.5)*.65,color:['#527447','#739650','#9aac62'][i%3]});
  if(i%7===0)tufts.push({x,y:y+.19,z,sx:.35,sy:.25,sz:.35,color:'#698b50'});
 }
 const basic=new THREE.MeshStandardMaterial({roughness:1,color:'#ffffff'});
 batch(new THREE.BoxGeometry(1,1,1),basic,grass);
 batch(new THREE.IcosahedronGeometry(1,0),basic,flowers);
 batch(new THREE.DodecahedronGeometry(1,0),basic,rocks);
 batch(new THREE.IcosahedronGeometry(1,0),basic,tufts);
 // Cobblestone shoulders and worn central footpath, not separate collision objects.
 for(const center of [-76,0,76])for(let z=-95;z<=95;z+=1.8)for(const dx of [-1.2,1.2]){
  const x=center+dx+.55*Math.sin(z*.22);
  if(!groundSafe(x,z)||Math.abs(z)<6)continue;
  pebbles.push({x,y:elevation(x,z)+.035,z,sx:.55+rand()*.35,sy:.10,sz:.30+rand()*.35,ry:rand()*.7,color:iColor(rand())});
 }
 function iColor(v){return v<.33?'#b5ab92':v<.66?'#918f81':'#bcb6a1';}
 batch(new THREE.DodecahedronGeometry(1,0),basic,pebbles);
 const clouds=[];
 const cloudMat=new THREE.MeshBasicMaterial({color:'#f4fbff',transparent:true,opacity:.72,depthWrite:false});const cloudGeo=new THREE.SphereGeometry(1,9,6);
 for(let i=0;i<9;i++){
  const g=new THREE.Group();const geo=cloudGeo;
  for(let j=0;j<5;j++){const m=new THREE.Mesh(geo,cloudMat);m.position.set(j*4-8,Math.sin(j)*1.1,Math.cos(j)*2);m.scale.set(5+j%2,2.2,3.8);g.add(m);}
  g.position.set(-145+i*35,35+i%3*8,-80+(i*41)%170);scene.add(g);clouds.push(g);
 }
 const birdGeo=new THREE.BufferGeometry();
 birdGeo.setAttribute('position',new THREE.Float32BufferAttribute([-1,0,0,0,0,.35,1,0,0,0,0,-.25,-1,0,0,1,0,0],3));
 const birdMat=new THREE.MeshBasicMaterial({color:'#405c6d',side:THREE.DoubleSide});
 const birds=Array.from({length:8},(_,i)=>{
  const mesh=new THREE.Mesh(birdGeo,birdMat);scene.add(mesh);return mesh;
 });
 const fireflies=Array.from({length:24},(_,i)=>{const x=-87+rand()*40,z=30+rand()*25;return {x,z,y:elevation(x,z),phase:rand()*6.28};});
 const fireGeo=new THREE.BufferGeometry();fireGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(fireflies.length*3),3));
 const fire=new THREE.Points(fireGeo,new THREE.PointsMaterial({color:'#ffdf91',size:.18,transparent:true,opacity:.8}));scene.add(fire);
 function update(time,delta,mapMode){
  water.offset.set(time*.009,time*.004);
  clouds.forEach((g,i)=>{g.visible=!mapMode;g.position.x+=delta*(.6+i%3*.17);if(g.position.x>185)g.position.x=-185;});
  birds.forEach((m,i)=>{const t=time*.27+i*.78;m.visible=!mapMode;m.position.set(55*Math.cos(t),16+i%3*3+Math.sin(t*2),45*Math.sin(t));m.rotation.y=-t;m.rotation.z=Math.sin(time*9+i)*.24;});
  fire.visible=!mapMode;if(mapMode)return;
  const a=fireGeo.attributes.position;
  fireflies.forEach((p,i)=>{a.setXYZ(i,p.x+Math.sin(time*.8+p.phase)*1.8,p.y+1+Math.sin(time*2+p.phase)*.35,p.z+Math.cos(time*.7+p.phase)*1.4);});a.needsUpdate=true;
  fire.visible=!mapMode;
 }
 return {ground,stone,wood,roof,water,update};
}
