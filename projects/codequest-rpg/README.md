# CodeQuest · World of Code

Interactive Three.js programming adventure integrated into the real Instituto Jorge Robledo Seminario 2027 site.

## Open

https://ijr-jd.github.io/Seminario-2027/projects/codequest-rpg/

The page can also run from a local static web server after cloning the repository, but Three.js and OrbitControls are currently loaded from jsDelivr. A network connection is required for those imports.

## Gameplay

- 12 progressive handcrafted movement missions in a nine-by-nine coordinate world (X 0–8, Z 0–8).
- No enemies, combat, or auto-attacks in the introductory chapter.
- Chapter mechanics: direct motion, named variables, ordered paths, obstacles, crystals collected with collect(), checkpoints, and arithmetic expressions.
- Levels unlock sequentially. Local progress is stored in the browser without student identity.
- A game-world-focused interface includes mission HUD, code editor, live variables, log, level map, hints, orbit camera, and completion feedback.
- Character studio lets players edit class silhouette, hero name, personality, skin, armor, hair and cape colors, hair/accessory style, height, and body build. All characters share the same abilities.
- All 12 starter routes are checked by a source-level quality-assurance script.

## Learning commands

Commands use a deliberately restricted Python-like syntax:

    steps = 3
    move("right", steps)
    move("forward", 2)
    collect()

Only numeric assignments, arithmetic expressions (+, -, *, /, **), move() and collect() are supported. **This is not a full Python interpreter** and arbitrary scripts are not executed. Commands are intentionally kept simple for introductory programming lessons.

## Source files

- index.html — the game UI, welcome screen and character creator
- world.css — responsive visual design
- world.js — 3D world generation, character generation, animation, interpreter, mission model
- scripts/qa-codequest.mjs — repository-wide curricular route validation

## Limitations and next steps

The environment is procedural Three.js rather than a large textured open-world game. Characters use procedural body-part motion, not skeletal/rigged animation assets. Real browser interaction and performance tests are distinct from syntax and route-logic QA and remain necessary before production classroom use. The educational game does not use Supabase grading or collect identifiable student data.
