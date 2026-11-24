import {cp,readFile,writeFile,mkdir,rm,stat,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
export const root=fileURLToPath(new URL('../',import.meta.url));
export const runtimeRoots=['index.html','assets','learning','projects'];
export const threePrefix='https://cdn.jsdelivr.net/npm/three@0.170.0/';
export const localizeThree=s=>s.replaceAll(threePrefix,'../../vendor/three/');
export const videoUrls=s=>[...new Set(s.match(/https:\/\/raw\.githubusercontent\.com\/juanperez238421-cpu\/Manim-Scientific-Visualize\/[a-f0-9]{40}\/[^"\s]+\.mp4/g)??[])];
export const mediaName=url=>url.split('/').at(-1);
export async function hasFile(p){try{return (await stat(p)).isFile();}catch{return false;}}
export async function localizeMedia(s,mediaRoot){for(const url of videoUrls(s)){if(await hasFile(path.join(mediaRoot,mediaName(url))))s=s.replaceAll(url,'../vendor/media/'+mediaName(url));}return s;}
async function list(dir,prefix=''){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const name=path.join(dir,entry.name),rel=prefix+entry.name;if(entry.isDirectory())files.push(...await list(name,rel+'/'));else if(entry.isFile())files.push(rel);}return files;}
export async function build(){
 const dist=path.join(root,'dist'),three=path.join(root,'node_modules/three');
 if(!await hasFile(path.join(three,'build/three.module.js')))throw Error('Run npm install first.');
 await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
 for(const name of runtimeRoots)await cp(path.join(root,name),path.join(dist,name),{recursive:true});
 const vendor=path.join(dist,'vendor/three');await mkdir(vendor,{recursive:true});
 for(const name of ['build','examples/jsm','LICENSE','package.json'])await cp(path.join(three,name),path.join(vendor,name),{recursive:true});
 for(const name of ['index.html','skills.html']){const p=path.join(dist,'projects/codequest-rpg',name);await writeFile(p,localizeThree(await readFile(p,'utf8')));}
 const cad=path.join(dist,'projects/cad-curriculum.js'),original=await readFile(cad,'utf8'),media=path.join(root,'.local-media');
 const included=[];for(const url of videoUrls(original)){const name=mediaName(url);if(await hasFile(path.join(media,name))){await mkdir(path.join(dist,'vendor/media'),{recursive:true});await cp(path.join(media,name),path.join(dist,'vendor/media',name));included.push(name);}}
 await writeFile(cad,await localizeMedia(original,media));
 let commit=process.env.GITHUB_SHA??'unknown';try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch{}
 const files=[];for(const rel of (await list(dist)).sort()){const data=await readFile(path.join(dist,rel));files.push({path:rel,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
 const manifest={commit,release:'8.5',three:'0.170.0',localVideos:included,externalVideos:videoUrls(original).length-included.length,files};
 await writeFile(path.join(dist,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('BUILD PASS: '+files.length+' files, '+files.reduce((n,f)=>n+f.bytes,0)+' bytes; '+included.length+' local CAD videos; commit '+commit);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
