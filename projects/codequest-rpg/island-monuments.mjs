import * as THREE from 'three';
import {landmarks,pyramidParts} from './island-landmarks.mjs';
// All original procedural geometry, stylized to match the existing island.
export function createMonuments(scene,{box,material,elevation,label}){
 const sand=material('#c8ad78'),sandLight=material('#e5d0a0'),sandDark=material('#a58a5e'),stone=material('#929b9b'),stoneLight=material('#d4d7cb'),iron=material('#536267'),ironLight=material('#788a8c'),blue=material('#448baf'),copper=material('#65a79a'),patina=material('#48867e'),gold=material('#f4c56f'),dark=material('#344c56');
 const geo=new Map();
 function mesh(key,make,mat,x,y,z){if(!geo.has(key))geo.set(key,make());const m=new THREE.Mesh(geo.get(key),mat);m.position.set(x,y,z);scene.add(m);return m;}
 function beam(a,b,w,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av),mid=av.clone().add(bv).multiplyScalar(.5);const m=box(w,d.length(),w,mat,mid.x,mid.y,mid.z);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
 const orb=(x,y,z,r,mat)=>mesh('sphere'+r,()=>new THREE.SphereGeometry(r,12,8),mat,x,y,z);
 const cylinder=(x,y,z,r1,r2,h,mat,n=12)=>mesh('cyl'+[r1,r2,h,n],()=>new THREE.CylinderGeometry(r1,r2,h,n),mat,x,y,z);
 const cone=(x,y,z,r,h,mat,n=4)=>cylinder(x,y,z,0,r,h,mat,n);
 const sign=(l)=>{const m=label(l.name,true);m.position.set(l.approach.x,elevation(l.approach.x,l.approach.z)+3.4,l.approach.z);scene.add(m);};
 for(const l of landmarks){
  const {x,y,z}=l;
  if(l.kind==='pyramids'){
   for(const p of pyramidParts(l)){
    if(p.main){
     for(let i=0;i<6;i++){
      const w=p.w-i*1.52,top=y+(i+1)*1.4;
      box(w,1.4,w,i%2?sand:sandLight,p.x,top-.7,p.z);
      box(w+.03,.10,w+.03,sandDark,p.x,top-.05,p.z);
      // Fine masonry joints on exposed faces, recessed into the stone bands.
      for(const side of [-1,1])for(let j=-w/2+.65;j<w/2-.3;j+=1.25){
       box(.035,.78,.035,sandDark,p.x+j,top-.65,p.z+side*(w/2+.012));
       box(.035,.78,.035,sandDark,p.x+side*(w/2+.012),top-.65,p.z+j);
      }
     }
     box(1.35,.08,1.35,gold,p.x,y+8.44,p.z);
    }else{
     const m=cone(p.x,y+p.h/2,p.z,p.w/Math.sqrt(2),p.h,sand,4);m.rotation.y=Math.PI/4;
     box(p.w+.25,.20,p.w+.25,sandDark,p.x,y+.10,p.z);
    }
   }
   // Survey path and paired obelisks outside the pyramid footprint.
   for(const dx of [-1,1]){const px=x+dx*3.6,pz=z+8.8,py=elevation(px,pz);box(.9,.26,.9,sandDark,px,py+.13,pz);box(.47,2.25,.47,sand,px,py+1.37,pz);const cap=cone(px,py+2.73,pz,.34,.55,gold);cap.rotation.y=Math.PI/4;}
   for(let i=0;i<5;i++){const pz=z+7+i*.85;box(1.8,.06,.72,sandLight,x,elevation(x,pz)+.04,pz);}
  }else if(l.kind==='liberty'){
   box(5.6,.42,5.6,stone,x,y+.21,z);box(5.1,.38,5.1,stoneLight,x,y+.6,z);
   box(4.25,3.0,4.25,stone,x,y+2.15,z);box(4.58,.28,4.58,stoneLight,x,y+3.78,z);
   box(3.25,1.15,3.25,stone,x,y+4.48,z);box(3.55,.24,3.55,stoneLight,x,y+5.17,z);
   for(const dx of [-1,1])for(const dz of [-1,1])box(.19,2.45,.19,stoneLight,x+dx*2.04,y+2.14,z+dz*2.04);
   box(1.15,1.7,.08,dark,x,y+1.85,z+2.15);
   // Tapered robe, sculpted vertical folds and draped shoulder.
   cylinder(x,y+7.15,z,.82,1.38,3.65,copper,8);
   for(let i=0;i<9;i++){const t=i*Math.PI*2/9;beam([x+Math.cos(t)*1.21,y+5.55,z+Math.sin(t)*1.21],[x+Math.cos(t)*.78,y+8.8,z+Math.sin(t)*.78],.14,patina);}
   box(1.68,1.55,1.04,copper,x,y+9.24,z);orb(x,y+10.8,z,.61,copper);box(.73,.19,.75,patina,x,y+10.45,z+.08);
   box(.16,.14,.09,patina,x-.20,y+10.85,z+.57);box(.16,.14,.09,patina,x+.20,y+10.85,z+.57);box(.13,.24,.15,copper,x,y+10.70,z+.61);
   cylinder(x,y+11.17,z,.68,.64,.22,patina);
   for(let i=0;i<7;i++){const t=-Math.PI*.76+i*Math.PI*.253;beam([x+Math.sin(t)*.58,y+11.2,z+Math.cos(t)*.58],[x+Math.sin(t)*1.02,y+11.94,z+Math.cos(t)*1.02],.13,copper);}
   beam([x-.62,y+9.72,z],[x-1.42,y+11.65,z+.08],.59,copper);beam([x-1.42,y+11.65,z+.08],[x-1.55,y+13.55,z+.08],.43,copper);orb(x-1.55,y+13.65,z+.08,.26,copper);
   cylinder(x-1.55,y+14.05,z+.08,.17,.22,.64,patina);cylinder(x-1.55,y+14.39,z+.08,.44,.23,.23,gold);
   const flame=mesh('flame',()=>new THREE.OctahedronGeometry(.47),new THREE.MeshStandardMaterial({color:'#ffe4a0',emissive:'#ffb74a',emissiveIntensity:1.1}),x-1.55,y+14.85,z+.08);flame.scale.y=1.5;
   beam([x+.63,y+9.62,z],[x+1.0,y+8.56,z+.5],.49,copper);const tablet=box(.95,1.36,.22,patina,x+.85,y+8.75,z+.85);tablet.rotation.z=-.18;box(.57,.055,.035,gold,x+.85,y+8.99,z+1.0);
  }else if(l.kind==='eiffel'){
   const levels=[{h:0,r:4.7},{h:4.8,r:3.0},{h:9.2,r:1.68},{h:15.0,r:.78},{h:19.0,r:.29}];
   for(const dx of [-1,1])for(const dz of [-1,1]){
    box(1.75,.3,1.75,stone,x+dx*4.7,y+.15,z+dz*4.7);
    for(let i=0;i<levels.length-1;i++){
     const a=levels[i],b=levels[i+1];
     beam([x+dx*a.r,y+a.h,z+dz*a.r],[x+dx*b.r,y+b.h,z+dz*b.r],i===0?.46:.27,iron);
     beam([x+dx*a.r-.22,y+a.h,z+dz*a.r],[x+dx*b.r-.14,y+b.h,z+dz*b.r],.13,ironLight);
    }
   }
   for(let i=0;i<levels.length-1;i++){
    const a=levels[i],b=levels[i+1],n=i===0?3:4;
    for(let j=0;j<n;j++){
     const t=j/n,u=(j+1)/n,r0=THREE.MathUtils.lerp(a.r,b.r,t),r1=THREE.MathUtils.lerp(a.r,b.r,u),h0=y+THREE.MathUtils.lerp(a.h,b.h,t),h1=y+THREE.MathUtils.lerp(a.h,b.h,u);
     for(const side of [-1,1])for(const axis of [0,1]){
      const p=(r,h,sgn)=>axis?[x+sgn*r,h,z+side*r]:[x+side*r,h,z+sgn*r];
      beam(p(r0,h0,-1),p(r1,h1,1),.105,ironLight);beam(p(r0,h0,1),p(r1,h1,-1),.105,ironLight);
      if(j>0)beam(p(r0,h0,-1),p(r0,h0,1),.11,iron);
     }
    }
   }
   for(const [h,w] of [[4.8,6.7],[9.2,3.95],[15,1.95]]){box(w,.29,w,iron,x,y+h,z);for(const side of [-1,1]){box(w,.12,.13,gold,x,y+h+.37,z+side*w/2);box(.13,.12,w,gold,x+side*w/2,y+h+.37,z);}}
   box(.96,.72,.96,iron,x,y+19.13,z);cylinder(x,y+20.3,z,.065,.10,2.1,ironLight);orb(x,y+21.38,z,.16,gold);
  }else{
   // Existing crossing remains physically usable. Towers straddle it.
   for(const dx of [-1,1])for(const dz of [-1,1]){
    const px=x+dx*3.65,pz=dz*3.95,base=elevation(px,pz);
    box(2.12,8.6,2.7,stone,px,base+4.3,pz);
    for(const sx of [-1,1])for(const sz of [-1,1])box(.20,8.4,.20,stoneLight,px+sx*.98,base+4.2,pz+sz*1.25);
    box(2.33,.32,2.91,stoneLight,px,base+8.53,pz);box(2.04,.45,2.6,stone,px,base+8.9,pz);
    for(const side of [-1,1])for(let floor=0;floor<3;floor++)box(.56,.83,.055,dark,px+side*.55,base+2.0+floor*2.0,pz+dz*1.365);
    const roof=cone(px,base+10.1,pz,1.68,2.0,blue,4);roof.rotation.y=Math.PI/4;
    cylinder(px,base+11.42,pz,.035,.07,.72,gold);
   }
   // High-level blue walkways, visible suspension chains, and deck edge.
   for(const dz of [-1,1]){box(5.6,.34,1.05,blue,x,9.2,dz*3.95);box(5.6,.13,1.15,stoneLight,x,9.45,dz*3.95);}
   for(const dx of [-1,1]){
    const px=x+dx*2.08;
    const pts=Array.from({length:13},(_,i)=>{const t=i/12,zz=-4+8*t;return [px,2.45+5.1*(2*t-1)**2,zz];});
    for(let i=0;i<pts.length-1;i++)beam(pts[i],pts[i+1],.13,blue);
    for(let i=1;i<pts.length-1;i++)beam([px,2.04,pts[i][2]],pts[i],.055,blue);
    box(.14,.16,9.15,blue,px,1.3,0);
   }
   box(4.1,.08,.12,stoneLight,x,1.21,0);
  }
  sign(l);
 }
 return {count:landmarks.length};
}
