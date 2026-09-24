/* 农历/阳历互转（支持 1900-2100 年） */
window.Lunar = (function () {
  var lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
    0x0d520
  ];
  var CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十'];
  var CN_MONTH = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];

  function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
  function leapDays(y) { if (leapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29; return 0; }
  function monthDays(y, m) { return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
  function yearDays(y) {
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
    return sum + leapDays(y);
  }
  function cnDay(d) {
    if (d === 10) return '初十';
    if (d === 20) return '二十';
    if (d === 30) return '三十';
    var head = ['初','十','廿','三'][Math.floor(d / 10)];
    return head + CN_NUM[d % 10];
  }
  function parse(str) {
    var p = String(str).split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function fmt(dt) {
    var m = dt.getMonth() + 1, d = dt.getDate();
    return dt.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  }

  /* 阳历 -> 农历 */
  function solar2lunar(y, m, d) {
    if (y < 1900 || y > 2100) return null;
    var base = Date.UTC(1900, 0, 31);
    var objDate = Date.UTC(y, m - 1, d);
    var offset = Math.floor((objDate - base) / 86400000);
    var i, temp = 0, ly = 1900;
    for (i = 1900; i < 2101 && offset > 0; i++) { temp = yearDays(i); offset -= temp; }
    if (offset < 0) { offset += temp; i--; }
    ly = i;
    var isLeap = false, lm = 1;
    var leap = leapMonth(ly);
    for (i = 1; i < 13 && offset >= 0; i++) {
      if (leap > 0 && i === leap + 1 && !isLeap) { --i; isLeap = true; temp = leapDays(ly); }
      else temp = monthDays(ly, i);
      if (isLeap && i === leap + 1) isLeap = false;
      offset -= temp;
      if (!isLeap) lm++;
    }
    if (offset === 0 && leap > 0 && i === leap + 1) { if (isLeap) { isLeap = false; } else { isLeap = true; --i; } }
    if (offset < 0) { offset += temp; --i; --lm; }
    lm = i;
    var ld = offset + 1;
    return { lYear: ly, lMonth: lm, lDay: ld, isLeap: isLeap, monthCn: (isLeap ? '闰' : '') + CN_MONTH[lm - 1] + '月', dayCn: cnDay(ld) };
  }

  /* 农历 -> 阳历 */
  function lunar2solar(y, m, d, isLeap) {
    isLeap = !!isLeap;
    if (y < 1900 || y > 2100) return null;
    var leap = leapMonth(y), day = 0, temp = 0, i;
    if (isLeap && leap !== m) return null;
    if (m < 1 || m > 12) return null;
    var mdays = monthDays(y, m);
    if (d > mdays) d = mdays; // 如除夕（腊月廿九）容错
    for (i = 1; i < m; i++) {
      temp = monthDays(y, i);
      day += temp;
    }
    if (isLeap) day += monthDays(y, m);
    day += d - 1;
    for (i = 1900; i < y; i++) day += yearDays(i);
    var base = Date.UTC(1900, 0, 31);
    var dt = new Date(base + day * 86400000);
    return fmt(new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
  }

  return {
    solar2lunar: function (str) { var d = parse(str); return solar2lunar(d.getFullYear(), d.getMonth() + 1, d.getDate()); },
    lunar2solar: lunar2solar,
    /* 求某个农历月日，在给定阳历年份附近对应的阳历日期（返回该年或其前后最近的一次） */
    lunarDayInSolarYear: function (lm, ld, solarYear) {
      var c1 = lunar2solar(solarYear, lm, ld, false);
      var c2 = lunar2solar(solarYear + 1, lm, ld, false);
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var cands = [c1, c2].filter(Boolean).map(function (s) { return parse(s); }).sort(function (a, b) { return a - b; });
      for (var i = 0; i < cands.length; i++) if (cands[i] >= today) return fmt(cands[i]);
      return cands.length ? fmt(cands[cands.length - 1]) : null;
    },
    /* 该年是否有闰月及闰几月 */
    leapMonth: leapMonth
  };
})();
