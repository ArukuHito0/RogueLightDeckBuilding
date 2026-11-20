// Review feedback: preserve card IDs and character pools.
function updateContent68(name,changes){const c=C.find(x=>x.name===name);if(!c)throw Error('Missing card '+name);Object.assign(c,changes);return c;}
updateContent68('修繕',{desc:'除外されたカードからランダムなカードを1枚、手札に加える。除外。'});
updateContent68('筋肉の極致',{cost:2});
const greatBlade68=C.find(c=>c.name==='残火の大太刀');greatBlade68.fx.ex=1;greatBlade68.desc=greatBlade68.desc.replace(/除外。/g,'')+'除外。';
C[11].fx.heal=4;C[11].fx.healOnHpDamage=1;C[11].desc='8ダメージ。攻撃でHPにダメージを与えた場合、HPを4回復。';
updateContent68('再生の障壁',{desc:'12ブロック。HPを7回復。除外。',fx:{b:12,heal:7,ex:1}});
const roar68=updateContent68('咆哮',{desc:'敵全体に14ダメージを与え、脆弱2を付与。',fx:{d:14,vulnerable:2,all:1},types:['攻撃','補助']});
updateContent68('進化の牙',{desc:'4ダメージ。デッキの進化済みカード1枚につきダメージ+1。'});
updateContent68('進化の鱗',{desc:'4ブロック。デッキの進化済みカード1枚につき、ブロック値+1。'});
updateContent68('乱れ啄み',{cost:1});
const contentDesc68=combatDesc;combatDesc=function(c,r){let text=contentDesc68(c,r);if(c.fx.blockRegen)text=cardBlockValue(r,c.fx.b)+'ブロック。現在のブロック値が'+(c.fx.blockRegenThreshold??15)+'以上なら、再生'+c.fx.blockRegen+'を得る。';if(c.fx.recoverExcluded)text='除外されたカードからランダムなカードを'+c.fx.recoverExcluded+'枚、手札に加える。';if(c.fx.ex&&!isSpecialCard(c)&&!text.includes('除外。'))text+='除外。';return text;};
for(const entry of S.run?.battleCards||[])hydrateBattleCard(entry);
for(const entry of S.run?.generatedCards||[])hydrateGeneratedCard(entry);
