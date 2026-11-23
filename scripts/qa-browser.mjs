/* Real Chromium functional smoke suite for Seminario 2027.
 * Requires Playwright Chromium (installed only in qa-browser.yml).
 * Uses a local static server; no institutional accounts, progress tables or remote writes.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const BASE=process.env.QA_BASE||'http://127.0.0.1:8765';
const topics=['algoritmos','operations','types','arrays','logic','conditions','loops','functions',
 'statistics','descriptive','position-outliers','pandas-dataframes','data-cleaning',
 'filter-transform','group-aggregate','visualization','analyst-project'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true,reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(String(error.message||error)));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',route=>
 route.fulfill({status:200,contentType:'application/javascript',body:'window.supabase={};'}));
const visit=slug=>page.goto(BASE+'/learning/theory.html?topic='+encodeURIComponent(slug),
 {waitUntil:'domcontentloaded',timeout:60000});
try{
 for(const slug of topics){
  await visit(slug);
  await page.waitForFunction(()=>document.querySelector('#theoryTitle')?.textContent?.trim()&&
   document.querySelector('#theoryTitle').textContent!=='Loading subject…',{timeout:15000});
  const details=await page.evaluate(()=>({
   cards:document.querySelectorAll('#conceptGrid .concept-card-v2').length,
   figures:document.querySelectorAll('#diagramGrid .diagram-card-v2').length,
   stages:document.querySelectorAll('#stageList .stage').length,
   topic:document.querySelector('#theoryTitle')?.textContent?.trim(),
   expectedSections:(window.SEMINAR_2027_COURSE||[]).find(t=>t.slug===new URLSearchParams(location.search).get('topic'))?.sections.length,
   expectedFigures:(window.SEMINAR_2027_COURSE||[]).find(t=>t.slug===new URLSearchParams(location.search).get('topic'))?.diagrams.length
  }));
  assert.equal(details.cards,details.expectedSections,slug+' conceptual cards mismatch: '+JSON.stringify(details));
  assert.equal(details.figures,details.expectedFigures,slug+' figure count mismatch: '+JSON.stringify(details));
  assert.equal(details.stages,12,slug+' guided practice failed: '+JSON.stringify(details));

  const art=await page.evaluate(()=>{
   const cards=[...document.querySelectorAll('#diagramGrid .diagram-card-v2')];
   const vectors=cards.filter(card=>card.querySelector('.sv27-stage .sv27-figure svg')).length;
   const origins=cards.filter(card=>card.querySelector('.v9-stage,.arr34-figure')).length;
   const panel=document.querySelector('.sv27-workshop-panel');
   return {
    vectors,origins,workshopFigures:panel?.querySelectorAll('.sv27-figure svg').length||0,
    workshopCaption:panel?.querySelector('.sv27-workshop-footer')?.textContent||'',
    specialized:window.IJR_2027_VISUAL_COVERAGE?.diagramsEnhanced??-1,
    themeLoaded:document.querySelector('link[href="lesson-figures-v1.css"]')!==null,
    placeholders:cards.filter(card=>card.querySelector('.sv27-stage')&&
      card.textContent.includes('concept process result')).length
   };
  });
  assert.equal(art.workshopFigures,1,slug+' missing contextual workshop figure');
  assert.equal(art.themeLoaded,true,slug+' vector figure styling missing');
  assert.equal(art.placeholders,0,slug+' still displays generic placeholders');
  if(slug!=='operations'&&slug!=='arrays'){
   assert.equal(art.vectors,details.expectedFigures,
    slug+' not all theoretical figures have a dedicated vector');
   assert.equal(art.specialized,details.expectedFigures,
    slug+' missing some content-specific illustration factories');
  }else{
   assert.equal(art.origins,details.expectedFigures,
    slug+' original 2026 animated diagrams were replaced');
  }
  assert.ok(art.workshopCaption.includes('ETAPA 01'),slug+' first workshop visual missing label');
  console.log('PASS topic-visual',slug,'original',art.origins,'specific',art.vectors,
   'workshop',art.workshopFigures);

  if(slug==='operations'){
   await page.waitForFunction(()=>document.querySelectorAll('#diagramGrid .v9-stage').length===8);
   assert.equal(await page.locator('#sourceOperationsResources .source-resource-card').count(),4);
  }
  if(slug==='arrays'){
   await page.waitForFunction(()=>document.querySelectorAll('#diagramGrid .arr34-figure').length===6);
  }
  if(slug==='logic'){
   await page.locator('#librariesPandasTheoryV60').waitFor({timeout:12000});
  }
  console.log('PASS theory route',slug,'concepts',details.cards,'figures',details.figures,'stages',details.stages);
 }

 // Audit the independent workshop URL as well: all 17 topics, all 12 stages.
 for(const slug of topics){
  await page.goto(BASE+'/learning/workshop.html?topic='+slug,
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#stageList .stage').length===12,
   null,{timeout:12000});
  assert.equal(await page.locator('.sv27-workshop-panel .sv27-figure svg').count(),1,
   slug+' standalone workshop lacks its scientific diagram');
  await page.locator('#stageList .stage').last().click();
  await page.waitForFunction(()=>
   document.querySelector('.sv27-workshop-footer')?.textContent.includes('ETAPA 12'),
   null,{timeout:5000});
  assert.equal(await page.locator('.sv27-workshop-panel .sv27-figure svg').count(),1,
   slug+' final stage lost its visual');
  console.log('PASS standalone-workshop-visual',slug,'12 stages');
 }

 assert.deepEqual(errors,[],'Uncaught browser errors while navigating 17 topics');

 await visit('operations');
 await page.locator('#theoryCode').fill('print(17+8)');
 await page.locator('#theoryRun').click();
 await page.waitForFunction(()=>document.querySelector('#labOutput')?.textContent?.trim()==='25',
  null,{timeout:150000});
 console.log('PASS browser Pyodide theory Run');

 await page.locator('#codeEditor').fill('a=17\nb=8\nprint(a+b)');
 await page.locator('#runButton').click();
 await page.waitForFunction(()=>document.querySelector('#outputText')?.textContent?.trim()==='25',
  null,{timeout:90000});
 await page.locator('#validateButton').click();
 await page.waitForFunction(()=>document.querySelector('#topicCount')?.textContent?.startsWith('1 / 12'),
  null,{timeout:5000});
 console.log('PASS browser practice Run / Validate');

 await visit('logic');
 await page.locator('#codeEditor').fill(
  'import pandas as pd\n'+
  'df=pd.read_excel("pandas_excel_students.xlsx",sheet_name="Students")\n'+
  'print(df.shape)'
 );
 await page.locator('#runButton').click();
 await page.waitForFunction(()=>document.querySelector('#outputText')?.textContent?.trim()==='(6, 5)',
  null,{timeout:160000});
 console.log('PASS browser XLSX + Pandas',await page.locator('#outputText').textContent());

 await page.locator('#codeEditor').fill(
  'from openpyxl import Workbook\nwb=Workbook()\nwb.save("xlsx_library_output.xlsx")\nprint(True)'
 );
 await page.locator('#runButton').click();
 await page.waitForFunction(()=>document.querySelector('#outputText')?.textContent?.trim()==='True',
  null,{timeout:90000});
 await page.locator('#workshopDownloads button').first().waitFor({timeout:15000});
 const downloadPromise=page.waitForEvent('download',{timeout:15000});
 await page.locator('#workshopDownloads button').first().click();
 const download=await downloadPromise;
 assert.equal(download.suggestedFilename(),'xlsx_library_output.xlsx');
 console.log('PASS generated XLSX download',download.suggestedFilename());

 // Test the editor tools in a real browser, not just their DOM presence.
 await visit('operations');
 assert.equal(await page.locator('.code-surface').count(),2,
  'Both theory and guided practice should expose enhanced code workspaces');
 await page.locator('#theoryCode').fill('print(6*7)');
 const oldFont=await page.locator('#theoryCode').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 await page.locator('.live-editor .code-utilities button[aria-label="Ampliar el texto del código"]').click();
 const newFont=await page.locator('#theoryCode').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
 assert.ok(newFont>oldFont,'Font enlargement must visibly increase monospace size');
 await page.locator('.live-editor .code-utilities button[aria-label="Expandir o contraer el editor"]').click();
 assert.ok(await page.locator('.live-editor .code-surface').evaluate(el=>el.classList.contains('is-expanded')),
  'Editor expand control must actually expand the workspace');
 await page.locator('#theoryCode').press('Control+Enter');
 await page.waitForFunction(()=>document.querySelector('#labOutput')?.textContent?.trim()==='42',
  null,{timeout:90000});
 assert.equal((await page.locator('.live-editor .code-lines').textContent()).trim(),'1');
 assert.equal(await page.locator('.integrated-practice [role="progressbar"]').count(),1,
  'Workshop progress must be announced to assistive technology');
 console.log('PASS interactive code UI: line numbers, font scaling, expansion, Ctrl+Enter, progressbar');

 // The 12 stages on phones should scroll inside their own rail, not widen the page.
 await page.setViewportSize({width:390,height:844});
 await visit('logic');
 await page.locator('#stageList .stage').nth(11).click();
 await page.waitForFunction(()=>document.querySelector('#stageList')?.scrollLeft>60,
  null,{timeout:5000});
 const mobile=await page.evaluate(()=>({
  viewport:innerWidth,width:document.documentElement.scrollWidth,
  badges:[...document.querySelectorAll('#stageBadge,#stageKind')].map(el=>({
   text:el.textContent,right:el.getBoundingClientRect().right
  }))
 }));
 assert.ok(mobile.width<=mobile.viewport+3,'Mobile layout must not scroll horizontally');
 assert.ok(mobile.badges.every(x=>x.right<=mobile.viewport+3),
  'Pandas class badges must remain in the mobile viewport');
 console.log('PASS mobile controls: horizontal stage rail, badges, no page overflow');

 assert.deepEqual(errors,[],'Uncaught browser errors during live Pyodide tests');
 console.log('PASS real browser: 17 theory routes, 8 V9 operations diagrams, 6 list figures, '+
  '204-stage navigation, Python execution, Pandas XLSX and downloadable generated file');
}finally{
 await browser.close();
}
