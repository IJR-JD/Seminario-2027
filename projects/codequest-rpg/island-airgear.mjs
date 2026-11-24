// Original aerial traversal mechanics. Pure math for deterministic QA.
import {groundSafe,airSafe,shrines,travelGates,circuits,traps,buildingFootprints} from './island-adventure.mjs';
import {allRoomLocations,villageHouses} from './island-villages.mjs';
import {pythonWaystations,shore} from './island-exploration.mjs';
export const gear=[
 {id:'grapple',name:'Tether Workshop',x:-97,z:-59,color:'#71e4e8',key:'T',description:'Discover the tether harness. T attaches/releases. Y transfers to another reachable anchor without losing momentum.'},
 {id:'jetpack',name:'Jetpack Forge',x:88,z:54,color:'#ffb574',key:'J',description:'Discover the twin-thruster pack. J toggles boost, Space climbs, C descends; fuel refills on the ground.'}
];
const originalAnchors=[
 {id:'meadow-arch',x:-98,z:-49,h:12},{id:'meadow-spire',x:-82,z:-49,h:13},
 {id:'meadow-east',x:-65,z:-49,h:12},{id:'west-bank',x:-69,z:-15,h:15},
 {id:'west-crossing',x:-69,z:7,h:17},{id:'west-south',x:-69,z:26,h:13},
 {id:'sky-ridge',x:48,z:-38,h:15},{id:'sky-bank',x:48,z:-12,h:15},
 {id:'sky-crossing',x:48,z:10,h:16},{id:'forge-arch',x:89,z:43,h:13},
 {id:'forge-east',x:104,z:35,h:15}
];
// Linked traversal corridors on both banks, with frequent anchors near every district.
const reserved=[...allRoomLocations(),...villageHouses,...shrines,...travelGates,...gear,...pythonWaystations,...traps,...circuits.flatMap(c=>[...c.steps,c.reward])];
const kinds=['spire','arch','crane','obelisk'];
const rows=[
 {id:'north-ridge',z:-77,xs:[-98,-78,-58,-38,-18,2,22,42,62,82,102]},
 {id:'village-canopy',z:-55,xs:[-116,-96,-76,-56,-36,-16,4,24,44,64,84,104]},
 {id:'north-trail',z:-32,xs:[-120,-100,-80,-60,-40,-20,0,20,40,60,80,100,120]},
 {id:'north-bank',z:-11,xs:[-120,-100,-80,-60,-40,-20,0,20,40,60,80,100,120]},
 {id:'south-bank',z:11,xs:[-120,-100,-80,-60,-40,-20,0,20,40,60,80,100,120]},
 {id:'southern-trail',z:32,xs:[-120,-100,-80,-60,-40,-20,0,20,40,60,80,100,120]},
 {id:'south-villages',z:54,xs:[-104,-84,-64,-44,-24,-4,16,36,56,76,96,116]},
 {id:'south-ridge',z:76,xs:[-98,-78,-58,-38,-18,2,22,42,62,82,102]}
];
const network=originalAnchors.map((p,i)=>({...p,kind:kinds[i%kinds.length],route:'original'}));
const offsets=[[0,0],[0,3],[0,-3],[3,0],[-3,0],[3,3],[-3,3],[3,-3],[-3,-3],[0,6],[0,-6],[6,0],[-6,0]];
for(const [rowIndex,row] of rows.entries())for(const [i,x0] of row.xs.entries()){
 const point=offsets.map(([dx,dz])=>({x:x0+dx,z:row.z+dz})).find(p=>
  shore(p.x,p.z)<.88&&groundSafe(p.x,p.z)&&reserved.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>5.2)&&
  buildingFootprints.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>4.6)&&network.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>9));
 if(point)network.push({...point,id:row.id+'-'+(i+1),h:12+(i+rowIndex)%4,kind:kinds[(i+rowIndex)%4],route:row.id});
}
export const anchors=network;
export const jetCapacity=9,grappleRange=30;
export function anchorLinks(points,maxDistance=24){
 const links=[];
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
  if(Math.hypot(points[i].x-points[j].x,points[i].z-points[j].z)<=maxDistance)links.push([points[i].id,points[j].id]);
 }
 return links;
}

export function selectAnchor(position,points,heading={x:0,z:1},exclude=null){
 let best=null,score=Infinity;
 for(const p of points){
  if(p.id===exclude)continue;
  const dx=p.x-position.x,dy=p.y-position.y,dz=p.z-position.z,d=Math.hypot(dx,dy,dz);
  if(d>grappleRange||d<4||dy<2)continue;
  const horizontal=Math.hypot(dx,dz),alignment=horizontal?((dx*heading.x+dz*heading.z)/horizontal):0;
  const value=d-alignment*9;
  if(value<score){best=p;score=value;}
 }
 return best;
}
export function swingStart(position,anchor,heading,momentum=null){
 const dx=position.x-anchor.x,dy=position.y-anchor.y,dz=position.z-anchor.z;
 return {x:position.x,y:position.y,z:position.z,vx:momentum?.vx??heading.x*9,vy:momentum?.vy??10,vz:momentum?.vz??heading.z*9,length:Math.max(5,Math.hypot(dx,dy,dz)),time:0};
}
export function swingStep(state,anchor,input,dt){
 // Semi-implicit integration plus a unilateral rope constraint. Gravity and
 // tangential steering create a swing rather than a scripted teleport.
 const s={...state},n=Math.max(1,Math.ceil(dt/.012)),h=dt/n;
 for(let i=0;i<n;i++){
  s.vx+=input.x*15*h;s.vy-=14*h;s.vz+=input.z*15*h;
  const speed=Math.hypot(s.vx,s.vy,s.vz);
  if(speed>29){const f=29/speed;s.vx*=f;s.vy*=f;s.vz*=f;}
  s.x+=s.vx*h;s.y+=s.vy*h;s.z+=s.vz*h;
  let dx=s.x-anchor.x,dy=s.y-anchor.y,dz=s.z-anchor.z,d=Math.hypot(dx,dy,dz);
  if(d>s.length){
   dx/=d;dy/=d;dz/=d;
   s.x=anchor.x+dx*s.length;s.y=anchor.y+dy*s.length;s.z=anchor.z+dz*s.length;
   const radial=s.vx*dx+s.vy*dy+s.vz*dz;
   if(radial>0){s.vx-=radial*dx;s.vy-=radial*dy;s.vz-=radial*dz;}
  }
  // Slowly reel in the tether, then let gravity carry momentum.
  s.length=Math.max(5,s.length-h*2.1);
  s.time+=h;
 }
 return s;
}
export function jetStep(fuel,height,vertical,dt){
 const burn=vertical>0?1.45:vertical<0?.65:1;
 return {fuel:Math.max(0,fuel-dt*burn),height:Math.max(2,Math.min(13,height+dt*(vertical*5)))};
}
export const validGearSite=p=>groundSafe(p.x,p.z);
export const validAirPoint=p=>airSafe(p.x,p.z)&&Number.isFinite(p.y);
