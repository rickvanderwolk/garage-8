const $ = id => document.getElementById(id);
const urlsInput = $('urls');
const layoutsContainer = $('layouts');
const startButton = $('start');
const setup = $('setup');
const viewer = $('viewer');
const scaleInput = $('scale');
const scaleValue = $('scale-value');

let selectedLayout = null;

scaleInput.oninput = () => {
    scaleValue.textContent = scaleInput.value + '%';
};

// Predefined layouts for 2-6 items
// Areas format: row-start/col-start/row-end/col-end
const layouts = {
    2: [
        { cols: '1fr 1fr', rows: '1fr' },           // side by side
        { cols: '1fr', rows: '1fr 1fr' },           // stacked
        { cols: '2fr 1fr', rows: '1fr' },           // large left
        { cols: '1fr 2fr', rows: '1fr' },           // large right
        { cols: '1fr', rows: '2fr 1fr' },           // large top
        { cols: '1fr', rows: '1fr 2fr' }            // large bottom
    ],
    3: [
        { cols: '1fr 1fr', rows: '1fr 1fr', areas: ['1/1/3/2', '1/2/2/3', '2/2/3/3'] },  // large left
        { cols: '1fr 1fr', rows: '1fr 1fr', areas: ['1/1/2/2', '2/1/3/2', '1/2/3/3'] },  // large right
        { cols: '1fr 1fr', rows: '1fr 1fr', areas: ['1/1/2/3', '2/1/3/2', '2/2/3/3'] },  // large top
        { cols: '1fr 1fr', rows: '1fr 1fr', areas: ['1/1/2/2', '1/2/2/3', '2/1/3/3'] },  // large bottom
        { cols: '1fr 1fr 1fr', rows: '1fr' },                                            // row
        { cols: '1fr', rows: '1fr 1fr 1fr' }                                             // column
    ],
    4: [
        { cols: '1fr 1fr', rows: '1fr 1fr' },                                            // 2x2 grid
        { cols: '1fr 1fr 1fr 1fr', rows: '1fr' },                                        // row
        { cols: '1fr', rows: '1fr 1fr 1fr 1fr' },                                        // column
        { cols: '1fr 1fr', rows: '1fr 1fr 1fr', areas: ['1/1/4/2', '1/2/2/3', '2/2/3/3', '3/2/4/3'] },  // large left
        { cols: '1fr 1fr', rows: '1fr 1fr 1fr', areas: ['1/1/2/2', '2/1/3/2', '3/1/4/2', '1/2/4/3'] },  // large right
        { cols: '1fr 1fr 1fr', rows: '1fr 1fr', areas: ['1/1/2/4', '2/1/3/2', '2/2/3/3', '2/3/3/4'] },  // large top
        { cols: '1fr 1fr 1fr', rows: '1fr 1fr', areas: ['1/1/2/2', '1/2/2/3', '1/3/2/4', '2/1/3/4'] }   // large bottom
    ],
    5: [
        { cols: 'repeat(6,1fr)', rows: '1fr 1fr', areas: ['1/1/2/3', '1/3/2/5', '1/5/2/7', '2/2/3/4', '2/4/3/6'] },  // 3 top, 2 bottom
        { cols: 'repeat(6,1fr)', rows: '1fr 1fr', areas: ['1/2/2/4', '1/4/2/6', '2/1/3/3', '2/3/3/5', '2/5/3/7'] },  // 2 top, 3 bottom
        { cols: '1fr 1fr', rows: 'repeat(4,1fr)', areas: ['1/1/5/2', '1/2/2/3', '2/2/3/3', '3/2/4/3', '4/2/5/3'] },  // large left
        { cols: '1fr 1fr', rows: 'repeat(4,1fr)', areas: ['1/1/2/2', '2/1/3/2', '3/1/4/2', '4/1/5/2', '1/2/5/3'] },  // large right
        { cols: 'repeat(4,1fr)', rows: '1fr 1fr', areas: ['1/1/2/5', '2/1/3/2', '2/2/3/3', '2/3/3/4', '2/4/3/5'] },  // large top
        { cols: 'repeat(4,1fr)', rows: '1fr 1fr', areas: ['1/1/2/2', '1/2/2/3', '1/3/2/4', '1/4/2/5', '2/1/3/5'] }   // large bottom
    ],
    6: [
        { cols: '1fr 1fr 1fr', rows: '1fr 1fr' },                                        // 3x2 grid
        { cols: '1fr 1fr', rows: '1fr 1fr 1fr' },                                        // 2x3 grid
        { cols: '1fr 1fr 1fr', rows: '1fr 1fr 1fr', areas: ['1/1/4/2', '1/2/2/3', '1/3/2/4', '2/2/3/3', '2/3/3/4', '3/2/4/4'] },  // large left
        { cols: '1fr 1fr 1fr', rows: '1fr 1fr 1fr', areas: ['1/1/2/2', '1/2/2/3', '2/1/3/2', '2/2/3/3', '3/1/4/3', '1/3/4/4'] },  // large right
        { cols: 'repeat(5,1fr)', rows: '1fr 1fr', areas: ['1/1/2/6', '2/1/3/2', '2/2/3/3', '2/3/3/4', '2/4/3/5', '2/5/3/6'] },    // large top
        { cols: 'repeat(5,1fr)', rows: '1fr 1fr', areas: ['1/1/2/2', '1/2/2/3', '1/3/2/4', '1/4/2/5', '1/5/2/6', '2/1/3/6'] }     // large bottom
    ]
};

function getUrls() {
    return urlsInput.value.split(',').map(u => u.trim()).filter(Boolean);
}

// Generate grid areas, stretching last row items to fill empty space
function generateAreas(count, cols, rows) {
    if (cols * rows === count) return null;

    const areas = [];
    const lastRowStart = cols * (rows - 1);
    const lastRowCount = count - lastRowStart;
    const span = cols / lastRowCount;

    for (let i = 0; i < lastRowStart; i++) {
        const r = Math.floor(i / cols) + 1;
        const c = (i % cols) + 1;
        areas.push(`${r}/${c}/${r + 1}/${c + 1}`);
    }

    for (let i = 0; i < lastRowCount; i++) {
        areas.push(`${rows}/${Math.round(i * span) + 1}/${rows + 1}/${Math.round((i + 1) * span) + 1}`);
    }

    return areas;
}

// Generate layouts dynamically for counts without predefined layouts (7+)
function generateLayouts(count) {
    const options = [];
    for (let cols = 1; cols <= Math.min(count, 6); cols++) {
        const rows = Math.ceil(count / cols);
        if (cols * rows - count < cols) {
            options.push({
                cols: `repeat(${cols},1fr)`,
                rows: `repeat(${rows},1fr)`,
                areas: generateAreas(count, cols, rows)
            });
        }
    }
    return options;
}

function renderLayouts(count) {
    layoutsContainer.innerHTML = '';
    selectedLayout = null;
    startButton.disabled = true;

    const options = layouts[count] || generateLayouts(count);

    options.forEach(layout => {
        const el = document.createElement('div');
        el.className = 'layout';
        el.style.gridTemplateColumns = layout.cols;
        el.style.gridTemplateRows = layout.rows;

        for (let i = 0; i < count; i++) {
            const cell = document.createElement('div');
            if (layout.areas?.[i]) cell.style.gridArea = layout.areas[i];
            el.appendChild(cell);
        }

        el.onclick = () => {
            layoutsContainer.querySelectorAll('.layout').forEach(l => l.classList.remove('selected'));
            el.classList.add('selected');
            selectedLayout = layout;
            startButton.disabled = false;
        };

        layoutsContainer.appendChild(el);
    });

    if (options.length === 1) layoutsContainer.firstChild.click();
}

urlsInput.oninput = () => renderLayouts(getUrls().length);

// Load saved state
const saved = JSON.parse(localStorage.getItem('splitscreen') || 'null');
if (saved) {
    urlsInput.value = saved.urls;
    scaleInput.value = saved.scale;
    scaleValue.textContent = saved.scale + '%';
    renderLayouts(getUrls().length);
    if (saved.layoutIndex >= 0) {
        layoutsContainer.children[saved.layoutIndex]?.click();
    }
}

startButton.onclick = () => {
    const urls = getUrls();
    if (!urls.length || !selectedLayout) return;

    localStorage.setItem('splitscreen', JSON.stringify({
        urls: urlsInput.value,
        scale: scaleInput.value,
        layoutIndex: [...layoutsContainer.children].indexOf(layoutsContainer.querySelector('.selected'))
    }));

    setup.classList.add('hidden');
    viewer.classList.add('active');
    viewer.style.gridTemplateColumns = selectedLayout.cols;
    viewer.style.gridTemplateRows = selectedLayout.rows;

    const scale = scaleInput.value / 100;

    urls.forEach((url, i) => {
        const container = document.createElement('div');
        container.className = 'frame loading';
        if (selectedLayout.areas?.[i]) container.style.gridArea = selectedLayout.areas[i];

        const iframe = document.createElement('iframe');
        iframe.src = url.includes('://') ? url : 'https://' + url;
        iframe.style.width = (100 / scale) + '%';
        iframe.style.height = (100 / scale) + '%';
        iframe.style.transform = `scale(${scale})`;
        iframe.onload = () => container.classList.remove('loading');

        container.appendChild(iframe);
        viewer.appendChild(container);
    });
};
