(()=>{"use strict";
let worker=null,sequence=0;
const pending=new Map();
const ALLOWED_FILE=/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}\.(?:xlsx|csv|txt|png)$/i;
function dropWorker(error){
 if(worker){worker.terminate();worker=null;}
 for(const [,p] of pending){clearTimeout(p.timer);p.reject(error||new Error("Python worker reset"));}
 pending.clear();
}
function ensureWorker(){
 if(worker)return worker;
 const scriptUrl=new URL("python-worker.js",document.currentScript?.src||location.href);
 worker=new Worker(scriptUrl);
 worker.onmessage=event=>{
  const msg=event.data||{},req=pending.get(msg.id);
  if(!req)return;
  pending.delete(msg.id);clearTimeout(req.timer);
  if(msg.status==="ok"){
   req.resolve({ok:true,output:msg.output||"",files:Array.isArray(msg.files)?msg.files:[]});
  }else if(msg.status==="file"){
   req.resolve({name:msg.name,bytes:msg.bytes});
  }else if(req.type==="download"){
   req.reject(new Error(msg.error||"No fue posible descargar el archivo."));
  }else{
   req.resolve({ok:false,output:msg.error||"Python error",error:msg.error||"Python error",files:[]});
  }
 };
 worker.onerror=()=>dropWorker(new Error("No se pudo cargar Python. Comprueba la conexión e inténtalo de nuevo."));
 return worker;
}
function send(type,data,timeoutMs){
 const id=++sequence;
 return new Promise((resolve,reject)=>{
  try{
   const w=ensureWorker();
   const timer=setTimeout(()=>dropWorker(new Error("Tiempo de ejecución agotado. Revisa bucles infinitos, librerías o la conexión.")),timeoutMs);
   pending.set(id,{type,resolve,reject,timer});
   w.postMessage({id,type,...data});
  }catch(error){reject(error);}
 });
}
let queue=Promise.resolve();
function enqueue(task){
 const promise=queue.then(task,task);
 queue=promise.catch(()=>{});
 return promise;
}
async function run(code,{timeoutMs=90000}={}){
 if(typeof code!=="string"||!code.trim())throw new Error("Escribe código antes de ejecutar.");
 return enqueue(()=>send("run",{code},timeoutMs));
}
async function downloadFile(name){
 if(typeof name!=="string"||!ALLOWED_FILE.test(name))throw new Error("Nombre de archivo no permitido.");
 return enqueue(async()=>{
  const file=await send("download",{name},20000);
  const mime=name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
   name.endsWith(".csv")?"text/csv":name.endsWith(".png")?"image/png":"text/plain";
  const blob=new Blob([file.bytes],{type:mime});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;a.hidden=true;document.body.appendChild(a);
  try{a.click();}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return true;
 });
}
window.IJR_RUNNER={run,downloadFile,reset:()=>dropWorker(),mode:"browser-pyodide"};
})();
