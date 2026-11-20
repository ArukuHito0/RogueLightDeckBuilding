const maxSize=900_000;
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const revision=object=>object?.customMetadata?.revision||null;
export default {async fetch(req,env){
  const url=new URL(req.url);
  if(url.pathname==='/api/balance')return balanceRequest(req,env,false);
  if(url.pathname==='/api/balance-admin')return balanceAdmin(req,env);
  if(url.pathname!=='/api/cloud-save'){
    if(req.method!=='GET'&&req.method!=='HEAD')return new Response(null,{status:405});
    const name=url.pathname==='/'?'index.html':url.pathname.slice(1);
    const file=Object.hasOwn(ASSETS,name)?ASSETS[name]:null;
    return file?new Response(req.method==='HEAD'?null:file[1],{headers:{'Content-Type':file[0],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}}):new Response('Not found',{status:404});
  }
  const id=req.headers.get('oai-authenticated-user-id');
  if(!id)return json({error:'sign_in_required'},401);
  const account=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id))),x=>x.toString(16).padStart(2,'0')).join('');
  const key='ashbound/v1/'+account+'.json';
  try{
    if(req.method==='GET'){
      const record=await env.SAVES.get(key);
      return json({account,revision:revision(record),save:record?await record.json():null});
    }
    if(req.method!=='PUT')return json({error:'method'},405);
    if(req.headers.get('origin')!==url.origin||!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'origin'},403);
    if(Number(req.headers.get('content-length'))>maxSize||!req.body)return json({error:'size'},413);
    const reader=req.body.getReader(),decoder=new TextDecoder();let total=0,raw='';
    while(true){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxSize){await reader.cancel();return json({error:'size'},413);}raw+=decoder.decode(value,{stream:true});}
    raw+=decoder.decode();
    let data;try{data=JSON.parse(raw);}catch{return json({error:'invalid'},400);}
    if(data?.account!==account)return json({error:'account_changed'},409);
    const save=data.save;
    if(save?.v!==1||!Array.isArray(save.deck)||!save.collection||typeof save.collection!=='object'||!Object.hasOwn(save,'run'))return json({error:'invalid'},400);
    const current=await env.SAVES.head(key);
    if(data.revision!==revision(current))return json({error:'conflict'},409);
    const next=crypto.randomUUID();
    const saved=await env.SAVES.put(key,JSON.stringify(save),{onlyIf:current?{etagMatches:current.etag}:{etagDoesNotMatch:'*'},customMetadata:{revision:next}});
    return saved?json({revision:next}):json({error:'conflict'},409);
  }catch{return json({error:'storage_unavailable'},503);}
}};
