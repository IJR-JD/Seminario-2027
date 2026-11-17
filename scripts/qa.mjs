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


/* 2027 Sandbox — copied from the original Statistics 11 standalone lab. */
const sandboxHtml=read('learning/sandbox.html');
const sandboxJs=read('learning/sandbox-v39.js');
const workspaceJs=read('learning/sandbox-workspace-v40.js');
const sandboxCss=read('learning/sandbox-v39.css');
const workspaceCss=read('learning/sandbox-workspace-v40.css');
assert.ok(sandboxCss.length>5000&&workspaceCss.length>1000,'Sandbox styles missing');
for(const asset of ['sandbox-v39.js','sandbox-v39.css','sandbox-workspace-v40.js','sandbox-workspace-v40.css']){
  assert.ok(sandboxHtml.includes(asset),'Sandbox missing dependency '+asset);
}
for(const id of ['runtimeBadge','runAllButton','addCellButton','clearOutputsButton','downloadCodeButton','resetNotebookButton','cellList','codeCellTemplate','fileInput','fileList','workspaceFileList','refreshWorkspaceButton']){
  assert.ok(sandboxHtml.includes('id="'+id+'"'),'Sandbox element missing: '+id);
}
assert.ok(sandboxJs.includes("ijr-seminario-2027-python-sandbox-v39"),'Sandbox must use its own storage');
assert.ok(!sandboxJs.includes('ijr-stat11-python-sandbox-v39'),'Must not reuse Statistics 11 localStorage');
assert.ok(sandboxJs.includes('runtime.loadPackagesFromImports(code)'),'Actual Pyodide package import support missing');
assert.ok(sandboxJs.includes('extractPlots(runtime)'),'Matplotlib figure extraction missing');
assert.ok(workspaceJs.includes('FS.readFile')&&workspaceJs.includes('FS.unlink'),'Workspace download/delete missing');
assert.ok(workspaceJs.includes('seminario2027_sandbox.py'),'Notebook export must use course-specific name');
for(const [name,markup,href] of [
  ['homepage',root,'./learning/sandbox.html'],
  ['hub',hub,'sandbox.html'],
  ['theory',theory,'sandbox.html'],
  ['workshop',workshop,'sandbox.html']
]) assert.ok(markup.includes('href="'+href+'"'),name+' does not link to the Python Sandbox');
console.log('PASS Sandbox source parity, notebook/runtime, uploads, figures, persistence, exports and navigation');


/* Seminar 2027 v3 — two main spaces, original Statistics 11 consolidated visuals, integrated practice and projects. */
const choiceOptions=[...root.matchAll(/<span class="choice-index">(OPTION [0-9]+)/g)].map(m=>m[1]);
assert.deepEqual(choiceOptions,['OPTION 01','OPTION 02'],'Homepage must show exactly Theory and Projects');
assert.ok(root.includes('href="projects/"'),'Home page has no project entrance');
assert.ok(root.includes('class="choice-grid two-paths"'),'Two-column home layout missing');
assert.ok(!root.includes('OPTION 03'),'Third main option must be removed');
assert.ok(hub.includes('One topic. One complete learning space.'),'Topic catalogue must not split theory and workshop');
const hubCode=read('learning/hub-v2.js');
assert.ok(!hubCode.includes('02 · Workshop'),'Standalone workshop option still shown');
assert.ok(hubCode.includes('Open Theory + 12 guided exercises'),'Theory card must include integrated practice');
assert.ok(theory.includes('id="practice"')&&theory.includes('id="stageList"')&&theory.includes('id="codeEditor"'),'Theory must embed 12-stage notebook');
assert.equal([...theory.matchAll(/id="main"/g)].length,1,'Theory contains duplicate main ids');
assert.equal([...theory.matchAll(/id="runtimeStatus"/g)].length,1,'Theory live Python runtime status duplicated');
assert.ok(theory.includes('id="workshopRuntimeStatus"'),'Embedded notebook runtime status missing');
assert.ok(theory.includes('operations-visual-v9.js')&&theory.includes('arrays-consolidated-v34.js')&&theory.includes('libraries-pandas-theory-v60.js'),'Consolidated Statistics 11 diagrams not loaded');
assert.ok(theory.includes('checks-v2.js')&&theory.includes('workshop-v2.js'),'Workshop engine not embedded');
const opsDiagramCode=read('learning/operations-visual-v9.js');
assert.ok(opsDiagramCode.includes('.diagram-card-v2'),'Original operations diagrams not adapted to 2027 card structure');
assert.ok(opsDiagramCode.includes('v9-flow3'),'Eight consolidated Operations figures missing');
const arraysCode=read('learning/arrays-consolidated-v34.js');
assert.ok(arraysCode.includes('window.SEMINAR_2027_COURSE'),'Original arrays theory not linked to 2027 curriculum');
assert.ok(arraysCode.includes('arr34-anatomy')&&arraysCode.includes('arr34-dataset'),'Consolidated arrays diagrams missing');
for(const path of [
 'learning/operations-visual-v9.css','learning/operations-visual-v9-refine.css',
 'learning/arrays-consolidated-v34.css','learning/libraries-pandas-theory-v60.css'
]) assert.ok(read(path).length>500,'Missing consolidated Statistics 11 style '+path);
const projectPage=read('projects/index.html'),projectsApp=read('projects/projects.js');
const pctx={window:{}};
vm.runInNewContext(read('projects/data.js'),pctx,{timeout:1000});
assert.equal(pctx.window.SEMINAR_2027_PROJECTS.length,4,'Project gallery must show exactly four routes');
assert.deepEqual(Array.from(pctx.window.SEMINAR_2027_PROJECTS,p=>p.slug),['data-analyst','3d-design','video-game-design','ai-agent-design'],'Unexpected 2027 project routes');
assert.deepEqual(Array.from(pctx.window.SEMINAR_2027_PROJECTS,p=>p.title),['Data Analyst','3D Design','Video Game Design','AI Agent Design'],'Unexpected project titles');
assert.ok(root.includes('<span>AI Agent Design</span>')&&root.includes('<span>Video Game Design</span>'),'Homepage must display the four defined tracks');
assert.ok(projectPage.includes('04 project pathways'),'Projects summary must show four tracks');
assert.ok(!projectPage.includes('06 project pathways'),'Old six-track summary still present');
for(const p of pctx.window.SEMINAR_2027_PROJECTS){
 assert.equal(p.stages.length,4,'Every project needs four guided stages: '+p.slug);
 for(const step of p.stages)assert.ok(step.theory?.length&&step.build?.length&&step.test?.length&&step.evidence&&step.gate,'Project stage incomplete: '+p.slug);
}
assert.ok(projectPage.includes('id="projectCards"')&&projectPage.includes('id="stageCards"'),'Project gallery/detail elements missing');
assert.ok(projectsApp.includes('Copy code')&&projectsApp.includes('projectDetail'),'Project interactions missing');
console.log('PASS 2 learning spaces / integrated 12-stage notebooks / consolidated Stats 11 diagrams / 4 guided project routes');


// CAD Modeling + Original ManimCE integration contracts.
const cadCtx={window:{}};
vm.runInNewContext(read('projects/cad-curriculum.js'),cadCtx,{timeout:1000});
const cadCourse=cadCtx.window.SEMINAR_2027_CAD;
assert.equal(cadCourse.operations.length,12,'CAD must include 12 detailed operation lessons');
assert.equal(new Set(cadCourse.operations.map(x=>x.id)).size,12,'Duplicate CAD operation IDs');
for(const id of ['sketch','extrude-add','extrude-cut','revolve','sweep','loft','hole','coil','fillet','pattern','rib','deliver']){
  const operation=cadCourse.operations.find(x=>x.id===id);
  assert.ok(operation,'Missing CAD lesson '+id);
  assert.ok(operation.definition.length>30&&operation.example.length>20,'Missing CAD conceptual details '+id);
  assert.ok(operation.steps.length>=3&&operation.checks.length>=2,'Incomplete CAD workshop '+id);
}
assert.ok(cadCourse.source.repository.includes('ITM-JOB/CAD'),'Original CAD reference must be explicit');
assert.ok(cadCourse.source.sourceCode.endsWith('/scripts/lessons.py'),'ManimCE provenance must cite actual original source');
assert.equal(cadCourse.source.verifiedOperationVideos.length,6,'Must embed six distinct recovered original ManimCE MP4s');
assert.ok(cadCourse.source.videosRepository.includes('Manim-Scientific-Visualize'),'CAD videos must be sourced from their original rendering repository');
const videoAssetIds=new Set();
for(const video of cadCourse.source.verifiedOperationVideos){
 assert.ok(/^https:\/\/raw\.githubusercontent\.com\/juanperez238421-cpu\/Manim-Scientific-Visualize\/[a-f0-9]{40}\/.*\.mp4$/.test(video.src),'Video must reference exact original committed MP4 in GitHub');
 assert.ok(video.sourceUrl.includes('/blob/'+video.commit+'/'),'Source link must cite matching Git commit');
 assert.ok(Number.isInteger(video.bytes)&&video.bytes>1000000,'Video metadata missing actual blob size');
 assert.ok(!videoAssetIds.has(video.id),'Duplicate original ManimCE asset');
 videoAssetIds.add(video.id);
 assert.ok(cadCourse.operations.some(o=>o.id===video.operationId),'Video references unknown CAD operation');
 assert.ok(video.operationIds.includes(video.operationId),'Video mapping must contain its primary operation');
}
assert.ok(cadCourse.source.verifiedOperationVideos.some(v=>v.operationIds.includes('extrude-add')&&v.operationIds.includes('extrude-cut')),'House Extrusion video must cover both positive and negative extrusion');
assert.ok(cadCourse.source.verifiedOperationVideos.some(v=>v.id==='mirror-senior-v4'),'Original mirror/symmetry video must be linked');
assert.ok(cadCourse.source.verifiedOperationVideos.some(v=>v.id==='hole-senior-v2'),'Original hole video must be linked');
assert.ok(cadCourse.source.verifiedOperationVideos.some(v=>v.id==='emboss-original'),'Original emboss video must be linked');
assert.ok(projectPage.includes('id="cadOperations"')&&projectPage.includes('id="cadLessonGrid"'),'CAD operation studio not inserted');
assert.ok(projectPage.includes('cad-curriculum.js')&&projectPage.includes('cad-lessons.js'),'CAD script loading missing');
const renderer=read('projects/cad-lessons.js');
assert.ok(renderer.includes('verifiedOperationVideos'),'CAD video registry not consulted');
assert.ok(renderer.includes('MP4 NO LOCALIZADO'),'Unpublished videos must be transparently identified');
assert.ok(renderer.includes('player.controls=true')&&renderer.includes('video/mp4'),'Native MP4 playback not found');
assert.ok(renderer.includes('clip.sourceUrl'),'Original video fallback links not found');
assert.ok(renderer.includes('cadVideoIndex'),'Original video library navigation missing');
assert.ok(projectPage.includes('id="cadVideoIndex"'),'Original video index container missing');
assert.ok(projectsApp.includes('window.IJR_2027_RENDER_CAD(p)'),'CAD studio not activated by route');
const cadProject=pctx.window.SEMINAR_2027_PROJECTS.find(p=>p.slug==='3d-design');
assert.ok(cadProject.stages[0].title.includes('positiva y negativa'));
assert.ok(cadProject.stages[1].title.includes('Revolución'));
assert.ok(cadProject.stages[2].title.includes('Agujeros'));
assert.ok(cadProject.stages[3].title.includes('Nervios'));
console.log('PASS CAD 12 lessons / 6 original ManimCE MP4s from exact Git blobs / inline players / 4 guided workshops');
