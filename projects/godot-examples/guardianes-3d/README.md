# Guardianes 3D · Godot 4 / GDScript

**Proyecto fuente educativo** con mundo 3D generado desde código, sin .blend, texturas ni complementos. Está preparado para renderer **Compatibility**. La escena y el código son editables.

## Abrir en Godot 4
1. Instala Godot Standard 4 (no .NET).
2. Importa \`project.godot\` y pulsa **F5**.
3. Usa Enter para iniciar o reiniciar; flechas o WASD para mover el personaje sobre el plano X-Z.
4. Recoge las tres esferas verdes y llega al portal evitando al robot rojo.

## Conceptos
- \`Node3D\` organiza el mundo en tres coordenadas (X, Y, Z).
- \`MeshInstance3D\` representa cajas y esferas con geometría visible.
- \`StandardMaterial3D\` proporciona color y rugosidad.
- \`Camera3D\` transforma el mundo en imagen 2D.
- \`DirectionalLight3D\` ilumina.
- \`delta\` expresa segundos entre fotogramas.
- \`distance_to\` detecta proximidad; el robot cambia entre PATROL y CHASE.

Este es un ejemplo de **simulación por distancias**, sin sistema físico ni colisiones con muros. Para un videojuego 3D posterior implementa CharacterBody3D, CollisionShape3D y NavigationAgent3D; rig y assets de Blender se importan como .glb.

**Estado de validación:** fuente y estructura verificadas estáticamente; no se afirma ejecución del editor Godot ni compatibilidad del laboratorio.
