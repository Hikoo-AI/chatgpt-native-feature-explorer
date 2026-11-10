# Hikoo Labs

L’extension porte le nom « Hikoo · Native Feature Explorer ».
Le popup et le bandeau de prévisualisation utilisent l’identité Hikoo :
bleu marine #111A45, survol #26305F, surfaces #F9F8F7 et blanc,
sélection #ECEEF6, bordures #EBEAEA.

Provenance : tokens du projet Hikoo `app/app/globals.css` et logo Hikoo
`app/assets/logos/hikoo.svg` du workspace. Le logo Hikoo est intégré dans
notre popup ; ce n’est pas une ressource OpenAI. La police Inter est utilisée
si installée, sinon la police système, sans téléchargement externe.

Le branding concerne uniquement les contrôles de l’extension. Les composants
natifs conservent leurs styles et leur identité. Le bandeau permanent conserve
« Experimental preview · Sample data ». Hikoo Labs désigne notre laboratoire,
pas une disponibilité officielle des fonctionnalités OpenAI.

Validation : `npm run test:ui` vérifie le popup et ses interactions ;
`npm run test:full` vérifie la prévisualisation native et sa désactivation.
Les versions des fichiers avant ce changement sont conservées localement
sous `history/hikoo-branding-before-*`, exclu de l’export public.
