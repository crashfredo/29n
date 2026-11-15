const P = {
  pp:{n:"PP",c:"--pp"}, vox:{n:"Vox",c:"--vox"}, psoe:{n:"PSOE",c:"--psoe"},
  fa:{n:"Frente Amplio",c:"--fa"}, pod:{n:"Podemos",c:"--pod"}, erc:{n:"ERC",c:"--erc"}
};
const T = [
 {id:"vivienda", label:"Vivienda", d:{
   pp:"Un millón de viviendas, nueva Ley del Suelo y licencias en tres meses. IVA del 4 % en la primera vivienda para menores de 40 y “Hucha Hogar Joven” con deducción del 20 % y aval de hasta 40.000 €.",
   vox:"Derogar la Ley de Vivienda. Prioridad para españoles en vivienda protegida y ayudas. IVA del 0 % en primera vivienda nueva y ITP bonificado al 100 %. Desalojo de okupas en menos de 24 horas.",
   psoe:"Vivienda como derecho fundamental en la Constitución. Parque público estatal de 100.000 viviendas, impuesto contra la especulación y préstamos sin intereses de hasta 50.000 € para la primera vivienda.",
   fa:"Expropiar con indemnización unas 100.000 viviendas de fondos. Índice de alquiler ligado a salarios, prórroga automática de contratos, más parque público e impuesto a la acumulación.",
   pod:"", erc:""}},
 {id:"impuestos", label:"Impuestos", d:{
   pp:"Jóvenes de 18 a 35 sin IRPF el primer año y con descuento los tres siguientes. Mínimos familiares ligados a la inflación y deducción familiar única mensual.",
   vox:"Bajar IRPF, IVA y Sociedades. Cuota cero para autónomos por debajo del SMI. Gravar las remesas al extranjero.",
   psoe:"Nuevos impuestos a grandes fortunas y plataformas tecnológicas; hasta el 35 % para rentas del capital de más de 300.000 €. Impuesto a los fondos buitre.",
   fa:"Más impuestos a grandes fortunas, banca y grandes empresas (unos 10.000 millones al año), sin tocar salarios ni pensiones.",
   pod:"Plan fiscal para redistribuir la riqueza, sin detalle publicado.",
   erc:"Financiación singular para Cataluña y condonación de 17.100 millones de deuda."}},
 {id:"inmigracion", label:"Inmigración", d:{
   pp:"Identificación en siete días y devoluciones rápidas. Cupos anuales por sectores. Nueva Ley de Nacionalidad más exigente.",
   vox:"Repatriación de irregulares y “remigración” de quienes vivan de subsidios. Fin del arraigo y de regularizaciones. Fronteras de Ceuta y Melilla militarizadas.",
   psoe:"", fa:"", pod:"",
   erc:"Que la Generalitat asuma la gestión integral de migración y asilo."}},
 {id:"pensiones", label:"Pensiones", d:{
   pp:"Revalorización anual con el IPC y reconstrucción del Pacto de Toledo.",
   vox:"Sin sistema mixto; sostenibilidad vía productividad, empleo y natalidad.",
   psoe:"“Pensiones dignas” como eje de campaña, sin medidas concretas publicadas.",
   fa:"Jubilación a los 65 años, según la prensa económica.",
   pod:"Jubilación a los 63 años y subida de pensiones mínimas y no contributivas.",
   erc:""}},
 {id:"trabajo", label:"Trabajo", d:{
   pp:"Un único subsidio por desempleo, retirado a quien rechace una oferta sin justificación.",
   vox:"Desregulación: tres normas derogadas por cada ley nueva, silencio administrativo positivo y fin de la cita previa obligatoria.",
   psoe:"Jornada de 37,5 horas y avanzar hacia las 35 por negociación colectiva, sin rebaja salarial.",
   fa:"Seguir subiendo el salario mínimo.",
   pod:"Plan laboral redistributivo, sin detalle publicado.",
   erc:"Jornada de 37,5 horas sin rebaja salarial y despido improcedente a 45 días por año."}},
 {id:"instituciones", label:"Instituciones y territorio", d:{
   pp:"Auditoría del gasto en cien días, menos ministerios, elecciones tras dos prórrogas presupuestarias, TC y Fiscalía más independientes, recuperar la sedición y fin de las lenguas cooficiales en el Congreso.",
   vox:"Derogar la Ley de Memoria Democrática y las leyes de género. Educación en español en todo el territorio. Presión internacional sobre Gibraltar.",
   psoe:"", fa:"", pod:"",
   erc:"Referéndum de autodeterminación negociado. Traspaso de Rodalies y aeropuertos."}}
];
const tabs = document.querySelector(".tabs"), cmp = document.getElementById("cmp");
function render(i){
  [...tabs.children].forEach((b,j)=>{b.setAttribute("aria-selected", j===i ? "true":"false"); b.tabIndex = j===i ? 0 : -1;});
  const t = T[i];
  cmp.setAttribute("aria-labelledby","tab-"+t.id);
  window.__tema = t.id;
  cmp.innerHTML = Object.keys(P).map(k=>{
    const txt = t.d[k];
    return `<div class="cmp-row"><div class="who"><span class="swatch" style="background:var(${P[k].c})"></span>${P[k].n}</div><div class="what${txt?"":" empty"}">${txt || "Sin propuesta conocida sobre este tema."}</div></div>`;
  }).join("");
}
T.forEach((t,i)=>{
  const b = document.createElement("button");
  b.role = "tab"; b.id = "tab-"+t.id; b.textContent = t.label;
  b.addEventListener("click", ()=>render(i));
  b.addEventListener("keydown", e=>{
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
      const n = (i + (e.key==="ArrowRight"?1:-1) + T.length) % T.length;
      render(n); tabs.children[n].focus();
    }
  });
  tabs.appendChild(b);
});
render(0);

/* ---------- Navegación, parallax y aparición ---------- */
(function(){
  document.documentElement.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const marks = [...document.querySelectorAll("[data-sec]")];
  const chips = document.getElementById("chips");
  const chipFor = id => chips.querySelector('a[href="#'+id+'"]');
  const progress = document.getElementById("progress");
  const totop = document.querySelector(".totop");

  // Anterior / siguiente dentro de cada partido
  const parties = [...document.querySelectorAll("section.party")];
  const order = [...parties, document.getElementById("comparativa")];
  const name = el => el.id==="comparativa" ? "Comparativa" : el.querySelector("h2").textContent;
  parties.forEach((s,i)=>{
    const p = document.createElement("div"); p.className = "pager";
    const prev = order[i-1], next = order[i+1];
    p.innerHTML = (prev ? '<a href="#'+prev.id+'">← '+name(prev)+'</a>' : '<a href="#indice">← Índice</a>')
                + (next ? '<a href="#'+next.id+'">'+name(next)+' →</a>' : '');
    s.appendChild(p);
  });

  // Manchas de color del fondo, repartidas por toda la página
  const bg = document.querySelector(".bg");
  const cols = ["--pp","--psoe","--vox","--fa","--pod","--erc","--bng","--cc","--eus","--pp","--psoe","--fa"];
  const blobs = cols.map((c,i)=>{
    const b = document.createElement("div"); b.className = "blob";
    const size = 300 + (i*97)%260;
    b.style.cssText = "width:"+size+"px;height:"+size+"px;background:var("+c+");top:"+(i*8.6)+"%;"+(i%2 ? "right:" : "left:")+(-8 + (i*13)%22)+"%";
    b.dataset.speed = (0.18 + (i%4)*0.11).toFixed(2);
    bg.appendChild(b); return b;
  });

  // Aparición suave
  const rev = [...document.querySelectorAll("section.party, .cmp-box, h2.block, .ledger")];
  rev.forEach(el=>el.classList.add("reveal"));
  if("IntersectionObserver" in window && !reduce){
    const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }), {rootMargin:"0px 0px -8% 0px"});
    rev.forEach(el=>io.observe(el));
  } else rev.forEach(el=>el.classList.add("in"));

  const plx = [...document.querySelectorAll("[data-plx]")];
  const wms = [...document.querySelectorAll(".wm")];
  let current = null, ticking = false;

  // Sección en pantalla: la última cuyo inicio queda por encima del 40 % de la ventana
  window.__seccion = function(){
    const line = innerHeight * 0.4; let cur = marks[0];
    for(const m of marks){ if(m.getBoundingClientRect().top <= line) cur = m; else break; }
    if(innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = marks[marks.length-1];
    return cur.dataset.sec;
  };

  function frame(){
    ticking = false;
    const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    progress.style.transform = "scaleX("+(max>0 ? Math.min(1,y/max) : 0)+")";
    totop.classList.toggle("show", y > vh*0.8);
    if(!reduce){
      blobs.forEach(b=>{ b.style.transform = "translate3d(0,"+(y*b.dataset.speed).toFixed(1)+"px,0)"; });
      if(y < vh*1.2) plx.forEach(el=>{ el.style.transform = "translate3d(0,"+(y*el.dataset.plx).toFixed(1)+"px,0)"; });
      wms.forEach(w=>{
        const r = w.parentElement.getBoundingClientRect();
        if(r.bottom > 0 && r.top < vh) w.style.transform = "translate3d(0,"+(-r.top*0.14).toFixed(1)+"px,0)";
      });
    }
    const sec = window.__seccion();
    if(sec !== current){
      current = sec;
      chips.querySelectorAll("[aria-current]").forEach(a=>a.removeAttribute("aria-current"));
      const chip = chipFor(sec);
      if(chip){
        chip.setAttribute("aria-current","true");
        chips.scrollTo({left: chip.offsetLeft - chips.clientWidth/2 + chip.offsetWidth/2, behavior: reduce ? "auto" : "smooth"});
      }
    }
  }
  const req = ()=>{ if(!ticking){ ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, {passive:true});
  addEventListener("resize", req);
  frame();
})();

/* ---------- Selector de modo claro / oscuro ---------- */
(function(){
  const btn = document.getElementById("theme"), root = document.documentElement;
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
  const sync = () => {
    const d = isDark();
    root.classList.toggle("is-dark", d);
    btn.setAttribute("aria-label", d ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    btn.title = btn.getAttribute("aria-label");
  };
  btn.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("tema", next); } catch (e) {}
    sync();
  });
  mq.addEventListener && mq.addEventListener("change", sync);
  sync();
})();
