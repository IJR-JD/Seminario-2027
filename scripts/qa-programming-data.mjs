/* Static contract test for the 2027 general programming track and its archive. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const paths=['learning/course-2027.js','learning/programming-topics-2027.js',
 'learning/checks-v2.js','learning/programming-workshops-2027.js'];
function load(search){
 const ctx={window:{},location:{search},URLSearchParams};
 for(const p of paths)vm.runInNewContext(read(p),ctx,{timeout:6000});
 return ctx;
}
const coding=load('');
const course=coding.window.SEMINAR_2027_COURSE;
const checks=coding.window.IJR_2027_CHECKS;
assert.equal(coding.window.SEMINAR_2027_TRACK,'programming');
assert.equal(course.length,17);
assert.equal(course.reduce((n,t)=>n+t.exercises.length,0),204);
assert.equal(course[0].slug,'algoritmos');
assert.equal(course[1].slug,'flowcharts');
assert.ok(course.find(x=>x.slug==='while-loops').definition.includes('does not have a native do...while'));
assert.ok(course.find(x=>x.slug==='conditionals'));
assert.ok(course.find(x=>x.slug==='for-loops'));
assert.ok(course.find(x=>x.slug==='functions'));
const keys=new Set();
let code=0,choice=0,figures=0;
for(const [i,unit]of course.entries()){
 assert.equal(unit.order,i+1);
 assert.equal(unit.exercises.length,12,unit.slug+' stage count');
 assert.ok(unit.sections.length>=3,unit.slug+' insufficient conceptual content');
 assert.ok(unit.goals.length>=3,unit.slug+' goals missing');
 assert.ok(unit.diagrams.length>=2,unit.slug+' visuals missing');
 assert.ok(unit.demo?.includes('\n')||unit.demo?.includes('print('));
 assert.ok(!/Pandas|Outliers|quartiles|data science/i.test(unit.title),'Statistics theme leaks into '+unit.slug);
 figures+=unit.diagrams.length;
 for(const stage of unit.exercises){
  assert.ok(!keys.has(stage.key),'Duplicate stage key '+stage.key);
  keys.add(stage.key);
  assert.ok(stage.title.length>5&&stage.prompt.length>30,stage.key+' low-quality task description');
  if(stage.mode==='code'){
   code++;
   assert.equal(typeof checks.outputs[stage.key],'string',stage.key+' missing output');
   assert.ok(checks.outputs[stage.key].length>0,stage.key+' empty output');
  }else{
   choice++;
   assert.ok(stage.choices.length>=3,stage.key+' no options');
   assert.ok(Number.isInteger(checks.choices[stage.key]),stage.key+' missing choice key');
   assert.ok(checks.choices[stage.key]<stage.choices.length,stage.key+' invalid answer');
  }
 }
}
assert.equal(code,162);assert.equal(choice,42);
assert.equal(Object.keys(checks.outputs).length,code);
assert.equal(Object.keys(checks.choices).length,choice);
const original=load('?track=statistics');
assert.equal(original.window.SEMINAR_2027_TRACK,'statistics');
assert.equal(original.window.SEMINAR_2027_COURSE.length,17);
assert.equal(original.window.SEMINAR_2027_COURSE.find(t=>t.slug==='position-outliers').title.includes('Quartiles'),true);
assert.ok(original.window.IJR_2027_CHECKS.outputs['pos-01']);
const visuallyLoaded={window:coding.window,document:{readyState:'loading',addEventListener(){}},
 location:{search:''},URLSearchParams};
vm.runInNewContext(read('learning/programming-visuals-2027.js'),visuallyLoaded,{timeout:5000});
const scenes=coding.window.IJR_PROGRAMMING_MOTION_SEQUENCES;
assert.ok(scenes);
for(const t of course){
 assert.equal(scenes[t.slug].length,t.diagrams.length,t.slug+' mismatched motion scenes');
 for(const [i,s]of scenes[t.slug].entries())
  assert.ok(s.beats.length>=2&&s.beats.every(line=>typeof line==='string'&&line.length>16),
   t.slug+' missing scientific explanation for visual '+i);
}
for(const p of ['learning/theory.html','learning/workshop.html','learning/index.html']){
 const s=read(p);
 assert.ok(s.includes('programming-topics-2027.js'),p+' has no general curriculum');
 assert.ok(s.includes('programming-workshops-2027.js'),p+' has no coding assessments');
}
for(const p of ['learning/theory.html','learning/workshop.html']){
 const s=read(p);
 assert.ok(s.includes('programming-visuals-2027.js'),p+' has no animated coding visuals');
 assert.ok(s.includes('programming-visuals-2027.css'),p+' has no coding figure styles');
}
const hub=read('learning/index.html');
assert.ok(hub.includes('track=statistics'),'Archive discovery link missing');
console.log('PASS PROGRAMMING_DATA_QA 17 modules, 204 exercises ('+code+' code + '+choice+
 ' concept), '+figures+' topic figures, linked animation scenes, verified archive and assets');
