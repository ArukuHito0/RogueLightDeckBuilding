// Loaded before game.js so first-time visitors can be distinguished from existing saves.
const cloudSave={status:'checking',record:null,last:null,working:false};
const cloudKey='ashbound-cloud-link';
let cloudHadLocal=true;
try{cloudHadLocal=localStorage.getItem('ashbound-v1')!==null;}catch{}
function cloudLink(){try{return JSON.parse(localStorage.getItem(cloudKey));}catch{return null;}}
function cloudRemember(){try{localStorage.setItem(cloudKey,JSON.stringify({account:cloudSave.record.account,revision:cloudSave.record.revision}));}catch{}}
function cloudStatus(status){cloudSave.status=status;const area=document.querySelector('#ashbound-cloud-controls');if(area)area.outerHTML=cloudSaveControls();}
function cloudSaveControls(){
 const status=cloudSave.status;
 const labels={checking:'接続を確認中…',guest:'ログインするとセーブが自動で同期されます。',ready:'クラウド自動保存：有効',conflict:'この端末とクラウドのセーブを自動で統合できません。続けるデータを選んでください。',offline:'クラウドに接続できません。この端末には引き続き保存されます。'};
 return '<section id="ashbound-cloud-controls"><h3>クラウドセーブ</h3><p role="status">'+labels[status]+'</p>'+
 (status==='guest'?'<a href="/signin-with-chatgpt?return_to=%2F" target="_top">ChatGPTでログイン</a>':'')+
 (status==='conflict'?'<div class="toolbar"><button type="button" onclick="cloudChoose(false)">この端末のセーブを使う</button>'+(cloudSave.record?.save?'<button type="button" onclick="cloudChoose(true)">クラウドのセーブを使う</button>':'')+'</div>':'')+
 (status==='offline'?'<button type="button" onclick="cloudConnect()">再接続</button>':'')+'</section>';
}
async function cloudRead(){
 const res=await fetch('/api/cloud-save',{cache:'no-store'});
 if(res.status===401)return null;
 if(!res.ok)throw Error('cloud unavailable');
 return res.json();
}
function cloudRestore(record){
 const previous=localStorage.getItem('ashbound-v1');
 if(previous!==null)localStorage.setItem('ashbound-before-cloud-restore',previous);
 localStorage.setItem('ashbound-v1',JSON.stringify(record.save));
 cloudRemember();
 location.reload();
}
async function cloudConnect(){
 if(cloudSave.working)return;
 cloudSave.working=true;
 try{
  const record=await cloudRead();
  if(!record){cloudStatus('guest');return;}
  cloudSave.record=record;
  const link=cloudLink(),local=JSON.stringify(S);
  if(record.save&&JSON.stringify(record.save)===local){
   cloudSave.last=local;cloudRemember();cloudStatus('ready');return;
  }
  if(record.save&&!cloudHadLocal&&!busy&&!S.run){cloudRestore(record);return;}
  if((link&&link.account!==record.account)||(record.save&&link?.revision!==record.revision)){
   cloudStatus('conflict');return;
  }
  cloudHadLocal=true;cloudSave.last=record.save?JSON.stringify(record.save):null;
  cloudStatus('ready');
 }catch{cloudStatus('offline');}
 finally{cloudSave.working=false;}
}
async function cloudFlush(){
 if(cloudSave.working||cloudSave.status!=='ready'||busy)return;
 const snapshot=JSON.stringify(S);
 if(snapshot===cloudSave.last)return;
 cloudSave.working=true;
 try{
  const {account,revision}=cloudSave.record;
  const res=await fetch('/api/cloud-save',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({account,revision,save:JSON.parse(snapshot)})});
  if(res.status===401){cloudStatus('guest');return;}
  if(res.status===409){cloudSave.record=await cloudRead();cloudStatus(cloudSave.record?'conflict':'guest');return;}
  if(!res.ok)throw Error('save failed');
  cloudSave.record.revision=(await res.json()).revision;
  cloudSave.last=snapshot;cloudRemember();
 }catch{cloudStatus('offline');}
 finally{cloudSave.working=false;}
}
async function cloudChoose(useCloud){
 if(cloudSave.working||cloudSave.status!=='conflict'||busy)return;
 if(!window.confirm(useCloud?'この端末の進行をクラウドのセーブに置き換えますか？':'この端末の進行をクラウドに保存しますか？'))return;
 try{
  if(useCloud){cloudRestore(cloudSave.record);return;}
  cloudSave.last=null;cloudHadLocal=true;cloudStatus('ready');await cloudFlush();
 }catch{cloudStatus('offline');}
}
if(!globalThis.ASHBOUND_HEADLESS)window.addEventListener('load',async()=>{await cloudConnect();await cloudFlush();setInterval(()=>{if(cloudSave.status==='offline')cloudConnect();else cloudFlush();},3000);});
