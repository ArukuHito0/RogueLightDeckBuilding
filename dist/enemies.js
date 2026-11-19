function enemyAttack(e){return Math.max(0,e.atk+(e.str||0))}
function triggerBattleCall(r){if(!hasRelic('growing_strength',r)||r.turn%3!==0||r.callTurn===r.turn)return;r.callTurn=r.turn;r.str+=2;for(const e of r.enemies||[])if(e.hp>0)e.str=(e.str||0)+1}
const eliteTypes=['ravager','plated','trio'];
function drawElite(r){if(!Array.isArray(r.elitePool)||!r.elitePool.length)r.elitePool=shuffle([...eliteTypes]);return r.elitePool.pop()}
function makeFoe(name,icon,hp,atk,behavior,extra={}){return Object.assign(enemy(name,icon,hp,atk),{behavior,baseAtk:atk},extra)}
function normalEncounter(floor){let late=Math.max(0,floor-4);let pool=floor<=3?[()=>makeFoe('灰かぶり','♟',18,4,'ash'),()=>makeFoe('迷い影','☽',16,5,'shade')]:[()=>makeFoe('廃都の重兵','♜',34+late*2,10,'soldier'),()=>makeFoe('双刃の狩人','⋔',26+late*2,4,'hunter'),()=>makeFoe('灰火の祈祷師','✧',29+late*2,7,'priest')];return shuffle([...pool]).slice(0,2).map(f=>f())}
function eliteEncounter(type,floor){let scale=Math.max(0,floor-3);if(type==='ravager')return [makeFoe('血熱の破壊者','⚒',92+scale*3,8,'ravager',{ability:'激昂：毎ターン攻撃+2。5ターン目から2回攻撃。速攻で倒そう。'})];if(type==='plated')return [makeFoe('岩殻の番人','🐢',30,7,'plated',{configRev:3,block:50,plate:0,retainBlock:true,ability:'堅牢な甲羅：初期ブロック50。ターン開始時にブロックを失わない。7ダメージ→12ダメージ→3ダメージ×3回→10ブロック・筋力+2を繰り返す。'})];return Array.from({length:3},(_,i)=>makeFoe('三連の守衛','♜',30+scale*2,6,'trio',{offset:i,ability:'3体は攻撃→防御→強打をずらして繰り返す。次に強打する個体を優先するか、全体攻撃で削ろう。'}))}
function prepareEncounterTurn(r){for(let e of r.enemies||[]){if(e.hp<=0||!e.behavior)continue;e.hits=1;e.intent='attack';e.move='攻撃';let t=r.turn;
if(e.behavior==='ravager'){e.atk=e.baseAtk+2*(t-1);e.hits=t>=5?2:1;e.move=t>=5?'暴走連撃':'激昂の一撃'}
else if(e.behavior==='plated'&&e.configRev!==3){e.atk=e.baseAtk+Math.max(0,t-2);e.move='殻の一撃';if(e.plate>0){e.block+=e.plate;e.plate--}}
else if(e.behavior==='plated'){let phase=(t-1)%4;e.guardStrength=0;if(phase===3){e.intent='guard';e.guardAmount=10;e.guardStrength=2;e.move='甲羅の再生・筋力+2'}else{e.atk=[7,12,3][phase];e.hits=phase===2?3:1;e.move=['殻の一撃','重殻撃','三連爪'][phase]}}
else if(e.behavior==='trio'){let phase=(t-1+e.offset)%3;if(phase===0){e.atk=6;e.move='斬撃'}else if(phase===1){e.intent='guard';e.guardAmount=8;e.move='防御'}else{e.atk=12;e.move='強打'}}
else if(e.behavior==='ash'){e.atk=e.baseAtk;if(t%3===0){e.intent='guard';e.guardAmount=4;e.move='身を守る'}}
else if(e.behavior==='shade'){e.atk=e.baseAtk;if(t%3===0){e.intent='guard';e.guardAmount=3;e.move='隠れる'}}
else if(e.behavior==='soldier'){e.atk=e.baseAtk+2;if(t%3===2){e.intent='guard';e.guardAmount=10;e.move='盾構え'}else e.move='重撃'}
else if(e.behavior==='hunter'){e.atk=e.baseAtk;e.hits=2;e.move='双刃';if(t%3===0){e.atk=6;e.hits=2;e.move='猛襲'}}
else if(e.behavior==='priest'){e.atk=e.baseAtk+Math.floor((t-1)/2)*2;e.move='灰火';if(t%3===1){e.intent='guard';e.guardAmount=6;e.move='祈りの守り'}}}}
const chooseEncounterBase=choose;choose=function(type){chooseEncounterBase(type);let r=S.run;if(!r||page!=='battle')return;if(type==='elite'){r.eliteType=drawElite(r);r.enemies=eliteEncounter(r.eliteType,r.floor)}else if(type==='fight'){r.eliteType=null;r.enemies=normalEncounter(r.floor)}else return;target=0;healthVisuals.clear();prepareEncounterTurn(r);render()};
const intentEncounterBase=intent;intent=function(e){if(!e.behavior)return intentEncounterBase(e);return e.intent==='guard'?`${e.move} ◇ ${e.guardAmount}`:`${e.move} ⚔ ${e.atk}${e.hits>1?' × '+e.hits:''}`};
keywords.プレート='ターン開始時にプレートのスタック数と同じブロックを得て、スタックを1消費します。毒によるHP減少はブロックでは防げません。';
const battleEncounterBase=battle;battle=function(){let html=battleEncounterBase(),r=S.run;if(r.kind==='elite'){let title={ravager:'血熱の破壊者',plated:'甲殻の番人',trio:'三連の守衛'}[r.eliteType];if(title)html=html.replace('封鎖された聖堂',title);let foe=r.enemies.find(e=>e.ability);if(foe)html=html.replace('<div class="arena">',`<div class="arena ${r.enemies.length===3?'triple-encounter':''}">`)}return html};
// Active battles retain their enemies; new encounters use the new pool.
