// Run-exclusive build-defining cards. Stable base IDs preserve existing saves.
C[5].fx.p=2;C[5].desc='4ダメージ。毒を2付与。';C[14].fx.p=6;C[14].desc='敵全体に毒を6付与。';
const runCards=[
['毒牙の処刑',1,'☠','8ダメージ。対象の毒1につきダメージ+2。','毒',{d:8,poisonScale:2}],
['触媒の契約',1,'⚗','対象の毒を2倍にする。毒が6以上なら3倍。除外。','毒',{catalyst:1,ex:1}],
['疫病の収穫',2,'♧','敵全体に、それぞれの毒の2倍＋筋力のダメージ。毒6以上の敵1体につき1枚引く。','毒',{d:0,poisonScale:2,all:1,harvest:1}],
['巨人の血',1,'♜','筋力+3。既に筋力が4以上なら、さらに筋力+2。除外。','筋力',{s:3,strBonus:2,ex:1}],
['筋肉の極致',1,'⚒','現在の筋力を2倍にする。筋力が6以上なら1枚引く。除外。','筋力',{doubleStr:1,ex:1}],
['圧壊',2,'▣','8ダメージ。この攻撃には筋力を通常の3倍加算。筋力6以上なら6ブロック。','筋力',{d:8,strScale:3,muscleBlock:1}],
['灰からの再生',1,'✧','以後、この戦闘中にカードを除外するたび、1枚引き3ブロックを得る。除外。','除外',{engine:1,ex:1}],
['燃料の供物',0,'♨','このカード以外の手札をランダムに最大2枚除外。1枚につきエナジー+1、4ブロック。除外。','除外',{sacrifice:2,ex:1}],
['残灰の一撃',2,'✹','10ダメージ。この戦闘の除外済みカード1枚につきダメージ+4。除外。','除外',{d:10,exScale:4,ex:1}]
];runCards.forEach((a,i)=>C.push({id:16+i,name:a[0],cost:a[1],icon:a[2],desc:a[3],rarity:'epic',axis:a[4],runOnly:true,fx:a[5]}));
function needsEnemy(c){return !c.fx.all&&!!(c.fx.d||c.fx.poisonScale||c.fx.p||c.fx.catalyst)}
const packPool=()=>C.filter(c=>!c.runOnly&&!c.retired);
keywords.筋力='攻击カードのダメージが筋力の値だけ増加します。複数回攻撃では各攻撃に適用。「圧壊」は3倍加算します。'.replace('攻击','攻撃');
function exhaustedCount(r){return (r.exhausted||[]).length}
function previewDamage(c,r,e){return (c.fx.d||0)+(r.str||0)*(c.fx.strScale||1)+(c.fx.poisonScale||0)*(e?.poison||0)+(c.fx.exScale||0)*exhaustedCount(r)}
function bonusReady(c,r){let e=r.enemies[target];return !!(c.fx.poisonScale&&(c.fx.all?r.enemies.some(e=>e.hp>0&&e.poison>0):e?.poison>0)||c.fx.catalyst&&e?.poison>=6||c.fx.harvest&&r.enemies.some(e=>e.hp>0&&e.poison>=6)||c.fx.strBonus&&r.str>=(c.fx.strBonusThreshold??4)||c.fx.doubleStr&&r.str>=6||c.fx.muscleBlock&&r.str>=6||c.fx.exScale&&exhaustedCount(r)>0)}
function combatDesc(c,r){let e=r.enemies[target],f=c.fx;if(f.catalyst)return `対象の毒を${e?.poison>=6?'<strong class="boost">3</strong>':2}倍にする。毒6以上で3倍。除外。`;if(f.harvest)return '敵全体に、それぞれの毒の2倍＋筋力のダメージ。毒6以上の敵1体につき1枚引く。';if(f.doubleStr)return `筋力を2倍（現在 ${r.str} → <strong class="boost">${r.str*2}</strong>）。筋力6以上なら1枚引く。除外。`;if(f.strBonus)return `筋力+<strong class="boost">${r.str>=4?5:3}</strong>。既に筋力4以上なら追加+2。除外。`;if(f.d||f.poisonScale){let n=previewDamage(c,r,e);let desc=c.desc;if(f.poisonScale&&!f.all)desc=desc.replace('8ダメージ',n+'ダメージ');else desc=desc.replace(f.d+'ダメージ',n+'ダメージ');if(n!==f.d)desc=desc.replace(n+'ダメージ',`<strong class="boost">${n}ダメージ</strong>`);return desc}return c.desc}
const buildCard=card;card=function(id,action='',extra=''){let c=C[id],r=S.run,old=c.desc;if(page==='battle'&&r&&c.runOnly)c.desc=combatDesc(c,r);let html;try{html=buildCard(id,action,extra)}finally{c.desc=old}if(c.runOnly)html=html.replace(`<small>${c.rarity.toUpperCase()}</small>`,`<small>ラン限定 / ${c.axis}軸</small>`);if(page==='battle'&&r&&r.energy>=c.cost&&bonusReady(c,r))html=html.replace('playable','empowered');return html};
const chooseCore=choose;choose=function(type){chooseCore(type);if(S.run&&page==='battle'){S.run.exhausted=[];S.run.exhaustEngine=0;render()}};
function exhaustCard(r,id,trigger=true){r.exhausted=r.exhausted||[];r.exhausted.push(id);if(trigger&&r.exhaustEngine){r.block+=3*r.exhaustEngine;draw(r.exhaustEngine)}}
base.play=function(i){let r=S.run,c=C[r.hand[i]];if(!c||r.energy<c.cost)return;let id=c.id,f=c.fx;if(!r.enemies[target]||r.enemies[target].hp<=0)target=r.enemies.findIndex(e=>e.hp>0);r.energy-=c.cost;r.hand.splice(i,1);let enemies=f.all?r.enemies.filter(e=>e.hp>0):[r.enemies[target]],strengthBefore=r.str;let hitCount=f.h||1;enemies.forEach(e=>{if(!e)return;let poisonBefore=e.poison;if(f.d||f.poisonScale)for(let h=0;h<hitCount;h++)damage(e,previewDamage(c,r,e));if(f.p)e.poison+=f.p;if(f.catalyst)e.poison*=e.poison>=6?3:2;if(f.harvest&&poisonBefore>=6)draw(1)});r.block+=f.b||0;r.hp=Math.min(r.max,r.hp+(f.heal||0));r.str+=(f.s||0)+(f.strBonus&&strengthBefore>=4?f.strBonus:0);if(f.doubleStr){r.str*=2;if(strengthBefore>=6)draw(1)}if(f.muscleBlock&&strengthBefore>=6)r.block+=6;r.energy+=f.energy||0;
if(f.sacrifice){for(let n=0;n<f.sacrifice;n++){if(!r.hand.length)break;let removed=r.hand.splice(Math.floor(Math.random()*r.hand.length),1)[0];r.energy++;r.block+=4;exhaustCard(r,removed)}}
if(f.ex)exhaustCard(r,id);else r.discard.push(id);if(f.engine)r.exhaustEngine+=1;if(f.draw)draw(f.draw);msg=c.name+'を使用。';if(r.enemies.every(e=>e.hp<=0))victory();else render()};
const victoryCore=victory;victory=function(){victoryCore();if(S.run&&page==='reward'){S.run.rewardCards=shuffle(C.filter(c=>c.runOnly).map(c=>c.id)).slice(0,3);render()}};
const rewardCore=reward;reward=function(){return rewardCore().replace('潜在カードを1枚選ぶ','潜在カードを1枚選ぶ').replace('選んだカードは今回のランだけ山札に追加されます。','毒・筋力・除外。デッキの軸を決めるカードです。今回のランのみ有効で、次の戦闘から山札に加わります。')};
openPacks=function(n){if(S.run||n<1||n>S.packs)return;S.packs-=n;revealed=[];let pool=packPool();for(let j=0;j<n;j++)revealed.push(rand(pool.filter(c=>c.rarity!=='common')).id,...Array.from({length:2},()=>rand(pool.filter(c=>c.rarity===(Math.random()<.25?'rare':'common'))).id));revealed.forEach(id=>S.collection[id]=(S.collection[id]||0)+1);render()};
openPack=function(){openPacks(1)};
const homeCore=home;home=function(){return homeCore().replace('新たな一枚と出会う。','基礎カードでデッキを底上げ。').replace('毎ターン5枚・エナジー3。','毎ターン5枚・エナジー3。戦闘報酬の潜在カードで毒・筋力・除外の軸を作る。')};
const battleCore=battle;battle=function(){let html=battleCore(),r=S.run;if(r.exhaustEngine)html=html.replace('<div class="player-status">',`<div class="player-status"><span class="status-help" tabindex="0">灰の守り ×${r.exhaustEngine}<aside class="tooltip">除外1枚につき${r.exhaustEngine*3}ブロック。</aside></span>`);return html.replace(`山札 ${r.draw.length}　捨札 ${r.discard.length}`,`山札 ${r.draw.length}　捨札 ${r.discard.length}　除外 ${exhaustedCount(r)}`)};
const packsCore=packs;packs=function(){return packsCore().replace('1パックに3枚。レア以上が必ず1枚。','1パックに基礎カード3枚。レア以上が必ず1枚。軸を決める潜在カードは戦闘報酬から獲得。')};
const bookCore=book;book=function(){let html=bookCore();html=html.replace('<p>未取得の能力も閲覧できます。','<p>パックの基礎カードと、毒・筋力・除外の潜在カード。');html=html.replace('未取得</span>', '未取得</span>');return html};
// Stable old saves: infer consumed cards for an already running battle.
if(S.run&&S.run.mode==='battle'){let r=S.run;if(!r.exhausted){let available=[...(r.draw||[]),...(r.hand||[]),...(r.discard||[])];r.exhausted=r.deck.filter(id=>{let at=available.indexOf(id);if(at<0)return true;available.splice(at,1);return false})}r.exhaustEngine=r.exhaustEngine||0}
