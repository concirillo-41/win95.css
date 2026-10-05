/*! win95.js v0.1.0 | MIT License */
/*
 * win95.js — window manager for win95.css. No dependencies.
 *
 * Markup contract:
 *   <section class="w95-window" id="readme" data-icon="notepad" data-w="480" data-h="360" hidden>…</section>
 *   [data-open="readme"]     opens/focuses that window (desktop icons: double-click; touch: tap)
 *   [data-action="close|minimize|maximize"] inside a window
 *   [data-action="shutdown"] shows the "safe to turn off" screen
 *   .w95-menubar > li > button[aria-controls]   drop-down menus
 *   [role="tablist"] > [role="tab"][aria-controls] tabs
 *   .w95-clock               taskbar clock
 *   #readme in the URL opens that window on load.
 */
(() => {
  const PHONE = matchMedia('(max-width: 640px)');
  const COARSE = matchMedia('(pointer: coarse)');
  let desktop, tasks, startBtn, startMenu;
  let z = 10;
  let cascade = 0;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const winOf = (el) => el.closest('.w95-window');

  /* ---------- Windows ---------- */

  function place(win) {
    const W = desktop.clientWidth;
    const H = desktop.clientHeight;
    const w = Math.min(+win.dataset.w || 420, W - 8);
    win.style.width = w + 'px';
    const auto = win.dataset.h === 'auto';
    const h = Math.min(auto ? win.offsetHeight : +win.dataset.h || 300, H - 8);
    if (!auto || win.offsetHeight > H - 8) win.style.height = h + 'px';
    let x, y;
    if (win.hasAttribute('data-center')) {
      x = (W - w) / 2;
      y = Math.max(4, (H - h) / 2.6);
    } else {
      x = 96 + (cascade % 8) * 24;
      y = 16 + (cascade % 8) * 24;
      cascade++;
    }
    win.style.left = Math.max(0, Math.min(x, W - w)) + 'px';
    win.style.top = Math.max(0, Math.min(y, H - h)) + 'px';
    win.dataset.placed = '';
  }

  function open(id) {
    const win = document.getElementById(id);
    if (!win || !win.classList.contains('w95-window')) return;
    closeMenus();
    win.hidden = false;
    if (!('placed' in win.dataset)) place(win);
    delete win.dataset.minimized;
    ensureTask(win);
    focus(win);
    win.dispatchEvent(new CustomEvent('w95:open', { bubbles: true }));
  }

  function close(win) {
    win.hidden = true;
    delete win.dataset.minimized;
    taskFor(win)?.remove();
    win.dispatchEvent(new CustomEvent('w95:close', { bubbles: true }));
    focusTop();
  }

  function minimize(win) {
    win.hidden = true;
    win.dataset.minimized = '';
    focusTop();
  }

  function toggleMax(win) {
    win.classList.toggle('is-maximized');
    const btn = $('[data-action="maximize"]', win);
    if (btn) btn.setAttribute('aria-label', win.classList.contains('is-maximized') ? 'Restore' : 'Maximize');
  }

  function focus(win) {
    win.style.zIndex = ++z;
    $$('.w95-desktop > .w95-window').forEach((w) => w.classList.toggle('is-inactive', w !== win));
    $$('button', tasks).forEach((b) => b.classList.toggle('is-active', b.dataset.for === win.id));
  }

  function focusTop() {
    const visible = $$('.w95-desktop > .w95-window:not([hidden])').sort((a, b) => b.style.zIndex - a.style.zIndex);
    if (visible[0]) focus(visible[0]);
    else $$('button', tasks).forEach((b) => b.classList.remove('is-active'));
  }

  /* ---------- Taskbar ---------- */

  const taskFor = (win) => $(`button[data-for="${win.id}"]`, tasks);

  function ensureTask(win) {
    if (taskFor(win)) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.for = win.id;
    const title = $('.w95-title', win)?.textContent.trim() || win.id;
    b.title = title;
    b.innerHTML = `<span class="w95-ico-${win.dataset.icon || 'folder'}"></span><span></span>`;
    b.lastChild.textContent = title;
    b.addEventListener('click', () => {
      const active = b.classList.contains('is-active') && !win.hidden;
      if (active) minimize(win);
      else open(win.id);
    });
    tasks.append(b);
  }

  /* ---------- Drag & resize ---------- */

  function drag(e) {
    const bar = e.target.closest('.w95-titlebar');
    if (!bar || e.target.closest('button') || e.button !== 0) return;
    const win = winOf(bar);
    if (!win || PHONE.matches || win.classList.contains('is-maximized')) return;
    const sx = e.clientX, sy = e.clientY;
    const ox = win.offsetLeft, oy = win.offsetTop;
    const W = desktop.clientWidth, H = desktop.clientHeight;
    bar.setPointerCapture(e.pointerId);
    const move = (ev) => {
      // Keep at least 40px of title bar on screen, like the real thing.
      const x = Math.max(40 - win.offsetWidth, Math.min(ox + ev.clientX - sx, W - 40));
      const y = Math.max(0, Math.min(oy + ev.clientY - sy, H - 20));
      win.style.left = x + 'px';
      win.style.top = y + 'px';
    };
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  }

  function resize(e) {
    const grip = e.target.closest('.w95-grip');
    if (!grip || e.button !== 0) return;
    const win = winOf(grip);
    if (win.classList.contains('is-maximized')) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ow = win.offsetWidth, oh = win.offsetHeight;
    const minW = +win.dataset.minW || 220, minH = +win.dataset.minH || 140;
    grip.setPointerCapture(e.pointerId);
    const move = (ev) => {
      win.style.width = Math.max(minW, Math.min(ow + ev.clientX - sx, desktop.clientWidth - win.offsetLeft)) + 'px';
      win.style.height = Math.max(minH, Math.min(oh + ev.clientY - sy, desktop.clientHeight - win.offsetTop)) + 'px';
    };
    const up = () => grip.removeEventListener('pointermove', move);
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up, { once: true });
  }

  /* ---------- Menus ---------- */

  function closeMenus(except) {
    $$('.w95-menubar [aria-expanded="true"]').forEach((b) => {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')).hidden = true;
    });
    if (except !== startBtn && startBtn?.getAttribute('aria-expanded') === 'true') {
      startBtn.setAttribute('aria-expanded', 'false');
      startMenu.hidden = true;
    }
  }

  function toggleMenu(btn, force) {
    const menu = document.getElementById(btn.getAttribute('aria-controls'));
    const show = force ?? btn.getAttribute('aria-expanded') !== 'true';
    closeMenus(btn);
    btn.setAttribute('aria-expanded', String(show));
    menu.hidden = !show;
    if (show && btn !== startBtn) $('button:not(:disabled), a', menu)?.focus({ preventScroll: true });
  }

  /* ---------- Tabs ---------- */

  function selectTab(tab) {
    const list = tab.closest('[role="tablist"]');
    $$('[role="tab"]', list).forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }

  /* ---------- Desktop icons ---------- */

  function selectIcon(icon) {
    $$('.w95-desk-icon').forEach((i) => i.setAttribute('aria-selected', String(i === icon)));
  }

  /* ---------- Clock ---------- */

  function tick() {
    const now = new Date();
    $$('.w95-clock').forEach((c) => {
      c.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      c.dataset.tip = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    });
  }

  /* ---------- Shut down ---------- */

  function shutdown() {
    closeMenus();
    const s = document.createElement('div');
    s.className = 'w95-safe';
    s.tabIndex = 0;
    s.setAttribute('role', 'button');
    s.innerHTML = "<p>It's now safe to turn off<br>your computer.<small>Click anywhere to start again.</small></p>";
    const restart = () => s.remove();
    s.addEventListener('click', restart);
    s.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && restart());
    document.body.append(s);
    s.focus();
  }

  /* ---------- Wiring ---------- */

  function init() {
    desktop = $('.w95-desktop');
    tasks = $('.w95-tasks');
    startBtn = $('.w95-start');
    startMenu = startBtn && document.getElementById(startBtn.getAttribute('aria-controls'));
    if (!desktop || !tasks) return;

    document.addEventListener('pointerdown', (e) => {
      const win = winOf(e.target);
      if (win && desktop.contains(win)) focus(win);
      if (!e.target.closest('.w95-menu, .w95-menubar, .w95-startmenu, .w95-start')) closeMenus();
      if (!e.target.closest('.w95-desk-icon') && e.target.closest('.w95-desktop') && !win) selectIcon(null);
      drag(e);
      resize(e);
    });

    document.addEventListener('click', (e) => {
      const t = e.target;

      const icon = t.closest('.w95-desk-icon');
      if (icon) {
        selectIcon(icon);
        // Touch screens open on one tap. Mice keep the double-click.
        if (COARSE.matches || e.detail === 0) open(icon.dataset.open);
        return;
      }

      const action = t.closest('[data-action]');
      if (action) {
        const win = winOf(action);
        const a = action.dataset.action;
        if (a === 'close' && win) close(win);
        else if (a === 'minimize' && win) minimize(win);
        else if (a === 'maximize' && win) toggleMax(win);
        else if (a === 'shutdown') shutdown();
        if (action.closest('.w95-menu')) closeMenus();
      }

      const opener = t.closest('[data-open]');
      if (opener) {
        e.preventDefault();
        open(opener.dataset.open);
        if (opener.closest('.w95-menu, .w95-startmenu')) closeMenus();
      }

      const menuBtn = t.closest('.w95-menubar > li > button[aria-controls]');
      if (menuBtn) toggleMenu(menuBtn);
      if (startBtn && t.closest('.w95-start')) toggleMenu(startBtn);

      const tab = t.closest('[role="tab"]');
      if (tab) selectTab(tab);
    });

    document.addEventListener('dblclick', (e) => {
      const icon = e.target.closest('.w95-desk-icon');
      if (icon) open(icon.dataset.open);
      const bar = e.target.closest('.w95-titlebar');
      if (bar && !e.target.closest('button') && !PHONE.matches) {
        const win = winOf(bar);
        if ($('[data-action="maximize"]', win)) toggleMax(win);
      }
    });

    // Moving across an open menu bar switches menus, as in Windows.
    document.addEventListener('pointerover', (e) => {
      const btn = e.target.closest('.w95-menubar > li > button[aria-controls]');
      if (!btn || btn.getAttribute('aria-expanded') === 'true') return;
      if ($('[aria-expanded="true"]', btn.closest('.w95-menubar'))) toggleMenu(btn, true);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const wasOpen = $('.w95-menubar [aria-expanded="true"]') || startBtn?.getAttribute('aria-expanded') === 'true';
        closeMenus();
        if (wasOpen) return;
      }
      const icon = e.target.closest?.('.w95-desk-icon');
      if (icon && e.key === 'Enter') {
        e.preventDefault();
        open(icon.dataset.open);
      }
      const tab = e.target.closest?.('[role="tab"]');
      if (tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const all = $$('[role="tab"]', tab.closest('[role="tablist"]'));
        const next = all[(all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
        selectTab(next);
        next.focus();
      }
      const item = e.target.closest?.('.w95-menu, .w95-startmenu');
      if (item && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const all = $$('button:not(:disabled), a', item);
        const i = all.indexOf(document.activeElement);
        all[(i + (e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length]?.focus();
      }
    });

    // Windows opened at load time get their taskbar buttons.
    $$('.w95-desktop > .w95-window:not([hidden])').forEach((w) => {
      if (!('placed' in w.dataset)) place(w);
      ensureTask(w);
      focus(w);
    });

    const fromHash = () => {
      const id = location.hash.slice(1);
      if (id && /^[\w.~-]+$/.test(id)) open(id);
    };
    fromHash();
    addEventListener('hashchange', fromHash);

    // Pull windows back inside the desktop when the viewport shrinks.
    addEventListener('resize', () => {
      const W = desktop.clientWidth, H = desktop.clientHeight;
      $$('.w95-desktop > .w95-window[data-placed]').forEach((w) => {
        if (w.offsetLeft > W - 40) w.style.left = Math.max(0, W - w.offsetWidth) + 'px';
        if (w.offsetTop > H - 20) w.style.top = Math.max(0, H - w.offsetHeight) + 'px';
      });
    });

    tick();
    setInterval(tick, 15000);
  }

  window.W95 = { open, close: (id) => close(document.getElementById(id)), focus, shutdown };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
