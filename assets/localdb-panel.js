/* 本地数据：全局右侧抽屉面板
 * - 右上角「本地数据」按钮（可锚定到页面卡片右上角，否则常驻页面右上角）
 * - 支持常用字符串的增删改查 / 复制，抽屉内可搜索过滤
 * - 左边缘可拖动调整宽度，宽度与「是否打开」均存入 localStorage
 * - 打开时给 body 加 .ldb-open 类并同步 --ldb-w 变量，供页面把内容左移避让
 * - 默认仅显示搜索框，点「➕ 添加」才展开添加表单
 * - 跨页面（模块）自动恢复打开状态与宽度，内容共享同一份 localStorage
 */
(function () {
  if (!window.Snippets) {
    console.warn('Snippets 未加载，本地数据抽屉不可用');
    return;
  }
  const S = window.Snippets;
  const K_OPEN = 'localdb_panel_open';
  const K_W = 'localdb_panel_w';

  const css = `
  #ldb-toggle{
    position:fixed; top:16px; right:16px; z-index:60;
    font:inherit; font-size:13px; cursor:pointer;
    border:1px solid rgba(37,99,235,.3);
    background:linear-gradient(92deg,#e8f1ff,#e0f7ff);
    color:#1d4ed8; border-radius:999px; padding:8px 16px;
    box-shadow:0 6px 16px -10px rgba(37,99,235,.45);
  }
  #ldb-toggle:hover{filter:brightness(.98)}
  /* 若页面提供锚点，则把按钮放到卡片内（非页面级 fixed） */
  #ldb-toggle-anchor #ldb-toggle{ position:static; top:auto; right:auto; }
  #ldb-drawer{
    position:fixed; top:0; right:0; height:100vh; width:30vw;
    min-width:240px; max-width:70vw;
    background:#fff; border-left:1px solid var(--line,#e5e9f2);
    box-shadow:-20px 0 60px -30px rgba(15,23,42,.4);
    z-index:50; transform:translateX(100%); transition:transform .25s ease;
    display:flex;
  }
  #ldb-drawer.open{ transform:translateX(0); }
  .ldb-resizer{
    width:6px; flex:0 0 auto; cursor:col-resize;
    background:transparent; touch-action:none; user-select:none;
  }
  .ldb-resizer:hover{ background:rgba(37,99,235,.18); }
  .ldb-inner{
    flex:1; min-width:0; display:flex; flex-direction:column;
    padding:18px 16px; overflow:hidden;
  }
  .ldb-head{
    display:flex; align-items:center; justify-content:space-between;
    font-weight:600; font-size:15px; color:var(--txt,#1e293b);
  }
  .ldb-head-ops{ display:flex; align-items:center; gap:8px; }
  .ldb-close{
    border:none; background:none; cursor:pointer;
    font-size:18px; color:#94a3b8; line-height:1;
  }
  .ldb-close:hover{ color:#ef4444; }
  .ldb-note{
    font-size:12px; color:#1d4ed8; line-height:1.6;
    background:rgba(37,99,235,.06); border:1px solid rgba(37,99,235,.2);
    border-radius:10px; padding:8px 10px; margin:12px 0;
  }
  .ldb-search{ position:relative; margin:4px 0 12px; }
  .ldb-search input{
    width:100%; font:inherit; font-size:13px; padding:9px 12px 9px 34px;
    border:1px solid var(--line,#e5e9f2); border-radius:10px;
    background:#fff; color:var(--txt,#1e293b); outline:none;
  }
  .ldb-search input:focus{ border-color:rgba(37,99,235,.5); }
  .ldb-search::before{
    content:"🔍"; position:absolute; left:12px; top:50%;
    transform:translateY(-50%); font-size:13px; opacity:.6;
  }
  .ldb-form{ display:flex; flex-direction:column; gap:8px; }
  .ldb-form input, .ldb-form textarea{
    font:inherit; font-size:13px; color:var(--txt,#1e293b); background:#fff;
    border:1px solid var(--line,#e5e9f2); border-radius:10px; padding:9px 11px; outline:none;
  }
  .ldb-form textarea{ min-height:60px; resize:vertical; font-family:ui-monospace,Consolas,monospace; }
  .ldb-form input:focus, .ldb-form textarea:focus{ border-color:rgba(37,99,235,.5); }
  .btn-act-ldb{
    font:inherit; font-size:13px; cursor:pointer; border-radius:9px; padding:8px 16px;
    border:1px solid var(--line,#e5e9f2); background:#fff; color:#1d4ed8;
  }
  .btn-act-ldb.primary{
    border-color:rgba(37,99,235,.3);
    background:linear-gradient(92deg,#e8f1ff,#e0f7ff); font-weight:600;
  }
  .btn-act-ldb:hover{ border-color:rgba(37,99,235,.4); }
  .ldb-list{ margin-top:14px; flex:1; overflow:auto; display:flex; flex-direction:column; gap:10px; }
  .ldb-rec{ border:1px solid var(--line,#e5e9f2); border-radius:12px; padding:10px 12px; background:#f8fafc; }
  .ldb-rec .top{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .ldb-rec .nm{ font-weight:600; font-size:13px; display:flex; align-items:center; gap:6px; color:var(--txt,#1e293b); }
  .ldb-rec .bd{ font-size:10px; color:#94a3b8; font-weight:400; }
  .ldb-rec .ops{ display:flex; gap:4px; }
  .ldb-rec .ops button{
    font:inherit; font-size:11px; cursor:pointer;
    border:1px solid var(--line,#e5e9f2); background:#fff; color:#64748b;
    border-radius:7px; padding:4px 9px;
  }
  .ldb-rec .ops button:hover{ border-color:rgba(37,99,235,.4); color:#1d4ed8; }
  .ldb-rec .ops button.del:hover{ border-color:#ef4444; color:#ef4444; }
  .ldb-rec .val{
    margin-top:8px; font-family:ui-monospace,Consolas,monospace; font-size:12px;
    color:#334155; white-space:pre-wrap; word-break:break-all; max-height:140px; overflow:auto;
  }
  .ldb-empty{ color:#64748b; font-size:13px; margin-top:10px; }
  /* 抽屉打开时，页面主体把内容左移避让（由具体页面声明，避免影响未适配页） */
  body.ldb-open{ }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 切换按钮：优先放进页面提供的锚点（卡片右上角），否则常驻页面右上角
  const anchor = document.getElementById('ldb-toggle-anchor');
  const toggle = document.createElement('button');
  toggle.id = 'ldb-toggle';
  toggle.textContent = '🗃️ 本地数据';
  if (anchor) anchor.appendChild(toggle);
  else document.body.appendChild(toggle);

  const drawer = document.createElement('aside');
  drawer.id = 'ldb-drawer';
  drawer.innerHTML =
    '<div class="ldb-resizer" id="ldb-resizer"></div>' +
    '<div class="ldb-inner">' +
      '<div class="ldb-head"><span>本地数据 · 常用字符串</span>' +
        '<div class="ldb-head-ops">' +
          '<button class="btn-act-ldb primary" id="ldb-add-toggle">➕ 添加</button>' +
          '<button class="ldb-close" id="ldb-close" title="关闭">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="ldb-note">🔒 仅保存在当前浏览器的 localStorage，不上传服务器。可拖动左边缘调整宽度，宽度会自动记住。</div>' +
      '<div class="ldb-search"><input id="ldb-search" type="search" placeholder="搜索名称或内容…" autocomplete="off"></div>' +
      '<div class="ldb-form" id="ldb-form" style="display:none">' +
        '<input id="ldb-name" type="text" placeholder="名称（可选）">' +
        '<textarea id="ldb-value" placeholder="输入要保存的常用字符串…"></textarea>' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn-act-ldb primary" id="ldb-add">添加</button>' +
          '<button class="btn-act-ldb" id="ldb-cancel" style="display:none">取消</button>' +
        '</div>' +
      '</div>' +
      '<div class="ldb-list" id="ldb-list"></div>' +
    '</div>';
  document.body.appendChild(drawer);

  const listEl = drawer.querySelector('#ldb-list');
  const nameEl = drawer.querySelector('#ldb-name');
  const valEl = drawer.querySelector('#ldb-value');
  const addBtn = drawer.querySelector('#ldb-add');
  const cancelBtn = drawer.querySelector('#ldb-cancel');
  const addToggleBtn = drawer.querySelector('#ldb-add-toggle');
  const formEl = drawer.querySelector('#ldb-form');
  const searchEl = drawer.querySelector('#ldb-search');
  const resizer = drawer.querySelector('#ldb-resizer');
  let editingId = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  function showForm() { formEl.style.display = ''; }
  function hideForm() {
    formEl.style.display = 'none';
    editingId = null;
    nameEl.value = '';
    valEl.value = '';
    addBtn.textContent = '添加';
    cancelBtn.style.display = 'none';
  }

  function render() {
    const all = S.load();
    const q = (searchEl.value || '').trim().toLowerCase();
    const list = q
      ? all.filter(it => ((it.name || '') + ' ' + (it.value || '')).toLowerCase().includes(q))
      : all;
    listEl.innerHTML = '';
    if (!list.length) {
      listEl.innerHTML = q
        ? '<p class="ldb-empty">没有匹配「' + esc(q) + '」的常用字符串</p>'
        : '<p class="ldb-empty">暂无保存的常用字符串，点右上角「➕ 添加」新增一条吧～</p>';
      return;
    }
    list.forEach(it => {
      const div = document.createElement('div');
      div.className = 'ldb-rec';
      div.innerHTML =
        '<div class="top"><span class="nm">' + esc(it.name || '（未命名）') +
        '<span class="bd">' + new Date(it.t).toLocaleString('zh-CN', { hour12: false }) + '</span></span>' +
        '<span class="ops"><button class="cp" data-id="' + it.id + '">复制</button>' +
        '<button class="ed" data-id="' + it.id + '">编辑</button>' +
        '<button class="del" data-id="' + it.id + '">删除</button></span></div>' +
        '<div class="val">' + esc(it.value) + '</div>';
      listEl.appendChild(div);
    });
    listEl.querySelectorAll('.cp').forEach(b => b.onclick = () => {
      const it = S.load().find(x => x.id === b.dataset.id);
      if (!it) return;
      copyText(it.value);
      b.textContent = '已复制';
      setTimeout(() => b.textContent = '复制', 1000);
    });
    listEl.querySelectorAll('.ed').forEach(b => b.onclick = () => {
      const it = S.load().find(x => x.id === b.dataset.id);
      if (!it) return;
      editingId = it.id;
      nameEl.value = it.name;
      valEl.value = it.value;
      addBtn.textContent = '保存修改';
      cancelBtn.style.display = '';
      showForm();
      nameEl.focus();
    });
    listEl.querySelectorAll('.del').forEach(b => b.onclick = () => {
      if (confirm('确定删除该条常用字符串？')) { S.remove(b.dataset.id); render(); }
    });
  }

  function syncWidthVar() {
    document.documentElement.style.setProperty('--ldb-w', drawer.offsetWidth + 'px');
  }

  function openP() {
    drawer.classList.add('open');
    toggle.style.display = 'none';
    document.body.classList.add('ldb-open');
    syncWidthVar();
    localStorage.setItem(K_OPEN, '1');
  }
  function closeP() {
    drawer.classList.remove('open');
    toggle.style.display = '';
    document.body.classList.remove('ldb-open');
    localStorage.setItem(K_OPEN, '0');
  }

  toggle.onclick = openP;
  drawer.querySelector('#ldb-close').onclick = closeP;
  addToggleBtn.onclick = () => {
    if (formEl.style.display === 'none') { hideForm(); showForm(); nameEl.focus(); }
    else hideForm();
  };

  addBtn.onclick = () => {
    const name = nameEl.value.trim();
    const value = valEl.value;
    if (!value) { alert('内容不能为空'); return; }
    if (editingId) {
      S.update(editingId, name, value);
    } else {
      S.add(name, value);
    }
    render();
    hideForm();
  };
  cancelBtn.onclick = hideForm;

  searchEl.addEventListener('input', render);

  resizer.addEventListener('pointerdown', e => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    function move(ev) {
      let w = window.innerWidth - ev.clientX;
      w = Math.max(240, Math.min(window.innerWidth * 0.7, w));
      drawer.style.width = w + 'px';
      syncWidthVar();
    }
    function up() {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.body.style.cursor = '';
      const w = parseInt(drawer.style.width, 10);
      if (w) localStorage.setItem(K_W, w);
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  const savedW = localStorage.getItem(K_W);
  if (savedW) drawer.style.width = savedW + 'px';
  if (localStorage.getItem(K_OPEN) === '1') openP();

  render();
})();
