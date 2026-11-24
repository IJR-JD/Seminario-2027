/* Room Studio browser regression, all 22 room states plus desktop/tablet/mobile.
   Seed only the browser-local room index, not the gameplay engine. */
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
const base=process.env.QA_BASE||'http://127.0.0.1:8765';
mkdirSync('qa-codequest',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1366,height:768}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',route=>{
  const relative=route.request().url().split('/three@0.170.0/')[1];
  if(!relative||relative.includes('..'))return route.abort();
  return route.fulfill({path:resolve('node_modules/three',relative),contentType:'application/javascript'});
});
await page.addInitScript(()=>{
  const value=new URL(location.href).searchParams.get('qaRoom');
  if(value!==null)localStorage.setItem('ijr-codequest-world-v2',JSON.stringify({level:Number(value),completed:[],bestSteps:{}}));
});
async function room(index){
  await page.goto(base+'/projects/codequest-rpg/?qaRoom='+index,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(index=>document.querySelector('#levelIndex')?.textContent.startsWith(String(index+1).padStart(2,'0')+' / ')&&document.querySelector('#commandPalette')?.children.length>0,index,{timeout:30000});
  // Bypass onboarding only to measure the current room; actual portal entry is
  // already covered by qa-codequest-browser.mjs.
  await page.evaluate(()=>document.querySelector('#intro').hidden=true);
  await page.waitForFunction(()=>document.querySelector('#gameCanvas')?.width>0);
}
async function measure(){
  return await page.evaluate(()=>{
    const b=id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    return {view:{w:innerWidth,h:innerHeight},canvas:b('cameraStage'),dock:b('commandDock'),run:b('runCode'),editor:b('editor'),scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight};
  });
}
async function desktopCheck(index){
  const m=await measure();
  assert(m.canvas.w/m.view.w>=.62,'Room '+(index+1)+' canvas width: '+JSON.stringify(m));
  assert(m.canvas.h/m.view.h>=.68,'Room '+(index+1)+' canvas height: '+JSON.stringify(m));
  assert(m.dock.x>=m.canvas.right-1,'Command panel must be right of viewport');
  assert(m.run.bottom<=m.view.h+1&&m.run.y>=0,'Run button must stay on-screen: '+JSON.stringify(m));
  assert(m.editor.h>=90,'Usable editor height: '+JSON.stringify(m));
  assert(m.scrollWidth<=m.view.w+1,'No horizontal page scrolling');
  assert(m.scrollHeight<=m.view.h+2,'No desktop page vertical scrolling');
  return m;
}
try{
  const start=Number(process.env.QA_ROOM_START||0),end=Number(process.env.QA_ROOM_END||22);
  if(start===0){
  await room(0);
  let m=await desktopCheck(0);
  console.log('Room 01 at 1366x768:',JSON.stringify(m));
  await page.screenshot({path:'qa-codequest/room-studio-beginner.png'});
  const normal=m.canvas.w;
  await page.locator('#focusRoom').click();
  await page.waitForFunction(()=>document.querySelector('#roomStudio').classList.contains('roomFocus'));
  m=await measure();
  assert(m.canvas.w>normal+200,'Focus mode should increase viewport width: '+JSON.stringify(m));
  assert(await page.locator('#commandDock').isHidden());
  await page.keyboard.press('Escape');
  assert(await page.locator('#commandDock').isVisible());
  await page.locator('[data-camera="map"]').click();
  assert.equal(await page.locator('[data-camera="map"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-camera="3d"]').click();
  await page.locator('#editor').fill('right = 2');
  await page.locator('#runCode').click();
  await page.waitForFunction(()=>document.querySelector('#executionStatus')?.textContent==='MISSION COMPLETE',null,{timeout:20000});
  assert(await page.locator('#nextLevel').isVisible(),'Original progression works');
  await page.locator('#resetWorld').click();
  assert.equal(await page.locator('#executionStatus').textContent(),'READY');
  }
  // Every room is loaded into the shared layout and checked at laptop resolution.
  for(let i=Math.max(1,start);i<end;i++){
    await room(i);
    const dims=await desktopCheck(i);
    console.log('PASS room layout '+(i+1)+' '+Math.round(dims.canvas.w)+'x'+Math.round(dims.canvas.h));
    if(i===12||i===21)await page.screenshot({path:'qa-codequest/room-studio-'+(i+1)+'.png'});
  }
  if(end===22){
  await page.setViewportSize({width:1920,height:1080});
  await desktopCheck(21);
  await page.screenshot({path:'qa-codequest/room-studio-full-hd.png'});
  await page.setViewportSize({width:1024,height:768});
  await desktopCheck(21);
  await page.setViewportSize({width:390,height:844});
  const mobile=await measure();
  assert(mobile.canvas.w>=370&&mobile.canvas.h>=330,'Mobile world should be legible');
  assert(mobile.dock.y>=mobile.canvas.bottom,'Mobile command dock must stack below scene');
  assert(mobile.scrollWidth<=390,'Mobile has no horizontal scroll');
  await page.locator('#runCode').scrollIntoViewIfNeeded();
  assert(await page.locator('#runCode').isVisible());
  await page.screenshot({path:'qa-codequest/room-studio-mobile.png',fullPage:true});
  }
  assert.deepEqual(errors,[],'No unhandled browser errors');
  console.log('PASS Room Studio group '+(start+1)+'–'+end);
}finally{await browser.close();}
