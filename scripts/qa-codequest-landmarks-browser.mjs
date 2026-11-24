import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
mkdirSync('qa-codequest',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGL|THREE/i.test(m.text()))errors.push(m.text());});
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',route=>{const relative=route.request().url().split('/three@0.170.0/')[1];if(!relative||relative.includes('..'))return route.abort();return route.fulfill({path:resolve('node_modules/three',relative),contentType:'application/javascript'});});
try{
 await page.goto(base+'/projects/codequest-rpg/',{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
 await page.locator('#continueAdventure').click();await page.locator('#missionPicker[open]').waitFor();
 await page.waitForFunction(()=>Number(document.querySelector('#overworldCanvas')?.dataset.waterTime)>0,null,{timeout:30000});
 const canvas=page.locator('#overworldCanvas'),t=Number(await canvas.getAttribute('data-water-time'));
 await page.waitForFunction(t=>Number(document.querySelector('#overworldCanvas').dataset.waterTime)>t+.5,t);
 assert.equal(await canvas.getAttribute('data-landmarks'),'4');
 for(const id of ['giza','tower-bridge','eiffel','liberty']){
  if(!(await page.locator('#exploreMenu').evaluate(el=>el.open)))await page.locator('#exploreMenu summary').click();await page.locator('#landmarksToggle').click();assert.equal(await page.locator('#landmarkList article').count(),4);
  await page.locator('[data-landmark-route="'+id+'"]').click();
  try{await page.waitForFunction(id=>document.querySelector('#landmarksPanel').dataset.visited.split(',').includes(id),id,{timeout:120000});}catch(error){console.log('ROUTE DIAGNOSTICS '+JSON.stringify(await canvas.evaluate(c=>({...c.dataset,toast:document.querySelector('#islandDiscoveryToast').textContent}))));await page.screenshot({path:'qa-codequest/failed-route-'+id+'.png'});throw error; }
  await page.screenshot({path:'qa-codequest/landmark-'+id+'.png'});
  console.log('PASS actual walk to '+id);
 }
 assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('cq-landmarks-v9')))).length,4);
 assert(Number(await canvas.getAttribute('data-water-particles'))<=Number(await canvas.getAttribute('data-water-capacity')));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa-codequest/landmark-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS all four real visits, persistent discoveries, animated shader and bounded particle pool with no WebGL errors');
}finally{await browser.close();}
