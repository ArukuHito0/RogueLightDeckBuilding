const {context,element,listeners}=require('./ai-isolation.cjs'),vm=require('vm'),assert=require('assert');const run=s=>vm.runInContext(s,context);
context.cancelAnimationFrame=()=>{};element('aim').remove=()=>{};element('drag-ghost').remove=()=>{};run("S.run=null;S.deck=[];S.collection={0:5};page='deck';render=()=>save();toast=()=>{}");
const slot={dataset:{zone:'reserve',id:'0'}},zone={dataset:{drop:'reserve'}};context.tapSlot=slot;context.document.elementFromPoint=()=>({closest:s=>s==='.deck-slot'?slot:zone});const up=listeners.get('pointerup').find(f=>String(f).includes("d.type==='field'"));
function tap(from){run(`drag={type:'deck',from:'${from}',id:0,startX:10,startY:10,moved:false,pointerId:1,el:tapSlot}`);up({clientX:12,clientY:12,pointerId:1});}
tap('reserve');assert.equal(run('count(0)'),1);tap('reserve');assert.equal(run('count(0)'),2);tap('reserve');tap('reserve');assert.equal(run('count(0)'),3);tap('deck');assert.equal(run('count(0)'),2);tap('deck');assert.equal(run('count(0)'),1);
// A drag that returns to the starting card does not become a tap.
run("drag={type:'deck',from:'reserve',id:0,startX:10,startY:10,moved:true,pointerId:1,el:tapSlot}");up({clientX:10,clientY:10,pointerId:1});assert.equal(run('count(0)'),1);
run("S.run={};drag={type:'deck',from:'reserve',id:0,startX:10,startY:10,moved:false,pointerId:1,el:tapSlot}");up({clientX:10,clientY:10,pointerId:1});assert.equal(run('count(0)'),1);console.log('PASS v58: tap adds/removes exactly one, quantity cap, drag-return distinction and active-run guard');
