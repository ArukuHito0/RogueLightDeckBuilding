const fs=require('fs'),vm=require('vm'),assert=require('assert');
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(m=>m[1]);
let saved=null;
function load(seed=1){
  const noop=()=>{},nodes=new Map(),el=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop});return nodes.get(id)};
  const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const c=vm.createContext({assert,console,Math:math,localStorage:{getItem:k=>k==='ashbound-v1'?saved:null,setItem:(k,v)=>{if(k==='ashbound-v1')saved=v}},document:{body:el('body'),documentElement:el('html'),getElementById:el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,cancelAnimationFrame:noop,performance:{now:()=>0}});
  for(const f of scripts)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c,{filename:f});
  return {c,nodes};
}
let {c,nodes}=load();
vm.runInContext(`
const counts={elite:new Set(),shop:new Set(),unknown:new Set(),rest:new Set()};let unavoidableElite=false,threeElites=false;
for(let trial=0;trial<2000;trial++){
  let r={};createMap(r);assert.equal(r.nodes.length,12);assert.equal(r.worldVersion,5);assert.equal(r.economyVersion,1);
  let all=r.nodes.flat();
  for(const [type,min,max] of [['elite',5,7],['shop',2,3],['unknown',4,7],['rest',3,3]]){
    let n=all.filter(n=>n.type===type&&(type!=='rest'||n.row!==10)).length;
    assert(n>=min&&n<=max,type+': '+n);counts[type].add(n);
  }
  assert(r.nodes[0].every(n=>n.type==='fight'));assert(r.nodes[9].every(n=>n.type!=='rest'));
  assert.equal(r.nodes.slice(0,4).flat().filter(n=>n.type==='rest').length,1);
  assert.equal(r.nodes.slice(5,10).flat().filter(n=>n.type==='rest').length,2);
  for(let row=0;row<12;row++){
    const fixed={4:'event',10:'rest',11:'boss'}[row];
    assert.equal(r.nodes[row].length,fixed?1:3);
    for(const n of r.nodes[row]){
      assert.equal(n.row,row);
      if(fixed)assert.equal(n.type,fixed);
      else assert((row<4?['fight','unknown','rest']:['fight','unknown','elite','shop','rest']).includes(n.type));
      if(row===11)assert.equal(n.edges.length,0);
      else {assert(n.edges.length>0);assert.equal(new Set(n.edges).size,n.edges.length);for(const lane of n.edges){assert(r.nodes[row+1][lane]);assert(!(n.type==='rest'&&r.nodes[row+1][lane].type==='rest'));assert(!(n.type==='shop'&&r.nodes[row+1][lane].type==='shop'));if(r.nodes[row].length===3&&r.nodes[row+1].length===3)assert(Math.abs(lane-n.lane)<=1)} }
    }
  }
  // Enumerate route extrema through the actual generated edges, not just node totals.
  let ranges=r.nodes[0].map(()=>[0,0]),streaks=r.nodes[0].map(()=>0);
  for(let row=0;row<11;row++){
    let next=r.nodes[row+1].map(()=>[Infinity,-Infinity]),nextStreaks=r.nodes[row+1].map(()=>0);
    r.nodes[row].forEach((n,l)=>n.edges.forEach(k=>{let v=r.nodes[row+1][k].type==='elite'?1:0;next[k][0]=Math.min(next[k][0],ranges[l][0]+v);next[k][1]=Math.max(next[k][1],ranges[l][1]+v);let streak=v?streaks[l]+1:0;assert(streak<=3,'four connected elites');if(streak===3)threeElites=true;nextStreaks[k]=Math.max(nextStreaks[k],streak)}));ranges=next;streaks=nextStreaks;
  }
  assert(Number.isFinite(ranges[0][0]));assert(Number.isFinite(ranges[0][1]));
  if(ranges[0][0]>0)unavoidableElite=true;
}
assert.equal(counts.elite.size,3);assert.equal(counts.shop.size,2);assert.equal(counts.unknown.size,4);assert.equal(counts.rest.size,1);assert(unavoidableElite);assert(threeElites,'three consecutive elites remain allowed');
S.deck=[0,0,0,1,1,1,2,2,2,3];startSelectedCharacter();assert.equal(S.run.nodes.length,12);
assert(home().includes('全12階層'));assert(map().includes('0 0 700 1362'));assert(map().includes('height:1362px'));assert(walletHTML().includes('/12層'));
S.run.potionCapacityVersion=1;S.run.hp=43;S.run.gold=123;S.run.floor=6;S.run.nodePath=[{row:4,lane:0}];save();
globalThis.expected=JSON.stringify(S.run);
`,c);
const expected=c.expected,cardIds=vm.runInContext('JSON.stringify(C.map(c=>[c.id,c.name]))',c);
({c,nodes}=load());c.expected=expected;
vm.runInContext(`assert.equal(JSON.stringify(S.run),expected);assert.equal(S.v,1)`,c);
// A v43-shaped saved map keeps every node, edge, path entry and current encounter.
vm.runInContext(`let r=S.run;r.nodes=r.nodes.slice(0,10);r.nodes[8]=[{row:8,lane:0,type:'rest',edges:[0]}];r.nodes[9]=[{row:9,lane:0,type:'boss',edges:[]}];r.nodes[7].forEach(n=>n.edges=[0]);r.worldVersion=1;r.floor=9;r.nodePath=[{row:7,lane:1},{row:8,lane:0}];r.mode=page='rest';save();globalThis.expected=JSON.stringify(r);`,c);
const legacy=c.expected;
({c,nodes}=load());c.expected=legacy;
vm.runInContext(`assert.equal(JSON.stringify(S.run),expected);assert(map().includes('0 0 700 1138'));assert(walletHTML().includes('/10層'));next();assert.equal(S.run.floor,10);assert(available(S.run.nodes[9][0]));enterNode(9,0);assert.equal(S.run.kind,'boss');S.run.enemies.forEach(e=>e.hp=0);victory();assert.equal(S.run,null);assert(S.last.win);`,c);
assert.equal(vm.runInContext('JSON.stringify(C.map(c=>[c.id,c.name]))',c),cardIds);
// Drive a new run through every floor, including real chest, rest and boss transitions.
vm.runInContext(`S.relicQueue=[];page='home';startSelectedCharacter();let r=S.run;r.hp=r.max=9999;while(S.run){r=S.run;assert(r.floor<=12);let n=r.nodes[r.floor-1].find(available);assert(n);enterNode(n.row,n.lane);if(r.mode==='battle'){r.enemies.forEach(e=>e.hp=0);victory();if(S.run)take(-1)}else if(r.mode==='chest'){claimChest();next()}else if(r.mode==='mystery'){resolveMystery(0);next()}else next()}assert(S.last.win);assert.equal(S.last.floor,12);`,c);
vm.runInContext(fs.readFileSync('tests/support/ai/ai-config.js','utf8'),c);
assert.deepStrictEqual(Array.from(c.AI_TEST_CONFIG.gameScripts),scripts);
console.log('PASS: 2000 maps, elite streak at most 3 on every connected route, triples allowed, count ranges, spaced rests/shops, completion, reload, card IDs and script parity');
