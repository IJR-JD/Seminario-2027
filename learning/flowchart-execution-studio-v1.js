/* IJR · Seminario 2027 · Flowchart Execution Studio
 * Faithful, deterministic traces paired with executable Python examples.
 * The on-screen trace is a guided educational simulation; "Run real Python"
 * independently executes the identical generated source via IJR_RUNNER.
 * No eval, dynamic code parsing, hidden grading or server-side writes.
 */
(()=>{"use strict";
if(window.SEMINAR_2027_TRACK!=="programming"||new URLSearchParams(location.search).get("topic")!=="flowcharts")return;
const NS="http://www.w3.org/2000/svg";
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(value,min,max,initial)=>{
 const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.trunc(n))):initial;
};
const examples=[
 {id:"sequence",number:"01",title:"Secuencia",subtitle:"Área de un rectángulo",concept:"Inicio → entrada → proceso → salida → fin.",challenge:"Cambia la base y la altura. ¿Qué valor imprime el programa?",inputs:[{key:"base",label:"Base",min:1,max:30,value:6},{key:"height",label:"Altura",min:1,max:30,value:4}]},
 {id:"decision",number:"02",title:"Condición",subtitle:"Mayoría de edad",concept:"Una condición decide qué recorrido se ejecuta; nunca ambos.",challenge:"Cambia la edad y predice qué rama ejecutará Python.",inputs:[{key:"age",label:"Edad",min:0,max:110,value:17}]},
 {id:"grading",number:"03",title:"If / elif / else",subtitle:"Clasificación por puntaje",concept:"Se evalúan las condiciones por orden; la primera verdadera determina la salida.",challenge:"Prueba 59, 70, 89 y 90. ¿Por qué cambian los caminos?",inputs:[{key:"score",label:"Puntaje",min:0,max:100,value:85}]},
 {id:"while",number:"04",title:"Ciclo while",subtitle:"Contador iterativo",concept:"Una decisión retorna al proceso mientras sea verdadera; al fallar, sale.",challenge:"Cambia el límite. ¿Cuántas veces vuelve la flecha al rombo?",inputs:[{key:"limit",label:"Límite",min:1,max:5,value:3}]}
];
function shape(id,kind,x,y,w,h,label,sub=""){
 return {id,kind,x,y,w,h,label,sub};
}
function edge(id,from,to,d,label="",lx=0,ly=0){return {id,from,to,d,label,lx,ly};}
const graph={
 sequence:{
  nodes:[
   shape("start","terminator",410,65,175,56,"INICIO"),
   shape("base","io",410,163,255,74,"Entrada","base"),
   shape("height","io",410,270,255,74,"Entrada","altura"),
   shape("calc","process",410,380,300,82,"Calcular área","base × altura"),
   shape("output","io",410,498,275,78,"Mostrar área","print(area)"),
   shape("end","terminator",410,628,175,56,"FIN")
  ],
  edges:[
   edge("a","start","base","M410 93V126"),edge("b","base","height","M410 200V233"),
   edge("c","height","calc","M410 307V339"),edge("d","calc","output","M410 421V459"),
   edge("e","output","end","M410 537V600")
  ]
 },
 decision:{
  nodes:[
   shape("start","terminator",410,60,175,56,"INICIO"),
   shape("age","io",410,157,245,74,"Leer edad","age"),
   shape("cond","decision",410,287,246,112,"¿age ≥ 18?"),
   shape("adult","io",202,467,224,76,"Mostrar Adult","print('Adult')"),
   shape("minor","io",618,467,224,76,"Mostrar Minor","print('Minor')"),
   shape("end","terminator",410,631,175,56,"FIN")
  ],
  edges:[
   edge("a","start","age","M410 88V120"),edge("b","age","cond","M410 194V231"),
   edge("yes","cond","adult","M287 287H202V429","SÍ",250,268),
   edge("no","cond","minor","M533 287H618V429","NO",574,268),
   edge("c","adult","end","M202 505V562H388V603"),
   edge("d","minor","end","M618 505V567H432V603")
  ]
 },
 grading:{
  nodes:[
   shape("start","terminator",410,49,170,52,"INICIO"),
   shape("score","io",410,138,238,70,"Leer puntaje","score"),
   shape("condA","decision",410,239,216,96,"¿score ≥ 90?"),
   shape("A","io",162,337,205,72,"Mostrar A","print('A')"),
   shape("condB","decision",410,377,216,96,"¿score ≥ 70?"),
   shape("B","io",653,495,205,72,"Mostrar B","print('B')"),
   shape("C","io",410,521,205,72,"Mostrar C","print('C')"),
   shape("end","terminator",410,647,170,52,"FIN")
  ],
  edges:[
   edge("a","start","score","M410 75V103"),edge("b","score","condA","M410 173V191"),
   edge("yesA","condA","A","M302 239H162V301","SÍ",257,224),
   edge("noA","condA","condB","M410 287V329","NO",438,308),
   edge("yesB","condB","B","M518 377H653V459","SÍ",571,357),
   edge("noB","condB","C","M410 425V485","NO",436,454),
   edge("c","A","end","M162 373V588H380V621"),
   edge("d","B","end","M653 531V593H438V621"),
   edge("e","C","end","M410 557V621")
  ]
 },
 while:{
  nodes:[
   shape("start","terminator",410,56,170,55,"INICIO"),
   shape("limit","io",410,144,236,70,"Leer límite","limit"),
   shape("initial","process",410,237,236,72,"counter = 0","Inicializar"),
   shape("cond","decision",410,343,226,106,"¿counter < limit?"),
   shape("increment","process",203,466,226,76,"counter += 1","Actualizar"),
   shape("print","io",203,587,236,74,"Mostrar counter","print(counter)"),
   shape("done","io",631,474,228,78,"Mostrar Done","print('Done')"),
   shape("end","terminator",631,623,170,55,"FIN")
  ],
  edges:[
   edge("a","start","limit","M410 84V109"),edge("b","limit","initial","M410 179V201"),
   edge("c","initial","cond","M410 273V290"),
   edge("yes","cond","increment","M297 343H203V428","SÍ",255,326),
   edge("d","increment","print","M203 504V550"),
   edge("back","print","cond","M203 624H73V294H345V321","REPETIR",120,279),
   edge("no","cond","done","M523 343H631V435","NO",567,327),
   edge("e","done","end","M631 513V595")
  ]
 }
};
function trace(example,p){
 const steps=[],push=(node,line,vars,output,why,via=null,branch="")=>{
  steps.push({node,lines:Array.isArray(line)?line:line==null?[]:[line],vars:{...vars},output,why,via,branch});
 };
 const pre=(source,settings)=>({source,settings,steps});
 let v={},out="";
 push("start",[],v,out,"El algoritmo inicia en el terminador.");
 if(example.id==="sequence"){
  v.base=p.base;push("base",1,v,out,"Entrada: se almacena la base del rectángulo.","a");
  v.height=p.height;push("height",2,v,out,"Entrada: se almacena la altura.","b");
  v.area=p.base*p.height;push("calc",3,v,out,"Proceso: area = base × height = "+v.area+".","c");
  out=String(v.area);push("output",4,v,out,"Salida: print(area) envía el valor a la consola.","d");
  push("end",[],v,out,"Fin: el programa ya no tiene instrucciones pendientes.","e");
  return pre(["base = "+p.base,"height = "+p.height,"area = base * height","print(area)"].join("\n"),p);
 }
 if(example.id==="decision"){
  v.age=p.age;push("age",1,v,out,"Entrada: la variable age recibe "+v.age+".","a");
  const yes=v.age>=18;push("cond",2,v,out,"Decisión: "+v.age+" ≥ 18 es "+(yes?"verdadero":"falso")+".","b",yes?"SÍ":"NO");
  out=yes?"Adult":"Minor";
  push(yes?"adult":"minor",yes?3:[4,5],v,out,yes?"Rama SÍ: se ejecuta print('Adult').":"Rama NO: se ejecuta el bloque else.",""+(yes?"yes":"no"));
  push("end",[],v,out,"Fin: solo se ejecutó una de las dos ramas.",yes?"c":"d");
  return pre(["age = "+p.age,"if age >= 18:","    print('Adult')","else:","    print('Minor')"].join("\n"),p);
 }
 if(example.id==="grading"){
  v.score=p.score;push("score",1,v,out,"Entrada: el puntaje es "+v.score+".","a");
  const first=v.score>=90;
  push("condA",2,v,out,"Primera decisión: score ≥ 90 es "+(first?"verdadero":"falso")+".","b",first?"SÍ":"NO");
  if(first){
   out="A";push("A",3,v,out,"Rama SÍ: el primer if imprime A.","yesA");
   push("end",[],v,out,"Fin: las demás condiciones ya no se evalúan.","c");
  }else{
   const second=v.score>=70;
   push("condB",4,v,out,"Rama NO: se evalúa elif. score ≥ 70 es "+(second?"verdadero":"falso")+".","noA",second?"SÍ":"NO");
   out=second?"B":"C";
   push(second?"B":"C",second?5:[6,7],v,out,second?"Rama SÍ del elif: imprime B.":"Rama NO: imprime C mediante else.",second?"yesB":"noB");
   push("end",[],v,out,"Fin: solo un bloque imprime una calificación.",second?"d":"e");
  }
  return pre(["score = "+p.score,"if score >= 90:","    print('A')","elif score >= 70:","    print('B')","else:","    print('C')"].join("\n"),p);
 }
 v.limit=p.limit;push("limit",1,v,out,"Entrada: el ciclo contará hasta "+p.limit+".","a");
 v.counter=0;push("initial",2,v,out,"Inicialización: counter empieza en 0.","b");
 let path="c";
 for(let i=0;i<=p.limit;i++){
  const yes=v.counter<p.limit;
  push("cond",3,v,out,"Se comprueba "+v.counter+" < "+p.limit+": "+(yes?"verdadero":"falso")+".",path,yes?"SÍ":"NO");
  if(!yes)break;
  v.counter+=1;push("increment",4,v,out,"Proceso: counter aumenta hasta "+v.counter+".","yes");
  out+=(out?"\n":"")+v.counter;push("print",5,v,out,"Salida parcial: se muestra "+v.counter+" y el ciclo regresa al rombo.","d");
  path="back";
 }
 out+=(out?"\n":"")+"Done";
 push("done",6,v,out,"La condición fue falsa; continúa después del ciclo y muestra Done.","no");
 push("end",[],v,out,"Fin: el ciclo ha terminado.","e");
 return pre(["limit = "+p.limit,"counter = 0","while counter < limit:","    counter += 1","    print(counter)","print('Done')"].join("\n"),p);
}
function renderNode(n){
 const {x,y,w,h}=n,left=x-w/2,top=y-h/2;
 let figure;
 if(n.kind==="terminator")figure='<rect x="'+left+'" y="'+top+'" width="'+w+'" height="'+h+'" rx="'+h/2+'"/>';
 else if(n.kind==="io"){
  const skew=Math.min(24,w*.11);
  figure='<polygon points="'+(left+skew)+','+top+' '+(left+w)+','+top+' '+(left+w-skew)+','+(top+h)+' '+left+','+(top+h)+'"/>';
 }else if(n.kind==="decision")
  figure='<polygon points="'+x+','+top+' '+(left+w)+','+y+' '+x+','+(top+h)+' '+left+','+y+'"/>';
 else figure='<rect x="'+left+'" y="'+top+'" width="'+w+'" height="'+h+'" rx="10"/>';
 const titleY=n.sub?y-5:y+6;
 return '<g class="fc28-node fc28-'+n.kind+'" data-node="'+escape(n.id)+'" tabindex="0" role="button" aria-label="Ver paso del diagrama: '+escape(n.label)+'">'+figure+
 '<text x="'+x+'" y="'+titleY+'" text-anchor="middle">'+escape(n.label)+'</text>'+
 (n.sub?'<text class="fc28-sub" x="'+x+'" y="'+(y+19)+'" text-anchor="middle">'+escape(n.sub)+'</text>':"")+'</g>';
}
function renderGraph(ex){
 const g=graph[ex.id],arrows=g.edges.map(e=>'<g class="fc28-edge" data-edge="'+escape(e.id)+'"><path class="fc28-edge-track" d="'+e.d+'" marker-end="url(#fc28-arrow)"/>'+
 (e.label?'<text class="fc28-edge-label" x="'+e.lx+'" y="'+e.ly+'" text-anchor="middle">'+escape(e.label)+'</text>':"")+'</g>').join("");
 const base='<svg class="fc28-svg" viewBox="0 0 820 700" role="img" aria-label="Diagrama de flujo ejecutable para '+escape(ex.subtitle)+'" xmlns="'+NS+'">'+
 '<defs><marker id="fc28-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L7 3.5L0 7Z" fill="#767672"/></marker>'+
 '<pattern id="fc28-paper-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#dededa" stroke-width=".8"/></pattern></defs>'+
 '<rect x="4" y="4" width="812" height="691" rx="13" fill="white" stroke="#d7d7d3"/>'+
 '<rect x="7" y="7" width="806" height="683" rx="12" fill="url(#fc28-paper-grid)" opacity=".45"/>'+
 '<text class="fc28-svg-heading" x="410" y="30" text-anchor="middle">IJR / FLOWCHART EXECUTION TRACE</text>'+
 arrows+g.nodes.map(renderNode).join("")+
 '<circle class="fc28-token" r="9" cx="'+g.nodes[0].x+'" cy="'+g.nodes[0].y+'" aria-hidden="true"/>'+
 '</svg>';
 return base;
}
const rootHTML='<div class="section-heading-v2"><p class="eyebrow">FLOWCHART EXECUTION STUDIO · PYTHON 3</p>'+
 '<h2>Un programa. Dos representaciones. Una sola ejecución.</h2>'+
 '<p>Relaciona cada línea de Python con su símbolo, el recorrido de las flechas y el estado de las variables. Cambia las entradas, recorre el algoritmo y comprueba el resultado con el intérprete real.</p></div>'+
 '<div class="fc28-symbols" aria-label="Convenciones estándar de diagramas de flujo">'+
 '<div><svg viewBox="0 0 65 32" aria-hidden="true"><rect x="6" y="5" width="53" height="22" rx="11"/></svg><span>Inicio / fin</span></div>'+
 '<div><svg viewBox="0 0 65 32" aria-hidden="true"><polygon points="14,5 59,5 51,27 6,27"/></svg><span>Entrada / salida</span></div>'+
 '<div><svg viewBox="0 0 65 32" aria-hidden="true"><rect x="6" y="5" width="53" height="22" rx="2"/></svg><span>Proceso</span></div>'+
 '<div><svg viewBox="0 0 65 32" aria-hidden="true"><polygon points="32,2 61,16 32,30 3,16"/></svg><span>Decisión</span></div>'+
 '<div><svg viewBox="0 0 65 32" aria-hidden="true"><path d="M4 16H53M45 8L53 16L45 24" fill="none" stroke-width="2"/></svg><span>Flujo / dirección</span></div></div>'+
 '<div class="fc28-tabs" role="tablist" aria-label="Seleccionar ejemplo interactivo"></div>'+
 '<div class="fc28-summary"><div><p class="eyebrow" id="fc28-kind">EJEMPLO 01 / 04</p><h3 id="fc28-example-title"></h3><p id="fc28-concept"></p></div>'+
 '<div class="fc28-params" role="group" aria-label="Cambiar valores del ejemplo"></div></div>'+
 '<div class="fc28-workspace"><article class="fc28-panel fc28-diagram-panel"><div class="fc28-panel-head"><span>01 / DIAGRAMA DE FLUJO</span><strong id="fc28-active-route">Ruta inicial</strong></div>'+
 '<div class="fc28-diagram-scroll" tabindex="0" role="region" aria-label="Diagrama SVG con desplazamiento horizontal en móviles"></div>'+
 '<p class="fc28-panel-caption">Rombo: condición · Sí/No: ramas · Flecha de retorno: ciclo. Selecciona un símbolo para localizar su instrucción.</p></article>'+
 '<article class="fc28-panel fc28-code-panel"><div class="fc28-panel-head"><span>02 / CÓDIGO PYTHON REAL</span><strong>Python 3</strong></div>'+
 '<div class="fc28-code-scroll" tabindex="0" role="region" aria-label="Código de Python con líneas resaltadas"><ol class="fc28-lines"></ol></div>'+
 '<div class="fc28-console"><div class="fc28-console-title">03 / CONSOLE OUTPUT <span id="fc28-output-count">0 líneas</span></div><pre id="fc28-output">—</pre></div>'+
 '<div class="fc28-vars"><p>VARIABLES / ESTADO</p><div id="fc28-var-values"></div></div></article></div>'+
 '<div class="fc28-controls"><div class="fc28-actions"><button type="button" class="fc28-control" data-act="first">↺ Reiniciar</button>'+
 '<button type="button" class="fc28-control" data-act="previous">← Anterior</button>'+
 '<button type="button" class="fc28-control fc28-primary" data-act="play">▶ Reproducir</button>'+
 '<button type="button" class="fc28-control" data-act="next">Siguiente →</button>'+
 '<label class="fc28-speed">Velocidad <select aria-label="Velocidad de animación" id="fc28-speed"><option value=".75">0.75×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div>'+
 '<div class="fc28-sequence"><span id="fc28-step-counter">01 / 06</span><div class="fc28-progress" role="progressbar" aria-label="Progreso del ejemplo animado" aria-valuemin="1" aria-valuemax="6" aria-valuenow="1"><span></span></div></div>'+
 '<p class="fc28-explanation" id="fc28-explanation" role="status" aria-live="polite"></p></div>'+
 '<div class="fc28-practice"><div><p class="eyebrow">DESAFÍO PRÁCTICO · COMPRUEBA TU HIPÓTESIS</p>'+
 '<h3 id="fc28-challenge"></h3><p>Predice la salida antes de pulsar ejecutar. Después comprueba la correspondencia entre la traza y el resultado real de Python.</p></div>'+
 '<div class="fc28-practice-input"><label for="fc28-prediction">Tu predicción (una línea por cada salida)</label><textarea id="fc28-prediction" rows="2" spellcheck="false" placeholder="Escribe la salida esperada…"></textarea>'+
 '<div class="fc28-practice-buttons"><button type="button" class="fc28-control" data-act="check">Comprobar predicción</button>'+
 '<button type="button" class="fc28-control fc28-primary" data-act="python">▶ Ejecutar Python real</button>'+
 '<button type="button" class="fc28-control" data-act="lab">Editar en el laboratorio ↗</button></div>'+
 '<p class="fc28-feedback" id="fc28-feedback" role="status" aria-live="polite"></p></div></div>'+
 '<p class="fc28-disclaimer">La animación reproduce una traza didáctica determinista del programa mostrado; <strong>Ejecutar Python real</strong> verifica su salida de manera independiente mediante el intérprete de Python del sitio. Si modificas libremente el código en el laboratorio, esa versión deja de corresponder a la traza hasta que vuelvas a cargar el ejemplo.</p>';
function init(){
 const visuals=document.getElementById("visuals"),live=document.getElementById("live");
 if(!visuals||!live||document.getElementById("flowchartExecutionStudio"))return;
 const section=document.createElement("section");
 section.id="flowchartExecutionStudio";
 section.className="theory-section-v2 fc28-section";
 section.innerHTML=rootHTML;
 visuals.insertAdjacentElement("afterend",section);
 const q=selector=>section.querySelector(selector);
 const model={example:examples[0],parameters:{},trace:[],source:"",index:0,
  timer:null,playing:false,speed:1,revision:0,frame:null};
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const tabs=q(".fc28-tabs");
 examples.forEach((e,i)=>{
  const button=document.createElement("button");
  button.type="button";button.className="fc28-tab";button.dataset.example=e.id;
  button.setAttribute("role","tab");button.setAttribute("aria-controls","fc28-example-title");
  button.textContent=e.number+"  "+e.title;
  button.addEventListener("click",()=>selectExample(e.id));
  tabs.append(button);
 });
 const getNode=id=>q('.fc28-svg [data-node="'+id+'"]');
 const getEdge=id=>q('.fc28-svg [data-edge="'+id+'"]');
 function cancelMotion(){
  if(model.frame!=null){cancelAnimationFrame(model.frame);model.frame=null;}
  const dot=q(".fc28-token");if(dot)dot.style.opacity="0";
 }
 function pause(){
  if(model.timer!=null)clearTimeout(model.timer);
  model.timer=null;model.playing=false;
  const button=q('[data-act="play"]');
  button.textContent=model.index===model.trace.length-1?"↻ Repetir":"▶ Reproducir";
  button.setAttribute("aria-pressed","false");
 }
 function showPredictionFeedback(message,ok=false){
  const item=q("#fc28-feedback");
  item.textContent=message;item.className="fc28-feedback"+(ok?" is-ok":"");
 }
 function updateControls(){
  q('[data-act="previous"]').disabled=model.index===0;
  q('[data-act="next"]').disabled=model.index===model.trace.length-1;
  const c=q("#fc28-step-counter");
  c.textContent=String(model.index+1).padStart(2,"0")+" / "+String(model.trace.length).padStart(2,"0");
  const progress=q(".fc28-progress");
  progress.setAttribute("aria-valuemax",String(model.trace.length));
  progress.setAttribute("aria-valuenow",String(model.index+1));
  progress.querySelector("span").style.width=(100*(model.index+1)/model.trace.length)+"%";
  if(!model.playing)pause();
 }
 function moveDot(pathId){
  if(!pathId||reduce.matches||!window.requestAnimationFrame)return;
  const edge=getEdge(pathId),path=edge?.querySelector("path");
  const dot=q(".fc28-token");
  if(!path||!dot||typeof path.getTotalLength!=="function")return;
  cancelMotion();dot.style.opacity="1";
  const len=path.getTotalLength(),duration=720/model.speed;
  let first=null;
  function tick(t){
   if(first==null)first=t;
   const f=Math.min(1,(t-first)/duration),smooth=f*f*(3-2*f),point=path.getPointAtLength(len*smooth);
   dot.setAttribute("cx",String(point.x));dot.setAttribute("cy",String(point.y));
   if(f<1)model.frame=requestAnimationFrame(tick);else{model.frame=null;dot.style.opacity="0";}
  }
  model.frame=requestAnimationFrame(tick);
 }
 function focusStep(index,travel=true){
  model.index=Math.max(0,Math.min(model.trace.length-1,index));
  const step=model.trace[model.index],all=model.trace.slice(0,model.index+1);
  const visited=new Set(all.map(x=>x.node));
  const edges=new Set(all.map(x=>x.via).filter(Boolean));
  for(const node of q(".fc28-svg").querySelectorAll(".fc28-node")){
   node.classList.toggle("is-current",node.dataset.node===step.node);
   node.classList.toggle("is-visited",visited.has(node.dataset.node));
   node.setAttribute("aria-current",String(node.dataset.node===step.node));
  }
  for(const e of q(".fc28-svg").querySelectorAll(".fc28-edge")){
   e.classList.toggle("is-traversed",edges.has(e.dataset.edge));
   e.classList.toggle("is-current",e.dataset.edge===step.via);
  }
  for(const item of q(".fc28-lines").children){
   const active=step.lines.includes(Number(item.dataset.line));
   item.classList.toggle("is-current",active);
   item.setAttribute("aria-current",active?"step":"false");
  }
  // Scroll only the code panel, never the whole page on initial load.
  const currentLine=q(".fc28-line.is-current");
  const codeArea=q(".fc28-code-scroll");
  if(currentLine){
   const top=currentLine.offsetTop-codeArea.offsetTop;
   const bottom=top+currentLine.offsetHeight;
   if(top<codeArea.scrollTop)codeArea.scrollTop=top;
   else if(bottom>codeArea.scrollTop+codeArea.clientHeight)
    codeArea.scrollTop=bottom-codeArea.clientHeight+12;
  }
  q("#fc28-active-route").textContent=step.branch?("Condición → "+step.branch):"Paso "+(model.index+1)+" / "+model.trace.length;
  q("#fc28-explanation").textContent=step.why;
  q("#fc28-output").textContent=step.output||"—";
  q("#fc28-output-count").textContent=step.output?step.output.split("\n").length+" líneas":"0 líneas";
  const vals=q("#fc28-var-values");
  vals.replaceChildren();
  if(!Object.keys(step.vars).length)vals.textContent="Sin valores todavía";
  for(const [name,value]of Object.entries(step.vars)){
   const token=document.createElement("span");token.className="fc28-variable";
   const key=document.createElement("b");key.textContent=name;
   const val=document.createElement("code");val.textContent=String(value);
   token.append(key,val);vals.append(token);
  }
  const dot=q(".fc28-token"),node=graph[model.example.id].nodes.find(x=>x.id===step.node);
  // The travelling marker appears only on the connecting edge, never across node labels.
  if(travel&&model.index>0&&step.via&&!reduce.matches)moveDot(step.via);
  else cancelMotion();
  const scroller=q(".fc28-diagram-scroll");
  if(scroller.scrollWidth>scroller.clientWidth+6){
   const desired=Math.max(0,Math.min(scroller.scrollWidth-scroller.clientWidth,
    node.x/820*scroller.scrollWidth-scroller.clientWidth/2));
   scroller.scrollTo({left:desired,behavior:reduce.matches?"instant":"smooth"});
  }
  updateControls();
 }
 function schedule(){
  if(!model.playing)return;
  if(model.index===model.trace.length-1){pause();return;}
  model.timer=setTimeout(()=>{
   model.timer=null;
   if(!model.playing)return;
   focusStep(model.index+1,true);
   if(model.index===model.trace.length-1)pause();else schedule();
  },Math.round(1450/model.speed));
 }
 function play(){
  if(model.playing){pause();return;}
  if(model.index===model.trace.length-1)focusStep(0,false);
  model.playing=true;
  q('[data-act="play"]').textContent="Ⅱ Pausar";
  q('[data-act="play"]').setAttribute("aria-pressed","true");
  schedule();
 }
 function draw(){
  const cfg=trace(model.example,model.parameters);
  model.source=cfg.source;model.trace=cfg.steps;model.index=0;
  q(".fc28-diagram-scroll").innerHTML=renderGraph(model.example);
  const list=q(".fc28-lines");list.replaceChildren();
  cfg.source.split("\n").forEach((line,i)=>{
   const li=document.createElement("li");li.className="fc28-line";li.dataset.line=String(i+1);
   const num=document.createElement("span");num.className="fc28-line-no";num.textContent=String(i+1).padStart(2,"0");
   const code=document.createElement("code");code.textContent=line;
   li.append(num,code);list.append(li);
  });
  for(const node of q(".fc28-svg").querySelectorAll("[data-node]")){
   const handler=()=>{
    const choices=model.trace.map((s,i)=>({s,i})).filter(x=>x.s.node===node.dataset.node);
    if(!choices.length)return;
    pause();const candidate=choices.find(x=>x.i>model.index)||choices[0];
    focusStep(candidate.i,false);
   };
   node.addEventListener("click",handler);
   node.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();handler();}});
  }
  focusStep(0,false);
  model.revision++;
 }
 function renderParameters(){
  const host=q(".fc28-params");host.replaceChildren();
  for(const param of model.example.inputs){
   const row=document.createElement("label");
   row.className="fc28-parameter";row.textContent=param.label;
   const input=document.createElement("input");
   input.type="number";input.min=param.min;input.max=param.max;input.step="1";
   input.value=String(model.parameters[param.key]);input.name=param.key;
   input.setAttribute("aria-label",param.label+" del ejemplo");
   input.addEventListener("change",()=>{
    const value=clamp(input.value,param.min,param.max,param.value);
    input.value=String(value);model.parameters[param.key]=value;
    pause();cancelMotion();draw();
    q("#fc28-prediction").value="";
    showPredictionFeedback("Parámetro actualizado. Recorre el nuevo camino antes de verificar.");
   });
   row.append(input);host.append(row);
  }
 }
 function selectExample(id){
  const e=examples.find(x=>x.id===id);if(!e)return;
  pause();cancelMotion();model.example=e;
  model.parameters=Object.fromEntries(e.inputs.map(input=>[input.key,input.value]));
  q("#fc28-kind").textContent="EJEMPLO "+e.number+" / 04  ·  "+e.title.toUpperCase();
  q("#fc28-example-title").textContent=e.subtitle;
  q("#fc28-concept").textContent=e.concept;
  q("#fc28-challenge").textContent=e.challenge;
  for(const button of tabs.children){
   const selected=button.dataset.example===id;
   button.classList.toggle("is-selected",selected);
   button.setAttribute("aria-selected",String(selected));
   button.tabIndex=selected?0:-1;
  }
  renderParameters();draw();
  q("#fc28-prediction").value="";showPredictionFeedback("");
 }
 tabs.addEventListener("keydown",e=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
  e.preventDefault();
  const index=examples.findIndex(x=>x.id===model.example.id);
  let next=e.key==="Home"?0:e.key==="End"?examples.length-1:(index+(e.key==="ArrowRight"?1:-1)+examples.length)%examples.length;
  selectExample(examples[next].id);tabs.children[next].focus();
 });
 q('[data-act="first"]').addEventListener("click",()=>{pause();focusStep(0,false);});
 q('[data-act="previous"]').addEventListener("click",()=>{pause();focusStep(model.index-1,true);});
 q('[data-act="next"]').addEventListener("click",()=>{pause();focusStep(model.index+1,true);});
 q('[data-act="play"]').addEventListener("click",play);
 q("#fc28-speed").addEventListener("change",event=>{
  model.speed=Number(event.target.value)||1;
  if(model.playing){clearTimeout(model.timer);schedule();}
 });
 q('[data-act="check"]').addEventListener("click",()=>{
  const expected=model.trace[model.trace.length-1].output.trim().replace(/\r/g,"");
  const answer=q("#fc28-prediction").value.trim().replace(/\r/g,"");
  if(!answer){showPredictionFeedback("Escribe primero tu predicción.");return;}
  if(expected===answer)showPredictionFeedback("✓ Predicción correcta. Ahora ejecuta Python para corroborarla.",true);
  else showPredictionFeedback("La predicción no coincide con esta entrada. Recorre las condiciones y revisa la consola.");
 });
 q('[data-act="python"]').addEventListener("click",async()=>{
  const btn=q('[data-act="python"]'),runner=window.IJR_RUNNER;
  if(!runner||typeof runner.run!=="function"){
   showPredictionFeedback("Intérprete no disponible. Recarga el sitio para iniciar Python.");return;
  }
  const version=model.revision,source=model.source;
  const expected=model.trace[model.trace.length-1].output.trim().replace(/\r/g,"");
  btn.disabled=true;btn.textContent="Ejecutando Python…";
  showPredictionFeedback("Ejecutando el mismo código fuente en Python 3 del navegador…");
  try{
   const result=await runner.run(source,{timeoutMs:90000});
   if(version!==model.revision)return;
   const actual=String(result.output??"").trim().replace(/\r/g,"");
   if(!result.ok)showPredictionFeedback("Python devolvió un error: "+actual);
   else if(actual!==expected)showPredictionFeedback("DIFERENCIA entre traza y Python: revisa el modelo. Python devolvió: "+actual);
   else showPredictionFeedback("✓ Concordancia verificada: Python ejecutó el código y produjo exactamente la salida de la traza ("+actual.split("\n").length+" línea/s).",true);
  }catch(err){if(version===model.revision)showPredictionFeedback("No se pudo ejecutar Python: "+(err?.message||String(err)));}
  finally{btn.disabled=false;btn.textContent="▶ Ejecutar Python real";}
 });
 q('[data-act="lab"]').addEventListener("click",()=>{
  const editor=document.getElementById("theoryCode");
  if(!editor)return;
  editor.value=model.source;
  editor.dispatchEvent(new Event("input",{bubbles:true}));
  document.getElementById("live")?.scrollIntoView({behavior:reduce.matches?"instant":"smooth",block:"start"});
  editor.focus({preventScroll:true});
 });
 document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();});
 const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pause();},{threshold:0});
 observer.observe(section);
 selectExample("sequence");
 window.IJR_FLOWCHART_STUDIO={
  version:1,examples:examples.map(x=>x.id),
  getState:()=>({example:model.example.id,step:model.index,total:model.trace.length,
   code:model.source,expected:model.trace[model.trace.length-1].output,
   vars:{...model.trace[model.index].vars}}),
  inspectTrace:()=>model.trace.map(step=>({node:step.node,lines:[...step.lines],output:step.output,via:step.via,branch:step.branch}))
 };
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();