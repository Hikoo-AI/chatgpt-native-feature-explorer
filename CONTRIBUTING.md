# Contributing

Use Node.js 22+, run `npm test` and `npm run check`, and keep changes focused on
native frontend integration. No dependency installation is needed.

Never commit downloaded OpenAI implementations, browser profiles, raw responses,
tokens, account identifiers, conversations or connected-session screenshots.
Use fictional fixtures and metadata-only reports. Respect server admission,
identity, verification, revocation and 401/403 responses.

Report a build mismatch with the build ID, module IDs and a sanitized error.
Do not attach a HAR, a full runtime dump or an authenticated browser profile.
For a rendering claim, distinguish the existing React tree from a new root,
record fixture isolation, and state which interactions were actually checked.
Do not describe an announced product as unreleased just because one account
cannot access it.
