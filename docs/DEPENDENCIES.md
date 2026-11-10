# Dépendances Business Hub : provenance et portée

Build natif observé : `5be16f60542b488a5c44675aebc0ce231aafaf10`.
Runtime : `/cdn/assets/633146.abbf482877.js`. La provenance des factories est
vérifiée par identité de fonction avec les exports du CDN, et par SHA-256.
Les sources propriétaires ne sont pas enregistrées dans ce laboratoire.

Chaîne : route serveur → `CbZ6` → `c8Ji` → scopes Business → `eUoS` →
`g5Mm/KQ1R` → `lDTh` → Insights interne → `K0bl` et `FCa5`.

| Opération / état | Initiateur | Nature, données et dépendances | Conséquence d'une absence / refus | Simulation de cette expérience |
|---|---|---|---|---|
| Document `/gpts` et bootstrap | Application | HTML, session, sélection du compte, ressources ; identité réelle jamais simulée | Pas d'environnement natif connecté | Observation de métadonnées seulement |
| Statsig bootstrap / `POST ab.chatgpt.com/v1/initialize` | SDK, `OMIV` | Présentation/déploiement ; gate propriétaire `2778625748` ; ne confère pas de droit serveur | Squelette en attente, puis entrée indisponible si false | Aucun gate forcé ; aucun corps observé |
| `/business-hub` et `…/insights.data` | Route + clientLoader appelant serverLoader | Admission de navigation côté serveur, distincte du gate React | **302 vers `/` observé pour `/business-hub`** | Aucune réponse native remplacée |
| Chunks 447995, 568027, 850301 | Chargeur Rspack | Code des routes, manager et Metrics ; contextes natifs, Intl, styles | Erreur lazy / squelette | Chargement original et identité des factories vérifiés |
| `GET …/business-profiles/presence` et liste | `bRUC`, surfaces d'entrée | Présence et liste autorisée ; gate et compte | Entrée/liste indisponible | Non simulé, refusé dans le sandbox |
| `GET …/{profile}/manager` | `eUoS → g5Mm → KQ1R` | Compte/utilisateur réels, projection dashboard/section, `consistency=relaxed-v1` ; profil, capacités, champs | Squelette sans donnée ; erreurs et révocation arrêtent le parcours | Ancien modèle métier fictif sur origine réservée ; projections courantes non validées |
| `GET …/{profile}/admin-view` | Branche admin de `c8Ji`, `KQ1R` | Accès admin réel et gate séparé ; ce n'est pas un mode de test | Pas de manager admin | Jamais simulé |
| Sessions `read-session` / `manager-read` | `eUoS`, `g5Mm`, QueryClient | **État local**, UUID, userId, projections, invalidation et fusion ; pas d'endpoint de création de session observé | Cache incomplet/périmé ; contrôle du profil/projection empêche une fusion incorrecte | Cache natif séparé vérifié ; pas d'orchestration complète montée |
| `expectedIdentity` | Transport `HFSu/GDNt/KthI/wl0r` | Cohérence locale du compte/utilisateur avant envoi ; ne donne pas de permission | `409 account_changed` local en cas de divergence | Identité jamais remplacée |
| `profile.can_manage`, `access_revoked`, capacités | Dossier reçu, contrôleurs `eUoS/lDTh` | Données d'accès dont le frontend respecte l'effet ; aucune règle ACL serveur déduite | Écran accès/révocation ; exception spécifique aux créations en attente | Valeurs fictives dans cache distinct seulement ; jamais appliquées à la session réelle |
| `POST …/{profile}/insights` | Insights interne à `lDTh` | Lecture : dates, compare_previous, latest_available ; profil, summary, timeseries, metadata ; validation profil/fenêtre | États forbidden, unsupported, error, unavailable, insufficient, partial | JSON 7/28 j ; transformateur natif validé ; origine synthétique seulement |
| `POST …/{profile}/insights/discovery-topics` | Insights interne → `FCa5` | Lecture : fenêtre de reporting, topics, mentions/other, comparaison ; même profil et période | Découverte vide/erreur/indisponible | JSON cohérent ; rendu courant de `FCa5` non testé dans ce laboratoire |
| `GET …/{profile}/website-crawl` | Statut website de `lDTh` | Statut métier sous accès effectif ; schéma courant complet non confirmé | Website status unavailable ; n'autorise pas à inventer une réussite de crawl | Refusé, pas de schéma supposé |
| `POST …/{profile}/website-crawl/recrawl` | Interaction retry | **Modification/opération serveur**, pas une lecture parce qu'elle accompagne un graphique | Retry indisponible | Toujours refusé |
| `GET …/{profile}/manager/business-verification` | `C7pe` | Vérification réelle, erreurs 401/403/404/409/426/429 traitées | Vérification/manager indisponible selon branche | Toujours refusé |
| Catalogues, feeds, Shopify, Agent API | `c8Ji`, `lDTh`, `HwNs` | Lectures et opérations distinctes ; les méthodes POST/PUT de préparation/publication/liaison ne sont pas des fixtures de présentation | Branches secondaires indisponibles | Inventoriées, refusées |
| Télémétrie `/ces/*`, SDK | SDK natifs | Pas de donnée nécessaire au graphe de présentation identifié | Aucune donnée de présentation manquante requise par le harness | Refusée en simulation ; corps jamais lus |

Les en-têtes de compte identifient le contexte ; ils ne prouvent pas un droit sur le
profil. 401/403 sont des décisions de service à respecter ; 404 est une ressource
indisponible ; 409 peut refléter un conflit ou un cas non pris en charge selon la
branche ; 426 concerne aussi la compatibilité du protocole. Aucun de ces statuts
réels n'a été remplacé. La redirection 302 ne révèle pas son prédicat serveur.

## Inventaire courant et inconnues restantes

`evidence/network-inventory.json` contient 39 sites d'appels statiques dans les neuf
modules parcourus, avec méthode, template, module et classification. Les doublons
représentent plusieurs sites, pas plusieurs endpoints. Toutes ces opérations sont
classées ; cela n'est **pas** une trace d'appels effectifs ni une preuve d'exhaustivité
de tous les enfants lazy du Business Hub.

Les inconnues utiles au rendu complet sont désormais :

1. Le prédicat serveur qui refuse l'entrée à ce compte, et l'existence éventuelle
   d'une entrée de prévisualisation autorisée. Le frontend ne les révèle pas.
2. Le contrat complet des projections courantes du manager et leurs fusions,
   non validé par des réponses autorisées ni par le montage du contrôleur.
3. Le schéma complet de Website Crawl et des services optionnels déclenchés dans
   les variantes de profil ; aucune collecte active n'est faite pour l'obtenir.
4. Le montage effectif de `FCa5` avec ces fixtures sous le manager courant.
5. Une frontière de contexte native isolant **à la fois** React Query et le store
   de scopes : `BolX` hérite du QueryClient et du store du parent. Un simple
   QueryClientProvider supplémentaire ne suffit pas à isoler tous les lecteurs.

Ces inconnues sont explicites ; aucune réponse autorisée du backend Business n'a
été obtenue pendant cette expérience.
