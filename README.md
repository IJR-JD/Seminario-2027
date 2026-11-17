# Instituto Jorge Robledo · Seminario de Programación 2027

**Sitio público:** https://ijr-jd.github.io/Seminario-2027/

**Repositorio:** https://github.com/IJR-JD/Seminario-2027

## Referencia real de diseño y currículo

Se tomó el código fuente vigente de:

- [Statistics 11 · Python Learning Hub](https://juanperez238421-cpu.github.io/ijr-estadistica-11-2026/python/)
- [Seminar 11 · Main Learning Hub](https://juanperez238421-cpu.github.io/ijr-estadistica-11-2026/seminario/)

La plataforma conserva la identidad gráfica original (blanco, negro, tarjetas, tipografía de sistema, barra institucional, notebooks y dos rutas de navegación: Theory + Practice y Projects) e incorpora la **estructura y los contenidos de los 16 temas originales de Statistics 11**, más una unidad inicial de Algoritmos.

## Main Learning Hub — exactly two options

The homepage, [Seminario 2027](https://ijr-jd.github.io/Seminario-2027/), displays **exactly two primary pathway cards**. Python Sandbox is still accessible as a utility in the header, not as an additional course pathway:

1. **Visual Theory:** [17 topics](https://ijr-jd.github.io/Seminario-2027/learning/) with a consolidated conceptual lesson, source-backed visuals, live Python code, and 12 guided practice stages **embedded directly on the same theory URL**. There is no separate Workshop card in the main hub or topic catalogue.
2. **Guided Projects:** [Four project routes](https://ijr-jd.github.io/Seminario-2027/projects/) covering **Data Analyst**, **3D Design**, **Video Game Design**, and **AI Agent Design**. Each route has four stages: theory, build/workshop, test/QA, evidence and acceptance gate. These are possible routes, not official 2027 individual assignments.

The standalone `learning/workshop.html` is retained as a backwards-compatible deep link, but students access the same functionality in `learning/theory.html?topic=<slug>#practice`. No extra page navigation is required to solve the 12 problems.

## Consolidated Statistics 11 theory and diagrams

The visual system and source content are adapted from the actual Statistics 11 repository:

- **Operations V9:** the eight illustrated sequences (Python → Colab → runtime, calculator/notebook comparison, Colab anatomy, execution cycle, operators, top-down execution, diagnostic errors, statistics bridge). Files: `learning/operations-visual-v9.js`, `learning/operations-visual-v9.css`, `learning/operations-visual-v9-refine.css`.
- **Arrays V34:** full consolidated arrays lesson with six visual diagrams (anatomy, zero-indexing, append, summary, mean, DataFrame bridge). Files: `learning/arrays-consolidated-v34.js`, `learning/arrays-consolidated-v34.css`.
- **Libraries / XLSX / Pandas V60:** consolidated conceptual two-class guide and **eight practical application examples** (these are examples, not eight separate diagrams). Files: `learning/libraries-pandas-theory-v60.js`, `learning/libraries-pandas-theory-v60.css`.

The original terminology, white/black card styling, animation conventions, explanatory sequence and accessible text labels are retained. Changes adapt selectors, links and datasets to the 2027 application without using the old Statistics 11 accounts.

## CAD / 3D Design — modelado por operaciones y recursos ManimCE

[Projects → 3D Design](https://ijr-jd.github.io/Seminario-2027/projects/?project=3d-design) contiene un laboratorio adicional con **12 lecciones de operaciones** agrupadas en cuatro fases, cada una con definición, ejemplo, pasos de construcción, verificaciones dimensionales y esquema conceptual SVG (no video):

1. Croquis y restricciones
2. Extrusión positiva / aditiva
3. Extrusión negativa / sustractiva
4. Revolución aditiva y por corte
5. Barrido sobre trayectoria
6. Solevación (loft)
7. Agujeros
8. Bobina, hélice y rosca
9. Redondeo y chaflán
10. Patrones y simetría
11. Nervios y repujado
12. Árbol de operaciones, planos y entrega

Las cuatro etapas del proyecto están sincronizadas con estas operaciones. Las rutas Data Analyst, Video Game Design y AI Agent Design permanecen sin cambios.

### Evidencia y estado de los videos originales

Se revisó la rama principal pública de [ITM-JOB/CAD](https://github.com/ITM-JOB/CAD), incluyendo el árbol Git y [scripts/lessons.py](https://github.com/ITM-JOB/CAD/blob/main/scripts/lessons.py). **Sí existe fuente ManimCE real** de las escenas `Hydraulic`, `Automotive` y `Transmission`, relacionadas con mecanismos y secciones CAD; **no son demostraciones de extrusión/revolución/barrido**. El README describe exportaciones `outputs/{A,B,C}/lesson.mp4`, pero los archivos MP4 no están presentes en la rama principal revisada. Tampoco se localizaron los MP4 originales por operación.

Por integridad de fuente, **no se insertaron enlaces ni videos inventados**. `projects/cad-curriculum.js` contiene el inventario de fuentes y `verifiedOperationVideos: []`. `projects/cad-lessons.js` mostrará un reproductor nativo solamente cuando exista una URL HTTPS real y verificada asociada a `operationId`. Los diagramas SVG actuales son nuevos esquemas conceptuales de la página 2027, no ManimCE y no sustituyen los videos originales.

Cuando se publiquen o adjunten los MP4 correspondientes, deben añadirse a una ruta real servida por GitHub Pages (por ejemplo `/projects/media/extrude-add.mp4`) y registrarse en el catálogo por `operationId` tras probar que reproducen. Evitar enlaces a artefactos temporales de Actions o a archivos de salida inexistentes.

## 2027 Projects library

The projects in `projects/data.js` contain **16 guided stages (4 tracks × 4)**. Data Analyst and 3D Design reuse and refine the prior source guides. Video Game Design and AI Agent Design provide additional step-by-step construction, testing, evidence and acceptance criteria. The site exposes only the four routes defined for the 2027 seminar. Every project gives explicit build tasks, test cases, required evidence and an acceptance gate. Project selection is exploratory until approved by the teacher.

## Programa: 17 unidades y 204 retos

00. Algoritmos y pensamiento lógico (prerrequisito Seminario 2027)
01. Colab interface and general operations
02. Variables and data types
03. Arrays and Python lists
04. Python Libraries → XLSX Files → Pandas
05. CSV files and Pandas DataFrames
06. Central tendency from a real dataset
07. Functions: name a reusable process
08. Statistics foundations with lists
09. Descriptive statistics: center and spread
10. Quartiles, percentiles, IQR and outliers
11. CSV and Pandas DataFrames
12. Data cleaning and quality checks
13. Filtering, sorting and transformation
14. Grouping, frequencies and aggregation
15. Data visualization with Matplotlib
16. Data Analyst capstone workflow

Cada unidad incluye 12 ejercicios (17 × 12 = 204). El catálogo y los textos están en `learning/course-2027.js`, generado a partir del estado final de los módulos curriculares originales, con referencias al contexto de décimo grado en 2027.

## Theory

`learning/theory.html?topic=<slug>` presenta:

- Fundamentación conceptual original y objetivos por unidad
- Tarjetas conceptuales numeradas
- Diagramas procedimentales originales adaptados
- Referencia de sintaxis, ejemplos y errores comunes
- Ejecutor Python editable: Run / Reset / Output
- Acceso anclado a los 12 ejercicios integrados en la misma página y navegación entre unidades

## Standalone Python Sandbox (ported from Statistics 11)

**Open:** https://ijr-jd.github.io/Seminario-2027/learning/sandbox.html

The source sandbox from `juanperez238421-cpu/ijr-estadistica-11-2026/python/` has been directly adapted using its actual five HTML/CSS/JavaScript files:

- `learning/sandbox.html`
- `learning/sandbox-v39.js`
- `learning/sandbox-v39.css`
- `learning/sandbox-workspace-v40.js`
- `learning/sandbox-workspace-v40.css`

The sandbox retains the original Colab-style UI, real Pyodide 0.27.7 runtime, multi-cell notebook, Run/Run all, cell reordering/deletion, output clearing, local autosave, `.py` export, CSV/XLSX uploads, Matplotlib plot rendering, package loading and a virtual Python filesystem with download/delete file manager. It is linked from the site home, learning hub, theory and workshop headers.

2027-specific adaptations: branding/year, a beginner algorithms-and-variables example, own `ijr-seminario-2027-python-sandbox-v39` browser storage key and `seminario2027_sandbox.py` export name. It does not use the Statistics 11 Supabase project or copy identities/progress/grades. This is an intentionally **ungraded independent workspace**, and notebook code stays on the current browser unless exported.

## Integrated workshop

The workshop is rendered as the `#practice` section within `learning/theory.html?topic=<slug>` and uses the same engine as the compatible `learning/workshop.html?topic=<slug>` route. It includes:

- 12 etapas navegables, cada problema con instrucciones y pista
- Celdas de código desde cero, preguntas conceptuales y consola de Python 3
- Intérprete Pyodide ejecutado en Web Worker; necesita internet para cargar bibliotecas
- Datos didácticos sintéticos `estudiantes.csv` y `pandas_excel_students.xlsx` creados en el entorno de práctica
- Autocomprobación de respuestas cerradas y de salidas deterministas documentadas en `learning/checks-v2.js`
- Para los demás ejercicios: ejecución registrada como práctica realizada **sin considerar automáticamente correcta la solución** (revisión docente necesaria)

Las comprobaciones del navegador son **formativas, no oficiales**. No se confía en la puntuación del frontend para otorgar calificaciones.

## Identidad institucional (@ijr.edu.co)

La portada presenta un formulario con correo institucional. Su arquitectura utiliza Supabase Auth con enlace de verificación por correo electrónico; tras confirmar el enlace, se comprueba que la dirección verificada coincide con un registro aprobado de `seminar_students`. El grupo se toma de la matrícula, nunca de una selección manual.

**Integración aún no activada:** la conexión actual con Supabase solo tiene acceso al proyecto anterior `rlfxnjbqxbozjdzkbwlz`, y rechaza permisos sobre el proyecto de Seminario 2027 `wtqtzfdubrhjudcnmvgf`. El valor `publishableKey` de `learning/supabase-config.js` se dejó vacío deliberadamente. No se han creado cuentas ni importado matrículas.

### Para activar registro y guardado

1. Conectar en ChatGPT o abrir con la cuenta propietaria el proyecto Supabase `wtqtzfdubrhjudcnmvgf`.
2. Ejecutar primero `supabase/schema.sql` y después `supabase/2027-email-login-and-progress.sql` en el SQL Editor del proyecto correcto, revisando políticas RLS.
3. Importar en el proyecto, por canal privado, las nueve matrículas con **nombre, grupo y correo institucional real**. No publicar el listado en GitHub. Sin los correos no se puede verificar el enlace entre identidad y matrícula.
4. Configurar en Supabase Auth el redirect permitido: `https://ijr-jd.github.io/Seminario-2027/` y el envío de correos (SMTP autorizado si es necesario).
5. Insertar la **clave publicable** (`sb_publishable_...`, nunca la service-role ni una clave secreta) en `learning/supabase-config.js`.
6. Validar el acceso de una cuenta institucional real y la persistencia del avance en el proyecto correcto, incluido cierre de sesión, cambios de estudiante y políticas RLS. No se realizó esta prueba porque no hay acceso administrativo.

## Estado QA

- `scripts/qa.mjs` verifica 17 temas, 204 etapas, identificadores únicos, secciones curriculares, registro por email y dependencias.
- La acción GitHub Pages ejecuta `node --check` y `node scripts/qa.mjs` antes de desplegar.
- **GitHub Actions 44112626898:** SUCCESS, incluyendo comprobaciones de JavaScript, integridad curricular, dos rutas de navegación y despliegue Pages.
- **QA de navegador real (noviembre 2026):** dos tarjetas en la portada, 17 temas con un solo enlace Theory + Practice, cuatro proyectos (Data Analyst, 3D Design, Video Game Design, AI Agent Design), cuatro etapas por ruta, ocho figuras Operations V9, seis figuras Arrays V34, material ampliado V60 y 12 etapas integradas: PASS. La ejecución de Python `25` se comprobó en el Live Lab de teoría, no se repitió la validación del workshop integrado.
- **Pendiente:** inicio de sesión real por correo y carga/consulta en Supabase 2027; pruebas completas de Run/Validate en el workshop integrado, todos los 204 problemas y todas las librerías avanzadas.

## Seguridad

Los archivos públicos no contienen nombres de estudiantes, correos privados, contraseñas ni claves Supabase de servidor. La sincronización del progreso solo se activa tras verificación real del correo y coincidencia con la matrícula en el proyecto 2027. El progreso temporal de invitados permanece en sessionStorage y no equivale a una entrega formal.
