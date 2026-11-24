// One codex implementation for every registered character, including future ones.
let codexCharacterId=null;
const codexFilters={keyword:'all',cost:'all',axis:'all',type:'all',query:''};
function codexCharacter(){return CHARACTERS[codexCharacterId]||selectedCharacter();}
function codexPool(characterId=codexCharacter().id){return C.filter(c=>c.runOnly&&!c.retired&&!c.outsideCardPool&&!c.token&&!c.generated&&!c.battleCopy&&(c.characterId||'wanderer')===characterId);}
function evolutionNames(){return [...new Set(C.filter(c=>c.evolveTo!=null||c.evolveName).map(c=>C[c.evolveTo]?.name||c.evolveName).filter(Boolean))].sort((a,b)=>b.length-a.length);}
function codexKeywords(c){return Object.keys(keywords).filter(k=>c.desc.includes(k));}
function codexCost(c){return c.xCost?'X':String(c.cost);}
function codexAxes(c){return Array.isArray(c.axes)?c.axes:c.axis?[c.axis]:[];}
function codexTypes(c){return c.types?.length?[...c.types,...(c.evolution?['進化']:[])]:cardCategories(c);}
function codexResults(){const f=codexFilters,q=f.query.trim().toLocaleLowerCase();return codexPool().filter(c=>(bookFilter==='all'||c.rarity===bookFilter)&&(f.cost==='all'||codexCost(c)===f.cost)&&(f.axis==='all'||codexAxes(c).includes(f.axis))&&(f.type==='all'||codexTypes(c).includes(f.type))&&(f.keyword==='all'||codexKeywords(c).includes(f.keyword))&&(!q||[c.name,c.desc,...codexAxes(c),...codexTypes(c)].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>cardOrder(a.id,b.id));}
function resetCodexFilters(){bookFilter='all';for(const key of ['keyword','cost','axis','type'])codexFilters[key]='all';codexFilters.query='';}
function setCodexCharacter(id){if(!CHARACTERS[id])return;codexCharacterId=id;resetCodexFilters();render();}
function setCodexFilter(key,value){if(key==='rarity')bookFilter=value;else if(Object.hasOwn(codexFilters,key))codexFilters[key]=value;render();}
function clearCodexFilters(){resetCodexFilters();render();}
function codexSelect(key,label,values,value,labels={}){return `<label class="codex-filter"><span>${label}</span><select aria-label="${label}" onchange="setCodexFilter('${key}',this.value)"><option value="all">すべて</option>${values.map(v=>`<option value="${escapeHTML(v)}" ${v===value?'selected':''}>${escapeHTML(labels[v]||v)}</option>`).join('')}</select></label>`;}
const bookCodexBase=book;
book=function(){if(bookType!=='run')return bookCodexBase();const character=codexCharacter(),pool=codexPool(),results=codexResults(),unique=values=>[...new Set(values)].filter(Boolean).sort((a,b)=>a.localeCompare(b,'ja'));
const costs=unique(pool.map(codexCost)).sort((a,b)=>a==='X'?1:b==='X'?-1:Number(a)-Number(b));
return `<section class="potential-codex"><div class="eyebrow">CHARACTER CODEX</div><h2>潜在カード図鑑</h2><div class="toolbar"><button onclick="bookType='base';render()">基礎カード</button><button class="primary">潜在カード</button><button onclick="bookType='relics';render()">遺物</button><button onclick="returnFromCharacterCodex()">戻る →</button></div><div class="codex-character-switch" role="group" aria-label="閲覧するキャラクター">${Object.values(CHARACTERS).map(c=>`<button class="${c.id===character.id?'primary':''}" aria-pressed="${c.id===character.id}" onclick="setCodexCharacter('${escapeHTML(c.id)}')">${c.icon} ${escapeHTML(c.name)}</button>`).join('')}</div><h3>${escapeHTML(character.name)}</h3><p>レアリティ順（COMMON → RARE → EPIC）、同じレアリティ内は基礎カードと同じ登録順で表示。進化カードは戦闘中の進化でのみ使用できます。</p><div class="codex-filters">${codexSelect('rarity','レアリティ',['common','rare','epic'],bookFilter,{common:'COMMON',rare:'RARE',epic:'EPIC'})}${codexSelect('keyword','キーワード',unique(pool.flatMap(codexKeywords)),codexFilters.keyword)}${codexSelect('cost','コスト',costs,codexFilters.cost)}${codexSelect('axis','軸',unique(pool.flatMap(codexAxes)),codexFilters.axis)}${codexSelect('type','カードタイプ',unique(pool.flatMap(codexTypes)),codexFilters.type)}<label class="codex-filter codex-text-search"><span>カード名・効果で検索</span><input id="codex-query" type="search" value="${escapeHTML(codexFilters.query)}" placeholder="カード名やキーワードを入力" aria-label="カード名・効果で検索"></label></div><div class="toolbar codex-results"><span id="codex-result-count" role="status" aria-live="polite">${results.length} / ${pool.length}枚</span><button onclick="updateCodexQueryResults()">検索</button><button onclick="clearCodexFilters()">検索条件をリセット</button></div><div class="cards" id="codex-card-results">${results.map(c=>card(c.id)).join('')||'<p class="codex-empty">条件に一致するカードがありません。検索条件を変更してください。</p>'}</div></section>`;};
// Render names before the usual keyword renderer so overlapping terms do not
// create nested tags (e.g. a future evolved card whose name contains 「筋力」).
const richCodexBase=rich;
rich=function(s){const names=[...new Set([...evolutionNames(),...Object.keys(keywords)])].sort((a,b)=>b.length-a.length);if(!names.length)return richCodexBase(s);const escapeRegex=v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const expression=new RegExp('('+names.map(escapeRegex).join('|')+')','g'),known=new Set(names);return String(s).split(expression).map(part=>known.has(part)?`<strong class="keyword">${escapeHTML(part)}</strong>`:richCodexBase(part)).join('');};
function updateCodexQueryResults(){const result=$('codex-card-results'),count=$('codex-result-count');if(!result||!count)return;hideEvolutionPreview();if(typeof hideCardHelpPortal==='function')hideCardHelpPortal();const cards=codexResults();result.innerHTML=cards.map(c=>card(c.id)).join('')||'<p class="codex-empty">条件に一致するカードがありません。検索条件を変更してください。</p>';count.textContent=cards.length+' / '+codexPool().length+'枚';wireEvolutionPreviews();if(typeof wireCardHelpPortals==='function')wireCardHelpPortals();}
function bindCodexQuery(input){input.oncompositionstart=()=>{input.codexComposing=true;};input.oncompositionend=()=>{input.codexComposing=false;codexFilters.query=input.value;updateCodexQueryResults();};input.oninput=e=>{codexFilters.query=input.value;if(input.codexComposing||e?.isComposing)return;updateCodexQueryResults();};}
function decorateEvolutionCard(html,c){if(!c?.evolution)return html;html=html.replace('<span class="latent-badge">潜在</span>','<span class="latent-badge">潜在</span><span class="card-evolution-tag">進化</span>');return html.replace(/(<small class="card-category">)(.*?)(<\/small>)/,(_,a,b,z)=>a+b.split('・').filter(x=>x!=='進化').join('・')+z);}
const cardEvolutionBase=card;card=function(id,action='',extra=''){return decorateEvolutionCard(cardEvolutionBase(id,action,extra),C[id]);};
function hideEvolutionPreview(){document.getElementById('evolution-preview')?.remove?.();}
function evolutionPreviewPosition(rect,width,height,viewportWidth,viewportHeight){return {left:Math.max(8,Math.min(rect.left-width-12,viewportWidth-width-8)),top:Math.max(8,Math.min(rect.top,viewportHeight-height-8))};}
function cardPreviewTargets(c) {
  const targets = [];
  const next = C[c?.evolveTo];
  if (next) targets.push({label:'進化先', card:next});
  if (c?.fx?.tokenSword > 0) targets.push({label:'生成先', token:'sword'});
  if (c?.fx?.tokenKnife > 0) targets.push({label:'生成先', token:'knife'});
  const origin = C[c?.origin ?? c?.id];
  if (c?.fx?.copyDiscard > 0 && origin) targets.push({label:'生成先', card:origin});
  return targets;
}
function renderCardPreview(target) {
  if (!target.token) return card(target.card.id);
  let id = nextBattleCardId(S.run || {});
  while (C[id]) id--;
  hydrateBattleCard({id, token:target.token});
  try {
    return card(id);
  } finally {
    delete C[id];
  }
}
function showEvolutionPreview(wrap) {
  const source = wrap.querySelector('[data-card]');
  const targets = cardPreviewTargets(C[source?.dataset.card]);
  hideEvolutionPreview();
  if (!targets.length || busy || drag) return;
  const node = document.createElement('aside');
  node.id = 'evolution-preview';
  node.className = 'evolution-preview';
  node.setAttribute('role','tooltip');
  node.setAttribute('aria-label',targets.map(target => target.label + '：' + (target.card || TOKEN_DEFS[target.token]).name).join('、'));
  node.innerHTML = targets.map(renderCardPreview).join('');
  node.querySelectorAll('[data-card]').forEach(el => {
    el.setAttribute('data-card-preview','');
    el.removeAttribute('data-card');
  });
  node.querySelectorAll('button').forEach(el => {
    el.tabIndex = -1;
    el.setAttribute('aria-disabled','true');
    el.classList.remove('playable','unplayable','empowered');
  });
  document.body.appendChild(node);
  const position = evolutionPreviewPosition(source.getBoundingClientRect(),node.offsetWidth,node.offsetHeight,window.innerWidth,window.innerHeight);
  node.style.left = position.left + 'px';
  node.style.top = position.top + 'px';
}
function wireEvolutionPreviews() {
  document.querySelectorAll('.card-wrap').forEach(wrap => {
    const source = wrap.querySelector('[data-card]');
    if (!cardPreviewTargets(C[source?.dataset.card]).length) return;
    wrap.onmouseenter = () => showEvolutionPreview(wrap);
    wrap.onmouseleave = hideEvolutionPreview;
    wrap.onfocusin = () => showEvolutionPreview(wrap);
    wrap.onfocusout = hideEvolutionPreview;
  });
}
keywords.進化='使用後、進化先のカードに変化する。進化後のカードは報酬や生成からは取得できない。戦闘終了時、進化の段階はリセットされる。';
const renderCodexBase=render;
render=function(){if(globalThis.ASHBOUND_LOADING)return;hideEvolutionPreview();renderCodexBase();if(page==='book'&&bookType==='run'){const input=$('codex-query');if(input)bindCodexQuery(input);}wireEvolutionPreviews();};
if(!globalThis.ASHBOUND_HEADLESS)render();
