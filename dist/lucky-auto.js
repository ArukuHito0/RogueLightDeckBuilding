
let luckyAutoHost=null,luckyAutoRun=null,luckyAutoTimer=null;
function luckyClearAuto(){clearTimeout(luckyAutoTimer);luckyAutoTimer=null;luckyAutoHost?.remove();luckyAutoHost=null;luckyAutoRun=null;}
function luckyPresentAuto(r){const event=r?.lucky?.autoPresentation;if(!event||!canPresentBattleCards()||luckyAutoRun===r)return;luckyClearAuto();luckyAutoRun=r;const host=document.createElement('div');luckyAutoHost=host;host.className='lucky-auto-presentation';host.setAttribute('role','status');host.setAttribute('aria-label','オーファイブでプレイするカード');host.innerHTML='<div class="lucky-auto-stage"><p>オーファイブ</p>'+presentationSnapshot(event.id)+'</div>';document.body.append(host);luckyAutoTimer=setTimeout(()=>{if(luckyAutoRun!==r)return;luckyClearAuto();if(S.run!==r||r.mode!=='battle')return;r.lucky.autoPresentation=null;luckyPump(r);},2000);}
const luckyAutoRenderBase=render;render=function(){luckyAutoRenderBase();if(page==='battle'&&S.run?.lucky?.autoPresentation)luckyPresentAuto(S.run);else if(luckyAutoHost)luckyClearAuto();};
if(!globalThis.ASHBOUND_HEADLESS)render();
