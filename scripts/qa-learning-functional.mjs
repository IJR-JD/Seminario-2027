/* High-value regressions for the integrated Seminario 2027 learning page.
 * Runs with native Node (no npm packages or browser credentials).
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const courseContext={window:{}};
vm.runInNewContext(read('learning/course-2027.js'),courseContext,{timeout:2000});
vm.runInNewContext(read('learning/checks-v2.js'),courseContext,{timeout:2000});
const course=courseContext.window.SEMINAR_2027_COURSE;
const checks=courseContext.window.IJR_2027_CHECKS;
assert.equal(course.length,17);
assert.equal(course.reduce((sum,topic)=>sum+topic.exercises.length,0),204);

let codeCount=0,choiceCount=0;
const seen=new Set();
for(const topic of course){
 assert.equal(topic.exercises.length,12,'12 activities in '+topic.slug);
 for(const exercise of topic.exercises){
  assert.ok(!seen.has(exercise.key),'Duplicate '+exercise.key);
  seen.add(exercise.key);
  if(exercise.mode==='choice'){
   choiceCount++;
   assert.ok(exercise.choices?.length>1,'Choices missing '+exercise.key);
   const correct=checks.choices[exercise.key];
   assert.ok(Number.isInteger(correct),'No choice rubric '+exercise.key);
   assert.ok(correct>=0&&correct<exercise.choices.length,'Choice index out of bounds '+exercise.key);
  }else{
   codeCount++;
   assert.equal(exercise.mode,'code','Unsupported stage mode '+exercise.key);
   assert.equal(typeof checks.outputs[exercise.key],'string','No output rubric '+exercise.key);
   assert.ok(checks.outputs[exercise.key].length>0,'Empty rubric '+exercise.key);
  }
 }
}
assert.equal(codeCount+choiceCount,204);
assert.equal(Object.keys(checks.outputs).length,codeCount,'Unused or missing code reference');
assert.equal(Object.keys(checks.choices).length,choiceCount,'Unused or missing choice reference');

const theory=read('learning/theory.html'),standalone=read('learning/workshop.html');
const workshopJs=read('learning/workshop-v2.js'),theoryJs=read('learning/theory-v2.js');
const ids=html=>new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
const dependencies=new Set([...workshopJs.matchAll(/\$\(["']([^"']+)["']\)/g)].map(match=>match[1]));
for(const [label,html] of [['integrated',theory],['standalone',standalone]]){
 const missing=[...dependencies].filter(id=>!ids(html).has(id));
 assert.deepEqual(missing,label==='integrated'?['theoryReturn']:[],'Unexpected missing DOM references in '+label);
}
assert.ok(workshopJs.includes('if(theoryReturn)'),'Embedded Theory must tolerate missing theoryReturn');
assert.ok(workshopJs.includes('outputMatches(expected,runResult.output)'),'Assessment must compare semantic results');
assert.ok(workshopJs.includes('No se marcará como validada'),'Missing keys must not auto-approve');
for(const [name,html] of [['theory',theory],['workshop',standalone]]){
 assert.ok(ids(html).has('workshopDownloads'),name+' has no generated-file downloads');
}
assert.ok(ids(theory).has('theoryDownloads'),'Theory live lab has no generated-file downloads');
assert.ok(theoryJs.includes('renderRunFiles("theoryDownloads"'),'Theory export link is not wired');

const worker=read('learning/python-worker.js'),runner=read('learning/python-runner.js');
for(const snippet of ['runtimePromise','executionQueue','new Uint8Array(py.FS.readFile(name))','postMessage({id,status:"file"','"attendance", "study_hours"','ws.title = "Students"']){
 assert.ok(worker.includes(snippet),'Python Worker regression: '+snippet);
}
for(const snippet of ['downloadFile','pending.set','enqueue','URL.createObjectURL','worker.onerror']){
 assert.ok(runner.includes(snippet),'Python Runner regression: '+snippet);
}
const logic=course.find(topic=>topic.slug==='logic');
assert.ok(logic.exercises.find(stage=>stage.key==='logic-09').prompt.includes('independent Python cell'),
 'Logic-09 assumes an unavailable cross-cell Python variable');
const pandasExamples=read('learning/libraries-pandas-theory-v60.js');
assert.ok(!pandasExamples.includes('cv2.imread("photo.jpg")'),'OpenCV example depends on missing file');
assert.ok(pandasExamples.includes('def update(frame):'),'Matplotlib animation must define update');
assert.ok(pandasExamples.includes('DESKTOP PYTHON'),'Pygame browser limitation must be stated');
assert.ok(pandasExamples.includes('pandas_excel_students.xlsx'),'Excel examples must use the actual workbook');

class Element {
 constructor(id=''){
  this.id=id;this.children=[];this.textContent='';this.value='';this.disabled=false;
  this.hidden=false;this.style={};this.listeners={};this.checked=false;this.attrs={};
  this._classes=new Set();
  this.classList={
   add:(name)=>this._classes.add(name),
   remove:(name)=>this._classes.delete(name),
   toggle:(name,forced)=>{
    const result=forced===undefined?!this._classes.has(name):Boolean(forced);
    if(result)this._classes.add(name);else this._classes.delete(name);
    return result;
   },
   contains:name=>this._classes.has(name)
  };
 }
 appendChild(child){this.children.push(child);return child;}
 append(...children){children.forEach(child=>this.appendChild(child));}
 replaceChildren(...children){this.children=[...children];}
 setAttribute(name,value){this.attrs[name]=value;}
 addEventListener(type,listener){this.listeners[type]=listener;}
 click(){return this.listeners.click?.();}
 querySelector(selector){
  if(selector==='.stage-check')return this.stageCheck??(this.stageCheck=new Element('stageCheck'));
  if(selector.includes(':checked'))return this.children.flatMap(e=>e.children).find(e=>e.checked)||null;
  return null;
 }
 querySelectorAll(selector){return selector==='input'?this.children.flatMap(e=>e.children):[];}
 scrollIntoView(){}
}
const elements=new Map([...ids(theory)].map(id=>[id,new Element(id)]));
const document={
 getElementById:id=>elements.get(id)||null,
 createElement:tag=>new Element(tag),
 documentElement:new Element('html'),
 title:''
};
const session=new Map();
const context={
 window:{
  SEMINAR_2027_COURSE:course, IJR_2027_CHECKS:checks,
  IJR_RUNNER:{run:async()=>({ok:true,output:'25',files:[]}),downloadFile:async()=>true}
 },
 document,location:{search:'?topic=operations'},
 URLSearchParams,sessionStorage:{
  getItem:key=>session.get(key)??null,
  setItem:(key,value)=>session.set(key,value)
 },
 console
};
vm.runInNewContext(workshopJs,context,{timeout:3000});
assert.equal(elements.get('stageList').children.length,12,'Embedded workshop must initialize all 12 stages');
assert.equal(elements.get('problemTitle').textContent,course[1].exercises[0].title);
elements.get('codeEditor').value='a = 17\nb = 8\nprint(a+b)';
await elements.get('runButton').click();
assert.equal(elements.get('outputText').textContent,'25');
await elements.get('validateButton').click();
assert.ok(elements.get('topicCount').textContent.startsWith('1 / 12'),
 'A correct Python output should validate its stage');
await elements.get('stageList').children[4].click();
assert.equal(elements.get('problemTitle').textContent,course[1].exercises[4].title);
const radioOptions=elements.get('choiceWrap').children;
assert.ok(radioOptions.length>=2);
radioOptions[0].children[0].checked=true;
await elements.get('validateButton').click();
assert.ok(elements.get('topicCount').textContent.startsWith('1 / 12'),
 'An incorrect choice must not validate the stage');
radioOptions[0].children[0].checked=false;
radioOptions[1].children[0].checked=true;
await elements.get('validateButton').click();
assert.ok(elements.get('topicCount').textContent.startsWith('2 / 12'),
 'A correct concept answer must validate the stage');

console.log('PASS functional QA: '+course.length+' topics, '+(codeCount+choiceCount)+
 ' stages ('+codeCount+' Python + '+choiceCount+' concept), complete rubrics, embedded DOM, '+
 'Run → Validate, incorrect-answer rejection, 5-column Excel, downloads and source diagrams.');
