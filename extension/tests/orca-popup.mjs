// Tests OUR extension popup in an Orca-owned blank page. Chrome APIs and runtime
// metadata are synthetic; no OpenAI application or component is reproduced.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {cli,evaluate,click,waitFor} from './helpers/orca.mjs';
const {browserPageId:page}=await cli(['tab','create','--url','about:blank']);
const result={transport:'orca-embedded-browser',scope:'Own popup only; synthetic Chrome APIs and metadata',extensionActionTested:false,passed:false};
try{
 const root=new URL('../',import.meta.url);
 const read=name=>fs.readFile(new URL(name,root),'utf8');
 const [html,css,targets,evidence,launch,popup]=await Promise.all(['popup.html','popup.css','src/targets.mjs','src/runtime-evidence.mjs','src/ads-launch.mjs','popup.mjs'].map(read));
 const mock=`globalThis.__uiCalls=[];globalThis.__uiBlob=null;globalThis.__uiGrant=true;
 const chrome={runtime:{sendMessage:async message=>{__uiCalls.push({message});return{ok:true,job:message.type==='hikoo-launch:start'?{feature:message.feature,tabId:9,phase:'opening'}:null};}},permissions:{request:async value=>{__uiCalls.push({permission:value});return __uiGrant;}},tabs:{query:async()=>[{id:1,url:'https://chatgpt.com/gpts'}],create:async args=>__uiCalls.push(args)},scripting:{executeScript:async()=>[{result:{site:'chatgpt.com',status:'collected',registeredModules:42,initializedModules:20,cookie:'FORBIDDEN_SECRET',candidates:[{key:'skills',status:'component-declared',modules:[{module:'EOSE',initialized:false,exportAvailable:false}],references:['EOSE']}]}}]}};
 const createURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{__uiBlob=blob;return createURL(blob);};
 document.addEventListener('click',event=>{const a=event.target.closest('a[download]');if(a){event.preventDefault();__uiCalls.push({download:a.download});}},true);`;
 const script=mock+'\n'+targets.replaceAll('export ','')+'\n'+evidence.replaceAll('export ','')+'\n'+launch.replaceAll('export ','').replace(/^import .*;\n/gm,'')+'\n'+popup.replace(/^import .*;\n/gm,'');
 const doc=html.replace(/<link rel="stylesheet" href="popup.css">/,'<style>'+css+'</style>').replace('<script type="module" src="popup.mjs"></script>','');
 await evaluate(page,'(()=>{document.open();document.write('+JSON.stringify(doc)+');document.close();return true;})()');
 await evaluate(page,'(async()=>{'+script+';return true;})()');
 const dimensions=await evaluate(page,'({width:document.body.offsetWidth,height:document.body.offsetHeight})');
 assert.equal(dimensions.width,410);assert(dimensions.height<=600);
 assert.equal(await evaluate(page,'document.documentElement.lang'),'en');
 await click(page,'button','Runtime report');
 await waitFor(page,'!!globalThis.__uiBlob',8000);
 const exported=await evaluate(page,'(async()=>({text:await __uiBlob.text(),calls:__uiCalls,status:document.querySelector("#status").textContent}))()');
 assert(!exported.text.includes('FORBIDDEN_SECRET'));
 assert.equal(JSON.parse(exported.text).registeredModules,42);
 assert(exported.calls.some(call=>call.download==='hikoo-native-evidence.json'));
 assert(exported.status.includes('42 registered modules'));
 for(const [feature,button,origin]of [['ads','Open Ads Manager','https://ads.openai.com/*'],['shopify','Open Ads for Shopify','https://connect.ads.openai.com/*']]){
   // Own feature-card names can include extra whitespace from layout.
   await evaluate(page,'(()=>{document.querySelector('+JSON.stringify('[data-feature="'+feature+'"]')+').click();return true;})()');
   await click(page,'button',button);
   await waitFor(page,'__uiCalls.some(call=>call.message?.type==="hikoo-launch:start"&&call.message.feature==='+JSON.stringify(feature)+')',8000);
   assert(await evaluate(page,'__uiCalls.some(call=>call.permission?.origins?.[0]==='+JSON.stringify(origin)+')'));
 }
 await evaluate(page,'(()=>{__uiGrant=false;return true;})()');
 const before=await evaluate(page,'__uiCalls.filter(call=>call.message?.type==="hikoo-launch:start").length');
 await click(page,'button','Open Ads for Shopify');
 await waitFor(page,'document.querySelector("#status").textContent.includes("Allow access")',8000);
 assert.equal(await evaluate(page,'__uiCalls.filter(call=>call.message?.type==="hikoo-launch:start").length'),before);
 result.dimensions=dimensions;result.downloadPrepared=true;result.redactionVerified=true;result.english=true;result.adsLaunchRequested=true;result.shopifyLaunchRequested=true;result.permissionDenialRespected=true;result.passed=true;
}catch(error){result.error=error.message;result.uiState=await evaluate(page,'({hasBlob:!!globalThis.__uiBlob,status:document.querySelector("#status")?.textContent})').catch(()=>null);process.exitCode=1;}
finally{await fs.writeFile(new URL('../evidence/orca-popup-validation.json',import.meta.url),JSON.stringify(result,null,2));await cli(['tab','close','--page',page]);console.log(JSON.stringify(result,null,2));}
