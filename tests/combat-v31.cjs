const fs=require('fs'),vm=require('vm'),assert=require('assert');const root=require('path').join(__dirname,'../dist/');const noop=()=>{};let saved=null;const el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};const ctx={console,Math:Object.create(Math),localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0},assert};vm.createContext(ctx);for(const [,f]of fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g))vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});
(async()=>{await vm.runInContext(`(async()=>{
render=()=>save();toast=()=>{};animateEntity=async()=>{};prepareEncounterTurn=()=>{};bossPlan=()=>{};let victories=0;victory=()=>{victories++};
let id=n=>C.find(c=>c.name===n).id;
function reset(effects=[]){S.run={hp:70,max:70,block:0,str:0,agility:0,energy:99,hand:[],draw:[0,1,2,3,4,5,6,7,8,9],discard:[],exhausted:[],enemies:[{hp:1000,max:1000,block:0,poison:0,intent:'attack',atk:5,hits:1}],deck:[0,1],turn:1,kind:'fight',mode:'battle',relics:[],carriedRelic:{effects},generatedCards:[],battleCards:[],potions:[]};page='battle';busy=false;target=0;return S.run}
function use(n){let r=S.run;r.hand.push(typeof n==='number'?n:id(n));base.play(r.hand.length-1)}
assert.equal(C.length,171);assert.equal(addedCards31.filter(a=>a[5]).length,15);assert.equal(addedCards31.filter(a=>!a[5]).length,6);for(let n of ['激情','鼓動','灰の守り'])assert.equal(C[id(n)].rarity,'rare');
let r=reset();r.block=20;use('覚悟');assert.equal(r.hp,64);assert.equal(r.block,20);assert.equal(r.hpLossCount,1);
r=reset();r.block=10;r.str=2;use('殻破りな一撃');assert.equal(r.enemies[0].hp,988);assert.equal(r.block,10);assert.equal(C[62].cost,1);
r=reset();use(28);assert.equal(r.hand.length,0);assert.equal(r.enemies[0].poison,3);use(28);assert.equal(r.hand.length,1);
r=reset(['first_block']);r.agility=2;gainBlock(r,6);assert.equal(r.block,16);gainBlock(r,6);assert.equal(r.block,24);
r=reset(['first_block']);r.agility=-9;gainBlock(r,6);assert(!r.firstCardBlock);r.agility=0;gainBlock(r,6);assert.equal(r.block,12);
r=reset(['double_cards']);assert.equal(combatCard(0).fx.d,6);assert.equal(combatCard(0).cost,1);assert.equal(combatCard(1).fx.b,6);assert.equal(combatCard(52).fx.h,5);assert.equal(combatCard(10).fx.s,2);assert.equal(combatCard(15).fx.hpLoss,12);use(0);assert.equal(r.hp,68);applyTurnStartBuffs(r);assert.equal(r.hp,68);use('保身');assert.equal(r.plate,14);assert.equal(r.hand.length,2);
r=reset(['three_damage']);use('細切れ');assert.equal(r.damageCount,5);assert.equal(r.str,1);assert.equal(r.enemies[0].hp,988);
r=reset();use('焼身');gainBlock(r,2);assert.equal(r.enemies[0].hp,996);use('激昂');dealDamage(r.enemies[0],1);assert.equal(r.enemies[0].hp,995);assert.equal(r.block,6);gainBlock(r,1);assert.equal(r.block,11);assert.equal(r.enemies[0].hp,991); // card-only burn, no infinite chain
r=reset();use('保身');assert.equal(r.plate,7);assert.equal(r.hand.length,1);
r=reset();use('茨の盾');r.block=10;dealDamage(r,5,{attacker:r.enemies[0],attack:true});assert.equal(r.enemies[0].hp,996);assert.equal(r.hp,70);
r=reset();use('鍛え直し');use(0);use(0);assert.equal(r.enemies[0].hp,987);assert.equal(r.strikeBonus,2);
r=reset();use('血の槍');assert.equal(r.hp,68);assert.equal(r.enemies[0].hp,986);use('血の盾');assert.equal(r.hp,64);assert.equal(r.block,24);assert.equal(combatCard(id('復讐')).cost,3);loseHP(r,1);loseHP(r,1);loseHP(r,1);assert.equal(combatCard(id('復讐')).cost,0);
r=reset();use('灰の肉体');assert.equal(r.str,0);use('針山');assert.equal(r.str,0);use('灰の守り');exhaustCard(r,1);assert.equal(r.str,0);assert.equal(r.block,3);
r=reset();use('付け焼刃');assert.equal(r.discard.length,2);assert(r.discard[1]<0);assert.equal(r.discard[0],id('付け焼刃'));assert.equal(C[r.discard[1]].origin,id('付け焼刃'));assert.equal(r.deck.length,2);
r=reset();use('灰の一振り');let sword=r.hand[0];assert(sword<0&&C[sword].token);base.play(0);assert.equal(r.enemies[0].hp,988);assert.equal(r.hand.length,1);assert(r.exhausted.includes(sword));
r=reset();use('灰の一投');assert.equal(r.hand.length,2);assert(r.hand.every(x=>C[x].name==='灰の投擲剣'));let cardLength=C.length;assert.equal(packPool().some(c=>c.token),false);assert(!creationCandidates(r).some(c=>c.token));
r=reset();r.exhausted=[0,1];use('修繕');assert(!r.pendingChoice);assert.equal(r.hand.length,1);assert([0,1].includes(r.hand[0]));assert.equal(r.exhausted.length,2);assert(r.exhausted.includes(id('修繕')));
r=reset();use('警備');assert.equal(r.plate,5);use('緊急回避');assert.equal(r.block,20);assert.equal(r.hp,66);use('防衛本能');assert.equal(r.block,20);assert.equal(r.thorns||0,0);use('渇望');assert.equal(r.hp,63);assert.equal(r.hand.length,3);
r=reset();use('ブーメラン');assert.equal(r.enemies[0].hp,991);assert.equal(needsEnemy(C[id('ブーメラン')]),false);use('肉体改造');assert.equal(r.str,0);assert.equal(r.agility,0);assert.equal(r.max,70);assert.equal(r.hp,70);
r=reset();use('激昂');use('茨の盾');r.block=10;await endTurn();assert.equal(r.enemies[0].hp,996);assert.equal(r.rage,0);assert.equal(r.thornShield,0);assert.equal(r.turn,2);
r=reset();r.thorns=10;r.enemies[0].hp=5;r.enemies[0].hits=3;await endTurn();assert.equal(r.hp,65);assert.equal(r.enemies[0].hp,0);assert(victories>0);
r=reset();r.hp=2;let result=null;finish=(win)=>{result=win;S.run=null};r.hand=[15];await play(0);assert.equal(result,false);
S.run=null;S.relicPoints=2;let relic=newRelic();S.relicVault=[relic];beginRelicReroll(relic.id,0);assert.equal(S.relicPoints,2);assert(!S.relicReroll);cancelRerollConfirmation();assert.equal(S.relicPoints,2);beginRelicReroll(relic.id,0);confirmRelicReroll();assert.equal(S.relicPoints,1);assert(S.relicReroll);confirmRelicReroll();assert.equal(S.relicPoints,1);resolveRelicReroll(false);
assert(walletHTML().includes('余剰ポイント'));assert(walletHTML().includes('遺物ポイント'));assert(C.every(c=>!c.desc.includes('消耗')&&!c.desc.includes('敏捷')));
console.log('v31: 75+ behavior assertions passed');
})()`,ctx);})().catch(e=>{console.error(e);process.exit(1)});
