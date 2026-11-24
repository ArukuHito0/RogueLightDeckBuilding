const fs=require('fs'),vm=require('vm'),assert=require('assert');let saved=null;const root=require('path').join(__dirname,'../dist/');const scripts=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);function load(){let noop=()=>{},el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};let ctx={AbortSignal,fetch:async()=>({status:404}),console,Math,assert,localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0}};vm.createContext(ctx);for(let f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});return ctx}

(async()=>{
  let context=load();
  await vm.runInContext(`(async()=>{
    render=()=>save();S.run=null;page='home';selectCharacter('wanderer');await startSelectedCharacter();
    const r=S.run;
    choose('fight');for(const foe of r.enemies)foe.hp=0;victory();
    assert(!hasPendingSkillReward(r));take(-1);
    choose('elite');for(const foe of r.enemies)foe.hp=0;victory();
    assert.deepEqual(skillRewardOptions(r).map(skill=>skill.id),['secondChance','roam','prepared']);
    assert(reward().includes('技能変更をスキップ'));
    take(-1);assert.equal(r.mode,'reward');
    selectExplorationReward('apex');assert(hasPendingSkillReward(r));
    selectExplorationReward('secondChance');assert.equal(explorationSkill(r).id,'secondChance');
    selectExplorationReward('roam');assert.equal(explorationSkill(r).id,'secondChance');
  })()`,context);
  context=load();
  vm.runInContext(`
    render=()=>save();const r=S.run;assert.equal(r.mode,'reward');
    assert.equal(explorationSkill(r).id,'secondChance');assert(!hasPendingSkillReward(r));
    take(-1);choose('elite');r.hp=1;loseHP(r,10);assert.equal(r.hp,Math.floor(r.max/2));
    assert(r.secondChanceUsed);for(const foe of r.enemies)foe.hp=0;victory();
    assert.deepEqual(skillRewardOptions(r).map(skill=>skill.id),['danger','roam','prepared']);
    selectExplorationReward(null);assert.equal(explorationSkill(r).id,'secondChance');take(-1);
    r.explorationSkillId='prepared';r.hp=r.max;choose('fight');assert.equal(r.hand.length,6);assert.equal(r.energy,4);
    r.explorationSkillId='roam';r.energy=0;r.hand=[0,0];assert.equal(combatCard(0).cost,0);
    base.play(0);assert(combatCard(0).cost>0);
    const nextRun={...r,characterId:'hunter',explorationSkillId:'apex',str:0,max:80,hp:40};
    S.run=nextRun;nextRun.enemies=[enemy('対象','',3,0)];dealDamage(nextRun.enemies[0],3);
    assert.equal(nextRun.max,84);assert.equal(nextRun.hp,40);assert.equal(nextRun.str,2);
    nextRun.explorationSkillId='wounded';loseHP(nextRun,20);assert.equal(nextRun.str,5);
    healHP(nextRun,30);assert.equal(nextRun.str,2);
    nextRun.explorationSkillId='superEvolution';
    const evolutionSource=C.find(c=>c.evolveTo!=null&&C[c.evolveTo]?.evolveTo!=null);
    assert(evolutionSource);assert.equal(C[evolveCardInstance(nextRun,evolutionSource.id)].origin,C[evolutionSource.evolveTo].evolveTo);
  `,context);
  context=load();
  await vm.runInContext(`(async()=>{
    render=()=>save();S.run=null;page='home';selectCharacter('lucky');await startSelectedCharacter();
    const r=S.run;r.explorationSkillId='handPoker';choose('fight');
    assert.equal(r.hand.length,5);assert(r.hand.every(id=>C[id].role));assert(r.deck.every(id=>!C[id].role));
    r.explorationSkillId='questPoker';const l=luckyState(r);l.questRole='five';
    const zero=C.find(c=>c.id>=0&&c.cost===0&&!c.role&&!c.xCost);
    for(let i=0;i<5;i++)luckyRecordPoker(r,zero);
    assert(l.queue.some(task=>task.op==='questRole'));assert(l.questRole);
    l.queue=[];l.choice=null;r.explorationSkillId='fortuneHand';r.energy=0;r.enemies=[enemy('対象','',1000,0)];
    const cards=[0,0,0,0,0,0,0];r.hand=cards.map(id=>luckyInstance(r,id));
    assert.equal(r.hand.reduce((n,id)=>n+combatCard(id).cost,0),7);
    queueFortuneHand(r);luckyPump(r);assert.equal(r.energy,0);assert(r.enemies[0].hp<1000);
    assert(!l.queue.length);assert(r.hand.length>=5);
  })()`,context);
  console.log('PASS 強敵報酬の3択・選択・スキップ・再読込と探索技能の戦闘効果');
})().catch(error=>{console.error(error);process.exitCode=1});
