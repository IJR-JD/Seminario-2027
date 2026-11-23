/* 2027 UX QA: measurable responsive geometry, text legibility, editor, figures, and screenshots.
 * Captures synthetic demo pages only. No accounts or academic records.
 */
import {chromium} from 'playwright';
import fs from 'node:fs';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
const topics=['operations','arrays','logic','descriptive','analyst-project'];
const sizes=[{name:'desktop',width:1440,height:900},{name:'laptop',width:1024,height:800},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844},{name:'compact',width:320,height:720}];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report=[];const screenshotsDir='qa-visual';fs.mkdirSync(screenshotsDir,{recursive:true});
const problems=[];
try{
 for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,reducedMotion:'reduce'});
  page.on('pageerror',e=>problems.push('JS '+size.name+': '+e.message));
  await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={};'}));
  for(const topic of topics){
   await page.goto(base+'/learning/theory.html?topic='+topic,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>document.querySelectorAll('#stageList .stage').length===12,{timeout:15000});
   if(topic==='operations')await page.waitForFunction(()=>document.querySelectorAll('#diagramGrid .v9-stage').length===8,{timeout:10000});
   if(topic==='arrays')await page.waitForFunction(()=>document.querySelectorAll('#diagramGrid .arr34-figure').length===6,{timeout:10000});
   const m=await page.evaluate(()=>{
    const rect=(selector)=>{let e=document.querySelector(selector);if(!e)return null;let b=e.getBoundingClientRect(),s=getComputedStyle(e);return {width:Math.round(b.width),height:Math.round(b.height),font:parseFloat(s.fontSize),scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,overflow:e.scrollWidth>e.clientWidth+4}};
    const figures=[...document.querySelectorAll('#diagramGrid .diagram-stage')].map((e,i)=>({index:i+1,visibleWidth:e.clientWidth,contentWidth:e.scrollWidth,scrollOverflow:e.scrollWidth>e.clientWidth+5}));
    const buttons=[...document.querySelectorAll('.integrated-practice button,.top-actions .button')].filter(x=>getComputedStyle(x).display!=='none').map(e=>({name:e.id||e.textContent.trim().slice(0,25),height:Math.round(e.getBoundingClientRect().height),width:Math.round(e.getBoundingClientRect().width)}));
    const allText=[...document.querySelectorAll('.concept-card-v2 p,.diagram-card-head p,.problem-panel>p,.code-editor,.stage')].map(e=>({tag:e.className,font:parseFloat(getComputedStyle(e).fontSize)}));
    const h=document.documentElement;
    return {vw:innerWidth,documentWidth:h.scrollWidth,pageHorizontalOverflow:h.scrollWidth>innerWidth+3,topbar:rect('.topbar'),hero:rect('.theory-hero-v2'),figureCard:rect('.diagram-card-v2'),figures,workshop:rect('.integrated-practice .notebook-shell'),sidebar:rect('.integrated-practice .stage-sidebar'),editor:rect('#codeEditor'),theoryEditor:rect('#theoryCode'),output:rect('#outputText'),buttonMinHeight:Math.min(...buttons.map(b=>b.height)),buttonShort:buttons.filter(b=>b.height<36),smallText:allText.filter(t=>t.font<12).slice(0,8),smallCount:allText.filter(t=>t.font<12).length,visual:document.querySelector('#theoryTitle')?.textContent};
   });
   const row={size:size.name,topic,...m};
   report.push(row);
   console.log('VISUAL',JSON.stringify({size:size.name,topic,doc:m.documentWidth,vw:m.vw,pageOverflow:m.pageHorizontalOverflow,topbarH:m.topbar?.height,heroW:m.hero?.width,stageH:m.editor?.height,figureScroll:m.figures.filter(x=>x.scrollOverflow).map(x=>x.index),workshopW:m.workshop?.width,sidebarW:m.sidebar?.width,buttonsShort:m.buttonShort.map(x=>x.name),tinyText:m.smallCount}));
   if(m.pageHorizontalOverflow)problems.push('PAGE_OVERFLOW '+size.name+' '+topic+' '+m.documentWidth+'/'+size.width);
   if(m.editor?.width<220)problems.push('EDITOR_TOO_NARROW '+size.name+' '+topic+' '+m.editor.width);
   if(size.width>=768&&m.editor?.width<360)problems.push('EDITOR_DESKTOP_TOO_NARROW '+size.name+' '+topic);
   if(size.name==='desktop'&&topic==='operations'){
    await page.locator('#visuals').scrollIntoViewIfNeeded();
    await page.locator('#diagramGrid .diagram-card-v2').first().screenshot({path:screenshotsDir+'/operations-desktop-first-figure.png'});
    await page.locator('#practice').scrollIntoViewIfNeeded();
    await page.locator('.integrated-practice .editor-cell').screenshot({path:screenshotsDir+'/operations-desktop-editor.png'});
   }
   if(size.name==='mobile'&&['operations','arrays','logic'].includes(topic)){
    await page.locator('#diagramGrid .diagram-card-v2').first().screenshot({path:screenshotsDir+'/'+topic+'-mobile-first-figure.png'});
    await page.locator('.integrated-practice .editor-cell').screenshot({path:screenshotsDir+'/'+topic+'-mobile-editor.png'});
   }
  }
  await page.close();
 }
 fs.writeFileSync(screenshotsDir+'/audit.json',JSON.stringify({version:'2027',records:report,problems},null,2));
 console.log('VISUAL_AUDIT_SUMMARY',JSON.stringify({cases:report.length,problems,count:problems.length}));
 if(problems.length)process.exitCode=1;
}finally{await browser.close();}
