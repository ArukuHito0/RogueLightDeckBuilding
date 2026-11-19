C[28].fx.p=3;C[28].fx.draw=1;C[28].desc='毒を3付与。1枚引く。';
C[25].fx.p=4;C[25].fx.ex=1;C[25].desc='3ダメージ。毒を4付与。除外。';
C[2].fx.d=4;C[2].fx.ex=1;C[2].desc='4ダメージ。除外。';
C[7].fx.draw=1;delete C[7].fx.ex;C[7].desc='1枚引いた後、手札から任意の1枚を捨て札へ送る。';
const moreRunCards=[
['盾打ち',1,'▱','4ダメージ。現在のブロック1につきダメージ+1。','common','ブロック',{d:4,blockScale:1}],
['防壁の補修',1,'◇','8ブロック。1枚引く。除外。','common','ブロック',{b:8,draw:1,ex:1}],
['護身の一撃',1,'⚔','5ダメージ。5ブロック。','common','ブロック',{d:5,b:5}],
['反撃の盾',1,'▣','6ダメージ。現在のブロック1につきダメージ+1。8ブロック。','rare','ブロック',{d:6,blockScale:1,b:8}],
['防衛の計略',1,'⌘','12ブロック。1枚引く。','rare','ブロック',{b:12,draw:1}],
['厚い城壁',2,'♜','24ブロック。除外。','rare','ブロック',{b:24,ex:1}],
['城塞の粉砕',2,'⚒','敵全体に4ダメージ＋現在のブロックの2倍。攻撃後、ブロックをすべて失う。','epic','ブロック',{d:4,blockScale:2,all:1,spendBlock:1}],
['不落の契約',1,'♛','以後この戦闘中、カード使用後に3ブロックを得る。除外。','epic','ブロック',{blockEngine:3,ex:1}],
['腐食の切先',1,'†','5ダメージ。毒を1付与。','common','毒',{d:5,p:1}],
['全力の構え',1,'♜','筋力+1。1枚引く。除外。','common','筋力',{s:1,draw:1,ex:1}],
['燃焼の守り',0,'✧','5ブロック。除外。','common','除外',{b:5,ex:1}],
['毒の散布',1,'♧','敵全体に毒を3付与。1枚引く。除外。','rare','毒',{p:3,all:1,draw:1,ex:1}],
['強靭な肉体',1,'♜','筋力+2。6ブロック。除外。','rare','筋力',{s:2,b:6,ex:1}],
['灰の循環',0,'☽','2枚引く。6ブロック。除外。','rare','除外',{draw:2,b:6,ex:1}]
];moreRunCards.forEach((a,i)=>C.push({id:31+i,name:a[0],cost:a[1],icon:a[2],desc:a[3],rarity:a[4],axis:a[5],runOnly:true,fx:a[6]}));
const previewBlockBase=previewDamage;previewDamage=function(c,r,e){return previewBlockBase(c,r,e)+(c.fx.blockScale||0)*(r.block||0)};
const descBlockBase=combatDesc;combatDesc=function(c,r){if(c.fx.blockScale){let n=previewDamage(c,r,r.enemies[target]);return c.desc.replace(c.fx.d+'ダメージ',`<strong class="boost">${n}ダメージ</strong>`)}return descBlockBase(c,r)};
const bonusBlockBase=bonusReady;bonusReady=function(c,r){return bonusBlockBase(c,r)||!!(c.fx.blockScale&&r.block>0)};
const resolveBlockBase=base.play;base.play=function(i){let r=S.run,c=C[r?.hand[i]];if(!c||r.energy<c.cost)return;let engine=r.blockEngine||0;resolveBlockBase(i);if(!S.run)return;if(c.fx.spendBlock)r.block=0;if(engine)r.block+=engine;if(c.fx.blockEngine)r.blockEngine=(r.blockEngine||0)+c.fx.blockEngine};
const chooseBlockBase=choose;choose=function(type){chooseBlockBase(type);if(S.run?.mode==='battle'){S.run.blockEngine=0;render()}};
const battleBlockBase=battle;battle=function(){let html=battleBlockBase();if(S.run?.blockEngine)html=html.replace('<div class="player-status">',`<div class="player-status"><span class="status-help" tabindex="0">不落の契約 +${S.run.blockEngine}<aside class="tooltip">カード使用後に${S.run.blockEngine}ブロックを得る。</aside></span>`);return html};
function baseEpicRate(floor){if(floor<=2)return .02;if(floor<=4)return .05;if(floor<=5)return .05;if(floor<=8)return .10;return .20}
function currentEpicRate(r){return Math.min(1,baseEpicRate(r.floor)+(r.epicPity||0)+(r.kind==='elite'?.20:0))}
function sampleRunCards(rate){let remaining=C.filter(c=>c.runOnly),out=[];let rare=.35*(1-rate),common=1-rate-rare;for(let i=0;i<3;i++){let x=Math.random(),rarity=x<rate?'epic':x<rate+rare?'rare':'common',pool=remaining.filter(c=>c.rarity===rarity);if(!pool.length)pool=remaining;let c=rand(pool);out.push(c.id);remaining=remaining.filter(c=>c.id!==out.at(-1))}return out}
// Event cards use the floor base rate; events never advance or reset battle pity.
rollRunRewards=function(floor){return sampleRunCards(baseEpicRate(floor))};
const victoryPityBase=victory;victory=function(){victoryPityBase();let r=S.run;if(r&&page==='reward'){let rate=currentEpicRate(r),pity=r.epicPity||0;r.rewardCards=sampleRunCards(rate);let epic=r.rewardCards.some(id=>C[id].rarity==='epic');r.rewardRate={base:baseEpicRate(r.floor),pity,elite:r.kind==='elite'?.20:0,total:rate,epic};r.epicPity=epic?0:Math.min(.98,pity+.02);render()}};
const rewardPityBase=reward;reward=function(){let html=rewardPityBase(),r=S.run;if(r.rewardRate){let p=r.rewardRate,pct=x=>Math.round(x*100);html=html.replace(/第\d+階層のEPIC抽選率は1枠あたり\d+%。/,`EPIC：1枠あたり${pct(p.total)}%（基礎${pct(p.base)}%＋未出現加算${pct(p.pity)}%＋強敵補正${pct(p.elite)}%）。`);html+=`<p class="pity-status">${p.epic?'EPICが出現したため、未出現加算をリセット。':`EPIC未出現：次の戦闘報酬への加算は+${pct(r.epicPity)}%。`}</p>`}return html};
const mysteryCardBase=mystery;mystery=function(){let html=mysteryCardBase(),m=S.run.mystery;if(m.resolved){let id=m.cardId;if(id==null&&m.result){let c=C.find(c=>m.result.endsWith('：'+c.name));if(c)id=c.id}if(id!=null)html=html.replace('<button class="primary" onclick="next()">',`<div class="event-card-reward"><div class="eyebrow">CARD ACQUIRED</div>${flipCards([id])}</div><button class="primary" onclick="next()">`)}return html};
document.addEventListener('contextmenu',e=>{let slot=e.target.closest?.('.deck-slot');if(page!=='deck'||S.run||!slot)return;e.preventDefault();let zone=slot.dataset.zone,id=+slot.dataset.id;changeDeck(zone,zone==='deck'?'reserve':'deck',id,+slot.dataset.index,null)});
const deckRightBase=deck;deck=function(){return deckRightBase().replace('同じカードはまとめて表示。','右クリックでも1枚ずつ出し入れできます。同じカードはまとめて表示。')};
const goTabBase=go;go=function(p){if(p==='home'&&S.run){if(busy)return;if(S.run.pendingDiscard&&S.run.mode!=='battle')return;page=S.run.mode;render();return}goTabBase(p)};
const renderTabBase=render;render=function(){if(globalThis.ASHBOUND_LOADING)return;renderTabBase();if(S.run){let first=$('nav').querySelector('button');if(first){first.textContent=S.run.mode==='battle'?'戦闘':'探索';first.classList.toggle('active',page===S.run.mode)}}};
