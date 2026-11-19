const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{let h=workerHarness();await h.run('turtle-v51');h.context.assert=assert;await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};
let e=eliteEncounter('plated',12)[0];assert.equal(e.hp,30);assert.equal(e.max,30);assert.equal(e.block,50);assert.equal(e.plate,0);assert(e.retainBlock);
let r=S.run={hp:1000,max:1000,str:0,block:0,energy:3,energyMax:3,turn:1,hand:[],draw:[0,1,2,3,4,5,6],discard:[],exhausted:[],enemies:[e],relics:[],deck:[0,1],mode:'battle',kind:'elite',potions:[]};page='battle';busy=false;target=0;
prepareEncounterTurn(r);assert.equal(enemyAttack(e),7);assert.equal(e.hits,1);await endTurn();assert.equal(r.hp,993);assert.equal(e.block,50);assert.equal(enemyAttack(e),12);
await endTurn();assert.equal(r.hp,981);assert.equal(e.atk,3);assert.equal(e.hits,3);assert.equal(forecastDamage(r),9);
await endTurn();assert.equal(r.hp,972);assert.equal(e.intent,'guard');assert.equal(e.guardAmount,10);assert.equal(e.guardStrength,2);assert(intent(e).includes('筋力+2'));
e.block=18;await endTurn();assert.equal(e.block,28);assert.equal(e.str,2);assert.equal(enemyAttack(e),9);assert.equal(r.hp,972);
await endTurn();assert.equal(r.hp,963);assert.equal(e.block,28);await endTurn();assert.equal(r.hp,949);assert.equal(enemyAttack(e),5);assert.equal(e.hits,3);assert.equal(forecastDamage(r),15);
await endTurn();assert.equal(r.hp,934);await endTurn();assert.equal(e.str,4);assert.equal(e.block,38);assert.equal(enemyAttack(e),11);
// Block breaking remains effective; retained block never regenerates by itself.
e.block=0;await endTurn();assert.equal(e.block,0);
// Other enemies still clear block and use their existing guard behavior.
e=normalEncounter(1)[0];r.enemies=[e];e.block=50;e.intent='guard';e.guardAmount=4;await endTurn();assert.equal(e.block,4);
})()`,h.context);console.log('PASS v51 turtle: HP/block, four-step cycle, retention/additive guard, strength per hit, forecast, other enemy block reset');})().catch(e=>{console.error(e);process.exit(1)});
