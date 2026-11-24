import * as THREE from 'three';
// Batch only explicitly registered, opaque, static objects. Preserve raycast
// targets and animated meshes as independent objects. Spatial tiles retain
// frustum culling instead of creating one island-wide bounding sphere.
export function batchStaticMeshes(scene,meshes,{exclude=new Set(),cellSize=24,minCount=3}={}){
 const groups=new Map(),unit=new THREE.BoxGeometry(1,1,1),matrix=new THREE.Matrix4(),scale=new THREE.Matrix4();
 for(const mesh of meshes){
  if(exclude.has(mesh)||mesh.parent!==scene||!mesh.visible||mesh.material.transparent||mesh.material.map||mesh.userData.room!==undefined||mesh.userData.waystation)continue;
  const p=mesh.geometry.parameters;
  if(!p||!p.width||!p.height||!p.depth)continue;
  const key=mesh.material.uuid+':'+Math.floor(mesh.position.x/cellSize)+':'+Math.floor(mesh.position.z/cellSize);
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);
 }
 let originals=0,batches=0;
 for(const items of groups.values()){
  if(items.length<minCount)continue;
  const batch=new THREE.InstancedMesh(unit,items[0].material,items.length);
  items.forEach((mesh,i)=>{
   mesh.updateMatrix();const p=mesh.geometry.parameters;
   matrix.copy(mesh.matrix).multiply(scale.makeScale(p.width,p.height,p.depth));
   batch.setMatrixAt(i,matrix);scene.remove(mesh);
  });
  batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();scene.add(batch);originals+=items.length;batches++;
 }
 if(!batches)unit.dispose();
 return {originals,batches,saved:originals-batches};
}
