import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const dir=resolve(root,'projects/codequest-rpg');
const h=readFileSync(resolve(dir,'skills.html'),'utf8');
const css=readFileSync(resolve(dir,'skills.css'),'utf8');
const js=readFileSync(resolve(dir,'skills.js'),'utf8');
const game=readFileSync(resolve(dir,'index.html'),'utf8');
assert(game.includes('href="./skills.html"'),'Missing skill studio link in game menu');
assert(h.includes('src="./skills.js"')&&h.includes('href="./skills.css"'),'Missing studio files');
assert(h.includes('href="./"'),'Missing navigation back to movement game');
assert(h.includes('id="scene"')&&h.includes('id="skillButtons"'),'Missing preview canvas or selection controls');
assert(h.includes('id="replay"')&&h.includes('id="pause"')&&h.includes('id="reset"'),'Missing playback controls');
assert(h.includes('id="creatorOverlay"'),'Missing editable hero form');
assert(css.includes('.stage')&&css.includes('.studio')&&css.includes('.classButtons'),'Missing full-size responsive studio styles');
const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:js,encoding:'utf8'});
assert.equal(check.status,0,'Syntax failure in skills.js: '+check.stderr);
const required=['combo','spin','ground','fireball','frost','meteor','dashstrike','arrows','afterimage','dash','barrier'];
for(const id of required){
 assert(js.includes("id:'"+id+"'"),'Skill missing: '+id);
}
assert(js.includes('function applyMotion('),'Motion timeline missing');
assert(js.includes("function replay("),'Replay implementation missing');
assert(js.includes("function selectClass("),'Class selection missing');
assert(js.includes("localStorage.setItem(HERO"),'Character customization not persisted');
assert(!h.includes('id="enemyHp"'),'Studio should not alter early-level combat mechanics');
console.log('PASS CodeQuest Skill Studio: 3 classes, 11 skills, 3D canvas, creator, replay, navigation, JS syntax');

const {motion,samplePose}=await import('../projects/codequest-rpg/skill-motion.js');
assert.deepEqual(Object.keys(motion).sort(),required.toSorted());
for(const id of required){
 const track=motion[id];
 const definition=js.match(new RegExp("id:'"+id+"',.*?length:([\\d.]+).*?phases:\\[([^\\]]+)\\]"));
 assert(definition,'Missing timing metadata for '+id);
 const duration=Number(definition[1]);
 assert.equal(track.phases.length,definition[2].split(',').length,id+' phase count');
 assert.equal(track.phases[0],0,id+' starts in its first phase');
 for(const times of [track.poses.map(pose=>pose[0]),track.phases,track.hits??[],track.launches??[]]){
  times.forEach((time,i)=>assert(time>=0&&time<duration&&(i===0||time>times[i-1]),id+' event order'));
 }
 track.launches?.forEach((time,i)=>assert(time<track.hits[i],id+' projectile must launch before impact'));
 for(const [time,...expected] of track.poses){
  const actual=samplePose(track,time,duration);
  expected.forEach((value,i)=>assert(Math.abs(actual[i]-value)<1e-9,id+' keyframe'));
  const before=samplePose(track,time-.00001,duration);
  const after=samplePose(track,time+.00001,duration);
  before.forEach((value,i)=>assert(Math.abs(value-after[i])<.005,id+' discontinuity'));
 }
}
console.log('PASS CodeQuest motion tracks: all 11 phase maps, keyframes and projectile timings');
