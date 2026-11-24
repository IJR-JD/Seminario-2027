import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
mkdirSync('qa-codequest',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',route=>{
 const relative=route.request().url().split('/three@0.170.0/')[1];
 if(!relative||relative.includes('..'))return route.abort();
 return route.fulfill({path:resolve('node_modules/three',relative),contentType:'application/javascript'});
});
try{
 await page.goto(base+'/projects/codequest-rpg/',{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
 await page.locator('#continueAdventure').click();
 await page.locator('#missionPicker[open]').waitFor();
 await page.waitForFunction(()=>document.querySelector('#parkourHUD')?.dataset.grounded==='true');
 await page.locator('#overworldCanvas').focus();
 await page.keyboard.down('Space');
 await page.waitForFunction(()=>document.querySelector('#parkourHUD')?.dataset.airborne==='true');
 await page.keyboard.up('Space');
 await page.waitForFunction(()=>document.querySelector('#parkourHUD')?.dataset.grounded==='true');
 console.log('PASS actual manual jump and return to ground');
 if(!(await page.locator('#exploreMenu').evaluate(el=>el.open)))await page.locator('#exploreMenu summary').click();await page.locator('#parkourToggle').click();
 assert.equal(await page.locator('#parkourList article').count(),6);
 await page.locator('[data-course-route="course-0"]').click();
 await page.waitForFunction(()=>document.querySelector('#parkourHUD')?.dataset.course==='course-0'&&!document.querySelector('#parkourAssist').disabled,null,{timeout:60000});
 await page.screenshot({path:'qa-codequest/vertical-entry.png'});
 const heights=[];
 for(let i=0;i<6;i++){
  await page.locator('#parkourAssist').click();
  await page.waitForFunction(i=>{const p=document.querySelector('#parkourHUD');return p.dataset.grounded==='true'&&p.dataset.support==='parkour-0-'+i;},i,{timeout:20000});
  heights.push(Number(await page.locator('#parkourHUD').getAttribute('data-height')));
  if(i===2)await page.screenshot({path:'qa-codequest/vertical-midway.png'});
 }
 assert(heights.every((y,i)=>i===0||y>heights[i-1]));
 assert.equal(await page.locator('#parkourHUD').getAttribute('data-completed'),'1');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('cq-vertical-trails-v7'))),['course-0']);
 await page.screenshot({path:'qa-codequest/vertical-summit.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'qa-codequest/vertical-mobile.png'});
 assert(await page.locator('#parkourHUD').isVisible());
 assert.deepEqual(errors,[]);
 console.log('PASS real six-platform route and reward; heights '+heights.join(', '));
}finally{await browser.close();}
