/* Google Analytics 4 con consentimiento previo.
   Mide quién abre la web (país, ciudad, dispositivo, procedencia) y cuánto
   tiempo de lectura activa pasa en cada apartado (evento "tiempo_seccion"). */
(function () {
  // ▼▼ Pega aquí tu ID de medición de Google Analytics (formato G-XXXXXXXXXX) ▼▼
  const GA_ID = "";
  // ▲▲ Sin ID no se carga nada ni se muestra el aviso de cookies ▲▲

  const KEY = "consentimiento-analitica";
  const IDLE_MS = 60000;   // sin interacción durante 1 min → se deja de contar
  const FLUSH_MS = 15000;  // envío periódico
  const prefs = document.getElementById("cookie-prefs");
  if (!/^G-[A-Z0-9]+$/.test(GA_ID)) { const p = document.getElementById("privacidad"); if (p) p.hidden = true; return; }

  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  let started = false;
  function start() {
    if (started) return; started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());

    // Enlaces personalizados: /?para=amigos-uni → la visita queda etiquetada.
    // Usa alias o grupos, no nombres completos ni correos (Google lo prohíbe).
    const label = (new URLSearchParams(location.search).get("para") || "").slice(0, 40);
    if (label) gtag("set", "user_properties", { etiqueta: label });
    gtag("config", GA_ID, { anonymize_ip: true });

    const s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);

    let pending = {}, lastActive = Date.now(), lastTick = Date.now();
    function section() {
      let x = window.__seccion ? window.__seccion() : "inicio";
      if (x === "comparativa" && window.__tema) x = "comparativa:" + window.__tema;
      return x;
    }
    function flush() {
      const d = pending; pending = {};
      for (const k in d) {
        const secs = Math.round(d[k]);
        if (secs > 0) gtag("event", "tiempo_seccion", { seccion: k, segundos: secs, value: secs, etiqueta: label || undefined });
      }
    }
    setInterval(function () {
      const now = Date.now(), dt = now - lastTick; lastTick = now;
      // dt grande = pestaña suspendida; no se cuenta
      if (document.visibilityState !== "visible" || now - lastActive > IDLE_MS || dt > 3000) return;
      const k = section();
      pending[k] = (pending[k] || 0) + dt / 1000;
    }, 1000);
    setInterval(flush, FLUSH_MS);
    ["scroll", "pointerdown", "pointermove", "keydown", "touchstart"].forEach(function (ev) {
      addEventListener(ev, function () { lastActive = Date.now(); }, { passive: true });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flush(); else lastActive = lastTick = Date.now();
    });
    addEventListener("pagehide", flush);
  }

  // Aviso de cookies
  let banner = null;
  function ask() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "cookies glass"; banner.setAttribute("role", "dialog"); banner.setAttribute("aria-label", "Cookies de analítica");
    banner.innerHTML = '<p>Usamos cookies de Google Analytics para saber cuántas personas visitan la web y qué apartados se leen más. Solo se activan si aceptas.</p>'
      + '<div class="cookies-btns"><button type="button" data-v="no">Rechazar</button><button type="button" data-v="si" class="primary">Aceptar</button></div>';
    banner.addEventListener("click", function (e) {
      const v = e.target.getAttribute && e.target.getAttribute("data-v");
      if (!v) return;
      const before = read(); write(v); banner.remove(); banner = null;
      if (v === "si") start();
      else if (before === "si") location.reload(); // deja de medir al retirar el consentimiento
    });
    document.body.appendChild(banner);
  }
  if (prefs) prefs.addEventListener("click", function (e) { e.preventDefault(); ask(); });

  const c = read();
  if (c === "si") start(); else if (c !== "no") ask();
})();
