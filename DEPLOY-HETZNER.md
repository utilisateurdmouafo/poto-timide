# Déployer Poto Timide sur Hetzner (après restauration d'image)

L'image restaurée = **ancienne** version du code.
Les dernières mods sont sur GitHub (`main`). Il faut **mettre à jour + redémarrer**.

## 1. Console Hetzner

1. https://console.hetzner.com → serveur **ubuntu-4gb-fsn1-1**
2. **Console** (terminal dans le navigateur)
3. Login : `root` + ton mot de passe

## 2. Mettre à jour le code

```bash
# Trouver le dossier du projet
find /root /home /var/www /opt -name "server.js" 2>/dev/null | head -20

# Aller dans le dossier (exemple — adapte le chemin trouvé)
cd /root/poto-timide
# ou : cd /var/www/poto-timide

git status
git remote -v
git fetch origin
git checkout main
git pull origin main

npm install --omit=dev
```

Si `git pull` demande un token GitHub, utilise un **Personal Access Token** (pas le mot de passe GitHub).

## 3. Variables d'environnement (important pour Turso)

```bash
# Voir si un .env existe
ls -la .env
cat .env
```

Le fichier `.env` doit contenir au minimum :

```
PORT=8080
NODE_ENV=production
SESSION_SECRET=...ton-secret...
POTO_OWNER_NAME=Dario
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Sans Turso, le serveur utilise SQLite **local** (données de l'image restaurée, pas forcément les dernières du cloud).

## 4. Redémarrer l'application

```bash
# PM2 ?
pm2 list
pm2 restart all
# ou premier démarrage :
pm2 start server.js --name poto-timide
pm2 save

# Docker ?
docker ps -a
docker compose up -d --build

# Systemd ?
systemctl restart poto-timide
# ou
systemctl restart caddy
```

Vérifier que Node écoute :

```bash
ss -tlnp | grep -E '8080|3000'
curl -sI http://127.0.0.1:8080 | head
```

Puis Caddy :

```bash
systemctl status caddy --no-pager
systemctl reload caddy
```

## 5. Test

1. https://pototimide.com → Ctrl+F5
2. Connexion Dario
3. Enregistrer une petite modif (ex. amende test)

Si toujours « serveur pas prêt » : l'app Node n'écoute pas encore sur le port que Caddy reverse-proxy.

## 6. Lire la config Caddy

```bash
cat /etc/caddy/Caddyfile
# ou
ls /etc/caddy/
```

Le reverse_proxy doit pointer vers `127.0.0.1:8080` (ou le PORT du .env).

---

**Secours :** https://poto-timide.onrender.com (si Turso est configuré sur Render, les données cloud y sont).
