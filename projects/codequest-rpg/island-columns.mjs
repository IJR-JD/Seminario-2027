// Collision geometry is registered from the same dimensions as rendered columns.
// A spatial hash and continuous segment intersection avoid per-frame mesh scans.
export function isColumn(w,h,d){return h>=.30&&w>=.10&&d>=.10&&Math.max(w,d)<=1.5&&h>=1.3*Math.max(w,d);}
export function createColumnPhysics(cell=6){
 const buckets=new Map(),columns=[];
 function add(x,y,z,w,h,d,enabled=()=>true){
  const c={id:'column-'+columns.length,x,z,hx:w/2,hz:d/2,minY:y-h/2,y:y+h/2,enabled};
  columns.push(c);
  for(let i=Math.floor((x-c.hx)/cell);i<=Math.floor((x+c.hx)/cell);i++)for(let j=Math.floor((z-c.hz)/cell);j<=Math.floor((z+c.hz)/cell);j++){
   const k=i+','+j;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(c);
  }return c;
 }
 function candidates(a,b,r){
  const out=new Set();
  for(let i=Math.floor((Math.min(a.x,b.x)-r)/cell);i<=Math.floor((Math.max(a.x,b.x)+r)/cell);i++)for(let j=Math.floor((Math.min(a.z,b.z)-r)/cell);j<=Math.floor((Math.max(a.z,b.z)+r)/cell);j++)for(const c of buckets.get(i+','+j)??[])out.add(c);
  return out;
 }
 function hit(a,b,{radius=.20,height=1.55,ground=null}={}){
  const dx=b.x-a.x,dz=b.z-a.z;
  for(const c of candidates(a,b,radius)){
   if(!c.enabled())continue;
   let lo=0,hi=1,ok=true;
   for(const [origin,delta,center,half] of [[a.x,dx,c.x,c.hx+radius-.005],[a.z,dz,c.z,c.hz+radius-.005]]){
    if(Math.abs(delta)<1e-10){if(Math.abs(origin-center)>=half){ok=false;break;}}
    else{const t1=(center-half-origin)/delta,t2=(center+half-origin)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi){ok=false;break;}}
   }
   if(!ok)continue;
   // Only actual vertical overlap blocks a sweep. Walking above a support is valid.
   const y=t=>ground?ground(a.x+dx*t,a.z+dz*t):a.y+(b.y-a.y)*t;
   const ys=[y(lo),y(hi),y((lo+hi)/2)];
   if(Math.min(...ys)>=c.y-.025||Math.max(...ys)+height<=c.minY+.015)continue;
   // Existing overlaps (e.g. a save from an earlier release) may escape outward.
   if(lo===0&&(dx||dz)&&((a.x-c.x)*dx+(a.z-c.z)*dz)>0)continue;
   return c;
  }return null;
 }
 function surfaces(x,z,r=3){return [...candidates({x,z},{x,z},r)].filter(c=>c.enabled()&&c.hx>=.14&&c.hz>=.14).map(c=>({id:c.id,x:c.x,z:c.z,hx:c.hx,hz:c.hz,y:c.y,thickness:c.y-c.minY}));}
 return {add,hit,surfaces,count:()=>columns.length,inventory:()=>columns.map(({enabled,...c})=>c)};
}
