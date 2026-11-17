# Seminario de Programación 2027 — Instituto Jorge Robledo

Portal de aprendizaje de algoritmos y programación para los grupos 10°A, 10°B y 10°C.

## Versión inicial implementada
- Interfaz responsive con navegación lateral y tarjetas académicas; diseño inspirado en Estadística 11 de 2026.
- Clase 01: definición de algoritmo, entradas, proceso, salidas y pseudocódigo.
- Clase 02: variables y tipos de datos en Python.
- Workshop 01: cinco preguntas autocorregibles con explicaciones, reinicio y retroalimentación individual.
- Ruta de aprendizaje hacia operadores, condicionales, ciclos, funciones y proyectos.

## Acceso
Abrir `index.html` localmente para usar el contenido y el taller sin conexión al backend.
Para publicar: Settings → Pages → Deploy from a branch → main / (root). Hasta activar Pages y verificar el sitio, no se considera desplegado.

## Supabase
`supabase/schema.sql` incluye el esquema propuesto para matrícula y entregas, con RLS y sin datos personales.
**No se ha aplicado la migración ni insertado estudiantes**: la cuenta Supabase conectada rechazó permisos de administración sobre el proyecto indicado.
La aplicación actual es un prototipo educativo funcional. El workshop no guarda intentos en Supabase y no produce calificaciones oficiales.
Jamás incluir nombres de estudiantes en archivos públicos, credenciales de administrador o service_role en frontend.
