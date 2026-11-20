const {workerHarness} = require('./ai-stage1.cjs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const h = workerHarness();
  await h.run('balance-draw');
  h.context.assert = assert;
  h.context.importScripts('balance-settings.js', 'balance-runtime.js');
  vm.runInContext(`
    render = () => {};
    animateEntity = async () => {};
    canPresentBattleCards = () => false;
    S.run = {
      characterId:'lucky', hp:77, max:77, block:0, str:0, agility:0, energy:20,
      energyMax:3, turn:1, act:1, floor:1, hand:[], draw:Array(8).fill(LUCKY_IDS.draw),
      discard:[], exhausted:[], deck:[0,1], relics:[], battleCards:[],
      generatedCards:[], potions:[], enemies:[{hp:100,max:100,block:0}],
      mode:'battle', kind:'fight',
      balanceSettings:{...ASHBOUND_BALANCE_SETTINGS,cardEffects:{[LUCKY_IDS.draw+':draw']:4}}
    };
    page = 'battle';
    target = 0;
    busy = false;
    const drawCopy = luckyInstance(S.run, LUCKY_IDS.draw);
    assert.equal(C[drawCopy].fx.draw, 3);
    S.run.hand.push(drawCopy);
  `, h.context);
  h.context.importScripts('balance-live.js');
  vm.runInContext(`
    assert.equal(C[LUCKY_IDS.draw].desc, 'スロット3。カードを4枚引く。');
    assert.equal(combatDesc(combatCard(drawCopy), S.run), C[LUCKY_IDS.draw].desc);
    const drawPileBefore = S.run.draw.length;
    base.play(0);
    assert.equal(S.run.hand.length, 4);
    assert.equal(drawPileBefore - S.run.draw.length, 4);
    balanceApply(ASHBOUND_BALANCE_SETTINGS);
    assert.equal(C[LUCKY_IDS.draw].fx.draw, 3);
    assert.match(C[LUCKY_IDS.draw].desc, /カードを3枚引く/);
  `, h.context);
  console.log('PASS published draw count, resumed card copy, successful slot and default restoration');
})().catch(error => { console.error(error); process.exitCode = 1; });
