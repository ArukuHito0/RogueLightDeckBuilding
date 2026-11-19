C[47].fx.b=5;C[47].fx.nextBlock=3;C[47].desc='5ブロック。次のターン開始時に3ブロック。除外。';
C[45].fx.b=3;C[45].desc='3ブロック。除外。';
C[48].fx.b=6;C[48].desc='6ブロック。1枚引く。除外。';
C[49].fx.b=12;delete C[49].fx.heal;C[49].fx.regen=4;C[49].desc='12ブロック。再生4を得る。除外。';
keywords.再生='ターン開始時に再生スタック分のHPを回復し、スタックを1消費します。戦闘が終了すると消えます。';
function applyTurnStartBuffs(r){if(r.nextBlock){r.block+=r.nextBlock;r.nextBlock=0}if(r.regen>0){r.hp=Math.min(r.max,r.hp+r.regen);r.regen--}}
const resolveRegenBase=base.play;base.play=function(i){let r=S.run,c=C[r?.hand[i]];if(!c||r.energy<c.cost)return;resolveRegenBase(i);if(S.run){if(c.fx.nextBlock)r.nextBlock=(r.nextBlock||0)+c.fx.nextBlock;if(c.fx.regen)r.regen=(r.regen||0)+c.fx.regen}};
const chooseRegenBase=choose;choose=function(type){chooseRegenBase(type);if(S.run?.mode==='battle'){S.run.regen=0;S.run.nextBlock=0;render()}};
const battleRegenBase=battle;battle=function(){let html=battleRegenBase(),r=S.run,status='';if(r.regen>0)status+=`<span class="status-help regen-status" tabindex="0">✚ 再生 ${r.regen}<aside class="tooltip"><strong class="keyword">【再生】</strong><p>${keywords.再生}</p></aside></span>`;if(r.nextBlock>0)status+=`<span class="status-help" tabindex="0">◇ 次ターン +${r.nextBlock}<aside class="tooltip">次の自分のターン開始時に${r.nextBlock}ブロックを得ます。その後この効果は消えます。</aside></span>`;return html.replace('<div class="player-status">','<div class="player-status">'+status)};
