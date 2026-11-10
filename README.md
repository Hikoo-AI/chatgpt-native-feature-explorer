# Hikoo Native Feature Explorer

A Chrome extension for exploring native frontend components already shipped to
ChatGPT. Built by [Hikoo](https://github.com/Hikoo-AI).

**Business Hub Insights is demonstrated with fictional data inside ChatGPT's
existing React tree.** OpenAI's components, charts and styles are loaded by the
site; the extension ships our adapter and sample fixtures.

[Watch the 2-minute demo](https://cap.so/s/xtzeaey67s38cdg) ·
[Download the extension](https://github.com/Hikoo-AI/chatgpt-native-feature-explorer/releases/latest)

This is an independent research project, not an OpenAI product or an entitlement
to access its backend. A component's presence in a frontend bundle does not
establish that it is unreleased or available to your account.

## Install in Chrome

1. Download the extension ZIP from **Releases** and extract it.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Open `https://chatgpt.com`, sign in normally, then click the Hikoo extension icon.
5. Select **Business Hub** and click **Preview Insights**.

If using a source checkout instead, select its **`extension/`** folder.
The preview uses a dedicated `/gpts` host route and a temporary fixture location
context. `/gpts` is not the protected Business Hub route. Close the preview to
reload the normal page. Reload an already-installed extension after updates.

## What works

| Surface | Current scope |
|---|---|
| Business Hub Insights | Original manager view, metrics, charts, 7D/28D filters and Discovery Topics with coherent fictional data. |
| Business information | Native editors; supported drafts can be saved in memory only. |
| Products | Native page and activity tabs; uploading requires real verification and remains unavailable in the preview. |
| Agent builder | Native unavailable state. The complete editor is not validated. |
| Ads Manager | Automatically opens the public application and checks its runtime after sign-in. No isolated Ads preview is implemented. |
| Ads for Shopify | Automatically opens or reuses the application, preserving an existing merchant context. A store-authorized launch is still required. |

The Hikoo UI is in English; OpenAI's components retain the site's language.
Memory Summary is not offered in the normal extension because it is already a
public feature. Its optional research test is retained for provenance.

## How the native preview works

The adapter discovers the site's Rspack runtime and uses its native chunk loader
and component exports. It adds a fixture-only branch under the existing React
root, with native scope providers and a separate native React Query client.
The original authentication context and data-router object are inherited.
Navigation methods are temporarily contained to the sample subtree.

The protected Business Hub route/controller is not enabled. The real Statsig
gate, identity, account permissions and authorization responses are not changed.
The manager's access fields describe a fictional profile in the isolated branch.
They grant no server rights.

The preview adds `connect-src 'none'; form-action 'none'` to block new connections
and form submissions in that document. Close the preview before using normal
ChatGPT network features. Supported local saves affect only the sample state.
This policy does not retroactively close connections established before preview.

The permanent banner reads **Experimental preview · Sample data**. The native
frontend has no iframe, localhost replica or independent React root.

## Permissions and data

- `activeTab` and `scripting`: run the adapter after an explicit extension action.
- `storage`: retain only temporary Ads launch metadata in `storage.session`.
- Optional access to `ads.openai.com` or `connect.ads.openai.com`: requested when
  opening that application, so the worker can resume after the popup closes.

The extension requests no access to the authentication domain or Shopify admin.
It does not export or persist cookies, tokens, conversation content or account
identifiers. Runtime reports contain allowlisted module/build metadata. Account
context used internally by native components is not exported by those reports.
Ads launch checks do not create an advertiser account, install a Shopify app,
accept terms or modify campaigns.

## Development and tests

Requires Node.js **22 or newer**. There are no npm dependencies to install.

```sh
npm test
npm run check
npm run package
```

Packaging also requires the `zip` command. The resulting ZIP contains only the
runtime files listed in `tools/runtime-files.mjs`, not tests or research reports.

Connected browser tests are opt-in and use Orca. Open ChatGPT in Orca, select its
tab, and run:

```sh
npm --prefix extension run test:orca:preview
npm --prefix extension run test:orca:restore
npm --prefix extension run test:orca:ui
npm --prefix extension run test:orca:ads
```

Set `ORCA_PAGE_ID` if another browser tab is active. These tests use an Orca bridge
to exercise the adapter; they do not claim to install or exercise the actual MV3
worker. Unit tests cover worker resumption with simulated Chrome APIs.

The last full Business Hub Orca run was interrupted by a transport timeout after
its native rendering and interactions were checked. A subsequent retry also
timed out. Local checks cover code and fixtures; they do not certify a connected
ChatGPT rendering or the Chrome installation flow. See
[validation details](docs/VALIDATION-0.3.0.md).

An optional GitHub Actions template is provided in [docs/ci-template.yml](docs/ci-template.yml).
It is inactive: the publication credential has no `workflow` scope. A maintainer
with workflow permission can install it under `.github/workflows/check.yml`.

## Provenance and limitations

No OpenAI JavaScript bundles, components, stylesheets or downloaded assets are
included. The only bundled graphic is Hikoo's own inline logo. See
[PROVENANCE.md](PROVENANCE.md) and the hashed [file inventory](PUBLIC-FILES.json).

This targets an observed frontend build, not a stable integration API. OpenAI
deployments can change module IDs, exports and provider requirements at any time.
Business Hub's public release status is not established by this project. Ads
Manager and its Shopify integration are already publicly documented.

Technical notes: [native rendering](docs/FULL-PREVIEW.md),
[navigation](docs/NAVIGATION.md), [Ads launch](docs/ADS.md),
[other candidates](docs/FEATURE-CANDIDATES.md).

## License

Our integration code and fictional fixtures are MIT licensed. OpenAI's resources
remain on its servers and are not covered by this repository's license. ChatGPT
and OpenAI are trademarks of their respective owners. This project is not
affiliated with or endorsed by OpenAI.
