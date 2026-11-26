// One codex implementation for every registered character, including future ones.
let codexCharacterId=null;
function defaultCodexFilters(){return {rarity:'all',keyword:'all',cost:'all',axis:'all',type:'all',query:''};}
const baseCodexFilters=defaultCodexFilters();
const potentialCodexFilters=defaultCodexFilters();
function activeCodexFilters(){return bookType==='run'?potentialCodexFilters:baseCodexFilters;}
function visibleCodexPool(){return bookType==='run'?codexPool():C.filter(c=>!c.runOnly&&!c.retired);}
function codexCharacter(){return CHARACTERS[codexCharacterId]||selectedCharacter();}
function codexPool(characterId=codexCharacter().id){return C.filter(c=>c.runOnly&&!c.retired&&!c.outsideCardPool&&!c.token&&!c.generated&&!c.battleCopy&&(c.characterId||'wanderer')===characterId);}
function evolutionNames(){return [...new Set(C.filter(c=>c.evolveTo!=null||c.evolveName).map(c=>C[c.evolveTo]?.name||c.evolveName).filter(Boolean))].sort((a,b)=>b.length-a.length);}
function codexKeywords(c){return Object.keys(keywords).filter(k=>c.desc.includes(k));}
function codexCost(c){return c.xCost?'X':String(c.cost);}
function codexAxes(c){return Array.isArray(c.axes)?c.axes:c.axis?[c.axis]:[];}
function codexTypes(c){return c.types?.length?[...c.types,...(c.evolution?['進化']:[])]:cardCategories(c);}
function codexResults(pool=visibleCodexPool()){const f=activeCodexFilters(),q=f.query.trim().toLocaleLowerCase();return pool.filter(c=>(f.rarity==='all'||c.rarity===f.rarity)&&(f.cost==='all'||codexCost(c)===f.cost)&&(f.axis==='all'||codexAxes(c).includes(f.axis))&&(f.type==='all'||codexTypes(c).includes(f.type))&&(f.keyword==='all'||codexKeywords(c).includes(f.keyword))&&(!q||[c.name,c.desc,...codexAxes(c),...codexTypes(c)].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>cardOrder(a.id,b.id));}
function resetCodexFilters(){Object.assign(activeCodexFilters(),defaultCodexFilters());}
function setCodexCharacter(id){if(!CHARACTERS[id])return;codexCharacterId=id;resetCodexFilters();render();}
function setCodexFilter(key,value){const filters=activeCodexFilters();if(Object.hasOwn(filters,key))filters[key]=value;render();}
function clearCodexFilters(){resetCodexFilters();render();}
function codexSelect(key,label,values,value,labels={}){return `<label class="codex-filter"><span>${label}</span><select aria-label="${label}" onchange="setCodexFilter('${key}',this.value)"><option value="all">すべて</option>${values.map(v=>`<option value="${escapeHTML(v)}" ${v===value?'selected':''}>${escapeHTML(labels[v]||v)}</option>`).join('')}</select></label>`;}
function codexCardsHTML(cards){
  return cards.map(c=>{
    if(bookType==='run')return card(c.id);
    const owned=S.collection[c.id];
    return card(c.id,'',`<span class="count">${owned?'所持 '+owned+'枚':'未取得'}</span>`);
  }).join('')||'<p class="codex-empty">条件に一致するカードがありません。検索条件を変更してください。</p>';
}
function codexSearchPanel(){
  const pool=visibleCodexPool(),results=codexResults(pool),filters=activeCodexFilters();
  const unique=values=>[...new Set(values)].filter(Boolean).sort((a,b)=>a.localeCompare(b,'ja'));
  const costs=unique(pool.map(codexCost)).sort((a,b)=>a==='X'?1:b==='X'?-1:Number(a)-Number(b));
  return `<div class="codex-filters">${codexSelect('rarity','レアリティ',['common','rare','epic'],filters.rarity,{common:'COMMON',rare:'RARE',epic:'EPIC'})}${codexSelect('keyword','キーワード',unique(pool.flatMap(codexKeywords)),filters.keyword)}${codexSelect('cost','コスト',costs,filters.cost)}${codexSelect('axis','軸',unique(pool.flatMap(codexAxes)),filters.axis)}${codexSelect('type','カードタイプ',unique(pool.flatMap(codexTypes)),filters.type)}<label class="codex-filter codex-text-search"><span>カード名・効果で検索</span><input id="codex-query" type="search" value="${escapeHTML(filters.query)}" placeholder="カード名やキーワードを入力" aria-label="カード名・効果で検索"></label></div><div class="toolbar codex-results"><span id="codex-result-count" role="status" aria-live="polite">${results.length} / ${pool.length}枚</span><button onclick="updateCodexQueryResults()">検索</button><button onclick="clearCodexFilters()">検索条件をリセット</button></div><div class="cards" id="codex-card-results">${codexCardsHTML(results)}</div>`;
}
const bookCodexBase=book;
book=function(){
  if(!['cards','base','run'].includes(bookType))return bookCodexBase();
  const isPotential=bookType==='run';
  const character=isPotential?codexCharacter():null;
  return `<section class="${isPotential?'potential-codex':'base-codex'}"><div class="eyebrow">${isPotential?'CHARACTER CODEX':'CODEX OF THE ASH'}</div><h2>${isPotential?'潜在カード図鑑':'カード・遺物図鑑'}</h2><div class="toolbar"><button class="${isPotential?'':'primary'}" onclick="bookType='base';render()">基礎カード</button><button class="${isPotential?'primary':''}" onclick="bookType='run';render()">潜在カード</button><button onclick="bookType='relics';render()">遺物</button><button onclick="${isPotential?'returnFromCharacterCodex()':"page=S.run?S.run.mode:'home';render()"}">戻る →</button></div>${isPotential?`<div class="codex-character-switch" role="group" aria-label="閲覧するキャラクター">${Object.values(CHARACTERS).map(c=>`<button class="${c.id===character.id?'primary':''}" aria-pressed="${c.id===character.id}" onclick="setCodexCharacter('${escapeHTML(c.id)}')">${c.icon} ${escapeHTML(c.name)}</button>`).join('')}</div><h3>${escapeHTML(character.name)}</h3><p>レアリティ順（COMMON → RARE → EPIC）、同じレアリティ内は基礎カードと同じ登録順で表示。進化カードは戦闘中の進化でのみ使用できます。</p>`:'<p>パックから取得し、拠点でデッキに組み込む基礎カード。</p>'}${codexSearchPanel()}</section>`;
};
// Render names before the usual keyword renderer so overlapping terms do not
// create nested tags (e.g. a future evolved card whose name contains 「筋力」).
const richCodexBase=rich;
rich=function(s){const names=[...new Set([...evolutionNames(),...Object.keys(keywords)])].sort((a,b)=>b.length-a.length);if(!names.length)return richCodexBase(s);const escapeRegex=v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const expression=new RegExp('('+names.map(escapeRegex).join('|')+')','g'),known=new Set(names);return String(s).split(expression).map(part=>known.has(part)?`<strong class="keyword">${escapeHTML(part)}</strong>`:richCodexBase(part)).join('');};
function updateCodexQueryResults(){const result=$('codex-card-results'),count=$('codex-result-count');if(!result||!count)return;hideEvolutionPreview();if(typeof hideCardHelpPortal==='function')hideCardHelpPortal();const cards=codexResults();result.innerHTML=codexCardsHTML(cards);count.textContent=cards.length+' / '+visibleCodexPool().length+'枚';wireEvolutionPreviews();if(typeof wireCardHelpPortals==='function')wireCardHelpPortals();}
function bindCodexQuery(input){input.oncompositionstart=()=>{input.codexComposing=true;};input.oncompositionend=()=>{input.codexComposing=false;activeCodexFilters().query=input.value;updateCodexQueryResults();};input.oninput=e=>{if(input.codexComposing||e?.isComposing)return;activeCodexFilters().query=input.value;updateCodexQueryResults();};}
function decorateEvolutionCard(html,c){if(!c?.evolution)return html;html=html.replace('<span class="latent-badge">潜在</span>','<span class="latent-badge">潜在</span><span class="evolution-badge">進化</span>');return html.replace(/(<small class="card-category">)(.*?)(<\/small>)/,(_,a,b,z)=>a+b.split('・').filter(x=>x!=='進化').join('・')+z);}
const cardEvolutionBase=card;card=function(id,action='',extra=''){return decorateEvolutionCard(cardEvolutionBase(id,action,extra),C[id]);};
function hideEvolutionPreview(){document.getElementById('evolution-preview')?.remove?.();}
function evolutionPreviewPosition(rect,width,height,viewportWidth,viewportHeight){return {left:Math.max(8,Math.min(rect.left-width-12,viewportWidth-width-8)),top:Math.max(8,Math.min(rect.top,viewportHeight-height-8))};}
function showEvolutionPreview(wrap){const source=wrap.querySelector('[data-card]'),c=C[source?.dataset.card],next=C[c?.evolveTo];hideEvolutionPreview();if(!next||busy||drag)return;const node=document.createElement('aside');node.id='evolution-preview';node.className='evolution-preview';node.setAttribute('role','tooltip');node.setAttribute('aria-label','進化先：'+next.name);node.innerHTML=decorateEvolutionCard(cardEvolutionBase(next.id),next);node.querySelectorAll('[data-card]').forEach(el=>el.removeAttribute('data-card'));node.querySelectorAll('button').forEach(el=>{el.tabIndex=-1;el.setAttribute('aria-disabled','true');el.classList.remove('playable','unplayable','empowered');});document.body.appendChild(node);const rect=source.getBoundingClientRect(),position=evolutionPreviewPosition(rect,node.offsetWidth,node.offsetHeight,window.innerWidth,window.innerHeight);node.style.left=position.left+'px';node.style.top=position.top+'px';}
function wireEvolutionPreviews(){document.querySelectorAll('.card-wrap').forEach(wrap=>{const source=wrap.querySelector('[data-card]');if(C[source?.dataset.card]?.evolveTo==null)return;wrap.onmouseenter=()=>showEvolutionPreview(wrap);wrap.onmouseleave=hideEvolutionPreview;wrap.onfocusin=()=>showEvolutionPreview(wrap);wrap.onfocusout=hideEvolutionPreview;});}
keywords.進化='使用後、進化先のカードに変化する。進化後のカードは報酬や生成からは取得できない。戦闘終了時、進化の段階はリセットされる。';
const renderCodexBase=render;
render=function(){if(globalThis.ASHBOUND_LOADING)return;hideEvolutionPreview();renderCodexBase();if(page==='book'){const input=$('codex-query');if(input)bindCodexQuery(input);}wireEvolutionPreviews();};
if(!globalThis.ASHBOUND_HEADLESS)render();
