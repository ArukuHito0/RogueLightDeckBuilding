let aimedPreviewEnemy=null,aimedPreviewCard=null;
function previewVulnerableTarget(c,r){return aimedPreviewCard===c.id&&aimedPreviewEnemy!=null?r.enemies[aimedPreviewEnemy]:null;}
function evolvedCardCount(r){return ['hand','draw','discard','exhausted'].reduce((n,k)=>n+(r[k]||[]).filter(id=>C[id]?.evolution).length,0);}
function gainEnergy(r,n){if(!r.energyLocked)r.energy+=Math.max(0,n||0);}
function addLaceration(r,e,n,{card=false,temporary=false}={}){if(!e||e.hp<=0||n<=0)return 0;n+=card?(r.bleedBonus||0):0;e.laceration=(e.laceration||0)+n;if(temporary)e.temporaryLaceration=(e.temporaryLaceration||0)+n;return n;}
function addVulnerable(r,e,n){if(!e||e.hp<=0||n<=0)return;e.vulnerable=(e.vulnerable||0)+n;if(r.tracking)draw(r.tracking);}
function applyHunterStun(e){if(!e||e.hp<=0)return;e.hunterStun=true;e.intent='stunned';e.move='スタン';}
function hunterAttackDamage(r,e,n){let value=Math.max(0,n);if(e.vulnerable)value*=1.5+(e===r?0:(r.territory||0));if(e===r&&r.damageReduction)value*=Math.max(0,1-r.damageReduction);return Math.floor(value);}
const hunterDamageBase=dealDamage;dealDamage=function(e,n,options={}){const r=S.run;if(!r)return 0;const isAttack=!!options.attack,bleed=e?.laceration||0;if(isAttack)n=hunterAttackDamage(r,e,n);const beforeBlock=e?.block||0;const lost=hunterDamageBase(e,n,options);if(e===r&&isAttack&&options.attacker&&Math.min(beforeBlock,n)>0&&r.bleedCounter)addLaceration(r,options.attacker,r.bleedCounter);if(isAttack&&lost>0&&bleed&&e.laceration&&e.hp>0){const ticks=1+(e===r?0:r.bleedRepeat||0);for(let i=0;i<ticks&&e.hp>0;i++)hunterDamageBase(e,bleed,{ignoreBlock:true,damageKind:"裂傷"});}return lost;};
const hunterCardAttackBase=cardAttack;cardAttack=function(e,n){const r=S.run;const lost=dealDamage(e,n,{attack:true,attacker:r});if(hasRelic('three_damage',r)){r.damageCount=(r.damageCount||0)+1;if(r.damageCount%3===0)r.str++;}if(r.poisonCoat&&e.hp>0)addPoison(e,r.poisonCoat);return lost;};
const hunterCombatCardBase=combatCard;combatCard=function(id){const c=hunterCombatCardBase(id),r=S.run;if(!c||!r)return c;const f={...c.fx},e=r.enemies?.[target],factor=effectFactor(r);if(c.characterId==='hunter'){
 for(const key of ['bleed','vulnerable','bleedAmount','extraBleed','bleedCounter','bleedBonus','tracking','selfBleed','enemyTempStrength','vulnerableStrength','vulnerableBleed','vulnerableDraw','evolutionStrength','evolveHand','searchDraw','searchEvolvable','bleedRepeat','evolveDeck'])if(typeof f[key]==='number')f[key]*=factor;
 if(f.evolvedDamage)f.d+=evolvedCardCount(r)*f.evolvedDamage;if(f.evolutionDamage)f.d=(f.d||0)+(r.evolutionCount||0)*f.evolutionDamage;
 if(f.evolvedBlock)f.b+=evolvedCardCount(r)*f.evolvedBlock;if(f.vulnerableBlock&&e?.vulnerable)f.b+=f.vulnerableBlock;
 if(f.bleedHits&&e?.laceration)f.h=(f.h||1)+f.bleedHits;if(f.vulnerableHits&&e?.vulnerable)f.h=(f.h||1)+f.vulnerableHits;
 if(f.bleedHitCount)f.h=e?.laceration||0;if(f.xHits)f.h=Math.max(0,r.energy-(hasRelic('double_cards',r)?1:0));if(f.xBleed)f.bleed=(Math.max(0,r.energy-(hasRelic('double_cards',r)?1:0))+f.xBleed)*factor;
 if(f.allVulnerableDamage)f.d+=r.enemies.filter(e=>e.hp>0).reduce((n,e)=>n+(e.vulnerable||0),0)*f.allVulnerableDamage;
 if(f.vulnerableDamage)f.d+=(e?.vulnerable||0)*f.vulnerableDamage;
 }return {...c,cost:c.xCost?Math.max(hasRelic('double_cards',r)?1:0,r.energy):c.cost,fx:f};};
function canPlayHunterCard(c,r){return !c.fx.lowHpOnly||r.hp<=r.max*c.fx.lowHpOnly;}
function resolveHunterEffects(r,c){if(c.characterId!=='hunter')return;const f=c.fx,foes=f.all?r.enemies.filter(e=>e.hp>0):[r.enemies[target]],selected=r.enemies[target];for(const e of foes){if(!e||e.hp<=0)continue;const hadBleed=!!e.laceration;
 if(f.bleed)addLaceration(r,e,f.bleed+(hadBleed?(f.extraBleed||0):0),{card:true,temporary:!!f.temporaryBleed});
 if(f.bleedDraw&&hadBleed)draw(f.bleedDraw*effectFactor(r));
 if(f.vulnerable)addVulnerable(r,e,f.vulnerable);if(f.blockVulnerable)addVulnerable(r,e,Math.floor((e.block||0)/(f.blockVulnerableInterval??10))*f.blockVulnerable*effectFactor(r));
 if(f.doubleVulnerable)addVulnerable(r,e,e.vulnerable||0);if(f.vulnerableStrength)r.str+=(e.vulnerable||0)*f.vulnerableStrength;
 if(f.vulnerableBleed)addLaceration(r,e,Math.floor((e.vulnerable||0)/(f.vulnerableBleedInterval??2))*f.vulnerableBleed,{card:true});
 if(f.vulnerableDraw)draw(Math.floor((e.vulnerable||0)/(f.vulnerableDrawInterval??2))*f.vulnerableDraw);
 if(f.stun||(f.stunAttack&&e.intent==='attack'))applyHunterStun(e);
 if(f.enemyTempStrength){e.str=(e.str||0)-f.enemyTempStrength;e.hunterTempStrength=(e.hunterTempStrength||0)+f.enemyTempStrength;}
 }
 for(let i=0;i<(f.randomBleed||0);i++){const alive=r.enemies.filter(e=>e.hp>0);if(alive.length)addLaceration(r,rand(alive),f.bleedAmount,{card:true});}
 if(f.selfBleed)addLaceration(r,r,f.selfBleed,{card:true});
 if(f.damageReduction)r.damageReduction=Math.max(r.damageReduction||0,f.damageReduction);
 for(const key of ['evolutionBlock','evolutionStrength','bleedCounter','bleedBonus','beastHunt','bleedRepeat','tracking','territory'])if(f[key])r[key]=(r[key]||0)+f[key];
 if(f.evolutionEnergy){gainEnergy(r,r.hand.filter(id=>C[id]?.evolution).length*effectFactor(r));r.energyLocked=true;}
 if(f.evolveHand||f.evolveDeck||f.devolveHand){const kind=f.evolveHand||f.evolveDeck?'evolve':'devolve';r.hunterChoice={kind,scope:f.evolveDeck?'deck':'hand',remaining:f.evolveDeck||f.evolveHand||f.devolveHand,stages:f.evolveStages||1};const n=hunterChoiceCandidates(r).length;if(!n)r.hunterChoice=null;else r.hunterChoice.remaining=Math.min(n,r.hunterChoice.remaining);}
 if(f.searchEvolvable&&r.hand.length<10){r.hunterChoice={kind:'search',scope:f.searchPile,evolvableOnly:true,remaining:f.searchEvolvable};const n=hunterChoiceCandidates(r).length;if(!n)r.hunterChoice=null;else r.hunterChoice.remaining=Math.min(n,r.hunterChoice.remaining,10-r.hand.length);}
 if(f.searchDraw&&r.draw.length&&r.hand.length<10)r.hunterChoice={kind:'search',remaining:Math.min(f.searchDraw,r.draw.length,10-r.hand.length)};
}
function evolveCardInstance(r,id,reverse=false){const c=C[id],to=reverse?c?.devolveTo:c?.evolveTo;if(to==null)return id;const newId=nextBattleCardId(r),entry={id:newId,origin:to};(r.battleCards??=[]).push(entry);hydrateBattleCard(entry);if(!reverse){r.evolutionCount=(r.evolutionCount||0)+1;if(r.evolutionBlock)gainBlock(r,r.evolutionBlock,'passive');if(r.evolutionStrength&&r.evolutionCount%3===0)r.str+=r.evolutionStrength;}return newId;}
const hunterPileBase=resolvePlayedCardPile;resolvePlayedCardPile=function(r,c,trigger=true){if(c.evolveTo!=null&&r.hp>0){r.discard.push(evolveCardInstance(r,c.id));return;}hunterPileBase(r,c,trigger);};
function hunterChoiceCandidates(r){const p=r.hunterChoice;if(!p)return [];const piles=p.kind==='search'?[p.scope||'draw']:p.scope==='deck'?['hand','draw','discard','exhausted']:['hand'];let offset=0,out=[];for(const pile of piles){out.push(...(r[pile]||[]).map((id,pileIndex)=>({id,index:offset+pileIndex,pile,pileIndex})));offset+=(r[pile]||[]).length;}return out.filter(x=>!(p.chosenIndexes||[]).includes(x.index)).filter(x=>(p.kind==='search'&&(!p.evolvableOnly||C[x.id]?.evolveTo!=null))||(p.kind!=='search'&&(p.kind==='evolve'?C[x.id]?.evolveTo!=null:C[x.id]?.devolveTo!=null)));}
function chooseHunterCard(index){const r=S.run,p=r?.hunterChoice;if(!r||!p||busy)return;const candidate=hunterChoiceCandidates(r).find(x=>x.index===index);if(!candidate)return;if(p.kind==='search'){if(r.hand.length<10)r.hand.push(r[candidate.pile].splice(candidate.pileIndex,1)[0]);p.remaining--;if(!p.remaining||!hunterChoiceCandidates(r).length||r.hand.length>=10)r.hunterChoice=null;}else{let evolved=candidate.id;for(let stage=0;stage<(p.stages||1);stage++)evolved=evolveCardInstance(r,evolved,p.kind==='devolve');r[candidate.pile][candidate.pileIndex]=evolved;(p.chosenIndexes??=[]).push(index);p.remaining--;if(!p.remaining||!hunterChoiceCandidates(r).length)r.hunterChoice=null;}if(r.enemies.every(e=>e.hp<=0)){r.hunterChoice=null;victory();}else render();}
function skipHunterChoice(){if(S.run?.hunterChoice?.kind==='evolve'&&!busy){S.run.hunterChoice=null;render();}}
function decayHunterStatus(r,e){e.laceration=Math.max(0,(e.laceration||0)-(e===r?1:1+(r.bleedRepeat||0)));e.vulnerable=Math.max(0,(e.vulnerable||0)-1);}
function hunterPlayerTurnEnd(r){decayHunterStatus(r,r);for(const e of r.enemies){if(e.temporaryLaceration){e.laceration=Math.max(0,(e.laceration||0)-e.temporaryLaceration);e.temporaryLaceration=0;}}}
function hunterEnemyActionEnd(r,e){decayHunterStatus(r,e);if(e.hunterTempStrength){e.str=(e.str||0)+e.hunterTempStrength;e.hunterTempStrength=0;}e.hunterStun=false;}
function resetHunterBattle(r){for(const key of ['laceration','vulnerable','evolutionCount','evolutionBlock','evolutionStrength','bleedCounter','bleedBonus','beastHunt','bleedRepeat','tracking','territory','damageReduction'])r[key]=0;r.energyLocked=false;r.hunterChoice=null;}
const hunterChooseBase=choose;choose=function(type){const r=S.run,was=r?.mode;if(r&&was!=='battle'&&['fight','elite','boss'].includes(type))resetHunterBattle(r);hunterChooseBase(type);if(r===S.run&&r?.mode==='battle'&&was!=='battle'){resetHunterBattle(r);render();}};
const hunterTurnStartBase=applyTurnStartBuffs;applyTurnStartBuffs=function(r){r.energyLocked=false;r.damageReduction=0;r.bleedCounter=0;hunterTurnStartBase(r);if(r.beastHunt&&r.hp>0){loseHP(r,r.beastHunt*effectFactor(r));if(r.hp>0)for(const e of r.enemies)addLaceration(r,e,r.beastHunt*effectFactor(r),{card:false});}};
const hunterBossBase=bossPlan;bossPlan=function(r){hunterBossBase(r);const e=r.enemies?.[0];if(e?.hunterStun){e.intent='stunned';e.move='スタン';}};
const hunterTargetBase=needsEnemy;needsEnemy=function(c){const f=c.fx;return hunterTargetBase(c)||(!f.all&&!!(f.bleed||f.xBleed||f.vulnerable||f.vulnerableBleed||f.vulnerableDraw||f.vulnerableBlock||f.blockVulnerable||f.doubleVulnerable||f.stunAttack||f.enemyTempStrength));};
const hunterCategoriesBase=cardCategories;cardCategories=c=>c.characterId==='hunter'?[...c.types,...(c.evolution?['進化']:[])]:hunterCategoriesBase(c);
const hunterCardBase=card;card=function(id,action='',extra=''){const c=C[id];let html=hunterCardBase(id,action,extra);if(c.xCost)html=html.replace(/<span class="cost">.*?<\/span>/,`<span class="cost">${hasRelic('double_cards',S.run)?'X+1':'X'}</span>`);if(S.run&&page==='battle'&&!canPlayHunterCard(combatCard(id),S.run))html=html.replace(/\bplayable\b|\bempowered\b/g,'unplayable');if(c.evolution)html=html.replace('class="card ', 'class="card evolved-card ');return html;};
const hunterDescBase=combatDesc;
combatDesc=function(c,r){const f=c.fx,e=r.enemies[target],factor=effectFactor(r);if(c.characterId!=='hunter'){let text=hunterDescBase(c,r);if(f.heal)text=text.replace(/HPを\d+回復/,'HPを'+f.heal+'回復');if(f.enemyStrength)text=text.replace(/攻撃対象に筋力\+\d+/,'攻撃対象に筋力+'+f.enemyStrength);return text;}
let d=C[c.id]?.desc||c.desc,bonus=r.bleedBonus||0;
if(f.d!=null){const n=hunterAttackDamage(r,previewVulnerableTarget(c,r)||{},previewDamage(c,r,e));d=d.replace(/(?:\d+\+X|\d+)ダメージ/,n+'ダメージ');if(f.evolutionDamage)d=(C[c.id]?.fx.d||0)+'ダメージ。この戦闘の進化回数1回につき+'+f.evolutionDamage+'。現在'+n+'ダメージ（進化'+(r.evolutionCount||0)+'回）。';if(f.bleedHitCount||f.xHits)d=(f.all?'敵全体に':'')+n+'ダメージを'+(f.h??1)+'回。'+(f.bleedHitCount?'攻撃回数は対象の裂傷のスタック数。':'');else if(f.h>1)d=d.replace(/を\d+回/,'を'+f.h+'回');if(f.bleedHits&&e?.laceration)d=d.replace(/既に裂傷があるなら攻撃回数\+\d+。/,'');}
if(f.allVulnerableDamage)d+=' 敵全体に付与されている脆弱1につきダメージ+'+f.allVulnerableDamage+'。';
if(f.b)d=d.replace(/(?:\d+\+X|\d+)ブロック/,cardBlockValue(r,f.b)+'ブロック');
if(f.draw)d=d.replace(/カードを\d+枚引く/,'カードを'+f.draw+'枚引く');
if(f.bleed)d=d.replace(/裂傷(?:X\+\d+|\d+)/,'裂傷'+(f.bleed+bonus));
if(f.extraBleed)d=d.replace(/更に裂傷\d+/,'更に裂傷'+f.extraBleed);
if(f.selfBleed)d='自身に裂傷'+(f.selfBleed+bonus)+'、対象に裂傷'+(f.bleed+bonus)+'を付与。除外。';
if(f.bleedDraw)d=d.replace(/カードを\d+枚引く/,'カードを'+(f.bleedDraw*factor)+'枚引く');
if(f.randomBleed)d='裂傷'+(f.bleedAmount+bonus)+'を'+f.randomBleed+'回、毎回ランダムな敵に付与。';
if(f.bleedCounter)d=d.replace(/裂傷\d+/,'裂傷'+f.bleedCounter);
if(f.bleedBonus)d=d.replace(/量\+\d+/,'量+'+f.bleedBonus);
if(f.beastHunt)d='毎ターン開始時、HPを'+(f.beastHunt*factor)+'失い、敵全体に裂傷'+(f.beastHunt*factor)+'を付与。特殊。';
if(f.bleedRepeat)d='この戦闘中、裂傷の発動回数+'+f.bleedRepeat+'。敵の裂傷のターン終了時の減少量+'+f.bleedRepeat+'。特殊。';
if(f.vulnerable)d=d.replace(/脆弱\d+/,'脆弱'+f.vulnerable);
if(f.blockVulnerable)d=d.replace(/につき脆弱\d+/,'につき脆弱'+f.blockVulnerable*factor);
if(f.vulnerableStrength)d=d.replace(/筋力\d+/,'筋力'+f.vulnerableStrength);
if(f.vulnerableBleed){d=d.replace(/裂傷\d+/,'裂傷'+f.vulnerableBleed);if(bonus)d+='（残虐：付与時に+'+bonus+'）';}
if(f.vulnerableDraw)d=d.replace(/カードを\d+枚引く/,'カードを'+f.vulnerableDraw+'枚引く');
if(f.tracking)d=d.replace(/カードを\d+枚引く/,'カードを'+f.tracking+'枚引く');
if(f.enemyTempStrength)d=d.replace(/筋力-\d+/,'筋力-'+f.enemyTempStrength);
if(f.evolutionStrength)d=d.replace(/筋力\d+/,'筋力'+f.evolutionStrength);
if(f.evolveDeck)d='デッキの進化可能なカードを'+f.evolveDeck+'枚まで選び、'+(f.evolveStages||1)+'段階進化させる。除外。';
if(f.evolveHand)d='手札の進化可能なカードを'+f.evolveHand+'枚まで選び、'+(f.evolveStages||1)+'段階進化させる。除外。';
if(f.searchEvolvable)d=(f.searchPile==='discard'?'捨て札':'山札')+'の進化可能なカードを'+f.searchEvolvable+'枚選び、手札に加える。';
if(f.searchDraw)d='山札からカードを'+f.searchDraw+'枚選び、手札に加える。';
if(f.evolutionEnergy)d='手札の進化カードの枚数'+(factor>1?'の'+factor+'倍':'分')+'のエナジーを得る。このターン、以降エナジーを得られない。';
if(c.xCost)d+=' 現在X='+Math.max(0,r.energy-(hasRelic('double_cards',r)?1:0))+'。';if(f.lowHpOnly&&!canPlayHunterCard(c,r))d+=' 【HP'+Math.round(f.lowHpOnly*100)+'%以下で使用可能】';
if(hasRelic('double_cards',r))d+=' 【遺物：ダメージ・ブロック以外2倍／コスト+1】';return d;};
keywords.裂傷='攻撃ダメージでHPが減るたび、スタック数分の追加ダメージ。追加ダメージはブロックを無視。対象のターン終了時に1減少。';
keywords.脆弱='脆弱の敵に対するカードの攻撃ダメージが50%上昇する。ブロックで防ぐ前のダメージに適用され、ブロックの有無には関係しない。対象のターン終了時に1減少。スタック数は持続ターン数。';
keywords.進化='使用後、進化後のカードが捨て札へ入る。戦闘中のみ持続し、次の戦闘で元に戻る。進化カードは報酬や生成から取得できない。';
keywords.スタン='そのターンの敵を行動不能にする。';
const hunterStatusBase=enemyStatusHTML;enemyStatusHTML=function(e){let html=hunterStatusBase(e);for(const [k,n] of [['laceration','裂傷'],['vulnerable','脆弱']])if(e[k])html=html.replace('</div>',`<span class="status-help hunter-status" tabindex="0">${n} ${e[k]}<aside class="tooltip">${keywords[n]}</aside></span></div>`);return html;};
const hunterBattleBase=battle;battle=function(){const r=S.run,c=selectedCharacter();let html=hunterBattleBase().replace(/灰の契約者/g,c.name);const labels=[['evolutionCount','進化回数'],['evolutionBlock','過程'],['evolutionStrength','成長'],['tracking','追跡'],['bleedBonus','残虐'],['beastHunt','獣の狩り'],['bleedRepeat','腐食'],['territory','縄張り'],['damageReduction','軽減'],['laceration','裂傷'],['vulnerable','脆弱']];let status=labels.filter(([k])=>r[k]).map(([k,n])=>`<span class="status-help hunter-status" tabindex="0">${n} ${k==='territory'||k==='damageReduction'?Math.round(r[k]*100)+'%':r[k]}</span>`).join('');if(r.energyLocked)status+='<span>エナジー獲得不可</span>';html=html.replace('<div class="player-status">','<div class="player-status">'+status);if(r.hunterChoice){const p=r.hunterChoice,title={search:(p.scope==='discard'?'捨て札':'山札')+'から'+(p.evolvableOnly?'進化可能な':'')+'カードを選ぶ',evolve:p.scope==='deck'?'デッキから進化させるカードを選ぶ':'進化させるカードを選ぶ',devolve:'退化させるカードを選ぶ'}[p.kind];html+=`<div class="pile-overlay hunter-choice" role="dialog" aria-modal="true" aria-label="${title}"><div class="pile-panel"><div class="toolbar"><h2>${title}</h2>${p.kind==='evolve'?'<button onclick="skipHunterChoice()">ここまでで確定</button>':''}</div><p>残り${p.remaining}枚</p><div class="cards">${hunterChoiceCandidates(r).map(x=>card(x.id,`chooseHunterCard(${x.index})`,p.scope==='deck'?`<span class="count">${{hand:'手札',draw:'山札',discard:'捨て札',exhausted:'除外'}[x.pile]}</span>`:'')).join('')}</div></div></div>`;}return html;};
const hunterWireBase=wireBattle;wireBattle=function(){hunterWireBase();document.querySelectorAll('.hunter-choice .card').forEach(el=>el.classList.remove('playable','unplayable','empowered'));};
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('.hunter-choice'))e.stopImmediatePropagation();},true);
const hunterForecastBase=forecastDamage;forecastDamage=function(r){if(!r||(!r.damageReduction&&!r.vulnerable&&!r.laceration))return hunterForecastBase(r);const predicted={...r,vulnerable:Math.max(0,(r.vulnerable||0)-1)};let block=r.block||0,total=0;for(const e of r.enemies){if(e.hp<=poisonLoss(e,r)||e.intent!=='attack')continue;for(let i=0;i<(e.hits||1);i++){const n=Math.floor(Math.max(0,enemyAttack(e))*(predicted.vulnerable?1.5:1)*Math.max(0,1-(r.damageReduction||0)));const lost=Math.max(0,n-block);total+=lost+(lost>0?Math.max(0,(r.laceration||0)-1):0);block=Math.max(0,block-n);}}return total;};
const hunterPackMatchesBase=packMatches;packMatches=function(c,axis){return ['進化','裂傷','脆弱'].includes(axis)?c.axis===axis:hunterPackMatchesBase(c,axis)||(axis==='流血'&&!!(c.fx.selfBleed||c.fx.beastHunt||c.fx.lowHpOnly));};
// Restore a hunter run only after all permanent card definitions and hooks exist.
if(resumedHunterRun){S.run=resumedHunterRun;page=S.run.mode;for(const x of S.run.battleCards||[])hydrateBattleCard(x);for(const x of S.run.generatedCards||[])hydrateGeneratedCard(x);}
const hunterVictoryBase=victory;victory=function(){if(S.run)S.run.hunterChoice=null;return hunterVictoryBase();};
const renderHunterBase=render;render=function(){if(globalThis.ASHBOUND_LOADING)return;renderHunterBase();const r=S.run;if(page==='battle'&&r?.hunterChoice){const candidates=hunterChoiceCandidates(r);document.querySelectorAll('.hunter-choice .card').forEach((el,i)=>{el.onclick=()=>chooseHunterCard(candidates[i].index);el.classList.remove('playable','unplayable','empowered');});}};
globalThis.ASHBOUND_LOADING=false;
if(!globalThis.ASHBOUND_HEADLESS)render();
