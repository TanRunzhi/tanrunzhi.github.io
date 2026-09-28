/* 常用字符串本地库（localStorage）
 * 各子模块共用，便于保存常用文本、在使用功能时快速拼接粘贴。
 * 数据仅存于当前浏览器，不上传服务器。
 */
(function () {
  const KEY = 'local_snippets';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function add(name, value) {
    const l = load();
    l.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name || '',
      value: value || '',
      t: Date.now()
    });
    if (l.length > 100) l.length = 100;
    save(l);
    return l;
  }
  function remove(id) {
    const l = load().filter(s => s.id !== id);
    save(l);
    return l;
  }
  function update(id, name, value) {
    const l = load().map(s => s.id === id
      ? Object.assign({}, s, { name: name, value: value, t: Date.now() })
      : s);
    save(l);
    return l;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  window.Snippets = { load, save, add, remove, update, esc, KEY };
})();
