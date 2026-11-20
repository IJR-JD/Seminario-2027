/* Contract QA: Interactive visual pedagogy (pure JS, SVG + accessibility). */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('projects/game-visual-lab.html'),script=read('projects/game-visual-lab.js');
const academy=read('projects/godot-2d-3d-academy.html'),guide=read('projects/game-development-guide.html'),projects=read('projects/index.html');
new vm.Script(script,{filename:'projects/game-visual-lab.js'});
assert.ok(html.includes('src="game-visual-lab.js"'),'Missing animation controller');
for(const id of ['tabs','viz','play','step','reset','speed','speedValue','explanation','code','challenge','observation']){
 assert.ok(html.includes('id="'+id+'"'),'Missing interactive control '+id);
}
for(const slug of ['loop','vectors','collision','ai','sprites','3d','scene']){
 assert.ok(script.includes("slug:'"+slug+"'"),'Missing concept: '+slug);
}
assert.equal((script.match(/slug:'/g)||[]).length,7,'Expected exactly seven visual lessons');
assert.ok(script.includes('requestAnimationFrame')&&script.includes("visibilitychange"),'Animation loop should pause on hidden tab');
assert.ok(script.includes('prefers-reduced-motion'),'Respect user reduced-motion preference');
assert.ok(html.includes('aria-live="polite"')&&html.includes('role="tablist"'),'Accessible controls required');
assert.ok(academy.includes('<iframe src="game-visual-lab.html"')&&academy.includes('id="visuales"'),'Embed missing from Godot academy');
assert.ok(guide.includes('href="game-visual-lab.html"')&&projects.includes('href="game-visual-lab.html"'),'Links missing from game entrypoints');
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/.test(script),'No network/identifiable user storage');
console.log('PASS seven interactive SVG lessons, source JS syntax, controls, embeds, links, accessible labels');
