const balanceStorageKey = 'ashbound/balance/v1/releases.json';
const emptyBalanceSettings = {version:1,cards:{},cardEffects:{},enemyHp:{},enemyActions:{},solo:{},pairs:{}};

function validBalanceSettings(settings) {
  if (settings?.version !== 1 || Object.keys(settings).some(key => key !== 'version' && !Object.hasOwn(BALANCE_FIELDS,key))) return false;
  for (const [group, fields] of Object.entries(BALANCE_FIELDS)) {
    const values = settings[group] ?? (group === 'enemyActions' ? {} : undefined);
    if (!values || typeof values !== 'object' || Array.isArray(values)) return false;
    for (const [key, value] of Object.entries(values)) {
      if (!Object.hasOwn(fields,key)) return false;
      const [min,max,step] = fields[key];
      if (!Number.isFinite(value) || value < min || value > max || (step === 1 && !Number.isInteger(value))) return false;
    }

  }
  return !BALANCE_WEIGHT_GROUPS.some(rows => rows.every(([group,id]) => settings[group][id] === 0));
}

async function balanceRequest(req, env, admin) {
  if (req.method !== 'GET' && (!admin || req.method !== 'PUT')) return json({error:'method'},405);
  try {
    let raw = '';
    if (req.method === 'PUT') {
      if (Number(req.headers.get('content-length')) > 64000 || !req.headers.get('content-type')?.startsWith('application/json')) return json({error:'invalid'},400);
      raw = await req.text();
      if (raw.length > 64000) return json({error:'size'},413);
    }
    if (admin && !await validBalanceProof(req,env,raw)) return json({error:'forbidden'},403);
    const object = await env.SAVES.get(balanceStorageKey);
    const releases = object ? await object.json() : [{revision:null, settings:emptyBalanceSettings}];
    const current = releases[0];
    if (req.method === 'GET') return json(admin ? {current,history:releases.slice(1)} : current);
    let draft;
    try {
      draft = JSON.parse(raw);
    } catch {
      return json({error:'invalid'},400);
    }
    if (draft?.revision !== current.revision) return json({error:'conflict'},409);
    if (!validBalanceSettings(draft.settings)) return json({error:'invalid'},400);
    const next = {revision:crypto.randomUUID(), publishedAt:new Date().toISOString(), settings:draft.settings};
    const saved = await env.SAVES.put(balanceStorageKey, JSON.stringify([next,...releases].slice(0,21)), {
      onlyIf:object ? {etagMatches:object.etag} : {etagDoesNotMatch:'*'},
    });
    return saved ? json({current:next}) : json({error:'conflict'},409);
  } catch {
    return json({error:'storage_unavailable'},503);
  }
}
