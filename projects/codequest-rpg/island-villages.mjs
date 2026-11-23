// Data-driven CodeQuest villages: stable room order preserves all 22 scores and lesson IDs.
// Only 3D placement changes. A 'second floor' room requires climbing its exterior ladder.
const firstStreets=[
  [-105,-68],[-91,-68],[-77,-68],[-63,-68],
  [-105,-55],[-91,-55],[-77,-55],[-63,-55],
  [-99,-42],[-85,-42],[-71,-42],[-57,-42],
];
const meadowTopics=['Movement fundamentals','Obstacle navigation','Route planning'];
const meadowLots=firstStreets.map(([x,z],i)=>({
  x,z,topic:meadowTopics[Math.floor(i/4)],
  storeys:i%4===0?1:2,
  upper:i%4===1||i%4===3,
}));
const district=(id,name,topics,coords,anchor)=>({
  id,name,topics,anchor,
  lots:coords.map(([x,z],index)=>({
    x,z,topic:topics[index],storeys:index===0?1:2,upper:index===1,
  })),
});
export const islandDistricts=[
  {id:'meadow-trail',name:'Meadow Trail',topics:meadowTopics,anchor:{x:-84,z:-55},lots:meadowLots},
  district('sunstone-heights','Sunstone Heights',['Elevation','Phase gates'],
    [[-15,-67],[6,-65]],{x:-5,z:-66}),
  district('aether-reach','Aether Reach',['Flight','Ordered relays'],
    [[65,-70],[82,-66]],{x:73,z:-68}),
  district('signal-grove','Signal Grove',['Conditions','Prism locks'],
    [[-88,58],[-70,72]],{x:-79,z:65}),
  district('clockwork-bastion','Clockwork Bastion',['Sensors','Nested decisions'],
    [[-13,73],[10,73]],{x:-2,z:73}),
  district('ember-foundry','Ember Foundry',['Trap detection','Combined actions'],
    [[77,69],[95,66]],{x:86,z:67}),
];

// Extra two-storey houses enrich the same architectural silhouette without
// changing the mission count, grading, or portal identifiers.
export const villageHouses=[
  {x:-44,z:-69,zone:0},{x:-42,z:-52,zone:0},{x:-44,z:-34,zone:0},
  {x:26,z:-76,zone:1},{x:100,z:-72,zone:2},
  {x:-49,z:57,zone:3},{x:30,z:75,zone:4},{x:111,z:59,zone:5},
];
export const secondFloorHeight=3.35;
export const islandRoomCount=islandDistricts.reduce((count,zone)=>count+zone.lots.length,0);
export const roomLocation=(zoneIndex,localIndex)=>{
  const lot=islandDistricts[zoneIndex]?.lots[localIndex];
  if(!lot)throw Error('No CodeQuest room for zone '+zoneIndex+' at index '+localIndex);
  return lot;
};
export const allRoomLocations=()=>islandDistricts.flatMap((zone,zoneIndex)=>
  zone.lots.map((lot,localIndex)=>({...lot,zoneIndex,localIndex})));
