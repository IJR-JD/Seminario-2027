import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shrines,travelGates,circuits,traps,wallLane,groundSafe,airSafe,onWallLane,trapActive,restoreProgress,padResult,routeAdventure,segmentSafe,buildingFootprints,flightLimit,dashDuration,dashCooldown} from '../projects/codequest-rpg/island-adventure.mjs';
import {allRoomLocations} from '../projects/codequest-rpg/island-villages.mjs';
assert.equal(shrines.length,3);
assert.equal(travelGates.length,4);
assert.equal(circuits.length,4);
assert.equal(traps.length,4);
for(const p of [...shrines,...travelGates,...circuits,...circuits.flatMap(c=>[...c.steps,c.reward]),...traps]){
 assert(groundSafe(p.x,p.z),'Unsafe adventure landmark '+JSON.stringify(p));
}
for(const g of travelGates){
 assert.equal(travelGates.find(t=>t.id===g.to)?.to,g.id,'Portal pair must be reciprocal');
 assert(groundSafe(g.x,g.z+1.8),'Destination must be safe');
}
for(const c of circuits){
 assert.equal(c.steps.length,3);
 assert(c.requires===undefined||shrines.some(s=>s.id===c.requires));
 assert.deepEqual(padResult(0,1,3),{next:0,complete:false,wrong:true});
 assert.deepEqual(padResult(0,0,3),{next:1,complete:false,wrong:false});
 assert.deepEqual(padResult(1,0,3),{next:1,complete:false,wrong:false});
 assert.deepEqual(padResult(2,2,3),{next:3,complete:true,wrong:false});
}
assert(!groundSafe(48,0));assert(airSafe(48,0));assert(!airSafe(150,110));
assert(onWallLane(wallLane.sideX,51));assert(!onWallLane(wallLane.sideX,80));
assert(!groundSafe(wallLane.x,51));assert(groundSafe(wallLane.sideX,51));
assert(trapActive({phase:0},0));assert(!trapActive({phase:0},1.6));assert(trapActive({phase:0},3.2));
assert.equal(flightLimit,6);assert(dashCooldown>dashDuration);
assert.deepEqual(restoreProgress({powers:['dash','dash','bad'],circuits:['wind','bad'],setbacks:-5}),{powers:['dash'],circuits:['wind'],setbacks:0});
for(const b of buildingFootprints)assert(!groundSafe(b.x,b.z),'Solid facade collision missing');
const rooms=allRoomLocations();
assert.equal(rooms.length,22);
for(const room of rooms)assert(groundSafe(room.x,room.z+(room.upper?2.7:1.15)),'Room approach obstructed');
function verifyRoute(from,to){
 const route=routeAdventure(from,to);assert.deepEqual(route.at(-1),to);let previous=from;
 for(const p of route){assert(segmentSafe(previous,p),'Path crosses a solid building or river');previous=p;}
}
verifyRoute({x:-105,z:-66.85},{x:-63,z:-53.65});
verifyRoute({x:-105,z:-66.85},{x:-112,z:-55});
verifyRoute({x:-88,z:59.15},{x:-91,z:43});
verifyRoute({x:65,z:-68.85},{x:48,z:-51});
verifyRoute({x:-88,z:59.15},{x:-57,z:35});
verifyRoute({x:-112,z:-55},{x:60,z:19});
const world=readFileSync(new URL('../projects/codequest-rpg/overworld.mjs',import.meta.url),'utf8');
const shell=readFileSync(new URL('../projects/codequest-rpg/index.html',import.meta.url),'utf8');
for(const name of ['animateIslandAvatar','routeAdventure','landFlight','padResult','trapActive','saveAdventure','wallRunning','activeGate','originalTowers.map'])assert(world.includes(name),'Missing integration '+name);
for(const id of ['islandAdventureToggle','adventureProgress','adventureGate','islandAdventurePanel'])assert(shell.includes('id="'+id+'"'));
console.log('PASS Adventure: 3 powers, 4 reciprocal gates, 4 ordered circuits, 4 traps, solid village paths, safe landmarks and persistence.');
