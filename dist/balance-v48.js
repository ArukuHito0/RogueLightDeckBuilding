// Final adjustments preserve card array positions and all saved IDs.
function adjust48(name,changes,fx){const c=C.find(c=>c.name===name);Object.assign(c,changes);if(fx)c.fx={...c.fx,...fx};return c}
let blade48=adjust48('付け焼刃',{desc:'6ダメージ。捨て札にこのカードのコピーを1枚加える。'});delete blade48.fx.ex;
adjust48('防衛本能',{desc:'4ブロックを得る。棘1を得る。除外。'},{thorns:1});
adjust48('残灰の一撃',{desc:'14ダメージ。この戦闘の除外済みカード1枚につきダメージ+2。'},{d:14,exScale:2});
adjust48('血の盾',{cost:2,desc:'HPを4失う。24ブロック。'},{hpLoss:4,b:24});
adjust48('渇望',{desc:'HPを3失う。カードを2枚引く。'},{hpLoss:3});
adjust48('強靭な肉体',{rarity:'common',desc:'プレート4を得る。除外。'},{plate:4});
adjust48('鍛錬の一撃',{rarity:'common'});
let stance48=adjust48('力の構え',{}, {ex:1});if(!stance48.desc.includes('除外'))stance48.desc+='除外。';
adjust48('毒針',{runOnly:true});adjust48('腐食の切先',{retired:true});
let heartbeat48=C.find(c=>c.name==='鼓動');heartbeat48.desc=heartbeat48.desc.replace('たび1回復','たびエナジーを1回復');
keywords.鼓動=keywords.鼓動.replace('ごとに1回復','ごとにエナジーを1回復');
keywords.棘='敵から攻撃を受けるたび、敵にスタック分のダメージを与える。';
for(const entry of S.run?.battleCards||[])hydrateBattleCard(entry);
for(const entry of S.run?.generatedCards||[])hydrateGeneratedCard(entry);
const render48=render;render=function(){if(globalThis.ASHBOUND_LOADING)return;render48();if(deckResetPending&&page==='deck'&&!S.run)$('app').insertAdjacentHTML('beforeend',`<div class="relic-modal"><section role="dialog" aria-modal="true" aria-labelledby="reset-deck-title"><h2 id="reset-deck-title">デッキをリセットしますか？</h2><p>すべてのカードを未使用に戻します。</p><div class="toolbar"><button autofocus onclick="cancelResetDeck()">キャンセル</button><button class="deck-reset" onclick="confirmResetDeck()">リセットする</button></div></section></div>`)};
render();
