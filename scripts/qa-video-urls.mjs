/* CI-only check for the original externally hosted ManimCE MP4s.
 * This probes the real URLs after verifying Git commit provenance locally.
 * A successful HEAD verifies reachability, not frame-by-frame video playback.
 */
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../projects/cad-curriculum.js",import.meta.url),"utf8");
const context={window:{}};
vm.runInNewContext(source,context);
const videos=context.window.SEMINAR_2027_CAD.source.verifiedOperationVideos;
let failures=0;
for(const clip of videos){
  try{
    const signal=AbortSignal.timeout(15000);
    const response=await fetch(clip.src,{method:"HEAD",signal,redirect:"follow"});
    const length=response.headers.get("content-length");
    const kind=response.headers.get("content-type");
    const ok=response.ok && (!length||Number(length)>1000000);
    process.stdout.write((ok?"PASS":"FAIL")+" MP4 HEAD "+clip.id+" "+response.status+" "+kind+" "+(length||"unknown length")+"\n");
    if(!ok)failures++;
  }catch(error){
    failures++;
    process.stdout.write("WARN MP4 HEAD "+clip.id+" "+String(error)+"\n");
  }
}
console.log("Original ManimCE MP4 links checked:",videos.length,"failures:",failures);
if(failures)process.exitCode=1;
