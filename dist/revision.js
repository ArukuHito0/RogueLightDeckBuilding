C[12].fx.d=20;C[12].desc='敵全体に20ダメージ。';
C[7].fx.discard=1;C[7].desc='2枚引いた後、手札から任意の1枚を捨て札へ送る。除外。';
C[1].fx.b=6;C[1].desc='6ブロックを得る。';
delete C[15].fx.discard;C[15].desc='エナジー+2。除外。';
C[11].cost=2;C[10].fx.s=1;C[10].desc='この戦闘中、筋力+1。除外。';
C[25].cost=0;C[29].fx.s=1;C[29].desc='8ダメージ。筋力+1。';
C[13].cost=1;C[13].fx.b=7;C[13].desc='7ブロック。1枚引く。';
C[11].fx.heal=6;C[11].desc='8ダメージ。HPを6回復。';
C[28].fx.p=5;C[28].desc='毒を5付与。2枚引く。';
delete C[24].fx.ex;C[24].desc='10ダメージ。この戦闘の除外済みカード1枚につきダメージ+4。';
const resolveRevision=base.play;base.play=function(i){let c=C[S.run?.hand[i]],r=S.run;if(!c||r.energy<c.cost)return;resolveRevision(i);if(S.run&&c.fx.discard&&r.hand.length)r.pendingDiscard=c.fx.discard};
function chooseDiscard(i){let r=S.run;if(busy||!r?.pendingDiscard||i<0||i>=r.hand.length)return;r.discard.push(r.hand.splice(i,1)[0]);r.pendingDiscard--;if(!r.hand.length)r.pendingDiscard=0;render()}
const playRevision=play;play=async function(i){if(S.run?.pendingDiscard)return;return playRevision(i)};
const endRevision=endTurn;endTurn=async function(){if(S.run?.pendingDiscard)return toast('捨て札に送るカードを選んでください');return endRevision()};
const goRevision=go;go=function(p){if(S.run?.pendingDiscard)return toast('先に捨て札に送るカードを選んでください');goRevision(p)};
bookType=bookType==='cards'?'base':bookType;
function cardOrder(a,b){let order={common:0,rare:1,epic:2};return order[C[a].rarity]-order[C[b].rarity]||a-b}
book=function(){let pool=C.filter(c=>!c.retired&&(bookType==='run'?c.runOnly:!c.runOnly));return `<div class="eyebrow">CODEX OF THE ASH</div><h2>カード・遺物図鑑</h2><div class="toolbar">${[['base','基礎カード'],['run','潜在カード'],['relics','遺物']].map(([v,n])=>`<button class="${bookType===v?'primary':''}" onclick="bookType='${v}';bookFilter='all';render()">${n}</button>`).join('')}<select aria-label="レアリティの絞り込み" onchange="bookFilter=this.value;render()">${[['all','すべて'],['common','COMMON'],['rare','RARE'],['epic','EPIC']].map(([v,n])=>`<option value="${v}" ${bookFilter===v?'selected':''}>${n}</option>`).join('')}</select><button onclick="page=S.run?S.run.mode:'home';render()">戻る →</button></div>${bookType==='relics'?`<div class="tiles">${relicList.map(x=>`<div class="tile center"><div class="portrait">${relicIcon(x)}</div><h3>${x.name}</h3><p>${rich(x.desc)}</p></div>`).join('')}</div>`:`<p>${bookType==='run'?'ラン中のみ取得・使用できる、ビルドを作るカード。':'パックから取得し、拠点でデッキに組み込む基礎カード。'}</p><div class="cards">${pool.filter(c=>bookFilter==='all'||c.rarity===bookFilter).sort((a,b)=>cardOrder(a.id,b.id)).map(c=>card(c.id,'',`<span class="count">${c.runOnly?'潜在':S.collection[c.id]?'所持 '+S.collection[c.id]+'枚':'未取得'}</span>`)).join('')}</div>`}`};
const homeRevision=home;home=function(){return homeRevision().replace('全6階層・約5〜10分','全12階層・約10〜20分')};
// Preserve ongoing path and battle on migration, extending the old map below its former boss.
if(S.run?.nodes?.length===6){let r=S.run,old=r.nodes,path=r.nodePath||[];createMap(r);for(let row=0;row<5;row++)r.nodes[row]=old[row];r.nodes[4].forEach(n=>n.edges=[0,1,2]);r.nodePath=path;r.nodes[5].forEach(n=>n.type='fight');if(r.mode==='battle'&&r.kind==='boss'){r.floor=10;r.nodePath=path.filter(n=>n.row<5)}else if(r.mode==='reward'&&r.kind==='boss'){finish(true)}}
if(S.run?.kind==='boss'&&S.run.enemies?.[0]?.max===260){let e=S.run.enemies[0];e.hp=Math.round(e.hp/260*320);e.max=320;bossPlan(S.run)}
