import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {runInNewContext} from 'node:vm';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..');
const source=readFileSync(resolve(root,'projects/codequest-rpg/world.js'),'utf8');
const html=readFileSync(resolve(root,'projects/codequest-rpg/index.html'),'utf8');
const css=readFileSync(resolve(root,'projects/codequest-rpg/world.css'),'utf8');
assert(html.includes('src="./world.js')&&html.includes('href="./world.css'),'Game resources missing');
assert(html.includes('id="guideOverlay"')&&html.includes('id="editor"'),'Beginner guide and editor missing');
assert(html.includes('up = 1'),'The guide must include a non-solution syntax example');
assert(css.includes('.app.appWide')&&css.includes('min-height:390px'),'Game and editor must be expansive');
const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});
assert.equal(syntax.status,0,'Source JS syntax error: '+syntax.stderr);

const a=source.indexOf('const levels='),b=source.indexOf(';\nconst classicCount',a);
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

const {abilities,directions,expedition,planMove,surfaceAt}=await import('../projects/codequest-rpg/expedition.mjs');
const expansionInterpreter=runInNewContext(language+';({compile,evaluate})');
assert.equal(expansionInterpreter.compile('jump(right, 1 + 1)',abilities)[0].kind,'jump');
assert.throws(()=>expansionInterpreter.compile('jump(right, 2)'));
assert.throws(()=>planMove(expedition[0],{x:4,z:6},'right',1,'walk',0));
assert.equal(planMove(expedition[0],{x:4,z:6},'right',2,'jump',0).end,1);
assert.throws(()=>planMove(expedition[1],{x:6,z:5},'right',1,'walk',0));
assert.equal(planMove(expedition[1],{x:6,z:5},'right',2,'dash',0).x,8);
assert.throws(()=>planMove(expedition[1],{x:6,z:2},'right',2,'dash',0));
assert.throws(()=>planMove(expedition[2],{x:4,z:8},'right',2,'fly',1));

for(const room of expedition){
  assert.notEqual(surfaceAt(room,...room.start),undefined);
  assert.notEqual(surfaceAt(room,...room.goal),undefined);
  const [x,z]=room.start;
  const queue=[{x,z,fuel:room.flightBudget??0,relays:0,items:0}];
  const visited=new Set();
  let solved=false;
  for(let i=0;i<queue.length;i++){
    const state=queue[i];
    const id=Object.values(state).join(',');
    if(visited.has(id))continue;
    visited.add(id);
    if(key(state.x,state.z)===key(...room.goal)&&state.relays===room.checkpoints.length&&state.items===(1<<room.crystals.length)-1){
      solved=true;
      break;
    }
    for(const mode of ['walk',...room.powers])for(const direction of Object.keys(directions)){
      for(let steps=1;steps<={walk:1,jump:3,dash:5,fly:6}[mode];steps++){
        let path;
        try{path=planMove(room,state,direction,steps,mode,state.fuel)}catch{continue}
        const position={x:path.x,z:path.z,fuel:state.fuel-path.cost,relays:state.relays,items:state.items};
        if(room.checkpoints[position.relays]?.join(',')===key(path.x,path.z))position.relays++;
        const crystal=room.crystals.findIndex(point=>point.join(',')===key(path.x,path.z));
        if(crystal>=0)position.items|=1<<crystal;
        queue.push(position);
      }
    }
  }
  assert(solved,'Unsolvable expedition room: '+room.title);
  console.log('PASS expedition room · '+room.title+' · traversable with its abilities and constraints');
}

const {logicRooms,compileLogic,sense,pulse,logicMove}=await import('../projects/codequest-rpg/logic.mjs');
const parsed=compileLogic('if clear(right):\n    if not danger(right):\n        right = 1\nelse:\n    down = 1',row=>row);
assert.equal(parsed[0].yes[0].negate,true);
assert.equal(parsed[0].no[0].text,'down = 1');
assert.throws(()=>compileLogic('if clear(right):\n  right = 1',row=>row),/indent/);
assert.throws(()=>compileLogic('else:\n    down = 1',row=>row),/matching/);
const state={open:new Set(),shield:false};
const [grove,lock,sentinel,core]=logicRooms;
assert.equal(sense(grove,state,{x:5,z:4},'clear','right'),false);
assert.equal(sense(grove,state,{x:5,z:2},'clear','right'),true);
assert.equal(sense(lock,state,{x:6,z:4},'locked','right'),true);
assert.throws(()=>pulse(lock,state,{x:4,z:4}),/adjacent/);
pulse(lock,state,{x:6,z:4});
assert.equal(sense(lock,state,{x:6,z:4},'locked','right'),false);
assert.equal(logicMove(lock,state,{x:6,z:4},'right',1,'walk',0).x,7);
pulse(lock,state,{x:6,z:4});
assert.throws(()=>logicMove(lock,state,{x:6,z:4},'right',1,'walk',0),/prism/);
assert.equal(sense(sentinel,state,{x:6,z:4},'danger','right'),true);
assert.throws(()=>logicMove(sentinel,state,{x:6,z:4},'right',1,'walk',0),/Sentinel/);
state.shield=true;
assert.equal(logicMove(sentinel,state,{x:6,z:4},'right',1,'walk',0).x,7);
assert.equal(logicMove(core,state,{x:4,z:7},'right',2,'jump',0).end,1);
console.log('PASS Logic Worlds: nested branches, indentation, sensors, lock state, shield and elevation.');

const {insertCommand}=await import('../projects/codequest-rpg/command-editor.mjs');
let edit=insertCommand('right = 4\nup = 2',5,5,'down = 1');
assert.equal(edit.value,'right = 4\ndown = 1\nup = 2');
assert.equal(edit.value.slice(edit.start,edit.end),'1');
edit=insertCommand('if clear(right):\n    ',21,21,'right = 1');
assert.equal(edit.value,'if clear(right):\n    right = 1');
edit=insertCommand('if clear(right):',16,16,'right = 1');
assert.equal(edit.value,'if clear(right):\n    right = 1');
edit=insertCommand('right = 6\nup = 1',0,9,'left = 1');
assert.equal(edit.value,'left = 1\nup = 1');
const [causeway,furnace]=logicRooms.slice(4);
const hazards={open:new Set(),shield:false};
assert.equal(sense(causeway,hazards,{x:3,z:5},'danger','right'),true);
assert.throws(()=>logicMove(causeway,hazards,{x:3,z:5},'right',1,'walk',0),{kind:'hit',x:4,z:5});
assert.equal(logicMove(causeway,hazards,{x:3,z:5},'right',2,'jump',0).x,5);
assert.throws(()=>logicMove(causeway,hazards,{x:5,z:5},'right',1,'walk',0),{kind:'fall',x:6,z:5});
assert.equal(logicMove(causeway,hazards,{x:5,z:5},'right',2,'jump',0).end,1);
assert.throws(()=>logicMove(furnace,hazards,{x:11,z:7},'right',2,'dash',0),{kind:'hit'});
assert.throws(()=>logicMove(furnace,hazards,{x:12,z:7},'right',2,'jump',0),{kind:'hit',x:14,z:7});
hazards.shield=true;
assert.equal(logicMove(furnace,hazards,{x:12,z:7},'right',2,'jump',0).x,14);
console.log('PASS Foundry: command selection, indentation, safe jumps, spikes, falls and shield interactions.');

assert.equal(interpreter.evaluate(interpreter.compile('right = 53')[0].value,{}),53);
assert.throws(()=>logicMove(expedition[0],hazards,{x:4,z:6},'right',1,'walk',0),{kind:'fall',x:5,z:6});
assert.throws(()=>logicMove(expedition[0],hazards,{x:4,z:6},'right',1,'jump',0),{kind:'fall',x:5,z:6});
assert.throws(()=>logicMove(expedition[0],hazards,{x:4,z:6},'right',53,'jump',0),/distance/);
console.log('PASS edge falls: long walking input, missing walk/jump landing, and ability range.');

const {starTargets,starsFor,starsText}=await import('../projects/codequest-rpg/room-stars.mjs');
for(let i=0;i<levels.length+expedition.length+logicRooms.length;i++){
 const {three,two}=starTargets(i);
 assert(Number.isInteger(three)&&three>0&&two>three);
 assert.equal(starsFor(i,three),3);
 assert.equal(starsFor(i,three+1),2);
 assert.equal(starsFor(i,two),2);
 assert.equal(starsFor(i,two+1),1);
}
assert.equal(starsText(starsFor(0,6)),'★☆☆');
console.log('PASS room ratings: thresholds for all 22 rooms and all three ratings.');

// Regression: crystal completion is independent of a beacon but never bypasses academic objectives.
const completionSource=source.slice(source.indexOf('function missionMissing('),source.indexOf('function currentMissing('));
const missing=runInNewContext(completionSource+';missionMissing');
const baseMission={goal:[7,2],crystals:[[2,5],[6,3]],checkpoints:[]};
const baseState={x:6,z:3,items:2,waypoints:0,hasArithmetic:false,conditionUsed:false};
assert.equal(missing(baseMission,baseState).length,0,'Last crystal should complete without beacon');
assert.equal(missing(baseMission,{...baseState,items:1}).length,1,'Missing crystal must block completion');
assert.equal(missing({...baseMission,checkpoints:[[1,2]]},baseState).length,1,'Missing relay must block completion');
assert.equal(missing({...baseMission,arithmetic:true,conditional:true},baseState).length,2,'Academic objectives must block completion');
assert.equal(missing({...baseMission,crystals:[]},{...baseState,items:0}).length,1,'Non-crystal rooms still require beacon');
assert.equal(missing({...baseMission,crystals:[]},{...baseState,x:7,z:2,items:0}).length,0);
assert(source.includes('runId===activeRun&&!crystalMissionReady()'),'Remaining steps must stop on completion');
assert(source.includes('if(direct){portalEntered(i);return;}'),'Direct room selection missing');
console.log('PASS crystal completion regression and Mission Atlas integration');
