# v40 AI lab validation

- Individual strength / poison / block / exhaust axes or all four can be selected.
- Residual tabular Q-learning uses the heuristic score as its prior. Initial deck assembly remains heuristic; the learner updates legal actions within the run. No hidden draw order or enemy future action is supplied.
- Model identity includes rule/policy/learner settings, tag overrides, axis, relic condition and axis weight. Training and evaluation seeds use separate namespaces. Evaluation freezes updates and sets exploration to zero. Resuming training requires the saved model; seed alone does not describe learned state. Reports include starting and ending models.
- Tags, roles, traits and key-card membership are editable and affect pick/assembly/completion evaluation. Player gameplay effects and saves are untouched.
- Models use a separate IndexedDB database, with browser-local fallback. Settings and models are exportable. Reports remain separate from player saves.
- Radar scores use disclosed fixed benchmarks, shared by all axes and single-axis tests. Stress increases with burden. Narrative analysis is deterministic and derived from measured logs, not an external language-model request. Difficulty adequacy is explicitly provisional, and samples below 20 defer judgment.

## Tests

`tests/ai-learning-v40.cjs`: 12 poison training episodes produced 1,339 Q updates and 1,043 entries. Evaluation from identical model and seed reproduced the complete result. Evaluation did not modify weights. Role/trait/axis/key overrides were applied. Ten separate evaluation seeds gave 0/10 wins for both the heuristic baseline and the learned model; this is not evidence of improved strength.

`tests/ai-axes-v40.cjs`: each axis independently completed 8 learning episodes and 3 frozen evaluation episodes. Evaluation wins: strength 2/3, poison 0/3, block 1/3, exhaust 3/3. These are smoke tests, not balance estimates or evidence that learning improved a build.

`tests/ai-lab-v40.cjs`: single-axis job counts, train/eval namespaces, model transfer, tag edits, radar/text generation, cancellation and player-save isolation.

`tests/ai-model-storage-v40.cjs`: IndexedDB model loading gates execution; persistence queues preserve updated models; settings remain small; player-save key unchanged.

Existing batch, heuristic-policy, poison-policy and 100-run random headless termination/public-information/script-parity tests passed. Browser visual QA was unavailable; no browser rendering claim is made.
