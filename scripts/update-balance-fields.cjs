const fs = require('node:fs');
const vm = require('node:vm');
const {workerHarness} = require('../tests/ai-stage1.cjs');

(async () => {
  const harness = workerHarness();
  await harness.run('balance-catalog');
  harness.context.importScripts('balance-settings.js', 'balance-runtime.js');
  const {fields, pools} = vm.runInContext(`(() => {
    const fields = Object.fromEntries(Object.entries(balanceDefaults).map(([group, rows]) => [
      group, Object.fromEntries(rows.filter(row => row.value !== null).map(row => [
        row.id, [row.min ?? balanceLimits[group][0], row.max ?? balanceLimits[group][1], 1],
      ])),
    ]));
    for (const [group, legacy] of Object.entries(balanceLegacyAct4Fields)) Object.assign(fields[group],legacy);
    fields.cardEffects = Object.fromEntries(Array.from(balanceEffectFields, ([id, row]) => [id,[row.min,row.max,row.step]]));
    return {fields,pools:balanceWeightGroups.map(rows=>rows.map(row=>[row.key,row.id]))};
  })()`, harness.context);
  fs.writeFileSync('worker/balance-fields.json', JSON.stringify(fields)+'\n');
  fs.writeFileSync('worker/balance-weight-groups.json', JSON.stringify(pools)+'\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
