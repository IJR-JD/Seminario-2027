import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.QA_BASE;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const url=route.request().url();if(url.startsWith(base+'/'))return route.continue();external.push(url);return route.abort();});
 await page.goto(base+'/Seminario-2027/projects/codequest-rpg/');
 await page.waitForFunction(()=>document.querySelector('#commandPalette')?.children.length>0,null,{timeout:45000});
 await page.locator('#continueAdventure').click();
 await page.waitForFunction(()=>document.querySelector('#overworldCanvas').dataset.release==='8.5-equipment',null,{timeout:60000});
 await page.locator('#overworldCanvas').focus();await page.keyboard.down('Tab');
 await page.locator('#gearWheel').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-gear][data-state="ready"]').count(),8);
 await page.keyboard.press('Escape');await page.keyboard.up('Tab');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const manifest=await (await page.request.get(base+'/build-manifest.json')).json();
 assert(manifest.files.some(f=>f.path==='vendor/three/build/three.module.js'));
 console.log('PASS offline CodeQuest build: local Three.js, WebGL world, eight available equipment slots, no external requests');
}finally{await browser.close();}
