const fs=require('fs'),vm=require('vm'),assert=require('assert');let saved=null;const root=require('path').join(__dirname,'../dist/');const scripts=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);function load(){let noop=()=>{},el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};let ctx={console,Math,assert,localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0}};vm.createContext(ctx);for(let f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});return ctx}



const c=load();vm.runInContext(`
S.run=null;selectCharacter('lucky');S.deck=[0,0,0,1,1,1,2,2,2,3];S.equippedRelicId=null;startSelectedCharacter();choose('fight');
const r=S.run;r.enemies=[{hp:10000,max:10000,block:0,poison:0,intent:'attack',atk:1}];r.draw=[0,1];r.hand=[luckyInstance(r,LUCKY_IDS.jump),luckyInstance(r,LUCKY_IDS.hop)];page='battle';busy=false;
const button={onclick:null,classList:{remove(){}},setAttribute(){},addEventListener(){}};
document.querySelectorAll=selector=>(selector==='.card'||selector==='.hand .card')?[button]:[];
luckyChoice(r,'discard','捨てるカードを選ぶ',luckyCandidates(r,'hand'),2);
render();assert(r.pendingChoice.luckyDiscard);assert.equal(r.pendingChoice.remaining,2);assert(!luckyChoiceHTML(r).includes('overlay'));assert(battle().includes('hand-prompt'));
const before=r.enemies[0].hp;r.pendingChoice.inspect=true;button.onclick();assert.equal(r.hand.length,2);r.pendingChoice.inspect=false;
button.onclick();assert.equal(r.hand.length,1);assert.equal(r.pendingChoice.remaining,1);assert.equal(r.enemies[0].hp,before,'folds wait until all selections');
button.onclick();assert.equal(r.pendingChoice,null);assert.equal(r.lucky.choice,null);assert.equal(r.enemies[0].hp,before-10);assert.equal(r.block,17);
r.hand=[0,1];r.draw=[0,1];luckyChoice(r,'discard','捨てるカードを選ぶ',luckyCandidates(r,'hand'),2,{optional:true,redraw:true});render();assert(battle().includes('ここまでで決定'));button.onclick();luckyFinishChoice();assert.equal(r.pendingChoice,null);assert.equal(r.hand.length,2);assert.equal(r.lucky.queue.length,0);
`,c);console.log('PASS v96: direct hand selection, inspect guard, multi-select fold timing and optional redraw');
