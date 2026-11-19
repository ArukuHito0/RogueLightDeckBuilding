const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('v50-test');h.context.assert=assert;await vm.runInContext(`(async()=>{
const id=n=>C.find(c=>c.name===n).id;
function reset(effects=[]){S.run={hp:70,max:70,block:0,str:0,agility:0,energy:99,energyMax:3,hand:[],draw:[0,1,2,3,4],discard:[],exhausted:[],enemies:[{hp:1000,max:1000,block:0,poison:0,intent:'attack',atk:5,hits:1}],deck:[0,1],turn:1,kind:'fight',mode:'battle',relics:[],carriedRelic:{effects},generatedCards:[],battleCards:[],potions:[]};page='battle';busy=false;target=0;return S.run}
function use(n){let r=S.run;r.hand.push(typeof n==='number'?n:id(n));base.play(r.hand.length-1)}
assert(C[79].runOnly);assert(!packPool().includes(C[79]));assert.equal(C[37].cost,2);assert(C[37].fx.ex);assert.equal(C[61].name,'装甲看破');assert.equal(C[72].cost,5);assert.equal(C[10].cost,2);
for(const k of [26,83,88,67,68,80]){assert(C[k].retired);assert(!packPool().includes(C[k]));assert(!allowedRunCard(C[k]));}assert(!C[66].retired);
let r=reset();use('鍛錬の一撃');assert.equal(r.enemies[0].hp,992);assert.equal(r.str,0);assert.equal(r.nextAttackBonus,3);use(1);assert.equal(r.nextAttackBonus,3);assert.equal(previewDamage(combatCard(3),r,r.enemies[0]),7);use(3);assert.equal(r.enemies[0].hp,978);assert.equal(r.nextAttackBonus,0);use(0);assert.equal(r.enemies[0].hp,972);
r=reset();use('鍛錬の一撃');use('鍛錬の一撃');assert.equal(r.nextAttackBonus,3);assert.equal(r.enemies[0].hp,981);
r=reset();use('正々堂々');assert.equal(r.enemies[0].hp,992);assert.equal(r.str,2);assert.equal(r.enemies[0].str,1);assert.equal(enemyAttack(r.enemies[0]),6);
r=reset();r.hand=[0,1];use('捕食');assert.equal(r.str,1);assert.equal(r.pendingChoice.kind,'exhaust');assert.equal(r.pendingChoice.draw,0);chooseHand(0);assert.deepEqual(Array.from(r.exhausted),[0]);assert.equal(r.hand.length,1);assert.equal(r.draw.length,5);assert(!r.pendingChoice);
r=reset();use('血の恵み');assert.equal(r.specialUses[id('血の恵み')],1);assert(!r.exhausted.length);loseHP(r,1);assert.equal(r.str,1);loseHP(r,1);assert.equal(r.str,1);r.enemyPhase=true;dealDamage(r,1);assert.equal(r.str,1);r.turn++;applyTurnStartBuffs(r);loseHP(r,1);assert.equal(r.str,2);
r=reset();use('血の恵み');await endTurn();assert.equal(r.str,0);loseHP(r,1);assert.equal(r.str,1);r=JSON.parse(JSON.stringify(r));S.run=r;loseHP(r,1);assert.equal(r.str,1);
r=reset();use('血の恵み');r.passion=1;r.passionHp=1;r.turn++;applyTurnStartBuffs(r);assert.equal(r.str,1);
r=reset();use('焼身');gainBlock(r,3,'passive');gainBlock(r,3,'relic');assert.equal(r.enemies[0].hp,1000);gainBlock(r,3,'card');assert.equal(r.enemies[0].hp,996);
r=reset();use('血の恵み');use('鍛錬の一撃');r.mode=page='map';r.deck=[0,1,2,3,4];choose('fight');assert.equal(r.bloodBlessing,0);assert.equal(r.nextAttackBonus,0);
for(const n of ['正々堂々','捕食','血の恵み']){const c=C[id(n)];assert(c.runOnly);assert.equal(c.rarity,'rare');}assert(isSpecialCard(C[id('血の恵み')]));
})()`,h.context);console.log('PASS v50: balance, removals, next attack, enemy strength, selected exhaust without draw, own-turn HP trigger/reload/reset, card-only burn');})().catch(e=>{console.error(e);process.exit(1)});
