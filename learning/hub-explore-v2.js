/* Seminario 2027 · Course catalog finder
 * Accessible filtering without altering grade or progress computations.
 */
(()=>{"use strict";
const grid=document.getElementById("topicGrid");
const input=document.getElementById("topicSearch");
const status=document.getElementById("topicVisibleCount");
const buttons=[...document.querySelectorAll("#hubCategoryList button[data-hub-filter]")];
const empty=document.getElementById("topicEmpty");
if(!grid||!input||!status||buttons.length!==4)return;
const course=window.SEMINAR_2027_COURSE||[];
const core=new Set(["algoritmos","flowcharts","operations","variables","input-output","booleans"]);
const archive=window.SEMINAR_2027_TRACK==="statistics";
let selected="all";
const normalize=text=>String(text??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
const cards=[...grid.querySelectorAll(".topic-card")].map(el=>{
 const topic=course.find(t=>el.id==="topic-"+t.slug);
 const slug=topic?.slug||el.id.replace(/^topic-/,"");
 const category=archive?(slug==="analyst-project"?"project":new Set(["algoritmos","operations","types","arrays","functions"]).has(slug)?"core":"analysis"):(topic?.category||"analysis");
 const tag=document.createElement("span");
 tag.className="hub-kind";tag.textContent=category==="core"?"Programming foundations":category==="analysis"?(archive?"Data science":"Coding techniques"):"Applied project";
 el.querySelector(".topline")?.insertAdjacentElement("afterend",tag);
 el.dataset.hubCategory=category;
 return {el,category,text:normalize([topic?.title,topic?.lead,topic?.nav,slug].join(" "))};
});
function filter(){
 const term=normalize(input.value);
 let visible=0;
 for(const card of cards){
  const show=(selected==="all"||card.category===selected)&&(!term||card.text.includes(term));
  card.el.hidden=!show;if(show)visible++;
 }
 for(const button of buttons)button.setAttribute("aria-pressed",String(button.dataset.hubFilter===selected));
 status.textContent=visible+" / "+cards.length+" topics visible · Interactive theory, animated programming models and 12 exercises per topic";
 empty.hidden=visible!==0;
 grid.setAttribute("aria-label",visible+" course topics available");
}
for(const button of buttons)button.addEventListener("click",()=>{
 selected=button.dataset.hubFilter;filter();
});
input.addEventListener("input",filter);
input.addEventListener("keydown",e=>{if(e.key==="Escape"){input.value="";filter();}});
const trackTitle=document.querySelector(".hub-overview .eyebrow");
if(trackTitle)trackTitle.textContent=archive?"STATISTICS & DATA SCIENCE · ARCHIVED CURRICULUM":"PROGRAMMING · GRADE 10 · PYTHON FOUNDATIONS";
const title=document.querySelector(".hub-overview h1");
if(title)title.textContent=archive?"Statistics and data analysis with Python.":"Learn Python. Build real programs.";
const description=document.querySelector(".hub-overview>div>p:not(.eyebrow)");
if(archive&&description)description.textContent="Legacy Statistics and Data Science sequence: Pandas, distributions, Excel, visualizations and analyst projects. The new default learning path focuses on general Python programming.";
document.querySelectorAll(".track-option").forEach(a=>{
 a.classList.toggle("active",a.dataset.trackOption===(archive?"statistics":"programming"));
 a.setAttribute("aria-current",a.classList.contains("active")?"page":"false");
});
const categoryLabels=document.querySelectorAll('#hubCategoryList button');
if(categoryLabels.length===4){
 categoryLabels[1].textContent=archive?"Programming basics":"Python foundations";
 categoryLabels[2].textContent=archive?"Data science":"Control & structures";
 categoryLabels[3].textContent="Projects";
}
filter();
window.IJR_2027_CATALOG={version:2,topics:cards.length,count:()=>cards.filter(c=>!c.el.hidden).length};
})();