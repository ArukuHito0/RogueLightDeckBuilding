// Pure decisions: this module cannot access the engine state or game RNG.
(function(){
 let overrides={};
 const axes=['strength','poison','block','exhaust'],names={strength:'筋力',poison:'毒',block:'ブロック',exhaust:'除外'};
 const config={version:'learning-v40',tuning:AI_TUNING,keys:{strength:[19,20,21],poison:[16,17,18],block:[37,54,63],exhaust:[22,24,73]},completion:{keys:2,share:.45},weights:{axis:3,key:6,efficiency:1,role:3},ambiguityGap:1,time:{turn:8,card:3,battle:15},deckSize:14};
 function tags(c){if(overrides[c.origin??c.id]?.axes)return [...overrides[c.origin??c.id].axes];let f=c.fx||{},a=[];if(f.s||f.doubleStr||f.strScale||f.strengthBlock||f.empathy||f.forge||f.exhaustStrength)a.push('strength');if(f.p||f.equalPoison||f.totalPoison||f.poisonDouble||f.poisonDraw||f.reinfect||f.poisonAura||f.poisonCoat||f.poisonBlock||f.empathy)a.push('poison');if(f.poisonBlock||f.b||f.agility||f.plate||f.exactBlock||f.blockScale||f.retainBlock||f.burn||f.thorns||f.thornGarden||f.thornShield||f.rage||f.nextBlock||f.passion||f.exhaustBlock)a.push('block');if(f.ex||f.exScale||f.engine||f.sacrifice||f.chooseExhaust||f.recoverExcluded||f.tokenSword||f.tokenKnife||f.exhaustStrength)a.push('exhaust');return a.length?a:axes.slice()}
 function roles(c){if(overrides[c.origin??c.id]?.roles)return {...overrides[c.origin??c.id].roles};let f=c.fx||{};return {attack:!!(f.d||f.p||f.equalPoison||f.totalPoison||f.exactBlock),defense:!!(f.poisonBlock||f.b||f.plate||f.agility||f.retainBlock||f.thorns),draw:!!(f.draw||f.recover||f.poisonDraw),heal:!!(f.heal||f.regen)}}
 function traits(c){if(overrides[c.origin??c.id]?.traits)return {...overrides[c.origin??c.id].traits};const f=c.fx||{},den=Math.max(AI_TUNING.frontload.zeroCostDenominator,c.cost),d=(f.d||0)*(f.h||1)*(f.all?AI_TUNING.frontload.areaTargets:1),b=f.b||0;return {frontDamage:d/den>=AI_TUNING.frontload.damagePerEnergy,frontBlock:b/den>=AI_TUNING.frontload.blockPerEnergy,scaling:!!(f.poisonAura||f.poisonCoat||f.reinfect||f.s||f.agility||f.p||f.doubleStr||f.poisonDouble||f.engine||f.burn||f.exhaustStrength||f.retainBlock||f.forge||f.thornGarden||f.passion),draw:!!(f.draw||f.energy||f.lowEnergy||f.recover||f.poisonDraw||f.heartbeat||f.chooseExhaust),block:!!(f.poisonBlock||f.b||f.plate||f.strengthBlock||f.exhaustBlock),heal:!!(f.heal||f.regen),selfHarm:!!(f.hpLoss||f.maxHpLoss||f.selfDamage||f.passion)}}
 function counts(deck){const n={frontDamage:0,frontBlock:0,scaling:0,draw:0,block:0,heal:0,selfHarm:0};for(const c of deck)for(const [k,v] of Object.entries(traits(c)))n[k]+=Number(v);return n}
 function healing(c,o,axis){const cfg=AI_TUNING.heal,n=counts(o.deck||[]),hp=o.hp??o.maxHp??70,max=o.maxHp||70,missing=Math.max(0,max-hp),f=c.fx||{},amount=Math.min(missing,(f.heal||0)+(f.regen||0)*2);const hpSituation=hp/max>=cfg.healthyAt?cfg.healthyMultiplier:1;const selfHarm=n.selfHarm/Math.max(1,o.deck.length)>=AI_TUNING.tolerance.selfHarmShare?cfg.selfHarmBonus:0,axisFit=axis==='block'?cfg.blockBonus:0;return {hpSituation,selfHarmCards:n.selfHarm,selfHarm,axisFit,amount,total:amount*hpSituation*(cfg.baseWeight+selfHarm+axisFit)}}
 function pick(c,deck,axis,weight=1,context={}){let f=c.fx||{},t=traits(c),n=counts(deck),cfg=AI_TUNING.deck,floor=context.floor||1;const deficit=(k,target)=>Math.max(0,target-n[k])/target;const marginal=(k,target)=>n[k]<target?1+deficit(k,target):cfg.surplusValue;
 const frontload=(t.frontDamage?marginal('frontDamage',cfg.targetDamage):0)+(t.frontBlock?marginal('frontBlock',cfg.targetFrontBlock):0);
 const front=frontload*(floor<cfg.midFloor?6:3),scaling=t.scaling*marginal('scaling',cfg.targetScaling)*(floor>=cfg.lateFloor?9:floor>=cfg.midFloor?6:2.5);
 const role=roles(c),roleNeed=(role.defense&&deck.filter(x=>roles(x).defense).length<cfg.minBlock?4:0)+(role.attack&&deck.filter(x=>roles(x).attack).length<cfg.targetDamage?3:0)+(role.draw&&deck.filter(x=>roles(x).draw).length<cfg.targetDraw?2:0);
 const balance=roleNeed+(n.block<cfg.minBlock?(t.block?cfg.shortagePenalty:-cfg.shortagePenalty*deficit('block',cfg.minBlock)):0)+(n.frontDamage<cfg.targetDamage?(t.frontDamage?5:-2):0)+(t.draw?3*marginal('draw',cfg.targetDraw):0);
 const affinity=(tags(c).includes(axis)?config.weights.axis:0)*weight,key=keyCard(c,axis)?config.weights.key*weight:0;
 const efficiency=((f.d||0)*(f.h||1)/7+(f.b||0)/7+(f.poisonAura||0)*2+(f.poisonCoat||0)*2+(f.reinfect?4:0)+(f.poisonBlock?3:0)+(f.empathy?3:0)+(f.p||0)*.7+(f.s||0)*2+(f.agility||0)*2+(f.plate||0)/4+(f.draw||0)*2+(f.energy||0)*2+(f.exactBlock?Math.min(8,n.block*1.2)*f.exactBlock:0)+(f.exScale||0)*.7)/(1+c.cost*.7);
 const h=healing(c,{...context,deck,hp:context.hp??45,maxHp:context.maxHp??70},axis),heal=h.total*.3+(t.heal?Math.max(0,cfg.targetHealing-n.heal)*6*(h.hpSituation+.5)*(1+h.selfHarm+h.axisFit):0);
 const reusable=deck.filter(x=>traits(x).block&&!x.fx.ex).length;const heavy=deck.filter(x=>x.cost>=2).length/Math.max(1,deck.length);const duplicate=-(c.cost>=2&&heavy>=cfg.maxHeavyShare?8*(heavy/cfg.maxHeavyShare):0)-deck.filter(d=>d.id===c.id).length*1.5-(f.hpLoss||0)*.6-(f.maxHpLoss||0)*1.1-(t.selfHarm&&n.selfHarm>=cfg.maxSelfHarm?10:0)+(reusable<cfg.minReusableBlock&&t.block?(f.ex?-5:7):0);
 return {frontload:front,scaling,balance,axis:affinity,key,efficiency,role:0,duplicate,heal,hpSituation:h.hpSituation,selfHarmCards:h.selfHarmCards,healAxis:h.axisFit,total:front+scaling+balance+affinity+key+efficiency+duplicate+heal}
 }
 function build(catalog,axis,weight){let deck=[],picks=[],pool=catalog.filter(c=>!c.runOnly&&!c.retired);while(deck.length<config.deckSize){const offers=pool.filter(c=>deck.filter(d=>d.id===c.id).length<3&&(!c.fx.maxHpLoss||!deck.some(d=>d.fx.maxHpLoss)));const scores=offers.map(c=>({id:c.id,name:c.name,score:pick(c,deck,axis,weight,{floor:1,hp:70,maxHp:70})}));scores.sort((a,b)=>b.score.total-a.score.total||a.id-b.id);const chosen=scores[0];deck.push(pool.find(c=>c.id===chosen.id));picks.push({source:'base',offers:scores,selected:[chosen.id]})}return {deck:deck.map(c=>c.id),picks}}
 function poisonDamage(e,o,horizon=1){let p=e.poison||0,hp=e.hp,total=0;for(let turn=0;turn<horizon;turn++)for(let j=0;j<(o.statuses?.poisonDouble||1);j++){const d=Math.min(hp,p);total+=d;hp-=d;p=Math.max(0,p-1);if(e.boss&&!e.audienceUsed&&hp<=130)return total;if(hp<=0)return total}return total}
 function incoming(o){return (o.enemies||[]).filter(e=>e.hp>poisonDamage(e,o)&&!(e.boss&&!e.audienceUsed&&e.hp-poisonDamage(e,o)<=130)).reduce((n,e)=>n+(e.intent==='attack'?e.attack*e.hits:0),0)}
 function damageEstimate(c,o,e){const f=c.fx||{};let d=f.equalPoison?(e?.poison||0):f.totalPoison?(o.enemies||[]).reduce((s,e)=>s+(e.hp>0?e.poison:0),0):f.exactBlock?o.block*f.exactBlock+(o.strength||0):f.d!=null?f.d+(o.strength||0)*(f.strScale||1)+(f.blockScale||0)*o.block+(f.exScale||0)*(o.excluded?.length||0):0;return Math.max(0,d)*(f.h||1)}
 function blockEstimate(c,o){const f=c.fx||{};return (f.poisonBlock?Math.max(0,(o.enemies||[]).filter(e=>e.hp>0).reduce((n,e)=>n+(e.poison||0),0)*f.poisonBlock+(o.guard||0)):0)+Math.max(0,(f.b||0)+(f.b?o.guard||0:0))+(f.strengthBlock?Math.max(0,(o.strength||0)*f.strengthBlock+(o.guard||0)):0)+(f.exhaustBlock?Math.max(0,Math.floor((o.excluded?.length||0)/2)*f.exhaustBlock+(o.guard||0)):0)}
 function lethalEstimate(o){const es=(o.enemies||[]).filter(e=>e.hp>0);if(es.length!==1)return false;const e=es[0],dp=Array(Math.max(0,o.energy||0)+1).fill(0);for(const c of o.hand||[]){const cost=Math.max(0,c.cost),v=damageEstimate(c,o,e);for(let n=dp.length-1;n>=cost;n--)dp[n]=Math.max(dp[n],dp[n-cost]+v)}return Math.max(...dp)>=e.hp+(e.block||0)}
 function tolerance(o){const c=AI_TUNING.tolerance,n=counts(o.deck||[]),ratio=o.hp/o.maxHp,lethal=lethalEstimate(o);const base=Math.min(c.max,Math.max(c.min,Math.min(c.base,o.maxHp*c.maxHpRatio))),high=ratio>=c.highHpAt?c.highHpBonus:0,low=ratio<=c.lowHpAt?-c.lowHpPenalty:0,cumulative=(o.battleDamage||0)>=o.maxHp*c.cumulativeRatio?-c.cumulativePenalty:0,rest=(o.restDistance??10)>=c.farRest?-c.restPenalty:0,selfHarm=n.selfHarm/Math.max(1,o.deck.length)>=c.selfHarmShare?c.selfHarmBonus:0;return {base,high,low,cumulative,rest,selfHarm,lethal:lethal?c.lethalBonus:0,total:Math.max(0,Math.min(c.absoluteMax,base+high+low+cumulative+rest+selfHarm+(lethal?c.lethalBonus:0)))}}
 function horizon(o){const es=(o.enemies||[]).filter(e=>e.hp>0),pool=[...(o.hand||[]),...(o.drawPile||[])],damage=pool.reduce((s,c)=>s+(c.fx.d||0)*(c.fx.h||1),0)/Math.max(1,pool.length)*3;return Math.max(1,es.reduce((s,e)=>s+e.hp,0)/Math.max(AI_TUNING.combat.assumedDamagePerTurn,damage))}
 function poisonTactics(c,o,e){const f=c.fx,targets=f.all?o.enemies.filter(x=>x.hp>0):[e],cfg=AI_TUNING.poison;let score=0,reasons=[];
 if(f.poisonDouble){const active=o.statuses?.poisonDouble===true?2:o.statuses?.poisonDouble||1;if(active>=(f.poisonTicks||2))return {score:-1000,reasons:['触媒は既に有効：重複使用を回避'],skip:true};if(o.enemies.some(x=>x.boss)||horizon(o)>=4){score+=cfg.catalystSetup;reasons.push('触媒は謁見後にも持続する準備効果')}}
 for(const x of targets){const ownDamage=Math.min(x.hp,Math.max(0,damageEstimate(c,o,x)-(x.block||0))),crosses=x.boss&&!x.audienceUsed&&x.hp-ownDamage<=130&&x.hp>ownDamage;
 if(crosses){score+=cfg.transitionBonus+(x.intent==='attack'?x.attack*x.hits*.8:0);reasons.push('この攻撃で謁見を発動し予告を止める')}
 if(f.p){const after={...x,hp:x.hp-ownDamage,audienceUsed:x.audienceUsed||crosses,poison:crosses?0:x.poison},marginal=poisonDamage({...after,poison:after.poison+f.p},o,3)-poisonDamage(after,o,3);
 if(x.boss&&!x.audienceUsed&&!crosses){const transitionSoon=poisonDamage(x,o)>=x.hp-130||o.hand.some(y=>y!==c&&y.cost<=o.energy&&damageEstimate(y,o,x)>=(x.hp-130)+(x.block||0));if(transitionSoon){score-=cfg.beforeCleansePenalty+(f.ex?cfg.reserveExcluded:0);reasons.push('謁見が目前：解除される毒・除外カードを温存')}else if(marginal<=f.p){score-=cfg.shortPoisonPenalty;reasons.push('謁見までの毒の有効期間が短い')}}
 if(after.audienceUsed&&x.boss&&after.poison===0){score+=cfg.rebuildBonus;reasons.push('謁見後の毒を再構築')}
 const follow=o.hand.filter(y=>y!==c&&(y.fx.equalPoison||y.fx.totalPoison)&&y.cost<=o.energy-c.cost);if(follow.length&&!crosses&&after.hp>0){score+=f.p*cfg.comboWeight;reasons.push('毒付与後に手札の毒依存攻撃を使用可能');if(follow.some(y=>damageEstimate(y,{...o,enemies:o.enemies.map(z=>z.index===x.index?{...after,poison:after.poison+f.p}:z)},{...after,poison:after.poison+f.p})>=after.hp+(after.block||0)))score+=cfg.comboLethal}
 }
 }
 if((f.equalPoison||f.totalPoison)&&damageEstimate(c,o,e)<e.hp+(e.block||0)&&o.hand.some(y=>y!==c&&y.fx.p&&y.cost<=o.energy-c.cost)){score-=cfg.waitForPoison;reasons.push('毒依存攻撃の前に使える毒付与がある')}
 return {score,reasons,skip:false}
 }
 function evaluate(a,o,axis,w=1){const c=a.type==='play'?(o.hand||[])[a.index]:(o.offers||[]).find(c=>c.id===a.cardId)||(o.hand||[]).find(c=>c.id===a.cardId)||(o.excluded||[]).find(c=>c.id===a.cardId)||(o.deck||[]).find(c=>c.id===a.cardId);
 if(['reward','packSelect','chest'].includes(a.type)){const p=c?pick(c,o.deck,axis,w,o):{total:-3};return {...p,total:p.total-2}}
 if(a.type==='play'){
 const f=c.fx,es=o.enemies.filter(e=>e.hp>0),e=es.find(e=>e.index===a.enemy)||es[0],inc=incoming(o),missing=Math.max(0,inc-o.block),allow=tolerance(o),long=horizon(o),b=blockEstimate(c,o),raw=damageEstimate(c,o,e),targets=f.all?es:[e],hits=f.h||1;
 let damage=targets.reduce((s,x)=>s+Math.min(x.hp,Math.max(0,damageEstimate(c,o,x)-(x.block||0))),0),kill=targets.reduce((s,x)=>s+(damageEstimate(c,o,x)>=x.hp+(x.block||0)?AI_TUNING.combat.lethalBonus+(x.intent==='attack'?x.attack*x.hits:0):0),0);
 let defense=Math.min(b,missing)*(missing>allow.total?AI_TUNING.combat.defenseWeight:0.45),scaling=0,poison=0,sequence=0;
 const longFactor=long>=AI_TUNING.combat.longTurns?1:long/AI_TUNING.combat.longTurns;
 scaling+=((f.s||0)*4+(f.agility||0)*4+(f.doubleStr?(o.strength||0)*4:0)+(f.engine?7:0)+(f.burn?10:0)+(f.exhaustStrength?4:0)+(f.retainBlock?8:0)+(f.forge?5:0)+(f.heartbeat?6:0)+(f.thornGarden||0)*4+(f.passion?4:0))*longFactor;
 scaling+=(f.plate||0)*Math.min(2,long*.4)+(f.thorns||0)*Math.min(4,long)*.8;
 if(f.p){for(const x of f.all?es:[e]){const enough=poisonDamage(x,o,AI_TUNING.combat.poisonHorizon)>=x.hp;poison+=f.p*(enough?.35:Math.min(4,long));if(axis==='poison'&&!enough)poison+=x.poison===0?14:5}if(axis==='poison'&&targets.every(x=>poisonDamage(x,o,3)>=x.hp)&&missing>0)poison-=4}
 if(f.reinfect)poison+=((e.poisonTotal||0)*f.reinfect+(f.reinfectBonus||0))*Math.min(3,long);if(f.poisonAura)scaling+=f.poisonAura*es.length*Math.min(4,long)*2;if(f.poisonCoat)sequence+=f.poisonCoat*o.hand.filter(x=>x!==c&&x.fx.d&&x.cost<=o.energy-c.cost).reduce((n,x)=>n+(x.fx.h||1)*(x.fx.all?es.length:1),0)*2;if(f.empathy)sequence+=(e.poison||0)*f.empathy*o.hand.filter(x=>x!==c&&x.fx.d&&x.cost<=o.energy-c.cost).reduce((n,x)=>n+(x.fx.h||1),0);
 if(f.poisonDouble)scaling+=es.reduce((s,x)=>s+x.poison,0)*1.5+5*longFactor;
 if(b&&o.hand.some(x=>(x.fx.exactBlock||x.fx.blockScale)&&x.cost<=o.energy-c.cost)){sequence+=b*(axis==='block'?1.8:1)}
 if((f.exactBlock||f.blockScale)&&o.hand.some(x=>blockEstimate(x,o)>0&&x.cost<=o.energy-c.cost)&&kill===0)sequence-=8;
 if(f.s&&o.hand.some(x=>x.fx.d&&x.cost<=o.energy-c.cost))sequence+=f.s*3;
 const cardsAfter=o.hand.length-1,availableDraw=(o.drawPile?.length||0)+(o.discard?.length||0),energyAfter=o.energy-c.cost;
 const drawCount=(f.draw||0)+(f.chooseExhaust?2:0)+(f.poisonDraw&&e.poison?f.poisonDraw:0)+(f.recover?1:0);
 sequence+=Math.min(drawCount,10-cardsAfter,availableDraw)*((energyAfter>0||o.drawPile?.some(x=>x.cost===0))?3.5:.15);
 const playableCost=o.hand.filter(x=>x!==c).reduce((s,x)=>s+x.cost,0);sequence+=(f.energy||0)*Math.min(6,Math.max(0,playableCost-energyAfter)*2);
 sequence+=(f.tokenSword?6:0)+(f.tokenKnife?5:0)+(f.chooseExhaust?2:0)+(f.sacrifice&&cardsAfter>0?3:0)+(f.recoverExcluded?4:0);
 const heal=healing(c,o,axis),loss=(f.hpLoss||0)+(f.selfDamage||0)+(f.maxHpLoss||0),risk=loss>=o.hp?-10000:-loss*(o.hp/o.maxHp<.3?5:1.2);
 if(missing>allow.total&&b===0&&kill===0&&o.hand.some(x=>blockEstimate(x,o)>=missing-allow.total&&x.cost>energyAfter&&x.cost<=o.energy))defense-=Math.min(35,(missing-allow.total)*2);
 if(allow.lethal&&raw>0)damage*=1.4;
 const tactics=(axis==='poison'||f.poisonDouble)?poisonTactics(c,o,e):{score:0,reasons:[],skip:false};if(tactics.skip)return {poisonTactics:tactics.score,poisonReasons:tactics.reasons,total:-1000};
 const affinity=tags(c).includes(axis)?w:0,total=(damage+kill+defense+scaling+poison+sequence+heal.total+risk+affinity+tactics.score)/(1+c.cost*.35);
 return {poisonTactics:tactics.score,poisonReasons:tactics.reasons,damage,kill,defense,scaling,poison,sequence,heal:heal.total,hpSituation:heal.hpSituation,selfHarmCards:heal.selfHarmCards,healAxis:heal.axisFit,risk,axis:affinity,allowance:allow.total,estimatedTurns:long,total};
 }
 if(a.type==='endTurn')return {total:-5};
 if(a.type==='handChoice')return {total:c?-(c.cost>o.energy?0.25:1)*pick(c,o.deck,axis,w,o).total:0};
 if(a.type==='recover')return {total:c?pick(c,o.deck,axis,w,o).total:1};
 if(a.type==='node'){const t=o.map[a.row].find(n=>n.lane===a.lane).type;return {total:({rest:o.hp/o.maxHp<.75?20:0,elite:o.hp/o.maxHp>.85&&counts(o.deck).frontDamage>=3?5:-12,shop:o.gold>=40?12:-3,event:15,chest:15,unknown:4,mystery:4,fight:5,boss:1})[t]??0}}
 if(a.type==='event'){const e=o.event.choices[a.index];return {total:(e.card?7:0)+(e.max||0)*1.5+(e.gold||0)*.1+(e.hp>0?Math.min(o.maxHp-o.hp,e.hp)*1.5:(e.hp||0)*(o.hp<25?3:.6))-(e.cost||0)*.1}}
 if(a.type==='buyPack'){const p=o.shop.packs[a.index];return {total:p.id===axis?14:p.id==='epic'?8:2}}
 if(a.type==='buyPotion')return {total:o.hp<30?6:1};
 if(a.type==='potion'){const p=o.potions[a.index];if(p.id==='heal')return {total:o.hp<=o.maxHp*.75?30:-100};if(o.mode!=='battle')return {total:-100};return {total:incoming(o)>o.block+tolerance(o).total||o.floor===10?25:-50}}
 if(a.type==='targetPotion')return {total:100-(o.enemies.find(e=>e.index===a.enemy)?.hp||0)};
 return {total:a.type==='packFinish'?-3:0}
 }
 function score(a,o,axis,w=1){return evaluate(a,o,axis,w).total}
 function choose(o,rng,axis,w){const ranked=o.actions.map(a=>({a,score:score(a,o,axis,w)})).sort((a,b)=>b.score-a.score);const best=ranked.filter(x=>Math.abs(x.score-ranked[0].score)<1e-8);return best[Math.floor(rng()*best.length)].a}
 function setOverrides(input={}){overrides={};const traitKeys=['frontDamage','frontBlock','scaling','draw','block','heal','selfHarm'],roleKeys=['attack','defense','draw','heal'];for(const [id,row] of Object.entries(input)){if(!/^\d+$/.test(id)||!row||typeof row!=='object')continue;overrides[id]={};if(Array.isArray(row.axes))overrides[id].axes=axes.filter(a=>row.axes.includes(a));for(const [kind,keys] of [['traits',traitKeys],['roles',roleKeys]])if(row[kind])overrides[id][kind]=Object.fromEntries(keys.map(k=>[k,!!row[kind][k]]));if(Array.isArray(row.keys))overrides[id].keys=axes.filter(a=>row.keys.includes(a));}return overrides}
 function keyCard(c,axis){return overrides[c.origin??c.id]?.keys?overrides[c.origin??c.id].keys.includes(axis):(config.keys[axis]||[]).includes(c.origin??c.id)}

 // Only use the visible erosion total, card marks and current attack intents.
 function chooseForestAction(previous,o,axis,weight){
  const {erosion,marks,atEnd}=o.forest;
  const pending=atEnd?marks.reduce((sum,mark)=>sum+mark,0):0;
  if(!erosion&&!marks.some(Boolean))return previous;
  const attack=incoming(o);
  const damage=Math.max(0,attack-o.block);
  const margin=o.hp-erosion-pending-damage;
  const pressure=margin<=0?5:margin<=10?2.5:1;
  if(atEnd&&previous.type==='handChoice'&&['discard','exhaust'].includes(o.choice?.kind)){
   return o.actions.filter(a=>a.type==='handChoice').reduce((best,next)=>marks[next.index]>marks[best.index]?next:best,previous);
  }
  if(!['play','endTurn','potion'].includes(previous.type))return previous;

  function adjust(action){
   if(action.type==='endTurn'){
    if(erosion+pending>0&&margin<=0)return -140;
    return -pending*(margin<=10?2:0.6);
   }
   if(action.type==='potion'){
    const potion=o.potions[action.index];
    return potion?.id==='heal'&&margin<=0?25:0;
   }
   const card=o.hand[action.index],mark=marks[action.index]||0;
   const block=Math.min(damage,blockEstimate(card,o));
   const hpCost=(card.fx.hpLoss||0)+(card.fx.selfDamage||0);
   const markEffect=atEnd?mark:margin-mark<=10?-mark:0;
   const rescue=margin<=0?(block-hpCost)*0.8:0;
   return markEffect*pressure+rescue;
  }
  const ranked=action=>score(action,o,axis,weight)+adjust(action);
  let best=previous,bestScore=ranked(previous),priorAdjustment=adjust(previous);
  for(const action of o.actions){
   if(!['play','endTurn','potion'].includes(action.type)||adjust(action)<=priorAdjustment)continue;
   const value=ranked(action);
   if(value>bestScore){best=action;bestScore=value;}
  }
  return best;
 }
 globalThis.AI_POLICY={chooseForestAction,setOverrides,keyCard,axes,names,config,tags,roles,pick,build,score,choose,incoming,traits,counts,healing,tolerance,horizon,evaluate,damageEstimate,blockEstimate,poisonTactics};
})();
