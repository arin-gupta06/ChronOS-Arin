/* ═══════════════════════════════════════════════
   AERO-VAULT — Main Application JS
═══════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────
const state = {
  openTabs: [],          // [{name, content, dirty}]
  activeTab: null,       // filename string
  previewMode: false,
  fontSize: 14,
  wordWrap: true,
  lineNumbers: true,
  urls: [],              // [{label, url}]
  pendingDelete: null,
};

// ── DOM Refs ──────────────────────────────────────────
const $ = id => document.getElementById(id);
const splash         = $('splash-screen');
const app            = $('app');
const fileTree       = $('file-tree');
const tabBarInner    = $('tab-bar-inner');
const editor         = $('editor');
const lineNums       = $('line-numbers');
const previewCont    = $('preview-container');
const previewContent = $('preview-content');
const searchInput    = $('search-input');
const searchResults  = $('search-results');
const snippetsCont   = $('snippets-container');
const urlList        = $('url-list');
const statusCursor   = $('status-cursor');
const statusLang     = $('status-lang');
const statusReady    = $('status-ready');
const breadcrumb     = $('breadcrumb-filename');
const titleFilename  = $('title-filename');

// ══════════════════════════════════════════════════════
//  SPLASH → APP TRANSITION (5 seconds)
// ══════════════════════════════════════════════════════
setTimeout(() => {
  splash.classList.add('fade-out');
  app.classList.remove('app-hidden');
  app.classList.add('app-visible');
  init();
}, 5000);

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
async function init() {
  loadURLs();
  buildSnippets();
  await loadFileTree();
  // Auto-open welcome.md
  await openFile('welcome.md');
  setupSidebarResize();
}

// ══════════════════════════════════════════════════════
//  ACTIVITY BAR
// ══════════════════════════════════════════════════════
document.querySelectorAll('.activity-btn[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    document.querySelectorAll('.activity-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const p = $(`panel-${panel}`);
    if (p) p.classList.add('active');
  });
});

// ══════════════════════════════════════════════════════
//  FILE TREE
// ══════════════════════════════════════════════════════
async function loadFileTree() {
  fileTree.innerHTML = '<div class="tree-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading…</div>';
  try {
    const res = await fetch('/api/files');
    const data = await res.json();
    renderFileTree(data.files);
  } catch {
    fileTree.innerHTML = '<div class="tree-loading" style="color:#f44747;">Failed to load files.</div>';
  }
}

function renderFileTree(files) {
  if (!files.length) {
    fileTree.innerHTML = '<div class="tree-loading">No files yet. Create one!</div>';
    return;
  }
  fileTree.innerHTML = '';
  files.forEach(f => {
    const ext = f.name.split('.').pop();
    const item = document.createElement('div');
    item.className = 'tree-item' + (state.activeTab === f.name ? ' active' : '');
    item.dataset.name = f.name;
    item.innerHTML = `
      <i class="fa-regular ${ext === 'sh' ? 'fa-file-code' : 'fa-file-lines'} tree-item-icon ${ext}"></i>
      <span class="tree-item-name">${f.name}</span>
      <span class="tree-item-size">${formatSize(f.size)}</span>
      <button class="tree-item-del" title="Delete" data-name="${f.name}"><i class="fa-solid fa-trash"></i></button>`;
    item.addEventListener('click', e => {
      if (e.target.closest('.tree-item-del')) return;
      openFile(f.name);
    });
    item.querySelector('.tree-item-del').addEventListener('click', e => {
      e.stopPropagation();
      showDeleteModal(f.name);
    });
    fileTree.appendChild(item);
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  return (bytes / 1024).toFixed(1) + 'K';
}

// ══════════════════════════════════════════════════════
//  OPEN / READ FILE
// ══════════════════════════════════════════════════════
async function openFile(filename) {
  // Check if already open
  const existing = state.openTabs.find(t => t.name === filename);
  if (existing) {
    switchTab(filename);
    return;
  }
  try {
    const res = await fetch(`/api/read/${encodeURIComponent(filename)}`);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    state.openTabs.push({ name: filename, content: data.content, dirty: false });
    switchTab(filename);
  } catch {
    showToast('Failed to open file: ' + filename, true);
  }
}

function switchTab(filename) {
  state.activeTab = filename;
  const tab = state.openTabs.find(t => t.name === filename);
  if (!tab) return;

  // Update editor
  editor.value = tab.content;
  updateLineNumbers();
  updateStatusBar(filename);
  updateBreadcrumb(filename);
  setPreviewMode(false);

  // Render tabs
  renderTabs();

  // Highlight tree item
  document.querySelectorAll('.tree-item').forEach(el => {
    el.classList.toggle('active', el.dataset.name === filename);
  });
}

function renderTabs() {
  tabBarInner.innerHTML = '';
  state.openTabs.forEach(tab => {
    const ext = tab.name.split('.').pop();
    const t = document.createElement('div');
    t.className = 'tab' + (tab.name === state.activeTab ? ' active' : '');
    t.innerHTML = `
      <i class="fa-regular ${ext === 'sh' ? 'fa-file-code' : 'fa-file-lines'} tab-icon ${ext}"></i>
      <span>${tab.name}${tab.dirty ? ' ●' : ''}</span>
      <span class="tab-close"><i class="fa-solid fa-xmark"></i></span>`;
    t.addEventListener('click', e => {
      if (e.target.closest('.tab-close')) { closeTab(tab.name); return; }
      switchTab(tab.name);
    });
    tabBarInner.appendChild(t);
  });
}

function closeTab(filename) {
  const idx = state.openTabs.findIndex(t => t.name === filename);
  if (idx === -1) return;
  state.openTabs.splice(idx, 1);
  if (state.activeTab === filename) {
    const next = state.openTabs[Math.min(idx, state.openTabs.length - 1)];
    if (next) switchTab(next.name);
    else {
      state.activeTab = null;
      editor.value = '';
      lineNums.innerHTML = '';
      updateBreadcrumb('');
      titleFilename.textContent = 'Aero-Vault';
    }
  }
  renderTabs();
}

// ══════════════════════════════════════════════════════
//  SAVE FILE
// ══════════════════════════════════════════════════════
async function saveCurrentFile() {
  if (!state.activeTab) return;
  const content = editor.value;
  setStatus('Saving…');
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: state.activeTab, content })
    });
    if (!res.ok) throw new Error('Save failed');
    // Update tab state
    const tab = state.openTabs.find(t => t.name === state.activeTab);
    if (tab) { tab.content = content; tab.dirty = false; }
    renderTabs();
    setStatus('Ready');
    showToast(`Saved: ${state.activeTab}`);
    await loadFileTree();
  } catch (e) {
    setStatus('Error');
    showToast('Save failed!', true);
  }
}

$('btn-save-file').addEventListener('click', saveCurrentFile);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentFile(); }
});

// ══════════════════════════════════════════════════════
//  EDITOR EVENTS
// ══════════════════════════════════════════════════════
editor.addEventListener('input', () => {
  const tab = state.openTabs.find(t => t.name === state.activeTab);
  if (tab && tab.content !== editor.value) {
    tab.dirty = true;
    renderTabs();
  }
  updateLineNumbers();
});

editor.addEventListener('keydown', e => {
  // Tab key inserts spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
  }
});

editor.addEventListener('keyup', updateCursorPosition);
editor.addEventListener('click', updateCursorPosition);
editor.addEventListener('scroll', syncLineNumbersScroll);

function updateCursorPosition() {
  const text = editor.value.substring(0, editor.selectionStart);
  const lines = text.split('\n');
  const ln = lines.length;
  const col = lines[lines.length - 1].length + 1;
  statusCursor.textContent = `Ln ${ln}, Col ${col}`;
}

function updateLineNumbers() {
  if (!state.lineNumbers) { lineNums.innerHTML = ''; return; }
  const count = (editor.value.match(/\n/g) || []).length + 1;
  let html = '';
  for (let i = 1; i <= count; i++) html += i + '\n';
  lineNums.textContent = html;
}

function syncLineNumbersScroll() {
  lineNums.scrollTop = editor.scrollTop;
}

// ══════════════════════════════════════════════════════
//  PREVIEW MODE
// ══════════════════════════════════════════════════════
$('btn-toggle-preview').addEventListener('click', () => setPreviewMode(!state.previewMode));

function setPreviewMode(on) {
  state.previewMode = on;
  const btn = $('btn-toggle-preview');
  if (on) {
    previewContent.innerHTML = renderMarkdown(editor.value);
    previewCont.classList.remove('hidden');
    $('editor-container').classList.add('hidden');
    btn.classList.add('active');
  } else {
    previewCont.classList.add('hidden');
    $('editor-container').classList.remove('hidden');
    btn.classList.remove('active');
  }
}

// ──────────────────────────────────────
//  Markdown → Bootstrap HTML Renderer (No lib)
// ──────────────────────────────────────
function renderMarkdown(md) {
  let html = escapeForProcess(md);

  // Fenced code blocks with optional language
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const decoded = unescapeCode(code);
    const label = lang ? `<span class="lang-label">${lang}</span>` : '';
    return `<pre>${label}<code>${escapeHTML(decoded)}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHTML(unescapeCode(c))}</code>`);

  // Headings
  html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');

  // Blockquote
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Tables
  html = html.replace(/(^\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/gm, tableReplace);

  // Unordered lists
  html = html.replace(/(^[-*+]\s.+\n?)+/gm, match => {
    const items = match.trim().split('\n')
      .map(l => `<li>${l.replace(/^[-*+]\s/, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/(^\d+\.\s.+\n?)+/gm, match => {
    const items = match.trim().split('\n')
      .map(l => `<li>${l.replace(/^\d+\.\s/, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;">');

  // Paragraphs (double newline separated blocks not already tagged)
  html = html.replace(/\n\n([^<\n].+?)(?=\n\n|$)/gs, '\n\n<p>$1</p>');

  // Line breaks within non-block content
  html = html.replace(/\n(?!<[a-zA-Z\/])/g, '<br>');

  return html;
}

function escapeForProcess(s) {
  // Temporarily protect backtick content
  return s;
}
function unescapeCode(s) { return s; }
function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tableReplace(match) {
  const rows = match.trim().split('\n');
  if (rows.length < 2) return match;
  const headers = rows[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
  const body = rows.slice(2).map(row => {
    const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<table class="table table-sm"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
}

// ══════════════════════════════════════════════════════
//  NEW FILE MODAL
// ══════════════════════════════════════════════════════
$('btn-new-file').addEventListener('click', () => {
  $('modal-new-file').classList.remove('hidden');
  $('new-filename-input').value = '';
  $('new-filename-input').focus();
});
$('btn-cancel-new').addEventListener('click', () => $('modal-new-file').classList.add('hidden'));
$('btn-confirm-new').addEventListener('click', createNewFile);
$('new-filename-input').addEventListener('keydown', e => { if (e.key === 'Enter') createNewFile(); });

async function createNewFile() {
  let name = $('new-filename-input').value.trim();
  if (!name) return;
  if (!name.endsWith('.md') && !name.endsWith('.sh')) name += '.md';
  name = name.replace(/[^a-zA-Z0-9._-]/g, '-');

  try {
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: name, content: `# ${name.replace(/\.(md|sh)$/, '')}\n\n` })
    });
    $('modal-new-file').classList.add('hidden');
    await loadFileTree();
    await openFile(name);
    showToast(`Created: ${name}`);
  } catch {
    showToast('Failed to create file', true);
  }
}

// ══════════════════════════════════════════════════════
//  DELETE MODAL
// ══════════════════════════════════════════════════════
function showDeleteModal(filename) {
  state.pendingDelete = filename;
  $('delete-filename-label').textContent = filename;
  $('modal-delete').classList.remove('hidden');
}
$('btn-cancel-delete').addEventListener('click', () => {
  $('modal-delete').classList.add('hidden');
  state.pendingDelete = null;
});
$('btn-confirm-delete').addEventListener('click', async () => {
  if (!state.pendingDelete) return;
  try {
    await fetch(`/api/delete/${encodeURIComponent(state.pendingDelete)}`, { method: 'DELETE' });
    // Close tab if open
    const idx = state.openTabs.findIndex(t => t.name === state.pendingDelete);
    if (idx !== -1) state.openTabs.splice(idx, 1);
    if (state.activeTab === state.pendingDelete) {
      state.activeTab = state.openTabs[0]?.name || null;
      if (state.activeTab) switchTab(state.activeTab);
      else { editor.value = ''; lineNums.innerHTML = ''; }
    }
    renderTabs();
    $('modal-delete').classList.add('hidden');
    showToast(`Deleted: ${state.pendingDelete}`);
    state.pendingDelete = null;
    await loadFileTree();
  } catch {
    showToast('Delete failed', true);
  }
});

// ══════════════════════════════════════════════════════
//  REFRESH
// ══════════════════════════════════════════════════════
$('btn-refresh').addEventListener('click', async () => {
  await loadFileTree();
  showToast('File list refreshed');
});

// ══════════════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════════════
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(doSearch, 300);
});
$('btn-search-clear').addEventListener('click', () => {
  searchInput.value = '';
  searchResults.innerHTML = '<div class="search-empty"><i class="fa-solid fa-magnifying-glass"></i><p>Type to search across all files</p></div>';
});

async function doSearch() {
  const q = searchInput.value.trim();
  if (q.length < 2) {
    searchResults.innerHTML = '<div class="search-empty"><i class="fa-solid fa-magnifying-glass"></i><p>Type to search across all files</p></div>';
    return;
  }
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    renderSearchResults(data.results, q);
  } catch {
    searchResults.innerHTML = '<div class="search-empty" style="color:#f44747;">Search failed.</div>';
  }
}

function renderSearchResults(results, query) {
  if (!results.length) {
    searchResults.innerHTML = `<div class="search-empty"><i class="fa-solid fa-magnifying-glass"></i><p>No results for "<strong>${escapeHTML(query)}</strong>"</p></div>`;
    return;
  }
  let html = `<div style="padding:4px 12px;font-size:10px;color:var(--text-muted);">${results.length} file(s) found</div>`;
  results.forEach(r => {
    html += `<div class="search-result-file" data-file="${r.filename}"><i class="fa-regular fa-file-lines" style="margin-right:5px;"></i>${r.filename} <span style="color:var(--text-muted);font-weight:400;">(${r.total_matches} match${r.total_matches !== 1 ? 'es' : ''})</span></div>`;
    r.matches.forEach((line, i) => {
      const highlighted = line.replace(new RegExp(escapeRegex(query), 'gi'), m => `<span class="highlight">${escapeHTML(m)}</span>`);
      html += `<div class="search-match" data-file="${r.filename}" title="Line ${r.line_numbers[i]}"><span style="color:var(--text-muted);margin-right:6px;">${r.line_numbers[i]}</span>${highlighted}</div>`;
    });
  });
  searchResults.innerHTML = html;

  searchResults.querySelectorAll('[data-file]').forEach(el => {
    el.addEventListener('click', () => openFile(el.dataset.file));
  });
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ══════════════════════════════════════════════════════
//  SNIPPETS
// ══════════════════════════════════════════════════════
const SNIPPETS = [
  {
    group: 'GCP', icon: 'fa-brands fa-google', items: [
      { label: 'Set project', code: 'gcloud config set project PROJECT_ID' },
      { label: 'List VM instances', code: 'gcloud compute instances list' },
      { label: 'SSH to VM', code: 'gcloud compute ssh INSTANCE --zone=ZONE' },
      { label: 'Deploy to Cloud Run', code: 'gcloud run deploy SERVICE --image IMAGE --platform managed' },
      { label: 'Get credentials (GKE)', code: 'gcloud container clusters get-credentials CLUSTER --zone ZONE' },
      { label: 'Copy file to GCS', code: 'gsutil cp file.txt gs://BUCKET_NAME/' },
      { label: 'List GCS bucket', code: 'gsutil ls gs://BUCKET_NAME' },
    ]
  },
  {
    group: 'Git', icon: 'fa-brands fa-git-alt', items: [
      { label: 'Status', code: 'git status' },
      { label: 'Stage all', code: 'git add .' },
      { label: 'Commit', code: 'git commit -m "feat: description"' },
      { label: 'Push origin', code: 'git push origin main' },
      { label: 'New branch', code: 'git checkout -b feature/branch-name' },
      { label: 'Stash changes', code: 'git stash && git stash pop' },
      { label: 'Log (pretty)', code: 'git log --oneline --graph --all' },
      { label: 'Rebase interactive', code: 'git rebase -i HEAD~3' },
    ]
  },
  {
    group: 'Docker', icon: 'fa-brands fa-docker', items: [
      { label: 'Build image', code: 'docker build -t app:latest .' },
      { label: 'Run container', code: 'docker run -d -p 8080:8080 app:latest' },
      { label: 'List containers', code: 'docker ps -a' },
      { label: 'Exec shell', code: 'docker exec -it CONTAINER /bin/bash' },
      { label: 'View logs', code: 'docker logs -f CONTAINER' },
      { label: 'Compose up', code: 'docker compose up -d' },
      { label: 'System prune', code: 'docker system prune -af' },
    ]
  },
  {
    group: 'Python', icon: 'fa-brands fa-python', items: [
      { label: 'Virtual env', code: 'python -m venv venv && source venv/bin/activate' },
      { label: 'Install deps', code: 'pip install -r requirements.txt' },
      { label: 'Run FastAPI', code: 'uvicorn main:app --reload --port 8000' },
      { label: 'Freeze deps', code: 'pip freeze > requirements.txt' },
      { label: 'Run tests', code: 'pytest -v --tb=short' },
    ]
  }
];

function buildSnippets() {
  snippetsCont.innerHTML = '';
  SNIPPETS.forEach(group => {
    const div = document.createElement('div');
    div.className = 'snippet-group';
    div.innerHTML = `
      <div class="snippet-group-header">
        <span><i class="${group.icon}" style="margin-right:7px;"></i>${group.group}</span>
        <span class="badge">${group.items.length}</span>
      </div>
      <div class="snippet-items open">
        ${group.items.map(item => `
          <div class="snippet-item">
            <button class="snippet-copy-btn" data-code="${escapeAttr(item.code)}">Copy</button>
            <div class="snippet-item-label">${item.label}</div>
            <div class="snippet-item-code">${escapeHTML(item.code)}</div>
          </div>`).join('')}
      </div>`;
    div.querySelector('.snippet-group-header').addEventListener('click', () => {
      div.querySelector('.snippet-items').classList.toggle('open');
    });
    div.querySelectorAll('.snippet-copy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.code).then(() => {
          btn.textContent = '✓ Copied';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
        });
      });
    });
    snippetsCont.appendChild(div);
  });
}

function escapeAttr(s) { return s.replace(/"/g, '&quot;'); }

// ══════════════════════════════════════════════════════
//  URL MANAGER
// ══════════════════════════════════════════════════════
function loadURLs() {
  try {
    const stored = localStorage.getItem('aero-vault-urls');
    state.urls = stored ? JSON.parse(stored) : [];
  } catch { state.urls = []; }
  renderURLs();
}

function saveURLs() {
  try { localStorage.setItem('aero-vault-urls', JSON.stringify(state.urls)); } catch {}
}

function renderURLs() {
  if (!state.urls.length) {
    urlList.innerHTML = '<div class="url-empty"><i class="fa-solid fa-link" style="display:block;font-size:20px;margin-bottom:8px;"></i>No saved URLs yet.<br>Click + to add one.</div>';
    return;
  }
  urlList.innerHTML = '';
  state.urls.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'url-item';
    el.innerHTML = `
      <div class="url-item-info">
        <div class="url-item-label">${escapeHTML(item.label)}</div>
        <div class="url-item-link">${escapeHTML(item.url)}</div>
      </div>
      <div class="url-item-actions">
        <button class="url-open-btn" title="Open URL"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
        <button class="url-del-btn" title="Remove"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    el.querySelector('.url-open-btn').addEventListener('click', () => window.open(item.url, '_blank'));
    el.querySelector('.url-del-btn').addEventListener('click', () => {
      state.urls.splice(idx, 1);
      saveURLs();
      renderURLs();
    });
    urlList.appendChild(el);
  });
}

$('btn-add-url').addEventListener('click', () => $('url-add-form').classList.toggle('hidden'));
$('btn-cancel-url').addEventListener('click', () => $('url-add-form').classList.add('hidden'));
$('btn-save-url').addEventListener('click', () => {
  const label = $('url-label').value.trim();
  const url = $('url-value').value.trim();
  if (!label || !url) return;
  state.urls.push({ label, url });
  saveURLs();
  renderURLs();
  $('url-label').value = '';
  $('url-value').value = '';
  $('url-add-form').classList.add('hidden');
  showToast('URL saved!');
});

// ══════════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════════
$('btn-font-inc').addEventListener('click', () => {
  state.fontSize = Math.min(24, state.fontSize + 1);
  applySettings();
});
$('btn-font-dec').addEventListener('click', () => {
  state.fontSize = Math.max(10, state.fontSize - 1);
  applySettings();
});
$('toggle-wrap').addEventListener('change', () => {
  state.wordWrap = $('toggle-wrap').checked;
  applySettings();
});
$('toggle-linenums').addEventListener('change', () => {
  state.lineNumbers = $('toggle-linenums').checked;
  applySettings();
});

function applySettings() {
  editor.style.fontSize = state.fontSize + 'px';
  lineNums.style.fontSize = state.fontSize + 'px';
  editor.classList.toggle('wrap', state.wordWrap);
  lineNums.classList.toggle('hidden', !state.lineNumbers);
  $('font-size-display').textContent = state.fontSize + 'px';
  updateLineNumbers();
}

// ══════════════════════════════════════════════════════
//  SIDEBAR RESIZE
// ══════════════════════════════════════════════════════
function setupSidebarResize() {
  const handle = $('sidebar-resize');
  const sidebar = document.querySelector('.sidebar');
  let dragging = false, startX, startW;

  handle.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startW = sidebar.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const newW = Math.max(160, Math.min(480, startW + (e.clientX - startX)));
    sidebar.style.width = newW + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}

// ══════════════════════════════════════════════════════
//  STATUS BAR HELPERS
// ══════════════════════════════════════════════════════
function updateStatusBar(filename) {
  titleFilename.textContent = filename;
  const ext = filename.split('.').pop();
  statusLang.textContent = ext === 'sh' ? 'Shell Script' : 'Markdown';
  setStatus('Ready');
}

function setStatus(msg) {
  statusReady.textContent = msg === 'Ready' ? '● Ready' : msg;
}

function updateBreadcrumb(filename) {
  breadcrumb.textContent = filename || '';
  $('breadcrumb-bar').style.display = filename ? 'flex' : 'none';
}

// ══════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg, isError = false) {
  const toast = $('toast');
  $('toast-msg').textContent = msg;
  toast.style.borderLeftColor = isError ? 'var(--danger)' : 'var(--success)';
  toast.querySelector('i').style.color = isError ? 'var(--danger)' : 'var(--success)';
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
}

// ══════════════════════════════════════════════════════
//  CLOSE MODALS ON BACKDROP CLICK
// ══════════════════════════════════════════════════════
['modal-new-file', 'modal-delete'].forEach(id => {
  $(id).addEventListener('click', e => {
    if (e.target === $(id)) $(id).classList.add('hidden');
  });
});
