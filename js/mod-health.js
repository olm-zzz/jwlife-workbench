/* ===== 7. 身体倍棒 / 10. 宠物成长记录 ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;

  /* ---------- 7. 身体倍棒 ---------- */
  var TYPES = ['泡脚', '跑步', '健身', '瑜伽', '骑行', '游泳', '散步', '拉伸', '冥想', '早睡', '喝水', '其它'];

  function streak(list, type) {
    var days = {};
    list.forEach(function (i) { if (!type || i.type === type) days[i.date] = 1; });
    var n = 0, d = new Date();
    if (!days[U.today(d)]) d.setDate(d.getDate() - 1);
    while (days[U.today(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function heatExtra(all) {
    var days = {};
    all.forEach(function (i) { days[i.date] = (days[i.date] || 0) + 1; });
    var cells = '';
    for (var k = 29; k >= 0; k--) {
      var d = U.today(new Date(Date.now() - k * 86400000));
      var c = days[d] || 0;
      var bg = c === 0 ? 'var(--line2)' : c === 1 ? 'var(--brand2)' : c === 2 ? 'var(--brand)' : 'var(--accent)';
      cells += '<div title="' + d + '：' + c + ' 次" style="flex:1;aspect-ratio:1;border-radius:5px;background:' + bg + '"></div>';
    }
    return '<div class="panel"><h3>' + App.icon('run') + '最近 30 天打卡热力</h3><div style="display:flex;gap:4px">' + cells + '</div>' +
      '<div class="quote" style="margin-top:8px">颜色越深，当天记录越多</div></div>';
  }

  App.registerModule({
    id: 'health', name: '身体倍棒', icon: 'run', store: 'health',
    desc: '运动、泡脚、早睡……每一次对身体好都值得记一笔',
    titleKey: 'type', imageKey: 'photos',
    fields: [
      { key: 'date', label: '日期', type: 'date', required: true },
      { key: 'type', label: '项目', type: 'select', options: TYPES, required: true },
      { key: 'duration', label: '时长（分钟）', type: 'number' },
      { key: 'amount', label: '数量 / 距离', placeholder: '如：5km / 3组' },
      { key: 'intensity', label: '强度', type: 'select', options: ['轻松', '适中', '带劲'] },
      { key: 'mood', label: '感受', type: 'select', options: ['神清气爽', '还不错', '有点累', '很勉强'] },
      { key: 'photos', label: '照片', type: 'images', max: 3, full: true },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { date: U.today(), type: '泡脚', intensity: '适中' },
    sort: function (a, b) { return (b.date || '').localeCompare(a.date || ''); },
    stats: function (items) {
      var now = new Date();
      var weekStart = U.today(new Date(now.getTime() - (now.getDay() || 7) * 86400000));
      var month = String(now.getFullYear()) + '-' + U.pad(now.getMonth() + 1);
      var wk = items.filter(function (i) { return i.date >= weekStart; }).length;
      var mo = items.filter(function (i) { return (i.date || '').indexOf(month) === 0; }).length;
      var mins = items.reduce(function (s, i) { return s + (Number(i.duration) || 0); }, 0);
      return [
        { label: '本周打卡', value: wk, sub: '次', cls: 'good' },
        { label: '本月打卡', value: mo, sub: '次' },
        { label: '连续打卡', value: streak(items), sub: '天', cls: 'hot' },
        { label: '累计时长', value: mins, sub: '分钟' }
      ];
    },
    extra: heatExtra,
    badges: ['intensity', 'mood'],
    lines: [
      ['时长', function (it) { return it.duration ? it.duration + ' 分钟' : '-'; }],
      ['数量', function (it) { return esc(it.amount || '-'); }],
      ['备注', function (it) { return esc(it.note || ''); }]
    ],
    foot: function (it) { return '<span class="chip brand">' + esc(it.date || '') + '</span>'; },
    renderCard: function (it) {
      var map = { '泡脚': '🦶', '跑步': '🏃', '健身': '🏋️', '瑜伽': '🧘', '骑行': '🚴', '游泳': '🏊', '散步': '🚶', '拉伸': '🤸', '冥想': '🧠', '早睡': '😴', '喝水': '💧' };
      return '<div class="card" data-id="' + it.id + '"><div class="card-media" style="aspect-ratio:auto;padding:16px 0;background:' +
        ((it.photos || [])[0] ? 'transparent' : 'var(--brand-soft)') + '">' +
        ((it.photos || [])[0] ? '<img src="' + it.photos[0] + '" style="width:100%;aspect-ratio:4/3;object-fit:cover">' :
          '<div style="font-size:40px;line-height:1">' + (map[it.type] || '🌿') + '</div>') +
        '</div><div class="card-body">' +
        '<div class="card-hd"><div class="card-title">' + esc(it.date) + ' · ' + esc(it.type) + '</div><div class="card-acts">' +
        '<button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
        '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>' +
        '<div class="chips">' + (it.duration ? '<span class="chip brand">' + it.duration + ' 分钟</span>' : '') +
        (it.amount ? '<span class="chip">' + esc(it.amount) + '</span>' : '') +
        (it.intensity ? '<span class="chip blue">' + esc(it.intensity) + '</span>' : '') + '</div>' +
        (it.note ? '<div class="lines"><div class="l"><span class="v">' + esc(it.note) + '</span></div></div>' : '') +
        '</div></div>';
    }
  });

  /* ---------- 10. 宠物成长记录 ---------- */
  function sparkline(weights) {
    var ws = (weights || []).slice().filter(function (w) { return w && w.kg; }).sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    if (ws.length < 2) return '';
    var vals = ws.map(function (w) { return Number(w.kg); });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var pts = vals.map(function (v, i) {
      var x = i / (vals.length - 1) * 100;
      var y = 34 - (v - min) / span * 28;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg class="spark" viewBox="0 0 100 40" preserveAspectRatio="none">' +
      '<polyline points="' + pts + '" fill="none" stroke="var(--brand)" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="100" cy="' + (34 - (vals[vals.length - 1] - min) / span * 28).toFixed(1) + '" r="2.5" fill="var(--accent)" stroke="none"/></svg>' +
      '<div class="quote">体重趋势 ' + ws[0].kg + 'kg → ' + ws[ws.length - 1].kg + 'kg</div>';
  }

  App.registerModule({
    id: 'pets', name: '宠物成长记录', icon: 'paw', store: 'pets',
    desc: '3 只小可爱的名字、体重、生日、健康与饮食习惯',
    titleKey: 'name', imageKey: 'avatar', wide: true,
    fields: [
      { key: 'name', label: '名字', required: true },
      { key: 'avatar', label: '头像 / 照片', type: 'images', max: 1, full: true },
      { key: 'species', label: '种类', type: 'select', options: ['猫', '狗', '兔子', '仓鼠', '鸟', '龟', '其它'] },
      { key: 'breed', label: '品种' },
      { key: 'gender', label: '性别', type: 'select', options: ['妹妹', '弟弟', '已绝育'] },
      { key: 'birthday', label: '生日', type: 'date' },
      { key: 'weights', label: '体重记录', type: 'sublist', full: true, subFields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'kg', label: '体重（kg）', type: 'number', step: '0.01', required: true },
        { key: 'note', label: '备注' }
      ], summary: function (w) { return (w.date || '') + '　' + w.kg + ' kg'; } },
      { key: 'health', label: '健康 & 疾病记录', type: 'sublist', full: true, subFields: [
        { key: 'date', label: '日期', type: 'date', required: true },
        { key: 'issue', label: '症状 / 疾病 / 疫苗', required: true },
        { key: 'hospital', label: '医院' },
        { key: 'treat', label: '处理方式 / 用药' },
        { key: 'cost', label: '花费', type: 'number' },
        { key: 'note', label: '医嘱 / 备注', type: 'textarea', full: true }
      ], summary: function (h) { return (h.date || '') + '　' + (h.issue || ''); } },
      { key: 'foodBrand', label: '主粮 / 主食品牌' },
      { key: 'meals', label: '每日餐次' },
      { key: 'portion', label: '每餐分量' },
      { key: 'snack', label: '零食 / 冻干' },
      { key: 'taboo', label: '忌口 / 过敏' },
      { key: 'water', label: '饮水习惯' },
      { key: 'litter', label: '如厕习惯' },
      { key: 'note', label: '性格 / 其它备注', type: 'textarea', full: true }
    ],
    defaults: { species: '猫' },
    stats: function (items) {
      var wcount = items.reduce(function (s, p) { return s + ((p.weights || []).length); }, 0);
      var issues = items.reduce(function (s, p) { return s + ((p.health || []).length); }, 0);
      var need = items.filter(function (p) {
        var ws = (p.weights || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
        return !ws.length || U.diffDays(ws[0].date, U.today()) > 90;
      }).length;
      return [
        { label: '家庭成员', value: items.length, sub: '只小可爱' },
        { label: '体重记录', value: wcount, sub: '条' },
        { label: '健康记录', value: issues, sub: '条' },
        { label: '该称体重了', value: need, sub: need ? '超过 90 天未记录' : '都记得很勤', cls: need ? 'warn' : 'good' }
      ];
    },
    renderCard: function (it) {
      var ws = (it.weights || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      var last = ws[0];
      var age = it.birthday ? U.ageOf(it.birthday) : null;
      var av = (it.avatar || [])[0];
      var health = (it.health || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
      return '<div class="card" data-id="' + it.id + '">' +
        '<div class="card-media" style="aspect-ratio:3/2">' +
        (av ? '<img src="' + av + '" style="width:100%;height:100%;object-fit:cover">' : '<span class="ph">' + App.icon('paw', '') + '</span>') +
        '</div><div class="card-body">' +
        '<div class="card-hd"><div class="card-title">' + esc(it.name) + (age ? ' <span class="chip brand">' + age.text + '</span>' : '') + '</div>' +
        '<div class="card-acts"><button class="icon-btn" data-act="edit">' + App.icon('edit') + '</button>' +
        '<button class="icon-btn danger" data-act="del">' + App.icon('trash') + '</button></div></div>' +
        '<div class="chips">' + (it.species ? '<span class="chip">' + esc(it.species) + '</span>' : '') +
        (it.breed ? '<span class="chip">' + esc(it.breed) + '</span>' : '') +
        (it.gender ? '<span class="chip purple">' + esc(it.gender) + '</span>' : '') +
        (it.birthday ? '<span class="chip blue">生日 ' + esc(it.birthday) + '</span>' : '') + '</div>' +
        '<div class="lines">' +
        '<div class="l"><span class="k">最新体重</span><span class="v">' + (last ? '<b>' + last.kg + ' kg</b>（' + esc(last.date) + '）' : '还没记录') + '</span></div>' +
        (it.foodBrand ? '<div class="l"><span class="k">主粮</span><span class="v">' + esc(it.foodBrand) + '</span></div>' : '') +
        (it.meals ? '<div class="l"><span class="k">餐次</span><span class="v">' + esc(it.meals) + (it.portion ? '，每餐 ' + esc(it.portion) : '') + '</span></div>' : '') +
        (it.taboo ? '<div class="l"><span class="k">忌口</span><span class="v">' + esc(it.taboo) + '</span></div>' : '') +
        (health[0] ? '<div class="l"><span class="k">最近健康</span><span class="v">' + esc(health[0].date) + ' ' + esc(health[0].issue) + '</span></div>' : '') +
        '</div>' + sparkline(it.weights) +
        (it.note ? '<div class="lines"><div class="l"><span class="v">' + esc(it.note) + '</span></div></div>' : '') +
        '</div></div>';
    }
  });
})();
