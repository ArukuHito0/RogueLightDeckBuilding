const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50)luckyChoose(0);assert(guard<50);}

let r=reset();r.hand=[0,1,2];r.draw=[3];luckyChoice(r,'top','順番',luckyCandidates(r,'hand'),3);luckyTopPrepare(r);assert.equal(r.pendingChoice.kind,'top');assert(!luckyChoiceHTML(r));assert(luckyTopHTML(r).includes('disabled'));
luckyFinishChoice(r);assert.equal(r.draw.join(','),'3');assert(r.lucky.choice);
luckyTopPlace(0,2);luckyTopPlace(1,0);assert.equal(r.draw.join(','),'3');luckyTopPlace(2,1);assert.equal(r.lucky.choice.remaining,0);assert(!luckyTopHTML(r).includes(' disabled'));
luckyTopPlace(0,0);assert.equal(r.lucky.choice.topSlots.join(','),'0,2,1');luckyTopUndo(1);assert(r.hand.includes(2));luckyFinishChoice(r);assert(r.lucky.choice);luckyTopPlace(2,1);luckyFinishChoice(r);assert.equal(r.lucky.choice,null);assert.equal(r.pendingChoice,null);assert.equal(r.draw.pop(),0);assert.equal(r.draw.pop(),2);assert.equal(r.draw.pop(),1);assert.equal(r.draw.pop(),3);
r=reset();r.hand=[0,1];luckyChoice(r,'top','順番',luckyCandidates(r,'hand'),1);luckyTopPlace(0,0);luckyTopPlace(1,0);assert.deepEqual(Array.from(r.hand),[0]);assert.equal(r.lucky.choice.topSlots[0],1);r.lucky=JSON.parse(JSON.stringify(r.lucky));r.pendingChoice=null;luckyTopPrepare(r);assert.equal(r.lucky.choice.topSlots[0],1);luckyFinishChoice(r);assert.equal(r.draw.pop(),1);
})()`,h.context);console.log('PASS v97: staged numbered slots, explicit confirmation, swapping, undo, replacement, saved state and draw order');
})().catch(e=>{console.error(e);process.exit(1)});
