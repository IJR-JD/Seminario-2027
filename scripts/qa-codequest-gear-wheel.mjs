import assert from 'node:assert/strict';
import {gearItems,gearStatus,radialIndex} from '../projects/codequest-rpg/gear-wheel.mjs';
const a={powers:[],dashReady:true,flight:5,jetFuel:5},m={skills:[],vehicle:null,lifting:false,type:null};
assert.equal(gearItems.length,8);assert.equal(new Set(gearItems.map(i=>i.id)).size,8);
const item=id=>gearItems.find(i=>i.id===id);
assert.equal(gearStatus(item('dash'),a,m),'locked');
assert.equal(gearStatus(item('rover'),a,m),'ready');
assert.equal(gearStatus(item('hover'),a,m),'locked');
assert.equal(gearStatus(item('hover'),a,{...m,skills:['hover']}),'ready');
assert.equal(gearStatus(item('dash'),{...a,powers:['dash'],dashReady:false},m),'cooldown');
assert.equal(gearStatus(item('fly'),{...a,powers:['fly'],flying:true},m),'active');
assert.equal(gearStatus(item('jetpack'),{...a,powers:['jetpack']},{...m,vehicle:'rover-0'}),'unavailable');
assert.equal(gearStatus(item('rover'),a,{...m,vehicle:'rover-0',type:'rover'}),'active');
assert.equal(radialIndex(0,0),-1);
for(let i=0;i<8;i++){const t=i*Math.PI/4;assert.equal(radialIndex(Math.sin(t)*100,-Math.cos(t)*100),i);}
console.log('PASS eight radial sectors, unlocks, cooldowns, active and vehicle context states.');
