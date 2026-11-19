// ACT4 寄生樹海. Stable slots are retained for regeneration and saves.
keywords.芽吹き='特定の行動を強化する。攻撃ダメージによってHPが減少するたびに1減少する。強化行動の解決後、全て消費する。';
keywords.寄生='この刻印が付いたカードを使うたび、使用者が刻印の数値分の浸食を得る。';
keywords.浸食='ターン終了時、浸食が現在HP以上なら死亡する。';
INFO_STATUS_KEYS.push('芽吹き','寄生','浸食');STATUS_FEEDBACK.forestErosion=['浸食','☣'];STATUS_FEEDBACK.bud=['芽吹き','♧'];
const FOREST_FOES={
 moth:['宿り蛾',42,[{bud:4},{d:6,budD:4,consume:true},{d:4,h:2}]],
 beetle:['根憑き甲虫',58,[{d:8},{b:12},{d:5,h:2}]],
 flower:['寄生花',46,[{bud:4},{healAll:4,budHeal:4,consume:true},{d:7}]],
 ape:['枝憑き猿',48,[{d:4,h:3},{b:8},{d:14}]],
 deer:['花骸鹿',110,[{bud:7},{d:6,h:2},{d:10,budD:5,consume:true},{b:12,s:2}]],
 colony:['接ぎ木の群体',76,[{d:8},{b:12},{d:14,revive:'branch'}]],
 branch:['枝',24,[{d:5}]],
 queen:['種宿しの女王',95,[{bud:5},{d:4,h:3},{summon:true,consume:true},{d:12}]],
 larva:['種宿しの幼虫',12,[{d:4}]],
 tree:['万骸の母樹',230,[{hostsBud:5},{d:8},{d:5,h:2},{revive:'host'}]],
 root:['根に繋がれた獣',40,[{wait:true},{d:6,budD:4,consume:true},{wait:true},{wait:true}]],
 bloom:['花に喰われた獣',40,[{wait:true},{wait:true},{healTree:true,budHeal:6,consume:true},{wait:true}]]
};
const FOREST_PATHS={moth:'M32 31Q5 2 7 28L15 42 7 54Q23 58 32 39Q41 58 57 54L49 42 57 28Q59 2 32 31ZM32 25V51M27 18L32 26 37 18',beetle:'M19 27Q32 15 45 27L47 45Q32 59 17 45ZM24 22L22 12 31 18 37 9 40 24M32 26V51M17 31L7 26M16 42L5 46M46 31L57 24M48 43L59 48',flower:'M32 28C4 7 13 47 29 35C4 60 54 61 36 35C63 49 62 9 36 27C48 0 16 0 32 28ZM32 38V59M32 51Q16 38 12 49M32 56Q49 41 54 51',ape:'M20 24Q8 15 9 28L17 35 15 47 8 57M44 24Q56 15 55 28L47 35 49 47 56 57M23 19Q32 10 41 19L44 40 34 46 20 40ZM20 34L7 42M44 34L57 42M26 27H29M36 27H39M26 36Q32 40 38 36',deer:'M18 37L41 33 50 20 55 24 48 41 42 45H23L19 59M38 45L43 59M23 44L29 58M49 22L44 11 36 7M45 14L50 6M41 12L38 18M54 22L59 12M57 15L62 16M17 37L8 31',tree:'M25 58L30 33 14 25 22 21 9 14 21 9 30 13 34 4 41 14 53 10 59 24 46 32 39 32 40 54 53 60M30 33L24 20M37 32L43 19M15 61L27 54 31 49M39 54L34 47M25 42L17 46',branch:'M15 57L31 35 28 12 36 22 49 8 45 29 55 34 34 43 29 59',queen:'M25 23Q13 27 15 44Q18 61 36 56Q53 52 50 36Q48 20 35 22M26 22L20 10 30 16 39 6 39 23M16 34L7 28M16 45L5 48M49 34L59 28M50 45L61 49M26 34Q41 26 40 45Q28 52 25 40',larva:'M10 44Q10 25 22 26Q25 13 36 21Q52 15 54 34Q62 49 43 53H23Q9 54 10 44ZM21 30V47M33 25V49M44 25V48',root:'M9 48L19 34 23 22 34 25 45 17 56 23 49 34 44 42 50 56M19 35L34 43 44 42M25 44L18 59M32 43L35 58M21 24L13 12 26 15M40 25L36 10M47 24L51 7',bloom:'M13 40L23 29 38 31 47 23 55 29 47 41 41 48H23L18 59M38 48L44 59M25 32Q7 19 21 13L32 25Q21 2 39 6L39 24Q57 8 60 23L43 34'};
function forestIcon(key){return '<svg class="enemy-art" viewBox="0 0 64 64" aria-hidden="true"><path d="'+FOREST_PATHS[key]+'" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
function forestFoe(key){const [name,hp]=FOREST_FOES[key];return Object.assign(enemy(name,forestIcon(key),hp,0),{act2:true,act4:true,act4Kind:key,actionStep:0,bud:0,str:0,block:key==='beetle'?12:0});}
const FOREST_WEAK=['moth','flower','beetle','ape'];
const FOREST_STRONG=[['moth','ape'],['beetle','flower'],['flower','ape'],['moth','flower']];
const FOREST_BOSS_ACTIONS={
 tree:[{mark:4,bud:6},{hosts:true},{budBlock:3},{budAttack:4},{restore:'root',s:1},{restore:'bloom',agility:1}],
 root:[{s:2},{mark:1},{erosionAttack:true},{b:10}],
 bloom:[{bud:6},{b:15},{budErosion:2},{erosionHeal:true}]
};

function forestBossFoe(key){
 const foe=forestFoe(key);
 foe.forestBossV2=true;
 if(key==='root')foe.name='寄生された獣';
 if(key==='bloom')foe.name='芽吹く獣';
 return foe;
}

function forestNormalKeys(r){
 const fights=r.forestFights||0;
 r.forestFights=fights+1;
 if(fights<3){
  r.forestWeakBag??=shuffle([...FOREST_WEAK]);
  const key=r.forestWeakBag.pop();
  if(key==='flower')r.forestWeakFlower=true;
  return [key];
 }
 if(!r.forestStrongBag?.length){
  r.forestStrongBag=shuffle(FOREST_STRONG.map((_,index)=>index));
  if(r.forestStrongBag.at(-1)===r.forestLastStrong){
   [r.forestStrongBag[0],r.forestStrongBag[3]]=[r.forestStrongBag[3],r.forestStrongBag[0]];
  }
 }
 const bag=r.forestStrongBag;
 if(fights===4&&!r.forestWeakFlower&&!r.forestFirstStrongFlower){
  const index=bag.findIndex(key=>FOREST_STRONG[key].includes('flower'));
  if(index>=0)[bag[index],bag[bag.length-1]]=[bag.at(-1),bag[index]];
 }
 const index=bag.pop();
 r.forestLastStrong=index;
 if(fights===3)r.forestFirstStrongFlower=FOREST_STRONG[index].includes('flower');
 return FOREST_STRONG[index];
}

function forestEncounter(r,type){
 if(type==='boss')return [forestBossFoe('tree')];
 if(type==='elite'){
  r.forestElites??=[];
  if(!r.forestElites.length)r.forestElites=shuffle(['deer','colony','queen']);
  const key=r.forestElites.pop();
  return (key==='colony'?[key,'branch','branch']:[key]).map(forestFoe);
 }
 return forestNormalKeys(r).map(forestFoe);
}

function forestBossAction(r,e){
 const actions=FOREST_BOSS_ACTIONS[e.act4Kind];
 const step=e.act4Kind==='tree'?r.turn-1:e.actionStep;
 const a={...actions[step%actions.length]};
 const bud=e.bud||0;
 const erosion=(r.enemyPhase?r.forestErosionSnapshot:r.forestErosion)||0;
 if(a.hosts&&step>=actions.length)return {d:7};
 if(a.budBlock)a.b=bud*a.budBlock+(e.agility||0);
 if(a.budAttack)a.d=bud*a.budAttack;
 if(a.erosionAttack)a.d=Math.floor(erosion/2)*3;
 if(a.budErosion)a.erode=bud*a.budErosion;
 if(a.erosionHeal)a.heal=Math.floor(erosion/4);
 if(a.restore&&!r.enemies.some(x=>x.act4Kind===a.restore&&x.hp>0)){
  delete a.s;
  delete a.agility;
 }else if(a.restore)delete a.restore;
 return a;
}

function forestSummonHost(r,key){
 const existing=r.enemies.find(e=>e.act4Kind===key);
 const fresh=Object.assign(forestBossFoe(key),{summonedTurn:r.turn});
 if(existing){
  for(const field of Object.keys(existing))delete existing[field];
  Object.assign(existing,fresh);
 }else r.enemies.push(fresh);
}

function forestMarkCards(r,count){
 const marks=r.forestMarks??={};
 const candidates=shuffle([...new Set((r.draw||[]).filter(id=>C[id]&&!marks[id]))]);
 for(const id of candidates.slice(0,count))marks[id]=2;
}

function forestCardUsed(r,id){
 const amount=r.forestMarks?.[id]||0;
 if(r.act===4&&amount)r.forestErosion=(r.forestErosion||0)+amount;
}

function forestCheckErosion(r){
 if(r.forestErosion>0&&r.forestErosion>=r.hp)loseHP(r,r.hp);
}

function forestBossExecute(r,e,a){
 if(a.mark)forestMarkCards(r,a.mark);
 if(a.bud)e.bud=(e.bud||0)+a.bud;
 if(a.hosts){
  forestSummonHost(r,'root');
  forestSummonHost(r,'bloom');
 }
 if(a.restore)forestSummonHost(r,a.restore);
 if(a.s)e.str=(e.str||0)+a.s;
 if(a.agility)e.agility=(e.agility||0)+a.agility;
 if(a.erode)r.forestErosion=(r.forestErosion||0)+a.erode;
 if(a.heal)healHP(e,a.heal);
}

function forestAction(r,e){if(e.forestBossV2)return forestBossAction(r,e);const boss=['tree','root','bloom'].includes(e.act4Kind),list=FOREST_FOES[e.act4Kind][2],a={...list[(boss?r.turn-1:e.actionStep)%list.length]},bud=e.bud||0;if(a.budD)a.d+=bud*a.budD;if(a.healAll!=null)a.healAll+=bud*a.budHeal;if(a.healTree)a.heal=bud*a.budHeal;if(a.summon)a.count=Math.min(Math.ceil(bud/2),Math.max(0,3-r.enemies.filter(x=>x.act4Kind==='larva'&&x.hp>0).length));return a;}
function planForest(r){for(const e of r.enemies||[]){if(!e.act4||e.hp<=0)continue;const a=forestAction(r,e);e.snowAction=a;e.intent=e.hunterStun?'stunned':a.d!=null?'attack':a.b?'guard':'snowAction';e.atk=a.d||0;e.hits=a.h||1;e.guardAmount=a.b||0;}}
function prepareAct4Action(r,e){if(!e.act4)return;const a=forestAction(r,e);e.snowAction=a;e.atk=a.d||0;e.hits=a.h||1;e.guardAmount=a.b||0;}
function forestRegrow(r,kind){const dead=r.enemies.find(e=>e.hp<=0&&(kind==='branch'?e.act4Kind==='branch':['root','bloom'].includes(e.act4Kind)));if(!dead)return;const fresh=forestFoe(dead.act4Kind);for(const key of Object.keys(dead))delete dead[key];Object.assign(dead,fresh,{summonedTurn:r.turn});}
function forestExecute(r,e){const a=e.snowAction||{};if(e.forestBossV2)return forestBossExecute(r,e,a);if(a.bud)e.bud=(e.bud||0)+a.bud;if(a.healAll!=null)for(const x of r.enemies)if(x.hp>0)healHP(x,a.healAll);if(a.healTree){const tree=r.enemies.find(x=>x.act4Kind==='tree'&&x.hp>0);if(tree)healHP(tree,a.heal||0);}if(a.hostsBud)for(const x of r.enemies)if(x.hp>0&&['root','bloom'].includes(x.act4Kind))x.bud=(x.bud||0)+a.hostsBud;if(a.s)e.str=(e.str||0)+a.s;if(a.revive)forestRegrow(r,a.revive);if(a.summon)for(let i=0;i<(a.count||0);i++){const dead=r.enemies.find(x=>x.act4Kind==='larva'&&x.hp<=0),fresh=Object.assign(forestFoe('larva'),{summonedTurn:r.turn});if(dead){for(const k of Object.keys(dead))delete dead[k];Object.assign(dead,fresh);}else r.enemies.push(fresh);}if(a.consume)e.bud=0;}
// This hook runs at the primitive HP-loss boundary, before laceration/counters.
function onAct4Damage(r,e,lost,attack){if(e.act4&&attack&&lost>0)e.bud=Math.max(0,(e.bud||0)-1);if(e.act4&&e.hp<=0&&['tree','colony'].includes(e.act4Kind)){for(const x of r.enemies)if(x!==e&&x.act4&&x.hp>0&&(['root','bloom'].includes(x.act4Kind)&&e.act4Kind==='tree'||x.act4Kind==='branch'&&e.act4Kind==='colony')){x.hp=0;x.forestDismissed=true;}}}
const forestDamageBase=dealDamage;dealDamage=function(...args){const lost=forestDamageBase(...args);if(S.run?.act===4&&!S.run.enemyPhase)planForest(S.run);return lost;};
const forestChooseBase=choose;choose=function(type){const r=S.run,old=r?.mode;forestChooseBase(type);if(r===S.run&&r?.act===4&&old!=='battle'&&r.mode==='battle'&&['fight','elite','boss'].includes(type)){r.forestMarks={};r.forestErosion=0;r.forestErosionSnapshot=0;r.enemies=forestEncounter(r,type);if(type==='boss')luckyPrepareInstances(r);target=0;healthVisuals.clear();planForest(r);render();}};
const forestPlanBase=prepareEncounterTurn;prepareEncounterTurn=function(r){forestPlanBase(r);if(r.act===4)planForest(r);};
const forestBossBase=bossPlan;bossPlan=function(r){if(r.act===4)return planForest(r);return forestBossBase(r);};
const forestSnowBase=snowAction;snowAction=function(r,e){if(e.act4)return forestExecute(r,e);return forestSnowBase(r,e);};
const forestAbilityBase=enemyAbilities;enemyAbilities=function(e){if(!e.act4)return forestAbilityBase(e);if(e.act4Kind==='tree'&&e.forestBossV2)return [['永花','強化行動で芽吹きを消費しない。攻撃でHPを失うたび芽吹きは1減る。本体を倒すと戦闘終了。']];if(e.act4Kind==='tree')return [['寄生の根','生存中の宿主に芽吹きを与え、倒れた宿主を再生する。本体を倒すと戦闘終了。']];if(e.act4Kind==='colony')return [['接ぎ木','3番目の行動後、倒れた枝を1本再生する。本体を倒すと戦闘終了。']];return [];};
const forestAbilityHTMLBase=enemyAbilitiesHTML;enemyAbilitiesHTML=function(e){const html=forestAbilityHTMLBase(e);return e.act4Kind==='tree'?html.replace('enemy-abilities ', 'enemy-abilities boss-abilities '):html;};
const forestStatusBase=enemyStatusHTML;enemyStatusHTML=function(e){let html=forestStatusBase(e);if(e.act4&&(['moth','flower','deer','queen','root','bloom'].includes(e.act4Kind)||(e.forestBossV2&&e.act4Kind==='tree')))html+=statusEffectHTML('芽吹き',e.bud||0);return html;};
const forestIntentBase=intent;intent=function(e){if(!e.act4)return forestIntentBase(e);if(e.hunterStun||e.intent==='stunned')return '<strong>⏸ スタン</strong>';const a=e.snowAction||{},r=S.run;let d=enemyAttack(e);if(e.weak)d=Math.floor(d*.7);d=hunterAttackDamage(r,r,d);return [a.d!=null?'<strong>⚔ '+d+(a.h>1?' × '+a.h:'')+'</strong>':'',a.b?'<strong>◇ '+a.b+'</strong>':'',a.bud?intentStatus('芽吹き',a.bud):'',a.hostsBud?intentStatus('芽吹き',a.hostsBud)+'<small>各宿主</small>':'',a.healAll!=null?'<strong>✚ '+a.healAll+'</strong><small>敵全体</small>':'',a.healTree?'<strong>✚ '+a.heal+'</strong><small>母樹</small>':'',a.summon?'<strong>幼虫 ×'+a.count+'</strong>':'',a.revive?'<strong>再生 ×'+(r.enemies.some(x=>x.hp<=0&&(a.revive==='branch'?x.act4Kind==='branch':['root','bloom'].includes(x.act4Kind)))?1:0)+'</strong>':'',a.mark?'<strong>寄生2 × '+a.mark+'</strong>':'',a.hosts?'<strong>獣2体を召喚</strong>':'',a.restore?'<strong>'+ (a.restore==='root'?'寄生された獣':'芽吹く獣') +'を復活</strong>':'',a.erode!=null?intentStatus('浸食',a.erode):'',a.heal!=null&&e.forestBossV2?'<strong>✚ '+a.heal+'</strong>':'',a.agility?intentStatus('守護',a.agility):'',a.budBlock&&!a.b?'<strong>◇ 0</strong>':'',a.s?intentStatus('筋力',a.s):'',a.wait?'<strong>—</strong>':''].join('');};
const forestBattleBase=battle;battle=function(){let html=forestBattleBase();if(S.run?.act===4&&S.run.forestErosion)html=html.replace('<div class="player-status">','<div class="player-status">'+statusEffectHTML('浸食',S.run.forestErosion));return S.run?.act===4?html.replace(/<h2>[^<]*<\/h2>/,'<h2>'+(S.run.kind==='boss'?'万骸の母樹':S.run.kind==='elite'?'寄生樹海の強敵':'寄生樹海')+'</h2>'):html;};
const forestArtBase=destinationArt;destinationArt=function(id){if(id!==4)return forestArtBase(id);return '<svg viewBox="0 0 700 540" role="img" aria-label="寄生植物と骸に覆われた母樹"><rect width="700" height="540" fill="#14251e"/><circle cx="480" cy="130" r="80" fill="#a3b789" opacity=".12"/><g fill="#243d2c"><path d="M0 420L40 130 75 205 95 48 130 235 175 145 205 430ZM490 430L520 165 550 220 580 55 610 210 650 90 700 420Z"/></g><path d="M240 500L296 330 230 240 175 210 235 165 195 85 300 130 350 35 410 115 500 70 475 175 540 230 440 310 420 435 510 510 390 470 335 400 305 475Z" fill="#3b5134" stroke="#78805a" stroke-width="4"/><g fill="#a5a079"><ellipse cx="300" cy="278" rx="20" ry="28"/><ellipse cx="400" cy="245" rx="17" ry="23"/><ellipse cx="360" cy="175" rx="15" ry="20"/></g><g fill="#1a271f"><circle cx="292" cy="276" r="5"/><circle cx="307" cy="276" r="5"/><circle cx="394" cy="243" r="4"/><circle cx="407" cy="243" r="4"/></g><path d="M0 530Q160 430 300 500L350 470 430 500Q560 445 700 520" fill="none" stroke="#586642" stroke-width="14"/></svg>';};
const forestEvolveBase=evolveCardInstance;
evolveCardInstance=function(r,id,reverse=false){
 const evolved=forestEvolveBase(r,id,reverse);
 if(evolved!==id&&r.forestMarks?.[id]){
  r.forestMarks[evolved]=r.forestMarks[id];
  delete r.forestMarks[id];
 }
 return evolved;
};
const forestVictoryBase=victory;
victory=function(){
 const r=S.run;
 if(r?.act===4&&r.enemies?.every(e=>e.hp<=0)){
  delete r.forestMarks;
  delete r.forestErosion;
  delete r.forestErosionSnapshot;
 }
 return forestVictoryBase();
};
const forestCardBase=card;
card=function(id,action='',extra=''){
 const mark=S.run?.mode==='battle'&&S.run?.forestMarks?.[id];
 return forestCardBase(id,action,mark?extra+'<small class="tag" title="'+keywords.寄生+'">寄生'+mark+'</small>':extra);
};
if(S.run?.act===4&&S.run.mode==='battle')planForest(S.run);
if(!globalThis.ASHBOUND_HEADLESS)render();
