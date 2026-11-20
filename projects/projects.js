(()=>{"use strict";
const projects=window.SEMINAR_2027_PROJECTS||[];
const $=id=>document.getElementById(id);
const grid=$("projectCards"),panel=$("projectDetail");
const text=(node,value)=>node.textContent=String(value??"");
function make(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)text(n,txt);return n;}
function list(items){const ul=make("ul");for(const t of items||[])ul.append(make("li",null,t));return ul;}
for(const [i,p] of projects.entries()){
 const card=make("article","project-card");card.append(make("span",null,"TRACK "+String(i+1).padStart(2,"0")+" · "+p.track.toUpperCase()));
 card.append(make("h3",null,p.title),make("p",null,p.summary));
 const bottom=make("div","route-bottom");bottom.append(make("small",null,"4 guided stages"));
 const button=make("a","button button-dark","Explore Project →");button.href="?project="+encodeURIComponent(p.slug);
 bottom.append(button);card.append(bottom);grid.append(card);
}
function render(p){
 panel.hidden=false;$("projectTitle").textContent=p.title;$("projectSummary").textContent=p.summary;
 if(typeof window.IJR_2027_RENDER_CAD==="function") window.IJR_2027_RENDER_CAD(p);
 if(typeof window.IJR_2027_RENDER_GAME_LAB==="function") window.IJR_2027_RENDER_GAME_LAB(p);
 const stages=$("stageCards");stages.replaceChildren();
 p.stages.forEach((s,i)=>{
  const d=make("details","project-stage");if(i===0)d.open=true;
  d.append(make("summary",null,s.title||"Class "+(i+1)));
  const content=make("div","project-stage-content");
  for(const [name,arr] of [["Theory",s.theory],["Build · Workshop",s.build],["Test · QA",s.test]]){
   const part=make("section","project-step");part.append(make("h4",null,name),list(arr));content.append(part);
  }
  const result=make("section","project-stage-footer");
  result.append(make("strong",null,"EVIDENCE · Required output"));
  result.append(make("p",null,s.evidence||"Registro de trabajo y resultados comprobables."));
  result.append(make("strong",null,"ACCEPTANCE GATE"));
  result.append(make("p",null,s.gate||"Entregable revisable."));
  content.append(result);
  if(s.code){
   const box=make("section","project-code"),header=make("div");
   header.append(make("strong",null,"REFERENCE CODE · Rebuild, modify, test"));
   const copy=make("button",null,"Copy code");copy.type="button";
   copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(s.code);copy.textContent="Copied ✓";}catch{copy.textContent="Select the code";}});
   header.append(copy);box.append(header);
   const pre=make("pre");pre.textContent=s.code;box.append(pre);content.append(box);
  }
  d.append(content);stages.append(d);
 });
 const links=$("resourceLinks");links.replaceChildren();
 for(const [name,href] of p.resources||[]){
  if(!/^https:\/\//.test(href))continue;
  const a=make("a",null,name);a.href=href;a.target="_blank";a.rel="noopener noreferrer";links.append(a);
 }
 if(!links.childNodes.length)links.append(make("span",null,"Referencia: guía del docente + Python Sandbox + repositorio propio."));
 panel.scrollIntoView({block:"start",behavior:"instant"});
}
const aliases={"data":"data-analyst","cad":"3d-design"};
const rawSelected=new URLSearchParams(location.search).get("project");
const selected=aliases[rawSelected]||rawSelected;
if(selected){const p=projects.find(x=>x.slug===selected);if(p)render(p);}
})();