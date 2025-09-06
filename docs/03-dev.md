# Development Guide

## Dev Guide
 - Refer to `docs/02-design.md` for architecture diagrams, asset preload flow, input queue handling, game loop steps, and physics algorithms when implementing features.
 - Install dependencies with `npm install`.
 - Run locally by opening `index.html` in a browser or rebuilding version info and serving the directory with a static server (for example, `npm run build && npx serve .`). The project builds to static files, so no dedicated development server is required.
- Source code resides in `src/`; `main.js` and `hud.js` remain root-level entry points, while HUD logic lives in `src/ui/index.js` for modularity.
- Use `npm run build` to update version information before deployment.
- Developer mode is hidden by default. Toggle it in the settings gear to access the debug panel, log tools, and level editor controls (developers/testers only).
- When developer mode is on, an NPC panel appears with **NPC1** and **NPC2** buttons that call into `spawnNpc('ol')` and `spawnNpc('trunk')` for quick NPC generation during testing. These hooks compute NPC width using `player.baseH / 44` so sprites retain their normal aspect ratio.
- Design mode outlines collision boxes for all tiles, the player, and NPCs in green to assist with layout edits (DS-34).
- Style tests ensure circular touch controls remain pinned to the bottom screen corners (DS-35, T-35).
- The start screen exposes `startScreen.setProgress` to update a loading progress bar while assets load (DS-33, T-33).
- A `#splash` overlay animates the **HPC GAMES** logo on load, disables pointer events, scales the logo responsively, and removes itself if the animation already finished on initialization (DS-40).
- Home screen title styling lives in CSS under `#start-page .title` using responsive `clamp(32px, 12vw, 72px)` bold lettering with a drop shadow (DS-39).
- Student, Officeman, and OL NPC sprites are stored under `assets/sprites/Student`, `assets/sprites/officeman`, and `assets/sprites/OL`; add a loader in `src/sprites.js` and update spawn logic in `main.js` when introducing new NPC types. The Student and Officeman walk sequences include frames `walk_000`–`walk_010` for smooth motion, and spawn logic sets walk speeds to `1` for Student, `1.5` for Officeman, and `2` for OL for variety. OL and Student include `idle_000`–`idle_012` sequences and Officeman includes `idle_000`–`idle_018`, all playing at 6 FPS while red lights pause the NPCs.
 - Trunk sprites live in `assets/sprites/Trunk`; `loadTrunkNpcSprite` exposes a `walk` animation from `Move_000`–`Move_012`. Spawns originate from the left, move right at fixed speed `3`, render two tiles lower with double `baseH` and a wider shadow offset one `TILE` upward, scale 1.1× from their center with image smoothing to preserve sprite detail, ignore red lights so the walk animation never pauses, and pass `passThrough`/`offsetY: TILE * 2`/`shadowOffsetY: -TILE`/`ignoreRedLight: true` options to `createNpc` to avoid collisions. The main loop reapplies `passThrough` each frame so landing logic never makes trunks solid, spawns slide dust roughly every 200 ms, and draws trunks after the player so they remain visible.
- Officeman sprites render at **1.25×** scale from their center while the collision box dimensions stay fixed.
- NPC spawn size derives from the player's `baseH`, ensuring sliding does not change NPC dimensions (DS-32, T-32).
- NPC collision boxes use a fixed one-tile width for consistent player interaction (DS-36, T-36).
- NPCs touching the left camera boundary are removed, and left-side spawns clamp to the first tile to stay grounded (DS-49).
- Automatic spawns merge NPC options with an empty object before appending boundary flags to avoid undefined spread errors (DS-50).
- Player idle animation narrows the sprite via `renderW` while keeping the collision width at one tile (DS-37, T-37).
- Stomping an NPC invokes `triggerStompEffect` to briefly show a star at the impact point (DS-38, T-38).
- Traffic light tiles are fully pass-through; edits to physics should preserve their non-solid behavior (DS-9, T-9).
- Walking animations consume all provided frames; `drawNpc` uses the animation's frame count as its FPS.
- Canvas dimensions are recalculated on `fullscreenchange` and `visualViewport.resize` to maintain centered letterboxing and correct CSS scaling, and CSS targets `#game-root:fullscreen #stage` to handle fullscreen requests on the container.
- Background images are regenerated with the canvas's CSS height during DPR adjustments to avoid upscaling in fullscreen.

### Build, Test, and Release

- `npm run build` regenerates [`../version.js`](../version.js), [`../version.global.js`](../version.global.js), and cache-busting query strings. The script reads `RELEASE_VERSION` (stripping an optional `v`), `BUILD_NUMBER`/`GITHUB_RUN_NUMBER`, and a short `GIT_SHA` from `GIT_SHA`/`GITHUB_SHA` (falling back to `devsha`) before falling back to `package.json`. `version.js` exports these constants, while `version.global.js` imports them, sets `window.__APP_VERSION__ = v<RELEASE_VERSION>`, and assembles `window.__APP_BUILD_META__ = build.<run>.<sha7>` from any present metadata. Run it before serving locally and again when preparing a prerelease or release tag. `index.html` loads `version.global.js` via a `<script type="module">` so its exports remain importable.
- CI pipelines derive the release version from `package.json` on pull requests and branch pushes, or from the tag name on tag pushes, then call `node scripts/update-version.mjs` with `github.run_number` and `github.sha` to refresh `version.js`, `index.html`, and `manifest.json` before building or testing.
- `npm test` runs the Jest suite under jsdom with a stubbed Canvas context from [`jest.setup.js`](../jest.setup.js). Execute it before pushing commits; the CI pipeline runs the same command on each push and pull request.
- After updating the [changelog](CHANGELOG.md) on `main`, create a version tag (for example, `git tag v2.20.5`) and push it with `git push origin <tag>` to start the release workflow.

## Coding Standard
- Prefer ES modules and `const`/`let` declarations; avoid global variables except for the exported `__APP_VERSION__` and `__APP_BUILD_META__`.
- Follow a 2‑space indentation style and end files with a newline.
- Name files in `kebab-case` and keep functions pure when practical.

## CI/CD
- [`version.js`](../version.js) remains the single source of truth for the application version. The build emits `RELEASE_VERSION`, `BUILD_NUMBER`, and the short `GIT_SHA`; [`version.global.js`](../version.global.js) consumes these exports to set `window.__APP_VERSION__ = v<RELEASE_VERSION>` and `window.__APP_BUILD_META__ = build.<run>.<sha7>` when metadata is present. CI populates these environment variables so modules import version info instead of hardcoding strings.
- Update [CHANGELOG.md](CHANGELOG.md) on every merge to `main`. When the changelog entry is ready, create a tag (`vX.Y.Z`, `vX.Y.Z-rc.N`, etc.) and push it with `git push origin <tag>` so GitHub Actions can run the release jobs.
- GitHub Actions triggers:
  - **Push / Pull Request:** checkout, install dependencies, derive the release version from `package.json`, update version info, and run `npm test`.
  - **Tag Push** (see `.github/workflows/release-and-tests.yml`): a meta job parses the tag to derive the phase (`alpha`, `beta`, `rc`, or `stable`) while the build job refreshes version info using the tag, builds the game, zips the output, and uploads artifacts. Subsequent jobs run:
    - `alpha` – the integration suite before artifact upload.
    - `beta` – the UAT/regression suite before artifact upload.
    - `rc` – the UAT/regression suite, artifact upload, and a prerelease.
    - `stable` – the UAT/regression suite, artifact upload, and a full GitHub Release.
  - Release jobs run with `concurrency: release-${{ github.ref_name }}` to cancel overlapping builds.
