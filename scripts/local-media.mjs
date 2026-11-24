import {readFile,mkdir,rename,rm,stat} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {root,videoUrls,mediaName} from './local-build.mjs';
const urls=videoUrls(await readFile(path.join(root,'projects/cad-curriculum.js'),'utf8'));
const dir=path.join(root,'.local-media');await mkdir(dir,{recursive:true});
let failed=0;
for(const url of urls){
 const name=mediaName(url),dest=path.join(dir,name),tmp=dest+'.part';
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(180000)});
  if(!response.ok||!response.body)throw Error('HTTP '+response.status);
  await pipeline(Readable.fromWeb(response.body),createWriteStream(tmp));
  const size=(await stat(tmp)).size;
  const header=await readFile(tmp);if(size<100000||header.subarray(4,8).toString()!=='ftyp')throw Error('Not a complete MP4 file');
  const expected=response.headers.get('content-length');if(expected&&Number(expected)!==size)throw Error('Incomplete download');
  await rename(tmp,dest);console.log('PASS '+name+' '+size+' bytes');
 }catch(e){failed++;await rm(tmp,{force:true});console.error('FAILED '+name+': '+e.message);}
}
console.log((urls.length-failed)+'/'+urls.length+' original videos downloaded. Run npm run build to include them.');
if(failed)process.exitCode=1;
