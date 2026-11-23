import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const tests=['act3.cjs','act4.cjs','act5.cjs','act5-reload.cjs','act6.cjs','act6-reload.cjs','act7.cjs','act7-reload.cjs','cloud-save.mjs','potion-reload-v105.cjs','lucky-timing-v100.cjs','basic-trade.cjs','card-table-combat-effects.cjs','card-pools.cjs'];
for(const test of tests){const result=spawnSync(process.execPath,['tests/'+test],{cwd:root,stdio:'inherit'});if(result.error){console.error(result.error.message);process.exit(1);}if(result.status!==0)process.exit(result.status||1);}
console.log(`PASS ${tests.length} current regression suites`);
