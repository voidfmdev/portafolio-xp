# Portafolio XP — Especificación funcional v0.1

Estado: **borrador para validación (Fase 0)** · Fecha: 2026-11-02 · Ubicación sugerida en el repo: `docs/spec.md`
Fuentes de verdad del proyecto: este archivo + `docs/decisiones.md`. Si algo no está aquí, no se implementa sin decisión registrada.

Etiquetas: [HC] hecho confirmado · [DE] decisión tomada · [SU] supuesto · [PE] pendiente · [RS] riesgo

---

## 1. Objetivo y alcance

- Portafolio web personal que simula un escritorio **Windows XP (tema Luna)** y reproduce las **categorías del sitio de referencia** (qvverty72.dev, estilo Windows 7) reinterpretadas en XP.
- Público objetivo: reclutadores, docentes y colegas; hispano y angloparlantes.
- Contenido: identidad profesional, proyectos, habilidades, experiencia y educación, contacto, CV descargable y un asistente conversacional con respuestas predefinidas.

Fuera de alcance de la v1: IA en vivo, backend propio, CMS, sonidos, redimensionar ventanas (opcional en Fase 4), multiusuario.

## 2. Decisiones vigentes (resumen; detalle en `docs/decisiones.md`)

| ID | Decisión | Estado |
|----|----------|--------|
| D1 | Escritorio XP completo con modo móvil (una ventana maximizada a la vez) | [DE] |
| D2 | React + Vite + TypeScript + XP.css; contenido en JSON, no en código | [DE] |
| D3 | Publicación en GitHub Pages con GitHub Actions | [DE] |
| D4 | Bilingüe ES/EN con selector; idioma inicial según navegador | [DE] |
| D5 | Personaje del asistente: Floppy, un disquete con ojos propio en SVG (`FloppyCharacter`, contrato `Character`) | [DE] |
| D6 | Fase 1 reducida: 1 artboard de escritorio + 1 ventana tipo para fijar tokens | [DE] |

## 3. Principios

1. **Contenido como datos**: todo texto visible vive en `src/content/*.json` (contenido) o `src/i18n/*.json` (interfaz). El código no contiene textos del portafolio.
2. **Bilingüe total**: cada texto tiene versión `es` y `en`; nada queda sin traducir.
3. **Sin assets de terceros sin licencia** (ver §8.5). Todo lo visual que no venga de XP.css o de una librería con licencia verificada es propio.
4. **Accesible**: navegable por teclado, con roles ARIA y respeto a `prefers-reduced-motion`.
5. **Marcadores en el código**: `<nombre>`, `<alias>`, `<usuario-github>`, `<correo>`, `<linkedin>`, `<foto>`. Los datos reales se completan solo en los JSON de contenido y nunca en el código fuente.
6. **Sin secretos en el cliente**: ninguna clave privada en el repo ni en el bundle.

## 4. Mapa de pantallas y flujo

```
[Bienvenida] --clic en cuenta (= idioma)--> [Escritorio] --doble clic / Inicio--> [Ventanas]
                                                  ^                                   |
                                                  +-------- Cerrar sesión ------------+
```

### 4.1 Pantalla de bienvenida
- Estilo pantalla de inicio de sesión de XP: fondo azul con franja, logotipo propio del portafolio, texto "Para comenzar, haz clic en tu nombre de usuario".
- **Dos cuentas = dos idiomas**: "Invitado · Español" y "Guest · English". Elegir cuenta fija el idioma (persistente) y entra al escritorio con una transición corta.
- Idioma preseleccionado (resaltado): `?lang=` en la URL > valor guardado > idioma del navegador > `es`.
- Botón "Apagar equipo" en la esquina: muestra la pantalla "Ahora es seguro apagar el equipo" con un botón para volver (easter egg) [PE Fase 3].
- Si el visitante ya eligió idioma antes, la bienvenida se muestra igual pero con su cuenta resaltada (un clic). [SU] Validar si prefieres saltarla en visitas repetidas.

### 4.2 Escritorio
- Fondo de pantalla propio (ver §8.2).
- Íconos en columna izquierda, mismo orden que la referencia: **Sobre mí, Proyectos, Habilidades, Experiencia, Contacto, Messenger**. Arriba: **Descargar CV**. Arriba a la derecha: **Papelera de reciclaje**.
- Interacción: un clic selecciona (resaltado XP), doble clic abre (escritorio); un toque abre (móvil). Teclado: Tab recorre íconos, Enter abre.
- Clic derecho en el escritorio: menú contextual mínimo (Organizar íconos, Cambiar idioma, Configuración) [PE Fase 3].

### 4.3 Barra de tareas
- Botón **Inicio** verde con texto "Inicio" / "start" e ícono propio (no la bandera de Windows).
- Botones de ventanas abiertas: ícono + título; estados activo, inactivo, minimizado; clic alterna minimizar/restaurar/enfocar.
- Bandeja: indicador de idioma `ES`/`EN` (clic alterna), ícono del asistente (clic muestra/oculta), reloj `hh:mm` con fecha al pasar el mouse (formato según idioma).

### 4.4 Menú Inicio (dos columnas, estilo XP)
- Cabecera: avatar + "Invitado"/"Guest".
- Columna izquierda (blanca): las 6 categorías con subtítulo, como en la referencia:
  - Sobre mí — Conóceme / About me — Get to know me
  - Proyectos — Explora mi trabajo / Projects — Explore my work
  - Habilidades — Mi caja de herramientas / Skills — My toolbox
  - Experiencia — Trayectoria y educación / Experience — Experience and education
  - Contacto — Hablemos / Contact — Let's talk
  - Messenger — Un mensaje de bienvenida / Messenger — A welcome message
- Columna derecha (celeste): Descargar CV, Panel de control (Configuración, §5.10), Ayuda (abre el asistente), Buscar en el portafolio [PE Fase 3].
- Pie: "Cerrar sesión" (vuelve a la bienvenida) y "Apagar" (pantalla de apagado, easter egg) [PE Fase 3].
- Cierra con Esc o al hacer clic fuera.

### 4.5 Gestor de ventanas
- Chrome XP vía XP.css: barra de título con ícono y texto, botones minimizar / maximizar / cerrar.
- Comportamientos: abrir, cerrar, minimizar a la barra, maximizar/restaurar (también con doble clic en el título), arrastrar por el título (pointer events, limitado al área del escritorio), foco y orden z al hacer clic, una instancia por aplicación (reabrir solo enfoca), apertura en cascada con tamaño por defecto por aplicación.
- Estructura interna tipo **Explorador de XP** para las ventanas de contenido: barra de herramientas (Atrás/Adelante internos), barra de dirección con migas (`ícono › Sección › Subsección`), **panel de tareas azul** a la izquierda (lista o categorías), área de contenido blanca, barra de estado al pie.
- Atajos: Esc cierra la ventana activa; Tab/Shift+Tab circulan dentro de la ventana; el foco entra a la ventana al abrirla y vuelve al ícono o botón de origen al cerrarla.

### 4.6 Enlaces profundos (hash)
- `#/sobre-mi`, `#/proyectos`, `#/proyectos/<slug>`, `#/habilidades`, `#/habilidades/<categoria>`, `#/experiencia`, `#/contacto`, `#/messenger`.
- Al cargar con hash: pasa la bienvenida (si ya hay idioma guardado) y abre la ventana correspondiente. Al navegar, el hash se actualiza. Compartir un proyecto = copiar la URL.

### 4.7 Modo móvil (ancho < 768 px)
- Bienvenida igual pero a pantalla completa.
- Íconos del escritorio en grilla de 3 columnas.
- Ventanas siempre maximizadas, **una visible a la vez**; la barra de tareas muestra las abiertas y permite cambiar.
- Menú Inicio a pantalla completa; sin arrastre; panel de tareas del Explorador se convierte en pestañas o desplegable arriba del contenido.
- Asistente reducido a un botón flotante; sus globos aparecen sobre la barra de tareas.

## 5. Ventanas de contenido

### 5.1 Sobre mí
- Título de página editable (referencia: "Conoce un poco sobre mí").
- Tarjeta de perfil: foto o avatar, nombre, línea de rol (referencia: "Nivel 28 · Tecnópata (Ingeniero en Informática)"), ubicación, estado "En línea" con punto verde.
- N secciones libres (título + texto) definidas en `profile.json`. La referencia usa tres con tono de ficha de personaje RPG; el tono es decisión tuya [PE].
- Migas: `Sobre mí › Ficha` (texto configurable).

### 5.2 Proyectos
- Panel de tareas: lista de proyectos (ícono de documento + nombre) con contador "N proyectos" en la cabecera.
- Detalle: galería de capturas (miniaturas + flechas, 1..n imágenes, lazy load), descripción, chips de tecnologías, botones condicionales (GitHub, Demo, Caso de estudio).
- Barra de estado: ícono + nombre del proyecto seleccionado.
- Datos (`projects.json`): `slug, name, year, role{es,en}, summary{es,en}, description{es,en}, tech[], links{github?, demo?, caseStudy?}, images[{src, alt{es,en}}], visibility`.
- `visibility: "public" | "restricted"`: los proyectos de empleador o cliente se muestran sin capturas internas ni datos; solo problema, rol, stack y aprendizajes [RS confidencialidad].

### 5.3 Habilidades
- Panel de tareas: categorías con contador "N categorías". Por defecto las 7 de la referencia (editables): Lenguajes de programación · Frameworks y herramientas · Bases de datos y analítica · Ingeniería y arquitectura de software · Metodologías y gestión · Certificaciones · Habilidades blandas.
- Detalle: título, descripción, grilla de ítems (ícono + nombre; nivel opcional como texto, no barras).
- Íconos de tecnologías: desde una librería de íconos de marca (p. ej. Devicon o Simple Icons) [SU: verificar licencia y guías de uso de cada marca antes de Fase 3]; habilidades blandas y certificaciones con íconos propios.
- Datos (`skills.json`): categorías con `id, name{es,en}, description{es,en}, items[{name, icon, level?}]`.

### 5.4 Experiencia
- Vista "Detalles" del Explorador (tabla con columnas).
- Tabla 1 "Experiencia laboral": Cargo · Empresa · Período (con duración calculada, p. ej. "4 meses") · Ubicación.
- Tabla 2 "Educación": Formación · Institución · Período · Ubicación.
- "Presente"/"Present" y duraciones se calculan desde fechas ISO en `experience.json`; orden descendente.
- En móvil las tablas se convierten en tarjetas apiladas.

### 5.5 Contacto
- Ventana tipo "Mensaje nuevo" de correo: Para (fijo: `<alias>`), Nombre, Correo electrónico, Asunto (opcional), Mensaje, botón "Enviar".
- Pie: enlaces GitHub y LinkedIn (lista configurable en `contact.json`).
- Envío v1: `mailto:` con asunto y cuerpo prellenados (sin backend). [PE Fase 3] evaluar servicio de formularios sin clave secreta (p. ej. Formspree, Web3Forms) con anti-spam.
- Validación básica en cliente; confirmaciones en diálogo estilo XP.

### 5.6 Messenger (asistente conversacional, respuestas predefinidas)
- Ventana de mensajería: cabecera con avatar del personaje, nombre del asistente, estado "Disponible" y mensaje personal; historial con marcas de hora; avatar del visitante "Tú"/"You".
- Botones de preguntas predefinidas (4 iniciales, como la referencia: ¿Quién eres? · ¿Qué proyectos has creado? · ¿Cuáles son tus habilidades? · ¿Cómo puedo contactarte?) y preguntas de seguimiento según la respuesta.
- Respuestas desde `messenger.json`: texto bilingüe + acciones opcionales (`openWindow`, `externalLink`, `setLanguage`). Efecto "escribiendo…" corto, desactivado con `prefers-reduced-motion`.
- Sin IA en vivo [DE]: un asistente con IA requiere backend y clave; en un sitio estático la clave quedaría expuesta [RS].

### 5.7 Asistente de escritorio ("comentarista")
- Mismo personaje que en Messenger. Vive en una esquina del escritorio y comenta mediante un globo estilo aviso de bandeja de XP.
- Eventos que disparan comentarios (desde `assistant.json`): primera visita, abrir cada ventana (una vez por sesión), inactividad de 60 s, cerrar todas las ventanas, cambiar idioma, intentar arrastrar en móvil.
- Reglas: cola de mensajes, un globo a la vez, botón cerrar, opción "No mostrar más" (persistente), apagado también desde Panel de control. En móvil: botón flotante.
- Animaciones propias en SVG/CSS: reposo (parpadeo), saludo, hablar, pensar. El personaje se implementa como componente `Character` con un contrato fijo de animaciones, para que sea intercambiable sin tocar el motor [D5 pendiente].

### 5.8 Descargar CV
- Abre `public/cv/<alias>-cv-es.pdf` o `-en.pdf` según idioma. En Fase 2 se usa un PDF de relleno.

### 5.9 Papelera de reciclaje
- v1: ventana "La papelera está vacía". [PE Fase 3] easter egg (p. ej., "ideas descartadas").

### 5.10 Panel de control (Configuración)
- Idioma, asistente activado/desactivado, reducir animaciones, restablecer escritorio (borra preferencias guardadas).
- Persistencia en `localStorage` mediante un envoltorio con `try/catch` (funciona aunque el almacenamiento falle).

## 6. Internacionalización

- Idiomas: `es` (español de Chile) y `en`. Fallback: `es`.
- Interfaz: `src/i18n/es.json` y `en.json`. Contenido: campos `{ "es": "...", "en": "..." }` en cada JSON.
- El cambio de idioma es inmediato y global (sin recarga), actualiza `<html lang>`, títulos de ventana, fechas y horas.
- Misma URL para ambos idiomas; `?lang=es|en` fuerza el idioma al cargar.

## 7. Modelo de contenido

Archivos en `src/content/`: `profile.json`, `projects.json`, `skills.json`, `experience.json`, `contact.json`, `messenger.json`, `assistant.json`.
Esquemas con validación en build (p. ej. Zod) para detectar textos faltantes en un idioma. Esquemas detallados en `docs/content-schema.md` [PE Fase 2].

## 8. Diseño visual (guía; se fija en Fase 1 o al inicio de Fase 2 según D6)

### 8.1 Tema
- Luna azul: barra de título con degradado azul, botón cerrar rojo, barra de tareas azul, botón Inicio verde, panel de tareas celeste, fondos de ventana blancos y gris cálido en diálogos.
- Tipografía: Tahoma como primera opción con fallback (Verdana, "Segoe UI", sans-serif); Trebuchet MS en títulos de ventana con fallback. Tamaño base ≥ 12 px por legibilidad.
- Base técnica: XP.css (MIT) + ajustes propios en `src/styles/xp-overrides.css`. Tokens en `src/styles/tokens.css`.

### 8.2 Fondo de escritorio
- Imagen propia. Propuestas: paisaje del sur de Chile ilustrado (lago, volcán, colinas) o degradado azul estilo Luna. [DE pendiente, se decide viendo opciones]. No se usa el fondo "Bliss" ni ninguna foto de Microsoft.

### 8.3 Íconos
- Set propio de íconos de escritorio en SVG (32 y 48 px) con estilo coherente, o librería con licencia libre verificada. No se usan íconos de Windows.

### 8.4 Personaje
- D5: Floppy, un disquete con ojos propio en SVG, implementado como `FloppyCharacter` detrás del contrato `Character` (detalle en `docs/decisiones.md`).

### 8.5 Prohibido (por derechos de terceros)
Logo y bandera de Windows, fondo Bliss, íconos y sonidos de Windows XP y cualquier personaje de terceros o de marcas registradas. Esto aplica a todo el código y los assets del repositorio, sin excepciones.

## 9. Requisitos no funcionales

- **Rendimiento**: Lighthouse ≥ 90 en las cuatro categorías (móvil y escritorio); imágenes en WebP con lazy load; bundle inicial objetivo < 300 kB gzip [SU].
- **Accesibilidad**: WCAG 2.1 AA; teclado completo; roles (`dialog`, `menu`, `tablist`, etc.); contraste verificado en el tema Luna; `prefers-reduced-motion` desactiva animaciones no esenciales.
- **Compatibilidad**: dos últimas versiones de Chrome, Edge, Firefox y Safari; iOS y Android.
- **Privacidad**: sin cookies de terceros; analítica solo si es sin cookies [PE].
- **SEO y compartir**: título y descripción bilingües, Open Graph con imagen propia, `<noscript>` con resumen y enlaces para indexación.
- **Despliegue**: GitHub Pages mediante GitHub Actions en cada push a `main`; `base` de Vite según nombre del repo; dominio propio opcional con `CNAME` [PE].

## 10. Fases y criterios de cierre

| Fase | Alcance | Cierre (lo valida la dueña del proyecto) |
|------|---------|------------------------------|
| 0 Definición | Esta spec y `decisiones.md` | Spec aprobada; D5 y D6 decididas |
| 1 Diseño | Tokens XP y artboards (escritorio, ventana tipo, menú Inicio, móvil) en una herramienta de diseño | Look aprobado (según D6) |
| 2 Esqueleto | Repo, Vite+React+TS, XP.css, gestor de ventanas, barra de tareas, menú Inicio, bienvenida, i18n, modo móvil, 6 ventanas con contenido de relleno, motor del asistente con personaje de prueba, deploy en GitHub Pages | Demo navegable publicada; checklist de cierre de la fase cumplido |
| 3 Contenido | JSON reales (ES/EN), CV, formulario, Papelera, Buscar, easter eggs | Cada ventana revisada por ti |
| 4 Pulido | Accesibilidad, rendimiento, SEO/OG, dominio, pruebas en dispositivos | Lighthouse en verde; prueba en celular real |

## 11. Pendientes y riesgos abiertos

- [PE] D5 personaje · [PE] D6 mockups · [PE] alias, usuario de GitHub, correo y redes · [PE] lista de proyectos y qué se puede mostrar de cada uno · [PE] CV en PDF (ES/EN) · [PE] servicio de formulario · [PE] fondo e íconos definitivos.
- [RS] Marcas y derechos de terceros (§8.5). [RS] Confidencialidad de proyectos de empleador/cliente (§5.2). [RS] Accesibilidad de la metáfora de escritorio (§9). [RS] Peso de las capturas de proyectos (optimizar antes de subir).

## 12. Convenciones del repositorio

- **Herramientas**: Node LTS (versión en `.nvmrc`) y `npm`. Scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test` (Vitest), `format` (Prettier). Dependencias de la app: `react`, `react-dom`, `xp.css` y `zod`; cualquier otra se registra antes en `docs/decisiones.md` (R4). Herramientas de desarrollo: D14.
- **Estructura**:

```
docs/              spec, decisiones y esquemas de contenido
public/            cv/, wallpaper/, og/
src/app/           App.tsx, providers y arranque
src/os/            welcome/, desktop/, taskbar/, start-menu/, window-manager/
src/windows/       una carpeta por aplicación + explorer/ (chrome compartido tipo Explorador)
src/assistant/     motor de eventos, globo y contrato Character
src/content/       los 7 JSON de contenido (§7)
src/i18n/          cadenas de interfaz y configuración regional
src/icons/         SVG propios
src/styles/        tokens.css, global.css, xp-overrides.css
src/lib/           storage.ts, dates.ts, a11y.ts
```

- **Despliegue** (D3, D15): `.github/workflows/deploy.yml` corre en cada push a `main`: `npm ci` → `typecheck`, `lint` y `test` → `build` con `VITE_BASE` calculado desde el nombre del repositorio → publicación en GitHub Pages. Las rutas por hash (D8) evitan la reescritura del servidor y el `404.html`. Dominio propio solo cuando esté decidido, con `public/CNAME`.
