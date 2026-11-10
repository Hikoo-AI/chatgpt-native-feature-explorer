# Ads Manager principal et Ads for Shopify

## Version 0.3.0 — lancement automatique, interface anglaise

Les boutons **Open Ads Manager** et **Open Ads for Shopify** demandent l'accès
optionnel au seul domaine choisi, ouvrent l'application et conservent leur suivi
dans un service worker MV3. Le popup peut se fermer sans annuler le lancement.
Après connexion, un événement de navigation reprend le contrôle de disponibilité.
Sur Shopify, un onglet déjà ouvert sur le domaine de l'intégration est conservé
avec son contexte, sans recopier ses paramètres dans le stockage de l'extension.
La connexion, la sélection d'identité, les autorisations boutique et les créations
de comptes restent à effectuer dans le parcours officiel.

Le suivi ne contient que l'identifiant d'onglet, la cible, un état et des dates.
Il expire après 15 minutes, disparaît avec l'onglet et utilise `storage.session`.
Les domaines d'authentification et `admin.shopify.com` ne sont pas demandés dans
les permissions. Aucun cookie, jeton, domaine marchand, réponse serveur ou URL
complète n'est conservé. Le badge et le statut local distinguent connexion,
contexte boutique absent et prévisualisation non implémentée.

**Cela automatise le lancement et le diagnostic, pas un rendu fictif Ads.**
Dans Orca, Ads Manager redirige toujours vers la sélection de compte ; Shopify
ne fournit toujours pas le contexte marchand. Aucun de ces contrôles n'est
remplacé. La sonde ne monte aucun composant Ads et ne modifie aucune campagne.
La page Shopify observée n'a même pas de `document.body` après son rejet de
loader : le statut est alors livré par le badge et le popup de l'extension,
sans fabriquer un document ni un arbre React pour remplacer l'application.

Ces deux produits sont déjà documentés publiquement, d'où le libellé
**Public app** dans l'extension :
[Ads Manager](https://help.openai.com/en/articles/20001213-ads-manager-account-setup),
[Shopify](https://help.openai.com/en/articles/20001523-set-up-chatgpt-ads-for-shopify).
Ils ne sont pas présentés comme des découvertes inédites.

Validation actuelle : `npm test`, `npm run test:orca:ui`,
`npm run test:orca:ads`. Les tests Orca emploient des adaptateurs aux API Chrome,
pas une extension MV3 installée. Les tests unitaires simulent aussi un redémarrage
du worker et le retour depuis l'authentification. Le cycle MV3 réel après mise à
jour de l'extension reste à vérifier dans Chrome.

Les sections suivantes conservent les observations historiques.

Les deux applications sont traitées séparément. Elles ne partagent pas le runtime
Rspack de ChatGPT ; un composant Ads n'est pas présumé présent dans ses modules.
Le popup dispose des deux cibles et d'un contrôle de disponibilité du runtime.
**Aucun rendu Ads n'est encore validé dans cette extension native.**

## Ads Manager principal

URL : `https://ads.openai.com/manager`.

Le test normal dans le Chrome Codex a observé :

1. `/manager` → 302 ;
2. `/auth/login` → 302 ;
3. `auth.openai.com/oauth/authorize` → 302 ;
4. `auth.openai.com/choose-an-account` → 200.

La page finale est l'application d'authentification, avec ses modules de sélection
de compte, pas les composants de l'Ads Manager. La connexion ChatGPT existante ne
termine pas automatiquement cette sélection. Aucune sélection de compte, création
de compte annonceur, acceptation de conditions ou action sur une campagne n'a été
automatisée. Il faut un onglet Ads Manager admis par son propre parcours pour
inspecter et tester son runtime véritable.

## OpenAI Ads for Shopify

URL : `https://connect.ads.openai.com/app`.

Le document répond 200 et déclare un manifeste React Router. Les modules `root`,
`routes/app` et `routes/app._index` sont enregistrés. Le manifeste déclare également
les routes de campagne et de Business Profile. Les références de fichiers observées
incluent `entry.client-DjPfz5Bs.js`, `chunk-EPOLDU6W-DjmNoC6B.js`,
`app-3pUrvS6Q.js` et `app._index-DWwi6KfP.js` ; aucune copie n'est conservée ici.

Cependant, sur l'ouverture autonome testée :

- Le loader `routes/app` expose une erreur de contexte marchand, identifiée sans
  sauvegarder son contenu ou une identité de boutique.
- Le bootstrap ne fournit que les données du loader root (locale et messages),
  pas l'environnement marchand attendu par l'application.
- Le HostRoot n'a aucun enfant React commité dans cette observation. Des modules
  enregistrés ne constituent donc pas un arbre applicatif prêt à accueillir la
  prévisualisation.

La prochaine observation doit se faire depuis OpenAI Ads lancé dans l'admin d'une
boutique où l'application est effectivement autorisée. Aucun domaine de boutique,
token App Bridge, identité marchande ou résultat d'autorisation n'a été inventé.
L'ancien prototype local utilisait un stub App Bridge et des exports ajoutés aux
copies des bundles ; ces mécanismes ne sont pas repris dans le code public.

## Code et validation livrés

- `src/targets.mjs` : les trois origines sont distinctes ; pas d'injection sur
  une page d'authentification ou une origine ressemblante.
- `ads-runtime.js` : examen du manifeste, des exports enregistrés et du Root
  existant. Aucun téléchargement de source ni appel API n'est réalisé par la sonde.
- `tests/ads-admission.mjs` : vérifie les deux ouvertures normales et enregistre
  seulement destinations, statuts et métadonnées de disponibilité.
- `tests/popup-ui.mjs` : sélection des trois cibles, ouverture du bon site,
  refus d'injection sur le mauvais onglet et présentation explicite des blocages.

```sh
npm run test:ads
npm run test:ui
```

La preuve locale se trouve dans `evidence/ads-admission.json`. Les tests de la sonde
ne prétendent pas valider les composants Ads ; le champ `previewAvailable` reste
false tant que leur montage isolé n'a pas été développé et exécuté avec succès.
