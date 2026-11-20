const balanceEditorOrigin = 'https://ashbound-balance-editor.takeshita0205ayumu.chatgpt.site';
const balanceCors = {
  'Access-Control-Allow-Origin':balanceEditorOrigin,
  'Access-Control-Allow-Methods':'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers':'content-type, x-balance-proof',
  'Vary':'Origin',
};

async function balanceAdmin(req, env) {
  if (req.headers.get('origin') !== balanceEditorOrigin) return json({error:'forbidden'},403);
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:balanceCors});
  const result = await balanceRequest(req,env,true);
  return new Response(result.body,{status:result.status,headers:{...Object.fromEntries(result.headers),...balanceCors}});
}

async function validBalanceProof(req, env, body) {
  const [expires, signature] = (req.headers.get('x-balance-proof') || '').split('.');
  const timeout = Number(expires);
  const now = Date.now();
  if (!env.BALANCE_PUBLISH_KEY || !Number.isSafeInteger(timeout) || timeout < now || timeout > now + 90000 ||
      !/^[a-f0-9]{64}$/.test(signature || '')) return false;
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw',bytes.encode(env.BALANCE_PUBLISH_KEY),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  return crypto.subtle.verify('HMAC',key,Uint8Array.from(signature.match(/../g),part=>parseInt(part,16)),
    bytes.encode(req.method+'\n'+expires+'\n'+body));
}
