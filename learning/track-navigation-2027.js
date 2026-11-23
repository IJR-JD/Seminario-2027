/* Preserve explicit archive track when browsing theory and workshop. */
(()=>{"use strict";
const archive=window.SEMINAR_2027_TRACK==="statistics";
if(!archive)return;
const add=url=>{
 try{
  if(!url||url[0]==="#"||url.startsWith("mailto:"))return url;
  const u=new URL(url,location.href);
  if(u.origin!==location.origin)return url;
  if(!/(?:^|\/)(?:learning\/)?(?:theory\.html|workshop\.html|index\.html)$/.test(u.pathname)&&!u.pathname.endsWith("/learning/"))return url;
  u.searchParams.set("track","statistics");
  return u.href;
 }catch{return url;}
};
function fix(){
 for(const link of document.querySelectorAll('a[href]')){
  const url=link.getAttribute("href");if(link.dataset.trackFixed||!url)continue;
  const updated=add(url);
  if(updated!==url){link.href=updated;link.dataset.trackFixed="1";}
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fix,{once:true});else fix();
new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true});
})();