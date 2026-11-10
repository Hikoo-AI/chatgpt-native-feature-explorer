# Validation 0.3.0

La version 0.3.0 traduit l'interface propre à Hikoo en anglais et ajoute un
coordinateur de lancement pour les deux applications Ads. Les composants natifs
OpenAI conservent la langue de leur application. Memory Summary reste uniquement
une preuve technique optionnelle, sans bouton dans l'extension normale.

| Contrôle | Résultat et portée |
|---|---|
| `npm test` | 13 tests réussis : fixtures, confidentialité, origine, lancement, refus de permission, reprise simulée après redémarrage du worker et expiration. |
| `npm run test:orca:ui` | Réussi : popup anglais, demandes de lancement Ads/Shopify, refus de permission respecté ; API Chrome simulée. |
| `npm run test:orca:ads` | Réussi sur les sites réels dans Orca, avec un pont de test aux API Chrome. Ads attend l'identité ; Shopify attend le contexte marchand. Aucune injection sur la page d'authentification. |
| Business Hub dans Orca | La première exécution 0.3.0 a confirmé la racine native, les métriques, Discovery Topics, l'enregistrement local et les onglets Products. Elle a échoué en fin de parcours sur un timeout du transport Orca. Une relance a également échoué par timeout : la suite complète actuelle ne doit pas être annoncée réussie. |
| Retour à l'état normal | Réussi lors du contrôle `--restore` avant les dernières relances Business Hub. |
| Cycle MV3 réel dans Chrome | Non testé dans cette phase : Orca n'installe pas le worker via le pont de test. À vérifier après rechargement de l'extension dans Chrome. |
| Rendu fictif Ads complet | Non atteint. Aucun composant Ads n'est monté par le coordinateur. |

Le blocage Ads Manager observé est toujours la sélection de compte sur
`auth.openai.com`. Le blocage Shopify est le contexte marchand rejeté par le
loader ; le document observé ne fournit ni body ni arbre React commité. Le
coordinateur indique ces états sans inventer d'identité ou d'autorisation.

Les fichiers de preuve locaux sont `evidence/orca-popup-validation.json`,
`evidence/orca-ads-launch-validation.json`,
`evidence/orca-preview-validation.json` et
`evidence/orca-restoration-validation.json`. Les captures et profils navigateur
restent exclus de l'export public.

Pour tester dans Chrome, recharger le dossier de cette extension dans
`chrome://extensions`, sélectionner Ads Manager ou Ads for Shopify, puis cliquer
sur Open. Chrome demande l'accès optionnel au domaine choisi. Terminer soi-même
la connexion ou ouvrir l'intégration depuis une boutique déjà autorisée. Le
worker reprend alors son contrôle, même après fermeture du popup. Il ne crée
ni compte annonceur ni campagne, et n'installe aucune application Shopify.
