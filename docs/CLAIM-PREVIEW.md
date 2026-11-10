# Native business search and protected-claim preview — 0.4.0

The Business Hub toolbar now offers **Claim your business**. Search for `Hikoo`
to see two fictional businesses. Selecting a result displays OpenAI's original
protected-profile support screen. **Back to Insights** returns to the native
manager; **Close** reloads the normal page.

This validates native search and the protected-claim presentation, not the full
ownership-verification flow, account admission, or a successful claim. Selecting
a fixture is an explicit test-harness transition to the presentation component.
It does not run or simulate a successful server claim controller.

## Observed provenance

Build: `feece64a1ee38fa896378ad5cb6578e60fdb2b53`, manifest `7675fb69`.

| Native export | Module | Observed asset |
|---|---|---|
| BusinessProfilesSearchView | Jiod | /cdn/assets/async/764.087770157b.js |
| ProtectedProfileClaimSupport | xg49 | /cdn/assets/async/762918.278144bf6c.js |
| BusinessProfileManagerView, BusinessInsightsMetrics | lDTh, K0bl | /cdn/assets/async/850301.d943e7be06.js |
| DiscoveryTopics | FCa5 | /cdn/assets/async/332323.7525c0316a.js |

The loader follows lazy declarations in the live runtime rather than saving their
code. The browser test compares imported factories with the runtime's factories
and checks the rendered exports in the original React root. Provider identifiers
still depend on the observed build; this is not a stable OpenAI API.

## Fixtures and isolation

The native search component accepts an adapter exposing `search({query, accountId,
signal})`. Our adapter filters two in-memory fictional businesses and returns its
results directly. It never calls the canonical search endpoint. The result names
explicitly include `(fictional)`; URLs use the reserved `.example` domain.

Search-result visibility reads presentation flag `3295749912`. The preview sets
that value only in its separate native scope store and disconnects that store
from the production Statsig client. It does not call Statsig overrides or change
the authenticated branch. Both the original search flag and Business Hub flag
`2778625748` remained false before and after the test. The adapter checks store
separation before applying the fixture presentation state.

The support component receives a fictional name, profile ID, website and empty
email. No real ownership, identity, `can_manage`, admission, revocation, grant or
401/403 response is replaced. `CanonicalProfileClaim` is not mounted. Create and
external-contact actions are captured and blocked. The native support screen's
`locked` presentation is a fixture, not a server decision about the account.

The existing document policy blocks new connections and form submissions:
`connect-src 'none'; form-action 'none'`. Native components may attempt blocked
background reads. This policy does not close previously established connections;
the test does not claim a complete packet-level audit or actual MV3 installation.

A permanent **Experimental preview · Sample data** toolbar is placed above native
portal dialogs. Native styles and all business-screen markup come from ChatGPT.

## Reproduce

Use a dedicated authenticated ChatGPT `/gpts` tab in Orca, then:

```sh
node extension/tests/orca-preview.mjs --interactions
node extension/tests/orca-claim.mjs
node extension/tests/orca-preview.mjs --restore
```

Set `ORCA_PAGE_ID` when multiple tabs exist. Browser outputs and masked screenshots
are written to ignored `extension/evidence/`; no vendor assets or private browser
state are committed. Screenshots are local evidence, not bundled UI.

Tests cover native search results, fixture adapter use, original-root ancestry,
isolated query/scope providers, unchanged production gates, native protected
support rendering, blocked external contact, return to manager/metrics/topics,
factory provenance, visible overlay banner and restoration on reload. Offline
unit tests and the publication audit are separate checks.

## Recorded result (2026-11-10)

| Check | Result |
|---|---|
| Offline unit tests | 16 passed |
| Native manager, metrics and Discovery Topics | Passed |
| Existing editor local-save and Products tabs | Passed; Orca required DOM `.click()` fallbacks on the original controls |
| Native search and two fictional results | Passed; fixture adapter called |
| Native protected-claim support and visible sample toolbar | Passed |
| Original-root and native provider/query isolation | Passed |
| Production search/Business gates unchanged | False before and after |
| Claim controller mounted | No |
| External contact | Blocked |
| Return to complete Insights and normal reload | Passed |
| Actual Chrome extension action / installation | Not tested by the Orca bridge |
| Successful real ownership verification | Not attempted; outside preview scope |

Browser screenshots were visually reviewed locally. The repository audit refuses
local evidence directories; move `extension/evidence/` outside the source checkout
before running the publication audit or packaging a release.
