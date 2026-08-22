# Poto Timide

Application de gestion du groupe **Potos Timides** (membres, tournée, amendes, prêts, événements, finance).

Prod : https://poto-timide.onrender.com

## Stack

- Node.js + Express
- Sessions (`express-session`) + bcrypt
- SQLite locale via `@libsql/client` (ou Turso en prod)
- Frontend vanilla : `index.html`, `app.js`, `api-client.js`, `styles.css`

## Démarrage local

```bash
cd "C:\Users\dmoua\OneDrive\Documents\03 - Projets professionnels\poto-timide"
npm install
npm start
```

Ouvrir : **http://localhost:8080**

### Connexion (dev local)

- Identifiant = **nom du membre** (ex. `Dario`)
- Mot de passe : **1234** (réinitialisé en local)

## Structure

```
poto-timide/
├── server.js
├── index.html / app.js / api-client.js / styles.css
├── package.json
├── render.yaml
├── finance-vitran.json
├── lib/db.js, lib/load-env.js
└── data/backup-latest.json + poto-timide.db
```

## Variables (.env)

```
PORT=8080
NODE_ENV=development
SESSION_SECRET=poto-local-dev-secret
POTO_OWNER_NAME=Dario
```