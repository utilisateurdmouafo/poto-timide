# Déploiement Poto Timide (modifications)

## Modifications incluses
1. **Demandes en vote** affichées en premier sur la page Prêts
2. **Tableaux** lisibles + défilement horizontal (swipe)
3. **Votes** fiables (plus de perte / re-demande de vote)

## Variables d'environnement à garder sur Render
- `NODE_ENV=production`
- `SESSION_SECRET` (déjà généré ou le tien)
- `TURSO_DATABASE_URL` (ta base Turso)
- `TURSO_AUTH_TOKEN` (ton token Turso)
- `POTO_OWNER_NAME=Dario` (ou le nom du propriétaire)
- Clés VAPID si tu utilises les notifications push

Les données (membres, prêts, etc.) restent dans **Turso** — pas besoin de les re-importer.

## Méthode A — Git (recommandé si le repo est déjà lié à Render)
1. Remplace les fichiers modifiés dans ton repo local :
   - `index.html`
   - `app.js`
   - `styles.css`
   - `api-client.js`
   - `server.js`
2. Commit + push sur la branche suivie par Render (souvent `main`)
3. Render redéploie automatiquement

## Méthode B — Dashboard Render (manuel)
1. Render → service **poto-timide**
2. Si le code vient de GitHub : pousse les fichiers (méthode A)
3. Sinon, connecte le repo ou redéploie après push
4. **Manual Deploy** → Deploy latest commit
5. Vérifie les logs : `npm install` puis `node server.js` OK
6. Ouvre https://poto-timide.onrender.com

## Après déploiement — tests rapides
1. Connexion membre
2. Onglet **Prêts** → « Demandes en vote » en haut
3. Sur téléphone : glisser horizontalement un tableau
4. Voter Oui/Non → le vote reste affiché (« Votre vote : … »)

## En cas de souci
- Logs Render → Events / Logs
- Vérifier que `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` sont bien renseignés
- Hard refresh navigateur (Ctrl+F5) ou vider le cache PWA
