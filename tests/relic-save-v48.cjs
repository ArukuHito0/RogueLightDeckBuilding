const fs=require('fs'),vm=require('vm'),assert=require('assert');let saved=null;const root=require('path').join(__dirname,'../dist/');const scripts=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);function load(){let noop=()=>{},el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};let ctx={console,Math,assert,localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0}};vm.createContext(ctx);for(let f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});return ctx}

let c=load();vm.runInContext(`
render=()=>save();S.run=null;busy=false;S.relicQueue=[];S.relicReroll=null;S.deck=[0,0,0,1,1,1,2,2,2,3];S.relicVault=[{id:'test',name:'test',icon:'◇',effects:['energy_hp']}];S.equippedRelicId='test';equipRelic(null);assert.equal(S.equippedRelicId,null);startSelectedCharacter();assert.equal(S.run.carriedRelic,null);assert.equal(S.run.max,70);finish(false);assert.equal(S.equippedRelicId,null);save();`,c);
c=load();vm.runInContext(`
assert.equal(S.equippedRelicId,null);render=()=>save();startSelectedCharacter();assert.equal(S.run.carriedRelic,null);assert.equal(S.run.energyMax,3);assert.equal(S.run.max,70);save();`,c);
c=load();vm.runInContext(`
assert.equal(S.run.carriedRelic,null);assert.equal(S.equippedRelicId,null);render=()=>save();finish(false);equipRelic('test');startSelectedCharacter();assert.equal(S.run.carriedRelic.id,'test');assert.equal(S.run.max,56);save();`,c);
c=load();vm.runInContext(`
assert.equal(S.run.carriedRelic.id,'test');assert.equal(S.run.max,56);
const by=n=>C.find(c=>c.name===n);assert.equal(by('強靭な肉体').fx.plate,4);assert.equal(by('強靭な肉体').rarity,'common');assert.equal(by('鍛錬の一撃').rarity,'common');assert(by('腐食の切先').retired);assert(!packPool().includes(by('毒針')));assert(allowedRunCard(by('毒針')));assert(!allowedRunCard(by('腐食の切先')));
render=()=>save();S.run=null;S.deck=[0,1];resetDeck();assert.deepEqual(S.deck,[0,1]);cancelResetDeck();assert.deepEqual(S.deck,[0,1]);resetDeck();confirmResetDeck();assert.equal(S.deck.length,0);
`,c);console.log('PASS: relic unequip/start/return/reload/restart, equipped reload, deck confirmation and pools');
