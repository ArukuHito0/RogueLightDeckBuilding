// Each character owns at most one dedicated exploration skill.
const EXPLORATION_SKILLS={danger:{id:'danger',name:'危機察知',characterId:'wanderer',desc:'各戦闘で一度だけ、HPが30%以下になったとき30ブロックを得る。'},predator:{id:'predator',name:'捕食者',characterId:'hunter',desc:'戦闘中、敵を撃破するたびHPを最大HPの5%回復し、筋力1を得る。'}};
CHARACTERS.wanderer.explorationSkillId='danger';
CHARACTERS.hunter.explorationSkillId='predator';
function explorationSkillFor(characterId){const c=CHARACTERS[characterId],skill=EXPLORATION_SKILLS[c?.explorationSkillId];return skill?.characterId===characterId?skill:null;}
function explorationSkill(r=S.run){const characterId=currentCharacterId(r), chosen=EXPLORATION_SKILLS[r?.explorationSkillId];return chosen?.characterId===characterId?chosen:explorationSkillFor(characterId);}
function skillHTML(skill){return skill?`<span class="exploration-skill status-help" tabindex="0">${skill.name}<aside class="tooltip">${skill.desc}</aside></span>`:'';}
function checkDangerSense(r){if(!r||r.mode!=='battle'||r.hp<=0||r.hp>r.max*.3||r.dangerSenseUsed||explorationSkill(r)?.id!=='danger')return;r.dangerSenseUsed=true;gainBlock(r,30,'exploration');}
const dangerLoseHPBase=loseHP;loseHP=function(r,n){const lost=dangerLoseHPBase(r,n);if(lost>0){reviveFromExplorationSkill(r);updateWoundedStrength(r);checkDangerSense(r);}return lost;};
const skillBattleBase=battle;
battle=function(){
  const r = S.run;
  const skill = explorationSkill(r);
  const consumed = skill?.id === 'secondChance' && r?.secondChanceUsed;
  return skillBattleBase().replace('<div class="player-status">','<div class="player-status">'+skillHTML(consumed ? null : skill));
};
// Battle-local evolution discount applies to existing and subsequently evolved forms.
const explorationCardBase=combatCard;
combatCard=function(id){const c=explorationCardBase(id),r=S.run;if(!c||!r)return c;const f={...c.fx};for(const key of ['evolutionDiscount','autoEvolvePlay'])if(f[key])f[key]*=effectFactor(r);return {...c,fx:f,cost:unusedRoamTypes(r,c).length?0:Math.max(0,c.cost-(c.evolution?(r.evolutionDiscount||0):0))};};
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
choose=function(type){const r=S.run,was=r?.mode;if(type==='rest'&&was==='rest')return;if(r&&was!=='battle'&&['fight','elite','boss'].includes(type)){r.evolutionDiscount=0;r.autoPlayQueue=[];r.dangerSenseUsed=false;r.roamTypes=[];r.woundedStrength=0;r.explorationOpeningDone=false;}const result=explorationChoiceBase(type);if(r===S.run&&was!=='battle'&&r?.mode==='battle'){checkDangerSense(r);render();}return result;};
const explorationDescBase=combatDesc;
combatDesc=function(c,r){const f=c.fx;if(f.evolutionDiscount)return `この戦闘中、進化カード全てのコスト-${f.evolutionDiscount}（最低0）。特殊。${effectFactor(r)>1?' 【遺物：数値2倍／コスト+1】':''}`;if(f.autoEvolvePlay)return `${f.autoPile==='draw'?'山札':'捨て札'}のランダムな進化可能カードを${f.autoEvolvePlay}枚、エナジーを消費せずプレイする。${effectFactor(r)>1?' 【遺物：数値2倍／コスト+1】':''}`;return explorationDescBase(c,r);};

// 強敵の報酬で選んだ探索技能は、現在の探索に保存する。
const EXPLORATION_VARIANTS = {
  wanderer: [
    ['secondChance', '九死に一生', '探索中に一度だけ、HPが0以下になった時、最大HPの50%を回復する。'],
    ['roam', '放浪', '戦闘で初めてプレイする各カードタイプのコストを0にする。'],
    ['prepared', '準備万端', 'ターン開始時に追加で1ドローする。戦闘開始時、HPが最大HPの75%以上なら追加でエナジー1を得る。']
  ],
  hunter: [
    ['apex', '頂点捕食者', '戦闘中、敵を撃破するたび最大HPを5%増加させ、筋力2を得る。'],
    ['superEvolution', '超進化', '進化可能なカードが2段階進化するようになる。'],
    ['wounded', '手負いの獣', 'HPが最大HPの30%以下の間、筋力3を得る。']
  ],
  lucky: [
    ['questPoker', 'クエスト・ポーカー', 'ポーカーに加え、ハンドが空になるたびに指定される役を、そのハンドで成立させると、追加で好きな役カードを1枚得る。'],
    ['handPoker', 'ハンドオブポーカー', 'ポーカーに加え、戦闘開始時に引いたカード全てがランダムな役カードへ変化する。'],
    ['fortuneHand', 'フォーチューンハンド', 'ポーカーに加え、ターン開始時の手札のコストの合計値が7なら、それらをコストを支払わずプレイする。その後、カードを5枚引く。']
  ]
};
for (const [characterId, variants] of Object.entries(EXPLORATION_VARIANTS)) {
  for (const [id, name, desc] of variants) EXPLORATION_SKILLS[id] = {id, name, desc, characterId};
}

function skillRewardOptions(r) {
  const characterId = currentCharacterId(r);
  const variants = EXPLORATION_VARIANTS[characterId];
  if (!variants) return [];
  const ids = [CHARACTERS[characterId].explorationSkillId, ...variants.map(([id]) => id)];
  return ids.filter(id => id !== explorationSkill(r)?.id).map(id => EXPLORATION_SKILLS[id]);
}

function hasPendingSkillReward(r) {
  return r?.mode === 'reward' && r.kind === 'elite' && !r.explorationRewardResolved && skillRewardOptions(r).length > 0;
}

function selectExplorationReward(id) {
  const r = S.run;
  if (page !== 'reward' || busy || !hasPendingSkillReward(r)) return;
  if (id !== null && !skillRewardOptions(r).some(skill => skill.id === id)) return;
  if (id !== null) r.explorationSkillId = id;
  r.explorationRewardResolved = true;
  render();
}

function explorationRewardHTML(r) {
  if (!hasPendingSkillReward(r)) return '';
  const options = skillRewardOptions(r).map(skill =>
    '<button type="button" style="white-space:normal;text-align:left" onclick="selectExplorationReward(\'' +
      skill.id + '\')"><strong>' + skill.name + '</strong><br>' + skill.desc + '</button>'
  ).join('');
  return '<section class="tile" aria-label="探索技能報酬"><h3>探索技能を変更</h3>' +
    '<p>現在の技能：' + explorationSkill(r).name + '</p>' +
    '<div style="display:grid;gap:.65rem">' + options + '</div>' +
    '<div class="toolbar"><button type="button" onclick="selectExplorationReward(null)">技能変更をスキップ</button></div></section>';
}

function reviveFromExplorationSkill(r) {
  if (r !== S.run || r.hp > 0 || r.secondChanceUsed || explorationSkill(r)?.id !== 'secondChance') return;
  r.secondChanceUsed = true;
  r.hp = 0;
  healHP(r, Math.max(1, Math.floor(r.max * .5)));
}

function updateWoundedStrength(r) {
  if (r !== S.run || r.mode !== 'battle' || explorationSkill(r)?.id !== 'wounded') return;
  const bonus = r.hp > 0 && r.hp <= r.max * .3 ? 3 : 0;
  r.str = (r.str || 0) + bonus - (r.woundedStrength || 0);
  r.woundedStrength = bonus;
}

function triggerExplorationKill(r) {
  if (r.hp <= 0 || r.mode !== 'battle') return;
  const skill = explorationSkill(r)?.id;
  if (skill === 'predator') {
    r.str = (r.str || 0) + 1;
    healHP(r, Math.floor(r.max * .05));
  } else if (skill === 'apex') {
    r.max += Math.max(1, Math.floor(r.max * .05));
    r.str = (r.str || 0) + 2;
  }
}

function unusedRoamTypes(r, c) {
  if (r?.mode !== 'battle' || explorationSkill(r)?.id !== 'roam') return [];
  return (c.types?.length ? c.types : cardCategories(c)).filter(type => !r.roamTypes?.includes(type));
}

checkDangerSense(S.run);
if(!globalThis.ASHBOUND_HEADLESS)render();

const explorationHealBase = healHP;
healHP = function (unit, amount) {
  const healed = explorationHealBase(unit, amount);
  if (healed && unit === S.run) updateWoundedStrength(unit);
  return healed;
};
const explorationEvolveBase = evolveCardInstance;
evolveCardInstance = function (r, id, reverse = false) {
  const evolved = explorationEvolveBase(r, id, reverse);
  if (reverse || evolved === id || explorationSkill(r)?.id !== 'superEvolution') return evolved;
  return explorationEvolveBase(r, evolved);
};
const explorationDrawBase = draw;
draw = function (count, baseline = false) {
  const prepared = baseline && S.run?.mode === 'battle' && explorationSkill()?.id === 'prepared';
  return explorationDrawBase(count + (prepared ? 1 : 0), baseline);
};

const explorationVictoryBase = victory;
victory = function () {
  const r = S.run;
  if (r?.mode === 'battle' && r.kind === 'elite' && !r.battleRelicGranted) r.explorationRewardResolved = false;
  return explorationVictoryBase();
};
const explorationRewardBase = reward;
reward = function () {
  return explorationRewardBase().replace('<h3>潜在カードを1枚選ぶ</h3>',
    explorationRewardHTML(S.run) + '<h3>潜在カードを1枚選ぶ</h3>');
};
const explorationTakeBase = take;
take = function (id) {
  if (hasPendingSkillReward(S.run)) return toast('探索技能を選ぶか、技能変更をスキップしてください');
  return explorationTakeBase(id);
};
