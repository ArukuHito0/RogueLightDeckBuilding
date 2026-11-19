// Portable backup for the same save format used by browser autosave.
const ASHBOUND_SAVE_KEY='ashbound-v1';
const ASHBOUND_BACKUP_LIMIT=8*1024*1024;

function parseAshboundBackup(raw){
  const input=JSON.parse(raw);
  const state=input?.format==='ashbound-save'&&input.version===1?input.save:input;
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const count=x=>Number.isSafeInteger(x)&&x>=0;
  const cards=x=>Array.isArray(x)&&x.every(count);
  if(!object(state)||state.v!==1||!object(state.collection)||!Object.values(state.collection).every(count)||
     !cards(state.deck)||!['gold','packs','runs','wins'].every(k=>count(state[k]))||
     !(state.run===null||(object(state.run)&&cards(state.run.deck)&&typeof state.run.mode==='string'&&Number.isFinite(state.run.hp)&&Number.isFinite(state.run.max))))throw new Error('invalid save');
  return state;
}
function exportAshboundSave(){
  if(busy){toast('処理が終わってから書き出してください。');return;}
  const file=new Blob([JSON.stringify({format:'ashbound-save',version:1,save:S})],{type:'application/json'});
  const url=URL.createObjectURL(file),link=document.createElement('a');
  link.href=url;link.download='ashbound-save-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importAshboundSave(input){
  const file=input.files?.[0];input.value='';
  if(!file)return;
  if(busy||S.run){toast('探索を終えて拠点で読み込んでください。');return;}
  let incoming;
  try{if(file.size>ASHBOUND_BACKUP_LIMIT)throw new Error('too large');incoming=parseAshboundBackup(await file.text());}
  catch{toast('ASHBOUNDのセーブファイルを読み込めませんでした。');return;}
  if(busy||S.run)return;
  if(!window.confirm('現在のセーブをファイルの内容に置き換えます。よろしいですか？'))return;
  try{
    const previous=localStorage.getItem(ASHBOUND_SAVE_KEY);
    if(previous!==null)localStorage.setItem('ashbound-before-import',previous);
    localStorage.setItem(ASHBOUND_SAVE_KEY,JSON.stringify(incoming));
  }catch{toast('保存できなかったため、読み込みを中止しました。');return;}
  window.location.reload();
}
function saveBackupControls(){
  return '<section><h3>セーブのバックアップ</h3><p>別のURLや端末へ移る前に書き出し、ファイルを保管してください。読み込みは拠点で行えます。</p><div class="toolbar"><button type="button" onclick="exportAshboundSave()">セーブを書き出す</button><button type="button" onclick="this.nextElementSibling.click()" '+(S.run?'disabled':'')+'>セーブを読み込む</button><input hidden type="file" accept=".json,application/json" onchange="importAshboundSave(this)"></div></section>';
}
