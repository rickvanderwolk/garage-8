(function() {
  if (new URLSearchParams(location.search).get('wc') !== '1') return;

  // State
  let logs = [];
  let filter = 'error';
  let activePanel = 'console';
  let customHeight = null;
  let isResizing = false;
  let wasFullscreen = false;

  // CSS
  const css = `
    #wc{position:fixed;bottom:0;left:0;right:0;height:33vh;background:#0f0f0f;color:#e8e8e8;font:11px ui-monospace,SFMono-Regular,SF Mono,Menlo,Monaco,Consolas,monospace;z-index:999999;display:flex;flex-direction:column;box-shadow:0 -2px 10px rgba(0,0,0,.5)}
    #wc.collapsed{height:32px}
    #wc.collapsed #wc-content,#wc.collapsed #wc-input,#wc.collapsed #wc-filters{display:none}
    #wc.fullscreen{height:100%;top:0}
    #wc-resize{height:6px;cursor:ns-resize;background:#2a2a2a;touch-action:none}
    #wc-resize:hover{background:#3a7eff}
    #wc-bar{display:flex;background:#1a1a1a;border-bottom:1px solid #2a2a2a;height:28px}
    #wc-bar button{background:0;color:#999;border:none;border-radius:0;padding:0 12px;cursor:pointer;font:inherit;border-bottom:2px solid transparent;transition:.15s}
    #wc-bar button:hover{color:#fff;background:rgba(255,255,255,.05)}
    #wc-bar button.on{color:#fff;border-bottom-color:#3a7eff}
    #wc-bar [data-p]{font-weight:500}
    #wc-bar .icon{padding:0 8px;font-size:13px}
    .spacer{flex:1}
    #wc-filters{display:flex;gap:2px;padding:4px 8px;background:#141414;border-bottom:1px solid #2a2a2a}
    #wc-filters button{background:0;color:#888;border:none;padding:3px 8px;cursor:pointer;font:10px inherit;transition:.15s}
    #wc-filters button:hover{background:rgba(255,255,255,.08);color:#ccc}
    #wc-filters button.on{background:rgba(58,126,255,.2);color:#6cb2ff}
    #wc[data-p=storage] #wc-filters{display:none}
    .cnt{background:rgba(255,255,255,.15);padding:1px 5px;border-radius:10px;font-size:9px;margin-left:4px}
    .cnt-error{background:rgba(255,85,85,.3);color:#ff8888}
    .cnt-warn{background:rgba(255,200,0,.25);color:#ffd666}
    .cnt-info{background:rgba(58,126,255,.25);color:#6cb2ff}
    #wc-content{flex:1;overflow:hidden;display:flex;flex-direction:column}
    #wc-logs,#wc-storage{flex:1;overflow-y:auto}
    #wc-storage{display:none;padding:8px}
    #wc[data-p=storage] #wc-logs,#wc[data-p=storage] #wc-input{display:none}
    #wc[data-p=storage] #wc-storage{display:block}
    .log{padding:4px 12px;border-bottom:1px solid #1a1a1a;white-space:pre-wrap;word-break:break-all;line-height:1.4;display:flex}
    .log:hover{background:rgba(255,255,255,.02)}
    .log-debug{color:#888}
    .log-log{color:#e8e8e8}
    .log-info{color:#6cb2ff}
    .log-warn{color:#ffd666;background:rgba(255,200,0,.08);border-left:2px solid #ffd666}
    .log-error{color:#ff8888;background:rgba(255,85,85,.08);border-left:2px solid #ff8888}
    .log-icon{margin-right:8px;width:14px;text-align:center;opacity:.6}
    .log-time{color:#555;margin-right:12px;font-size:10px}
    .log-msg{flex:1;min-width:0}
    #wc-input{display:flex;border-top:1px solid #2a2a2a;background:#141414}
    #wc-input span{color:#3a7eff;padding:8px 4px 8px 12px;font-size:12px}
    #wc-input input{flex:1;background:0;color:#e8e8e8;border:none;padding:8px 12px 8px 4px;font:inherit;outline:none}
    #wc-input input::placeholder{color:#555}
    .sh{margin-bottom:12px}
    .sh-head{color:#6cb2ff;padding:4px 0;cursor:pointer;user-select:none;font-weight:500}
    .sh-head:hover{color:#8ec5ff}
    .sh-items{padding-left:12px}
    .si{padding:2px 0;cursor:pointer;display:flex;flex-wrap:wrap}
    .si:hover>.si-key,.si:hover>.si-tog{background:rgba(255,255,255,.05)}
    .si-key{color:#c792ea}
    .si-tog{color:#555;width:12px;text-align:center}
    .si-empty{color:#555;font-style:italic}
    .si-ch{width:100%;padding-left:12px;border-left:1px solid #2a2a2a;margin-left:5px}
    .si-pre{margin-left:6px}
    .v-str{color:#c3e88d}
    .v-num{color:#f78c6c}
    .v-bool{color:#89ddff}
    .v-null{color:#555}
    .v-brk{color:#888}
  `;

  // HTML
  const html = `
    <div id="wc-resize"></div>
    <div id="wc-bar">
      <button data-p="console" class="on">Console</button>
      <button data-p="storage">Storage</button>
      <span class="spacer"></span>
      <button id="wc-clear" class="icon" title="Clear">🗑</button>
      <button id="wc-full" class="icon" title="Fullscreen">⤢</button>
      <button id="wc-min" class="icon" title="Minimize">−</button>
    </div>
    <div id="wc-filters">
      <button data-f="all">All <span class="cnt" id="c-all">0</span></button>
      <button data-f="error" class="on">Err <span class="cnt cnt-error" id="c-error">0</span></button>
      <button data-f="warn">Warn <span class="cnt cnt-warn" id="c-warn">0</span></button>
      <button data-f="info">Info <span class="cnt cnt-info" id="c-info">0</span></button>
      <button data-f="log">Log <span class="cnt" id="c-log">0</span></button>
      <button data-f="debug">Debug <span class="cnt" id="c-debug">0</span></button>
    </div>
    <div id="wc-content">
      <div id="wc-logs"></div>
      <div id="wc-storage"></div>
    </div>
    <div id="wc-input">
      <span>›</span>
      <input placeholder="Enter JavaScript...">
    </div>
  `;

  // Create container
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'wc';
  el.dataset.p = 'console';
  el.innerHTML = html;
  document.body.appendChild(el);

  // Cache elements
  const $ = id => document.getElementById(id);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);
  const logsEl = $('wc-logs');
  const storageEl = $('wc-storage');
  const inputEl = el.querySelector('#wc-input input');

  const icons = { debug: '·', log: '▸', info: 'ⓘ', warn: '⚠', error: '✕' };

  // Helpers
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const time = () => new Date().toTimeString().slice(0, 8);

  const fmt = args => args.map(a => {
    if (typeof a === 'object') try { return JSON.stringify(a, null, 2); } catch(e) {}
    return String(a);
  }).join(' ');

  // Render
  function render() {
    const list = filter === 'all' ? logs : logs.filter(l => l.type === filter);
    logsEl.innerHTML = list.map(l => `
      <div class="log log-${l.type}">
        <span class="log-icon">${icons[l.type]}</span>
        <span class="log-time">${l.time}</span>
        <span class="log-msg">${esc(l.msg)}</span>
      </div>
    `).join('');
    logsEl.scrollTop = logsEl.scrollHeight;

    // Update counts
    const c = { all: logs.length, debug: 0, log: 0, info: 0, warn: 0, error: 0 };
    logs.forEach(l => c[l.type]++);
    for (const t in c) $('c-' + t).textContent = c[t];
  }

  // Storage rendering
  function renderVal(v, d = 0) {
    if (d > 10) return '<span class="v-null">...</span>';
    if (v === null) return '<span class="v-null">null</span>';
    if (v === undefined) return '<span class="v-null">undefined</span>';
    if (typeof v === 'boolean') return `<span class="v-bool">${v}</span>`;
    if (typeof v === 'number') return `<span class="v-num">${v}</span>`;
    if (typeof v === 'string') return `<span class="v-str">"${esc(v)}"</span>`;

    const isArr = Array.isArray(v);
    const keys = isArr ? v : Object.keys(v);
    if (keys.length === 0) return `<span class="v-brk">${isArr ? '[]' : '{}'}</span>`;

    return (isArr ? v : Object.entries(v)).map((item, i) => {
      const [k, val] = isArr ? [i, item] : item;
      const exp = typeof val === 'object' && val !== null;
      return `
        <div class="si">
          <span class="si-tog">${exp ? '▶' : ' '}</span>
          <span class="si-key">${esc(k)}:</span>
          <span class="si-pre">${preview(val)}</span>
          ${exp ? `<div class="si-ch" style="display:none">${renderVal(val, d + 1)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function preview(v) {
    if (v === null) return '<span class="v-null">null</span>';
    if (v === undefined) return '<span class="v-null">undefined</span>';
    if (typeof v === 'boolean') return `<span class="v-bool">${v}</span>`;
    if (typeof v === 'number') return `<span class="v-num">${v}</span>`;
    if (typeof v === 'string') return `<span class="v-str">"${esc(v.length > 50 ? v.slice(0, 50) + '...' : v)}"</span>`;
    if (Array.isArray(v)) return `<span class="v-brk">Array(${v.length})</span>`;
    if (typeof v === 'object') return `<span class="v-brk">{${Object.keys(v).length}}</span>`;
    return esc(String(v));
  }

  function renderStorage() {
    const section = (name, store) => {
      let items = '';
      if (store.length === 0) {
        items = '<div class="si-empty">(empty)</div>';
      } else {
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          let v = store.getItem(k);
          try { v = JSON.parse(v); } catch(e) {}
          items += `
            <div class="si">
              <span class="si-tog">▶</span>
              <span class="si-key">${esc(k)}:</span>
              <span class="si-pre">${preview(v)}</span>
              <div class="si-ch" style="display:none">${renderVal(v)}</div>
            </div>
          `;
        }
      }
      return `<div class="sh"><div class="sh-head">▼ ${name} (${store.length})</div><div class="sh-items">${items}</div></div>`;
    };
    storageEl.innerHTML = section('localStorage', localStorage) + section('sessionStorage', sessionStorage);
  }

  // Storage click handler
  storageEl.addEventListener('click', e => {
    const item = e.target.closest('.si');
    if (item) {
      const tog = item.querySelector(':scope > .si-tog');
      const ch = item.querySelector(':scope > .si-ch');
      if (ch && tog?.textContent.trim()) {
        e.stopPropagation();
        const open = ch.style.display === 'none';
        ch.style.display = open ? 'block' : 'none';
        tog.textContent = open ? '▼' : '▶';
      }
      return;
    }
    const head = e.target.closest('.sh-head');
    if (head) {
      const items = head.nextElementSibling;
      const open = items.style.display === 'none';
      items.style.display = open ? 'block' : 'none';
      head.textContent = head.textContent.replace(open ? '▶' : '▼', open ? '▼' : '▶');
    }
  });

  // Override console
  const orig = {};
  ['log', 'debug', 'info', 'warn', 'error', 'trace'].forEach(t => orig[t] = console[t].bind(console));

  ['log', 'debug', 'info', 'warn', 'error'].forEach(type => {
    console[type] = (...args) => {
      orig[type](...args);
      let msg = fmt(args);
      if (type === 'error') {
        const stack = new Error().stack;
        if (stack) msg += '\n' + stack.split('\n').slice(2, 5).join('\n');
      }
      logs.push({ type, msg, time: time() });
      render();
    };
  });

  console.trace = (...args) => {
    orig.trace(...args);
    const stack = new Error().stack?.split('\n').slice(2).join('\n') || '';
    logs.push({ type: 'debug', msg: 'Trace: ' + fmt(args) + '\n' + stack, time: time() });
    render();
  };

  // Catch errors
  window.addEventListener('error', e => {
    logs.push({ type: 'error', msg: `${e.message}\n  at ${e.filename}:${e.lineno}:${e.colno}`, time: time() });
    render();
  });

  window.addEventListener('unhandledrejection', e => {
    logs.push({ type: 'error', msg: `Unhandled Promise: ${e.reason}`, time: time() });
    render();
  });

  // Event handlers
  $$('#wc-bar [data-p]').forEach(btn => btn.onclick = () => {
    $$('#wc-bar [data-p]').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    activePanel = btn.dataset.p;
    el.dataset.p = activePanel;
    if (activePanel === 'storage') renderStorage();
    // Restore if collapsed
    if (el.classList.contains('collapsed')) {
      el.classList.remove('collapsed');
      if (wasFullscreen) {
        el.classList.add('fullscreen');
        el.style.height = '';
      } else {
        el.style.height = customHeight || '33vh';
      }
    }
  });

  $$('#wc-filters [data-f]').forEach(btn => btn.onclick = () => {
    $$('#wc-filters [data-f]').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    filter = btn.dataset.f;
    render();
  });

  $('wc-clear').onclick = () => {
    if (activePanel === 'console') {
      logs = [];
      render();
    } else if (confirm('Clear all localStorage and sessionStorage?')) {
      localStorage.clear();
      sessionStorage.clear();
      renderStorage();
    }
  };

  $('wc-min').onclick = () => {
    if (el.classList.contains('collapsed')) {
      el.classList.remove('collapsed');
      if (wasFullscreen) {
        el.classList.add('fullscreen');
        el.style.height = '';
      } else {
        el.style.height = customHeight || '33vh';
      }
    } else {
      wasFullscreen = el.classList.contains('fullscreen');
      el.classList.remove('fullscreen');
      el.classList.add('collapsed');
      el.style.height = '';
    }
  };

  // Click on bar to restore when collapsed
  $('wc-bar').onclick = e => {
    if (!el.classList.contains('collapsed')) return;
    if (e.target.closest('button')) return; // Don't trigger on button clicks
    el.classList.remove('collapsed');
    if (wasFullscreen) {
      el.classList.add('fullscreen');
      el.style.height = '';
    } else {
      el.style.height = customHeight || '250px';
    }
  };

  $('wc-full').onclick = () => {
    el.classList.remove('collapsed');
    if (el.classList.contains('fullscreen')) {
      el.classList.remove('fullscreen');
      el.style.height = customHeight || '';
    } else {
      el.classList.add('fullscreen');
      el.style.height = '';
    }
  };

  // Resize
  const resize = $('wc-resize');
  const setHeight = y => {
    if (!isResizing) return;
    customHeight = Math.max(100, Math.min(innerHeight - y, innerHeight - 50)) + 'px';
    el.style.height = customHeight;
  };

  resize.addEventListener('mousedown', e => { isResizing = true; e.preventDefault(); });
  resize.addEventListener('touchstart', e => { isResizing = true; e.preventDefault(); }, { passive: false });
  document.addEventListener('mousemove', e => setHeight(e.clientY));
  document.addEventListener('touchmove', e => { if (e.touches[0]) setHeight(e.touches[0].clientY); }, { passive: true });
  document.addEventListener('mouseup', () => isResizing = false);
  document.addEventListener('touchend', () => isResizing = false);

  // Execute input
  inputEl.onkeydown = e => {
    if (e.key !== 'Enter') return;
    const code = inputEl.value.trim();
    if (!code) return;
    console.log('> ' + code);
    try {
      const result = eval(code);
      if (result !== undefined) console.log(result);
    } catch (err) {
      console.error(err.message);
    }
    inputEl.value = '';
  };

  console.info('wc active');
})();
