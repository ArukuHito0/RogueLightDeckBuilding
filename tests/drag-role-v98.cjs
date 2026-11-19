const fs=require('fs'),vm=require('vm'),assert=require('assert');let saved=null;const root=require('path').join(__dirname,'../dist/');const scripts=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);function load(){let noop=()=>{},el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};const handlers=[];let ctx={handlers,console,Math,assert,localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(type,fn,capture)=>handlers.push({type,fn,capture})},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0}};vm.createContext(ctx);for(let f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});return ctx}


const c=load();vm.runInContext(`
render=()=>{};S.run=null;selectCharacter('lucky');S.deck=[0,0,0,1,1,1,2,2,2,3];S.equippedRelicId=null;startSelectedCharacter();choose('fight');
const r=S.run;r.hand=[0];r.draw=[];r.enemies=[{hp:100,max:100,block:0,poison:0}];busy=false;page='battle';
luckyChoice(r,'top','順番',luckyCandidates(r,'hand'),1);luckyTopPrepare(r);
let made=false,cleared=false;makeGhost=()=>made=true;clearDrag=()=>{cleared=true;drag=null;};
luckyTopDown({button:0,pointerId:7,clientX:20,clientY:30,preventDefault(){},stopImmediatePropagation(){},currentTarget:{classList:{add(){}}}},0);
assert(made);assert.equal(drag.type,'field');assert(drag.topOrder);
document.elementFromPoint=()=>({closest:()=>({dataset:{topSlot:'0'}})});
handlers.find(x=>x.type==='pointerup'&&x.fn.toString().includes('d?.topOrder')).fn({pointerId:7,clientX:200,clientY:200,preventDefault(){},stopImmediatePropagation(){}});
assert(cleared);assert.equal(r.lucky.choice.topSlots[0],0);assert.equal(r.draw.length,0);luckyFinishChoice(r);assert.equal(r.draw.pop(),0);
const html=luckyReferenceHTML();assert.equal((html.match(/data-role-preview=/g)||[]).length,5);assert(html.includes('カードの並び順が10101'));assert(html.includes('0～3コストのカードが1枚ずつ'));assert.equal(LUCKY_ROLE_DISPLAY.blackjack.digits,'10101');assert.equal(LUCKY_ROLE_DISPLAY.straight.digits,'0123X');
`,c);console.log('PASS v98: common field drag ghost, slot drop before shade, explicit confirm and five role summaries');
