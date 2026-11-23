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
const core=new Set(["algoritmos","operations","types","arrays","functions"]);
let selected="all";
const normalize=text=>String(text??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
const cards=[...grid.querySelectorAll(".topic-card")].map(el=>{
 const topic=course.find(t=>el.id==="topic-"+t.slug);
 const slug=topic?.slug||el.id.replace(/^topic-/,"");
 const category=slug==="analyst-project"?"project":core.has(slug)?"core":"analysis";
 const tag=document.createElement("span");
 tag.className="hub-kind";tag.textContent=category==="core"?"Python foundations":category==="analysis"?"Data science":"Applied project";
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
 status.textContent=visible+" / "+cards.length+" topics visible · Interactive theory, scientific models and 12 code exercises per topic";
 empty.hidden=visible!==0;
 grid.setAttribute("aria-label",visible+" course topics available");
}
for(const button of buttons)button.addEventListener("click",()=>{
 selected=button.dataset.hubFilter;filter();
});
input.addEventListener("input",filter);
input.addEventListener("keydown",e=>{if(e.key==="Escape"){input.value="";filter();}});
filter();
window.IJR_2027_CATALOG={version:2,topics:cards.length,count:()=>cards.filter(c=>!c.el.hidden).length};
})();