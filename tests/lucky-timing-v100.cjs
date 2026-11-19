const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50){if(r.lucky.choice.kind==='top'){const p=luckyTopPrepare(r);if(!p.remaining)luckyFinishChoice(r);else{const i=p.candidates.findIndex(x=>r.hand.includes(x.id));luckyChoose(i);}}else luckyChoose(0);}assert(guard<50);}


let r=reset();add(r,'jump');use(r,'chip');assert.equal(r.lucky.hand.length,0,'wait for card selection');luckyChoose(0);assert.equal(r.lucky.hand.join(','),'3,0','fold finishes before its parent card');
r=reset();r.draw=Array(5).fill(0);canPresentBattleCards=()=>true;use(r,'spin');assert(r.lucky.slotPresentation);assert.equal(r.lucky.hand.length,0);r.lucky.slotPresentation=null;luckyPump(r);assert.equal(r.lucky.hand.join(','),'1');
r=reset();const a=luckyInstance(r,LUCKY_IDS.flip),b=luckyInstance(r,LUCKY_IDS.flip);luckyPush(r,[{op:'auto',id:a,suppress:true,forceExhaust:true},{op:'auto',id:b,suppress:true,forceExhaust:true}]);luckyPump(r);assert.equal(r.enemies[0].hp,10000);assert.equal(r.lucky.autoPresentation.id,a);luckyPump(r);assert.equal(r.enemies[0].hp,10000);
const callbacks=[],shown=[];document.createElement=()=>({setAttribute(){},remove(){},set innerHTML(v){shown.push(v);}});document.body.append=()=>{};setTimeout=(fn,ms)=>{assert.equal(ms,2000);callbacks.push(fn);return callbacks.length;};clearTimeout=()=>{};
luckyPresentAuto(r);assert(shown[0].includes('フリップコイン'));callbacks.shift()();assert.equal(r.enemies[0].hp,9996);assert(r.exhausted.includes(a));assert.equal(r.lucky.autoPresentation.id,b);assert.equal(r.lucky.hand.length,0);luckyPresentAuto(r);callbacks.shift()();assert.equal(r.enemies[0].hp,9992);assert(r.exhausted.includes(b));assert.equal(r.lucky.autoPresentation,null);assert.equal(r.lucky.queue.length,0);assert.equal(r.lucky.hand.length,0);
})()`,h.context);console.log('PASS v100: completion-order poker, selection/slot delay, sequential 2s auto reveal, no duplicate effects and no poker for role auto plays');
})().catch(e=>{console.error(e);process.exit(1)});
