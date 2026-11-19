const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50)luckyChoose(0);assert(guard<50);}

let r=reset();r.draw=Array(5).fill(0);canPresentBattleCards=()=>true;
use(r,'spin');assert(r.lucky.slotPresentation);assert.equal(r.enemies[0].hp,10000,'damage must wait');assert.equal(r.lucky.queue[0].op,'slotResolve');
luckyPump(r);assert.equal(r.enemies[0].hp,10000,'reentry must wait');
const markup=[];let callback,removed=false;
document.createElement=()=>({style:{setProperty(){}},setAttribute(){},querySelector(){return null;},remove(){removed=true;},set innerHTML(v){markup.push(v);}});
document.body.append=()=>{};setTimeout=(fn,ms)=>{assert.equal(ms,2500);callback=fn;return 1;};clearTimeout=()=>{};
luckyPresentSlot(r);assert(markup[0].includes('SUCCESS'));assert.equal((markup[0].match(/slot-match/g)||[]).length,5);assert.equal(r.enemies[0].hp,10000);
callback();assert(removed);assert.equal(r.enemies[0].hp,9979);assert.equal(r.lucky.slotPresentation,null);assert.equal(r.lucky.queue.length,0);
r=reset();r.draw=Array(5).fill(1);use(r,'spin');luckyPresentSlot(r);assert(markup[1].includes('FAILED'));assert(!markup[1].includes('slot-match'));callback();assert.equal(r.enemies[0].hp,10000);
r=reset();r.draw=Array(5).fill(0);use(r,'hit');assert.equal(r.enemies[0].hp,10000,'unconditional card effect must also wait');luckyPresentSlot(r);callback();assert.equal(r.enemies[0].hp,9993);
r=reset();r.draw=Array(5).fill(1);use(r,'safe');assert.equal(r.enemies[0].hp,10000);luckyPresentSlot(r);callback();assert.equal(r.enemies[0].hp,9995,'failure effect follows presentation');
})()`,h.context);console.log('PASS v92: reveal, matching borders, success/failure, effect delay, reentry and cleanup');
})().catch(e=>{console.error(e);process.exit(1)});
