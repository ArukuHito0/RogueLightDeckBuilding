const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('v39-test');h.context.assert=assert;await vm.runInContext(`(async()=>{
const id=n=>C.find(c=>c.name===n).id;
function reset(effects=[]){S.run={hp:70,max:70,block:0,str:0,agility:0,energy:99,hand:[],draw:[0,1,2,3,4],discard:[],exhausted:[],enemies:[{hp:1000,max:1000,block:0,poison:0,intent:'attack',atk:5,hits:1}],deck:[0,1],turn:1,kind:'fight',mode:'battle',relics:[],carriedRelic:{effects},generatedCards:[],battleCards:[],potions:[]};page='battle';busy=false;target=0;return S.run}
function use(n){let r=S.run;r.hand.push(typeof n==='number'?n:id(n));base.play(r.hand.length-1)}

let r=reset();use('残火の大太刀');assert.equal(r.enemies[0].hp,986);assert(r.discard.includes(id('残火の大太刀')));
r=reset();r.exhausted=[0,1,2];r.str=3;use('残火の大太刀');assert.equal(r.enemies[0].hp,977);assert(combatDesc(combatCard(id('残火の大太刀')),r).includes('+2'));
r=reset();use('強靭な肉体');assert.equal(r.plate,4);assert.equal(r.block,0);assert(r.exhausted.includes(id('強靭な肉体')));
r=reset();use('力の構え');assert.equal(r.str,0);assert.equal(r.block,0);assert(!r.exhausted.includes(id('力の構え')) );
r=reset(['double_cards']);use('強靭な肉体');assert.equal(r.plate,8);assert.equal(r.hp,68);
r=reset();use('鼓動');assert(combatDesc(combatCard(id('鼓動')),r).includes('エナジーを1回復'));assert.equal(keywords.棘,'敵から攻撃を受けるたび、敵にスタック分のダメージを与える。');
S.run=null;S.collection[id('毒針')]=3;S.collection[id('腐食の切先')]=3;S.deck=[];assert(!addDeckKind(id('毒針')));assert(!changeDeck('reserve','deck',id('腐食の切先')));
})()`,h.context);console.log('PASS: v48 actual damage, strength scaling, plate, exhaust, doubled relic effects, descriptions and acquisition guards');})().catch(e=>{console.error(e);process.exit(1)});
