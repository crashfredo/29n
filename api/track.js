import { configured, pipeline, SECTIONS, RETENTION_DAYS } from "./_redis.js";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|facebookexternalhit/i;
const TTL = RETENTION_DAYS * 86400;

function device(ua) {
  const type = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Móvil" : "Ordenador";
  const os = /windows/i.test(ua) ? "Windows" : /iphone|ipad|ios/i.test(ua) ? "iOS" : /android/i.test(ua) ? "Android"
    : /mac os/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "";
  const browser = /edg\//i.test(ua) ? "Edge" : /opr\//i.test(ua) ? "Opera" : /firefox|fxios/i.test(ua) ? "Firefox"
    : /chrome|crios/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "";
  return [type, os, browser].filter(Boolean).join(" · ");
}

function clean(s, n) {
  return String(s || "").replace(/[\u0000-\u001f<>]/g, "").slice(0, n);
}

function refHost(ref, host) {
  try {
    const h = new URL(ref).hostname.replace(/^www\./, "");
    return h === host ? "" : h;
  } catch (e) { return ""; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const ua = req.headers["user-agent"] || "";
  if (!configured || BOT.test(ua)) return res.status(204).end();

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b.id !== "string" || !/^[a-z0-9]{8,24}$/i.test(b.id)) return res.status(400).end();

  const key = "visit:" + b.id;
  const now = Date.now();
  const cmds = [];

  if (b.t === "open") {
    const h = req.headers;
    let city = "";
    try { city = decodeURIComponent(h["x-vercel-ip-city"] || ""); } catch (e) {}
    cmds.push(
      ["HSET", key,
        "ts", now,
        "country", clean(h["x-vercel-ip-country"], 4),
        "city", clean(city, 60),
        "device", device(ua),
        "ref", refHost(b.ref, (h.host || "").replace(/^www\./, "")),
        "label", clean(b.label, 40),
        "lang", clean(b.lang, 12),
        "w", Math.max(0, Math.min(10000, parseInt(b.w, 10) || 0))],
      ["EXPIRE", key, TTL],
      ["ZADD", "visits", now, b.id],
      ["ZREMRANGEBYSCORE", "visits", 0, now - TTL * 1000],
      ["HINCRBY", "days", new Date(now).toISOString().slice(0, 10), 1],
    );
  } else if (b.t === "time" && b.d && typeof b.d === "object") {
    for (const s of SECTIONS) {
      // Cada envío cubre ~15 s; se limita por si alguien manda datos falsos
      const n = Math.round(Math.max(0, Math.min(120, Number(b.d[s]) || 0)));
      if (n > 0) cmds.push(["HINCRBY", key, "s:" + s, n], ["HINCRBY", "sections", s, n]);
    }
    if (cmds.length) cmds.push(["HSET", key, "last", now], ["EXPIRE", key, TTL]);
  }

  try { await pipeline(cmds); } catch (e) { return res.status(204).end(); }
  res.status(204).end();
}
