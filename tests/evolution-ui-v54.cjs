const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('evolution-ui-v54');h.context.assert=assert;vm.runInContext(`{
bookType='run';codexCharacterId='hunter';resetCodexFilters();page='book';busy=false;drag=null;
assert(!codexKeywords(C[HUNTER_IDS['牙']]).includes('噛みつき'));assert(!book().includes('<option value="噛みつき"'));assert(rich(C[HUNTER_IDS['牙']].desc).includes('<strong class="keyword">噛みつき</strong>'));
const html=card(HUNTER_IDS['噛みつき']);assert(html.includes('<span class="latent-badge">潜在</span><span class="evolution-badge">進化</span>'));assert(html.includes('<small class="card-category">攻撃</small>'));assert(!card(HUNTER_IDS['牙']).includes('evolution-badge'));
assert.equal(keywords.進化,'使用後、進化先のカードに変化する。進化後のカードは報酬や生成からは取得できない。戦闘終了時、進化の段階はリセットされる。');assert(tips(C[HUNTER_IDS['牙']]).includes('戦闘終了時、進化の段階はリセットされる。'));
// IME composition must not replace the input node or render intermediate romaji.
let renders=0;render=()=>{renders++;};const input={value:'',codexComposing:false},results={innerHTML:'original'},count={textContent:''};let preview=null,removed=0;
const get=document.getElementById,query=document.querySelectorAll,create=document.createElement,append=document.body.appendChild;
document.getElementById=k=>k==='codex-query'?input:k==='codex-card-results'?results:k==='codex-result-count'?count:k==='evolution-preview'?preview:null;
document.querySelectorAll=()=>[];bindCodexQuery(input);input.oncompositionstart();input.value='k';input.oninput({isComposing:true});assert.equal(results.innerHTML,'original');input.value='kあ';input.oninput({isComposing:true});assert.equal(results.innerHTML,'original');input.value='か';input.oncompositionend();assert.equal(input.value,'か');assert.notEqual(results.innerHTML,'original');assert.equal(document.getElementById('codex-query'),input);assert.equal(renders,0);
results.innerHTML='not-yet';input.value='牙';input.oninput({isComposing:false});assert.notEqual(results.innerHTML,'not-yet');assert(results.innerHTML.includes('牙'));assert.equal(renders,0);
// Fixed-position preview is outside the hand, appears to the left, and is inert.
const source={dataset:{card:String(HUNTER_IDS['牙'])},getBoundingClientRect:()=>({left:600,top:200})},wrap={querySelector:()=>source};let attrsRemoved=0,disabled=false;
document.createElement=()=>({style:{},offsetWidth:166,offsetHeight:245,setAttribute(){},remove(){removed++;preview=null;},querySelectorAll(selector){return selector==='[data-card]'?[{setAttribute(){},removeAttribute(){attrsRemoved++;}}]:selector==='button'?[{setAttribute(){disabled=true;},classList:{remove(){}}}]:[];}});
document.body.appendChild=n=>{preview=n;};window.innerWidth=1440;window.innerHeight=1000;document.querySelectorAll=selector=>selector==='.card-wrap'?[wrap]:[];
wireEvolutionPreviews();assert.equal(typeof wrap.onmouseenter,'function');assert.equal(typeof wrap.onfocusin,'function');wrap.onmouseenter();assert(preview.innerHTML.includes('噛みつき'));assert(preview.innerHTML.includes('evolution-badge'));assert.equal(preview.style.left,'422px');assert.equal(preview.style.top,'200px');assert.equal(attrsRemoved,1);assert(disabled);wrap.onmouseleave();assert.equal(preview,null);assert(removed>0);
for (const [effect,name] of [['tokenSword','灰の剣'],['tokenKnife','灰の投擲剣'],['copyDiscard','付け焼刃']]) {
  source.dataset.card=String(C.find(c=>c?.fx?.[effect]>0).id);
  const cardsBefore=Object.keys(C).join(',');
  const runBefore=JSON.stringify(S.run);
  wireEvolutionPreviews();
  wrap.onfocusin();
  assert(preview.innerHTML.includes(name));
  if(effect!=='copyDiscard')assert(/class="card token\\b/.test(preview.innerHTML));
  assert.equal(Object.keys(C).join(','),cardsBefore);
  assert.equal(JSON.stringify(S.run),runBefore);
  wrap.onfocusout();
  assert.equal(preview,null);
}
const small=evolutionPreviewPosition({left:20,top:900},166,245,390,900);assert.equal(small.left,8);assert.equal(small.top,647);
document.getElementById=get;document.querySelectorAll=query;document.createElement=create;document.body.appendChild=append;
}`,h.context);console.log('PASS v54: keyword exclusion, evolution badge/description, IME composition without input replacement, noninteractive left hover/focus preview and viewport bounds');})().catch(e=>{console.error(e);process.exit(1)});
