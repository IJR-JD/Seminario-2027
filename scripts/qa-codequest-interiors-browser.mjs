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
 const room=new URL(location.href).searchParams.get('qaRoom');
 if(room!==null)localStorage.setItem('ijr-codequest-world-v2',JSON.stringify({level:Number(room),completed:[0],bestSteps:{0:2}}));
});
async function open(room){
 await page.goto(base+'/projects/codequest-rpg/?qaRoom='+room,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
 await page.locator('#continueAdventure').click();await page.locator('#missionPicker[open]').waitFor();
 assert(await page.locator('#overworldStage').isVisible());
}
async function enter(id){
 await page.waitForFunction(id=>document.querySelector('#buildingEntrance')?.dataset.building===id,id,{timeout:45000});
 await page.locator('#buildingEntrance').click();
 await page.locator('#interiorHUD').waitFor({state:'visible'});
 assert.equal(await page.locator('#interiorHUD').getAttribute('data-building'),id);
}
async function approach(action){
 await page.locator('[data-interior-walk="'+action+'"]').click();
 await page.waitForFunction(a=>document.querySelector('#interiorHUD')?.dataset.action===a,action,{timeout:45000});
}
async function act(action){
 await approach(action);await page.locator('#interiorInteract').click();
}
try{
 await open(0);
 await page.locator('#buildingDirectoryToggle').click();
 assert.equal(await page.locator('#buildingList article').count(),30);
 await page.locator('#buildingDirectoryToggle').click();
 await enter('room-01');
 await page.screenshot({path:'qa-codequest/interior-guild.png'});
 await act('talk');
 assert((await page.locator('#interiorDialogue').textContent()).includes('A variable stores a value'));
 await act('room');
 await page.locator('#missionPicker').waitFor({state:'hidden'});
 assert((await page.locator('#levelIndex').textContent()).includes('01'));
 await page.locator('#openMissions').click();
 await page.locator('#interiorHUD').waitFor({state:'visible'});
 assert.equal(await page.locator('#interiorHUD').getAttribute('data-building'),'room-01');
 await act('exit');
 await page.locator('#interiorHUD').waitFor({state:'hidden'});
 console.log('PASS ground floor resident, real lesson entry, return to same building, exterior exit');
 await open(1);await enter('room-02');
 assert(await page.locator('[data-interior-walk="room"]').isHidden());
 await act('stairs');
 await page.waitForFunction(()=>document.querySelector('#interiorHUD')?.dataset.floor==='2');
 assert(await page.locator('[data-interior-walk="room"]').isVisible());
 await act('talk');
 await page.screenshot({path:'qa-codequest/interior-upstairs.png'});
 await act('room');await page.locator('#missionPicker').waitFor({state:'hidden'});
 assert((await page.locator('#levelIndex').textContent()).includes('02'));
 await page.locator('#openMissions').click();await page.locator('#interiorHUD').waitFor({state:'visible'});
 assert.equal(await page.locator('#interiorHUD').getAttribute('data-floor'),'2');
 await act('stairs');await page.waitForFunction(()=>document.querySelector('#interiorHUD')?.dataset.floor==='1');
 await act('exit');await page.locator('#interiorHUD').waitFor({state:'hidden'});
 console.log('PASS upper-floor stair access, room portal, correct return floor, exit');
 await page.locator('#buildingDirectoryToggle').click();
 await page.locator('[data-building-route="hall-1"]').click();
 await enter('hall-1');
 await act('talk');
 assert(await page.locator('[data-interior-walk="room"]').isHidden());
 await page.screenshot({path:'qa-codequest/interior-community.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa-codequest/interior-mobile.png'});
 assert(await page.locator('#interiorHUD').isVisible());
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cq-interiors-v6')));
 assert(saved.visited.includes('room-01:1')&&saved.visited.includes('room-02:2')&&saved.visited.includes('hall-1:1'));
 assert(saved.talked.includes('hall-1:1'));
 assert.deepEqual(errors,[]);
 console.log('PASS community building, saved exploration and mobile');
}finally{await browser.close();}
