"use strict";
const correct = {q1:"b",q2:"c",q3:"a",q4:"b",q5:"a"};
const explanations = {
q1:"La estructura general es Entrada → Proceso → Salida.",
q2:"16 es un número entero: int.",
q3:"5000 × 2 = 10000.",
q4:'Una cadena de texto se escribe entre comillas: nombre = "Ana".',
q5:"True representa un valor lógico de tipo bool."
};
const form=document.getElementById("quiz");
const score=document.getElementById("score");
const status=document.getElementById("status");
form.addEventListener("submit",(event)=>{
event.preventDefault();
let count=0;
for(const [question,answer] of Object.entries(correct)){
const picked=form.querySelector('input[name="'+question+'"]:checked');
const feedback=document.getElementById("f"+question.slice(1));
const ok=Boolean(picked&&picked.value===answer);
if(ok)count++;
feedback.textContent=(ok?"Correcto. ":"Revisa esta respuesta. ")+explanations[question];
feedback.className="feedback "+(ok?"good":"bad");
}
score.textContent="Resultado: "+count+" de 5 respuestas correctas ("+(count*20)+" %).";
status.textContent="Último resultado de práctica: "+count+"/5. Puedes revisar las explicaciones y repetir.";
});
document.getElementById("resetQuiz").addEventListener("click",()=>{
form.reset();score.textContent="";status.textContent="Completa el workshop para consultar tu resultado en este dispositivo.";
for(let i=1;i<=5;i++){const element=document.getElementById("f"+i);element.textContent="";element.className="feedback";}
});