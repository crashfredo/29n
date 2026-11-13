import { timingSafeEqual, createHash } from "node:crypto";
import { configured, pipeline, toObject } from "./_redis.js";

const sha = (s) => createHash("sha256").update(String(s)).digest();

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const pass = process.env.STATS_PASSWORD;
  if (!pass) return res.status(503).json({ error: "Falta la variable de entorno STATS_PASSWORD en Vercel." });

  const given = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!given || !timingSafeEqual(sha(given), sha(pass))) return res.status(401).json({ error: "Contraseña incorrecta." });

  if (!configured) return res.status(503).json({ error: "Falta conectar la base de datos Upstash Redis en Vercel (Storage)." });

  try {
    const [ids, total, sections, days] = await pipeline([
      ["ZREVRANGE", "visits", 0, 299],
      ["ZCARD", "visits"],
      ["HGETALL", "sections"],
      ["HGETALL", "days"],
    ]);
    const rows = await pipeline(ids.map((id) => ["HGETALL", "visit:" + id]));
    const visits = rows.map((flat, i) => {
      const o = toObject(flat);
      const secs = {};
      for (const k in o) if (k.startsWith("s:")) secs[k.slice(2)] = Number(o[k]);
      return {
        id: ids[i].slice(0, 6), ts: Number(o.ts), last: Number(o.last) || null,
        country: o.country || "", city: o.city || "", device: o.device || "",
        ref: o.ref || "", label: o.label || "", sections: secs,
      };
    }).filter((v) => v.ts);
    const sec = toObject(sections);
    for (const k in sec) sec[k] = Number(sec[k]);
    const d = toObject(days);
    for (const k in d) d[k] = Number(d[k]);
    res.status(200).json({ total: Number(total), sections: sec, days: d, visits });
  } catch (e) {
    res.status(502).json({ error: "No se pudo leer la base de datos." });
  }
}
