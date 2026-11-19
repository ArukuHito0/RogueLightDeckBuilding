const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50){if(r.lucky.choice.kind==='top'){const p=luckyTopPrepare(r);if(!p.remaining)luckyFinishChoice(r);else{const i=p.candidates.findIndex(x=>r.hand.includes(x.id));luckyChoose(i);}}else luckyChoose(0);}assert(guard<50);}
assert.equal(LUCKY_ROWS.length,52);assert.equal(CHARACTERS.lucky.hp,77);
assert(luckyRoles([1,0,1,0,1]).includes('blackjack'));assert(luckyRoles([1,0,1,0,1]).includes('pair'));assert(luckyRoles([0,1,2,3,2]).includes('straight'));assert(luckyRoles([1,'X',1,0,1]).includes('blackjack'));assert(luckyRoles([3,3,'X',3,3]).includes('three'));
let r=reset();r.draw=Array(5).fill(0);use(r,'spin');assert.equal(r.enemies[0].hp,9985);assert.equal(r.lucky.slotCount,1);assert.equal(r.draw.length,5);
r=reset();r.draw=[1];r.discard=[1,1];use(r,'spin');assert.equal(r.enemies[0].hp,10000);assert.equal(r.lucky.failures,1);assert.equal(r.draw.length,3);assert.equal(r.discard.length,1);
r=reset();const folded=add(r,'jump');use(r,'chip');assert(r.lucky.choice);luckyChoose(0);assert.equal(r.block,10);assert.equal(r.enemies[0].hp,9990);assert(r.discard.includes(folded));assert.deepEqual(Array.from(r.lucky.hand),[0,3]);assert.equal(r.energy,20);
r=reset();use(r,'force');r.draw=Array(12).fill(0);use(r,'cash');assert.equal(r.lucky.drawCount,4);assert.equal(r.str,1);assert.equal(r.hand.length,4);
r=reset();use(r,'loan');assert.equal(r.energy,22);await endTurn();assert.equal(r.energy,2);assert.equal(r.lucky.debt,0);
r=reset();r.hand=[luckyInstance(r,LUCKY_ROLE_IDS.three)];base.play(0);assert.equal(r.str,2);assert.equal(r.agility,2);assert.equal(r.lucky.hand.length,0);
r=reset();r.lucky=luckyState(r);r.lucky.hand=[1,0,1,0];use(r,'attack');assert.equal(r.lucky.choice.kind,'role');luckyChoose(r.lucky.choice.candidates.findIndex(x=>x.role==='blackjack'));assert(r.hand.some(id=>C[id].role));assert.equal(r.lucky.hand.length,0);await endTurn();assert(r.hand.some(id=>C[id].role));
r=reset();const z=add(r,'flip','discard');r.draw=[1,1];r.hand=[luckyInstance(r,LUCKY_ROLE_IDS.five)];base.play(0);assert(r.exhausted.includes(z));assert.equal(r.lucky.hand.length,0);assert.equal(r.enemies[0].hp,9996);
r=reset();r.draw=Array(10).fill(0);use(r,'custom');use(r,'seven');assert.equal(r.lucky.lastSlot.seen.length,7);assert.equal(r.enemies[0].hp,9951);
r=reset();const id=add(r,'streakBlock');r.draw=Array(8).fill(1);base.play(0);assert.equal(r.block,7);assert.equal(r.lucky.streak[id],2);r.hand.push(r.discard.pop());base.play(0);assert.equal(r.block,21);assert.equal(r.lucky.streak[id],3);
r=reset();use(r,'free');const sp=add(r,'spin');assert.equal(combatCard(sp).cost,0);r.draw=Array(5).fill(0);base.play(r.hand.indexOf(sp));assert.equal(r.lucky.nextFree,0);
r=reset();r.carriedRelic={effects:['double_cards']};const flip=add(r,'flip');r.draw=Array(4).fill(0);assert.equal(combatCard(flip).cost,1);base.play(0);assert.equal(r.hand.length,2);assert.equal(r.lucky.drawCount,2);

r=reset();use(r,'double');r.draw=Array(8).fill(0);use(r,'spin');assert.equal(r.enemies[0].hp,9970);assert.equal(r.lucky.slotCount,1);
r=reset();use(r,'guarantee');r.draw=Array(5).fill(1);const se=add(r,'seven');assert.equal(combatCard(se).cost,3);base.play(r.hand.indexOf(se));assert.equal(r.enemies[0].hp,9951);assert.equal(r.lucky.nextGuarantee,0);
r=reset();use(r,'retry');r.draw=Array(5).fill(1);use(r,'attack');assert.equal(r.lucky.slotCount,2);assert.equal(r.lucky.failures,2);
r=reset();use(r,'startup');r.draw=Array(9).fill(0);await endTurn();assert.equal(r.hand.length,7);assert.equal(r.lucky.choice.kind,'exhaust');luckyChoose(0);assert.equal(r.hand.length,6);assert.equal(r.lucky.drawCount,2);
r=reset();use(r,'mulligan');add(r,'jump','draw');r.draw.push(0,1,2,3);await endTurn();assert.equal(r.lucky.choice.kind,'discard');luckyChoose(r.lucky.choice.candidates.findIndex(x=>C[x.id]?.fx.luckyKey==='jump'));luckyFinishChoice(r);assert.equal(r.block,10);assert.equal(r.enemies[0].hp,9990);
r=reset();r.hand=[0,0,1,1];luckyPrepareInstances(r);assert.equal(new Set(r.hand).size,4);
r=reset();r.draw=[0,1,2,3];const ti=add(r,'take');r.lucky=luckyState(r);r.lucky.nextGuarantee=1;r.lucky.guaranteeCost=1;base.play(r.hand.indexOf(ti));assert.equal(r.lucky.choice.kind,'take');const taken=r.lucky.choice.candidates[0].id;luckyChoose(0);assert(r.hand.includes(taken));assert.equal(combatCard(taken).cost,0);
r=reset();use(r,'master');r.lucky.hand=[];for(const id of [0,2,0,2,0])luckyRecordPoker(r,C[id]);assert.equal(r.str,1);assert.equal(r.lucky.queue[0].op,'roleChoice');luckyPump(r);finishChoices(r);
r=reset();use(r,'mystery');const mi=add(r,'payout');const price=combatCard(mi).cost;assert(price>=0&&price<=3);assert.equal(combatCard(mi).cost,price);assert.equal(luckyNumber(C[mi]),2);
for(const [key]of LUCKY_ROWS){r=reset();r.draw=Array(9).fill(0);r.discard=[1];add(r,'jump');add(r,'gather');use(r,key);finishChoices(r);assert(!r.lucky.queue.length,key+' left queue');assert(!Object.keys(r.lucky.frames).length,key+' left frame');}
S.selectedCharacter='lucky';r=reset();assert.equal(codexPool('lucky').filter(c=>!c.evolution).length,52);for(const c of codexPool('lucky')){assert(allowedRunCard(c,r));assert(!allowedRunCard(c,{characterId:'hunter'}));}assert(characterSelection().includes('ラッキー・ガール'));assert(book().length>0);
})()`,h.context);console.log('PASS v89: 52 cards, poker wildcards, role selection/retention, folds, slot refill, growth, debt, relic and every card resolution');})().catch(e=>{console.error(e);process.exit(1)});
