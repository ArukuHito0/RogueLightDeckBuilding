const {workerHarness} = require('./ai-stage1.cjs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const h = workerHarness();
  await h.run('card-pools');
  h.context.importScripts('balance-settings.js', 'balance-runtime.js');
  h.context.assert = assert;
  vm.runInContext(`
    const ids = cards => cards.map(c => c.id).sort((a,b) => a-b);
    const expected = pool => Object.values(cardPoolByRarity[pool]).flat().sort((a,b) => a-b);
    assert.equal(packPool().length, 54);
    assert.deepEqual(ids(packPool()), expected('basic'));
    for (const [id, rarity] of [[202,'rare'],[145,'rare'],[138,'common'],[89,'epic']]) {
      assert(cardPoolByRarity.basic[rarity].includes(id));
      assert.equal(C[id].rarity, rarity);
    }
    assert(!packPool().some(c => c.id === 72));
    assert(C[21].retired);
    assert(cardPoolByRarity.wanderer.rare.includes(72));
    for (const characterId of ['wanderer','hunter','lucky']) {
      const r = {characterId, deck:[], relics:[]};
      assert.equal(expected(characterId).length, 30);
      assert.deepEqual(ids(runPackPool(r)), expected(characterId));
      const codex = codexPool(characterId);
      assert.deepEqual(ids(codex.filter(c => c.devolveTo == null)), expected(characterId));
      const evolutions = ids(codex.filter(c => c.devolveTo != null));
      assert.deepEqual(evolutions, characterId === 'hunter'
        ? [94,95,97,98,100,101,103,104,106,107,109,110,112,113,115,116,160,161]
        : []);
      assert(!allowedRunCard(C[183],r));
    }

    render = () => {};
    S.run = null;
    S.relicQueue = [];
    S.relicReroll = null;
    S.selectedCharacter = 'wanderer';
    S.deck = [183,0,0,0,1,1,1,3,3,4];
    start();
    choose('fight');
    const r = S.run;
    page = 'battle';
    busy = false;
    r.hand = [183];
    r.draw = [0,0,0,0,0];
    r.relics = [];
    r.energy = 3;
    r.enemies = [{hp:100,max:100,block:0,str:0,poison:0,atk:0,intent:'guard'}];
    canPresentBattleCards = () => false;
    target = 0;
    base.play(0);
    assert.equal(r.energy, 2);
    assert(r.enemies[0].hp < 100);
    assert.equal(r.lucky.slotCount, 1);
    assert.equal(r.lucky.hand.length, 0);
    assert(!C[18].retired);
    assert(!allowedRunCard(C[18],r));
  `, h.context);
  console.log('PASS 基礎・潜在プール、旧カードの保持、共通スロットの戦闘処理');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
