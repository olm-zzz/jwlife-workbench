/* ===== 6. 节日记录（内置节日 + 自定义，支持农历/阳历） ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;
  var L = window.Lunar;

  var BUILTIN = [
    { name: '元旦', kind: 'solar', m: 1, d: 1 },
    { name: '腊八节', kind: 'lunar', lm: 12, ld: 8 },
    { name: '小年', kind: 'lunar', lm: 12, ld: 23 },
    { name: '除夕', kind: 'lunar', lm: 12, ld: 30 },
    { name: '春节', kind: 'lunar', lm: 1, ld: 1, big: true },
    { name: '元宵节', kind: 'lunar', lm: 1, ld: 15 },
    { name: '龙抬头', kind: 'lunar', lm: 2, ld: 2 },
    { name: '妇女节', kind: 'solar', m: 3, d: 8 },
    { name: '植树节', kind: 'solar', m: 3, d: 12 },
    { name: '清明节', kind: 'solar', m: 4, d: 4, tip: '清明节气通常在 4/4—4/6' },
    { name: '劳动节', kind: 'solar', m: 5, d: 1 },
    { name: '青年节', kind: 'solar', m: 5, d: 4 },
    { name: '母亲节', kind: 'week', m: 5, nth: 2, wd: 0, big: true },
    { name: '儿童节', kind: 'solar', m: 6, d: 1 },
    { name: '端午节', kind: 'lunar', lm: 5, ld: 5, big: true },
    { name: '父亲节', kind: 'week', m: 6, nth: 3, wd: 0, big: true },
    { name: '建党节', kind: 'solar', m: 7, d: 1 },
    { name: '建军节', kind: 'solar', m: 8, d: 1 },
    { name: '七夕', kind: 'lunar', lm: 7, ld: 7, big: true },
    { name: '中元节', kind: 'lunar', lm: 7, ld: 15 },
    { name: '中秋节', kind: 'lunar', lm: 8, ld: 15, big: true },
    { name: '教师节', kind: 'solar', m: 9, d: 10 },
    { name: '国庆节', kind: 'solar', m: 10, d: 1, big: true },
    { name: '重阳节', kind: 'lunar', lm: 9, ld: 9 },
    { name: '万圣节', kind: 'solar', m: 10, d: 31 },
    { name: '感恩节', kind: 'week', m: 11, nth: 4, wd: 4 },
    { name: '平安夜', kind: 'solar', m: 12, d: 24 },
    { name: '圣诞节', kind: 'solar', m: 12, d: 25 },
    { name: '跨年夜', kind: 'solar', m: 12, d: 31 }
  ];

  function nextSolar(m, d, from) {
    var y = from.getFullYear();
    var c = new Date(y, m - 1, d);
    if (c < from) c = new Date(y + 1, m - 1, d);
    return U.today(c);
  }
  function nextLunar(lm, ld, from) {
    var y = from.getFullYear();
    var cands = [L.lunar2solar(y, lm, ld), L.lunar2solar(y + 1, lm, ld), L.lunar2solar(y - 1, lm, ld)]
      .filter(Boolean).map(U.parseDate).filter(function (d) { return d >= from; }).sort(function (a, b) { return a - b; });
    return cands.length ? U.today(cands[0]) : null;
  }
  function nextWeek(m, nth, wd, from) {
    var y = from.getFullYear();
    var c = new Date(y, m - 1, 1);
    var diff = (wd - c.getDay() + 7) % 7;
    var first = new Date(y, m - 1, 1 + diff);
    var target = new Date(y, m - 1, first.getDate() + (nth - 1) * 7);
    if (target < from) {
      c = new Date(y + 1, m - 1, 1); diff = (wd - c.getDay() + 7) % 7;
      target = new Date(y + 1, m - 1, 1 + diff + (nth - 1) * 7);
    }
    return U.today(target);
  }
  function nextDate(f) {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    if (f.kind === 'lunar') return nextLunar(f.lm, f.ld, t);
    if (f.kind === 'week') return nextWeek(f.m, f.nth, f.wd, t);
    return nextSolar(f.m, f.d, t);
  }
  function dateLabel(f) {
    if (f.kind === 'lunar') return '农历' + ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][f.lm - 1] + '月' +
      (f.ld === 10 ? '初十' : f.ld === 20 ? '二十' : f.ld === 30 ? '三十' : ['初', '十', '廿', '三'][Math.floor(f.ld / 10)] + '零一二三四五六七八九'[f.ld % 10]);
    if (f.kind === 'week') return '每年' + f.m + '月第' + ['', '一', '二', '三', '四'][f.nth] + '个周' + '日一二三四五六'[f.wd];
    return '每年 ' + f.m + '月' + f.d + '日';
  }
  App.nextDate = nextDate;

  function allFestivals() {
    var out = BUILTIN.map(function (b, i) {
      var d = nextDate(b);
      return { key: 'b' + i, builtin: true, name: b.name, kind: b.kind, label: dateLabel(b), tip: b.tip || '', big: !!b.big, date: d, left: d ? U.diffDays(U.today(), d) : null, type: '传统节日' };
    }).filter(function (x) { return x.date; });
    Store.list('festival').forEach(function (c) {
      var f = { name: c.name, kind: c.kind, m: c.m, d: c.d, lm: c.lm, ld: c.ld };
      var d = nextDate(f);
      out.push({
        key: c.id, builtin: false, id: c.id, name: c.name, label: dateLabel(f), date: d,
        left: d ? U.diffDays(U.today(), d) : null, type: c.type || '自定义', note: c.note || '',
        birthYear: c.birthYear, remind: c.remind
      });
    });
    return out.sort(function (a, b) { return (a.left == null ? 9999 : a.left) - (b.left == null ? 9999 : b.left); });
  }
  App.allFestivals = allFestivals;

  function openCustom(id, onDone) {
    var item = id ? Store.find('festival', id) : { kind: 'solar', type: '生日', remind: 7 };
    App.form({
      title: (id ? '编辑' : '新增') + '节日 / 生日', value: item, size: 'lg',
      note: '选择农历会自动换算成阳历日期',
      fields: [
        { key: 'name', label: '名称', required: true, placeholder: '如：小美生日 / 恋爱纪念日' },
        { key: 'type', label: '类别', type: 'select', options: ['生日', '纪念日', '亲友节日', '传统节日', '其它'] },
        { key: 'kind', label: '历法', type: 'select', options: [{ v: 'solar', l: '阳历（公历）' }, { v: 'lunar', l: '农历' }], required: true },
        { key: 'm', label: '阳历月份', type: 'number', hint: '阳历时填写，1-12' },
        { key: 'd', label: '阳历日期', type: 'number', hint: '阳历时填写，1-31' },
        { key: 'lm', label: '农历月份', type: 'number', hint: '农历时填写，1-12' },
        { key: 'ld', label: '农历日期', type: 'number', hint: '农历时填写，1-30' },
        { key: 'birthYear', label: '出生年份', type: 'number', hint: '生日可填，用来算几岁' },
        { key: 'remind', label: '提前提醒（天）', type: 'number' },
        { key: 'note', label: '备注', type: 'textarea', full: true, placeholder: '喜欢什么、想送什么…' }
      ],
      onSubmit: function (v) {
        if (v.kind === 'solar' && (!v.m || !v.d)) { App.toast('请填写阳历月日', 'err'); return false; }
        if (v.kind === 'lunar' && (!v.lm || !v.ld)) { App.toast('请填写农历月日', 'err'); return false; }
        if (id) { Store.update('festival', id, v); App.toast('已更新', 'ok'); }
        else { Store.add('festival', v); App.toast('已添加', 'ok'); }
        onDone && onDone();
      }
    });
  }

  function festivalRender(body, ctx) {
    var st = App.state.festival || (App.state.festival = { q: '', tab: '全部' });
    if (!st.tab) st.tab = '全部';
    var all = allFestivals();
    var tabs = ['全部', '生日', '传统节日', '纪念日', '亲友节日', '其它'];
    var items = all.filter(function (f) { return st.tab === '全部' || f.type === st.tab; });
    var q = (st.q || '').toLowerCase();
    if (q) items = items.filter(function (f) { return (f.name + f.label + f.note + f.type).toLowerCase().indexOf(q) > -1; });

    var next = all[0];
    body.innerHTML =
      (next ? '<div class="hero" style="margin-bottom:16px"><div><div class="lb">下一个节日</div>' +
        '<div class="big-num">' + esc(next.name) + '</div>' +
        '<div class="lb">' + esc(next.date) + ' · ' + esc(next.label) + ' · 还有 <b>' + next.left + '</b> 天</div></div>' +
        '<div class="spacer"></div>' +
        '<div class="hchip"><div class="v">' + next.left + '</div><div class="k">天后</div></div>' +
        '</div>' : '') +
      '<div class="stats" style="margin-top:16px" id="fv-stats"></div>' +
      '<div class="tabs" id="fv-tabs">' + tabs.map(function (t) {
        var n = t === '全部' ? all.length : all.filter(function (f) { return f.type === t; }).length;
        return n ? '<button class="tab' + (st.tab === t ? ' on' : '') + '" data-t="' + t + '">' + t + '<span class="n">' + n + '</span></button>' : '';
      }).join('') + '</div>' +
      '<div id="fv-list"><div class="panel"><h3>' + App.icon('cake') + '节日 & 生日倒计时</h3>' +
      (items.length ? '<div class="grid">' + items.map(function (f) {
        var lb = f.left;
        var chip = lb == null ? '' : lb === 0 ? '<span class="chip accent">就是今天</span>' :
          lb <= 7 ? '<span class="chip danger">' + lb + ' 天后</span>' :
            lb <= 30 ? '<span class="chip accent">' + lb + ' 天后</span>' : '<span class="chip brand">' + lb + ' 天后</span>';
        var age = '';
        if (f.birthYear && f.date) {
          var y = Number(f.date.slice(0, 4)) - Number(f.birthYear);
          age = '<span class="chip purple">' + y + ' 岁</span>';
        }
        return '<div class="card" data-id="' + (f.id || f.key) + '">' +
          '<div class="card-body"><div class="card-hd"><div class="card-title">' + esc(f.name) + '</div>' +
          (f.builtin ? '<div class="card-acts"><button class="icon-btn" data-copy="' + esc(f.name) + '" title="加入我的清单">' + App.icon('star') + '</button></div>'
            : '<div class="card-acts"><button class="icon-btn" data-fe="' + f.id + '">' + App.icon('edit') + '</button>' +
            '<button class="icon-btn danger" data-fd="' + f.id + '">' + App.icon('trash') + '</button></div>') + '</div>' +
          '<div class="chips"><span class="chip ' + (f.type === '生日' ? 'purple' : 'blue') + '">' + esc(f.type) + '</span>' + chip + age + '</div>' +
          '<div class="lines"><div class="l"><span class="k">日期</span><span class="v">' + esc(f.date) + '</span></div>' +
          '<div class="l"><span class="k">规则</span><span class="v">' + esc(f.label) + '</span></div>' +
          (f.note ? '<div class="l"><span class="k">备注</span><span class="v">' + esc(f.note) + '</span></div>' : '') +
          (f.tip ? '<div class="l"><span class="k">说明</span><span class="v">' + esc(f.tip) + '</span></div>' : '') + '</div>' +
          '</div></div>';
      }).join('') + '</div>' : '<div class="empty"><div class="big">' + App.icon('cake', '') + '</div><div class="t">这里还没有记录</div><div class="d">点击左下角「新增」添加生日或纪念日</div></div>') +
      '</div></div>';

    function refresh() { festivalRender(body, ctx); }
    U.$$('#fv-tabs [data-t]', body).forEach(function (b) { b.onclick = function () { st.tab = b.dataset.t; refresh(); }; });
    U.$$('[data-fe]', body).forEach(function (b) { b.onclick = function () { openCustom(b.dataset.fe, refresh); }; });
    U.$$('[data-fd]', body).forEach(function (b) {
      b.onclick = function () { App.confirm('删除这条节日记录？', function () { Store.remove('festival', b.dataset.fd); App.toast('已删除', 'ok'); refresh(); }, true); };
    });
    U.$$('[data-copy]', body).forEach(function (b) {
      b.onclick = function () { openCopy(b.dataset.copy); };
    });
    function openCopy(name) {
      var src = all.find(function (x) { return x.name === name; });
      var f = BUILTIN.find(function (x) { return x.name === name; });
      if (!f) return;
      App.form({
        title: '把「' + name + '」加入我的清单', size: 'lg',
        note: '加入后可以填写备注与提醒',
        fields: [
          { key: 'name', label: '名称', required: true },
          { key: 'type', label: '类别', type: 'select', options: ['生日', '纪念日', '亲友节日', '传统节日', '其它'] },
          { key: 'remind', label: '提前提醒（天）', type: 'number' },
          { key: 'note', label: '备注', type: 'textarea', full: true }
        ],
        value: { name: f.name, type: '传统节日', remind: 7 },
        onSubmit: function (v) {
          Store.add('festival', Object.assign({}, f, v));
          App.toast('已加入清单', 'ok'); refresh();
        }
      });
    }

    var soon = all.filter(function (f) { return f.left != null && f.left <= 30; }).length;
    var bds = all.filter(function (f) { return f.type === '生日'; }).length;
    U.$('#fv-stats', body).innerHTML = App.statsHTML({
      stats: function () {
        return [
          { label: '节日总数', value: all.length, sub: '含内置 ' + BUILTIN.length + ' 个' },
          { label: '30天内', value: soon, sub: soon ? '快准备礼物' : '还早', cls: soon ? 'hot' : 'good' },
          { label: '生日', value: bds, sub: '个' },
          { label: '自定义', value: Store.list('festival').length, sub: '条' }
        ];
      }
    }, []);
  }

  App.registerModule({
    id: 'festival', name: '节日记录', icon: 'cake', store: 'festival',
    desc: '内置传统节日（含农历），也能记朋友生日与纪念日',
    render: festivalRender,
    onSearch: function (q, body, ctx) { App.state.festival.q = q; festivalRender(body, ctx); var i = U.$('#q'); if (i) i.focus(); },
    onAction: function (act, id, btn, ctx) { if (act === 'add') openCustom(null, ctx.rerender); },
    addCustom: openCustom
  });
})();
