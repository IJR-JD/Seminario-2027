# CodeQuest Skill Studio — Three.js motion laboratory

Integrated in the institutional Seminario 2027 project.

- **Adventure:** https://ijr-jd.github.io/Seminario-2027/projects/codequest-rpg/
- **Animation preview:** https://ijr-jd.github.io/Seminario-2027/projects/codequest-rpg/skills.html

## Skill families

**Warrior (Guardian class):** Triple Slash (three consecutive timed sword strokes), Cyclone Blade (spinning attack), Earthbreaker (jumping overhead strike plus impact wave).

**Wizard (Mage class):** Fireball (charge, launch, impact), Frost Nova (expanding cold wave), Meteor Shower (three staggered projectiles).

**Scout:** Shadow Dash (evade and strike), Triple Arrow (three staggered shots), Afterimage Step (multi-direction evasive motion).

**All classes:** Quick Dash and Barrier Pulse.

Each class has a foundation and two branches. All nodes are available for exploration and completed previews are tracked locally. The studio uses a separate Three.js scene with articulated procedural characters and deterministic animation timelines. The player can change classes, replay or pause the current skill, adjust speed, scrub to a specific moment, orbit the camera and customize appearance. The timing panel displays actual keyframe, phase and impact values from `skill-motion.js`. The character shares the same stored colors and style as the movement adventure. Procedural rigs animate the torso, head, shoulders, elbows, hips, knees and cape. Impacts are scripted studio cues. The first 12 movement levels use their original interpreter.

## Learning progression

Chapter 01 remains unchanged: students program movement using only \`up = 1\`, \`right = 1\`, \`left = 1\`, \`down = 1\`. The Skill Studio is a separate demonstration of possible later chapters. The displayed function signatures are **future lesson examples**, not executable in the intro editor.

## Quality assurance

\`node scripts/qa-codequest.mjs\` validates the initial movement chapter.
\`node scripts/qa-codequest-skills.mjs\` validates studio source, navigation, skill availability, motion continuity, event timing and JavaScript syntax.

Three.js is imported from a CDN. Real-browser visual motion and mobile performance tests are still needed.
