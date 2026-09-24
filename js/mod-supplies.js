/* ===== 2. 生活消耗 / 3. 赏味期限 / 13. 药品记录 ===== */
(function () {
  var App = window.App, Store = App.Store, U = App.util, esc = U.esc;

  /* ---------- 2. 生活消耗 ---------- */
  function supplyState(it) {
    var stock = Number(it.stock || 0), th = Number(it.threshold || 0), mu = Number(it.monthly || 0);
    var days = mu > 0 ? Math.round(stock / mu * 30) : null;
    if (th > 0 && stock <= th) return { t: '需要补货', cls: 'danger', days: days };
    if (days != null && days > 180) return { t: '囤货偏多', cls: 'accent', days: days };
    if (days != null && days <= 30) return { t: '即将见底', cls: 'accent', days: days };
    return { t: '库存充足', cls: 'brand', days: days };
  }

  App.registerModule({
    id: 'supplies', name: '生活消耗', icon: 'box', store: 'supplies',
    desc: '记录囤货与月均消耗，自动提醒补货与过度囤货',
    titleKey: 'name', imageKey: 'photos',
    fields: [
      { key: 'name', label: '物品名称', required: true, placeholder: '如：抽纸、洗衣液、袜子' },
      { key: 'category', label: '分类', type: 'select', options: ['纸品', '清洁', '洗护', '美妆护肤', '食品饮料', '衣物', '宠物', '厨房', '文具', '其它'], required: true },
      { key: 'photos', label: '照片', type: 'images', max: 3, full: true },
      { key: 'stock', label: '当前库存', type: 'number', required: true },
      { key: 'unit', label: '单位', placeholder: '包 / 瓶 / 卷 / 双' },
      { key: 'monthly', label: '月均消耗量', type: 'number', hint: '填了才能估算还能用多久' },
      { key: 'threshold', label: '补货警戒线', type: 'number', hint: '低于此数量提醒补货' },
      { key: 'price', label: '单价', type: 'number' },
      { key: 'location', label: '存放位置', placeholder: '如：阳台储物柜' },
      { key: 'channel', label: '购买渠道', type: 'select', options: ['超市', '电商', '便利店', '直播间', '代购', '其它'] },
      { key: 'lastBuy', label: '上次购买', type: 'date' },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { stock: 1, unit: '件' },
    stats: function (items) {
      var need = items.filter(function (i) { return supplyState(i).t === '需要补货'; }).length;
      var over = items.filter(function (i) { return supplyState(i).t === '囤货偏多'; }).length;
      var value = items.reduce(function (s, i) { return s + (Number(i.price) || 0) * (Number(i.stock) || 0); }, 0);
      return [
        { label: '在管品类', value: items.length, sub: '种囤货' },
        { label: '需要补货', value: need, sub: need ? '记得加购物车' : '暂时不缺', cls: need ? 'warn' : 'good' },
        { label: '囤货偏多', value: over, sub: over ? '先别买了' : '很克制', cls: over ? 'hot' : 'good' },
        { label: '库存估值', value: U.money(value), sub: '按单价 × 库存' }
      ];
    },
    sort: function (a, b) {
      var sa = supplyState(a), sb = supplyState(b);
      var oa = ['需要补货', '即将见底', '库存充足', '囤货偏多'].indexOf(sa.t);
      var ob = ['需要补货', '即将见底', '库存充足', '囤货偏多'].indexOf(sb.t);
      return oa - ob;
    },
    badges: ['category', 'location'],
    lines: [
      ['库存', function (it) { return '<b>' + esc(it.stock) + '</b> ' + esc(it.unit || ''); }],
      ['可用', function (it) {
        var s = supplyState(it);
        return s.days == null ? '未填月消耗' : (s.days + ' 天（约 ' + (s.days / 30).toFixed(1) + ' 个月）');
      }],
      ['警戒', function (it) { return it.threshold ? it.threshold + (it.unit || '') : '-'; }]
    ],
    foot: function (it) {
      var s = supplyState(it);
      return '<span class="chip ' + s.cls + '">' + s.t + '</span><span style="margin-left:auto">' + (it.channel || '') + '</span>';
    }
  });

  /* ---------- 3. 赏味期限 ---------- */
  function expireOf(it) {
    var d = it.expireDate;
    if (!d && it.productionDate && it.shelfLife) d = U.addMonths(it.productionDate, Number(it.shelfLife));
    var openD = null;
    if (it.openDate && it.pao) openD = U.addMonths(it.openDate, Number(it.pao));
    if (openD && (!d || openD < d)) d = openD;
    return d || null;
  }
  function leftOf(it) { var d = expireOf(it); return d ? U.diffDays(U.today(), d) : null; }
  App.expireOf = expireOf;
  App.leftOf = leftOf;

  App.registerModule({
    id: 'expiry', name: '赏味期限', icon: 'clock', store: 'expiry',
    desc: '护肤品、美妆、食品、小样的保质期倒计时',
    titleKey: 'name', imageKey: 'photos',
    fields: [
      { key: 'name', label: '物品名称', required: true, placeholder: '如：小棕瓶小样' },
      { key: 'category', label: '分类', type: 'select', options: ['护肤', '美妆', '食品', '保健', '药品', '小样', '其它'], required: true },
      { key: 'brand', label: '品牌' },
      { key: 'photos', label: '照片', type: 'images', max: 3, full: true },
      { key: 'productionDate', label: '生产日期', type: 'date' },
      { key: 'shelfLife', label: '保质期（月）', type: 'number' },
      { key: 'expireDate', label: '到期日', type: 'date', hint: '直接填到期日时优先使用' },
      { key: 'openDate', label: '开封日期', type: 'date' },
      { key: 'pao', label: '开封后保质期（月）', type: 'number', hint: '包装上的 6M / 12M 标识' },
      { key: 'quantity', label: '数量', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: ['未开封', '使用中', '已用完', '已丢弃'] },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { status: '未开封', quantity: 1 },
    stats: function (items) {
      var live = items.filter(function (i) { return i.status !== '已用完' && i.status !== '已丢弃'; });
      var urgent = live.filter(function (i) { var l = leftOf(i); return l != null && l <= 30; }).length;
      var over = live.filter(function (i) { var l = leftOf(i); return l != null && l < 0; }).length;
      var mini = items.filter(function (i) { return i.category === '小样'; }).length;
      return [
        { label: '在管物品', value: live.length, sub: '件' },
        { label: '30天内到期', value: urgent, sub: urgent ? '抓紧用' : '很安心', cls: urgent ? 'warn' : 'good' },
        { label: '已过期', value: over, sub: over ? '建议清理' : '没有过期品', cls: over ? 'warn' : 'good' },
        { label: '小样数量', value: mini, sub: '件' }
      ];
    },
    sort: function (a, b) {
      var x = leftOf(a), y = leftOf(b);
      if (x == null) return 1; if (y == null) return -1;
      return x - y;
    },
    groupBy: 'category',
    badges: ['category', 'brand'],
    lines: [
      ['到期日', function (it) { return expireOf(it) || '未填写'; }],
      ['生产', function (it) { return it.productionDate ? it.productionDate + (it.shelfLife ? '（保 ' + it.shelfLife + ' 个月）' : '') : '-'; }],
      ['开封', function (it) { return it.openDate ? it.openDate + (it.pao ? '（开后 ' + it.pao + ' 个月）' : '') : '未开封'; }]
    ],
    foot: function (it) {
      var l = leftOf(it);
      var chip = '-';
      if (l == null) chip = '<span class="chip">未设期限</span>';
      else if (l < 0) chip = '<span class="chip danger">已过期 ' + (-l) + ' 天</span>';
      else if (l <= 30) chip = '<span class="chip danger">剩 ' + l + ' 天</span>';
      else if (l <= 90) chip = '<span class="chip accent">剩 ' + l + ' 天</span>';
      else chip = '<span class="chip brand">剩 ' + l + ' 天</span>';
      return chip + '<span style="margin-left:auto">' + esc(it.status || '') + '</span>';
    }
  });

  /* ---------- 13. 药品记录 ---------- */
  function medLeft(it) { return it.expireDate ? U.diffDays(U.today(), it.expireDate) : null; }

  App.registerModule({
    id: 'medicine', name: '药品记录', icon: 'pill', store: 'medicine',
    desc: '药品用途、给谁买的、剩余量、价格与渠道一目了然',
    titleKey: 'name', imageKey: 'photos', view: 'table',
    fields: [
      { key: 'name', label: '药品名称', required: true },
      { key: 'usage', label: '用途 / 主治', required: true, placeholder: '如：感冒发热、肠胃不适' },
      { key: 'forWhom', label: '给谁买的', required: true, placeholder: '自己 / 家人 / 宠物' },
      { key: 'photos', label: '照片', type: 'images', max: 3, full: true },
      { key: 'spec', label: '规格', placeholder: '如：0.1g×24粒' },
      { key: 'remaining', label: '剩余量', type: 'number' },
      { key: 'unit', label: '单位', placeholder: '粒 / 袋 / ml' },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'channel', label: '购买渠道', type: 'select', options: ['药店', '医院', '线上平台', '超市', '海淘', '朋友代买', '其它'] },
      { key: 'buyDate', label: '购买日期', type: 'date' },
      { key: 'expireDate', label: '有效期至', type: 'date' },
      { key: 'dosage', label: '用法用量' },
      { key: 'taboo', label: '禁忌 / 注意', type: 'textarea', full: true },
      { key: 'note', label: '备注', type: 'textarea', full: true }
    ],
    defaults: { unit: '盒' },
    stats: function (items) {
      var soon = items.filter(function (i) { var l = medLeft(i); return l != null && l >= 0 && l <= 90; }).length;
      var over = items.filter(function (i) { var l = medLeft(i); return l != null && l < 0; }).length;
      var sum = items.reduce(function (s, i) { return s + (Number(i.price) || 0); }, 0);
      return [
        { label: '药品种类', value: items.length, sub: '种' },
        { label: '90天内过期', value: soon, sub: soon ? '注意更换' : '都在有效期内', cls: soon ? 'warn' : 'good' },
        { label: '已过期', value: over, sub: over ? '建议清理' : '无', cls: over ? 'warn' : 'good' },
        { label: '药品花费', value: U.money(sum), sub: '累计' }
      ];
    },
    sort: function (a, b) {
      var x = medLeft(a), y = medLeft(b);
      if (x == null) return 1; if (y == null) return -1; return x - y;
    },
    columns: [
      { label: '药品', key: 'photos', img: true, f: function (it) { return '<b>' + esc(it.name) + '</b>'; } },
      { label: '用途', key: 'usage' },
      { label: '给谁', key: 'forWhom' },
      { label: '剩余', f: function (it) { return (it.remaining == null ? '-' : it.remaining + ' ' + esc(it.unit || '')); } },
      { label: '价格', f: function (it) { return U.money(it.price); } },
      { label: '渠道', key: 'channel' },
      {
        label: '有效期', f: function (it) {
          var l = medLeft(it);
          if (l == null) return '-';
          var c = l < 0 ? 'danger' : l <= 90 ? 'accent' : 'brand';
          return esc(it.expireDate) + ' <span class="chip ' + c + '">' + (l < 0 ? '过期' + (-l) + '天' : '剩' + l + '天') + '</span>';
        }
      }
    ]
  });
})();
