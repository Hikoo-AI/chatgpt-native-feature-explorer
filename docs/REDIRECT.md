# Origine de la redirection : résultat observé

Le test `npm run test:redirect` a comparé les deux chemins sans modifier leur
réponse, avec cache désactivé et Service Worker contourné dans l'onglet dédié.

| Parcours | Réponse observée | Résultat |
|---|---|---|
| Document `/business-hub`, JavaScript désactivé | HTTP 302, Location `/` | Accueil |
| Document `/business-hub/{profil fictif}/insights`, JavaScript désactivé | HTTP 302, Location `/` | Accueil |
| Routeur natif vers `/business-hub` | `/business-hub.data`, HTTP 202 ; contrôle décodé : destination `/`, statut 302 | Accueil |
| Routeur natif vers le chemin Insights du profil fictif | `…/insights.data`, HTTP 202 ; même contrôle de redirection | Accueil |

Les réponses `.data` examinées concernent exclusivement
`_routes=business-profiles.route`. Seuls destination et statut de contrôle sont
conservés ; pas de corps brut, données de compte ou autre loader. Aucune requête
Business Profiles n'a été tentée. Les caches et Service Workers ne produisent
pas les deux 302 document observés.

L'origine est donc une **réponse HTTP serveur/edge**, avant le rendu client. Lors
d'une transition interne, React Router reçoit la même décision sous la forme
Single Fetch 202, puis applique la redirection. Ce protocole correspond au
[code officiel React Router](https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/server-runtime/single-fetch.ts),
qui sérialise les redirections dans les réponses de données ; cette référence
explique le protocole, pas l'implémentation privée du serveur OpenAI.

Dans le build observé `5be16f60542b488a5c44675aebc0ce231aafaf10`, la route est
`business-profiles.route`, chemin `business-hub/*`, module public
`/cdn/assets/340918.dde294dc52.js`. Son clientLoader attend le serverLoader, puis
renvoie son résultat. Sa branche de préchargement spécifique aux produits ne
constitue pas une redirection vers l'accueil.

Le module `c8Ji`, chunk `/cdn/assets/async/568027.3a1ea11416.js`, contient une autre
condition : gate sélectionné false ou compte absent → composant d'accès
indisponible. Le gate propriétaire est `2778625748`, le gate admin est
`2610731987`. Cette condition de rendu ne prouve pas la condition exécutée par le
serveur pour décider le 302. Les empreintes des fonctions examinées sont dans
`evidence/redirect-origin.json` ; aucune factory n'est copiée dans ce rapport.

## Limite du diagnostic

Le frontend livré ne contient pas l'implémentation du serverLoader ou du middleware
privé responsable de cette décision. **Le prédicat serveur exact reste inconnu** :
rollout, droits, profil ou combinaison ne peuvent pas être départagés par ce test.
Le chemin profond utilise un identifiant fictif ; il ne permet pas d'affirmer
qu'un véritable profil autorisé serait également refusé. Aucun identifiant de
profil réellement autorisé n'est disponible pour ce contrôle.

La recherche ciblée de documentation sur `openai.com` et `help.openai.com` n'a
fourni aucun résultat officiel correspondant à Business Hub Insights. Cela ne
prouve pas l'absence d'invitations privées. Aucun chemin officiellement autorisé
n'a été démontré avec le compte observé.

Ces résultats ne démontrent **pas** une impossibilité de prévisualiser les
composants. Le montage direct expérimental décrit dans `FULL-PREVIEW.md` contourne
le besoin de naviguer sur cette route pour un test de présentation, sans remplacer
le résultat d'admission du serveur et sans attribuer de droits au compte.
