# Instituto Jorge Robledo · Seminario de Programación 2027

Portal educativo inspirado en los sistemas originales:

- [Statistics 11 · Python Learning Hub](https://juanperez238421-cpu.github.io/ijr-estadistica-11-2026/python/)
- [Seminar 11 · Main Learning Hub](https://juanperez238421-cpu.github.io/ijr-estadistica-11-2026/seminario/)

## Navegación

| Ruta | Función |
| --- | --- |
| `/` | Portada de ingreso, grupo opcional y tres espacios de estudio |
| `/learning/` | Catálogo y progreso local |
| `/learning/theory.html?topic=algoritmos` | Teoría visual de algoritmos |
| `/learning/workshop.html?topic=algoritmos` | Workshop algoritmos: 12 etapas |
| `/learning/theory.html?topic=variables` | Teoría visual de variables |
| `/learning/workshop.html?topic=variables` | Workshop variables: 12 etapas |

## Funciones reales

- Diseño blanco y negro con encabezado IJR, tarjetas, rutas visuales y notebook.
- **24 retos** en total: 12 por unidad (preguntas de comprensión y retos de programación).
- **Python 3 real en el navegador** mediante Pyodide v0.27.7 en Web Worker; la primera carga requiere internet.
- **Run** ejecuta la celda; **Validate** compara la salida con la esperada; **Reset**, pistas, etapas previas y siguientes funcionan.
- El código de cada reto se escribe desde cero.
- Progreso local por etapa guardado en el navegador. Si se borran los datos del sitio, el progreso desaparece.
- Sin nombres, correos personales ni calificaciones de estudiantes en el código público.

## Seguridad y límites

La selección de 10A/10B/10C en portada únicamente configura una preferencia temporal y **NO autentica** a estudiantes.
El workshop **NO se conecta a Supabase** y su resultado **NO es una nota oficial**.
No deben guardarse datos personales sensibles ni tokens de servicio en el repositorio público.
La integración oficial requiere autenticación real, control de acceso por usuario, políticas RLS y un servicio de evaluación confiable.
No se reutiliza el mecanismo de entrada por correo únicamente de los sistemas 2026.

## Supabase

`supabase/schema.sql` contiene un esquema propuesto y políticas básicas de lectura.
**No se ha ejecutado** ni se han registrado los nueve estudiantes, porque la conexión actual no cuenta con permisos de administración en el proyecto solicitado.
No habilitar inserciones desde el cliente sin un flujo de autenticación y validación apropiados.

## Publicación

El repositorio incluye `.github/workflows/pages.yml`, con despliegue automático desde `main`.
Si el sitio no se publica, revisar Settings → Pages → Source: GitHub Actions y la ejecución del workflow.
La URL prevista según la cuenta y el repositorio es:
`https://ijr-jd.github.io/Seminario-2027/`
Se debe comprobar el estado del despliegue antes de distribuirla.

## Pruebas manuales recomendadas

1. Abrir portada, elegir 10A y entrar en Learning Hub.
2. Abrir Theory y Workshop para ambos temas.
3. En etapa 1, seleccionar la respuesta correcta y validar.
4. En etapa 7, ejecutar Python en una celda nueva; confirmar que devuelve la salida esperada.
5. Cambiar el código tras ejecutar y comprobar que exige volver a ejecutar antes de validar.
6. Probar pistas, Reset, navegación y persistencia local al recargar.
7. Repetir en móvil y verificar que no haya elementos inaccesibles.
