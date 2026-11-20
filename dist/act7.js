// ACT7: resources and repayments are battle-local, while gold uses the run wallet.
Object.assign(keywords,{'保持ゴールド':'敵が行動に使う資金。撃破時、未消費の初期・生成分と、消費済みを含む累計奪取額を獲得。','貯蔵血':'攻撃で実際に減らしたHPを貯蔵。撃破すると、消費済みを含む累計奪取HPを回復する。','保持エナジー':'次のターンの通常回復分から奪ったエナジー。撃破時に返却。敵フェーズ中の返却は次の回復に加算。'});
INFO_STATUS_KEYS.push('保持ゴールド','貯蔵血','保持エナジー');
const GOLD_FOES={
 thief:['金歯の追い剥ぎ',48,20,[{d:8,steal:15},{cost:15,d:7,h:2,fallback:{d:8}},{b:6}]],
 vault:['金庫背負い',64,40,[{cost:20,b:18,fallback:{b:6}},{d:12,steal:20},{d:5,h:2}]],
 priest:['買収の祈祷師',46,30,[{cost:15,allyBlock:10,needAlly:true,fallback:{b:5}},{d:9,steal:30},{cost:15,healAll:6,fallback:{d:6}}]],
 blood:['血袋の亡者',58,0,[{d:10},{bloodBlock:8,b:8},{d:4,h:3}]],
 goblin:['灯盗みの小鬼',44,0,[{energySteal:1},{d:4,h:2},{d:10}]],
 mint:['贋金鋳造師',46,0,[{supply:20},{d:8,b:6},{supply:20}]],
 captain:['黄金鎧の傭兵長',135,90,[{d:12,steal:30},{cost:30,d:8,h:3,fallback:{d:5,h:3}},{cost:30,b:24,fallback:{b:8}},{cost:30,d:30,fallback:{d:18}}]],
 tax:['血宴の徴税官',120,0,[{d:6,h:2},{bloodAttack:12,d:14},{b:12},{d:5,h:3}]],
 collector:['蓄光の収集者',100,0,[{energySteal:1},{d:16},{b:8,energyBlock:4},{d:5,h:3}]],
 donorA:['黄金の献納者A',35,0,[{supply:10},{b:8}]],
 donorB:['黄金の献納者B',35,0,[{supply:10},{b:8}]],
 lord:['黄金卿',320,60,[{d:12,steal:20},{cost:40,d:6,h:4,fallback:{d:4,h:4}},{cost:40,energySteal:1,fallback:{b:10}},{bloodBlock:12,b:12},{d:22,energyAttack:3,steal:20},{wait:true}]]
};
const GOLD_NORMAL=['thief','vault','priest','blood','goblin'];
const GOLD_PAIRS=[['thief','vault'],['vault','priest'],['blood','thief'],['goblin','vault'],['goblin','blood'],['mint','thief'],['mint','vault'],['mint','priest']];
const GOLD_PATHS={
 thief:'M14 58L18 32 23 26 22 12 39 8 43 26 49 33 53 58M23 20L30 24 39 19M27 29H36M17 37L7 43 10 49M46 36L58 30M22 45L32 51 43 44M27 30L29 34 32 30 35 34',
 vault:'M16 59V23L22 13H46L53 24V59ZM22 24H46V51H22ZM30 32H38V42H30ZM34 34V40M16 30L7 35 5 51M53 30L60 35 62 51',
 priest:'M14 59L20 31 23 25 25 9H38L41 25 46 31 51 59M22 20H41M24 30L32 38 40 30M25 42L32 47 40 42V55L32 59 25 55ZM8 9V57M4 16H12',
 blood:'M16 56Q7 44 15 31L22 26 23 10 36 6 43 18 41 29Q57 37 51 54ZM25 18H28M34 18H37M23 35L17 48M42 36L47 47M31 34Q20 48 31 51Q42 48 31 34Z',
 goblin:'M15 59L19 33 11 15 26 22 33 10 41 22 56 14 48 34 51 59M24 28L28 29M36 29L41 27M28 38L36 39M19 43L8 40M47 43L56 40M7 39V53H17V39ZM12 32V39',
 mint:'M13 58L17 29 24 25 23 9 39 9 42 25 48 30 52 58M24 18H40M21 38H46V54H21ZM8 33L18 37M47 32L57 24M31 39V52M25 44H37M48 7L57 16',
 captain:'M11 59L16 28 24 22 22 8 32 4 42 8 40 22 48 28 53 59M23 17H41M20 31L32 39 44 31M21 43L32 49 43 43V56L32 61 21 56M6 12V58M3 18H10M49 10L58 10 60 22 48 25',
 tax:'M13 59L18 30 24 24 23 11 39 7 43 24 49 31 53 59M25 19H40M26 30L32 36 39 30M8 12V57M4 22H13M30 43Q20 55 31 58Q42 55 30 43ZM47 43H59V55H47Z',
 collector:'M14 58L19 32 23 25 25 10 39 10 42 25 46 32 51 58M24 19H41M27 29L32 34 38 28M21 40L10 34M45 40L55 34M5 32H16V48H5ZM50 32H61V48H50M10 25V32M55 25V32',
 donorA:'M15 59L19 33 24 27 24 10H39V27L45 33 49 59M24 20H40M21 37L32 44 44 37M21 44L32 51 44 44M26 52H39M29 6H34',
 donorB:'M15 59L19 33 24 27 24 10H39V27L45 33 49 59M24 20H40M21 37L32 44 44 37M21 44L32 51 44 44M26 52H39M26 6H38',
 lord:'M8 62L14 32 23 25 21 13 16 5 28 11 32 2 37 11 49 5 43 14 42 25 50 32 56 62M23 21H41M20 31L32 40 44 31M18 43L32 51 46 43V57L32 63 18 57ZM27 22L30 24M35 24L38 22M32 41V60M8 20V57M5 26H12'
};
function goldIcon(key){return '<svg class="enemy-art" viewBox="0 0 64 64" aria-hidden="true"><path d="'+GOLD_PATHS[key]+'" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
function goldFoe(key,r=S.run){const [name,hp,gold]=GOLD_FOES[key];r.goldSerial=(r.goldSerial||0)+1;return Object.assign(enemy(name,goldIcon(key),typeof balanceGoldHp === "function" ? balanceGoldHp(key,hp) : hp,0),{act2:true,act7:true,goldKind:key,goldId:'gold-'+r.goldSerial,actionStep:0,str:0,nativeGold:gold,stolenBalance:0,stolenTotal:0,storedBlood:0,bloodTotal:0,heldEnergy:0,generatedGold:0,lightDamage:0,lightTurn:r.turn});}
function goldPick(group,pool){return typeof balanceGoldPick==='function'?balanceGoldPick(group,pool):rand(pool);}
function goldEncounter(r,type){if(type==='boss')return ['donorA','donorB','lord'].map(k=>goldFoe(k,r));if(type==='elite'){r.goldElites??=[];if(!r.goldElites.length)r.goldElites=shuffle(['captain','tax','collector']);return [goldFoe(r.goldElites.pop(),r)];}r.goldFights=(r.goldFights||0)+1;return (r.goldFights<=3?[goldPick('solo',GOLD_NORMAL)]:goldPick('pairs',GOLD_PAIRS)).map(k=>goldFoe(k,r));}
function goldBalance(e){return (e.nativeGold||0)+(e.stolenBalance||0);}
function goldReturnAmount(e){return (e.nativeGold||0)+(e.stolenTotal||0);}
function goldSpend(e,n){if(goldBalance(e)<n)return false;const native=Math.min(e.nativeGold||0,n);e.nativeGold-=native;e.stolenBalance-=n-native;return true;}
function goldSupplyTarget(r,e){if(e.goldKind.startsWith('donor'))return r.enemies.find(x=>x.goldKind==='lord'&&x.hp>0);return r.enemies.filter(x=>x!==e&&x.hp>0&&GOLD_FOES[x.goldKind]?.[3].some(a=>a.cost)).sort((a,b)=>goldBalance(a)-goldBalance(b)||r.enemies.indexOf(a)-r.enemies.indexOf(b))[0];}
function goldAction(r,e,budget=goldBalance(e)){let raw;if(e.goldKind.startsWith('donor')){const supply=(r.turn%2===1)===(e.goldKind==='donorA');raw=GOLD_FOES[e.goldKind][3][supply?0:1];}else {const list=GOLD_FOES[e.goldKind][3];raw=list[e.actionStep%list.length];}let a={...raw};
 if(a.cost&&(budget<a.cost||a.needAlly&&!r.enemies.some(x=>x!==e&&x.hp>0))){a={...a.fallback,unfunded:true,wantedCost:a.cost};}
 if(a.supply){const cap=e.goldKind==='mint'?80:60,target=goldSupplyTarget(r,e);a.supply=Math.min(a.supply,Math.max(0,cap-e.generatedGold));if(!target||!a.supply)a={b:8};else a.supplyTarget=target.goldId;}
 if(a.bloodBlock){a.bloodUse=Math.min(a.bloodBlock,e.storedBlood);a.b+=a.bloodUse;}
 if(a.bloodAttack){a.bloodUse=Math.min(a.bloodAttack,e.storedBlood);a.d+=a.bloodUse;}
 if(a.energyBlock)a.b+=e.heldEnergy*a.energyBlock;if(a.energyAttack)a.d+=e.heldEnergy*a.energyAttack;return a;
}
function goldStrength(e,a=null){return (e.str||0)+(e.goldKind==='goblin'?e.heldEnergy:0)+(e.goldKind==='tax'?Math.floor(Math.max(0,e.storedBlood-(a?.bloodUse||0))/2):0);}
function goldPreviewAction(r,e){let budget=goldBalance(e);if(e.goldKind==='lord'&&!r.enemyPhase){for(const donor of r.enemies){if(donor===e)break;if(donor.hp>0&&donor.goldKind?.startsWith('donor')&&!donor.hunterStun){const a=goldAction(r,donor);if(a.supplyTarget===e.goldId)budget+=a.supply||0;}}}return goldAction(r,e,budget);}
function planGold(r){for(const e of r.enemies||[]){if(!e.act7||e.hp<=0)continue;const a=goldPreviewAction(r,e);e.snowAction=a;e.intent=e.hunterStun?'stunned':a.d!=null?'attack':a.b?'guard':'snowAction';e.atk=a.d||0;e.hits=a.h||1;e.guardAmount=a.b||0;}}
// Spending occurs only when the enemy really executes its action, after poison/stun.
function prepareAct7Action(r,e){if(!e.act7)return;const a=goldAction(r,e);if(!e.hunterStun&&e.intent!=='stunned'){if(a.cost)goldSpend(e,a.cost);if(a.bloodUse)e.storedBlood-=a.bloodUse;if(a.steal){const taken=Math.min(Math.max(0,r.gold||0),a.steal);r.gold-=taken;e.stolenBalance+=taken;e.stolenTotal+=taken;}e.goldAction=a;e.intent=a.d!=null?'attack':a.b?'guard':'snowAction';}e.snowAction=a;e.atk=a.d||0;e.hits=a.h||1;e.guardAmount=a.b||0;}
function goldExecute(r,e){const a=e.goldAction||e.snowAction||{};if(a.d!=null&&a.b)e.block=(e.block||0)+a.b;
 if(a.energySteal)(r.goldEnergyReservations??=[]).push({source:e.goldId,n:a.energySteal});
 if(a.allyBlock)for(const x of r.enemies)if(x!==e&&x.hp>0)x.block=(x.block||0)+a.allyBlock;
 if(a.healAll)for(const x of r.enemies)if(x.hp>0)healHP(x,a.healAll);
 if(a.supply){const target=r.enemies.find(x=>x.goldId===a.supplyTarget&&x.hp>0);if(target){target.nativeGold+=a.supply;e.generatedGold+=a.supply;}}
}
function goldReturnEnergy(r,e,n){const returned=Math.min(e.heldEnergy||0,n);if(!returned)return;e.heldEnergy-=returned;if(r.enemyPhase||r.goldEnding)r.goldEnergyReturn=(r.goldEnergyReturn||0)+returned;else r.energy+=returned;}
function goldSettle(r,e){if(e.goldReturned||e.goldDismissed)return;e.goldReturned=true;const gold=goldReturnAmount(e);r.gold=(r.gold||0)+gold;r.goldRecovered=(r.goldRecovered||0)+gold;healHP(r,e.bloodTotal||0);goldReturnEnergy(r,e,e.heldEnergy);if(e.goldKind==='lord')for(const x of r.enemies)if(x!==e&&x.act7&&x.hp>0){x.goldDismissed=true;x.goldReturned=true;x.hp=0;}}
function onAct7Damage(r,e,lost,attack,attacker,hpLoss){if(!r||r.act!==7)return;if(e===r&&attack&&lost>0&&attacker?.act7&&['blood','tax','lord'].includes(attacker.goldKind)){attacker.storedBlood+=lost;attacker.bloodTotal+=lost;}
 if(!e?.act7)return;if(e.hp<=0){goldSettle(r,e);return;}if(e.goldKind==='collector'&&!hpLoss&&lost>0){if(e.lightTurn!==r.turn){e.lightTurn=r.turn;e.lightDamage=0;}const before=e.lightDamage;e.lightDamage+=lost;const thresholds=Math.floor(e.lightDamage/20)-Math.floor(before/20);if(thresholds>0)goldReturnEnergy(r,e,thresholds);}}
function goldBeginTurn(r){if(r.act!==7)return;r.goldEnding=false;for(const e of r.enemies||[])if(e.act7){e.lightTurn=r.turn;e.lightDamage=0;}let normal=Math.max(0,r.energy);for(const res of (r.goldEnergyReservations||[]).splice(0)){const e=r.enemies.find(x=>x.goldId===res.source&&x.hp>0);if(!e)continue;const n=Math.min(normal,res.n);normal-=n;e.heldEnergy+=n;}r.energy=normal+(r.goldEnergyReturn||0);r.goldEnergyReturn=0;}
const goldAttackBase=enemyAttack;enemyAttack=function(e){return e.act7?Math.max(0,e.atk+goldStrength(e)):goldAttackBase(e);};
const goldStatusBase=effectiveEnemyStatus;effectiveEnemyStatus=function(e,key){return e.act7&&key==='str'?goldStrength(e):goldStatusBase(e,key);};
const goldChooseBase=choose;choose=function(type){const r=S.run,was=r?.mode;goldChooseBase(type);if(r===S.run&&r?.act===7&&was!=='battle'&&r.mode==='battle'){r.goldEnergyReservations=[];r.goldEnergyReturn=0;r.goldRecovered=0;r.goldEnding=false;r.enemies=goldEncounter(r,r.kind);target=0;healthVisuals.clear();planGold(r);render();}};
const goldPlanBase=prepareEncounterTurn;prepareEncounterTurn=function(r){goldPlanBase(r);if(r.act===7)planGold(r);};
const goldBossBase=bossPlan;bossPlan=function(r){return r.act===7?planGold(r):goldBossBase(r);};
const goldSnowBase=snowAction;snowAction=function(r,e){return e.act7?goldExecute(r,e):goldSnowBase(r,e);};
const goldActionEndBase=hunterEnemyActionEnd;hunterEnemyActionEnd=function(r,e){goldActionEndBase(r,e);if(e.act7)e.goldAction=null;};
const goldEndBase=endTurn;endTurn=async function(){const r=S.run;if(r?.act!==7)return goldEndBase();r.goldEnding=true;try{return await goldEndBase();}finally{if(S.run===r)r.goldEnding=false;}};
const goldAbilitiesBase=enemyAbilities;enemyAbilities=function(e){if(!e.act7)return goldAbilitiesBase(e);const a=[];if(['blood','tax','lord'].includes(e.goldKind))a.push(['血の徴収',keywords.貯蔵血+' 現在の貯蔵血：'+e.storedBlood+'。撃破時回復：'+e.bloodTotal+'。']);if(e.goldKind==='tax')a.push(['瀉血','貯蔵血2につき筋力1。各ヒット後に更新。血を使う攻撃は先に消費してから補正を計算する。']);if(e.goldKind==='goblin')a.push(['盗んだ灯','保持エナジー1につき筋力1。現在：+'+e.heldEnergy+'。']);if(e.goldKind==='collector')a.push(['燐光','同じターン内の実HPダメージ20ごとに、保持エナジーを1返す。現在：'+e.lightDamage+'ダメージ。端数は次のプレイヤーターン開始時にリセット。']);if(e.goldKind==='mint'||e.goldKind.startsWith('donor'))a.push(['資金供給','生成累計 '+e.generatedGold+'／'+(e.goldKind==='mint'?80:60)+'G。供給できない場合は8ブロック。']);if(GOLD_FOES[e.goldKind][3].some(x=>x.cost||x.steal))a.push(['保持ゴールド',keywords.保持ゴールド+' 現在：'+goldBalance(e)+'G。撃破時：'+goldReturnAmount(e)+'G。']);if(e.goldKind==='lord')a.push(['黄金の献納者','献納者が交互に10Gを供給する。各60Gまで。本体撃破で戦闘終了。']);return a;};
const goldAbilityHTMLBase=enemyAbilitiesHTML;enemyAbilitiesHTML=function(e){const html=goldAbilityHTMLBase(e);return e.goldKind==='lord'?html.replace('enemy-abilities ','enemy-abilities boss-abilities '):html;};
const goldEnemyStatusBase=enemyStatusHTML;enemyStatusHTML=function(e){let html=goldEnemyStatusBase(e);if(!e.act7)return html;for(const [name,value,desc] of [['保持ゴールド',goldBalance(e),keywords.保持ゴールド+' 撃破時：'+goldReturnAmount(e)+'G。'],['貯蔵血',e.storedBlood,keywords.貯蔵血+' 撃破時回復：'+e.bloodTotal+'。'],['保持エナジー',e.heldEnergy,keywords.保持エナジー]]){if(value||name==='保持ゴールド'&&GOLD_FOES[e.goldKind][3].some(a=>a.cost))html+='<span class="status-help" tabindex="0">'+name+' '+value+'<aside class="tooltip">'+desc+'</aside></span>';}return html;};
function goldDamagePreview(r,e,a){let blood=Math.max(0,e.storedBlood-(a.bloodUse||0)),block=r.block||0,hp=r.hp,values=[];for(let i=0;i<(a.h||1);i++){let n=(a.d||0)+(e.str||0)+(e.goldKind==='goblin'?e.heldEnergy:0)+(e.goldKind==='tax'?Math.floor(blood/2):0);if(e.weak)n=Math.floor(n*.7);n=hunterAttackDamage(r,r,n);values.push(n);const lost=Math.min(hp,Math.max(0,n-block));block=Math.max(0,block-n);hp-=lost;if(['blood','tax','lord'].includes(e.goldKind))blood+=lost;}return values;}
const goldIntentBase=intent;intent=function(e){if(!e.act7)return goldIntentBase(e);if(e.hunterStun||e.intent==='stunned')return '<strong>⏸ スタン</strong>';const r=S.run,a=goldPreviewAction(r,e),hits=goldDamagePreview(r,e,a),same=hits.every(n=>n===hits[0]);const supply=r.enemies.find(x=>x.goldId===a.supplyTarget);return [a.d!=null?'<strong>⚔ '+(same?hits[0]+(hits.length>1?' × '+hits.length:''):hits.join(' → '))+'</strong>':'',a.b?'<strong>◇ '+a.b+'</strong>':'',a.cost?'<small>'+a.cost+'G消費</small>':'',a.unfunded?'<small>強化不可・代替行動</small>':'',a.steal?'<strong>'+a.steal+'G奪取</strong><small>ブロックしても奪取／実際は最大'+Math.min(a.steal,r.gold||0)+'G</small>':'',a.energySteal?'<strong>次のエナジー −'+a.energySteal+'</strong>':'',a.allyBlock?'<strong>他の敵全体 ◇ '+a.allyBlock+'</strong>':'',a.healAll?'<strong>敵全体 ✚ '+a.healAll+'</strong>':'',a.supply?'<strong>'+a.supply+'G供給</strong><small>'+(supply?.name||'対象なし')+'</small>':'',a.bloodUse?'<small>貯蔵血'+a.bloodUse+'消費</small>':'',a.wait?'<strong>—</strong>':'',e.goldKind==='tax'&&a.d!=null?'<small>各ヒット後の貯蔵血で威力変化（現在の防御で予測）</small>':''].join('');};
const goldBattleBase=battle;battle=function(){const r=S.run;if(r?.act===7&&!r.enemyPhase)planGold(r);let html=goldBattleBase();if(r?.act===7)html=html.replace(/<h2>[^<]*<\/h2>/,'<h2>'+(r.kind==='boss'?'黄金卿':r.kind==='elite'?'黄金の廃市の強敵':'黄金の廃市')+'</h2>');return html;};
const goldArtBase=destinationArt;destinationArt=function(id){if(id!==7)return goldArtBase(id);return '<svg viewBox="0 0 700 540" role="img" aria-label="黄金の廃市と献納者"><defs><linearGradient id="gold-sky" x2="0" y2="1"><stop stop-color="#182126"/><stop offset="1" stop-color="#655039"/></linearGradient></defs><rect width="700" height="540" fill="url(#gold-sky)"/><circle cx="495" cy="100" r="65" fill="#cfb475" opacity=".2"/><g fill="#30302b" stroke="#8d7950" stroke-width="4"><path d="M30 470V220L115 140 195 220V470M500 470V200L570 125 655 200V470M225 460V145L350 50 475 145V460M275 450V180H425V450"/></g><path d="M0 540L280 420H420L700 540" fill="#494135"/><path d="M292 452L314 290 337 265 332 212 350 193 372 212 367 265 390 290 412 452M315 308L350 337 389 308M324 363L350 382 377 363" fill="#8b7348" stroke="#d2b373" stroke-width="5"/><g fill="#706044"><path d="M172 453L190 337 208 320 224 337 240 453ZM461 453L478 337 494 320 510 337 528 453Z"/></g><g fill="#d2b373" opacity=".65"><ellipse cx="150" cy="487" rx="10" ry="4"/><ellipse cx="485" cy="480" rx="12" ry="4"/><ellipse cx="435" cy="505" rx="8" ry="3"/></g></svg>';};
if(S.run?.act===7&&S.run.mode==='battle')planGold(S.run);
if(!globalThis.ASHBOUND_HEADLESS)render();

const goldForecastBase=forecastDamage;forecastDamage=function(r){if(r?.act!==7||r.enemies.some(e=>!e.act7))return goldForecastBase(r);const player={...r,vulnerable:Math.max(0,(r.vulnerable||0)-1)};let total=0;for(const e of r.enemies){if(e.hp<=poisonLoss(e,r)||e.hunterStun||e.intent==='stunned')continue;const a=goldPreviewAction(r,e);if(a.d==null)continue;for(const n of goldDamagePreview(player,e,a)){const lost=Math.max(0,n-(player.block||0));player.block=Math.max(0,(player.block||0)-n);total+=lost+(lost>0?Math.max(0,(r.laceration||0)-1):0);player.hp=Math.max(0,player.hp-lost);}}return total;};
