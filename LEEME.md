# hadete.com — sitio

Sitio estático multipágina. El inglés vive en la raíz y el español en `/es/`; el
único build es `build-es.py` (regenera `/es/` y el sitemap desde el inglés; requiere
`beautifulsoup4`). Se sirve desde Hostinger detrás de Cloudflare.

```
index.html       home — portafolio de 9 productos (pestañas por línea), formatos,
                 cosecha, origen, alcance, contacto
marca.html       La marca Hadeté — línea fraccionada (9)
about.html       Nosotros — granel / marca propia / marca Hadeté
privacidad.html  política de privacidad
login.html       formulario de acceso (huérfano; "Ingresar" apunta a pronto.html)
pronto.html      área privada en construcción
404.html
style.css        paleta y tipografía del manual de marca
i18n.js          idiomas (ver abajo)
site.js          header, menú, idioma, calendario, mapas, pestañas, animaciones
analytics.js     GA4, Google Ads, Meta Pixel, LinkedIn — GA4 cargado, el resto vacío
assets/          fotos responsive (r/), originales (_source/, gitignored), logos SVG
es/              versiones en español (generadas por build-es.py)
robots.txt · sitemap.xml
favicon* · og-image.jpg · site.webmanifest   → van en la raíz del dominio
```

**Versionado de assets:** los `<link>/<script>` de `style.css`, `site.js`, `i18n.js`
y `analytics.js` llevan `?v=AAAAMMDD`. Los estáticos se cachean 7 días, así que al
desplegar un cambio de CSS/JS hay que **subir el número `?v=`** (buscar y reemplazar
en las páginas de la raíz + correr `build-es.py`) y **purgar la caché de Cloudflare**.
Si no, el navegador sigue sirviendo el CSS/JS viejo. Las fotos no necesitan esto:
cuando cambia una, cambia también su nombre o su carpeta.

## Tres cosas antes de publicar

1. **Los IDs de medición.** Abrir `analytics.js` y completar el bloque `CONFIG` de
   arriba de todo: GA4, Google Ads más su etiqueta de conversión, Meta Pixel,
   LinkedIn. Lo que quede vacío no carga nada, así que el sitio sigue liviano hasta
   que existan las cuentas. El formulario dispara una conversión al enviarse:
   `generate_lead` en Google y `Lead` en Meta. Esa es la que hay que optimizar en las
   campañas.
2. **Los favicons y el sitemap en la raíz.** `favicon.ico`, `favicon-32.png`,
   `favicon-180.png`, `site.webmanifest`, `robots.txt` y `sitemap.xml` tienen que
   quedar en `hadete.com/`, no dentro de una carpeta. Después, cargar el sitemap en
   Google Search Console.
3. **Número de WhatsApp**: el botón flotante ya apunta al número real
   (`5493515637679`, en `site.js`). Si cambia, editarlo ahí.
4. **SPF, DKIM y DMARC** en el dominio antes de mandar correo en frío. Sin eso, los
   mails a Alemania o Estados Unidos caen en spam y no te enterás.

El formulario envía a `sales@hadete.com` vía FormSubmit, sin cuenta ni ID. La primera
vez que alguien lo use llega un correo de confirmación a esa casilla: se abre, se
activa una sola vez y queda funcionando.

Las redes del footer apuntan a `linkedin.com/company/hadete`, `instagram.com/hadete` y
`facebook.com/hadete`. Cuando existan las cuentas reales, se cambian esos tres `href`
en `index.html` y en `about.html`, y de paso el bloque `sameAs` del JSON-LD del head.

## Idiomas y URLs

El inglés vive en la raíz y el español en `/es/`, como archivos reales. El inglés es la
fuente: se edita el HTML de la raíz y después se corre

    python3 build-es.py

que regenera las cinco páginas de `/es/` con los textos de `i18n.js`, ajusta canónicas,
hreflang, títulos, descripciones y rutas de assets, y reescribe el `sitemap.xml` con los
pares de idioma. **Si editás el HTML y no corrés el script, el español queda viejo.**

El selector EN/ES del header es un enlace entre las dos URLs, no un cambio de texto en
vivo. Un navegador en español que llega por primera vez a la versión inglesa se redirige
una sola vez a `/es/`.

## Medición y pauta

`analytics.js` arriba de todo tiene cinco huecos: GA4, Google Ads, la etiqueta de
conversión, el píxel de Meta y LinkedIn. Lo que está vacío no carga.

- **Consent Mode v2**: todo arranca denegado. Aparece un cartel y nada de medición se
  carga hasta que el visitante acepta. Si no completás ningún ID, el cartel ni aparece.
- **gclid**: se guarda por 90 días junto con wbraid, gbraid, msclkid, fbclid y los UTM, y
  se inyecta en el formulario como campos ocultos. Cuando una consulta se convierte en
  contenedor meses después, subís ese gclid como conversión offline y Google Ads aprende
  qué palabra clave lo pagó.
- **Eventos**: `generate_lead` en el formulario, `contact_whatsapp` en el botón flotante
  y `contact_email` en cualquier mailto. Esos tres son los que hay que optimizar.
- **Enhanced conversions**: el correo del formulario se pasa a Google para que pueda
  emparejar el lead. Requiere activarlo también del lado de la cuenta de Ads.

### De dónde sale cada ID y qué pasa si falta

Los cinco viven en el bloque `CONFIG` arriba de `analytics.js`. Hoy solo `GA4` está
cargado; los otros cuatro están vacíos a propósito, listos para pegar el valor. Lo que
quede vacío no carga su script, así que el sitio sigue liviano.

| Campo | Formato | De dónde se saca | Qué pasa si queda vacío |
|---|---|---|---|
| `GA4` | `G-XXXXXXXXXX` | GA4 → Administrar → Flujos de datos → tu flujo web → *ID de medición* | **Ya cargado** (`G-F5VBB23BHT`). Sin él no hay analítica de tráfico y, como es el único ID activo, tampoco aparece el cartel de consentimiento. |
| `ADS` | `AW-XXXXXXXXX` | Google Ads → arriba a la derecha, el ID de cuenta con prefijo `AW-` (o Herramientas → Conversiones) | No carga la etiqueta de Ads: sin remarketing ni conversiones de Ads. GA4 sigue midiendo. |
| `ADS_LABEL` | `AW-XXXXXXXXX/AbCdEfGh` | Google Ads → Conversiones → acción "Lead / envío de formulario" → *Configurar etiqueta* → **Etiqueta de conversión** (se pega junto al `AW-` con la barra) | **El más caro de dejar vacío.** Aunque `ADS` esté cargado, no se registra NINGUNA conversión de Ads, y sin conversiones el Smart Bidding no puede optimizar: se queda sin la señal que le dice qué clic vale. |
| `META` | 15–16 dígitos | Meta Events Manager → Orígenes de datos → tu píxel → Configuración → *ID del conjunto/píxel* | No carga el píxel: sin eventos `Lead`/`Contact` en Meta ni públicos de remarketing. |
| `LINKEDIN` | ~7 dígitos | LinkedIn Campaign Manager → Analizar → Insight Tag → *Partner ID* | No carga el Insight Tag: sin conversiones ni audiencias en LinkedIn. |

Los eventos de contacto se disparan al `dataLayer` apenas ocurren, pero **solo se
transmiten después de que el visitante acepta** (Consent Mode v2). Verificado en el
navegador: enviar el formulario dispara `generate_lead` con el producto elegido, y un
clic en cualquier `mailto:` dispara `contact_email`. Son las dos conversiones reales del
sitio; `contact_whatsapp` es la tercera, en el botón flotante.

## Imágenes

`assets/` guarda los originales y `assets/r/` las versiones servidas: AVIF, WebP y JPEG
en tres anchos cada una. Las páginas usan `<picture>` y el navegador elige. Un celular
descarga 173 KB donde antes descargaba 1.033 KB. Para regenerarlas después de cambiar
una foto, mirá el bloque de `SIZES` del historial o repetí el mismo criterio: 3 anchos,
AVIF calidad 52, WebP 72, JPEG 74.

## Idiomas

Arranca en inglés, que es el idioma del comprador. El botón EN / ES cambia todo sin
recargar y recuerda la elección. Si el navegador está en español, abre en español.
También se puede forzar con `?lang=es`.

**El inglés vive en el HTML.** No hay diccionario en inglés: lo que está escrito en
`index.html` es la versión inglesa. Los otros idiomas van en `i18n.js`.

Para agregar portugués, por ejemplo:

1. En `i18n.js`, sumar `{ code: 'pt', label: 'PT', name: 'Português' }` a `LANGS`.
2. Copiar el bloque `es` completo dentro de `DICT`, renombrarlo `pt` y traducir.
3. En `site.js`, agregar `pt` a `CAL.months`, `CAL.short` y al nombre de cada fila de
   `CAL.rows` (son los meses y los nombres de producto del calendario).
4. Sumar el `hreflang` en el `<head>` de las dos páginas y en `sitemap.xml`.

El selector del header se dibuja solo a partir de `LANGS`. Si a un idioma le falta una
clave, esa línea sale en inglés en lugar de romperse.

## Mapamundi

Tres líneas punteadas que se dibujan según cuánto scrolleaste, con el mapa clavado
mientras dura. Los arcos están en `index.html` como curvas cuadráticas
(`M origen Q control destino`) en el sistema del `viewBox` de 1000 × 470
(equirrectangular, −180 a 180 de longitud y −57 a 78 de latitud).

Los puntitos huecos son mercados de estos tres cultivos, **no** clientes ni destinos
propios, y el epígrafe lo dice. Cuando haya embarques cerrados conviene separarlos:
un símbolo para "acá embarcamos" y otro para "acá se compra este producto".

## Calendario de cosecha

Los rangos están en `site.js`, en `CAL.rows`:

```js
{ en: 'Extra virgin olive oil', es: 'Aceite de oliva extra virgen', pick: [4, 6], ship: [6, 11] }
```

`pick` es cosecha y secado, `ship` es la ventana en que carga la cosecha nueva. Los
números son meses, de 1 a 12. Ajustalos cuando tengas los datos del proveedor real.

## Lo que queda por decidir

- **MOQ, incoterm, plazo y forma de pago.** El sitio dice "lotes de veinte a cien
  toneladas" y nada más. Son los cinco campos que un jefe de compras lee primero.
  En Nosotros queda además pendiente el mínimo por SKU para marca propia.
- **Fotos que faltan:** olivar, contenedor cargado y los tres socios. La página de
  Nosotros pide una foto de las personas más que ninguna otra cosa.
- **Certificación propia.** Cuando salga, se reescribe la sección "Qué podemos
  documentar hoy" y se suman los sellos.
