const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50)luckyChoose(0);assert(guard<50);}

assert.equal(RUN_PACKS.map(p=>p.name).join(','),'攻撃パック,防御パック,補助パック,特殊パック,エピックパック');
for(const type of ['攻撃','防御','補助','特殊']){const pack=RUN_PACKS.find(p=>p.type===type);assert.equal(runPackWeight({characterId:'lucky',types:[type]},pack),4);assert.equal(runPackWeight({characterId:'lucky',types:['別タイプ']},pack),1);}
assert.equal(runPackWeight({characterId:'lucky',types:['防御','補助']},RUN_PACKS[2]),4);
for(const characterId of ['wanderer','hunter','lucky']){const r=reset();r.characterId=characterId;assert.equal(getRunPacks(r).length,5);assert.equal(characterRunPacks(r)[0].name,'攻撃パック');for(const pack of getRunPacks(r)){const ids=rollShopPack(r,pack);assert.equal(ids.length,5);assert.equal(new Set(ids).size,5);assert(ids.every(id=>allowedRunCard(C[id],r)));}}
const r=reset();r.shop={packs:[{id:'strength',sold:true},{id:'poison',sold:false},{id:'block',sold:true},{id:'exhaust',sold:false},{id:'blood',sold:true},{id:'epic',sold:true}],potions:[],packChoice:{packId:'blood',ids:[0,1],selected:[1]}};
const choice=JSON.stringify(r.shop.packChoice);migrateShopPacks(r);assert.equal(r.shop.packs.length,5);assert.equal(r.shop.packs[0].purchased,1);assert(!r.shop.packs[0].sold);assert(!r.shop.packs[2].sold);assert(r.shop.packs[4].sold);assert.equal(JSON.stringify(r.shop.packChoice),choice);assert(runPackSelection(r).includes('購入済みパック'));migrateShopPacks(r);assert.equal(r.shop.packs[0].purchased,1);

r.shop.packChoice=null;r.gold=1000;r.potions=[];r.mode='shop';page='shop';buyRunPack(0);assert.equal(r.shop.packs[0].purchased,2);assert(r.shop.packs[0].sold);const gold=r.gold;r.shop.packChoice=null;buyRunPack(0);assert.equal(r.gold,gold);assert(!r.shop.packChoice);migrateShopPacks(r);assert(r.shop.packs[0].sold);
r.shop.packs[4]={id:'epic',purchased:0,sold:false};buyRunPack(4);assert.equal(r.shop.packs[4].purchased,1);assert(r.shop.packs[4].sold);
})()`,h.context);console.log('PASS v95: five type packs, weights/multi-type, three character pools, saved shop and paid choices');
})().catch(e=>{console.error(e);process.exit(1)});
