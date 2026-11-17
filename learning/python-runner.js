(()=>{"use strict";
let worker=null,sequence=0;
const pending=new Map();
function dropWorker(error){
 if(worker){worker.terminate();worker=null;}
 for(const [,p] of pending){clearTimeout(p.timer);p.reject(error||new Error("Python worker reset"));}
 pending.clear();
}
function ensureWorker(){
 if(worker)return worker;
 worker=new Worker(new URL("python-worker.js",document.currentScript?.src||location.href));
 worker.onmessage=event=>{
  const msg=event.data||{};const req=pending.get(msg.id);if(!req)return;
  pending.delete(msg.id);clearTimeout(req.timer);
  if(msg.status==="ok")req.resolve({ok:true,output:msg.output||""});
  else req.resolve({ok:false,output:msg.error||"Python error",error:msg.error||"Python error"});
 };
 worker.onerror=()=>dropWorker(new Error("No se pudo cargar Python. Comprueba la conexión e inténtalo de nuevo."));
 return worker;
}
async function run(code,{timeoutMs=90000}={}){
 if(typeof code!=="string"||!code.trim())throw new Error("Escribe código antes de ejecutar.");
 const id=++sequence;
 return await new Promise((resolve,reject)=>{
  try{
   const w=ensureWorker();
   const timer=setTimeout(()=>{dropWorker(new Error("Tiempo de ejecución agotado. Revisa bucles infinitos o librerías."));},timeoutMs);
   pending.set(id,{resolve,reject,timer});
   w.postMessage({id,type:"run",code});
  }catch(e){reject(e);}
 });
}
window.IJR_RUNNER={run,reset:()=>dropWorker(),mode:"browser-pyodide"};
})();