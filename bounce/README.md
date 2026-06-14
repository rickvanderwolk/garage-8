# Bounce

A 3D arcade game (working title), inspired by the classic Pong. Runs entirely in the browser with [Three.js](https://threejs.org/) — all files are vendored locally, no CDN and no build step.

Move your mouse (or drag on touch) to control the front paddle in both axes; where you hit the ball decides its angle. Neon bloom, sound, a ball trail and a difficulty that ramps up over the match. First to 7 wins.

## Play

Must be served over http(s) — ES modules don't work from `file://`. Locally:

```
cd bounce
python3 -m http.server 8000
# open http://localhost:8000
```

To deploy, just upload the files (keeping the `jsm/` folder structure) to any static web host. Nothing server-side is required.
