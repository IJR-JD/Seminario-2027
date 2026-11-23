/* IJR 2027 · Topic-specific scientific visual system
 * Educational vectors correspond to the course concepts; they are not solutions
 * copied into the auto-graded exercises. Original Operations V9 / Arrays V34
 * diagrams remain untouched.
 */
(()=>{"use strict";
const course=window.SEMINAR_2027_COURSE||[];
const req=new URLSearchParams(location.search).get("topic")||"algoritmos";
const slug=req==="variables"?"types":req;
const topic=course.find(t=>t.slug===slug)||course[0];if(!topic)return;
const x=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const T=(a,b,s,size=18,weight=600,anchor="middle",extra="")=>'<text x="'+a+'" y="'+b+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" '+extra+'>'+x(s)+'</text>';
const R=(a,b,w,h,fill="#fff",stroke="#171717",radius=5)=>'<rect x="'+a+'" y="'+b+'" width="'+w+'" height="'+h+'" rx="'+radius+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.5"/>';
const L=(a,b,c,d,dash=false)=>'<path d="M'+a+' '+b+'L'+c+' '+d+'" fill="none" stroke="#171717" stroke-width="2" '+(dash?'stroke-dasharray="6 5"':'')+'/>';
const P=(points,fill="#161616")=>'<polygon points="'+points+'" fill="'+fill+'"/>';
const A=(a,b,c,d)=>L(a,b,c,d)+P((c-9)+','+(d-5)+' '+c+','+d+' '+(c-9)+','+(d+5));
const B=(a,b,w,h,k,v="",accent=false)=>'<g class="sv27-box">'+R(a,b,w,h,accent?"#151515":"#fff")+
 T(a+w/2,b+37,k,18,800,"middle",'fill="'+(accent?"#fff":"#191919")+'"')+
 (v?T(a+w/2,b+65,v,14,500,"middle",'fill="'+(accent?"#ddd":"#626262")+'"'):"")+'</g>';
const frame=(kind,body,note,desc)=>'<div class="sv27-figure" role="img" aria-label="'+x(desc||kind)+'"><svg viewBox="0 0 880 330" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+
 R(1,1,878,328,"#fff","#dfdfdd",0)+
 '<path d="M38 48H842" stroke="#e5e5e3" stroke-width="1"/>'+
 T(40,33,'IJR / 2027  •  '+kind.toUpperCase(),13,800,"start",'fill="#555" letter-spacing="1.2"')+body+
 T(40,310,note,14,500,"start",'fill="#555"')+'</svg></div>';
const flow=(steps,kind,note)=>{const n=steps.length,w=Math.min(210,(786-(n-1)*32)/n),start=48;
 const shapes=steps.map((s,i)=>{let a=start+i*(w+32),name=Array.isArray(s)?s[0]:s,sub=Array.isArray(s)?s[1]:"";return B(a,120,w,90,name,sub,i===n-1)+(i<n-1?A(a+w+4,165,a+w+28,165):"");}).join("");
 return frame(kind,shapes,note,steps.map(s=>Array.isArray(s)?s[0]:s).join(" → "));};
const rows=(headers,values,{highlight=[],width=680,left=100,top=78,colWidths=[]}={})=>{
 const n=headers.length, h=44;let acc=0;const widths=colWidths.length===n?colWidths:Array.from({length:n},()=>width/n);
 let out=R(left,top,width,h*(values.length+1),"#fff","#191919",3);
 headers.forEach((s,i)=>{const start=left+widths.slice(0,i).reduce((a,b)=>a+b,0);out+=R(start,top,widths[i],h,"#171717","#171717",0)+T(start+widths[i]/2,top+28,s,16,700,"middle",'fill="#fff"');});
 values.forEach((row,j)=>{const topY=top+(j+1)*h;if(highlight.includes(j))out+=R(left+1,topY,width-2,h,"#efefed","none",0);
 row.forEach((s,i)=>{const start=left+widths.slice(0,i).reduce((a,b)=>a+b,0);out+=T(start+widths[i]/2,topY+28,s,16,highlight.includes(j)?800:500);});
 out+=L(left,topY,left+width,topY);
 });
 let pos=left;for(let i=0;i<n-1;i++){pos+=widths[i];out+=L(pos,top,pos,top+h*(values.length+1));}
 return out;
};
const dot=(v,min,max,y=200,lo=82,hi=790,color="#171717")=>{
 let px=lo+(v-min)/(max-min)*(hi-lo);return '<circle cx="'+px+'" cy="'+y+'" r="7" fill="'+color+'" stroke="#fff" stroke-width="2"/>';
};
const scale=(min,max,ticks,y=220,lo=82,hi=790)=>{
 let out=L(lo,y,hi,y);for(const n of ticks){const u=lo+(n-min)/(max-min)*(hi-lo);out+=L(u,y-7,u,y+7)+T(u,y+28,String(n),15,500);}return out;};
const lines=(arr,one={})=>arr.map((s,i)=>T(one.x||440,(one.y||110)+i*(one.step||32),s,one.size||18,one.weight||600)).join("");
const bars=(values,names,{top=90,max=100,base=252,left=180,barW=80,gap=70}={})=>{
 let out=L(left-48,base,left+(barW+gap)*values.length,base);
 values.forEach((v,i)=>{const xx=left+i*(barW+gap),height=(base-top)*v/max;out+=R(xx,base-height,barW,height,i===0?"#181818":"#e7e7e5","#171717",0)+T(xx+barW/2,base-height-9,String(v),16,800)+T(xx+barW/2,base+26,names[i],15,600);});
 return out;
};
const scatter=(points,{xLabel="Variable X",yLabel="Variable Y",trend=true,limit=5}={})=>{
 const ox=138,oy=261,xx=n=>ox+n*112,yy=n=>oy-n*36;
 let out=A(ox-13,oy,760,oy)+L(ox,oy,ox,78)+P("130,90 138,75 146,90");
 for(let i=1;i<=limit;i++)out+=T(xx(i),oy+26,String(i),13,500);
 if(trend)out+='<path d="M250 224L700 80" fill="none" stroke="#747474" stroke-dasharray="8 7" stroke-width="2"/>';
 points.forEach(([a,b])=>{out+='<circle cx="'+xx(a)+'" cy="'+yy(b)+'" r="9" fill="#151515" stroke="#fff" stroke-width="2"/>';});
 return out+T(480,307,xLabel,15,700)+T(71,160,yLabel,15,700,"middle",'transform="rotate(-90 71 160)"');
};
const specialized={
 algoritmos:[
 ()=>flow([["ENTRADA","base, altura"],["PROCESO","base × altura"],["SALIDA","área"]],"Modelo entrada · proceso · salida","Cada caja representa una etapa del algoritmo."),
 ()=>frame("Diagrama de flujo",B(370,72,140,70,"INICIO")+L(440,142,440,158)+P("435,150 440,160 445,150")+
 B(345,163,190,70,"CALCULAR","con datos de entrada")+L(440,233,440,249)+P("435,241 440,251 445,241")+B(370,253,140,43,"FIN"),"Un diagrama de flujo debe tener un principio y un final.")
 ],
 types:[
 ()=>frame("Memoria",B(115,125,226,90,"score","variable")+A(360,170,512,170)+B(535,125,226,90,"85","valor almacenado"),"El nombre de la variable permite reutilizar su valor."),
 ()=>frame("Tipos",B(35,126,155,80,"42","int")+B(200,126,155,80,"4.5","float")+B(365,126,155,80,'"10A"',"str")+B(530,126,155,80,"True","bool")+B(695,126,155,80,"None","NoneType"),"Un tipo determina las operaciones válidas."),
 ()=>flow([['"12"','texto'],['int("12")','conversión'],["12 + 3","número"]],"Conversión","La conversión transforma la interpretación del dato.")
 ],
 logic:[
 ()=>flow([["XLSX","Students"],["PANDAS","read_excel"],["DATAFRAME","filas y columnas"],["ANÁLISIS","selección"]],"De Excel a datos","Primero se revisa la estructura; después se analiza."),
 ()=>frame("Tabla de observaciones",rows(["student","score","group","attendance"],[["A","68","10A","0.92"],["B","92","10A","0.97"],["C","81","10B","0.85"]],{highlight:[1],width:740,left:70})+
 T(440,274,"Filas → observaciones     |     Columnas → variables",17,700),"La fila B es una observación; score es una variable."),
 ()=>frame("Máscara booleana",rows(["score","score ≥ 90","selección"],[["68","False","—"],["92","True","B"],["81","False","—"],["96","True","D"]],{highlight:[1,3]}),"Los filtros conservan registros completos.")
 ],
 conditions:[
 ()=>flow([["CSV","estudiantes.csv"],["PANDAS","pd.read_csv"],["INSPECCIÓN","shape · head()"],["VARIABLE","nota"]],"Lectura de CSV","Un archivo CSV contiene registros separados por delimitadores."),
 ()=>frame("Observaciones y variables",rows(["estudiante","grupo","edad","nota"],[["01","10A","16","4.2"],["02","10A","17","3.8"],["03","10A","16","2.9"]],{highlight:[1]})+
 T(440,282,"1 fila = 1 estudiante    |    1 columna = 1 variable",16,700),"Conserva el significado de filas y columnas.")
 ],
 loops:[
 ()=>frame("Tendencia central",scale(2,5,[2,3,4,5])+[2.7,3.2,3.8,3.8,3.8,4.2,4.5].map(v=>dot(v,2,5)).join("")+
 T(440,112,"Media · Mediana · Moda",24,800)+T(440,153,"Los valores permiten comparar medidas centrales.",17,500),"Cada punto es una calificación observada."),
 ()=>frame("Filtro estadístico",rows(["nota","criterio ≥ 3.0","estado"],[["2.7","False","revisar"],["3.2","True","aprobado"],["3.8","True","aprobado"],["4.5","True","aprobado"]],{highlight:[1,2,3]}),"No se altera el conjunto original al seleccionar filas.")
 ],
 functions:[
 ()=>flow([["ENTRADA","a, b"],["FUNCIÓN","add(a,b)"],["RETORNO","a + b"]],"Función reutilizable","Una función evita repetir el mismo procedimiento."),
 ()=>flow([["DEFINIR","def add(...)"],["LLAMAR","add(4,6)"],["EJECUTAR","cuerpo"],["RETORNAR","resultado"]],"Definición y llamada","Definir no ejecuta: la llamada activa la función."),
 ()=>frame("Retornar no es imprimir",B(90,126,300,95,"print(value)","muestra en consola")+B(490,126,300,95,"return value","entrega al programa"),"print informa; return hace reutilizable el resultado.")
 ],
 statistics:[
 ()=>flow([["DATOS","[8,12,10,14,6]"],["TOTAL","50"],["CONTEO","5"],["MEDIA","50 / 5"]],"Resumen de una lista","La media relaciona total de valores y número de observaciones."),
 ()=>frame("Reparto equitativo",bars([8,12,10,14,6],["A","B","C","D","E"],{max:16,left:107,barW:70,gap:83})+
 '<path d="M75 150H830" stroke="#151515" stroke-width="2" stroke-dasharray="7 6"/>'+T(760,136,"MEDIA = 10",17,800),"Redistribuir el total permite visualizar el valor medio."),
 ()=>frame("Rango",scale(0,16,[0,4,6,8,12,14,16])+dot(6,0,16)+dot(14,0,16)+
 L(348,135,702,135)+T(525,121,"RANGO = 14 − 6 = 8",19,800),"El rango mide la distancia entre mínimo y máximo."),
 ()=>flow([["MEDIA","sum / len"],["RECORRER","for value"],["COMPARAR","value > mean"],["CONTAR","n + 1"]],"Contar sobre la media","Un contador se actualiza solo cuando se cumple el criterio.")
 ],
 descriptive:[
 ()=>frame("Centro",scale(0,32,[0,5,10,15,20,25,30])+[2,4,6,8,30].map(v=>dot(v,0,32)).join("")+
 T(440,93,"Datos: 2, 4, 6, 8, 30",22,800)+
 T(310,153,"mediana = 6",18,700)+T(578,153,"media = 10",18,700),"Un valor extremo separa la media de la mediana."),
 ()=>frame("Dispersión",bars([4,6,8],["A₁","A₂","A₃"],{max:12,left:130,barW:60,gap:46})+
 bars([2,6,10],["B₁","B₂","B₃"],{max:12,left:510,barW:60,gap:46})+
 T(290,83,"GRUPO A · promedio 6",17,800)+T(670,83,"GRUPO B · promedio 6",17,800),"La misma media no implica la misma variabilidad.")
 ],
 "position-outliers":[
 ()=>frame("Diagrama de caja",scale(0,32,[0,4,8,12,16,20,24,28,32],238,100,790)+
 L(143,184,186,184)+L(143,168,143,200)+R(186,147,86,74,"#eeeeec","#151515",0)+L(229,147,229,221)+
 L(402,91,402,236,true)+'<circle cx="747" cy="184" r="10" fill="#151515"/>'+
 T(146,122,"Q1 = 4",16,800)+T(229,87,"Q2 = 6",16,800)+T(310,122,"Q3 = 8",16,800)+L(164,127,186,145)+L(294,127,272,145)+T(428,102,"límite = 14",15,700)+T(746,163,"30 · atípico",16,800),
 "Q1 = 4 · Q3 = 8 · IQR = 4 · límite superior = 14."),
 ()=>frame("Percentil",scale(0,50,[0,10,20,30,40,50],230,100,790)+
 [10,20,30,40,50].map(v=>dot(v,0,50,230,100,790)).join("")+
 '<path d="M735 132V225" stroke="#181818" stroke-width="2" stroke-dasharray="5 5"/>'+
 T(670,111,"P90 = 46",21,800)+T(440,77,"Interpolación lineal entre 40 y 50",18,600),
 "La posición del percentil depende del método de interpolación.")
 ],
 "pandas-dataframes":[
 ()=>frame("DataFrame",rows(["student","score","passed"],[["A","70","True"],["B","80","True"],["C","90","True"]],{width:710,left:85,highlight:[1]})+
 T(440,279,"df.shape = (3, 3)",18,800),"Una tabla etiquetada tiene filas y columnas."),
 ()=>flow([["CSV","texto estructurado"],["READ","pd.read_csv"],["DATAFRAME","filas y columnas"],["EXPLORE","df.head()"]],"Lectura reproducible","Inspecciona la tabla antes de calcular estadísticas.")
 ],
 "data-cleaning":[
 ()=>frame("Valores faltantes",rows(["registro","score · original","score · limpio"],[["A","70","70"],["B","None","80"],["C","90","90"]],{highlight:[1]})+
 T(440,278,"Imputación ilustrativa: media de 70 y 90 = 80",17,800),"Una imputación debe justificarse y documentarse."),
 ()=>frame("Duplicados",B(66,132,280,90,"[1, 2, 2, 3]","4 registros")+A(362,177,512,177)+B(540,132,280,90,"[1, 2, 3]","3 valores únicos"),"Eliminar una fila requiere confirmar que realmente está duplicada.")
 ],
 "filter-transform":[
 ()=>frame("Filtrar con máscara",rows(["score","score ≥ 80","conservar"],[["70","False","no"],["85","True","sí"],["90","True","sí"]],{highlight:[1,2]})+
 T(440,279,"df.loc[mask] conserva las filas completas",17,800),"Una condición genera una máscara booleana."),
 ()=>frame("Ordenar y derivar",rows(["score original","orden descendente","score / 100"],[["70","90","0.90"],["90","80","0.80"],["80","70","0.70"]])+
 T(440,279,"Ordenar filas y crear columnas son operaciones distintas.",16,700),"La columna derivada mantiene coherencia con cada fila.")
 ],
 "group-aggregate":[
 ()=>frame("Agrupación",bars([80,70],["A","B"],{max:100,left:290,barW:125,gap:140})+
 T(440,78,"Media de score por grupo",22,800)+T(440,307,"A: (70 + 90) / 2   ·   B: (60 + 80) / 2",15,700),
 "groupby('group')['score'].mean() calcula una media por categoría."),
 ()=>frame("Frecuencias",rows(["group","score · 1","score · 2","count"],[["A","70","90","2"],["B","60","80","2"]],{highlight:[0],width:730,left:75})+
 T(440,278,"Tamaño de cada grupo: n(A) = 2 · n(B) = 2",18,800),"Las frecuencias ayudan a contextualizar las comparaciones.")
 ],
 visualization:[
 ()=>frame("Elegir el gráfico",B(50,120,235,94,"HISTOGRAMA","distribución")+B(320,120,235,94,"BARRAS","categorías")+B(590,120,235,94,"DISPERSIÓN","dos variables"),
 "La elección del gráfico depende del tipo de dato y la pregunta."),
 ()=>frame("Relación entre variables",scatter([[1,1],[2,2],[3,3],[4,4],[5,5]],{xLabel:"Horas de estudio",yLabel:"Score",trend:true})+
 T(570,83,"Tendencia creciente",17,800),"La gráfica revela asociación, no demuestra causalidad.")
 ],
 "analyst-project":[
 ()=>flow([["PREGUNTA","objetivo"],["DATOS","cargar · validar"],["ANÁLISIS","resumir"],["COMUNICAR","interpretar"]],"Flujo del proyecto","Cada resultado debe poder reproducirse y explicarse."),
 ()=>frame("Evidencia y límites",scatter([[1,1],[2,2],[3,3],[4,4],[5,5]],{xLabel:"Horas de estudio",yLabel:"Score",trend:true})+
 T(606,82,"r > 0",20,800),
 "Una tendencia observable requiere contexto y limitaciones.")
 ]
};
const specialStage={
 operations:()=>flow([["VALORES","variables"],["EXPRESIÓN","operadores"],["SALIDA","print()"]],"Modelo de operaciones","Primero ejecuta, luego interpreta la salida."),
 arrays:()=>frame("Índices de una lista",rows(["índice","0","1","2","3"],[["valor","6","10","15","21"]],{width:750,left:65})+
 T(440,260,"values[index] → una observación",19,700),"Los índices comienzan en cero.")
};
const valid=()=>Object.keys(specialized);
function renderFigure(factory,label){
 try{const html=factory();return html.includes('sv27-figure')?html.replace('class="sv27-figure"','class="sv27-figure" data-motion-id="'+x(label)+'"'):'';}
 catch(error){console.error('Seminario 2027 diagram failed',label,error);return '';}
}
function upgradeTheory(){
 if(slug==="operations"||slug==="arrays")return;
 const cards=[...document.querySelectorAll("#diagramGrid .diagram-card-v2")];
 const factories=specialized[slug]||[];
 factories.forEach((factory,i)=>{
  const card=cards[i];if(!card)return;
  const stage=card.querySelector(".diagram-stage");if(!stage)return;
  const visual=renderFigure(factory,slug+"/"+i);
  if(!visual)return;
  stage.classList.add("sv27-stage");
  stage.innerHTML=visual;
  stage.dataset.visualKind=slug;
 });
}
function insertWorkshopVisual(){
 const prompt=document.getElementById("problemPrompt");
 if(!prompt)return;
 const panel=document.createElement("section");panel.className="sv27-workshop-panel";
 panel.setAttribute("aria-label","Modelo visual de apoyo al taller");
 panel.innerHTML='<div class="sv27-workshop-heading"><span>VISUAL MODEL · '+x(topic.order+1).padStart(2,"0")+'</span><strong>Concepto vinculado al ejercicio</strong><small>Diagrama orientador, no solución del reto</small></div><div class="sv27-workshop-body"></div><div class="sv27-workshop-footer">Usa este modelo para identificar entradas, operaciones y criterios de verificación.</div>';
 const problem=document.querySelector(".problem-panel");
 const guide=problem?.querySelector(".guide-panel");
 if(!problem||!guide)return;
 problem.insertBefore(panel,guide);
 const badge=document.getElementById("stageBadge"),body=panel.querySelector(".sv27-workshop-body");
 body.tabIndex=0;body.setAttribute("role","region");body.setAttribute("aria-label","Diagrama del ejercicio: desplázate horizontalmente si es necesario");
 let latest=-1;
 const draw=()=>{
  const match=badge?.textContent.match(/STAGE\s+(\d+)/);
  const index=match?Math.max(0,Number(match[1])-1):0;
  if(index===latest)return;
  latest=index;
  const f=specialized[slug]||[];
  const factory=specialStage[slug]||(f.length?f[Math.floor(index/Math.ceil(12/f.length))%f.length]:null);
  const html=factory?renderFigure(factory,slug+"/stage-"+index):'';
  body.innerHTML=html;
  const total=12;
  panel.querySelector(".sv27-workshop-footer").textContent=
   "ETAPA "+String(index+1).padStart(2,"0")+" / "+total+" · La figura es una guía, no la solución. ↔ En móvil, desliza para verla completa.";
 };
 if(badge)new MutationObserver(draw).observe(badge,{childList:true,subtree:true,characterData:true});
 draw();
}
function run(){
 upgradeTheory();
 insertWorkshopVisual();
 document.documentElement.classList.add("sv27-visual-system");
 window.IJR_2027_VISUAL_COVERAGE={topic:slug,diagramsExpected:topic.diagrams?.length||0,diagramsEnhanced:(specialized[slug]||[]).length,workshopPanel:!!document.querySelector(".sv27-workshop-panel"),originalAsset:slug==="operations"?"operations-v9":slug==="arrays"?"arrays-v34":null};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();