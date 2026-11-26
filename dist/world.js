const mapDescriptions={fight:'通常の敵と戦い、カード・パック・金を獲得。',elite:'強力な敵との戦闘。未鑑定の遺物も獲得。',event:'潜在EPICカードと金を獲得。',shop:'金で潜在カードや消費アイテムを購入。',rest:'HPを回復。ボス直前にも必ず配置。',unknown:'イベントや戦闘が発生するマス。',boss:'最終決戦。勝利すると報酬を持って拠点へ。'};
createMap=function(r){
  r.nodes=Array.from({length:12},(_,row)=>Array.from({length:[4,10,11].includes(row)?1:3},(_,lane)=>({row,lane,type:row===11?'boss':row===10?'rest':row===4?'event':'fight',edges:[]})));
  const count=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
  // Sample floor sets without adjacent floors, keeping the original edge rules.
  function spacedRows(first,last,size){
    const patterns=[];
    function visit(rows=[],next=first){
      if(rows.length===size){patterns.push(rows);return}
      for(let row=next;row<=last;row++)visit([...rows,row],row+2);
    }
    visit();return rand(patterns);
  }
  // Floor 1 stays combat; floor 10 cannot precede the fixed floor-11 rest.
  for(const row of [count(1,3),...spacedRows(5,8,2)])rand(r.nodes[row]).type='rest';
  for(const row of spacedRows(5,9,count(2,3)))rand(r.nodes[row].filter(n=>n.type==='fight')).type='shop';
  // Allocate limited late-floor slots first, then unknowns across eligible floors.
  // No reserved lane or guaranteed route avoiding elites.
  // A non-elite floor within floors 7–9 interrupts every possible four-floor chain.
  // Even with 3 shops and 2 late rests, at least 7 eligible slots remain.
  const eliteBreakRow=count(6,8);
  const late=shuffle(r.nodes.slice(5,10).flat().filter(n=>n.type==='fight'&&n.row!==eliteBreakRow));
  for(const n of late.splice(0,count(5,7)))n.type='elite';
  const ordinary=shuffle(r.nodes.slice(1,10).flat().filter(n=>n.type==='fight'));
  for(const n of ordinary.slice(0,count(4,7)))n.type='unknown';
  for(let row=0;row<r.nodes.length-1;row++){let from=r.nodes[row],to=r.nodes[row+1];from.forEach(n=>{if(to.length===1)n.edges=[0];else if(from.length===1)n.edges=[0,1,2];else{n.edges=[n.lane];for(let k of [n.lane-1,n.lane+1])if(k>=0&&k<3&&Math.random()<.25)n.edges.push(k);n.edges.sort()}})}
  r.nodePath=[];r.act=r.act||1;r.worldVersion=5;
};
function mapHeight(r){return 130+(r.nodes.length-1)*112}
function point(n,r){return {x:r.nodes[n.row].length===1?350:110+n.lane*240,y:70+(r.nodes.length-1-n.row)*112}}
map=function(){let r=S.run,lines='';if(!r.nodes)createMap(r);r.nodes.flat().forEach(n=>n.edges.forEach(l=>{let a=point(n,r),b=point(r.nodes[n.row+1][l],r);let followed=r.nodePath.some(p=>p.row===n.row&&p.lane===n.lane)&&r.nodePath.some(p=>p.row===n.row+1&&p.lane===l);lines+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${followed?'traversed':''}"/>`}));let names={fight:'戦闘',elite:'強敵',event:'宝箱',shop:'ショップ',rest:'休息',unknown:'不明',boss:'ボス'},icons={fight:'⚔',elite:'♜',event:'▣',shop:'◈',rest:'✚',unknown:'?',boss:'♛'};return `<div class="battle-top"><div><div class="eyebrow">THE FALLEN CITY</div><h2>廃都の探索路 <small>${r.floor} / ${r.nodes.length}</small></h2></div><span class="muted">下から上へ進む</span></div><p class="map-note">${r.nodes.length===12?'5階は宝箱、11階は休息、12階はボス。':'宝箱は1回。ボス直前で必ず休息。'}</p><div class="map-layout"><div class="map-scroller" aria-label="探索マップ" tabindex="0"><div class="map-board" style="height:${mapHeight(r)}px"><svg viewBox="0 0 700 ${mapHeight(r)}" preserveAspectRatio="none">${lines}</svg>${r.nodes.flat().map(n=>{let p=point(n,r),ready=available(n),used=r.nodePath.some(x=>x.row===n.row&&x.lane===n.lane);return `<button class="map-node node-${n.type} ${ready?'available':''} ${used?'visited':''}" data-row="${n.row}" style="left:${p.x/700*100}%;top:${p.y/mapHeight(r)*100}%" onclick="enterNode(${n.row},${n.lane})" ${!ready?'disabled':''} aria-label="第${n.row+1}階層 ${names[n.type]}"><b>${icons[n.type]}</b><span>${names[n.type]}</span></button>`}).join('')}</div></div><aside class="map-side"><h3>携行遺物</h3>${relicsHTML(r.relics)}<p>明るいノードを選択。<br>マップ内をスクロールして先の道を確認できます。</p><div class="map-legend">${Object.keys(names).map(k=>`<div class="legend-entry node-${k}"><b>${icons[k]} ${names[k]}</b><small>${mapDescriptions[k]}</small></div>`).join('')}</div></aside></div>`};
const mysteries=[
{title:'囁く契約書',icon:'♧',desc:'古い書物が、代償と引き換えに新たな力を約束する。',choices:[{label:'契約を結ぶ',detail:'HP −8、潜在カード1枚',hp:-8,card:true},{label:'書物を閉じる',detail:'何も起こらない'}]},
{title:'残火の泉',icon:'✚',desc:'温かな水が流れている。泉の番人は金貨を求めている。',choices:[{label:'金貨を払う',detail:'25金を支払い、HP +20',cost:25,hp:20},{label:'ひと口だけ飲む',detail:'HP +5',hp:5},{label:'立ち去る',detail:'何も起こらない'}]},
{title:'生命を刻む石碑',icon:'◇',desc:'生命の器を広げるためには、いまの生命を差し出す必要がある。',choices:[{label:'血を捧げる',detail:'最大HP +10、現在HP −12',max:10,hp:-12},{label:'石碑に祈る',detail:'HP +8',hp:8}]},
{title:'灰商人の取引',icon:'▣',desc:'灰の中から現れた商人が、使い込まれたカードを差し出す。',choices:[{label:'カードを買う',detail:'30金を支払い、潜在カード1枚',cost:30,card:true},{label:'金貨の隠し場所を探る',detail:'HP −6、35金を得る',hp:-6,gold:35},{label:'断る',detail:'何も起こらない'}]},
{title:'忘れられた祭壇',icon:'☽',desc:'祭壇に残された火が、あなたの望みに応える。',choices:[{label:'生命を願う',detail:'HP +14',hp:14},{label:'器を願う',detail:'最大HP +6、HP +6',max:6,hp:6},{label:'力を願う',detail:'HP −10、潜在カード1枚',hp:-10,card:true}]}
];
function unknownOutcome(){return Math.random()<.8?'event':'fight'}
const chooseWorldBase=choose;choose=function(type){if(type!=='unknown')return chooseWorldBase(type);if(unknownOutcome()==='fight'){toast('不明マスで敵に遭遇');return choose('fight')}let r=S.run;r.mystery={id:Math.floor(Math.random()*mysteries.length),resolved:false};r.mode=page='mystery';render()};
function mystery(){let r=S.run,m=r.mystery,e=mysteries[m.id];return `<div class="reward mystery"><div class="eyebrow">UNKNOWN / EVENT</div><div class="portrait">${e.icon}</div><h1>${e.title}</h1><p>${e.desc}</p>${m.resolved?`<div class="tile"><p>${m.result}</p></div><button class="primary" onclick="next()">探索を続ける →</button>`:`<div class="event-choices">${e.choices.map((c,i)=>`<button class="event-choice" onclick="resolveMystery(${i})" ${c.cost>r.gold?'disabled':''}><b>${c.label}</b><span>${c.detail}${c.cost>r.gold?'（金が不足）':''}</span></button>`).join('')}</div>`}</div>`}
function resolveMystery(i){let r=S.run;if(page!=='mystery'||!r?.mystery||r.mystery.resolved||busy)return;let c=mysteries[r.mystery.id].choices[i];if(!c||c.cost>r.gold)return;r.gold-=(c.cost||0);r.gold+=c.gold||0;r.max+=c.max||0;if(c.hp>0)healHP(r,c.hp);else {r.hp=Math.max(0,Math.min(r.max,r.hp+(c.hp||0)));if(typeof reviveFromExplorationSkill==='function')reviveFromExplorationSkill(r);}let result=c.detail;if(c.card){let id=rand(rollRunRewards(r.floor));if(id!=null&&addRunCard(r,id)){r.mystery.cardId=id;result+='：'+C[id].name}else result+='（取得可能なカードなし）'}r.mystery.resolved=true;r.mystery.result=result;if(r.hp<=0){finish(false);return}render()}
const renderWorldBase=render;render=function(){if(globalThis.ASHBOUND_LOADING)return;renderWorldBase();document.body.classList.toggle('page-map',page==='map');document.body.classList.toggle('in-run',!!S.run);if(S.run){let r=S.run;$('wallet').innerHTML=`<span class="run-status"><b class="header-hp">♥ ${r.hp}/${r.max}</b><span>第${r.floor}/${r.nodes?.length||12}階層</span><span>▣ ${r.packs}</span><span>◈ ${r.gold}</span></span>`}if(page==='mystery')$('app').innerHTML=mystery();if(page==='map')requestAnimationFrame(()=>{let scroll=document.querySelector('.map-scroller'),node=document.querySelector(`.map-node.available`);if(scroll&&node)scroll.scrollTop=Math.max(0,node.offsetTop-scroll.clientHeight*.65)})};
// Never reroll a saved route. Legacy ten-floor runs finish on their original map.
if(S.run?.nodes&&!S.run.worldVersion)S.run.worldVersion=1;

if(typeof ResizeObserver!=='undefined'){new ResizeObserver(entries=>document.documentElement.style.setProperty('--header-height',entries[0].target.getBoundingClientRect().height+'px')).observe(document.querySelector('header'))}
