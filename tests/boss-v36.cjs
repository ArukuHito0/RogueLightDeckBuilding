const {workerHarness}=require('./ai-stage1.cjs');const vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('king-test');const run=s=>vm.runInContext(s,h.context);run(`S.run=null;S.relicQueue=[];S.relicReroll=null;S.deck=[0,0,0,1,1,1,3,3,4,4];start();choose('boss');S.run.hp=S.run.max=10000;`);
const e=()=>JSON.parse(run('JSON.stringify(S.run.enemies[0])'));assert.equal(e().max,250);assert.equal(e().atk,7);
for(const n of [12,20,0,7]){await run('endTurn()');assert.equal(e().atk,n)}assert.equal(e().str,1);assert.equal(e().block,10);
run(`S.run.enemies[0].poison=9;S.run.enemies[0].plate=35;S.run.enemies[0].customDebuff=10;dealDamage(S.run.enemies[0],100,{ignoreBlock:true});bossPlan(S.run)`);assert.equal(e().hp,150);assert.equal(e().intent,'stunned');assert.equal(e().str,3);assert.equal(e().poison,0);assert.equal(e().block,0);assert.equal(e().customDebuff,undefined);assert(run('audienceBadge(S.run.enemies[0]).includes("謁見")'));let hp=run('S.run.hp');await run('endTurn()');assert.equal(run('S.run.hp'),hp);assert.equal(e().atk,30);assert.equal(e().kingStep,0);
// Rehydrate exact save payload: phase and one-shot opener survive.
run('S.run=JSON.parse(JSON.stringify(S.run));bossPlan(S.run)');await run('endTurn()');assert.equal(run('S.run.hp'),hp-33);assert.equal(run('S.run.str'),0);assert.equal(e().str,3);assert.equal(e().atk,1);assert.equal(e().hits,3);
for(const [atk,hits] of [[2,4],[3,5],[1,3],[2,4],[3,5],[1,3]]){await run('endTurn()');assert.equal(e().atk,atk);assert.equal(e().hits,hits)}assert.equal(e().str,4);assert.equal(e().kingCycles,2);assert.equal(run('S.run.str'),0);
run('S.run.enemies[0].poison=2;dealDamage(S.run.enemies[0],1,{ignoreBlock:true});bossPlan(S.run)');assert.equal(e().poison,2);assert.notEqual(e().intent,'stunned');
// Poison triggers stun before the queued attack and clears remaining poison ticks.
run(`S.run.enemies[0]=enemy('灰冠の王','♛',200,7);S.run.enemies[0].boss=true;bossPlan(S.run);S.run.enemies[0].hp=155;S.run.enemies[0].poison=10;S.run.poisonDouble=2;S.run.block=0`);hp=run('S.run.hp');await run('endTurn()');assert.equal(run('S.run.hp'),hp);assert.equal(e().hp,145);assert.equal(e().poison,0);assert.equal(e().kingStep,0);
// Thorns can interrupt the action currently being executed.
run(`S.run.enemies[0]=enemy('灰冠の王','♛',200,7);S.run.enemies[0].boss=true;bossPlan(S.run);S.run.enemies[0].hp=155;S.run.enemies[0].hits=3;S.run.thorns=10;S.run.block=0`);hp=run('S.run.hp');await run('endTurn()');assert.equal(run('S.run.hp'),hp-7);assert.equal(e().kingStep,0);
// Migration scales HP once, repeated load/plan does not retrigger/reset the phase.
run(`S.run.enemies[0]={...enemy('灰冠の王','♛',280,18),hp:210,boss:true};bossPlan(S.run)`);assert.equal(e().hp,188);run('bossPlan(S.run)');assert.equal(e().hp,188);
console.log('PASS: HP, 4-step phase, all-status cleanse, poison/counter stun, one-shot opener, 6-action growth, saved phase, migration');})().catch(e=>{console.error(e);process.exit(1)});
