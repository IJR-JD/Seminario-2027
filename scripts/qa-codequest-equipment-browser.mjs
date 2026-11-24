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
await page.addInitScript(()=>{localStorage.setItem('ijr-codequest-world-v2',JSON.stringify({level:Number(new URL(location.href).searchParams.get('qaRoom')||0),completed:[],bestSteps:{}}));});
const wait=(fn,arg,timeout=60000)=>page.waitForFunction(fn,arg,{timeout});
async function open(room=0){
 await page.goto(base+'/projects/codequest-rpg/?qaRoom='+room,{waitUntil:'domcontentloaded',timeout:45000});
 await wait(()=>document.querySelector('#commandPalette')?.children.length>0);
 await page.locator('#continueAdventure').click();
 await page.locator('#missionPicker[open]').waitFor();
 await wait(()=>document.querySelector('#overworldCanvas').dataset.release==='8.5-equipment');
 assert.equal(await page.locator('#mobilityHUD').getAttribute('data-skills'),'');
}
async function select(id){
 await page.locator('#overworldCanvas').focus();await page.keyboard.down('Tab');
 const wheel=page.locator('#gearWheel');await wheel.waitFor({state:'visible'});
 const slot=wheel.locator('[data-gear="'+id+'"]');
 assert(['ready','active'].includes(await slot.getAttribute('data-state')),id+' must be usable');
 await slot.hover();assert.equal(await slot.getAttribute('aria-pressed'),'true');
 await page.keyboard.up('Tab');await wheel.waitFor({state:'hidden'});
 assert(await page.locator('#overworldCanvas').evaluate(el=>document.activeElement===el));
}
async function secondary(id){
 await page.locator('#gearWheelToggle').click();
 const el=page.locator('[data-wheel-action="'+id+'"]');assert(await el.isEnabled());await el.click();
}
try{
 await open();
 await page.locator('#gearWheelToggle').click();await page.locator('[data-gear="fly"]').hover();
 assert(await page.locator('#gearEnergy').isVisible());assert.equal(await page.locator('.gearWedge.selected').count(),1);
 await page.screenshot({path:'qa-codequest/equipment-wheel.png'});await page.locator('#gearCancel').click();
 await select('fly');await wait(()=>document.querySelector('#islandTraversalStatus').textContent.startsWith('Flying'));
 await wait(()=>Number(document.querySelector('#overworldCanvas').dataset.playerY)>2.5);
 await page.screenshot({path:'qa-codequest/equipment-flight.png'});await select('fly');await wait(()=>!document.querySelector('#islandTraversalStatus').textContent.startsWith('Flying'));
 console.log('PASS Flight from fresh academic save, ascent and landing');
 await open(16);
 await select('wall');
 await wait(()=>{const c=document.querySelector('#overworldCanvas').dataset;return Math.abs(Number(c.playerX)+58.5)<1.2&&Math.abs(Number(c.playerZ)-51)<1.2;},null,90000);
 await select('wall');await wait(()=>document.querySelector('#islandTraversalStatus').textContent==='Wall running');
 await page.keyboard.down('s');await wait(()=>document.querySelector('#islandTraversalStatus').textContent==='Wall running');await page.keyboard.up('s');
 await page.screenshot({path:'qa-codequest/equipment-wall.png'});await select('wall');
 await wait(()=>document.querySelector('#islandTraversalStatus').textContent!=='Wall running');
 console.log('PASS Wall run routes to physical lane, activates and releases');
 for(const type of ['bike','hover']){
  await open();await select(type);
  await wait(type=>{const h=document.querySelector('#mobilityHUD').dataset;return h.vehicle.startsWith(type+'-')||h.nearest.startsWith(type+'-');},type,90000);
  if(!(await page.locator('#mobilityHUD').getAttribute('data-vehicle')).startsWith(type+'-'))await select(type);
  await wait(type=>document.querySelector('#mobilityHUD').dataset.vehicle.startsWith(type+'-'),type);
  // Choose open direction from the depot parking bay, then brake and dismount.
  await page.keyboard.down(type==='hover'?'w':'a');
  try{await wait(()=>Number(document.querySelector('#mobilityHUD').dataset.speed)>3,null,15000);}finally{await page.keyboard.up(type==='hover'?'w':'a');}
  await secondary('brake');await wait(()=>document.querySelector('#mobilityHUD').dataset.speed==='0',null,15000);
  await page.screenshot({path:'qa-codequest/equipment-'+type+'.png'});await secondary('vehicle');
  await wait(()=>document.querySelector('#mobilityHUD').dataset.vehicle==='');
  console.log('PASS '+type+' selected, physically mounted, driven, braked and dismounted with no earned skill');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
