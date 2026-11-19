const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50){if(r.lucky.choice.kind==='top'){const p=luckyTopPrepare(r);if(!p.remaining)luckyFinishChoice(r);else{const i=p.candidates.findIndex(x=>r.hand.includes(x.id));luckyChoose(i);}}else luckyChoose(0);}assert(guard<50);}

assert.equal(C[LUCKY_IDS.mystery].cost,1);assert.equal(C[LUCKY_IDS.mystery].name,'ミステリーカード');assert(C[LUCKY_IDS.knock].retired);assert.equal(C[LUCKY_IDS.seven].rarity,'epic');assert.equal(luckyPotentialPool().length,52);
let r=reset();r.hand=[0,1];use(r,'mystery');assert(r.exhausted.includes(0)&&r.exhausted.includes(1));assert.equal(r.hand.length,2);assert(r.hand.every(id=>C[id].characterId==='lucky'&&!C[id].retired));assert(!r.lucky.mysteryTurn);
r=reset();r.draw=Array(5).fill(0);use(r,'spin');assert.equal(r.enemies[0].hp,9979);
r=reset();r.draw=Array(5).fill(0);use(r,'attack');assert.equal(r.enemies[0].hp,9980);
r=reset();r.draw=Array(5).fill(0);use(r,'seven');assert.equal(r.enemies[0].hp,9923);assert.equal((r.str||0)+(r.agility||0)+(r.plate||0)+(r.regen||0),7);
r=reset();use(r,'delay');assert.equal(r.energy,20);assert.equal(r.lucky.delayedEnergy,1);
r=reset();r.hand=[0,1];r.draw=[2,3,4];use(r,'trick');assert.equal(r.lucky.choice.kind,'top');assert.equal(r.hand.length,4);luckyChoose(0);luckyChoose(1);assert(r.lucky.choice);luckyFinishChoice(r);assert(!r.lucky.choice);
r=reset();r.draw=[0,1,2,3,4,5];const deal=use(r,'deal');assert.equal(r.lucky.choice.kind,'deckTop');for(let i=0;i<5;i++)luckyChoose(0);assert.equal(r.lucky.choice.kind,'top');assert.equal(r.lucky.choice.topPool.length,5);for(let i=0;i<5;i++)luckyTopPlace(r.lucky.choice.topPool[0],i);assert.equal(r.draw.length,1);luckyFinishChoice(r);assert(r.exhausted.includes(deal));assert.equal(r.draw.pop(),0);assert.equal(r.draw.pop(),1);
r=reset();r.hand=[luckyInstance(r,LUCKY_ROLE_IDS.straight)];base.play(0);assert.equal(r.hand.length,4);assert(r.hand.every(id=>C[id].characterId==='lucky'&&!C[id].token));assert.equal(r.hand.map(id=>C[id].cost).sort().join(','),'0,1,2,3');
r=reset();use(r,'royal');r.lucky.hand=[1,0,1,0];use(r,'hot');finishChoices(r);assert.equal(r.enemies[0].hp,9993);assert.equal(r.lucky.powers.royal,1);
r=reset();r.hand=[luckyInstance(r,LUCKY_ROLE_IDS.five)];base.play(0);let guard=0;while(r.lucky.choice&&guard++<100){const p=r.lucky.choice;if(p.kind==='top'){luckyTopPrepare(r);const slot=p.topSlots.indexOf(null);if(slot<0)luckyFinishChoice(r);else luckyTopPlace((p.topPool||r.hand)[0],slot);}else luckyChoose(0);}assert(guard<100);assert.equal(r.lucky.hand.length,0);assert(r.exhausted.filter(id=>C[id]?.characterId==='lucky'&&!C[id].role).length>=5);
})()`,h.context);console.log('PASS v99 balance, generation pools, ordered deck selection, royal and five auto-plays');
})().catch(e=>{console.error(e);process.exit(1)});
