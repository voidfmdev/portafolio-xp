# Portafolio XP

Portafolio web personal que simula un escritorio Windows XP (tema Luna): pantalla de bienvenida, escritorio con íconos, ventanas que se arrastran, barra de tareas, menú Inicio, un Messenger con respuestas predefinidas y Floppy, un asistente de escritorio con forma de disquete. Bilingüe: español e inglés.

Demo: https://voidfmdev.github.io/portafolio-xp/

**Estado: en pausa tras la Fase 2.** El contenido actual es de relleno (textos `[RELLENO] …` y marcadores como `<nombre>` o `<correo>`); el contenido real llega en la Fase 3. Detalle en [docs/estado-del-proyecto.md](docs/estado-del-proyecto.md).

## Stack

- React 19 + TypeScript 6 + Vite 8.
- XP.css (MIT) para los controles y CSS Modules para lo propio; colores, tipografías y medidas en `src/styles/tokens.css`.
- Contenido en JSON (`src/content/`), validado con Zod en las pruebas y en el build.
- Navegación por hash (`#/proyectos`), sin router.
- Vitest + Testing Library, ESLint y Prettier.
- Publicación en GitHub Pages con GitHub Actions.

## Cómo correrlo

Requiere Node en la versión de `.nvmrc` y npm.

```bash
npm ci
npm run dev
```

Verificaciones (las mismas que corre el workflow antes de publicar):

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

Build como en GitHub Pages, que sirve el sitio desde `/portafolio-xp/` (sin `VITE_BASE`, la base es `/`):

```bash
VITE_BASE=/portafolio-xp/ npm run build
VITE_BASE=/portafolio-xp/ npm run preview   # http://localhost:4173/portafolio-xp/
```

Con `CONTENT_STRICT=true`, el build falla si queda contenido de relleno; se activa al cerrar la Fase 3.

## Estructura

```
docs/            especificación, decisiones, esquemas de contenido y estado del proyecto
public/          CV en PDF, fondo de escritorio y archivos estáticos
src/app/         arranque, App y preferencias
src/os/          bienvenida, escritorio, barra de tareas, menú Inicio y gestor de ventanas
src/windows/     una carpeta por ventana y explorer/ (chrome compartido tipo Explorador)
src/assistant/   motor del asistente, globo y personaje Floppy
src/content/     los 7 JSON de contenido, sus esquemas y la validación
src/i18n/        textos de interfaz (es.json, en.json)
src/icons/       íconos SVG propios
src/styles/      tokens, ajustes a XP.css y estilos globales
src/lib/         almacenamiento, fechas y accesibilidad
```

## Documentación

- [docs/estado-del-proyecto.md](docs/estado-del-proyecto.md): estado, pendientes y cómo retomar.
- [docs/spec.md](docs/spec.md): qué se construye y cómo se comporta; fases en §10.
- [docs/decisiones.md](docs/decisiones.md): decisiones con fecha, alternativas y motivo.
- [docs/content-schema.md](docs/content-schema.md): esquemas de los JSON de contenido.

## Assets

Todo lo visual es propio (SVG) o viene de XP.css. El repositorio no incluye logos, fondos, íconos ni sonidos de Windows, ni personajes de terceros.
