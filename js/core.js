/* ===== 通用内核：存储 / 工具 / 弹窗 / 表单 / 列表 ===== */
window.App = {};
(function () {
  var App = window.App;

  /* ---------- 图标 ---------- */
  var P = {
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><line x1="20" y1="20" x2="16" y2="16"/>',
    star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    img: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    camera: '<path d="M3 8.5A2 2 0 0 1 5 6.5h1.7l1.2-2h8.2l1.2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.5 3.4L11.8 5.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    map: '<polygon points="1 6 8 3 15 6 22 3 22 18 15 21 8 18 1 21 1 6"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
    home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7.5 12 12.3 20.7 7.5"/><line x1="12" y1="22" x2="12" y2="12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    heart2: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    paw: '<circle cx="6" cy="10" r="2"/><circle cx="10.5" cy="6" r="2"/><circle cx="15.5" cy="6.5" r="2"/><circle cx="19" cy="11" r="2"/><path d="M12.5 12.5c2.5 0 4.5 2 4.5 4.2 0 1.8-1.5 3.3-3.4 3.3-1 0-1.6-.3-2.6-.3s-1.6.3-2.6.3c-1.9 0-3.4-1.5-3.4-3.3 0-2.2 2-4.2 4.5-4.2z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/>',
    pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>',
    shirt: '<path d="M16 3l5 3-2 4-2-1v12H7V9L5 10 3 6l5-3a4 4 0 0 0 8 0z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    cake: '<path d="M3 20h18v-6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3z"/><path d="M12 11V8"/><circle cx="12" cy="6" r="1.5"/><circle cx="7.5" cy="8" r="1"/><circle cx="16.5" cy="8" r="1"/>',
    flag: '<path d="M4 22V4"/><path d="M4 4h13l-2 4 2 4H4"/>',
    run: '<circle cx="13" cy="4" r="2"/><path d="M11 22l3-6-3-4 2-3 4 2 3 1"/><path d="M8 10l-2 3 3 4 1 5"/>',
    search2: '<circle cx="11" cy="11" r="7.5"/><line x1="20" y1="20" x2="16" y2="16"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'
  };
  App.icon = function (n, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24">' + (P[n] || P.note) + '</svg>';
  };

  /* ---------- 工具 ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function todayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(s) { if (!s) return null; var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function diffDays(a, b) { // b - a
    if (!a || !b) return null;
    var x = parseDate(a), y = parseDate(b); if (!x || !y) return null;
    x.setHours(0, 0, 0, 0); y.setHours(0, 0, 0, 0);
    return Math.round((y - x) / 86400000);
  }
  function addDays(s, n) { var d = parseDate(s) || new Date(); d.setDate(d.getDate() + n); return todayStr(d); }
  function addMonths(s, n) { var d = parseDate(s) || new Date(); d.setMonth(d.getMonth() + n); return todayStr(d); }
  function weekdayCn(d) { return '日一二三四五六'[d.getDay()]; }
  function money(n) { return (n == null || n === '') ? '-' : '¥' + Number(n).toFixed(Number(n) % 1 ? 2 : 0); }
  function ageOf(birth) { // 返回 {y,m,d}
    var b = parseDate(birth); if (!b) return null;
    var t = new Date(); var y = t.getFullYear() - b.getFullYear(), m = t.getMonth() - b.getMonth(), d = t.getDate() - b.getDate();
    if (d < 0) { m--; var pm = new Date(t.getFullYear(), t.getMonth(), 0).getDate(); d += pm; }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d, text: y > 0 ? y + '岁' + (m ? m + '个月' : '') : (m > 0 ? m + '个月' : d + '天') };
  }
  App.util = { $: $, $$: $$, uid: uid, esc: esc, pad: pad, today: todayStr, parseDate: parseDate, diffDays: diffDays, addDays: addDays, addMonths: addMonths, weekdayCn: weekdayCn, money: money, ageOf: ageOf };

  /* ---------- 存储 ---------- */
  var NS = 'jwlife.';
  var Store = {
    get: function (k, def) {
      try { var v = localStorage.getItem(NS + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { App.toast('存储空间不足，请清理图片', 'err'); } },
    list: function (k) { return Store.get(k, []) || []; },
    save: function (k, arr) { Store.set(k, arr); },
    add: function (k, item) { var a = Store.list(k); item.id = item.id || uid(); item.createdAt = item.createdAt || new Date().toISOString(); a.unshift(item); Store.save(k, a); return item; },
    update: function (k, id, patch) {
      var a = Store.list(k), i = a.findIndex(function (x) { return x.id === id; });
      if (i > -1) { a[i] = Object.assign({}, a[i], patch, { updatedAt: new Date().toISOString() }); Store.save(k, a); return a[i]; }
      return null;
    },
    remove: function (k, id) { var a = Store.list(k).filter(function (x) { return x.id !== id; }); Store.save(k, a); },
    find: function (k, id) { return Store.list(k).find(function (x) { return x.id === id; }); }
  };
  App.Store = Store;
  App.profile = function () { return Store.get('profile', { nick: '', height: '', weight: '', gender: '女', avatar: '' }); };
  App.saveProfile = function (p) { Store.set('profile', Object.assign(App.profile(), p)); };

  /* ---------- Toast ---------- */
  App.toast = function (msg, type) {
    var r = $('#toast-root');
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    r.appendChild(t);
    setTimeout(function () { t.style.transition = '.3s'; t.style.opacity = 0; setTimeout(function () { t.remove(); }, 300); }, 2000);
  };

  /* ---------- 弹窗（支持多层） ---------- */
  var stack = [];
  App.modal = {
    open: function (opt) {
      var ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.style.zIndex = 100 + stack.length * 10;
      ov.innerHTML =
        '<div class="modal ' + (opt.size || '') + '">' +
        '<div class="modal-hd"><div class="t">' + esc(opt.title || '') + '</div>' +
        '<button class="icon-btn" data-close>' + App.icon('x') + '</button></div>' +
        '<div class="modal-bd"></div>' +
        (opt.footer === false ? '' : '<div class="modal-ft">' + (opt.note ? '<div class="modal-note">' + opt.note + '</div>' : '') +
          '<button class="btn ghost" data-close>' + (opt.cancelText || '取消') + '</button>' +
          (opt.okText === false ? '' : '<button class="btn primary" data-ok>' + (opt.okText || '保存') + '</button>') + '</div>') +
        '</div>';
      var bd = $('.modal-bd', ov);
      if (typeof opt.body === 'string') bd.innerHTML = opt.body; else if (opt.body) bd.appendChild(opt.body);
      var handle = { el: ov, close: close };
      function close() {
        var i = stack.indexOf(handle); if (i > -1) stack.splice(i, 1);
        ov.remove();
        if (opt.onClose) opt.onClose();
      }
      $$('[data-close]', ov).forEach(function (b) { b.onclick = close; });
      var okBtn = $('[data-ok]', ov);
      if (okBtn) okBtn.onclick = function () { if (opt.onOk) opt.onOk(handle, bd); else close(); };
      ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
      document.addEventListener('keydown', function esc2(e) {
        if (e.key === 'Escape' && stack[stack.length - 1] === handle) { close(); document.removeEventListener('keydown', esc2); }
      });
      $('#modal-root').appendChild(ov);
      stack.push(handle);
      if (opt.onMount) opt.onMount(bd, handle);
      return handle;
    }
  };
  App.confirm = function (msg, onOk, danger) {
    App.modal.open({
      title: '确认操作', size: '', okText: '确定',
      body: '<div style="font-size:14px;line-height:1.7">' + msg + '</div>',
      onOk: function (h) { h.close(); onOk && onOk(); },
      onMount: function (bd, h) { var b = $('[data-ok]', h.el); if (b && danger) { b.classList.remove('primary'); b.classList.add('danger'); } }
    });
  };

  /* ---------- 图片压缩 ---------- */
  function compress(file, max, q) {
    max = max || 760; q = q || 0.7;
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var s = Math.min(1, max / Math.max(im.width, im.height));
          var c = document.createElement('canvas');
          c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', q));
        };
        im.onerror = rej; im.src = fr.result;
      };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }
  App.compress = compress;

  /* ---------- 文件选择（覆盖式 input，兼容 Android / 小米浏览器的独立窗口） ---------- */
  function pickFile(trigger, opts, onFiles) {
    opts = opts || {};
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.className = 'file-cover';
    if (opts.accept) inp.accept = opts.accept;
    if (opts.multiple) inp.multiple = true;
    if (opts.capture) inp.setAttribute('capture', opts.capture);
    var st = window.getComputedStyle(trigger);
    if (!st || st.position === 'static') trigger.style.position = 'relative';
    inp.onchange = function () {
      var files = Array.prototype.slice.call(inp.files || []);
      inp.value = '';
      if (files.length) onFiles(files);
    };
    // 系统选择器被取消（返回键 / 取消按钮）
    inp.addEventListener('cancel', function () { if (opts.onCancel) opts.onCancel(); });
    // 兜底：若点击没落在 input 本身（部分 WebView 行为差异），手动触发一次
    trigger.addEventListener('click', function (e) {
      if (e.target === inp) return;
      e.preventDefault();
      inp.click();
    });
    trigger.appendChild(inp);
    return inp;
  }
  App.pickFile = pickFile;

  /* ---------- 直接调用相机拍照（不依赖文件选择器） ---------- */
  function cameraCapture(cb) {
    var md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) {
      App.toast('当前环境不支持拍照，请用浏览器打开', 'err');
      return;
    }
    var stream = null, video = null;
    function stop() {
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    }
    App.modal.open({
      title: '拍照', okText: '拍摄', cancelText: '取消',
      body: '<video id="cam-v" autoplay playsinline muted style="width:100%;max-height:56vh;border-radius:12px;background:#000;object-fit:cover"></video>' +
        '<div id="cam-tip" style="margin-top:8px;font-size:12px;color:var(--muted)">正在启动相机…</div>',
      onMount: function (bd) {
        video = bd.querySelector('#cam-v');
        var tip = bd.querySelector('#cam-tip');
        md.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false })
          .then(function (s) {
            stream = s; video.srcObject = s;
            var p = video.play(); if (p && p.catch) p.catch(function () { });
            tip.textContent = '对准后点「拍摄」';
          })
          .catch(function (e) {
            tip.textContent = '无法打开相机（' + ((e && e.name) || '未知') + '）。请允许相机权限，或用「上传」从相册选。';
          });
      },
      onOk: function (h) {
        if (!video || !video.videoWidth) { App.toast('相机还没准备好', 'err'); return; }
        var max = 900;
        var s = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(video.videoWidth * s);
        c.height = Math.round(video.videoHeight * s);
        c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/jpeg', 0.72);
        stop(); h.close(); cb(url);
      },
      onClose: stop
    });
  }
  App.cameraCapture = cameraCapture;

  /* ---------- 添加图片：先弹自己的菜单，确认后才唤起系统界面 ---------- */
  function imageMenu(onPick, onCam) {
    App.modal.open({
      title: '添加图片', okText: false, cancelText: '取消',
      note: '唤起系统界面后，用手机返回键也能退出',
      body: '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="btn primary" id="m-pick">从相册选照片</button>' +
        '<button class="btn ghost" id="m-cam">拍照</button>' +
        '</div>',
      onMount: function (bd, h) {
        var camBtn = bd.querySelector('#m-cam');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          camBtn.onclick = function () { h.close(); onCam(); };
        } else {
          camBtn.disabled = true;
          camBtn.textContent = '当前环境不支持拍照';
        }
        pickFile(bd.querySelector('#m-pick'), { accept: 'image/*', multiple: true }, function (files) {
          h.close(); onPick(files);
        });
      }
    });
  }

  /* ---------- 表单 ---------- */
  function optVal(o) { return (o && typeof o === 'object') ? o.v : o; }
  function optLabel(o) { return (o && typeof o === 'object') ? o.l : o; }

  function imagesCtl(ctl, f, val) {
    var arr = Array.isArray(val) ? val.slice() : (val ? [val] : []);
    function paint() {
      ctl.innerHTML = '';
      var g = document.createElement('div');
      g.className = 'img-grid';
      arr.forEach(function (src, i) {
        var d = document.createElement('div'); d.className = 'img-item';
        d.innerHTML = '<img src="' + src + '"><button class="del" type="button">×</button>';
        d.querySelector('.del').onclick = function () { arr.splice(i, 1); paint(); };
        d.querySelector('img').onclick = function () {
          App.modal.open({ title: '查看图片', okText: false, cancelText: '关闭', body: '<img src="' + src + '" style="width:100%;border-radius:12px">' });
        };
        g.appendChild(d);
      });
      function addImages(urls) { arr = arr.concat(urls); paint(); }
      if (arr.length < (f.max || 6)) {
        var add = document.createElement('div'); add.className = 'img-add';
        add.innerHTML = App.icon('plus') + '<span>添加</span>';
        add.onclick = function () {
          imageMenu(
            function (files) {
              var left = (f.max || 6) - arr.length;
              Promise.all(files.slice(0, left).map(function (x) {
                return compress(x, f.maxSize || 900, f.quality || 0.72);
              })).then(addImages).catch(function () { App.toast('图片读取失败，请重试', 'err'); });
            },
            function () {
              cameraCapture(function (url) { if (arr.length < (f.max || 6)) addImages([url]); });
            }
          );
        };
        g.appendChild(add);
      }
      ctl.appendChild(g);
    }
    paint();
    ctl._get = function () { return arr; };
  }

  function chipsCtl(ctl, f, val) {
    var arr = Array.isArray(val) ? val.slice() : (val ? [val] : []);
    function paint() {
      ctl.innerHTML = '';
      var box = document.createElement('div'); box.className = 'chip-picks';
      (f.options || []).forEach(function (o) {
        var v = optVal(o), b = document.createElement('button');
        b.type = 'button'; b.className = 'chip-pick' + (arr.indexOf(v) > -1 ? ' on' : '');
        b.textContent = optLabel(o);
        b.onclick = function () {
          var i = arr.indexOf(v);
          if (i > -1) arr.splice(i, 1); else arr.push(v);
          if (f.max && arr.length > f.max) arr.shift();
          paint();
        };
        box.appendChild(b);
      });
      ctl.appendChild(box);
    }
    paint();
    ctl._get = function () { return arr; };
  }

  function sublistCtl(ctl, f, val) {
    var arr = (Array.isArray(val) ? val : []).map(function (x) { return Object.assign({}, x); });
    function summary(it) {
      if (f.summary) return f.summary(it);
      var parts = (f.subFields || []).slice(0, 3).map(function (sf) {
        var v = it[sf.key];
        if (v == null || v === '') return '';
        return (sf.label ? sf.label + '：' : '') + v + (sf.unit || '');
      }).filter(Boolean);
      return parts.join(' · ') || '（空记录）';
    }
    function paint() {
      ctl.innerHTML = '';
      if (!arr.length) {
        ctl.innerHTML = '<div class="sub-empty">暂无记录</div>';
      } else {
        var box = document.createElement('div'); box.className = 'sublist';
        arr.forEach(function (it, i) {
          var row = document.createElement('div'); row.className = 'sub-item';
          row.innerHTML = '<div class="txt"><div class="s1">' + esc(summary(it)) + '</div>' +
            '<div class="s2">' + esc((f.subFields || []).slice(3).map(function (sf) { return it[sf.key] ? sf.label + '：' + it[sf.key] : ''; }).filter(Boolean).join(' · ')) + '</div></div>';
          var e = document.createElement('button'); e.type = 'button'; e.className = 'icon-btn'; e.innerHTML = App.icon('edit');
          e.onclick = function () { openForm(i); };
          var d = document.createElement('button'); d.type = 'button'; d.className = 'icon-btn danger'; d.innerHTML = App.icon('trash');
          d.onclick = function () { arr.splice(i, 1); paint(); };
          row.appendChild(e); row.appendChild(d);
          box.appendChild(row);
        });
        ctl.appendChild(box);
      }
      var add = document.createElement('button');
      add.type = 'button'; add.className = 'btn ghost sm'; add.style.marginTop = '7px';
      add.innerHTML = App.icon('plus', 'ico') + '添加' + esc(f.label);
      add.onclick = function () { openForm(-1); };
      ctl.appendChild(add);
    }
    function openForm(i) {
      App.form({
        title: (i > -1 ? '编辑' : '添加') + f.label,
        fields: f.subFields || [],
        value: i > -1 ? arr[i] : (f.subDefault || {}),
        size: 'lg',
        onSubmit: function (v) { if (i > -1) arr[i] = Object.assign(arr[i], v); else arr.push(Object.assign({ id: uid() }, v)); paint(); return true; }
      });
    }
    paint();
    ctl._get = function () { return arr; };
  }

  function buildField(f, val) {
    var el = document.createElement('div');
    el.className = 'field' + (f.full || f.type === 'textarea' || f.type === 'images' || f.type === 'sublist' ? ' full' : '');
    var lab = '<label>' + esc(f.label) + (f.required ? ' <span class="req">*</span>' : '') + '</label>';
    var hint = f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '';
    if (f.type === 'images' || f.type === 'chips' || f.type === 'sublist') {
      el.innerHTML = lab + '<div class="ctl" data-key="' + f.key + '"></div>' + hint;
      var ctl = $('.ctl', el);
      if (f.type === 'images') imagesCtl(ctl, f, val);
      else if (f.type === 'chips') chipsCtl(ctl, f, val);
      else sublistCtl(ctl, f, val);
      return el;
    }
    if (f.type === 'switch') {
      var on = !!val;
      el.innerHTML = lab + '<div class="ctl" data-key="' + f.key + '"><div class="switch' + (on ? ' on' : '') + '"></div></div>' + hint;
      var sw = $('.switch', el), c2 = $('.ctl', el);
      sw.onclick = function () { on = !on; sw.classList.toggle('on', on); };
      c2._get = function () { return on; };
      return el;
    }
    var inner = '';
    if (f.type === 'select') {
      inner = '<select class="select">' + (f.placeholder ? '<option value="">' + esc(f.placeholder) + '</option>' : '') +
        (f.options || []).map(function (o) {
          var v = optVal(o), s = v === val ? ' selected' : '';
          return '<option value="' + esc(v) + '"' + s + '>' + esc(optLabel(o)) + '</option>';
        }).join('') + '</select>';
    } else if (f.type === 'textarea') {
      inner = '<textarea class="textarea" placeholder="' + esc(f.placeholder || '') + '">' + esc(val == null ? '' : val) + '</textarea>';
    } else if (f.type === 'number') {
      inner = '<input class="input" type="number" step="' + (f.step || 'any') + '" value="' + esc(val == null ? '' : val) + '" placeholder="' + esc(f.placeholder || '') + '">';
    } else {
      inner = '<input class="input" type="' + (f.type || 'text') + '" value="' + esc(val == null ? '' : val) + '" placeholder="' + esc(f.placeholder || '') + '"' + (f.min ? ' min="' + f.min + '"' : '') + '>';
    }
    el.innerHTML = lab + inner.replace('class="', 'data-key="' + f.key + '" class="') + hint;
    return el;
  }

  App.form = function (opt) {
    var box = document.createElement('div');
    box.className = 'fields';
    var val = opt.value || {};
    (opt.fields || []).forEach(function (f) { box.appendChild(buildField(f, val[f.key])); });
    var h = App.modal.open({
      title: opt.title,
      size: opt.size || '',
      body: box,
      note: opt.note || '',
      okText: opt.okText || '保存',
      onOk: function (hh) {
        var v = {};
        var err = null;
        $$('[data-key]', box).forEach(function (elm) {
          var k = elm.dataset.key;
          var x = elm._get ? elm._get() : (elm.type === 'checkbox' ? elm.checked : elm.value);
          var fd = (opt.fields || []).find(function (f) { return f.key === k; });
          if (fd && fd.type === 'number' && x !== '' && x != null) x = Number(x);
          v[k] = x;
        });
        (opt.fields || []).forEach(function (f) {
          if (f.required && (v[f.key] === '' || v[f.key] == null || (Array.isArray(v[f.key]) && !v[f.key].length))) err = f.label;
        });
        if (err) { App.toast('请填写：' + err, 'err'); return; }
        if (opt.onSubmit && opt.onSubmit(v, hh) === false) return;
        hh.close();
        if (opt.after) opt.after(v);
      }
    });
    setTimeout(function () { var i = $('.input,.select,.textarea', box); if (i) i.focus(); }, 60);
    return h;
  };

  /* ---------- 模块机制 ---------- */
  App.modules = [];
  App.state = {};
  App.registerModule = function (mod) { App.modules.push(mod); };
  App.getModule = function (id) { return App.modules.find(function (m) { return m.id === id; }); };

  function matchQ(item, q, mod) {
    if (!q) return true;
    q = q.toLowerCase();
    var keys = mod.searchKeys;
    var txt;
    if (keys) txt = keys.map(function (k) { return item[k]; }).join(' ');
    else txt = Object.keys(item).filter(function (k) { return !/photo|image|avatar|img/i.test(k); })
      .map(function (k) { var v = item[k]; return typeof v === 'object' ? JSON.stringify(v) : v; }).join(' ');
    return String(txt).toLowerCase().indexOf(q) > -1;
  }

  /* 默认卡片 */
  function defaultCard(item, mod) {
    var img = mod.imageKey ? (Array.isArray(item[mod.imageKey]) ? item[mod.imageKey][0] : item[mod.imageKey]) : null;
    var title = esc(item[mod.titleKey] || '未命名');
    var chips = (mod.badges || []).map(function (b, i) {
      var v = typeof b === 'function' ? b(item) : item[b];
      if (!v) return '';
      var cls = i === 0 ? 'brand' : (i === 1 ? 'blue' : '');
      return '<span class="chip ' + cls + '">' + esc(v) + '</span>';
    }).join('');
    var lines = (mod.lines || []).map(function (l) {
      var v = typeof l[1] === 'function' ? l[1](item) : item[l[1]];
      if (v == null || v === '') return '';
      return '<div class="l"><span class="k">' + esc(l[0]) + '</span><span class="v">' + v + '</span></div>';
    }).join('');
    var foot = mod.foot ? mod.foot(item) : (item.createdAt ? '创建于 ' + item.createdAt.slice(0, 10) : '');
    return '<div class="card" data-id="' + item.id + '">' +
      (img ? '<div class="card-media"><img src="' + img + '" loading="lazy">' + ((item[mod.imageKey] || []).length > 1 ? '<span class="multi">+' + (item[mod.imageKey].length - 1) + '</span>' : '') + '</div>'
        : (mod.imageKey ? '<div class="card-media"><span class="ph">' + App.icon(mod.icon || 'img', '') + '</span></div>' : '')) +
      '<div class="card-body">' +
      '<div class="card-hd"><div class="card-title">' + title + '</div><div class="card-acts">' +
      '<button class="icon-btn" data-act="edit" title="编辑">' + App.icon('edit') + '</button>' +
      '<button class="icon-btn danger" data-act="del" title="删除">' + App.icon('trash') + '</button></div></div>' +
      (chips ? '<div class="chips">' + chips + '</div>' : '') +
      (lines ? '<div class="lines">' + lines + '</div>' : '') +
      (foot ? '<div class="card-foot">' + foot + '</div>' : '') +
      '</div></div>';
  }
  App.defaultCard = defaultCard;
  App.statsHTML = function (mod, items) {
    return (mod.stats(items, mod) || []).map(function (s) {
      return '<div class="stat ' + (s.cls || '') + '"><div class="k">' + esc(s.label) + '</div><div class="v">' + s.value + '</div><div class="s">' + esc(s.sub || '') + '</div></div>';
    }).join('');
  };

  function emptyBox(mod) {
    return '<div class="empty" style="grid-column:1/-1"><div class="big">' + App.icon(mod.icon || 'box', '') + '</div>' +
      '<div class="t">还没有' + esc(mod.name) + '记录</div><div class="d">点击右上角「新增」开始记录吧</div></div>';
  }

  /* 渲染通用模块 */
  App.renderModule = function (mod, target) {
    var page = target || $('#page');
    App.current = mod;
    var st = App.state[mod.id] || (App.state[mod.id] = { q: '', group: '' });

    page.innerHTML =
      '<div class="page-head">' +
      '<div><div class="page-title">' + App.icon(mod.icon) + esc(mod.name) + '</div>' +
      '<div class="page-desc">' + esc(mod.desc || '') + '</div></div><div class="spacer"></div>' +
      '<div class="toolbar">' +
      '<div class="search-box">' + App.icon('search') + '<input id="q" placeholder="搜索' + esc(mod.name) + '…" value="' + esc(st.q) + '"><button class="clr" id="qclr" style="display:' + (st.q ? 'block' : 'none') + '">×</button></div>' +
      (mod.toolbar || []).map(function (b, i) { return '<button class="btn ghost" data-tb="' + i + '">' + App.icon(b.icon || 'star', 'ico') + esc(b.label) + '</button>'; }).join('') +
      (mod.hideAdd ? '' : '<button class="btn primary" data-act="add">' + App.icon('plus') + '新增</button>') +
      '</div></div><div id="m-body"></div>';

    var body = $('#m-body', page);
    var q = $('#q', page);
    function onQ() {
      st.q = q.value;
      $('#qclr', page).style.display = q.value ? 'block' : 'none';
      if (mod.render) {
        if (mod.onSearch) { mod.onSearch(st.q, body, ctx()); return; }
        App.renderModule(mod, target);
        var nq = $('#q', $('#page')); if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); }
        return;
      }
      renderList();
    }
    q.oninput = onQ;
    $('#qclr', page).onclick = function () { q.value = ''; this.style.display = 'none'; onQ(); q.focus(); };
    $$('[data-tb]', page).forEach(function (b) {
      b.onclick = function () { mod.toolbar[+b.dataset.tb].onClick(ctx()); };
    });

    function ctx() {
      return {
        mod: mod,
        items: Store.list(mod.store),
        rerender: function () { App.renderModule(mod, target); },
        renderList: renderList
      };
    }

    function renderList() {
      var all = Store.list(mod.store);
      if (mod.sort) all = all.slice().sort(mod.sort);
      if (mod.stats) {
        var old = $('#m-stats', body); if (old) old.remove();
        var sd = document.createElement('div'); sd.id = 'm-stats'; sd.className = 'stats';
        sd.innerHTML = App.statsHTML(mod, all);
        body.insertBefore(sd, body.firstChild);
      }
      var oldEx = $('#m-extra', body); if (oldEx) oldEx.remove();
      if (mod.extra) {
        var ex = document.createElement('div'); ex.id = 'm-extra'; ex.style.marginBottom = '16px';
        ex.innerHTML = mod.extra(all, ctx());
        body.appendChild(ex);
        if (mod.onExtra) mod.onExtra(ex, ctx());
      }
      var oldL = $('#m-list', body); if (oldL) oldL.remove();
      var list = document.createElement('div'); list.id = 'm-list';
      body.appendChild(list);
      var items = all.filter(function (it) { return matchQ(it, st.q, mod); });
      if (mod.groupBy) {
        var groups = {};
        all.forEach(function (it) { var g = it[mod.groupBy] || '未分类'; (groups[g] = groups[g] || []).push(it); });
        var gnames = Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length; });
        if (!st.group || gnames.indexOf(st.group) < 0) st.group = '';
        var tabs = document.createElement('div'); tabs.className = 'tabs';
        tabs.innerHTML = '<button class="tab' + (st.group === '' ? ' on' : '') + '" data-g="">全部<span class="n">' + all.length + '</span></button>' +
          gnames.map(function (g) { return '<button class="tab' + (st.group === g ? ' on' : '') + '" data-g="' + esc(g) + '">' + esc(g) + '<span class="n">' + groups[g].length + '</span></button>'; }).join('');
        list.appendChild(tabs);
        tabs.onclick = function (e) {
          var b = e.target.closest('[data-g]'); if (!b) return;
          st.group = b.dataset.g; renderList();
        };
        if (st.group) items = items.filter(function (it) { return (it[mod.groupBy] || '未分类') === st.group; });
      }
      if (mod.renderList) { mod.renderList(list, items, ctx()); return; }
      if (!items.length) {
        list.insertAdjacentHTML('beforeend', '<div class="empty" style="grid-column:1/-1"><div class="big">' + App.icon('search2', '') + '</div><div class="t">' + (st.q ? '没有匹配「' + esc(st.q) + '」的记录' : '暂无记录') + '</div><div class="d">' + (st.q ? '换个关键词试试' : '点击右上角「新增」开始记录') + '</div></div>');
        return;
      }
      if (mod.view === 'table') {
        var cols = mod.columns;
        var w = document.createElement('div'); w.className = 'table-wrap';
        w.innerHTML = '<table><thead><tr>' + cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') +
          '<th></th></tr></thead><tbody>' + items.map(function (it) {
            return '<tr data-id="' + it.id + '">' + cols.map(function (c) {
              var v = typeof c.f === 'function' ? c.f(it) : esc(it[c.key]);
              if (c.img) {
                var im = (it[c.key] && it[c.key][0]) ? '<img class="mini-img" src="' + it[c.key][0] + '">' : '<div class="mini-img"></div>';
                v = '<div style="display:flex;align-items:center;gap:8px">' + im + '<span>' + (v == null || v === '' ? '' : v) + '</span></div>';
              }
              return '<td>' + (v == null || v === '' ? '-' : v) + '</td>';
            }).join('') +
              '<td class="act"><button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
              '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></td></tr>';
          }).join('') + '</tbody></table>';
        list.appendChild(w);
      } else {
        var g = document.createElement('div');
        g.className = 'grid' + (mod.wide ? ' wide' : '');
        g.innerHTML = items.map(function (it) { return mod.renderCard ? mod.renderCard(it, mod) : defaultCard(it, mod); }).join('');
        list.appendChild(g);
      }
      if (mod.afterRender) mod.afterRender(list, items, ctx());
    }

    /* 事件 */
    page.onclick = function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.dataset.act;
      var id = b.closest('[data-id]') ? b.closest('[data-id]').dataset.id : null;
      if (mod.onAction && mod.onAction(act, id, b, ctx()) !== false) return;
      if (act === 'add') openEdit(mod, null, ctx());
      else if (act === 'edit') openEdit(mod, id, ctx());
      else if (act === 'del') {
        var it = Store.find(mod.store, id);
        App.confirm('确定删除「' + esc(mod.itemName ? mod.itemName(it) : (it[mod.titleKey] || '该记录')) + '」吗？删除后不可恢复。', function () {
          Store.remove(mod.store, id); App.toast('已删除', 'ok'); ctx().rerender();
        }, true);
      } else if (mod.onAction) mod.onAction(act, id, b, ctx());
    };

    if (mod.render) {
      mod.render(body, ctx());
    } else {
      renderList();
    }
    if (mod.hideAdd && !mod.render) { }
  };

  function openEdit(mod, id, ctx) {
    var item = id ? Store.find(mod.store, id) : Object.assign({}, mod.defaults || {});
    App.form({
      title: (id ? '编辑' : '新增') + mod.name.replace(/记录$|清单$|管理$/, ''),
      size: mod.formSize || 'lg',
      fields: mod.fields,
      value: item,
      note: mod.formNote || '',
      onSubmit: function (v) {
        if (mod.beforeSave) v = mod.beforeSave(v, id) || v;
        if (id) { Store.update(mod.store, id, v); App.toast('已更新', 'ok'); }
        else { Store.add(mod.store, Object.assign({ id: uid() }, v)); App.toast('已添加', 'ok'); }
        if (mod.afterSave) mod.afterSave(v, id);
        ctx.rerender();
      }
    });
  }
  App.openEdit = openEdit;

  /* 空状态辅助 */
  App.emptyBox = emptyBox;
})();
