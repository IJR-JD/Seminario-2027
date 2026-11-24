import assert from 'node:assert/strict';
import {buildings,themes,landmarks,floorPlan,indoorSafe,indoorSegment,indoorRoute,nearestInteriorAction,loadInteriorProgress,floorKey} from '../projects/codequest-rpg/island-interiors.mjs';
import {groundSafe,routeAdventure,segmentSafe} from '../projects/codequest-rpg/island-adventure.mjs';
assert.equal(buildings.length,30);assert.equal(themes.length,6);assert.equal(new Set(buildings.map(b=>b.id)).size,30);
const rooms=[],floorIds=[];
for(const b of buildings){
 assert(groundSafe(b.x,b.z+1.7),'Exterior entry obstructed: '+b.id);
 for(let f=1;f<=b.storeys;f++){
  const p=floorPlan(b,f);floorIds.push(floorKey(b.id,f));
  if(p.room!==null){rooms.push(p.room);assert.equal(f,b.upper?2:1);}
  assert(p.npc.name&&p.npc.line);assert(indoorSafe(p,landmarks.entry.x,landmarks.entry.z));
  for(const o of p.obstacles)assert(!indoorSafe(p,o.x,o.z));
  const targets=[['talk',landmarks.npc],...(p.stairs?[['stairs',landmarks.stairs]]:[]),...(p.exit?[['exit',landmarks.exit]]:[]),...(p.room!==null?[['room',landmarks.portal]]:[])];
  for(const [action,t] of targets){
   assert(indoorSafe(p,t.x,t.z),b.id+' '+action+' obstructed');
   assert.equal(nearestInteriorAction(p,t),action);
   const route=indoorRoute(p,landmarks.entry,t);assert(route.length,b.id+' '+action+' unreachable');
   assert.deepEqual(route.at(-1),t);let prev=landmarks.entry;
   for(const n of route){assert(indoorSegment(p,prev,n));prev=n;}
   for(const [_,u] of targets)assert(indoorRoute(p,t,u).length,'No return route '+b.id);
  }
 }
}
assert.deepEqual(rooms.sort((a,b)=>a-b),Array.from({length:22},(_,i)=>i));assert.equal(floorIds.length,52);
assert.deepEqual(loadInteriorProgress({visited:[floorIds[0],floorIds[0],'bad'],talked:[floorIds[1],'bad']}),{visited:[floorIds[0]],talked:[floorIds[1]]});
console.log('PASS Living Interiors: 30 buildings, 52 floors, 52 residents, all 22 mission portals on correct floors, obstacle-safe routes and persistence.');
