// Builds dist/win95.css (W95 Sans font + pixel icons as data URIs + core) and dist/win95.js.
// Icons are original pixel art, authored below as character grids; the font lives in font.mjs.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFont } from './font.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// 16-colour VGA palette, plus the two bevel greys.
const PAL = {
  k: '#000000', K: '#0a0a0a', w: '#ffffff', W: '#ffffff', g: '#c0c0c0', G: '#00ff00',
  l: '#dfdfdf', d: '#808080', y: '#ffff00', o: '#808000', b: '#0000ff', n: '#000080',
  r: '#ff0000', m: '#800000', c: '#00ffff', t: '#008080', e: '#008000', p: '#800080',
};

const ICONS = {
  folder: [
    '................',
    '................',
    '..kkkkk.........',
    '.kyyyyyk........',
    'kyywyyyykkkkkk..',
    'kywyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'kyyyyyyyyyyyyok.',
    'koooooooooooook.',
    '.kkkkkkkkkkkkkk.',
    '................',
  ],
  computer: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kwggggggggggdk.',
    '.kgknnnnnnnnkdk.',
    '.kgkncnnnnnnkdk.',
    '.kgknnnnnnnnkdk.',
    '.kgknnnnnnnnkdk.',
    '.kgknnnnnnnnkdk.',
    '.kgkkkkkkkkkkdk.',
    '.kgggggggggggdk.',
    '.kddddddddddddk.',
    '.kkkkkkkkkkkkkk.',
    '...kgggggggggk..',
    '..kwggggggggdgk.',
    '..kkkkkkkkkkkkk.',
    '................',
  ],
  notepad: [
    '..kkkkkkkkkk....',
    '..kwwwwwwwwkk...',
    '..kwwwwwwwwkwk..',
    '..kwkkkkkwwkkkk.',
    '..kwwwwwwwwwwwk.',
    '..kwkkkkkkkwwwk.',
    '..kwwwwwwwwwwwk.',
    '..kwkkkkkkkkkwk.',
    '..kwwwwwwwwwwwk.',
    '..kwkkkkkkwwwwk.',
    '..kwwwwwwwwwwwk.',
    '..kwkkkkkkkkkwk.',
    '..kwwwwwwwwwwwk.',
    '..kwwwwwwwwwwwk.',
    '..kkkkkkkkkkkkk.',
    '................',
  ],
  recycle: [
    '................',
    '....kkkkkkkk....',
    '...kwgggggggdk..',
    '..kkkkkkkkkkkkk.',
    '..kwgdgdgdgdgdk.',
    '...kgdgdgdgdgk..',
    '...kwdgdgdgdgk..',
    '...kgdgdgdgdgk..',
    '...kwdgdgdgdgk..',
    '...kgdgdgdgdgk..',
    '...kwdgdgdgdgk..',
    '...kgdgdgdgdgk..',
    '....kgdgdgdgk...',
    '....kkkkkkkkk...',
    '................',
    '................',
  ],
  globe: [
    '................',
    '.....kkkkkk.....',
    '...kkbbGGbbkk...',
    '..kbbGGGGbbbbk..',
    '..kbGGGGGbbGbk..',
    '.kbbbGGGbbbGGbk.',
    '.kbbbbGGbbbGGGk.',
    '.kbbbbbGbbbbGbk.',
    '.kbbbbbbbGGbbbk.',
    '.kbbbbbbGGGGbbk.',
    '.kbbbbbbbGGGbbk.',
    '..kbbbbbbbGbbk..',
    '..kbbbbbbbbbbk..',
    '...kkbbbbbbkk...',
    '.....kkkkkk.....',
    '................',
  ],
  mail: [
    '................',
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kwkwwwwwwwwkwk.',
    '.kwwkwwwwwwkwwk.',
    '.kwwwkwwwwkwwwk.',
    '.kwwwwkwwkwwwwk.',
    '.kwwwkwkkwkwwwk.',
    '.kwwkwwwwwwkwwk.',
    '.kwkwwwwwwwwkwk.',
    '.kkwwwwwwwwwwkk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
    '................',
  ],
  briefcase: [
    '................',
    '................',
    '................',
    '.....kkkkkk.....',
    '....kokkkkok....',
    '....kok..kok....',
    '.kkkkkkkkkkkkkk.',
    '.kyyyyyyyyyyyok.',
    '.kyyyyyyyyyyyok.',
    '.kooooookkooook.',
    '.kyyyyykwkyyyok.',
    '.kyyyyyykkyyyok.',
    '.kyyyyyyyyyyyok.',
    '.k' + 'o'.repeat(12) + 'k.',
    '.kkkkkkkkkkkkkk.',
    '................',
  ],
  controls: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.knnnnnnnnnnnnk.',
    '.kggggggggggggk.',
    '.kgggwwkggggggk.',
    '.kddddwdkddddgk.',
    '.kgggwdkggggggk.',
    '.kggggkkggggggk.',
    '.kggggggggggggk.',
    '.kggggggwwkgggk.',
    '.kddddddddwdkdk.',
    '.kggggggggwdkgk.',
    '.kggggggggkkggk.',
    '.kggggggggggggk.',
    '.kkkkkkkkkkkkkk.',
    '................',
  ],
  error: [
    '................',
    '.....kkkkkk.....',
    '...kkrrrrrrkk...',
    '..krrrrrrrrrrk..',
    '..krrwrrrrwrrk..',
    '.krrrwwrrwwrrrk.',
    '.krrrrwwwwrrrrk.',
    '.krrrrrwwrrrrrk.',
    '.krrrrwwwwrrrrk.',
    '.krrrwwrrwwrrrk.',
    '..krrwrrrrwrrk..',
    '..krrrrrrrrrrk..',
    '...kkrrrrrrkk...',
    '.....kkkkkk.....',
    '................',
    '................',
  ],
  info: [
    '................',
    '.....kkkkkk.....',
    '...kkwwwwwwkk...',
    '..kwwwwbbwwwwk..',
    '..kwwwwbbwwwwk..',
    '.kwwwwwwwwwwwwk.',
    '.kwwwwbbbwwwwwk.',
    '.kwwwwwbbwwwwwk.',
    '.kwwwwwbbwwwwwk.',
    '.kwwwwwbbwwwwwk.',
    '..kwwwwbbwwwwk..',
    '..kwwwbbbbwwwk..',
    '...kkwwwwwwkk...',
    '....kkwkkkk.....',
    '....kwk.........',
    '....kk..........',
  ],
  warning: [
    '.......kk.......',
    '......kyyk......',
    '......kyyk......',
    '.....kyyyyk.....',
    '.....kykkyk.....',
    '....kyykkyyk....',
    '....kyykkyyk....',
    '...kyyykkyyyk...',
    '...kyyykkyyyk...',
    '..kyyyykkyyyyk..',
    '..kyyyyyyyyyyk..',
    '.kyyyyykkyyyyyk.',
    '.kyyyyykkyyyyyk.',
    'kyyyyyyyyyyyyyyk',
    'kkkkkkkkkkkkkkkk',
    '................',
  ],
  doc: [
    '..kkkkkkkkkk....',
    '..kwwwwwwwwkk...',
    '..kwwwwwwwwkwk..',
    '..kwbbbbbwwkkkk.',
    '..kwwwwwwwwwwwk.',
    '..kwnnnnnnnnnwk.',
    '..kwwwwwwwwwwwk.',
    '..kwnnnnnnnnnwk.',
    '..kwwwwwwwwwwwk.',
    '..kwnnnnnnnwwwk.',
    '..kwwwwwwwwwwwk.',
    '..kwnnnnnnnnnwk.',
    '..kwwwwwwwwwwwk.',
    '..kwnnnnnwwwwwk.',
    '..kkkkkkkkkkkkk.',
    '................',
  ],
  floppy: [
    '.kkkkkkkkkkkkk..',
    '.knngggggggknnk.',
    '.knngggkkggknnk.',
    '.knngggkkggknnk.',
    '.knngggggggknnk.',
    '.knnnnnnnnnnnnk.',
    '.knnnnnnnnnnnnk.',
    '.knwwwwwwwwwwnk.',
    '.knwkkkkkkkkwnk.',
    '.knwwwwwwwwwwnk.',
    '.knwkkkkkkwwwnk.',
    '.knwwwwwwwwwwnk.',
    '.knwwwwwwwwwwnk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
  ],
  paint: [
    '................',
    '....kkkkkkk.....',
    '..kkyyyyyyykk...',
    '.kyyrryyybbyyk..',
    'kyyyrryyybbyyyk.',
    'kyyyyyyyyyyyyyk.',
    'kyGGyyykkyyyyyk.',
    'kyGGyyk..kyyyk..',
    'kyyyyyk..kyyk...',
    'kyyyyyykkyyyk...',
    'kyyppyyyyyyyk...',
    '.kyppyyyyyyk....',
    '..kkyyyyyykk....',
    '....kkkkkk......',
    '................',
    '................',
  ],
  cd: [
    '................',
    '.....kkkkkk.....',
    '...kkllwwwwkk...',
    '..kllcwwwwwwdk..',
    '..klcwwwwwwwdk..',
    '.klcwwwkkwwwwdk.',
    '.kcwwwkddkwwwdk.',
    '.kwwwwkd.kwwwdk.',
    '.kwwwwkkkkwwwdk.',
    '.kwwwwwwwwwwpdk.',
    '..kwwwwwwwwpdk..',
    '..kdwwwwwwpddk..',
    '...kkddddddkk...',
    '.....kkkkkk.....',
    '................',
    '................',
  ],
  star: [
    '................',
    '.....kkkkkk.....',
    '...kknnnnnnkk...',
    '..knnnnnnnwnnk..',
    '..knnynnnnnnnk..',
    '.knnyyynnnnnnnk.',
    '.knnnynnnnnwnnk.',
    '.knnnnnnnnnnnnk.',
    '.knnnnnnnynnnnk.',
    '.knwnnnnyyynnnk.',
    '..knnnnnnynnnk..',
    '..knnnnnnnnnnk..',
    '...kknnnnnnkk...',
    '.....kkkkkk.....',
    '................',
    '................',
  ],
};

// Small glyphs used by the core stylesheet (control chrome).
const GLYPHS = {
  'g-close': ['kk....kk', '.kk..kk.', '..kkkk..', '...kk...', '..kkkk..', '.kk..kk.', 'kk....kk'],
  'g-max': ['kkkkkkkkk', 'kkkkkkkkk', 'k.......k', 'k.......k', 'k.......k', 'k.......k', 'k.......k', 'k.......k', 'kkkkkkkkk'],
  'g-min': ['kkkkkk', 'kkkkkk'],
  'g-restore': ['..kkkkkk', '..kkkkkk', '..k....k', 'kkkkkk.k', 'kkkkkk.k', 'k....kkk', 'k....k..', 'k....k..', 'kkkkkk..'],
  'g-down': ['kkkkkkk', '.kkkkk.', '..kkk..', '...k...'],
  'g-up': ['...k...', '..kkk..', '.kkkkk.', 'kkkkkkk'],
  'g-left': ['...k', '..kk', '.kkk', 'kkkk', '.kkk', '..kk', '...k'],
  'g-right': ['k...', 'kk..', 'kkk.', 'kkkk', 'kkk.', 'kk..', 'k...'],
  'g-check': ['......k', '.....kk', 'k...kkk', 'kk.kkk.', 'kkkkk..', '.kkk...', '..k....'],
  'g-radio': [
    '....dddd....', '..ddKKKKdd..', '.dKKWWWWllw.', '.dKWWWWWWlw.',
    'dKWWWWWWWWlw', 'dKWWWWWWWWlw', 'dKWWWWWWWWlw', 'dKWWWWWWWWlw',
    '.dKWWWWWWlw.', '.dllWWWWllw.', '..wwllllww..', '....wwww....',
  ],
  'g-dot': ['.kk.', 'kkkk', 'kkkk', '.kk.'],
  'g-grip': [
    '...........', '.........wd', '........wd.', '.......wd..', '......wd..w', '.....wd..wd',
    '....wd..wd.', '...wd..wd..', '..wd..wd..w', '.wd..wd..wd', 'wd..wd..wd.',
  ],
};

// Disabled variants: glyph ink goes grey, radio interior goes button-face.
const VARIANTS = {
  'g-check-off': ['g-check', { k: PAL.d }],
  'g-radio-off': ['g-radio', { W: PAL.g }],
  'g-dot-off': ['g-dot', { k: PAL.d }],
  'g-down-off': ['g-down', { k: PAL.d }],
};
// High Contrast Black: white ink on black, radio wells inverted.
const HC = { k: '#ffffff', K: '#ffffff', W: '#000000', w: '#808080', l: '#808080', d: '#808080' };
for (const g of ['g-close', 'g-max', 'g-min', 'g-restore', 'g-down', 'g-up', 'g-left', 'g-right', 'g-check', 'g-radio', 'g-dot']) VARIANTS[`${g}-hc`] = [g, HC];

function svg(rows, name, pal = PAL) {
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((r, i) => {
    if (r.length !== w) console.warn(`! ${name} row ${i} is ${r.length} wide, expected ${w}`);
  });
  const paths = {};
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== '.' && pal[ch]) (paths[pal[ch]] ??= []).push(`M${x} ${y}h${end - x}v1h-${end - x}z`);
      else if (ch !== '.') console.warn(`! ${name}: unknown colour "${ch}"`);
      x = end;
    }
  });
  const rects = Object.entries(paths).map(([fill, d]) => `<path fill="${fill}" d="${d.join('')}"/>`).join('');
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${rows.length}" viewBox="0 0 ${w} ${rows.length}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${doc.replace(/"/g, "'").replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}

// Sequential on purpose: wawoff2 hands back a view into its wasm heap, which a second call overwrites.
const regular = await buildFont();
const bold = await buildFont({ bold: true });
mkdirSync(join(root, 'fonts'), { recursive: true });
writeFileSync(join(root, 'fonts/w95-sans.woff2'), regular);
writeFileSync(join(root, 'fonts/w95-sans-bold.woff2'), bold);
console.log(`fonts/w95-sans.woff2 ${regular.length} B, bold ${bold.length} B`);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

let assets = `@font-face{font-family:"W95 Sans";src:url("data:font/woff2;base64,${regular.toString('base64')}") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"W95 Sans";src:url("data:font/woff2;base64,${bold.toString('base64')}") format("woff2");font-weight:700;font-style:normal;font-display:swap}
:root{\n`;
for (const [name, rows] of Object.entries(GLYPHS)) assets += `  --w95-${name}:${svg(rows, name)};\n`;
for (const [name, [base, over]] of Object.entries(VARIANTS)) assets += `  --w95-${name}:${svg(GLYPHS[base], name, { ...PAL, ...over })};\n`;
for (const [name, rows] of Object.entries(ICONS)) assets += `  --w95-i-${name}:${svg(rows, name)};\n`;
assets += '}\n';
for (const name of Object.keys(ICONS)) assets += `.w95-ico-${name}{background-image:var(--w95-i-${name})}\n`;

const banner = `/*! win95.css v${pkg.version} | MIT License | ${pkg.homepage || 'win95.css'}
 * W95 Sans pixel font and icons are original, drawn for this project.
 * Not affiliated with or endorsed by Microsoft. */\n`;
mkdirSync(join(root, 'dist'), { recursive: true });
const core = readFileSync(join(root, 'src/win95.css'), 'utf8');
const css = banner + '\n/* ---- fonts + icons (generated) ---- */\n' + assets + '\n' + core;
writeFileSync(join(root, 'dist/win95.css'), css);
writeFileSync(join(root, 'dist/win95.js'), `/*! win95.js v${pkg.version} | MIT License */\n` + readFileSync(join(root, 'src/win95.js'), 'utf8'));
console.log(`dist/win95.css  ${(css.length / 1024).toFixed(1)} KB, ${Object.keys(ICONS).length} icons`);
console.log('dist/win95.js');

// Demo site for the docs artifact: the host wraps the page in its own <html>/<head>/<body>.
const html = readFileSync(join(root, 'docs/index.html'), 'utf8')
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?html[^>]*>\s*/gi, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<meta (charset|name="viewport")[^>]*>\s*/gi, '')
  .replace(/<body([^>]*)>/i, '<div data-body$1>')
  .replace(/<\/body>/i, '</div>')
  .replaceAll('../dist/', 'dist/');
mkdirSync(join(root, 'site/dist'), { recursive: true });
writeFileSync(join(root, 'site/index.html'), html);
cpSync(join(root, 'dist'), join(root, 'site/dist'), { recursive: true });
console.log('site/ written');
