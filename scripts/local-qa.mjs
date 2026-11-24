import {spawnSync} from 'node:child_process';
import {root} from './local-build.mjs';
import {startServer} from './local-server.mjs';
const run=(file,env={})=>{const result=spawnSync(process.execPath,['scripts/'+file],{cwd:root,stdio:'inherit',env:{...process.env,...env}});if(result.status!==0)throw Error(file+' failed: '+(result.error??result.status));};
const unit=['qa.mjs','qa-game-visual-lab.mjs','qa-godot-academy.mjs','qa-game-guide.mjs','qa-learning-functional.mjs','qa-programming-data.mjs','qa-codequest.mjs','qa-codequest-skills.mjs','qa-codequest-island.mjs','qa-codequest-villages.mjs','qa-codequest-adventure.mjs','qa-codequest-airgear.mjs','qa-codequest-interiors.mjs','qa-codequest-vertical.mjs','qa-codequest-columns.mjs','qa-codequest-gear-wheel.mjs','qa-codequest-mobility.mjs','qa-codequest-models.mjs'];
if(process.argv.includes('--browser')||process.argv.includes('--offline')){
 const offline=process.argv.includes('--offline'),server=await startServer({dist:offline,port:0});
 // Use asynchronous child processes so the local HTTP server remains responsive.
 const {spawn}=await import('node:child_process');
 const runBrowser=(file,env={})=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/'+file],{cwd:root,stdio:'inherit',env:{...process.env,QA_BASE:'http://127.0.0.1:'+server.address().port,...env}});child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(file+' failed: '+code)));});
 try{
  if(offline)await runBrowser('qa-local-offline.mjs');
  else{
   for(const file of ['qa-codequest-browser.mjs','qa-codequest-adventure-browser.mjs','qa-codequest-airgear-browser.mjs','qa-codequest-interiors-browser.mjs','qa-codequest-vertical-browser.mjs','qa-codequest-mobility-browser.mjs','qa-codequest-equipment-browser.mjs'])await runBrowser(file);
   for(const [start,end] of [[0,8],[8,15],[15,22]])await runBrowser('qa-codequest-room-studio.mjs',{QA_ROOM_START:String(start),QA_ROOM_END:String(end)});
  }
 }finally{await new Promise(resolve=>server.close(resolve));}
}else{for(const file of unit)run(file);console.log('PASS '+unit.length+' local source/model suites');}
