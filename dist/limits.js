const baseDefenses=[
['構え直し',0,'◇','4ブロック。除外。','common',{b:4,ex:1}],
['盾の一撃',1,'▱','4ダメージ。4ブロック。','common',{d:4,b:4}],
['堅守',1,'♜','10ブロック。除外。','common',{b:10,ex:1}],
['防護の策',1,'⌘','10ブロック。1枚引く。除外。','rare',{b:10,draw:1,ex:1}],
['再生の障壁',2,'✚','16ブロック。HPを4回復。除外。','epic',{b:16,heal:4,ex:1}]
];baseDefenses.forEach((a,i)=>C.push({id:45+i,name:a[0],cost:a[1],icon:a[2],desc:a[3],rarity:a[4],runOnly:false,fx:a[5]}));
const changeLimitBase=changeDeck;changeDeck=function(from,to,id,index,other){let adding=from==='reserve'?id:other;if(adding!=null){let removing=from==='deck'?id:(other!=null?S.deck[index]:null);if(count(adding)-(removing===adding?1:0)>=3){toast('同じカードは3枚までです');return false}}return changeLimitBase(from,to,id,index,other)};
const editLimitBase=edit;edit=function(id,n){if(n>0&&count(id)>=3)return toast('同じカードは3枚までです');editLimitBase(id,n)};
const startLimitBase=start;start=function(){if(S.deck.some(id=>count(id)>3))return toast('同じカードは3枚までに編成してください');startLimitBase()};
const takeLimitBase=take;take=function(id){if(id>=0&&S.run?.deck.filter(x=>x===id).length>=3)return toast('同じカードは3枚までです。別のカードを選んでください');takeLimitBase(id)};
sampleRunCards=function(rate){let remaining=C.filter(c=>allowedRunCard(c)&&(!S.run||S.run.deck.filter(id=>id===c.id).length<3)),out=[];let rare=.35*(1-rate);for(let i=0;i<3&&remaining.length;i++){let x=Math.random(),rarity=x<rate?'epic':x<rate+rare?'rare':'common',pool=remaining.filter(c=>c.rarity===rarity);if(!pool.length)pool=remaining;let c=rand(pool);out.push(c.id);remaining=remaining.filter(c=>c.id!==out.at(-1))}return out};
const deckLimitBase=deck;deck=function(){return deckLimitBase().replace('編成範囲 10〜20枚','編成範囲 10〜20枚・同じカード3枚まで').replace('現在のランだけ','現在のランだけ')};
// Keep excess copies in the collection, remove only deck copies. Fill a starter deck if needed.
if(!S.copyLimitVersion){let seen={};S.deck=S.deck.filter(id=>{seen[id]=(seen[id]||0)+1;return seen[id]<=3});for(let c of C.filter(c=>!c.runOnly).sort((a,b)=>cardOrder(a.id,b.id))){while(S.deck.length<10&&count(c.id)<Math.min(3,S.collection[c.id]||0))S.deck.push(c.id)}for(let id of [45,46,47]){if(S.deck.length>=10)break;S.collection[id]=Math.max(S.collection[id]||0,3);while(S.deck.length<10&&count(id)<3)S.deck.push(id)}S.copyLimitVersion=1}
