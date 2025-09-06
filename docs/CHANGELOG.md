# Changelog

All notable changes to this project are documented here.

## Unreleased

### Added
- Documented installation and run steps in README and development guide.
- Added Test Reports and UAT sections mapping URS to test specs in `docs/04-test.md`.
- Added architecture flowchart, module interaction sequence, and ERD/API tables to `docs/02-design.md` with references across docs.
- Expanded `docs/03-dev.md` with build/test/release commands and detailed CI/CD workflow.
- Introduced `release-and-tests.yml` for tag-driven builds with tiered testing and release behavior.
- Added [`jest.setup.js`](../jest.setup.js) to stub Canvas APIs in jsdom tests (supports T-1, T-3).

### Changed
- Overhauled `release-and-tests.yml` to parse tag phases via a meta job, build once, and run phase-specific tests and releases.
- Clarified documentation across requirements, design, development, and testing guides.
- Refined URS entries to center player or developer perspectives and remove implementation hints (URS-006, URS-012, URS-015, URS-016, URS-021, URS-022).
- Refined FR-030 to focus on observable NPC behavior and moved spawn timing, speed, and frame-count details to design specs (DS-10, DS-25, DS-27, DS-30).
- Refactored `update-version.mjs` to export `RELEASE_VERSION`, `BUILD_NUMBER`, and `GIT_SHA`, support CI env variables, and update HTML/manifest using a single source of truth.
- Ensured `update-version.mjs` injects globals through `version.global.js` and consolidates HTML replacements (DS-16, T-16).
- CI workflows run `node scripts/update-version.mjs` before tests and releases to keep `version.js`, `version.global.js`, `index.html`, and `manifest.json` in sync (DS-16, T-16).
- Test workflow derives the release version from `package.json` before updating version info and running tests (DS-16, T-16).
- Separated build metadata from the base version, introducing `window.__APP_BUILD_META__` and keeping `window.__APP_VERSION__` free of `+build` suffixes (DS-15, T-15).
- Clarified step naming in test workflow to highlight version.js and HTML/manifest updates (DS-16, T-16).

### Fixed
- Corrected release version derivation step in test workflow to use a multi-line bash block, preventing shell syntax errors (DS-16, T-16).
- Refactored `update-version.mjs` to generate `version.js` (exports only) and `version.global.js` (browser globals), resolving commit SHAs solely from environment variables and defaulting to `devsha` when absent (DS-16, T-16).

## v2.20.4 - 2025-10-11

### Fixed
- Updated documentation links to requirement and design specs.

## v2.20.3 - 2025-10-10

### Fixed
- Canvas resizes on visual viewport changes to keep dust effects aligned on iPhone Safari (DS-52, T-59).

## v2.20.2 - 2025-10-09

### Fixed
- Splash logo and home title now scale with the viewport to avoid layout issues on small screens (DS-39, DS-40, T-39, T-40).

## v2.20.1 - 2025-10-08

### Fixed
- Trunk NPC no longer disappears near red lights by ignoring pauses (DS-51, T-58).

## v2.20.0 - 2025-10-07

### Changed
- Trunk NPC shadow now offsets one tile upward for alignment (DS-44, T-57).

## v2.19.1 - 2025-10-06

### Changed
- Trunk NPC now draws two tiles lower with a wider shadow (DS-44, T-55, T-56).

## v2.19.0 - 2025-10-05

### Changed
- Trunk NPC now draws three tiles lower with a wider shadow (DS-44, T-55, T-56).

## v2.18.5 - 2025-10-04

### Changed
- Trunk NPC now renders 1.1× larger and one tile lower (DS-44, T-47).

## v2.18.4 - 2025-10-03

### Changed
- Trunk NPC now renders 1.2× larger and two tiles lower (DS-44, T-47).

## v2.18.3 - 2025-10-02

### Fixed
- Automatic NPC spawns now merge undefined option objects with defaults to prevent crashes (DS-50, T-54).

## v2.18.2 - 2025-10-02

### Fixed
- NPCs entering from the right no longer stick at the stage start; they are culled when touching the left edge (DS-49, T-53).
- NPCs spawning from the left stand on the ground when the camera is at the starting position (DS-49, T-53).

## v2.18.1 - 2025-10-01

### Fixed
- Developer NPC panel spawns NPCs with correct width to prevent stretching (DS-48, T-52).

### Changed
- Renamed documentation files to `docs/03-dev.md` and `docs/04-test.md`.

## v2.18.0 - 2025-09-30

### Added
- Developer mode NPC panel with NPC1 and NPC2 buttons to spawn OL and Trunk NPCs (DS-47, T-51).

## v2.17.0 - 2025-09-29

### Added
- Trunk NPC movement now spawns slide dust and draws above all characters (DS-45, DS-46, T-49, T-50).

## v2.16.4 - 2025-09-28

### Fixed
- Trunk NPC scaling now enables image smoothing so 1.25× zoom uses original sprite resolution (DS-44, T-48).

## v2.16.3 - 2025-09-27

### Changed
- Trunk NPC sprites now render 1.25× larger from their center for better visibility (DS-44, T-47).

## v2.16.2 - 2025-09-26

### Fixed
- Landing no longer clears Trunk NPC pass-through so they remain non-collidable (DS-44, T-46).

## v2.16.1 - 2025-09-25

### Fixed
- Trunk NPC walk animation renders and no longer collides with the player (DS-44, T-44, T-45).

## v2.16.0 - 2025-09-24

### Added
- Trunk NPC moves from left to right with move animation and no collisions (DS-44, T-44).

## v2.15.0 - 2025-09-23

### Added
- Student NPC idle animation plays during red-light waits (DS-43, T-43).

## v2.14.0 - 2025-09-22

### Added
- Officeman NPC idle animation plays during red-light waits (DS-42, T-42).

## v2.13.0 - 2025-09-21

### Added
- OL NPC idle animation plays during red-light waits (DS-41, T-41).

## v2.12.1 - 2025-09-20

### Fixed
- Splash screen disables pointer events and removes itself if the animation finished before initialization so the start page remains clickable (DS-40, T-40).

## v2.12.0 - 2025-09-19

### Added
- Intro splash screen fades in and out "HPC Games" before the start page (DS-40, T-40).
- Home screen title enlarged with bold styling for stronger impact (DS-39, T-39).

## v2.11.0 - 2025-09-18

### Added
- Stomping an NPC now spawns a brief star effect at the impact point for visual feedback (DS-38, T-38).

## v2.10.0 - 2025-09-17

### Changed
- Player collision box width now matches one tile while sprite width remains unchanged (DS-37, T-37).

## v2.9.2 - 2025-09-16

### Fixed
- Player idle sprite now narrows without reducing the collision box width (DS-37, T-37).

## v2.9.1 - 2025-09-15

### Changed
- NPC collision boxes now span one tile width for consistent player interactions (DS-36, T-36).

## v2.9.0 - 2025-09-14

### Changed
- Touch buttons are circular and pinned to the screen corners for easier reach (DS-35, T-35).

## v2.8.0 - 2025-09-13

### Added
- Design mode outlines collision boxes for all tiles, the player, and NPCs in green to aid level editing (DS-34, T-34).

## v2.7.3 - 2025-09-12

### Fixed
- Preloaded audio alongside sprites using `Promise.all` so sound effects and music are ready before gameplay (DS-11, DS-33, T-11, T-33).

## v2.7.2 - 2025-09-11

### Changed
- Elaborated SDS with asset preload flow, input queuing, friction, collision math, rendering cull pseudocode, and service worker/i18n details (DS-1–DS-33).

## v2.7.1 - 2025-09-10

### Changed
- Expanded SDS with detailed game-loop, physics, NPC, rendering, and PWA implementation notes (DS-1–DS-33).

## v2.7.0 - 2025-09-09

### Added
- Home screen displays a resource loading progress bar during asset preload (DS-33, T-33).

## v2.6.3 - 2025-09-08

### Fixed
- Traffic light tiles no longer have collision boxes, preventing characters from standing on them (DS-9, T-9).

## v2.6.2 - 2025-09-07

### Fixed
- NPC spawn height now derives from the player's base height, preventing sliding from shrinking NPCs (DS-32, T-32).

## v2.6.1 - 2025-09-06

### Changed
- Officeman sprite scale reduced from 1.5× to 1.25× to better match other characters (DS-31, T-31).

## v2.6.0 - 2025-09-05

### Added
- Officeman sprites now render 1.5× larger from their center without altering collision boxes (DS-31, T-31).

## v2.5.0 - 2025-09-04

### Added
- Added ICD section and detailed SAS/SDS in design document.
- Expanded design specifications and test plan to cover countdown timer, pedestrian traffic lights, NPC behavior, audio, stage configuration, a level editor, PWA support, and build versioning (DS-8–DS-15, T-8–T-15).
- Build script now handles full Semantic Versioning, including prerelease versions (DS-16, T-16).
- Background rendering uses device pixel ratio to stay sharp in full-screen mode (DS-17, T-17).
- Added language switching, player movement and slide dust, camera scroll threshold, fullscreen letterboxing, performance culling, and cross-browser compatibility to design specs and test plan (DS-18–DS-23, T-18–T-23).
- Added URS entries for coin collection feedback and audio control (URS-007–URS-008).
- Added URS entry for live score, stage label, and timer visibility during gameplay (URS-009).
- Added Officeman NPC with dedicated sprite set and medium walk speed between Student and OL (DS-30, T-30).

### Changed
- Renamed version sync script to `scripts/update-version.mjs` and updated references (DS-16, T-16).
- Restructured documentation: `01-requirement.md`, `02-design.md`, `03-dev.md`, and `04-test.md` replace previous files.
- Removed "Recent Changes" section from README.
- Clarified pedestrian traffic light behavior and NPC pass-through after the third stomp (DS-9–DS-10, T-9–T-10).
- Converted design specifications list into a table aligned with requirements and tests.
- Clarified UI architecture: `src/ui/index.js` handles HUD interactions while `hud.js` exposes only `showHUD` (DS-4).
- Removed outdated development server references to reflect static build workflow.
- Clarified build step to focus on version updates, removing asset bundling references (DS-16, T-15).
- CI documentation now highlights only Jest testing, removing the lint step (DS-24, T-24).
- Renamed requirement document to `docs/01-requirement.md`, rewrote URS to focus on player needs, and removed ICD section.
- Expanded URS with detailed scenarios and success criteria and linked UAT items to URS IDs.
- Moved level design mode requirement from URS to SRS and renumbered subsequent URS items.
- HUD requirement no longer references debug data; debug tools are consolidated under a developer-only requirement and SRS entry (URS-006, URS-011, FR-040, FR-043, DS-4, DS-28, T-4, T-28).

## v2.4.1 - 2025-09-03

### Fixed
- ICD documents the actual game state fields and removes nonexistent start/restart custom events (DS-29, T-29).

## v2.4.0 - 2025-09-03

### Added
- Developer toggle in settings reveals debug panel, log controls, and a level editor for developers and testers (DS-28, T-28).
## v2.3.1 - 2025-09-03

### Changed
- OL NPC walk speed increased while Student NPC walk speed decreased (DS-27, T-27).

## v2.3.0 - 2025-09-02

### Added
- Student NPC walk animation now uses 11 frames for smoother motion (DS-25, T-25).

## v2.2.1 - 2025-09-01

### Fixed
- OL and Student NPC walk animations now cycle through all sprite frames for smoother movement (DS-26, T-26).

## v2.2.0 - 2025-08-31

### Added
- Student NPC for Stage 1-1 with walk sprites for frames 0–8 and shared spawn logic with OL NPCs (DS-25, T-25).

## v2.1.2 - 2025-08-27

### Fixed
- Background regeneration now uses the canvas height to preserve full-resolution imagery in fullscreen mode (DS-17, T-17).

## v2.1.1 - 2025-08-27

### Fixed
- Letterboxing styles now apply when fullscreen is requested on the root container, allowing the canvas to resize (DS-21, T-21).

## v2.1.0 - 2025-08-26

### Changed
- Fullscreen now centers the stage with black bars and recalculates canvas size on `fullscreenchange` (DS-21, T-21).

## v2.0.0 - 2025-08-25

### Added
- Initial public release with orientation guard, slide cancellation at red lights, landscape fit height, HUD visibility helpers, start page defaults, UI styling and responsiveness, and OL NPC walk sprites (DS-1–DS-7, T-1–T-7)

## v1.5.163 - 2025-08-25

### Added
- Orientation guard for mobile portrait (DS-1, T-1)
- Slide cancellation and height restoration at red lights (DS-2, T-2)
- Canvas fit-to-height behavior in mobile landscape with unified UI layer (DS-3, T-3)
- HUD reveal helper that keeps debug panel hidden (DS-4, T-4)
- Start page with visible start button, pointer events, and correct title (DS-5, T-5)
- Comprehensive UI styling including responsive touch controls and clear/fail overlays (DS-6, T-6)
- OL NPC walk sprites 0–11 (DS-7, T-7)
