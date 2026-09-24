/* 大乐透happy life · Service Worker
   离线可用：所有静态资源缓存到本地，断网也能打开 */
var CACHE = 'jwlife-v8';
var ASSETS = [
  './', './index.html',
  './css/style.css',
  './js/lunar.js', './js/core.js',
  './js/mod-wardrobe.js', './js/mod-supplies.js', './js/mod-travel.js',
  './js/mod-festival.js', './js/mod-health.js', './js/mod-notes.js', './js/mod-love.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-1024.png',
  './icons/icon-maskable-1024.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (u) {
      return c.add(u).catch(function () { });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 页面导航：优先网络，断网时用缓存的首页
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(function () {
      return caches.match('./index.html').then(function (r) { return r || caches.match('./'); });
    }));
    return;
  }
  // 静态资源：先给缓存，同时后台更新
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
