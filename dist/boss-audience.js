// Gray-crowned king: explicit, saveable phase/action state.
function initializeAudience(e){if(e.audienceRevision===2)return;if(e.audienceRevision===1){e.audienceRevision=2;return;}const ratio=e.hp/e.max;e.hp=Math.max(0,Math.ceil(ratio*250));e.max=250;e.audienceRevision=2;e.audienceUsed=false;e.kingPhase=1;e.kingStep=0;e.kingCycles=0}
function triggerAudience(r,e){if(r.act===2||!e?.boss||e.hp<=0)return false;initializeAudience(e);if(e.audienceUsed||e.hp>150)return false;
 // Keep identity and encounter bookkeeping only: all attached buffs/debuffs are removed.
 const keep=new Set(['name','icon','hp','max','boss','audienceRevision','audienceUsed','kingPhase','kingStep','kingCycles','poisonTotal']);for(const key of Object.keys(e))if(!keep.has(key))delete e[key];
 e.str=3;e.poison=0;e.block=0;e.plate=0;e.audienceUsed=true;e.kingPhase=2;e.kingStep=-1;e.kingCycles=0;e.intent='stunned';e.atk=0;e.hits=0;e.move='謁見：行動不能';return true
}
bossPlan=function(r){if(r.act===2)return;const e=r.enemies?.[0];if(!e?.boss||e.hp<=0)return;initializeAudience(e);triggerAudience(r,e);e.phase=e.kingPhase;e.hits=1;e.guardAmount=0;
 if(e.kingPhase===1){const step=e.kingStep%4;if(step<3){e.intent='attack';e.atk=[7,12,20][step];e.move=['王の一撃','王の追撃','王の重撃'][step]}else{e.intent='kingBuff';e.atk=0;e.guardAmount=10;e.move='筋力+1・10ブロック'}}
 else if(e.kingStep===-1){e.intent='stunned';e.atk=0;e.hits=0;e.move='謁見：行動不能'}
 else if(e.kingStep===0){e.intent='attack';e.atk=30;e.move='開戦：王の強襲'}
 else{const step=(e.kingStep-1)%3;e.intent='attack';e.atk=step+1;e.hits=step+3;e.move=['灰の三連撃','灰の四連撃','灰の五連撃'][step]}
};
function finishKingAction(r,e,skipped=false){if(!e.boss||e.hp<=0)return;if(skipped){e.kingStep++;return;}if(e.kingPhase===1){if(e.kingStep%4===3){e.str=(e.str||0)+1;e.block=10}e.kingStep++;return}
 if(e.kingStep===-1){e.kingStep=0;return}if(e.kingStep===0){e.kingStep=1;return}
 if(e.kingStep%3===0){e.kingCycles++;if(e.kingCycles%2===0)e.str=(e.str||0)+1}e.kingStep++;
}
const damageAudience=dealDamage;dealDamage=function(e,n,options){const lost=damageAudience(e,n,options);if(e?.boss&&S.run)triggerAudience(S.run,e);return lost};
const intentAudience=intent;intent=function(e){if(!e.boss)return intentAudience(e);return `<span class="king-intent-value">${e.intent==='attack'?`⚔ ${enemyAttack(e)}${e.hits>1?' × '+e.hits:''}`:e.intent==='kingBuff'?'↑ +1　◇ 10':'♛ —'}</span><small class="king-intent-name">${e.move}</small>`};
if(S.run?.kind==='boss'&&S.run.mode==='battle')bossPlan(S.run);
const poisonAudience=poisonLoss;poisonLoss=function(e,r){if(!e.boss||e.audienceUsed)return poisonAudience(e,r);let hp=e.hp,p=e.poison||0,total=0;for(let i=0;i<(r.poisonDouble===true?2:r.poisonDouble||1)&&p>0&&hp>0;i++){let n=Math.min(hp,p);hp-=n;total+=n;p--;if(hp<=150)break}return total};
const forecastAudience=forecastDamage;forecastDamage=function(r){if(!r)return 0;return forecastAudience({...r,enemies:r.enemies.map(e=>e.boss&&!e.audienceUsed&&e.hp-poisonLoss(e,r)<=150?{...e,intent:'stunned'}:e)})};

