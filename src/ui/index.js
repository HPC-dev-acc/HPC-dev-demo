export function initUI(canvas, { resumeAudio, toggleMusic, version, design } = {}) {
  const gameWrap = document.getElementById('game-wrap');
  const gameCol = document.getElementById('game-col');
  const startPage = document.getElementById('start-page');
  const startStatus = document.getElementById('start-status');
  const startVersion = document.getElementById('start-version');
  const btnStart = document.getElementById('btn-start');
  const btnRetry = document.getElementById('btn-retry');
  const pedDialogEl = document.getElementById('ped-dialog');
  const pedDialogText = pedDialogEl?.querySelector('.ped-dialog__text');
  const langSelect = document.getElementById('lang-select');
  let currentLang = langSelect?.value || 'en';
  const pedDialogMap = {
    wait: {
      en: 'Wait for the light to turn green before crossing',
      ja: '青に変わるまでお待ちください',
      'zh-Hant': '請等待紅燈變綠燈後再通行',
      'zh-Hans': '请等待红灯变绿灯后再通行',
    },
  };
  let currentDialogKey = null;
  langSelect?.addEventListener('change', () => {
    currentLang = langSelect.value;
    document.documentElement.lang = currentLang;
    if (currentDialogKey && pedDialogText) {
      pedDialogText.textContent = pedDialogMap[currentDialogKey]?.[currentLang] || currentDialogKey;
    }
  });
  document.documentElement.lang = currentLang;
  let lastPlayer = null;
  let lastCamera = null;

  function showPedDialog(key) {
    if (!pedDialogEl) return;
    const text = pedDialogMap[key]?.[currentLang] || key;
    if (pedDialogText) pedDialogText.textContent = text;
    currentDialogKey = key;
    pedDialogEl.classList.remove('hidden');
  }

  function hidePedDialog() {
    pedDialogEl?.classList.add('hidden');
  }

  function worldToScreen(x, y, camera) {
    const scale = window.__cssScale || 1;
    return { x: (x - camera.x) * scale, y: (y - camera.y) * scale, scale };
  }

  function syncDialogToPlayer(player, camera) {
    if (!pedDialogEl || pedDialogEl.classList.contains('hidden')) return;
    if (!player || !camera) return;
    lastPlayer = player;
    lastCamera = camera;
    const { x, y, scale } = worldToScreen(player.x, player.y - player.h / 2, camera);
    pedDialogEl.style.left = `${x}px`;
    pedDialogEl.style.top = `${y - 28 * scale}px`;
  }

  window.addEventListener('resize', () => syncDialogToPlayer(lastPlayer, lastCamera));
  window.addEventListener('orientationchange', () => syncDialogToPlayer(lastPlayer, lastCamera));

  const Logger = (() => {
    const BUF_MAX = 400;
    const buf = [];
    const nowISO = () => new Date().toISOString();
    async function copy() {
      try { await navigator.clipboard.writeText(buf.join('\n')); } catch (e) {}
    }
    function clear() { buf.length = 0; }
    function push(level, evt, data) {
      const rec = { ts: nowISO(), level, evt };
      if (data && typeof data === 'object' && Object.keys(data).length) rec.data = data;
      buf.push(JSON.stringify(rec)); if (buf.length > BUF_MAX) buf.shift();
    }
    return { copy, clear, push,
      info: (e, d) => push('INFO', e, d),
      debug: (e, d) => push('DEBUG', e, d),
      error: (e, d) => push('ERROR', e, d) };
  })();
  document.getElementById('log-copy')?.addEventListener('click', () => Logger.copy());
  document.getElementById('log-clear')?.addEventListener('click', () => Logger.clear());

  const infoToggle = document.getElementById('info-toggle');
  const infoPanel = document.getElementById('info-panel');
  if (infoToggle && infoPanel) {
    infoToggle.addEventListener('click', () => {
      infoPanel.hidden = !infoPanel.hidden;
    });
  }

  const settingsToggle = document.getElementById('settings-toggle');
  const settingsMenu = document.getElementById('settings-menu');
  if (settingsToggle && settingsMenu) {
    settingsToggle.addEventListener('click', () => {
      settingsMenu.classList.toggle('open');
    });
  }

  const bgmToggle = document.getElementById('bgm-toggle');
  if (bgmToggle) {
    bgmToggle.addEventListener('click', () => {
      const on = toggleMusic();
      bgmToggle.textContent = on ? 'Mute' : 'Unmute';
    });
  }

  const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', () => {
        const target = gameCol || canvas;
        if (!document.fullscreenElement) {
          target.requestFullscreen?.().catch(() => {});
          fullscreenToggle.textContent = '🞬';
        } else {
          document.exitFullscreen?.().catch(() => {});
          fullscreenToggle.textContent = '⛶';
        }
        setTimeout(() => {
          if (window.__resizeGameCanvas) {
            window.__resizeGameCanvas();
          }
        }, 0);
      });
    }

  if (design) {
    const enableBtn = document.getElementById('design-enable');
    const transBtn = document.getElementById('design-transparent');
    const destroyBtn = document.getElementById('design-destroyable');
    const saveBtn = document.getElementById('design-save');
    const addBtn = document.getElementById('design-add');
    enableBtn?.addEventListener('click', () => {
      const on = design.enable();
      enableBtn.classList.toggle('active', on);
      enableBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      enableBtn.textContent = on ? '停用' : '啟用';
      if (addBtn) addBtn.hidden = !on;
    });
    transBtn?.addEventListener('click', () => design.toggleTransparent());
    destroyBtn?.addEventListener('click', () => design.toggleDestroyable());
    saveBtn?.addEventListener('click', () => design.save());
    addBtn?.addEventListener('click', () => design.addBlock());
  }

  canvas.setAttribute('tabindex', '0');
  function refocus(e) { try { if (e) e.preventDefault(); canvas.focus(); } catch (_) {} }
  function setVersionBadge() {
    const pill = document.getElementById('version-pill');
    if (pill) pill.textContent = `v${version}`;
    if (startVersion) startVersion.textContent = `v${version}`;
  }
  window.addEventListener('load', () => { refocus(); setVersionBadge(); });
  window.addEventListener('pointerdown', (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.matches('button, a, input, textarea, select, label')) return;
    refocus(e);
  }, { passive: false });
  window.addEventListener('keydown', () => resumeAudio(), { once: true });
  window.addEventListener('pointerdown', () => resumeAudio(), { once: true });

  function setStatus(msg) { if (startStatus) startStatus.textContent = msg; }
  function showLoading() {
    setStatus('Loading...');
    if (btnStart) btnStart.hidden = true;
    if (btnRetry) btnRetry.hidden = true;
    if (startPage) startPage.hidden = false;
  }
  function showStart(onStart) {
    setStatus('');
    if (btnRetry) btnRetry.hidden = true;
    if (btnStart) {
      btnStart.hidden = false;
      btnStart.onclick = () => { if (startPage) startPage.hidden = true; onStart(); };
    }
  }
  function showError(onRetry) {
    setStatus('Failed to load resources');
    if (btnStart) btnStart.hidden = true;
    if (btnRetry) {
      btnRetry.hidden = false;
      btnRetry.onclick = () => { showLoading(); onRetry(); };
    }
    if (startPage) startPage.hidden = false;
  }
  const startScreen = { showLoading, showStart, showError, setStatus };
  showLoading();

  const dbg = {
    fpsEl: document.getElementById('dbg-fps'),
    posEl: document.getElementById('dbg-pos'),
    velEl: document.getElementById('dbg-vel'),
    groundEl: document.getElementById('dbg-ground'),
    coyoteEl: document.getElementById('dbg-coyote'),
    bufferEl: document.getElementById('dbg-buffer'),
    keysEl: document.getElementById('dbg-keys'),
    pressEl: document.getElementById('dbg-press'),
    firedEl: document.getElementById('dbg-fired'),
  };

  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const stageClearEl = document.getElementById('stage-clear');
  const stageFailEl = document.getElementById('stage-fail');

  function triggerClearEffect() {
    if (!stageClearEl) return;
    const fx = document.createElement('img');
    fx.src = 'assets/clear-star.svg';
    fx.alt = '';
    fx.className = 'clear-effect';
    stageClearEl.appendChild(fx);
    setTimeout(() => fx.remove(), 1500);
  }
  function triggerSlideEffect(x, y, facing) {
    if (!gameWrap) return;
    const fx = document.createElement('img');
    fx.src = 'assets/slide-dust.svg';
    fx.alt = '';
    fx.className = 'slide-effect';
    const H_OFF = 12;
    const V_OFF = 12;
    const scale = window.__cssScale || 1;
    fx.style.left = `${(x - facing * H_OFF) * scale}px`;
    fx.style.top = `${(y - V_OFF) * scale}px`;
    fx.style.width = `${48 * scale}px`;
    fx.style.height = `${24 * scale}px`;
    fx.style.setProperty('--sx', facing);
    gameWrap.appendChild(fx);
    setTimeout(() => fx.remove(), 500);
  }
  function triggerFailEffect() {
    if (!gameWrap) return;
    const fx = document.createElement('div');
    fx.className = 'fail-effect';
    gameWrap.appendChild(fx);
    setTimeout(() => fx.remove(), 1000);
  }
  function triggerStartEffect() {
    if (!gameWrap) return;
    const fx = document.createElement('div');
    fx.className = 'start-effect';
    fx.textContent = "Let's Go!";
    gameWrap.appendChild(fx);
    setTimeout(() => fx.remove(), 1000);
  }
  function showStageClear() { if (stageClearEl) stageClearEl.hidden = false; }
  function showStageFail() { if (stageFailEl) stageFailEl.hidden = false; }
  function hideStageOverlays() { if (stageClearEl) stageClearEl.hidden = true; if (stageFailEl) stageFailEl.hidden = true; }

  return { Logger, dbg, scoreEl, timerEl, triggerClearEffect, triggerSlideEffect, triggerFailEffect, triggerStartEffect, showStageClear, showStageFail, hideStageOverlays, startScreen, showPedDialog, hidePedDialog, syncDialogToPlayer };
}
