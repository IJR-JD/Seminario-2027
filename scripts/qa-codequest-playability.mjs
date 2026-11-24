import assert from 'node:assert/strict';
import {renderRatio,contextAction,labelBudget,toastAllowed} from '../projects/codequest-rpg/playability.mjs';
import {platformList,verticalStep,makeVertical,landingSurface,platformSideBlocked} from '../projects/codequest-rpg/island-vertical.mjs';
assert(renderRatio('sharp',1,1440,900)>renderRatio('auto',1,1440,900));
assert.equal(renderRatio('performance',2,1280,720),1);
assert(renderRatio('auto',2,3840,2160)<=1);
assert.equal(contextAction({portal:0,available:true,title:'First Steps'}).key,'Enter');
assert.equal(contextAction({portal:0,available:false}).key,'');
assert.equal(contextAction({riding:true,portal:0,available:true}).key,'M');
assert.equal(contextAction({parkour:true}).key,'Space');
assert.equal(contextAction({}),null);
assert.deepEqual(labelBudget([{id:1,distance:5},{id:2,distance:30},{id:3,distance:3}],{limit:1}),[3]);
assert(!toastAllowed({message:'x',time:100},'x',200));assert(toastAllowed({message:'x',time:100},'y',200));
for(const p of platformList){
 const center={x:p.x,z:p.z},outside={x:p.x+p.hx+.40,z:p.z},edge={x:p.x+p.hx-.04,z:p.z};
 assert.equal(landingSurface([p],center.x,center.z,p.y+.8,p.y-.8)?.id,p.id);
 assert.equal(landingSurface([p],outside.x,outside.z,p.y+.8,p.y-.8),null);
 assert(platformSideBlocked([p],outside,edge,p.y-.7));
 assert(!platformSideBlocked([p],outside,edge,p.y+.08));
 assert(!platformSideBlocked([p],outside,edge,p.y-3));
 let s=makeVertical(p.y+.25,-8,false);s=verticalStep(s,{...center,ground:p.y-4,surfaces:[p],dt:.05});
 assert.equal(s.support,p.id);assert.equal(s.y,p.y);
 s=verticalStep(s,{...outside,ground:p.y-4,surfaces:[p],dt:.05});assert(!s.grounded);
}
console.log('PASS 36 deck centers, edges, side collisions, underpasses, support exits; quality, label, context and notification policies.');
