const CACHE_NAME = "us-market-dashboard-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./usmarketicon-192.png",
  "./usmarketicon512.png"
];

// 安装：缓存 App 的基本文件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// 激活：删除旧版本缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// 请求处理
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // data.json 永远优先读取最新网络数据
  if (url.pathname.endsWith("/data.json")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 其他 App 文件：优先网络，失败时使用缓存
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});