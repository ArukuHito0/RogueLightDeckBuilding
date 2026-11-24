const {workerHarness} = require('./ai-stage1.cjs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const h = workerHarness();
  await h.run('card-table-combat-effects');
  h.context.assert = assert;
  h.context.importScripts('balance-settings.js','balance-runtime.js');
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

    r.hand = [60];
    const beforeStrength = r.str;
    const beforeGuard = r.agility;
    base.play(0);
    assert.equal(r.str, beforeStrength + 2);
    assert.equal(r.agility, beforeGuard + 2);
    assert(r.exhausted.includes(60));
    await endTurn();
    assert.equal(r.str, beforeStrength + 2); // temporary +2 expires, then two Giant Blood effects trigger
    assert.equal(r.agility, beforeGuard);

    r.hand = [229, 0];
    r.draw = [3, 4];
    base.play(0);
    assert.equal(r.pendingChoice.remaining, 1);
    chooseHand(0);
    assert.equal(r.hunterChoice.kind, 'search');
    chooseHunterCard(0);
    assert(r.hand.includes(3));
    assert.deepEqual(Array.from(r.draw), [4]);

    r.hand = [69, 0, 0, 53, 8];
    r.energy = 20;
    r.enemies[0].hp = 1000;
    base.play(0);
    assert.equal(combatCard(0).fx.d, 9);
    assert.equal(combatCard(luckyInstance(r, 0)).fx.d, 9);
    base.play(0);
    assert.equal(combatCard(0).fx.d, 9);
    assert.equal(r.specialUses[69], 1);
    base.play(r.hand.indexOf(53));
    assert.equal(combatCard(8).cost, C[8].cost - 1);
    await endTurn();
    assert.equal(combatCard(8).cost, C[8].cost);
    assert.equal(combatCard(0).fx.d, 9);

    r.hpLossCount = 100;
    assert.equal(combatCard(72).cost, 1);
    r.block = 7;
    assert.equal(previewDamage(combatCard(37), r, r.enemies[0]), 14);
    assert.equal(previewDamage(combatCard(62), r, r.enemies[0]), 7 + r.str);

    const lucky = luckyState(r);
    lucky.slotCount = 5;
    lucky.failures = 2;
    assert.equal(luckyActions(r, {card:combatCard(203)})[0].n, 3);

    r.relics = [];
    r.hand = [53, 175];
    r.draw = [];
    r.discard = [];
    r.energy = 20;
    base.play(0);
    const discountedSlotCost = combatCard(175).cost;
    const beforeSlotEnergy = r.energy;
    base.play(0);
    assert.equal(discountedSlotCost, C[175].cost - 1);
    assert.equal(r.energy, beforeSlotEnergy - discountedSlotCost);

    r.hand = [206];
    r.discard = [0];
    r.energy = 20;
    r.enemies[0].block = 0;
    const hpBeforePickup = r.enemies[0].hp;
    const strikeDamage = previewDamage(combatCard(0), r, r.enemies[0]);
    base.play(0);
    assert.equal(lucky.choice.kind, 'recover');
    const energyAfterPickup = r.energy;
    luckyChoose(0);
    assert.equal(r.enemies[0].hp, hpBeforePickup - strikeDamage);
    assert.equal(r.energy, energyAfterPickup);
    assert(!r.hand.includes(0));

    r.mode = 'map';
    page = 'map';
    choose('fight');
    assert.equal(r.mode, 'battle');
    assert.equal(r.turnStartStrength, 0);
    assert.equal(combatCard(0).fx.d, 6);
  })()`, h.context);
  console.log('PASS 硬質化と巨人の血の戦闘効果、特殊カードの消費、次の戦闘へのリセット');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
