// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    generationInterval: 1000,
    historyLength: 20,
    storageKey: 'bloom-v1',
    maxDepth: 10,              // Balanced depth (2^10 = 1024 max branches)
    depthPerGeneration: 5,     // Slower growth: need 5 generations per depth level
    maxBranchCount: 2000       // Hard limit on total branches
};

// ==========================================
// SEEDED RANDOM
// ==========================================
function createRandom(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// ==========================================
// NAME ANALYSIS - Derive all params from name
// ==========================================
function analyzeNameForParams(name) {
    if (!name || name.trim() === '') {
        name = 'Unnamed';
    }

    const lower = name.toLowerCase();
    const letters = lower.replace(/[^a-z]/g, '');

    // Calculate seed from all characters
    let seed = 0;
    for (let i = 0; i < name.length; i++) {
        seed += name.charCodeAt(i) * (i + 1);
    }

    // Count vowels vs consonants
    const vowels = (letters.match(/[aeiou]/g) || []).length;
    const vowelRatio = letters.length > 0 ? vowels / letters.length : 0.5;

    // Check for repeated letters
    const letterCounts = {};
    for (const char of letters) {
        letterCounts[char] = (letterCounts[char] || 0) + 1;
    }
    const maxRepeat = Math.max(...Object.values(letterCounts), 1);
    const hasRepeats = maxRepeat >= 2;
    const manyRepeats = maxRepeat >= 3;

    // Count uppercase vs lowercase
    const uppercase = (name.match(/[A-Z]/g) || []).length;
    const lowercase = (name.match(/[a-z]/g) || []).length;
    const uppercaseRatio = (uppercase + lowercase) > 0 ? uppercase / (uppercase + lowercase) : 0;

    // Count and sum numbers
    const numbers = name.match(/\d/g) || [];
    const numberSum = numbers.reduce((sum, n) => sum + parseInt(n), 0);
    const hasNumbers = numbers.length > 0;

    // Special characters
    const specialChars = name.replace(/[a-zA-Z0-9\s]/g, '').length;

    // First letter determines style direction
    const firstLetter = letters[0] || 'a';
    const firstCode = firstLetter.charCodeAt(0) - 97; // 0-25

    // Derive style from first letter groups
    let style;
    if (firstCode < 7) {          // a-g: tree (reaching up)
        style = 'tree';
    } else if (firstCode < 14) {  // h-n: bush (spreading)
        style = 'bush';
    } else if (firstCode < 21) {  // o-u: vine (flowing)
        style = 'vine';
    } else {                       // v-z: coral (all directions)
        style = 'coral';
    }

    // Derive hue from vowel ratio (warm = many vowels, cool = few)
    // vowelRatio 0 = blue (200), vowelRatio 1 = orange (30)
    let hue = Math.round(200 - vowelRatio * 170);

    // Numbers shift the hue further
    hue = (hue + numberSum * 15) % 360;

    // Name length affects complexity (longer = more branches)
    const complexity = Math.min(name.length / 15, 1); // 0-1

    // Uppercase = more bold/aggressive growth
    // More uppercase = thicker branches, wider spread
    const boldness = uppercaseRatio;

    // Repeats affect symmetry (more repeats = more symmetric)
    const symmetry = manyRepeats ? 0.9 : (hasRepeats ? 0.7 : 0.4);

    // Special chars add mutations/weirdness
    const mutationChance = Math.min(0.08 + specialChars * 0.12, 0.5);

    // Numbers add extra branching chaos
    const chaos = hasNumbers ? Math.min(numbers.length * 0.1, 0.4) : 0;

    // All caps = explosive growth
    const explosive = uppercaseRatio > 0.7;

    // All lowercase = gentle/flowing
    const gentle = uppercaseRatio < 0.1 && lowercase > 0;

    return {
        name: name.trim(),
        seed,
        style,
        hue,
        complexity,
        symmetry,
        mutationChance,
        chaos,
        boldness,
        explosive,
        gentle,
        vowelRatio,
        hasRepeats,
        manyRepeats,
        numberSum
    };
}

// ==========================================
// MUTATIONS - Rare genetic variations
// ==========================================
const MUTATIONS = {
    spiral: {
        name: 'Spiral',
        apply: (branch, depth, rand) => {
            branch.angle += depth * 15 * (rand() > 0.5 ? 1 : -1);
        }
    },
    burst: {
        name: 'Burst',
        apply: (branch, depth, rand, numChildren) => {
            return Math.min(6, numChildren + 2 + Math.floor(rand() * 3));
        }
    },
    giant: {
        name: 'Giant',
        apply: (branch, depth, rand) => {
            branch.length *= 1.5 + rand() * 0.5;
        }
    },
    dwarf: {
        name: 'Dwarf',
        apply: (branch, depth, rand) => {
            branch.length *= 0.4 + rand() * 0.2;
            branch.thickness *= 1.3;
        }
    },
    zigzag: {
        name: 'Zigzag',
        apply: (branch, depth, rand) => {
            branch.angle += (depth % 2 === 0 ? 25 : -25);
        }
    },
    weeping: {
        name: 'Weeping',
        apply: (branch, depth, rand) => {
            branch.angle += depth * 8;
        }
    },
    explosive: {
        name: 'Explosive',
        apply: (branch, depth, rand) => {
            branch.length *= 0.6;
            return 4 + Math.floor(rand() * 3);
        }
    }
};

// ==========================================
// STYLE DEFINITIONS - Each dramatically different
// ==========================================
const STYLES = {
    tree: {
        name: 'Tree',
        startAngle: -90,           // Straight up
        spread: { min: 25, max: 45 },
        curve: 0,
        branchDecay: 0.75,
        thicknessDecay: 0.7,
        minBranches: 2,
        maxBranches: 2,
        gravity: 0,
        startY: 0.9
    },
    bush: {
        name: 'Bush',
        startAngle: -90,
        spread: { min: 40, max: 70 },
        curve: 0,
        branchDecay: 0.65,
        thicknessDecay: 0.6,
        minBranches: 2,
        maxBranches: 3,
        gravity: 0,
        multiTrunk: true,
        startY: 0.95
    },
    vine: {
        name: 'Vine',
        startAngle: -70,           // Slightly angled
        spread: { min: 15, max: 35 },
        curve: 15,                 // Curves as it grows
        branchDecay: 0.8,
        thicknessDecay: 0.8,
        minBranches: 1,
        maxBranches: 2,
        gravity: 8,               // Droops down
        startY: 0.3
    },
    coral: {
        name: 'Coral',
        startAngle: -90,
        spread: { min: 30, max: 90 },
        curve: 5,
        branchDecay: 0.7,
        thicknessDecay: 0.75,
        minBranches: 2,
        maxBranches: 4,
        gravity: 0,
        radial: true,             // Grows in all directions
        startY: 0.85
    }
};

// ==========================================
// STATE
// ==========================================
let state = null;

// ==========================================
// TREE GENERATION
// ==========================================
function generateTree(params, generation) {
    const style = STYLES[params.style] || STYLES.tree;
    const rand = createRandom(params.seed);

    // Determine mutations based on name analysis
    const mutationKeys = Object.keys(MUTATIONS);
    const seedMutations = [];
    for (const key of mutationKeys) {
        // Use mutationChance from name analysis
        if (rand() < (params.mutationChance || 0.15)) {
            seedMutations.push(key);
        }
    }

    // Explosive names get extra mutations
    if (params.explosive) {
        seedMutations.push('burst', 'explosive');
    }

    // Gentle names get weeping/flowing
    if (params.gentle) {
        seedMutations.push('weeping');
    }

    const tree = {
        params,
        style,
        branches: [],
        mutations: seedMutations
    };

    // Base length grows with generation (very gradually)
    // Boldness affects base size
    const boldnessScale = 1 + (params.boldness || 0) * 0.5;
    const growthFactor = (1 + Math.min(generation * 0.005, 1.0)) * boldnessScale;

    // Complexity affects number of trunks/arms
    const complexityBonus = Math.floor((params.complexity || 0.5) * 2);

    // Shared counter to limit total branches
    const counter = { count: 0 };

    // For bush: multiple trunks
    if (style.multiTrunk) {
        const numTrunks = 2 + Math.floor(rand() * 2) + complexityBonus;
        for (let i = 0; i < numTrunks; i++) {
            const angleOffset = (i - (numTrunks - 1) / 2) * (20 + rand() * 20);
            generateBranch(tree.branches, {
                depth: 0,
                angle: style.startAngle + angleOffset,
                length: (35 + rand() * 25) * growthFactor,
                thickness: 5 + rand() * 4,
                generation,
                style,
                rand,
                mutations: seedMutations,
                params
            }, counter);
        }
    }
    // For coral: radial growth
    else if (style.radial) {
        const numArms = 3 + Math.floor(rand() * 4) + complexityBonus;
        for (let i = 0; i < numArms; i++) {
            const baseSpread = 100 + rand() * 40;
            const angle = -90 + (i - (numArms - 1) / 2) * (baseSpread / numArms);
            generateBranch(tree.branches, {
                depth: 0,
                angle: angle + (rand() - 0.5) * 15,
                length: (30 + rand() * 30) * growthFactor,
                thickness: 5 + rand() * 4,
                generation,
                style,
                rand,
                mutations: seedMutations,
                params
            }, counter);
        }
    }
    // Normal single trunk (tree/vine)
    else {
        generateBranch(tree.branches, {
            depth: 0,
            angle: style.startAngle + (rand() - 0.5) * 10,
            length: (45 + rand() * 25) * growthFactor,
            thickness: 6 + rand() * 3,
            generation,
            style,
            rand,
            mutations: seedMutations,
            params
        }, counter);
    }

    return tree;
}

function generateBranch(branches, opts, counter = { count: 0 }) {
    const { depth, angle, length, thickness, generation, style, rand, mutations } = opts;

    // Hard limit on total branches for performance
    if (counter.count >= CONFIG.maxBranchCount) return;
    if (depth > CONFIG.maxDepth) return;

    // Check if this branch should exist at current generation (slower growth)
    const genThreshold = depth * CONFIG.depthPerGeneration;
    if (generation < genThreshold) return;

    counter.count++;

    // Apply gravity (vine droops)
    const gravityEffect = style.gravity * depth * 0.5;

    // Apply curve
    const curveEffect = style.curve * (rand() - 0.5) * depth;

    // CONTINUOUS EVOLUTION: Add time-based variation after initial growth
    const matureGen = CONFIG.maxDepth * CONFIG.depthPerGeneration + 5;
    let timeWobble = 0;
    let timeLengthMod = 1;

    if (generation > matureGen) {
        const phase = (generation - matureGen) * 0.05 + depth * 0.3;
        timeWobble = Math.sin(phase) * 2 * (1 + depth * 0.1);
        timeLengthMod = 1 + Math.sin(phase * 0.5) * 0.05;
    }

    const branch = {
        angle: angle + curveEffect + gravityEffect + timeWobble,
        length: length * timeLengthMod,
        thickness: Math.max(2, thickness),
        depth: depth,
        children: []
    };

    // APPLY MUTATIONS based on seed
    const mutationKeys = Object.keys(MUTATIONS);
    for (const mutKey of mutations || []) {
        const mut = MUTATIONS[mutKey];
        if (mut && mut.apply) {
            mut.apply(branch, depth, rand);
        }
    }

    // Random per-branch mutations (based on seed)
    if (rand() < 0.08) { // 8% chance per branch
        const randomMut = mutationKeys[Math.floor(rand() * mutationKeys.length)];
        MUTATIONS[randomMut].apply(branch, depth, rand);
    }

    branches.push(branch);

    // Determine children
    let numChildren = style.minBranches + Math.floor(rand() * (style.maxBranches - style.minBranches + 1));

    // Check for burst/explosive mutations that affect children count
    if (rand() < 0.05 && depth < CONFIG.maxDepth - 2) {
        numChildren = MUTATIONS.burst.apply(branch, depth, rand, numChildren) || numChildren;
    }

    // SYMMETRY based on name (repeating letters = more symmetric)
    // Low symmetry = more likely to skip branches
    const symmetry = opts.params?.symmetry || 0.5;
    if (rand() > symmetry && numChildren > 1) {
        numChildren--;
    }

    // CHAOS from numbers in name = extra random branches
    const chaos = opts.params?.chaos || 0;
    if (rand() < chaos && numChildren < 5) {
        numChildren++;
    }

    // CONTINUOUS EVOLUTION: Occasionally add extra branches over time
    if (generation > matureGen && depth < CONFIG.maxDepth - 1) {
        const extraBranchChance = Math.sin((generation - matureGen) * 0.05 + depth) * 0.5 + 0.5;
        if (rand() < extraBranchChance * 0.15) {
            numChildren++;
        }
    }

    // Only branch if we have enough generations
    if (generation >= genThreshold + CONFIG.depthPerGeneration) {
        for (let i = 0; i < numChildren; i++) {
            // Calculate child angle
            const spreadRange = style.spread.max - style.spread.min;
            let spread = style.spread.min + rand() * spreadRange;

            // VARIATION: Sometimes much wider or narrower
            if (rand() < 0.1) {
                spread *= (rand() < 0.5) ? 1.5 : 0.6;
            }

            // Alternate sides for balance (but with variation)
            let childAngle;
            if (numChildren === 1) {
                childAngle = (rand() - 0.5) * spread;
            } else {
                const side = (i % 2 === 0) ? -1 : 1;
                const asymmetry = rand() < 0.2 ? (rand() - 0.5) * 20 : 0;
                childAngle = side * (spread / 2 + rand() * 15) + asymmetry;
            }

            // Length variation with growth over time (subtle)
            const timeGrowth = 1 + Math.min(generation * 0.003, 0.5);
            let childLength = length * style.branchDecay * (0.8 + rand() * 0.3) * timeGrowth;
            if (rand() < 0.08) {
                childLength *= rand() < 0.5 ? 1.4 : 0.5; // Occasional outlier
            }

            // Ensure minimum thickness for visibility
            const childThickness = Math.max(2, thickness * style.thicknessDecay);

            generateBranch(branch.children, {
                depth: depth + 1,
                angle: childAngle,
                length: childLength,
                thickness: childThickness,
                generation,
                style,
                rand,
                mutations,
                params: opts.params
            }, counter);
        }
    }
}

// ==========================================
// STATE MANAGEMENT
// ==========================================
function loadState() {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // Validate structure
            if (data && data.boxes && Array.isArray(data.boxes) && data.boxes.length === 4) {
                return data;
            }
            console.warn('Invalid state structure, clearing');
            localStorage.removeItem(CONFIG.storageKey);
        } catch (e) {
            console.error('Failed to load state:', e);
            localStorage.removeItem(CONFIG.storageKey);
        }
    }
    return null;
}

function saveState() {
    // Create a clean copy without cached data (cachedTree can be huge)
    const cleanState = {
        created: state.created,
        lastUpdate: state.lastUpdate,
        generation: state.generation,
        boxes: state.boxes.map(box => ({
            id: box.id,
            params: box.params,
            history: box.history
        }))
    };
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(cleanState));
    } catch (e) {
        // If still too large, trim history more aggressively
        if (e.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded, trimming history');
            state.boxes.forEach(box => {
                box.history = box.history.slice(-CONFIG.historyLength);
            });
            const trimmedState = {
                ...cleanState,
                boxes: cleanState.boxes.map(box => ({
                    ...box,
                    history: box.history.slice(-CONFIG.historyLength)
                }))
            };
            try {
                localStorage.setItem(CONFIG.storageKey, JSON.stringify(trimmedState));
            } catch (e2) {
                console.error('Could not save state even after trimming:', e2);
            }
        }
    }
}

function createNewState(boxParams) {
    return {
        created: Date.now(),
        lastUpdate: Date.now(),
        generation: 0,
        boxes: boxParams.map((params, id) => ({
            id,
            params,
            history: [{ gen: 0, hue: params.hue }]
        }))
    };
}

function resetState() {
    localStorage.removeItem(CONFIG.storageKey);
    state = null;
    showSetup();
}

// ==========================================
// RENDERING
// ==========================================
function render() {
    if (!state) return;

    document.getElementById('generation').textContent = state.generation;

    state.boxes.forEach((box, i) => {
        renderName(i, box);
        renderBox(i, box);
        renderHistory(i, box);
    });
}

function renderName(index, box) {
    const container = document.querySelectorAll('.box')[index];
    const nameEl = container.querySelector('.box-name');
    nameEl.textContent = box.params.name || '';
}

function renderBox(index, box) {
    const container = document.querySelectorAll('.box')[index];
    const canvas = container.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    // CACHE: Only regenerate tree when generation changes
    if (box.cachedGen !== state.generation) {
        box.cachedTree = generateTree(box.params, state.generation);
        box.cachedGen = state.generation;

        // Also cache bounds
        const style = box.cachedTree.style;
        const tempStartX = width / 2;
        const tempStartY = height * style.startY;

        box.cachedBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        for (const branch of box.cachedTree.branches) {
            calculateBounds(branch, tempStartX, tempStartY, 0, box.cachedBounds);
        }
    }

    const tree = box.cachedTree;
    const style = tree.style;
    const bounds = box.cachedBounds;

    const tempStartX = width / 2;
    const tempStartY = height * style.startY;

    // Calculate required zoom to fit tree in canvas with padding
    const padding = 20;
    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;

    const scaleX = (width - padding * 2) / Math.max(treeWidth, 1);
    const scaleY = (height - padding * 2) / Math.max(treeHeight, 1);
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in, only zoom out

    // Center the tree
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    // Apply transform
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const startX = tempStartX;
    const startY = tempStartY;

    for (const branch of tree.branches) {
        drawBranch(ctx, box.params, branch, startX, startY, 0, state.generation);
    }

    ctx.restore();
}

function calculateBounds(branch, x, y, parentAngle, bounds) {
    const angle = parentAngle + branch.angle;
    const radians = angle * Math.PI / 180;
    const endX = x + Math.cos(radians) * branch.length;
    const endY = y + Math.sin(radians) * branch.length;

    bounds.minX = Math.min(bounds.minX, x, endX);
    bounds.maxX = Math.max(bounds.maxX, x, endX);
    bounds.minY = Math.min(bounds.minY, y, endY);
    bounds.maxY = Math.max(bounds.maxY, y, endY);

    for (const child of branch.children) {
        calculateBounds(child, endX, endY, angle, bounds);
    }
}

function drawBranch(ctx, params, branch, x, y, parentAngle, generation) {
    const angle = parentAngle + branch.angle;
    const radians = angle * Math.PI / 180;
    const endX = x + Math.cos(radians) * branch.length;
    const endY = y + Math.sin(radians) * branch.length;

    // RICH COLOR EVOLUTION: Multiple waves at different frequencies
    const slowWave = Math.sin(generation * 0.01) * 30;           // Long-term drift
    const medWave = Math.sin(generation * 0.05 + branch.depth * 0.3) * 15;  // Medium variation
    const fastWave = Math.sin(generation * 0.15 + branch.depth) * 5;        // Quick shimmer

    // Depth-based hue shift (deeper = different color)
    const depthHueShift = branch.depth * 8;

    // Season-like color changes (based on generation cycles)
    const seasonCycle = (generation % 100) / 100;
    const seasonShift = Math.sin(seasonCycle * Math.PI * 2) * 40;

    const hue = (params.hue + depthHueShift + slowWave + medWave + fastWave + seasonShift + 360) % 360;

    // Saturation pulses over time
    const baseSat = 65;
    const satPulse = Math.sin(generation * 0.03 + branch.depth * 0.5) * 20;
    const saturation = Math.max(40, Math.min(90, baseSat + satPulse - branch.depth * 2));

    // Lightness breathing effect
    const baseLight = 55;
    const lightBreath = Math.sin(generation * 0.02 + branch.depth * 0.2) * 10;
    const lightness = Math.max(30, Math.min(70, baseLight + lightBreath - branch.depth * 3));

    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.lineWidth = Math.max(1, branch.thickness);

    // Draw branch with rounded connections
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw connection joint at start (ensures branches connect)
    if (branch.depth > 0) {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(x, y, branch.thickness * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw tip/bud at end of terminal branches
    if (branch.children.length === 0 && branch.depth > 0) {
        // Buds glow and pulse
        const budPulse = Math.sin(generation * 0.1 + branch.depth) * 0.3 + 1;
        const budHue = (hue + 30) % 360; // Slightly different hue for contrast
        const budLight = Math.min(80, lightness + 20);

        ctx.fillStyle = `hsl(${budHue}, ${Math.min(90, saturation + 15)}%, ${budLight}%)`;
        ctx.beginPath();
        ctx.arc(endX, endY, branch.thickness * budPulse, 0, Math.PI * 2);
        ctx.fill();
    }

    for (const child of branch.children) {
        drawBranch(ctx, params, child, endX, endY, angle, generation);
    }
}

function renderHistory(index, box) {
    const container = document.querySelectorAll('.box')[index];
    const historyEl = container.querySelector('.history');

    historyEl.innerHTML = '';
    const history = box.history.slice(-CONFIG.historyLength);

    history.forEach((entry, i) => {
        const div = document.createElement('div');
        div.className = 'gen';

        // Calculate full color range for this generation (trunk to tips)
        const baseHue = entry.hue;
        const maxDepthShift = CONFIG.maxDepth * 8; // 8 degrees per depth level
        const tipHue = (baseHue + maxDepthShift) % 360;

        // Create gradient from trunk color to tip color
        div.style.background = `linear-gradient(to top, hsl(${baseHue}, 65%, 45%), hsl(${tipHue}, 70%, 55%))`;
        div.style.opacity = 0.4 + (i / history.length) * 0.6;
        historyEl.appendChild(div);
    });
}

// ==========================================
// SETUP UI
// ==========================================
function showSetup() {
    document.getElementById('setup').classList.remove('hidden');
}

function hideSetup() {
    document.getElementById('setup').classList.add('hidden');
}

function getSetupValues() {
    const boxParams = [];
    document.querySelectorAll('.box-params').forEach(boxEl => {
        const nameInput = boxEl.querySelector('input[name="name"]');
        const name = nameInput ? nameInput.value : '';

        // Derive ALL parameters from the name
        const params = analyzeNameForParams(name);
        boxParams.push(params);
    });
    return boxParams;
}

// ==========================================
// COLOR CALCULATION (shared between render and history)
// ==========================================
function calculateEvolvedHue(baseHue, generation) {
    // Same formula as in drawBranch, but for depth 0 (trunk)
    const slowWave = Math.sin(generation * 0.01) * 30;
    const medWave = Math.sin(generation * 0.05) * 15;
    const seasonCycle = (generation % 100) / 100;
    const seasonShift = Math.sin(seasonCycle * Math.PI * 2) * 40;

    return (baseHue + slowWave + medWave + seasonShift + 360) % 360;
}

// ==========================================
// EVOLUTION LOOP
// ==========================================
function evolve() {
    if (!state) return;

    state.generation++;
    state.lastUpdate = Date.now();

    state.boxes.forEach(box => {
        // Store the actual evolved hue for the timeline
        const evolvedHue = calculateEvolvedHue(box.params.hue, state.generation);

        box.history.push({
            gen: state.generation,
            hue: evolvedHue
        });

        if (box.history.length > CONFIG.historyLength * 2) {
            box.history = box.history.slice(-CONFIG.historyLength);
        }
    });

    saveState();
    render();
}

let loopStarted = false;

function startLoop() {
    if (loopStarted) return;
    loopStarted = true;

    // Small delay before starting to let page render
    setTimeout(() => {
        setInterval(() => {
            if (state) {
                evolve();
            }
        }, CONFIG.generationInterval);
    }, 100);
}

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    state = loadState();

    if (state) {
        hideSetup();
        // Delay initial render slightly
        setTimeout(() => {
            render();
            startLoop();
        }, 50);
    } else {
        showSetup();
    }

    document.getElementById('start-btn').addEventListener('click', () => {
        const boxParams = getSetupValues();
        state = createNewState(boxParams);
        saveState();
        hideSetup();
        render();
        startLoop();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Alles resetten? Dit kan niet ongedaan worden.')) {
            resetState();
        }
    });

    window.addEventListener('resize', () => {
        if (state) {
            // Clear cached bounds on resize
            state.boxes.forEach(box => {
                box.cachedGen = -1;
            });
            render();
        }
    });
}

init();
