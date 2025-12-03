(function() {
  // Check for ?wc=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('wc') !== 'true') return;

  // State
  let logs = [];
  let filter = 'all';
  let activePanel = 'console';

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
    #wc-container.wc-collapsed #wc-content,
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
    #wc-filters {
      display: flex;
      gap: 3px;
      padding: 3px 5px;
      background: #252525;
      flex-shrink: 0;
    }
    #wc-filters button {
      background: #3a3a3a;
      color: #fff;
      border: none;
      padding: 2px 5px;
      cursor: pointer;
      border-radius: 3px;
      font-size: 10px;
    }
    #wc-filters button:hover {
      background: #4a4a4a;
    }
    #wc-filters button.wc-active {
      background: #007acc;
    }
    #wc-container[data-panel="storage"] #wc-filters {
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
    #wc-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    #wc-logs, #wc-storage {
      flex: 1;
      overflow-y: auto;
      padding: 5px;
    }
    #wc-storage {
      display: none;
    }
    #wc-container[data-panel="storage"] #wc-logs,
    #wc-container[data-panel="storage"] #wc-input-row,
    #wc-container[data-panel="storage"] #wc-filters {
      display: none;
    }
    #wc-container[data-panel="storage"] #wc-storage {
      display: block;
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
    /* Storage styles */
    .wc-storage-section {
      margin-bottom: 10px;
    }
    .wc-storage-header {
      color: #61afef;
      padding: 4px 0;
      cursor: pointer;
      user-select: none;
    }
    .wc-storage-header:hover {
      color: #8ac6f5;
    }
    .wc-storage-items {
      padding-left: 15px;
    }
    .wc-storage-item {
      padding: 2px 0;
      cursor: pointer;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }
    .wc-storage-item:hover > .wc-storage-key,
    .wc-storage-item:hover > .wc-storage-toggle {
      background: rgba(255,255,255,0.05);
    }
    .wc-storage-key {
      color: #98c379;
    }
    .wc-storage-toggle {
      color: #666;
      width: 12px;
      text-align: center;
      flex-shrink: 0;
    }
    .wc-storage-empty {
      color: #666;
      font-style: italic;
    }
    .wc-storage-children {
      width: 100%;
      padding-left: 16px;
      border-left: 1px solid #333;
      margin-left: 5px;
    }
    .wc-storage-preview {
      margin-left: 5px;
    }
    .wc-string { color: #98c379; }
    .wc-number { color: #d19a66; }
    .wc-bool { color: #56b6c2; }
    .wc-null { color: #666; }
    .wc-undefined { color: #666; }
    .wc-bracket { color: #abb2bf; }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const container = document.createElement('div');
  container.id = 'wc-container';
  container.dataset.panel = 'console';
  container.innerHTML = `
    <div id="wc-resize"></div>
    <div id="wc-toolbar">
      <button data-panel="console" class="wc-active">Console</button>
      <button data-panel="storage">Storage</button>
      <span class="wc-spacer"></span>
      <button id="wc-clear">Clear</button>
      <button id="wc-fullscreen">[ ]</button>
      <button id="wc-toggle">_</button>
    </div>
    <div id="wc-filters">
      <button data-filter="all" class="wc-active">All <span class="wc-count" id="wc-count-all">0</span></button>
      <button data-filter="error">Err <span class="wc-count" id="wc-count-error">0</span></button>
      <button data-filter="warn">Warn <span class="wc-count" id="wc-count-warn">0</span></button>
      <button data-filter="info">Info <span class="wc-count" id="wc-count-info">0</span></button>
      <button data-filter="log">Log <span class="wc-count" id="wc-count-log">0</span></button>
      <button data-filter="debug">Debug <span class="wc-count" id="wc-count-debug">0</span></button>
    </div>
    <div id="wc-content">
      <div id="wc-logs"></div>
      <div id="wc-storage"></div>
    </div>
    <div id="wc-input-row">
      <input type="text" id="wc-input" placeholder="Execute JavaScript...">
      <button id="wc-run">Run</button>
    </div>
  `;
  document.body.appendChild(container);

  const logsEl = document.getElementById('wc-logs');
  const storageEl = document.getElementById('wc-storage');
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

  // Render storage
  function renderStorage() {
    let html = '';

    // LocalStorage
    html += '<div class="wc-storage-section">';
    html += '<div class="wc-storage-header" data-storage="local">▼ localStorage (' + localStorage.length + ')</div>';
    html += '<div class="wc-storage-items" id="wc-local-items">';
    if (localStorage.length === 0) {
      html += '<div class="wc-storage-empty">(empty)</div>';
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        html += renderStorageItem(key, value, 'local');
      }
    }
    html += '</div></div>';

    // SessionStorage
    html += '<div class="wc-storage-section">';
    html += '<div class="wc-storage-header" data-storage="session">▼ sessionStorage (' + sessionStorage.length + ')</div>';
    html += '<div class="wc-storage-items" id="wc-session-items">';
    if (sessionStorage.length === 0) {
      html += '<div class="wc-storage-empty">(empty)</div>';
    } else {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        html += renderStorageItem(key, value, 'session');
      }
    }
    html += '</div></div>';

    storageEl.innerHTML = html;

    // Add click handlers for storage items (use event delegation)
    storageEl.addEventListener('click', (e) => {
      const item = e.target.closest('.wc-storage-item');
      if (!item) return;

      const toggle = item.querySelector(':scope > .wc-storage-toggle');
      const children = item.querySelector(':scope > .wc-storage-children');

      if (!children || !toggle) return;
      if (toggle.textContent.trim() === '') return; // Not expandable

      e.stopPropagation();

      if (children.style.display === 'none') {
        children.style.display = 'block';
        toggle.textContent = '▼';
      } else {
        children.style.display = 'none';
        toggle.textContent = '▶';
      }
    });

    // Add click handlers for section headers
    storageEl.querySelectorAll('.wc-storage-header').forEach(header => {
      header.addEventListener('click', () => {
        const items = header.nextElementSibling;
        if (items.style.display === 'none') {
          items.style.display = 'block';
          header.textContent = header.textContent.replace('▶', '▼');
        } else {
          items.style.display = 'none';
          header.textContent = header.textContent.replace('▼', '▶');
        }
      });
    });
  }

  function renderStorageItem(key, value, type) {
    let parsed = value;
    try {
      parsed = JSON.parse(value);
    } catch (e) {}

    return `
      <div class="wc-storage-item" data-key="${escapeHtml(key)}" data-type="${type}">
        <span class="wc-storage-toggle">▶</span>
        <span class="wc-storage-key">${escapeHtml(key)}:</span>
        <span class="wc-storage-preview">${getPreview(parsed)}</span>
        <div class="wc-storage-children" style="display:none">${renderValue(parsed)}</div>
      </div>
    `;
  }

  function getPreview(value) {
    if (value === null) return '<span class="wc-null">null</span>';
    if (value === undefined) return '<span class="wc-undefined">undefined</span>';
    if (typeof value === 'boolean') return `<span class="wc-bool">${value}</span>`;
    if (typeof value === 'number') return `<span class="wc-number">${value}</span>`;
    if (typeof value === 'string') return `<span class="wc-string">"${escapeHtml(value.length > 50 ? value.substring(0, 50) + '...' : value)}"</span>`;
    if (Array.isArray(value)) return `<span class="wc-bracket">Array(${value.length})</span>`;
    if (typeof value === 'object') return `<span class="wc-bracket">{${Object.keys(value).length}}</span>`;
    return escapeHtml(String(value));
  }

  function renderValue(value, depth = 0) {
    if (depth > 10) return '<span class="wc-null">...</span>';

    if (value === null) return '<span class="wc-null">null</span>';
    if (value === undefined) return '<span class="wc-undefined">undefined</span>';
    if (typeof value === 'boolean') return `<span class="wc-bool">${value}</span>`;
    if (typeof value === 'number') return `<span class="wc-number">${value}</span>`;
    if (typeof value === 'string') return `<span class="wc-string">"${escapeHtml(value)}"</span>`;

    if (Array.isArray(value)) {
      if (value.length === 0) return '<span class="wc-bracket">[]</span>';
      let html = '';
      value.forEach((item, i) => {
        const isExpandable = typeof item === 'object' && item !== null;
        html += `
          <div class="wc-storage-item wc-nested">
            ${isExpandable ? '<span class="wc-storage-toggle">▶</span>' : '<span class="wc-storage-toggle"> </span>'}
            <span class="wc-storage-key">${i}:</span>
            <span class="wc-storage-preview">${getPreview(item)}</span>
            ${isExpandable ? `<div class="wc-storage-children" style="display:none">${renderValue(item, depth + 1)}</div>` : ''}
          </div>
        `;
      });
      return html;
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return '<span class="wc-bracket">{}</span>';
      let html = '';
      keys.forEach(k => {
        const item = value[k];
        const isExpandable = typeof item === 'object' && item !== null;
        html += `
          <div class="wc-storage-item wc-nested">
            ${isExpandable ? '<span class="wc-storage-toggle">▶</span>' : '<span class="wc-storage-toggle"> </span>'}
            <span class="wc-storage-key">${escapeHtml(k)}:</span>
            <span class="wc-storage-preview">${getPreview(item)}</span>
            ${isExpandable ? `<div class="wc-storage-children" style="display:none">${renderValue(item, depth + 1)}</div>` : ''}
          </div>
        `;
      });
      return html;
    }

    return escapeHtml(String(value));
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  // Panel buttons
  document.querySelectorAll('#wc-toolbar button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#wc-toolbar button[data-panel]').forEach(b => b.classList.remove('wc-active'));
      btn.classList.add('wc-active');
      activePanel = btn.dataset.panel;
      container.dataset.panel = activePanel;
      if (activePanel === 'storage') {
        renderStorage();
      }
    });
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

  // Clear button (context-aware)
  document.getElementById('wc-clear').addEventListener('click', () => {
    if (activePanel === 'console') {
      logs = [];
      render();
    } else {
      if (confirm('Clear all localStorage and sessionStorage?')) {
        localStorage.clear();
        sessionStorage.clear();
        renderStorage();
      }
    }
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
