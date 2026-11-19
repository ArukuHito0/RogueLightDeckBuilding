const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('lucky-v89');h.context.assert=assert;
await vm.runInContext(`(async()=>{
render=()=>{};animateEntity=async()=>{};toast=()=>{};
function reset(){S.run={characterId:'lucky',hp:77,max:77,block:0,str:0,agility:0,energy:20,energyMax:3,turn:1,act:1,floor:1,hand:[],draw:[],discard:[],exhausted:[],deck:[0,1],relics:[],battleCards:[],generatedCards:[],potions:[],enemies:[{hp:10000,max:10000,block:0,str:0,poison:0,atk:1,intent:'attack'}],mode:'battle',kind:'fight'};page='battle';target=0;busy=false;return S.run;}
function add(r,key,pile='hand'){const id=luckyInstance(r,LUCKY_IDS[key]);r[pile].push(id);return id;}
function use(r,key){const id=add(r,key);base.play(r.hand.indexOf(id));return id;}
function finishChoices(r){let guard=0;while(r.lucky?.choice&&guard++<50){if(r.lucky.choice.kind==='top'){const p=luckyTopPrepare(r);if(!p.remaining)luckyFinishChoice(r);else{const i=p.candidates.findIndex(x=>r.hand.includes(x.id));luckyChoose(i);}}else luckyChoose(0);}assert(guard<50);}


S.run=null;busy=false;page='relics';S.relicPoints=10;S.relicVault=[{id:'test-a',name:'遺物A',icon:'◇',effects:['start_heal','zero_block']},{id:'test-b',name:'遺物B',icon:'◇',effects:['start_heal']}];
const relic=S.relicVault[0];assert(relicPanel(relic,true).includes('再抽選可能回数 <b>0</b>/5'));assert(relicEffectsHTML(relic,true).includes('potion-term'));assert(relicEffectText(relicEffect('start_heal')).includes('最大HPの20%'));
relicEffectFilter=['start_heal','zero_block'];let html=relicsPage();assert(html.includes('遺物A'));assert(!html.includes('遺物B'));assert(html.includes('遺物効果で絞り込み'));
for(let i=0;i<5;i++){beginRelicReroll('test-a',0);assert(rerollConfirmation);confirmRelicReroll();assert.equal(relic.rerolls,i+1);assert(S.relicReroll);resolveRelicReroll(false);}const pts=S.relicPoints;beginRelicReroll('test-a',0);assert.equal(rerollConfirmation,null);assert.equal(S.relicPoints,pts);assert.equal(JSON.parse(JSON.stringify(relic)).rerolls,5);
assert.equal(new Set(Object.values(POTION_LOOK).map(x=>x[0])).size,5);assert(POTIONS.every(x=>x.icon.includes('<svg')));assert(potionBottle(POTIONS.find(x=>x.id==='poison')).includes('#73c857'));
bookType='potions';assert(infoCodex().includes('癒しの薬'));bookType='statuses';assert(infoCodex().includes('凍結'));bookType='keywords';assert(infoCodex().includes('筋力')&&infoCodex().includes('除外'));assert(destinationRules({statuses:['呪い','凍結']}).includes('攻撃によって呪いを振り払う'));
S.clearedActs=[1];S.destinationAct=2;assert(home().includes('屍雪山の氷の山と双頭の竜'));assert(home().includes('探索に出る'));assert(home().includes('startSelectedCharacter()'));assert(characterSelection().includes('デッキ一覧'));assert(!characterSelection().includes('この探索者で出発'));
})()`,h.context);console.log('PASS v104: reroll limits, saved count, multi-filter, potion tooltips and shapes, codex and home flow');
})().catch(e=>{console.error(e);process.exit(1)});
