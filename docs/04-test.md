# Test Plan

## Test Plan
Each design specification point in `docs/02-design.md` is verified by an automated or manual test. The document now includes architecture and sequence diagrams alongside SDS details of tick order, asset preload sequence, input queuing, physics formulas, NPC state machines, and responsive splash/title styling so tests can assert against precise behavior. Jest is used for unit tests and GitHub Actions runs them on every push, with a jsdom environment and a minimal Canvas stub provided by [`jest.setup.js`](../jest.setup.js).

Tag-based releases use `.github/workflows/release-and-tests.yml` to run tiered suites: `alpha` tags trigger integration tests, while `beta`, `rc`, and stable tags run UAT and regression tests before publishing artifacts or releases.

## Test Specifications
### T-1: Orientation guard overlay
- **Design Spec**: DS-1
- **Test File**: `orientation-guard.test.js`
- **Description**: verifies overlay activation and canvas resize on orientation change.

### T-2: Slide cancellation at red light
- **Design Spec**: DS-2
- **Test File**: `redLightSlide.test.js`
- **Description**: ensures exiting a slide restores player height when a red light cancels the slide.

### T-3: Landscape fit height
- **Design Spec**: DS-3
- **Test File**: `landscape-fit-height.test.js`
- **Description**: fits canvas to viewport in mobile landscape and restores styles otherwise.

### T-4: HUD visibility
- **Design Spec**: DS-4
- **Test File**: `hud.test.js`
- **Description**: confirms `showHUD` displays HUD elements while keeping the debug panel hidden.

### T-5: Start page defaults
- **Design Spec**: DS-5
- **Test File**: `start-page.test.js`
- **Description**: checks start button visibility, pointer events, and correct page title.

### T-6: UI styling and responsiveness
- **Design Spec**: DS-6
- **Test File**: `style.test.js`
- **Description**: validates CSS rules for stage limits, touch controls, clear/fail overlays, and timer animation.

### T-7: OL NPC walk sprites
- **Design Spec**: DS-7
- **Test File**: `ol-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–11 exist.

### T-8: Countdown timer
- **Design Spec**: DS-8
- **Test**: Manual
- **Description**: observe timer flash during final 10 seconds and verify fail screen on expiration.

### T-9: Pedestrian traffic lights
- **Design Spec**: DS-9
- **Test**: Manual
- **Description**: confirm lights cycle 3s green → 2s blink → 4s red, nearby characters pause with dialog bubbles, and traffic lights provide no surface to stand on.

### T-10: NPC behavior
- **Design Spec**: DS-10
- **Test**: Manual
- **Description**: verify spawn intervals, stomping bounce, side collision knockback, and pass-through after the third stomp.

### T-11: Audio
- **Design Spec**: DS-11
- **Test**: Manual
- **Description**: verify jump, slide, clear, coin, and fail sounds play immediately at game start, BGM begins after interaction, and the HUD mute toggle works.

### T-12: Stage configuration
- **Design Spec**: DS-12
- **Test**: Manual
- **Description**: edit `assets/objects.custom.js` and ensure defined objects load with correct patterns.

### T-13: Level design mode
- **Design Spec**: DS-13
- **Test**: Manual
- **Description**: enable design mode, move objects, rotate with Q, add blocks, toggle transparency, and export layout.

### T-14: Progressive Web App support
- **Design Spec**: DS-14
- **Test**: Manual
- **Description**: install the app on a mobile device and verify full-screen launch.

### T-15: Versioning build
- **Design Spec**: DS-15
- **Test**: Manual (`npm run build`)
- **Description**: running the build generates `version.js`/`version.global.js` and updates HTML query parameters.

### T-16: Semantic version handling
- **Design Spec**: DS-16
- **Test File**: `update-version.test.js`
- **Description**: prerelease versions update HTML parameters, `version.js`/`version.global.js`, and `manifest.json`.

### T-17: High-resolution background
- **Design Spec**: DS-17
- **Test File**: `background.test.js`
- **Description**: verifies background tiles render at the correct logical size when scaled by device pixel ratio and CSS scaling factors.

### T-18: Language switching
- **Design Spec**: DS-18
- **Test**: Manual
- **Description**: change language in settings and confirm HUD text and dialog bubbles update.

### T-19: Player movement and slide dust
- **Design Spec**: DS-19
- **Test**: Manual
- **Description**: move left/right, jump, and slide; verify dust effect triggers on slide.

### T-20: Camera scroll threshold
- **Design Spec**: DS-20
- **Test**: Manual
- **Description**: run right until the camera begins scrolling once crossing 60 % of the viewport.

### T-21: Fullscreen letterboxing
- **Design Spec**: DS-21
- **Test File**: `src/ui/index.test.js`
- **Description**: toggles fullscreen, verifies 16:9 letterboxing, ensures `fullscreenchange` triggers canvas resize, and confirms `#game-root:fullscreen #stage` styles apply.

### T-22: Performance culling
- **Design Spec**: DS-22
- **Test**: Manual
- **Description**: monitor frame rate with dev tools and ensure off-screen objects are not rendered.

### T-23: Cross-browser compatibility
- **Design Spec**: DS-23
- **Test**: Manual
- **Description**: verify functionality on latest Chrome, Safari, Firefox, and Edge with responsive touch controls.

### T-24: Continuous integration tests
- **Design Spec**: DS-24
- **Test File**: `.github/workflows/test.yml`
- **Description**: ensures GitHub Actions runs `npm test` on pushes and pull requests.

### T-25: Student NPC walk sprites
- **Design Spec**: DS-25
- **Test File**: `student-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–10 exist.

### T-26: NPC walk animation frame usage
- **Design Spec**: DS-26
- **Test File**: `src/render.test.js`
- **Description**: verifies OL and Student walk animations iterate through all sprite frames within one second for smooth motion.

### T-27: NPC speed differentiation
- **Design Spec**: DS-27
- **Test File**: `src/main.integration.test.js`
- **Description**: confirms OL NPC walks fastest, Officeman NPC walks at a medium pace, and the Student NPC walks more slowly.

### T-28: Developer switch
- **Design Spec**: DS-28
- **Test File**: `src/ui/index.test.js`
- **Description**: toggling developer mode shows or hides the debug panel, log controls, and level editor controls for developers and testers.

### T-29: Game state fields
- **Design Spec**: DS-29
- **Test File**: `src/game/state.test.js`
- **Description**: `createGameState` exposes level, coins, lights, player, camera, and npcs without score or time properties.

### T-30: Officeman NPC walk sprites
- **Design Spec**: DS-30
- **Test File**: `officeman-walk-sprites.test.js`
- **Description**: ensures sprite files for walk animation frames 0–10 exist.

### T-31: Officeman sprite scaling
- **Design Spec**: DS-31
- **Test File**: `src/render.test.js`
- **Description**: verifies Officeman NPC sprites draw 1.25× larger from their center while hitboxes remain unchanged.

### T-32: NPC spawn size during player slide
- **Design Spec**: DS-32
- **Test File**: `src/main.integration.test.js`
- **Description**: ensures NPCs spawn at normal size even when the player is sliding.

### T-33: Loading progress bar
- **Design Spec**: DS-33
- **Test File**: `src/ui/index.test.js`
- **Description**: verifies the start screen progress bar updates and hides after loading completes.

### T-34: Design mode collision boxes
- **Design Spec**: DS-34
- **Test File**: `src/render.test.js`
- **Description**: enabling design mode outlines collision boxes for tiles, the player, and NPCs in green.

### T-35: Circular touch controls pinned to corners
- **Design Spec**: DS-35
- **Test File**: `style.test.js`
- **Description**: validates that touch buttons are circular and `#touch-left`/`#touch-right` are anchored to the bottom left and right edges.

### T-36: NPC collision box width
- **Design Spec**: DS-36
- **Test File**: `npc.test.js`
- **Description**: asserts that NPC collision boxes are one tile wide and centered on the NPC position.

### T-37: Idle sprite width rendering
- **Design Spec**: DS-37
- **Test File**: `src/game/width.test.js`
- **Description**: verifies the player's sprite width shrinks when idle while the collision box width remains one tile wide.

### T-38: NPC stomp star effect
- **Design Spec**: DS-38
- **Test Files**: `src/ui/index.test.js`, `src/main.integration.test.js`
- **Description**: calling `triggerStompEffect` positions a star at the impact point and stomping an NPC invokes it once.

### T-39: Home title styling
- **Design Spec**: DS-39
- **Test File**: `start-title-style.test.js`
- **Description**: verifies `#start-page .title` uses `clamp(32px, 12vw, 72px)` with a drop shadow so the font scales to the viewport.

### T-40: Intro splash screen
- **Design Spec**: DS-40
- **Test File**: `splash-screen.test.js`
- **Description**: ensures the HPC GAMES splash overlay exists with black background, fade animation, pointer events disabled, and a logo font size that scales with the viewport.

### T-41: OL NPC idle sprites
- **Design Spec**: DS-41
- **Test File**: `ol-idle-sprites.test.js`
- **Description**: verifies `idle_000`–`idle_012` images exist for OL NPC idle animation.

### T-42: Officeman NPC idle sprites
- **Design Spec**: DS-42
- **Test File**: `officeman-idle-sprites.test.js`
- **Description**: verifies `idle_000`–`idle_018` images exist for Officeman NPC idle animation.

### T-43: Student NPC idle sprites
- **Design Spec**: DS-43
- **Test File**: `student-idle-sprites.test.js`
- **Description**: verifies `idle_000`–`idle_012` images exist for Student NPC idle animation.

### T-44: Trunk NPC move sprites
- **Design Spec**: DS-44
- **Test File**: `trunk-move-sprites.test.js`
- **Description**: ensures `Move_000`–`Move_012` images exist for Trunk NPC movement.

### T-45: Trunk NPC pass-through
- **Design Spec**: DS-44
- **Test File**: `src/npc.test.js`
- **Description**: verifies `createNpc` sets `passThrough`, letting the player pass without collision.

### T-46: Trunk NPC pass-through persists after landing
- **Design Spec**: DS-44
- **Test File**: `src/main.integration.test.js`
- **Description**: ensures landing logic does not clear `passThrough` on Trunk NPCs.

### T-47: Trunk NPC scales 1.1× from center
- **Design Spec**: DS-44
- **Test File**: `src/render.test.js`
- **Description**: verifies trunk sprites render 1.1× larger from their centers without shifting collision boxes.

### T-48: Trunk NPC smoothing
- **Design Spec**: DS-44
- **Test File**: `src/render.test.js`
- **Description**: ensures trunk drawing enables image smoothing to preserve detail when scaled.

### T-49: Trunk dust effect
- **Design Spec**: DS-45
- **Test File**: `src/main.integration.test.js`
- **Description**: confirms trunk NPCs trigger slide-like dust while moving.

### T-50: Trunk rendering order
- **Design Spec**: DS-46
- **Test File**: `src/render.test.js`
- **Description**: verifies trunks render after the player and other NPCs so they remain visible.

### T-51: Developer NPC panel
- **Design Spec**: DS-47
- **Test File**: `src/ui/index.test.js`
- **Description**: clicking **NPC1** and **NPC2** buttons calls `spawnNpc('ol')` and `spawnNpc('trunk')` when developer mode is enabled.

### T-52: Developer NPC width
- **Design Spec**: DS-48
- **Test File**: `src/main.integration.test.js`
- **Description**: spawning an NPC via the developer panel uses `player.baseH / 44` to keep sprites from stretching.

### T-53: NPC culls at left boundary
- **Design Spec**: DS-49
- **Test File**: `src/npc.test.js`
- **Description**: ensures an NPC at the left edge with the camera at 0 is considered off-screen.

### T-54: Safe NPC spawn options
- **Design Spec**: DS-50
- **Test File**: `src/npc.test.js`
- **Description**: merging undefined NPC option objects before adding flags does not throw.

### T-55: Trunk offset two tiles lower
- **Design Spec**: DS-44
- **Test File**: `src/main.integration.test.js`
- **Description**: spawning a trunk sets `offsetY` to `TILE * 2` so it renders two tiles lower.

### T-56: Trunk shadow width
- **Design Spec**: DS-44
- **Test File**: `src/render.test.js`
- **Description**: verifies trunk shadows draw at one-third of the sprite width.

### T-57: Trunk shadow upward offset
- **Design Spec**: DS-44
- **Test File**: `src/render.test.js`
- **Description**: verifies trunk shadows are drawn one `TILE` higher than their `offsetY`.

### T-58: Trunk ignores red lights
- **Design Spec**: DS-51
- **Test File**: `src/game/physics.test.js`
- **Description**: verifies `ignoreRedLight` prevents Trunk NPCs from pausing or hiding at red lights.

### T-59: Visual viewport resize rescales canvas
- **Design Spec**: DS-52
- **Test File**: `src/main.integration.test.js`
- **Description**: dispatching `visualViewport.resize` updates CSS scale factors so effects remain aligned when mobile browser chrome hides.

## Test Reports
- Automated: `npm test` (42 suites, 232 tests) verifies **T-1**–**T-59** (see [RTM](./01-requirement.md#rtm)) and passes on Node 18.
- Coverage: `npm test -- --coverage` reports **84 % statements**, **76 % branches**, **84 % functions**, **88 % lines**.
- Manual: Feature checks for **T-8**, **T-9**, **T-10**, **T-14**, **T-18**, **T-19**, **T-21**–**T-23**, and **T-44**–**T-59** were executed on desktop Chrome; all passed.

## UAT
URS definitions are in [docs/01-requirement.md#urs](./01-requirement.md#urs); test IDs correspond to the [RTM](./01-requirement.md#rtm).
- **URS-001**: Start screen and language switch work before play (**T-5**, **T-18**).
- **URS-002**: Movement and stomping respond immediately (**T-19**, **T-10**).
- **URS-003**: Traffic lights and NPC timing create obstacles (**T-9**, **T-10**).
- **URS-004**: Countdown and clear/fail screens appear with restart (**T-8**, **T-6**).
- **URS-005**: Fullscreen and offline play function on mobile and desktop (**T-21**, **T-14**).
- **URS-006**: HUD, touch controls, and rotate prompt display as expected (**T-4**, **T-1**, **T-35**).
- **URS-007**: Coins disappear with score increase and sound effect (`src/game/physics.test.js`, **T-11**).
- **URS-008**: Action sounds play and BGM toggles mute/unmute (**T-11**).
- **URS-009**: HUD shows live score, stage, and timer (**T-4**).
- **URS-010**: Settings gear toggles developer mode (**T-28**).
- **URS-011**: Debug panel, log controls, and level editor appear only in developer mode (**T-28**, **T-51**).
- **URS-012**: Officeman NPCs render larger without altering collisions (**T-31**).
- **URS-013**: NPCs spawn at normal size even during player slides (**T-32**).
- **URS-014**: Loading bar fills before START button appears (**T-33**).
- **URS-015**: Design mode outlines collision boxes for objects and characters (**T-34**).
- **URS-016**: Idle state leaves collision box unchanged (**T-37**).
- **URS-017**: Stomping an NPC triggers a star effect (**T-38**).
- **URS-018**: Home screen title scales and remains readable (**T-39**).
- **URS-019**: HPC Games splash displays correctly before the home screen (**T-40**).
- **URS-020**: NPCs animate when waiting at red lights (**T-41**, **T-42**, **T-43**).
- **URS-021**: Trunk passes through the player, raises dust, and ignores red lights (**T-44–T-58**).
- **URS-022**: Developer NPC panel spawns OL and Trunk via buttons (**T-51**).
- **URS-023**: Developer-spawned NPCs maintain normal width (**T-52**).
- **URS-024**: NPCs exit cleanly at the left edge and left spawns stand on the ground (**T-53**).
