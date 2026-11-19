const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('exploration-v56');h.context.assert=assert;await vm.runInContext(`(async()=>{
render=()=>save();animateEntity=async()=>{};const id=n=>HUNTER_IDS[n];
function reset(effects=[],characterId='hunter'){S.run={characterId,hp:50,max:90,block:0,str:0,agility:0,energy:99,energyMax:3,turn:1,floor:1,act:1,gold:0,packs:0,hand:[],draw:[],discard:[],exhausted:[],enemies:[{hp:10000,max:10000,block:0,poison:0,atk:10,intent:'attack',hits:1}],deck:[0,1],mode:'battle',kind:'fight',relics:[],carriedRelic:{effects},battleCards:[],generatedCards:[],potions:[]};page='battle';busy=false;target=0;return S.run;}
function use(n){S.run.hand.push(typeof n==='number'?n:id(n));base.play(S.run.hand.length-1);}
assert.equal(HUNTER_ROWS.length,78);for(const n of ['環境適応','進化の神秘','掘り起こす','呼び覚ます']){assert(C[id(n)].runOnly);assert.equal(C[id(n)].characterId,'hunter');}assert(C[id('進化の神秘')].special);
assert.equal(explorationSkillFor('wanderer').id,'danger');assert.equal(explorationSkillFor('hunter').id,'predator');CHARACTERS.foreign={id:'foreign',explorationSkillId:'predator'};assert.equal(explorationSkillFor('foreign'),null);delete CHARACTERS.foreign;
let r=reset([], 'wanderer');r.hp=20;r.max=70;r.mode=page='map';choose('rest');assert.equal(r.hp,42);assert(rest().includes('HPを22回復しました'));choose('rest');assert.equal(r.hp,42);r.mode=page='map';r.floor=2;r.hp=65;choose('rest');assert.equal(r.hp,70);
r=reset();r.hp=20;r.mode=page='map';choose('rest');assert.equal(r.hp,42);assert(!rest().includes('休憩術'));
r=reset();r.enemies[0].hp=1;dealDamage(r.enemies[0],1);assert.equal(r.hp,50);dealDamage(r.enemies[0],99);assert.equal(r.hp,50);assert.equal(r.str,2);assert(r.enemies[0].predatorRewarded);
r=reset(['double_cards']);r.enemies[0].hp=1;dealDamage(r.enemies[0],1);assert.equal(r.hp,50);
r=reset();r.max=72;r.enemies[0].hp=1;dealDamage(r.enemies[0],1);assert.equal(r.hp,50);
r=reset();r.hp=86;r.enemies=[{hp:1,block:0},{hp:1,block:0},{hp:1,block:0}];for(const e of r.enemies)dealDamage(e,1);assert.equal(r.hp,86);assert.equal(r.str,6);assert(r.enemies.every(e=>e.predatorRewarded));
r=reset();r.enemies[0].hp=3;r.enemies[0].laceration=3;cardAttack(r.enemies[0],1);assert.equal(r.hp,50);assert.equal(r.enemies[0].hp,0);
r=reset();r.enemies[0].hp=1;r.enemies[0].poison=1;await endTurn();assert.equal(r.hp,50);
r=reset();r.thorns=10;r.enemies[0].hp=5;dealDamage(r,1,{attack:true,attacker:r.enemies[0]});assert.equal(r.hp,49);assert.equal(r.enemies[0].hp,0);
r=reset();r.hp=1;r.thorns=10;r.enemies[0].hp=5;dealDamage(r,1,{attack:true,attacker:r.enemies[0]});assert.equal(r.hp,0);
r=reset([],'wanderer');r.enemies[0].hp=1;dealDamage(r.enemies[0],1);assert.equal(r.hp,50);
// Adaptation evolves each instance exactly once, preserving its pile and next-battle original.
r=reset();r.deck=[id('牙'),id('爪')];r.hand=[id('牙'),id('大喰らい')];r.draw=[id('爪')];r.discard=[id('鱗')];r.exhausted=[id('羽')];r.evolutionCount=3;r.evolutionBlock=10;r.evolutionStrength=1;use('環境適応');assert.equal(C[r.hand[0]].name,'噛みつき');assert.equal(C[r.hand[1]].name,'大喰らい');assert.equal(C[r.draw[0]].name,'鉤爪');assert.equal(C[r.discard[0]].name,'硬い鱗');assert.equal(C[r.exhausted[0]].name,'滑空');assert.equal(r.evolutionCount,7);assert.equal(r.str,1);assert.equal(r.block,40);assert(r.exhausted.includes(id('環境適応')));assert.deepEqual(Array.from(r.deck),[id('牙'),id('爪')]);
r=reset();use('進化の神秘');assert.equal(r.evolutionDiscount,1);assert.equal(r.specialUses[id('進化の神秘')],1);assert.equal(combatCard(id('牙')).cost,1);assert.equal(combatCard(id('噛みつき')).cost,0);assert.equal(combatCard(id('獣王の爪')).cost,1);assert.equal(C[id('獣王の爪')].cost,2);use('牙');assert.equal(combatCard(r.discard[0]).cost,0);use('進化の神秘');assert.equal(combatCard(id('獣王の爪')).cost,0);r.mode=page='map';r.deck=[0,1,2,3,4];choose('fight');assert.equal(r.evolutionDiscount,0);assert.equal(combatCard(id('獣王の爪')).cost,2);
r=reset(['double_cards']);use('進化の神秘');assert.equal(r.evolutionDiscount,2);assert(combatDesc(combatCard(id('進化の神秘')),r).includes('コスト-2'));
// Automatic plays spend no energy, resolve normally, and move the original instance.
r=reset();r.energy=1;r.discard=[id('角突き')];use('掘り起こす');assert.equal(r.energy,0);assert.equal(r.enemies[0].hp,9991);assert.equal(r.evolutionCount,1);assert.equal(r.hand.length,0);assert(r.discard.some(k=>C[k].name==='突き上げ'));assert(!r.discard.includes(id('角突き')));assert(r.discard.includes(id('掘り起こす')));
r=reset();r.energy=1;r.draw=[id('羽')];use('呼び覚ます');assert.equal(r.energy,0);assert.equal(r.block,5);assert.equal(r.draw.length,0);assert(r.discard.some(k=>C[k].name==='滑空'));
r=reset();r.draw=[id('嗅覚'),0];r.energy=1;use('呼び覚ます');assert.equal(r.hand[0],0);assert.equal(r.evolutionCount,1);assert(r.discard.some(k=>C[k].name==='直感'));
r=reset();r.energy=1;r.heartbeat=true;r.heartbeatCount=3;r.discard=[id('角突き')];use('掘り起こす');assert.equal(r.energy,1);assert.equal(r.heartbeatCount,0);
r=reset();r.discard=[0,id('大喰らい')];r.energy=1;use('掘り起こす');assert.equal(r.energy,0);assert.equal(r.enemies[0].hp,10000);assert.equal(r.evolutionCount||0,0);assert.equal(r.discard.length,3);
r=reset(['double_cards']);r.discard=[id('角突き')];use('掘り起こす');assert.equal(r.evolutionCount,2);assert.equal(r.hp,44);assert.equal(r.enemies[0].hp,9977);assert(r.discard.some(k=>C[k].name==='突き刺し'));
r=reset();let wins=0;const oldVictory=victory;victory=()=>{wins++;};r.discard=[id('角突き')];r.enemies[0].hp=1;use('掘り起こす');assert.equal(wins,1);assert.equal(r.hp,50);assert.equal(r.evolutionCount,1);assert(r.discard.some(k=>C[k].name==='突き上げ'));victory=oldVictory;
S.run=null;page='characters';const selection=characterSelection();assert(!selection.includes('休憩術'));assert(selection.includes('explorer-roster'));assert(selection.includes('潜在カードを閲覧'));assert(selection.includes('探索技能')||selection.includes('exploration-skill-summary'));
})()`,h.context);console.log('PASS v56: dedicated skills, rests, once-per-enemy strength for all damage sources, no resurrection, four cards, all-pile one-stage evolution, cost reduction/reset, free automatic plays and single victory');})().catch(e=>{console.error(e);process.exit(1)});
