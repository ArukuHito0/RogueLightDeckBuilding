const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('v83');h.context.assert=assert;vm.runInContext(`
render=()=>{};S.run={characterId:'hunter',hp:50,max:80,block:0,str:0,agility:0,energy:10,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],carriedRelic:{effects:['double_cards']},battleCards:[],generatedCards:[],potions:[],enemies:[{hp:1000,max:1000,block:0,atk:5,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;
const r=S.run;assert.equal(combatCard(0).cost,C[0].cost+1);r.hand=[0];base.play(0);assert.equal(r.hp,50);assert.equal(r.energy,8);
const zero=C.find(c=>!c.retired&&c.cost===0&&!c.xCost);assert.equal(combatCard(zero.id).cost,1);
const str=C.find(c=>c.name==='筋力');if(str)assert.equal(combatCard(str.id).fx.s,C[str.id].fx.s*2);
const x=C.find(c=>c.fx.xHits);r.energy=3;assert.equal(combatCard(x.id).cost,3);assert.equal(combatCard(x.id).fx.h,2);r.energy=0;assert.equal(combatCard(x.id).cost,1);
r.hand=[x.id];const n=r.hand.length;base.play(0);assert.equal(r.hand.length,n);assert(!combatDesc(combatCard(x.id),r).includes('HP-2'));
r.carriedRelic={effects:[]};r.energy=3;assert.equal(combatCard(0).cost,C[0].cost);assert.equal(combatCard(x.id).fx.h,3);
`,h.context);console.log('PASS contract: cost +1 incl zero/X, no HP penalty, no relic unchanged');})().catch(e=>{console.error(e);process.exit(1)});
