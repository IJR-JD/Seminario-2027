import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {islandBounds,islandCrossings,pythonWaystations,isIslandWalkable,planIslandRoute,trailDirection} from '../projects/codequest-rpg/island-exploration.mjs';

assert.equal(pythonWaystations.length,5);
assert.equal(new Set(pythonWaystations.map(station=>station.id)).size,pythonWaystations.length);
for(const [i,station] of pythonWaystations.entries()){
  assert(isIslandWalkable(station.x,station.z),'Waystation on water / off shore: '+station.id);
  assert(station.name&&station.clue&&station.note&&station.example&&station.concept);
  for(const other of pythonWaystations.slice(i+1)){
    assert(Math.hypot(station.x-other.x,station.z-other.z)>25,'Waystations overlap');
  }
}
assert(islandBounds.x>130&&islandBounds.z>100);
assert.deepEqual(islandCrossings,[-76,0,76]);
assert(!isIslandWalkable(35,0),'Walking on water outside a bridge should fail');
assert(isIslandWalkable(0,0.5),'Central bridge should allow crossing');
assert(!isIslandWalkable(153,110),'Outside island should be blocked');
assert.deepEqual(trailDirection({x:0,z:0},{x:10,z:-10}),{distance:14,bearing:'N · E'});

function verifyRoute(from,to){
  const nodes=[from,...planIslandRoute(from,to)];
  assert.deepEqual(nodes.at(-1),to);
  for(let i=1;i<nodes.length;i++){
    const a=nodes[i-1],b=nodes[i],length=Math.hypot(b.x-a.x,b.z-a.z);
    for(let step=0;step<=Math.ceil(length*4);step++){
      const t=step/Math.ceil(length*4);
      assert(isIslandWalkable(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t),
        'Unsafe route ('+a.x+','+a.z+') → ('+b.x+','+b.z+') at '+t);
    }
  }
}
verifyRoute({x:-70,z:-40},{x:88,z:45});
verifyRoute({x:90,z:43},{x:22,z:-62});
verifyRoute({x:-60,z:28},{x:-93,z:66});
verifyRoute({x:0,z:0},{x:40,z:25});
verifyRoute({x:-20,z:-29},{x:0,z:0});
verifyRoute({x:-76,z:0},{x:76,z:0});
verifyRoute({x:76,z:0},{x:-80,z:-42});
verifyRoute({x:90,z:55},{x:76,z:0});
verifyRoute({x:76,z:0},{x:90,z:55});
assert.throws(()=>planIslandRoute({x:153,z:124},{x:0,z:50}),/outside walkable/);

const root=resolve(import.meta.dirname,'..');
const game=readFileSync(resolve(root,'projects/codequest-rpg/overworld.mjs'),'utf8');
const shell=readFileSync(resolve(root,'projects/codequest-rpg/index.html'),'utf8');
const integration=readFileSync(resolve(root,'projects/codequest-rpg/world.js'),'utf8');
for(const needle of ['pythonWaystations','planIslandRoute','trailState','setWaypoint','onWaystation']){
  assert(game.includes(needle),'Missing world integration: '+needle);
}
for(const needle of ['islandTrailToggle','islandTrailPanel','islandTrailProgress','islandTrailList']){
  assert(shell.includes('id="'+needle+'"'),'Missing atlas control '+needle);
}
assert(integration.includes('renderPythonTrail'),'Missing trail UI');
assert(shell.includes('id="islandDpad"')&&shell.includes('data-walk="ArrowUp"'),'Touch D-pad missing');
assert(game.includes('function setMovementKey('),'Touch movement API missing');
assert(game.includes('materialCache')&&game.includes('boxGeometryCache')&&game.includes('crownGeometryCache'),
  'Overworld should share repeated resources to reduce WebGL memory');
assert(integration.includes('lostpointercapture'),'Pointer release cleanup missing');
console.log('PASS CodeQuest Island: five persistent Python waystations, bridge-safe routing and integrated atlas controls');
