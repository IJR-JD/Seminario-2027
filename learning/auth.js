(()=>{"use strict";
const settings=window.SEMINAR_2027_CONFIG||{};
const emailRE=/^[^\s@]+@ijr\.edu\.co$/i;
const configured=Boolean(settings.url&&/^sb_publishable_|^eyJ/.test(settings.publishableKey||""));
let client=null,state={status:configured?"loading":"not_configured",user:null,profile:null,reason:""},promise=null;
const listeners=new Set();
function notify(){for(const fn of listeners){try{fn(state)}catch{}}document.dispatchEvent(new CustomEvent("ijr:auth",{detail:state}));}
const api={
 get state(){return state},
 get configured(){return configured},
 get client(){return client},
 subscribe(fn){listeners.add(fn);fn(state);return()=>listeners.delete(fn)},
 async ready(){if(!promise)promise=init();return promise},
 async start(email){await api.ready();email=String(email||"").toLowerCase().trim();
  if(!emailRE.test(email))throw new Error("Utiliza exclusivamente tu correo institucional @ijr.edu.co.");
  if(!client)throw new Error("La conexión Supabase de Seminario 2027 aún no está configurada.");
  const redirectTo=settings.redirectUrl||new URL("../",location.href).href;
  const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});
  if(error)throw error;return true;
 },
 async logout(){if(client){await client.auth.signOut();}state={status:configured?"signed_out":"not_configured",user:null,profile:null,reason:""};notify();},
 async progress(topic){await api.ready();if(state.status!=="verified")return [];
 const {data,error}=await client.from("seminar_practice_progress").select("stage_key").eq("topic_slug",topic);
 if(error)throw error;return (data||[]).map(x=>x.stage_key);
 },
 async saveStage(topic,stage){await api.ready();if(state.status!=="verified"||!state.profile)return {saved:false,reason:"Sin sesión verificada"};
 const {error}=await client.from("seminar_practice_progress").upsert({
 auth_user_id:state.user.id,topic_slug:String(topic),stage_key:String(stage)
 },{onConflict:"auth_user_id,topic_slug,stage_key"});
 if(error)throw error;return {saved:true};
 }
};
function set(next){state=next;notify();return state;}
async function init(){
 if(!configured)return set({status:"not_configured",user:null,profile:null,reason:"Falta una clave publicable del proyecto de 2027."});
 if(!window.supabase?.createClient)return set({status:"unavailable",user:null,profile:null,reason:"No se cargó la biblioteca de Supabase."});
 client=window.supabase.createClient(settings.url,settings.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data,error}=await client.auth.getUser();
 if(error||!data?.user)return set({status:"signed_out",user:null,profile:null,reason:""});
 const user=data.user;
 if(!emailRE.test(user.email||"")){await client.auth.signOut();return set({status:"blocked",user:null,profile:null,reason:"Solo se admiten cuentas institucionales @ijr.edu.co."});}
 if(!user.email_confirmed_at)return set({status:"pending_email_verification",user,profile:null,reason:"Confirma el correo institucional."});
 const {data:profile,error:pErr}=await client.from("seminar_students")
 .select("id,full_name,class_group,academic_year,auth_user_id")
 .eq("institutional_email",user.email.toLowerCase()).eq("academic_year",settings.year||2027)
 .maybeSingle();
 if(pErr)return set({status:"backend_error",user,profile:null,reason:pErr.message||"Error consultando matrícula"});
 if(!profile)return set({status:"not_enrolled",user,profile:null,reason:"Tu correo está verificado, pero todavía no figura en el listado oficial del seminario."});
 if(profile.auth_user_id&&profile.auth_user_id!==user.id)return set({status:"blocked",user,profile:null,reason:"Esta matrícula ya está asociada a otra identidad."});
 if(!profile.auth_user_id){
  const {error:claimError}=await client.from("seminar_students").update({auth_user_id:user.id}).eq("id",profile.id);
  if(claimError)return set({status:"backend_error",user,profile:null,reason:"No fue posible asociar tu matrícula: "+claimError.message});
 }
 return set({status:"verified",user,profile:{...profile,auth_user_id:user.id},reason:""});
}
async function refresh(){promise=init();return promise;}
window.IJR_AUTH=api;
document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("institutionalForm");
 const field=document.getElementById("institutionalEmail");
 const message=document.getElementById("institutionalStatus");
 const button=document.getElementById("institutionalSubmit");
 const logout=document.getElementById("institutionalLogout");
 const badge=document.getElementById("identityBadge");
 api.subscribe(s=>{
  if(badge){badge.textContent=s.status==="verified"?"✓ "+s.profile.class_group+" · "+s.user.email:s.status==="not_configured"?"Institutional access pending":s.status==="not_enrolled"?"Matrícula por validar":"Institutional email";}
  if(logout)logout.classList.toggle("hidden",!s.user);
  if(message && s.status==="verified")message.textContent="Registro verificado: "+s.user.email+" · "+s.profile.class_group+".";
  else if(message && s.status==="not_enrolled")message.textContent=s.reason;
  else if(message && s.status==="not_configured")message.textContent="La verificación institucional necesita habilitar la clave publicable y la matrícula en Supabase 2027.";
 });
 if(form)form.addEventListener("submit",async e=>{
  e.preventDefault();
  if(!field)return;
  if(button)button.disabled=true;
  if(message)message.textContent="Preparando acceso institucional…";
  try{await api.start(field.value);if(message)message.textContent="Revisa tu bandeja institucional. Abre el enlace de confirmación para completar el inicio de sesión.";}
  catch(error){if(message)message.textContent=error.message||String(error);}
  finally{if(button)button.disabled=false;}
 });
 if(logout)logout.addEventListener("click",()=>api.logout());
 api.ready();
});
})();