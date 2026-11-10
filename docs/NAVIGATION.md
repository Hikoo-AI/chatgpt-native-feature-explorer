# Interactions natives de la prévisualisation Hikoo

L’adaptateur initial annulait tous les liens puis n’autorisait que trois chemins
sans paramètres. Les contrôles natifs dépendant de `activity=history`,
`activity=issues` et `edit/:section` étaient donc inertes.

## Parcours locaux pris en charge

- Navigation Overview, Products, Agent builder et retour.
- Sélection Feeds / Upload history / Issues dans Products, avec liste fictive vide.
- Ouverture de l’éditeur original d’informations métier et de ses sections
  présentes dans les fixtures (About, Contact, Photos, Location, Hours).
- Modification de champs dans leurs formulaires React originaux.
- Save local : les brouillons valides du composant original sont appliqués
  uniquement au manager fictif et à son QueryClient distinct, en mémoire.
- Discard changes conserve le comportement du composant original.

Le test navigateur exerce explicitement la description, son Save local,
Discard changes, le retour, et les trois onglets Products. Le simple fait qu’une
section soit accessible ne prouve pas que tous ses contrôles le sont : upload,
autocomplétion distante ou validation métier peuvent dépendre du service réel.
Aucune réponse d’identité, d’autorisation ou de vérification n’est fabriquée.

Le Save local ne publie rien. Il utilise le brouillon exposé par les props React
du formulaire natif (`field`, `draft`, `valid`, `onDraftChange`), uniquement pour
`bp_fixture_demo`. Les révisions des données fictives deviennent `fixture-local-*`.
Les caches de production ne sont pas modifiés. Aucune valeur saisie ni clé
d’idempotence n’est exportée dans le rapport de test. Le bandeau annonce
« Données fictives enregistrées en mémoire uniquement. Aucun changement du compte. »
La fermeture ou la désactivation supprime ces modifications.

## Isolation de la navigation

Le LocationContext et le RouteScope de la branche fictive reflètent la navigation
locale. Les paramètres `section` et les chemins des matches suivent aussi la
section active pour que les hooks natifs résolvent les liens et formulaires.

Le premier prototype utilisait un blocker du routeur. L’éditeur natif enregistre
son propre blocker ; il pouvait remplacer le nôtre. L’adaptateur temporaire
intercepte désormais `navigate` et `fetch` sur **l’objet routeur original** pour
contenir les actions de cette page expérimentale. Les autres méthodes, les
providers, l’AuthProvider et l’objet DataRouter restent ceux du site. Ce n’est
pas une traversée de la route Business Hub protégée : le chemin réel reste `/gpts`.
Les deux méthodes retrouvent leur implémentation normale au rechargement.

Seuls le profil fictif, les sections connues et les paramètres de présentation
explicitement admis sont acceptés. Les destinations externes, autres profils,
actions de chargement serveur et paramètres inconnus sont refusés avec une
explication dans le bandeau. Les formulaires sont interceptés avant leurs
handlers d’envoi. La CSP `connect-src 'none'; form-action 'none'` reste active.
Les tests ajoutent également une interdiction réseau en dehors des assets CDN.

## Opérations restant indisponibles

| Action | Limite |
|---|---|
| Publier les informations réelles, envoyer une invitation, connecter une boutique, importer un catalogue | Opérations serveur ; aucune exécution ni confirmation de succès simulée |
| Add products, validation d’identité ou d’entreprise | Contrôle de vérification natif ; non neutralisé |
| Agent builder complet | Connexion runtime et chaîne native de vérification manquantes ; voir ci-dessous |
| Liens vers facturation, publicité ou feedback externe | Sortie de l’environnement fictif ; refus avec explication |
| Fonctions non couvertes par des fixtures validées | Disponibilité non annoncée ; aucune requête inconnue transmise |

## Agent builder

`SvPi.BusinessProfileAgentBuilderEntry` utilise `TjQQ` pour son runtime.
Sans provider, le composant original affiche « Agent builder isn’t available yet ».
Une tentative avec un runtime purement fictif a révélé un passage supplémentaire
par `BusinessProfileVerificationEntry` (purpose `agent-builder`) en l’absence du
contexte API attendu dans `HwNs`. Aucune réponse de sécurité n’a été remplacée.
Cette tentative reste archivée dans `history/agent-runtime-attempt/`, exclu de la
publication. **L’éditeur Agent builder complet reste non validé.**

## Pourquoi /gpts ?

`/gpts` est un hôte de montage éprouvé dans l’arbre React authentifié, pas une
dépendance métier d’Insights. Depuis une autre page ChatGPT, le popup le prépare
automatiquement avec `activeTab`, sans permission d’hôte supplémentaire.
Ads Manager et Shopify possèdent leurs propres runtimes, sessions et contextes ;
l’ouverture d’un onglet ne valide pas leur rendu ni leur admission.

## Reproduction

`npm run test:full` vérifie les interactions ci-dessus, le rendu des deux
graphiques, les contextes natifs, le gate de production inchangé, l’absence de
réponse métier expérimentale et la désactivation réelle de l’extension.
`npm run test:launch` vérifie le lancement depuis l’accueil ChatGPT.
`npm run test:ui` vérifie notre popup avec l’API Chrome simulée.
Les résultats et captures sont écrits dans `evidence/`, exclu de l’export public.
