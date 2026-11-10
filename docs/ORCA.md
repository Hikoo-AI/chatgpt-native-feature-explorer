# Workflow Orca uniquement — Hikoo 0.2.4

Les validations navigateur de cette étape utilisent exclusivement l’onglet
ChatGPT du navigateur intégré d’Orca. Aucun navigateur externe n’est lancé ou
contacté ; aucun cookie ou profil n’est importé.

## Exécuter

Se connecter normalement à ChatGPT dans Orca et sélectionner l’onglet `/gpts`.
`ORCA_PAGE_ID` permet de choisir explicitement une page sans changer les autres.

```sh
npm test
npm run test:orca
npm run test:orca:preview
npm run test:orca:features
npm run test:orca:ui
node tests/orca-preview.mjs --restore
```

- `npm test` : tests unitaires de fixtures, classement réseau et export expurgé.
- `test:orca` : inventaire des modules déjà enregistrés, sans charger les chunks
  des candidats ni initialiser leurs exports.
- `test:orca:preview` : notre adaptateur existant dans le runtime natif, puis clics
  Orca sur l’éditeur, Save fictif, retour et onglets Products ; capture locale.
- `test:orca:features` : prévisualisation isolée requise. Chargement des chunks
  statiques originaux, vérification des signatures des sept pistes. Aucun montage
  supplémentaire ni lecture de valeur Statsig.
- `test:orca:ui` : notre popup dans une page technique vierge, avec API Chrome
  simulée. Vérifie la préparation du téléchargement JSON et l’expurgation.
  Ce test ne reproduit aucune interface OpenAI.
- `--restore` : contrôle le retrait du rendu, de la route temporaire et de la CSP.

La commande de prévisualisation réutilise exactement `native-full-preview.js`
et nos fixtures. Les composants, React, providers, styles et graphiques viennent
du site. Aucune ressource propriétaire n’est sauvegardée dans le dépôt.

## Limite exacte de la preuve

Le transport Orca exécute notre adaptateur via l’évaluation de page ; il ne
prétend **pas** installer ou déclencher l’action Manifest V3 dans Orca.
Les preuves contiennent donc `extensionActionTested: false`. Les validations
MV3 antérieures restent historiques ; elles ne sont pas remplacées par une
fausse affirmation d’installation dans le navigateur intégré.

Les contrôles sont d’abord activés par références d’accessibilité Orca. Si cette
activation n’a pas d’effet, le test utilise `.click()` sur le contrôle DOM original
et vérifie l’effet React. Les étapes concernées sont consignées dans
`activationFallbacks` ; aucun état de route ou de formulaire n’est forcé pour
simuler une réussite. La preuve porte sur les handlers natifs, avec cette limite
sur l’activation par pointeur dans le navigateur intégré.

L’isolation réseau du rendu Orca repose sur la CSP temporaire du document.
`connectNone: true` est testé ; l’observation complète du réseau n’est pas
réalisée par ce transport (`networkObserved: false`). Les refus et comptes
réels ne sont pas modifiés. Une référence dans un bundle n’est ni une admission
serveur, ni une validation de rendu, ni la preuve d’une fonctionnalité secrète.

## Rapport runtime dans le popup

Le bouton « Rapport runtime » prépare un téléchargement local
`hikoo-native-evidence.json` : build/manifeste, compteur de modules, déclarations
d’exports, état d’initialisation, références de routes et d’identifiants Statsig,
dépendances directes et références à des contextes connus.

Le collecteur s’adapte aux identifiants d’exports observés plutôt que de supposer
un hash de chunk. Les références viennent uniquement des factories du runtime,
jamais du contenu du compte. Elles ne sont pas une liste certifiée de tous les
providers requis. Le rapport précise sa base (`component-factory` ou
`reference-factory`), les limites de taille et les dépendances tronquées.

La liste d’identifiants inclut des gates, des configurations et un layer issus
de l’analyse ; le collecteur n’évalue aucune de leurs valeurs. Un export déclaré
mais non initialisé est distingué d’un export déjà disponible. Le rendu de ces
candidats reste explicitement non validé par ce rapport.

L’export est filtré sur une liste de champs et de formats. Aucun cookie, jeton,
identifiant de compte, conversation, texte de factory ou stack n’est exporté.
La préparation du téléchargement est testée avec le vrai HTML/CSS/JS du popup
et une API Chrome synthétique dans Orca ; le clic MV3 réel n’est pas testé ici.

## Preuves locales

- `evidence/orca-preview-validation.json`, `orca-native-preview.png`
- `evidence/orca-restoration-validation.json`
- `evidence/orca-current-features.json`
- `evidence/orca-runtime.json`
- `evidence/orca-popup-validation.json`

Ces fichiers sont exclus de l’export public. Les tests Playwright historiques
sont conservés ; ils ne sont pas exécutés depuis le passage au workflow Orca.
Le précédent `npm test` réseau reste accessible comme `test:legacy-network`.
