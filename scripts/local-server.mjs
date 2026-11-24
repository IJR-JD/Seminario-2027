import http from 'node:http';
import path from 'node:path';
import {stat,readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {root,runtimeRoots,localizeThree,localizeMedia} from './local-build.mjs';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.wasm':'application/wasm','.mp4':'video/mp4','.md':'text/plain; charset=utf-8','.gd':'text/plain; charset=utf-8','.tscn':'text/plain; charset=utf-8','.godot':'text/plain; charset=utf-8'};
export async function startServer({dist=false,port=Number(process.env.PORT||8765)}={}){
 const base=dist?path.join(root,'dist'):root;
 const server=http.createServer(async(req,res)=>{
  try{
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
   let raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(raw==='/Seminario-2027'){res.writeHead(302,{Location:'/Seminario-2027/'});return res.end();}
   raw=raw.replace(/^\/Seminario-2027\//,'/');
   if(raw.includes('\\')||raw.includes('\0')||raw.split('/').some(x=>x==='..'||x.startsWith('.'))){res.writeHead(403);return res.end();}
   let rel=raw.replace(/^\/+/,''),dir=base;
   if(!dist&&rel.startsWith('vendor/three/')){dir=path.join(root,'node_modules/three');rel=rel.slice('vendor/three/'.length);}
   else if(!dist&&rel.startsWith('vendor/media/')){dir=path.join(root,'.local-media');rel=rel.slice('vendor/media/'.length);}
   else if(rel&&!runtimeRoots.includes(rel.split('/')[0])&&!(dist&&['vendor','build-manifest.json'].includes(rel.split('/')[0]))){res.writeHead(404);return res.end();}
   let p=path.resolve(dir,rel);if(p!==dir&&!p.startsWith(dir+path.sep)){res.writeHead(403);return res.end();}
   let info=await stat(p);
   if(info.isDirectory()){if(!raw.endsWith('/')){res.writeHead(302,{Location:new URL(req.url,'http://localhost').pathname+'/'});return res.end();}p=path.join(p,'index.html');info=await stat(p);}
   if(!info.isFile()){res.writeHead(404);return res.end();}
   const headers={'Content-Type':mime[path.extname(p)]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
   let data=null;
   if(!dist&&p.endsWith('codequest-rpg'+path.sep+'index.html')||!dist&&p.endsWith('codequest-rpg'+path.sep+'skills.html'))data=Buffer.from(localizeThree(await readFile(p,'utf8')));
   if(!dist&&p.endsWith('projects'+path.sep+'cad-curriculum.js'))data=Buffer.from(await localizeMedia(await readFile(p,'utf8'),path.join(root,'.local-media')));
   if(data){res.writeHead(200,{...headers,'Content-Length':data.length});return res.end(req.method==='HEAD'?undefined:data);}
   let start=0,end=info.size-1,status=200;
   if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':'bytes */'+info.size});return res.end();}if(!m[1])start=Math.max(0,info.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':'bytes */'+info.size});return res.end();}status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+info.size;}
   res.writeHead(status,{...headers,'Accept-Ranges':'bytes','Content-Length':Math.max(0,end-start+1)});
   if(req.method==='HEAD'||info.size===0)return res.end();
   createReadStream(p,{start,end}).on('error',()=>res.destroy()).pipe(res);
  }catch(error){if(!res.headersSent)res.writeHead(error.code==='ENOENT'||error.code==='ENOTDIR'?404:400);res.end();}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const dist=process.argv.includes('--dist'),server=await startServer({dist});
 const url='http://127.0.0.1:'+server.address().port+'/Seminario-2027/';
 console.log((dist?'Built':'Editable')+' site: '+url+'\nCodeQuest: '+url+'projects/codequest-rpg/\nCtrl+C to stop.');
}
