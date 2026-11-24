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
async function open(room){
 await page.goto(base+'/projects/codequest-rpg/?qaRoom='+room,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
 await page.locator('#continueAdventure').click();
 await page.locator('#missionPicker[open]').waitFor({timeout:15000});
 assert(await page.locator('#overworldStage').isVisible());
}
async function unlock(id){
 await page.locator('#islandAdventureToggle').click();
 await page.locator('[data-adventure-route="'+id+'"]').click();
 await page.waitForFunction(id=>document.querySelector('[data-power="'+id+'"]')?.dataset.unlocked==='true',id,{timeout:60000});
}
try{
 await open(4);
 await page.screenshot({path:'qa-codequest/dynamic-village.png'});
 await unlock('grapple');
 await page.locator('[data-power="grapple"]').click();
 await page.waitForFunction(()=>document.querySelector('#islandTraversalStatus')?.textContent.includes('Tether swing'),null,{timeout:15000});
 await page.screenshot({path:'qa-codequest/dynamic-tether.png'});
 await page.locator('[data-power="grapple"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-power="grapple"]')?.getAttribute('aria-pressed')==='false');
 console.log('PASS physically discovered tether and entered swing mode');
 await open(20);
 assert.equal(await page.locator('[data-power="grapple"]').getAttribute('data-unlocked'),'true');
 await unlock('jetpack');
 await page.locator('[data-power="jetpack"]').click();
 await page.waitForFunction(()=>document.querySelector('#islandTraversalStatus')?.textContent.includes('Jetpack'),null,{timeout:15000});
 await page.keyboard.down('Space');
 await page.waitForFunction(()=>{const t=document.querySelector('#islandTraversalStatus')?.textContent||'';const m=t.match(/([0-9.]+)m$/);return m&&Number(m[1])>=3;},null,{timeout:15000});
 await page.keyboard.up('Space');
 await page.screenshot({path:'qa-codequest/dynamic-jetpack.png'});
 await page.locator('[data-power="jetpack"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-power="jetpack"]')?.getAttribute('aria-pressed')==='false');
 console.log('PASS discovered jetpack, ascended and deactivated');
 await page.locator('#islandAdventureToggle').click();
 assert.equal(await page.locator('#adventureList article').count(),13);
 await page.screenshot({path:'qa-codequest/dynamic-journal.png'});
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
