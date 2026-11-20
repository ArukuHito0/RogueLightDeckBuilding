const {workerHarness} = require('./ai-stage1.cjs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const h = workerHarness();
  await h.run('balance-card-effects');
  h.context.assert = assert;
  h.context.importScripts('balance-settings.js', 'balance-runtime.js');
  vm.runInContext(`
    render = () => {};
    toast = () => {};
    animateEntity = async () => {};
    canPresentBattleCards = () => false;
    const cases = [
      [46, 'b', 3, '3ブロック', r => r.block],
      [LUCKY_IDS.spin, 'd', 8, '8ダメージを3回', r => (100 - r.enemies[0].hp) / 3],
      [LUCKY_IDS.attack, 'd', 22, '22ダメージ', r => 100 - r.enemies[0].hp],
      [LUCKY_IDS.flip, 'd', 3, '3ダメージ', r => 100 - r.enemies[0].hp],
      [LUCKY_IDS.shield, 'b', 21, 'ブロック21', r => r.block],
      [5, 'p', 1, '毒を1付与', r => r.enemies[0].poison],
      [TRADE_CARD_ID, 'chooseExhaust', 1, '1枚除外する', r => r.pendingChoice?.remaining],
      [12, 'd', 21, '21ダメージ', r => 100 - r.enemies[0].hp],
      [13, 'b', 7, '7ブロック', r => r.block],
      [14, 'p', 4, '毒を4付与', r => r.enemies[0].poison],
      [15, 'hpLoss', 4, 'HPを4失う', r => 77 - r.hp],
    ];
    const original = cases.map(([id]) => C[id].desc);
    const published = {...ASHBOUND_BALANCE_SETTINGS,
      cardEffects:Object.fromEntries(cases.map(([id,key,value]) => [id+':'+key,value]))};
    balanceApply(published);
    for (const [id, field, value, phrase, result] of cases) {
      const card = C[id];
      const r = S.run = {
        characterId:card.characterId ?? 'wanderer', hp:77, max:77, block:0, str:0,
        agility:0, energy:20, energyMax:3, turn:1, act:1, floor:1, hand:[id,1],
        draw:Array(8).fill(card.fx.slot ? id : 0), discard:[], exhausted:[],
        deck:[0,1], relics:[], battleCards:[], generatedCards:[], potions:[],
        enemies:[{hp:100,max:100,block:0,str:0,poison:0,atk:1,intent:'attack'}],
        mode:'battle', kind:'fight'
      };
      page = 'battle';
      target = 0;
      busy = false;
      assert.ok(card.desc.includes(phrase), card.name + ' 図鑑 ' + card.desc);
      const combatText = combatDesc(combatCard(id), r);
      assert.ok(combatText.includes(phrase), card.name + ' 戦闘 ' + combatText);
      base.play(0);
      assert.equal(result(r), value, card.name + ' ' + field);
    }
    const specials = [
      ['腐食',{bleedRepeat:0,bleedDecay:4},'減少量+4',r=>{r.enemies[0].laceration=8;decayHunterStatus(r,r.enemies[0]);assert.equal(r.enemies[0].laceration,3);assert.equal(r.bleedRepeat,0);}],
      ['成長',{evolutionStrengthInterval:2},'2回進化',r=>{const id=C.find(c=>c?.evolveTo!=null).id;const before=r.str;evolveCardInstance(r,id);assert.equal(r.str,before);evolveCardInstance(r,id);assert.equal(r.str,before+1);}],
      ['獣の狩り',{beastHunt:0,beastHuntBleed:4},'裂傷4',r=>{applyTurnStartBuffs(r);assert.equal(r.hp,77);assert.equal(r.enemies[0].laceration,4);}],
      ['鍛え直し',{forge:4},'ダメージ+4',r=>{r.hand=[0];base.play(0);assert.equal(r.strikeBonus,4);}],
      ['激情',{passionBlock:8},'8ブロック',r=>{applyTurnStartBuffs(r);assert.equal(r.hp,76);assert.equal(r.block,8);}],
      ['灰の守り',{engineBlock:7},'7ブロック',r=>{exhaustCard(r,0);assert.equal(r.block,7);}],
    ];
    for(const [name,fields,phrase,verify] of specials){
      const {id}=C.find(c=>c?.name===name);
      balanceApply({...ASHBOUND_BALANCE_SETTINGS,cardEffects:Object.fromEntries(Object.entries(fields).map(([key,value])=>[id+':'+key,value]))});
      const c=C[id];
      const r=S.run={characterId:c.characterId??'wanderer',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,
        hand:[id,1],draw:[0,0],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],
        enemies:[{hp:100,max:100,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};
      page='battle';target=0;busy=false;
      assert.ok(c.desc.includes(phrase),name+' '+c.desc);
      assert.ok(combatDesc(combatCard(id),r).includes(phrase),name+' 戦闘説明');
      base.play(0);
      verify(r);
    }
    balanceApply({...ASHBOUND_BALANCE_SETTINGS,cardEffects:{'0:d':9,[LUCKY_IDS.custom+':script.drawPenalty']:2}});
    assert.match(C[0].desc, /9ダメージ/);
    assert.ok(C[LUCKY_IDS.custom].desc.includes('ターン開始時のドロー減少枚数 1 → 2'));
    balanceApply(ASHBOUND_BALANCE_SETTINGS);
    assert.deepEqual(cases.map(([id]) => C[id].desc), original);
  `, h.context);
  console.log('PASS all 17 published card effects in reference text and combat');
})().catch(error => { console.error(error); process.exitCode = 1; });
