/* Source-backed contract tests for Seminario 2027. No external dependencies. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read = p => fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx={window:{}};
vm.runInNewContext(read('learning/course-2027.js'),ctx,{timeout:1000});
vm.runInNewContext(read('learning/checks-v2.js'),ctx,{timeout:1000});
const lessons=ctx.window.SEMINAR_2027_COURSE;
assert.equal(lessons.length,17,'Must retain original 16 topics + algorithms');
assert.equal(new Set(lessons.map(x=>x.slug)).size,17,'Topic slugs must be unique');
assert.deepEqual(Array.from(lessons.slice(1,4),x=>x.slug),['operations','types','arrays']);
assert.equal(lessons.reduce((n,x)=>n+x.exercises.length,0),204,'Must have 204 exercises');
const keys=new Set();
for(const t of lessons){
 assert.equal(t.exercises.length,12,'12 stages: '+t.slug);
 assert.ok(t.definition.length>15,'Missing definition: '+t.slug);
 assert.ok(t.goals.length>0,'Missing goals: '+t.slug);
 assert.ok(t.sections.length>0,'Missing concepts: '+t.slug);
 assert.ok(t.diagrams.length>0,'Missing diagrams: '+t.slug);
 assert.ok(t.syntax.length>0,'Missing syntax: '+t.slug);
 for(const stage of t.exercises){
  assert.ok(!keys.has(stage.key),'Duplicate stage '+stage.key);
  keys.add(stage.key);
  assert.ok(stage.title&&stage.prompt,'Missing stage content '+stage.key);
 }
}
const root=read('index.html'),hub=read('learning/index.html'),theory=read('learning/theory.html'),workshop=read('learning/workshop.html');
assert.ok(root.includes('institutionalEmail'),'Institutional email registration input required');
assert.ok(root.includes('institutionalForm'),'Institutional login form required');
for(const [name,html] of [['hub',hub],['theory',theory],['workshop',workshop]]){
 assert.ok(html.includes('course-2027.js'),name+' must load full course');
 assert.ok(html.includes('supabase-config.js'),name+' must load 2027 Supabase configuration');
 assert.ok(html.includes('auth.js'),name+' must load institutional authentication');
}
for(const path of [
 'learning/course-2027.js','learning/hub-v2.js','learning/theory-v2.js','learning/workshop-v2.js',
 'learning/checks-v2.js','learning/python-worker.js','learning/python-runner.js','learning/auth.js'
]) assert.ok(read(path).length>500,path+' missing');
console.log('PASS 17 topics / 204 stages / 17 theories / institutional-email flow / referenced assets');
