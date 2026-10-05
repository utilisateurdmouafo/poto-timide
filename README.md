# Poto Timide

Application de gestion du groupe **Potos Timides** (membres, tournée, amendes, prêts, événements, finance).

Prod : https://poto-timide.onrender.com

## Stack

- Node.js + Express
- Sessions (`express-session`) + bcrypt
- SQLite locale via `@libsql/client` (ou Turso en prod)
- Temps réel : Socket.IO, avec l'API REST et SSE conservées pour compatibilité
- Entrée frontend : React + Vite + Tailwind
- La coque React monte actuellement le DOM et les scripts de `legacy.html` dans la page principale (sans iframe), afin de conserver l'interface et les parcours pendant le remplacement progressif des vues impératives par des composants React
- Interface et règles métier historiques en cours de conversion : `legacy.html`, les modules `js/` et `styles.css`

Les opérations principales de prêts (demande, vote, décision, remboursement,
annulation, suppression et changement de date) ainsi que celles des amendes
courantes (ajout individuel ou collectif, modification, ajustement du solde,
versement, annulation et suppression) passent par `POST /api/actions`. La
conversion du reste de fond annuel en dettes est également calculée et écrite
par cette API. Le serveur contrôle les droits et les montants, écrit les données,
puis émet l’événement Socket.IO. Les votes expirés sont également
avancés côté serveur. Le worker serveur calcule aussi les échéances, remboursements
du capital, intérêts et sanctions des prêts ; ces changements sont persistés
avant leur diffusion temps réel, et les sanctions déclenchent également le push
du membre concerné. La suppression d’un membre et la purge de ses références
(tournée, prêts, amendes, événements, notifications et comptes) sont également
calculées côté serveur par une action métier dédiée. L’ancienne API
`PUT /api/data` vérifie désormais les droits par rubrique et les mutations de
prêts/encaissements, amendes courantes, mouvements de caisse, fond de caisse de
départ, créances hors groupe, dettes d’ancienne tournée et fond annuel ne
peuvent plus contourner leurs actions métier. Les remboursements d’ancienne
tournée actualisent aussi le registre de caisse dans la même action serveur.
Les autres rubriques utilisent encore cette API de synchronisation avec des
contrôles par rôle et restent à migrer vers des actions métier dédiées.

## Démarrage local

```bash
cd "C:\Users\dmoua\OneDrive\Documents\03 - Projets professionnels\poto-timide"
npm install
npm start
```

Ouvrir : **http://localhost:8080**

### Frontend React

Dans un second terminal, démarrer le frontend React :

```bash
npm run dev:react
```

Ouvrir **http://localhost:5173**. Le serveur Express doit rester démarré sur le
port 8080. La vue historique est montée dans le document principal par React et
utilise la même session, la même base et le canal Socket.IO. Après build,
Express sert le bundle React à la racine et conserve `legacy.html` comme source
de compatibilité temporaire. Les écrans et traitements n'ont pas encore tous
été réécrits en composants React et actions métier serveur.

Pour vérifier le bundle React/Vite/Tailwind :

```bash
npm run build:react
npm test
```

Vite 8 nécessite Node.js 20.19 ou supérieur pour le frontend ; le serveur
reste compatible avec Node.js 18 ou supérieur. Render et Docker construisent
le frontend lors du déploiement.

### Connexion (dev local)

- Identifiant = **nom du membre** (ex. `Dario`)
- Mot de passe : **1234** (réinitialisé en local)

## Structure

```
poto-timide/
├── server.js
├── frontend/               # React, Vite et Tailwind
├── legacy.html / api-client.js / styles.css
├── package.json
├── render.yaml
├── finance-vitran.json
├── lib/db.js, lib/load-env.js
└── data/backup-latest.json + poto-timide.db
```

## Variables (.env)

```
PORT=8080
POTO_DATA_DIR=
NODE_ENV=development
SESSION_SECRET=poto-local-dev-secret
POTO_OWNER_NAME=Dario
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

`POTO_DATA_DIR` est facultatif ; il permet de placer la base SQLite locale et
ses sauvegardes dans un répertoire séparé.

## Base de données et changement d'hébergeur

Les données du groupe (membres, cotisations, tournée, amendes, prêts, communication, comptes, notifications) sont dans **Turso** en production, pas sur le disque de Render.

Pour publier le site sur un domaine / un autre hébergeur :

1. Déployer le même code.
2. Reprendre les variables `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET` (et les clés VAPID si elles sont dans l'environnement).
3. Tout le contenu est déjà dans la base.

Admin > **Sauvegarde** permet aussi de télécharger un fichier JSON complet (données + comptes) et de le restaurer sur un nouveau serveur.