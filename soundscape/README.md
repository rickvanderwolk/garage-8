# Soundscape

Een interactieve web-app waar je kunt tekenen en je tekening wordt omgezet in een soundscape.

## Concept

Soundscape combineert visuele creativiteit met audio-experimenten. Terwijl je tekent, wordt elk aspect van je tekening vertaald naar geluid:

- **Kleur** → Instrument/timbre (12 verschillende instrumenten)
- **Y-positie** → Toonhoogte/volume (boven = luider)
- **Penselgrootte** → Volume/intensiteit
- **Tekensnelheid** → Note density

## Features

### Tekenen
- Freehand tekenen met muis of touch
- 12 vaste kleuren, elk gekoppeld aan een uniek instrument
- 3 penselgroottes (klein, medium, groot)
- Gum tool om onderdelen te wissen
- Undo functie voor laatste stroke
- Clear knop om alles te wissen

### Audio Modes
1. **Real-time modus**: Hoor direct geluid tijdens het tekenen
2. **Playback modus**: Scan je tekening horizontaal en speel het af als soundscape
   - Verstelbare afspeelsnelheid (1-10)
   - Visuele scan-line indicator

### Keyboard Shortcuts
- `Ctrl/Cmd + Z`: Undo
- `D`: Tekengereedschap
- `E`: Gum
- `Space`: Start/stop playback
- `1-9`: Selecteer kleur 1 t/m 9

## Technologie

- **Vanilla JavaScript** - Geen frameworks, pure web APIs
- **Web Audio API** - Procedurele audio synthesis zonder externe samples
- **HTML5 Canvas** - Voor het tekenen
- **Responsive design** - Werkt op desktop, tablet en mobile

## Architectuur

```
soundscape/
├── index.html          # Main HTML structure
├── style.css           # All styling
├── audio-engine.js     # Web Audio API synthesizer (30+ instruments)
├── canvas-engine.js    # Drawing logic, stroke recording
├── sound-mapper.js     # Maps drawing parameters to sound
├── playback.js         # Spatial playback scanner
└── ui.js              # UI controller, event handlers
```

## Audio Mapping Details

### Kleur → Instrument Mapping

| Kleur | Instrument |
|-------|-----------|
| Rood | Kick 1 |
| Turquoise | Kick 2 |
| Blauw | Snare 1 |
| Koraal | Snare 2 |
| Mint | Hi-Hat Closed |
| Geel | Hi-Hat Open |
| Paars | Clap |
| Lichtblauw | Tom Low |
| Perzik | Tom Mid |
| Roze | Bass 1 |
| Donkerpaars | Synth 1 |
| Marineblauw | Synth 2 |

### Real-time Mode
- Triggert geluid tijdens het tekenen
- Volume wordt bepaald door Y-positie en penselgrootte
- Snelheid van tekenen beïnvloedt trigger frequency (throttled to 50ms)

### Playback Mode
- Scant canvas van links naar rechts
- Samples pixels verticaal op basis van afspeelsnelheid
- Hogere snelheid = minder samples = snellere playback
- Langzamere snelheid = meer samples = meer gedetailleerd geluid

## Browser Compatibility

Werkt in alle moderne browsers die ondersteuning hebben voor:
- Web Audio API
- HTML5 Canvas
- ES6 JavaScript

## Gebruik

Open gewoon `index.html` in je browser. Geen build stap of dependencies nodig!

## Inspiratie

Geïnspireerd door:
- MS Paint's eenvoudige interface
- Chrome Music Lab's toegankelijke audio experiments
- Brian Eno's generative music concepten
