const {workerHarness} = require('./ai-stage1.cjs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const h = workerHarness();
  await h.run('expanded-balance');
  h.context.assert = assert;
  h.context.importScripts('balance-settings.js', 'balance-runtime.js');
  vm.runInContext(`
    const baseSettings = {version:1,cards:{},enemyHp:{},cardEffects:{},solo:{},pairs:{}};
    balanceApply(baseSettings);
    assert.equal(balanceDefaults.enemyHp.length,74);
    assert.ok(balanceDefaults.enemyHp.every(enemy=>enemy.sections.length>0));
    for (const act of [1,2,3,4,5,6,7]) {
      assert.ok(balanceDefaults.enemyActions.some(row=>row.act===act));
      assert.ok(balanceDefaults.enemyHp.some(row=>row.act===act&&row.kind==='boss'));
      assert.ok(balanceDefaults.pairs.some(row=>row.act===act));
    }
    for (const pool of balanceWeightGroups) {
      if (pool[0].act===7) continue;
      const settings = balanceValidate(baseSettings);
      const selected = pool.at(-1);
      for (const row of pool) settings[row.key][row.id] = Number(row===selected);
      balanceApply(settings);
      const candidates = pool.map(row=>row.id.replace(/^\\d+:/,'').split('+'));
      assert.deepEqual(balanceEncounterPick(selected.act,candidates),candidates.at(-1));
      settings[selected.key][selected.id]=0;
      assert.throws(()=>balanceValidate(settings),/重み/);
    }
    balanceApply({...baseSettings,enemyHp:{'4:branch':30,'4:seed':21},enemyActions:{'4:tree:1:hostsBud':7,'4:flower:1:mark':3},pairs:{'4:beetle+ape':8}});
    const forestFlower = forestRedesignedFoe('flower');
    assert.equal(forestNewAction({enemies:[forestFlower]},forestFlower).mark,3);
    assert.equal(forestRedesignedFoe('seed').hp,21);
    const threshold = balanceDefaults.cards.find(card=>card.name==='巨人の血').effects.find(field=>field.key==='strRegenThreshold');
    balanceApply({...baseSettings,cardEffects:{[threshold.id]:7},enemyActions:{
      '1:ash:1:d':19,'3:star:2:weak':3,'7:thief:2:fallback.d':17
    }});
    const ash = makeFoe('灰かぶり','',18,4,'ash');
    prepareEncounterTurn({enemies:[ash],turn:1});
    assert.equal(ash.atk,19);
    const star = desertFoe('star',1);
    planDesert({enemies:[star]});
    assert.equal(star.snowAction.weak,3);
    const run = {turn:2,enemies:[]};
    const thief = goldFoe('thief',run);
    thief.actionStep=1;
    assert.equal(goldAction(run,thief,0).d,17);
    const adjustedCard = C[threshold.id.split(':')[0]];
    assert.match(adjustedCard.desc,/筋力が7以上/);
    balanceApply(baseSettings);
    prepareEncounterTurn({enemies:[ash],turn:1});
    assert.equal(ash.atk,4);
    assert.match(adjustedCard.desc,/筋力が4以上/);
    balanceApply({...baseSettings,enemyHp:{'1:boss':300},enemyActions:{
      '1:boss:9:triggerHp':120,'1:boss:9:stunTurns':2,'1:boss:9:s':5,'1:boss:5:d':40,
      '1:plated:passive:initialBlock':62,
    }});
    const king = {boss:true,hp:250,max:250};
    const kingRun = {act:1,enemies:[king]};
    bossPlan(kingRun);
    assert.equal(king.max,300);
    king.hp=121;
    bossPlan(kingRun);
    assert.equal(king.audienceUsed,false);
    king.hp=120;
    bossPlan(kingRun);
    assert.equal(king.kingStep,-2);
    assert.equal(king.str,5);
    for (const step of [-1,0]) {
      assert.equal(king.intent,'stunned');
      finishKingAction(kingRun,king,true);
      assert.equal(king.kingStep,step);
      bossPlan(kingRun);
    }
    assert.equal(king.intent,'attack');
    assert.equal(enemyAttack(king),45);
    assert.equal(eliteEncounter('plated',3)[0].block,62);
  `, h.context);
  console.log('PASS encounter pools, enemy action values, card conditions and legacy settings');
})().catch(error => { console.error(error); process.exitCode = 1; });
