# Guardianes 2D · Godot 4 / GDScript

Proyecto editable para Seminario 2027. Sin bibliotecas, texturas ni cuentas externas.

## Abrir
1. Descarga la carpeta completa o clona el repositorio.
2. En Godot 4 (edición estándar, no .NET), pulsa **Importar** y selecciona este \`project.godot\`.
3. Ejecuta con **F6** en la escena principal o **F5** para el proyecto.
4. Pulsa Enter para iniciar; flechas o WASD para moverte.

## Aprender
- **Node2D** es el escenario: posiciones X/Y en píxeles.
- **_process(delta)** actualiza estados cada fotograma.
- **Input.get_vector / KEY_WASD** convierte teclas en vector.
- **move_toward** mueve al robot por distancia limitada por segundo.
- **distance_to** detecta colectables y contacto.
- **_draw** dibuja personajes vectoriales sin archivos gráficos.
- **FSM**: estado PATROL y CHASE. Como ampliación: SEARCH + BFS.

Este ejemplo deliberadamente no tiene físicas de paredes; en Godot real, continúa con CharacterBody2D, CollisionShape2D y TileMapLayer. El ejemplo web Guardianes del Laboratorio incluye un BFS de cuadrícula.

**Estado de validación:** fuente incluida y chequeos estáticos; sin ejecución del editor Godot en el laboratorio.
