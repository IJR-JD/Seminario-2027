/* Isolated student Python execution. Runs on the student's own device, never on Supabase. */
"use strict";
const CDN="https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let runtimePromise=null;
async function getRuntime(){
 if(!runtimePromise){
  importScripts(CDN+"pyodide.js");
  runtimePromise=loadPyodide({indexURL:CDN});
 }
 return runtimePromise;
}
self.addEventListener("message",async({data})=>{
 if(!data||data.type!=="run"||typeof data.code!=="string")return;
 const id=data.id;
 try{
  const python=await getRuntime();
  const lines=[];
  python.setStdout({batched:(value)=>lines.push(String(value))});
  python.setStderr({batched:(value)=>lines.push(String(value))});
  // Execute with a new Python global dictionary for each stage.
  // JSON.stringify safely wraps the user's source as a Python string literal.
  await python.runPythonAsync("exec("+JSON.stringify(data.code)+", {})");
  self.postMessage({id,status:"ok",output:lines.join("\n").trim()});
 }catch(error){
  self.postMessage({id,status:"error",error:String(error)});
 }
});
