extends Node3D
## Guardianes 3D — prototipo low-poly sin activos externos, Godot 4.
## Aprende: x/y/z, MeshInstance3D, Camera3D, luces, materiales, FSM.

const SPEED := 5.5
const ENEMY_SPEED := 2.3
const BOUNDS := 8.0

var player: Node3D
var robot: Node3D
var collectibles: Array[Node3D] = []
var portal: Node3D
var status: Label
var elapsed := 0.0
var state := "READY"
var ai_state := "PATROL"
var patrol_target := Vector3(5, 0.7, 5)
var seconds := 90.0

func _ready() -> void:
	build_world()
	update_hud()

func make_material(hex_color: String) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(hex_color)
	m.roughness = 0.86
	return m

func add_box(at: Vector3, size: Vector3, color: String) -> Node3D:
	var mesh := MeshInstance3D.new()
	var geometry := BoxMesh.new()
	geometry.size = size
	mesh.mesh = geometry
	mesh.material_override = make_material(color)
	mesh.position = at
	add_child(mesh)
	return mesh

func add_sphere(at: Vector3, radius: float, color: String) -> Node3D:
	var mesh := MeshInstance3D.new()
	var geometry := SphereMesh.new()
	geometry.radius = radius
	geometry.height = radius * 2.0
	mesh.mesh = geometry
	mesh.material_override = make_material(color)
	mesh.position = at
	add_child(mesh)
	return mesh

func build_world() -> void:
	add_box(Vector3(0, -0.15, 0), Vector3(18, 0.3, 18), "#dce7de")
	# Marcadores de borde: representación visual, no físicas de colisión.
	for x in [-9.0, 9.0]:
		add_box(Vector3(x, 0.25, 0), Vector3(0.2, 0.5, 18), "#435c59")
	for z in [-9.0, 9.0]:
		add_box(Vector3(0, 0.25, z), Vector3(18, 0.5, 0.2), "#435c59")
	player = add_sphere(Vector3(-6, 0.7, -6), 0.65, "#137b62")
	add_box(Vector3(-6, 0.88, -6.6), Vector3(0.62, 0.22, 0.2), "#ffffff")
	robot = add_box(Vector3(5, 0.7, 5), Vector3(1.2, 1.2, 1.2), "#a5333d")
	portal = add_box(Vector3(6.8, 1.2, -6.8), Vector3(1.4, 2.4, 0.4), "#778a86")
	for position in [Vector3(-4, 0.5, 5), Vector3(0, 0.5, 0), Vector3(4, 0.5, -4)]:
		collectibles.append(add_sphere(position, 0.42, "#16a174"))
	var camera := Camera3D.new()
	camera.position = Vector3(0, 19, 20)
	add_child(camera)
	camera.look_at(Vector3.ZERO, Vector3.UP)
	camera.current = true
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -35, 0)
	sun.light_energy = 1.8
	add_child(sun)
	var layer := CanvasLayer.new()
	add_child(layer)
	status = Label.new()
	status.position = Vector2(20, 20)
	status.add_theme_font_size_override("font_size", 22)
	layer.add_child(status)

func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ENTER:
		restart()

func restart() -> void:
	player.position = Vector3(-6, 0.7, -6)
	robot.position = Vector3(5, 0.7, 5)
	for index in collectibles.size():
		collectibles[index].visible = true
	ai_state = "PATROL"
	patrol_target = Vector3(5, 0.7, 5)
	seconds = 90.0
	state = "PLAYING"
	update_hud()

func _process(delta: float) -> void:
	if state != "PLAYING":
		return
	# Vector3 usa X (lateral), Y (altura) y Z (profundidad).
	var v := Vector3.ZERO
	if Input.is_key_pressed(KEY_A) or Input.is_action_pressed("ui_left"): v.x -= 1
	if Input.is_key_pressed(KEY_D) or Input.is_action_pressed("ui_right"): v.x += 1
	if Input.is_key_pressed(KEY_W) or Input.is_action_pressed("ui_up"): v.z -= 1
	if Input.is_key_pressed(KEY_S) or Input.is_action_pressed("ui_down"): v.z += 1
	player.position += v.normalized() * SPEED * delta
	player.position.x = clampf(player.position.x, -BOUNDS, BOUNDS)
	player.position.z = clampf(player.position.z, -BOUNDS, BOUNDS)

	# IA por distancia y máquina de estados.
	var distance := robot.position.distance_to(player.position)
	if distance < 5.0:
		ai_state = "CHASE"
	elif distance > 7.0:
		ai_state = "PATROL"
	if ai_state == "CHASE":
		robot.position = robot.position.move_toward(player.position, ENEMY_SPEED * delta)
	else:
		robot.position = robot.position.move_toward(patrol_target, ENEMY_SPEED * delta)
		if robot.position.distance_to(patrol_target) < 0.3:
			if patrol_target.x > 0:
				patrol_target = Vector3(-5, 0.7, 5)
			else:
				patrol_target = Vector3(5, 0.7, 5)

	for gem in collectibles:
		if gem.visible and player.position.distance_to(gem.position) < 1.1:
			gem.visible = false
	var remaining := 0
	for gem in collectibles:
		if gem.visible: remaining += 1
	if remaining == 0:
		(portal as MeshInstance3D).material_override = make_material("#16a174")

	seconds = maxf(0, seconds - delta)
	if player.position.distance_to(robot.position) < 1.15 or seconds <= 0:
		state = "LOST"
	elif remaining == 0 and player.position.distance_to(portal.position) < 1.4:
		state = "WON"
	update_hud()

func update_hud() -> void:
	if status == null:
		return
	var n := 0
	for gem in collectibles:
		if not gem.visible: n += 1
	var suffix := ""
	if state == "READY": suffix = " | ENTER inicia"
	elif state == "WON": suffix = " | GANASTE: ENTER reinicia"
	elif state == "LOST": suffix = " | FIN: ENTER reinicia"
	status.text = "3D Nucleos %d/3 | %d s | IA %s%s" % [n, ceili(seconds), ai_state, suffix]
