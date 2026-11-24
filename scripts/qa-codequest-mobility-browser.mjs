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
await page.addInitScript(()=>{
 const unlock=new URL(location.href).searchParams.get('qaUnlock');
 if(unlock!==null)localStorage.setItem('ijr-codequest-world-v2',JSON.stringify({level:0,completed:unlock==='1'?Array.from({length:12},(_,i)=>i):[],bestSteps:{}}));
});
async function open(unlocked){
 await page.goto(base+'/projects/codequest-rpg/?qaUnlock='+Number(unlocked),{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
 await page.locator('#continueAdventure').click();
 await page.locator('#missionPicker[open]').waitFor();
 assert(await page.locator('#overworldStage').isVisible());
}
async function go(selector){
 await page.locator('#mobilityToggle').click();
 await page.locator(selector).click();
}
const wait=(fn,arg,timeout=60000)=>page.waitForFunction(fn,arg,{timeout});
try{
 await open(false);
 await go('[data-depot-route="depot-0"]');
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.nearFrontier==='frontier-0');
 assert(await page.locator('#frontierLift').isDisabled());
 await page.screenshot({path:'qa-codequest/mobility-locked.png'});
 console.log('PASS locked expedition before completing sector');
 await go('[data-vehicle-route="rover-0"]');
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.nearest==='rover-0');
 await page.locator('#vehicleMount').click();
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.vehicle==='rover-0');
 await page.screenshot({path:'qa-codequest/mobility-rover.png'});
 await page.keyboard.down('d');
 await wait(()=>Number(document.querySelector('#mobilityHUD')?.dataset.speed)>3,null,15000);
 await page.keyboard.up('d');
 await page.locator('#vehicleBrake').click();
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.speed==='0',null,15000);
 await page.locator('#vehicleMount').click();
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.vehicle==='');
 console.log('PASS real rover mount, drive, brake, park, dismount');
 await open(true);
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.skills==='servo');
 await go('[data-depot-route="depot-0"]');
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.nearFrontier==='frontier-0'&&!document.querySelector('#frontierLift').disabled);
 await page.locator('#frontierLift').click();
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.frontier==='frontier-0',null,20000);
 await page.screenshot({path:'qa-codequest/mobility-frontier.png'});
 await page.keyboard.down('d');
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.visited.includes('frontier-0'),null,20000);
 await page.keyboard.up('d');
 await page.screenshot({path:'qa-codequest/mobility-beacon.png'});
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('cq-mobility-frontiers-v8'))),['frontier-0']);
 await page.keyboard.down('a');
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.nearFrontier==='frontier-0'&&!document.querySelector('#frontierLift').disabled,null,20000);
 await page.keyboard.up('a');
 await page.locator('#frontierLift').click();
 await wait(()=>document.querySelector('#mobilityHUD')?.dataset.frontier===''&&document.querySelector('#mobilityHUD')?.dataset.lifting==='false',null,20000);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa-codequest/mobility-mobile.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS completed-sector save grants skill, unlocks lift, reaches new region, explores beacon, returns to island');
}finally{await browser.close();}
