# Estado del proyecto — Portafolio XP

Actualizado: 2026-11-04 · **En pausa tras la Fase 2**, hasta que la dueña del proyecto entregue el contenido real de la Fase 3.

Punto de entrada para retomar el proyecto sin contexto previo. Qué se construye: `docs/spec.md`. Por qué se decidió cada cosa: `docs/decisiones.md`. Forma de los JSON de contenido: `docs/content-schema.md`.

## 1. Estado

| Fase | Estado | Registro |
|------|--------|----------|
| 0 Definición | Cerrada | Spec aprobada; D5 y D6 [DE] |
| 1 Diseño | Cerrada el 2026-11-02 | F1 |
| 2 Esqueleto | Cerrada el 2026-11-04 | F2 |
| 3 Contenido | Sin empezar; espera los datos de §6 | — |
| 4 Pulido | Sin empezar | — |

- Rama de trabajo de la Fase 2: `feat/phase-2-skeleton`. Se fusiona en `main` con avance rápido y cada push a `main` publica (D40); al cerrar, las dos ramas apuntan al mismo commit.
- `main` está publicada en https://voidfmdev.github.io/portafolio-xp/, con contenido de relleno.
- Último commit antes del cierre: `e15872d` (`docs: confirma D36 a D39 y registra las decisiones D40 a D46`). Los commits de cierre solo agregan documentación: este archivo, `README.md`, la fila F2 de `docs/decisiones.md` y la puesta al día de `docs/spec.md` (encabezado, §8.2, §10 y §11). El último commit lo muestra `git log -1 main`.
- Para retomar, se abre desde `main` una rama nueva para la fase, con el mismo formato (`feat/phase-3-…`).

## 2. Cómo verificar

```bash
npm ci
npm run lint && npm run typecheck && npm run test && npm run build
VITE_BASE=/portafolio-xp/ npm run build   # build como en GitHub Pages
```

Cifras de referencia al cerrar la Fase 2 (Node 26.13, npm 11.20, `VITE_BASE=/portafolio-xp/`):

| Comprobación | Resultado |
|--------------|-----------|
| `npm run lint` | Sin errores ni avisos |
| `npm run typecheck` | Sin errores |
| `npm run test` | 37 archivos de prueba, 356 pruebas en verde |
| `npm run build` | `index.html` 2,67 kB (0,92 kB gzip) · JS 309,4 kB (93,4 kB gzip) · CSS 292,2 kB (46,7 kB gzip) · `dist/` completo ≈ 610 kB |

- El bundle inicial pesa ≈ 140 kB gzip (JS + CSS), bajo el objetivo de 300 kB (spec §9).
- El build muestra 4 avisos `[lightningcss minify]` por un selector de XP.css (`:before:not([value])`) que los navegadores ya descartan; `vite.config.ts` los recupera a propósito (`errorRecovery`). No son errores.
- `CONTENT_STRICT=true npm run build` falla hoy con 123 marcadores, como corresponde al contenido de relleno (D21).
- El workflow `.github/workflows/deploy.yml` corre `npm ci` → `typecheck`, `lint` y `test` → `build` con `VITE_BASE` calculado desde el nombre del repositorio (D15) → publicación en GitHub Pages.

## 3. Mapa del código

| Carpeta | Contenido |
|---------|-----------|
| `src/app/` | `main.tsx` (arranque y estilos), `App.tsx` (bienvenida o sesión de escritorio; un enlace profundo salta la bienvenida si ya hay idioma guardado) y las preferencias del Panel de control: `PreferencesProvider.tsx`, `preferences.ts`, `useReducedMotion.ts` (D33) |
| `src/os/` | Metáfora de escritorio: `welcome/`, `desktop/` (íconos), `taskbar/` (Inicio, botones de ventana, bandeja, reloj), `start-menu/`, `window-manager/`. `DesktopSession.tsx` une escritorio, asistente, barra de tareas y menú Inicio; `appIds.ts` lista las 8 apps y el orden del menú; `cv.ts` abre el CV del idioma; `useIsMobile.ts`, el modo móvil (D41) |
| `src/windows/` | Una carpeta por ventana: `about/`, `projects/`, `skills/`, `experience/`, `contact/`, `messenger/`, `recycle-bin/`, `control-panel/`. `explorer/` es el chrome compartido tipo Explorador (migas, panel de tareas, barra de estado, Atrás/Adelante); `appWindows.ts` asocia cada app con su componente |
| `src/assistant/` | Asistente de escritorio y su personaje Floppy |
| `src/content/` | Los 7 JSON de contenido, sus esquemas, la validación y la escritura de `index.html` |
| `src/i18n/` | Textos de interfaz y configuración regional |
| `src/icons/` | Íconos SVG propios (D12) y `index.ts`, que los exporta |
| `src/styles/` | `tokens.css` (única fuente de colores, tipografías y medidas), `xp-overrides.css` (ajustes a XP.css), `global.css` |
| `src/lib/` | `storage.ts` (`localStorage` con `try/catch`), `dates.ts` (fechas y duraciones, D16), `a11y.ts` (elementos enfocables y ciclo de Tab), `useMediaQuery.ts` |

Piezas clave:

| Pieza | Dónde | Decisiones |
|-------|-------|------------|
| Gestor de ventanas | `src/os/window-manager/`: `windowReducer.ts` (acciones `open`, `close`, `minimize`, `maximize`, `restore`, `focus`, `move`, `navigate`, `fit`), `WindowManagerProvider.tsx` (contexto), `WindowLayer.tsx` (dibuja las ventanas abiertas), `Window.tsx` (chrome XP, `role="dialog"`, Tab y Esc), `useWindowDrag.ts`, `geometry.ts` (cascada y ajuste al escritorio), `windowDefaults.ts` (tamaños por app), `titleBarControls.ts`, `MessageDialog.tsx` (diálogos XP) | D9, D28, D34, D42, D43 |
| Enlaces profundos | `src/os/routes.ts` (hash ↔ ventana) y `src/os/useHashRoute.ts` | D8, D29 |
| Asistente Floppy | `src/assistant/`: `engine.ts` (reducer puro: eventos, cola, repetición), `AssistantProvider.tsx` (lo conecta con ventanas, idioma, preferencias e inactividad, `useIdle.ts`), `Assistant.tsx` y `Balloon.tsx` (personaje y globo), `Character.ts` (contrato), `characters/FloppyCharacter.tsx`, `assistantCharacter.ts` (elige el personaje para el escritorio y Messenger). Textos en `src/content/assistant.json` | D5, D23, D37, D38, D39 |
| Messenger y Contacto | `src/windows/messenger/conversation.ts` (preguntas predefinidas) y `src/windows/contact/contactForm.ts` (validación y `mailto:`) | D22, D35, D36 |
| i18n | `src/i18n/`: `es.json` (referencia) y `en.json`, `messages.ts` (claves tipadas, variables y plurales), `I18nProvider.tsx` y `useI18n.ts`, `initialLang.ts` (idioma inicial), `locales.ts` (`es-CL`, `en-US`); `parity.test.ts` compara claves y variables | D4, D25 |
| Validación de contenido | `src/content/schema.ts` (Zod), `validate.ts` (un error por línea y modo estricto), `files.ts` (importa los 7 JSON), `index.ts` (contenido tipado para la app, sin Zod en el bundle), `content.test.ts`; el plugin `validate-content` de `vite.config.ts` corta el build | D17, D20, D21, D26 |
| Escritura de `index.html` | `src/content/siteHtml.ts` y el plugin `site-html` de `vite.config.ts`: reemplazan `<!-- site-head -->` (título, descripción, Open Graph) y `<!-- site-noscript -->` (resumen bilingüe sin JavaScript) | D24, D44 |
| Fuentes de XP.css | Plugin `strip-xp-fonts` de `vite.config.ts`: quita del build las fuentes sin licencia documentada | D18 |

## 4. Convenciones

- **Idiomas**: documentación y mensajes de commit en español; código, identificadores, nombres de archivos y comentarios de código en inglés (D19).
- **Commits**: prefijo de Conventional Commits (`feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`) y descripción en español, en presente y sin punto final, sin trailers (`feat: agrega el gestor de ventanas`). Varios commits pequeños si el cambio es grande. Una rama por fase.
- **Tokens**: colores, tipografías, espaciados y medidas solo desde `src/styles/tokens.css` (D13, ampliado por D27, D30, D32 y D39); estilos propios en CSS Modules. Prettier no formatea `tokens.css`, para conservar los valores aprobados tal cual.
- **i18n**: sin textos literales en JSX. Interfaz con `t('clave')` (D25), contenido con campos `{ es, en }` en los JSON; la prueba de paridad falla si falta una clave o una variable en un idioma.
- **Marcadores**: mientras no haya datos reales, `<nombre>`, `<alias>`, `<usuario-github>`, `<correo>`, `<linkedin>`, `<foto>` o `[RELLENO] …`. Los datos personales viven solo en `src/content/*.json`, nunca en código ni configuración (R1). Nada de contenido inventado.
- **Assets propios**: fondo (D11), íconos (D12) y Floppy (D5) son SVG propios. Prohibidos el logo y la bandera de Windows, el fondo Bliss, íconos o sonidos de Windows y personajes de terceros o de marcas registradas (spec §8.5, R2).
- **Dependencias registradas**: de la app, `react`, `react-dom`, `xp.css` y `zod` (spec §12); de desarrollo, las de D14. Toda dependencia nueva se registra en `docs/decisiones.md` antes de instalarse (R4).
- **Decisiones**: cada una nueva entra en `docs/decisiones.md` con fecha, alternativas y motivo como [PE]; pasa a [DE] cuando la confirma la dueña del proyecto, que también cierra cada fase (R3).
- **Almacenamiento y fechas**: `localStorage` solo a través de `src/lib/storage.ts`; fechas ISO en los JSON, formateadas en `src/lib/dates.ts`.
- **Publicación**: fusión de la rama de fase en `main` con avance rápido (D40); el push a `main` dispara el workflow.

## 5. Decisiones pendientes

D41 a D44 describen lo que ya está implementado y esperan confirmación. D45 y D46 proponen cambios que no se han aplicado.

| ID | Tema | Recomendación registrada |
|----|------|--------------------------|
| D41 | Ancho del modo móvil compartido entre CSS y JS: constante `MOBILE_QUERY` repetida en los CSS Modules y una prueba que compara las copias con `--breakpoint-mobile` | Confirmar lo implementado |
| D42 | Comportamiento del modo móvil: ventanas maximizadas de a una, íconos en 3 columnas, menú Inicio a pantalla completa, panel de tareas desplegable, tarjetas en Experiencia y botón flotante del asistente | Confirmar lo implementado |
| D43 | Toda ventana cabe en el escritorio: ajuste antes del primer pintado y al achicar el navegador (acción `fit`) | Confirmar lo implementado |
| D44 | `<noscript>` bilingüe y escritura del título y Open Graph en `index.html`, sin `og:image` ni `og:url` hasta tener imagen y dominio | Confirmar lo implementado |
| D45 | Tab dentro de la ventana y acceso al globo con teclado | Opción (b): cambiar la spec §4.5 para que Tab salga de la ventana en el orden de la página. Sin implementar hasta que se decida |
| D46 | Contraste de los tokens Luna (WCAG 2.1 AA) | Corregir el anillo de foco con colores aprobados (opción a) y dejar el resto para la Fase 4 (opción b) |

Además: borrar `public/cv/README.md`, `public/og/README.md` y `public/wallpaper/README.md`. Vite copia `public/` a `dist/`, así que hoy se publican con el sitio.

## 6. Fase 3: contenido

**Alcance** (spec §10): JSON reales en español e inglés, CV, formulario, Papelera, Buscar y easter eggs; lo marcado [PE Fase 3] en la spec: Apagar equipo (§4.1, §4.4), menú contextual del escritorio (§4.2), Buscar en el portafolio (§4.4), servicio de formulario (§5.5) y easter egg de la Papelera (§5.9). Cierre: cada ventana revisada por la dueña del proyecto.

**Datos que debe entregar la dueña del proyecto** (reemplazan los marcadores y el relleno de `src/content/`):

- Nombre y alias, usuario de GitHub, correo y LinkedIn (`profile.json`, `contact.json`).
- Foto o avatar (`<foto>`), línea de rol, ubicación y textos de Sobre mí: título de página, migas y secciones, con el tono elegido (spec §5.1).
- Título y descripción del sitio para buscadores y redes (`profile.json`, campo `site`).
- Proyectos y la visibilidad de cada uno (`public` o `restricted`, spec §5.2), con capturas optimizadas.
- Habilidades por categoría (`skills.json`).
- Experiencia laboral y educación, con fechas ISO (`experience.json`).
- CV en PDF en español e inglés (`public/cv/cv-es.pdf` y `cv-en.pdf`, D31).
- Textos de Messenger (`messenger.json`) y del asistente (`assistant.json`).

**Decisiones abiertas**:

- Servicio de formulario sin clave secreta o seguir con `mailto:` (D10, spec §5.5).
- Librería de íconos de marca y su licencia (spec §5.3); mientras tanto se usa un ícono genérico propio (D35).
- Imagen Open Graph propia (`public/og/`) y `og:image` (D44).
- Dominio propio (`public/CNAME`) y `og:url` (spec §9).

**Al cerrarla**: activar el modo estricto (D21) con `CONTENT_STRICT=true` en el paso de build de `.github/workflows/deploy.yml`, y comprobar que el build pasa sin marcadores.

## 7. Fase 4: pulido

**Alcance** (spec §10): accesibilidad, rendimiento, SEO y Open Graph, dominio y pruebas en dispositivos; opcional, redimensionar ventanas (spec §1). Cierre: Lighthouse en verde (≥ 90 en las cuatro categorías, spec §9) y prueba en un celular real.

**Riesgos conocidos**:

- [RS] Contraste: los pares de tokens que no cumplen WCAG 2.1 AA (D46), salvo el anillo de foco si se corrige antes.
- [RS] Alto de pantalla en celulares reales: el escritorio ocupa el 100 % del alto del documento y no se ha probado en un dispositivo; las barras del navegador móvil cambian el alto visible y pueden tapar o desplazar la barra de tareas.
