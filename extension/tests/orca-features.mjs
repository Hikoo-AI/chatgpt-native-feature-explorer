import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chatGPTPage,evaluate} from './helpers/orca.mjs';
import {inspectCurrentBuild} from '../src/current-build-evidence.mjs';
const page=await chatGPTPage();
const active=await evaluate(page,'({preview:!!document.getElementById("native-full-insights-sample"),policy:[...document.querySelectorAll("meta[http-equiv]")].some(m=>m.content.includes("connect-src "+String.fromCharCode(39)+"none"+String.fromCharCode(39)))})');
assert(active.preview&&active.policy,'First run test:orca:preview to isolate the test document');
const report=await evaluate(page,'('+inspectCurrentBuild.toString()+')()');
assert.equal(report.origin,'https://chatgpt.com');
assert(report.candidates.every(c=>c.moduleRegistered&&c.candidateSignaturePresent));
const result={transport:'orca-embedded-browser',extensionActionTested:false,passed:true,
 isolation:{connectNone:true,networkObserved:false},report};
await fs.mkdir(new URL('../evidence/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../evidence/orca-current-features.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify({transport:result.transport,passed:true,build:report.buildId,manifestVersion:report.manifestVersion,
 candidates:report.candidates.map(c=>({name:c.name,module:c.expectedModule,signatureConfirmed:c.candidateSignaturePresent,previewValidated:c.previewValidated}))},null,2));
