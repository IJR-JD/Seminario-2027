import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
mkdirSync('qa-codequest',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',route=>{
 const relative=route.request().url().split('/three@0.170.0/')[1];
 if(!relative||relative.includes('..'))return route.abort();
 return route.fulfill({path:resolve('node_modules/three',relative),contentType:'application/javascript'});
});
await page.addInitScript(()=>{
 const room=new URL(location.href).searchParams.get('qaRoom');
 if(room!==null)localStorage.setItem('ijr-codequest-world-v2',JSON.stringify({level:Number(room),completed:[],bestSteps:{}}));
});
async function openIsland(room){
 await page.goto(base+'/projects/codequest-rpg/?qaRoom='+room,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
 await page.locator('#continueAdventure').click();
 await page.locator('#missionPicker[open]').waitFor({timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#adventureProgress')?.textContent.includes('/5 powers'),null,{timeout:15000});
 assert(await page.locator('#overworldStage').isVisible(),'3D renderer must initialize');
}
async function navigate(id){
 if(!(await page.locator('#exploreMenu').evaluate(el=>el.open)))await page.locator('#exploreMenu summary').click();await page.locator('#islandAdventureToggle').click();
 assert.equal(await page.locator('#adventureList article').count(),13,'Journal lists 5 powers, 4 trials and 4 gates');
 await page.locator('[data-adventure-route="'+id+'"]').click();
 assert(await page.locator('#islandAdventurePanel').isHidden(),'Route selection returns to the scene');
}
async function waitToast(text,timeout=40000){
 await page.waitForFunction(text=>document.querySelector('#islandDiscoveryToast')?.textContent.includes(text),text,{timeout});
}
try{
 await openIsland(4);
 await page.screenshot({path:'qa-codequest/adventure-village.png'});
 assert.equal(await page.locator('[data-power="dash"]').getAttribute('data-unlocked'),'false');
 await page.locator('#powerMenu').evaluate(el=>{if(!el.open)el.querySelector('summary').click();});await page.locator('[data-power="dash"]').click();
 await waitToast('Wind Shrine');
 await navigate('dash');
 await page.waitForFunction(()=>document.querySelector('[data-power="dash"]')?.dataset.unlocked==='true',null,{timeout:45000});
 await page.screenshot({path:'qa-codequest/adventure-shrine.png'});
 assert((await page.locator('#adventureProgress').textContent()).includes('1/5 powers'));
 await page.locator('#powerMenu').evaluate(el=>{if(!el.open)el.querySelector('summary').click();});await page.locator('[data-power="dash"]').click();
 await page.waitForFunction(()=>document.querySelector('#islandTraversalStatus')?.textContent==='Dash',null,{timeout:12000});
 console.log('PASS physical Dash shrine unlock and animated activation');
 await openIsland(16);
 assert.equal(await page.locator('[data-power="dash"]').getAttribute('data-unlocked'),'true','Power survives reload');
 await navigate('signal');
 await page.waitForFunction(()=>document.querySelector('#adventureGate')?.dataset.unlocked==='true',null,{timeout:50000});
 await page.locator('#powerMenu').evaluate(el=>{if(!el.open)el.querySelector('summary').click();});await page.locator('#adventureGate').click();
 await waitToast('Portal travel · Meadow Gate');
 await page.screenshot({path:'qa-codequest/adventure-gate.png'});
 console.log('PASS actual gate travel and saved power');
 if(!(await page.locator('#exploreMenu').evaluate(el=>el.open)))await page.locator('#exploreMenu summary').click();await page.locator('#islandAdventureToggle').click();
 await page.screenshot({path:'qa-codequest/adventure-journal.png'});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'qa-codequest/adventure-mobile.png'});
 assert(await page.locator('#islandAdventurePanel').isVisible());
 assert.deepEqual(errors,[],'Unexpected browser errors');
 console.log('PASS real adventure WebGL, journal, persistent unlock, portal and mobile');
}finally{await browser.close();}
