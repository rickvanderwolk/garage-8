const colorInput = document.getElementById('colorInput');
const picker = document.getElementById('picker');
const preview = document.getElementById('preview');
const hexOut = document.getElementById('hexOut');
const rgbOut = document.getElementById('rgbOut');
const hslOut = document.getElementById('hslOut');
const rSlider = document.getElementById('r');
const gSlider = document.getElementById('g');
const bSlider = document.getElementById('b');
const hSlider = document.getElementById('h');
const sSlider = document.getElementById('s');
const lSlider = document.getElementById('l');

let currentColor = { r: 59, g: 130, b: 246 };
let activeFormat = 'hex'; // 'hex', 'rgb', 'hsl'

// Conversions
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function parseColor(input) {
    input = input.trim().toLowerCase();

    // HEX
    const hexMatch = input.match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
    if (hexMatch) return hexToRgb(hexMatch[1]);

    // HSL with prefix: hsl(217, 91%, 60%)
    const hslMatch = input.match(/^hsla?\s*\(\s*(\d{1,3})[\s,]+(\d{1,3})%?[\s,]+(\d{1,3})%?(?:[\s,]+[\d.]+)?\s*\)$/);
    if (hslMatch) {
        return hslToRgb(parseInt(hslMatch[1]) % 360, Math.min(100, parseInt(hslMatch[2])), Math.min(100, parseInt(hslMatch[3])));
    }

    // RGB with prefix: rgb(255, 0, 0)
    const rgbPrefixMatch = input.match(/^rgba?\s*\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,]+[\d.]+)?\s*\)$/);
    if (rgbPrefixMatch) {
        const r = parseInt(rgbPrefixMatch[1]), g = parseInt(rgbPrefixMatch[2]), b = parseInt(rgbPrefixMatch[3]);
        if (r <= 255 && g <= 255 && b <= 255) return { r, g, b };
    }

    // Three numbers without prefix: check for % signs to detect HSL
    const threeNumbers = input.match(/^(\d{1,3})[\s,]+(\d{1,3})(%)?[\s,]+(\d{1,3})(%)?$/);
    if (threeNumbers) {
        const v1 = parseInt(threeNumbers[1]);
        const v2 = parseInt(threeNumbers[2]);
        const hasPercent2 = threeNumbers[3] === '%';
        const v3 = parseInt(threeNumbers[4]);
        const hasPercent3 = threeNumbers[5] === '%';

        // If any % sign, or first value > 255, treat as HSL
        if (hasPercent2 || hasPercent3 || v1 > 255) {
            return hslToRgb(v1 % 360, Math.min(100, v2), Math.min(100, v3));
        }
        // Otherwise treat as RGB
        if (v1 <= 255 && v2 <= 255 && v3 <= 255) {
            return { r: v1, g: v2, b: v3 };
        }
    }

    // Named colors
    const named = { red:'#f00', green:'#0f0', blue:'#00f', white:'#fff', black:'#000', yellow:'#ff0', cyan:'#0ff', magenta:'#f0f', orange:'#ffa500', pink:'#ffc0cb', purple:'#800080', gray:'#808080', grey:'#808080' };
    if (named[input]) return hexToRgb(named[input]);

    return null;
}

function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(l1, l2) {
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function formatColor(r, g, b) {
    const hsl = rgbToHsl(r, g, b);
    switch (activeFormat) {
        case 'rgb': return `rgb(${r}, ${g}, ${b})`;
        case 'hsl': return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        default: return rgbToHex(r, g, b);
    }
}

function createSwatch(r, g, b) {
    const hex = rgbToHex(r, g, b);
    const s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = hex;
    s.dataset.r = r;
    s.dataset.g = g;
    s.dataset.b = b;
    s.onclick = () => {
        const text = formatColor(+s.dataset.r, +s.dataset.g, +s.dataset.b);
        navigator.clipboard.writeText(text);
        s.classList.add('copied');
        setTimeout(() => s.classList.remove('copied'), 500);
    };
    return s;
}

function updateAll(source) {
    const { r, g, b } = currentColor;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    if (source !== 'picker') picker.value = hex;

    hexOut.textContent = hex;
    rgbOut.textContent = `rgb(${r}, ${g}, ${b})`;
    hslOut.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    if (source !== 'rgb') {
        rSlider.value = r;
        gSlider.value = g;
        bSlider.value = b;
    }
    document.getElementById('r-val').textContent = r;
    document.getElementById('g-val').textContent = g;
    document.getElementById('b-val').textContent = b;

    if (source !== 'hsl') {
        hSlider.value = hsl.h;
        sSlider.value = hsl.s;
        lSlider.value = hsl.l;
    }
    document.getElementById('h-val').textContent = hsl.h + '°';
    document.getElementById('s-val').textContent = hsl.s + '%';
    document.getElementById('l-val').textContent = hsl.l + '%';

    preview.style.background = hex;

    const lum = getLuminance(r, g, b);
    const lightText = preview.querySelector('.light');
    const darkText = preview.querySelector('.dark');
    lightText.className = 'contrast-text light' + (getContrast(lum, 1) >= 4.5 ? '' : ' fail');
    darkText.className = 'contrast-text dark' + (getContrast(lum, 0) >= 4.5 ? '' : ' fail');

    generatePalettes(hsl);
}

function generatePalettes(hsl) {
    const { h, s, l } = hsl;

    // Shades
    const shades = document.getElementById('shades');
    shades.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const rgb = hslToRgb(h, s, Math.max(0, l - (l / 6) * i));
        shades.appendChild(createSwatch(rgb.r, rgb.g, rgb.b));
    }

    // Tints
    const tints = document.getElementById('tints');
    tints.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const rgb = hslToRgb(h, s, Math.min(100, l + ((100 - l) / 6) * i));
        tints.appendChild(createSwatch(rgb.r, rgb.g, rgb.b));
    }

    // Harmonies
    function harmonySwatches(id, hues) {
        const el = document.getElementById(id);
        el.innerHTML = '';
        hues.forEach(hue => {
            const rgb = hslToRgb((hue + 360) % 360, s, l);
            el.appendChild(createSwatch(rgb.r, rgb.g, rgb.b));
        });
    }

    harmonySwatches('harmonyComp', [h, h + 180]);
    harmonySwatches('harmonyAnalog', [h - 30, h, h + 30]);
    harmonySwatches('harmonyTriad', [h, h + 120, h + 240]);
    harmonySwatches('harmonySplit', [h, h + 150, h + 210]);
    harmonySwatches('harmonyTetrad', [h, h + 90, h + 180, h + 270]);
}

// Events
colorInput.addEventListener('input', e => {
    const parsed = parseColor(e.target.value);
    if (parsed) {
        currentColor = parsed;
        updateAll('input');
    }
});

picker.addEventListener('input', e => {
    const rgb = hexToRgb(e.target.value);
    if (rgb) {
        currentColor = rgb;
        updateAll('picker');
    }
});

[rSlider, gSlider, bSlider].forEach(slider => {
    slider.addEventListener('input', () => {
        currentColor = { r: +rSlider.value, g: +gSlider.value, b: +bSlider.value };
        updateAll('rgb');
    });
});

[hSlider, sSlider, lSlider].forEach(slider => {
    slider.addEventListener('input', () => {
        currentColor = hslToRgb(+hSlider.value, +sSlider.value, +lSlider.value);
        updateAll('hsl');
    });
});

document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Set active format
        const format = btn.id.replace('Out', '');
        activeFormat = format;
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Copy
        navigator.clipboard.writeText(btn.textContent);
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 600);
    });
});

// Set default active
document.getElementById('hexOut').classList.add('active');

updateAll();
