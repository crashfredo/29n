# Programas del 29N, partido a partido

Web estática para Vercel con los programas electorales del 29N: navegación fija, efectos parallax, tarjetas translúcidas y medición con Google Analytics.

## Estructura

- `public/index.html`, `styles.css`, `app.js` — la web.
- `public/track.js` — Google Analytics 4, aviso de cookies y tiempo por apartado.

No hay build ni dependencias: Vercel sirve la carpeta `public/` tal cual.

## Activar Google Analytics

1. En [analytics.google.com](https://analytics.google.com) crea una propiedad GA4 con un flujo de datos web para el dominio de la web y copia el **ID de medición** (`G-XXXXXXXXXX`).
2. Pégalo en la constante `GA_ID` al principio de `public/track.js` y despliega.
3. Para ver el tiempo por apartado en los informes: **Administrar → Definiciones personalizadas** y crea
   - dimensión de evento `seccion` (parámetro `seccion`),
   - métrica de evento `segundos` (parámetro `segundos`, unidad: segundos),
   - dimensión de usuario `etiqueta` (propiedad `etiqueta`), si usas enlaces personalizados.

Mientras `GA_ID` esté vacío no se carga nada ni se muestra el aviso de cookies.

## Qué se mide

- Lo habitual de GA4: usuarios, país y ciudad, dispositivo y procedencia.
- Evento `tiempo_seccion`: segundos de lectura activa por apartado (cada partido, la comparativa y cada tema). No cuenta con la pestaña oculta ni tras un minuto sin interacción.
- **Enlaces personalizados:** `https://TU-DOMINIO/?para=amigos-uni` etiqueta esa visita como "amigos-uni". Usa alias o grupos, no nombres completos ni correos: Google prohíbe enviar datos personales.

Analytics solo se carga si el visitante acepta las cookies; quien las rechaza no se mide.
