/* ===== 8. 生活备忘 / 9. 行李清单 / 12. 愿望清单 ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;

  /* ---------- 8. 生活备忘 ---------- */
  var TAGS = ['灵感', '购物', '工作', '生活', '旅行', '健康', '人情', '待查'];
  App.registerModule({
    id: 'notes', name: '生活备忘', icon: 'note', store: 'notes',
    desc: '文字、图片、链接随手记，支持置顶与待办',
    titleKey: 'title', imageKey: 'images', wide: true,
    fields: [
      { key: 'title', label: '标题', required: true, placeholder: '一句话说清是什么' },
      { key: 'type', label: '类型', type: 'select', options: ['文字', '图片', '链接', '待办'], required: true },
      { key: 'content', label: '内容', type: 'textarea', full: true },
      { key: 'url', label: '链接', placeholder: 'https://…' },
      { key: 'images', label: '图片', type: 'images', max: 6, full: true },
      { key: 'tags', label: '标签', type: 'chips', options: TAGS, full: true },
      { key: 'remind', label: '提醒日期', type: 'date' },
      { key: 'pinned', label: '置顶', type: 'switch' },
      { key: 'done', label: '已完成', type: 'switch' }
    ],
    defaults: { type: '文字' },
    sort: function (a, b) {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    },
    groupBy: 'type',
    stats: function (items) {
      var todo = items.filter(function (i) { return i.type === '待办' && !i.done; }).length;
      var pin = items.filter(function (i) { return i.pinned; }).length;
      return [
        { label: '备忘总数', value: items.length, sub: '条' },
        { label: '待办未完成', value: todo, sub: todo ? '记得处理' : '全部完成', cls: todo ? 'warn' : 'good' },
        { label: '置顶', value: pin, sub: '条' },
        { label: '图片备忘', value: items.filter(function (i) { return (i.images || []).length; }).length, sub: '条' }
      ];
    },
    onAction: function (act, id) {
      if (act === 'done') {
        var it = Store.find('notes', id);
        Store.update('notes', id, { done: !it.done });
        App.toast(it.done ? '已标记为未完成' : '已完成 ✓', 'ok');
        App.renderModule(App.current); return true;
      }
      return false;
    },
    renderCard: function (it) {
      var imgs = it.images || [];
      var ico = it.type === '链接' ? 'link' : it.type === '待办' ? 'check' : it.type === '图片' ? 'img' : 'note';
      return '<div class="card" data-id="' + it.id + '">' +
        (imgs[0] ? '<div class="card-media"><img src="' + imgs[0] + '" loading="lazy">' + (imgs.length > 1 ? '<span class="multi">+' + (imgs.length - 1) + '</span>' : '') + '</div>' : '') +
        '<div class="card-body">' +
        '<div class="card-hd"><div class="card-title">' + (it.pinned ? '<span class="chip accent">置顶</span> ' : '') +
        (it.done ? '<s>' + esc(it.title) + '</s>' : esc(it.title)) + '</div><div class="card-acts">' +
        (it.type === '待办' ? '<button class="icon-btn" data-act="done" title="切换完成">' + App.icon('check') + '</button>' : '') +
        '<button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
        '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>' +
        '<div class="chips"><span class="chip brand">' + App.icon(ico, '') + ' ' + esc(it.type) + '</span>' +
        (it.tags || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') +
        (it.remind ? '<span class="chip blue">提醒 ' + esc(it.remind) + '</span>' : '') + '</div>' +
        (it.content ? '<div class="lines"><div class="l"><span class="v">' + esc(it.content).replace(/\n/g, '<br>') + '</span></div></div>' : '') +
        (it.url ? '<div class="lines"><div class="l"><span class="v"><a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.url) + '</a></span></div></div>' : '') +
        '<div class="card-foot"><span>' + (it.createdAt ? it.createdAt.slice(0, 10) : '') + '</span>' +
        (it.done ? '<span class="chip" style="margin-left:auto">已完成</span>' : '') + '</div>' +
        '</div></div>';
    }
  });

  /* ---------- 9. 行李清单 ---------- */
  var PK_CATS = ['证件', '衣物', '洗护', '电子', '药品', '化妆', '配饰', '零食', '其它'];

  function packingProgress(it) {
    var items = it.items || [];
    var done = items.filter(function (x) { return x.packed; }).length;
    return { done: done, total: items.length, pct: items.length ? Math.round(done / items.length * 100) : 0 };
  }
  function openPacking(id, onDone) {
    var box = document.createElement('div');
    var h = App.modal.open({
      title: '行李清单', size: 'lg', body: box, okText: false, cancelText: '关闭',
      onMount: function (bd, hh) { paint(hh); }
    });
    function paint(hh) {
      var cur = hh || h; if (!cur) return;
      var it = Store.find('packing', id);
      if (!it) { cur.close(); return; }
      var ttl = U.$('.modal-hd .t', cur.el); if (ttl) ttl.textContent = it.name + ' · 行李清单';
      var items = it.items || [];
      var p = packingProgress(it);
      var groups = {};
      items.forEach(function (x) { var c = x.cat || '其它'; (groups[c] = groups[c] || []).push(x); });
      box.innerHTML =
        '<div class="panel" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px">' +
        '<span>打包进度</span><b>' + p.done + ' / ' + p.total + '（' + p.pct + '%）</b></div>' +
        '<div class="prog"><i style="width:' + p.pct + '%"></i></div></div>' +
        (items.length ? Object.keys(groups).map(function (c) {
          return '<div style="margin-bottom:12px"><div class="quote" style="margin-bottom:4px">' + esc(c) + '</div>' +
            groups[c].map(function (x) {
              return '<div class="sub-item" style="margin-bottom:5px"><div class="switch' + (x.packed ? ' on' : '') + '" data-pk="' + x.id + '"></div>' +
                '<div class="txt"><div class="s1"' + (x.packed ? ' style="text-decoration:line-through;opacity:.5"' : '') + '>' + esc(x.name) +
                (x.qty ? ' ×' + esc(x.qty) : '') + '</div>' + (x.note ? '<div class="s2">' + esc(x.note) + '</div>' : '') + '</div>' +
                '<button class="icon-btn" data-pe="' + x.id + '">' + App.icon('edit') + '</button>' +
                '<button class="icon-btn danger" data-pd="' + x.id + '">' + App.icon('trash') + '</button></div>';
            }).join('') + '</div>';
        }).join('') : '<div class="empty" style="padding:24px"><div class="t">还没有清单条目</div><div class="d">在下面快速添加，或点「编辑」批量录入</div></div>') +
        '<div class="field"><label>快速添加</label><div style="display:flex;gap:8px">' +
        '<input class="input" id="qk" placeholder="如：身份证 ×1"><select class="select" id="qc" style="width:110px">' +
        PK_CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
        '<button class="btn primary" id="qadd">添加</button></div></div>';
      U.$$('[data-pk]', box).forEach(function (s) {
        s.onclick = function () {
          var id2 = s.dataset.pk;
          items.forEach(function (x) { if (x.id === id2) x.packed = !x.packed; });
          Store.update('packing', id, { items: items }); paint(); onDone && onDone();
        };
      });
      U.$$('[data-pe]', box).forEach(function (b) {
        b.onclick = function () {
          var x = items.find(function (y) { return y.id === b.dataset.pe; });
          App.form({
            title: '编辑条目', value: x, fields: [
              { key: 'name', label: '物品', required: true },
              { key: 'cat', label: '分类', type: 'select', options: PK_CATS },
              { key: 'qty', label: '数量' },
              { key: 'note', label: '备注' }
            ], size: '', onSubmit: function (v) { Object.assign(x, v); Store.update('packing', id, { items: items }); paint(); onDone && onDone(); }
          });
        };
      });
      U.$$('[data-pd]', box).forEach(function (b) {
        b.onclick = function () {
          Store.update('packing', id, { items: items.filter(function (y) { return y.id !== b.dataset.pd; }) });
          App.toast('已删除', 'ok'); paint(); onDone && onDone();
        };
      });
      var qk = U.$('#qk', box);
      U.$('#qadd', box).onclick = function () {
        var v = qk.value.trim(); if (!v) return;
        items.push({ id: U.uid(), name: v, cat: U.$('#qc', box).value, packed: false });
        Store.update('packing', id, { items: items }); qk.value = ''; paint(); onDone && onDone();
      };
      qk.onkeydown = function (e) { if (e.key === 'Enter') U.$('#qadd', box).click(); };
    }
  }

  App.registerModule({
    id: 'packing', name: '行李清单', icon: 'bag', store: 'packing',
    desc: '每次出行前照着勾，再也不会落下东西',
    titleKey: 'name', imageKey: '', wide: true,
    fields: [
      { key: 'name', label: '行程名称', required: true, placeholder: '如：国庆回老家' },
      { key: 'dest', label: '目的地' },
      { key: 'date', label: '出发日期', type: 'date' },
      { key: 'days', label: '出行天数', type: 'number' },
      { key: 'companions', label: '同行的人' },
      { key: 'items', label: '行李条目', type: 'sublist', full: true, subFields: [
        { key: 'name', label: '物品', required: true },
        { key: 'cat', label: '分类', type: 'select', options: PK_CATS },
        { key: 'qty', label: '数量' },
        { key: 'packed', label: '已打包', type: 'switch' },
        { key: 'note', label: '备注' }
      ], summary: function (x) { return (x.packed ? '✓ ' : '○ ') + (x.name || '') + (x.qty ? ' ×' + x.qty : '') + (x.cat ? '（' + x.cat + '）' : ''); } },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { items: [] },
    sort: function (a, b) { return (b.date || '').localeCompare(a.date || ''); },
    stats: function (items) {
      var allItems = [].concat.apply([], items.map(function (i) { return i.items || []; }));
      var packed = allItems.filter(function (x) { return x.packed; }).length;
      var going = items.filter(function (i) { var d = U.diffDays(U.today(), i.date); return d != null && d >= 0 && d <= 30; }).length;
      return [
        { label: '行程数', value: items.length, sub: '个' },
        { label: '待收拾', value: allItems.length - packed, sub: '件未打包', cls: (allItems.length - packed) ? 'hot' : 'good' },
        { label: '已打包', value: packed, sub: '件' },
        { label: '30天内出发', value: going, sub: going ? '快收拾行李' : '暂无近期出行' }
      ];
    },
    renderCard: function (it) {
      var p = packingProgress(it);
      var left = U.diffDays(U.today(), it.date);
      var cats = {};
      (it.items || []).forEach(function (x) { cats[x.cat || '其它'] = (cats[x.cat || '其它'] || 0) + 1; });
      return '<div class="card" data-id="' + it.id + '"><div class="card-body">' +
        '<div class="card-hd"><div class="card-title">' + esc(it.name) + '</div><div class="card-acts">' +
        '<button class="icon-btn" data-act="open">' + App.icon('check') + '</button>' +
        '<button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
        '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>' +
        '<div class="chips">' + (it.dest ? '<span class="chip brand">' + esc(it.dest) + '</span>' : '') +
        (it.date ? '<span class="chip">' + esc(it.date) + (it.days ? ' · ' + it.days + '天' : '') + '</span>' : '') +
        (left != null ? '<span class="chip ' + (left < 0 ? '' : left <= 7 ? 'danger' : 'blue') + '">' + (left < 0 ? '已出发' : left === 0 ? '今天出发' : '还有 ' + left + ' 天') + '</span>' : '') +
        '</div>' +
        '<div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>打包进度</span><span>' + p.done + '/' + p.total + '</span></div>' +
        '<div class="prog" style="margin-top:4px"><i style="width:' + p.pct + '%"></i></div></div>' +
        '<div class="chips">' + Object.keys(cats).map(function (c) { return '<span class="chip">' + esc(c) + ' ' + cats[c] + '</span>'; }).join('') + '</div>' +
        (it.companions ? '<div class="lines"><div class="l"><span class="k">同行</span><span class="v">' + esc(it.companions) + '</span></div></div>' : '') +
        (it.note ? '<div class="lines"><div class="l"><span class="v">' + esc(it.note) + '</span></div></div>' : '') +
        '</div></div>';
    },
    onAction: function (act, id, btn, ctx) {
      if (act === 'open') { openPacking(id, ctx.rerender); return true; }
      return false;
    }
  });

  /* ---------- 12. 愿望清单 ---------- */
  App.registerModule({
    id: 'wishes', name: '愿望清单', icon: 'flag', store: 'wishes',
    desc: '想去、想玩、想买、想学，一件件划掉',
    titleKey: 'title', imageKey: 'photos',
    fields: [
      { key: 'title', label: '愿望', required: true, placeholder: '如：去看一次海边的日落' },
      { key: 'category', label: '分类', type: 'select', options: ['想去的地方', '想玩的项目', '想买的东西', '想学的技能', '想做的事', '想看的展览'], required: true },
      { key: 'priority', label: '优先级', type: 'select', options: ['很想要', '一般', '佛系'] },
      { key: 'status', label: '状态', type: 'select', options: ['想去', '计划中', '进行中', '已完成', '已放弃'] },
      { key: 'targetDate', label: '目标日期', type: 'date' },
      { key: 'cost', label: '预计花费', type: 'number' },
      { key: 'with', label: '想和谁一起' },
      { key: 'photos', label: '图片', type: 'images', max: 3, full: true },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { status: '想去', priority: '一般' },
    groupBy: 'category',
    sort: function (a, b) {
      var o = ['想去', '计划中', '进行中', '已完成', '已放弃'];
      var d = o.indexOf(a.status) - o.indexOf(b.status);
      if (d) return d;
      var p = ['很想要', '一般', '佛系'];
      return p.indexOf(a.priority) - p.indexOf(b.priority);
    },
    stats: function (items) {
      var done = items.filter(function (i) { return i.status === '已完成'; }).length;
      var doing = items.filter(function (i) { return i.status === '计划中' || i.status === '进行中'; }).length;
      var cost = items.filter(function (i) { return i.status !== '已完成' && i.status !== '已放弃'; }).reduce(function (s, i) { return s + (Number(i.cost) || 0); }, 0);
      return [
        { label: '愿望总数', value: items.length, sub: '个' },
        { label: '已实现', value: done, sub: done ? '完成率 ' + Math.round(done / items.length * 100) + '%' : '继续加油', cls: 'good' },
        { label: '进行中', value: doing, sub: '个' },
        { label: '预计花费', value: U.money(cost), sub: '未实现部分' }
      ];
    },
    onAction: function (act, id, btn, ctx) {
      if (act === 'done') {
        var it = Store.find('wishes', id);
        var done = it.status !== '已完成';
        Store.update('wishes', id, { status: done ? '已完成' : '想去', doneDate: done ? U.today() : '' });
        App.toast(done ? '愿望达成 ✓' : '已取消完成', 'ok'); App.renderModule(App.current); return true;
      }
      return false;
    },
    badges: ['priority'],
    lines: [
      ['目标', function (it) { return esc(it.targetDate || '不限时'); }],
      ['预计花费', function (it) { return it.cost ? U.money(it.cost) : '-'; }],
      ['想和谁', function (it) { return esc(it['with'] || '-'); }],
      ['备注', function (it) { return esc(it.note || ''); }]
    ],
    renderCard: function (it) {
      var done = it.status === '已完成';
      var img = (it.photos || [])[0];
      return '<div class="card" data-id="' + it.id + '" style="' + (done ? 'opacity:.72' : '') + '">' +
        (img ? '<div class="card-media"><img src="' + img + '" loading="lazy"></div>' : '') +
        '<div class="card-body"><div class="card-hd"><div class="card-title">' + (done ? '<s>' + esc(it.title) + '</s>' : esc(it.title)) + '</div>' +
        '<div class="card-acts"><button class="icon-btn" data-act="done" title="标记完成">' + App.icon('check') + '</button>' +
        '<button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
        '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>' +
        '<div class="chips"><span class="chip brand">' + esc(it.category) + '</span>' +
        '<span class="chip ' + (done ? '' : it.priority === '很想要' ? 'danger' : it.priority === '一般' ? 'accent' : '') + '">' + esc(it.priority || '') + '</span>' +
        '<span class="chip ' + (done ? '' : 'blue') + '">' + esc(it.status) + '</span></div>' +
        '<div class="lines">' +
        '<div class="l"><span class="k">目标</span><span class="v">' + esc(it.targetDate || '不限时') + '</span></div>' +
        (it.cost ? '<div class="l"><span class="k">预算</span><span class="v">' + U.money(it.cost) + '</span></div>' : '') +
        (it.with ? '<div class="l"><span class="k">想和</span><span class="v">' + esc(it.with) + '</span></div>' : '') +
        (it.note ? '<div class="l"><span class="k">备注</span><span class="v">' + esc(it.note) + '</span></div>' : '') +
        '</div>' +
        (done && it.doneDate ? '<div class="card-foot"><span class="chip">' + esc(it.doneDate) + ' 达成</span></div>' : '') +
        '</div></div>';
    }
  });
})();
