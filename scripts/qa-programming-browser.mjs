/* General programming track · real Chromium QA.
 * Test all 17 units, 204 stages, SVG animation controls and representative Python execution.
 * The legacy Statistics & Data Science browser suite runs separately on ?track=statistics.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const BASE=process.env.QA_BASE||'http://127.0.0.1:8765';
const slugs=['algoritmos','flowcharts','operations','variables','input-output','booleans',
 'conditionals','for-loops','while-loops','nested-loops','functions','arrays',
 'strings','dictionaries','modularity','debugging','project'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/**',route=>route.fulfill({
 status:200,contentType:'application/javascript',body:'window.supabase={};'
}));
const visit=slug=>page.goto(BASE+'/learning/theory.html?topic='+slug,{waitUntil:'domcontentloaded',timeout:60000});
try{
 await page.goto(BASE+'/learning/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.IJR_2027_CATALOG?.topics===17);
 assert.equal(await page.locator('#topicGrid .topic-card:visible').count(),17);
 assert.equal(await page.evaluate(()=>window.SEMINAR_2027_TRACK),'programming');
 assert.equal(await page.locator('.track-option.active').getAttribute('data-track-option'),'programming');
 assert.equal(await page.getByRole('link',{name:'Statistics & Data Science archive'}).count(),1);
 await page.getByRole('button',{name:'Python foundations'}).click();
 assert.equal(await page.locator('.topic-card:visible').count(),6);
 await page.getByRole('button',{name:'Control & structures'}).click();
 assert.equal(await page.locator('.topic-card:visible').count(),10);
 await page.getByRole('button',{name:'Projects'}).click();
 assert.equal(await page.locator('.topic-card:visible').count(),1);
 await page.getByRole('button',{name:'All topics'}).click();
 await page.locator('#topicSearch').fill('while');
 assert.equal(await page.locator('.topic-card:visible').count(),1);
 assert.ok((await page.locator('.topic-card:visible h3').textContent()).includes('While'));
 await page.locator('#topicSearch').fill('');
 assert.equal(await page.locator('.topic-card:visible').count(),17);
 console.log('PASS default programming catalog: 17 units / 6 foundations / 10 techniques / 1 capstone');
 const assetCounts=new Set();
 for(const slug of slugs){
  await visit(slug);
  await page.waitForFunction(()=>document.querySelectorAll('#stageList .stage').length===12);
  const data=await page.evaluate(()=>{
   const course=window.SEMINAR_2027_COURSE||[];
   const unit=course.find(x=>x.slug===new URLSearchParams(location.search).get('topic'));
   const checks=window.IJR_2027_CHECKS||{outputs:{},choices:{}};
   const figures=[...document.querySelectorAll('#diagramGrid .diagram-card-v2')];
   const docks=[...document.querySelectorAll('.sv28-dock')];
   return {
    title:document.querySelector('#theoryTitle')?.textContent,
    topic:unit?.slug,units:course.length,count:course.reduce((s,t)=>s+t.exercises.length,0),
    modes:unit?.exercises.map(x=>x.mode),
    missingKeys:unit?.exercises.filter(x=>x.mode==='code'?typeof checks.outputs[x.key]!=='string':
     !Number.isInteger(checks.choices[x.key])).map(x=>x.key),
    expected:unit?.diagrams.length,figures:figures.length,
    animated:figures.filter(x=>x.querySelector('.pc27-figure[data-motion-step]')).length,
    progress:window.IJR_2027_VISUAL_COVERAGE?.diagramsEnhanced,
    dockCount:docks.length,controlCounts:docks.map(x=>x.querySelectorAll('button').length),
    workshopFigure:document.querySelectorAll('.pc27-workshop-panel .pc27-figure').length,
    workshopDock:document.querySelectorAll('.pc27-workshop-panel .sv28-dock').length,
    noArchivePandas:!document.querySelector('#librariesPandasTheoryV60'),
    jsTrack:window.SEMINAR_2027_TRACK
   };
  });
  assert.equal(data.jsTrack,'programming',slug+' track did not load');
  assert.equal(data.topic,slug,slug+' wrong slug');
  assert.equal(data.units,17,slug+' units not loaded');
  assert.equal(data.count,204,slug+' rubric count changed');
  assert.deepEqual(data.missingKeys,[],slug+' has missing reference answers');
  assert.equal(data.figures,data.expected,slug+' diagram count mismatch');
  assert.equal(data.animated,data.expected,slug+' animated SVG missing');
  assert.equal(data.progress,data.expected,slug+' visual coverage incomplete');
  assert.equal(data.dockCount,data.expected+1,slug+' motion docks missing');
  assert.ok(data.controlCounts.every(c=>c===5),slug+' accessible motion controls missing');
  assert.equal(data.workshopFigure,1,slug+' embedded workshop figure missing');
  assert.equal(data.workshopDock,1,slug+' workshop motion missing');
  assert.equal(data.noArchivePandas,true,slug+' old Pandas theory has leaked into coding');
  assert.equal(data.modes.length,12,slug+' stages missing');
  assetCounts.add(data.expected);
  console.log('PASS general programming unit',slug,'figures',data.expected,'stages 12');
 }
 // The standalone workshop must maintain a diagram and narrated playbar across all 204 stages.
 for(const slug of slugs){
  await page.goto(BASE+'/learning/workshop.html?topic='+slug,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelectorAll('#stageList .stage').length===12);
  assert.equal(await page.evaluate(()=>window.SEMINAR_2027_TRACK),'programming');
  for(let i=0;i<12;i++){
   await page.locator('#stageList .stage').nth(i).click();
   await page.waitForFunction(num=>document.querySelector('.pc27-workshop-panel .sv27-workshop-footer')?.textContent.includes(num),
    'STAGE '+String(i+1).padStart(2,'0'),{timeout:8000});
   assert.equal(await page.locator('.pc27-workshop-panel .pc27-figure').count(),1,
    slug+' stage '+i+' lost SVG');
   assert.equal(await page.locator('.pc27-workshop-panel .sv28-dock').count(),1,
    slug+' stage '+i+' lost playbar');
   assert.equal(await page.locator('.pc27-workshop-panel .sv28-focus-track').count(),1,
    slug+' stage '+i+' lost animation track');
  }
  console.log('PASS 12/12 workshop stages with diagrams and animation',slug);
 }
 // Check key curriculum concepts, including Python's absence of a native do...while.
 await visit('flowcharts');
 assert.ok((await page.locator('#theoryDefinition').textContent()).includes('diamonds'));
 await visit('while-loops');
 assert.ok((await page.locator('#theoryDefinition').textContent()).includes('does not have a native do...while'));
 const model=page.locator('.diagram-card-v2').first();
 const first=await model.locator('.sv27-figure').getAttribute('data-motion-step');
 await model.getByRole('button',{name:'Next explanation step'}).click();
 assert.equal(first,'1');assert.equal(await model.locator('.sv27-figure').getAttribute('data-motion-step'),'2');
 await model.getByRole('button',{name:'Replay animation'}).click();
 assert.equal(await model.locator('.sv27-figure').getAttribute('data-motion-step'),'1');
 console.log('PASS standard SVG player and Python do...while equivalent explanation');
 // Multiple representative live Python challenges, with the exact results validated.
 async function testCode(slug,stage,code,expected){
  await visit(slug);
  await page.locator('#stageList .stage').nth(stage).click();
  await page.locator('#codeEditor').fill(code);
  await page.locator('#runButton').click();
  await page.waitForFunction(x=>document.querySelector('#outputText')?.textContent?.trim()===x,
   expected,{timeout:140000});
  await page.locator('#validateButton').click();
  await page.waitForFunction(()=>document.querySelector('#feedback')?.textContent.includes('validada'),null,{timeout:15000});
  console.log('PASS Python Run→Validate',slug,'stage',stage+1);
 }
 await testCode('conditionals',0,"n=9\nif n>0:\n    print('Positive')\nelse:\n    print('Non-positive')",'Positive');
 await testCode('for-loops',0,"for n in range(1,6):\n    print(n)",'1\n2\n3\n4\n5');
 await testCode('while-loops',4,"n=5\nwhile True:\n    print(n)\n    if n>=5:\n        break",'5');
 await testCode('functions',0,"def add(a,b):\n    return a+b\nprint(add(4,6))",'10');
 await testCode('arrays',2,"values=[6,12]\nvalues.append(18)\nprint(values)",'[6, 12, 18]');
 // Concept checks: wrong answer cannot pass; right answer can.
 await visit('flowcharts');
 const answers=await page.evaluate(()=>{
  const task=window.SEMINAR_2027_COURSE.find(x=>x.slug==='flowcharts').exercises[0];
  return {key:task.key,correct:window.IJR_2027_CHECKS.choices[task.key],count:task.choices.length};
 });
 await page.locator('#choiceWrap input').nth((answers.correct+1)%answers.count).check();
 await page.locator('#validateButton').click();
 assert.equal((await page.locator('#topicCount').textContent()).startsWith('0 / 12'),true);
 await page.locator('#choiceWrap input').nth(answers.correct).check();
 await page.locator('#validateButton').click();
 await page.waitForFunction(()=>document.querySelector('#topicCount')?.textContent.startsWith('1 / 12'));
 console.log('PASS flowchart quiz: rejects incorrect choice, accepts correct answer');
 // Archive remains accessible through the same site.
 await page.goto(BASE+'/learning/?track=statistics',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.IJR_2027_CATALOG?.topics===17);
 assert.equal(await page.evaluate(()=>window.SEMINAR_2027_TRACK),'statistics');
 await page.goto(BASE+'/learning/theory.html?topic=position-outliers&track=statistics',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelectorAll('#diagramGrid .sv27-figure').length===2);
 assert.ok((await page.locator('#theoryTitle').textContent()).includes('Quartiles'));
 console.log('PASS legacy Statistics & Data Science archive retained');
 await page.setViewportSize({width:320,height:720});
 await visit('while-loops');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3));
 const mobileDiagram=page.locator('#diagramGrid .diagram-card-v2').first();
 const scrollBefore=await mobileDiagram.locator('.pc27-stage').evaluate(el=>el.scrollLeft);
 await mobileDiagram.getByRole('button',{name:'Next explanation step'}).click();
 await page.waitForFunction(()=>document.querySelector('#diagramGrid .pc27-stage')?.scrollLeft>35,
  null,{timeout:5000});
 const scrollAfter=await mobileDiagram.locator('.pc27-stage').evaluate(el=>el.scrollLeft);
 assert.ok(scrollAfter>scrollBefore+30,'Animated focus must auto-pan inside narrow diagrams');
 console.log('PASS mobile animated figure automatically pans to the active state');
 assert.deepEqual(pageErrors,[],'Uncaught errors in programming browser QA');
 console.log('PASS PROGRAMMING_BROWSER_QA',{topics:17,stages:204,playback:true,livePython:5,archive:true});
}finally{await browser.close();}
