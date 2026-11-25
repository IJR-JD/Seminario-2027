/* Real browser QA for the optional CodeQuest Python Trail.
   Runs against locally served PR files, with pinned local Three.js imports. */
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';

const origin=process.env.QA_BASE||'http://127.0.0.1:8765';
const url=origin+'/projects/codequest-rpg/';
mkdirSync('qa-codequest',{recursive:true});
const browser=await chromium.launch({
  headless:true,
  args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']
});
const errors=[];
async function prepare(page){
  page.on('pageerror',error=>errors.push(String(error.message||error)));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',route=>{
    const location=route.request().url();
    const relative=location.split('/three@0.170.0/')[1];
    if(!relative||relative.includes('..'))return route.abort();
    return route.fulfill({path:resolve('node_modules/three',relative),contentType:'application/javascript'});
  });
}
async function openIsland(page){
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:30000});
  await page.locator('#continueAdventure').click();
  await page.locator('#missionPicker[open]').waitFor({timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#islandTrailProgress')?.textContent.includes('5 Python Trail'),null,{timeout:15000});
  assert(await page.locator('#overworldStage').isVisible(),'WebGL island must render, not fall back to text list');
  assert((await page.locator('#overworldCanvas').evaluate(canvas=>canvas.width))>0,'WebGL canvas has no width');
  assert.equal(await page.locator('#overworldCanvas').getAttribute('data-map-ready'),'true','Physical world initialization must complete');
}
try{
  const desktop=await browser.newPage({viewport:{width:1440,height:900}});
  await prepare(desktop);
  console.log('QA desktop: island ready');
  await openIsland(desktop);
  await desktop.waitForFunction(()=>document.querySelector('#overworldCanvas')?.dataset.release==='8.5-equipment');
  const metrics=await desktop.locator('#overworldCanvas').evaluate(c=>({...c.dataset}));
  assert(Number(metrics.visibleLabels)<=6);assert(Number(metrics.triangles)>0);assert(Number(metrics.renderRatio)>0);console.log('PASS live renderer diagnostics '+JSON.stringify(metrics));
  assert(Number(metrics.columns)>=144,'Registered solid columns');
  const wheel=desktop.locator('#gearWheel');
  await desktop.locator('#overworldCanvas').focus();await desktop.keyboard.down('Tab');
  await wheel.waitFor({state:'visible'});
  assert.equal(await wheel.locator('[data-gear]').count(),8);
  assert.equal(await wheel.locator('.gearWedge').count(),8);
  assert.equal(await wheel.locator('[data-gear][data-state="ready"]').count(),8);
  assert.equal(await wheel.locator('[data-gear="dash"]').getAttribute('data-state'),'ready');
  assert.equal(await wheel.locator('[data-gear="hover"]').getAttribute('data-state'),'ready');
  assert.equal(await wheel.locator('[data-gear="rover"]').getAttribute('data-state'),'ready');
  await desktop.keyboard.press('ArrowRight');
  assert.equal(await wheel.locator('[data-gear="dash"]').getAttribute('aria-pressed'),'true');
  await desktop.keyboard.press('Escape');await desktop.keyboard.up('Tab');
  assert(await wheel.isHidden());assert(await desktop.locator('#missionPicker').evaluate(e=>e.open));
  await desktop.keyboard.down('Tab');await wheel.waitFor({state:'visible'});await desktop.keyboard.up('Tab');assert(await wheel.isHidden());
  await desktop.screenshot({path:'qa-codequest/wheel-closed.png'});
  await desktop.locator('#gearWheelToggle').click();await wheel.waitFor({state:'visible'});await desktop.screenshot({path:'qa-codequest/wheel-desktop.png'});
  await wheel.locator('#gearCancel').click();
  console.log('PASS hold Tab, cancel, release without selection, all gear available and click access');
  await desktop.locator('#overworldCanvas').focus();
  await desktop.keyboard.down('d');await desktop.keyboard.down('w');
  try{await desktop.waitForFunction(()=>Number(document.querySelector('#overworldCanvas').dataset.columnContacts)>0,null,{timeout:12000});}finally{await desktop.keyboard.up('d');await desktop.keyboard.up('w');}
  console.log('PASS actual player contact with a porch column: '+await desktop.locator('#overworldCanvas').getAttribute('data-column-contact'));
  await desktop.screenshot({path:'qa-codequest/column-contact.png'});
  await openIsland(desktop);
  await desktop.locator('#islandDirectoryToggle').click();
  assert.equal(await desktop.locator('#levelList .missionCard').count(),22);
  assert.equal(await desktop.locator('#levelList .missionCard[data-floor="2"]').count(),11,
    'Exactly eleven rooms should be on accessible upper floors');
  assert.equal(await desktop.locator('#levelList .missionCard[data-floor="1"]').count(),11);
  await desktop.locator('#islandDirectoryToggle').click();
  await desktop.locator('#islandTrailToggle').click();
  assert.equal(await desktop.locator('#islandTrailList .islandTrailEntry').count(),5,'Five Atlas entries');
  await desktop.locator('#islandTrailList button').first().click();
  assert.equal(await desktop.locator('#islandTrailList button').first().getAttribute('aria-pressed'),'true');
  assert.equal(await desktop.locator('#islandTrailPanel').isVisible(),false,'Selected waypoint should reveal the world');
  await desktop.waitForFunction(()=>document.querySelector('#islandTrailDistance')?.textContent.includes('Variable Spring'));
  await desktop.locator('#islandCamera').click();
  assert.equal(await desktop.locator('#islandCamera').getAttribute('aria-pressed'),'true','Map mode toggles');
  await desktop.screenshot({path:'qa-codequest/island-desktop.png'});
  await desktop.locator('#islandTrailToggle').click();
  await desktop.locator('#islandDirectoryToggle').click();
  assert.equal(await desktop.locator('#levelList .missionCard').count(),22,'All 22 existing room doors remain in directory');
  await desktop.evaluate(()=>localStorage.setItem('cq-island-python-trail-v1',JSON.stringify(['variable-spring'])));
  await desktop.reload({waitUntil:'domcontentloaded'});
  await desktop.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0);
  await desktop.locator('#continueAdventure').click();
  await desktop.locator('#islandTrailToggle').click();
  assert((await desktop.locator('#islandTrailProgress').textContent()).includes('1 / 5'),'Discovery survives reload');
  assert((await desktop.locator('#islandTrailList .islandTrailEntry').first().textContent()).includes('distance = 4'),'Found landmark unlocks Python example');

  console.log('QA desktop: checking second-floor access via exterior ladder');
  // End-to-end second-floor challenge: there must be no interaction from ground level.
  // Start at Room 02's exterior ladder, climb in the real 3D scene, then enter the door.
  await desktop.evaluate(()=>localStorage.setItem('ijr-codequest-world-v2',
    JSON.stringify({level:1,completed:[],bestSteps:{}})));
  await desktop.reload({waitUntil:'domcontentloaded'});
  await desktop.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0);
  await desktop.locator('#continueAdventure').click();
  await desktop.waitForFunction(()=>document.querySelector('#islandTraversalStatus')?.textContent.includes('Ladder nearby'),
    null,{timeout:12000});
  assert(await desktop.locator('#enterPortal').isHidden(),'Upper-floor room must not open from the ground');
  await desktop.locator('#overworldCanvas').press('f');
  await desktop.waitForFunction(()=>document.querySelector('#portalStatus')?.textContent.includes('A Name for Distance'),
    null,{timeout:18000});
  assert(await desktop.locator('#enterPortal').isVisible(),'Climbing must expose the upper-floor door');
  assert((await desktop.locator('#doorStars').textContent()).includes('2F'),'Portal prompt must identify the second floor');
  await desktop.screenshot({path:'qa-codequest/island-upper-entrance.png'});
  await desktop.locator('#overworldCanvas').press('Enter');
  await desktop.locator('#missionPicker').waitFor({state:'hidden',timeout:8000});
  assert((await desktop.locator('#worldTitle').textContent()).includes('A Name for Distance'),
    'Room 02 must be accessible from the upstairs balcony');
  // Open the eight-group atlas and select a room, then re-open the 3D map.
  await desktop.locator('#navAtlas').click();
  assert.equal(await desktop.locator('#regionLinks button').count(),8);
  assert.equal(await desktop.locator('#levelList .missionCard').count(),22);
  await desktop.locator('#levelList .missionCard:visible').first().click();
  await desktop.locator('#missionPicker').waitFor({state:'hidden'});
  await desktop.locator('#navLevels').click();
  assert(await desktop.locator('#overworldStage').isVisible(),'3D island must reopen after direct mission selection');
  assert.equal(await desktop.locator('#overworldCanvas').getAttribute('data-map-ready'),'true');
  await desktop.locator('#islandCamera').click();
  assert.equal(await desktop.locator('#islandCamera').getAttribute('aria-pressed'),'true');
  console.log('PASS direct atlas selection and reopened 3D world map');
  await desktop.close();

  console.log('QA mobile: touch controls and district atlas');
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await prepare(mobile);
  await openIsland(mobile);
  await mobile.locator('#gearWheelToggle').tap();await mobile.locator('#gearWheel').waitFor({state:'visible'});await mobile.screenshot({path:'qa-codequest/wheel-mobile.png'});await mobile.locator('#gearCancel').tap();
  const forward=mobile.locator('#islandDpad [data-walk="ArrowUp"]');
  assert(await forward.isVisible(),'Touch D-pad should be visible on coarse pointers');
  const box=await forward.boundingBox();
  await mobile.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await mobile.mouse.down();
  assert.equal(await forward.getAttribute('data-active'),'true','Held pointer activates movement');
  await mobile.mouse.up();
  assert.equal(await forward.getAttribute('data-active'),'false','Released pointer stops movement');
  await mobile.locator('#islandTrailToggle').click();
  assert.equal(await mobile.locator('#islandTrailList .islandTrailEntry').count(),5);
  await mobile.screenshot({path:'qa-codequest/island-mobile.png'});
  await mobile.locator('#islandTrailToggle').click();
  await mobile.screenshot({path:'qa-codequest/island-mobile-neighborhood.png'});
  await mobile.close();
  assert.deepEqual(errors,[],'No uncaught browser errors');
  console.log('PASS Chromium CodeQuest: 22 topic-clustered rooms, 11 second-floor portals, ladder entry, 3D island, persistence and mobile D-pad.');
}finally{
  await browser.close();
}
