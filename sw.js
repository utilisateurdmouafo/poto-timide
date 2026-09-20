const CACHE_NAME = "poto-timide-app-v46";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/",
        "/index.html",
        "/assets/icons/icon-192.png",
        "/assets/icons/icon-512.png",
        "/assets/icons/apple-touch-icon.png",
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const fallback = await caches.match("/index.html");
      if (fallback) return fallback;
    }
    throw err;
  }
}

function buildDeepLinkUrl(data) {
  const origin = self.location.origin;
  const params = new URLSearchParams();
  if (data.tab) params.set("tab", data.tab);
  if (data.admin) params.set("admin", data.admin);
  if (data.loanId) params.set("loan", data.loanId);
  if (data.item) params.set("item", data.item);
  const qs = params.toString();
  if (data.url && typeof data.url === "string" && data.url.startsWith("http")) {
    return data.url;
  }
  if (data.url && typeof data.url === "string" && data.url.startsWith("/")) {
    return origin + data.url;
  }
  return qs ? `${origin}/?${qs}` : `${origin}/?tab=prets`;
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const tab = data.tab || "prets";
  const admin = data.admin || "";
  const loanId = data.loanId || "";
  const item = data.item || "";
  const url = buildDeepLinkUrl({
    url: data.url,
    tab,
    admin,
    loanId,
    item,
  });

  const title = data.title || "Poto Timide";
  const options = {
    body: data.body || "Nouvelle notification",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/icon-192.png",
    lang: "fr",
    tag: data.tag || "poto-timide",
    renotify: true,
    vibrate: [140, 80, 140],
    data: {
      url,
      tab,
      admin,
      loanId,
      item,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = buildDeepLinkUrl(data);
  const message = {
    type: "OPEN_NOTIFICATION",
    tab: data.tab || "prets",
    admin: data.admin || "",
    loanId: data.loanId || "",
    item: data.item || "",
    url: targetUrl,
  };

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        try {
          if (!client.url || !client.url.startsWith(self.location.origin)) continue;
          if (typeof client.navigate === "function") {
            try {
              await client.navigate(targetUrl);
            } catch {
              /* navigate pas toujours dispo */
            }
          }
          if ("focus" in client) await client.focus();
          client.postMessage(message);
          return;
        } catch {
          /* client suivant */
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});
