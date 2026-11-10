// Exercise the real coordinator against real sites in Orca. Chrome APIs are
// bridged by this test; no claim of an installed MV3 worker is made.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createAdsLauncher} from '../src/ads-launch.mjs';
import {cli,evaluate} from './helpers/orca.mjs';
const data={},pages=new Map(),created=[],injections=[];let sequence=1;
const api={
  storage:{session:{get:async key=>({[key]:data[key]}),set:async values=>Object.assign(data,values),remove:async key=>{delete data[key];}}},
  action:{setBadgeText:async()=>{},setTitle:async()=>{}},
  permissions:{contains:async()=>true}, // MV3 permission prompts tested separately
  tabs:{
    get:async id=>{const page=pages.get(id);if(!page)throw Error('No test tab');const state=await evaluate(page,'({origin:location.origin,path:location.pathname,status:document.readyState})');return{id,url:state.origin+state.path,status:state.status==='complete'?'complete':'loading'};},
    create:async args=>{const tab=await cli(['tab','create','--url',args.url]);const id=sequence++;pages.set(id,tab.browserPageId);created.push(tab.browserPageId);return{id,url:args.url};},
    update:async(id,args)=>{if(args.url)await cli(['goto','--page',pages.get(id),'--url',args.url]);return{id};},
  },
  scripting:{executeScript:async args=>{
    const page=pages.get(args.target.tabId);injections.push({tabId:args.target.tabId,file:args.files?.[0]||null});
    if(args.files){const source=await fs.readFile(new URL('../'+args.files[0],import.meta.url),'utf8');return[{result:await evaluate(page,source.trim().replace(/;$/,''))}];}
    return[{result:await evaluate(page,'('+args.func.toString()+')(...'+JSON.stringify(args.args||[])+')')}];
  }},
};
const result={transport:'orca-embedded-browser',extensionActionTested:false,chromeAPIsBridged:true,networkObserved:false,passed:false,targets:[]};
try{
  const launcher=createAdsLauncher(api);
  for(const feature of ['ads','shopify']){
    const job=await launcher.start(feature,-1);
    let current;
    for(let attempt=0;attempt<20;attempt++){
      current=await launcher.resume(job.tabId);
      if(!['opening','checking'].includes(current.phase))break;
      await new Promise(resolve=>setTimeout(resolve,300));
    }
    const tab=await api.tabs.get(job.tabId);
    const checked={feature,phase:current.phase,origin:new URL(tab.url).origin,privatePreviewValidated:false};
    if(feature==='ads'){
      assert.equal(checked.origin,'https://auth.openai.com');
      assert.equal(current.phase,'sign-in-required');
      assert(!injections.some(call=>call.tabId===job.tabId));
      checked.noAuthInjection=true;
    }else{
      assert.equal(checked.origin,'https://connect.ads.openai.com');
      assert.equal(current.phase,'merchant-context-required');
      const status=await evaluate(pages.get(job.tabId),'({bodyAvailable:!!document.body,statusVisible:!!document.querySelector("#hikoo-native-launch-status")?.textContent.includes("authorized Shopify store")})');
      checked.statusVisible=status.statusVisible;checked.bodyAvailable=status.bodyAvailable;
      checked.statusDelivery=status.bodyAvailable?'page-banner-and-extension':'extension-badge-and-popup';
      if(status.bodyAvailable)assert(status.statusVisible);
    }
    result.targets.push(checked);
  }
  assert(!JSON.stringify(data).includes('https:'));result.sessionMetadataOnly=true;result.passed=true;
}catch(error){result.error=error.message;process.exitCode=1;}
finally{
  for(const page of created)await cli(['tab','close','--page',page]).catch(()=>{});
  await fs.writeFile(new URL('../evidence/orca-ads-launch-validation.json',import.meta.url),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
}
