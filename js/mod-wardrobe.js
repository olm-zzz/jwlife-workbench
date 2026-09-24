/* ===== 1. 电子衣橱 ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;

  var CATS = ['上衣', '外套', '裤子', '裙子', '连衣裙', '鞋', '包', '帽子', '配饰', '袜子', '内衣', '其他'];
  var OCCASIONS = ['通勤', '约会', '休闲', '运动', '正式', '旅行', '居家', '聚会'];
  var SEASONS = ['春', '夏', '秋', '冬', '四季'];

  function seasonNow() {
    var m = new Date().getMonth() + 1;
    return m <= 2 || m === 12 ? '冬' : m <= 5 ? '春' : m <= 8 ? '夏' : '秋';
  }
  function bmiTip() {
    var p = App.profile();
    var h = Number(p.height) / 100, w = Number(p.weight);
    if (!h || !w) return '还没填写身高体重，点「身材数据」补充后能给出更贴合的搭配建议～';
    var bmi = w / (h * h);
    var tips = [];
    if (bmi < 18.5) tips.push('偏瘦体型：建议用叠穿、浅色和格纹增加体积感，避免全身紧身，直筒/阔腿下装更友好');
    else if (bmi < 24) tips.push('匀称体型：合身剪裁最出彩，善用高腰线 + 短上衣拉长比例');
    else if (bmi < 28) tips.push('偏丰满：推荐高腰线、V 领、深色内搭 + 浅色外搭，A 字裙/直筒裤更修饰');
    else tips.push('建议选择垂感面料与深色系，强调纵向线条，避开横条纹和过于宽松的版型');
    var hh = Number(p.height);
    if (hh && hh < 158) tips.push('身高 ' + hh + 'cm：短款上装 + 高腰下装、鞋裤同色，视觉更修长');
    else if (hh >= 172) tips.push('身高 ' + hh + 'cm：长裙、阔腿裤、长款外套都能轻松驾驭');
    else if (hh) tips.push('身高 ' + hh + 'cm：中长款外套 + 九分裤是最稳的比例');
    return 'BMI ' + bmi.toFixed(1) + '｜' + tips.join('；');
  }

  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  function buildOutfit(occ, season) {
    var all = Store.list('wardrobe').filter(function (i) { return i.status !== '已出'; });
    var byCat = function (c) { return all.filter(function (i) { return i.category === c; }); };
    var score = function (i) {
      return ((i.occasions || []).indexOf(occ) > -1 ? 2 : 0) + ((i.season || []).some(function (s) { return s === season || s === '四季'; }) ? 1 : 0);
    };
    var choose = function (cats, n) {
      var pool = [].concat.apply([], cats.map(byCat));
      if (!pool.length) return [];
      var suited = pool.filter(function (i) { return score(i) > 0; });
      var src = suited.length ? suited : pool;
      var out = [];
      for (var k = 0; k < (n || 1) && src.length; k++) {
        var p = pickOne(src);
        if (out.indexOf(p) < 0) out.push(p);
      }
      return out;
    };
    var parts = [];
    var dress = choose(['连衣裙'], 1)[0];
    if (dress) parts.push(dress);
    else {
      parts = parts.concat(choose(['上衣'], 1));
      parts = parts.concat(choose(['裤子', '裙子'], 1));
    }
    if (season === '冬' || season === '秋' || Math.random() < 0.4) parts = parts.concat(choose(['外套'], 1));
    parts = parts.concat(choose(['鞋'], 1));
    parts = parts.concat(choose(['包', '帽子', '配饰'], 2));
    return parts;
  }

  function outfitHTML(parts, tip) {
    if (!parts.length) return '<div class="empty"><div class="big">' + App.icon('shirt', '') + '</div><div class="t">衣物还不够组成一套</div><div class="d">先按分类多录入几件单品吧</div></div>';
    return '<div class="grid" style="margin-bottom:14px">' + parts.map(function (p) {
      var img = (p.photos || [])[0];
      return '<div class="card" style="box-shadow:none"><div class="card-media">' + (img ? '<img src="' + img + '">' : '<span class="ph">' + App.icon('shirt', '') + '</span>') + '</div>' +
        '<div class="card-body"><div class="card-title">' + esc(p.name) + '</div>' +
        '<div class="chips"><span class="chip brand">' + esc(p.category) + '</span>' + (p.color ? '<span class="chip">' + esc(p.color) + '</span>' : '') + '</div></div></div>';
    }).join('') + '</div>' +
      '<div class="panel" style="background:var(--accent-soft);border-color:transparent"><div class="quote">' + esc(tip) + '</div></div>';
  }

  function openOutfit() {
    var season = seasonNow();
    var occ = OCCASIONS[0];
    var cur = [];
    var box = document.createElement('div');
    var h = App.modal.open({
      title: '智能搭配', size: 'xl', body: box, okText: '保存这套', cancelText: '关闭',
      onMount: function () { paint(); },
      onOk: function (hh) {
        if (!cur.length) { App.toast('还没有可保存的搭配'); return; }
        Store.add('outfits', {
          name: occ + ' · ' + season, occasion: occ,
          items: cur.map(function (p) { return p.id; }),
          names: cur.map(function (p) { return p.name; }),
          cover: (cur[0].photos || [])[0] || ''
        });
        App.toast('搭配已保存', 'ok'); hh.close(); App.renderModule(App.current);
      }
    });
    function paint() {
      cur = buildOutfit(occ, season);
      box.innerHTML =
        '<div class="tabs" id="occ-tabs">' + OCCASIONS.map(function (o) {
          return '<button class="tab' + (o === occ ? ' on' : '') + '" data-o="' + o + '">' + o + '</button>';
        }).join('') + '</div>' +
        '<div class="seg" style="margin-bottom:14px" id="sea-seg">' + SEASONS.slice(0, 4).map(function (s) {
          return '<button class="' + (s === season ? 'on' : '') + '" data-s="' + s + '">' + s + '</button>';
        }).join('') + '</div>' +
        outfitHTML(cur, bmiTip()) +
        '<div style="text-align:center;margin-top:12px"><button class="btn accent" id="reroll">' + App.icon('star', 'ico') + '换一套</button></div>';
      box.querySelector('#occ-tabs').onclick = function (e) {
        var b = e.target.closest('[data-o]'); if (!b) return; occ = b.dataset.o; paint();
      };
      box.querySelector('#sea-seg').onclick = function (e) {
        var b = e.target.closest('[data-s]'); if (!b) return; season = b.dataset.s; paint();
      };
      box.querySelector('#reroll').onclick = function () { paint(); };
    }
  }

  function openProfile() {
    var p = App.profile();
    App.form({
      title: '我的身材数据', fields: [
        { key: 'height', label: '身高（cm）', type: 'number' },
        { key: 'weight', label: '体重（kg）', type: 'number', step: '0.1' },
        { key: 'style', label: '偏好风格', type: 'select', options: ['简约', '甜美', '通勤', '休闲', '复古', '运动'] },
        { key: 'avoid', label: '避雷单品/颜色', type: 'text', full: true, placeholder: '例如：荧光色、超短裙' }
      ],
      value: p,
      onSubmit: function (v) { App.saveProfile(v); App.toast('已保存身材数据', 'ok'); if (App.current) App.renderModule(App.current); }
    });
  }

  function outfitsExtra(all, ctx) {
    var list = Store.list('outfits');
    if (!list.length) return '';
    return '<div class="panel"><h3>' + App.icon('star') + '我的搭配（' + list.length + '）</h3><div class="mini-cards">' +
      list.map(function (o) {
        return '<div class="mini-card" data-oid="' + o.id + '">' +
          (o.cover ? '<img src="' + o.cover + '" style="width:100%;height:78px;object-fit:cover;border-radius:8px;margin-bottom:6px">' : '') +
          '<div class="n">' + esc(o.name) + '</div><div class="d">' + esc(o.names.join(' + ')) + '</div>' +
          '<div style="margin-top:6px;display:flex;gap:4px;justify-content:flex-end"><button class="icon-btn danger" data-odel="' + o.id + '">' + App.icon('trash') + '</button></div></div>';
      }).join('') + '</div></div>';
  }

  App.registerModule({
    id: 'wardrobe', name: '电子衣橱', icon: 'shirt', store: 'wardrobe',
    desc: '按分类归档每一件衣服配饰，按场合一键生成搭配',
    titleKey: 'name', imageKey: 'photos', groupBy: 'category', wide: false,
    toolbar: [
      { label: '智能搭配', icon: 'star', onClick: openOutfit },
      { label: '身材数据', icon: 'gear', onClick: openProfile }
    ],
    fields: [
      { key: 'name', label: '单品名称', required: true, placeholder: '如：白色法式衬衫' },
      { key: 'category', label: '分类', type: 'select', options: CATS, required: true },
      { key: 'photos', label: '照片', type: 'images', max: 5, full: true },
      { key: 'color', label: '颜色' },
      { key: 'size', label: '尺码' },
      { key: 'brand', label: '品牌' },
      { key: 'season', label: '季节', type: 'chips', options: SEASONS, full: true },
      { key: 'occasions', label: '适用场合', type: 'chips', options: OCCASIONS, full: true },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'buyDate', label: '购入日期', type: 'date' },
      { key: 'status', label: '状态', type: 'select', options: ['在穿', '闲置', '洗涤中', '已出'] },
      { key: 'favorite', label: '最爱单品', type: 'switch' },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { status: '在穿', season: ['四季'], occasions: ['休闲'] },
    stats: function (items) {
      var idle = items.filter(function (i) { return i.status === '闲置'; }).length;
      var fav = items.filter(function (i) { return i.favorite; }).length;
      return [
        { label: '单品总数', value: items.length, sub: '件' },
        { label: '分类数', value: new Set(items.map(function (i) { return i.category; }).filter(Boolean)).size, sub: '类' },
        { label: '闲置待处理', value: idle, sub: idle ? '考虑流转或改造' : '衣橱很清爽', cls: idle ? 'warn' : 'good' },
        { label: '最爱单品', value: fav, sub: '件' }
      ];
    },
    extra: outfitsExtra,
    onExtra: function (root, ctx) {
      App.util.$$('[data-odel]', root).forEach(function (b) {
        b.onclick = function (e) {
          e.stopPropagation(); Store.remove('outfits', b.dataset.odel); App.toast('已删除搭配', 'ok'); ctx.renderList();
        };
      });
    },
    badges: ['category', 'color'],
    lines: [
      ['季节', function (it) { return (it.season || []).join('/') || '-'; }],
      ['场合', function (it) { return (it.occasions || []).map(function (o) { return '<span class="chip">' + esc(o) + '</span>'; }).join('') || '-'; }],
      ['价格', function (it) { return it.price ? U.money(it.price) : '-'; }]
    ],
    foot: function (it) {
      return '<span class="chip ' + (it.status === '闲置' ? 'danger' : 'brand') + '">' + esc(it.status || '在穿') + '</span>' +
        (it.favorite ? '<span class="chip accent">♥ 最爱</span>' : '') + '<span style="margin-left:auto">' + (it.buyDate || '') + '</span>';
    }
  });
})();
