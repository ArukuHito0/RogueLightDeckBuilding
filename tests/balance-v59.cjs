const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('balance-v59');h.context.assert=assert;await vm.runInContext(`(async()=>{
render=()=>save();animateEntity=async()=>{};const id=n=>HUNTER_IDS[n];
function reset(effects=[]){S.run={characterId:'hunter',hp:40,max:65,str:0,agility:0,energy:20,energyMax:3,turn:1,floor:1,act:1,block:0,hand:[],draw:[],discard:[],exhausted:[],deck:[],relics:[],carriedRelic:{effects},battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,atk:10,intent:'attack',hits:1,behavior:'ash',baseAtk:10}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function use(n){S.run.hand.push(id(n));base.play(S.run.hand.length-1);}
assert.equal(CHARACTERS.hunter.hp,80);assert.equal(CHARACTERS.wanderer.hp,70);
let r=reset();r.enemies[0].hp=1;dealDamage(r.enemies[0],1);assert.equal(r.hp,45);assert.equal(r.str,1);dealDamage(r.enemies[0],1);assert.equal(r.hp,45);assert.equal(r.str,1);
r=reset();use('衰弱');assert(r.exhausted.includes(id('衰弱')));assert.equal(r.enemies[0].laceration,2);
r=reset();assert(!canPlayHunterCard(combatCard(id('手負いの一撃')),r));r.hp=20;assert(!canPlayHunterCard(combatCard(id('手負いの一撃')),r));r.hp=19;assert(canPlayHunterCard(combatCard(id('手負いの一撃')),r));
r=reset();use('風切り');assert.equal(r.enemies[0].laceration,4);r.energy=3;use('切り刻む');assert.equal(r.enemies[0].laceration,8);assert.equal(r.energy,0);
r=reset();use('過程');use('成長');assert.equal(r.energy,18);for(let n=0;n<6;n++)evolveCardInstance(r,id('牙'));assert.equal(r.block,48);assert.equal(r.str,2);assert.equal(r.evolutionCount,6);
r=reset();use('進化の神秘');assert.equal(r.energy,19);assert.equal(combatCard(id('噛みつき')).cost,0);use('麻痺毒');assert.equal(r.enemies[0].str,-4);await endTurn();assert.equal(r.hp,34);assert.equal(r.enemies[0].str,0);
// Search only evolvable instances, respect pile ownership and hand capacity.
r=reset();r.draw=[0,id('牙'),id('大喰らい'),id('角突き')];use('進化の兆し');assert.equal(r.hunterChoice.remaining,2);assert.deepEqual(hunterChoiceCandidates(r).map(x=>C[x.id].name),['牙','角突き']);chooseHunterCard(hunterChoiceCandidates(r)[1].index);chooseHunterCard(hunterChoiceCandidates(r)[0].index);assert(!r.hunterChoice);assert.equal(r.evolutionCount||0,0);assert.deepEqual(r.draw,[0,id('大喰らい')]);assert.deepEqual(r.hand,[id('角突き'),id('牙')]);
r=reset();r.discard=[id('噛みつき'),id('大喰らい'),0];use('呼び声');assert.equal(hunterChoiceCandidates(r).length,1);chooseHunterCard(hunterChoiceCandidates(r)[0].index);assert.equal(r.hand[0],id('噛みつき'));assert(r.discard.includes(id('呼び声')));
r=reset();r.draw=[id('大喰らい')];use('進化の兆し');assert(!r.hunterChoice);r.hand=Array(9).fill(0);r.draw=[id('牙'),id('爪')];use('進化の兆し');assert.equal(r.hunterChoice.remaining,1);chooseHunterCard(hunterChoiceCandidates(r)[0].index);assert.equal(r.hand.length,10);assert(!r.hunterChoice);
r=reset(['double_cards']);r.draw=[id('牙'),id('牙'),id('牙'),id('牙')];use('進化の兆し');assert.equal(r.hunterChoice.remaining,4);assert(combatDesc(combatCard(id('進化の兆し')),r).includes('4枚'));
// Stun suppresses guard/buff and boss follow-up effects, then expires.
for(const intent of ['attack','guard','buff']){r=reset();const e=r.enemies[0];e.intent=intent;e.guardAmount=10;e.guardStrength=2;applyHunterStun(e);await endTurn();assert.equal(r.hp,40);assert.equal(e.block,0);assert.equal(e.str,0);assert.equal(e.atk,10);assert(!e.hunterStun);assert.equal(e.intent,'attack');}
for(const phase of [1,2]){r=reset();r.kind='boss';const e=r.enemies[0];Object.assign(e,{boss:true,behavior:null,audienceRevision:1,audienceUsed:true,kingPhase:phase,kingStep:phase===1?3:0,kingCycles:0});bossPlan(r);applyHunterStun(e);bossPlan(r);await endTurn();assert.equal(r.hp,40);assert.equal(r.str,0);assert.equal(e.str,0);assert.equal(e.block,0);assert(!e.hunterStun);assert.equal(e.kingStep,phase===1?4:1);}
assert.equal(keywords.スタン,'そのターンの敵を行動不能にする。');
assert.equal(Object.keys(HUNTER_ICON_SPEC).length,78);const icons=C.filter(c=>c.characterId==='hunter').map(c=>c.icon);assert.equal(new Set(icons).size,new Set(Object.values(HUNTER_ICON_SPEC)).size);assert(icons.every(x=>(x.match(/<path /g)||[]).length===1));assert(icons.every(x=>x.startsWith('<svg')));for(const c of C.filter(c=>c.characterId==='hunter'))assert(HUNTER_ICON_SPEC[c.name],c.name);
for(const n of ['進化の兆し','呼び声']){r=reset();assert(allowedRunCard(C[id(n)],r));r.characterId='wanderer';assert(!allowedRunCard(C[id(n)],r));}
})()`,h.context);console.log('PASS v59: all balances, HP60 kill strength, 3-stage growth, filtered draw/discard choices/caps/relic, stun across all action types and boss followups, 78 unadorned name-matched vector icons and character pools');})().catch(e=>{console.error(e);process.exit(1)});
