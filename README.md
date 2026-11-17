# Instituto Jorge Robledo · Seminario de Programación 2027

**Sitio público:** https://ijr-jd.github.io/Seminario-2027/

**Repositorio:** https://github.com/IJR-JD/Seminario-2027

## Referencia real de diseño y currículo

Se tomó el código fuente vigente de:

- [Statistics 11 · Python Learning Hub](https://juanperez238421-cpu.github.io/ijr-estadistica-11-2026/python/)
- [Seminar 11 · Main Learning Hub](https://juanperez238421-cpu.github.io/ijr-estadistica-11-2026/seminario/)

La plataforma conserva la identidad gráfica original (blanco, negro, tarjetas, tipografía de sistema, barra institucional, notebooks y separación Theory/Workshop) e incorpora la **estructura y los contenidos de los 16 temas originales de Statistics 11**, más una unidad inicial de Algoritmos.

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
- Enlaces a Workshop y a las unidades anterior/siguiente

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

## Workshop

`learning/workshop.html?topic=<slug>` presenta:

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
- **GitHub Actions 44105788761:** SUCCESS, incluyendo etapa de QA y despliegue Pages.
- **QA de navegador real:** 17 tarjetas, contenido de las dos primeras teorías, selección de etapa 1 y ejecución + validación de Python en etapa 7: PASS.
- **Pendiente:** inicio de sesión real por correo y carga/consulta en Supabase 2027; pruebas en todos los 204 problemas y todas las librerías avanzadas.

## Seguridad

Los archivos públicos no contienen nombres de estudiantes, correos privados, contraseñas ni claves Supabase de servidor. La sincronización del progreso solo se activa tras verificación real del correo y coincidencia con la matrícula en el proyecto 2027. El progreso temporal de invitados permanece en sessionStorage y no equivale a una entrega formal.
