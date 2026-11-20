extends Node2D
## Guardianes 2D — ejemplo didáctico sin recursos externos (Godot 4).
## Aprende: variables, vectores, delta, estados, IA y detección circular.

const SPEED := 230.0
const ENEMY_SPEED := 90.0
const PLAYER_RADIUS := 18.0
const ENEMY_RADIUS := 20.0
const LIMITS := Vector2(960.0, 540.0)

var player := Vector2(90.0, 90.0)
var enemy := Vector2(720.0, 270.0)
var patrol_points := [Vector2(700.0, 110.0), Vector2(850.0, 420.0)]
var patrol_index := 0
var enemy_state := "PATROL"
var energy := [Vector2(160.0, 390.0), Vector2(450.0, 190.0), Vector2(810.0, 90.0)]
var collected := [false, false, false]
var seconds := 90.0
var state := "READY" # READY, PLAYING, WON, LOST
var hud: Label

func _ready() -> void:
	hud = Label.new()
	hud.position = Vector2(20, 14)
	hud.add_theme_font_size_override("font_size", 21)
	add_child(hud)
	update_hud()

func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ENTER or event.keycode == KEY_SPACE:
			restart()

func restart() -> void:
	player = Vector2(90, 90)
	enemy = Vector2(720, 270)
	patrol_index = 0
	enemy_state = "PATROL"
	collected = [false, false, false]
	seconds = 90.0
	state = "PLAYING"
	update_hud()
	queue_redraw()

func _process(delta: float) -> void:
	if state != "PLAYING":
		return

	# Input.get_vector normaliza el movimiento diagonal.
	var direction := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if Input.is_key_pressed(KEY_A): direction.x -= 1.0
	if Input.is_key_pressed(KEY_D): direction.x += 1.0
	if Input.is_key_pressed(KEY_W): direction.y -= 1.0
	if Input.is_key_pressed(KEY_S): direction.y += 1.0
	player += direction.normalized() * SPEED * delta
	player = player.clamp(Vector2(PLAYER_RADIUS, PLAYER_RADIUS), LIMITS - Vector2(PLAYER_RADIUS, PLAYER_RADIUS))

	for i in energy.size():
		if not collected[i] and player.distance_to(energy[i]) < 32:
			collected[i] = true

	# Una máquina de estados elemental: patrulla o persigue.
	var distance := enemy.distance_to(player)
	if distance < 190.0:
		enemy_state = "CHASE"
	elif distance > 270.0:
		enemy_state = "PATROL"

	var target: Vector2
	if enemy_state == "CHASE":
		target = player
	else:
		target = patrol_points[patrol_index]
		if enemy.distance_to(target) < 12:
			patrol_index = (patrol_index + 1) % patrol_points.size()
			target = patrol_points[patrol_index]
	enemy = enemy.move_toward(target, ENEMY_SPEED * delta)

	seconds = maxf(seconds - delta, 0.0)
	if player.distance_to(enemy) < PLAYER_RADIUS + ENEMY_RADIUS:
		state = "LOST"
	elif seconds <= 0.0:
		state = "LOST"
	elif collected.all(func(value: bool) -> bool: return value) and player.distance_to(Vector2(875, 460)) < 48:
		state = "WON"
	update_hud()
	queue_redraw()

func update_hud() -> void:
	if hud == null:
		return
	var n := 0
	for value in collected:
		if value: n += 1
	var notice := ""
	if state == "READY": notice = " | ENTER inicia"
	if state == "WON": notice = " | GANASTE: ENTER reinicia"
	if state == "LOST": notice = " | FIN: ENTER reinicia"
	hud.text = "Nucleos %d/3 | Tiempo %d s | IA %s%s" % [n, ceili(seconds), enemy_state, notice]

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, LIMITS), Color("#eef3f0"))
	for i in range(0, 960, 40):
		draw_line(Vector2(i, 0), Vector2(i, 540), Color("#dbe6df"))
	for j in range(0, 540, 40):
		draw_line(Vector2(0, j), Vector2(960, j), Color("#dbe6df"))
	var all_collected := true
	for value in collected:
		if not value: all_collected = false
	draw_rect(Rect2(849, 430, 53, 68), Color("#177b61") if all_collected else Color("#82918f"))
	for i in energy.size():
		if not collected[i]:
			draw_circle(energy[i], 13, Color("#16a174"))
	draw_circle(player, PLAYER_RADIUS, Color("#177b61"))
	draw_rect(Rect2(player - Vector2(11, 6), Vector2(22, 12)), Color.WHITE)
	draw_circle(enemy, ENEMY_RADIUS, Color("#ad3440"))
	draw_rect(Rect2(enemy - Vector2(12, 7), Vector2(24, 13)), Color.WHITE)
	if state != "PLAYING":
		draw_rect(Rect2(245, 220, 470, 84), Color("#182e29"))
