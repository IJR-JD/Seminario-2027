"use strict";
// Real Python interpreter isolated in a Web Worker; no server secrets or institutional data.
const CDN="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let runtime=null;
let installedWorkbook=false;
let libraryPackages=false;
const CSV="estudiante,grupo,edad,nota\nEstudiante_01,10A,16,4.2\nEstudiante_02,10A,17,3.8\nEstudiante_03,10A,16,2.9\nEstudiante_04,10A,17,4.5\nEstudiante_05,10B,16,3.8\nEstudiante_06,10B,17,3.2\nEstudiante_07,10B,16,4.0\nEstudiante_08,10B,17,3.8\nEstudiante_09,10C,16,2.7\nEstudiante_10,10C,17,4.6\nEstudiante_11,10C,16,3.5\nEstudiante_12,10C,17,4.0\n";
async function pythonRuntime(){
 if(runtime)return runtime;
 importScripts(CDN+"pyodide.js");
 runtime=await loadPyodide({indexURL:CDN});
 runtime.FS.writeFile("estudiantes.csv",CSV);
 return runtime;
}
async function loadExcel(py){
 if(installedWorkbook)return;
 try{await py.loadPackage("openpyxl");}
 catch(_err){await py.loadPackage("micropip");await py.runPythonAsync("import micropip\nawait micropip.install('openpyxl')");}
 await py.runPythonAsync('from openpyxl import Workbook\nwb = Workbook()\nws = wb.active\nws.title = "Students"\nws.append(["student","score","group"])\nfor row in [("A",68,"10A"),("B",92,"10A"),("C",81,"10B"),("D",96,"10B"),("E",74,"10C"),("F",99,"10C")]:\n    ws.append(row)\nwb.save("pandas_excel_students.xlsx")');
 installedWorkbook=true;
}
async function perform(code){
 const py=await pythonRuntime();
 if(typeof py.loadPackagesFromImports==="function"){await py.loadPackagesFromImports(code);}
 if(/(?:pandas_excel_students\.xlsx|\.read_excel|\bopenpyxl\b|\bto_excel\b)/.test(code))await loadExcel(py);
 // Every run is a fresh local program; notebook stages must be independently reproducible.
 const lines=[];
 py.setStdout({batched:value=>lines.push(String(value))});
 py.setStderr({batched:value=>lines.push(String(value))});
 await py.runPythonAsync("exec("+JSON.stringify(code)+", {})");
 return lines.join("\n").replace(/\r/g,"").trim();
}
self.onmessage=async function(ev){
 const {id,type,code}=ev.data||{};
 if(type!=="run"||typeof code!=="string")return;
 try{
  if(code.length>30000)throw new Error("La celda supera el tamaño máximo de 30 000 caracteres.");
  const output=await perform(code);
  self.postMessage({id,status:"ok",output});
 }catch(error){self.postMessage({id,status:"error",error:String(error?.message||error)});}
};
