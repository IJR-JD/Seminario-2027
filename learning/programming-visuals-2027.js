/* Seminario 2027 · Programming Concept Animations
 * Topic-authored SVG diagrams for the general Python course.
 * Uses the same SVG player (lesson-motion-v2.js) as the previous Data Science
 * track, but teaches algorithms, control flow, loops, functions and core Python.
 */
(()=>{"use strict";
if(window.SEMINAR_2027_TRACK!=="programming")return;
const lessons=window.SEMINAR_2027_COURSE||[];
const param=new URLSearchParams(location.search).get("topic")||"algoritmos";
const topic=lessons.find(t=>t.slug===param)||lessons[0];
if(!topic)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const text=(x,y,s,size=17,weight=700,anchor="middle",color="#191919",cls="")=>'<text class="'+cls+'" x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="'+size+'" font-weight="'+weight+'">'+esc(s)+'</text>';
const box=(x,y,w,h,{fill="#fff",stroke="#1a1a1a",rx=10,sw=1.5,cls=""}={})=>'<rect class="'+cls+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const path=(d,{stroke="#181818",sw=2,dash="",cls=""}={})=>'<path class="'+cls+'" d="'+d+'" fill="none" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
const arrow=(x1,y1,x2,y2)=>path('M'+x1+' '+y1+'L'+x2+' '+y2,{sw:2.1,cls:"pc27-arrow"})+path('M'+(x2-9)+' '+(y2-6)+'L'+x2+' '+y2+'L'+(x2-9)+' '+(y2+6),{sw:2.1});
const group=(x,y,w,h,title,sub="",dark=false)=>{
 return '<g class="sv27-box pc27-unit">'+box(x,y,w,h,{fill:dark?"#171717":"#fff",stroke:"#171717",rx:9})+
 text(x+w/2,y+35,title,w<155?15:17,820,"middle",dark?"#fff":"#111")+
 (sub?text(x+w/2,y+60,sub,w<155?12:13,520,"middle",dark?"#dedede":"#555"):"")+'</g>';
};
const flow=(nodes,{note="",emphasis=-1}={})=>{
 const n=nodes.length,gap=20,w=(782-gap*(n-1))/n;
 let a="";nodes.forEach((n,i)=>{
  const x=49+i*(w+gap);
  a+=group(x,130,w,88,n[0],n[1]||"",i===emphasis)+(i===nodes.length-1?"":arrow(x+w+2,172,x+w+gap-3,172));
 });
 return a+(note?text(440,257,note,17,660):"");
};
const diamond=(cx,cy,w,h,label)=>'<g class="sv27-box pc27-decision"><path d="M'+cx+' '+(cy-h/2)+'L'+(cx+w/2)+' '+cy+'L'+cx+' '+(cy+h/2)+'L'+(cx-w/2)+' '+cy+'Z" fill="#fff" stroke="#171717" stroke-width="2.2"/>'+
 text(cx,cy+5,label,15,800)+'</g>';
const oval=(cx,cy,w,h,label)=>'<g class="sv27-box">'+box(cx-w/2,cy-h/2,w,h,{rx:h/2,fill:"#191919",stroke:"#191919"})+text(cx,cy+5,label,15,800,"middle","#fff")+'</g>';
const branching=(mode)=>{
 let b=oval(130,158,118,56,"START")+arrow(190,158,317,158)+diamond(425,158,190,125,mode==="flowchart"?"condition?":mode==="while"?"n < 3 ?":"score ≥ 60 ?");
 b+=path("M520 158H585V105H634")+path("M625 99L634 105L625 111");
 b+=path("M425 221V248H635")+path("M626 242L635 248L626 254");
 b+=text(560,145,"YES",13,820)+text(461,243,"NO",13,820);
 b+=group(634,65,196,77,mode==="flowchart"?"PROCESS":mode==="while"?"RUN BODY":"PASS","Yes branch",true);
 b+=group(634,211,196,77,mode==="flowchart"?"ALTERNATIVE":mode==="while"?"EXIT":"RETRY","No branch");
 if(mode==="while"){
  b+=path("M732 65V52H425V93",{dash:"6 6",cls:"pc27-cycle"});
  b+=text(565,40,"repeat / update n",13,620);
 }else b+=text(739,180,"mutually exclusive",12,580);
 return b;
};
const rowTable=(headers,data,{selected=-1,width=710,left=85,top=86}={})=>{
 const col=width/headers.length,dy=47;let b="";
 headers.forEach((h,i)=>b+=box(left+col*i,top,col,dy,{rx:0,fill:"#1d1d1d",stroke:"#fff",sw:1})+text(left+col*(i+.5),top+29,h,14,800,"middle","#fff"));
 data.forEach((row,r)=>{
  b+='<g class="sv27-box pc27-table-row">'+box(left,top+(r+1)*dy,width,dy,{fill:r===selected?"#e7e7e3":r%2?"#f8f8f6":"#fff",stroke:"#dbdbd7",sw:1,rx:0});
  row.forEach((value,i)=>b+=text(left+col*(i+.5),top+(r+1)*dy+29,String(value),16,r===selected?820:580));b+='</g>';
 });
 return b;
};
const cells=(values,{label="INDEX",first=0,y=137,selected=-1}={})=>{
 const len=values.length, w=Math.min(150,(756-12*(len-1))/len),gap=12,start=(880-(len*w+(len-1)*gap))/2;
 let b=text(start,88,label,13,820,"start","#565656");
 values.forEach((v,i)=>{
  const x=start+i*(w+gap);b+='<g class="sv27-box pc27-list-cell">'+box(x,y,w,81,{fill:i===selected?"#171717":"#fff"})+
  text(x+w/2,y+37,v,23,820,"middle",i===selected?"#fff":"#111")+
  text(x+w/2,y+66,'index '+(i+first),12,700,"middle",i===selected?"#dddddd":"#666")+'</g>';
 });
 b+=text(440,276,"ordered values · zero-based positions",15,600);
 return b;
};
const grid=(cols=4,rows=3)=>{
 let b="",start=210,w=108,gap=12;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const x=start+c*(w+gap),y=85+r*(57+10);
  b+='<g class="sv27-box pc27-grid-cell" style="--pc-index:'+(r*cols+c)+'">'+box(x,y,w,57,{fill:r===0&&c===0?"#161616":"#fff",rx:6,stroke:"#a9a9a5"})+
   text(x+w/2,y+34,r+","+c,16,760,"middle",r===0&&c===0?"#fff":"#111")+'</g>';
 }
 return b+text(440,312,rows+' rows × '+cols+' columns = '+(rows*cols)+' iterations',16,760);
};
const source=(lines,{x=126,y=83,w=625,focus=0}={})=>{
 let b=box(x,y,w,Math.min(215,lines.length*37+29),{fill:"#fafafa",stroke:"#d5d5d2",rx:10});
 lines.forEach((line,i)=>b+='<g class="sv27-box pc27-code-line">'+
  (i===focus?box(x+12,y+16+i*37,w-24,36,{fill:"#ececea",stroke:"none",sw:0,rx:5}):"")+
  text(x+24,y+42+i*37,String(i+1).padStart(2,"0"),13,700,"start","#898984")+
  text(x+64,y+42+i*37,line,15,630,"start","#161616","pc27-mono")+'</g>');
 return b;
};
const dictionary=()=>group(100,105,230,92,"name","key")+
 arrow(338,152,530,152)+group(548,105,230,92,"'Ana'","mapped value",true)+
 text(440,252,"mapping[key] retrieves a value by its key",17,620);
const modules=()=>flow([["PROGRAM","import math"],["MODULE","math"],["FUNCTION","sqrt(81)"],["OUTPUT","9.0"]],{emphasis:1});
const templates={
 problem:{beats:["Identify the problem's input data.","Apply one clearly defined processing step.","Describe the final output."],build:()=>flow([["INPUT","base = 6"],["PROCESS","6 × 4"],["OUTPUT","24"]],{emphasis:1})},
 trace:{beats:["Start with x = 3.","Update x by adding two.","Read the new value x = 5."],build:()=>flow([["x = 3","initial state"],["x = x + 2","update"],["x = 5","new state"]])},
 flowchart:{beats:["Start at the terminator.","Test the condition in the diamond.","Follow the Yes/No arrows.","Complete the selected processing branch."],build:()=>branching("flowchart")},
 branch:{beats:["Evaluate score ≥ 60?","Follow Yes if the score meets the threshold.","Follow No otherwise.","The two alternatives are mutually exclusive."],build:()=>branching("decision")},
 execution:{beats:["Enter a Python expression.","The interpreter evaluates its operands.","The computed value is sent to print().","The console displays the result."],build:()=>flow([["SOURCE","a = 17"],["EXPRESSION","a + 8"],["PRINT","print(...)"],["CONSOLE","25"]],{emphasis:3})},
 operators:{beats:["Evaluate multiplication first: 3 × 4 = 12.","Add two to obtain 14.","Parentheses can change the order."],build:()=>flow([["2 + 3 × 4","expression"],["3 × 4 = 12","first"],["2 + 12","second"],["14","result"]])},
 memory:{beats:["Read the variable name score.","Bind score to the current value 85.","A later assignment can update the binding."],build:()=>flow([["score","name"],["=","assignment"],["85","int value"]],{emphasis:2})},
 types:{beats:["An int stores whole numbers.","A float represents decimal numbers.","A str stores text.","A bool is True or False.","None represents no value."],build:()=>cells(["42","4.5",'"10A"',"True","None"],{label:"FIVE COMMON PYTHON VALUES",y:137})},
 conversion:{beats:["Input begins as the string '12'.","int('12') converts it to a number.","Arithmetic now evaluates 12 + 3."],build:()=>flow([['"12"',"str"],["int(...)","conversion"],["15","numerical result"]])},
 io:{beats:["Begin with simulated user text '17'.","Convert the text to an integer.","Use the number in an expression.","Print the formatted response."],build:()=>flow([["USER TEXT",'"17"'],["int(...)","17"],["+ 1","18"],["OUTPUT","Next year: 18"]])},
 format:{beats:["Store values under names.","Insert them into an f-string.","Print the readable sentence."],build:()=>flow([["name","'Ana'"],['f"Hello, {name}!"',"interpolate"],["CONSOLE","Hello, Ana!"]])},
 logic:{beats:["Evaluate the case False, False.","Evaluate False, True.","Evaluate True, False.","Evaluate True, True."],build:()=>rowTable(["A","B","A and B","A or B"],[["F","F","F","F"],["F","T","F","T"],["T","F","F","T"],["T","T","T","T"]],{selected:3})},
 comparison:{beats:["Compare age against 18.","Compare has_id against True.","Combine the checks with and.","The final condition is True only when both pass."],build:()=>flow([["age ≥ 18","True"],["has_id","True"],["AND","both"],["True","result"]])},
 decision:{beats:["Evaluate the decision condition.","The Yes path executes PASS.","The No path executes RETRY.","Only one branch runs per decision."],build:()=>branching("decision")},
 indent:{beats:["Start at the if statement.","Read the indented branch body.","After the branch, execution continues outside."],build:()=>source(["if ready:","    print('Go')","else:","    print('Wait')","print('Done')"],{focus:1})},
 iteration:{beats:["range(1,5) begins at 1.","The loop visits 2 on its next iteration.","It continues with 3.","The last value is 4; stop 5 is excluded."],build:()=>cells(["1","2","3","4"],{label:"for n in range(1, 5)",y:132})},
 accumulate:{beats:["Initialize the total at zero.","Add 1; total becomes 1.","Add 2; total becomes 3.","Add 3; total becomes 6.","Add 4; total becomes 10."],build:()=>flow([["0","initial"],["+1 → 1","step 1"],["+2 → 3","step 2"],["+3 → 6","step 3"],["+4 → 10","final"]])},
 while:{beats:["Test n < 3 before running the body.","If True, execute and increment n.","Repeat until n reaches 3.","Exit when the test becomes False."],build:()=>branching("while")},
 dowhile:{beats:["Enter while True and execute the body once.","Increment the state before testing.","Check the break condition.","If it is True, break out of the loop."],build:()=>flow([["while True","enter"],["BODY","n += 1"],["if n >= 3","test"],["break","exit"]],{emphasis:3})},
 grid:{beats:["Visit row 0, column 0.","Traverse columns within the first row.","Advance to the next row.","The inner body runs 12 times on a 3×4 grid."],build:()=>grid(4,3)},
 pattern:{beats:["First outer iteration prints one star.","Second outer iteration prints two.","Third outer iteration prints three."],build:()=>source(["for row in range(1, 4):","    print('*' * row)","OUTPUT: *","        **","        ***"],{focus:1})},
 call:{beats:["The caller passes arguments 4 and 6.","add(a,b) computes the sum.","return transfers 10 to the caller.","print displays 10."],build:()=>flow([["CALL","add(4,6)"],["PARAMETERS","a=4 · b=6"],["RETURN","a+b"],["CONSOLE","10"]])},
 scope:{beats:["The outer program has its own variables.","The function receives a local parameter.","The local result is returned rather than leaked."],build:()=>flow([["OUTSIDE","x = 4"],["INSIDE","value = x + 2"],["RETURN","6"]])},
 list:{beats:["The first element is at index zero.","Index 1 selects the second value.","The final element is at index 3.","Negative indexing also accesses the final value."],build:()=>cells(["6","10","15","21"],{selected:1})},
 mutation:{beats:["Start with three list elements.","Assignment updates one existing position.","append adds a new element at the end."],build:()=>flow([["[6, 10, 15]","original"],["items[1]=11","mutation"],["append(21)","growth"],["[6,11,15,21]","result"]])},
 slice:{beats:["Set start index to 1.","Set stop index to 3, excluded.","Select positions 1 and 2."],build:()=>cells(["3","6","9","12"],{selected:1,label:"items[1:3] returns [6, 9]"})},
 characters:{beats:["Character 0 is 'P'.","Character 1 is 'y'.","Continue through the ordered string.","Index -1 identifies final character 'n'."],build:()=>cells(["P","y","t","h","o","n"],{label:"word = 'Python' · Unicode character indices"})},
 transform:{beats:["Start with surrounding whitespace.","strip() removes outer spaces.","upper() converts to uppercase.","The result is a new string."],build:()=>flow([['"  hello  "',"original"],["strip()","hello"],["upper()","HELLO"]])},
 mapping:{beats:["Select the dictionary key 'name'.","Find the value attached to that key.","Return the stored string 'Ana'."],build:dictionary},
 sets:{beats:["Begin with repeated values 1, 2, 2 and 3.","Construct a set from that sequence.","The set contains three distinct values."],build:()=>flow([["LIST","[1,2,2,3]"],["set(...)","remove repeats"],["UNIQUE","{1,2,3}"]])},
 modules:{beats:["Your program imports math.","Python resolves the math module.","The call math.sqrt(81) runs.","The returned result is 9.0."],build:modules},
 libraries:{beats:["math supplies numeric functions.","random provides pseudo-random generation.","pathlib helps work with file paths."],build:()=>flow([["math","sqrt · pi"],["random","Random(seed)"],["pathlib","Path(...)"]])},
 traceback:{beats:["Run the statement with a bad conversion.","The interpreter identifies ValueError.","Read the exception type and failing line.","Replace or validate the input."],build:()=>flow([["SOURCE","int('abc')"],["EXCEPTION","ValueError"],["INSPECT","bad text"],["FIX","validate input"]])},
 recovery:{beats:["Try the conversion.","Follow the success path if valid.","Catch ValueError for bad text.","Return a helpful error message."],build:()=>flow([["try:","int(text)"],["ValueError?","bad input"],["except","show message"],["CONTINUE","recover"]])},
 architecture:{beats:["Define what the application needs.","Validate incoming values.","Compute through reusable functions.","Format and display the result."],build:()=>flow([["REQUIREMENTS","user goal"],["INPUT","validation"],["FUNCTIONS","processing"],["OUTPUT","result"]])},
 test:{beats:["Define one normal input.","Check the boundary condition.","Test invalid or missing data.","Compare actual with expected behavior."],build:()=>rowTable(["TEST","INPUT","EXPECTED"],[["Normal","[4,6]","5.0"],["Boundary","[]","0"],["Invalid","'x'","handled"]],{selected:1})}
};
const modeByType={flowchart:"flow",branch:"flow",decision:"flow",while:"flow",grid:"flow",list:"flow",slice:"flow",types:"flow",logic:"flow",test:"flow"};
function compose(type,ordinal){
 const item=templates[type];if(!item)throw Error("Missing programming diagram "+type);
 const model=item.build();
 const label=(topic.diagrams?.[ordinal]?.title)||type;
 const id=topic.slug+"/"+ordinal;
 const bg='<defs><pattern id="pc-grid-'+ordinal+'" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#e9e9e6" stroke-width=".7"/></pattern></defs>'+
 box(1,1,878,328,{fill:"#fff",stroke:"#dededb",rx:0})+
 '<rect x="10" y="56" width="860" height="231" fill="url(#pc-grid-'+ordinal+')" opacity=".48"/>';
 const header=text(32,32,"IJR   /   PROGRAMMING 2027   •   "+String(ordinal+1).padStart(2,"0"),12,850,"start","#5d5d59")+
 path("M32 47H848",{stroke:"#d4d4d0",sw:1})+
 text(847,32,type.toUpperCase().replace(/-/g," "),11,820,"end","#777");
 const footer=path("M32 292H848",{stroke:"#e3e3df",sw:1})+text(32,315,label,14,730,"start","#484845");
 return '<div class="sv27-figure pc27-figure" data-motion-id="'+esc(id)+'" role="img" aria-label="'+esc(label)+'"><svg viewBox="0 0 880 330" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+bg+header+model+footer+'</svg></div>';
}
window.IJR_PROGRAMMING_MOTION_SEQUENCES=Object.fromEntries(lessons.map(unit=>[
 unit.slug,(unit.diagrams||[]).map(d=>{
  const x=templates[d.type];
  if(!x)throw Error("No motion plan for "+d.type);
  return {mode:modeByType[d.type]||"flow",beats:x.beats};
 })
]));
function renderTheory(){
 const cards=[...document.querySelectorAll("#diagramGrid .diagram-card-v2")];
 if(!cards.length)return;
 cards.forEach((card,i)=>{
  const diagram=topic.diagrams?.[i];if(!diagram)return;
  const host=card.querySelector(".diagram-stage");if(!host)return;
  host.classList.add("sv27-stage","pc27-stage");
  host.innerHTML=compose(diagram.type,i);
 });
}
function renderWorkshop(){
 const problem=document.getElementById("problemPrompt");
 if(!problem)return;
 const parent=problem.closest(".problem-panel"),guide=parent?.querySelector(".guide-panel");
 if(!parent||!guide)return;
 const panel=document.createElement("section");
 panel.className="sv27-workshop-panel pc27-workshop-panel";
 panel.setAttribute("aria-label","Animated programming concept for the current exercise");
 panel.innerHTML='<header class="sv27-workshop-heading"><span>PROGRAMMING MODEL / UNIT '+String(topic.order).padStart(2,"0")+'</span><strong>Trace the concept before solving</strong><small>Guidance, never the full answer</small></header><div class="sv27-workshop-body" role="region" tabindex="0" aria-label="Scrollable code diagram"></div><div class="sv27-workshop-footer">Follow the model; write your own code below.</div>';
 parent.insertBefore(panel,guide);
 const badge=document.getElementById("stageBadge"),body=panel.querySelector(".sv27-workshop-body"),footer=panel.querySelector(".sv27-workshop-footer");
 let last=-1;
 const update=()=>{
  const match=badge?.textContent.match(/STAGE\s+(\d+)/i);
  const pos=match?Math.max(0,Math.min(11,Number(match[1])-1)):0;
  if(pos===last)return;last=pos;
  const len=topic.diagrams?.length||1;
  const visualIndex=Math.min(len-1,Math.floor(pos/Math.ceil(12/len)));
  body.innerHTML=compose(topic.diagrams[visualIndex].type,visualIndex).replace('data-motion-id="'+esc(topic.slug+"/"+visualIndex)+'"','data-motion-id="'+esc(topic.slug+"/stage-"+pos)+'"');
  footer.textContent="STAGE "+String(pos+1).padStart(2,"0")+" / 12  ·  Trace the illustrated concept, then independently implement and test your Python solution.";
 };
 badge&&new MutationObserver(update).observe(badge,{childList:true,characterData:true,subtree:true});
 update();
}
function run(){
 renderTheory();renderWorkshop();
 document.documentElement.classList.add("sv27-visual-system","pc27-coding-track");
 window.IJR_2027_VISUAL_COVERAGE={
  topic:topic.slug,diagramsExpected:topic.diagrams.length,
  diagramsEnhanced:document.querySelectorAll("#diagramGrid .pc27-figure").length,
  workshopPanel:!!document.querySelector(".pc27-workshop-panel"),track:"programming"
 };
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();