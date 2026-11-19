// Each character owns at most one dedicated exploration skill.
const EXPLORATION_SKILLS={danger:{id:'danger',name:'危機察知',characterId:'wanderer',desc:'各戦闘で一度だけ、HPが30%以下になったとき30ブロックを得る。'},predator:{id:'predator',name:'捕食者',characterId:'hunter',desc:'戦闘中、敵を撃破するたびHPを最大HPの5%回復し、筋力1を得る。'}};
CHARACTERS.wanderer.explorationSkillId='danger';
CHARACTERS.hunter.explorationSkillId='predator';
function explorationSkillFor(characterId){const c=CHARACTERS[characterId],skill=EXPLORATION_SKILLS[c?.explorationSkillId];return skill?.characterId===characterId?skill:null;}
function explorationSkill(r=S.run){return explorationSkillFor(currentCharacterId(r));}
function skillHTML(skill){return skill?`<span class="exploration-skill status-help" tabindex="0">${skill.name}<aside class="tooltip">${skill.desc}</aside></span>`:'';}
const skillDamageBase=dealDamage;
dealDamage=function(e,n,options){const r=S.run,wasAlive=e?.hp>0,isEnemy=r?.enemies?.includes(e);const lost=skillDamageBase(e,n,options);if(r===S.run&&r?.hp>0&&isEnemy&&wasAlive&&e.hp<=0&&!e.predatorRewarded&&explorationSkill(r)?.id==='predator'){e.predatorRewarded=true;r.str=(r.str||0)+1;healHP(r,Math.floor(r.max*.05));}return lost;};
function checkDangerSense(r){if(!r||r.mode!=='battle'||r.hp<=0||r.hp>r.max*.3||r.dangerSenseUsed||explorationSkill(r)?.id!=='danger')return;r.dangerSenseUsed=true;gainBlock(r,30,'exploration');}
const dangerLoseHPBase=loseHP;loseHP=function(r,n){const lost=dangerLoseHPBase(r,n);if(lost>0)checkDangerSense(r);return lost;};
const skillBattleBase=battle;
battle=function(){return skillBattleBase().replace('<div class="player-status">','<div class="player-status">'+skillHTML(explorationSkill()));};
// Battle-local evolution discount applies to existing and subsequently evolved forms.
const explorationCardBase=combatCard;
combatCard=function(id){const c=explorationCardBase(id),r=S.run;if(!c||!r)return c;const f={...c.fx};for(const key of ['evolutionDiscount','autoEvolvePlay'])if(f[key])f[key]*=effectFactor(r);return {...c,fx:f,cost:Math.max(0,c.cost-(c.evolution?(r.evolutionDiscount||0):0))};};
function combatEvolvableCards(r){const cards=[];for(const pile of ['hand','draw','discard','exhausted'])for(let i=0;i<(r[pile]||[]).length;i++){const id=r[pile][i];if(C[id]?.evolveTo!=null)cards.push({id,pile,index:i});}return cards;}
const explorationEffectsBase=resolveHunterEffects;
resolveHunterEffects=function(r,c){explorationEffectsBase(r,c);const f=c.fx;if(f.evolveAll){const candidates=combatEvolvableCards(r);for(const x of candidates)if(r[x.pile][x.index]===x.id)r[x.pile][x.index]=evolveCardInstance(r,x.id);}
if(f.evolutionDiscount)r.evolutionDiscount=(r.evolutionDiscount||0)+f.evolutionDiscount;
if(f.autoEvolvePlay)for(let i=0;i<f.autoEvolvePlay;i++)(r.autoPlayQueue??=[]).push(f.autoPile);
};
let drainingAutoCards=false;
function completeCardResolution(r,c){if(drainingAutoCards)return;if(S.run!==r)return;const previousTarget=target;drainingAutoCards=true;
try{while(r.autoPlayQueue?.length&&r.hp>0&&r.enemies.some(e=>e.hp>0)&&!r.pendingChoice&&!r.hunterChoice&&!r.pendingDiscard){const pile=r.autoPlayQueue.shift(),eligible=(r[pile]||[]).map((id,index)=>({id,index})).filter(x=>C[x.id]?.evolveTo!=null&&canPlayHunterCard(combatCard(x.id),r,true));if(!eligible.length)continue;const chosen=rand(eligible),alive=r.enemies.map((e,i)=>({e,i})).filter(x=>x.e.hp>0);target=rand(alive).i;r[pile].splice(chosen.index,1);r.hand.push(chosen.id);queuePlayedCardPresentation(r,chosen.id);base.play(r.hand.length-1,{free:true});}}
finally{drainingAutoCards=false;target=r.enemies[previousTarget]?.hp>0?previousTarget:r.enemies.findIndex(e=>e.hp>0);}
if(r.hp<=0)r.autoPlayQueue=[];msg=c.name+'を使用。';if(r.hp>0&&r.enemies.every(e=>e.hp<=0)){r.autoPlayQueue=[];r.pendingChoice=null;r.hunterChoice=null;victory();}else render();}
const explorationChoiceBase=choose;
choose=function(type){const r=S.run,was=r?.mode;if(type==='rest'&&was==='rest')return;if(r&&was!=='battle'&&['fight','elite','boss'].includes(type)){r.evolutionDiscount=0;r.autoPlayQueue=[];r.dangerSenseUsed=false;}const result=explorationChoiceBase(type);if(r===S.run&&was!=='battle'&&r?.mode==='battle'){checkDangerSense(r);render();}return result;};
const explorationDescBase=combatDesc;
combatDesc=function(c,r){const f=c.fx;if(f.evolutionDiscount)return `この戦闘中、進化カード全てのコスト-${f.evolutionDiscount}（最低0）。特殊。${effectFactor(r)>1?' 【遺物：数値2倍／コスト+1】':''}`;if(f.autoEvolvePlay)return `${f.autoPile==='draw'?'山札':'捨て札'}のランダムな進化可能カードを${f.autoEvolvePlay}枚、エナジーを消費せずプレイする。${effectFactor(r)>1?' 【遺物：数値2倍／コスト+1】':''}`;return explorationDescBase(c,r);};
checkDangerSense(S.run);
if(!globalThis.ASHBOUND_HEADLESS)render();
