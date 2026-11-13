// Cliente mínimo de Upstash Redis (API REST), sin dependencias.
// Vercel inyecta estas variables al conectar una base de datos Upstash
// desde Storage → Marketplace (cualquiera de los dos pares de nombres).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const configured = Boolean(URL_ && TOKEN);

export async function pipeline(commands) {
  if (!commands.length) return [];
  const r = await fetch(URL_.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error("Redis " + r.status);
  const out = await r.json();
  return out.map((x) => x.result);
}

// HGETALL devuelve [campo, valor, campo, valor…]
export function toObject(flat) {
  const o = {};
  for (let i = 0; i + 1 < (flat || []).length; i += 2) o[flat[i]] = flat[i + 1];
  return o;
}

// Secciones admitidas (lo demás se descarta)
export const SECTIONS = [
  "inicio", "indice", "pp", "vox", "psoe", "fa", "podemos", "erc", "bng", "cc", "otros",
  "comparativa", "comparativa:vivienda", "comparativa:impuestos", "comparativa:inmigracion",
  "comparativa:pensiones", "comparativa:trabajo", "comparativa:instituciones", "fuentes",
];

export const RETENTION_DAYS = 90;
