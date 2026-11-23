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
 assert.deepEqual(errors,[],'Uncaught browser errors during live Pyodide tests');
 console.log('PASS real browser: 17 theory routes, 8 V9 operations diagrams, 6 list figures, '+
  '204-stage navigation, Python execution, Pandas XLSX and downloadable generated file');
}finally{
 await browser.close();
}
