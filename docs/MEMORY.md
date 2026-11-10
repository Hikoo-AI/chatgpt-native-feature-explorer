# Memory Summary natif, en lecture seule

**Retiré de l'interface normale en 0.3.0 à la demande de recentrer l'explorateur
sur les surfaces expérimentales.** Ce document et ses tests conservent la preuve
technique ; le popup ne charge plus la fixture de mémoire et ne propose plus ce
bouton. Les instructions historiques de lancement ci-dessous nécessitent
désormais une nouvelle session de test avec l'option explicite `--public-memory` :
`node tests/orca-preview.mjs --restore`, puis
`node tests/orca-preview.mjs --public-memory`, puis
`node tests/orca-memory.mjs`.

Ce deuxième rendu est une prévisualisation d'une fonctionnalité **déjà documentée
publiquement**, pas une découverte inédite :
[documentation OpenAI](https://help.openai.com/en/articles/8590148-memory-in-chatgpt).

Dans la prévisualisation, le bouton **Memory Summary** de la barre Hikoo monte
`rIVa.MemorySummaryDialog`, export original du build servi par ChatGPT. Son chunk
observé est `/cdn/assets/async/376847.6489370beb.js`, build
`c7c67f236389d572805f54f46b36bfcbb7b59ba3`.
L'adaptateur retrouve les dépendances de la déclaration lazy native courante
après chargement du chunk de déclaration `68473`. Le premier essai, limité au
seul chunk `376847`, échouait à l'initialisation d'une dépendance partagée.
Le correctif charge les dépendances déclarées avant d'initialiser l'export ;
aucun cache d'erreur natif n'est modifié.

Le composant reste dans la racine React existante, sous les scopes et le client
React Query isolés déjà utilisés pour Insights. La barre de prévisualisation
utilise un portail du ReactDOM natif pour rester visible au-dessus du dialogue ;
ce portail ne crée aucune nouvelle racine React. Aucun composant OpenAI n'est
copié dans le dépôt.

## Données et effets

Le compte transmis au dialogue est l'identifiant fictif
`hikoo-fictional-memory-account`. Les fixtures ne contiennent que les informations
inventées d'Alex. Aucun contenu de mémoire réel n'est lu pour préparer ces données.

| Clé du cache de test | Donnée |
|---|---|
| `chatgpt-about-you-summary` + compte fictif | Deux sections fictives, date et checksum fictifs |
| `chatgpt-about-you-summary-checksum` + compte fictif | État non périmé fictif |
| `chatgpt-about-you-selection-actions` + compte fictif + locale native | Liste vide |

Les trois familles de requêtes sont désactivées sur ce client isolé, y compris
le refetch au montage. Les clics d'action et la soumission sont arrêtés en
capture ; seuls les contrôles de fermeture sont admis. Les corrections,
régénérations, suppressions et changements de préférences ne sont pas proposés
comme fonctionnels. Le CSP `connect-src 'none'; form-action 'none'` de la
prévisualisation reste actif. Aucun gate ni réponse d'autorisation n'est modifié.

## Preuves reproductibles dans Orca

```sh
npm run test:orca:preview
npm run test:orca:memory
```

`tests/orca-memory.mjs` contrôle l'identité de la factory avec l'export du chunk
CDN, l'export React exécuté, sa racine commune, les données fictives affichées,
les requêtes désactivées et inactives, le blocage d'un contrôle natif et le
retour à Insights. Il écrit `evidence/orca-memory-validation.json` et
`evidence/orca-memory-preview.png`. La capture masque temporairement le shell
réel du compte sans lire son contenu, puis enlève ce masque.

Ce test emploie le navigateur Orca et le même adaptateur que l'extension ;
il ne teste pas l'installation ni le bouton MV3 réel. Il ne constitue pas une
trace réseau indépendante : `networkObserved:false` reste explicite. Le test
de retour à la page normale est `node tests/orca-preview.mjs --restore`.
