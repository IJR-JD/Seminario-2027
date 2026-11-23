/* Real responsive audit for the default Seminario 2027 programming curriculum.
 * 17 topics x 5 screen sizes, screenshots plus overflow and figure checks.
 */
import {chromium} from 'playwright';
import fs from 'node:fs';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
const slugs=['algoritmos','flowcharts','operations','variables','input-output','booleans',
 'conditionals','for-loops','while-loops','nested-loops','functions','arrays',
 'strings','dictionaries','modularity','debugging','project'];
const sizes=[{name:'desktop',w:1440,h:900},{name:'laptop',w:1024,h:800},
 {name:'tablet',w:768,h:1024},{name:'mobile',w:390,h:844},{name:'compact',w:320,h:720}];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const dir='qa-programming-visual';fs.mkdirSync(dir,{recursive:true});
const findings=[],issues=[];
try{
 for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.w,height:size.h},reducedMotion:'reduce'});
  page.on('pageerror',e=>issues.push('JS '+size.name+': '+String(e.message||e)));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',route=>
   route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={};'}));
  await page.goto(base+'/learning/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.topic-card').length===17);
  let hub=await page.evaluate(()=>({vw:innerWidth,sw:document.documentElement.scrollWidth}));
  if(hub.sw>hub.vw+3)issues.push('HUB_OVERFLOW '+size.name+' '+hub.sw+'/'+hub.vw);
  if(size.name==='desktop'||size.name==='mobile'){
   await page.locator('.hub-overview').screenshot({path:dir+'/programming-hub-'+size.name+'.png'});
   await page.locator('.topic-card').first().screenshot({path:dir+'/programming-card-'+size.name+'.png'});
  }
  for(const slug of slugs){
   await page.goto(base+'/learning/theory.html?topic='+slug,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelectorAll('#stageList .stage').length===12);
   await page.waitForFunction(()=>document.querySelectorAll('#diagramGrid .pc27-figure').length===
     document.querySelectorAll('#diagramGrid .diagram-card-v2').length);
   // The first Algorithms/Flowchart stages are multiple-choice, inspect a code stage for editor geometry.
   if(slug==='algoritmos'||slug==='flowcharts'){
    await page.locator('#stageList .stage').nth(6).click();
    await page.locator('#codeEditor').waitFor({state:'visible'});
   }
   const x=await page.evaluate(()=>{
    const editor=document.querySelector('#codeEditor');
    const fig=[...document.querySelectorAll('#diagramGrid .pc27-figure')];
    const fsizes=[...document.querySelectorAll('.concept-card-v2 p,.diagram-card-head p,.problem-panel>p,.code-editor')]
     .map(n=>parseFloat(getComputedStyle(n).fontSize));
    return {vw:innerWidth,sw:document.documentElement.scrollWidth,figures:fig.length,
     animated:fig.filter(n=>n.dataset.motionStep==='1').length,
     editorWidth:Math.round(editor.getBoundingClientRect().width),
     editorHeight:Math.round(editor.getBoundingClientRect().height),
     tiny:fsizes.filter(x=>x<12).length,
     panel:document.querySelectorAll('.pc27-workshop-panel').length,
     dock:document.querySelectorAll('.pc27-workshop-panel .sv28-dock').length,
     figScroll:[...document.querySelectorAll('#diagramGrid .pc27-stage')]
      .filter(el=>el.scrollWidth>el.clientWidth+6).length};
   });
   findings.push({size:size.name,slug,...x});
   if(x.sw>x.vw+3)issues.push('OVERFLOW '+size.name+' '+slug+' '+x.sw+'/'+x.vw);
   if(x.figures<2||x.animated!==x.figures)issues.push('FIGURES '+size.name+' '+slug);
   if(x.editorWidth<220)issues.push('EDITOR_NARROW '+size.name+' '+slug+' '+x.editorWidth);
   if(size.w>=768&&x.editorWidth<360)issues.push('EDITOR_TOO_SMALL '+size.name+' '+slug);
   if(x.panel!==1||x.dock!==1)issues.push('PRACTICE_VISUAL '+size.name+' '+slug);
   if(x.tiny>0)issues.push('SMALL_TEXT '+size.name+' '+slug+' '+x.tiny);
   if((size.name==='desktop'||size.name==='mobile')&&
      ['flowcharts','conditionals','for-loops','while-loops','nested-loops','functions'].includes(slug)){
    await page.locator('#diagramGrid .diagram-card-v2').first().screenshot({
     path:dir+'/'+slug+'-'+size.name+'-figure.png'
    });
   }
   console.log('PROGRAMMING_VISUAL',JSON.stringify({size:size.name,slug,overflow:x.sw>x.vw+3,
    editor:x.editorWidth,figures:x.figures,insideScroll:x.figScroll}));
  }
  await page.close();
 }
 fs.writeFileSync(dir+'/audit.json',JSON.stringify({cases:findings.length,findings,issues},null,2));
 console.log('PROGRAMMING_VISUAL_AUDIT',JSON.stringify({cases:findings.length,issues,count:issues.length}));
 if(issues.length)process.exitCode=1;
}finally{await browser.close();}
