/* ===== 4. 旅行记录（地图点亮） / 5. 周末玩耍（365天日历） ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;

  /* ---------- 4. 旅行记录 ---------- */
  var PROVINCES = [
    ['黑龙江', 9, 1], ['吉林', 9, 2], ['内蒙古', 6, 2], ['新疆', 1, 3], ['北京', 7, 3], ['辽宁', 8, 3],
    ['甘肃', 3, 4], ['宁夏', 4, 4], ['山西', 5, 4], ['河北', 6, 4], ['天津', 8, 4],
    ['西藏', 2, 5], ['青海', 4, 5], ['陕西', 5, 5], ['河南', 6, 5], ['山东', 7, 5],
    ['四川', 3, 6], ['重庆', 4, 6], ['湖北', 6, 6], ['安徽', 7, 6], ['江苏', 8, 6], ['上海', 9, 6],
    ['云南', 3, 7], ['贵州', 4, 7], ['湖南', 5, 7], ['江西', 6, 7], ['浙江', 7, 7],
    ['广西', 4, 8], ['广东', 5, 8], ['福建', 6, 8], ['台湾', 7, 8],
    ['海南', 4, 9], ['澳门', 5, 9], ['香港', 6, 9]
  ];

  var spotFields = [
    { key: 'city', label: '城市 / 地点', required: true },
    { key: 'province', label: '所属省份', type: 'select', options: PROVINCES.map(function (p) { return p[0]; }), required: true },
    { key: 'date', label: '出行日期', type: 'date' },
    { key: 'days', label: '游玩天数', type: 'number' },
    { key: 'with', label: '同行的人' },
    { key: 'rating', label: '体验评分', type: 'select', options: ['5 ★ 超赞', '4 ★ 不错', '3 ★ 一般', '2 ★ 失望'] },
    { key: 'photos', label: '照片', type: 'images', max: 4, full: true },
    { key: 'note', label: '游记 / 备注', type: 'textarea', full: true }
  ];

  function openSpot(id, province, onDone) {
    var item = id ? Store.find('travel', id) : { province: province || '', date: U.today() };
    App.form({
      title: (id ? '编辑足迹' : '新增足迹') + (province ? ' · ' + province : ''),
      fields: spotFields, value: item, size: 'lg',
      onSubmit: function (v) {
        if (id) { Store.update('travel', id, v); App.toast('已更新', 'ok'); }
        else { Store.add('travel', v); App.toast('已点亮 ' + v.province, 'ok'); }
        onDone && onDone();
      }
    });
  }

  function openProvince(name, onDone) {
    var records = Store.list('travel').filter(function (t) { return t.province === name; });
    var box = document.createElement('div');
    var h = App.modal.open({
      title: name + ' · 足迹', size: 'lg', body: box, okText: false, cancelText: '关闭',
      onMount: function () { paint(); }
    });
    function paint() {
      records = Store.list('travel').filter(function (t) { return t.province === name; });
      box.innerHTML = (records.length ? records.map(function (t) {
        var img = (t.photos || [])[0];
        return '<div class="sub-item" style="align-items:flex-start;margin-bottom:8px">' +
          (img ? '<img src="' + img + '" style="width:54px;height:54px;object-fit:cover;border-radius:8px">' : '') +
          '<div class="txt"><div class="s1">' + esc(t.city) + ' <span class="chip">' + esc(t.rating || '') + '</span></div>' +
          '<div class="s2">' + esc(t.date || '') + (t.days ? ' · ' + t.days + '天' : '') + (t.with ? ' · 和 ' + esc(t.with) : '') + '</div>' +
          '<div class="s2">' + esc(t.note || '') + '</div></div>' +
          '<button class="icon-btn" data-e="' + t.id + '">' + App.icon('edit') + '</button>' +
          '<button class="icon-btn danger" data-d="' + t.id + '">' + App.icon('trash') + '</button></div>';
      }).join('') : '<div class="empty" style="padding:26px"><div class="t">还没有去过这里</div><div class="d">去过的那天记得回来点亮</div></div>') +
        '<button class="btn primary" id="addspot" style="margin-top:10px">' + App.icon('plus') + '添加足迹</button>';
      U.$$('[data-e]', box).forEach(function (b) { b.onclick = function () { openSpot(b.dataset.e, null, function () { paint(); onDone && onDone(); }); }; });
      U.$$('[data-d]', box).forEach(function (b) {
        b.onclick = function () { Store.remove('travel', b.dataset.d); App.toast('已删除', 'ok'); paint(); onDone && onDone(); };
      });
      box.querySelector('#addspot').onclick = function () { openSpot(null, name, function () { paint(); onDone && onDone(); }); };
    }
  }

  function travelRender(body, ctx) {
    var st = App.state.travel || (App.state.travel = { q: '' });
    var all = Store.list('travel');
    var lit = {};
    all.forEach(function (t) { if (t.province) lit[t.province] = (lit[t.province] || 0) + 1; });

    body.innerHTML =
      '<div class="stats" id="tj-stats"></div>' +
      '<div class="map-wrap" style="margin-bottom:16px">' +
      '<div class="map-grid">' + PROVINCES.map(function (p) {
        var n = lit[p[0]] || 0;
        return '<div class="map-cell' + (n ? ' on' : '') + '" data-p="' + p[0] + '" style="grid-column:' + p[1] + ';grid-row:' + p[2] + '">' +
          esc(p[0].replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区|自治州/g, '')) + (n ? '<span class="cnt">' + n + '</span>' : '') + '</div>';
      }).join('') + '</div>' +
      '<div class="map-legend"><span><i class="a"></i>已点亮</span><span><i class="b"></i>待解锁</span><span>点击地图格子即可记录 / 查看该地足迹</span></div>' +
      '</div><div id="tj-list"></div>';

    function paintStats() {
      var cities = new Set(all.map(function (t) { return t.city; }).filter(Boolean)).size;
      var days = all.reduce(function (s, t) { return s + (Number(t.days) || 0); }, 0);
      U.$('#tj-stats', body).innerHTML = App.statsHTML({
        stats: function () {
          return [
            { label: '点亮省份', value: Object.keys(lit).length + '/34', sub: '覆盖率 ' + Math.round(Object.keys(lit).length / 34 * 100) + '%' },
            { label: '去过城市', value: cities, sub: '座' },
            { label: '旅行天数', value: days, sub: '天' },
            { label: '足迹记录', value: all.length, sub: '条' }
          ];
        }
      }, all);
    }
    function paintList() {
      var q = (st.q || '').toLowerCase();
      var items = all.filter(function (t) {
        return !q || JSON.stringify(t).toLowerCase().indexOf(q) > -1;
      }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var el = U.$('#tj-list', body);
      if (!items.length) {
        el.innerHTML = '<div class="empty"><div class="big">' + App.icon('map', '') + '</div><div class="t">' + (q ? '没有匹配的足迹' : '还没有足迹') + '</div><div class="d">' + (q ? '换个关键词' : '点击上面的地图格子开始点亮') + '</div></div>';
        return;
      }
      el.innerHTML = '<div class="panel"><h3>' + App.icon('map') + '全部足迹</h3><div class="grid">' + items.map(function (t) {
        var img = (t.photos || [])[0];
        return '<div class="card" data-id="' + t.id + '">' +
          (img ? '<div class="card-media"><img src="' + img + '" loading="lazy"></div>' : '') +
          '<div class="card-body"><div class="card-hd"><div class="card-title">' + esc(t.city) + '</div><div class="card-acts">' +
          '<button class="icon-btn" data-e="' + t.id + '">' + App.icon('edit') + '</button>' +
          '<button class="icon-btn danger" data-d="' + t.id + '">' + App.icon('trash') + '</button></div></div>' +
          '<div class="chips"><span class="chip brand">' + esc(t.province) + '</span>' + (t.rating ? '<span class="chip accent">' + esc(t.rating) + '</span>' : '') + '</div>' +
          '<div class="lines"><div class="l"><span class="k">日期</span><span class="v">' + esc(t.date || '-') + (t.days ? '（' + t.days + '天）' : '') + '</span></div>' +
          (t.with ? '<div class="l"><span class="k">同行</span><span class="v">' + esc(t.with) + '</span></div>' : '') +
          (t.note ? '<div class="l"><span class="k">游记</span><span class="v">' + esc(t.note) + '</span></div>' : '') + '</div>' +
          '</div></div>';
      }).join('') + '</div></div>';
      U.$$('[data-e]', el).forEach(function (b) { b.onclick = function () { openSpot(b.dataset.e, null, refresh); }; });
      U.$$('[data-d]', el).forEach(function (b) {
        b.onclick = function () {
          App.confirm('删除这条足迹？', function () { Store.remove('travel', b.dataset.d); App.toast('已删除', 'ok'); refresh(); }, true);
        };
      });
    }
    function refresh() { travelRender(body, ctx); }

    U.$$('.map-cell', body).forEach(function (c) {
      c.onclick = function () {
        var p = c.dataset.p;
        if (lit[p]) openProvince(p, refresh);
        else openSpot(null, p, refresh);
      };
    });
    paintStats(); paintList();
  }

  App.registerModule({
    id: 'travel', name: '旅行记录', icon: 'map', store: 'travel',
    desc: '点亮点过的地方，云端地图越走越亮',
    render: travelRender,
    onSearch: function (q, body, ctx) { App.state.travel.q = q; travelRender(body, ctx); var i = U.$('#q'); if (i) i.focus(); }
  });
  App.openSpot = openSpot;

  /* ---------- 5. 周末玩耍 ---------- */
  function wkStore() { return Store.get('weekend', {}) || {}; }
  function saveWk(d, v) { var s = wkStore(); if (!v) delete s[d]; else s[d] = Object.assign(s[d] || {}, v); Store.set('weekend', s); }

  var wkFields = [
    { key: 'plan', label: '周末计划', placeholder: '打算去哪儿？' },
    { key: 'actual', label: '实际去哪玩了', placeholder: '最后去了哪' },
    { key: 'partners', label: '和谁一起', placeholder: '朋友 / 家人 / 对象' },
    { key: 'starred', label: '出门星标', type: 'switch', hint: '真的出门玩耍了就打开' },
    { key: 'photos', label: '照片', type: 'images', max: 4, full: true },
    { key: 'note', label: '碎碎念', type: 'textarea', full: true }
  ];

  function openDay(d, onDone) {
    var v = wkStore()[d] || {};
    App.form({
      title: d + '（周' + U.weekdayCn(U.parseDate(d)) + '）' , fields: wkFields, value: v, size: 'lg',
      onSubmit: function (nv) {
        nv.starred = !!nv.starred;
        if (!nv.plan && !nv.actual && !nv.note && !nv.partners && !nv.starred && !(nv.photos || []).length) { saveWk(d, null); App.toast('已清空该日记录', 'ok'); }
        else { saveWk(d, nv); App.toast('已记录', 'ok'); }
        onDone && onDone();
      }
    });
  }

  function weekendRender(body, ctx) {
    var st = App.state.weekend || (App.state.weekend = { q: '', year: new Date().getFullYear() });
    if (!st.year) st.year = new Date().getFullYear();
    var year = st.year;
    var data = wkStore();
    var today = U.today();

    body.innerHTML =
      '<div class="stats" id="wk-stats"></div>' +
      '<div class="seg" style="margin-bottom:14px" id="wk-year">' +
      [year - 1, year, year + 1].map(function (y) { return '<button class="' + (y === year ? 'on' : '') + '" data-y="' + y + '">' + y + ' 年</button>'; }).join('') +
      '</div><div class="cal-year" id="wk-cal"></div><div id="wk-list" style="margin-top:16px"></div>';

    U.$$('#wk-year [data-y]', body).forEach(function (b) {
      b.onclick = function () { st.year = +b.dataset.y; weekendRender(body, ctx); };
    });

    /* 统计 */
    var yk = Object.keys(data).filter(function (d) { return d.indexOf(String(year)) === 0; });
    var star = yk.filter(function (d) { return data[d].starred; });
    var weekendOut = star.filter(function (d) { var w = U.parseDate(d).getDay(); return w === 0 || w === 6; });
    var partners = {};
    yk.forEach(function (d) { (data[d].partners || '').split(/[、,，\s]+/).forEach(function (p) { if (p) partners[p] = (partners[p] || 0) + 1; }); });
    var topP = Object.keys(partners).sort(function (a, b) { return partners[b] - partners[a]; })[0];
    U.$('#wk-stats', body).innerHTML = App.statsHTML({
      stats: function () {
        return [
          { label: year + ' 年出门', value: star.length, sub: '天被星标' },
          { label: '其中周末', value: weekendOut.length, sub: '天' },
          { label: '记录天数', value: yk.length, sub: '天有内容' },
          { label: '最常一起玩', value: topP || '-', sub: topP ? partners[topP] + ' 次' : '还没填同行人', cls: 'hot' }
        ];
      }
    }, []);

    /* 日历 */
    var cal = U.$('#wk-cal', body);
    var html = '';
    for (var m = 1; m <= 12; m++) {
      var first = new Date(year, m - 1, 1);
      var start = first.getDay();
      var total = new Date(year, m, 0).getDate();
      var days = [];
      for (var i = 0; i < start; i++) days.push('<div class="cal-d blank"></div>');
      for (var d = 1; d <= total; d++) {
        var ds = year + '-' + U.pad(m) + '-' + U.pad(d);
        var wk = new Date(year, m - 1, d).getDay();
        var rec = data[ds];
        var cls = 'cal-d' + (wk === 0 || wk === 6 ? ' we' : '') + (ds === today ? ' today' : '') + (rec && rec.starred ? ' star' : (rec ? ' has' : ''));
        days.push('<div class="' + cls + '" data-d="' + ds + '">' + d + '</div>');
      }
      html += '<div class="cal-month"><h4>' + m + ' 月<span class="n">' +
        yk.filter(function (k) { return k.indexOf(year + '-' + U.pad(m)) === 0 && data[k].starred; }).length + ' 次出门</span></h4>' +
        '<div class="cal-grid">' + ['日', '一', '二', '三', '四', '五', '六'].map(function (w) { return '<div class="cal-w">' + w + '</div>'; }).join('') + days.join('') + '</div></div>';
    }
    cal.innerHTML = html;
    U.$$('.cal-d[data-d]', cal).forEach(function (c) {
      c.onclick = function () { openDay(c.dataset.d, function () { weekendRender(body, ctx); }); };
    });

    /* 搜索结果列表 */
    var q = (st.q || '').toLowerCase();
    var list = yk.filter(function (d) {
      return q && JSON.stringify(data[d]).toLowerCase().indexOf(q) > -1;
    }).sort(function (a, b) { return b.localeCompare(a); });
    var el = U.$('#wk-list', body);
    if (q) {
      el.innerHTML = '<div class="panel"><h3>' + App.icon('search') + '搜索到 ' + list.length + ' 天</h3>' +
        (list.length ? list.map(function (d) {
          var r = data[d];
          return '<div class="list-row"><div class="t"><b>' + d + '</b> 周' + U.weekdayCn(U.parseDate(d)) +
            (r.starred ? ' <span class="chip accent">★ 出门</span>' : '') +
            '<div class="s">' + esc(r.actual || r.plan || '') + (r.partners ? ' · 和 ' + esc(r.partners) : '') + '</div></div>' +
            '<button class="icon-btn" data-w="' + d + '">' + App.icon('edit') + '</button>' +
            '<button class="icon-btn danger" data-wd="' + d + '">' + App.icon('trash') + '</button></div>';
        }).join('') : '<div class="empty" style="padding:24px"><div class="t">没有匹配的日子</div></div>') + '</div>';
      U.$$('[data-w]', el).forEach(function (b) { b.onclick = function () { openDay(b.dataset.w, function () { weekendRender(body, ctx); }); }; });
      U.$$('[data-wd]', el).forEach(function (b) {
        b.onclick = function () { saveWk(b.dataset.wd, null); App.toast('已删除', 'ok'); weekendRender(body, ctx); };
      });
    } else {
      var recent = yk.sort(function (a, b) { return b.localeCompare(a); }).slice(0, 8);
      el.innerHTML = recent.length ? '<div class="panel"><h3>' + App.icon('sun') + '最近的周末</h3>' + recent.map(function (d) {
        var r = data[d];
        return '<div class="list-row"><div class="t"><b>' + d + '</b> 周' + U.weekdayCn(U.parseDate(d)) +
          (r.starred ? ' <span class="chip accent">★</span>' : '') +
          '<div class="s">计划：' + esc(r.plan || '-') + '　实际：' + esc(r.actual || '-') + (r.partners ? '　和 ' + esc(r.partners) : '') + '</div></div>' +
          '<button class="icon-btn" data-w="' + d + '">' + App.icon('edit') + '</button></div>';
      }).join('') + '</div>' : '';
      U.$$('[data-w]', el).forEach(function (b) { b.onclick = function () { openDay(b.dataset.w, function () { weekendRender(body, ctx); }); }; });
    }
  }

  App.registerModule({
    id: 'weekend', name: '周末玩耍', icon: 'sun', store: 'weekend',
    desc: '365 天日历记录计划与实际行动，出门就星标',
    render: weekendRender,
    onSearch: function (q, body, ctx) { App.state.weekend.q = q; weekendRender(body, ctx); var i = U.$('#q'); if (i) i.focus(); }
  });
  App.weekendStore = wkStore;
})();
