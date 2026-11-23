(()=>{"use strict";
const course=window.SEMINAR_2027_COURSE||[];
const params=new URLSearchParams(location.search);const aliases={variables:"types"};
const requested=aliases[params.get("topic")]||params.get("topic")||"algoritmos";
const idx=Math.max(0,course.findIndex(t=>t.slug===requested));
const topic=course[idx];if(!topic){document.querySelector("main").textContent="No se pudo cargar el programa.";return;}
if(topic.slug==="operations")document.body.classList.add("source-operations-parity");
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function set(id,v){if($(id))$(id).textContent=String(v??"")}
const home="./",goWorkshop="#practice";
document.title="Theory · "+topic.title+" · Seminario 2027";
set("crumb",topic.title);set("theoryEyebrow","THEORY · TOPIC "+String(topic.order).padStart(2,"0")+" · PROGRAMMING 2027");
set("theoryTitle",topic.title);set("theoryIntro",topic.lead);set("theoryDefinition",topic.definition);
set("theoryNumber",String(idx+1).padStart(2,"0")+" / 17");
set("theoryDuration",topic.sections.length+" concepts · "+topic.diagrams.length+" diagrams");
set("theoryStatus","12 guided problems follow the theory");
set("workshopIntro",topic.workshopIntro||"Aplica lo aprendido en 12 problemas desde una celda vacía.");
["theoryWorkshopLink","workshopHeader"].forEach(id=>{if($(id))$(id).href=goWorkshop;});
$("theoryProgress").style.width=Math.round((idx+1)*100/course.length)+"%";
if(topic.slug==="operations"&&Array.isArray(topic.resources)&&topic.resources.length){
 const resourceSection=document.createElement("section");
 resourceSection.className="source-operations-resources theory-section-v2";
 resourceSection.id="sourceOperationsResources";
 resourceSection.innerHTML='<div class="section-heading-v2"><p class="eyebrow">OFFICIAL RESOURCES</p><h2>Use the real tools and documentation.</h2><p>These links point to the official Python and Google Colab resources. The logos are used only to identify the corresponding technology.</p></div>';
 const resourceGrid=document.createElement("div");
 resourceGrid.className="source-resource-grid";
 topic.resources.forEach(resource=>{
  const card=document.createElement("a");card.className="source-resource-card";
  card.href=resource.url;card.target="_blank";card.rel="noopener noreferrer";
  const logo=document.createElement("img");logo.src=resource.logo;logo.alt=resource.name+" logo";logo.loading="lazy";
  const details=document.createElement("div");const title=document.createElement("strong");title.textContent=resource.name;
  const kind=document.createElement("span");kind.textContent=resource.kind;
  const url=document.createElement("small");url.textContent=resource.url.replace("https://","").replace("http://","");
  details.append(title,kind,url);const arrow=document.createElement("b");arrow.textContent="↗";
  card.append(logo,details,arrow);resourceGrid.append(card);
 });
 resourceSection.append(resourceGrid);
 const foundation=$("foundation");foundation.parentNode.insertBefore(resourceSection,foundation);
 const visualHead=$("visuals")?.querySelector(".section-heading-v2");
 if(visualHead){const h=visualHead.querySelector("h2"),p=visualHead.querySelector("p:last-child");if(h)h.textContent="Diagrams that explain the model";if(p)p.textContent="Each diagram represents one mental model. Read the description first, then follow the animated figure.";}
 const syntaxHead=$("reference")?.querySelector(".section-heading-v2 h2");
 if(syntaxHead)syntaxHead.textContent="Read the notation as a vocabulary, not as an answer key.";
}
const concepts=$("conceptGrid");
(topic.sections||[]).forEach((part,i)=>{
 const node=document.createElement("article");node.className="concept-card-v2";
 node.innerHTML='<span>'+String(i+1).padStart(2,"0")+' / '+String(topic.sections.length).padStart(2,"0")+'</span>'+
 '<h3>'+esc(part.title)+'</h3><p>'+esc(part.body)+'</p>'+
 (part.example?'<div class="concept-example-v2"><strong>Example · </strong>'+esc(part.example)+'</div>':"");
 concepts.appendChild(node);
});
(topic.goals||[]).forEach(goal=>{const li=document.createElement("li");li.textContent=goal;$("goalList").appendChild(li);});
  function diagramVisual(type){
    const flow=(items,cls='diagram-flow')=>`<div class="${cls}">${items.map((item,i)=>`${i?'<i></i>':''}<span>${item}</span>`).join('')}</div>`;
    const cells=(items)=>`<div class="diagram-cells">${items.map((item,i)=>`<div><strong>${item}</strong><small>${i}</small></div>`).join('')}</div>`;
    const tree=(q,a,b)=>`<div class="diagram-tree"><strong>${q}</strong><div class="tree-branches"><span>${a}</span><span>${b}</span></div></div>`;
    switch(type){
      case 'python-colab': return `<div class="brand-flow"><div class="brand-node"><img src="https://www.python.org/static/community_logos/python-logo-only.png" alt="Python logo"><strong>PYTHON</strong><small>language</small></div><i></i><div class="brand-node colab-node"><img src="https://colab.research.google.com/img/colab_favicon_256px.png" alt="Google Colab logo"><strong>COLAB</strong><small>notebook environment</small></div><i></i><div class="brand-node"><span class="runtime-dot">●</span><strong>RUNTIME</strong><small>executes instructions</small></div></div>`;
      case 'calculator-notebook': return `<div class="compare-visual"><div class="calc-mini"><div class="calc-screen">25</div><div class="calc-pad">7 8 9<br>4 5 6<br>1 2 3</div><strong>ONE ANSWER</strong></div><div class="versus">VS</div><div class="notebook-mini"><div class="mini-cell"><b>▶</b><span>values → process</span></div><div class="mini-output">output + reusable steps</div><strong>REPEATABLE PROCESS</strong></div></div>`;
      case 'colab-anatomy': return `<div class="colab-wireframe"><div class="wire-title">Notebook title <span>Runtime ●</span></div><div class="wire-toolbar">File · Edit · Runtime · Help</div><div class="wire-text">TEXT CELL · explanation / notes</div><div class="wire-code"><b>▶</b><div><span>CODE CELL</span><i></i><i></i><i></i></div></div><div class="wire-output">OUTPUT / ERROR FEEDBACK</div></div>`;
      case 'execution-cycle': return `<div class="cycle-visual"><span>WRITE</span><i></i><span>RUN</span><i></i><span>READ</span><i></i><span>CORRECT</span><b>↺</b></div>`;
      case 'operator-map': return `<div class="operator-map">${[['=','assign'],['+','add'],['-','subtract'],['*','multiply'],['/','divide'],['**','power'],['%','remainder']].map(([op,label])=>`<div><strong>${op}</strong><span>${label}</span></div>`).join('')}</div>`;
      case 'top-down': return `<div class="topdown-visual"><div><span>1</span><b>create a</b></div><div><span>2</span><b>create b</b></div><div><span>3</span><b>use a + b</b></div><div><span>4</span><b>display result</b></div><i></i></div>`;
      case 'error-feedback': return `<div class="error-visual"><div class="error-code">CODE</div><i></i><div class="error-box"><strong>SyntaxError</strong><span>read the message</span></div><i></i><div class="error-fix">CONTROLLED FIX</div></div>`;
      case 'stats-bridge': return flow(['one value','variables','lists','logic','loops','functions','statistics'],'bridge-flow');
      case 'variable-memory': return `<div class="memory-visual"><div><strong>score</strong><span>name</span></div><i></i><div class="memory-box"><strong>85</strong><span>stored value</span></div></div>`;
      case 'type-cards': return `<div class="type-grid"><div><b>42</b><span>int</span></div><div><b>4.5</b><span>float</span></div><div><b>"10A"</b><span>str</span></div><div><b>True</b><span>bool</span></div><div><b>None</b><span>NoneType</span></div></div>`;
      case 'conversion-flow': return flow(['"12" · str','int(...)','12 · int','+ 3','15']);
      case 'array-index': return cells(['8','13','21','34']);
      case 'array-growth': return `<div class="array-growth">${cells(['6','12'])}<span>append(18)</span>${cells(['6','12','18'])}</div>`;
      case 'array-summary': return `<div class="summary-fan"><div class="source-list">[5, 10, 15, 20]</div><div class="fan-lines"><span>len</span><span>sum</span><span>min</span><span>max</span><span>mean</span></div></div>`;
      case 'comparison-bool': return flow(['score = 85','score ≥ 70 ?','True']);
      case 'logic-gates': return `<div class="logic-grid"><div><strong>AND</strong><span>T + T → T</span></div><div><strong>OR</strong><span>T + F → T</span></div><div><strong>NOT</strong><span>T → F</span></div></div>`;
      case 'logic-rule': return flow(['score ≥ 70','AND','attendance ≥ .80','→ eligible']);
      case 'decision-tree': return tree('score ≥ 70 ?','True → PASS','False → REVIEW');
      case 'branch-order': return flow(['if','elif','else']);
      case 'indentation': return `<div class="indent-visual"><code>if condition:</code><code class="indent-line">action 1</code><code class="indent-line">action 2</code><code>next statement</code></div>`;
      case 'loop-cycle': return `<div class="loop-visual"><div class="loop-list">[3, 6, 9]</div><i></i><div class="loop-body">value → action</div><b>↺ next item</b></div>`;
      case 'accumulator': return flow(['total = 0','+ 2','+ 4','+ 6','+ 8','20']);
      case 'counter': return flow(['value','condition ?','count + 1','next value']);
      case 'function-machine': return `<div class="function-machine"><span>INPUT</span><i></i><div><strong>FUNCTION</strong><small>named process</small></div><i></i><span>OUTPUT</span></div>`;
      case 'define-call': return flow(['def average(...)','stored process','average(values)','execution']);
      case 'return-print': return `<div class="return-visual"><div><strong>print</strong><span>show it now</span></div><div><strong>return</strong><span>send it back for reuse</span></div></div>`;
      case 'stats-pipeline': return `<div class="summary-fan"><div class="source-list">DATASET</div><div class="fan-lines"><span>count</span><span>total</span><span>mean</span><span>min/max</span><span>range</span></div></div>`;
      case 'mean-balance': return `<div class="mean-visual"><span>8</span><span>12</span><span>10</span><span>14</span><span>6</span><i></i><strong>equal share = 10</strong></div>`;
      case 'range-span': return `<div class="range-visual"><span>min 6</span><i></i><b>range = 8</b><i></i><span>max 14</span></div>`;
      case 'above-mean': return flow(['calculate mean','visit value','value > mean ?','count','repeat']);
      default: return flow(['concept','process','result']);
    }
  }

function visual(type){
if(type==="input-process-output")return diagramVisual("execution-cycle").replace("WRITE","ENTRADA").replace("RUN","PROCESO").replace("READ","SALIDA").replace("CORRECT","COMPROBAR");
if(type==="flowchart")return '<div class="diagram-tree"><strong>INICIO</strong><div class="tree-branches"><span>LEER datos → CALCULAR → MOSTRAR</span><span>FIN</span></div></div>';
return diagramVisual(type);
}
(topic.diagrams||[]).forEach((d,i)=>{const card=document.createElement("article");card.className="diagram-card-v2";card.innerHTML=
'<div class="diagram-card-head"><span>'+String(i+1).padStart(2,"0")+'</span><div><h3>'+esc(d.title)+'</h3><p>'+esc(d.description)+'</p></div></div>'+
'<div class="diagram-stage">'+visual(d.type)+'</div>';$("diagramGrid").appendChild(card);});
(topic.syntax||[]).forEach(([label,code])=>{
 const card=document.createElement("article");card.className="syntax-card-v2";
 const cap=document.createElement("span");cap.textContent=label;
 const sample=document.createElement("code");sample.textContent=code;
 const copy=document.createElement("button");copy.type="button";copy.textContent="Copy code";
 copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(code);copy.textContent="Copied ✓";}catch{copy.textContent="Select text to copy";}});
 card.append(cap,sample,copy);$("syntaxGrid").appendChild(card);
});
(topic.pitfalls||[]).forEach((p,i)=>{const card=document.createElement("article");card.className="pitfall-card-v2";const n=document.createElement("strong");n.textContent=String(i+1).padStart(2,"0");const x=document.createElement("p");x.textContent=p;card.append(n,x);$("pitfallGrid").appendChild(card);});
const snippets={
 algoritmos:'precio = 4500\ncantidad = 3\ntotal = precio * cantidad\nprint(total)',
 operations:'a = 17\nb = 8\nresultado = a + b\nprint(resultado)',
 types:'edad = 16\nnombre = "Ana"\nprint(type(edad).__name__)\nprint(nombre)',
 arrays:'valores = [6, 10, 15, 21]\nprint(valores[2])\nprint(sum(valores))',
 logic:'import math\nprint(math.sqrt(81))',
 conditions:'import pandas as pd\ndf = pd.read_csv("estudiantes.csv")\nprint(df.shape)\nprint(df.columns.tolist())',
 loops:'import pandas as pd\ndf = pd.read_csv("estudiantes.csv")\nprint(round(df["nota"].mean(),2))',
 functions:'def add(a,b):\n    return a+b\nprint(add(4,6))',
 statistics:'valores=[8,12,10,14,6]\nprint(sum(valores)/len(valores))',
 descriptive:'import statistics\nprint(statistics.median([2,4,8,10,12]))',
 "position-outliers":'import numpy as np\nprint(np.percentile([2,4,6,8,10],25))',
 "pandas-dataframes":'import pandas as pd\ndf=pd.DataFrame({"name":["A","B"],"score":[70,90]})\nprint(df.shape)',
 "data-cleaning":'import pandas as pd\ns=pd.Series([70,None,90])\nprint(s.isna().sum())',
 "filter-transform":'import pandas as pd\ndf=pd.DataFrame({"score":[70,85,90]})\nprint(len(df[df["score"]>=80]))',
 "group-aggregate":'import pandas as pd\ns=pd.Series(["A","A","B"])\nprint(s.value_counts().to_dict())',
 visualization:'import matplotlib.pyplot as plt\nfig,ax=plt.subplots()\nax.bar(["A","B"],[2,4])\nprint(len(ax.patches))\nplt.close(fig)',
 "analyst-project":'import pandas as pd\nfrom io import StringIO\ndf=pd.read_csv(StringIO("group,score\\nA,70\\nB,80"))\nprint(df.shape)'
};
const code=$("theoryCode");const original=snippets[topic.slug]||"print('Hello Python')";
code.value=original;set("labPurpose",topic.definition);
function renderRunFiles(containerId,files){
 const target=$(containerId);if(!target)return;
 target.replaceChildren();target.hidden=!Array.isArray(files)||files.length===0;
 if(target.hidden)return;
 const title=document.createElement("span");title.textContent="Generated files:";target.appendChild(title);
 files.forEach(name=>{
  const btn=document.createElement("button");btn.type="button";btn.textContent="Download "+name;
  btn.addEventListener("click",async()=>{
   btn.disabled=true;
   try{await window.IJR_RUNNER.downloadFile(name);}catch(error){btn.textContent="Error: "+(error.message||String(error));}
   finally{btn.disabled=false;}
  });target.appendChild(btn);
 });
}
const output=$("labOutput"),status=$("runtimeStatus"),run=$("theoryRun");
$("theoryReset").addEventListener("click",()=>{code.value=original;output.textContent="Pulsa Run para ejecutar.";renderRunFiles("theoryDownloads",[]);});
run.addEventListener("click",async()=>{
 if(!window.IJR_RUNNER){output.textContent="No está disponible el ejecutor de Python.";return;}
 run.disabled=true;status.textContent=" · Loading Python…";output.textContent="Running…";renderRunFiles("theoryDownloads",[]);
 try{const result=await window.IJR_RUNNER.run(code.value);
 output.textContent=result.output||"(No print output)";status.textContent=" · "+(result.ok?"Executed":"Python error");renderRunFiles("theoryDownloads",result.ok?result.files:[]);
 }catch(e){output.textContent=e.message||String(e);status.textContent=" · Runtime unavailable";}
 finally{run.disabled=false;}
});
const prev=course[idx-1],next=course[idx+1];
if(prev)$("previousTopic").href="theory.html?topic="+encodeURIComponent(prev.slug);else $("previousTopic").style.visibility="hidden";
if(next)$("nextTopic").href="theory.html?topic="+encodeURIComponent(next.slug);else $("nextTopic").style.visibility="hidden";
})();