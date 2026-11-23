export const directions = {right:[1,0],left:[-1,0],up:[0,-1],down:[0,1]};
export const abilities = ['jump','dash','fly'];
const pointKey = (x,z) => x+','+z;

export function room(config){
  const surfaces = new Map();
  for(const [x0,x1,z0,z1,height] of config.platforms){
    for(let x=x0;x<=x1;x++) for(let z=z0;z<=z1;z++) surfaces.set(pointKey(x,z),height);
  }
  return {
    theme:'ruins',checkpoints:[],crystals:[],obstacles:[],
    ...config,surfaces,
    concept:config.concept,
  };
}

export const expedition = [
  room({
    title:'The Terraced Archive',zone:'Sunstone Heights',width:15,depth:9,
    start:[2,6],goal:[11,3],platforms:[[0,4,4,8,0],[6,9,4,7,1],[10,14,1,6,2]],
    crystals:[[8,5]],powers:['jump'],concept:'Elevation and distance',
    description:'Three terraces rise above an old quarry.',
    objective:'Collect the archive seal and climb to the beacon',
    instruction:'Use a jump to cross a gap or rise one tier. Plan a landing on solid ground.',
    hint:'A jump can clear up to two intervening cells. Compare the height of the landing tile with the height of your takeoff.',
  }),
  room({
    title:'The Pulse Bridge',zone:'Sunstone Heights',width:16,depth:9,
    start:[2,6],goal:[13,4],platforms:[[0,15,2,8,0]],
    gates:[[7,4],[7,5],[7,6]],obstacles:[[7,2],[7,3],[7,7],[7,8]],
    checkpoints:[[10,7]],powers:['dash'],concept:'Path constraints and momentum',
    description:'A row of phase gates divides the workshop.',
    objective:'Dash through a phase gate and activate the relay',
    instruction:'Walk to line up with a violet phase gate. A dash can pass through it but must stop on solid, clear ground.',
    hint:'The violet cells accept a dash. Ordinary stone blocks and gaps interrupt it.',
  }),
  room({
    title:'The Wind Observatory',zone:'Aether Reach',theme:'citadel',width:17,depth:11,
    start:[2,8],goal:[14,2],platforms:[[0,4,7,10,0],[6,9,5,9,2],[10,12,3,5,3],[13,16,0,3,4]],
    checkpoints:[[8,7]],crystals:[[11,4]],powers:['fly'],concept:'Resource budgeting',
    flightBudget:18,
    description:'The observatory floats across an open ravine.',
    objective:'Visit the relay, collect the lens and reach the observatory',
    instruction:'Flying crosses empty space and climbs up to two tiers. Conserve your range and land on each island.',
    hint:'Use walking for adjustments on an island. Only flight uses the flight budget.',
  }),
  room({
    title:'The Relay Vault',zone:'Aether Reach',theme:'citadel',width:19,depth:12,
    start:[2,9],goal:[16,2],platforms:[[0,4,7,11,0],[6,12,7,11,1],[11,14,4,6,3],[15,18,0,5,4]],
    obstacles:[[9,7],[9,10],[9,11]],gates:[[9,8],[9,9]],checkpoints:[[7,10],[12,5]],crystals:[[11,8],[16,4]],
    powers:abilities,flightBudget:10,concept:'Sequencing and resource constraints',
    description:'The last vault combines terraces, phase gates and air lanes.',
    objective:'Activate both relays in order, collect both seals and reach the vault',
    ordered:true,
    instruction:'Chain walking, jumping, dashing and flight. Visit relays in the listed order.',
    hint:'Begin with the lower relay. After the phase gate, line up with the first high platform before flying.',
  }),
];
export const surfaceAt = (cfg,x,z) => cfg.surfaces.get(pointKey(x,z));

export function planMove(cfg, position, direction, distance, mode, fuel){
  const [dx,dz] = directions[direction];
  const range = {walk:1,jump:3,dash:5,fly:6}[mode];
  if(distance<1||distance>range) throw Error(mode+' distance must be 1–'+range);
  if(mode!=='walk'&&!cfg.powers.includes(mode)) throw Error(mode+' is unavailable in this room.');
  const x=position.x+dx*distance, z=position.z+dz*distance;
  const start=surfaceAt(cfg,position.x,position.z), end=surfaceAt(cfg,x,z);
  const stone=(x,z)=>cfg.obstacles.some(([bx,bz])=>bx===x&&bz===z);
  const gate=(x,z)=>cfg.gates?.some(([gx,gz])=>gx===x&&gz===z);
  if(end===undefined||stone(x,z)||gate(x,z)) throw Error('No clear landing at ('+x+', '+z+').');
  const rise=end-start;
  const cost=mode==='fly'?distance:0;
  if(cost>fuel) throw Error('Flight range exhausted. Walk between flights to conserve range.');
  if(mode==='fly'&&rise>2) throw Error('Flight can climb at most two tiers at a time.');
  if(mode==='jump'&&Math.abs(rise)>1) throw Error('A jump can change elevation by at most one tier.');
  const contacts=[];
  for(let step=1;step<=distance;step++){
    const px=position.x+dx*step,pz=position.z+dz*step;
    const height=surfaceAt(cfg,px,pz);
    if(mode==='dash'||mode==='walk'){
      if(height!==start||stone(px,pz)||(mode==='walk'&&gate(px,pz))) throw Error('The '+mode+' is blocked at ('+px+', '+pz+').');
      if(mode==='walk')contacts.push({x:px,z:pz});
    }else if(step<distance){
      const clearance=mode==='fly'?Math.max(start,end)+1.1:Math.max(start,end);
      if(height!==undefined&&((!cfg.gates||!gate(px,pz))?height+Number(stone(px,pz)):height+2)>clearance){
        throw Error('The '+mode+' cannot clear the obstacle at ('+px+', '+pz+').');
      }
    }
  }
  if(!contacts.length)contacts.push({x,z});
  return {x,z,start,end,cost,contacts};
}
