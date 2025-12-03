(function() {
  // Check for ?wc=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('wc') !== 'true') return;

  // State
  let logs = [];
  let filter = 'all';

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    #wc-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 250px;
      background: #1e1e1e;
      color: #fff;
      font-family: Monaco, Consolas, monospace;
      font-size: 12px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      border-top: none;
    }
    #wc-container.wc-collapsed {
      height: 30px;
    }
    #wc-container.wc-collapsed #wc-logs,
    #wc-container.wc-collapsed #wc-input-row {
      display: none;
    }
    #wc-container.wc-fullscreen {
      height: 100%;
      top: 0;
    }
    #wc-resize {
      height: 3px;
      cursor: ns-resize;
      flex-shrink: 0;
    }
    #wc-resize:hover {
      background: #007acc;
    }
    #wc-toolbar {
      display: flex;
      gap: 3px;
      padding: 5px;
      background: #2d2d2d;
      border-bottom: 1px solid #444;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .wc-spacer {
      flex: 1;
    }
    #wc-toolbar button {
      background: #444;
      color: #fff;
      border: none;
      padding: 3px 6px;
      cursor: pointer;
      border-radius: 3px;
      font-size: 11px;
    }
    #wc-toolbar button:hover {
      background: #555;
    }
    #wc-toolbar button.wc-active {
      background: #007acc;
    }
    #wc-toolbar button[data-filter] .wc-label {
      display: none;
    }
    .wc-count {
      background: rgba(255,255,255,0.2);
      padding: 1px 5px;
      border-radius: 8px;
      font-size: 10px;
    }
    #wc-count-error {
      background: #e06c75;
    }
    #wc-count-warn {
      background: #e5c07b;
      color: #1e1e1e;
    }
    #wc-count-info {
      background: #61afef;
      color: #1e1e1e;
    }
    #wc-count-log {
      background: #888;
    }
    #wc-count-debug {
      background: #b48ead;
    }
    @media (min-width: 500px) {
      #wc-toolbar button[data-filter] .wc-label {
        display: inline;
        margin-right: 3px;
      }
    }
    #wc-logs {
      flex: 1;
      overflow-y: auto;
      padding: 5px;
    }
    .wc-log {
      padding: 1px 5px;
      border-bottom: 1px solid #2a2a2a;
      white-space: pre-wrap;
      word-break: break-all;
      font-size: clamp(10px, 2.5vw, 12px);
      line-height: 1.3;
      display: flex;
      align-items: flex-start;
    }
    .wc-log-debug { color: #b48ead; }
    .wc-log-log { color: #d4d4d4; }
    .wc-log-info { color: #61afef; }
    .wc-log-warn { color: #e5c07b; background: rgba(255,200,0,0.1); }
    .wc-log-error { color: #e06c75; background: rgba(255,0,0,0.1); }
    .wc-log-icon {
      margin-right: 6px;
      flex-shrink: 0;
      width: 12px;
      text-align: center;
    }
    .wc-log-time {
      color: #555;
      margin-right: 6px;
      flex-shrink: 0;
      font-size: 10px;
    }
    .wc-log-msg {
      flex: 1;
      min-width: 0;
    }
    #wc-input-row {
      display: flex;
      border-top: 1px solid #444;
      flex-shrink: 0;
    }
    #wc-input {
      flex: 1;
      background: #2d2d2d;
      color: #fff;
      border: none;
      padding: 8px;
      font-family: inherit;
      font-size: clamp(10px, 2.5vw, 12px);
      outline: none;
    }
    #wc-input::placeholder {
      color: #666;
    }
    #wc-run {
      background: #007acc;
      color: #fff;
      border: none;
      padding: 8px 15px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const container = document.createElement('div');
  container.id = 'wc-container';
  container.innerHTML = `
    <div id="wc-resize"></div>
    <div id="wc-toolbar">
      <button data-filter="all" class="wc-active"><span class="wc-label">All</span><span class="wc-count" id="wc-count-all">0</span></button>
      <button data-filter="error"><span class="wc-label">Error</span><span class="wc-count" id="wc-count-error">0</span></button>
      <button data-filter="warn"><span class="wc-label">Warn</span><span class="wc-count" id="wc-count-warn">0</span></button>
      <button data-filter="info"><span class="wc-label">Info</span><span class="wc-count" id="wc-count-info">0</span></button>
      <button data-filter="log"><span class="wc-label">Log</span><span class="wc-count" id="wc-count-log">0</span></button>
      <button data-filter="debug"><span class="wc-label">Debug</span><span class="wc-count" id="wc-count-debug">0</span></button>
      <span class="wc-spacer"></span>
      <button id="wc-clear">Clear</button>
      <button id="wc-fullscreen">[ ]</button>
      <button id="wc-toggle">_</button>
    </div>
    <div id="wc-logs"></div>
    <div id="wc-input-row">
      <input type="text" id="wc-input" placeholder="Execute JavaScript...">
      <button id="wc-run">Run</button>
    </div>
  `;
  document.body.appendChild(container);

  const logsEl = document.getElementById('wc-logs');
  const inputEl = document.getElementById('wc-input');

  const icons = {
    debug: '·',
    log: '▸',
    info: 'ⓘ',
    warn: '⚠',
    error: '✕'
  };

  // Render logs
  function render() {
    const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);
    logsEl.innerHTML = filtered.map(l => `
      <div class="wc-log wc-log-${l.type}">
        <span class="wc-log-icon">${icons[l.type] || '▸'}</span>
        <span class="wc-log-time">${l.time}</span>
        <span class="wc-log-msg">${escapeHtml(l.msg)}</span>
      </div>
    `).join('');
    logsEl.scrollTop = logsEl.scrollHeight;
    updateCounts();
  }

  function updateCounts() {
    const counts = { all: logs.length, debug: 0, log: 0, info: 0, warn: 0, error: 0 };
    logs.forEach(l => counts[l.type]++);
    Object.keys(counts).forEach(type => {
      document.getElementById('wc-count-' + type).textContent = counts[type];
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getTime() {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  }

  function formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  // Override console methods
  const originalConsole = {
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    trace: console.trace.bind(console)
  };

  ['log', 'debug', 'info', 'warn', 'error'].forEach(type => {
    console[type] = function(...args) {
      originalConsole[type](...args);
      let msg = formatArgs(args);
      // Add stack trace for errors
      if (type === 'error') {
        const stack = new Error().stack;
        if (stack) {
          const lines = stack.split('\n').slice(2, 5).join('\n');
          msg += '\n' + lines;
        }
      }
      logs.push({ type, msg, time: getTime() });
      render();
    };
  });

  console.trace = function(...args) {
    originalConsole.trace(...args);
    const stack = new Error().stack;
    const lines = stack ? stack.split('\n').slice(2).join('\n') : '';
    logs.push({ type: 'debug', msg: 'Trace: ' + formatArgs(args) + '\n' + lines, time: getTime() });
    render();
  };

  // Catch uncaught errors
  window.addEventListener('error', (e) => {
    logs.push({
      type: 'error',
      msg: `${e.message}\n  at ${e.filename}:${e.lineno}:${e.colno}`,
      time: getTime()
    });
    render();
  });

  window.addEventListener('unhandledrejection', (e) => {
    logs.push({
      type: 'error',
      msg: `Unhandled Promise: ${e.reason}`,
      time: getTime()
    });
    render();
  });

  // Filter buttons
  document.querySelectorAll('#wc-toolbar button[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#wc-toolbar button[data-filter]').forEach(b => b.classList.remove('wc-active'));
      btn.classList.add('wc-active');
      filter = btn.dataset.filter;
      render();
    });
  });

  // Clear button
  document.getElementById('wc-clear').addEventListener('click', () => {
    logs = [];
    render();
  });

  // Store custom height
  let customHeight = null;

  // Toggle collapse
  document.getElementById('wc-toggle').addEventListener('click', () => {
    container.classList.remove('wc-fullscreen');
    if (container.classList.contains('wc-collapsed')) {
      container.classList.remove('wc-collapsed');
      container.style.height = customHeight || '250px';
    } else {
      container.classList.add('wc-collapsed');
      container.style.height = '';
    }
  });

  // Toggle fullscreen
  document.getElementById('wc-fullscreen').addEventListener('click', () => {
    container.classList.remove('wc-collapsed');
    if (container.classList.contains('wc-fullscreen')) {
      container.classList.remove('wc-fullscreen');
      if (customHeight) {
        container.style.height = customHeight;
      }
    } else {
      container.classList.add('wc-fullscreen');
      container.style.height = '';
    }
  });

  // Resize drag
  const resizeEl = document.getElementById('wc-resize');
  let isResizing = false;

  resizeEl.addEventListener('mousedown', (e) => {
    isResizing = true;
    e.preventDefault();
  });

  resizeEl.addEventListener('touchstart', (e) => {
    isResizing = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY;
    customHeight = Math.max(100, Math.min(newHeight, window.innerHeight - 50)) + 'px';
    container.style.height = customHeight;
  });

  document.addEventListener('touchmove', (e) => {
    if (!isResizing) return;
    const touch = e.touches[0];
    const newHeight = window.innerHeight - touch.clientY;
    customHeight = Math.max(100, Math.min(newHeight, window.innerHeight - 50)) + 'px';
    container.style.height = customHeight;
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
  });

  document.addEventListener('touchend', () => {
    isResizing = false;
  });

  // Execute JS
  function executeInput() {
    const code = inputEl.value.trim();
    if (!code) return;

    console.log('> ' + code);
    try {
      const result = eval(code);
      if (result !== undefined) {
        console.log(result);
      }
    } catch (e) {
      console.error(e.message);
    }
    inputEl.value = '';
  }

  document.getElementById('wc-run').addEventListener('click', executeInput);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeInput();
  });

  // Initial message
  console.info('wc active');
})();
