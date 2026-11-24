import * as THREE from 'three';
// Bounded, deterministic visual fluid approximation. No simulation textures,
// per-frame geometry allocation, or external assets.
export const WATER_LEVEL=-1;
export const flowSpeed=.95;
export function waveHeight(x,z,t){
 return WATER_LEVEL+.065*Math.sin(.48*x+.27*z-1.4*t)+.035*Math.sin(-.24*x+.71*z-1.9*t)+.022*Math.sin(.93*x-.41*z-2.6*t);
}
export function waterProximity(x,z){
 const edge=Math.hypot(x/153,z/124);
 return Math.max(0,Math.min(1,1-Math.abs(Math.abs(z)-3.3)/3.8),Math.min(1,Math.max(0,(edge-.82)/.11)));
}
export const particleCapacity=160;
export function createIslandWater(scene){
 const uniforms={uTime:{value:0},uFlow:{value:flowSpeed}};
 const material=new THREE.ShaderMaterial({
  uniforms,
  vertexShader:`
   uniform float uTime;
   varying vec3 vWorld;
   void main(){
    vec3 p=position;
    p.y+=.065*sin(.48*p.x+.27*p.z-1.4*uTime)+.035*sin(-.24*p.x+.71*p.z-1.9*uTime)+.022*sin(.93*p.x-.41*p.z-2.6*uTime);
    vWorld=(modelMatrix*vec4(p,1.)).xyz;
    gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);
   }`,
  fragmentShader:`
   uniform float uTime;uniform float uFlow;
   varying vec3 vWorld;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
   void main(){
    vec2 p=vWorld.xz;
    float a=.48*p.x+.27*p.y-1.4*uTime,b=-.24*p.x+.71*p.y-1.9*uTime,c=.93*p.x-.41*p.y-2.6*uTime;
    vec3 n=normalize(vec3(-(.065*.48*cos(a)-.035*.24*cos(b)+.022*.93*cos(c)),1.,-(.065*.27*cos(a)+.035*.71*cos(b)-.022*.41*cos(c))));
    vec3 v=normalize(cameraPosition-vWorld),sun=normalize(vec3(-.38,.85,.28));
    float fresnel=pow(1.-max(0.,dot(n,v)),3.2);
    float sparkle=pow(max(0.,dot(reflect(-sun,n),v)),42.);
    float edge=length(p/vec2(153.,124.));
    float river=(1.-smoothstep(3.3,5.4,abs(p.y)))*(1.-smoothstep(.88,1.02,edge));
    vec2 drift=vec2(p.x-uTime*uFlow,p.y);
    float ripples=sin(drift.x*.72+sin(drift.y*1.3)*.7)*.5+.5;
    float fine=noise(drift*vec2(.54,2.3));
    float shoreFoam=1.-smoothstep(.004,.024,abs(edge-.93+.006*sin(p.x*.32+uTime)));
    float bankFoam=(1.-smoothstep(.12,.52,abs(abs(p.y)-2.8+.18*sin(drift.x*1.5))))*river;
    float streak=smoothstep(.84,.96,ripples)*smoothstep(.50,.78,fine)*river;
    float foam=clamp((shoreFoam*.62+bankFoam*.7+streak*.34)*(.55+.45*noise(drift*.9)),0.,.82);
    vec3 deep=vec3(.035,.25,.34),shallow=vec3(.12,.46,.51),sky=vec3(.43,.65,.70);
    vec3 color=mix(deep,shallow,clamp(river*.65+shoreFoam*.28+fine*.18,0.,1.));
    color=mix(color,sky,fresnel*.58)+sparkle*.28+vec3(.035)*ripples;
    color=mix(color,vec3(.76,.92,.90),foam);
    float haze=smoothstep(95.,235.,length(cameraPosition-vWorld));color=mix(color,vec3(.54,.71,.75),haze*.55);
    gl_FragColor=vec4(color,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`
 });
 const geometry=new THREE.PlaneGeometry(420,420,112,112);geometry.rotateX(-Math.PI/2);
 const water=new THREE.Mesh(geometry,material);water.position.y=WATER_LEVEL;scene.add(water);
 const positions=new Float32Array(particleCapacity*3),alpha=new Float32Array(particleCapacity),size=new Float32Array(particleCapacity);
 const particles=Array.from({length:particleCapacity},()=>({life:0,max:1,x:0,y:0,z:0,vx:0,vy:0,vz:0}));
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));pg.setAttribute('aAlpha',new THREE.BufferAttribute(alpha,1).setUsage(THREE.DynamicDrawUsage));pg.setAttribute('aSize',new THREE.BufferAttribute(size,1).setUsage(THREE.DynamicDrawUsage));
 const pm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uScale:{value:1}},vertexShader:`
 attribute float aAlpha;attribute float aSize;uniform float uScale;varying float vAlpha;
 void main(){vAlpha=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uScale*(230./max(2.,-mv.z)),1.,12.);}
 `,fragmentShader:`
 varying float vAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(.25,1.,r))*vAlpha;if(a<.01)discard;gl_FragColor=vec4(.80,.94,.96,a);}
 `});
 const points=new THREE.Points(pg,pm);points.frustumCulled=false;scene.add(points);
 let cursor=0,seed=49217,accum=0,active=0,lastX=null,lastZ=null;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function emit(x,z,t,strength){
  const p=particles[cursor++%particleCapacity],angle=rand()*Math.PI*2;
  p.x=x+(rand()-.5)*.4;p.z=z+(rand()-.5)*.4;p.y=waveHeight(p.x,p.z,t)+.10;
  p.vx=Math.cos(angle)*strength*.65+flowSpeed*.4;p.vz=Math.sin(angle)*strength*.65;p.vy=.7+rand()*strength;
  p.life=p.max=.45+rand()*.65;
 }
 function update(time,dt,{x,z,y,jetting=false,mapMode=false,pixelRatio=1}={}){
  uniforms.uTime.value=time;points.visible=!mapMode;pm.uniforms.uScale.value=pixelRatio;
  const speed=lastX===null||!dt?0:Math.min(30,Math.hypot(x-lastX,z-lastZ)/dt);lastX=x;lastZ=z;
  if(!mapMode){
   accum+=dt*(4+waterProximity(x,z)*Math.min(16,speed)*1.6+(jetting&&Math.abs(z)<6?18:0));
   while(accum>=1){accum--;if(Math.abs(z)<10&&Math.abs(x)<135){const side=z<0?-1:1;emit(x+(rand()-.5)*1.8,side*(2.45+rand()*.5),time,.8+Math.min(3,speed*.1)+(jetting?1:0));}else{const theta=rand()*Math.PI*2;emit(153*.94*Math.cos(theta),124*.94*Math.sin(theta),time,1.2);}}
  }else accum=0;
  active=0;
  for(let i=0;i<particles.length;i++){
   const p=particles[i];p.life=Math.max(0,p.life-dt);
   if(p.life>0){p.vy-=3.7*dt;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;if(p.y<waveHeight(p.x,p.z,time))p.life=0;}
   if(p.life>0){active++;positions[i*3]=p.x;positions[i*3+1]=p.y;positions[i*3+2]=p.z;alpha[i]=Math.min(1,p.life/p.max)*.85;size[i]=.17+(.1*p.life/p.max);}else alpha[i]=0;
  }
  for(const attr of Object.values(pg.attributes))attr.needsUpdate=true;
 }
 return {update,stats:()=>({active,capacity:particleCapacity,time:uniforms.uTime.value})};
}
