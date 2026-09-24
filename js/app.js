/* ===== 导航 / 首页概览 / 设置 ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;
  var ORDER = ['wardrobe', 'supplies', 'expiry', 'travel', 'weekend', 'festival', 'health', 'notes', 'packing', 'pets', 'love', 'wishes', 'medicine'];

  /* ---------- 主题 ---------- */
  function applyTheme() {
    var t = Store.get('theme', 'light');
    document.body.classList.toggle('dark', t === 'dark');
    var b = U.$('#theme-btn'); if (b) b.textContent = t === 'dark' ? '切换日间模式' : '切换夜间模式';
    var tt = U.$('#theme-txt'); if (tt) tt.textContent = t === 'dark' ? '日间' : '夜间';
    var tm = U.$('meta[name="theme-color"]');
    if (tm) tm.setAttribute('content', t === 'dark' ? '#171418' : '#e8607d');
  }
  U.$('#theme-btn').onclick = function () {
    Store.set('theme', Store.get('theme', 'light') === 'dark' ? 'light' : 'dark');
    applyTheme();
  };
  applyTheme();

  /* ---------- 导航 ---------- */
  function buildNav() {
    var nav = U.$('#nav');
    var mods = App.modules.slice().sort(function (a, b) { return ORDER.indexOf(a.id) - ORDER.indexOf(b.id); });
    nav.innerHTML =
      '<button class="nav-item" data-go="home">' + App.icon('home') + '<span>首页概览</span></button>' +
      '<div class="nav-sec">生活管理</div>' +
      mods.map(function (m) {
        return '<button class="nav-item" data-go="' + m.id + '">' + App.icon(m.icon) + '<span>' + esc(m.name) + '</span></button>';
      }).join('') +
      '<div class="nav-sec">系统</div>' +
      '<button class="nav-item" data-theme="1">' + App.icon('sun') + '<span id="theme-txt">夜间</span></button>' +
      '<button class="nav-item" data-go="settings">' + App.icon('gear') + '<span>设置中心</span></button>';
    nav.onclick = function (e) {
      var b = e.target.closest('[data-go]');
      if (b) { location.hash = '#/' + b.dataset.go; return; }
      if (e.target.closest('[data-theme]')) { var tb = U.$('#theme-btn'); if (tb) tb.click(); }
    };
  }
  function markNav(id) {
    U.$$('#nav .nav-item').forEach(function (b) {
      var on = b.dataset.go === id;
      b.classList.toggle('active', on);
      if (on && b.scrollIntoView) { try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (err) { } }
    });
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    App.current = null;
    var page = U.$('#page');
    var p = App.profile();
    var now = new Date();
    var lunar = window.Lunar.solar2lunar(U.today());
    var hour = now.getHours();
    var greet = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

    var supplies = Store.list('supplies');
    var expiry = Store.list('expiry').filter(function (i) { return i.status !== '已用完' && i.status !== '已丢弃'; });
    var meds = Store.list('medicine');
    var notes = Store.list('notes');
    var todos = notes.filter(function (i) { return i.type === '待办' && !i.done; });
    var pets = Store.list('pets');
    var packs = Store.list('packing');

    var soonExpire = expiry.filter(function (i) { var l = App.leftOf(i); return l != null && l <= 30; })
      .sort(function (a, b) { return App.leftOf(a) - App.leftOf(b); });
    var soonMed = meds.filter(function (i) { var l = i.expireDate ? U.diffDays(U.today(), i.expireDate) : null; return l != null && l <= 90; })
      .sort(function (a, b) { return U.diffDays(U.today(), a.expireDate) - U.diffDays(U.today(), b.expireDate); });
    var needBuy = supplies.filter(function (i) { return i.threshold && Number(i.stock) <= Number(i.threshold); });
    var fests = (App.allFestivals ? App.allFestivals() : []).filter(function (f) { return f.left != null && f.left <= 30; });
    var going = packs.filter(function (i) { var d = U.diffDays(U.today(), i.date); return d != null && d >= 0 && d <= 30; });
    var stalePets = pets.filter(function (pt) {
      var ws = (pt.weights || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      return !ws.length || U.diffDays(ws[0].date, U.today()) > 90;
    });
    var healths = Store.list('health');
    var todayHealth = healths.filter(function (i) { return i.date === U.today(); }).length;
    var loveDays = App.loveDays ? App.loveDays() : null;

    var alerts = [];
    soonExpire.forEach(function (i) { var l = App.leftOf(i); alerts.push({ t: (l < 0 ? '已过期' : '临期') + '：' + i.name, s: l < 0 ? ('过期 ' + (-l) + ' 天') : ('剩 ' + l + ' 天'), c: 'danger', go: 'expiry' }); });
    soonMed.slice(0, 4).forEach(function (i) { var l = U.diffDays(U.today(), i.expireDate); alerts.push({ t: '药品临期：' + i.name, s: l < 0 ? '已过期' : '剩 ' + l + ' 天', c: 'danger', go: 'medicine' }); });
    needBuy.forEach(function (i) { alerts.push({ t: '需要补货：' + i.name, s: '仅剩 ' + i.stock + (i.unit || ''), c: 'warn', go: 'supplies' }); });
    going.forEach(function (i) { alerts.push({ t: '准备出发：' + i.name, s: '还有 ' + U.diffDays(U.today(), i.date) + ' 天', c: 'warn', go: 'packing' }); });
    stalePets.forEach(function (i) { alerts.push({ t: i.name + ' 该称体重了', s: '超过 90 天没记录', c: 'warn', go: 'pets' }); });
    fests.slice(0, 5).forEach(function (i) { alerts.push({ t: '节日：' + i.name, s: (i.left === 0 ? '就是今天' : i.left + ' 天后') + ' · ' + i.date, c: 'ok', go: 'festival' }); });
    todos.slice(0, 5).forEach(function (i) { alerts.push({ t: '待办：' + i.title, s: i.remind ? '提醒 ' + i.remind : '未完成', c: 'ok', go: 'notes' }); });

    page.innerHTML =
      '<div class="page-head"><div>' +
      '<div class="page-title">' + App.icon('home') + greet + (p.nick ? '，' + esc(p.nick) : '') + '</div>' +
      '<div class="page-desc">' + U.today() + '　星期' + U.weekdayCn(now) + '　农历 ' + (lunar ? lunar.monthCn + lunar.dayCn : '') + '</div>' +
      '</div><div class="spacer"></div>' +
      '<div class="toolbar"><button class="btn primary" data-quick="note">' + App.icon('plus') + '随手记一条</button></div></div>' +

      '<div class="stats">' +
      '<div class="stat good"><div class="k">衣橱单品</div><div class="v">' + Store.list('wardrobe').length + '</div><div class="s">件</div></div>' +
      '<div class="stat"><div class="k">在管囤货</div><div class="v">' + supplies.length + '</div><div class="s">' + needBuy.length + ' 项待补</div></div>' +
      '<div class="stat ' + (soonExpire.length ? 'warn' : '') + '"><div class="k">临期物品</div><div class="v">' + soonExpire.length + '</div><div class="s">30 天内</div></div>' +
      '<div class="stat hot"><div class="k">今日打卡</div><div class="v">' + todayHealth + '</div><div class="s">身体倍棒</div></div>' +
      (loveDays != null ? '<div class="stat hot"><div class="k">恋爱天数</div><div class="v">' + loveDays + '</div><div class="s">天</div></div>' : '') +
      '</div>' +

      '<div class="dash">' +
      '<div class="panel"><h3>' + App.icon('clock') + '待办 & 提醒（' + alerts.length + '）</h3>' +
      (alerts.length ? alerts.slice(0, 12).map(function (a) {
        return '<div class="list-row"><div class="t">' + esc(a.t) + '<div class="s">' + esc(a.s) + '</div></div>' +
          '<button class="btn ghost sm" data-go="' + a.go + '">去处理</button></div>';
      }).join('') : '<div class="empty" style="padding:26px"><div class="t">一切尽在掌握</div><div class="d">没有需要处理的事项</div></div>') +
      '</div>' +
      '<div class="panel"><h3>' + App.icon('box') + '生活数据</h3>' +
      '<div class="list-row"><div class="t">去过的地方<div class="s">' + Object.keys(Store.list('travel').reduce(function (m, t) { m[t.province] = 1; return m; }, {})).length + ' 个省份被点亮</div></div><button class="btn ghost sm" data-go="travel">查看</button></div>' +
      '<div class="list-row"><div class="t">生活备忘<div class="s">' + notes.length + ' 条记录，' + todos.length + ' 条待办</div></div><button class="btn ghost sm" data-go="notes">查看</button></div>' +
      '<div class="list-row"><div class="t">愿望清单<div class="s">' + Store.list('wishes').filter(function (w) { return w.status === '已完成'; }).length + ' / ' + Store.list('wishes').length + ' 已实现</div></div><button class="btn ghost sm" data-go="wishes">查看</button></div>' +
      '<div class="list-row"><div class="t">宠物家庭<div class="s">' + pets.length + ' 只小可爱</div></div><button class="btn ghost sm" data-go="pets">查看</button></div>' +
      '<div class="list-row"><div class="t">身体健康<div class="s">累计 ' + healths.length + ' 次打卡</div></div><button class="btn ghost sm" data-go="health">查看</button></div>' +
      '</div>' +
      '</div>' +

      '<div class="panel" style="margin-top:14px"><h3>' + App.icon('home') + '全部模块</h3><div class="mini-cards">' +
      ORDER.map(function (id) {
        var m = App.getModule(id); if (!m) return '';
        var n = m.store === 'weekend' ? Object.keys(Store.get('weekend', {})).length : Store.list(m.store).length;
        return '<div class="mini-card" data-go="' + id + '"><div class="n">' + esc(m.name) + '</div><div class="d">' + n + ' 条记录</div></div>';
      }).join('') + '</div></div>' +
      '<div style="margin-top:14px;text-align:center;font-size:11.5px;color:var(--muted)">当前版本 v8 · 应用名：大乐透happy life</div>';

    page.onclick = function (e) {
      var b = e.target.closest('[data-go]'); if (!b) return;
      location.hash = '#/' + b.dataset.go;
    };
    var qb = U.$('[data-quick]', page);
    if (qb) qb.onclick = function () {
      App.form({
        title: '随手记一条', value: { type: '文字' }, size: 'lg',
        fields: (App.getModule('notes') || {}).fields,
        onSubmit: function (v) { Store.add('notes', v); App.toast('已记录', 'ok'); location.hash = '#/notes'; }
      });
    };
  }

  /* ---------- 设置 ---------- */
  function renderSettings() {
    App.current = null;
    var page = U.$('#page');
    var p = App.profile();
    var keys = Object.keys(localStorage).filter(function (k) { return k.indexOf('jwlife.') === 0; });
    var size = keys.reduce(function (s, k) { return s + (localStorage.getItem(k) || '').length; }, 0);
    page.innerHTML =
      '<div class="page-head"><div><div class="page-title">' + App.icon('gear') + '设置中心</div>' +
      '<div class="page-desc">个人资料与数据管理，所有数据都保存在这台电脑的浏览器里</div></div></div>' +
      '<div class="dash">' +
      '<div class="panel"><h3>' + App.icon('note') + '个人资料</h3>' +
      '<div class="list-row"><div class="t">昵称<div class="s">' + esc(p.nick || '未填写') + '</div></div><button class="btn ghost sm" id="edit-profile">编辑</button></div>' +
      '<div class="list-row"><div class="t">身高 / 体重<div class="s">' + (p.height || '-') + ' cm　' + (p.weight || '-') + ' kg</div></div></div>' +
      '<div class="list-row"><div class="t">偏好风格<div class="s">' + esc(p.style || '-') + '</div></div></div>' +
      '<div class="list-row"><div class="t">避雷单品<div class="s">' + esc(p.avoid || '-') + '</div></div></div>' +
      '<div class="list-row"><div class="t">恋爱设置<div class="s">' + esc((Store.get('love', {}) || {}).partner || '未填写') + '</div></div>' +
      '<button class="btn ghost sm" id="edit-love">编辑</button></div>' +
      '</div>' +
      '<div class="panel"><h3>' + App.icon('box') + '数据管理</h3>' +
      '<div class="list-row"><div class="t">已用空间<div class="s">' + keys.length + ' 个数据集，约 ' + (size / 1024).toFixed(0) + ' KB</div></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
      '<button class="btn primary" id="export">' + App.icon('check') + '导出备份</button>' +
      '<button class="btn ghost" id="import">导入备份</button>' +
      '<button class="btn danger" id="clear">清空全部数据</button>' +
      '</div>' +
      '<div class="quote" style="margin-top:10px">建议每月导出一次备份；换电脑时用「导入备份」恢复。</div>' +
      '<div class="quote" style="margin-top:6px">当前版本：v8（应用名：大乐透happy life）</div>' +
      '</div>' +
      '<div class="panel"><h3>' + App.icon('home') + '装到手机桌面（当 App 用）</h3>' +
      '<div class="list-row"><div class="t">当前打开方式<div class="s">' + (App.installed ? '已从桌面图标启动（全屏独立窗口）' : '正在浏览器中打开') + '</div></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
      '<button class="btn primary" id="install-btn"' + (App.canInstall ? '' : ' style="display:none"') + '>' + App.icon('check') + '添加到手机桌面</button>' +
      '</div>' +
      '<div class="quote" style="margin-top:10px">小米（含 MIX Flip）：用手机浏览器打开本网址 → 右上角菜单 → 「添加到主屏幕 / 添加到桌面」；之后从桌面图标进入就是全屏 App，断网也能打开。外屏小窗同样可用。</div>' +
      '</div></div>';

    var ib = U.$('#install-btn', page);
    if (ib) ib.onclick = function () {
      if (!App.doInstall || !App.doInstall()) App.toast('请用浏览器菜单里的「添加到主屏幕」安装', 'ok', 4000);
    };

    U.$('#edit-profile', page).onclick = function () {
      App.form({
        title: '编辑个人资料', size: 'lg', value: p,
        fields: [
          { key: 'nick', label: '昵称' },
          { key: 'gender', label: '性别', type: 'select', options: ['女', '男', '不便透露'] },
          { key: 'height', label: '身高（cm）', type: 'number' },
          { key: 'weight', label: '体重（kg）', type: 'number', step: '0.1' },
          { key: 'style', label: '偏好风格', type: 'select', options: ['简约', '甜美', '通勤', '休闲', '复古', '运动'] },
          { key: 'avoid', label: '避雷单品 / 颜色' }
        ],
        onSubmit: function (v) { App.saveProfile(v); App.toast('已保存', 'ok'); renderSettings(); }
      });
    };
    U.$('#edit-love', page).onclick = function () {
      var mod = App.getModule('love');
      (mod.toolbar[0].onClick)({ rerender: function () { renderSettings(); } });
    };
    U.$('#export', page).onclick = function () {
      var data = {};
      keys.forEach(function (k) { data[k] = localStorage.getItem(k); });
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '大乐透happy life备份-' + U.today() + '.json';
      a.click();
      App.toast('已导出备份', 'ok');
    };
    App.pickFile(U.$('#import', page), { accept: 'application/json,.json' }, function (files) {
      var f = files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var data = JSON.parse(fr.result);
          Object.keys(data).forEach(function (k) { if (k.indexOf('jwlife.') === 0) localStorage.setItem(k, data[k]); });
          App.toast('导入成功', 'ok');
          setTimeout(function () { location.reload(); }, 600);
        } catch (err) { App.toast('文件格式不正确', 'err'); }
      };
      fr.readAsText(f);
    });
    U.$('#clear', page).onclick = function () {
      App.confirm('这会删除全部 13 个模块的数据，且无法恢复。确定继续吗？', function () {
        keys.forEach(function (k) { localStorage.removeItem(k); });
        App.toast('已清空', 'ok');
        setTimeout(function () { location.reload(); }, 600);
      }, true);
    };
  }

  /* ---------- 路由 ---------- */
  function route() {
    var id = (location.hash || '').replace('#/', '') || 'home';
    if (id === 'home') { renderHome(); }
    else if (id === 'settings') { renderSettings(); }
    else {
      var m = App.getModule(id);
      if (!m) { location.hash = '#/home'; return; }
      App.renderModule(m);
    }
    markNav(id);
    U.$('.main').scrollTop = 0;
  }
  window.addEventListener('hashchange', route);

  /* ---------- 安装到桌面（PWA） ---------- */
  var deferred = null;
  App.installed = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e; App.canInstall = true;
    var b = U.$('#install-btn'); if (b) b.style.display = '';
  });
  window.addEventListener('appinstalled', function () { App.installed = true; App.canInstall = false; deferred = null; App.toast('已添加到桌面', 'ok'); });
  App.doInstall = function () {
    if (!deferred) return false;
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; App.canInstall = false; });
    return true;
  };

  buildNav();
  applyTheme();
  route();
})();
