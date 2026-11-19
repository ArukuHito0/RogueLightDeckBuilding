
const LUCKY_ROLE_DISPLAY={
pair:{digits:'1122X',text:'同じ数字2枚が2組'},
straight:{digits:'0123X',text:'0～3コストのカードが1枚ずつ'},
blackjack:{digits:'10101',text:'カードの並び順が10101'},
three:{digits:'33333',text:'全て3コスト'},
five:{digits:'00000',text:'全て0コスト'}
};
function luckyReferenceHTML(){return '<aside class="lucky-role-reference" aria-label="ポーカーの役一覧">'+Object.entries(LUCKY_ROLE_IDS).map(([key,id])=>{const c=C[id],info=LUCKY_ROLE_DISPLAY[key];return '<article tabindex="0" data-role-preview="'+id+'"><div class="role-reference-heading"><strong>'+c.name+'</strong><span class="poker-hand">'+[...info.digits].map(n=>'<span class="filled">'+n+'</span>').join('')+'</span></div><p class="role-reference-rule">'+info.text+'</p><p class="role-reference-effect"><b>'+c.cost+' コスト</b> '+c.desc.replace(/役。$/,'')+'</p></article>';}).join('')+'</aside>';}
function luckyHideRolePreview(){document.getElementById('lucky-role-preview')?.remove?.();}
function luckyShowRolePreview(el){luckyHideRolePreview();const node=document.createElement('aside');node.id='lucky-role-preview';node.className='lucky-role-preview';node.innerHTML=presentationSnapshot(+el.dataset.rolePreview);document.body.append(node);const rect=el.getBoundingClientRect();node.style.left=Math.min(rect.right+12,window.innerWidth-220)+'px';node.style.top=Math.max(8,Math.min(rect.top,window.innerHeight-(node.offsetHeight||340)-8))+'px';}
const luckyReferenceBattleBase=battle;battle=function(){let html=luckyReferenceBattleBase();if(isLucky(S.run))html+=luckyReferenceHTML();return html;};
function luckyPositionReference(){const node=document.querySelector('.lucky-role-reference');if(node)node.style.removeProperty('width');}
const luckyReferenceRenderBase=render;render=function(){luckyHideRolePreview();luckyReferenceRenderBase();if(page!=='battle'||!isLucky(S.run))return;luckyPositionReference();document.querySelectorAll('[data-role-preview]').forEach(el=>{el.addEventListener('pointerenter',()=>luckyShowRolePreview(el));el.addEventListener('pointerleave',luckyHideRolePreview);el.addEventListener('focus',()=>luckyShowRolePreview(el));el.addEventListener('blur',luckyHideRolePreview);});};
window.addEventListener('resize',()=>{luckyHideRolePreview();luckyPositionReference();});
if(!globalThis.ASHBOUND_HEADLESS)render();
