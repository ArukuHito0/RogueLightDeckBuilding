import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/server/index.js',import.meta.url),'utf8');
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
let object;
const env={BALANCE_PUBLISH_KEY:'test-key',SAVES:{
  async get(){return object;},
  async put(key,raw,{onlyIf}){
    assert.equal(key,'ashbound/balance/v1/releases.json');
    if(object ? onlyIf.etagMatches!==object.etag : onlyIf.etagDoesNotMatch!=='*') return null;
    object={etag:crypto.randomUUID(),json:async()=>JSON.parse(raw)};
    return object;
  },
}};
const url='https://game.test';
const origin='https://ashbound-balance-editor.takeshita0205ayumu.chatgpt.site';
const send=async(path,{admin=false,...options}={})=>{
  const headers={...options.headers};
  if(admin){
    const expires=Date.now()+60000;
    const {createHmac}=await import('node:crypto');
    const signature=createHmac('sha256','test-key').update((options.method||'GET')+'\n'+expires+'\n'+(options.body||'')).digest('hex');
    headers.origin=origin;
    headers['x-balance-proof']=expires+'.'+signature;
  }
  return worker.fetch(new Request(url+path,{...options,headers}),env);
};
const read=async(path,options)=>(await send(path,options)).json();
const initial=await read('/api/balance');
assert.equal(initial.revision,null);
assert.equal((await send('/api/balance-admin')).status,403);
assert.equal((await send('/api/balance',{method:'PUT'})).status,405);
const write=(revision,settings)=>send('/api/balance-admin',{method:'PUT',admin:true,headers:{'content-type':'application/json'},body:JSON.stringify({revision,settings})});
assert.equal((await write(null,{...initial.settings,enemyHp:{'unknown':20}})).status,400);
const draft={...initial.settings,enemyHp:{'1:boss':321},cardEffects:{'0:d':9}};
const results=await Promise.all([write(null,draft),write(null,draft)]);
assert.deepEqual(results.map(x=>x.status).sort(),[200,409]);
const published=await read('/api/balance');
assert.deepEqual(published.settings,draft);
assert.equal(Object.hasOwn(published,'history'),false);
const releases=await read('/api/balance-admin',{admin:true});
assert.deepEqual(releases.history,[initial]);
assert.equal((await write(published.revision,initial.settings)).status,200);
assert.deepEqual((await read('/api/balance')).settings,initial.settings);
console.log('PASS balance publication access, validation, concurrent update and rollback');
