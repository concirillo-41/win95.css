# Contributing

Thanks for wanting to make 1995 better. Issues and pull requests are welcome.

## Setup

```bash
npm install
npx playwright install chromium
npm test
```

`npm test` builds `dist/` and walks the demo in headless Chromium at desktop and phone sizes. It fails
on console errors, broken windows, menus, modals, schemes, or a page that scrolls sideways.
Set `SHOTS=some/folder` to save screenshots, or `PW_CHANNEL=chrome` to use your installed Chrome.

## Where things live

- `src/win95.css` and `src/win95.js`: the hand-written source. Edit these, never `dist/`.
- `tools/build.mjs`: draws the icons and glyphs from character grids and writes `dist/`.
- `tools/font.mjs`: W95 Sans, one character per line.
- `docs/index.html`: the demo, which doubles as the test fixture.

Commit `dist/` along with your change; CI fails if it is out of date.

## Adding an icon

Icons are 16×16 grids in `ICONS` in `tools/build.mjs`. Each character is one pixel; the palette is the
16 VGA colours at the top of the file (`k` black, `w` white, `g` light grey, `d` dark grey, `y` yellow…).
The build warns if a row has the wrong width. Draw original art: no Microsoft icons, no Windows logo.

## Adding a character to the font

Add a line to `GLYPHS` in `tools/font.mjs`. Rows are separated by `|`; row 0 is the cap height,
rows 0–7 sit on the baseline and rows 8–9 are descenders. Lowercase starts at row 2 (`'||…'`).
Accented letters are built from a base letter and a mark in `COMPOSITES`. Bold is generated.

## House rules

- Windows 95, not 98: solid title bars, no gradients by default.
- Every colour comes from a `--w95-*` token so schemes keep working.
- No new dependencies in what ships. Build tools are fine.
- Keep it working on phones and from the keyboard.
