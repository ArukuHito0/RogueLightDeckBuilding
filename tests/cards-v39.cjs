const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('v39-test');h.context.assert=assert;await vm.runInContext(`(async()=>{
const id=n=>C.find(c=>c.name===n).id;
function reset(effects=[]){S.run={hp:70,max:70,block:0,str:0,agility:0,energy:99,hand:[],draw:[0,1,2,3,4],discard:[],exhausted:[],enemies:[{hp:1000,max:1000,block:0,poison:0,intent:'attack',atk:5,hits:1}],deck:[0,1],turn:1,kind:'fight',mode:'battle',relics:[],carriedRelic:{effects},generatedCards:[],battleCards:[],potions:[]};page='battle';busy=false;target=0;return S.run}
function use(n){let r=S.run;r.hand.push(typeof n==='number'?n:id(n));base.play(r.hand.length-1)}
let r=reset();addPoison(r.enemies[0],5);r.enemies[0].poison=2;use('再感染');assert.equal(r.enemies[0].poison,7);assert.equal(r.enemies[0].poisonTotal,10);assert(r.exhausted.includes(id('再感染')));
r=reset();r.enemies.push({...r.enemies[0]});addPoison(r.enemies[0],4);addPoison(r.enemies[1],6);r.agility=2;use('毒の鱗');assert.equal(r.block,12);
r=reset();use('汚染地域');assert.equal(r.enemies[0].poison,0);applyTurnStartBuffs(r);assert.equal(r.enemies[0].poison,2);applyTurnStartBuffs(r);assert.equal(r.enemies[0].poisonTotal,4);
r=reset();use('毒纏い');use('双剣');assert.equal(r.enemies[0].poison,2);await endTurn();assert.equal(r.poisonCoat,0);let p=r.enemies[0].poison;use(0);assert.equal(r.enemies[0].poison,p);
r=reset();addPoison(r.enemies[0],5);use('共感');assert.equal(r.str,5);await endTurn();assert.equal(r.str,5);
r=reset();use('硬質化');assert.equal(r.plate,10);assert.equal(C[id('硬質化')].runOnly,false);assert.equal(C[id('硬質化')].cost,3);
r=reset();use('巨人の血');assert.equal(r.str,4);r.str=4;use('巨人の血');assert.equal(r.str,8);assert.equal(r.regen,5);
r=reset();use('灰の肉体');exhaustCard(r,1);exhaustCard(r,1);assert.equal(r.str,0);exhaustCard(r,1);assert.equal(r.str,1);use('灰の守り');exhaustCard(r,1);assert.equal(r.block,3);
r=reset();use('灰の一振り');assert(r.discard.includes(id('灰の一振り')));assert.equal(C[id('灰の一振り')].cost,1);use('灰の一投');assert(r.discard.includes(id('灰の一投')));use('血の槍');assert.equal(r.hp,68);
for(const n of ['灰の肉体','茨の園'])assert.equal(C[id(n)].rarity,'rare');
r=reset(['double_cards']);use(0);assert.equal(r.hp,68);use('汚染地域');assert.equal(r.poisonAura,4);use('共感');assert.equal(combatCard(id('共感')).fx.empathy,2);
r=reset(['poison_boost']);use('汚染地域');assert.equal(r.poisonAura,3);use('毒纏い');assert.equal(r.poisonCoat,2);use('再感染');assert.equal(r.enemies[0].poison,1);
r=reset(['double_cards']);assert(combatDesc(combatCard(id('灰の肉体')),r).includes('3枚除外するたび筋力+2'));
r=reset(['three_damage']);r.enemies[0].block=999;use('細切れ');assert.equal(r.str,1);assert.equal(r.damageCount,5);assert.equal(r.enemies[0].hp,1000);applyTurnStartBuffs(r);assert.equal(r.damageCount,0);dealDamage(r.enemies[0],10,{ignoreBlock:true});assert.equal(r.damageCount,0);use(0);use(0);assert.equal(r.str,1);use(0);assert.equal(r.str,2);
r=reset();r.enemies=[{...enemy('灰冠の王','♛',200,7),boss:true}];bossPlan(r);addPoison(r.enemies[0],12);dealDamage(r.enemies[0],70,{ignoreBlock:true});assert.equal(r.enemies[0].poison,0);assert.equal(r.enemies[0].poisonTotal,12);use('再感染');assert.equal(r.enemies[0].poison,12);assert.equal(r.enemies[0].poisonTotal,24);S.run=JSON.parse(JSON.stringify(r));assert.equal(S.run.enemies[0].poisonTotal,24);
for(const n of ['再感染','毒の鱗','汚染地域','毒纏い','共感']){assert(C[id(n)].runOnly);assert(AI_POLICY.tags(C[id(n)]).includes('poison'));}
assert(needsEnemy(C[id('共感')]));assert(needsEnemy(C[id('再感染')]));assert(!needsEnemy(C[id('毒の鱗')]));
})()`,h.context);console.log('PASS: six new cards, eight adjustments, poison history/cleanse/save, temporary buffs, relic hit/reset/blocked rules, AI tags and targeting');})().catch(e=>{console.error(e);process.exit(1)});
