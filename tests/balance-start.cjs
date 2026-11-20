const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../dist/balance-live.js'), 'utf8');
const settings = {version:1, cardEffects:{'0:d':9}};

(async () => {
  for (const page of ['home', 'characters']) {
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const sandbox = {
      ASHBOUND_HEADLESS:true, ASHBOUND_BALANCE_SETTINGS:settings, page, AbortSignal,
      S:{selectedCharacter:'wanderer',destinationAct:1,run:null},
      fetch:() => pending, balanceValidate:value => value,
      balanceApply(value) { assert.equal(value, settings); },
      startSelectedCharacter() { sandbox.S.run = {}; },
      save() { assert.equal(sandbox.S.run.balanceSettings, settings); },
      toast(message) { assert.fail(message); },
    };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox);
    const starting = sandbox.startSelectedCharacter();
    await sandbox.startSelectedCharacter();
    assert.equal(sandbox.S.run, null);
    release({ok:true,status:200,json:async () => ({settings})});
    await starting;
    assert.equal(sandbox.S.run.balanceSettings, settings);
  }
  console.log('PASS expedition start from home and explorer selection with published settings');
})().catch(error => { console.error(error); process.exitCode = 1; });
