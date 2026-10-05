// Headless walk-through of the docs demo. Usage: PW_DIR=<dir containing node_modules/playwright> OUT=<dir> node tools/shoot.mjs
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW_DIR + '/');
const { chromium } = require('playwright');
const url = 'file://' + process.cwd() + '/docs/index.html';
const out = process.env.OUT || '/tmp';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const errors = [];
async function page(w, h, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const p = await ctx.newPage();
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  return p;
}
const p = await page(1280, 800);
await p.screenshot({ path: `${out}/desk-welcome.png` });
await p.click('#welcome [data-action="close"].is-default');
for (const id of ['internet', 'readme', 'components']) await p.evaluate((i) => W95.open(i), id);
await p.click('#components [role=tab]:nth-child(4)');
await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}/desk-many.png` });
// drag
const bar = await p.$('#components .w95-titlebar');
const b = await bar.boundingBox();
await p.mouse.move(b.x + 60, b.y + 8); await p.mouse.down(); await p.mouse.move(b.x + 400, b.y + 120, { steps: 5 }); await p.mouse.up();
await p.click('#components [role=tab]:nth-child(1)');
await p.click('#readme .w95-titlebar'); // focus readme
await p.click('#readme .w95-menubar button[aria-controls="readme-file"]');
await p.click('.w95-start');
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/desk-menus.png` });
await p.keyboard.press('Escape');
await p.evaluate(() => W95.open('components')); await p.click('#components [role=tab]:nth-child(2)');
await p.evaluate(() => W95.open('msg-error'));
await p.screenshot({ path: `${out}/desk-inputs.png` });
await p.evaluate(() => { W95.open('recycle'); W95.open('briefcase'); });
await p.screenshot({ path: `${out}/desk-lists.png` });
const m = await page(390, 844, { touch: true });
await m.screenshot({ path: `${out}/phone-welcome.png` });
await m.tap('#welcome [data-action="close"].is-default');
await m.screenshot({ path: `${out}/phone-desktop.png` });
await m.tap('.w95-desk-icon[data-open="internet"]');
await m.screenshot({ path: `${out}/phone-internet.png` });
await m.tap('.w95-start');
await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/phone-start.png` });
const ow = await m.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log('phone horizontal overflow px:', ow);
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
