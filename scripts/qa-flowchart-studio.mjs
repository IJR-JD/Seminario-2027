/* Flowchart ↔ Python instructional QA. Runs in real Chromium on local static site. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const dir='qa-flowchart-studio';fs.mkdirSync(dir,{recursive:true});
const errors=[];
page.on('pageerror',e=>errors.push(String(e.message||e)));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={};'}));
const state=()=>page.evaluate(()=>window.IJR_FLOWCHART_STUDIO?.getState());
const path=()=>page.evaluate(()=>window.IJR_FLOWCHART_STUDIO?.inspectTrace().map(s=>s.node));
const visit=()=>page.goto(base+'/learning/theory.html?topic=flowcharts',{waitUntil:'domcontentloaded',timeout:45000});
const select=name=>page.getByRole('tab',{name}).click();
const param=async(name,value)=>{
 const input=page.getByRole('spinbutton',{name});
 await input.fill(String(value));await input.dispatchEvent('change');
};
const python=async()=>{
 await page.getByRole('button',{name:'Ejecutar Python real'}).click();
 await page.waitForFunction(()=>document.querySelector('#fc28-feedback')?.textContent?.includes('Concordancia verificada'),null,{timeout:120000});
};
try{
 await visit();
 await page.waitForFunction(()=>window.IJR_FLOWCHART_STUDIO?.version===1);
 assert.equal(await page.locator('.fc28-symbols>div').count(),5);
 assert.equal(await page.locator('.fc28-tab').count(),4);
 assert.equal(await page.locator('#diagramGrid .diagram-card-v2').count(),2);
 assert.equal(await page.locator('#stageList .stage').count(),12);
 assert.equal(await page.locator('.fc28-node.fc28-io polygon').count(),3);
 assert.equal(await page.locator('.fc28-node.fc28-terminator rect').count(),2);
 assert.equal((await state()).expected,'24');
 assert.deepEqual(await path(),['start','base','height','calc','output','end']);
 await page.getByRole('button',{name:'Siguiente'}).click();
 assert.equal((await state()).step,1);
 assert.equal(await page.locator('.fc28-line.is-current .fc28-line-no').textContent(),'01');
 assert.equal(await page.locator('.fc28-node.is-current').getAttribute('data-node'),'base');
 await page.getByRole('button',{name:'Siguiente'}).click();
 await page.getByRole('button',{name:'Siguiente'}).click();
 await page.getByRole('button',{name:'Siguiente'}).click();
 assert.equal(await page.locator('#fc28-output').textContent(),'24');
 await page.locator('.fc28-workspace').screenshot({path:dir+'/sequence-desktop-trace.png'});
 await page.getByRole('button',{name:'Reiniciar'}).click();
 await page.locator('#fc28-prediction').fill('25');
 await page.getByRole('button',{name:'Comprobar predicción'}).click();
 assert.ok((await page.locator('#fc28-feedback').textContent()).includes('no coincide'));
 await page.locator('#fc28-prediction').fill('24');
 await page.getByRole('button',{name:'Comprobar predicción'}).click();
 assert.ok((await page.locator('#fc28-feedback').textContent()).includes('Predicción correcta'));
 await python();
 await param('Base',8);
 assert.equal((await state()).expected,'32');
 await python();
 console.log('PASS sequence flowchart ↔ source code, variables, output, predictions and Pyodide');

 await select(/Condición/);
 assert.equal((await state()).expected,'Minor');
 assert.deepEqual(await path(),['start','age','cond','minor','end']);
 assert.equal(await page.locator('.fc28-node.fc28-decision polygon').count(),1);
 await python();
 await param('Edad',21);
 assert.equal((await state()).expected,'Adult');
 assert.deepEqual(await path(),['start','age','cond','adult','end']);
 await python();
 await page.getByRole('button',{name:'Siguiente'}).click();
 await page.getByRole('button',{name:'Siguiente'}).click();
 assert.equal(await page.locator('#fc28-active-route').textContent(),'Condición → SÍ');
 await page.locator('.fc28-workspace').screenshot({path:dir+'/decision-yes-desktop.png'});
 console.log('PASS if/else YES/NO branch consistency');

 await select(/If \/ elif \/ else/);
 assert.equal((await state()).expected,'B');
 assert.deepEqual(await path(),['start','score','condA','condB','B','end']);
 await python();
 await param('Puntaje',90);
 assert.equal((await state()).expected,'A');
 assert.deepEqual(await path(),['start','score','condA','A','end']);
 await param('Puntaje',55);
 assert.equal((await state()).expected,'C');
 assert.deepEqual(await path(),['start','score','condA','condB','C','end']);
 await python();
 console.log('PASS chained if/elif/else branches A, B, C');

 await select(/Ciclo while/);
 assert.equal((await state()).expected,'1\n2\n3\nDone');
 assert.equal((await path()).filter(n=>n==='cond').length,4);
 assert.equal(await page.locator('.fc28-edge[data-edge="back"]').count(),1);
 await page.locator('.fc28-workspace').screenshot({path:dir+'/while-desktop.png'});
 await python();
 await param('Límite',1);
 assert.equal((await state()).expected,'1\nDone');
 assert.equal((await path()).filter(n=>n==='cond').length,2);
 await python();
 await page.locator('#fc28-speed').selectOption('2');
 await page.getByRole('button',{name:'Reproducir'}).click();
 await page.waitForFunction(()=>window.IJR_FLOWCHART_STUDIO?.getState()?.step>0,null,{timeout:4500});
 await page.getByRole('button',{name:'Pausar'}).click();
 const paused=(await state()).step;await page.waitForTimeout(850);
 assert.equal((await state()).step,paused);
 await page.getByRole('button',{name:'Editar en el laboratorio'}).click();
 assert.equal(await page.locator('#theoryCode').inputValue(),(await state()).code);
 console.log('PASS while loop-back, multi-line console, play/pause, live lab transfer');

 await page.goto(base+'/learning/theory.html?topic=flowcharts&track=statistics',{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('#flowchartExecutionStudio').count(),0);
 for(const size of [{name:'desktop',w:1440,h:900},{name:'laptop',w:1024,h:800},{name:'tablet',w:768,h:1024},{name:'mobile',w:390,h:844},{name:'compact',w:320,h:720}]){
  await page.setViewportSize({width:size.w,height:size.h});await visit();
  await page.waitForFunction(()=>window.IJR_FLOWCHART_STUDIO?.version===1);
  const m=await page.evaluate(()=>{
   const c=document.querySelector('.fc28-diagram-scroll');
   return {sw:document.documentElement.scrollWidth,vw:innerWidth,content:c.scrollWidth,width:c.clientWidth};
  });
  assert.ok(m.sw<=m.vw+3,size.name+' page overflow '+JSON.stringify(m));
  if(size.w<=390)assert.ok(m.content>m.width,'Mobile must keep an internally scrollable SVG');
  if(size.name==='mobile')await page.locator('.fc28-workspace').screenshot({path:dir+'/flowchart-mobile.png'});
  console.log('PASS flowchart viewport',size.name,m);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS FLOWCHART_STUDIO_QA — 4 programs, all branches, dynamic loops, exact Python outputs, 5 breakpoints');
}finally{await browser.close();}
