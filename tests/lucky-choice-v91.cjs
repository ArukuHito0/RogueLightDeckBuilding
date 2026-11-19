const fs=require('fs'),vm=require('vm'),assert=require('assert');let saved=null;const root=require('path').join(__dirname,'../dist/');const scripts=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);function load(){let noop=()=>{},el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};let ctx={console,Math,assert,localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0}};vm.createContext(ctx);for(let f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});return ctx}


const c=load();vm.runInContext(`
S.run=null;selectCharacter('lucky');S.deck=[0,0,0,1,1,1,2,2,2,3];S.equippedRelicId=null;startSelectedCharacter();choose('fight');
const r=S.run;r.enemies=[{hp:10000,max:10000,block:0,poison:0,intent:'attack',atk:1}];r.draw=[0,1];r.hand=[];page='battle';busy=false;
const button={onclick:null,classList:{remove(){}},addEventListener(){}};
document.querySelectorAll=selector=>(selector==='.card'||selector==='.lucky-choice-panel .lucky-option .card')?[button]:[];
luckyChoice(r,'recover','山札から手札へ',[{id:0,pile:'draw'},{id:1,pile:'draw'}],1);
render();assert.equal(typeof button.onclick,'function','render must restore selection after battle clears clicks');
button.onclick();assert(r.hand.includes(0));assert(!r.draw.includes(0));assert.equal(r.lucky.choice,null);
r.hand=[];r.draw=[0,1];luckyChoice(r,'recover','山札から手札へ',[{id:0,pile:'draw'},{id:1,pile:'draw'}],1);
render();render();button.onclick();assert.equal(r.hand.length,1,'rerender must not duplicate selection');
`,c);console.log('PASS v91 rendered choice click survives battle event cleanup and rerender');
