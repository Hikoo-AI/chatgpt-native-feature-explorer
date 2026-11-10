# Pistes de fonctionnalités hors Business Hub et Ads

Audit initial statique puis revalidation dans le runtime connecté : 10 novembre 2026. Ce document contient uniquement des identifiants et des observations techniques, sans copie d'implémentation propriétaire.

## Vérification du caractère inédit

La présence dans un bundle et l'absence d'un écran sur notre compte ne prouvent
pas qu'une fonctionnalité n'est pas publique. Vérification documentaire du
10 novembre 2026 :

| Surface | Statut public vérifié | Source officielle |
|---|---|---|
| Skills et son éditeur | Déjà documentés, disponibilité selon offre et permissions du workspace. | [Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) |
| Workspace Agents et leur création | Annoncés le 22 avril 2026 ; ne pas les présenter comme une découverte inédite. | [Introducing workspace agents](https://openai.com/index/introducing-workspace-agents-in-chatgpt/) |
| Memory Summary et corrections ciblées | Déjà décrits dans l'aide ; disponibilité variable. | [Memory in ChatGPT](https://help.openai.com/en/articles/8590148-memory-in-chatgpt) |

Les variations précises présentes dans les factories peuvent être expérimentales,
mais aucune comparaison publiée ici ne démontre une fonctionnalité inédite.
Les mentions « statut inconnu » plus bas appartiennent à l'audit technique
antérieur, qui ne comportait pas encore cette vérification documentaire.

Une prévisualisation native supplémentaire de **Memory Summary** est désormais
implémentée en lecture seule avec un personnage fictif ; voir [MEMORY.md](MEMORY.md).
Son bouton a été retiré de l'interface normale en 0.3.0 car le produit est public ;
la preuve reste accessible uniquement par une option explicite du test.
Les tableaux suivants conservent le résultat historique des sondes de présence,
qui ne montaient aucun candidat. Les autres rendus restent non validés.

## Revalidation sur le build actuellement servi

Le test reproductible `tests/feature-availability.mjs` ouvre uniquement sa propre page `https://chatgpt.com/gpts` via CDP `9444`. Après le bootstrap normal, il refuse les requêtes métier et les WebSockets, et autorise exclusivement les scripts et styles originaux `/cdn/assets/`. Il lit le manifeste et les factories enregistrées, extrait les dépendances des déclarations lazy courantes, puis charge leurs chunks via le chargeur natif. Aucun composant candidat n'est monté ; aucun export de page n'est exécuté, aucune valeur Statsig n'est changée. Les ressources tierces restent dans le navigateur ; seules des métadonnées sont écrites.

Provenance observée : manifeste **`e31b96d0`**, runtime **`/cdn/assets/633146.516c6a4677.js`**. Cet identifiant de manifeste ne doit pas être présenté comme un SHA de build complet ; aucun SHA complet n'a été extrait. Les anciennes valeurs de hash ci-dessous sont historiques.

| Piste | Preuve dans le runtime courant | Ce qui est effectivement confirmé |
|---|---|---|
| Skills | `SIRb` → `EOSE.BrowserSkillEditor`, chunk `511990.2a02ad0ea9.js`. `Wjli` présent. Chemins `/skills`, `/skills/manage`, `/skills/plugins` déclarés. | Factory d'éditeur et contrôles d'accès présents ; composant non initialisé et non monté par ce test. |
| Workspace Agents | `mjCR` → `z3mf.WorkspaceAgentsPage`, chunk `456006.7de65e4204.js`. `Pagv` déclare `/agents` et `/agents/a/:agentId`. | Page originale enregistrée après chargement CDN ; accès serveur et rendu non testés. |
| Workspace Agent Studio | `mjCR` → **`y8PF.WorkspaceAgentBuilderPage`**, chunk **`545316.1dea1aa39e.js`** ; dépendances lazy `753405`, `682047`, `306668`, `545316`. | Le nom de module et le chunk **ont changé** depuis `fX2k`/`837922`. `1010509169` est retrouvé dans `y8PF`. Ne pas utiliser l'ancien identifiant comme cible active. |
| Automatisations | `JzcZ` enregistré depuis `320111.9b53284a7e.js` ; marqueur de traduction du lieu d'exécution. Routes/chemins `/automations`, `/routines`, `/scheduled`, `/tasks` dans les déclarations du build. | Surface de présentation encore présente. Le chunk historique `712588` ne se résout plus en ressource JS actuelle ; `g98G`, `/automations/query` et les anciens gates `2220834113`/`834565546` ne sont **pas** revalidés dans ce corpus live chargé. |
| Memory Summary | `rIVa.MemorySummaryDialog`, chunk `376847.6489370beb.js`, référence `/memories/about_you/summary`, gate `820196652`. | Factory du dialogue et dépendance métier présents ; aucune mémoire personnelle lue, aucun dialogue monté. |
| Health | `yTnN` → `vaKJ.HealthSidebarController`, chunk `604229.cddc77f875.js`. `zFPc`, `KA9R`, `2487863402`, `219401130` retrouvés. | Contrôleur présent. La dépendance lazy `465662` n'a pas de chemin JS résolu par `r.u` ; le test n'en déduit ni disparition du composant ni initialisation complète de ses dépendances. Aucun endpoint médical/debug visité. |
| Study Hours | `vCIC` déjà enregistré et initialisé au bootstrap ; marqueurs `chatgpt-parent-managed-study-mode-lock` et `study_hours_schedule` dans sa factory. | Logique frontend présente dans le build courant ; aucune politique parentale modifiée et aucun écran nouveau validé. |

Les références de chemins ci-dessus proviennent des factories natives : elles ne prouvent pas que chaque route est admise pour le compte ou déjà installée dans `__reactRouterManifest.routes` à cet instant. Le test ne navigue vers aucune route candidate et ne force aucune admission.

**Résultat : les sept pistes ont bien une présence technique dans le build courant ; aucune de leurs sept prévisualisations n'est validée. Leur caractère non public ou prochainement disponible reste inconnu.** Les gates/configurations encore retrouvés dans les factories ne sont ni des droits serveur ni une permission de les activer. Les valeurs effectives ne sont pas lues.

Reproduction :

```sh
node extension/tests/feature-availability.mjs
```

Preuve metadata-only locale : `evidence/current-feature-availability.json`. Le test vérifie les sept modules attendus, leur présence après chargement, l'origine native et l'absence de réponse fetch/XHR/EventSource commencée après isolation. Il ferme sa propre page et ne charge/désactive aucune extension. Le bootstrap habituel, antérieur à l'isolation, reste celui de la session ChatGPT normale.

## Corpus historique, conservé pour traçabilité

Les sections suivantes décrivent l'audit statique initial. Les hashes et les modules historiques qui diffèrent du tableau courant ne doivent pas être réutilisés comme identifiants du build actuel.

## Portée et niveau de preuve

Ces sept surfaces n'ont pas de prévisualisation validée dans `extension/`. Elles ne sont pas inventoriées comme fonctionnalités implémentées dans ses rapports Business Hub/Ads. Cela ne démontre **ni leur caractère inédit, ni leur indisponibilité publique** : certaines peuvent déjà être déployées à d'autres utilisateurs. Nous n'avons pas vérifié leur statut commercial.

La preuve provient du corpus local `bundles/main/`, téléchargé pendant les investigations précédentes. Le rapport initial l'associe au build `3943b9e3bd1394c29968704e5b91f11f3f1b09bf`, observé le 9 novembre. `bundles/probe/_page.html` confirme cet identifiant. Le dossier n'est pas un snapshot immuable : la correspondance de chaque fichier avec un unique build ne peut pas être certifiée. Le build de la dernière validation Insights (`5be16f60542b488a5c44675aebc0ce231aafaf10`) est différent. **À la date de cet audit initial, aucun identifiant ci-dessous n'avait été revalidé ; le tableau live précédent fournit désormais les confirmations et différences.**

Les numéros Statsig sont distingués des configurations dynamiques et des layers. Une constante numérique seule n'est pas la preuve d'un contrôle d'admission. Aucune valeur effective de ces gates n'a été lue.

## Candidats prioritaires

| Surface | Preuves exactes du corpus | Dépendances et possibilité de prévisualisation native |
|---|---|---|
| **Bibliothèque de Skills et éditeur** | Route `/skills`, enfant `editor/:skillId?` dans `955979.c147b344d3.js`. Export `EOSE.BrowserSkillEditor` dans `async_511990.243b0b859f.js`. Contrôles d'accès dans `Wjli` du même chunk. | Imports React, routeur `jqIZ`, scopes `BolX`, traduction et client métier. API `/hazelnuts/*` : brouillon, fichiers, partage, export. Le formulaire et les fichiers fictifs sont une cible plausible pour un sous-arbre isolé ; aucun montage n'est testé. Le cycle complet passe par les droits d'accès/création et les mutations serveur. |
| **Répertoire Workspace Agents** | `z3mf.WorkspaceAgentsPage`, chunk `async_456006.b500b64e81.js`. Routes déclarées par `Pagv` dans `637885.a0eaa62308.js` : `/agents`, `/agents/a/:agentId`. Lectures `/hermes/agents`, `/hermes/workspace-store/agents`, `/hermes/workspace-store/agents/search`. | Scopes, routeur et traduction natifs ; requêtes liées au compte et à l'utilisateur. La requête du répertoire exige leur présence et une condition d'activation. Un listing à données fictives paraît plus simple qu'un agent exécutable, mais la forme exacte des caches et la chaîne des providers restent à vérifier. |
| **Studio Workspace Agents : ressources et déploiement** | `fX2k.WorkspaceAgentBuilderPage`, chunk `async_837922.67c88e5a83.js`. Routes `/agents/studio/new`, `/agents/studio/edit/:agentId` déclarées par `Pagv`. Le même chunk contient des lectures de `builder-view`, permissions, versions publiées, fichiers et skills. | L'éditeur reçoit notamment `agentId`, `deployments`, `canManage`, `onChange`. Contextes natifs, compte et données de l'agent nécessaires ; partage, publication, upload et Slack sont des opérations serveur distinctes. Un rendu statique du studio est une hypothèse à tester, pas une preuve d'exécution ni une autorisation de déployer. |
| **Automatisations : Cloud / This device, historique et partage** | `/automations`, `/routines`, `/tasks`, `/scheduled/:automationId` dans `955979.c147b344d3.js`. `JzcZ` dans `async_320111.9bcd5b5247.js` gère la présentation du lieu d'exécution. `g98G` dans `async_712588.4bbd52d51f.js` lit `/automations/query`. `JoAv` dans `async_655368.7192970f5e.js` lit `/share/automation/{automation_id}/current`. | Caches `cloud-automations`, identité, capacité d'exécution locale et état d'autorisation ; l'historique lit aussi `/automation/{automation_id}/runs/latest`. Liste, panneaux de partage et sélecteurs peuvent potentiellement consommer des fixtures. Créer, exécuter ou partager réellement une tâche n'est pas une opération de présentation. Aucune exécution proposée. |
| **Résumé de mémoire « About you » et corrections ciblées** | `rIVa.MemorySummaryDialog`, chunk `async_376847.2561cbf0c5.js`. Lecture `/memories/about_you/summary`, checksum, corrections de sélection ; transport de génération `/memories/about_you/summary/stream`. | Le dialogue utilise React Query `irkb`, scopes, traduction et un `accountId`. Les contenus fictifs et l'état de chargement sont une piste de prévisualisation visuelle. Les actions de correction, suppression de cache et régénération ont des effets métier : les bloquer entièrement en test, sans lire ni réécrire la mémoire réelle. |
| **Health : sidebar, données connectées et outils de test employés** | `vaKJ.HealthSidebarController`, chunk `async_909092.c36608dfc4.js`, chargeur lazy `yTnN` dans `229522.aca0c6dfc8.js`. `zFPc` déclare `/health`, le connecteur `connector:connector_openai_olympic` et l'identifiant `2487863402`. Le chunk contient des outils de connexion/test et des endpoints debug. | Identité `EOo5`, scopes App/Route, routeur, états de connexion et données médicales. Des props d'outil de test comprennent un état d'accès employé et une liste de données de test. Cela **ne prouve pas l'existence d'un mode de preview accessible au compte**. Aucun endpoint Health ou debug n'a été appelé ; aucune donnée de santé réelle ne doit être inspectée pour cette piste. |
| **Study Hours gérées par un parent** | `vCIC` et `yNfy` dans `956483.cb805cdd0f.js`. Gate nommé `chatgpt-parent-managed-study-mode-lock`. Présentation intégrée au composer et explication du contrôle parental. | Le prédicat vérifie l'identité cohérente du compte, un planning activé, le verrou `amphoraLocks.study_hours_schedule` et l'heure locale. Il s'agit aussi d'une politique de compte, pas d'un simple thème d'interface. Une bulle explicative isolée serait une cible de rendu ; ne pas changer le verrou ou le planning de la session réelle. Priorité faible pour un explorateur de pages. |

## Attribution des flags et configurations

| Identifiant | Attribution réellement observée | Limite de la preuve |
|---|---|---|
| `3553340571` | Configuration dynamique lue par `Wjli` ; contient notamment `enable_api` et `skills_rbac_enabled`. | Ce n'est pas un gate booléen. Son contenu effectif n'est pas connu. |
| `73506792` | Configuration dynamique des Skills, dont `max_skill_upload_bytes`. | Limite de présentation/upload, pas preuve d'admission. |
| `2711242789` et `1355972088` | Participent au chemin RBAC Skills dans `Wjli`. Le code consulte des permissions `chatgpt.workspace.skills.access` et `chatgpt.workspace.skills.create`, ou des paramètres bêta suivant le chemin. | Activer un gate ne fournit pas les permissions ; aucun de ces contrôles n'a été modifié. |
| `2039979220` | Constante exportée par `Pagv` à côté des chemins Workspace Agents. | Son rôle exact comme admission n'est pas établi par cette déclaration seule. |
| `1010509169` | Hook de gate dans `fX2k.WorkspaceAgentBuilderPage`. | La signification de chaque branche n'est pas encore suffisamment attribuée. |
| `2401070674` et `1355972088` | Gates et métadonnées d'expérimentation consultés dans `VoXp`, chunk du studio. | Ni valeur utilisateur, ni admission serveur démontrée. |
| `2220834113` ou `834565546` | Disjonction de deux gates dans `hwNx`, chunk de la liste d'automatisations. | Leur valeur effective n'est pas connue. |
| `3435160418` | **Layer**, paramètre `use_tasks_label`, pour la présentation des automatisations. | Condition de libellé ; ne pas l'appeler autorisation. |
| `820196652` | Hook de gate dans `rIVa.MemorySummaryDialog`. | Présence du gate démontrée ; fonction précise des branches à approfondir. |
| `2487863402` | Constante `zFPc.e`, module de définition Health. | Rôle exact de gate non certifié par cette seule déclaration. |
| `219401130` | Gate consulté par l'UI d'outils de test Health. | Un gate de debug et une prop d'accès employé ne constituent pas une autorisation de tester les endpoints debug. |
| `chatgpt-parent-managed-study-mode-lock` | Gate nommé consulté dans le prédicat de Study Hours `vCIC`. | Le planning et le verrou parental restent des conditions distinctes. |

## Ordre de vérification recommandé

1. Revalider la disponibilité des exports **Skills**, **Workspace Agents** et **Memory Summary** via les imports lazy du build présent ; ne réutiliser aucun hash historique en dur.
2. Identifier leurs premiers exports de présentation, les providers hérités et les clés de cache, avant tout montage.
3. Réutiliser exclusivement l'isolation de fixtures déjà éprouvée pour Insights, avec les opérations réseau refusées par défaut. Un export de page peut avoir des effets dès son montage : sa disponibilité ne suffit pas.
4. Garder automatisations, Health et contrôles parentaux en analyse tant que les effets serveur/host ne sont pas séparés du rendu. Aucun outil debug de Health n'est un raccourci d'autorisation.

Aucune de ces fonctionnalités n'est ajoutée au popup par cet audit. Aucun rendu supplémentaire n'est annoncé comme fonctionnel. Le résultat de cet audit est un ensemble de candidats vérifiables, et non une liste garantie de fonctionnalités secrètes ou prochainement disponibles.

## Reproduction locale et provenance

Depuis la racine, les recherches suivantes ne lisent que les anciens bundles locaux ; elles ne doivent pas être ajoutées à l'export public :

```sh
rg -l 'BrowserSkillEditor|WorkspaceAgentsPage|WorkspaceAgentBuilderPage|MemorySummaryDialog|HealthSidebarController' bundles/main
rg -l 'chatgpt-parent-managed-study-mode-lock|inbox.automations.executionLocation' bundles/main
```

Empreintes SHA-256 de quelques fichiers effectivement analysés :

| Fichier local | SHA-256 |
|---|---|
| `async_456006.b500b64e81.js` | `c9762becb7406e365ca20834bed1353ef231a114d31569a5835e06c4c967b107` |
| `async_837922.67c88e5a83.js` | `7c5ffd0d6b31875e3b0f30386b6bab2fcc3609364b87d05d66cbf93a5292431d` |
| `async_320111.9bcd5b5247.js` | `6dcacb4579c2cdded2bf540f1870ad79724ec5cbebf76f0e3490cbf7d97895a0` |
| `async_655368.7192970f5e.js` | `d309a47a6a436321a80a5f31d25fcbac97d4519496eff967b112baf1340c51cd` |
| `956483.cb805cdd0f.js` | `3ee39d6b6871f0fe92e7392673775581042c26481725bc96e372d4bb206fba93` |
| `637885.a0eaa62308.js` | `395378215a7ab4529766103762440ea80e7841b22253d32f5b39eeef2c37fcac` |

Les fichiers du corpus restent exclus de la publication. Le présent rapport n'embarque ni composant, ni asset OpenAI, ni contenu de compte.

## Confirmation dans Orca, 10 novembre 2026

Les sept signatures ont aussi été confirmées depuis le navigateur intégré
d’Orca, dans le build `c7c67f236389d572805f54f46b36bfcbb7b59ba3`, manifeste
`e31b96d0`. La preuve est `evidence/orca-current-features.json`, produite par
`npm run test:orca:features` dans la prévisualisation à connexions bloquées.
Aucun de ces sept candidats supplémentaires n’a été monté ; ni leur rendu ni
leur disponibilité publique ne sont annoncés comme validés. Le rendu Insights
et les interactions locales ont une preuve séparée, décrite dans [ORCA.md](ORCA.md).
