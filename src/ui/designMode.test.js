import { RELEASE_VERSION } from '../../version.js';
import { TILE, COLL_TILE } from '../game/physics.js';
import { CAMERA_OFFSET_Y } from '../render.js';

const LOGICAL_W = 960;

async function loadGame() {
  jest.resetModules();
  jest.doMock('../../assets/objects.custom.js', () => []);
  document.body.innerHTML = `
    <div id="stage">
      <canvas id="game" width="960" height="540"></canvas>
      <div id="hud">
        <div id="hud-top-center"></div>
      </div>
    </div>
    <button id="design-enable" aria-pressed="false">啟用</button>
    <div id="design-transparent"></div>
    <div id="design-destroyable"></div>
    <div id="design-save"></div>
    <button id="design-add" hidden></button>
  `;
  const canvas = document.getElementById('game');
  const hud = document.getElementById('hud-top-center');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: 960, bottom: 540, width: 960, height: 540 });
  hud.getBoundingClientRect = () => ({ left: 0, top: 0, right: 960, bottom: 20, width: 960, height: 20 });
    const ctx = {
      canvas,
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      drawImage: jest.fn(),
      scale: jest.fn(),
      ellipse: jest.fn(),
      setTransform: jest.fn(),
    };
  canvas.getContext = () => ctx;
  window.__APP_VERSION__ = `v${RELEASE_VERSION}`;
  global.requestAnimationFrame = jest.fn();
  window.requestAnimationFrame = global.requestAnimationFrame;
  const audio = {
    loadSounds: jest.fn(() => Promise.resolve()),
    play: jest.fn(),
    playMusic: jest.fn(),
    toggleMusic: jest.fn(),
    resumeAudio: jest.fn(),
  };
  jest.doMock('../audio.js', () => audio);
  jest.doMock('../sprites.js', () => ({
    loadPlayerSprites: () => Promise.resolve(),
    loadTrafficLightSprites: () => Promise.resolve({}),
    loadNpcSprite: () => Promise.resolve({}),
    loadOlNpcSprite: () => Promise.resolve({}),
    loadStudentNpcSprite: () => Promise.resolve({}),
    loadOfficemanNpcSprite: () => Promise.resolve({}),
    loadTrunkNpcSprite: () => Promise.resolve({}),
  }));
  await import('../../main.js');
  await Promise.resolve();
  return { hooks: window.__testHooks, canvas, audio, ctx };
}

function findFreeDir(state, obj) {
  const dirs = [
    { dx: 1, dy: 0, key: 'd' },
    { dx: -1, dy: 0, key: 'a' },
    { dx: 0, dy: 1, key: 's' },
    { dx: 0, dy: -1, key: 'w' },
  ];
  return dirs.find(({ dx, dy }) => state.level[obj.y + dy] && state.level[obj.y + dy][obj.x + dx] === 0);
}

test('design mode starts without predefined objects', async () => {
  const { hooks } = await loadGame();
  expect(hooks.getObjects()).toHaveLength(0);
});

test('design mode enables and drags objects', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  expect(enableBtn.classList.contains('active')).toBe(true);
  expect(enableBtn.getAttribute('aria-pressed')).toBe('true');
  expect(enableBtn.textContent).toBe('Disable');
  expect(hooks.designIsEnabled()).toBe(true);
  hooks.designAddBlock();
  const obj = hooks.getObjects()[0];
  const state = hooks.getState();
  const { dx, dy } = findFreeDir(state, obj);
  const startX = obj.x;
  const startY = obj.y;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: startX * TILE + 1, clientY: startY * TILE + 1 }));
  canvas.dispatchEvent(new window.MouseEvent('pointermove', { clientX: (startX + dx) * TILE + 1, clientY: (startY + dy) * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  expect(obj.x).toBe(startX + dx);
  expect(obj.y).toBe(startY + dy);
});

test('selected object moves with WASD keys', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  hooks.designAddBlock();
  const obj = hooks.getObjects()[0];
  const state = hooks.getState();
  const { dx, dy, key } = findFreeDir(state, obj);
  const startX = obj.x;
  const startY = obj.y;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: startX * TILE + 1, clientY: startY * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key }));
  expect(obj.x).toBe(startX + dx);
  expect(obj.y).toBe(startY + dy);
});

test('transparent toggle affects only the selected object', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const transBtn = document.getElementById('design-transparent');
  enableBtn.click();
  hooks.designAddBlock();
  const state = hooks.getState();
  state.camera.x += TILE * 2;
  hooks.designAddBlock();
  state.camera.x = 0;
  const [first, second] = hooks.getObjects();
  transBtn.click();
  expect(first.transparent).toBe(false);
  expect(second.transparent).toBe(false);
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: first.x * TILE + 1, clientY: first.y * TILE + 1 }));
  transBtn.click();
  expect(first.transparent).toBe(true);
  expect(second.transparent).toBe(false);
});

test('destroyable toggle affects only the selected object', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const destroyBtn = document.getElementById('design-destroyable');
  enableBtn.click();
  hooks.designAddBlock();
  const state = hooks.getState();
  state.camera.x += TILE * 2;
  hooks.designAddBlock();
  state.camera.x = 0;
  const [first, second] = hooks.getObjects();
  destroyBtn.click();
  expect(first.destroyable).not.toBe(false);
  expect(second.destroyable).not.toBe(false);
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: first.x * TILE + 1, clientY: first.y * TILE + 1 }));
  destroyBtn.click();
  expect(first.destroyable).toBe(false);
  expect(second.destroyable).not.toBe(false);
});

test('timer pauses while design mode is enabled', async () => {
  const { hooks } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  expect(hooks.designIsEnabled()).toBe(true);
  const before = hooks.getTimeLeft();
  hooks.runUpdate(60);
  hooks.runUpdate(60);
  expect(hooks.getTimeLeft()).toBe(before);
});

test('getSelected returns object and render highlights it', async () => {
  const { hooks, canvas, ctx } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  hooks.designAddBlock();
  const obj = hooks.getObjects()[0];
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: obj.x * TILE + 1, clientY: obj.y * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX: obj.x * TILE + 1, clientY: obj.y * TILE + 1 }));
  const sel = hooks.designGetSelected();
  expect(sel).toBe(obj);
  hooks.runRender();
  expect(ctx.strokeRect).toHaveBeenCalledWith(obj.x * TILE, obj.y * TILE, TILE, TILE);
});

test('clicking selected object again cancels selection', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  enableBtn.click();
  hooks.designAddBlock();
  const obj = hooks.getObjects()[0];
  const clientX = obj.x * TILE + 1;
  const clientY = obj.y * TILE + 1;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX, clientY }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX, clientY }));
  expect(hooks.designGetSelected()).toBe(obj);
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX, clientY }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX, clientY }));
  expect(hooks.designGetSelected()).toBe(null);
});

test('add button inserts a 24px block centered below the HUD', async () => {
  const { hooks, ctx, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const addBtn = document.getElementById('design-add');
  const hud = document.getElementById('hud-top-center');
  expect(addBtn.hidden).toBe(true);
  enableBtn.click();
  expect(addBtn.hidden).toBe(false);
  addBtn.click();
  const state = hooks.getState();
  const hudRect = hud.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const px = state.camera.x + LOGICAL_W / 2;
  const py = state.camera.y + CAMERA_OFFSET_Y + (hudRect.bottom - canvasRect.top) + 4;
  const cx = Math.floor(px / (TILE / 2));
  const cy = Math.floor(py / (TILE / 2));
  const tx = Math.floor(cx / 2);
  const ty = Math.floor(cy / 2);
  const key = `${tx},${ty}`;
  const q = (cy % 2) * 2 + (cx % 2);
  const expected = [[0,0],[0,0]]; expected[Math.floor(q/2)][q%2] = 1;
  expect(state.patterns[key].mask).toEqual(expected);
  expect(state.collisions[cy][cx]).toBe(1);
  hooks.runRender();
  expect(ctx.fillRect.mock.calls.some(([x,y,w,h]) => x === tx * TILE && y === ty * TILE + TILE / 2 && w === TILE / 2 && h === TILE / 2)).toBe(true);
});

test('dragging an added 24px block preserves its pattern', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const addBtn = document.getElementById('design-add');
  const hud = document.getElementById('hud-top-center');
  enableBtn.click();
  addBtn.click();
  const state = hooks.getState();
  const hudRect = hud.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const px = state.camera.x + LOGICAL_W / 2;
  const py = state.camera.y + CAMERA_OFFSET_Y + (hudRect.bottom - canvasRect.top) + 4;
  const cx = Math.floor(px / (TILE / 2));
  const cy = Math.floor(py / (TILE / 2));
  const tx = Math.floor(cx / 2);
  const ty = Math.floor(cy / 2);
  const key = `${tx},${ty}`;
  const patt = state.patterns[key];
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: tx * TILE + 1, clientY: ty * TILE + 1 }));
  canvas.dispatchEvent(new window.MouseEvent('pointermove', { clientX: tx * TILE + 1, clientY: (ty + 1) * TILE + 1 }));
  window.dispatchEvent(new window.MouseEvent('pointerup'));
  const newKey = `${tx},${ty + 1}`;
  expect(state.patterns[newKey]).toBe(patt);
  expect(state.patterns[key]).toBeUndefined();
  expect(state.collisions[cy][cx]).toBe(0);
  expect(state.collisions[cy + 2][cx]).toBe(1);
});

test('pressing Q rotates a selected 24px block clockwise', async () => {
  const { hooks, canvas } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const addBtn = document.getElementById('design-add');
  const hud = document.getElementById('hud-top-center');
  enableBtn.click();
  addBtn.click();
  const state = hooks.getState();
  const hudRect = hud.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const px = state.camera.x + LOGICAL_W / 2;
  const py = state.camera.y + CAMERA_OFFSET_Y + (hudRect.bottom - canvasRect.top) + 4;
  const cx = Math.floor(px / COLL_TILE);
  const cy = Math.floor(py / COLL_TILE);
  const tx = Math.floor(cx / 2);
  const ty = Math.floor(cy / 2);
  const key = `${tx},${ty}`;
  const before = state.patterns[key].mask.map(r => r.slice());
  let q = 0;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) if (before[r][c]) q = r * 2 + c;
  const h = TILE / 2;
  const clickX = tx * TILE + (q % 2) * h + 1;
  const clickY = ty * TILE + Math.floor(q / 2) * h + 1;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: clickX, clientY: clickY }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX: clickX, clientY: clickY }));
  expect(state.selection).toEqual({ x: tx, y: ty, q });
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'q' }));
  const after = state.patterns[key].mask;
  const rotMap = [1, 3, 0, 2];
  const newQ = rotMap[q];
  const expected = before.map(r => r.slice());
  expected[Math.floor(q / 2)][q % 2] = 0;
  expected[Math.floor(newQ / 2)][newQ % 2] = 1;
  expect(after).toEqual(expected);
  const oldCx = tx * 2 + (q % 2);
  const oldCy = ty * 2 + Math.floor(q / 2);
  const newCx = tx * 2 + (newQ % 2);
  const newCy = ty * 2 + Math.floor(newQ / 2);
  expect(state.collisions[oldCy][oldCx]).toBe(0);
  expect(state.collisions[newCy][newCx]).toBe(1);
  expect(state.selection.q).toBe(newQ);
});

test('render highlights a selected 24px block', async () => {
  const { hooks, canvas, ctx } = await loadGame();
  const enableBtn = document.getElementById('design-enable');
  const addBtn = document.getElementById('design-add');
  const hud = document.getElementById('hud-top-center');
  enableBtn.click();
  addBtn.click();
  const state = hooks.getState();
  const hudRect = hud.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const px = state.camera.x + LOGICAL_W / 2;
  const py = state.camera.y + CAMERA_OFFSET_Y + (hudRect.bottom - canvasRect.top) + 4;
  const cx = Math.floor(px / COLL_TILE);
  const cy = Math.floor(py / COLL_TILE);
  const tx = Math.floor(cx / 2);
  const ty = Math.floor(cy / 2);
  const q = (cy % 2) * 2 + (cx % 2);
  const h = TILE / 2;
  const clickX = tx * TILE + (q % 2) * h + 1;
  const clickY = ty * TILE + Math.floor(q / 2) * h + 1;
  canvas.dispatchEvent(new window.MouseEvent('pointerdown', { clientX: clickX, clientY: clickY }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { clientX: clickX, clientY: clickY }));
  ctx.strokeRect.mockClear();
  hooks.runRender();
  const sx = tx * TILE + (q % 2) * h;
  const sy = ty * TILE + Math.floor(q / 2) * h;
  expect(ctx.strokeRect.mock.calls).toContainEqual([sx, sy, h, h]);
});
