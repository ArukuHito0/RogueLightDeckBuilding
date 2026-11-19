# AI stages 2–5 (v35 / 2026-10-15)

## Architecture and repeatability

The existing stage 1 Worker and the shipped game engine still execute every action. `ai-policy.js` receives immutable public observations, never the save, draw ordering, enemy future behavior or unopened pack contents. `ai-report.js` aggregates independently of rendering. The main page sequentially creates a fresh Worker for every trial. Main-game state and storage are never transferred or modified. Rendering and animation callbacks are no-ops in the Worker.

`ai-policy.js` contains the adjustable configuration: axis/key weights, distinct-key completion threshold (2), tagged share (.45), ambiguous-decision gap (1), deck size (14) and human-time formula (8 seconds/turn + 3 seconds/card + 15 seconds/battle). Runtime axis weight is adjustable 0–5. All non-retired cards have one or more computed tags. Utility without a specific axis is shared support; token cards also use this classifier.

Each axis has 3 key IDs: strength 19/20/21; poison 16/17/18; block 37/54/63; exhaust 22/24/73. Completion uses **distinct** keys, not copies. A completed run that later dies still counts as completed.

Builds prioritize 4 defensive, 4 offensive and 2 healing selections, then 4 unrestricted selections. Each step scores only eligible candidates, maximum 3 copies, limits HP-cost cards. Both policies get the same deck for an axis and weight. The game and policy RNG streams are separate. Trial seed is root/index, paired across conditions. Paths and RNG consumption can diverge after decisions; this is not an identical-encounter experiment. No game-rule modifications or enemy nerfs are applied. The heuristic avoids playing the same card ID more than 6 times in a turn to prevent zero-cost redraw loops; random policy retains stage-1 behavior.

## Reports

Up to 200 trials per axis/condition. A random-policy control and a relic condition are optional. The relic condition equips a single standardized first_block effect (最初の盾), through normal inventory/start logic. It is not an exhaustive evaluation of all relics. Four axes share the same relic.

Normal terminal runs are win/loss. Errors/limits are displayed separately and excluded from rates and metrics. Interrupted jobs produce incomplete reports with unequal sample warning. Planned total and completed sample are displayed.

- Win rate: wins / valid runs; progress: visited nodes, 10 for a clear.
- Completion: completed / valid; average first completion floor among completed.
- Cognitive proxies: at first actionable observation of each turn, count nonempty hand subsets within energy (not ordered sequences and not future draws); fraction where top two legal play scores differ by <=1; number of active player status fields plus distinct poison/plate/strength/block types on enemies. Three within-condition ranks are averaged, then ranked among four axes. Target choices can create ties. This is a policy-dependent proxy, not measured human burden.
- Death causes: exclusive heuristic based on last public state (event HP, low remaining HP, boss attack size, no playable cards, prolonged combat, incomplete build, defense). These are inferred labels, not causal diagnosis.
- Human time: median of the configurable formula. Never wall-clock CPU time.
- Base picks: per builder step chosen / eligible offers. Run picks: reward/chest/opened shop pack chosen / shown; excludes forced event cards and unopened packs. All offer scores and selected IDs are recorded, with chosen-score mean breakdown. Top five sorted by pick rate then offer count.

Results retain settings, complete action logs and pick evaluations. Search/sort and JSON export are in-game. Latest 3 reports use a separate IndexedDB database; fallback localStorage and a visible save-failure warning are provided. Stage 1 retains its separate history.

## Validation by stage

2. Matched random/heuristic trials use identical initial decks. Initial evaluation exposed excessive self-harm, insufficient defense and a repeated zero-cost action; adjusted role quotas, HP-cost penalties, block/strength sequencing and loop avoidance before final verification. Seed reruns produce byte-identical result objects.
3. UI harness exercised 32 jobs: 2 trials × 4 axes × 2 policies × 2 relic conditions. Verified equal condition counts, save isolation, cancellation, report rendering/search/sort. Engine verification uses 30 per condition.
4. Synthetic known outcomes verify win/completion denominators, completion floor, 50% pick rate, median time and cause percentages. All 480 runs record decision-turn metrics and picks. Public observations remain unchanged when hidden draw order/future behavior changes.
5. Final matrix: 480 normal terminal runs, zero errors/limits. Actual results in `ai-v35-validation.json`. Relic and no-relic conditions are separate and paired by trial seed. Other regression suites cover combat, reload, packs, relic turn behavior and original stage 1.

Final no-relic heuristic wins out of 30: strength 1, poison 0, block 0, exhaust 5. With first_block: 1, 2, 0, 8. All random conditions: 0/30. Heuristic mean progress 8.73–9.87, random 5.13–6.37. Low poison/block clear rates remain an AI limitation; do not interpret them as established card-balance rankings. These are small-sample observations, not statistical proof.

Actual browser visual/interaction QA was not available in this environment. UI protocol/rendering was verified in the VM harness; Web Worker/IndexedDB behavior still deserves real-browser QA.
