import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..');
const source=readFileSync(resolve(root,'projects/codequest-rpg/world.js'),'utf8');
const html=readFileSync(resolve(root,'projects/codequest-rpg/index.html'),'utf8');
const css=readFileSync(resolve(root,'projects/codequest-rpg/world.css'),'utf8');
assert(html.includes('src="./world.js"'),'Game script must be loaded');
assert(html.includes('href="./world.css"'),'Game style must be loaded');
assert(css.includes('.world')&&css.includes('.heroModal'),'Game world and character creator styled');
const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});
assert.equal(check.status,0,'JavaScript syntax error: '+check.stderr);
const begin=source.indexOf('const levels='),end=source.indexOf(';\nconst heroDefaults',begin);
assert(begin>=0&&end>begin,'Mission data section missing');
const levels=runInNewContext(source.slice(begin+'const levels='.length,end));
assert.equal(levels.length,12,'Expected 12 increasing missions');
const k=p=>p.join(',');
const directions={right:[1,0],left:[-1,0],forward:[0,-1],back:[0,1]};
function evaluate(exp,scope){const trimmed=exp.trim();const replaced=trimmed.replace(/\b[A-Za-z_]\w*\b/g,name=>{assert(Object.hasOwn(scope,name),'Undefined '+name);return '('+scope[name]+')'});assert(/^[\d()\s.+*/-]+$/.test(replaced),'Disallowed expression '+exp);const value=Function('"use strict";return ('+replaced+')')();assert(Number.isFinite(value));return value}
for(const [index,mission] of levels.entries()){
  const blocked=new Set(mission.obstacles.map(k)),crystals=new Set(),checkpoints=new Set(),vars={},position=[...mission.start];let arith=false,steps=0;
  assert(mission.title&&mission.zone&&mission.theme&&mission.code,'Incomplete mission '+index);
  assert(!blocked.has(k(mission.start))&&!blocked.has(k(mission.goal)),'Blocked start/goal '+index);
  const lines=mission.code.split('\n');
  for(const raw of lines){const line=raw.trim();if(!line)continue;
    let m=line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if(m){vars[m[1]]=evaluate(m[2],vars);if(/[+\-*/]/.test(m[2]))arith=true;continue}
    m=line.match(/^move\("(right|left|forward|back)"(?:,\s*(.+))?\)$/);
    if(m){const n=evaluate(m[2]||'1',vars);assert(Number.isInteger(n)&&n>=1&&n<=12,'Invalid move distance');for(let j=0;j<n;j++){position[0]+=directions[m[1]][0];position[1]+=directions[m[1]][1];assert(position.every(v=>v>=0&&v<9),'Out of bounds at '+index+': '+k(position));assert(!blocked.has(k(position)),'Obstacle collision at '+index+': '+k(position));mission.checkpoints.forEach((p,j)=>{if(k(p)===k(position))checkpoints.add(j)});steps++}continue}
    if(line==='collect()'){const ci=mission.crystals.findIndex(p=>k(p)===k(position));assert(ci>=0,'Empty collection at '+index);crystals.add(ci);continue}
    assert.fail('Unsupported starter command '+line);
  }
  assert.equal(k(position),k(mission.goal),'Wrong finish in level '+(index+1));
  assert.equal(crystals.size,mission.crystals.length,'Crystal missing in level '+(index+1));
  assert.equal(checkpoints.size,mission.checkpoints.length,'Waypoint missing in level '+(index+1));
  for(const variable of mission.require){assert(variable in vars,'Missing declared variable '+variable);assert(lines.some(l=>l.startsWith('move(')&&new RegExp('\\b'+variable+'\\b').test(l)),'Variable not used for movement '+variable)}
  if(mission.arithmetic)assert(arith,'Arithmetic lesson has no arithmetic');
  assert(steps<=75,'Program exceeds movement limit');
  console.log('PASS Level '+String(index+1).padStart(2,'0')+' '+mission.title+' · '+steps+' steps');
}
console.log('PASS CodeQuest: 12/12 real route examples, syntax, source integration');
