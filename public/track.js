/* Medición anónima: quién abre la web y cuánto tiempo pasa en cada apartado.
   Sin cookies ni almacenamiento en el dispositivo: el identificador de visita
   vive solo en memoria y cambia en cada carga de la página. */
(function () {
  if (navigator.globalPrivacyControl || navigator.doNotTrack === "1") return;
  if (navigator.webdriver) return;

  const ENDPOINT = "/api/track";
  const IDLE_MS = 60000;   // sin interacción durante 1 min → se deja de contar
  const FLUSH_MS = 15000;  // envío periódico

  const id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()).replace(/-/g, "").slice(0, 24);
  const qs = new URLSearchParams(location.search);
  // Enlaces personalizados: 29n.vercel.app/?para=maria → la visita aparece etiquetada "maria"
  const label = (qs.get("para") || qs.get("utm_source") || "").slice(0, 40);

  let pending = {};
  let lastActive = Date.now();
  let lastTick = Date.now();

  function send(body) {
    const data = JSON.stringify(Object.assign({ id: id }, body));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([data], { type: "application/json" }))) return;
    } catch (e) {}
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: data, keepalive: true }).catch(function () {});
  }

  function flush() {
    if (!Object.keys(pending).length) return;
    const d = pending; pending = {};
    send({ t: "time", d: d });
  }

  function section() {
    let s = window.__seccion ? window.__seccion() : "inicio";
    if (s === "comparativa" && window.__tema) s = "comparativa:" + window.__tema;
    return s;
  }

  send({ t: "open", ref: document.referrer || "", label: label, w: innerWidth, lang: navigator.language || "" });

  setInterval(function () {
    const now = Date.now();
    const dt = now - lastTick; lastTick = now;
    // dt grande = pestaña suspendida; no se cuenta
    if (document.visibilityState !== "visible" || now - lastActive > IDLE_MS || dt > 3000) return;
    const s = section();
    pending[s] = (pending[s] || 0) + dt / 1000;
  }, 1000);
  setInterval(flush, FLUSH_MS);

  ["scroll", "pointerdown", "pointermove", "keydown", "touchstart"].forEach(function (ev) {
    addEventListener(ev, function () { lastActive = Date.now(); }, { passive: true });
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(); else { lastActive = lastTick = Date.now(); }
  });
  addEventListener("pagehide", flush);
})();
