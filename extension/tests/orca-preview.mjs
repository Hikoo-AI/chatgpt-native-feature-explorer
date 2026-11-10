// Runs our existing native adapter through Orca. This does not claim to install
// or trigger MV3: all business UI still comes from the site's current runtime.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {cli,chatGPTPage,evaluate,waitFor,click,captureMask} from './helpers/orca.mjs';
const page=await chatGPTPage(),out=new URL('../evidence/',import.meta.url);
await fs.mkdir(out,{recursive:true});
const result={transport:'orca-embedded-browser',extensionActionTested:false,passed:false};
try{
 if(process.argv.includes('--restore')){
   await evaluate(page,'(()=>{globalThis.__nativeFullPreview?.stop();return true;})()');
   await waitFor(page,'!globalThis.__nativeFullPreview&&!!globalThis.__reactRouterManifest');
   result.restored=await evaluate(page,'({path:location.pathname,noSample:!document.getElementById("native-full-insights-sample"),noRoute:!__reactRouterManifest.routes["native-full-insights-fixture"],noCSP:![...document.querySelectorAll("meta[http-equiv]")].some(m=>m.content.includes("connect-src "+String.fromCharCode(39)+"none"+String.fromCharCode(39)))})');
   assert.equal(result.restored.path,'/gpts');assert(result.restored.noSample&&result.restored.noRoute&&result.restored.noCSP);
 }else{
   const status=await evaluate(page,'({origin:location.origin,path:location.pathname,phase:globalThis.__nativeFullPreview?.phase})');
   assert.equal(status.origin,'https://chatgpt.com');assert.equal(status.path,'/gpts');
   if(!status.phase){
     const [seven,twentyEight]=await Promise.all([7,28].map(days=>fs.readFile(new URL(`../fixtures/ready-${days}d.json`,import.meta.url),'utf8').then(JSON.parse)));
     const memory=JSON.parse(await fs.readFile(new URL('../fixtures/memory-summary.json',import.meta.url),'utf8'));
     const source=await fs.readFile(new URL('../native-full-preview.js',import.meta.url),'utf8');
     // Literal argument through execFile, never shell interpolation or a remote bundle.
     await evaluate(page,'(()=>{globalThis.__nativeFullFixtures='+JSON.stringify({seven,twentyEight,memory,includePublicMemoryPreview:process.argv.includes('--public-memory')})+';'+source+';return true;})()');
   }
   const statusAfter=await waitFor(page,'(()=>{const s=globalThis.__nativeFullPreview;return ["mounted","blocked"].includes(s?.phase)?{phase:s.phase,error:s.error}:false;})()');
   assert.equal(statusAfter.phase,'mounted',statusAfter.error);
   result.verify=await waitFor(page,'(()=>{const v=globalThis.__nativeFullPreview?.verify?.();return v?.managers===1&&v.metrics===1&&v.discovery===1?v:false;})()');
   assert(result.verify.sameRoot&&Object.values(result.verify.isolation).every(Boolean));
   assert.equal(result.verify.actualRouterPath,'/gpts');
   result.provenance=await evaluate(page,'__nativeFullPreview.provenance()');
   assert(result.provenance.checks.every(c=>c.sameFactory));
   if(process.argv.includes('--interactions')){
     result.activationFallbacks=[];
     async function action(role,name,condition,last=false){
       await click(page,role,name,last);
       try{await waitFor(page,condition,1800);}
       catch{
         const expression='(()=>{const root=document.getElementById("native-full-insights-sample");const nodes=root.querySelectorAll('+JSON.stringify(role==='link'?'a':role==='tab'?'[role="tab"]':'button')+');const node=[...nodes].find(n=>n.innerText.trim()==='+JSON.stringify(name)+'&&!n.disabled&&n.getClientRects().length&&!n.closest("[inert]"));if(!node)return false;node.click();return true;})()';
         assert(await evaluate(page,expression),'Original native control must be available');
         result.activationFallbacks.push(name);
         await waitFor(page,condition,12000);
       }
     }
     await action('button','Edit business info','!!document.querySelector("#business-description")');
     const snapshot=await cli(['snapshot','--page',page]);
     const input=Object.entries(snapshot.refs||{}).find(([,v])=>v.role==='textbox'&&/More about your business/i.test(v.name))?.[0];
     assert(input,'Native description field must be accessible');
     await cli(['fill','--page',page,'--element',input,'--value','Sample description verified in Orca by Hikoo Labs. '+Date.now()]);
     const beforeSaves=Number(await evaluate(page,'globalThis.__nativeFullPreview.localSaveCount||0'))||0;
     await action('button','Save','globalThis.__nativeFullPreview.localSaveCount>'+beforeSaves,true);
     result.localSave=true;
     await action('button','Back','__nativeFullPreview.sampleLocation.pathname.endsWith("/insights")');
     await action('link','Products','__nativeFullPreview.sampleLocation.pathname.endsWith("/products")');
     await action('tab','Upload history','__nativeFullPreview.sampleLocation.search==="?activity=history"');
     await action('tab','Issues','__nativeFullPreview.sampleLocation.search==="?activity=issues"');
     result.productsTabs=true;
     await action('link','Overview','__nativeFullPreview.sampleLocation.pathname.endsWith("/insights")');
     assert.equal(await evaluate(page,'location.pathname'),'/gpts');
   }
   result.after=await evaluate(page,'__nativeFullPreview.verify()');
   result.networkPolicy=await evaluate(page,'({connectNone:[...document.querySelectorAll("meta[http-equiv]")].some(m=>m.content.includes("connect-src "+String.fromCharCode(39)+"none"+String.fromCharCode(39))),networkObserved:false})');
   assert(result.networkPolicy.connectNone);
   assert.equal(result.after.originalGateBefore,result.after.originalGateNow);
   result.sampleLabelVisible=await evaluate(page,'document.querySelector("#native-full-insights-sample")?.textContent.includes("Experimental preview · Sample data")');
   assert(result.sampleLabelVisible);
   if(!process.argv.includes('--public-memory')){
     result.publicMemoryHidden=await evaluate(page,'!document.querySelector("[data-memory-preview]")');
     assert(result.publicMemoryHidden);
   }
   await captureMask(page,'#native-full-insights-sample');
   const screenshot=await cli(['screenshot','--page',page]);
   assert.equal(screenshot.format,'png');assert(screenshot.data);
   await fs.writeFile(new URL('orca-native-preview.png',out),Buffer.from(screenshot.data,'base64'));
   await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();return true;})()');
 }
 result.passed=true;
}catch(error){result.error=error.message;process.exitCode=1;}
finally{await evaluate(page,'(()=>{document.getElementById("hikoo-capture-mask")?.remove();return true;})()').catch(()=>{});}
await fs.writeFile(new URL(process.argv.includes('--restore')?'orca-restoration-validation.json':'orca-preview-validation.json',out),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
