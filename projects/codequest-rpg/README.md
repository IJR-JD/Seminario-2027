# CodeQuest · World of Code — Seminario 2027

## Chapter 01 — Movement through variables

The interface emphasizes an expansive 3D world and a tall coding workspace. There are 12 increasingly complex missions with obstacles, collectible crystals (automatically picked up by walking across them), checkpoints, and a final destination.

**Student syntax is deliberately restricted to four directional variables:**

```text
up = 1
right = 1
left = 1
down = 1
```

Every line is executed immediately and in sequence, so repeating an assignment to a direction creates another movement. Values must be whole numbers between 0 and 12. From the world coordinate view, right increases X, left decreases X, up decreases Z, and down increases Z. Arithmetic expressions using +, -, *, / and ** can appear in values in later missions.

The introduction guide explains the interface, the coordinate system, and a generic syntax example. **No level supplies a completed route**, and its hint does not disclose a solution. Students must independently plan their route.

## Start / deployment

https://ijr-jd.github.io/Seminario-2027/projects/codequest-rpg/

The site also works on a local HTTP server once GitHub source is cloned, but current Three.js imports load from a CDN and therefore require an Internet connection. No student identity or official grade records are stored. Avatar appearance and chapter completion remain only in local browser storage.

## Validation

`node scripts/qa-codequest.mjs` tests source syntax, strict variable-only instruction parsing, arithmetic, hidden solutions, and BFS reachability of all twelve levels, including all crystals and checkpoints. The repository GitHub Pages workflow runs this check before deploying.

Full browser performance and usability testing remains separate from those automated source and path checks.
