// v49: card categories and powers consumed for the encounter (not exhausted).
const SPECIAL_EFFECTS=['engine','poisonDouble','passion','burn','thornGarden','forge','exhaustStrength','poisonAura','retainBlock','heartbeat','blockBonus'];
function isSpecialCard(c){return !!c?.special;}
function cardCategories(c){const f=c.fx||{};if(isSpecialCard(c))return ['特殊'];const types=[];if(f.d!=null||f.equalPoison||f.totalPoison||f.exactBlock)types.push('攻撃');if(f.b||f.strengthBlock||f.poisonBlock||f.exhaustBlock)types.push('防御');if(['p','reinfect','heal','s','agility','plate','regen','thorns','rage','thornShield','poisonCoat','empathy','doubleStr','strRegen','blockRegen','nextAttack','enemyStrength'].some(k=>f[k]))types.push('補助');return types.length?types:['補助'];}
function resolvePlayedCardPile(r,c,trigger=true){if(isSpecialCard(c)){r.specialUses??={};r.specialUses[c.id]=(r.specialUses[c.id]||0)+1;return;}if(c.fx.ex)exhaustCard(r,c.id,trigger);else r.discard.push(c.id);}
for(const name of ['血の盾','毒纏い','供物','茨の盾'])C.find(c=>c.name===name).rarity='common';
reviseNamed('残火の刃','4ダメージ。この戦闘の除外済みカード1枚につきダメージ+1。',{d:4,exScale:1},{rarity:'common'});
C.find(c=>c.name==='残灰の一撃').name='残火の大太刀';
reviseNamed('巨人の血','筋力+4。既に筋力が4以上なら、再生5を得る。除外。',{s:4,strRegen:5,ex:1});
reviseNamed('厚い城壁','18ブロック。次のターン開始時に8ブロック。',{b:18,nextBlock:8});
reviseNamed('共感','対象の毒スタック数と等しい筋力を得る。対象は毒を全て失う。',{empathy:1});
for(const c of C){if(SPECIAL_EFFECTS.some(k=>c.fx[k])){c.special=true;delete c.fx.ex;c.desc=c.desc.replace(/除外。/g,'')+'特殊。';}}
keywords.特殊='使用するとその戦闘中ずっと効果が続きます。カードは消費され、山札・捨て札・除外のどこにも入りません。除外時の効果は発動しません。次の戦闘ではデッキに戻ります。';
const rich49=rich;rich=s=>rich49(s).replace(/特殊/g,'<strong class="keyword">特殊</strong>');
const desc49=combatDesc;combatDesc=function(c,r){let d=desc49(c,r);if(c.fx.strRegen)d=`筋力+${c.fx.s}。使用前の筋力が${c.fx.strRegenThreshold??4}以上なら、再生${c.fx.strRegen}を得る。除外。`;if(c.fx.nextBlock)d=d.replace(/次のターン開始時に\d+ブロック/,`次のターン開始時に${c.fx.nextBlock}ブロック`);return isSpecialCard(c)?d.replace(/(?<!に)除外。/g,''):d;};
card=function(id,action='',extra=''){const r=S.run,active=page==='battle'&&r,c=active?combatCard(id):C[id],desc=active?combatDesc(c,r):c.desc;return `<div class="card-wrap"><button class="card ${c.rarity} ${active?(r.energy>=c.cost?(bonusReady(c,r)?'empowered':'playable'):'unplayable'):''}" ${action?`onclick="${action}"`:''} data-card="${id}"><span class="cost">${c.cost}</span>${c.runOnly&&!c.token?'<span class="latent-badge">潜在</span>':''}<div class="art">${c.icon}</div><small class="card-category">${cardCategories(c).join('・')}</small><h3>${c.name}</h3><p>${rich(desc)}</p>${c.generated?'<span class="card-source">生成・未使用ならターン終了時に除外</span>':''}${extra}</button>${tips(c)?`<aside class="tooltip">${tips(c)}</aside>`:''}</div>`};
// Rehydrate battle-local copies after final definitions and category flags exist.
for(const e of S.run?.battleCards||[])hydrateBattleCard(e);
for(const e of S.run?.generatedCards||[])hydrateGeneratedCard(e);



// v50 balance and potential cards. IDs remain stable, retired definitions are tombstones.
function isAttackCard50(c){const f=c.fx||{};return !!c.types?.includes('攻撃')||f.d!=null||!!(f.equalPoison||f.totalPoison||f.exactBlock);}
C[79].runOnly=true;C[37].cost=2;C[37].fx.ex=1;C[37].desc+='除外。';
C[61].name='装甲看破';C[72].cost=5;C[10].cost=2;
reviseNamed('鍛錬の一撃','8ダメージ。次の攻撃カードのダメージを+3。',{d:8,nextAttack:3});
C[63].desc='この戦闘中、カードからブロックを得るたびランダムな敵に4ダメージ。特殊。';
const removed50=new Set([26,83,88,...C.filter(c=>c.fx.thorns||c.fx.thornGarden).map(c=>c.id)]);
for(const id of removed50)C[id].retired=true;
for(const [name,cost,desc,fx,special,icon] of [
 ['正々堂々',2,'4ダメージを2回。筋力+2。攻撃対象に筋力+1。',{d:4,h:2,s:2,enemyStrength:1},false,'⚔'],
 ['捕食',1,'手札のカード1枚を選び除外。筋力+1。',{chooseExhaust:1,exhaustDraw:0,s:1},false,'◈'],
 ['血の恵み',1,'この戦闘中、自身の各ターンで初めてHPを失うたび筋力+1。特殊。',{bloodBlessing:1},true,'♥']
])C.push({id:C.length,name,cost,desc,fx,special,icon,rarity:'rare',runOnly:true,axis:'筋力'});
const combatCard50=combatCard;combatCard=function(id){const c=combatCard50(id);if(!c||!S.run)return c;const fx={...c.fx};if(hasRelic('double_cards',S.run))for(const k of ['enemyStrength','bloodBlessing'])if(fx[k])fx[k]*=2;return {...c,fx};};
const preview50=previewDamage;previewDamage=function(c,r,e){return preview50(c,r,e)+(isAttackCard50(c)?(c.fx.attackBonus??r.nextAttackBonus??0):0);};
const desc50=combatDesc;combatDesc=function(c,r){let d=desc50(c,r);if(c.fx.nextAttack)d=d.replace(/次の攻撃カードのダメージを\+\d+/, '次の攻撃カードのダメージを+'+c.fx.nextAttack);return d;};
const battle50=battle;battle=function(){let html=battle50(),r=S.run;let status='';if(r.nextAttackBonus)status+='<span class="status-help">次の攻撃 +'+r.nextAttackBonus+'</span>';if(r.bloodBlessing)status+='<span class="status-help" tabindex="0">血の恵み '+r.bloodBlessing+'<aside class="tooltip">自分の各ターンで最初にHPを失った時、筋力を得る。</aside></span>';return html.replace('<div class="player-status">','<div class="player-status">'+status);};
function cleanCards50(ids,baseOnly=false){return (ids||[]).filter(id=>C[id]&&!C[id].retired&&!(baseOnly&&C[id].runOnly));}
S.deck=cleanCards50(S.deck,true);if(S.deckSets)S.deckSets=S.deckSets.map(ids=>ids?cleanCards50(ids,true):ids);
if(S.run){const r=S.run;for(const entry of [...(r.battleCards||[]),...(r.generatedCards||[])]){const origin=entry.origin??entry.sourceId;if(removed50.has(origin)&&C[entry.id])C[entry.id].retired=true;}for(const key of ['deck','hand','draw','discard','exhausted','rewardCards'])if(r[key])r[key]=cleanCards50(r[key]);if(r.shop?.packChoice){const p=r.shop.packChoice;const selected=new Set(p.selected.map(i=>p.ids[i]));p.ids=cleanCards50(p.ids);p.selected=p.ids.flatMap((id,i)=>selected.has(id)?[i]:[]);}if(r.chest?.cards){const c=r.chest,selected=c.selected==null?null:c.cards[c.selected];c.cards=cleanCards50(c.cards);c.selected=selected==null||!c.cards.includes(selected)?null:c.cards.indexOf(selected);}if(r.pendingChoice?.eligible)r.pendingChoice.eligible=cleanCards50(r.pendingChoice.eligible);if(r.thorns!=null)r.thorns=0;if(r.thornGarden!=null)r.thornGarden=0;}
for(const e of S.run?.battleCards||[])hydrateBattleCard(e);
for(const e of S.run?.generatedCards||[])hydrateGeneratedCard(e);
if(!globalThis.ASHBOUND_HEADLESS)render();
