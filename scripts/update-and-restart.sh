#!/bin/bash
# À lancer SUR le serveur Hetzner, dans le dossier du projet
set -e
echo "==> Mise à jour git"
git fetch origin
git checkout main
git pull origin main
echo "==> npm install"
npm install --omit=dev
echo "==> Redémarrage"
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart poto-timide 2>/dev/null || pm2 restart all 2>/dev/null || pm2 start server.js --name poto-timide
  pm2 save || true
  pm2 list
elif command -v docker >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
  docker compose up -d --build
else
  echo "Lance manuellement: node server.js  (ou configure pm2)"
  pkill -f "node server.js" 2>/dev/null || true
  nohup node server.js > /tmp/poto-timide.log 2>&1 &
  echo "PID $! — logs: /tmp/poto-timide.log"
fi
echo "==> Test local"
sleep 2
curl -sI "http://127.0.0.1:${PORT:-8080}" | head -5 || curl -sI "http://127.0.0.1:3000" | head -5 || true
echo "OK — teste https://pototimide.com"
