const balanceScriptedEffects = {
  lucky: {
    hit: {baseDamage:[7,'スロットに関係なく与えるダメージ']},
    stand: {successBlock:[8,'スロット成功時の追加ブロック']},
    streakAttack: {hitDamage:[9,'成功時の1ヒットあたりダメージ']},
    streakBlock: {matchBlock:[7,'一致1枚あたりのブロック']},
    jackpot: {slotDamage:[10,'スロット1回あたりのダメージ']},
    free: {freeSlots:[1,'コストを0にするスロット回数']},
    retry: {retries:[1,'スロット再挑戦回数']},
    double: {repeats:[2,'成功効果の発動回数'], penalty:[1,'失敗時に失うエナジー']},
    doubleDown: {energyMultiplier:[2,'エナジー倍率']},
    pickup: {recoverCount:[1,'捨札から回収する枚数']},
    swap: {returnCount:[3,'山札の上に戻す枚数']},
    deal: {topCount:[5,'山札の上から見る枚数']},
    trick: {returnCount:[2,'山札の上に戻す枚数']},
    hold: {retainCount:[2,'手札に保持する枚数']},
    role_five: {autoCount:[5,'自動使用する0コストカードの枚数']},
    royal: {pokerDamage:[7,'役成立時に敵全体へ与えるダメージ']},
    master: {pokerEnergy:[1,'役成立時のエナジー'], pokerStrength:[1,'役成立時の筋力']},
    mental: {failBlock:[5,'スロット失敗時のブロック']},
    tension: {successStrength:[1,'スロット成功時の筋力']},
    throw: {foldBlock:[4,'フォールド時のブロック']},
    custom: {drawPenalty:[1,'ターン開始時のドロー減少枚数'], revealBonus:[2,'スロット公開枚数の増加']},
    startup: {extraDraw:[2,'ターン開始時の追加ドロー枚数'], exhaustCount:[1,'ターン開始時の除外枚数']},
    force: {drawThreshold:[4,'筋力発動に必要なドロー枚数'], drawStrength:[1,'ドローで得る筋力']},
  },
  junk: {miasma: {turnDamage:[3,'ターン終了時のダメージ']}},
};
function balanceScriptedNumber(cardId, key, fallback) {
  return balanceActive?.cardEffects[cardId + ':script.' + key] ?? fallback;
}

const balanceCardConditions = {
  strBonus:['strBonusThreshold',4,'追加効果に必要な筋力',0],
  strRegen:['strRegenThreshold',4,'再生に必要な筋力',0],
  blockRegen:['blockRegenThreshold',15,'再生に必要なブロック',0],
  heartbeat:['heartbeatThreshold',4,'還元に必要な消費エナジー',1],
  exhaustBlock:['exhaustBlockInterval',2,'ブロック増加に必要な除外枚数',1],
  exhaustStrength:['exhaustStrengthInterval',3,'筋力増加に必要な除外枚数',1],
  vulnerableBleed:['vulnerableBleedInterval',2,'裂傷付与に必要な脆弱の単位',1],
  vulnerableDraw:['vulnerableDrawInterval',2,'ドローに必要な脆弱の単位',1],
  blockVulnerable:['blockVulnerableInterval',10,'脆弱付与に必要な敵ブロックの単位',1],
};

const balanceEffectLabels = {
  autoEvolvePlay:'自動使用する進化可能カードの枚数', beastHunt:'毎ターンのHP消費・裂傷量',
  bloodBlessing:'HP喪失時の回復量', engine:'除外時の追加ドロー枚数', sacrifice:'ランダムに除外する枚数',
  equalPoison:'対象の毒参照倍率', totalPoison:'敵全体の毒参照倍率', reinfect:'蓄積毒の再付与倍率',
  passionHp:'ターン開始時のHP消費', strMultiplier:'筋力倍率', poisonTicks:'毒の発動回数',
  heartbeatRefund:'エナジーの還元量', poisonDraw:'毒対象でのドロー枚数',
  d:'ダメージ', b:'ブロック', h:'ヒット回数', p:'毒', s:'筋力', heal:'HP回復',
  draw:'ドロー枚数', energy:'エナジー', bleed:'裂傷', vulnerable:'脆弱', agility:'敏捷',
  plate:'プレート', thorns:'棘', selfBleed:'自身への裂傷', selfPoison:'自身への毒',
  selfWeak:'自身への脱力', enemyStrength:'敵の筋力', enemyTempStrength:'敵の一時筋力低下',
  chooseExhaust:'除外枚数', discard:'捨てる枚数', copyDiscard:'捨札の複製枚数',
  recover:'回収枚数', recoverExcluded:'除外から回収する枚数', hpLoss:'HP消費',
  nextAttack:'次の攻撃の追加ダメージ', nextBlock:'次ターンのブロック',
  blockScale:'ブロック参照倍率', exactBlock:'現在ブロック参照倍率',
  strengthBlock:'筋力参照倍率', strScale:'筋力加算倍率', strRegen:'再生の基礎値',
  damageReduction:'被ダメージ軽減率', lowHpOnly:'使用可能なHP割合',
  territory:'脆弱の追加倍率', burn:'ブロック獲得時のダメージ', rage:'攻撃時のブロック',
  bleedAmount:'ランダム付与1回の裂傷', randomBleed:'ランダム裂傷の回数',
  bleedBonus:'裂傷付与の加算値', bleedCounter:'反撃の裂傷', bleedDraw:'裂傷対象でのドロー枚数',
  bleedHits:'裂傷対象への追加ヒット回数', bleedRepeat:'裂傷の追加発動回数',
  extraBleed:'裂傷対象への追加裂傷', xBleed:'Xに加える裂傷',
  allVulnerableDamage:'敵全体の脆弱参照倍率', vulnerableDamage:'脆弱参照ダメージ倍率',
  vulnerableBleed:'脆弱参照の裂傷量', vulnerableBlock:'脆弱対象での追加ブロック',
  vulnerableDraw:'脆弱参照のドロー枚数', vulnerableHits:'脆弱対象への追加ヒット回数',
  vulnerableStrength:'脆弱参照の筋力', blockVulnerable:'敵のブロック参照の脆弱量',
  evolutionBlock:'進化時のブロック', evolutionDamage:'進化回数ごとのダメージ',
  evolutionStrength:'進化で得る筋力', evolutionDiscount:'進化カードのコスト軽減',
  evolveDeck:'デッキから進化させる枚数', evolveHand:'手札から進化させる枚数',
  devolveHand:'退化させる枚数', evolveStages:'進化段階数', evolvedDamage:'進化カード参照ダメージ倍率',
  evolvedBlock:'進化カード参照ブロック倍率', exScale:'除外枚数参照倍率',
  exhaustDraw:'除外時のドロー枚数', exhaustBlock:'除外枚数参照ブロック倍率',
  exhaustStrength:'除外時の筋力', searchDraw:'山札から選ぶ枚数',
  searchEvolvable:'進化可能カードを選ぶ枚数', slot:'スロットに必要な一致枚数',
  randomStatus:'ランダム状態異常の量', poisonAura:'ターン開始時の毒',
  poisonCoat:'攻撃時の毒', poisonBlock:'毒参照ブロック倍率',
  tracking:'脆弱付与時のドロー枚数', thornShield:'ブロック時の棘',
  tokenKnife:'生成するナイフの枚数', tokenSword:'生成する剣の枚数',
};
const balanceSwitchEffects = new Set([
  'all','bleedHitCount','discardBreak',
  'doubleStr','doubleVulnerable','evolutionEnergy','evolveAll','ex',
  'fold','forge','healOnHpDamage','heartbeat','lossAfterBlock','passion','poisonDouble',
  'randomAttack','randomOne','retainBlock','revenge','stun','stunAttack',
  'temporary','temporaryBleed','unplayable','xHits',
]);

function balanceCardEffects(card) {
  const fx = {...card.fx};
  if (!fx.luckyKey && !fx.xHits && !fx.bleedHitCount && (fx.d != null || fx.totalPoison || fx.equalPoison || fx.exactBlock)) fx.h ??= 1;
  if (fx.heartbeat) fx.heartbeatRefund ??= 1;
  if (fx.passion) fx.passionHp ??= 1;
  if (fx.poisonDouble) fx.poisonTicks ??= 2;
  if (fx.doubleStr) fx.strMultiplier ??= 2;
  const fields = Object.entries(fx).filter(([key, value]) =>
    Number.isFinite(value) && !balanceSwitchEffects.has(key)
  ).map(([key, value]) => ({
    id: card.id + ':' + key,
    key, implicit: !Object.hasOwn(card.fx ?? {}, key), label: balanceEffectLabels[key] ?? key, value,
    min: value < 0 ? -99 : ['h','slot','lowHpOnly','heartbeatRefund','passionHp','poisonTicks','strMultiplier','evolveStages'].includes(key) ? (key === 'lowHpOnly' ? 0.01 : 1) : 0,
    max: key === 'lowHpOnly' || key === 'damageReduction' ? 1 : 99,
    step: ['blockScale','damageReduction','lowHpOnly','territory'].includes(key) ? 0.01 : 1,
  }));
  for (const [trigger, [key, value, label, min]] of Object.entries(balanceCardConditions)) {
    if (fx[trigger]) fields.push({id:card.id+':'+key,key,label,value,min,max:999,step:1,implicit:true});
  }
  const luckyReference = {
    drawAttack:[['drawDamageFactor',1,'ドロー1枚あたりの追加ダメージ',0]],
    streakAttack:[['slotMaximum',5,'連続成功時のスロット上限',1]],
    streakBlock:[['slotMaximum',5,'連続成功時のスロット上限',1]],
  };
  for (const [key,value,label,min] of luckyReference[fx.luckyKey] ?? []) {
    fields.push({id:card.id+':'+key,key,value,label,min,max:key==='slotMaximum'?20:99,step:1,implicit:true});
  }
  const scripted = balanceScriptedEffects.lucky[card.fx?.luckyKey] ?? balanceScriptedEffects.junk[card.act6Junk] ?? {};
  for (const [key, [value, label]] of Object.entries(scripted)) {
    fields.push({id: card.id + ':script.' + key, label, value,
      min: ['drawThreshold','repeats','energyMultiplier'].includes(key) ? 1 : 0, max: 99, step: 1});
  }
  return fields;
}

// ACT1 HP starts at these base values before floor scaling.
const balanceActOneEnemies = {
  ash: ['灰かぶり', 18], shade: ['迷い影', 16], soldier: ['廃都の重兵', 34],
  hunter: ['双刃の狩人', 26], priest: ['灰火の祈祷師', 29],
  ravager: ['血熱の破壊者', 92], plated: ['岩殻の番人', 30], trio: ['三連の守衛', 30],
  boss: ['灰冠の王', 250],
};
const balanceEnemyTables = [balanceActOneEnemies, SNOW_FOES, DESERT_FOES, FOREST_FOES, ARCHIVE_FOES, SWAMP_FOES, GOLD_FOES];
const balanceEnemyId = (act, key) => act === 7 ? key : act + ':' + key;

const balanceEnemyKinds = [
  {elite:['ravager','plated','trio'],boss:['boss']},
  {elite:['hand','breaker','storm','giant'],boss:['ice','corpseDragon']},
  {elite:['shrimp','squid','whale'],boss:['mother']},
  {elite:['deer','colony','attackBranch','guardBranch','queen','seed','larva'],boss:['root','bloom','tree']},
  {elite:['sage','white','black','keeper'],boss:['boss']},
  {elite:['giant','flower','beast'],boss:['boss']},
  {elite:['captain','tax','collector'],boss:['donorA','donorB','lord']},
];
function balanceEnemyKind(act, key) {
  const {elite,boss} = balanceEnemyKinds[act-1];
  return boss.includes(key) ? 'boss' : elite.includes(key) ? 'elite' : 'normal';
}
const balanceNamedAbilities = [
  {ravager:[['激昂','毎ターン攻撃力が上がり、5ターン目から連撃に変わる。攻撃力とヒット回数は「激昂の一撃・暴走連撃」で調整する。']]},
  {hand:[['分裂','死亡時に悪魔の指を召喚する。']],
    storm:[['吹雪','攻撃でプレイヤーのHPを減らすと凍結を付与する。']],
    giant:[['凍気','プレイヤーの凍結を参照して筋力を得る。']],
    ice:[['凍鱗','ターン開始時、プレイヤーの凍結を参照してブロックを得る。'],['屍竜の庇護','屍竜が生存中、プレイヤーの呪いを参照して守護を得る。']],
    corpseDragon:[['屍噛','攻撃でプレイヤーのHPを減らすと呪いを付与する。'],['氷竜の恩寵','氷竜が生存中、プレイヤーの凍結を参照して筋力を得る。']]},
  {crab:[['鉄壁','ターン開始時にブロックを失わない。']],snake:[['砂風','戦闘開始時に砂塵を付与する。']],
    shrimp:[['ばね力','攻撃を受けると、そのターン中の筋力を得る。']],squid:[['渦潮','激流の量を参照して追加ダメージを与える。']],
    whale:[['砂の噴出','砂塵でプレイヤーがカードを捨てるたびに筋力を得る。']],
    mother:[['新たなる生命','死亡時にハハナルタツの子が出現する。'],['成長する生命','ターン終了時に成長カウントと筋力を得る。']],
    child:[['誕生','親の成長カウントに応じて最大HPを得る。'],['産声','親の成長カウントに応じて激流を付与する。']]},
  {tree:[['永花','強化行動で芽吹きを消費しない。']],colony:[['つながる根','枝が攻撃の1ヒットで失ったHPの半分を群体も失う。']],deer:[['花殻の崩落','大技の開始時の芽吹きで次の防御が変化する。']],queen:[['寄生孵化','寄生付きカードの使用で種嚢の孵化を早める。']]},
  {eater:[['追憶','回復行動のたびに回復量が増える。増加量は回復行動で調整する。']],
    sage:[['追憶','4番目の攻撃後に筋力を得る。獲得量は該当する行動で調整する。']],
    boss:[['追憶','5番目の行動で筋力を得る。獲得量は該当する行動で調整する。'],['記録の召喚','読解と空き枠に応じて敵を召喚する。召喚敵を倒すと番人がHPを失う。']]},
  {flower:[['胞子追撃','ターン終了時の手札の毒胞子を参照して、次の攻撃のダメージが増える。']],
    boss:[['花弁鱗','花弁鱗がダメージを受け、破壊されるとスタンする。'],['開花','スタン後に開花し、被ダメージが増えて妨害を生成する。']]},
  {blood:[['血の徴収','攻撃で減らした実HPを貯蔵血として保持する。']],
    tax:[['血の徴収','攻撃で減らした実HPを貯蔵血として保持する。'],['瀉血','貯蔵血を参照して筋力を得る。']],
    goblin:[['盗んだ灯','保持エナジーを参照して筋力を得る。']],
    collector:[['燐光','同じターン内に受けた実HPダメージに応じて保持エナジーを返す。']],
    mint:[['資金供給','ゴールドを生成して味方へ供給する。供給量は該当する行動で調整する。']],
    donorA:[['資金供給','黄金卿へ交互にゴールドを供給する。供給量は該当する行動で調整する。']],
    donorB:[['資金供給','黄金卿へ交互にゴールドを供給する。供給量は該当する行動で調整する。']],
    lord:[['血の徴収','攻撃で減らした実HPを貯蔵血として保持する。'],['黄金の献納者','献納者から交互にゴールドを受け取る。']]},
];
function balanceEnemyRows() {
  return balanceEnemyTables.flatMap((table, index) => Object.entries(table).map(([key, definition]) => {
    const act = index + 1;
    const value = act === 2 || act === 3 ? definition[2] : definition[1];
    return {id: balanceEnemyId(act, key), name:definition[0], value, act, kind:balanceEnemyKind(act,key), abilities:balanceNamedAbilities[act-1][key] ?? []};
  }));
}

const balanceEnemyActionLabels = {
  triggerHp:'発動HP', stunTurns:'スタンのターン数', initialBlock:'初期ブロック',
  d:'ダメージ', b:'ブロック', h:'ヒット回数', s:'筋力', heal:'回復', healAll:'全体回復',
  weak:'脱力', vulnerable:'脆弱', poison:'毒', curse:'呪い', curseUp:'呪いの増加', armor:'甲撃', freezeUp:'凍結の増加', torrentUp:'奔流の増加', readingHits:'読解時のヒット回数', freeze:'凍結', sand:'飛砂', torrent:'奔流',
  mark:'寄生を刻む枚数', erosionAttack:'浸食2ごとの追加ダメージ', erosionCap:'浸食による追加ダメージ上限', collapseAt:'崩落する芽吹きの上限', hatch:'孵化に必要な進行', budAttack:'芽吹き1ごとのダメージ', budBlock:'芽吹き1ごとのブロック', budErosion:'芽吹き1ごとの浸食', erosionHeal:'HPを1回復するための浸食', agility:'守護', bud:'芽吹き', budD:'芽吹き1ごとの追加ダメージ', budHeal:'蕾消費時の追加回復', hostsBud:'宿主への蕾',
  support:'味方への筋力', readingStrength:'読解時の筋力', growHeal:'回復量の増加', n:'付与・追加枚数',
  steal:'奪うゴールド', cost:'消費ゴールド', allyBlock:'味方へのブロック', supply:'供給ゴールド',
  energySteal:'奪うエナジー', energyBlock:'保持エナジー参照ブロック倍率', energyAttack:'保持エナジー参照ダメージ倍率',
  bloodAttack:'ダメージに使う貯蔵血', bloodBlock:'ブロックに使う貯蔵血',
};
const balanceActOneActionNames = {
  ash:['攻撃','身を守る'], shade:['攻撃','隠れる'], soldier:['重撃','盾構え'],
  hunter:['双刃','猛襲'], priest:['灰火','祈りの守り'], ravager:['激昂の一撃・暴走連撃'],
  plated:['殻の一撃','重殻撃','三連爪','甲羅の再生'],
  trio:['斬撃','防御','強打'],
  boss:['王の一撃','王の追撃','王の重撃','王の守り','王の強襲','灰の三連撃','灰の四連撃','灰の五連撃','謁見'],
};
function balanceEnemySection(act, enemy, phase, record) {
  if (act===1 && enemy==='boss' && phase===9) {
    return {category:'ability', title:'謁見',
      description:'HPが発動値以下になると一度だけ、自身のバフ・デバフとブロックを解除し、筋力を得る。スタンが明けると王の強襲を行う。'};
  }
  if (act===1 && enemy==='plated' && phase==='passive') {
    return {category:'ability', title:'堅牢な甲羅',
      description:'戦闘開始時にブロックを得る。ターン開始時にブロックを失わない。'};
  }
  const numericLabels = Object.entries(record).filter(([key,value]) => key!=='h' && Number.isInteger(value))
    .map(([key]) => key==='d' ? '攻撃' : balanceEnemyActionLabels[key] ?? key);
  const named = record.wait ? '待機' : record.revive ? '再生' : record.summon ? '召喚' : record.reading ? '読解' : record.growJunk ? '妨害の強化' : '';
  const title = (act===1 && balanceActOneActionNames[enemy]?.[phase-1]) || [...new Set(numericLabels)].join('・') || named || '能力行動';
  return {category:'action', title, description:typeof phase==='string'?'相方撃破後の単独行動。':''};
}
const balanceEnemyActionBindings = new Map();
const balanceEnemySections = new Map();
function balanceEnemyActionRows() {
  const rows = [];
  function add(act, enemy, phase, record, path='', section=balanceEnemySection(act,enemy,phase,record)) {
    const enemyId=balanceEnemyId(act,enemy);
    if (!path) {
      if(!balanceEnemySections.has(enemyId)) balanceEnemySections.set(enemyId,[]);
      balanceEnemySections.get(enemyId).push({phase,section});
    }
    for (const [key, value] of Object.entries(record)) {
      if (Number.isSafeInteger(value)) {
        const id = act+':'+enemy+':'+phase+':'+path+key;
        const name = balanceEnemyTables[act-1][enemy][0];
        const label = section.title==='謁見' && key==='s' ? '得る筋力' : balanceEnemyActionLabels[key] ?? key;
        const fieldLabel=(path?'代替時の':'')+label;
        rows.push({id,name,act,kind:balanceEnemyKind(act,enemy),value,min:['h','readingHits'].includes(key)?1:0,max:key==='stunTurns'?20:['h','readingHits','n'].includes(key)?99:9999,
          enemyId:balanceEnemyId(act,enemy), phase, section, label:fieldLabel,
          detail:section.title+' · '+fieldLabel});
        balanceEnemyActionBindings.set(id, {record,key,value});
      } else if (key === 'fallback' && value) add(act,enemy,phase,value,'fallback.',section);
    }
  }
  for (const [enemy, actions] of Object.entries(BALANCE_ACT1_ACTIONS)) {
    actions.forEach((action,index) => add(1,enemy,index+1,action));
  }
  for (const [enemy,passive] of Object.entries(BALANCE_ACT1_PASSIVES)) add(1,enemy,'passive',passive);
  for (let act=2; act<=7; act++) {
    const column = [2,3,7].includes(act) ? 3 : 2;
    for (const [enemy,entry] of Object.entries(balanceEnemyTables[act-1])) {
      (entry[column] ?? []).forEach((action,index) => add(act,enemy,index+1,action));
    }
  }
  for (const [enemy,actions] of Object.entries(SOLO_DRAGON_ACTIONS)) {
    actions.forEach((action,index)=>add(2,enemy,'単独 '+(index+1),action));
  }
  return rows;
}

const balanceEncounterPools = {
  1:BALANCE_NORMAL_1, 2:BALANCE_NORMAL_2, 3:BALANCE_NORMAL_3, 4:BALANCE_NORMAL_4, 5:BALANCE_NORMAL_5,
  6:{standard:[...SWAMP_NORMAL.map(key=>[key]),...SWAMP_PAIRS]},
  7:{standard:[...GOLD_NORMAL.map(key=>[key]),...GOLD_PAIRS]},
};
function balanceEncounterId(act, keys) {
  return (act === 7 ? '' : act+':')+keys.join('+');
}
function balanceEncounterRows(group) {
  return Object.entries(balanceEncounterPools).flatMap(([actKey, pools]) => {
    const act = Number(actKey);
    return Object.entries(pools).flatMap(([phase, entries]) => entries
      .filter(keys => (keys.length === 1) === (group === 'solo'))
      .map(keys => ({
        id:balanceEncounterId(act,keys), act, phase, value:1,
        name:keys.map(key=>balanceEnemyTables[act-1][key.split('@')[0]][0]).join(' ＋ '),
        detail:phase==='early'?'序盤候補':phase==='late'?'後半候補':'',
      })));
  });
}
function balanceEncounterWeightGroups(catalog) {
  const groups = {};
  for (const key of ['solo','pairs']) for (const row of catalog[key]) {
    // ACT2 draws its early solo and group encounters from one pool.
    const id = row.act+':'+row.phase+':'+(row.act===2&&row.phase==='early'?'mixed':key);
    (groups[id]??=[]).push({key,...row});
  }
  return Object.values(groups);
}

// Generated copies use temporary combat IDs. Balance settings target their definitions.
const balanceTokenSources = new Map(Object.entries(TOKEN_DEFS).map(([key,source])=>['token:'+key,source]));
function balanceCatalog() {
  const potentialOwners = new Map();
  for (const character of Object.values(CHARACTERS)) {
    for (const card of codexPool(character.id)) potentialOwners.set(card.id, character.name);
  }
  const enemyActions = balanceEnemyActionRows();
  const cards = C.filter(card => card && !card.retired && Number.isSafeInteger(card.id) && card.id >= 0)
    .sort((a,b)=>Number(a.rarity==='token')-Number(b.rarity==='token')||cardOrder(a.id,b.id));
  for (const [id,source] of balanceTokenSources) cards.push({...source,id,token:true,runOnly:true,rarity:'token'});
  return {
    cards: cards.map(card => ({
      basic: !card.runOnly,
      id: String(card.id), name: card.name, value: card.xCost ? null : card.cost, detail: card.desc,
      effects: balanceCardEffects(card),
      art: card.icon,
      previewType: (card.role ? ['トークン', '役'] : cardCategories(card).filter(type => !card.evolution || type !== '進化')).join('・'),
      latent: !!card.runOnly && !card.token,
      evolution: !!card.evolution,
      role: !!card.role,
      unplayable: !!card.fx?.unplayable,
      potentialOwner: potentialOwners.get(card.id) ?? '',
      keywords: codexKeywords(card),
      types: codexTypes(card),
      rarity: card.rarity,
    })),
    enemyHp: balanceEnemyRows().map(row=>({...row,sections:balanceEnemySections.get(row.id)??[]})),
    enemyActions,
    solo: balanceEncounterRows('solo'),
    pairs: balanceEncounterRows('pairs'),
  };
}

const balanceDefaults = balanceCatalog();
const balanceWeightGroups = balanceEncounterWeightGroups(balanceDefaults);
const balanceEffectFields = new Map(balanceDefaults.cards.flatMap(row => row.effects.map(field => [field.id, field])));
function balanceNumberValid(field, value) {
  return !!field && Number.isFinite(value) && value >= field.min && value <= field.max &&
    (field.step !== 1 || Number.isSafeInteger(value));
}
const balanceLimits = {cards: [0, 99], enemyHp: [1, 99999], enemyActions:[0,9999], solo: [0, 10000], pairs: [0, 10000]};
// 保存済みの調整値を受理し、廃止した項目は現行の戦闘に適用しない。
const balanceLegacyAct4Fields = {"enemyActions":{"4:flower:1:bud":[0,9999,1],"4:flower:2:healAll":[0,9999,1],"4:flower:2:budHeal":[0,9999,1],"4:flower:3:d":[0,9999,1],"4:deer:4:s":[0,9999,1],"4:colony:2:b":[0,9999,1],"4:colony:3:d":[0,9999,1],"4:branch:1:d":[0,9999,1],"4:queen:1:bud":[0,9999,1],"4:queen:2:h":[1,99,1],"4:tree:1:hostsBud":[0,9999,1],"4:tree:3:d":[0,9999,1],"4:tree:3:h":[1,99,1],"4:root:2:d":[0,9999,1],"4:root:2:budD":[0,9999,1],"4:bloom:3:budHeal":[0,9999,1]},"enemyHp":{"4:branch":[1,99999,1]},"pairs":{"4:beetle+ape":[0,10000,1]}};
function balanceValidate(input) {
  if (input?.version !== 1) throw Error('設定の形式を確認してください。');
  const settings = {version: 1};
  for (const [group, rows] of Object.entries(balanceDefaults)) {
    const values = input[group] ?? (group === 'enemyActions' ? {} : undefined);
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw Error('設定項目が不足しています。');
    const [min, max] = balanceLimits[group];
    const fields = new Map(rows.map(row => [row.id,row]));
    settings[group] = {};
    for (const [id, value] of Object.entries(values)) {
      if (group === 'cards' && C[id]?.retired) continue;
      if (group === 'cards' && C[id]?.xCost) throw Error('Xコストは固定値に変更できません。');
      const row = fields.get(id);
      const legacy = balanceLegacyAct4Fields[group]?.[id];
      if (!row && legacy && Number.isSafeInteger(value) && value >= legacy[0] && value <= legacy[1]) continue;
      if (!row || !Number.isSafeInteger(value) || value < (row.min ?? min) || value > (row.max ?? max)) {
        throw Error('設定に無効なIDまたは数値があります。');
      }
      settings[group][id] = value;
    }
  }
  // 旧編成だけを有効にしていた設定では、現行のACT4後半プールを既定値に戻す。
  if (input.pairs?.['4:beetle+ape'] > 0) {
    const late = balanceDefaults.pairs.filter(row=>row.act===4&&row.phase==='late');
    if (late.every(row=>settings.pairs[row.id]===0)) {
      for (const row of late) delete settings.pairs[row.id];
    }
  }
  if (balanceWeightGroups.some(rows => rows.every(row => (settings[row.key][row.id] ?? row.value) === 0))) {
    throw Error('同じ遭遇枠の重みをすべて0にはできません。');
  }
  const effectValues = input.cardEffects === undefined ? {} : input.cardEffects;
  if (!effectValues || typeof effectValues !== 'object' || Array.isArray(effectValues)) throw Error('カード効果の形式を確認してください。');
  settings.cardEffects = {};
  for (const [id, value] of Object.entries(effectValues)) {
    if (!balanceNumberValid(balanceEffectFields.get(id), value)) throw Error('カード効果に無効な項目または数値があります。');
    settings.cardEffects[id] = value;
  }
  return settings;
}

// Bind displayed numbers only to effect phrases whose original value matches.
const balanceDescriptionPatterns = {
  d: /\d+(?=ダメージ)/g,
  b: /\d+(?=ブロック)|(?<=ブロック)\d+/g,
  p: /(?<=毒を?)\d+(?=付与)/g,
  h: /(?<=ダメージを)\d+(?=回)/g,
  slot: /(?<=スロット)\d+/g,
  draw: /\d+(?=枚引く)/g,
  exhaustDraw: /\d+(?=枚引く)/g,
  chooseExhaust: /\d+(?=枚(?:選び|選んで)?除外)/g,
  hpLoss: /(?<=HPを)\d+(?=失う|消費)/g,
  heal: /(?<=HPを?)\d+(?=回復)/g,
  energy: /(?<=エナジー(?:\+|を))\d+/g,
  s: /(?<=筋力(?:\+|を))-?\d+/g,
  agility: /(?<=敏捷(?:\+|を))-?\d+/g,
  bleed: /(?<=裂傷を?)\d+(?=付与)/g,
  vulnerable: /(?<=脆弱を?)\d+(?=付与)/g,
  discard: /\d+(?=枚捨てる)/g,
  strBonusThreshold: /(?<=筋力(?:が)?)\d+(?=以上)/g,
  strRegenThreshold: /(?<=筋力(?:が)?)\d+(?=以上)/g,
  blockRegenThreshold: /(?<=ブロック(?:値)?(?:が)?)\d+(?=以上)/g,
  heartbeatThreshold: /(?<=エナジーを)\d+(?=消費)/g,
  exhaustBlockInterval: /\d+(?=枚につき)/g,
  exhaustStrengthInterval: /\d+(?=枚除外するたび)/g,
  vulnerableBleedInterval: /(?<=脆弱(?:が)?)\d+(?=につき)/g,
  vulnerableDrawInterval: /(?<=脆弱(?:が)?)\d+(?=につき)/g,
  blockVulnerableInterval: /(?<=ブロック)\d+(?=につき)/g,
  slotMaximum: /(?<=最大)\d+/g,
  drawDamageFactor: /(?<=追加で)\d+(?=ダメージ)/g,
  lowHpOnly: /\d+(?=%以下)/g,
};

const balanceDescriptionNotes = new Map();
function balanceCardDescription({id, effects, detail}, overrides) {
  const bindings = new Map();
  const notes = [];
  for (const field of effects) {
    const value = overrides[field.id];
    if (value === undefined || value === field.value) continue;
    const pattern = balanceDescriptionPatterns[field.key];
    const scale = field.key==='lowHpOnly' ? 100 : 1;
    const matches = pattern ? [...detail.matchAll(pattern)].filter(match => Number(match[0]) === Math.round(field.value*scale*100)/100) : [];
    if (matches.length === 1) {
      const match = matches[0];
      const candidates = bindings.get(match.index) ?? [];
      candidates.push({field, value:Math.round(value*scale*100)/100, length:match[0].length});
      bindings.set(match.index, candidates);
    } else {
      notes.push(field.label + ' ' + field.value + ' → ' + value);
    }
  }
  let description = detail;
  for (const [index, candidates] of [...bindings].sort(([a], [b]) => b - a)) {
    if (candidates.length === 1) {
      const {value, length} = candidates[0];
      description = description.slice(0, index) + value + description.slice(index + length);
    } else {
      for (const {field, value} of candidates) notes.push(field.label + ' ' + field.value + ' → ' + value);
    }
  }
  const note = notes.length ? ' 【調整後：' + notes.join('／') + '】' : '';
  balanceDescriptionNotes.set(String(id), note);
  return description + note;
}

const balanceCombatDesc = combatDesc;
combatDesc = function (card, run) {
  const description = balanceCombatDesc(card, run);
  const note = balanceDescriptionNotes.get(String(card.origin ?? card.id));
  return note && !description.includes('【調整後：') ? description + note : description;
};

let balanceActive;
function balanceApply(input) {
  balanceActive = balanceValidate(input);
  for (const row of balanceDefaults.cards) {
    const {id, value, effects} = row;
    const card = balanceTokenSources.get(id) ?? C[id];
    if (value !== null) card.cost = balanceActive.cards[id] ?? value;
    for (const field of effects) {
      if (!field.key) continue;
      const value = balanceActive.cardEffects[field.id];
      if (field.implicit && value === undefined) delete card.fx[field.key];
      else card.fx[field.key] = value ?? field.value;
    }
    card.desc = balanceCardDescription(row, balanceActive.cardEffects);
  }
  for (const [id, {record,key,value}] of balanceEnemyActionBindings) {
    record[key] = balanceActive.enemyActions[id] ?? value;
  }
}

function balanceAdjustedEnemy(act, key, foe) {
  const override = balanceActive?.enemyHp[balanceEnemyId(act, key)];
  if (override === undefined) return foe;
  const definition = balanceEnemyTables[act - 1][key];
  const original = act === 2 || act === 3 ? definition[2] : definition[1];
  const max = Math.max(1, foe.max + override - original);
  foe.hp = Math.ceil(foe.hp * max / foe.max);
  foe.max = max;
  return foe;
}

const balanceMakeFoe = makeFoe;
makeFoe = function (...args) { return balanceAdjustedEnemy(1, args[4], balanceMakeFoe(...args)); };
function balanceKingMaxHp() { return balanceActive?.enemyHp['1:boss'] ?? 250; }

const balanceSnowFoe = snowFoe;
snowFoe = function (key, ...args) { return balanceAdjustedEnemy(2, key, balanceSnowFoe(key, ...args)); };
const balanceDesertFoe = desertFoe;
desertFoe = function (key, ...args) { return balanceAdjustedEnemy(3, key, balanceDesertFoe(key, ...args)); };
const balanceForestFoe = forestFoe;
forestFoe = function (key, ...args) { return balanceAdjustedEnemy(4, key, balanceForestFoe(key, ...args)); };
const balanceArchiveFoe = archiveFoe;
archiveFoe = function (key, ...args) { return balanceAdjustedEnemy(5, key, balanceArchiveFoe(key, ...args)); };
const balanceSwampFoe = swampFoe;
swampFoe = function (key, ...args) { return balanceAdjustedEnemy(6, key, balanceSwampFoe(key, ...args)); };

function balanceGoldHp(id, base) {
  return balanceActive?.enemyHp[id] ?? base;
}

function balanceEncounterWeight(act, keys) {
  return balanceActive?.[keys.length===1?'solo':'pairs'][balanceEncounterId(act,keys)] ?? 1;
}
function balanceHasEncounterWeights(act, candidates) {
  return candidates.some(keys => balanceEncounterWeight(act,keys) !== 1);
}
function balanceEncounterPick(act, candidates) {
  if (!balanceHasEncounterWeights(act,candidates)) return rand(candidates);
  const weights = candidates.map(keys=>balanceEncounterWeight(act,keys));
  let roll = Math.random()*weights.reduce((sum,weight)=>sum+weight,0);
  return candidates.find((_,index)=>(roll-=weights[index])<0) ?? rand(candidates);
}
function balanceGoldPick(group, candidates) {
  return group === 'solo'
    ? balanceEncounterPick(7,candidates.map(key=>[key]))[0]
    : balanceEncounterPick(7,candidates);
}

if (globalThis.ASHBOUND_BALANCE_SETTINGS) balanceApply(globalThis.ASHBOUND_BALANCE_SETTINGS);
if (!globalThis.ASHBOUND_HEADLESS && balanceActive && Object.keys(balanceActive.cards).length) render();
