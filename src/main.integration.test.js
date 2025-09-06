import { RELEASE_VERSION } from '../version.js';
import { TILE, COLL_TILE, resolveCollisions, findGroundY } from './game/physics.js';
import { BASE_W, COLL_W } from './game/width.js';
import { SPAWN_X, SPAWN_Y, Y_OFFSET } from './game/state.js';
import { createNpc } from './npc.js';
import { enterSlide } from './game/slide.js';

const JUMP_VEL = -17.8; // mirror JUMP_VEL in main.js

async function loadGame() {
  document.body.innerHTML = '<div id="stage"><canvas id="game"></canvas><div id="hud"><div id="stage-clear"><button id="btn-restart"></button></div><div id="stage-fail"><button id="btn-restart-fail"></button></div></div></div>';
  const canvas = document.getElementById('game');
  const ctx = { setTransform: jest.fn() };
  canvas.getContext = () => ctx;
  Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
  canvas.getBoundingClientRect = () => ({ width: 960, height: 540, left: 0, top: 0 });
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 960 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 540 });
  Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 960 });
  Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 540 });
  window.__APP_VERSION__ = `v${RELEASE_VERSION}`;
  global.requestAnimationFrame = jest.fn();
  Object.defineProperty(document, 'fullscreenElement', { writable: true, configurable: true, value: null });

  const scoreEl = {
    _text: '',
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
  };
  const timerEl = document.createElement('span');

  const audio = {
    loadSounds: jest.fn(() => Promise.resolve()),
    play: jest.fn(),
    playMusic: jest.fn(),
    toggleMusic: jest.fn(),
    resumeAudio: jest.fn(() => Promise.resolve()),
  };
  jest.doMock('../src/audio.js', () => audio);

  jest.doMock('../src/sprites.js', () => ({
      loadPlayerSprites: () => Promise.resolve(),
      loadTrafficLightSprites: () => Promise.resolve({}),
      loadNpcSprite: () => Promise.resolve({}),
      loadOlNpcSprite: () => Promise.resolve({}),
      loadStudentNpcSprite: () => Promise.resolve({}),
      loadOfficemanNpcSprite: () => Promise.resolve({}),
      loadTrunkNpcSprite: () => Promise.resolve({}),
    }));

  let startCallback;
  let uiObj;
  jest.doMock('../src/ui/index.js', () => ({
    initUI: () => {
      uiObj = {
        Logger: { info: jest.fn(), debug: jest.fn() },
        dbg: {},
        scoreEl,
        timerEl,
        triggerClearEffect: jest.fn(),
        triggerSlideEffect: jest.fn(),
        triggerStompEffect: jest.fn(),
        triggerFailEffect: jest.fn(),
        triggerStartEffect: jest.fn(),
        showStageClear: jest.fn(),
        showStageFail: jest.fn(),
        hideStageOverlays: jest.fn(),
        startScreen: { setStatus: jest.fn(), showStart: jest.fn((cb) => { startCallback = cb; }), showError: jest.fn(), setProgress: jest.fn() },
      };
      return uiObj;
    },
  }));

  await import('../main.js');
  await new Promise((r) => setTimeout(r, 0));
  return { hooks: window.__testHooks, scoreEl, timerEl, audio, startCallback, canvas, ctx, ui: uiObj };
}

describe('canvas scaling', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('resizeGameCanvas uses devicePixelRatio and client size', async () => {
    const { canvas, ctx } = await loadGame();
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 960 });
    Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 540 });
    window.__resizeGameCanvas();
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    expect(canvas.dataset.cssScaleX).toBe('1');
    expect(canvas.dataset.cssScaleY).toBe('1');
    expect(ctx.setTransform).toHaveBeenLastCalledWith(2, 0, 0, 2, 0, 0);
  });

  test('visualViewport resize updates css scale factors', async () => {
    let listener;
    window.visualViewport = {
      addEventListener: jest.fn((evt, cb) => {
        if (evt === 'resize') listener = cb;
      }),
    };
    const { canvas } = await loadGame();
    expect(window.visualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    canvas.getBoundingClientRect = () => ({ width: 960, height: 600, left: 0, top: 0 });
    Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 600 });
    listener();
    expect(parseFloat(canvas.dataset.cssScaleY)).toBeCloseTo(600 / 540);
    delete window.visualViewport;
  });
});

describe('audio loading', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('audio preloads before start and music plays on interaction', async () => {
    const { audio, startCallback } = await loadGame();
    expect(audio.loadSounds).toHaveBeenCalledTimes(1);
    expect(audio.playMusic).not.toHaveBeenCalled();
    startCallback();
    await Promise.resolve();
    expect(audio.resumeAudio).toHaveBeenCalled();
    expect(audio.playMusic).toHaveBeenCalled();
    expect(audio.loadSounds).toHaveBeenCalledTimes(1);
  });
});

describe('restartStage integration', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('resets state after clear', async () => {
    const { hooks, scoreEl, timerEl } = await loadGame();
    const state = hooks.getState();
    state.player.x = 500;
    state.player.y = 200;
    state.player.stunnedMs = 123;
    hooks.setScore(50);
    hooks.setTimeLeft(2000);
    hooks.setStageCleared(true);

    hooks.restartStage();

    expect(state.player.x).toBe(SPAWN_X);
    expect(state.player.y).toBe(SPAWN_Y);
    expect(state.player.w).toBe(COLL_W);
    expect(state.player.h).toBe(120);
    expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
    expect(state.player.stunnedMs).toBe(0);
    expect(state.level[state.LEVEL_H - 5][0]).toBe(1);
    expect(state.level[state.LEVEL_H - 4][0]).toBe(1);
    expect(hooks.getScore()).toBe(0);
    expect(hooks.getTimeLeft()).toBe(60000);
    expect(scoreEl.textContent).toBe('0');
    expect(timerEl.textContent).toBe('60');
    expect(hooks.getStageCleared()).toBe(false);
    expect(hooks.getStageFailed()).toBe(false);
  });

  test('resets state after fail', async () => {
    const { hooks, scoreEl, timerEl } = await loadGame();
    const state = hooks.getState();
    state.player.x = 400;
    state.player.y = 100;
    state.player.stunnedMs = 123;
    hooks.setScore(30);
    hooks.setTimeLeft(1000);
    hooks.setStageFailed(true);

    hooks.restartStage();

    expect(state.player.x).toBe(SPAWN_X);
    expect(state.player.y).toBe(SPAWN_Y);
    expect(state.player.w).toBe(COLL_W);
    expect(state.player.h).toBe(120);
    expect(state.player.shadowY).toBe(state.player.y + state.player.h / 2);
    expect(state.player.stunnedMs).toBe(0);
    expect(state.level[state.LEVEL_H - 5][0]).toBe(1);
    expect(state.level[state.LEVEL_H - 4][0]).toBe(1);
    expect(hooks.getScore()).toBe(0);
    expect(hooks.getTimeLeft()).toBe(60000);
    expect(scoreEl.textContent).toBe('0');
    expect(timerEl.textContent).toBe('60');
    expect(hooks.getStageCleared()).toBe(false);
    expect(hooks.getStageFailed()).toBe(false);
  });

  test('clears npcs and spawn timer on restart', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    state.npcs.push(createNpc(100, 0, 10, 10, null));
    hooks.setNpcSpawnTimer(5000);
    hooks.restartStage();
    expect(state.npcs.length).toBe(0);
    expect(hooks.getNpcSpawnTimer()).toBe(0);
  });

  test('btn-restart triggers restartStage', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    state.player.x = 123;
    document.getElementById('btn-restart').click();
    expect(state.player.x).toBe(SPAWN_X);
  });

  test('btn-restart-fail triggers restartStage', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    state.player.x = 456;
    document.getElementById('btn-restart-fail').click();
    expect(state.player.x).toBe(SPAWN_X);
  });
});

describe('timer low-time class', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('adds low-time class at 10s threshold', async () => {
    const { hooks, timerEl } = await loadGame();
    hooks.setTimeLeft(11000);
    expect(timerEl.classList.contains('low-time')).toBe(false);
    hooks.setTimeLeft(10000);
    expect(timerEl.classList.contains('low-time')).toBe(true);
    hooks.setTimeLeft(12000);
    expect(timerEl.classList.contains('low-time')).toBe(false);
  });
});

describe('npc spawn', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('OL npc spawns facing right', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 0;
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs[0].facing).toBe(1);
  });

  test('OL npc spawns larger than player', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 0;
    hooks.runUpdate(1);
    Math.random = origRandom;
    const npc = state.npcs[0];
    expect(npc.h).toBeCloseTo(state.player.h * 6 / 5);
    expect(npc.w).toBeCloseTo(48 * (state.player.h / 44) * 6 / 5);
  });

  test('Student npc spawns facing right', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    const seq = [0, 0.6];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs[0].type).toBe('student');
    expect(state.npcs[0].facing).toBe(1);
  });

  test('Officeman npc spawns facing right', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    const seq = [0, 0.9];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs[0].type).toBe('officeman');
    expect(state.npcs[0].facing).toBe(1);
  });

  test('Student npc spawns larger than player', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    const seq = [0, 0.6];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    Math.random = origRandom;
    const npc = state.npcs[0];
    expect(npc.h).toBeCloseTo(state.player.h * 6 / 5);
    expect(npc.w).toBeCloseTo(48 * (state.player.h / 44) * 6 / 5);
  });

  test('OL npc uses faster walk speed', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 0; // force OL type
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs[0].vx).toBeCloseTo(-2);
  });

  test('Student npc uses slower walk speed', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    const seq = [0, 0.6];
    Math.random = () => seq.shift(); // force Student type
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs[0].vx).toBeCloseTo(-1);
  });

  test('Officeman npc uses medium walk speed', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    const seq = [0, 0.9];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs[0].vx).toBeCloseTo(-1.5);
  });

  test('does not spawn student npc of same type when one exists', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    let seq = [0, 0.6];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    hooks.setNpcSpawnTimer(0);
    seq = [0, 0.6];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs.length).toBe(1);
    expect(state.npcs[0].type).toBe('student');
  });

  test('does not spawn officeman npc of same type when one exists', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    let seq = [0, 0.9];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    hooks.setNpcSpawnTimer(0);
    seq = [0, 0.9];
    Math.random = () => seq.shift();
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs.length).toBe(1);
    expect(state.npcs[0].type).toBe('officeman');
  });

  test('does not spawn npc of same type when one exists', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 0; // force OL type
    hooks.runUpdate(1);
    hooks.setNpcSpawnTimer(0);
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(state.npcs.length).toBe(1);
    expect(state.npcs[0].type).toBe('ol');
  });

  test('npc spawns at ground height on default terrain', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const { viewW } = window.__getLogicalViewSize();
    const spawnX = state.camera.x + viewW + state.player.w;
    const expectedY = findGroundY(
      state.collisions,
      spawnX,
      state.collisions.length * COLL_TILE - 1,
      true,
    );
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 1;
    hooks.runUpdate(0);
    Math.random = origRandom;
    const npc = state.npcs[0];
    expect(npc.y).toBeCloseTo(expectedY - npc.h / 2, 1);
  });

  test('npc spawns at raised ground height', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const { viewW } = window.__getLogicalViewSize();
    const spawnX = state.camera.x + viewW + state.player.w;
    const tx = Math.floor(spawnX / COLL_TILE);
    for (let dx = -2; dx <= 2; dx++) {
      for (let y = 0; y < state.collisions.length; y++) state.collisions[y][tx + dx] = 0;
      state.collisions[10][tx + dx] = 1;
      state.collisions[11][tx + dx] = 1;
    }
    const expectedY = findGroundY(
      state.collisions,
      spawnX,
      state.collisions.length * COLL_TILE - 1,
      true,
    );
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 1;
    hooks.runUpdate(0);
    Math.random = origRandom;
    const npc = state.npcs[0];
    expect(npc.y).toBeCloseTo(expectedY - npc.h / 2, 1);
  });

  test('npc spawns at normal size while player sliding', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const baseH = state.player.h;
    enterSlide(state.player);
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 1;
    hooks.runUpdate(0);
    Math.random = origRandom;
    const npc = state.npcs[0];
    expect(npc.h).toBeCloseTo(baseH, 1);
  });

  test('developer npc panel spawns correct width', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    hooks.spawnNpc('ol');
    const npc = state.npcs[0];
    const expectedW = state.player.baseH * (48 / 44) * (6 / 5);
    expect(npc.w).toBeCloseTo(expectedW, 1);
  });

  test('npc spawn timer respects new minimum interval', async () => {
    const { hooks } = await loadGame();
    hooks.setNpcSpawnTimer(0);
    const origRandom = Math.random;
    Math.random = () => 0;
    hooks.runUpdate(1);
    Math.random = origRandom;
    expect(hooks.getNpcSpawnTimer()).toBeGreaterThanOrEqual(4000);
  });
});

describe('shadowY behavior', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('moves to top of tall block when airborne', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const { level, player } = state;
    const columnX = 20;
    for (let y = 5 + Y_OFFSET; y <= 8 + Y_OFFSET; y++) level[y][columnX] = 1;
    state.collisions = state.buildCollisions();

    player.x = (columnX - 1) * TILE + TILE / 2;
    player.y = (state.LEVEL_H - 5) * TILE - player.h / 2;
    player.vx = 0;
    player.vy = 0;
    resolveCollisions(player, level, state.collisions, state.lights);
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    const groundY = (state.LEVEL_H - 5) * TILE;
    expect(player.shadowY).toBe(groundY);

    player.x = columnX * TILE + TILE / 2;
    player.y = (5 + Y_OFFSET) * TILE - player.h / 2 - 10;
    resolveCollisions(player, level, state.collisions, state.lights);
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    expect(player.shadowY).toBe((5 + Y_OFFSET) * TILE);
  });

  test('returns ground height when standing under a block', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const { level, player } = state;
    const columnX = 10;
    level[5 + Y_OFFSET][columnX] = 1; // block above
    state.collisions = state.buildCollisions();

    player.x = columnX * TILE + TILE / 2;
    player.y = (state.LEVEL_H - 5) * TILE - player.h / 2;
    resolveCollisions(player, level, state.collisions, state.lights);
    player.shadowY = findGroundY(state.collisions, player.x, player.y + player.h / 2);
    const groundY = (state.LEVEL_H - 5) * TILE;
    expect(player.shadowY).toBe(groundY);
  });
});

describe('canvas resizing', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('resizes canvas based on devicePixelRatio', async () => {
    await loadGame();
    const canvas = document.getElementById('game');
    expect(canvas.width).toBe(960);
    expect(canvas.height).toBe(540);
    window.devicePixelRatio = 2;
    window.__resizeGameCanvas();
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    window.devicePixelRatio = 1;
    window.__resizeGameCanvas();
    expect(canvas.width).toBe(960);
    expect(canvas.height).toBe(540);
  });

  test('fullscreenchange recalculates canvas size from element size', async () => {
    const { canvas } = await loadGame();
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 1920 });
    Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 1080 });
    const rect = { width: 1920, height: 1080, left: 0, top: 0 };
    canvas.getBoundingClientRect = () => rect;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
    rect.width = 960;
    rect.height = 540;
    Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 960 });
    Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 540 });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(canvas.width).toBe(960);
    expect(canvas.height).toBe(540);
  });

  test('resize sets canvas imageRendering to pixelated', async () => {
    await loadGame();
    const canvas = document.getElementById('game');
    canvas.style.imageRendering = 'auto';
    window.__resizeGameCanvas();
    expect(canvas.style.imageRendering).toBe('pixelated');
  });
});

describe('player and npc collision', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test.each([
    ['player left of npc', 90, 100, -1, -1, 1],
    ['player right of npc', 110, 100, 1, 1, -1],
  ])('side collision stuns player and knocks entities apart when %s', async (_s, px, nx, facing, pSign, nSign) => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = px; player.y = 0; player.vx = 0; player.vy = 0; player.facing = facing;
    const npc = createNpc(nx, 0, player.w, player.h, null);
    state.npcs.push(npc);

    hooks.runUpdate(16);

    expect(player.stunnedMs).toBeGreaterThan(0);
    expect(Math.sign(player.vx)).toBe(pSign);
    expect(player.facing).toBe(facing);
    expect(npc.state).toBe('bump');
    expect(npc.pauseTimer).toBeGreaterThanOrEqual(400);
    expect(npc.knockbackTimer).toBeGreaterThan(0);
    expect(Math.sign(npc.vx)).toBe(nSign);

    hooks.runUpdate(16);
    expect(npc.knockbackTimer).toBeGreaterThan(0);
    expect(Math.sign(npc.vx)).toBe(nSign);

    expect(player.facing).toBe(facing);
  });

  test('stomping npc bounces player with normal jump height', async () => {
    const { hooks, audio, ui } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0; player.vy = 10;
    const npc = createNpc(0, 60, player.w, player.h, null);
    state.npcs.push(npc);

    hooks.runUpdate(16);

    expect(player.vy).toBe(JUMP_VEL);
    expect(player.stunnedMs).toBe(0);
    expect(npc.state).toBe('bump');
    expect(npc.pauseTimer).toBeGreaterThanOrEqual(400);
    expect(audio.play).toHaveBeenCalledWith('jump');
    expect(ui.triggerStompEffect).toHaveBeenCalledTimes(1);
  });

  test('npc bounce count resets when player lands', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0;
    const npc = createNpc(0, 60, player.w, player.h, null);
    state.npcs.push(npc);

    // First stomp
    player.vy = 10;
    hooks.runUpdate(16);
    expect(npc.bounceCount).toBe(1);

    // Simulate landing on ground
    player.y = SPAWN_Y - 20;
    player.vy = 10;
    player.onGround = false;
    for (let i = 0; i < 60 && !player.onGround; i++) hooks.runUpdate(16);
    expect(player.onGround).toBe(true);
    expect(npc.bounceCount).toBe(0);

    // Stomp again after landing
    player.y = 0; player.vy = 10; npc.y = 60; npc.vy = 0;
    hooks.runUpdate(16);
    expect(npc.bounceCount).toBe(1);
  });

  test('player passes through npc after three stomps', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0;
    const npc = createNpc(0, 60, player.w, player.h, null);
    state.npcs.push(npc);

    for (let i = 0; i < 3; i++) {
      player.vy = 10;
      hooks.runUpdate(16);
      expect(player.vy).toBe(JUMP_VEL);
      player.y = 0;
      npc.y = 60;
      npc.vy = 0;
    }

    player.vy = 10;
    hooks.runUpdate(16);

    expect(npc.passThrough).toBe(true);
    expect(player.vy).toBeGreaterThan(0);
  });

  test('trunk remains pass-through after player lands', async () => {
    const { hooks } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0;
    const npc = createNpc(0, 60, player.w, player.h, null, undefined, undefined, { passThrough: true }, 'trunk');
    state.npcs.push(npc);

    player.y = SPAWN_Y - 20;
    player.vy = 10;
    player.onGround = false;
    for (let i = 0; i < 60 && !player.onGround; i++) hooks.runUpdate(16);

    expect(player.onGround).toBe(true);
    expect(npc.passThrough).toBe(true);
  });

  test('spawned trunk offsets two tiles down', async () => {
    const { hooks } = await loadGame();
    hooks.spawnNpc('trunk');
    const trunk = hooks.getState().npcs.find(n => n.type === 'trunk');
    expect(trunk.offsetY).toBe(TILE * 2);
  });

  test('trunk emits slide dust while moving', async () => {
    const { hooks, ui } = await loadGame();
    const state = hooks.getState();
    const player = state.player;
    player.x = 0; player.y = 0;
    const npc = createNpc(0, 60, player.w, player.h, null, undefined, undefined, { passThrough: true }, 'trunk');
    npc.dustTimer = 0;
    state.npcs.push(npc);
    hooks.runUpdate(16);
    expect(ui.triggerSlideEffect).toHaveBeenCalled();
  });
});
