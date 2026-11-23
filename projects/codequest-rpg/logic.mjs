import {room,directions,planMove,surfaceAt} from './expedition.mjs';

const puzzle=config=>room({conditional:true,theme:'citadel',...config});
export const logicRooms=[
  puzzle({title:'The Forked Grove',zone:'Signal Grove',width:14,depth:9,start:[2,4],goal:[11,4],
    platforms:[[0,13,1,7,0]],obstacles:[[6,3],[6,4],[6,5]],powers:[],
    concept:'if / else',description:'Test whether the path ahead is clear.',
    objective:'Use a conditional to reach the beacon',instruction:'Try clear(right) to inspect the next tile without moving. Plan a branch for a blocked path.',
    hint:'Approach the stone wall first. The blocked branch should take you around it.'}),
  puzzle({title:'The Prism Lock',zone:'Signal Grove',width:15,depth:9,start:[2,4],goal:[12,4],
    platforms:[[0,14,2,6,0]],obstacles:[[7,2],[7,3],[7,5],[7,6]],locks:[[7,4]],powers:['pulse'],
    concept:'State and proximity',description:'A prism lock blocks the only corridor.',
    objective:'Read the prism and open the passage',instruction:'locked(right) checks the tile ahead. pulse() toggles adjacent prism locks.',
    hint:'Pulse works from one tile away. Check the state before using it.'}),
  puzzle({title:'Sentinel Crossing',zone:'Clockwork Bastion',width:15,depth:9,start:[2,4],goal:[12,4],
    platforms:[[0,14,3,5,0]],obstacles:[[7,3],[7,5]],sentries:[[7,4]],powers:['shield'],
    concept:'Sensing and guarded actions',description:'A sentinel guards the center lane.',
    objective:'Shield against the sentinel and reach the far side',instruction:'danger(right) detects a sentinel in the next cell. shield() protects your next movement.',
    hint:'Scan from the tile immediately before the sentinel. Walking early uses up your shield.'}),
  puzzle({title:'The Resonance Core',zone:'Clockwork Bastion',width:19,depth:11,start:[2,7],goal:[16,5],
    platforms:[[0,4,5,9,0],[6,18,5,9,1]],
    obstacles:[[9,5],[9,6],[9,8],[9,9],[13,5],[13,6],[13,8],[13,9]],
    locks:[[9,7]],sentries:[[13,7]],checkpoints:[[11,7]],crystals:[[15,7]],powers:['jump','pulse','shield'],
    concept:'Combining decisions and actions',description:'A broken bridge leads to a locked and guarded core.',
    objective:'Cross the gap, open the lock, activate the relay and collect the core',
    instruction:'Combine a jump with separate checks for the prism and sentinel. You can nest conditions with four spaces per level.',
    hint:'The detector checks only one adjacent tile. Recheck from the correct position.'}),
  puzzle({title:'The Ember Causeway',zone:'Ember Foundry',width:16,depth:9,start:[2,5],goal:[13,4],
    platforms:[[0,5,3,7,0],[7,15,3,7,1]],
    traps:[[4,5],[8,4],[10,5],[10,6]],checkpoints:[[9,3]],powers:['jump'],hazards:true,
    concept:'Trap detection and safe landings',description:'Avoid pressure spikes before crossing the broken bridge.',
    objective:'Reach the upper relay and the beacon',
    instruction:'danger(direction) detects spikes and gaps. Jump over spikes, and land on a clear tile.',
    hint:'Test the tile ahead before choosing a walking segment or a jump.'}),
  puzzle({title:'The Furnace Circuit',zone:'Ember Foundry',width:19,depth:11,start:[2,7],goal:[16,5],
    platforms:[[0,5,5,9,0],[7,18,4,9,1]],
    traps:[[4,7],[8,7],[11,6],[13,7],[15,6]],
    locks:[[10,7]],sentries:[[14,7]],
    obstacles:[[10,4],[10,5],[10,6],[10,8],[10,9],[14,4],[14,5],[14,6],[14,8],[14,9]],
    checkpoints:[[11,7]],crystals:[[16,7]],powers:['jump','dash','pulse','shield'],hazards:true,
    concept:'Combining traps, locks and shields',description:'Cross broken ground, unlock the furnace and pass its guardian.',
    objective:'Activate the relay, collect the furnace crystal and reach the beacon',
    instruction:'Dash crosses flat ground quickly. Spikes trigger during a dash, so use jump to clear them.',
    hint:'Check the spike lane between the relay and guardian. Shield protects against a guardian hit.'}),

];

export function compileLogic(source,parseAction){
  const rows=source.split(/\r?\n/).flatMap((raw,i)=>{
    const text=raw.split('#')[0].trimEnd().replace(/\t/g,'    ');
    return text.trim()?[{indent:text.search(/\S/),text:text.trim(),line:i+1}]:[];
  });
  if(rows.length>65)throw Error('Maximum 65 lines per program');
  let index=0;
  function block(indent,depth){
    if(depth>6)throw Error('Maximum six levels of nesting.');
    const result=[];
    while(index<rows.length&&rows[index].indent>=indent){
      const row=rows[index];
      if(row.indent!==indent)throw Error('Line '+row.line+': indent each block by four spaces.');
      if(row.text==='else:')break;
      index++;
      const condition=row.text.match(/^if (not )?(clear|locked|danger)\((up|down|left|right)\):$/);
      if(!condition){
        result.push(parseAction(row));
        continue;
      }
      const yes=block(indent+4,depth+1);
      if(!yes.length)throw Error('Line '+row.line+': add an indented action after if.');
      let no=[];
      if(rows[index]?.indent===indent&&rows[index].text==='else:'){
        const alternate=rows[index++];
        no=block(indent+4,depth+1);
        if(!no.length)throw Error('Line '+alternate.line+': add an indented action after else.');
      }
      result.push({kind:'if',negate:!!condition[1],sensor:condition[2],direction:condition[3],line:row.line,yes,no});
    }
    return result;
  }
  const program=block(0,0);
  if(index!==rows.length)throw Error('Line '+rows[index].line+': else needs a matching if.');
  return program;
}

const matches=(cells,x,z)=>cells?.some(([cx,cz])=>cx===x&&cz===z)??false;
export const cellKey=(x,z)=>x+','+z;
function locked(cfg,state,x,z){
  return matches(cfg.locks,x,z)&&!state.open.has(cellKey(x,z));
}

export function sense(cfg,state,position,sensor,direction){
  const [dx,dz]=directions[direction],x=position.x+dx,z=position.z+dz;
  if(sensor==='locked')return locked(cfg,state,x,z);
  if(sensor==='danger')return matches(cfg.sentries,x,z)||matches(cfg.traps,x,z)||(cfg.hazards&&surfaceAt(cfg,x,z)===undefined);
  try{
    logicMove(cfg,state,position,direction,1,'walk',0);
    return true;
  }catch{return false;}
}

export function pulse(cfg,state,position){
  const nearby=(cfg.locks??[]).filter(([x,z])=>Math.abs(x-position.x)+Math.abs(z-position.z)===1);
  if(!nearby.length)throw Error('Pulse needs an adjacent prism lock.');
  for(const [x,z] of nearby){
    const id=cellKey(x,z);
    if(state.open.has(id))state.open.delete(id);
    else state.open.add(id);
  }
}

export function logicMove(cfg,state,position,direction,distance,mode,fuel){
  const [dx,dz]=directions[direction];
  const targetX=position.x+dx*distance,targetZ=position.z+dz*distance;
  const missing=surfaceAt(cfg,targetX,targetZ)===undefined;
  const inRange=Number.isInteger(distance)&&distance>=1&&distance<={walk:1,jump:3,dash:5,fly:6}[mode];
  if(cfg.hazards&&missing&&inRange&&(mode==='walk'||(mode==='jump'&&cfg.powers.includes(mode)))){
    throw new RouteHazard('fall',targetX,targetZ,'The landing is over a gap.');
  }
  const path=planMove(cfg,position,direction,distance,mode,fuel);
  for(let step=1;step<=distance;step++){
    const x=position.x+step*dx,z=position.z+step*dz;
    if(locked(cfg,state,x,z))throw Error('A prism lock blocks the path at ('+x+', '+z+').');
    if(matches(cfg.sentries,x,z)&&!state.shield)throw new RouteHazard('hit',x,z,'Sentinel ahead. Shield before moving into its cell.');
    if(matches(cfg.traps,x,z)&&(mode==='walk'||mode==='dash'||step===distance)){
      throw new RouteHazard('hit',x,z,'Pressure spikes triggered at ('+x+', '+z+').');
    }
  }
  return path;
}

export class RouteHazard extends Error {
  constructor(kind,x,z,message){
    super(message);
    this.kind=kind;
    this.x=x;
    this.z=z;
  }
}
