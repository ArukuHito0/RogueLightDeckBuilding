import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';
const objects=new Map();
const bucket={
 async get(key){return objects.get(key);},
 async head(key){return objects.get(key);},
 async put(key,raw,options){
  const old=objects.get(key);
  if(old?options.onlyIf.etagMatches!==old.etag:options.onlyIf.etagDoesNotMatch!=='*')return null;
  const record={etag:crypto.randomUUID(),customMetadata:options.customMetadata,json:()=>JSON.parse(raw)};
  objects.set(key,record);return record;
 }
};
const url='https://ashbound.test/api/cloud-save';
function request(id,body,origin='https://ashbound.test'){
 const headers=id?{'oai-authenticated-user-id':id}:{};
 return worker.fetch(new Request(url,body===undefined?{headers}:{method:'PUT',headers:{...headers,origin,'content-type':'application/json'},body:JSON.stringify(body)}),{SAVES:bucket});
}
assert.equal((await request(null)).status,401);
const alice=await (await request('alice')).json();
const bob=await (await request('bob')).json();
assert.notEqual(alice.account,bob.account);
const save={v:1,deck:[0],collection:{0:1},run:null};
const data={account:alice.account,revision:null,save};
assert.equal((await request('bob',data)).status,409);
assert.equal((await request('alice',data,'https://other.test')).status,403);
const created=await request('alice',data);
assert.equal(created.status,200);
assert.equal((await request('alice',data)).status,409);
const record=await (await request('alice')).json();
assert.deepEqual(record.save,save);
assert.equal((await (await request('bob')).json()).save,null);
const writes=await Promise.all([1,2].map(gold=>request('alice',{account:alice.account,revision:record.revision,save:{...save,gold}})));
assert.deepEqual(writes.map(r=>r.status).sort(),[200,409]);
console.log('PASS authentication, account isolation, origin checks, restoration and concurrent-write protection');
