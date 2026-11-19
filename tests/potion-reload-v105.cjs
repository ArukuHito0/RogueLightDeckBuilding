const fs=require('fs'),vm=require('vm'),assert=require('assert');let saved=null;const root=require('path').join(__dirname,'../dist/');const scripts=[...fs.readFileSync(root+'index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(x=>x[1]);function load(){let noop=()=>{},el={innerHTML:'',textContent:'',classList:{add:noop,remove:noop,toggle:noop},style:{},dataset:{},querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,addEventListener:noop};let ctx={console,Math,assert,localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},document:{body:el,documentElement:el,getElementById:()=>el,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},window:{addEventListener:noop},setTimeout:noop,clearTimeout:noop,requestAnimationFrame:noop,performance:{now:()=>0}};vm.createContext(ctx);for(let f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),ctx,{filename:f});return ctx}


let c=load();vm.runInContext(`
render=()=>save();S.run=null;selectCharacter('wanderer');S.deck=[0,0,0,1,1,1,2,2,2,3];S.equippedRelicId=null;startSelectedCharacter();choose('fight');S.run.enemies.forEach(e=>e.hp=0);rollPotionReward=()=> 'heal';victory();assert.equal(S.run.mode,'reward');assert.equal(S.run.rewardPotion,'heal');assert.equal(S.run.rewardPotionClaimed,false);save();`,c);
c=load();vm.runInContext(`
render=()=>save();assert.equal(S.run.rewardPotion,'heal');assert.equal(page,'reward');claimRewardPotion();assert.equal(S.run.potions.length,1);assert(S.run.rewardPotionClaimed);save();`,c);
c=load();vm.runInContext(`
render=()=>save();assert(S.run.rewardPotionClaimed);claimRewardPotion();assert.equal(S.run.potions.length,1);`,c);console.log('PASS v105 reward survives reload and cannot be claimed twice');
