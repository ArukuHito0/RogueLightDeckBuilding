function luckyPotentialPool(){return C.filter(c=>c.runOnly&&c.characterId==='lucky'&&!c.retired&&!c.outsideCardPool&&!c.token&&!c.evolution&&!c.generated&&!c.battleCopy&&c.id>=0);}
// Lucky Girl: serializable resolution queue. No function or DOM reference is saved.
const LUCKY_SKILL_TEXT='プレイしたカードをハンドに加えて役を作る。5枚揃った時、役の判定を行う。役を揃えると、その役のカードを手札に加える。複数の役を同時に揃えたとき、好きな方を選び手札に加える。Xコストはワイルドカード。全ての数字の代わりとなる。';
EXPLORATION_SKILLS.poker={id:'poker',name:'ポーカー',characterId:'lucky',desc:LUCKY_SKILL_TEXT};
CHARACTERS.lucky.explorationSkillId='poker';
keywords.スロット='山札の上から5枚を見た後、山札に戻す。山札をシャッフルする。このカードと同じ種類のカードがX枚以上ならば、効果を発動する。';
keywords.フォールド='カードの効果によって捨て札に送られた時、このカードを自動でプレイする。';
keywords.役='カード使用時にハンドに加えられず、除外する。ターン終了時に捨て札に移動しない。';
keywords.ポーカー=LUCKY_SKILL_TEXT;
function isLucky(r=S.run){return r?.characterId==='lucky';}
function usesLuckyCards(r){
  return !!r && (isLucky(r) || !!r.lucky || (r.deck||[]).some(id=>!C[id]?.runOnly&&C[id]?.fx?.luckyKey));
}
function luckyState(r=S.run){if(!r)return null;return r.lucky??={hand:[],queue:[],frames:{},serial:0,slotCount:0,failures:0,drawCount:0,zeroBonus:0,powers:{},streak:{},payout:{},hold:[],costs:{}};}
function luckyOrigin(c){return C[c?.origin??c?.id]||c;}
function luckyNumber(c){const source=luckyOrigin(c);return source?.xCost?'X':source?.cost??0;}
const luckyHydrateBase=hydrateBattleCard;
hydrateBattleCard=function(entry){luckyHydrateBase(entry);const c=C[entry.id],source=C[entry.origin];if(c&&source?.characterId==='lucky'){c.role=!!source.role;c.token=!!source.token;c.axes=source.axes?[...source.axes]:['ポーカー'];}};
for(const e of S.run?.battleCards||[])hydrateBattleCard(e);
function luckyInstance(r,id){const entry={id:nextBattleCardId(r),origin:id};(r.battleCards??=[]).push(entry);hydrateBattleCard(entry);return entry.id;}
function luckyPrepareInstances(r){for(const pile of ['hand','draw','discard','exhausted'])r[pile]=(r[pile]||[]).map(id=>C[id]&&id>=0&&(isLucky(r)||C[id].fx?.luckyKey)?luckyInstance(r,id):id);}
function luckyAddHand(r,id){(r.hand.length<10?r.hand:r.discard).push(id);}
function luckyPush(r,tasks){luckyState(r).queue.unshift(...tasks.filter(Boolean));}
function luckyTarget(r,preferred){return r.enemies[preferred]?.hp>0?preferred:r.enemies.findIndex(e=>e.hp>0);}
function luckyCandidates(r,pile){return (r[pile]||[]).map((id,index)=>({id,index,pile}));}
function luckyChoice(r,kind,title,candidates,n,extra={}){const l=luckyState(r);if(!candidates.length||n<=0)return false;l.choice={kind,title,candidates,remaining:Math.min(n,candidates.length),selected:[],...extra};return true;}
function luckySelectTask(kind,n,extra={}){return {op:'select',kind,n,...extra};}
const luckyTypesBase=cardCategories;cardCategories=function(c){return c?.characterId==='lucky'?c.types:luckyTypesBase(c);};
const luckyCombatBase=combatCard;
combatCard=function(id){let c=luckyCombatBase(id),r=S.run;if(!c||!usesLuckyCards(r))return c;const l=luckyState(r),f={...c.fx},key=f.luckyKey;
if(key==='zero')f.d+=l.zeroBonus||0;if(key==='drawAttack')f.d+=(l.drawCount||0)*(f.drawDamageFactor??1);
if(key==='jackpot')f.h=l.slotCount||0;
if(key==='streakAttack'||key==='streakBlock')f.slot=l.streak[id]||1;
if(key==='payout')f.b+=Math.max(0,(l.failures||0)-(l.payout[id]||0))*3;
let cost=c.cost;const baseCost=luckyNumber(c);
if(l.mysteryTurn===r.turn){const k=String(id);if(l.costs[k]==null)l.costs[k]=Math.floor(Math.random()*4);cost=l.costs[k]+(hasRelic('double_cards',r)?1:0);if(r.freeze&&(f.b||f.strengthBlock||f.poisonBlock||f.exhaustBlock))cost++;}
if(l.freeCosts?.[id]===r.turn)cost=0;
if(f.slot){if(l.nextFree)cost=0;if(l.nextGuarantee)cost+=l.guaranteeCost||1;}
return {...c,fx:f,cost:Math.max(0,cost),baseCost};};
const luckyNeedsBase=needsEnemy;needsEnemy=function(c){if(c?.fx.luckyKey)return c.types[0]==='攻撃'&&!c.fx.all&&!c.fx.randomOne&&!c.fx.randomAttack||c.fx.luckyKey==='knock';return luckyNeedsBase(c);};
const luckyCanPlayBase=canPlayHunterCard;canPlayHunterCard=function(c,r){return !r?.lucky?.choice&&luckyCanPlayBase(c,r);};
function luckyDrawSymbolDescription(fx){return 'スロット'+fx.slot+'。カードを'+fx.draw+'枚引く。';}
const luckyDescBase=combatDesc;
combatDesc=function(c,r){if(!c?.fx.luckyKey)return luckyDescBase(c,r);let d=C[c.id].desc,key=c.fx.luckyKey;if(['zero','drawAttack'].includes(key))d=d.replace(/^\d+ダメージ/,previewDamage(c,r,r.enemies[target])+'ダメージ');
if(key==='draw')d=luckyDrawSymbolDescription(c.fx);
if(key==='jackpot')d+=' 現在'+(luckyState(r).slotCount||0)+'回。';
if(key==='payout')d=d.replace(/^7ブロック/,cardBlockValue(r,c.fx.b)+'ブロック');
if(key==='streakAttack'||key==='streakBlock')d=d.replace(/スロット1/g,'スロット'+c.fx.slot);
if(effectFactor(r)>1)d+=' 【遺物：ダメージ・ブロック以外2倍／コスト+1】';return d;};
let luckyCardDrawDepth=0;
function luckyEffectDraw(n){luckyCardDrawDepth++;try{return draw(n);}finally{luckyCardDrawDepth--;}}
const luckyDrawBase=draw;
draw=function(n,baseline=false){const r=S.run;if(!usesLuckyCards(r))return luckyDrawBase(n,baseline);const l=luckyState(r);
if(baseline){if(l.retained?.length){r.hand.push(...l.retained);l.retained=[];}n=Math.max(0,n-(l.drawDebt||0)-luckyBalanceNumber('custom','drawPenalty',0)*(l.powers.custom||0));l.drawDebt=0;}
const before=r.hand.length,result=luckyDrawBase(n,baseline),count=r.hand.length-before;
if(!baseline&&count>0&&luckyCardDrawDepth>0){const previous=l.drawCount||0;l.drawCount=previous+count;if(l.powers.force){const threshold=luckyBalanceNumber('force','drawThreshold',4);r.str+=Math.floor((previous%threshold+count)/threshold)*l.powers.force*luckyBalanceNumber('force','drawStrength',1);}}
if(baseline&&l.baselineTurn!==r.turn){l.baselineTurn=r.turn;const tasks=[];if(l.powers.startup)tasks.push({op:'draw',n:luckyBalanceNumber('startup','extraDraw',2)*l.powers.startup},luckySelectTask('exhaust',luckyBalanceNumber('startup','exhaustCount',1)*l.powers.startup));if(l.powers.mulligan)tasks.push(luckySelectTask('discard',2*l.powers.mulligan,{optional:true,redraw:true}));l.queue.push(...tasks);}
return result;};
function luckyRoles(numbers){const roles=new Set();function check(a){const counts={};for(const n of a)counts[n]=(counts[n]||0)+1;
if(Object.values(counts).filter(n=>n>=2).length>=2)roles.add('pair');
if([0,1,2,3].every(n=>a.includes(n)))roles.add('straight');
if(a.every((n,i)=>n===[1,0,1,0,1][i]))roles.add('blackjack');
if(a.every(n=>n===3))roles.add('three');if(a.every(n=>n===0))roles.add('five');}
function visit(a,i){if(i===numbers.length){check(a);return;}if(numbers[i]==='X')for(let n=0;n<=3;n++)visit([...a,n],i+1);else visit([...a,numbers[i]],i+1);}
if(numbers.length===5)visit([],0);return [...roles];}
function luckyRecordPoker(r,c,suppress=false){if(!isLucky(r)||suppress||c.role)return;const l=luckyState(r);l.hand.push(luckyNumber(c));if(l.hand.length<5)return;const snapshot=l.hand.splice(0,5),roles=luckyRoles(snapshot);l.lastHand=snapshot;l.lastRoles=roles;
if(roles.length){if(l.powers.royal){for(const e of r.enemies.filter(e=>e.hp>0))cardAttack(e,luckyBalanceNumber('royal','pokerDamage',12)*l.powers.royal);}if(l.powers.master){gainEnergy(r,luckyBalanceNumber('master','pokerEnergy',1)*l.powers.master);r.str+=luckyBalanceNumber('master','pokerStrength',1)*l.powers.master;}if(roles.length===1)luckyAddHand(r,luckyInstance(r,LUCKY_ROLE_IDS[roles[0]]));else luckyPush(r,[{op:'roleChoice',roles}]);}}
function luckySlot(r,ctx){const l=luckyState(r),f=ctx.card.fx,threshold=f.slot,seen=[];const firstSlot=l.lastSlotTurn!==r.turn;l.lastSlotTurn=r.turn;const total=5+(firstSlot?luckyBalanceNumber('custom','revealBonus',2)*(l.powers.custom||0):0);for(let i=0;i<total;i++){if(!r.draw.length&&r.discard.length){r.draw=shuffle(r.discard);r.discard=[];}if(!r.draw.length)break;seen.push(r.draw.pop());}r.draw.push(...seen);r.draw=shuffle(r.draw);
const kind=ctx.card.types[0],matches=seen.filter(id=>cardCategories(C[id]).includes(kind)).length;const forced=!!ctx.guarantee,success=forced||matches>=threshold;l.slotCount++;
l.lastSlot={name:ctx.card.name,seen:[...seen],kind,matches,threshold,success,forced};
if(!success)l.failures++;
return {success,seen};}
function luckyAttack(r,ctx,d,h=1,all=false,randomEach=false,randomOne=false){let chosen=luckyTarget(r,ctx.target);if(randomOne){const living=r.enemies.map((e,i)=>({e,i})).filter(x=>x.e.hp>0);if(living.length)chosen=rand(living).i;}
const enemies=all?r.enemies.map((e,i)=>({e,i})).filter(x=>x.e.hp>0):[{e:r.enemies[chosen],i:chosen}];for(const {e}of enemies){for(let i=0;i<h&&r.hp>0;i++){let enemy=e;if(randomEach)enemy=rand(r.enemies.filter(x=>x.hp>0));if(!enemy||enemy.hp<=0)break;const c={...ctx.card,fx:{...ctx.card.fx,d}};cardAttack(enemy,previewDamage(c,r,enemy));}}}
function luckyBalanceNumber(key, field, fallback){return typeof balanceScriptedNumber==='function'?balanceScriptedNumber(key.startsWith('role_')?LUCKY_ROLE_IDS[key.slice(5)]:LUCKY_IDS[key],field,fallback):fallback;}
function luckyActions(r,ctx,phase='normal'){const c=ctx.card,f=c.fx,k=f.luckyKey,l=luckyState(r),factor=effectFactor(r),a=[],add=(op,rest={})=>a.push({op,...rest}),attack=(d=f.d,h=f.h??1,all=!!f.all,randomEach=!!f.randomAttack,randomOne=!!f.randomOne)=>add('attack',{d,h,all,randomEach,randomOne}),block=n=>add('block',{n}),drawN=n=>add('draw',{n}),energy=n=>add('energy',{n}),select=(kind,n,extra={})=>a.push(luckySelectTask(kind,n,extra));
if(phase==='success'){switch(k){case 'hit':case 'doubleStep':case 'draw':drawN(f.draw);break;case 'stand':block(luckyBalanceNumber(k,'successBlock',6));break;case 'take':select('take',factor,{seen:ctx.seen});break;case 'knock':add('stun');break;case 'streakAttack':attack(luckyBalanceNumber(k,'hitDamage',9),f.slot,false,false);add('streak');break;case 'streakBlock':block(luckyBalanceNumber(k,'matchBlock',7)*f.slot);add('streak');break;default:if(f.d!=null)attack();if(f.b)block(f.b);if(f.heal)add('heal',{n:f.heal});if(f.randomStatus)add('randomStatus',{n:f.randomStatus});}return a;}
if(f.slot){add('slot');return a;}
if(c.special){if(k==='tension')add('heal',{n:4*factor});if(k==='throw')block(6);add('power',{key:k,factor});return a;}
switch(k){
case 'jackpot':attack(luckyBalanceNumber(k,'slotDamage',12),l.slotCount||0);break;
case 'zero':attack();add('zero');break;
case 'flip':attack();drawN(f.draw);break;
case 'drawAttack':attack();break;
case 'flick':case 'rapid':case 'jump':if(f.d)attack();if(f.b)block(f.b);break;
case 'chip':select('discard',factor);break;
case 'free':add('set',{key:'nextFree',n:luckyBalanceNumber(k,'freeSlots',1)});drawN(f.draw);break;
case 'retry':add('set',{key:'retry',n:luckyBalanceNumber(k,'retries',1)*factor});break;
case 'mystery':add('mystery');break;
case 'double':add('set',{key:'nextDouble',n:luckyBalanceNumber(k,'repeats',2)*factor});break;
case 'guarantee':add('set',{key:'nextGuarantee',n:factor});break;
case 'loan':energy(f.energy);add('debt',{n:factor});break;
case 'cash':drawN(Math.max(0,(l.slotCount||0)-(l.failures||0)));break;
case 'gather':drawN(f.draw);break;
case 'push':energy(f.energy);break;
case 'pickup':select('recover',luckyBalanceNumber(k,'recoverCount',1)*factor,{pile:'discard',autoPlay:true});break;
case 'doubleDown':add('multiplyEnergy',{n:luckyBalanceNumber(k,'energyMultiplier',2)*factor});break;
case 'swap':drawN(f.draw);select('top',luckyBalanceNumber(k,'returnCount',3)*factor);break;
case 'deal':select('deckTop',luckyBalanceNumber(k,'topCount',5)*factor);break;
case 'redeal':add('redeal');break;
case 'trick':drawN(f.draw);select('top',luckyBalanceNumber(k,'returnCount',2)*factor);break;
case 'delay':add('delay',{n:factor});break;
case 'payout':block(f.b);add('payoutReset');break;
case 'hop':block(f.b);break;
case 'bounce':block(f.b);add('nextBlock',{n:f.nextBlock});break;
case 'dodge':block(f.b);select('discard',factor);break;
case 'reflect':block(f.b);select('top',factor);break;
case 'hold':block(f.b);select('hold',luckyBalanceNumber(k,'retainCount',2)*factor);break;
case 'role_pair':select('recover',factor,{pile:'draw'});select('recover',factor,{pile:'discard'});break;
case 'role_straight':add('generateStraight');energy(f.energy);break;
case 'role_blackjack':attack();break;
case 'role_three':add('strength',{n:f.s});add('guard',{n:f.agility});drawN(f.draw);break;
case 'role_five':add('playZeros');break;
}
return a;}
function luckyAttachFrame(tasks,frame){return tasks.map(t=>({...t,frame}));}
function luckyBegin(r,id,options={}){const l=luckyState(r),c=combatCard(id);if(c&&options.free&&typeof swampRejectAuto==='function'&&swampRejectAuto(r,c)){r.discard.push(id);return false;}if(!c||(!options.free&&r.energy<c.cost))return false;if(typeof forestCardUsed==='function')forestCardUsed(r,id);const paid=options.free?0:c.cost;if(!options.free)r.energy-=paid;
if(typeof swampCardUsed==='function')swampCardUsed(r,c,options);
const frame=++l.serial;const ctx={id,card:{...c,fx:{...c.fx}},target:options.target??target,paid,suppress:!!options.suppress,forceExhaust:!!options.forceExhaust,folded:!!options.folded,guarantee:!!(c.fx.slot&&l.nextGuarantee),double:c.fx.slot?l.nextDouble||1:1,penalty:l.nextDouble?luckyBalanceNumber('double','penalty',1)*effectFactor(r):0};
if(c.fx.slot){if(l.nextFree)l.nextFree--;if(l.nextGuarantee){l.nextGuarantee=0;l.guaranteeCost=0;}l.nextDouble=0;}
if(isAttackCard50(c)){ctx.card.fx.attackBonus=r.nextAttackBonus||0;r.nextAttackBonus=0;}
l.frames[frame]=ctx;luckyPush(r,[...luckyAttachFrame(luckyActions(r,ctx),frame),{op:'finish',frame}]);return true;}
function luckyDiscardTasks(r,ids){return ids.map(id=>({op:'discard',id}));}
let luckyDraining=false;
function luckyPump(r=S.run){if(!usesLuckyCards(r)||luckyDraining||S.run!==r||(r.lucky?.slotPresentation||r.lucky?.autoPresentation))return;const l=luckyState(r);luckyDraining=true;try{let steps=0;while(l.queue.length&&!l.autoPresentation&&!l.slotPresentation&&!l.choice&&!r.pendingChoice&&!r.hunterChoice&&r.hp>0&&S.run===r){if(++steps>300){if(!globalThis.ASHBOUND_HEADLESS)setTimeout(()=>luckyPump(r),0);break;}const t=l.queue.shift(),ctx=l.frames[t.frame],c=ctx?.card;
switch(t.op){
case 'attack':luckyAttack(r,ctx,t.d,t.h,t.all,t.randomEach,t.randomOne);break;
case 'block':gainBlock(r,t.n);break;
case 'draw':luckyEffectDraw(t.n);break;
case 'energy':gainEnergy(r,t.n);break;
case 'heal':healHP(r,t.n);break;
case 'strength':r.str+=t.n;break;
case 'guard':r.agility=(r.agility||0)+t.n;break;
case 'stun':{const e=r.enemies[luckyTarget(r,ctx.target)];if(e)applyHunterStun(e);break;}
case 'set':if(t.key==='nextDouble')l.nextDouble=(l.nextDouble||1)*t.n;else if(t.key==='nextGuarantee'){l.nextGuarantee=1;l.guaranteeCost=(l.guaranteeCost||0)+t.n;}else l[t.key]=(l[t.key]||0)+t.n;break;
case 'debt':l.debt=(l.debt||0)+t.n;l.drawDebt=(l.drawDebt||0)+t.n;break;
case 'delay':l.delayedEnergy=(l.delayedEnergy||0)+t.n;break;
case 'nextBlock':(r.nextBlockEffects??=[]).push(t.n);break;
case 'multiplyEnergy':gainEnergy(r,r.energy*(t.n-1));break;
case 'zero':l.zeroBonus+=1;break;
case 'streak':l.streak[c.id]=Math.min(c.fx.slotMaximum??5,(l.streak[c.id]||1)+1);break;
case 'payoutReset':l.payout[c.id]=l.failures;break;
case 'mystery':{const ids=r.hand.splice(0);for(const id of ids)exhaustCard(r,id);const pool=luckyPotentialPool();for(let i=0;i<ids.length&&pool.length;i++)luckyAddHand(r,luckyInstance(r,rand(pool).id));break;}
case 'randomStatus':{const key=rand(['str','agility','plate','regen']);r[key]=(r[key]||0)+t.n;break;}
case 'power':{const magnitudes={royal:1,master:1,custom:1,mental:luckyBalanceNumber('mental','failBlock',5),tension:luckyBalanceNumber('tension','successStrength',2),mulligan:1,startup:1,force:1,throw:luckyBalanceNumber('throw','foldBlock',8)};const n=magnitudes[t.key]*(t.key==='mental'||t.key==='throw'?1:t.factor);l.powers[t.key]=(l.powers[t.key]||0)+n;break;}
case 'slot':{const result=luckySlot(r,ctx);ctx.seen=result.seen;luckyPush(r,[{op:'slotResolve',frame:t.frame,result}]);
if(canPresentBattleCards()){l.slotPresentation={seen:result.seen,success:result.success,kind:ctx.card.types[0]};}break;}
case 'slotResolve':{const result=t.result;
if(result.success){if(l.powers.tension)r.str+=l.powers.tension;}else if(l.powers.mental)gainBlock(r,l.powers.mental,'passive');
if(!result.success&&l.retry){l.retry--;luckyPush(r,[{op:'slot',frame:t.frame}]);break;}
const baseline=[];if(c.fx.luckyKey==='hit')baseline.push({op:'attack',d:luckyBalanceNumber('hit','baseDamage',5),h:1,frame:t.frame});if(['stand','doubleStep'].includes(c.fx.luckyKey))baseline.push({op:'block',n:c.fx.b,frame:t.frame});
if(result.success){const tasks=[...baseline];for(let n=0;n<ctx.double;n++)tasks.push(...luckyAttachFrame(luckyActions(r,ctx,'success'),t.frame));luckyPush(r,tasks);}
else{if(ctx.penalty)r.energy=Math.max(0,r.energy-ctx.penalty);if(c.fx.luckyKey==='safe')baseline.push({op:'attack',d:5,h:1,all:true,frame:t.frame});luckyPush(r,baseline);}break;}
case 'select':{let candidates;if(t.kind==='deckTop')candidates=luckyCandidates(r,'draw');else if(t.kind==='recover')candidates=luckyCandidates(r,t.pile);else if(t.kind==='take')candidates=luckyCandidates(r,'draw').filter(x=>t.seen.includes(x.id));else candidates=luckyCandidates(r,'hand').filter(x=>t.kind!=='hold'||!l.hold.includes(x.id));
if(r.enemies.every(e=>e.hp<=0)&&t.kind!=='recover')break;
luckyChoice(r,t.kind,{deckTop:'山札から上に置くカードを選ぶ',discard:'捨てるカードを選ぶ',exhaust:'除外するカードを選ぶ',top:'山札の上に置く順番で選ぶ',recover:(t.pile==='draw'?'山札':'捨て札')+'から手札へ',take:'見たカードから選ぶ',hold:'次のターンに残すカードを選ぶ'}[t.kind],candidates,t.n,{...t});break;}
case 'redeal':{const ids=r.hand.splice(0);luckyPush(r,[...luckyDiscardTasks(r,ids),{op:'draw',n:ids.length}]);break;}
case 'discard':{if(C[t.id]?.fx.fold){if(l.powers.throw)gainBlock(r,l.powers.throw,'passive');queuePlayedCardPresentation(r,t.id);luckyPush(r,[{op:'auto',id:t.id,folded:true}]);}else r.discard.push(t.id);break;}
case 'auto':{if(t.suppress&&t.forceExhaust&&!t.presented&&canPresentBattleCards()){l.autoPresentation={id:t.id};luckyPush(r,[{...t,presented:true}]);break;}const living=r.enemies.map((e,i)=>({e,i})).filter(x=>x.e.hp>0);if(!living.length){if(t.forceExhaust)exhaustCard(r,t.id);else r.discard.push(t.id);break;}const aim=rand(living).i;if(C[t.id]?.fx.luckyKey){luckyBegin(r,t.id,{free:true,folded:t.folded,suppress:t.suppress,forceExhaust:t.forceExhaust,target:aim});}else{luckyPlayExistingAuto(r,t,aim);}break;}
case 'generateStraight':{const pool=luckyPotentialPool();for(let cost=0;cost<=3;cost++){const choices=pool.filter(x=>!x.xCost&&x.cost===cost);if(choices.length)luckyAddHand(r,luckyInstance(r,rand(choices).id));}break;}
case 'playZeros':{const pool=luckyPotentialPool().filter(c=>!c.xCost&&c.cost===0),ids=Array.from({length:pool.length?luckyBalanceNumber('role_five','autoCount',5):0},()=>luckyInstance(r,rand(pool).id));luckyPush(r,ids.map(id=>({op:'auto',id,suppress:true,forceExhaust:true})));break;}
case 'poker':luckyRecordPoker(r,t.card,t.suppress);break;
case 'roleChoice':luckyChoice(r,'role','成立した役を1つ選ぶ',t.roles.map(role=>({id:LUCKY_ROLE_IDS[role],role})),1);break;
case 'finish':{if(ctx.forceExhaust||c.role)exhaustCard(r,ctx.id);else resolvePlayedCardPile(r,c);
if(r.heartbeat){const total=(r.heartbeatCount||0)+ctx.paid;gainEnergy(r,Math.floor(total/(r.heartbeatThreshold??4))*(r.heartbeatRefund||1));r.heartbeatCount=total%(r.heartbeatThreshold??4);}
onCardResolved(r,c);luckyRecordPoker(r,c,ctx.suppress);
if(r.kind==='boss')bossPlan(r);msg=c.name+'を使用。';delete l.frames[t.frame];break;}
}
}
}finally{luckyDraining=false;}
if(r.hp<=0){l.queue=[];l.choice=null;finish(false);return;}
if(!l.queue.length&&!l.choice&&!r.pendingChoice&&!r.hunterChoice&&r.enemies.every(e=>e.hp<=0)){victory();return;}render();}
function luckyChoose(index){const r=S.run,l=r?.lucky,p=l?.choice;if(!p||busy||r.pendingChoice?.inspect)return;if(p.kind==='top'){luckyTopPrepare(r);const item=p.candidates[index],slot=p.topSlots.indexOf(null);if(item&&slot>=0)luckyTopPlace(item.id,slot);return;}const item=p.candidates[index];if(!item)return;
if(p.kind==='role'){luckyAddHand(r,luckyInstance(r,item.id));l.choice=null;luckyPump(r);return;}
const pile=r[item.pile],at=pile?.indexOf(item.id);if(at==null||at<0)return;
if(p.kind==='hold'){l.hold.push(item.id);}else{pile.splice(at,1);p.selected.push(item.id);if((p.kind==='recover'&&!p.autoPlay)||p.kind==='take'){luckyAddHand(r,item.id);if(p.kind==='take')(l.freeCosts??={})[item.id]=r.turn;}else if(p.kind==='exhaust')exhaustCard(r,item.id);}
p.candidates.splice(index,1);p.remaining--;if(p.kind==='deckTop'&&(p.remaining<=0||!p.candidates.length)){p.kind='top';p.topPool=p.selected.splice(0);p.topSlots=Array(p.topPool.length).fill(null);p.remaining=p.topPool.length;render();return;}if(p.kind==='discard'&&r.pendingChoice?.luckyDiscard)r.pendingChoice.remaining=p.remaining;if(p.remaining<=0||!p.candidates.length||(!p.autoPlay&&['recover','take'].includes(p.kind)&&r.hand.length>=10))luckyFinishChoice(r);else render();}
function luckyFinishChoice(r=S.run){const l=r?.lucky,p=l?.choice;if(!p||r.pendingChoice?.inspect)return;
if(p.kind==='top'){luckyTopPrepare(r);if(p.topSlots.some(id=>id==null))return;p.selected=[...p.topSlots];if(r.pendingChoice?.luckyTop)r.pendingChoice=null;for(const id of [...p.selected].reverse())r.draw.push(id);}
if(p.kind==='discard'&&r.pendingChoice?.luckyDiscard)r.pendingChoice=null;
if(p.autoPlay)luckyPush(r,p.selected.map(id=>({op:'auto',id})));
if(p.kind==='discard')luckyPush(r,[...luckyDiscardTasks(r,p.selected),...(p.redraw?[{op:'draw',n:p.selected.length}]:[])]);
l.choice=null;luckyPump(r);}
const luckyBasePlay=base.play;
let luckySuppressPoker=false,luckyForceExhaustId=null,luckyExistingCall=false;
function luckyPlayExistingAuto(r,t,aim){const previous=target;target=aim;r.hand.push(t.id);luckySuppressPoker=!!t.suppress||!!C[t.id]?.act6Junk;luckyForceExhaustId=t.forceExhaust?t.id:null;try{luckyCardDrawDepth++;luckyBasePlay(r.hand.length-1,{free:true});}finally{luckyCardDrawDepth--;target=previous;luckySuppressPoker=false;luckyForceExhaustId=null;}}
base.play=function(i,options={}){const r=S.run;if(!usesLuckyCards(r))return luckyBasePlay(i,options);const l=luckyState(r);if(l.slotPresentation||l.choice||r.pendingChoice||r.hunterChoice||l.queue.length)return;const id=r.hand[i],c=combatCard(id);if(!c||(!options.free&&r.energy<c.cost)||!canPlayHunterCard(c,r,!!options.free))return;
if(c.fx.luckyKey){r.hand.splice(i,1);luckyBegin(r,id,options);luckyPump(r);}else{luckyExistingCall=true;try{luckyCardDrawDepth++;luckyBasePlay(i,options);}finally{luckyCardDrawDepth--;luckyExistingCall=false;}luckyPump(r);}};
const luckyResolvedBase=onCardResolved;
onCardResolved=function(r,c){luckyResolvedBase(r,c);if(isLucky(r)&&!c.fx.luckyKey)luckyPush(r,[{op:'poker',card:{id:c.id,origin:c.origin,cost:c.cost,xCost:c.xCost,role:c.role},suppress:luckySuppressPoker}]);};
const luckyPileBase=resolvePlayedCardPile;
resolvePlayedCardPile=function(r,c,trigger=true){if(isLucky(r)&&c.id===luckyForceExhaustId){exhaustCard(r,c.id,trigger);return;}return luckyPileBase(r,c,trigger);};
const luckyCompleteBase=completeCardResolution;completeCardResolution=function(r,c){if(usesLuckyCards(r)){if(!luckyDraining&&!luckyExistingCall)luckyPump(r);return;}return luckyCompleteBase(r,c);};
const luckyChooseHandBase=chooseHand;
chooseHand=function(i){const r=S.run,p=r?.pendingChoice;if(p?.luckyDiscard){const choice=r.lucky?.choice,index=choice?.candidates.findIndex(x=>x.id===r.hand[i]);if(index>=0)luckyChoose(index);return;}if(!usesLuckyCards(r)||p?.kind!=='discard')return luckyChooseHandBase(i);if(busy||p.inspect||i<0||i>=r.hand.length)return;const id=r.hand.splice(i,1)[0],l=luckyState(r);(l.pendingDiscards??=[]).push(id);p.remaining=(p.remaining||1)-1;if(p.remaining>0&&r.hand.length){render();return;}if(p.breakTarget!=null&&r.enemies[p.breakTarget]){r.enemies[p.breakTarget].block=0;if(typeof clearArchiveReading==='function')clearArchiveReading(r.enemies[p.breakTarget]);};r.pendingChoice=null;r.pendingDiscard=0;luckyPush(r,[...luckyDiscardTasks(r,l.pendingDiscards.splice(0)),...(p.draw?[{op:'draw',n:p.draw}]:[])]);luckyPump(r);};
const luckyTurnStartBase=applyTurnStartBuffs;
applyTurnStartBuffs=function(r){luckyTurnStartBase(r);if(!usesLuckyCards(r))return;const l=luckyState(r);r.energy=Math.max(0,r.energy-(l.debt||0));l.debt=0;gainEnergy(r,l.delayedEnergy||0);l.delayedEnergy=0;l.costs={};l.freeCosts={};l.hold=[];};
const luckyEndBase=endTurn;
endTurn=async function(){const r=S.run;if(!usesLuckyCards(r))return luckyEndBase();const l=luckyState(r);if(busy||r.pendingChoice||r.hunterChoice||r.pendingDiscard||r.potionTarget!=null||l.choice||l.queue.length)return;const keep=r.hand.filter(id=>C[id]?.role||l.hold.includes(id));r.hand=r.hand.filter(id=>!keep.includes(id));l.retained=keep;await luckyEndBase();if(S.run===r&&r.mode==='battle')luckyPump(r);};
const luckyChooseBattleBase=choose;
choose=function(type){const r=S.run,was=r?.mode,starting=usesLuckyCards(r)&&was!=='battle'&&['fight','elite','boss','unknown'].includes(type);if(starting)r.lucky=null;const result=luckyChooseBattleBase(type);if(starting&&S.run===r&&r.mode==='battle'){luckyPrepareInstances(r);luckyPump(r);}return result;};
const luckyFinishRunBase=finish;finish=function(...args){const r=S.run;if(usesLuckyCards(r)){const l=luckyState(r);l.hand=[];l.queue=[];l.choice=null;l.frames={};}return luckyFinishRunBase(...args);};
const luckyVictoryBase=victory;
victory=function(){const r=S.run;if(usesLuckyCards(r)){const l=luckyState(r);l.queue=[];l.choice=null;l.hand=[];l.frames={};l.retained=[];}return luckyVictoryBase();};
// Shop packs use the same card-type lineup for every explorer.
const luckyMatchesBase=packMatches;packMatches=function(c,axis){return c?.characterId==='lucky'?(c.axes||[]).includes(axis):luckyMatchesBase(c,axis);};
const luckyWireBase=wireBattle;wireBattle=function(){if(S.run?.lucky?.choice)return;luckyWireBase();};
function luckyChoiceHTML(r){const p=r.lucky?.choice;if(!p||p.kind==='discard'||p.kind==='top')return '';return '<div class="lucky-choice-overlay" role="dialog" aria-modal="true" aria-label="'+escapeHTML(p.title)+'"><section class="lucky-choice-panel"><h2>'+escapeHTML(p.title)+'</h2><p>残り '+p.remaining+'枚'+(p.kind==='top'?'（最初に選んだカードを次に引きます）':'')+'</p><div class="cards">'+p.candidates.map((x,i)=>'<div class="lucky-option">'+card(x.id,'luckyChoose('+i+')')+'</div>').join('')+'</div>'+(p.optional?'<button onclick="luckyFinishChoice()">ここまでで決定</button>':'')+'</section></div>';}
const luckyBattleBase=battle;battle=function(){const r=S.run;luckySyncDiscardChoice(r);let html=luckyBattleBase();if(!usesLuckyCards(r))return html;const l=luckyState(r);let status='';for(const [key,label]of [['royal','ロイヤルポーカー'],['master','ポーカーマスター'],['custom','カスタムマシン'],['mental','メンタルブロック'],['tension','テンション'],['mulligan','マリガン'],['startup','スタートアップ'],['force','フォース'],['throw','スローアウェイ']])if(l.powers[key])status+='<span class="status-help" tabindex="0">'+label+' '+l.powers[key]+'<aside class="tooltip">'+C[LUCKY_IDS[key]].desc+'</aside></span>';
html=html.replace('<div class="player-status">','<div class="player-status">'+status);
const pokerHand = isLucky(r) ? '<strong>ポーカー</strong><span class="poker-hand">'+Array.from({length:5},(_,i)=>'<span class="'+(i<l.hand.length?'filled':'')+'">'+(l.hand[i]??'·')+'</span>').join('')+'</span>' : '';
const poker='<section class="lucky-table"><div class="lucky-poker">' + pokerHand + '<small>スロット '+l.slotCount+'回 ／ 効果ドロー '+l.drawCount+'枚</small></div>'+(l.lastSlot?'<div class="lucky-slot-result '+(l.lastSlot.success?'win':'lose')+'" role="status"><strong>'+escapeHTML(l.lastSlot.name)+'：'+(l.lastSlot.success?'成功':'失敗')+'</strong><span>'+l.lastSlot.kind+' '+l.lastSlot.matches+' / '+l.lastSlot.threshold+'</span><div>'+l.lastSlot.seen.map(id=>'<span title="'+escapeHTML(C[id]?.name||'')+'">'+escapeHTML(C[id]?.name||'')+'</span>').join('')+'</div></div>':'')+'</section>';
if(l.choice?.kind==='discard'&&l.choice.optional)html+='<button class="inspect-choice lucky-discard-done" onclick="luckyFinishChoice()">ここまでで決定</button>';
html=html.replace('<div class="combat-controls">',poker+'<div class="combat-controls">');return html+luckyChoiceHTML(r);};
const luckyCardBase=card;card=function(id,action='',extra=''){const c=C[id];let html=luckyCardBase(id,action,extra);if(c?.role)html=html.replace('<span class="latent-badge">潜在</span>','<span class="latent-badge">役</span>').replace(/<small class="card-category">.*?<\/small>/,'<small class="card-category">役</small>');return html;};
function luckySyncDiscardChoice(r){const p=r?.lucky?.choice;if(p?.kind==='discard'&&!r.pendingChoice)r.pendingChoice={kind:'discard',remaining:p.remaining,luckyDiscard:true};}
const luckyRenderBase=render;render=function(){luckySyncDiscardChoice(S.run);luckyRenderBase();if(page==='battle'&&S.run?.lucky?.choice){document.querySelectorAll('.lucky-choice-panel .lucky-option .card').forEach((el,index)=>{el.classList.remove('playable','unplayable','empowered');el.onclick=()=>luckyChoose(index);});}};
// Resume only queue data; never replay a completed effect.
if(usesLuckyCards(S.run)){luckyState(S.run);for(const entry of S.run.battleCards||[])hydrateBattleCard(entry);}
if(!globalThis.ASHBOUND_HEADLESS){if(usesLuckyCards(S.run)&&S.run.mode==='battle'&&S.run.lucky?.queue.length&&!S.run.lucky.choice)luckyPump(S.run);else render();}
const LUCKY_ROLE_RULES={pair:'同じ数字2枚が2組',straight:'0～3の連続する4枚',blackjack:'1・0・1・0・1の順番',three:'ハンドの全てが3コスト',five:'ハンドの全てが0コスト'};
function luckyRolesHTML(){return '<div class="cards lucky-role-list">'+Object.entries(LUCKY_ROLE_IDS).map(([key,id])=>'<div><p>'+LUCKY_ROLE_RULES[key]+'</p>'+card(id)+'</div>').join('')+'</div>';}
function luckyShowRoles(){if(!isLucky(S.run))return;luckyState(S.run).inspectRoles=true;render();}
function luckyCloseRoles(){if(S.run?.lucky)S.run.lucky.inspectRoles=false;render();}
const luckyBookBase=book;book=function(){let html=luckyBookBase();if(bookType==='run'&&codexCharacter().id==='lucky')html+='<section class="lucky-role-codex"><h3>ポーカーの役</h3><p>役が成立すると生成されるトークンカードです。通常の報酬には出現しません。</p>'+luckyRolesHTML()+'</section>';return html;};
const luckyBattleRolesBase=battle;battle=function(){let html=luckyBattleRolesBase();if(!isLucky(S.run))return html;html=html.replace('<strong>ポーカー</strong>','<strong>ポーカー</strong><button class="lucky-role-help" onclick="luckyShowRoles()">役を見る</button>');if(S.run.lucky?.inspectRoles)html+='<div class="lucky-choice-overlay" role="dialog" aria-modal="true" aria-label="ポーカーの役"><section class="lucky-choice-panel"><div class="toolbar"><h2>ポーカーの役</h2><button onclick="luckyCloseRoles()">閉じる</button></div>'+luckyRolesHTML()+'</section></div>';return html;};
if(!globalThis.ASHBOUND_HEADLESS)render();
