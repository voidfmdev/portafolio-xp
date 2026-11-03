# Esquemas de contenido — Portafolio XP

Estado: **[PE] propuesta para validación** · Fecha: 2026-11-03 · Decisión asociada: D17.
Fuente: `docs/spec.md` §5 y §7. Los campos que la spec enumera literalmente (Proyectos §5.2, Habilidades §5.3) se respetan; el resto es propuesta y las dudas están en §9.
Implementación: esquemas Zod en `src/content/schema.ts` (Fase 2), validados en una prueba de Vitest y en `build`.

## 0. Convenciones

Notación tipo TypeScript; `?` = opcional. El orden de cada lista es el orden en pantalla, salvo donde se indica.

| Tipo | Forma | Regla |
|------|-------|-------|
| `Text` | `{ "es": string, "en": string }` | Ambos obligatorios y no vacíos: así se detecta un texto que falta en un idioma (spec §7) |
| `Name` | `string` o `Text` | Nombre propio: un `string` si es igual en ambos idiomas, `Text` si se traduce |
| `IsoDate` | `"YYYY-MM"` o `"YYYY-MM-DD"` | Fecha real de calendario (`isIsoDate` en `src/lib/dates.ts`) |
| `Slug` | `"mi-proyecto"` | `^[a-z0-9]+(-[a-z0-9]+)*$`, único en su lista; se usa en los enlaces `#/…` |
| `Url` | `"https://…"` | URL absoluta `https:` |
| `Email` | `"…@…"` | Correo válido |
| `AssetPath` | `"cv/<alias>-cv-es.pdf"` | Ruta dentro de `public/`, sin `/` inicial, para que funcione con cualquier `base` (D15) |
| `Marker` | `"<correo>"` | Marcador `<…>` de la spec §3 (principio 5). Mientras existan, `Url`, `Email` y `AssetPath` también aceptan un marcador |
| `AppId` | `"about"` … | `about` · `projects` · `skills` · `experience` · `contact` · `messenger` · `recycle-bin` · `control-panel` |

- El texto de relleno va marcado: `"[RELLENO] …"`.
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
  cv: { es: AssetPath; en: AssetPath }   // "cv/<alias>-cv-es.pdf", "cv/<alias>-cv-en.pdf"
}
```

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
    name: Name                       // nombre del asistente
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

- Todo id de `start` y `followUps` existe en `questions`; los ids no se repiten.
- `target` solo con `app: "projects"` o `"skills"`, y debe existir en `projects.json` o `skills.json` (validación entre archivos).
- El avatar es el personaje del asistente (contrato `Character`), no una imagen; "Disponible" y las horas los pone la interfaz.

Ejemplo mínimo:

```json
{
  "header": { "name": "[RELLENO] Asistente", "personalMessage": { "es": "[RELLENO] …", "en": "[RELLENO] …" } },
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
  help: Text                         // menú Inicio › Ayuda (spec §4.4); ver §9
}
```

## 8. Validación (Fase 2)

- Un esquema Zod por archivo y los tipos de TypeScript derivados de ellos (`z.infer`), así el código y el JSON no se separan.
- Comprobaciones entre archivos: `target` de Messenger, unicidad de slugs e ids.
- Se ejecuta en `npm run test` y en `npm run build`; un JSON inválido corta el build con el archivo y la ruta del campo.

## 9. Preguntas abiertas [PE]

1. **`Name` = `string` o `Text`** para nombres propios (proyecto, empresa, institución, ítem de habilidad). La spec muestra `name` como texto simple; sin `Text`, las habilidades blandas y certificaciones no se pueden traducir.
2. **Marcadores en `Url`, `Email` y `AssetPath`**: se aceptan durante la Fase 2. ¿Se prohíben en la Fase 3, para que el build falle si queda alguno?
3. **Messenger sin `followUps`**: propuesta, volver a ofrecer las preguntas de `start`.
4. **Evento `help`** del asistente: no está en la lista de §5.7, pero el menú Inicio tiene "Ayuda (abre el asistente)".
5. **SEO**: el `<title>`, la descripción y Open Graph tienen que estar en el `index.html` estático (los rastreadores no ejecutan JS), pero contienen datos personales. Propuesta para la Fase 2: inyectarlos en el build desde `profile.json`; eso agregaría un campo `site: { title: Text; description: Text }` aquí.
