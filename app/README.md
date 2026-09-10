# HabitOS

Habit tracker JABS (Nothing OS style: rojo / blanco / negro). Implementación real de
`project/Habit Tracker.dc.html`, en HTML/CSS/JS puro — sin frameworks ni build step —
para poder instalarla como app (PWA) y que todos los datos vivan en el dispositivo.

## Qué es esto

- `index.html`, `css/styles.css`, `js/app.js` — la app completa (una sola pantalla, sin recargas).
- `manifest.webmanifest` + `sw.js` — la hacen instalable ("Add to Home screen" / "Install app")
  y capaz de abrir sin conexión una vez instalada.
- `assets/insignia/*.png` — las 10 insignias del quetzal (A–E, versión clara/oscura).
- `icons/` — íconos de la app (192/512, maskable, favicon, apple-touch-icon).

Todos los datos (registros diarios, check-list, deseos, principios editados, notas
"Never forget", ajustes) se guardan con `localStorage` en este mismo dispositivo/navegador.
La canción de meditación se guarda aparte en IndexedDB (un archivo de audio no cabe cómodo
en `localStorage`), también 100% local. **Nada se envía a ningún servidor** — exportar/importar
datos es la única forma de mover información entre dispositivos (Ajustes → Datos).

## Instalar desde Brave

1. Sube esta carpeta (`app/`) a cualquier hosting estático con HTTPS — GitHub Pages, Netlify,
   Vercel, Cloudflare Pages, o tu propio servidor. Un service worker (necesario para que la
   app funcione instalada y offline) requiere HTTPS o `localhost`; no se puede instalar
   abriendo el `index.html` directo con `file://`.
2. Abre la URL publicada en Brave (Android, iOS/iPadOS, o escritorio).
3. Brave mostrará la opción **"Instalar app"** / **"Añadir a pantalla de inicio"** (ícono en
   la barra de direcciones en escritorio, o en el menú ⋮ en Android). Al instalarla queda
   como app independiente, con su propio ícono, sin barra de navegador.
4. A partir de ahí todo lo que captures se guarda directo en el dispositivo, funciona sin
   internet, y persiste entre sesiones.

Para probarlo localmente antes de publicarlo:

```bash
cd app
python3 -m http.server 8000
# abre http://localhost:8000 en Brave — localhost cuenta como "seguro" para el service worker
```

## Notas de implementación

- Un solo archivo de estado en memoria + una función `render()` que reconstruye el DOM de la
  pantalla activa; los inputs de texto (highlight del día, notas, deseos, principios editados)
  actualizan el estado sin re-renderizar mientras escribes, para no perder el foco/cursor.
- Todas las acciones de click van por un único listener delegado (`data-action="..."` +
  atributos `data-*`), sin handlers inline por elemento.
- El límite de "día bloqueado" usa la fecha real del dispositivo (`Date`), igual que el diseño:
  un día futuro no se puede llenar; los pasados sí, para corregir olvidos.
- Las insignias A–E usan las imágenes provistas (`assets/insignia`), recortadas en círculo por
  CSS (`border-radius:50%` + `object-fit:cover`); no hay generación de insignia por SVG.
