// A private worker owns its own game state and in-memory save. No player save is read.
importScripts('ai-config.js','ai-random.js');
let started=false;
self.onmessage=async ({data})=>{if(started||data?.type!=='start')return;started=true;
 try{
  const seed=String(data.seed||'ashbound-1').slice(0,128);Math.random=makeTestRandom(seed+'/game');globalThis.ASHBOUND_HEADLESS=true;
  // Compatibility shell only: these nodes are never rendered. Gameplay still uses the shipped engine.
  const noop=()=>{},node={innerHTML:'',textContent:'',style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};
  let memorySave=null;globalThis.localStorage={getItem:()=>memorySave,setItem:(_,value)=>{memorySave=value}};
  globalThis.window={addEventListener:noop};globalThis.document={body:node,documentElement:node,getElementById:()=>node,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop};globalThis.requestAnimationFrame=noop;
  importScripts(...AI_TEST_CONFIG.gameScripts,'ai-tuning.js','ai-reference.js','ai-policy.js','ai-learning.js','ai-runner.js');
  const result=await AI_STAGE1.run(seed,progress=>self.postMessage({type:'progress',progress}),data.options||{});self.postMessage({type:'done',result});
 }catch(error){self.postMessage({type:'error',message:String(error?.message||error)})}
};
