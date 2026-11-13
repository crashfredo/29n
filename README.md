# Programas del 29N, partido a partido

Web estática para Vercel con los programas electorales del 29N, navegación fija, efectos parallax, tarjetas translúcidas y un panel privado de estadísticas.

## Estructura

- `public/` — la web (`index.html`, `styles.css`, `app.js`), el medidor (`track.js`) y el panel (`stats.html`, en `/stats`).
- `api/track.js` — recibe las visitas y el tiempo por apartado.
- `api/stats.js` — devuelve los datos al panel, protegido con contraseña.

## Desplegar en Vercel

1. En [vercel.com/new](https://vercel.com/new), importa este repositorio. No hace falta configurar nada (preset "Other", sin comando de build).
2. En el proyecto → **Storage** → **Create Database** → **Upstash for Redis** (plan gratuito) y conéctala al proyecto. Vercel añade solo las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
3. En **Settings → Environment Variables**, crea `STATS_PASSWORD` con la contraseña que quieras para el panel.
4. Vuelve a desplegar (**Deployments → Redeploy**) para que las variables surtan efecto.

El panel está en `https://TU-DOMINIO/stats`.

## Qué se mide

- Cada visita: fecha, país y ciudad aproximados, tipo de dispositivo y web de procedencia.
- Segundos de lectura activa en cada apartado (cada partido, la comparativa y cada tema de la comparativa). Deja de contar si la pestaña está oculta o tras un minuto sin interacción.
- **Enlaces personalizados:** si compartes `https://TU-DOMINIO/?para=maria`, esa visita aparece etiquetada como "maria" en el panel. Es la forma de saber *quién* abre la web.

No se usan cookies ni se guarda la IP; el identificador de visita vive solo en memoria, así que una persona que vuelve cuenta como visita nueva. Se respetan las señales "Do Not Track" y "Global Privacy Control". Los datos se borran a los 90 días.
