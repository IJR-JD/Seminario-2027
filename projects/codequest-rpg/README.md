# CodeQuest Skill Studio — Three.js motion laboratory

Integrated in the institutional Seminario 2027 project.

- **Adventure:** https://ijr-jd.github.io/Seminario-2027/projects/codequest-rpg/
- **Animation preview:** https://ijr-jd.github.io/Seminario-2027/projects/codequest-rpg/skills.html

## Skill families

**Warrior (Guardian class):** Triple Slash (three consecutive timed sword strokes), Cyclone Blade (spinning attack), Earthbreaker (jumping overhead strike plus impact wave).

**Wizard (Mage class):** Fireball (charge, launch, impact), Frost Nova (expanding cold wave), Meteor Shower (three staggered projectiles).

**Scout:** Shadow Dash (evade and strike), Triple Arrow (three staggered shots), Afterimage Step (multi-direction evasive motion).

**All classes:** Quick Dash and Barrier Pulse.

Each class has a foundation and two branches. All nodes are available for exploration and completed previews are tracked locally. The studio uses a separate Three.js scene with articulated procedural characters and deterministic animation timelines. The player can change classes, replay or pause the current skill, adjust speed, scrub to a specific moment, orbit the camera and customize appearance. The timing panel displays actual keyframe, phase and impact values from `skill-motion.js`. The character shares the same stored colors and style as the movement adventure. Procedural rigs animate the torso, head, shoulders, elbows, hips, knees and cape. Impacts are scripted studio cues. The 12 movement levels retain their original interpreter, and the full adventure now has 22 rooms: 12 introductory rooms, 4 expedition rooms and 6 conditional/foundry rooms.

## Learning progression

The room editor is a constrained **Python-like educational language**, not a general Python interpreter: it accepts directional assignments, arithmetic expressions, selected abilities and some sensor-driven if/else branches. Code is **not** executed by CPython or Pyodide in this game. Chapter 01 remains unchanged: students program movement using only \`up = 1\`, \`right = 1\`, \`left = 1\`, \`down = 1\`. The Skill Studio is a separate demonstration of possible later chapters. The displayed function signatures are **future lesson examples**, not executable in the intro editor.

## Quality assurance

\`node scripts/qa-codequest.mjs\` validates the initial movement chapter.
\`node scripts/qa-codequest-skills.mjs\` validates studio source, navigation, skill availability, motion continuity, event timing and JavaScript syntax.

Three.js is imported from a version-pinned CDN in production. The PR QA workflow also runs real desktop/mobile Chromium smoke tests, serving local copies of pinned Three.js modules; screenshot artifacts are retained on the CI run. Performance profiling on low-end student devices still needs manual verification.

## Island open-world and Python Trail (2026-11-23)

`overworld.mjs` owns Three.js island scene composition, continuous movement, camera, camera-relative keyboard input, portals and relic discovery. `island-exploration.mjs` contains pure geometric limits, bridge routing, five optional Python-themed waystations and the direction/distance helper. `world.js` integrates the world selector, the atlas, the teaching editor and the room execution state. The atlas is optional: existing island collectibles, 22 rooms, scoring, stars and class customization are preserved.

The island now includes five discoverable waystations (variables, expressions, conditions, loops and lists/data). Their progress uses a separate browser-local key `cq-island-python-trail-v1`; a selected waypoint shows direction and distance without teleporting the hero. On touch screens, holding the D-pad provides precise continuous movement. Automated routing uses one of the three bridge crossings when traversing the river, including journeys between bridges.

This is a learning artifact with local-only progress. No student identity, account, synchronization, analytics, multiplayer, code sandbox service or server-side save has been added.

## QA commands

```sh
node scripts/qa-codequest.mjs
node scripts/qa-codequest-skills.mjs
node scripts/qa-codequest-island.mjs
```

The island pull-request workflow also runs `scripts/qa-codequest-browser.mjs` against locally served files using Chromium. Consult `QA-REPORT-2026-11-23.md` for risks, testing scope and release gates.

## Two-storey topic villages — World 1 expansion

The existing open island now groups all **22 original challenge portals** into six visually distinct neighborhoods, preserving room indices, progress, saved stars and interpreter behavior. Spatial data is centralized in `island-villages.mjs` rather than handwritten Three.js offsets:

| District | Lessons | Topic clusters |
|---|---:|---|
| Meadow Trail | 01–12 | Movement fundamentals (01–04), Obstacle navigation (05–08), Route planning (09–12) |
| Sunstone Heights | 13–14 | Elevation, Phase gates |
| Aether Reach | 15–16 | Flight, Ordered relays |
| Signal Grove | 17–18 | Conditions, Prism locks |
| Clockwork Bastion | 19–20 | Sensors, Nested decisions |
| Ember Foundry | 21–22 | Trap detection, Combined actions |

The island includes **eight new decorative two-storey houses**. Existing portal houses may have one or two storeys; **eleven portals are accessible on raised balconies**. To enter an upstairs lesson, approach the exterior ladder and press **F** to climb; press **F** again on the balcony to descend. Touch devices retain the dedicated climb button. The zone directory labels floor and topic, and selecting an upstairs room routes to its ladder rather than bypassing the challenge. Lower-level entrances remain separate from upper ones.

All architectural assets are procedural Three.js primitives (shared cached geometries, district-colored masonry, wooden balconies and ladders, pitched roofs, warm windows and themed signs). The layout uses safe terrain locations; the Python Trail landmarks, river bridges and relics remain independent of mission placement.

### Verification

```sh
node scripts/qa-codequest.mjs
node scripts/qa-codequest-skills.mjs
node scripts/qa-codequest-island.mjs
node scripts/qa-codequest-villages.mjs
```

The CodeQuest pull request workflow additionally runs `scripts/qa-codequest-browser.mjs` in Chromium. Its dedicated tests verify that an upstairs room cannot be entered from the ground, then perform the real climb, find the upper portal and enter the room. Inspect desktop/mobile screenshots from the corresponding Actions run as well.

## Room Studio — viewport-first programming workspace

All 22 missions share one responsive workspace. The left 3D viewport occupies the available desktop height; the right command dock contains the mission brief, room-specific commands, editor, execution controls, variables, log, and hints. Brief and output sections collapse independently. Focus view temporarily hides the dock and Escape restores it; camera controls and progress stay accessible. At widths of 900 px or less the world and command dock stack vertically. The room interpreter, room IDs, progression, scoring, village positions and island interaction remain unchanged.

Design references:
- CodeCombat educational play view: game and typed code editor side by side (https://github.com/codecombat/codecombat).
- Godot Editor: a primary viewport, adjacent docks and distraction-free mode (https://docs.godotengine.org/en/stable/getting_started/introduction/first_look_at_the_editor.html).

The `qa-codequest-room-studio.mjs` Chromium suite checks all 22 room states at laptop resolution, 3D focus, camera switching, code execution and reset, full-HD and narrow-screen layouts. Its screenshots are included in the CodeQuest CI artifacts.

## Adventure Island v3
Original block-style character rig for the overworld, with joint-centered walking, sprinting, jumping, crouching, climbing, dash, flight and wall-running poses. Room models and the existing lesson interpreter are unchanged.

| Feature | Interaction |
|---|---|
| Wind Shrine | Walk to the shrine; X / Dash activates a short burst with cooldown |
| Sky Shrine | Walk to the shrine; V / Flight toggles flight, with a six-second charge and safe return when exhausted over water |
| Stone Shrine | Walk to the shrine; B / Wall toggles wall-running beside the violet lane |
| Four paired travel gates | Approach an arch and press G / Gate |
| Four adventure circuits | Activate numbered pads in order, demonstrate the required power where specified, then collect the reward |
| Four pulsing spike traps | Avoid the active spikes or jump over them; a trap returns you to recent safe ground and resets unfinished circuits |
| Adventure journal | Follow a ground route to a shrine, trial or gate; learned powers and earned rewards persist locally |

Solid village facades now block walking; click routes search around obstacles and use the existing bridges. Larger roof eaves, door proportions, tiered trees and dynamic landmark effects are original assets, not Roblox assets. Adventure progress is stored separately under `cq-island-adventure-v3`; all 22 room IDs, scoring and Python Trail progress remain compatible.

QA: `node scripts/qa-codequest-adventure.mjs` checks data, navigable placements, route collision, portal pairs, trial order, timing and persistence. `qa-codequest-adventure-browser.mjs` exercises actual physical Dash unlock, use, reload persistence and portal travel in Chromium. Full flight, wall and circuit playthroughs need further end-to-end coverage.

## Dynamic Island v4
The original block-style island receives procedural repeatable ground, masonry, roof and wood textures, animated water ripples, instanced grass, flowers, rocks and path shoulders, drifting clouds, birds and fireflies. Buildings gain framed windows, plinths, corner trim and eaves; avatars gain armor layers, a visible tether harness and twin-thruster pack. No external game assets are copied.

Two new discoverable items extend the same adventure save (old unlocks and room scores survive).
- Tether Workshop (-97,-59): T attaches to the nearest eligible cyan anchor within 25 world units. WASD steers a gravity-driven rope-constrained swing; T releases with momentum. Eleven elevated anchors extend across the meadow, river crossings and eastern region.
- Jetpack Forge (88,54): J toggles jetpack, Space raises altitude and C lowers it (hold the touch Jump/Crouch controls on mobile). Nine seconds of nominal fuel, variable burn during climb/descent, recharge on safe ground. High flight can clear roofs, and unsafe landings recover to the last grounded position.

Both systems are original simplified mechanics inspired by aerial traversal in action games; they are not reproductions of Spider-Man or Attack on Titan physics. All 22 programming rooms retain their existing interpreter and scoring. Node tests exercise the rope constraint and fuel model; Chromium tests exercise physical equipment discovery, swing/release, jetpack ascent and persistence.

## Skyways v5
Eight procedural corridors extend the original 11 anchors across both banks, all districts and the central region. Four original structural families (lattice spire, masonry arch, crane, obelisk) are rendered using shared instanced geometry. Cyan lines on the island map indicate neighboring anchor routes; golden target rings mark eligible anchors. T attaches/releases; Y transfers to another reachable anchor while preserving momentum. The HUD shows anchor availability and transfer count. Network QA checks safe sites, connectivity, alternate anchors near the workshop and velocity conservation; real Chromium QA exercises an actual transfer.

## Living Interiors v6
All 30 existing village buildings have explorable cutaway interiors, loaded only when entered using the H key or the contextual entrance button. The 52 floors contain residents with thematic hints, furniture, collision-aware floor navigation, and six district-specific interior styles. Each of the 22 existing coding rooms has an internal portal on its original assigned floor; the exterior portals and outdoor ladders still work. Community halls have no additional academic room IDs. Use Buildings to navigate to an entrance, WASD or click the floor to walk, R to speak, F at stairs, Enter at the portal, and H near the exit. The contextual HUD also offers destination buttons and touch interaction. Return from a mission to the same building and floor. The independent `cq-interiors-v6` key stores visited floors and residents met; existing mission and power progress are untouched. The scene uses the same WebGL renderer and disposes interior-only resources on exit.

## Vertical World v7
Six distributed vertical trails use terrain-aware, collision-checked placement near the six districts, with six numbered solid platforms per trail. Real ballistic jump physics, variable-height release, coyote time, input buffering, horizontal acceleration/friction and blended landing/fall poses apply to outdoor locomotion. Players can jump off existing balconies and land on raised surfaces; tether releases can land on platforms. K is an optional assisted jump that steers using the same gravity and landing rules. Complete pads in order to collect a separate vertical crystal; independent local save preserves learning, gear and interiors. Parkour directory and altitude HUD work with touch and keyboard. Pure QA simulates all 36 landings and tests frame-rate convergence; browser QA checks a manual jump and a full six-pad route.

## Mobility & Mechanical Progression v8
Six mobility hubs contain trail bikes and explorer rovers, plus hoverboards unlocked by Clockwork Bastion. M mounts or parks; P toggles parking brake; Space also brakes while mounted. WASD drives and Shift boosts a rover after earning Rover turbo. The six original academic sectors remain available: finishing all rooms in a sector grants a permanent mechanical skill and unlocks that sector's separate elevated expedition terrace. U activates the skill-gated lift; explore the connected deck and collect its beacon, then return to the central lift. Skills are derived from the existing completed-room save, so previous academic progress automatically counts. Expedition discoveries are saved independently. The original shrine powers, 30 buildings, 52 floors, 106 anchors, 36 parkour surfaces and 22 coding rooms remain intact. Articulated knees/elbows, run, slide, turn, takeoff, apex, fall, landing, impact roll, mount/dismount and three ride poses enrich movement. Vehicle geometry/materials are shared and raised collision surfaces cached. Node QA checks all sector and mobility rules; Chromium QA exercises actual mount/drive/brake/dismount, locked and unlocked lift states, traversal and discovery.
