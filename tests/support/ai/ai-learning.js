// Residual tabular Q-learning. Only public observations enter the learner.
(function(){
 const config={version:'q-v1',alpha:.15,gamma:.95,epsilon:.15,scale:20,maxEntries:40000,rewards:{win:20,loss:-12,floor:2,damage:.025,hpLoss:.15,action:-.015}};
 function hash(x){let h=2166136261;for(const ch of JSON.stringify(x)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
 function fingerprint(overrides){return hash({rules:AI_TEST_CONFIG.rulesVersion,policy:AI_POLICY.config.version,config,overrides:overrides||{}})}
 const bucket=(n,size,max=9)=>Math.max(0,Math.min(max,Math.floor((n||0)/size)));
 function state(o){return [o.mode,bucket(o.floor,3),bucket(o.hp/Math.max(1,o.maxHp),.25,4),bucket(o.energy,1,6),bucket(AI_POLICY.incoming(o)-o.block,5),bucket(o.strength,3),bucket((o.enemies||[]).reduce((n,e)=>n+e.poison,0),5),o.enemies?.some(e=>e.boss&&!e.audienceUsed)?'audience':'normal',o.statuses?.retainBlock?1:0,o.statuses?.poisonDouble||0].join('|')}
 function key(o,a){const enemy=o.enemies?.find(e=>e.index===a.enemy);return state(o)+'/'+[a.type,a.cardId??(a.type==='node'?o.map?.[a.row]?.[a.lane]?.type:a.index??''),enemy?bucket(enemy.hp,25):'',enemy?bucket(enemy.poison,5):''].join(':')}
 function create(input={}){const q=Object.assign(Object.create(null),input.q||{});return {size:Object.keys(q).length,version:config.version,q,episodes:input.episodes||0,updates:input.updates||0}}
 function base(a,o,axis,w){return Math.max(-100,Math.min(100,AI_POLICY.score(a,o,axis,w)))/config.scale}
 function value(m,a,o,axis,w){return base(a,o,axis,w)+(m.q[key(o,a)]||0)}
 function choose(m,o,rng,axis,w,epsilon=0){if(epsilon>0&&rng()<epsilon)return o.actions[Math.floor(rng()*o.actions.length)];let ranked=o.actions.map(a=>({a,v:value(m,a,o,axis,w)})).sort((a,b)=>b.v-a.v);let best=ranked.filter(x=>Math.abs(x.v-ranked[0].v)<1e-9);return best[Math.floor(rng()*best.length)].a}
 function reward(before,after,terminal,damage,hpLoss){return config.rewards.action+Math.max(0,(after?.floor||before.floor)-before.floor)*config.rewards.floor+damage*config.rewards.damage-hpLoss*config.rewards.hpLoss+(terminal==='win'?config.rewards.win:terminal==='loss'?config.rewards.loss:0)}
 function update(m,o,a,next,r,axis,w){const k=key(o,a);if(!(k in m.q)){if(m.size>=config.maxEntries)return;m.size++;}const current=value(m,a,o,axis,w),future=next?.actions?.length?Math.max(...next.actions.map(x=>value(m,x,next,axis,w))):0;m.q[k]=(m.q[k]||0)+config.alpha*(r+config.gamma*future-current);m.updates++}
 globalThis.AI_LEARNING={config,fingerprint,hash,state,key,create,value,choose,reward,update};
})();
