// Original native dialog, fictional isolated cache, read-only. Run after
// test:orca:preview. No personal memory or production cache is inspected.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {cli,chatGPTPage,evaluate,waitFor,captureMask} from './helpers/orca.mjs';
const page=await chatGPTPage(),out=new URL('../evidence/',import.meta.url);
const result={transport:'orca-embedded-browser',extensionActionTested:false,networkObserved:false,passed:false};
try{
  assert.equal(await evaluate(page,'location.origin'),'https://chatgpt.com');
  assert.equal(await evaluate(page,'globalThis.__nativeFullPreview?.phase'),'mounted');
  result.before=await evaluate(page,'__nativeFullPreview.verify()');
  assert(await evaluate(page,'(()=>{const b=document.querySelector("[data-memory-preview]");if(!b)return false;b.click();return true;})()'));
  result.verify=await waitFor(page,'(()=>{const v=__nativeFullPreview.verifyMemory();return v.count===1?v:false;})()',20000);
  assert(result.verify.sameRoot&&result.verify.queriesDisabled&&result.verify.noFetching);
  await waitFor(page,'document.body.innerText.includes("Alex is a fictional designer")',10000);
  result.sampleContentVisible=true;
  result.provenance=await evaluate(page,'__nativeFullPreview.memoryProvenance()');
  assert(result.provenance.sameFactory&&result.provenance.originalExport);
  result.connectNone=await evaluate(page,'[...document.querySelectorAll("meta[http-equiv]")].some(m=>m.content.includes("connect-src "+String.fromCharCode(39)+"none"+String.fromCharCode(39)))');
  assert(result.connectNone);
  // Activate an original dialog control: the capture handler must stop it.
  result.actionBlocked=await evaluate(page,'(()=>{const dialog=document.querySelector("[role=dialog]");const button=[...dialog.querySelectorAll("button")].find(b=>!b.disabled&&!/^(Close|Fermer)$/i.test(b.getAttribute("aria-label")||b.textContent.trim()));if(!button)return null;const n=__nativeFullPreview.memoryBlockedActions||0;button.click();return __nativeFullPreview.memoryBlockedActions===n+1;})()');
  assert.equal(result.actionBlocked,true);
  // Hide the real account shell for the screenshot, without reading its text.
  // This temporary capture mask does not alter the original sample components.
  await captureMask(page,'[role=dialog]');
  result.sampleLabelVisible=await evaluate(page,'(()=>{const toolbar=document.querySelector("[data-hikoo-toolbar]");const rect=toolbar.getBoundingClientRect();return toolbar.textContent.includes("Experimental preview · Sample data")&&rect.left>=0&&rect.top>=0&&rect.right<=innerWidth;})()');
  assert(result.sampleLabelVisible);
  const shot=await cli(['screenshot','--page',page]);
  await fs.writeFile(new URL('orca-memory-preview.png',out),Buffer.from(shot.data,'base64'));
  await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();return true;})()');
  await evaluate(page,'(()=>{__nativeFullPreview.closeMemory();return true;})()');
  await waitFor(page,'__nativeFullPreview.verifyMemory().count===0');
  result.after=await evaluate(page,'__nativeFullPreview.verify()');
  assert.equal(result.before.originalGateNow,result.after.originalGateNow);
  assert(result.after.sameRoot&&result.after.managers===1&&result.after.metrics===1&&result.after.discovery===1);
  result.returnToInsights=true;result.passed=true;
}catch(error){result.error=error.message;process.exitCode=1;}
finally{await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();return true;})()').catch(()=>{});}
await fs.writeFile(new URL('orca-memory-validation.json',out),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
