// Pure multiset matching: multiplicities, missing cards and extra cards all count.
(function(){
 const id=x=>typeof x==='number'?x:x.origin??x.id;
 function counts(deck){const n={};for(const x of deck||[]){const k=id(x);if(Number.isInteger(k)&&k>=0)n[k]=(n[k]||0)+1}return n}
 function compare(actual,target){if(!target?.length)return {configured:false,ratio:null,matched:0,missing:[],extra:[]};const a=counts(actual),t=counts(target),keys=new Set([...Object.keys(a),...Object.keys(t)]);let matched=0,union=0,missing=[],extra=[];for(const k of keys){const av=a[k]||0,tv=t[k]||0;matched+=Math.min(av,tv);union+=Math.max(av,tv);if(tv>av)missing.push({id:+k,count:tv-av});if(av>tv)extra.push({id:+k,count:av-tv})}return {configured:true,ratio:union?matched/union:0,matched,missing,extra}}
 function sanitize(input,catalog){const valid=new Set(catalog.filter(c=>!c.retired&&!c.token&&c.id>=0).map(c=>c.id)),n={},deck=[];for(const value of input?.deck||[]){const k=id(value);if(valid.has(k)&&(n[k]||0)<3&&deck.length<100){n[k]=(n[k]||0)+1;deck.push(k)}}return {deck,threshold:Math.max(.01,Math.min(1,Number(input?.threshold)||1))}}
 globalThis.AI_REFERENCE={compare,counts,sanitize};
})();
