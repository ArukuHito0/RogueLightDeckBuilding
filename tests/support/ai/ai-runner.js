// Loaded ONLY in an isolated worker/test VM. Policy receives observations, never S or RNG state.
(function(){
 const clone=x=>JSON.parse(JSON.stringify(x));
 const freeze=x=>{if(x&&typeof x==='object'){Object.freeze(x);Object.values(x).forEach(freeze)}return x};
 function snapshotCard(id){const c=C[id];return {id,name:c.name,cost:c.cost,description:c.desc,rarity:c.rarity,icon:c.icon,runOnly:!!c.runOnly,fx:clone(c.fx)}}
 function shownCard(id){const c=page==='battle'?combatCard(id):C[id];return {id:c.id,name:c.name,cost:c.cost,description:c.desc,rarity:c.rarity,runOnly:!!c.runOnly,retired:!!c.retired,fx:clone(c.fx)}}
 function restDistance(r){const last=r.nodePath?.at(-1);let frontier=last?[r.nodes[last.row]?.[last.lane]].filter(Boolean):r.nodes?.[0]||[];for(let distance=0;frontier.length&&distance<=10;distance++){if(distance>0&&frontier.some(n=>n.type==='rest'))return distance;frontier=[...new Set(frontier.flatMap(n=>n.edges.map(l=>r.nodes[n.row+1]?.[l]).filter(Boolean)))];}return 10}
 function observe(){const r=S.run;if(!r)return freeze({mode:'finished'});const out={mode:r.mode,floor:r.floor,hp:r.hp,maxHp:r.max,gold:r.gold,deck:r.deck.map(shownCard),potions:(r.potions||[]).map(id=>({id,...POTIONS.find(p=>p.id===id)})),actions:[]};
  out.kind=r.kind;out.battleDamage=r.aiBattleDamage||0;out.restDistance=restDistance(r);
  const add=(type,label,extra={})=>out.actions.push({type,label,...extra});
  if(r.mode==='battle'){
   out.turn=r.turn;out.energy=r.energy;out.block=r.block;out.strength=r.str;out.guard=r.agility||0;out.statuses=Object.fromEntries(['str','agility','plate','regen','poison','thorns','burn','rage','thornShield','exhaustEngine','exhaustStrength','poisonDouble','retainBlock','heartbeat','passion','forge','poisonAura','poisonCoat','exhaustStrengthCount'].map(k=>[k,r[k]||0]));out.hand=r.hand.map(shownCard);
   // Piles are inspectable, but draw ORDER is not. Expose only a sorted multiset.
   out.drawPile=[...(r.draw||[])].sort(cardOrder).map(shownCard);out.discard=r.discard.map(shownCard);out.excluded=(r.exhausted||[]).map(shownCard);
   out.enemies=r.enemies.map((e,index)=>({index,boss:!!e.boss,audienceUsed:!!e.audienceUsed,name:e.name,hp:e.hp,maxHp:e.max,block:e.block,poison:e.poison||0,poisonTotal:e.poisonTotal??e.poison??0,strength:e.str||0,plate:e.plate||0,intent:e.intent,attack:enemyAttack(e),hits:e.hits||1,guardAmount:e.guardAmount||0,move:e.move||''}));
   if(r.hunterChoice){
    const choice=r.hunterChoice;
    out.choice={kind:choice.kind,remaining:choice.remaining};
    // Search and evolution dialogs reveal exactly these candidates to the player.
    hunterChoiceCandidates(r).forEach(({id,index})=>add('hunterChoice',C[id].name,{index,cardId:id}));
    return freeze(out);
   }
   if(r.lucky?.choice){
    const choice=r.lucky.choice;
    out.choice={kind:choice.kind,remaining:choice.remaining};
    choice.candidates.forEach(({id},index)=>add('luckyChoice',C[id].name,{index,cardId:id}));
    if(choice.optional)add('luckyFinish','選択を確定');
    if(choice.kind==='top'&&!choice.candidates.length)add('luckyFinish','山札の順番を確定');
    return freeze(out);
   }
   if(r.pendingChoice){const p=r.pendingChoice;out.choice={kind:p.kind,remaining:p.remaining};if(p.kind==='recoverExcluded')p.eligible.forEach((id,index)=>add('recover','除外から '+C[id].name+' を回収',{index,cardId:id}));else r.hand.forEach((id,index)=>add('handChoice',C[id].name+' を'+(p.kind==='exhaust'?'除外':'捨てる'),{index,cardId:id}));return freeze(out)}
   if(r.potionTarget!=null){out.enemies.filter(e=>e.hp>0).forEach(e=>add('targetPotion',e.name+' に消費アイテム',{enemy:e.index}));return freeze(out)}
   r.hand.forEach((id,index)=>{const c=combatCard(id);if(!c||c.retired||c.cost>r.energy||!canPlayHunterCard(c,r))return;if(needsEnemy(c))out.enemies.filter(e=>e.hp>0).forEach(e=>add('play',c.name+' → '+e.name,{index,cardId:id,enemy:e.index}));else add('play',c.name+' を使用',{index,cardId:id})});
   add('endTurn','ターン終了');
  }else if(r.mode==='map'){
   // All map nodes are already visible to players. No encounters or event outcomes are inspected.
   out.map=r.nodes.map(row=>row.map(n=>({row:n.row,lane:n.lane,type:n.type,edges:[...n.edges]})));
   r.nodes.flat().filter(available).forEach(n=>add('node','第'+(n.row+1)+'層 '+n.type,{row:n.row,lane:n.lane}));
  }else if(r.mode==='reward'){
   out.offers=r.rewardCards.map(shownCard);r.rewardCards.filter(id=>runCopies(r,id)<3).forEach(id=>add('reward',C[id].name+' を取得',{cardId:id}));add('reward','カード報酬をスキップ',{cardId:-1});
  }else if(r.mode==='rest'){add('next','休息を終えて進む');
  }else if(r.mode==='mystery'){
   const m=r.mystery,e=mysteries[m.id];out.event={title:e.title,description:e.desc,choices:clone(e.choices)};if(m.resolved){out.event.result=m.result;add('next','イベントを終えて進む')}else e.choices.forEach((c,index)=>{if(!(c.cost>r.gold))add('event',c.label+'：'+c.detail,{index})});
  }else if(r.mode==='chest'){
   out.offers=r.chest.cards.map(shownCard);if(!r.chest.claimed)r.chest.cards.forEach((id,index)=>{if(runCopies(r,id)<3)add('chest',C[id].name+' と宝箱報酬を受取',{index,cardId:id})});add('chest','カードをスキップして宝箱報酬を受取',{index:null});
  }else if(r.mode==='shop'){
   const p=r.shop.packChoice;if(p){out.offers=p.ids.map(shownCard);out.selected=p.selected.map(i=>p.ids[i]);if(p.selected.length<2)p.ids.forEach((id,index)=>{if(!p.selected.includes(index)&&runCopies(r,id)<3)add('packSelect',C[id].name+' を選択',{index,cardId:id})});add('packFinish',p.selected.length?p.selected.length+'枚を受取':'パックをスキップ');return freeze(out)}
   out.shop={packs:r.shop.packs.map(x=>({...RUN_PACKS.find(p=>p.id===x.id),sold:x.sold})),potions:clone(r.shop.potions)};
   r.shop.packs.forEach((p,index)=>{if(canBuyRunPack(r,p))add('buyPack',RUN_PACKS.find(x=>x.id===p.id).name+' を購入',{index})});
   r.shop.potions.forEach((x,index)=>{if(!x.sold&&r.gold>=x.price&&(r.potions?.length||0)<2&&!hasRelic('energy_potions',r))add('buyPotion',POTIONS.find(p=>p.id===x.id).name+' を購入',{index})});add('next','ショップを出る');
  }
  if(['battle','map','reward','rest','mystery','chest','shop'].includes(r.mode)&&!r.pendingChoice)(r.potions||[]).forEach((id,index)=>{const p=POTIONS.find(x=>x.id===id);if(canUsePotion(p)&&!(id==='creation'&&!creationCandidates(r).length))add('potion',p.name+' を使用',{index})});
  return freeze(out)
 }
 function randomPolicy(observation,random){const actions=observation.actions;if(!actions.length)throw Error('合法手がありません: '+observation.mode);return actions[Math.floor(random()*actions.length)]}
 async function execute(a){switch(a.type){case'node':enterNode(a.row,a.lane);break;case'play':if(a.enemy!=null)target=a.enemy;await play(a.index);break;case'endTurn':await endTurn();break;case'hunterChoice':chooseHunterCard(a.index);break;case'luckyChoice':luckyChoose(a.index);break;case'luckyFinish':luckyFinishChoice();break;case'handChoice':chooseHand(a.index);break;case'recover':recoverExcludedCard(a.index);break;case'potion':await usePotion(a.index);break;case'targetPotion':await targetPotion(a.enemy);break;case'reward':take(a.cardId);break;case'event':resolveMystery(a.index);break;case'next':next();break;case'buyPack':buyRunPack(a.index);break;case'buyPotion':buyShopPotion(a.index);break;case'packSelect':togglePackCard(a.index);break;case'packFinish':finishRunPack();break;case'chest':S.run.chest.selected=a.index;claimChest();break;default:throw Error('未対応の行動: '+a.type)}}
 async function run(seed,onProgress=()=>{},options={}){
  if(!globalThis.ASHBOUND_HEADLESS)throw Error('AIは専用の隔離環境でのみ実行できます');
  render=()=>{};save=()=>{};toast=()=>{};animateEntity=async()=>{};clearDrag=()=>{};
  const cfg=AI_TEST_CONFIG,policyRng=makeTestRandom(seed+'/policy');
  S.run=null;S.deck=[...cfg.starterDeck];S.collection=Object.fromEntries(C.filter(c=>!c.runOnly&&!c.retired).map(c=>[c.id,3]));S.relicVault=[];S.relicQueue=[];S.relicReroll=null;S.equippedRelicId=null;S.gold=0;S.packs=0;S.runs=0;S.wins=0;S.history=[];S.last=null;page='home';busy=false;target=0;
  const advanced=AI_POLICY.axes.includes(options.axis),axis=advanced?options.axis:null,weight=Math.max(0,Math.min(5,Number(options.weight??1)));
  AI_POLICY.setOverrides(options.tagOverrides||{});
  const learning=advanced&&options.policy==='rl',training=learning&&!!options.training,model=learning?AI_LEARNING.create(options.model):null;
  const reference=AI_REFERENCE.sanitize(options.reference,C);
  const built=advanced?AI_POLICY.build(C,axis,weight):null;if(built)S.deck=built.deck;
  if(advanced&&options.relic){S.relicVault=[{id:'test-relic',name:'比較用遺物：最初の盾',icon:'◇',effects:['first_block']}];S.equippedRelicId='test-relic'}
  const result={stage:1,policy:'random-legal-v1',seed:String(seed),version:cfg.version,rulesVersion:cfg.rulesVersion,relic:'なし',starterDeck:S.deck.map(id=>({id,name:C[id].name})),outcome:null,floor:0,nodesVisited:0,turns:0,cardsPlayed:0,battles:0,actions:0,log:[]};
  if(advanced)Object.assign(result,{stage:5,axis,policy:learning?'rl':options.policy==='random'?'random':'heuristic',version:AI_POLICY.config.version,relic:options.relic?'最初の盾':'なし',settings:clone(AI_POLICY.config),weight,diagnosticSettings:clone(AI_TUNING),picks:built.picks,completedFloor:null,decisionTurns:[],failure:null});
  result.reference={...reference,version:'multiset-jaccard-v1',cards:reference.deck.map(snapshotCard)};result.completionMethod='reference-v1';result.peakMatch=reference.deck.length?0:null;result.finalMatch=null;result.peakMatchFloor=null;
  function recordMatch(deck,floor){const m=AI_REFERENCE.compare(deck,reference.deck);if(m.configured){if(result.peakMatchFloor===null||m.ratio>(result.peakMatch||0)){result.peakMatch=m.ratio;result.peakMatchFloor=floor}if(result.completedFloor===null&&m.ratio+1e-10>=reference.threshold)result.completedFloor=floor;}return m;}
  result.tagOverrides=clone(options.tagOverrides||{});result.metrics={damage:0,hpLost:0,blocked:0,turnDamage:[],lowHpTurns:0,measuredTurns:0};if(learning)result.learning={training,version:AI_LEARNING.config.version,episodes:model.episodes,epsilon:training?Number(options.epsilon??.15):0,fingerprint:AI_LEARNING.fingerprint(options.tagOverrides),config:clone(AI_LEARNING.config)};
  let turnDamage=0;
  let observedTurn='',offerKey='',lastObs=null,turnPlays={};
  let rejectedActions=new Set();
  function battleProgress(r){
   return JSON.stringify([r.turn,r.hp,r.energy,r.block,r.hand,r.draw,r.discard,r.exhausted,
    r.pendingChoice,r.hunterChoice,r.pendingDiscard,r.potionTarget,r.lucky?.choice,r.lucky?.queue,
    r.enemies.map(e=>[e.hp,e.block,e.poison,e.intent])]);
  }
  let terminal=null;const originalLoseHP=loseHP;loseHP=function(r,n){const lost=originalLoseHP(r,n);result.metrics.hpLost+=lost;return lost};const originalDamage=dealDamage;dealDamage=function(e,n,opts){const r=S.run,absorb=e===r&&!opts?.ignoreBlock?Math.min(Math.max(0,n),r.block||0):0,lost=originalDamage(e,n,opts);if(e!==r){result.metrics.damage+=lost;turnDamage+=lost;}else result.metrics.blocked+=absorb;if(e===r)r.aiBattleDamage=(r.aiBattleDamage||0)+lost;return lost};const originalChoose=choose;choose=function(type){const r=S.run;const was=r?.mode;originalChoose(type);if(r&&r===S.run&&was!=='battle'&&r.mode==='battle')r.aiBattleDamage=0};const originalFinish=finish;finish=function(win,ret=false){terminal={outcome:win?'win':ret?'retired':'loss',floor:S.run.floor,hp:S.run.hp,maxHp:S.run.max,deck:S.run.deck.map(snapshotCard),deckCounts:AI_POLICY.counts(S.run.deck.map(shownCard)),nodesVisited:S.run.nodePath.length};originalFinish(win,ret)};
  try{start();if(!S.run)throw Error('ランを開始できません');let previousBattle=false;
   while(S.run){
    if(result.actions>=cfg.maxActions||result.turns>=cfg.maxTurns){result.outcome='limit';result.note='安全上限に達しました。クリア・敗北には数えません。';break}
    const before=observe();
    if(!before.actions.length)throw Error('実行可能な行動がありません: '+before.mode+'/'+(before.choice?.kind||'通常'));
if(before.mode==='battle'&&!previousBattle){result.battles++;result.turns++}previousBattle=before.mode==='battle';
    const availableActions=before.actions.filter(a=>!rejectedActions.has(JSON.stringify(a)));
    if(!availableActions.length)throw Error('戦闘が進行しません: '+before.mode+'/'+(before.choice?.kind||'通常'));
    const playKey=result.battles+':'+before.turn;if(advanced&&turnPlays.key!==playKey)turnPlays={key:playKey};const decision=advanced?{...before,actions:availableActions.filter(a=>a.type!=='play'||(turnPlays[a.cardId]||0)<6)}:{...before,actions:availableActions};
    let action=learning?AI_LEARNING.choose(model,decision,policyRng,axis,weight,training?Math.max(0,Math.min(1,Number(options.epsilon??.15))):0):advanced&&result.policy==='heuristic'?AI_POLICY.choose(decision,policyRng,axis,weight):randomPolicy(decision,policyRng);lastObs=before;
    if(advanced&&result.policy==='heuristic'&&before.actions[0].type==='hunterChoice'){
     // Score the resulting card for evolution and the chosen card for a search.
     const value=a=>{
      const card=C[a.cardId];
      const id=before.choice.kind==='evolve'?card.evolveTo:before.choice.kind==='devolve'?card.devolveTo:card.id;
      const after=AI_POLICY.pick(C[id],before.deck,axis,weight,before).total;
      return before.choice.kind==='search'?after:after-AI_POLICY.pick(card,before.deck,axis,weight,before).total;
     };
     action=decision.actions.reduce((best,next)=>value(next)>value(best)?next:best);
    }
    if(advanced){
     recordMatch(before.deck,before.floor);
     const turnKey=result.battles+':'+before.turn;if(before.mode==='battle'&&!before.choice&&turnKey!==observedTurn){observedTurn=turnKey;result.metrics.measuredTurns++;if(before.hp/before.maxHp<.3)result.metrics.lowHpTurns++;let combinations=0;const hand=before.hand;for(let mask=1;mask<(1<<hand.length);mask++){let cost=0;for(let j=0;j<hand.length;j++)if(mask&(1<<j))cost+=Math.max(0,hand[j].cost);if(cost<=before.energy)combinations++}const scores=before.actions.filter(a=>a.type==='play').map(a=>(learning?AI_LEARNING.value(model,a,before,axis,weight)*AI_LEARNING.config.scale:AI_POLICY.score(a,before,axis,weight))).sort((a,b)=>b-a);const statuses=Object.values(before.statuses||{}).filter(Boolean).length+['poison','plate','strength','block'].filter(k=>before.enemies.some(e=>e[k])).length;result.decisionTurns.push({battle:result.battles,turn:before.turn,combinations,ambiguous:scores.length>1&&scores[0]-scores[1]<=AI_POLICY.config.ambiguityGap,statuses});}
     if(before.offers){const k=before.floor+':'+before.mode+':'+before.offers.map(c=>c.id).join(',');if(k!==offerKey){offerKey=k;result.picks.push({source:'run',offers:before.offers.map(c=>({id:c.id,name:c.name,score:AI_POLICY.pick(c,before.deck,axis,weight,before)})),selected:[]})}if(action.cardId!=null&&action.cardId>=0&&['reward','chest','packSelect'].includes(action.type))result.picks[result.picks.length-1].selected.push(action.cardId)}else offerKey='';
    }
    if(advanced&&action.type==='play')turnPlays[action.cardId]=(turnPlays[action.cardId]||0)+1;
    const diagnosis=advanced&&before.mode==='battle'?{incoming:AI_POLICY.incoming(before),block:before.block,blockGain:action.type==='play'?AI_POLICY.blockEstimate(before.hand[action.index],before):0,attackAlternatives:before.actions.filter(a=>a.type==='play'&&a.index!==action.index&&before.hand[a.index].cost>before.energy-(action.type==='play'?before.hand[action.index].cost:0)&&AI_POLICY.damageEstimate(before.hand[a.index],before,before.enemies.find(e=>e.index===a.enemy)||before.enemies[0])>0).map(a=>a.label),retainBlock:!!before.statuses?.retainBlock,energy:before.energy,allowance:AI_POLICY.tolerance(before),battleDamage:before.battleDamage,restDistance:before.restDistance,deckCounts:AI_POLICY.counts(before.deck),enemyHp:before.enemies.reduce((s,e)=>s+Math.max(0,e.hp),0),evaluation:AI_POLICY.evaluate(action,before,axis,weight)}:null;
    const r=S.run,oldTurn=r.turn,damageBefore=result.metrics.damage,hpLossBefore=result.metrics.hpLost;
    const previous=before.mode==='battle'?battleProgress(r):null;
    await execute(action);
    if(S.run===r&&r.mode==='battle'&&r.lucky?.queue.length)luckyPump(r);
    if(previous!==null&&S.run===r&&r.mode==='battle'&&previous===battleProgress(r)){
     rejectedActions.add(JSON.stringify(action));
     continue;
    }
    rejectedActions.clear();let hpLoss=result.metrics.hpLost-hpLossBefore;if(before.mode!=='battle'){const untracked=Math.max(0,before.hp-(terminal?.hp??S.run?.hp??before.hp)-hpLoss);result.metrics.hpLost+=untracked;hpLoss+=untracked;}
    if(advanced){const deck=terminal?.deck||S.run?.deck.map(id=>({id}));if(deck)result.finalMatch=recordMatch(deck,terminal?.floor||S.run.floor).ratio;}
    if(training)AI_LEARNING.update(model,decision,action,terminal?null:observe(),AI_LEARNING.reward(before,S.run?{floor:S.run.floor}:null,terminal?.outcome,result.metrics.damage-damageBefore,hpLoss),axis,weight);
    if(before.mode==='battle'&&(action.type==='endTurn'||terminal||S.run?.mode!=='battle')){result.metrics.turnDamage.push(turnDamage);turnDamage=0;}
    if(action.type==='play')result.cardsPlayed++;
    if(action.type==='endTurn'&&S.run===r&&r.mode==='battle'&&r.turn>oldTurn)result.turns++;
    result.actions++;result.floor=terminal?.floor||S.run?.floor||before.floor;result.nodesVisited=terminal?.nodesVisited||S.run?.nodePath?.length||0;
    result.log.push({step:result.actions,floor:before.floor,mode:before.mode,turn:before.mode==='battle'?before.turn:null,hpBefore:before.hp,hpAfter:terminal?.hp??S.run?.hp??before.hp,action:clone(action),diagnosis,hpLost:Math.max(0,(r.aiBattleDamage||0)-(before.battleDamage||0)),legalActions:before.actions.length,after:terminal?.outcome||S.run?.mode||'finished'});
    if(result.actions%50===0)onProgress({actions:result.actions,floor:result.floor,hp:S.run?.hp??terminal?.hp,turns:result.turns});
   }
   if(terminal)Object.assign(result,terminal);else if(!result.outcome){result.outcome='error';result.note='終了状態を確認できませんでした'}
  }catch(error){result.outcome='error';result.note=String(error?.message||error)}finally{loseHP=originalLoseHP;finish=originalFinish;dealDamage=originalDamage;choose=originalChoose}
  if(advanced){const t=AI_POLICY.config.time;result.humanSeconds=result.turns*t.turn+result.cardsPlayed*t.card+result.battles*t.battle;
   result.lossScenes=[];if(result.outcome==='loss'){for(const row of result.log){const d=row.diagnosis;if(!d)continue;if(row.hpLost>d.allowance.total)result.lossScenes.push({kind:'許容以上の被ダメージ',step:row.step,floor:row.floor,turn:row.turn,hpBefore:row.hpBefore,hpAfter:row.hpAfter,damage:row.hpLost,allowance:d.allowance.total,block:d.block,enemyHp:d.enemyHp,action:row.action.label});if(row.action.type==='play'&&!d.retainBlock&&d.blockGain-Math.max(0,d.incoming-d.block)>=4&&d.attackAlternatives.length>0&&d.evaluation.damage===0&&d.evaluation.scaling===0&&d.evaluation.sequence<=0&&row.turn>=3)result.lossScenes.push({kind:'過剰防御の候補',step:row.step,floor:row.floor,turn:row.turn,block:d.block,blockGain:d.blockGain,alternatives:d.attackAlternatives,incoming:d.incoming,enemyHp:d.enemyHp,action:row.action.label})}
   const o=lastObs,inc=AI_POLICY.incoming(o);result.failure=o.mode!=='battle'?'HP枯渇（イベント等）':o.hp<12?'HP枯渇（回復不足）':o.floor===10&&inc>o.maxHp*.35?'ボスの高威力攻撃':result.decisionTurns.at(-1)?.combinations===0?'手札・エナジー事故':o.turn>=7?'火力不足':reference.deck.length&&result.completedFloor===null?'ビルド未完成':'防御不足'}
  }
  let hash=2166136261;for(const ch of JSON.stringify({outcome:result.outcome,log:result.log})){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619)}result.traceHash=(hash>>>0).toString(16).padStart(8,'0');
  if(learning){if(training&&['win','loss'].includes(result.outcome))model.episodes++;result.learnedModel=model;}
  return result
 }
 globalThis.AI_STAGE1={observe,randomPolicy,execute,run};
})();
