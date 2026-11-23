"use strict";
// Python runs locally in an isolated Worker, with no institution credentials.
// The synthetic datasets are deterministic and each code cell runs in a fresh namespace.
const CDN="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const CSV="estudiante,grupo,edad,nota\nEstudiante_01,10A,16,4.2\nEstudiante_02,10A,17,3.8\nEstudiante_03,10A,16,2.9\nEstudiante_04,10A,17,4.5\nEstudiante_05,10B,16,3.8\nEstudiante_06,10B,17,3.2\nEstudiante_07,10B,16,4.0\nEstudiante_08,10B,17,3.8\nEstudiante_09,10C,16,2.7\nEstudiante_10,10C,17,4.6\nEstudiante_11,10C,16,3.5\nEstudiante_12,10C,17,4.0\n";
const FILE_NAME=/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}\.(?:xlsx|csv|txt|png)$/i;
const SEED_FILES=new Set(["estudiantes.csv","pandas_excel_students.xlsx"]);
let runtimePromise=null,workbookReady=false;
let executionQueue=Promise.resolve();

function pythonRuntime(){
 if(!runtimePromise){
  runtimePromise=(async()=>{
   importScripts(CDN+"pyodide.js");
   const py=await loadPyodide({indexURL:CDN});
   py.FS.writeFile("estudiantes.csv",CSV);
   return py;
  })().catch(error=>{runtimePromise=null;throw error;});
 }
 return runtimePromise;
}
async function loadExcel(py){
 if(workbookReady)return;
 try{await py.loadPackage("openpyxl");}
 catch(_error){
  await py.loadPackage("micropip");
  await py.runPythonAsync("import micropip\nawait micropip.install('openpyxl')");
 }
 // The same five-column structure used in the 2026/2027 theory exercises.
 // "attendance" is required by the derived performance_index lesson.
 await py.runPythonAsync(
  'from openpyxl import Workbook\n'+
  'wb = Workbook()\n'+
  'ws = wb.active\n'+
  'ws.title = "Students"\n'+
  'ws.append(["student", "score", "group", "attendance", "study_hours"])\n'+
  'for row in [("A",68,"10A",0.92,2),("B",92,"10A",0.97,5),("C",81,"10B",0.85,3),("D",96,"10B",0.99,6),("E",74,"10C",0.88,3),("F",99,"10C",0.96,7)]:\n'+
  '    ws.append(row)\n'+
  'wb.save("pandas_excel_students.xlsx")'
 );
 workbookReady=true;
}
function downloadableFiles(py,code){
 return py.FS.readdir(".").filter(name=>
  FILE_NAME.test(name)&&
  code.includes(name)&&
  (name==="pandas_excel_students.xlsx"||!SEED_FILES.has(name))
 ).sort();
}
async function perform(code){
 const py=await pythonRuntime();
 // Prepare the workbook before loading imports from the user's cell.
 // In Pyodide openpyxl may need micropip rather than loadPackagesFromImports.
 if(/(?:pandas_excel_students\.xlsx|\.read_excel|\bopenpyxl\b|\bto_excel\b)/.test(code))await loadExcel(py);
 if(typeof py.loadPackagesFromImports==="function")await py.loadPackagesFromImports(code);

 const lines=[];
 py.setStdout({batched:value=>lines.push(String(value))});
 py.setStderr({batched:value=>lines.push(String(value))});
 await py.runPythonAsync("exec("+JSON.stringify(code)+", {})");
 return {output:lines.join("\n").replace(/\r/g,"").trim(),files:downloadableFiles(py,code)};
}
async function sendFile(id,name){
 if(typeof name!=="string"||!FILE_NAME.test(name))throw Error("Nombre de archivo no permitido.");
 const py=await pythonRuntime();
 const bytes=new Uint8Array(py.FS.readFile(name));
 if(bytes.byteLength>10*1024*1024)throw Error("Archivo demasiado grande para descargar.");
 self.postMessage({id,status:"file",name,bytes},[bytes.buffer]);
}
async function dispatch(message){
 const {id,type,code,name}=message||{};
 try{
  if(type==="run"){
   if(typeof code!=="string"||!code.trim())throw Error("Escribe una solución antes de ejecutar.");
   if(code.length>30000)throw Error("La celda supera el tamaño máximo de 30 000 caracteres.");
   const result=await perform(code);
   self.postMessage({id,status:"ok",output:result.output,files:result.files});
  }else if(type==="download"){
   await sendFile(id,name);
  }
 }catch(error){
  self.postMessage({id,status:"error",error:String(error?.message||error)});
 }
}
// The theory lab and the 12-stage workshop share this Worker.
// Serialize executions to prevent simultaneous Pyodide calls or stdout crossover.
self.onmessage=event=>{
 const message=event.data;
 const job=executionQueue.then(()=>dispatch(message));
 executionQueue=job.catch(()=>{});
};
