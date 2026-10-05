// Drives the demo in headless Chromium at desktop and phone sizes and fails on anything broken.
// Usage: npm run check            (bundled Chromium; `npx playwright install chromium` once)
//        PW_CHANNEL=chrome npm run check   (use installed Chrome instead)
//        SHOTS=some/dir npm run check      (also save screenshots)
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = 'file://' + join(root, 'docs/index.html');
const shots = process.env.SHOTS;
const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || undefined });
const failures = [];
const errors = [];
let step = '';
const check = (ok, msg) => { if (!ok) failures.push(`${step}: ${msg}`); };
const shot = async (p, name) => shots && p.screenshot({ path: join(shots, name + '.png') });

async function page(width, height, touch = false) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage();
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.evaluate(() => document.fonts.ready);
  return p;
}
const shown = (p, id) => p.evaluate((i) => !document.getElementById(i).hidden, id);

// ---------------- Desktop ----------------
const d = await page(1280, 800);
step = 'desktop load';
check(await shown(d, 'welcome'), 'welcome window not open');
check(await d.evaluate(() => document.fonts.check('11px "W95 Sans"')), 'W95 Sans did not load');
await shot(d, 'desktop');
await d.click('#welcome .is-default');

step = 'icons';
for (const id of await d.$$eval('.w95-icons .w95-desk-icon', (els) => els.map((e) => e.dataset.open))) {
  await d.dblclick(`.w95-icons [data-open="${id}"]`);
  check(await shown(d, id), `${id} did not open on double-click`);
  await d.click(`#${id} .w95-controls [data-action="close"]`);
  check(!(await shown(d, id)), `${id} did not close`);
}

step = 'drag';
await d.evaluate(() => W95.open('readme'));
const before = await d.$eval('#readme', (w) => [w.offsetLeft, w.offsetTop]);
const bar = await (await d.$('#readme .w95-titlebar')).boundingBox();
await d.mouse.move(bar.x + 80, bar.y + 8);
await d.mouse.down();
await d.mouse.move(bar.x + 280, bar.y + 108, { steps: 4 });
await d.mouse.up();
const after = await d.$eval('#readme', (w) => [w.offsetLeft, w.offsetTop]);
check(after[0] - before[0] === 200 && after[1] - before[1] === 100, `window moved by ${after[0] - before[0]},${after[1] - before[1]}, expected 200,100`);
await d.evaluate(() => W95.close('readme'));

step = 'start menu';
await d.click('.w95-start');
check(await shown(d, 'startmenu'), 'Start menu did not open');
await d.hover('[aria-controls="sm-programs"]');
check(await shown(d, 'sm-programs'), 'Programs submenu did not open on hover');
await shot(d, 'start-submenu');
await d.click('#sm-programs [data-open="readme"]');
check(await shown(d, 'readme'), 'Notepad did not open from the submenu');
check(!(await shown(d, 'startmenu')), 'Start menu stayed open after choosing an item');
await d.evaluate(() => W95.close('readme'));

step = 'keyboard submenu';
await d.click('.w95-start');
await d.focus('[aria-controls="sm-programs"]');
await d.keyboard.press('ArrowRight');
check(await shown(d, 'sm-programs'), 'ArrowRight did not open the submenu');
check(await d.evaluate(() => document.activeElement.closest('#sm-programs') !== null), 'focus did not move into the submenu');
await d.keyboard.press('ArrowLeft');
check(!(await shown(d, 'sm-programs')), 'ArrowLeft did not close the submenu');
await d.keyboard.press('Escape');
check(!(await shown(d, 'startmenu')), 'Escape did not close the Start menu');

step = 'right-click menu';
await d.click('.w95-icons', { button: 'right', position: { x: 600, y: 400 } });
check(await shown(d, 'desk-menu'), 'desktop menu did not open on right-click');
await d.hover('[aria-controls="desk-arrange"]');
check(await shown(d, 'desk-arrange'), 'Arrange Icons submenu did not open');
await shot(d, 'context-menu');
await d.click('[data-arrange="name"]');
check(!(await shown(d, 'desk-menu')), 'menu stayed open after choosing an item');
const first = await d.$eval('.w95-icons .w95-desk-icon', (e) => e.textContent.trim());
check(first === 'Control Panel', `icons not sorted by name (first is ${first})`);
await d.click('.w95-icons', { button: 'right', position: { x: 600, y: 400 } });
await d.keyboard.press('Escape');
check(!(await shown(d, 'desk-menu')), 'Escape did not close the right-click menu');
await d.focus('.w95-icons .w95-desk-icon');
await d.keyboard.press('Shift+F10');
check(await shown(d, 'desk-menu'), 'Shift+F10 did not open the menu');
await d.keyboard.press('Escape');

step = 'modal';
await d.evaluate(() => W95.open('msg-restart'));
check(await shown(d, 'msg-restart'), 'modal did not open');
check(await d.evaluate(() => document.activeElement.textContent === 'Yes'), 'default button not focused');
await d.click('.w95-icons', { position: { x: 30, y: 30 }, force: true });
check(await d.$eval('#msg-restart', (w) => w.classList.contains('is-flashing')), 'clicking outside did not flash the dialog');
check(await d.$$eval('.w95-desk-icon[aria-selected="true"]', (e) => e.length === 0), 'desktop accepted a click behind the modal');
await d.keyboard.press('Tab');
await d.keyboard.press('Tab');
check(await d.evaluate(() => document.activeElement.closest('#msg-restart') !== null), 'Tab left the modal');
await d.keyboard.press('Escape');
check(!(await shown(d, 'msg-restart')), 'Escape did not close the modal');
check(await d.$$eval('.w95-modal-backdrop', (e) => e.length === 0), 'backdrop left behind');

step = 'schemes';
for (const [name, title] of [['high-contrast', 'rgb(128, 0, 128)'], ['desert', 'rgb(0, 128, 128)'], ['standard', 'rgb(0, 0, 128)']]) {
  await d.evaluate((n) => { W95.scheme(n); W95.open('components'); }, name);
  const bg = await d.$eval('#components .w95-titlebar', (t) => getComputedStyle(t).backgroundColor);
  check(bg === title, `${name}: title bar is ${bg}, expected ${title}`);
  if (name === 'high-contrast') {
    const edge = await d.$eval('#components .is-default', (b) => getComputedStyle(b).boxShadow);
    check(edge.includes('rgb(255, 255, 255)'), 'high contrast buttons have no white edge');
    await shot(d, 'high-contrast');
  }
}

// ---------------- Phone ----------------
const m = await page(390, 844, true);
step = 'phone';
await m.tap('#welcome .is-default');
check(!(await shown(m, 'welcome')), 'welcome did not close');
for (const id of await m.$$eval('.w95-icons .w95-desk-icon', (els) => els.map((e) => e.dataset.open))) {
  await m.tap(`.w95-icons [data-open="${id}"]`);
  check(await shown(m, id), `${id} did not open on tap`);
  const box = await m.$eval(`#${id}`, (w) => [w.offsetLeft, w.offsetWidth, innerWidth]);
  check(box[0] === 0 && box[1] === box[2], `${id} is not full width on a phone`);
  await m.tap(`#${id} .w95-controls [data-action="close"]`);
  check(!(await shown(m, id)), `${id} did not close on tap`);
}
step = 'phone long-press';
await m.evaluate(() => {
  const el = document.querySelector('.w95-icons');
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', clientX: 200, clientY: 500, isPrimary: true }));
});
await m.waitForTimeout(700);
check(await shown(m, 'desk-menu'), 'long-press did not open the menu');
await shot(m, 'phone-menu');
await m.evaluate(() => {
  document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
  W95.closeMenus();
});
step = 'phone layout';
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
check(overflow === 0, `page scrolls sideways by ${overflow}px`);

await browser.close();
if (errors.length) failures.push(...errors.map((e) => 'console: ' + e));
if (failures.length) {
  console.error(`✗ ${failures.length} problem(s):\n  ` + failures.join('\n  '));
  process.exit(1);
}
console.log('✓ demo checks passed (desktop + phone)');
