const crypto = require("crypto");
const webpush = require("web-push");
const db = require("./db");

const VAPID_STORE_KEY = "poto-timide-vapid";
let cachedKeys = null;

async function ensureVapidKeys() {
  if (cachedKeys) return cachedKeys;

  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    cachedKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  } else {
    const row = await db.get("SELECT value FROM app_data WHERE key = ?", [VAPID_STORE_KEY]);
    if (row?.value) {
      cachedKeys = JSON.parse(row.value);
    } else {
      cachedKeys = webpush.generateVAPIDKeys();
      await db.run(
        "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        [VAPID_STORE_KEY, JSON.stringify(cachedKeys)]
      );
    }
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:poto-timide@onrender.com",
    cachedKeys.publicKey,
    cachedKeys.privateKey
  );
  return cachedKeys;
}

async function saveSubscription(userId, subscription) {
  const endpoint = String(subscription?.endpoint || "").trim();
  const p256dh = String(subscription?.keys?.p256dh || "").trim();
  const auth = String(subscription?.keys?.auth || "").trim();
  if (!userId || !endpoint || !p256dh || !auth) {
    throw new Error("Abonnement push incomplet");
  }

  const existing = await db.get("SELECT id FROM push_subscriptions WHERE endpoint = ?", [endpoint]);
  if (existing?.id) {
    await db.run(
      "UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ? WHERE id = ?",
      [userId, p256dh, auth, existing.id]
    );
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.run(
    "INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?, ?)",
    [id, userId, endpoint, p256dh, auth]
  );
  return id;
}

async function deleteSubscription(userId, endpoint) {
  if (endpoint) {
    await db.run("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?", [
      endpoint,
      userId,
    ]);
    return;
  }
  await db.run("DELETE FROM push_subscriptions WHERE user_id = ?", [userId]);
}

async function sendToUserIds(userIds, payload) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  if (!ids.length) return { sent: 0 };

  await ensureVapidKeys();
  const placeholders = ids.map(() => "?").join(",");
  const rows = await db.all(
    `SELECT id, user_id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id IN (${placeholders})`,
    ids
  );

  const body = JSON.stringify(payload);
  let sent = 0;

  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          body,
          { TTL: 60 * 60 * 24 }
        );
        sent += 1;
      } catch (err) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          await db.run("DELETE FROM push_subscriptions WHERE id = ?", [row.id]);
        } else {
          console.warn("Push échoué:", status || err.message);
        }
      }
    })
  );

  return { sent };
}

async function replaceVapidKeys(keys) {
  if (!keys?.publicKey || !keys?.privateKey) return false;
  cachedKeys = {
    publicKey: String(keys.publicKey),
    privateKey: String(keys.privateKey),
  };
  await db.run(
    "INSERT INTO app_data (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')",
    [VAPID_STORE_KEY, JSON.stringify(cachedKeys)]
  );
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:poto-timide@onrender.com",
    cachedKeys.publicKey,
    cachedKeys.privateKey
  );
  return true;
}

module.exports = {
  VAPID_STORE_KEY,
  ensureVapidKeys,
  replaceVapidKeys,
  saveSubscription,
  deleteSubscription,
  sendToUserIds,
};
