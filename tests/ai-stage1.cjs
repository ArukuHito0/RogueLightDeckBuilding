const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');const root=path.join(__dirname,'../dist/');
function workerHarness(legacy=false){const messages=[];let context;const sandbox={console,Math:Object.create(Math),setTimeout,clearTimeout,performance,postMessage:m=>messages.push(JSON.parse(JSON.stringify(m)))};sandbox.self=sandbox;sandbox.importScripts=(...files)=>{for(const f of files){vm.runInContext(fs.readFileSync(path.join(f.startsWith('ai-')?path.join(__dirname,'support/ai'):root,f),'utf8'),context,{filename:f});if(legacy&&f==='ai-policy.js'){vm.runInContext('globalThis.currentPolicy=AI_POLICY',context);vm.runInContext(fs.readFileSync(path.join(__dirname,legacy==='v37'?'fixtures/ai-policy-v37.js':'fixtures/ai-policy-v35.js'),'utf8'),context);vm.runInContext('globalThis.AI_POLICY={...currentPolicy,...AI_POLICY,incoming:currentPolicy.incoming}',context)}}};context=vm.createContext(sandbox);sandbox.importScripts('ai-worker.js');return {context,messages,async run(seed,options){await context.onmessage({data:{type:'start',seed,options}});let error=messages.find(m=>m.type==='error');if(error)throw Error(error.message);const done=messages.find(m=>m.type==='done');assert(done,'worker must post a terminal response');return done.result}}}
module.exports={workerHarness};
if(require.main===module)(async()=>{
const a=await workerHarness().run('ashbound-1'),b=await workerHarness().run('ashbound-1');assert.deepStrictEqual(a,b,'same seed must reproduce full action log');assert(['win','loss'].includes(a.outcome),a.note);assert(a.actions>0&&a.battles>0);console.log('seed ashbound-1:',a.outcome,'floor',a.floor,'actions',a.actions,'turns',a.turns);
const outcomes={},modes=new Set(),types=new Set();let maxFloor=0;for(let i=0;i<100;i++){const r=await workerHarness().run('verification-'+i);assert(['win','loss'].includes(r.outcome),JSON.stringify({seed:r.seed,outcome:r.outcome,note:r.note}));outcomes[r.outcome]=(outcomes[r.outcome]||0)+1;maxFloor=Math.max(maxFloor,r.floor);r.log.forEach(x=>{modes.add(x.mode);types.add(x.action.type)});}console.log('100 terminal runs:',outcomes,'max floor',maxFloor,'modes',[...modes].sort().join(','),'actions',[...types].sort().join(','));
// Observation must be independent of hidden draw ordering and enemy future plans.
const h=workerHarness();await h.run('privacy');vm.runInContext(`S.run=null;S.relicQueue=[];S.relicReroll=null;S.deck=[0,0,0,1,1,1,3,3,4,4];start();choose('fight');globalThis.obsBefore=JSON.stringify(AI_STAGE1.observe());S.run.draw.reverse();S.run.elitePool=['trio','plated','ravager'];for(const e of S.run.enemies){e.baseAtk=999;e.behavior='secret_future_behavior'}globalThis.obsAfter=JSON.stringify(AI_STAGE1.observe());`,h.context);assert.equal(h.context.obsBefore,h.context.obsAfter,'no private order or enemy behavior may leak');
const index=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]).filter(x=>!x.startsWith('ai-'));assert.deepStrictEqual(Array.from(h.context.AI_TEST_CONFIG.gameScripts),index,'worker uses all shipped gameplay scripts in exact order');
assert.equal(h.context.AI_STAGE1.randomPolicy({actions:[{type:'endTurn'}]},()=>.9).type,'endTurn');
// ACT4 policy follows the trigger timing and uses only visible card marks.
vm.runInContext(`
 const end={type:'endTurn'}, marked={type:'play',index:0,enemy:0}, clean={type:'play',index:1,enemy:0};
 const forestDeck=[{id:0,cost:1,fx:{d:6}},{id:1,cost:1,fx:{d:6}}];
 const forestTurn={mode:'battle',floor:10,hp:8,maxHp:70,energy:1,block:0,statuses:{},deck:forestDeck,hand:forestDeck,
  enemies:[{index:0,hp:30,maxHp:30,block:0,intent:'wait'}],actions:[end,marked,clean],forest:{erosion:5,marks:[4,0],atEnd:false}};
 globalThis.forestChoices=[
  AI_POLICY.chooseForestAction(marked,forestTurn,'block',1).index,
  AI_POLICY.chooseForestAction(end,{...forestTurn,forest:{...forestTurn.forest,atEnd:true}},'block',1).index,
  AI_POLICY.chooseForestAction({type:'handChoice',index:1},{...forestTurn,choice:{kind:'exhaust'},forest:{...forestTurn.forest,atEnd:true},
   actions:[{type:'handChoice',index:0},{type:'handChoice',index:1}]},'block',1).index
 ];
`,h.context);
assert.deepStrictEqual(Array.from(h.context.forestChoices),[1,0,0]);
// Top ordering must read the live pool, even if the original candidate list is stale.
await vm.runInContext(`(async()=>{
 const r=S.run;
 r.lucky={queue:[],choice:{kind:'top',remaining:1,selected:[],topSlots:[0,null],topPool:[1],candidates:[{id:0}]}};
 r.pendingChoice=null;
 const placement=AI_STAGE1.observe().actions;
 if(placement.length!==1||placement[0].type!=='luckyTop'||placement[0].cardId!==1)throw Error('山札に戻せるカードの候補が不正');
 await AI_STAGE1.execute(placement[0]);
 const finish=AI_STAGE1.observe().actions;
 if(finish.length!==1||finish[0].type!=='luckyFinish')throw Error('並べ替えを確定できない');
 await AI_STAGE1.execute(finish[0]);
 if(r.lucky.choice||r.pendingChoice||r.draw.at(-1)!==0||r.draw.at(-2)!==1)throw Error('山札順の確定結果が不正');
})()`,h.context);
console.log('PASS: deterministic worker protocol, full-run termination, public observation boundary and script parity');
})().catch(e=>{console.error(e);process.exit(1)});
