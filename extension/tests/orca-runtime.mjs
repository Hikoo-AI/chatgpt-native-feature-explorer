// Orca only: no external Chrome connection or session transfer.
import fs from 'node:fs/promises';
import {collectRuntimeEvidence,safeRuntimeEvidence} from '../src/runtime-evidence.mjs';
import {chatGPTPage,evaluate} from './helpers/orca.mjs';
const page=await chatGPTPage();
const value=await evaluate(page,'('+collectRuntimeEvidence.toString()+')()');
const evidence={transport:'orca-embedded-browser',extensionActionTested:false,report:safeRuntimeEvidence(value)};
await fs.mkdir(new URL('../evidence/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../evidence/orca-runtime.json',import.meta.url),JSON.stringify(evidence,null,2));
console.log(JSON.stringify({transport:evidence.transport,status:evidence.report.status,build:evidence.report.build,
 registeredModules:evidence.report.registeredModules,candidates:evidence.report.candidates.map(c=>({name:c.name,status:c.status,modules:c.modules}))},null,2));
if(evidence.report.status!=='collected')process.exitCode=2;
