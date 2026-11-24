# Seminario 2027 · Local development (CodeQuest V8.5)

This is the entire institutional static web project, not only the game. Node.js 22+ and npm are required; Git is recommended for development. No native compilation or database is needed to run CodeQuest. The executable distribution is a static browser build.

## Windows quick start

Install Git and Node.js LTS (22 or newer) from their official installers. In PowerShell:

```powershell
git clone https://github.com/IJR-JD/Seminario-2027.git
cd Seminario-2027
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:8765/Seminario-2027/ for the whole site or http://127.0.0.1:8765/Seminario-2027/projects/codequest-rpg/ for the game. Ctrl+C stops the server. Source changes are visible after browser refresh; Ctrl+F5 bypasses cached resources. The server binds only to loopback. Set `$env:PORT=8770` before starting to change the port. No administrator rights needed.

For a downloaded ZIP, extract it first. Double-click Start-Local.cmd or run `node scripts/local-server.mjs --dist` if the ZIP contains dist. With a prebuilt dist, neither npm install nor an Internet connection is required for CodeQuest. Node is still required to serve HTTP. Do not open HTML directly using file://.

## Build and test

```powershell
npm.cmd run build
npm.cmd start
# In a separate terminal, after stopping the server if desired:
npm.cmd test
npm.cmd run browser:install
npm.cmd run test:offline
npm.cmd run test:browser
```

The build copies the complete runtime site into dist, vendors Three.js 0.170.0 (including licence and addons), rewrites only the local build's Three.js URLs and generates build-manifest.json with commit, per-file SHA-256 hashes, sizes and media availability. Source remains compatible with GitHub Pages. Dev mode serves editable files and local Three.js without rebuilding. The existing production deploy remains separate. The browser suite exercises the actual WebGL world, all eight equipment options, 22 room layouts, columns, parkour, interiors, vehicles and progression. Offline QA blocks external requests and opens the actual compiled game. Tests save screenshots to qa-codequest. Chromium installation requires Internet once. Direct dependencies are pinned; npm generates package-lock.json at install.

## Assets and external dependencies

- CodeQuest models, rooms, textures, animation and sound/visual effects are generated or defined by repository source. No external 3D model library is necessary for CodeQuest. Three.js is included in dist.
- The entire curriculum, diagrams, Godot example projects, JavaScript, CSS, SQL schema and tests are included in the source. Godot examples can be opened in Godot 4 separately using each project.godot.
- Six original CAD MP4s are referenced by exact upstream commits. Run `npm.cmd run media:fetch` to download them into .local-media; then build. Successful downloads are copied to dist/vendor/media and used automatically. Download failures are explicit and existing remote URLs remain as fallback. No replacement videos are invented. Other upstream media not present in the original source remain unavailable.
- Python Sandbox and some theory exercises use Pyodide 0.27.7 and dynamic packages from the Internet. The package is not an entirely offline Python environment. External tutorials and links also require Internet.
- Supabase 2027 login is not activated in the source: the publishable key is intentionally empty. Guest functionality remains available. For authenticated testing, use an authorized separate development Supabase project, apply the provided SQL with review, and configure its allowed redirect to http://127.0.0.1:8765/Seminario-2027/. Do not commit private keys, real student data, or production credentials. No hosted backend or real student data is cloned.
- CodeQuest saves are browser localStorage on the current origin; online saves do not automatically transfer to localhost. Keep the same local port for persistent local saves.

## Main source map

| Path | Responsibility |
|---|---|
| index.html, assets/ | Institutional homepage |
| learning/ | Python theory, guided practice, sandbox, auth client |
| projects/ | CAD, data, AI and game learning paths |
| projects/codequest-rpg/world.js | Rooms, program execution and application UI |
| projects/codequest-rpg/overworld.mjs | Open world, movement, interaction and rendering |
| projects/codequest-rpg/island-*.mjs | World geometry, physics, avatars, vehicles, equipment and progression |
| projects/codequest-rpg/gear-wheel.mjs | Animated Tab equipment selector |
| projects/codequest-rpg/world.css | Game UI styles |
| projects/godot-examples/ | Editable native Godot examples |
| supabase/ | SQL schema and authentication/progress migration |
| scripts/ | Local build, server, QA and media tools |

For ongoing development, create a branch before edits, run npm test and relevant browser tests, then commit and push your branch. Do not commit dist, node_modules, test output or local media. The V9 landmark expansion is an unmerged experimental branch, not part of stable V8.5.

```powershell
git switch -c dev/my-change
git status
git add projects/codequest-rpg
git commit -m "Improve CodeQuest"
git push -u origin dev/my-change
```
