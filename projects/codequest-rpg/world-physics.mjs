// Static broadphase shared by movement, navigation and support sampling.
// Bounds are world-space; render batches never own collision state.
export const BODY={radius:.24,height:1.58,crouch:.82,step:.34};
const EPS=.015;
const inside=(p,x,z,r=0)=>x>p.minX-r+EPS&&x<p.maxX+r-EPS&&z>p.minZ-r+EPS&&z<p.maxZ+r-EPS;
const penetration=(p,x,z,r)=>Math.min(x-p.minX+r,p.maxX+r-x,z-p.minZ+r,p.maxZ+r-z);
export function createPhysics(cell=5){
 const buckets=new Map(),all=[];
 const key=(x,z)=>x+','+z;
 function add(p){
  if(![p.minX,p.maxX,p.minY,p.maxY,p.minZ,p.maxZ].every(Number.isFinite)||p.maxX<=p.minX||p.maxY<=p.minY||p.maxZ<=p.minZ)return null;
  const item={id:'phys-'+all.length,...p};all.push(item);
  for(let x=Math.floor(item.minX/cell);x<=Math.floor(item.maxX/cell);x++)for(let z=Math.floor(item.minZ/cell);z<=Math.floor(item.maxZ/cell);z++){
   const k=key(x,z);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(item);
  }return item;
 }
 function near(x,z,r=.5){
  const out=new Set();
  for(let i=Math.floor((x-r)/cell);i<=Math.floor((x+r)/cell);i++)for(let j=Math.floor((z-r)/cell);j<=Math.floor((z+r)/cell);j++)for(const p of buckets.get(key(i,j))??[])if(p.enabled?.()!==false)out.add(p);
  return [...out];
 }
 function overlap(p,x,z,y,h,r){return inside(p,x,z,r)&&y+h>p.minY+EPS&&y<p.maxY-EPS;}
 function clear(x,z,y,{radius=BODY.radius,height=BODY.height,step=0}={}){
  return !near(x,z,radius).some(p=>p.maxY>y+step+EPS&&overlap(p,x,z,y,height,radius));
 }
 function move(a,b,feet,{radius=BODY.radius,height=BODY.height,step=0,ground=null}={}){
  const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.16));let px=a.x,pz=a.z;
  for(let i=1;i<=n;i++){
   const t=i/n,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=ground?Math.max(feet,ground(x,z)):feet;
   for(const p of near(x,z,radius)){
    if(p.maxY<=y+step+EPS||!overlap(p,x,z,y,height,radius))continue;
    // Permit exit from a legacy overlapping spawn, but never deeper penetration.
    if(overlap(p,px,pz,y,height,radius)&&penetration(p,x,z,radius)<penetration(p,px,pz,radius)-EPS*.1)continue;
    return false;
   }
   px=x;pz=z;
  }return true;
 }
 function floor(x,z,base,ceiling=base+BODY.step){
  let y=base;for(const p of near(x,z,.1))if(p.walkable&&inside(p,x,z)&&p.maxY<=ceiling+EPS&&p.maxY>=y&&p.maxY-base<=BODY.step+EPS)y=p.maxY;return y;
 }
 function surfaces(x,z,r=2){
  return near(x,z,r).filter(p=>p.walkable).map(p=>({id:p.id,x:(p.minX+p.maxX)/2,z:(p.minZ+p.maxZ)/2,hx:(p.maxX-p.minX)/2,hz:(p.maxZ-p.minZ)/2,y:p.maxY,thickness:p.maxY-p.minY}));
 }
 function ceiling(x,z,feet,head,nextHead,radius=BODY.radius){
  if(nextHead<=head)return null;
  let hit=null;for(const p of near(x,z,radius))if(inside(p,x,z,radius)&&p.minY>=head-EPS&&p.minY<=nextHead+EPS&&p.maxY>feet&&(!hit||p.minY<hit.minY))hit=p;return hit;
 }
 return {add,near,clear,move,floor,surfaces,ceiling,count:()=>all.length,inventory:()=>all.slice()};
}
export function boxBounds(x,y,z,w,h,d,options={}){
 return {minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2,...options};
}
export function nearestClear(x,z,canStand,max=2.4){
 if(canStand(x,z))return {x,z};
 for(let r=.35;r<=max+.001;r+=.35)for(let i=0;i<16;i++){
  const a=i*Math.PI/8,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(canStand(px,pz))return {x:px,z:pz};
 }return null;
}
