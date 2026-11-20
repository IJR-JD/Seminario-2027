/* Static curriculum and Godot project consistency checks. No Godot runtime needed. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const page=read('projects/godot-2d-3d-academy.html');
const links=read('projects/index.html')+read('projects/game-development-guide.html');
const sections=['elegir','instalar','bases','escenas','movimiento','colisiones','ia','tresd','blender','publicar','laboratorio'];
for(const section of sections)assert.ok(page.includes('id="'+section+'"'),'Missing module: '+section);
assert.ok(links.includes('godot-2d-3d-academy.html'),'Academy is not linked from Seminar');
for(const name of ['guardianes-2d','guardianes-3d']){
 const base='projects/godot-examples/'+name+'/';
 const project=read(base+'project.godot'),scene=read(base+'main.tscn'),script=read(base+'main.gd'),readme=read(base+'README.md');
 assert.ok(project.includes('run/main_scene="res://main.tscn"'),name+' missing scene');
 assert.ok(project.includes('gl_compatibility'),name+' must target Compatibility');
 assert.ok(scene.includes('res://main.gd')&&scene.includes('ExtResource("1")'),name+' missing script attachment');
 assert.ok(script.includes('extends Node')&&script.includes('func _ready()')&&script.includes('func _process(delta: float)')&&script.includes('func restart()'),name+' incomplete example');
 assert.ok(script.includes('PATROL')&&script.includes('CHASE'),name+' missing finite-state AI');
 assert.ok(readme.length>250,name+' missing readme');
}
const three=read('projects/godot-examples/guardianes-3d/main.gd');
assert.ok(three.includes('Camera3D.new()')&&three.includes('DirectionalLight3D.new()')&&three.includes('MeshInstance3D.new()'),'3D world needs camera, lights, and meshes');
assert.ok(three.includes('visor.reparent(player, true)'),'3D visor should follow character');
const two=read('projects/godot-examples/guardianes-2d/main.gd');
assert.ok(two.includes('Input.get_vector')&&two.includes('queue_redraw()'),'2D script missing input or redraw');
console.log('PASS Godot 2D + 3D source tree, links, 11 course modules, renderer and static AI contracts');
