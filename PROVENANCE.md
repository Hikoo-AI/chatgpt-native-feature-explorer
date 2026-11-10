# Provenance of the public repository

This repository is a new, curated source export of Hikoo's local experiment.
It starts with a clean Git history. The original research directory and its
previous prototypes are preserved locally and have not been pushed here.

## Included

- Our MV3 manifest, popup, background worker and MAIN-world adapters.
- Our network metadata registry, fixture manager and runtime evidence collector.
- Our synthetic Business Hub fixtures and their two original data generators.
- Our local tests and opt-in Orca browser drivers.
- Technical reports consisting of observations, identifiers and explanations.
- Hikoo's own logo embedded in the popup.

## Excluded

Downloaded OpenAI bundles, legacy copied frontend prototypes, browser profiles,
cookies, tokens, raw network captures, screenshots, video files, local evidence,
historical scratch files and dependency directories are excluded.
The demo is linked on Cap; its media is not copied into this repository.

The public source was selected explicitly, rather than publishing the original
research directory and relying on `.gitignore` to remove its history. The two
earlier native extensions are not part of the maintained public distribution.

## Runtime provenance

The observed build was `c7c67f236389d572805f54f46b36bfcbb7b59ba3`, with route
manifest `e31b96d0` and runtime `/cdn/assets/633146.516c6a4677.js`.
Business Hub used native modules `lDTh` (manager), `K0bl` (metrics) and `FCa5`
(Discovery Topics). The recorded chunks were
`/cdn/assets/async/850301.ba9ca68289.js` and
`/cdn/assets/async/332323.7525c0316a.js`.

Those strings document what was observed. They are not copies of the resources
and do not guarantee compatibility with a later deployment. The adapter inspects
native factory declarations in browser memory and imports resources through the
site's runtime. It does not save their implementations into the project.

The protected route and its server admission are distinct from the isolated
component preview. See [FULL-PREVIEW.md](docs/FULL-PREVIEW.md).

## Publication checks

`npm run check` rejects known credential formats, packaged-runtime signatures,
browser artifacts, symlinks, unexpectedly large files and machine-specific
absolute paths. `npm run inventory` records file hashes in `PUBLIC-FILES.json`.
`npm run package` uses an explicit runtime-file allowlist.

These checks supplement source selection and review; pattern matching alone
cannot establish universal ownership or absence of every possible secret.
All connected-browser results and their limits are documented separately from
the offline checks. The optional CI template is not active in this release.
