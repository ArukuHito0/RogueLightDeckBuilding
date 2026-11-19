# v41 reference decks and card editor

Completion uses the user-authored reference deck for each axis. Matching is multiset Jaccard: sum of minimum card counts / sum of maximum counts. Both extra and missing cards reduce similarity. Default completion threshold is 100%, editable per axis. Completion rate is the share of configured runs that reached the threshold at any checkpoint; final and peak similarity are stored separately. Unconfigured runs are excluded, not treated as failures. Old reports retain their original definitions.

The editor has target/tag modes. Tag mode selects axis/role/trait/key and populates the selected zone from explicit saved memberships. Every card is available regardless of player inventory. Dragging from catalogue adds, dragging out removes all copies, right-click and +/- affect one copy. Tags are boolean memberships; reference decks keep multiplicity (max three per card).

Each radar exposes a result-deck dialog with win/loss tabs, complete final card snapshots, run-time reference snapshots, and missing/extra cards. Reports and editor data remain separate from normal player saves. Existing models are migrated across the initial semantically equivalent tag-schema expansion; edited tags still identify separate learning settings.

Validated with:
- `tests/ai-reference-v41.cjs`: duplicates, missing/extra penalty, empty references, initial/final action completion checkpoints, reference/current deck snapshots, latent cards, configured denominator.
- `tests/ai-builder-v41.cjs`: actual registered pointer/context-menu callbacks for drag/right-click, all tag kinds, player-save isolation, win/loss filtering, card snapshots, reference differences, radar button.
- Existing learning, batch, isolated model storage and full random worker termination/public-observation/script-parity tests.

Browser visual QA unavailable; tests use headless engine and DOM mocks. Completion history captures whether a build was ever achieved, and final similarity is provided separately to expose later divergence.
