# Registro de decisiones — Portafolio XP

Ubicación sugerida en el repo: `docs/decisiones.md`. Toda decisión nueva se agrega aquí con fecha, alternativas y motivo.
Estados: **[DE]** decidida · **[PE]** pendiente · **[RE]** reemplazada (indicar por cuál).

| ID | Fecha | Decisión | Alternativas consideradas | Motivo | Estado |
|----|-------|----------|---------------------------|--------|--------|
| D1 | 2026-11-02 | Escritorio XP completo (bienvenida, íconos, ventanas arrastrables, barra de tareas, menú Inicio) con modo móvil de una ventana maximizada a la vez | Página con estética XP (scroll y ventanas estáticas) | Es lo que hace la referencia y lo que diferencia el portafolio; el modo móvil cubre el riesgo de pantallas chicas | [DE] |
| D2 | 2026-11-02 | React + Vite + TypeScript + XP.css; contenido en JSON, no en código | HTML/CSS/JS puro + XP.css | Componentes reutilizables y estado de ventanas ordenado; React ya se domina; XP.css (MIT) ahorra el CSS fino | [DE] |
| D3 | 2026-11-02 | Publicación en GitHub Pages con GitHub Actions | Vercel / Netlify | Gratis, el repo público es parte del portafolio, dominio propio opcional | [DE] |
| D4 | 2026-11-02 | Bilingüe ES/EN con selector; idioma inicial: `?lang=` > guardado > navegador > `es`; la pantalla de bienvenida ofrece dos cuentas (una por idioma) | Solo español; solo inglés | Alcance a empleadores fuera de Chile; la bienvenida con dos cuentas resuelve el selector de forma coherente con XP | [DE] |
| D5 | 2026-11-02 | Personaje del asistente: **Floppy**, un disquete con ojos propio en SVG, implementado como `FloppyCharacter` detrás del contrato `Character` | (a) Pato de goma · (b) Salmón pixelado | Personaje propio, sin derechos de terceros; toque cómico coherente con la estética retro | [DE] |
| D6 | 2026-11-02 | Fase 1 reducida: 1 artboard de escritorio + 1 ventana tipo para fijar tokens | Completa (4 artboards) · Saltarla | Barata y evita rehacer CSS; XP se ve muy distinto a Windows 7, así que las capturas de la referencia guían estructura, no estilo | [DE] |
| D7 | 2026-11-02 | Sin IA en vivo en el asistente: respuestas predefinidas desde JSON | Chat con modelo vía API | En un sitio estático la clave de API quedaría expuesta; un backend sale del alcance de la v1 | [DE] |
| D8 | 2026-11-02 | Navegación por hash (`#/…`) con hook propio, sin react-router | react-router con rutas reales | GitHub Pages no reescribe rutas; el hash evita `404.html` y una dependencia | [DE] |
| D9 | 2026-11-02 | Estado del "sistema operativo" con Context + useReducer | Zustand, Redux | Pocas ventanas; cero dependencias; revisar si crece | [DE] |
| D10 | 2026-11-02 | Formulario de contacto v1 con `mailto:` | Formspree / Web3Forms / backend propio | Sin backend ni claves en la v1; se reevalúa en Fase 3 | [DE] (revisar en Fase 3) |
| D11 | 2026-11-02 | Fondo de escritorio: paisaje propio del sur de Chile (lago, volcán, colinas) en SVG | Degradado azul Luna | Aprobado en los mockups de Fase 1; identidad propia y sin assets de terceros | [DE] |
| D12 | 2026-11-02 | Íconos de escritorio propios en SVG, planos con borde oscuro (48 px) | Librería de íconos con licencia libre | Aprobado en Fase 1; legibles sobre el fondo y coherentes con el personaje | [DE] |
| D13 | 2026-11-02 | Tokens Luna según `src/styles/tokens.css` (título #0A4ED6→#3D8BF5, cerrar #D9442E, barra #245EDC→#1C45A8, Inicio #3F9B41→#2E7A30, panel #7BA3E8→#5E79D9, selección #316AC5, diálogos #ECE9D8; Tahoma 12 px, Trebuchet MS en títulos) | — | Aprobado en Fase 1; todo color o tipografía del código sale de este archivo | [DE] |
| F1 | 2026-11-02 | **Fase 1 cerrada** con la aprobación de los dos artboards (escritorio y ventana tipo Explorador) | — | Validación explícita de la dueña del proyecto | [DE] |
| D14 | 2026-11-03 | Herramientas de desarrollo (solo `devDependencies`, no llegan al bundle): plantilla oficial `create-vite` react-ts con ESLint (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`), `typescript` 6.0 (la plantilla trae 7.0, pero `typescript-eslint` 8.72 solo admite `<6.1.0`), `vite`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `@types/node`; `prettier` (comillas simples y sin punto y coma, como la plantilla); `vitest` + `jsdom` + `@testing-library/react` + `@testing-library/dom` (dependencia par obligatoria) + `@testing-library/jest-dom`. Node 26 LTS fijado en `.nvmrc` (local y CI) | Oxlint (nuevo predeterminado de la plantilla) · Biome en lugar de ESLint + Prettier · TypeScript 7 con `--legacy-peer-deps` (combinación no soportada por `typescript-eslint`) · happy-dom en lugar de jsdom | Lo piden el stack (D2) y las convenciones del repositorio (`docs/spec.md` §12); es la configuración oficial de Vite y la más documentada; jsdom es el entorno de referencia de Testing Library | [DE] |
| D15 | 2026-11-03 | El workflow de despliegue calcula `VITE_BASE` desde el nombre del repositorio: `/<repo>/`, o `/` si el repo es `<usuario-github>.github.io`. Sin la variable, `vite.config.ts` usa `/` | Escribir `/<nombre-del-repo>/` en el workflow cuando la dueña del proyecto lo confirme · Variable de repositorio en GitHub (`vars.VITE_BASE`), que hay que configurar a mano | Cumple la convención de despliegue (`docs/spec.md` §12) sin escribir el nombre en el código; sigue funcionando si el repo se renombra | [DE] |
| D16 | 2026-11-03 | Fechas y duraciones (`src/lib/dates.ts`): `es` → `es-CL` y `en` → `en-US` en `Intl`; mes abreviado ("mar 2024" / "Mar 2024", con día si el ISO lo trae); duración en meses contados inclusive (2023-01 → 2023-04 = 4 meses), sin considerar días; las palabras ("4 meses", "1 year, 4 months") las genera `Intl`; "Presente"/"Present" lo entrega i18n | `en-GB` (día antes del mes) · conteo exclusivo (2023-01 → 2023-04 = 3 meses) · mes completo ("marzo de 2024") | `es-CL` lo fija la spec §6; el conteo inclusive es el que usa LinkedIn, que es lo que un reclutador espera; el formato abreviado cabe en la vista Detalles | [DE] |
| D17 | 2026-11-03 | Modelo de los 7 JSON de contenido según `docs/content-schema.md`, con sus preguntas abiertas (§9) | Esquemas solo con los campos que la spec enumera (deja sin definir Perfil, Experiencia, Contacto, Messenger y Asistente) | La spec fija los campos de Proyectos y Habilidades; el resto hace falta para escribir los esquemas Zod en la Fase 2 | [PE] |
| D18 | 2026-11-03 | Las fuentes que trae XP.css ("Pixelated MS Sans Serif" y "Perfect DOS VGA 437") se quitan del build con código propio en `vite.config.ts`, sin dependencias nuevas; además se anulan las reglas que las piden, para que no haya solicitudes 404 | Dejarlas; copiar XP.css al repo sin esas reglas | Licencia de esas fuentes no documentada | [DE] |
| D19 | 2026-11-03 | Mensajes de commit en español, con el prefijo estándar de Conventional Commits; código, identificadores, nombres de archivos y comentarios de código en inglés | Todo en inglés; commits en español sin prefijo estándar | Preferencia de la dueña del proyecto; el prefijo estándar mantiene la compatibilidad con herramientas de historial y changelog | [DE] |

## Reglas permanentes (no son decisiones, no cambian por fase)

- R1 — Datos personales solo en `src/content/*.json`; en código y ejemplos, marcadores `<nombre>`, `<alias>`, `<usuario-github>`, `<correo>`, `<linkedin>`, `<foto>`.
- R2 — Sin assets de Microsoft ni personajes registrados (spec §8.5).
- R3 — Una fase se cierra solo con validación explícita de la dueña del proyecto.
- R4 — Toda dependencia nueva se registra aquí antes de instalarse.

## Pendientes que bloquean fases

| Pendiente | Bloquea | Quién |
|-----------|---------|-------|
| Alias, usuario de GitHub, correo, redes | Fase 2 (nombre del repo y `base` de Vite); Fase 3 (contenido) | Dueña del proyecto |
| Lista de proyectos y visibilidad de cada uno | Fase 3 | Dueña del proyecto |
| CV en PDF (ES/EN) | Fase 3 | Dueña del proyecto |
