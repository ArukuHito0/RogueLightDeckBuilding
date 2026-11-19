const {workerHarness}=require('./ai-stage1.cjs'),vm=require('vm'),assert=require('assert');
(async()=>{const h=workerHarness();await h.run('codex-v52');h.context.assert=assert;vm.runInContext(`
render=()=>{};bookType='run';
const selected=S.selectedCharacter,deckBefore=JSON.stringify(S.deck),runBefore=JSON.stringify(S.run);
setCodexCharacter('hunter');assert.equal(codexPool().length,78);assert.equal(codexCharacter().id,'hunter');assert.equal(S.selectedCharacter,selected);assert.equal(JSON.stringify(S.deck),deckBefore);assert.equal(JSON.stringify(S.run),runBefore);
const expected=codexPool().map(c=>c.id).sort(cardOrder);assert.deepEqual(Array.from(codexResults(),c=>c.id),Array.from(expected));let html=book();const order=[...html.matchAll(/data-card="([0-9]+)"/g)].map(m=>+m[1]);assert.deepEqual(order,Array.from(expected));
assert(html.includes('灰の放浪者'));assert(html.includes('獣の狩人'));for(const name of ['レアリティ','キーワード','コスト','軸','カードタイプ'])assert(html.includes('aria-label="'+name+'"'));
setCodexFilter('rarity','rare');assert(codexResults().length);assert(codexResults().every(c=>c.rarity==='rare'));
setCodexFilter('cost','X');assert.deepEqual(Array.from(codexResults(),c=>c.name),['切り刻む','襲撃']);
setCodexFilter('type','攻撃');assert.deepEqual(Array.from(codexResults(),c=>c.name),['襲撃']);
clearCodexFilters();setCodexFilter('keyword','裂傷');assert(codexResults().length);assert(codexResults().every(c=>c.desc.includes('裂傷')));
setCodexFilter('query','抉る爪');assert.deepEqual(Array.from(codexResults(),c=>c.name),['抉る爪']);clearCodexFilters();
setCodexFilter('type','進化');assert(codexResults().length);assert(codexResults().every(c=>c.evolution));clearCodexFilters();
setCodexFilter('axis',C[HUNTER_IDS['抉る爪']].axis);assert(codexResults().every(c=>codexAxes(c).includes(C[HUNTER_IDS['抉る爪']].axis)));clearCodexFilters();
setCodexFilter('query','no-matching-card');assert.equal(codexResults().length,0);assert(book().includes('条件に一致するカードがありません'));clearCodexFilters();
assert(!codexKeywords(C[HUNTER_IDS['牙']]).includes('噛みつき'));setCodexFilter('query','噛みつき');assert.deepEqual(Array.from(codexResults(),c=>c.name),['牙','噛みつき']);clearCodexFilters();
for(const c of C.filter(c=>c.evolveTo!=null)){const name=C[c.evolveTo].name;assert(rich(c.desc).includes('<strong class="keyword">'+name+'</strong>'),c.name);assert(card(c.id).includes('<strong class="keyword">'+name+'</strong>'),c.name);}
assert(rich('筋力+1。除外。').includes('<strong class="keyword">筋力</strong>'));assert(rich('筋力+1。除外。').includes('<strong class="keyword">除外</strong>'));
setCodexCharacter('wanderer');assert(codexResults().every(c=>c.characterId==='wanderer'));assert(!codexResults().some(c=>c.characterId==='hunter'));assert(!book().includes('進化カード</h3>'));assert.equal(S.selectedCharacter,selected);assert.equal(JSON.stringify(S.run),runBefore);
bookType='base';assert(book().includes('基礎カード'));bookType='relics';assert(book().includes('遺物の効果図鑑'));bookType='run';
// Adding character/card metadata automatically supplies its switch and filters.
CHARACTERS.future={id:'future',name:'未来の探索者',hp:100,icon:'◈'};const futureBase=C.length;
C.push({id:futureBase,name:'未来の技',characterId:'future',runOnly:true,rarity:'rare',cost:4,fx:{b:1},types:['防御'],axes:['未来軸'],evolveTo:futureBase+1,desc:'筋力の牙+改に進化。'});
C.push({id:futureBase+1,name:'筋力の牙+改',characterId:'future',runOnly:true,rarity:'rare',cost:5,fx:{b:2},types:['防御'],axes:['未来軸'],evolution:true,desc:'2ブロック。'});
setCodexCharacter('future');assert.equal(codexResults().length,2);assert(book().includes('未来の探索者'));assert(book().includes('未来軸'));setCodexFilter('cost','5');setCodexFilter('type','進化');assert.equal(codexResults()[0].id,futureBase+1);assert.equal(rich(C[futureBase].desc),'<strong class="keyword">筋力の牙+改</strong>に進化。'.replace('進化','<strong class="keyword">進化</strong>'));
assert.equal(S.selectedCharacter,selected);assert.equal(JSON.stringify(S.deck),deckBefore);assert.equal(JSON.stringify(S.run),runBefore);
`,h.context);console.log('PASS codex: rarity/registration order, 5 combinable filters + text, X cost, evolution, character browsing isolation, rich evolution names, future character metadata');})().catch(e=>{console.error(e);process.exit(1)});
