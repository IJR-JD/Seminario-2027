import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {isIslandWalkable,pythonWaystations} from '../projects/codequest-rpg/island-exploration.mjs';
import {islandDistricts,villageHouses,secondFloorHeight,islandRoomCount,
  allRoomLocations,roomLocation} from '../projects/codequest-rpg/island-villages.mjs';

const rooms=allRoomLocations();
assert.equal(islandDistricts.length,6,'Preserve the six original districts');
assert.equal(islandRoomCount,22,'Original 22 rooms must keep stable identifiers');
assert.equal(rooms.length,22);
assert.equal(villageHouses.length,8,'Add exactly eight extra town buildings');
assert.equal(rooms.filter(room=>room.upper).length,11,'Eleven lessons should have an accessible upper-floor door');
assert(rooms.filter(room=>room.storeys===2).length>=14);
assert.equal(secondFloorHeight,3.35);
assert.equal(new Set(rooms.map(room=>room.x+','+room.z)).size,22);
assert.equal(new Set(islandDistricts.map(district=>district.id)).size,6);
assert.deepEqual(islandDistricts.map(zone=>zone.lots.length),[12,2,2,2,2,2]);
for(const [zoneIndex,zone] of islandDistricts.entries()){
  assert.equal(new Set(zone.lots.map(room=>room.topic)).size,zone.topics.length);
  const xs=zone.lots.map(lot=>lot.x),zs=zone.lots.map(lot=>lot.z);
  assert(Math.max(...xs)-Math.min(...xs)<60,'District must stay clustered in X');
  assert(Math.max(...zs)-Math.min(...zs)<45,'District must stay clustered in Z');
  for(const [localIndex,room] of zone.lots.entries()){
    assert.equal(roomLocation(zoneIndex,localIndex),room);
    assert(room.storeys===1||room.storeys===2);
    assert(!room.upper||room.storeys===2,'Upper portal requires a full second floor');
  }
}
for(const house of [...rooms,...villageHouses]){
  for(const z of [house.z-2.7,house.z,house.z+2.15,house.z+3.1]){
    assert(isIslandWalkable(house.x,z),'Building, door, ladder or approach off safe terrain: '+JSON.stringify(house));
  }
}
for(const [i,house] of rooms.entries()){
  for(const other of rooms.slice(i+1)){
    assert(Math.hypot(house.x-other.x,house.z-other.z)>=12.9,
      'Room houses overlap: '+JSON.stringify(house)+' / '+JSON.stringify(other));
  }
}
for(const [i,house] of villageHouses.entries()){
  for(const other of villageHouses.slice(i+1)){
    assert(Math.hypot(house.x-other.x,house.z-other.z)>12,'Decorative houses overlap');
  }
  for(const room of rooms){
    assert(Math.hypot(house.x-room.x,house.z-room.z)>12,
      'Decorative house blocks a room: '+JSON.stringify(house));
  }
}
for(const station of pythonWaystations){
  for(const house of rooms){
    assert(Math.hypot(house.x-station.x,house.z-station.z)>8,'Building blocks Python Trail monument '+station.id);
  }
}

const root=resolve(import.meta.dirname,'..');
const game=readFileSync(resolve(root,'projects/codequest-rpg/overworld.mjs'),'utf8');
const logic=readFileSync(resolve(root,'projects/codequest-rpg/world.js'),'utf8');
const html=readFileSync(resolve(root,'projects/codequest-rpg/index.html'),'utf8');
for(const required of ['addVillageHouse','roomLocation(zoneIndex,j)','towerFloor(towers[ladderIndex])',
  'deck===item.deck','portal?.upper?2.7','ladderIndex=towers.length','districtMap:']){
  assert(game.includes(required),'World integration missing '+required);
}
assert(logic.includes('roomLots=allRoomLocations()'),'Directory not mapped by topic');
assert(logic.includes('button.dataset.floor'),'Directory does not identify upper floors');
assert(html.includes('F climb to second floors'),'Missing student ladder guidance');
console.log('PASS CodeQuest villages: 22 rooms, six topic clusters, eight extra houses, eleven accessible upper floors, safe placements.');
