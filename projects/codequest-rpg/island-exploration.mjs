// Pure world geometry and optional Python Trail content. No Three.js dependency: safe for Node QA.
export const islandBounds={x:153,z:124};
export const islandCrossings=[-76,0,76];
const RIVER_HALF_WIDTH=3.3;
export const shore=(x,z)=>Math.hypot(x/islandBounds.x,z/islandBounds.z);
export const inRiver=z=>Math.abs(z)<RIVER_HALF_WIDTH;
export const onBridge=x=>islandCrossings.some(center=>Math.abs(x-center)<2.1);
export const isIslandWalkable=(x,z)=>Number.isFinite(x)&&Number.isFinite(z)&&shore(x,z)<.91&&(!inRiver(z)||onBridge(x));

export const pythonWaystations=[
  {id:'variable-spring',name:'Variable Spring',x:-110,z:-43,concept:'Variables',
   clue:'Seek the spring west of the first meadow.',example:'distance = 4',
   note:'A variable gives a name to a value. Change the value to change a later action.'},
  {id:'operator-stones',name:'Operator Stones',x:-18,z:-89,concept:'Expressions',
   clue:'Old number stones rest on the northern ridge.',example:'total = 2 + 3 * 4',
   note:'Expressions combine values. Python evaluates multiplication before addition.'},
  {id:'branching-woods',name:'Branching Woods',x:-105,z:67,concept:'Conditions',
   clue:'Find the crossing where the southern woods divide.',example:'if path_clear:\n    steps = 2',
   note:'A condition chooses which instruction to run, depending on a true or false test.'},
  {id:'iteration-cape',name:'Iteration Cape',x:111,z:38,concept:'Loops',
   clue:'Follow the eastern coast toward the old watch stones.',example:'for step in range(3):\n    print(step)',
   note:'A loop repeats a block of instructions. A range gives a sequence of values.'},
  {id:'data-observatory',name:'Data Observatory',x:101,z:-56,concept:'Lists and data',
   clue:'A quiet observation platform overlooks the north-east shore.',example:'readings = [3, 5, 8]',
   note:'A list stores several related values, ready to inspect, compare, or process.'},
];

export function trailDirection(from,to){
  const dx=to.x-from.x,dz=to.z-from.z;
  const distance=Math.hypot(dx,dz);
  const eastWest=Math.abs(dx)>2?(dx>0?'E':'W'):'';
  const northSouth=Math.abs(dz)>2?(dz>0?'S':'N'):'';
  return {distance:Math.round(distance),bearing:[northSouth,eastWest].filter(Boolean).join(' · ')||'HERE'};
}

// The only impassable strip is the river. Choose a valid bridge before crossing banks.
// Other coordinates on the same bank can be reached directly across the convex shoreline.
export function planIslandRoute(start,end){
  if(!isIslandWalkable(start.x,start.z)||!isIslandWalkable(end.x,end.z)){
    throw Error('Island route begins or ends outside walkable terrain.');
  }
  const bank=z=>z>RIVER_HALF_WIDTH?1:z< -RIVER_HALF_WIDTH?-1:0;
  const nearest=x=>islandCrossings.reduce((best,current)=>
    Math.abs(x-current)<Math.abs(x-best)?current:best);
  const first=bank(start.z),last=bank(end.z),route=[];
  if(!first&&!last){
    // Two different bridges cannot be connected directly across open water.
    const from=nearest(start.x),to=nearest(end.x);
    if(from!==to)route.push({x:from,z:5},{x:to,z:5});
  }else if(first!==last){
    const crossing=!first?nearest(start.x):!last?nearest(end.x):
      islandCrossings.reduce((best,x)=>
        Math.abs(x-start.x)+Math.abs(x-end.x)<Math.abs(best-start.x)+Math.abs(best-end.x)?x:best);
    if(first)route.push({x:crossing,z:first*5});
    if(last)route.push({x:crossing,z:last*5});
  }
  route.push({x:end.x,z:end.z});
  return route.filter((point,i)=>
    Math.hypot(point.x-(i?route[i-1].x:start.x),point.z-(i?route[i-1].z:start.z))>.05);
}
