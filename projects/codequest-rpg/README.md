# CodeQuest RPG — Seminario 2027

Interactive Three.js training arena integrated in the official Seminario 2027 repository.

- Open `projects/codequest-rpg/` on GitHub Pages.
- The character creator saves only non-sensitive customizations in this browser's localStorage.
- Sample commands: assignment, `move(direction, steps)`, `attack(power)`, `dodge(direction)`, `guard()`, `wait()`.
- This uses a **limited Python-like educational interpreter**, not a Python runtime. Input is parsed as instructions and is never evaluated with JavaScript eval.
- Three.js and OrbitControls are loaded from a public CDN. Internet is needed for the first page load; this browser version is not yet offline-vendored.
- Learning lab only: no Supabase account, grades, official completion or student identity data.
- Character movement, combat distance, hit animation and HUD are the initial v0.3 features; advanced enemy AI, attack telegraphs, audio, real character rigging and automated browser QA remain future work.

Link from **Guided Projects → Video Game Design**.