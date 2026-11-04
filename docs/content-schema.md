# Esquemas de contenido — Portafolio XP

Estado: **[DE]** · Fecha: 2026-11-03 · Decisiones asociadas: D17, D20 a D24, D38 y D44.
Fuente: `docs/spec.md` §5 y §7. Los campos que la spec enumera literalmente (Proyectos §5.2, Habilidades §5.3) se respetan; el resto lo fija D17, y las preguntas que quedaban abiertas se resolvieron en D20 a D24 (§9).
Implementación: esquemas Zod en `src/content/schema.ts` (Fase 2), validados en una prueba de Vitest y en `build`.

## 0. Convenciones

Notación tipo TypeScript; `?` = opcional. El orden de cada lista es el orden en pantalla, salvo donde se indica.

| Tipo | Forma | Regla |
|------|-------|-------|
| `Text` | `{ "es": string, "en": string }` | Ambos obligatorios y no vacíos: así se detecta un texto que falta en un idioma (spec §7) |
| `Name` | `string` o `Text` | `string` para un nombre propio que no se traduce; `Text` para un nombre que cambia con el idioma (habilidades blandas, certificaciones). La prueba de paridad revisa los `Text` (D20) |
| `IsoDate` | `"YYYY-MM"` o `"YYYY-MM-DD"` | Fecha real de calendario (`isIsoDate` en `src/lib/dates.ts`) |
| `Slug` | `"mi-proyecto"` | `^[a-z0-9]+(-[a-z0-9]+)*$`, único en su lista; se usa en los enlaces `#/…` |
| `Url` | `"https://…"` | URL absoluta `https:` |
| `Email` | `"…@…"` | Correo válido |
| `AssetPath` | `"cv/cv-es.pdf"` | Ruta dentro de `public/`, sin `/` inicial, para que funcione con cualquier `base` (D15) |
| `Marker` | `"<correo>"` | Marcador `<…>` de la spec §3 (principio 5). Con el modo estricto apagado, `Url`, `Email` y `AssetPath` también aceptan un marcador; con el modo estricto encendido, no (§8, D21) |
| `AppId` | `"about"` … | `about` · `projects` · `skills` · `experience` · `contact` · `messenger` · `recycle-bin` · `control-panel` |

- El texto de relleno va marcado: `"[RELLENO] …"`; el modo estricto lo rechaza (§8, D21).
- **No van aquí** los textos de interfaz (títulos de ventana, botones, subtítulos del menú Inicio, "En línea", "Disponible", "Presente"): viven en `src/i18n/es.json` y `en.json`.
- Datos personales (nombre, correo, redes, rutas de CV) solo en estos JSON (R1).

## 1. `profile.json` — Sobre mí (spec §5.1) y CV (§5.8)

```ts
{
  name: string                       // "<nombre>"
  alias: string                      // "<alias>"; también es el "Para" fijo de Contacto
  photo?: { src: AssetPath | Marker; alt: Text }   // "<foto>"; sin foto se muestra un avatar propio
  role: Text                         // línea bajo el nombre (referencia: "Nivel 28 · Tecnópata (…)")
  location: Text
  pageTitle: Text                    // título de la página (referencia: "Conoce un poco sobre mí")
  breadcrumb: Text                   // última miga: "Sobre mí › Ficha"
  sections: Array<{                  // N secciones libres, al menos 1
    id: Slug
    title: Text
    body: Text
  }>
  cv: { es: AssetPath; en: AssetPath }   // "cv/cv-es.pdf", "cv/cv-en.pdf" (D31)
  site: {                            // <title>, descripción y Open Graph de index.html (D24)
    title: Text
    description: Text
  }
}
```

- `site` lo lee el build, no la interfaz: el gancho de Vite para el HTML lo escribe en `index.html` en español por defecto, con `og:locale` `es_CL` y `og:locale:alternate` `en_US` (D24). Los rastreadores no ejecutan JavaScript, por eso no basta con escribirlo en tiempo de ejecución.
- El mismo gancho escribe el `<noscript>` de `index.html` en ambos idiomas (D44) con `site`, `name`, `role`, `location` y `cv`, más los proyectos (`name`, `summary`) y `contact.json`.

## 2. `projects.json` — Proyectos (spec §5.2)

```ts
{
  projects: Array<{
    slug: Slug                       // #/proyectos/<slug>
    name: Name
    year: number                     // entero de 4 dígitos
    role: Text
    summary: Text
    description: Text
    tech: string[]                   // chips; al menos 1
    links: { github?: Url; demo?: Url; caseStudy?: Url }   // cada botón aparece solo si existe
    images: Array<{ src: AssetPath; alt: Text }>          // 0..n; con 0 se ve el marcador de galería
    visibility: "public" | "restricted"
  }>
}
```

- `restricted` ⇒ `images` debe estar vacío: proyectos de empleador o cliente sin capturas internas ni datos [RS confidencialidad]. Problema, rol, stack y aprendizajes van en `summary` y `description`.

## 3. `skills.json` — Habilidades (spec §5.3)

```ts
{
  categories: Array<{
    id: Slug                         // #/habilidades/<id>
    name: Text
    description: Text
    items: Array<{
      name: Name                     // "TypeScript"; las blandas y certificaciones se traducen
      icon: string                   // clave de ícono; sin resolver → ícono genérico propio
      level?: Text                   // nivel como texto, nunca barras
    }>
  }>
}
```

- La librería de íconos de marca se decide en Fase 3 (spec §5.3 [SU]); mientras, `icon` es solo una clave.

## 4. `experience.json` — Experiencia (spec §5.4)

```ts
{
  work: Array<{
    id: Slug
    role: Text                       // Cargo
    company: Name                    // Empresa
    start: IsoDate
    end: IsoDate | null              // null = "Presente"
    location: Text                   // "Remoto" / "Remote" cambia por idioma
  }>
  education: Array<{
    id: Slug
    degree: Text                     // Formación
    institution: Name
    start: IsoDate
    end: IsoDate | null
    location: Text
  }>
}
```

- `end` ≥ `start` cuando hay `end`.
- La ventana ordena por `start` descendente; el orden del JSON no importa.
- Período y duración salen de `formatPeriod` en `src/lib/dates.ts` (meses contados inclusive, D16).

## 5. `contact.json` — Contacto (spec §5.5)

```ts
{
  email: Email | Marker              // destino del mailto: "<correo>"
  links: Array<{                     // pie de la ventana, en este orden
    id: Slug                         // "github", "linkedin"
    label: Name                      // "GitHub", "LinkedIn"
    url: Url | Marker                // "https://github.com/<usuario-github>", "<linkedin>"
    icon: string                     // clave de ícono propio
  }>
}
```

- El campo "Para" muestra `profile.alias`; no se repite aquí.

## 6. `messenger.json` — Messenger (spec §5.6)

```ts
{
  header: {
    personalMessage: Text            // mensaje personal bajo el estado
  }
  greeting: Text                     // primer mensaje al abrir la ventana
  start: Slug[]                      // preguntas iniciales (4 en la referencia)
  questions: Array<{
    id: Slug
    label: Text                      // texto del botón y del mensaje del visitante
    answer: Text
    actions?: Action[]               // botones bajo la respuesta
    followUps?: Slug[]               // preguntas que se ofrecen después de esta respuesta
  }>
}

type Action =
  | { type: "openWindow"; app: AppId; target?: Slug; label: Text }   // target: slug de proyecto o id de categoría
  | { type: "externalLink"; url: Url | Marker; label: Text }
  | { type: "setLanguage"; lang: "es" | "en"; label: Text }
```

- Una respuesta sin `followUps` vuelve a ofrecer las preguntas de `start`, así la conversación nunca queda sin salida (D22).
- Todo id de `start` y `followUps` existe en `questions`; los ids no se repiten.
- `target` solo con `app: "projects"` o `"skills"`, y debe existir en `projects.json` o `skills.json` (validación entre archivos).
- El avatar es el personaje del asistente (contrato `Character`), no una imagen; su nombre, "Disponible" y las horas los pone la interfaz. El nombre vive solo en la clave `assistant.name` de i18n, la misma del globo del escritorio (D38).

Ejemplo mínimo:

```json
{
  "header": { "personalMessage": { "es": "[RELLENO] …", "en": "[RELLENO] …" } },
  "greeting": { "es": "[RELLENO] ¡Hola!", "en": "[RELLENO] Hi!" },
  "start": ["who"],
  "questions": [
    {
      "id": "who",
      "label": { "es": "¿Quién eres?", "en": "Who are you?" },
      "answer": { "es": "[RELLENO] …", "en": "[RELLENO] …" },
      "actions": [{ "type": "openWindow", "app": "about", "label": { "es": "Ver Sobre mí", "en": "Open About me" } }]
    }
  ]
}
```

## 7. `assistant.json` — Asistente de escritorio (spec §5.7)

```ts
{
  firstVisit: Text
  windowOpened: Record<AppId, Text>  // uno por ventana, las 8; se muestra una vez por sesión
  idle: Text                         // tras 60 s sin actividad (el tiempo vive en el código)
  allWindowsClosed: Text
  languageChanged: Text              // se muestra en el idioma nuevo
  mobileDragAttempt: Text
  help: Text                         // menú Inicio › Ayuda: instrucciones de uso del escritorio (spec §4.4, D23)
}
```

## 8. Validación (Fase 2)

- Un esquema Zod por archivo y los tipos de TypeScript derivados de ellos (`z.infer`), así el código y el JSON no se separan.
- Comprobaciones entre archivos: `target` de Messenger, unicidad de slugs e ids.
- Se ejecuta en `npm run test` y en `npm run build`; un JSON inválido corta el build con el archivo y la ruta del campo (D26).
- Un campo que no está en el esquema es un error, para que un nombre mal escrito no se ignore en silencio (D26).
- Paridad (D20): todo `Text`, incluido el de un `Name` bilingüe, tiene `es` y `en` no vacíos.
- Modo estricto (D21): con `CONTENT_STRICT=true`, el build falla si queda un marcador (`<…>` o `[RELLENO]`) en `Url`, `Email`, `AssetPath` o en cualquier texto (`Text`, `Name` y cadenas simples como `name` o `alias`). Se activa en el workflow de despliegue al cerrar la Fase 3; hasta entonces queda apagado y los marcadores se aceptan.

## 9. Preguntas resueltas

Ver D20 a D24 en `docs/decisiones.md`.
