import fs from 'node:fs';
const assets={};
for(const name of fs.readdirSync('dist')){
 const type={html:'text/html',js:'application/javascript',css:'text/css'}[name.split('.').at(-1)];
 if(name.endsWith('.webp')) assets[name]=['image/webp',fs.readFileSync('dist/'+name).toString('base64')];
 if(type)assets[name]=[type+'; charset=utf-8',fs.readFileSync('dist/'+name,'utf8')];
}
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+'const BALANCE_FIELDS='+fs.readFileSync('worker/balance-fields.json','utf8')+';\n'+'const BALANCE_WEIGHT_GROUPS='+fs.readFileSync('worker/balance-weight-groups.json','utf8')+';\n'+fs.readFileSync('worker/balance-proof.mjs','utf8')+'\n'+fs.readFileSync('worker/balance-api.mjs','utf8')+'\n'+fs.readFileSync('worker/index.mjs','utf8'));
