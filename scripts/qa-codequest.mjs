import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..');
const source=readFileSync(resolve(root,'projects/codequest-rpg/world.js'),'utf8');
const html=readFileSync(resolve(root,'projects/codequest-rpg/index.html'),'utf8');
const css=readFileSync(resolve(root,'projects/codequest-rpg/world.css'),'utf8');
assert(html.includes('src="./world.js"')&&html.includes('href="./world.css"'),'Game resources missing');
assert(html.includes('id="guideOverlay"')&&html.includes('id="editor"'),'Beginner guide and editor missing');
assert(html.includes('up = 1'),'The guide must include a non-solution syntax example');
assert(css.includes('.app.appWide')&&css.includes('min-height:390px'),'Game and editor must be expansive');
const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});
assert.equal(syntax.status,0,'Source JS syntax error: '+syntax.stderr);

const a=source.indexOf('const levels='),b=source.indexOf(';\nconst heroDefaults',a);
assert(a>=0&&b>a,'Missing mission definitions');
const levels=runInNewContext(source.slice(a+'const levels='.length,b));
assert.equal(levels.length,12);
const key=(x,z)=>x+','+z;
const dirs=[[1,0],[-1,0],[0,-1],[0,1]];

const parserStart=source.indexOf('const parserTokenize='),parserEnd=source.indexOf('function setActorPosition(',parserStart);
assert(parserStart>=0&&parserEnd>parserStart,'Movement interpreter missing');
const language=source.slice(parserStart,parserEnd);
const interpreter=runInNewContext(language+';({compile,evaluate})');
assert.deepEqual(Array.from(interpreter.compile('up = 1\nright = 3')).map(x=>x.name),['up','right']);
assert.equal(interpreter.evaluate('right + 2',{right:3}),5);
assert.equal(interpreter.evaluate('2 ** 3',{}),8);
for(const sourceCode of ['move("right", 2)','collect()','steps = 4','for i in range(4):','right = 2\nattack(5)']){
 assert.throws(()=>interpreter.compile(sourceCode),'Invalid beginner code accepted: '+sourceCode);
}

for(const [index,level] of levels.entries()){
 assert.equal(Object.hasOwn(level,'code'),false,'Level '+(index+1)+' exposes a solution');
 assert(level.hint&&!/move\(|collect\(|\b(?:up|right|left|down)\s*=\s*\d/.test(level.hint),'Hint exposes commands');
 assert(level.start.length===2&&level.goal.length===2);
 const blocked=new Set(level.obstacles.map(([x,z])=>key(x,z)));
 const pointSet=(p,i)=>p.map(([x,z],j)=>key(x,z)+':'+j);
 assert(!blocked.has(key(...level.start))&&!blocked.has(key(...level.goal)));
 const points=[...level.crystals.map(p=>p.join(',')),...level.checkpoints.map(p=>p.join(','))];
 const full=(1<<points.length)-1;
 const flag=(x,z,mask)=>{for(let j=0;j<points.length;j++)if(points[j]===key(x,z))mask|=1<<j;return mask};
 const queue=[[...level.start,flag(...level.start,0)]];
 const visited=new Set([queue[0].join(',')]);
 let reached=false;
 for(let n=0;n<queue.length;n++){
  const [x,z,mask]=queue[n];
  if(x===level.goal[0]&&z===level.goal[1]&&mask===full){reached=true;break}
  for(const [dx,dz] of dirs){const nx=x+dx,nz=z+dz;
   if(nx<0||nx>8||nz<0||nz>8||blocked.has(key(nx,nz)))continue;
   const next=[nx,nz,flag(nx,nz,mask)],name=next.join(',');
   if(!visited.has(name)){visited.add(name);queue.push(next)}
  }
 }
 assert(reached,'Unsolvable movement level '+(index+1));
 console.log('PASS Level '+String(index+1).padStart(2,'0')+' '+level.title+' · reachable, no solution exposed');
}
console.log('PASS CodeQuest: 12/12 navigable levels, variables-only interpreter, guide and expanded UI');
