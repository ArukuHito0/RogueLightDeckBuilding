// v31. Card instances stay battle-local; event chains cannot trigger the same engine twice.
for(const id of [38,55,23,22])C[id].rarity='rare';
revise(15,'HPを6失う。エナジー+2。除外。',{hpLoss:6,energy:2,ex:1},{name:'覚悟'});
revise(62,'自身のブロック値と等しいダメージ（筋力を加算）。',{exactBlock:1},{cost:1});
revise(31,'6ダメージ。現在のブロック2につきダメージ+1（端数切り捨て）。',{d:6,blockScale:.5});
revise(28,'毒を3付与。付与前から対象に毒がある場合、カードを1枚引く。',{p:3,poisonDraw:1});
const addedCards31=[
['焼身',2,'♨','この戦闘中、ブロックを得るたびランダムな敵に4ダメージ。除外。','rare',true,{burn:4,ex:1},'ブロック'],
['激昂',0,'♜','このターンの間、ダメージで誰かのHPが減るたび4ブロックを得る。','rare',true,{rage:4},'ブロック'],
['保身',1,'▣','プレート7を得る。カードを1枚引く。除外。','rare',true,{plate:7,draw:1,ex:1},'ブロック'],
['茨の盾',1,'♧','このターンの間、敵の攻撃をブロックで防ぐたび、攻撃した敵に4ダメージ。','rare',true,{thornShield:4},'棘'],
['針山',1,'♠','棘3を得る。除外。','common',true,{thorns:3,ex:1},'棘'],
['茨の園',2,'♧','この戦闘中、ターン開始時に棘1を得る。除外。','epic',true,{thornGarden:1,ex:1},'棘'],
['鍛え直し',2,'⚒','この戦闘中、斬撃を使うたび、この戦闘のすべての斬撃のダメージ+1。除外。','rare',true,{forge:1,ex:1},'筋力'],
['血の槍',1,'†','HPを4失う。14ダメージ。','common',true,{hpLoss:4,d:14},'HP喪失'],
['血の盾',1,'▱','HPを7失う。30ブロック。','rare',true,{hpLoss:7,b:30},'HP喪失'],
['復讐',4,'⚔','30ダメージ。この戦闘中、HPを失うたびコスト-1（最低0）。','rare',true,{d:30,revenge:1},'HP喪失'],
['灰の肉体',1,'♜','この戦闘中、カードを除外するたび筋力+1。除外。','epic',true,{exhaustStrength:1,ex:1},'除外'],
['付け焼刃',0,'†','6ダメージ。捨て札にこのカードのコピーを1枚加える。除外。','common',true,{d:6,copyDiscard:1,ex:1},'除外'],
['灰の一振り',0,'⚔','灰の剣を1枚手札に加える。除外。','rare',true,{tokenSword:1,ex:1},'除外'],
['修繕',1,'⌘','除外されたカードから1枚選び、手札に加える。除外。','rare',true,{recoverExcluded:1,ex:1},'除外'],
['灰の一投',1,'†','灰の投擲剣を2枚手札に加える。除外。','common',true,{tokenKnife:2,ex:1},'除外'],
['警備',1,'▣','プレート5を得る。除外。','common',false,{plate:5,ex:1},'ブロック'],
['緊急回避',0,'➶','20ブロックを得る。HPを4失う。除外。','rare',false,{b:20,hpLoss:4,lossAfterBlock:1,ex:1},'ブロック'],
['防衛本能',1,'♧','4ブロックを得る。棘2を得る。除外。','common',false,{b:4,thorns:2,ex:1},'棘'],
['渇望',0,'♥','HPを5失う。カードを2枚引く。','rare',false,{hpLoss:5,draw:2},'HP喪失'],
['ブーメラン',1,'➶','3ダメージを3回、毎回ランダムな敵に与える。','common',false,{d:3,h:3,randomAttack:1},'筋力'],
['肉体改造',1,'♜','筋力+2。守護+2。最大HP-5。除外。','epic',false,{s:2,agility:2,maxHpLoss:5,ex:1},'筋力']
];
for(const a of addedCards31)C.push({id:C.length,name:a[0],cost:a[1],icon:a[2],desc:a[3],rarity:a[4],runOnly:a[5],fx:a[6],axis:a[7]});
const TOKEN_DEFS={sword:{name:'灰の剣',cost:1,icon:'⚔',desc:'12ダメージ。カードを1枚引く。除外。',fx:{d:12,draw:1,ex:1}},knife:{name:'灰の投擲剣',cost:0,icon:'†',desc:'3ダメージ。除外。',fx:{d:3,ex:1}}};
function nextBattleCardId(r){return Math.min(0,...(r.generatedCards||[]).map(c=>c.id),...(r.battleCards||[]).map(c=>c.id))-1}
function hydrateBattleCard(entry){let source=entry.token?TOKEN_DEFS[entry.token]:C[entry.origin];if(source)C[entry.id]={...source,id:entry.id,origin:entry.origin,token:!!entry.token,battleCopy:!entry.token,runOnly:true,rarity:entry.token?'token':source.rarity,fx:{...source.fx}}}
function addBattleCard(r,source,pile='hand'){let entry={id:nextBattleCardId(r),...source};(r.battleCards??=[]).push(entry);hydrateBattleCard(entry);if(pile==='hand'&&r.hand.length>=10)pile='discard';r[pile].push(entry.id);return entry.id}
for(const e of S.run?.battleCards||[])hydrateBattleCard(e);
// Potion cards may reference additions declared above. Rehydrate after all definitions exist.
for(const e of S.run?.generatedCards||[])hydrateGeneratedCard(e);
keywords.棘='敵から攻撃されるたび、攻撃した敵にスタック数分のダメージを返します。ブロックで全て防いだ場合も発動し、連続攻撃は1発ごとに発動します。毒・HP喪失では発動しません。戦闘終了時に消えます。';
keywords.除外='この戦闘の除外置き場へ移動します。通常の山札の再構築には戻りません。「修繕」などで回収できます。次の戦闘では元のデッキに戻ります。';
keywords.HP喪失='「HPを失う」はブロックを無視します。復讐のコスト減少は発動しますが、激昂や棘のダメージ反応には含みません。';
keywords.連鎖='焼身と激昂などの自動効果が連鎖する場合、同じ効果はひと続きの連鎖で1回まで発動します。別の攻撃やブロック獲得からは再び発動します。';
const tips31=tips;tips=function(c){let s=tips31(c);if(c.fx.hpLoss)s+=`<div><strong>【HP喪失】</strong><p>${keywords.HP喪失}</p></div>`;if(c.fx.tokenSword||c.fx.tokenKnife){let t=TOKEN_DEFS[c.fx.tokenSword?'sword':'knife'];s+=`<div><strong>【${t.name}】 ${t.cost}コスト</strong><p>${rich(t.desc)}</p></div>`}return s};
rich=s=>s.replace(/筋力|除外|ブロック|再生|毒|守護|プレート|鼓動|棘/g,x=>`<strong class="keyword">${x}</strong>`);
const hitRelic={id:'three_damage',cat:'combat',name:'連戦の鼓舞',text:'1ターンの間に敵を3回攻撃するたび筋力+1。全てブロックされた攻撃も数えます。'};RELIC_EFFECTS.push(hitRelic);RELIC_BY_ID[hitRelic.id]=hitRelic;
function effectFactor(r){return hasRelic('double_cards',r)?2:1}
// Only non-damage/non-block numerical amounts scale. Trigger intervals and attack counts do not.
combatCard=function(id){let c=C[id],r=S.run;if(!c||!r)return c;let fx={...c.fx},cost=c.cost,desc=c.desc;if(hasRelic('double_cards',r)){
 for(const k of ['hpLoss','maxHpLoss','p','heal','s','energy','draw','discard','recover','sacrifice','agility','plate','regen','blockRegen','strBonus','chooseExhaust','lowEnergy','poisonDraw','thorns','thornGarden','exhaustStrength','copyDiscard','tokenSword','tokenKnife','recoverExcluded','reinfect','poisonAura','poisonCoat','empathy','strRegen'])if(typeof fx[k]==='number')fx[k]*=2;
 if(fx.doubleStr)fx.strMultiplier=4;if(fx.poisonDouble)fx.poisonTicks=4;if(fx.heartbeat)fx.heartbeatRefund=2;if(fx.discardBreak)fx.discardCount=2;if(fx.passion)fx.passionHp=2;
 desc=desc.replace(/HPを(\d+)失う|最大HP-(\d+)|(筋力|守護|エナジー)\+(-?\d+)|(毒を|プレート|棘)(\d+)|(カードを|さらに筋力\+)(\d+)|(\d+)枚/g,(m,a,b,k,n,l,v,q,w,cnt)=>a?`HPを${+a*2}失う`:b?`最大HP-${+b*2}`:k?`${k}+${+n*2}`:l?`${l}${+v*2}`:q?`${q}${+w*2}`:`${+cnt*2}枚`);
 desc=desc.replace(/HPを(\d+)回復/g,(_,n)=>`HPを${+n*2}回復`).replace(/再生(\d+)/g,(_,n)=>`再生${+n*2}`).replace(/守護-(\d+)/g,(_,n)=>`守護-${+n*2}`);
 desc+=' 【遺物：ダメージ・ブロック以外2倍／コスト+1】';
 }
 if(fx.p&&hasRelic('poison_boost',r)){fx.p++;desc=desc.replace(/毒を\d+付与/,`毒を${fx.p}付与`)}
 if(hasRelic('poison_boost',r)){if(fx.poisonAura)fx.poisonAura++;if(fx.poisonCoat)fx.poisonCoat++;if(fx.reinfect)fx.reinfectBonus=1;}
 if(fx.revenge)cost=Math.max(0,cost-(r.hpLossCount||0));
 if(hasRelic('double_cards',r))cost++;
 if(c.id===0||c.origin===0){fx.d+=(r.strikeBonus||0);desc=desc.replace(/\d+ダメージ/,`${fx.d}ダメージ`)}
 return {...c,cost,fx,desc}
};
const needsEnemy31=needsEnemy;needsEnemy=c=>!c.fx.randomAttack&&needsEnemy31(c);
// State changes centralize HP loss and damage events. HP loss is not damage.
let eventChain=null;
function withEffectChain(fn){let root=!eventChain;if(root)eventChain=new Set();try{return fn()}finally{if(root)eventChain=null}}
function loseHP(r,n){let lost=Math.min(r.hp,Math.max(0,n));if(lost>0){r.hp-=lost;recordDamageEvent(r,lost);r.hpLossCount=(r.hpLossCount||0)+1;if(r.hp>0&&!r.enemyPhase&&r.bloodBlessing&&r.bloodBlessingTurn!==r.turn){r.bloodBlessingTurn=r.turn;r.str+=r.bloodBlessing;}}return lost}
function afterDamage(r,enemy,lost){if(lost<=0)return;if(r.hp>0&&r.rage&&!eventChain.has('rage')){eventChain.add('rage');gainBlock(r,r.rage,'passive')}}
function dealDamage(e,n,{ignoreBlock=false,attacker=null,attack=false,damageKind="",hpLoss=false}={}){let r=S.run;if(!r||!e||e.hp<=0)return 0;return withEffectChain(()=>{const act6Phase=typeof swampDamagePhase==='function'?swampDamagePhase(e):null;n=Math.max(0,n);if(!hpLoss&&act6Phase==='bloom')n=Math.floor(n*1.5);const beforeBlock=e.block||0;let absorbed=ignoreBlock?0:Math.min(e.block||0,n);if(!ignoreBlock)e.block=Math.max(0,(e.block||0)-absorbed);if(absorbed>0)recordDamageEvent(e,absorbed,'','block');let lost=e===r?loseHP(r,n-absorbed):Math.min(e.hp,n-absorbed);if(e!==r){e.hp-=lost;if(lost>0)recordDamageEvent(e,lost,damageKind);}if(typeof onAct7Damage==='function')onAct7Damage(r,e,lost,attack,attacker,hpLoss);if(typeof onAct6Damage==='function')onAct6Damage(r,e,lost,attack,act6Phase,absorbed,hpLoss);if(typeof onAct4Damage==='function')onAct4Damage(r,e,lost,attack);if(typeof onAct5Damage==='function')onAct5Damage(r,e,lost,attack,beforeBlock);
 if(e===r&&attack&&attacker){if(absorbed>0&&r.thornShield&&attacker.hp>0)dealDamage(attacker,r.thornShield);if(r.thorns&&attacker.hp>0)dealDamage(attacker,r.thorns)}
 if(!hpLoss)afterDamage(r,e!==r,lost);return lost})}
damage=(e,n)=>dealDamage(e,n);
function cardBlockValue(r,n){let v=blockValue(r,n,'card');return hasRelic('first_block',r)&&!r.firstCardBlock?v*2:v}
gainBlock=function(r,n,source='card'){if(r.hp<=0)return 0;return withEffectChain(()=>{let value=source==='card'?cardBlockValue(r,n):blockValue(r,n,source);if(value<=0)return 0;if(source==='card'&&hasRelic('first_block',r)&&!r.firstCardBlock)r.firstCardBlock=true;r.block+=value;
 if(hasRelic('four_blocks',r)){r.blockGainCount=(r.blockGainCount||0)+1;if(r.blockGainCount%4===0)r.agility=(r.agility||0)+1}
 if(source==='card'&&r.burn&&!eventChain.has('burn')){eventChain.add('burn');let enemies=r.enemies.filter(e=>e.hp>0);if(enemies.length)dealDamage(rand(enemies),r.burn)}return value})};
exhaustCard=function(r,id,trigger=true){(r.exhausted??=[]).push(id);if(trigger){if(r.exhaustStrength){r.exhaustStrengthCount=(r.exhaustStrengthCount||0)+1;if(r.exhaustStrengthCount%3===0)r.str+=r.exhaustStrength;}if(r.exhaustEngine)gainBlock(r,3*r.exhaustEngine,'passive')}};
onCardResolved=function(r,c){if(c.cost===0&&hasRelic('zero_block',r))gainBlock(r,1,'relic')};
// Reset persistent-in-battle engines between encounters, including resumed runs.
const newBattle31=choose;choose=function(type){let r=S.run;if(!r)return;let wasBattle=r.mode==='battle';newBattle31(type);if(S.run===r&&r.mode==='battle'&&!wasBattle){for(const k of ['burn','rage','thornShield','thorns','thornGarden','forge','strikeBonus','hpLossCount','exhaustStrength','damageCount','passionHp','exhaustStrengthCount','poisonAura','poisonCoat','nextAttackBonus','bloodBlessing'])r[k]=0;r.bloodBlessingTurn=null;r.enemyPhase=false;r.specialUses={};r.battleCards=[];r.callTurn=0;render()}};
base.play=function(i,options={}){let r=S.run,c=combatCard(r?.hand[i]);if(c&&options.free&&typeof swampRejectAuto==='function'&&swampRejectAuto(r,c)){r.hand.splice(i,1);r.discard.push(c.id);return;}if(!c||c.retired||(!options.free&&r.energy<c.cost)||r.pendingChoice||r.hunterChoice||r.pendingDiscard||r.potionTarget!=null||!canPlayHunterCard(c,r))return;let attackHpLoss=0;let paidCost=options.free?0:c.cost;let f=c.fx,wasHeartbeat=r.heartbeat,str=r.str,preExcluded=[...(r.exhausted||[])];target=r.enemies[target]?.hp>0?target:r.enemies.findIndex(e=>e.hp>0);let hadPoison=(r.enemies[target]?.poison||0)>0;r.energy-=paidCost;r.hand.splice(i,1);if(typeof swampCardUsed==='function')swampCardUsed(r,c,options);
 if(isAttackCard50(c)){f.attackBonus=r.nextAttackBonus||0;r.nextAttackBonus=0;}
 if(f.hpLoss&&!f.lossAfterBlock)loseHP(r,f.hpLoss);
 if(r.hp<=0){resolvePlayedCardPile(r,c,false);render();return}
 if(f.randomAttack){for(let h=0;h<(f.h??1);h++){let alive=r.enemies.filter(e=>e.hp>0);if(!alive.length)break;let e=rand(alive);attackHpLoss+=cardAttack(e,previewDamage(c,r,e))}}
 else for(let e of f.all?r.enemies.filter(e=>e.hp>0):[r.enemies[target]]){if(!e)continue;if(f.d!=null||f.totalPoison||f.equalPoison||f.exactBlock)for(let h=0;h<(f.h??1)&&e.hp>0;h++)attackHpLoss+=cardAttack(e,previewDamage(c,r,e));if(f.p&&e.hp>0)addPoison(e,f.p);if(f.reinfect&&e.hp>0)addPoison(e,(e.poisonTotal||0)*f.reinfect+(f.reinfectBonus||0));if(f.breakBlock){e.block=0;if(typeof clearArchiveReading==='function')clearArchiveReading(e);}}
 resolveHunterEffects(r,c);
 if((c.id===0||c.origin===0)&&r.forge)r.strikeBonus=(r.strikeBonus||0)+r.forge;
 if(f.enemyStrength&&r.enemies[target]?.hp>0)r.enemies[target].str=(r.enemies[target].str||0)+f.enemyStrength;
 if(f.nextAttack)r.nextAttackBonus=(r.nextAttackBonus||0)+f.nextAttack;
 if(f.bloodBlessing)r.bloodBlessing=(r.bloodBlessing||0)+f.bloodBlessing;
 if(f.spendBlock)r.block=0;
 if(f.poisonBlock)gainBlock(r,r.enemies.filter(e=>e.hp>0).reduce((n,e)=>n+(e.poison||0),0)*f.poisonBlock);if(f.empathy){let n=(r.enemies[target]?.poison||0)*f.empathy;r.str+=n;r.enemies[target].poison=0;}if(f.b)gainBlock(r,f.b);if(f.strengthBlock)gainBlock(r,str*f.strengthBlock);if(f.exhaustBlock)gainBlock(r,Math.floor(exhaustedCount(r)/2)*f.exhaustBlock);
 if(f.hpLoss&&f.lossAfterBlock)loseHP(r,f.hpLoss);
 if(r.hp<=0){resolvePlayedCardPile(r,c,false);render();return}
 for(let j=0;j<(f.recover||0)&&r.discard.length&&r.hand.length<10;j++)r.hand.push(r.discard.splice(Math.floor(Math.random()*r.discard.length),1)[0]);
 if(f.blockRegen&&r.block>=15)r.regen=(r.regen||0)+f.blockRegen;
 if(f.strRegen&&str>=4)r.regen=(r.regen||0)+f.strRegen;
 healHP(r,f.healOnHpDamage&&attackHpLoss<=0?0:f.heal||0);r.str+=(f.s||0)+(f.strBonus&&str>=4?f.strBonus:0);
 if(f.doubleStr){r.str*=f.strMultiplier||2;r.tempStr=(r.tempStr||0)*(f.strMultiplier||2)}
 gainEnergy(r,(f.energy||0)+(f.lowEnergy&&r.hp<=r.max/2?f.lowEnergy:0));
 for(let j=0;j<(f.sacrifice||0)&&r.hand.length;j++)exhaustCard(r,r.hand.splice(Math.floor(Math.random()*r.hand.length),1)[0]);
 // Own exclusion precedes installing a new on-exclude engine.
 resolvePlayedCardPile(r,c);
 if(f.engine)r.exhaustEngine=(r.exhaustEngine||0)+f.engine;
 for(const k of ['agility','plate','regen','blockBonus','passion','burn','rage','thornShield','thorns','thornGarden','forge','exhaustStrength','poisonAura','poisonCoat'])if(f[k])r[k]=(r[k]||0)+f[k];
 if(f.passion)r.passionHp=(r.passionHp||0)+(f.passionHp||1);
 if(f.temporary){r.tempStr=(r.tempStr||0)+(f.s||0);r.tempAgility=(r.tempAgility||0)+(f.agility||0)}
 if(f.nextBlock){(r.nextBlockEffects??=[]).push(f.nextBlock);r.nextBlock=(r.nextBlock||0)+f.nextBlock}
 if(f.poisonDouble)r.poisonDouble=f.poisonTicks||2;if(f.retainBlock)r.retainBlock=true;if(f.heartbeat){r.heartbeat=true;r.heartbeatRefund=f.heartbeatRefund||1}
 if(wasHeartbeat){let total=(r.heartbeatCount||0)+paidCost;gainEnergy(r,Math.floor(total/4)*(r.heartbeatRefund||1));r.heartbeatCount=total%4}
 if(f.maxHpLoss){r.max=Math.max(1,r.max-f.maxHpLoss);if(r.hp>r.max)loseHP(r,r.hp-r.max)}
 if(f.draw)draw(f.draw);if(f.poisonDraw&&hadPoison)draw(f.poisonDraw);
 if(f.discard&&r.hand.length)r.pendingChoice={kind:'discard',remaining:f.discard};
 if(f.discardBreak){if(r.hand.length)r.pendingChoice={kind:'discard',breakTarget:target,remaining:f.discardCount||1};else if(r.enemies[target]){r.enemies[target].block=0;if(typeof clearArchiveReading==='function')clearArchiveReading(r.enemies[target]);}}
 if(f.chooseExhaust){let n=f.exhaustDraw==null?2*effectFactor(r):f.exhaustDraw*effectFactor(r);if(r.hand.length)r.pendingChoice={kind:'exhaust',remaining:f.chooseExhaust,draw:n};else draw(n)}
 for(let j=0;j<(f.copyDiscard||0);j++)addBattleCard(r,{origin:c.origin??c.id},'discard');
 for(let j=0;j<(f.tokenSword||0);j++)addBattleCard(r,{token:'sword'});
 for(let j=0;j<(f.tokenKnife||0);j++)addBattleCard(r,{token:'knife'});
 for(let n=0;n<(f.recoverExcluded||0)&&preExcluded.length&&r.hand.length<10;n++){const chosen=preExcluded.splice(Math.floor(Math.random()*preExcluded.length),1)[0],index=r.exhausted.indexOf(chosen);if(index>=0)r.hand.push(r.exhausted.splice(index,1)[0]);}
 onCardResolved(r,c);if(r.kind==='boss')bossPlan(r);msg=c.name+'を使用。';completeCardResolution(r,c)
};
function recoverExcludedCard(index){let r=S.run,p=r?.pendingChoice;if(busy||p?.kind!=='recoverExcluded'||p.inspect||r.hand.length>=10)return;let id=p.eligible[index],where=r.exhausted.indexOf(id);if(where<0)return;r.hand.push(r.exhausted.splice(where,1)[0]);p.eligible.splice(index,1);p.remaining--;if(!p.remaining||!p.eligible.length||r.hand.length>=10)r.pendingChoice=null;render()}
applyTurnStartBuffs=function(r){r.enemyPhase=false;r.damageCount=0;const {poison,passion,passionHp,thornGarden,plate,regen}=r;const nextBlocks=r.nextBlockEffects?.length?[...r.nextBlockEffects]:r.nextBlock?[r.nextBlock]:[];r.nextBlockEffects=[];r.nextBlock=0;if(r.poisonAura)for(const e of r.enemies)if(e.hp>0)addPoison(e,r.poisonAura);if(poison>0&&r.poison>0){r.poison--;dealDamage(r,poison,{ignoreBlock:true});if(r.hp<=0)return}if(passion){loseHP(r,passionHp||passion);if(r.hp<=0)return;for(let i=0;i<passion;i++)gainBlock(r,5,'passive')}
 triggerBattleCall(r);
 for(const n of nextBlocks)gainBlock(r,n,'passive');
 if(thornGarden)r.thorns=(r.thorns||0)+thornGarden;
 if(plate>0&&r.plate>0){gainBlock(r,plate,'passive');r.plate--}if(regen>0&&r.regen>0){healHP(r,regen);r.regen--}
};
endTurn=async function(){let r=S.run;if(busy||page!=='battle'||r.pendingChoice||r.hunterChoice||r.pendingDiscard||r.potionTarget!=null)return;busy=true;
 try{hunterPlayerTurnEnd(r);if(r.hp<=0){await animateEntity('player','death');finish(false);return;}r.enemyPhase=true;r.poisonCoat=0;expireGeneratedCards(r);r.str-=r.tempStr||0;r.agility=(r.agility||0)-(r.tempAgility||0);r.tempStr=0;r.tempAgility=0;r.discard.push(...r.hand);r.hand=[];
 for(let i=0;i<r.enemies.length;i++){let e=r.enemies[i];if(e.hp<=0||e.summonedTurn===r.turn)continue;if(!e.retainBlock&&!e.reading)e.block=0;
 for(let tick=0;tick<(r.poisonDouble===true?2:r.poisonDouble||1)&&e.hp>0;tick++)if(e.poison){let n=e.poison;e.poison--;dealDamage(e,n,{ignoreBlock:true});await animateEntity(i,'hit',n)}
 if(e.hp<=0){await animateEntity(i,'death');continue}
 if(typeof prepareAct7Action==='function')prepareAct7Action(r,e);if(typeof prepareAct6Action==='function')prepareAct6Action(r,e);if(typeof prepareAct4Action==='function')prepareAct4Action(r,e);if(typeof prepareAct5Action==='function')prepareAct5Action(r,e);const actionStunned=!!e.hunterStun||e.intent==='stunned';if(!actionStunned){if(e.intent==='attack'){await animateEntity(i,'attack',0,-1);for(let h=0;h<(e.hits||1)&&e.hp>0&&r.hp>0&&e.intent==='attack';h++){let before=e.hp,n=dealDamage(r,enemyAttack(e),{attack:true,attacker:e});if(n)await animateEntity('player','hit',n);if(before>e.hp)await animateEntity(i,'hit',before-e.hp);if(e.hp<=0)await animateEntity(i,'death')}}else if(e.intent==='guard'){if(e.retainBlock||e.reading)e.block=(e.block||0)+(e.guardAmount||9);else e.block=e.guardAmount||9;if(e.guardStrength)e.str=(e.str||0)+e.guardStrength;}else if(e.act2)snowAction(r,e);else if(!e.boss)e.atk+=3;}
 if(!actionStunned&&e.act2&&(e.intent==='attack'||e.intent==='guard')&&e.hp>0&&r.hp>0)snowAction(r,e);
 hunterEnemyActionEnd(r,e);
 if(e.boss&&typeof finishKingAction==='function')finishKingAction(r,e,actionStunned);
 if(r.hp<=0){await animateEntity('player','death');busy=false;finish(false);return}}
 if(r.enemies.every(e=>e.hp<=0)){busy=false;victory();return}
 r.turn++;r.rage=0;r.thornShield=0;if(!r.retainBlock)r.block=0;for(let x of r.relics)if(x.type==='b')gainBlock(r,3,'relic');r.energy=r.energyMax||3;if(typeof goldBeginTurn==='function')goldBeginTurn(r);applyTurnStartBuffs(r);
 if(r.hp<=0){await animateEntity('player','death');busy=false;finish(false);return}if(r.enemies.every(e=>e.hp<=0)){busy=false;victory();return}
 prepareEncounterTurn(r);if(r.kind==='boss')bossPlan(r);draw(5,true);if(typeof swampApplyReservations==='function')swampApplyReservations(r);
 }finally{r.enemyPhase=false;busy=false}render()
};
// Block-producing potions may now end combat through 焼身.
const potionResolution31=resolvePotion;resolvePotion=async function(...args){await potionResolution31(...args);let r=S.run;if(r?.mode==='battle'&&r.enemies.every(e=>e.hp<=0))victory()};
combatDesc=function(c,r){let d=descRelicsBase(c,r),f=c.fx,e=r.enemies[target];
 if(f.b)d=d.replace(/<strong class="boost">\d+ブロック<\/strong>/,`<strong class="boost">${cardBlockValue(r,f.b)}ブロック</strong>`);
 if(f.exScale)d=`${previewDamage(c,r,e)}ダメージ。除外済み1枚につき+${f.exScale}。${f.ex?'除外。':''}`;
 if(f.blockScale)d=`${previewDamage(c,r,e)}ダメージ（基礎${f.d}＋筋力＋ブロック×${f.blockScale}、端数切り捨て）。${f.b?cardBlockValue(r,f.b)+'ブロック。':''}`;
 if(f.strengthBlock)d=`筋力スタック分のブロック。現在 <strong class="boost">${cardBlockValue(r,r.str*f.strengthBlock)}ブロック</strong>。`;
 if(f.exhaustBlock)d=`除外済みカード2枚につき${f.exhaustBlock}ブロック。現在 <strong class="boost">${cardBlockValue(r,Math.floor(exhaustedCount(r)/2)*f.exhaustBlock)}ブロック</strong>。除外。`;
 if(f.strBonus)d=`筋力+${f.s}。既に筋力4以上なら、さらに+${f.strBonus}。除外。`;
 if(f.doubleStr)d=`現在の筋力を${f.strMultiplier||2}倍にする。除外。`;
 if(f.poisonDouble)d=`この戦闘中、敵の毒が${f.poisonTicks||2}回発動。各発動で毒を1消費。除外。`;
 if(f.heartbeat)d=`この戦闘中、エナジーを4消費するたびエナジーを${f.heartbeatRefund||1}回復。除外。`;
 if(f.chooseExhaust&&f.exhaustDraw==null)d=`手札を${f.chooseExhaust}枚選び除外。その後${2*effectFactor(r)}枚引く。`;
 if(f.passion)d=`この戦闘中、ターン開始時にHPを${f.passionHp||1}失い、5ブロックを得る。除外。`;
 if(f.poisonDraw)d=`毒を${f.p}付与。付与前から毒がある対象なら${f.poisonDraw}枚引く。`;
 if(f.revenge)d+=` 現在${c.cost}コスト（HP喪失${r.hpLossCount||0}回）。`;
 if(f.exhaustStrength)d=`この戦闘中、カードを3枚除外するたび筋力+${f.exhaustStrength}。除外。`;if(f.poisonAura)d=`この戦闘中、ターン開始時に敵全体に毒${f.poisonAura}を付与。除外。`;if(f.poisonCoat)d=`このターン、カード攻撃1ヒットごとに毒${f.poisonCoat}を付与。`;if(f.reinfect)d=`対象がこの戦闘中に蓄積した毒を再付与。現在 <strong class="boost">${(e?.poisonTotal||0)*f.reinfect+(f.reinfectBonus||0)}</strong>。除外。`;if(f.poisonBlock)d=`敵全体の毒の合計分のブロック。現在 <strong class="boost">${cardBlockValue(r,r.enemies.filter(x=>x.hp>0).reduce((n,x)=>n+(x.poison||0),0)*f.poisonBlock)}ブロック</strong>。`;if(f.empathy)d=`対象の毒スタック分の筋力を得て、対象の毒を全て失わせる。現在 <strong class="boost">+${(e?.poison||0)*f.empathy}</strong>。`;return d
};
const chooseHand31=chooseHand;chooseHand=function(i){chooseHand31(i);let r=S.run;if(r?.mode==='battle'&&r.hp>0&&r.enemies.every(e=>e.hp<=0)){r.pendingChoice=null;victory()}};
const bonus31=bonusReady;bonusReady=(c,r)=>bonus31(c,r)||!!(c.fx.poisonDraw&&(r.enemies[target]?.poison||0)>0)||!!(c.fx.revenge&&r.hpLossCount);
const card31=card;card=function(id,action='',extra=''){let s=card31(id,action,extra);if(C[id]?.token)s=s.replace('TOKEN / 潜在','TOKEN / 戦闘限定');return s};
const battle31=battle;battle=function(){let r=S.run,html=battle31(),status='';for(const [key,label,desc]of [
 ['poisonAura','汚染地域','ターン開始時、敵全体に表示値の毒を付与。'],['poisonCoat','毒纏い','このターン、カード攻撃1ヒットごとに表示値の毒を付与。'],['thorns','棘',keywords.棘],['burn','焼身','カードからブロック獲得時、ランダムな敵に表示値のダメージ。'],['rage','激昂','ダメージでHPが減った時、表示値のブロック。次の自分のターン開始まで。'],['thornShield','茨の盾','敵の攻撃をブロックで防ぐたび、表示値の反撃。次の自分のターン開始まで。'],['thornGarden','茨の園','ターン開始時に表示値の棘を得る。'],['forge','鍛え直し','斬撃を使うごとに、以後の斬撃のダメージが表示値増加。'],['exhaustStrength','灰の肉体','カードを3枚除外するたび表示値の筋力。']])if(r[key])status+=`<span class="status-help" tabindex="0">${label} ${r[key]}<aside class="tooltip">${desc}</aside></span>`;
 if(hasRelic('three_damage',r))status+=`<span class="status-help" tabindex="0">連戦の鼓舞 ${r.damageCount%3||0}/3<aside class="tooltip">${hitRelic.text}</aside></span>`;
 html=html.replace('<div class="player-status">','<div class="player-status">'+status);
 let p=r.pendingChoice;if(p?.kind==='recoverExcluded'){html+=`<div class="pile-overlay recovery-overlay" role="dialog" aria-modal="true" aria-label="除外されたカードを選択"><div class="pile-panel"><h2>除外されたカードを手札へ</h2><p>残り${p.remaining}枚を選んでください。手札が10枚になった時点で終了します。</p><div class="cards">${p.eligible.map((id,i)=>card(id,`recoverExcludedCard(${i})`)).join('')}</div></div></div>`}return html};
const oldWireBattle31=wireBattle;wireBattle=function(){oldWireBattle31();document.querySelectorAll('.recovery-overlay .card').forEach(el=>el.classList.remove('playable','unplayable','empowered'))};
// Require an explicit in-game confirmation BEFORE spending a point or rolling RNG.
let rerollConfirmation=null;
const commitReroll31=beginRelicReroll;
beginRelicReroll=function(id,slot){if(!relicEditable()||S.relicPoints<1)return;let x=S.relicVault.find(x=>x.id===id);if(!x?.effects[slot]||(x.rerolls||0)>=5)return;rerollConfirmation={id,slot,old:x.effects[slot]};render()};
function cancelRerollConfirmation(){rerollConfirmation=null;render()}
function confirmRelicReroll(){let p=rerollConfirmation;if(!p||!relicEditable())return;rerollConfirmation=null;let x=S.relicVault.find(x=>x.id===p.id);if(x?.effects[p.slot]!==p.old)return render();commitReroll31(p.id,p.slot)}
const relicDialog31=relicDialog;relicDialog=function(){if(rerollConfirmation){let p=rerollConfirmation;return `<div class="relic-modal"><section role="dialog" aria-modal="true"><h2>この効果を再抽選しますか？</h2><p>${relicEffect(p.old).text}</p><p>遺物ポイントを1pt消費します。候補を不採用にしても返還されません。</p><p>所持 ${S.relicPoints}pt → ${Math.max(0,S.relicPoints-1)}pt</p><div class="toolbar"><button onclick="cancelRerollConfirmation()">キャンセル</button><button class="primary" onclick="confirmRelicReroll()" ${S.relicPoints<1?'disabled':''}>1ptで再抽選する</button></div></section></div>`}return relicDialog31()};
function currencyHTML(icon,value,name,desc){return `<span class="currency-help" tabindex="0" aria-label="${name} ${value}"><b>${icon} ${value}</b><span class="currency-tip"><strong>${name}</strong><br>${desc}</span></span>`}
function walletHTML(){let r=S.run;return `${r?`<span class="header-hp">♥ ${r.hp}/${r.max}</span><small>第${r.floor}/${r.nodes?.length||12}層</small>`:''}${currencyHTML('◈',r?r.gold:S.gold,'ゴールド',r?'今回のランで得た金。ショップでカード・消費アイテムを購入できます。':'拠点のゴールド。パックの購入に使用します。')}${currencyHTML('▣',r?r.packs:S.packs,'カードパック',r?'今回のランで確保したパック。帰還後に開封できます。':'拠点で開封して基礎カードを獲得できます。')}${currencyHTML('✦',S.relicPoints||0,'遺物ポイント','遺物の分解で獲得。効果1枠の再抽選に1pt使用します。')}${currencyHTML('✧',S.points||0,'余剰ポイント','余剰の基礎カードを変換して獲得。カード交換所で基礎カードと交換できます。')}`}
const render31=render;render=function(){if(globalThis.ASHBOUND_LOADING)return;render31();$('wallet').innerHTML=walletHTML();if(page==='battle'&&S.run?.pendingChoice?.kind==='recoverExcluded'){document.querySelectorAll('.recovery-overlay .card').forEach((el,i)=>{el.onclick=()=>recoverExcludedCard(i);el.classList.remove('playable','unplayable','empowered')})}save()};
// Native pointer drag handlers must not consume recovery choices.
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('.recovery-overlay'))e.stopImmediatePropagation()},true);
const book31=book;book=function(){let html=book31();if(bookType==='run')html+=`<section class="token-codex"><h3>生成専用カード（トークン）</h3><p>パック・ショップ・戦闘報酬には出現せず、戦闘中に生成されます。手札が満杯の場合は捨て札に入ります。</p><div class="tiles">${Object.values(TOKEN_DEFS).map(t=>`<article class="tile"><h3>${t.icon} ${t.name}</h3><b>${t.cost}コスト</b><p>${rich(t.desc)}</p></article>`).join('')}</div></section>`;return html};

const intent33=intent;intent=function(e){return intent33(e)};

// v39: poison history is encounter bookkeeping, not a removable status.
function addPoison(e,n){if(!e||e.hp<=0||n<=0)return; e.poisonTotal=(e.poisonTotal??e.poison??0)+n;e.poison=(e.poison||0)+n;}
function cardAttack(e,n){const r=S.run;const lost=dealDamage(e,n);if(hasRelic('three_damage',r)){r.damageCount=(r.damageCount||0)+1;if(r.damageCount%3===0)r.str++;}if(r.poisonCoat&&e.hp>0)addPoison(e,r.poisonCoat);return lost;}
function reviseNamed(name,desc,fx,extra={}){const c=C.find(c=>c.name===name);revise(c.id,desc,fx,extra);}
reviseNamed('巨人の血','筋力+2。既に筋力が4以上なら、さらに筋力+3。除外。',{s:2,strBonus:3,ex:1});
reviseNamed('灰の肉体','この戦闘中、カードを3枚除外するたび筋力+1。除外。',{exhaustStrength:1,ex:1},{rarity:'rare'});
C.find(c=>c.name==='灰の守り').desc='この戦闘中、カードを除外するたび3ブロックを得る。除外。';
C.find(c=>c.name==='茨の園').rarity='rare';
reviseNamed('灰の一投','灰の投擲剣を2枚手札に加える。',{tokenKnife:2});
reviseNamed('灰の一振り','灰の剣を1枚手札に加える。',{tokenSword:1},{cost:1});
reviseNamed('血の槍','HPを2失う。14ダメージ。',{hpLoss:2,d:14});
for(const [name,cost,rarity,runOnly,desc,fx,axis,icon] of [
 ['再感染',1,'epic',true,'対象がこの戦闘中に蓄積した毒の合計を付与。除外。',{reinfect:1,ex:1},'毒','†'],
 ['毒の鱗',2,'rare',true,'敵全体の毒スタックの合計分のブロックを得る。',{poisonBlock:1},'毒','◇'],
 ['汚染地域',1,'rare',true,'この戦闘中、ターン開始時に敵全体に毒2を付与。除外。',{poisonAura:2,ex:1},'毒','☁'],
 ['毒纏い',1,'rare',true,'このターン、敵へのカード攻撃1ヒットごとに毒1を付与。',{poisonCoat:1},'毒','†'],
 ['共感',1,'rare',true,'このターン、対象の毒スタック数と等しい筋力を得る。',{empathy:1},'毒','♜'],
 ['硬質化',3,'rare',false,'プレート10を得る。除外。',{plate:10,ex:1},'ブロック','▣']
])C.push({id:C.length,name,cost,rarity,runOnly,desc,fx,axis,icon});
const target39=needsEnemy;needsEnemy=c=>!!(c.fx.reinfect||c.fx.empathy)||target39(c);
const tips39=tips;tips=c=>tips39(c)+(c.fx.reinfect?'<div><strong>【累積毒】</strong><p>この戦闘で対象に付与した毒の合計。毒の減少・謁見で消えず、再感染で付与した毒も合計に含みます。</p></div>':'');
const battle39=battle;battle=function(){let html=battle39();let r=S.run;if(r?.exhaustStrength)html=html.replace('灰の肉体 '+r.exhaustStrength,'灰の肉体 '+r.exhaustStrength+'（'+(r.exhaustStrengthCount%3||0)+'/3）');return html};

for(const e of S.run?.enemies||[])e.poisonTotal??=e.poison||0;
for(const e of S.run?.battleCards||[])hydrateBattleCard(e);
for(const e of S.run?.generatedCards||[])hydrateGeneratedCard(e);
