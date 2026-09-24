/* ===== 11. 恋爱记录 ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;

  function love() { return Store.get('love', { partner: '', myName: '', startDate: '', partnerBirthday: '', myBirthday: '', metDate: '' }); }
  function saveLove(v) { Store.set('love', Object.assign(love(), v)); }
  function loveDays() {
    var s = love().startDate;
    if (!s) return null;
    return U.diffDays(s, U.today()) + 1;
  }
  function nextAnniv() {
    var s = love().startDate; if (!s) return null;
    var m = +s.slice(5, 7), d = +s.slice(8, 10);
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var c = new Date(t.getFullYear(), m - 1, d);
    var years;
    if (c < t) { c = new Date(t.getFullYear() + 1, m - 1, d); years = c.getFullYear() - +s.slice(0, 4); }
    else years = c.getFullYear() - +s.slice(0, 4);
    return { date: U.today(c), years: years, left: U.diffDays(U.today(), U.today(c)) };
  }
  var MILES = [66, 100, 200, 300, 365, 500, 520, 666, 800, 1000, 1314, 1500, 2000, 3000, 5000, 10000];
  function nextMile() {
    var d = loveDays(); if (d == null) return null;
    var m = MILES.find(function (x) { return x > d; });
    return m ? { day: m, left: m - d } : null;
  }
  App.loveDays = loveDays;

  function openSetting(onDone) {
    App.form({
      title: '恋爱设置', size: 'lg', value: love(),
      note: '填好开始日期，恋爱天数就会实时跳动',
      fields: [
        { key: 'myName', label: '我的称呼' },
        { key: 'partner', label: 'TA 的称呼' },
        { key: 'startDate', label: '在一起的日子', type: 'date' },
        { key: 'metDate', label: '初识的日子', type: 'date' },
        { key: 'partnerBirthday', label: 'TA 的生日', type: 'date' },
        { key: 'myBirthday', label: '我的生日', type: 'date' }
      ],
      onSubmit: function (v) { saveLove(v); App.toast('已保存', 'ok'); onDone && onDone(); }
    });
  }

  var TABS = [
    { k: 'anniv', n: '纪念日' },
    { k: 'gifts', n: '互送礼物' },
    { k: 'memo', n: '重要时刻' }
  ];
  var FIELDS = {
    anniv: [
      { key: 'name', label: '纪念日名称', required: true, placeholder: '如：第一次一起旅行' },
      { key: 'date', label: '日期', type: 'date', required: true },
      { key: 'type', label: '类型', type: 'select', options: ['恋爱纪念', '生日', '节日', '其它'] },
      { key: 'repeat', label: '每年重复', type: 'switch' },
      { key: 'remind', label: '提前提醒（天）', type: 'number' },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    gifts: [
      { key: 'name', label: '礼物名称', required: true },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'from', label: '谁送的', required: true },
      { key: 'to', label: '送给谁', required: true },
      { key: 'occasion', label: '场合', type: 'select', options: ['生日', '纪念日', '节日', '日常惊喜', '其它'] },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'photos', label: '照片', type: 'images', max: 4, full: true },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    memo: [
      { key: 'title', label: '标题', required: true },
      { key: 'date', label: '日期', type: 'date', required: true },
      { key: 'tags', label: '标签', type: 'chips', options: ['第一次', '旅行', '感动', '吵架', '和好', '日常', '约定'], full: true },
      { key: 'photos', label: '照片', type: 'images', max: 4, full: true },
      { key: 'content', label: '记录', type: 'textarea', full: true }
    ]
  };

  function loveRender(body, ctx) {
    var st = App.state.love || (App.state.love = { q: '', tab: 'anniv' });
    if (!st.tab) st.tab = 'anniv';
    var L = love();
    var days = loveDays();
    var ann = nextAnniv();
    var mile = nextMile();
    var pb = L.partnerBirthday ? nextSolarDate(L.partnerBirthday) : null;
    var mb = L.myBirthday ? nextSolarDate(L.myBirthday) : null;

    function nextSolarDate(ds) {
      var m = +ds.slice(5, 7), d = +ds.slice(8, 10);
      var t = new Date(); t.setHours(0, 0, 0, 0);
      var c = new Date(t.getFullYear(), m - 1, d);
      if (c < t) c = new Date(t.getFullYear() + 1, m - 1, d);
      return { date: U.today(c), left: U.diffDays(U.today(), U.today(c)) };
    }

    body.innerHTML =
      (days == null ? '' : '<div class="hero" style="margin-bottom:16px">' +
        '<div><div class="lb">' + esc(L.myName || '我') + ' ♥ ' + esc(L.partner || 'TA') + '　在一起</div>' +
        '<div class="big-num">' + days + '<span style="font-size:18px;font-weight:600"> 天</span></div>' +
        '<div class="lb">起始日 ' + esc(L.startDate) + '　约 ' + (days / 365).toFixed(2) + ' 年</div></div>' +
        '<div class="spacer"></div>' +
        (ann ? '<div class="hchip"><div class="v">' + ann.left + ' 天</div><div class="k">第 ' + ann.years + ' 周年</div></div>' : '') +
        (mile ? '<div class="hchip"><div class="v">' + mile.left + ' 天</div><div class="k">恋爱 ' + mile.day + ' 天</div></div>' : '') +
        (pb ? '<div class="hchip"><div class="v">' + pb.left + ' 天</div><div class="k">TA 生日</div></div>' : '') +
        (mb ? '<div class="hchip"><div class="v">' + mb.left + ' 天</div><div class="k">我的生日</div></div>' : '') +
        '</div>') +
      '<div class="stats" id="lv-stats"></div>' +
      '<div class="tabs" id="lv-tabs">' + TABS.map(function (t) {
        return '<button class="tab' + (st.tab === t.k ? ' on' : '') + '" data-t="' + t.k + '">' + t.n + '<span class="n">' + Store.list(t.k).length + '</span></button>';
      }).join('') + '</div><div id="lv-list"></div>';

    function refresh() { loveRender(body, ctx); }
    U.$$('#lv-tabs [data-t]', body).forEach(function (b) { b.onclick = function () { st.tab = b.dataset.t; refresh(); }; });

    var q = (st.q || '').toLowerCase();
    var items = Store.list(st.tab).filter(function (it) { return !q || JSON.stringify(it).toLowerCase().indexOf(q) > -1; });
    items.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

    var el = U.$('#lv-list', body);
    if (st.tab === 'anniv') {
      var builtin = [];
      if (ann) builtin.push({ name: '恋爱 ' + ann.years + ' 周年纪念日', date: ann.date, type: '恋爱纪念', left: ann.left, fixed: true });
      if (mile) builtin.push({ name: '在一起 ' + mile.day + ' 天', date: U.addDays(U.today(), mile.left), type: '恋爱纪念', left: mile.left, fixed: true });
      if (L.metDate) {
        var md = years(L.metDate);
        builtin.push({ name: '初识纪念日 · ' + md.y + ' 年', date: md.date, type: '恋爱纪念', left: md.left, fixed: true });
      }
      if (L.partnerBirthday) builtin.push({ name: (L.partner || 'TA') + '的生日', date: pb.date, type: '生日', left: pb.left, fixed: true });
      if (L.myBirthday) builtin.push({ name: (L.myName || '我') + '的生日', date: mb.date, type: '生日', left: mb.left, fixed: true });
      el.innerHTML = '<div class="grid">' + builtin.concat(items).map(function (it) {
        var chip = it.left <= 7 ? 'danger' : it.left <= 30 ? 'accent' : 'brand';
        return '<div class="card"' + (it.id ? ' data-id="' + it.id + '"' : '') + '><div class="card-body">' +
          '<div class="card-hd"><div class="card-title">' + esc(it.name) + '</div>' +
          (it.id ? '<div class="card-acts"><button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
            '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div>' : '<div class="card-acts"><span class="chip">自动生成</span></div>') + '</div>' +
          '<div class="chips"><span class="chip ' + (it.type === '生日' ? 'purple' : 'brand') + '">' + esc(it.type || '纪念日') + '</span>' +
          '<span class="chip ' + chip + '">' + (it.left === 0 ? '就是今天' : it.left + ' 天后') + '</span></div>' +
          '<div class="lines"><div class="l"><span class="k">日期</span><span class="v">' + esc(it.date) + '</span></div>' +
          (it.note ? '<div class="l"><span class="k">备注</span><span class="v">' + esc(it.note) + '</span></div>' : '') + '</div>' +
          '</div></div>';
      }).join('') + '</div>';
    } else if (st.tab === 'gifts') {
      el.innerHTML = items.length ? '<div class="grid">' + items.map(function (it) {
        var img = (it.photos || [])[0];
        return '<div class="card" data-id="' + it.id + '">' +
          (img ? '<div class="card-media"><img src="' + img + '" loading="lazy"></div>' : '<div class="card-media"><span class="ph">' + App.icon('gift', '') + '</span></div>') +
          '<div class="card-body"><div class="card-hd"><div class="card-title">' + esc(it.name) + '</div><div class="card-acts">' +
          '<button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
          '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>' +
          '<div class="chips"><span class="chip brand">' + esc(it.from || '?') + ' → ' + esc(it.to || '?') + '</span>' +
          (it.occasion ? '<span class="chip">' + esc(it.occasion) + '</span>' : '') +
          (it.price ? '<span class="chip accent">' + U.money(it.price) + '</span>' : '') + '</div>' +
          '<div class="lines"><div class="l"><span class="k">日期</span><span class="v">' + esc(it.date || '-') + '</span></div>' +
          (it.note ? '<div class="l"><span class="k">备注</span><span class="v">' + esc(it.note) + '</span></div>' : '') + '</div>' +
          '</div></div>';
      }).join('') + '</div>' : emptyBox('gifts');
    } else {
      el.innerHTML = items.length ? '<div class="panel"><h3>' + App.icon('heart') + '重要时刻</h3><div class="tl">' + items.map(function (it) {
        var img = (it.photos || [])[0];
        return '<div class="tl-item" data-id="' + it.id + '"><div class="d">' + esc(it.date) + '</div>' +
          '<div class="t">' + esc(it.title) + '</div>' +
          (it.tags && it.tags.length ? '<div class="chips" style="margin:4px 0">' + it.tags.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
          '<div class="c">' + esc(it.content || '').replace(/\n/g, '<br>') + '</div>' +
          (img ? '<img src="' + img + '" style="width:100%;max-width:320px;border-radius:10px;margin-top:6px">' : '') +
          '<div style="margin-top:4px"><button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
          '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>';
      }).join('') + '</div></div>' : emptyBox('memo');
    }

    function years(ds) {
      var m = +ds.slice(5, 7), d = +ds.slice(8, 10);
      var t = new Date(); t.setHours(0, 0, 0, 0);
      var c = new Date(t.getFullYear(), m - 1, d);
      var y = t.getFullYear() - +ds.slice(0, 4);
      if (c < t) { c = new Date(t.getFullYear() + 1, m - 1, d); y++; }
      return { date: U.today(c), y: y, left: U.diffDays(U.today(), U.today(c)) };
    }
    function emptyBox(k) {
      return '<div class="empty"><div class="big">' + App.icon(k === 'gifts' ? 'gift' : 'heart', '') + '</div>' +
        '<div class="t">' + (q ? '没有匹配的记录' : '还没有记录') + '</div><div class="d">点击右上角「新增」记录第一条</div></div>';
    }

    var allGifts = Store.list('gifts');
    var total = allGifts.reduce(function (s, i) { return s + (Number(i.price) || 0); }, 0);
    U.$('#lv-stats', body).innerHTML = App.statsHTML({
      stats: function () {
        return [
          { label: '恋爱天数', value: days == null ? '-' : days, sub: days == null ? '先去设置起始日' : '天', cls: 'good' },
          { label: '纪念日', value: Store.list('anniv').length + 2, sub: '个（含自动生成）' },
          { label: '互送礼物', value: allGifts.length, sub: '件' },
          { label: '礼物花费', value: U.money(total), sub: '心意无价', cls: 'hot' }
        ];
      }
    }, []);
  }

  App.registerModule({
    id: 'love', name: '恋爱记录', icon: 'heart', store: 'anniv',
    desc: '恋爱时长、纪念日、互送礼物与重要时刻',
    render: loveRender,
    toolbar: [{ label: '恋爱设置', icon: 'gear', onClick: function (ctx) { openSetting(ctx.rerender); } }],
    onSearch: function (q, body, ctx) { App.state.love.q = q; loveRender(body, ctx); var i = U.$('#q'); if (i) i.focus(); },
    onAction: function (act, id, btn, ctx) {
      var tab = (App.state.love || {}).tab || 'anniv';
      if (act === 'add') {
        App.form({
          title: '新增' + (TABS.find(function (t) { return t.k === tab; }) || {}).n,
          fields: FIELDS[tab], size: 'lg', value: { date: U.today() },
          onSubmit: function (v) { Store.add(tab, v); App.toast('已记录', 'ok'); ctx.rerender(); }
        });
        return true;
      }
      if (act === 'edit') {
        App.form({
          title: '编辑', fields: FIELDS[tab], size: 'lg', value: Store.find(tab, id),
          onSubmit: function (v) { Store.update(tab, id, v); App.toast('已更新', 'ok'); ctx.rerender(); }
        });
        return true;
      }
      if (act === 'del') {
        var it = Store.find(tab, id);
        App.confirm('删除「' + esc(it.name || it.title || '该记录') + '」？', function () { Store.remove(tab, id); App.toast('已删除', 'ok'); ctx.rerender(); }, true);
        return true;
      }
      return false;
    }
  });
})();
