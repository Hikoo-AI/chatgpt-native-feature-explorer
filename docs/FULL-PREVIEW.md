# Prévisualisation directe du manager natif

Une première sonde a monté l'export original `BusinessProfileManagerView`,
`BusinessInsightsMetrics` et `DiscoveryTopics` dans le même HostRoot que
l'application. Deux graphiques et le contenu de découverte sont présents dans
l'arbre. La capture initiale est conservée localement dans `evidence/` ; elle
n'est pas incluse automatiquement dans l'export public.

La validation automatique de cette prévisualisation est désormais **réussie**,
après reconnexion du Chrome de test. `evidence/full-native-validation.json`
consigne `fullComponentPreview: true` et `protectedProductRouteReached: false`.
Les captures `full-native-top-7d.png`, `full-native-top-28d.png` et
`full-native-discovery.png` montrent le manager et les deux graphiques.

## Architecture et provenance

`native-full-preview.js` contient notre adaptateur, pas les composants OpenAI.
Il importe le chargeur déjà déclaré par le manifeste natif, utilise ses imports
lazy d'origine, puis appelle les exports du cache. Aucun bundle, React, stylesheet
ou asset propriétaire n'est téléchargé dans le dépôt ni empaqueté dans l'extension.

L'adaptateur ajoute une route expérimentale sur le document `/gpts`, sous le même
routeur et le même arbre React. Il utilise les implémentations natives de
ScopeProvider et QueryClientProvider pour créer une branche de fixtures avec son
propre store et son propre QueryClient. AuthProvider et les contextes Intl et
DataRouter continuent de provenir de l'arbre existant.

Le contexte Location de cette branche reçoit explicitement un pathname fictif
Business Hub. **Le véritable emplacement du routeur reste `/gpts`**. Il s'agit d'un
test du composant original, pas d'une ouverture autorisée de la route protégée du
produit. Le gate propriétaire global et les réponses du serverLoader restent
inchangés. Le contrôleur de route `c8Ji` et l'orchestrateur `eUoS` ne sont pas montés
par cet adaptateur direct ; leur parcours complet n'est donc pas validé par cette
preuve.

Le profil et son `can_manage` sont fictifs, dans la branche de test seulement.
Les métriques et les fenêtres Discovery Topics proviennent de nos JSON. Aucun
refus réel 401/403, aucune identité et aucun droit serveur n'est remplacé.

La CSP bloque les connexions et formulaires du document pendant l'expérience.
Les liens inconnus et les opérations serveur sont bloqués. La navigation
locale admise et les filtres de période utilisent l’état de la branche fictive.
Voir [NAVIGATION.md](NAVIGATION.md) pour l’éditeur et l’interception temporaire
de `navigate`/`fetch` sur l’objet routeur original. Le test ajoute en
plus un refus réseau par défaut, autorisant seulement les assets statiques du
CDN natif. Fermer ou désactiver l'extension recharge le document d'origine pour
retirer les scopes, caches, route temporaire, interception de navigation et CSP.

## Utilisation expérimentale

1. Charger ce dossier avec « Charger l'extension non empaquetée » dans Chrome.
2. Ouvrir ChatGPT dans un onglet connecté ; le popup prépare `/gpts`.
3. Cliquer l'icône de l'extension, puis « Prévisualiser Insights ».
4. Utiliser « Fermer » pour rétablir le document original.

Le bandeau reste « Experimental preview · Sample data ». Les actions serveur ne
font pas partie de ce test. La compatibilité dépend du build et des signatures
effectivement présents dans le navigateur.

```sh
npm run test:full
```

La suite a vérifié l'identité des trois composants, leur appartenance au HostRoot
existant, les caches/stores isolés, l'identité inchangée du contexte Auth, la
provenance CDN, les graphiques, les filtres et Discovery Topics. Elle teste ensuite
la désactivation réelle de l'extension et le retour au document normal.

Le succès de cette prévisualisation de composants et l'accès à la route protégée
sont consignés dans deux champs distincts ; ils ne doivent pas être confondus.
