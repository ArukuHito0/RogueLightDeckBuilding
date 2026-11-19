import fs from 'node:fs';
const assets={};
for(const name of fs.readdirSync('dist')){
 const type={html:'text/html',js:'application/javascript',css:'text/css'}[name.split('.').at(-1)];
 if(type)assets[name]=[type+'; charset=utf-8',fs.readFileSync('dist/'+name,'utf8')];
}
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+fs.readFileSync('worker/index.mjs','utf8'));
