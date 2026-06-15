# Formulario de solicitudes — GTID HUNSC

Canal digital para que los profesionales del HUNSC **soliciten exponer un proyecto** ante el
Grupo de Trabajo de Innovación Digital o **planteen una consulta**. Implementa el formulario
previsto en los apartados **5.4** y **8.2.f** del reglamento de funcionamiento del grupo.

## Contenido

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Formulario web autónomo. Un solo archivo, sin dependencias ni CDNs. |
| `apps-script/Codigo.gs` | Backend gratuito (Google Apps Script): registra en Hoja de cálculo y envía correo. |
| `PROPUESTA-formulario-GTID.docx` | Documento de diseño para el grupo (justificación de campos, opciones, RGPD). |

## Cómo funciona

```
  Profesional  ──►  index.html  ──(fetch POST)──►  Apps Script  ──►  Hoja de cálculo (trazabilidad)
                                                         └────────►  Correo al coordinador / secretaría
```

`index.html` se puede alojar en cualquier sitio gratuito (intranet del HUNSC, GitHub Pages…).
El envío se hace contra un Google Apps Script que tú despliegas en una cuenta de Google.

---

## Paso 1 — Crear la Hoja de cálculo

1. Entra en [Google Sheets](https://sheets.google.com) con la cuenta que recibirá las solicitudes.
2. Crea una hoja nueva y ponle un nombre, p. ej. **"Solicitudes GTID"**.
   No hace falta crear columnas: el script genera la cabecera automáticamente la primera vez.

## Paso 2 — Pegar y configurar el backend

1. En esa misma hoja: menú **Extensiones → Apps Script**.
2. Borra el contenido del editor y pega el contenido de [`apps-script/Codigo.gs`](apps-script/Codigo.gs).
3. En el bloque `CONFIG` (arriba del archivo), cambia:
   - `DESTINATARIO`: el correo que recibirá el aviso de cada solicitud (puedes poner varios
     separados por comas).
   - `ORIGEN_PERMITIDO`: déjalo en `'*'` para pruebas; en producción pon el dominio donde alojes
     `index.html`.
4. Guarda (icono del disquete).

## Paso 3 — Implementar como aplicación web

1. En el editor de Apps Script: botón **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Configura:
   - *Descripción*: "Formulario GTID".
   - *Ejecutar como*: **Yo** (tu cuenta).
   - *Quién tiene acceso*: **Cualquier usuario**.
4. Pulsa **Implementar** y **autoriza** los permisos cuando te los pida (la primera vez Google
   advierte de que la app no está verificada → "Configuración avanzada" → "Ir a (nombre)").
5. Copia la **URL de la aplicación web** (termina en `/exec`).

> Cada vez que edites el `.gs` debes crear una **Nueva implementación** (o gestionar la existente)
> para que los cambios surtan efecto en la URL.

## Paso 4 — Conectar el formulario

1. Abre `index.html` y busca, cerca del final, el bloque `CONFIG`:
   ```js
   const CONFIG = {
     ENDPOINT_URL: "PEGA_AQUI_LA_URL_DEL_APPS_SCRIPT"
   };
   ```
2. Sustituye el texto por la URL `/exec` copiada en el paso anterior.
3. Guarda.

> **Modo prueba:** mientras `ENDPOINT_URL` no esté configurado, el formulario *no envía nada*:
> simula el éxito para que puedas probar la interfaz. Verás un aviso en la consola del navegador.

## Paso 5 — Añadir el logotipo oficial

El formulario busca un archivo **`logo.png`** junto a `index.html`. Si no lo encuentra, muestra un
logotipo de reserva dibujado en SVG.

1. Guarda el logotipo oficial del HUNSC como **`logo.png`** en la carpeta del proyecto
   (junto a `index.html`). Idealmente cuadrado y con fondo transparente.
2. Al recargar la página, aparecerá el logo real automáticamente.

## Paso 6 — Publicar en Vercel (gratis)

Vercel sirve este sitio estático sin configuración de build. Dos formas:

**A) Desde la web (la más sencilla)**
1. Sube la carpeta del proyecto a un repositorio de GitHub (incluyendo `logo.png`).
2. En [vercel.com](https://vercel.com) → *Add New… → Project* → importa el repositorio.
3. Framework Preset: **Other**. Deja todo por defecto y pulsa **Deploy**.
4. Vercel te da una URL pública (p. ej. `https://formulario-gtid.vercel.app`).

**B) Desde la terminal (Vercel CLI)**
```bash
npm i -g vercel      # una sola vez
cd <carpeta del proyecto>
vercel               # primera vez: inicia sesión y crea el proyecto (preview)
vercel --prod        # publica en producción
```

> El archivo `vercel.json` ya incluye cabeceras básicas (noindex, nosniff). Asegúrate de **incluir
> `logo.png`** en lo que subes, o se verá el logo de reserva.

### Otras opciones de alojamiento gratuito
- **Intranet del HUNSC** (recomendado institucionalmente): entrega los archivos al Servicio de
  TIC / Unidad de Salud Digital.
- **GitHub Pages** o cualquier hosting estático (Netlify, Cloudflare Pages…).

---

## Probar de extremo a extremo

1. Abre la URL publicada (o `index.html` en local).
2. Rellena una solicitud de cada tipo (proyecto y consulta) y envía.
3. Comprueba que:
   - llega el correo al `DESTINATARIO`, y
   - aparece una fila nueva en la pestaña **Solicitudes** de la Hoja.

## Personalización rápida

- **Logotipo y colores**: en `index.html`, sustituye el recuadro `.logo` por
  `<img src="logo.png">` institucional y ajusta las variables CSS `--azul-scs` / `--azul-osc`.
- **Textos**: edita el bloque `.intro` y el pie de página.
- **Campos**: añade/quita campos en el HTML y refleja el cambio en el array `COLUMNAS` de
  `Codigo.gs` para que se registren en la Hoja.

---

## ⚠ Protección de datos — leer antes de publicar

Este formulario recoge **datos personales de profesionales** (nombre, correo, servicio, etc.).
Antes de ponerlo en producción:

1. **Buzón corporativo, no personal.** Un Gmail personal como buzón institucional —y el
   almacenamiento de los datos en una cuenta Google particular— tiene implicaciones de RGPD y
   del Esquema Nacional de Seguridad (ENS). El destino recomendado es un **buzón corporativo del
   SCS** y, si es viable, alojamiento institucional. La solución Google se ofrece como punto de
   partida gratuito para la *versión inicial* prevista en el ap. 8.2.f.
2. **Validar la cláusula RGPD.** El aviso de privacidad del formulario es un **borrador**: los
   datos del responsable, el Delegado de Protección de Datos y los plazos de conservación deben
   confirmarse con el **DPD del Servicio Canario de la Salud** antes de publicar.
3. **Identidad institucional.** Sustituye el logotipo de marcador de posición por el oficial,
   conforme a las directrices de identidad del HUNSC.
4. **Sin datos reales en el repositorio.** No subas la URL del Apps Script ni datos de
   solicitudes a repositorios públicos.

> Alternativa institucional: si el HUNSC/SCS dispone de **Microsoft 365**, **Microsoft Forms**
> mantiene los datos dentro del entorno corporativo y permite adjuntar archivos. Es preferible
> como destino final; este formulario HTML es la opción ligera y sin coste para arrancar.
