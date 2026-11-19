const supportingRunCards=[
['毒針',1,'†','3ダメージ。毒を2付与。','common','毒',{d:3,p:2}],
['力の構え',1,'♜','筋力+1。4ブロック。','common','筋力',{s:1,b:4}],
['燃え尽きる盾',1,'◇','12ブロック。除外。','common','除外',{b:12,ex:1}],
['毒の探究',1,'⚗','毒を3付与。2枚引く。','rare','毒',{p:3,draw:2}],
['鍛錬の一撃',1,'⚒','8ダメージ。筋力+2。','rare','筋力',{d:8,s:2}],
['残火の刃',1,'✧','6ダメージ。この戦闘の除外済みカード1枚につきダメージ+2。除外。','rare','除外',{d:6,exScale:2,ex:1}]
];supportingRunCards.forEach((a,i)=>C.push({id:25+i,name:a[0],cost:a[1],icon:a[2],desc:a[3],rarity:a[4],axis:a[5],runOnly:true,fx:a[6]}));
// Per-slot rates, without replacement. Common/rare create the foundation first.
const rewardRates=[null,...[0,.005,.01,.025,.05,.08,.15,.22,.30].map(epic=>({epic,rare:.22+epic,common:.78-epic*2}))];
function rollRunRewards(floor){let rates=rewardRates[Math.min(9,Math.max(1,floor))],remaining=C.filter(c=>c.runOnly),out=[];for(let i=0;i<3;i++){let x=Math.random(),rarity=x<rates.common?'common':x<rates.common+rates.rare?'rare':'epic',pool=remaining.filter(c=>c.rarity===rarity);if(!pool.length)pool=remaining;let c=rand(pool);out.push(c.id);remaining=remaining.filter(x=>x.id!==c.id)}return out}
const previousVictory=victory;victory=function(){previousVictory();if(S.run&&page==='reward'){S.run.rewardCards=rollRunRewards(S.run.floor);render()}};
function bossPlan(r){let e=r.enemies?.[0];if(!e?.boss)return;let phase=e.hp<=e.max*.5?2:1,scale=Math.floor((r.turn-1)/4)+(phase===2?4:0);e.phase=phase;e.hits=1;e.guardAmount=18;let cycle=(r.turn-1)%3;if(cycle===0){e.intent='attack';e.atk=18+scale;e.move='王の断罪'}else if(cycle===1){e.intent='attack';e.atk=9+scale;e.hits=3;e.move='灰の三連撃'}else{e.intent='guard';e.atk=18+scale;e.guardAmount=phase===2?26:18;e.move='王冠の守り'}}
const previousChoose=choose;choose=function(type){previousChoose(type);let r=S.run;if(r&&type==='boss'){let e=r.enemies[0];e.boss=true;e.hp=e.max=200;bossPlan(r);render()}};
const previousIntent=intent;intent=function(e){if(!e.boss)return previousIntent(e);return `${e.phase===2?'激昂 / ':''}${e.move}：${e.intent==='attack'?`⚔ ${e.atk}${e.hits>1?' × '+e.hits:''}`:`◇ ${e.guardAmount}`}`};
const previousResolve=base.play;base.play=function(i){previousResolve(i);if(S.run?.kind==='boss')bossPlan(S.run)};
const previousEndTurn=endTurn;endTurn=async function(){if(busy||page!=='battle')return;await previousEndTurn();if(S.run&&page==='battle'&&S.run.kind==='boss'){bossPlan(S.run);render()}};
const previousBattle=battle;battle=function(){let html=previousBattle();if(S.run?.enemies?.[0]?.boss)html=html.replace('</h2>','</h2><p class="boss-rules">HP半分以下で激昂。4ターンごとに攻撃+1。</p>');return html};
const previousReward=reward;reward=function(){let r=S.run,rates=rewardRates[Math.min(9,r.floor)];return previousReward().replace('潜在カードを1枚選ぶ','潜在カードを1枚選ぶ').replace('毒・筋力・除外。デッキの軸を決めるカードです。',`COMMONで土台、RAREで連携、EPICで軸を完成。第${r.floor}階層のEPIC抽選率は1枠あたり${Math.round(rates.epic*100)}%。`)};
if((S.run?.act||1)===1&&S.run?.mode==='battle'&&S.run.kind==='boss'&&!S.run.enemies[0].boss){let e=S.run.enemies[0],ratio=e.hp/e.max;e.boss=true;e.max=200;e.hp=Math.max(1,Math.round(200*ratio));bossPlan(S.run)}
