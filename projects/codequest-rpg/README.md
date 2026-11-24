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
