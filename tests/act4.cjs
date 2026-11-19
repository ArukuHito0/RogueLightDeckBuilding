const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('act4');h.context.assert=assert;await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
S.run=null;S.relicQueue=[];S.relicReroll=null;S.clearedActs=[1,2,3];S.history=[{act:3,outcome:'win'}];S.destinationAct=4;migrateDestinations();assert.equal(S.destinationAct,4);assert(destinationUnlocked(4));S.deck=[0,0,0,1,1,1,3,3,4,4];start();choose('boss');let r=S.run;assert.equal(r.act,4);assert.deepEqual(r.enemies.map(e=>e.act4Kind),['root','bloom','tree']);r.hp=r.max=1000;r.characterId='wanderer';
let e=forestFoe('moth');r.enemies=[e];e.bud=4;e.block=10;dealDamage(e,5,{attack:true,attacker:r});assert.equal(e.bud,4);dealDamage(e,8,{attack:true,attacker:r});assert.equal(e.bud,3);e.block=0;dealDamage(e,1,{ignoreBlock:true});assert.equal(e.bud,3);e.laceration=2;dealDamage(e,1,{attack:true,attacker:r});assert.equal(e.bud,2);e.laceration=0;e.hp=42;for(let i=0;i<3;i++)dealDamage(e,1,{attack:true,attacker:r});assert.equal(e.bud,0);
e.bud=4;e.actionStep=1;planForest(r);assert.equal(e.atk,22);dealDamage(e,1,{attack:true,attacker:r});assert.equal(e.atk,18);prepareAct4Action(r,e);forestExecute(r,e);assert.equal(e.bud,0);
e=forestFoe('flower');r.enemies=[e,forestFoe('beetle')];e.bud=4;e.actionStep=1;r.enemies.forEach(x=>x.hp-=30);planForest(r);prepareAct4Action(r,e);forestExecute(r,e);assert.equal(e.hp,36);assert.equal(r.enemies[1].hp,48);assert.equal(e.bud,0);
for(let bud=0;bud<=5;bud++)for(let existing=0;existing<=3;existing++){e=forestFoe('queen');e.bud=bud;e.actionStep=2;r.enemies=[e,...Array.from({length:existing},()=>forestFoe('larva'))];planForest(r);prepareAct4Action(r,e);forestExecute(r,e);assert.equal(r.enemies.filter(x=>x.act4Kind==='larva').length,existing+Math.min(Math.ceil(bud/2),3-existing));assert.equal(e.bud,0);assert(r.enemies.slice(1+existing).every(x=>x.summonedTurn===r.turn));}
r.enemies=[forestFoe('colony'),forestFoe('branch'),forestFoe('branch')];e=r.enemies[0];e.actionStep=2;r.enemies[1].hp=r.enemies[2].hp=0;r.enemies[1].bud=7;r.enemies[1].poison=8;r.enemies[1].str=9;planForest(r);prepareAct4Action(r,e);forestExecute(r,e);assert.equal(r.enemies[1].hp,24);assert.equal(r.enemies[1].poison,0);assert.equal(r.enemies[1].str,0);assert.equal(r.enemies[2].hp,0);assert.equal(r.enemies[1].summonedTurn,r.turn);dealDamage(e,999,{attack:true,attacker:r});assert(r.enemies.every(x=>x.hp===0));
r.enemies=[forestFoe('root'),forestFoe('bloom'),forestFoe('tree')];r.turn=1;planForest(r);prepareAct4Action(r,r.enemies[2]);forestExecute(r,r.enemies[2]);assert.equal(r.enemies[0].bud,5);r.turn=2;planForest(r);assert.equal(r.enemies[0].atk,26);r.enemies[0].hunterStun=true;planForest(r);assert.equal(r.enemies[0].intent,'stunned');assert.equal(r.enemies[0].bud,5);r.turn=3;r.enemies[2].hp=100;planForest(r);prepareAct4Action(r,r.enemies[1]);forestExecute(r,r.enemies[1]);assert.equal(r.enemies[2].hp,130);assert.equal(r.enemies[1].bud,0);r.enemies[0].hp=0;r.enemies[0].poison=30;r.turn=4;planForest(r);prepareAct4Action(r,r.enemies[2]);forestExecute(r,r.enemies[2]);assert.equal(r.enemies[0].hp,40);assert.equal(r.enemies[0].poison,0);assert.equal(r.enemies[0].bud,0);
r= S.run;r.enemies=forestEncounter(r,'boss');r.turn=1;r.hp=r.max=1000;r.mode=page='battle';busy=false;r.hand=[];r.draw=[0,1,0,1,0];r.discard=[];r.block=0;planForest(r);await endTurn();assert.equal(r.turn,2);assert.equal(r.enemies[0].bud,5);assert.equal(r.enemies[1].bud,5);const before=r.hp;await endTurn();assert.equal(before-r.hp,34);assert.equal(r.enemies[0].bud,0);r.enemies[0].hp=10;dealDamage(r.enemies[2],999,{attack:true,attacker:r});assert(r.enemies.every(e=>e.hp===0));assert(r.enemies[0].forestDismissed);
const saved=JSON.parse(JSON.stringify(r));saved.enemies=[forestFoe('queen'),forestFoe('larva')];saved.enemies[0].bud=3;saved.enemies[0].actionStep=2;S.run=saved;planForest(saved);assert.equal(saved.enemies[0].snowAction.count,2);assert.equal(saved.enemies[0].bud,3);
S.run=r;r.mode=page='battle';busy=false;r.enemies=[forestFoe('beetle')];r.hand=[0,0];r.draw=[];r.discard=[];r.exhausted=[];r.energy=3;r.hp=10;r.block=100;
const mark={kind:'parasitism',amount:4};
assert(applyCardMark(r,'hand',0,mark));
const marked=r.hand[0];
assert.notEqual(marked,r.hand[1]);assert.equal(r.hand[1],0);
assert(!applyCardMark(r,'hand',0,{...mark,amount:9}));
assert(card(marked).includes('寄生 4'));assert(!card(0).includes('寄生 4'));
const markSave=JSON.parse(JSON.stringify(r));
delete C[marked];
for(const entry of markSave.battleCards)hydrateBattleCard(entry);
S.run=r=markSave;
r.energy=0;base.play(0);assert.equal(r.erosion,undefined);
r.energy=3;base.play(0);assert.equal(r.erosion,4);assert(r.discard.includes(marked));
r.hand.unshift(r.discard.splice(r.discard.indexOf(marked),1)[0]);
base.play(0,{free:true});assert.equal(r.erosion,8);
r.hand=[0];base.play(0,{free:true});assert.equal(r.erosion,8);
assert.equal(r.hp,10);assert(!resolveErosion(r,r));
const enemyAtThreshold=r.enemies[0];enemyAtThreshold.erosion=enemyAtThreshold.hp;enemyAtThreshold.hunterStun=true;
const priorVictory=victory;let won=false;victory=()=>{won=true;priorVictory();};await endTurn();
assert.equal(enemyAtThreshold.hp,0);assert(won);assert.equal(r.erosion,undefined);assert.equal(r.cardMarks,undefined);
victory=priorVictory;
S.run=r;r.mode=page='battle';r.enemies=[forestFoe('moth')];r.hp=8;r.erosion=8;
let lost=false;finish=success=>{lost=!success;};await endTurn();assert(lost);assert.equal(r.hp,0);assert.equal(r.enemies[0].bud,0);

})()`,h.context);console.log('PASS ACT4 bud hits/blocks/laceration, all summon counts, revival, boss order, actual turns, unlock and serialized state');})().catch(e=>{console.error(e);process.exit(1)});
