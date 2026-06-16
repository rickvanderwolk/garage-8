# Bounce

A 3D neon arcade experiment, inspired by classic paddle-and-ball games and built
up step by step. Runs entirely in the browser with [Three.js](https://threejs.org/)
— all files are vendored locally, no CDN and no build step.

Each version is a self-contained `index.html`. The heavy shared assets
(`three.module.js` and the `jsm/` folder) live once in the root and every version
links to them with `../`, so there is no duplication.

## Versions

| | Folder | What it is |
|---|---|---|
| 01 | `01-bounce/` | The original — a 3D take on paddle-and-ball, you vs. the AI in an open box. |
| 02 | `02-obstacles/` | Moving blocks drift through the field and deflect the ball. |
| 03 | `03-shapes/` | Arcade mode — glowing coloured block-shapes as obstacles, with waves, streaks and lives. |
| 04 | `04-stack/` | The mash-up — steer falling pieces (arrow keys / on-screen buttons) while keeping the rally alive; locked blocks are obstacles and full rows clear. |
| 05 | `05-2d/` | The same mash-up flattened to 2D in a classic-arcade style (scanlines, chip-tune blips). Pure 2D canvas, no Three.js. |

The root `index.html` is a menu linking to all five.

## Controls

- **All versions:** move your mouse (or drag on touch) to control the front paddle
  in both axes; where you hit the ball decides its angle.
- **04 · Stack and 05 · 2D:** `←` / `→` move the falling piece, `↑` rotates, `↓` drops.
  On touch, use the on-screen buttons. `space` (or tap) starts / pauses.

## Play

Must be served over http(s) — ES modules don't work from `file://`. Locally:

```
cd bounce
python3 -m http.server 8000
# open http://localhost:8000
```

To deploy, upload the files keeping the folder structure (the version folders plus
the shared `three.module.js` and `jsm/`). Nothing server-side is required.
