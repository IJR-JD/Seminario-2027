/* QA for Game Lab tutorial and executable demo. Run: node scripts/qa-game-guide.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('projects/index.html');
const guide=read('projects/game-development-guide.html');
const demo=read('projects/game-example/index.html');
const scope=read('projects/game-curriculum.js');
const project=read('projects/projects.js');
const scripts=[...demo.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
assert.equal(scripts.length,1,'Demo requires exactly one inline JS program');
new vm.Script(scripts[0],{filename:'game-example/index.html:inline'});
new vm.Script(scope,{filename:'projects/game-curriculum.js'});
for(const item of ['gameCurriculum','game-development-guide.html','game-example/','game-curriculum.js']){
 assert.ok(page.includes(item),'Missing game integration: '+item);
}
assert.ok(project.includes('IJR_2027_RENDER_GAME_LAB'),'Existing Game Lab must remain active');
for(const item of ['id="entorno"','id="diseno"','id="ia"','id="pruebas"','id="publicacion"','id="evaluacion"']){
 assert.ok(guide.includes(item),'Missing tutorial section: '+item);
}
for(const item of ['function findPath(','function updateAI(','function reset(','requestAnimationFrame(frame)','id="game"']){
 assert.ok(demo.includes(item),'Missing executable demo feature: '+item);
}
assert.ok(!/<script[^>]+src=/i.test(demo),'Game example must not depend on CDN scripts');
assert.ok(!/(fetch\s*\(|localStorage|sessionStorage)/.test(scripts[0]),'Demo must not transmit or persist student data');
assert.ok(guide.includes('docs.phaser.io'),'Must link primary Phaser source');
console.log('PASS Game Guide: page links, complete curriculum, executable JS syntax, FSM + BFS, no CDN or student storage');
