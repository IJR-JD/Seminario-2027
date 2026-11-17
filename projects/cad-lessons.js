(() => {
  "use strict";
  const cad = window.SEMINAR_2027_CAD;
  const $ = id => document.getElementById(id);
  if (!cad || !$("cadOperations")) return;
  const operations = cad.operations || [];
  const phaseTitles = {
    1:"01 · FUNDAMENTOS Y EXTRUSIÓN",
    2:"02 · REVOLUCIÓN Y GEOMETRÍAS GUIADAS",
    3:"03 · OPERACIONES DE DETALLE Y REPETICIÓN",
    4:"04 · INTEGRACIÓN Y ENTREGA"
  };
  function elem(tag,cl,content) {
    const x=document.createElement(tag);
    if(cl)x.className=cl;
    if(content!==undefined)x.textContent=String(content);
    return x;
  }
  function renderList(target,list) {
    const ul=elem("ol","cad-step-list");
    for(const s of list){ul.appendChild(elem("li","",s));}
    target.append(ul);
  }
  function operationSVG(kind) {
    const stroke="#111",soft="#f4f4f4",gray="#9b9b9b";
    // All drawings are self-contained conceptual SVG illustrations (not ManimCE videos or 3D CAD solids).
    const base='<polygon points="105,83 196,61 253,91 162,115" fill="#f4f4f4" stroke="#111" stroke-width="2"/>'+
      '<polygon points="105,83 162,115 162,162 105,128" fill="#e5e5e5" stroke="#111" stroke-width="2"/>'+
      '<polygon points="162,115 253,91 253,140 162,162" fill="white" stroke="#111" stroke-width="2"/>';
    const extrude='<g class="cad-feature" stroke="#111" stroke-width="2"><polygon points="136,71 176,61 204,76 164,88" fill="#111"/><polygon points="136,71 164,88 164,125 136,107" fill="#d1d1d1"/><polygon points="164,88 204,76 204,112 164,125" fill="#777"/></g>';
    const cut='<g class="cad-feature" stroke="#111" stroke-width="2"><polygon points="146,86 190,75 208,84 164,95" fill="#111"/><path d="M146 86v17l18 11 44-12V84" fill="none" stroke="#111" stroke-dasharray="4 3"/><path d="M164 95v19" stroke="#fff"/></g>';
    const revolve='<g class="cad-feature" stroke="#111" stroke-width="2"><ellipse cx="174" cy="85" rx="57" ry="17" fill="#f0f0f0"/><path d="M117 85v62c0 21 114 21 114 0V85" fill="#ddd"/><ellipse cx="174" cy="85" rx="57" ry="17" fill="#aaa"/><ellipse cx="174" cy="85" rx="20" ry="7" fill="#fff"/><path d="M174 39v140" stroke-dasharray="7 4" stroke="#111"/></g>';
    const sweep='<g class="cad-feature"><path d="M90 138 C128 138 110 51 173 62 S233 130 270 97" stroke="#111" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M90 138 C128 138 110 51 173 62 S233 130 270 97" stroke="#eee" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="90" cy="138" r="9" fill="white" stroke="#111" stroke-width="2"/></g>';
    const loft='<g class="cad-feature" stroke="#111" stroke-width="2"><ellipse cx="180" cy="65" rx="30" ry="15" fill="white"/><path d="M150 65L107 147L255 147L210 65Z" fill="#ddd"/><path d="M107 147L180 168L255 147" fill="none"/><ellipse cx="180" cy="65" rx="30" ry="15" fill="#999"/></g>';
    const pattern='<g class="cad-feature" stroke="#111" stroke-width="2">'+[[137,94],[171,84],[204,75],[150,113],[183,103],[216,94]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="10" ry="4" fill="#111"/>').join('')+'</g>';
    const helix='<g class="cad-feature"><path d="M123 65 C220 29 220 90 123 100 S123 139 220 116 S220 165 123 147" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round"/><path d="M171 55v110" stroke="#888" stroke-dasharray="5 4"/></g>';
    const finish='<g class="cad-feature"><path d="M162 115Q170 119 177 112L247 95" fill="none" stroke="#111" stroke-width="5"/><path d="M111 85L160 116L160 157" fill="none" stroke="#777" stroke-width="5"/></g>';
    const item=kind==="revolve"?revolve:kind==="sweep"?sweep:kind==="loft"?loft:kind==="helix"?helix:
      kind==="cut"?cut:kind==="pattern"?pattern:kind==="finish"?finish:
      kind==="sketch"?'<g class="cad-feature"><rect x="145" y="67" width="59" height="41" fill="none" stroke="#111" stroke-width="3" stroke-dasharray="5 4"/><circle cx="177" cy="85" r="10" fill="none" stroke="#111"/></g>':extrude;
    return '<svg class="cad-svg cad-'+kind+'" viewBox="0 0 340 208" role="img" aria-label="Esquema conceptual: croquis y transformación geométrica"><rect width="340" height="208" fill="#fafaf9"/><path d="M30 182H310M30 182V20" stroke="#ddd" stroke-width="1.5"/>'+
      (["revolve","sweep","loft","helix"].includes(kind)?"":base)+item+
      '<text x="14" y="18" font-family="sans-serif" font-size="11" font-weight="700" fill="#666">PROFILE → FEATURE → RESULT</text>'+
      '<text x="318" y="198" text-anchor="end" font-family="sans-serif" font-size="10" fill="#888">SCHEMATIC · NOT TO SCALE</text></svg>';
  }
  function lessonCard(op,i) {
    const card=elem("article","cad-operation");
    card.id="cad-"+op.id;
    const number=elem("div","cad-operation-number",String(i+1).padStart(2,"0"));
    const body=elem("div","cad-operation-body");
    body.append(elem("span","cad-operation-category",phaseTitles[op.phase]||"CAD"));
    body.append(elem("h3","",op.title));
    body.append(elem("p","cad-definition",op.definition));
    const vis=elem("div","cad-operation-visual");
    vis.innerHTML=operationSVG(op.preview);
    const caption=elem("p","cad-diagram-caption","Esquema conceptual elaborado para Seminario 2027. No es un video ManimCE ni una representación dimensional.");
    const work=elem("div","cad-workshop-mini");
    const details=elem("details","cad-exercise");
    const sum=elem("summary","","Práctica paso a paso · ver instrucciones");
    details.appendChild(sum);
    const inner=elem("div","cad-exercise-content");
    inner.append(elem("strong","", "Objetivo de modelado"));
    inner.append(elem("p","",op.example));
    inner.append(elem("strong","","Construcción"));
    renderList(inner,op.steps);
    inner.append(elem("strong","","Verificación"));
    renderList(inner,op.checks);
    details.appendChild(inner);work.append(details);
    const media=elem("div","cad-operation-media");
    const clips=(cad.source.verifiedOperationVideos||[]).filter(v=>
      (v.operationIds||[v.operationId]).includes(op.id) && /^https:\/\//.test(v.src||""));
    if(clips.length){
      clips.forEach(clip=>{
        const area=elem("section","cad-video-lesson");
        area.append(elem("small","cad-source-label","ORIGINAL MANIMCE · RECOVERED MP4"));
        area.append(elem("h4","cad-video-title",clip.title));
        area.append(elem("p","cad-video-description",clip.description));
        const player=elem("video","cad-video");
        player.controls=true;
        player.preload="none";
        player.playsInline=true;
        player.setAttribute("aria-label","Video original ManimCE: "+clip.title);
        const source=elem("source");
        source.src=clip.src;
        source.type="video/mp4";
        player.append(source);
        const state=elem("small","cad-video-status","Reproductor del MP4 original alojado en GitHub. Pulsa Play para cargarlo.");
        player.addEventListener("error",()=>{
          state.textContent="No se pudo cargar el MP4 desde GitHub en este navegador. Abre el archivo original con el enlace siguiente.";
          state.classList.add("cad-video-error");
        },true);
        const origin=elem("a","cad-source-link cad-video-link","Abrir MP4 original en GitHub ↗");
        origin.href=clip.sourceUrl;
        origin.target="_blank";origin.rel="noopener noreferrer";
        const metadata=elem("small","cad-video-status","Archivo verificado en commit "+clip.commit.slice(0,10)+" · "+(clip.bytes/1048576).toFixed(1)+" MiB");
        area.append(player,state,origin,metadata);
        media.append(area);
      });
    } else {
      media.append(elem("small","cad-source-label","MANIMCE · MP4 NO LOCALIZADO EN HISTORIAL DISPONIBLE"));
    }
    body.append(details,media);
    card.append(number,body,vis,caption);
    return card;
  }
  window.IJR_2027_RENDER_CAD = function(project) {
    const block=$("cadOperations");
    block.hidden=project.slug!=="3d-design";
    if(project.slug!=="3d-design")return;
    const list=$("cadLessonGrid");list.replaceChildren();
    operations.forEach((op,i)=>list.append(lessonCard(op,i)));
    $("cadCourseCount").textContent=operations.length+" operaciones · "+cad.source.verifiedOperationVideos.length+" videos originales · 4 etapas guiadas";
    const videoIndex=$("cadVideoIndex");
    if(videoIndex){
      videoIndex.replaceChildren();
      for(const clip of cad.source.verifiedOperationVideos){
        const link=elem("a","");
        link.href="#cad-"+clip.operationId;
        const play=elem("span","cad-video-play","▶");
        const label=elem("span","",clip.title);
        link.append(play,label);videoIndex.append(link);
      }
    }
    const resources=$("cadSourceLinks");resources.replaceChildren();
    const src=cad.source;
    for(const [label,url] of [["Repositorio original de videos ManimCE",src.videosRepository],["Repositorio técnico CAD",src.repository],["Fuente real ManimCE de mecanismos · scripts/lessons.py",src.sourceCode],["Procedencia de las lecciones de mecanismos",src.readme]]){
      if(!/^https:\/\//.test(url))continue;
      const a=elem("a","cad-source-link",label+" ↗");a.href=url;a.target="_blank";a.rel="noopener noreferrer";resources.append(a);
    }
    $("cadVideoNote").textContent="Se recuperaron "+src.verifiedOperationVideos.length+" MP4 originales en commits históricos de Manim-Scientific-Visualize: extrusión positiva/negativa, Hole/Agujero, Mirror/Simetría, Emboss/Repujado y dos lecciones de perfiles de rosca. Cada reproductor incluye el enlace al archivo original y su commit. Para Revolución, Barrido y Solevación existen fuentes y registros de render anteriores, pero no se encontró un MP4 accesible en los commits o artefactos consultados. Los diagramas SVG de esta página son ilustraciones nuevas, no fotogramas ManimCE.";
  };
})();