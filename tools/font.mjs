// W95 Sans: an original pixel font for win95.css, drawn on a grid and built into WOFF2.
//
// Each glyph is a list of rows separated by "|", "#" = ink. Row 0 is the cap height,
// rows 0-7 sit on the baseline, rows 8-9 are descenders. Lowercase x-height is rows 2-7.
// Missing rows are blank. Width comes from the longest row; every glyph gets 1px of space after it.
// Bold is the regular smeared one pixel to the right, the way Windows emboldened bitmap fonts.
import opentype from 'opentype.js';
import { compress } from 'wawoff2';

export const GLYPHS = {
  // Capitals
  A: '...#...|..#.#..|..#.#..|.#...#.|.#...#.|.#####.|#.....#|#.....#',
  B: '####.|#...#|#...#|####.|#...#|#...#|#...#|####.',
  C: '..###.|.#...#|#.....|#.....|#.....|#.....|.#...#|..###.',
  D: '####..|#...#.|#....#|#....#|#....#|#....#|#...#.|####..',
  E: '#####|#....|#....|####.|#....|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....|#....',
  G: '..###.|.#...#|#.....|#.....|#..###|#....#|.#...#|..###.',
  H: '#....#|#....#|#....#|######|#....#|#....#|#....#|#....#',
  I: '#|#|#|#|#|#|#|#',
  J: '...#|...#|...#|...#|...#|#..#|#..#|.##.',
  K: '#...#|#..#.|#.#..|##...|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#....|#####',
  M: '#.....#|##...##|#.#.#.#|#..#..#|#.....#|#.....#|#.....#|#.....#',
  N: '#....#|##...#|#.#..#|#.#..#|#..#.#|#..#.#|#...##|#....#',
  O: '..##..|.#..#.|#....#|#....#|#....#|#....#|.#..#.|..##..',
  P: '####.|#...#|#...#|#...#|####.|#....|#....|#....',
  Q: '..##..|.#..#.|#....#|#....#|#....#|#....#|.#..#.|..##..|...#..|....##',
  R: '####.|#...#|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.###.|#...#|#....|.#...|..##.|....#|#...#|.###.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#....#|#....#|#....#|#....#|#....#|#....#|.#..#.|..##..',
  V: '#.....#|#.....#|.#...#.|.#...#.|..#.#..|..#.#..|...#...|...#...',
  W: '#...#...#|#...#...#|#...#...#|.#.#.#.#.|.#.#.#.#.|.#.#.#.#.|..#...#..|..#...#..',
  X: '#...#|#...#|.#.#.|..#..|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|..#..|.#...|#....|#####',

  // Lowercase
  a: '||.###.|....#|.####|#...#|#..##|.##.#',
  b: '#....|#....|####.|#...#|#...#|#...#|#...#|####.',
  c: '||.###|#...|#...|#...|#...|.###',
  d: '....#|....#|.####|#...#|#...#|#...#|#...#|.####',
  e: '||.###.|#...#|#####|#....|#...#|.###.',
  f: '.##|#..|###|#..|#..|#..|#..|#..',
  g: '||.####|#...#|#...#|#...#|#...#|.####|....#|.###.',
  h: '#....|#....|####.|#...#|#...#|#...#|#...#|#...#',
  i: '#||#|#|#|#|#|#',
  j: '.#||.#|.#|.#|.#|.#|.#|.#|#.',
  k: '#...|#...|#..#|#.#.|##..|#.#.|#..#|#..#',
  l: '#|#|#|#|#|#|#|#',
  m: '||######.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#',
  n: '||####.|#...#|#...#|#...#|#...#|#...#',
  o: '||.###.|#...#|#...#|#...#|#...#|.###.',
  p: '||####.|#...#|#...#|#...#|#...#|####.|#....|#....',
  q: '||.####|#...#|#...#|#...#|#...#|.####|....#|....#',
  r: '||#.##|##..|#...|#...|#...|#...',
  s: '||.###|#...|.##.|...#|...#|###.',
  t: '|#..|###|#..|#..|#..|#..|.##',
  u: '||#...#|#...#|#...#|#...#|#...#|.####',
  v: '||#...#|#...#|.#.#.|.#.#.|..#..|..#..',
  w: '||#.....#|#..#..#|#..#..#|#..#..#|.#.#.#.|.#...#.',
  x: '||#...#|.#.#.|..#..|..#..|.#.#.|#...#',
  y: '||#...#|#...#|#...#|.#.#.|.#.#.|..#..|..#..|##...',
  z: '||####|...#|..#.|.#..|#...|####',
  ı: '||#|#|#|#|#|#',

  // Figures: all five wide, so columns of numbers line up
  0: '.###.|#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  1: '..#..|.##..|#.#..|..#..|..#..|..#..|..#..|..#..',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#....|#####',
  3: '.###.|#...#|....#|..##.|....#|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#..#.|#####|...#.|...#.',
  5: '#####|#....|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|#...#|.###.',
  7: '#####|....#|...#.|...#.|..#..|..#..|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|#...#|.###.',
  9: '.###.|#...#|#...#|#...#|.####|....#|...#.|.##..',

  // Punctuation and symbols
  '!': '#|#|#|#|#|#||#',
  '"': '#.#|#.#',
  '#': '.#.#.|.#.#.|#####|.#.#.|.#.#.|#####|.#.#.|.#.#.',
  $: '..#..|.####|#.#..|.###.|..#.#|..#.#|####.|..#..',
  '%': '.#....#|#.#..#.|.#..#..|...#...|..#....|.#..#..|#..#.#.|....#..',
  '&': '.##..|#..#.|#..#.|.##..|#.#.#|#..#.|#..#.|.##.#',
  "'": '#|#',
  '(': '..#|.#.|.#.|#..|#..|#..|#..|.#.|.#.|..#',
  ')': '#..|.#.|.#.|..#|..#|..#|..#|.#.|.#.|#..',
  '*': '..#..|#.#.#|.###.|#.#.#|..#..',
  '+': '||..#..|..#..|#####|..#..|..#..',
  ',': '|||||||.#|#.',
  '-': '|||||####',
  '.': '|||||||#',
  '/': '....#|...#.|...#.|..#..|..#..|.#...|.#...|#....',
  ':': '|||#||||#',
  ';': '|||.#||||.#|#.',
  '<': '|...#|..#.|.#..|#...|.#..|..#.|...#',
  '=': '|||####||####',
  '>': '|#...|.#..|..#.|...#|..#.|.#..|#...',
  '?': '.###.|#...#|....#|...#.|..#..|..#..||..#..',
  '@': '..####.|.#....#|#..##.#|#.#.#.#|#.#.#.#|#..###.|.#.....|..####.',
  '[': '##|#.|#.|#.|#.|#.|#.|#.|#.|##',
  '\\': '#....|.#...|.#...|..#..|..#..|...#.|...#.|....#',
  ']': '##|.#|.#|.#|.#|.#|.#|.#|.#|##',
  '^': '..#..|.#.#.|#...#',
  _: '||||||||#####',
  '`': '#.|.#',
  '{': '..#|.#.|.#.|.#.|#..|.#.|.#.|.#.|.#.|..#',
  '|': '#|#|#|#|#|#|#|#|#|#',
  '}': '#..|.#.|.#.|.#.|..#|.#.|.#.|.#.|.#.|#..',
  '~': '|||.##.#|#.##.',
  '·': '||||#',
  '–': '|||||#####',
  '—': '|||||#########',
  '‘': '.#|#.|##',
  '’': '##|.#|#.',
  '“': '.#..#|#..#.|##.##',
  '”': '##.##|.#..#|#..#.',
  '…': '|||||||#..#..#',
  '©': '.#####.|#.....#|#.###.#|#.#...#|#.#...#|#.###.#|#.....#|.#####.',
  '•': '|||.##.|####|####|.##.',
  '±': '|..#..|..#..|#####|..#..|..#..||#####',
  '×': '||#...#|.#.#.|..#..|.#.#.|#...#',
  '°': '.#.|#.#|.#.',
  '€': '..###|.#...|####.|.#...|####.|.#...|.#...|..###',
  '£': '..##.|.#..#|.#...|####.|.#...|.#...|.#...|#####',
};

// Accent marks, drawn over a base glyph.
const MARKS = {
  acute: ['.#', '#.'],
  grave: ['#.', '.#'],
  circ: ['.#.', '#.#'],
  dier: ['#.#'],
  tilde: ['.#.#', '#.#.'],
};
const COMPOSITES = {
  é: ['e', 'acute'], è: ['e', 'grave'], ê: ['e', 'circ'], ë: ['e', 'dier'],
  á: ['a', 'acute'], à: ['a', 'grave'], â: ['a', 'circ'], ä: ['a', 'dier'],
  ó: ['o', 'acute'], ò: ['o', 'grave'], ô: ['o', 'circ'], ö: ['o', 'dier'],
  ú: ['u', 'acute'], ù: ['u', 'grave'], û: ['u', 'circ'], ü: ['u', 'dier'],
  í: ['ı', 'acute'], ì: ['ı', 'grave'], î: ['ı', 'circ'], ï: ['ı', 'dier'],
  ñ: ['n', 'tilde'],
  É: ['E', 'acute'], È: ['E', 'grave'], Ü: ['U', 'dier'], Ö: ['O', 'dier'], Ä: ['A', 'dier'], Ñ: ['N', 'tilde'],
};

const ROWS = 12; // two rows of headroom for accents on capitals, then rows 0-9 above
const TOP = 2;
const PX = 100; // font units per pixel
const BASELINE_ROW = TOP + 7; // last row that sits on the baseline

function parse(src) {
  const rows = src.split('|');
  const w = Math.max(1, ...rows.map((r) => r.length));
  const grid = Array.from({ length: ROWS }, () => Array(w).fill(false));
  rows.forEach((r, y) => [...r].forEach((c, x) => (grid[TOP + y][x] = c === '#')));
  return grid;
}

function bitmaps() {
  const out = {};
  for (const [ch, src] of Object.entries(GLYPHS)) out[ch] = parse(src);
  out['ç'] = parse(GLYPHS.c + '|..#.|.##.');
  for (const [ch, [base, mark]] of Object.entries(COMPOSITES)) {
    const g = out[base].map((r) => [...r]);
    const m = MARKS[mark];
    const w = g[0].length;
    const mw = m[0].length;
    const x0 = Math.max(0, Math.ceil((w - mw) / 2));
    const lower = base === base.toLowerCase();
    // Lowercase marks sit one row above the x-height with a pixel of air; capitals use the headroom.
    const yEnd = lower ? TOP : TOP - 1;
    m.forEach((row, i) => {
      const y = yEnd - (m.length - 1) + i;
      [...row].forEach((c, x) => { if (c === '#' && g[y]) g[y][x0 + x] = true; });
    });
    out[ch] = g;
  }
  return out;
}

const embolden = (g) => g.map((r) => [...r, false].map((on, x) => on || (x > 0 && r[x - 1])));

function glyphFor(ch, grid, advancePx) {
  const path = new opentype.Path();
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) { x++; continue; }
      let end = x;
      while (end < row.length && row[end]) end++;
      const top = (BASELINE_ROW - y + 1) * PX;
      const bottom = top - PX;
      path.moveTo(x * PX, top);
      path.lineTo(x * PX, bottom);
      path.lineTo(end * PX, bottom);
      path.lineTo(end * PX, top);
      path.close();
      x = end;
    }
  });
  return new opentype.Glyph({ name: ch === ' ' ? 'space' : 'uni' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'), unicode: ch.codePointAt(0), advanceWidth: advancePx * PX, path });
}

export async function buildFont({ bold = false } = {}) {
  const maps = bitmaps();
  const glyphs = [
    new opentype.Glyph({ name: '.notdef', advanceWidth: 6 * PX, path: (() => {
      const p = new opentype.Path();
      p.moveTo(0, 0); p.lineTo(0, 800); p.lineTo(500, 800); p.lineTo(500, 0); p.close();
      p.moveTo(100, 100); p.lineTo(100, 700); p.lineTo(400, 700); p.lineTo(400, 100); p.close();
      return p;
    })() }),
    glyphFor(' ', [[]], bold ? 4 : 3),
    glyphFor(' ', [[]], bold ? 4 : 3),
  ];
  glyphs[2].name = 'uni00A0';
  for (const [ch, grid] of Object.entries(maps)) {
    const g = bold ? embolden(grid) : grid;
    glyphs.push(glyphFor(ch, g, g[0].length + 1));
  }
  const font = new opentype.Font({
    familyName: 'W95 Sans',
    styleName: bold ? 'Bold' : 'Regular',
    unitsPerEm: 11 * PX,
    ascender: 10 * PX,
    descender: -3 * PX,
    designer: 'Con Cirillo',
    designerURL: 'https://concirillo.com',
    license: 'MIT License',
    version: '1.0',
    // Fixed date (Windows 95 launch day) so every build is byte-identical.
    createdTimestamp: Date.UTC(1995, 7, 24) / 1000,
    glyphs,
  });
  font.tables.os2.usWeightClass = bold ? 700 : 400;
  font.tables.os2.fsSelection = bold ? 0x20 : 0x40;
  font.tables.os2.sxHeight = 6 * PX;
  font.tables.os2.sCapHeight = 8 * PX;
  // opentype.js stamps the head table's "modified" date with the clock; pin it too.
  const LAUNCH = Date.UTC(1995, 7, 24);
  const getTime = Date.prototype.getTime;
  Date.prototype.getTime = function () { return LAUNCH; };
  let otf;
  try { otf = Buffer.from(font.toArrayBuffer()); } finally { Date.prototype.getTime = getTime; }
  return Buffer.from(await compress(otf));
}

export const charset = () => [' ', ...Object.keys(bitmaps())];
