const {workerHarness} = require('./ai-stage1.cjs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const h = workerHarness();
  await h.run('card-table-combat-effects');
  h.context.assert = assert;
  await vm.runInContext(`(async () => {
    render = () => {};
    animateEntity = async () => {};
    S.run = null;
    S.relicQueue = [];
    S.relicReroll = null;
    S.selectedCharacter = 'wanderer';
    S.deck = [0,0,0,1,1,1,3,3,4,4];
    start();
    choose('fight');

    const r = S.run;
    const giantBlood = 19;
    const harden = 89;
    page = 'battle';
    busy = false;
    r.enemies = [{hp:100,max:100,block:0,str:0,poison:0,atk:0,intent:'guard'}];
    r.relics = [];
    r.hand = [harden, giantBlood, giantBlood];
    r.draw = Array(12).fill(0);
    r.discard = [];
    r.exhausted = [];
    r.energy = 20;
    r.agility = 1;
    r.plate = 0;
    r.str = 4;
    r.regen = 0;

    for (let i = 0; i < 3; i++) base.play(0);
    assert.equal(r.agility, -1);
    assert.equal(r.plate, 10);
    assert.equal(r.str, 4);
    assert.equal(r.regen, 0);
    assert.equal(r.specialUses[harden], 1);
    assert.equal(r.specialUses[giantBlood], 2);
    assert.equal(r.exhausted.length, 0);
    assert.equal(r.discard.length, 0);

    await endTurn();
    assert.equal(r.str, 6);
    await endTurn();
    assert.equal(r.str, 8);

    r.mode = 'map';
    page = 'map';
    choose('fight');
    assert.equal(r.mode, 'battle');
    assert.equal(r.turnStartStrength, 0);
  })()`, h.context);
  console.log('PASS 硬質化と巨人の血の戦闘効果、特殊カードの消費、次の戦闘へのリセット');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
