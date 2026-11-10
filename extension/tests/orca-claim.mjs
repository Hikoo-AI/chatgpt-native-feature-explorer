// Native search and protected-claim presentation only. This never mounts the
// claim admission/controller or replaces a production authorization response.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {cli,chatGPTPage,evaluate,waitFor,nativeRef,captureMask} from './helpers/orca.mjs';
const page=await chatGPTPage(),out=new URL('../evidence/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const result={passed:false,transport:'orca-embedded-browser',extensionActionTested:false,claimSubmissionTested:false};
try{
 assert.equal(await evaluate(page,'location.origin'),'https://chatgpt.com');
 const before=await evaluate(page,'__nativeFullPreview.verify()');
 assert.equal(before.managers,1);
 await evaluate(page,'(()=>{document.querySelector("[data-claim-preview]").click();return true;})()');
 await waitFor(page,'__nativeFullPreview.verify().searches===1');
 const input=await nativeRef(page,'searchbox','Search business');
 await cli(['fill','--page',page,'--element',input,'--value','Hikoo']);
 await waitFor(page,'document.querySelectorAll("[data-business-profile-result]").length===2');
 result.search=await evaluate(page,'({proof:__nativeFullPreview.verify(),adapterCalls:__nativeFullPreview.claimSearchCount,presentationFlag:__nativeFullPreview.claimSearchGate,fixtureOverrides:__nativeFullPreview.fixturePresentationGateOverrides,sampleLabel:document.getElementById("native-full-insights-sample").textContent.includes("Experimental preview · Sample data"),results:[...document.querySelectorAll("[data-business-profile-result]")].map(n=>n.textContent)})');
 assert(result.search.proof.sameRoot&&result.search.sampleLabel&&result.search.adapterCalls>0);
 assert.equal(result.search.proof.claimControllers,0);
 assert(Object.values(result.search.proof.isolation).every(Boolean));
 assert(result.search.results.every(text=>text.includes('(fictional)')));
 assert.equal(result.search.proof.originalSearchGateBefore,result.search.proof.originalSearchGateNow);
 await captureMask(page,'#native-full-insights-sample');
 let screenshot=await cli(['screenshot','--page',page]);
 await fs.writeFile(new URL('orca-claim-search.png',out),Buffer.from(screenshot.data,'base64'));
 await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();document.querySelector("[data-business-profile-result]").click();return true;})()');
 await waitFor(page,'__nativeFullPreview.verify().claimSupports===1');
 result.support=await evaluate(page,'({proof:__nativeFullPreview.verify(),fictionalName:document.body.textContent.includes("To claim Hikoo Demo Café (fictional)"),nativeSupportVisible:!![...document.querySelectorAll("a")].find(a=>a.textContent.includes("Contact support")),label:(()=>{const bar=document.querySelector("[data-hikoo-toolbar]");const rect=bar?.getBoundingClientRect();return !!rect&&rect.top>=0&&rect.bottom<=innerHeight&&bar.contains(document.elementFromPoint(rect.left+10,rect.top+10));})()})');
 assert(result.support.proof.sameRoot&&result.support.fictionalName&&result.support.nativeSupportVisible&&result.support.label);
 assert.equal(result.support.proof.claimControllers,0);
 const blocked=await evaluate(page,'(()=>{const a=[...document.querySelectorAll("a")].find(a=>a.textContent.includes("Contact support"));a.click();return __nativeFullPreview.claimBlockedActions||0;})()');
 assert(blocked>0,'External contact must be blocked in the sample');
 result.externalContactBlocked=true;
 // Dialogs are native portals; mask the real account shell before capture.
 await waitFor(page,'(()=>{const d=document.querySelector("[role=dialog]"),rect=d?.getBoundingClientRect();return rect&&rect.width>=innerWidth*.9&&rect.height>=innerHeight*.9;})()');
 await new Promise(resolve=>setTimeout(resolve,500));
 await captureMask(page,'[role="dialog"]');
 screenshot=await cli(['screenshot','--page',page]);
 await fs.writeFile(new URL('orca-claim-support.png',out),Buffer.from(screenshot.data,'base64'));
 await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();document.querySelector("[data-claim-preview]").click();return true;})()');
 result.back=await waitFor(page,'(()=>{const v=__nativeFullPreview.verify();return v.managers===1&&v.metrics===1&&v.discovery===1?v:false;})()');
 assert(result.back.sameRoot&&result.back.originalGateBefore===result.back.originalGateNow);
 result.provenance=await evaluate(page,'__nativeFullPreview.provenance()');
 assert(result.provenance.checks.every(c=>c.sameFactory));
 result.connectBlocked=await evaluate(page,'[...document.querySelectorAll("meta[http-equiv]")].some(n=>n.content.includes("connect-src "+String.fromCharCode(39)+"none"+String.fromCharCode(39)))');
 assert(result.connectBlocked);
 result.passed=true;
}catch(error){result.error=error.message;process.exitCode=1;}
finally{await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();return true;})()').catch(()=>{});}
await fs.writeFile(new URL('orca-claim-validation.json',out),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
