import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdsLauncher} from '../src/ads-launch.mjs';

function environment(){
  const data={},tabs=new Map([[1,{id:1,url:'https://chatgpt.com/gpts',status:'complete'}]]),calls=[];
  let sequence=10,permission=true,probe={appRoutePresent:true,hasCommittedTree:true};
  const api={
    storage:{session:{get:async key=>({[key]:data[key]}),set:async values=>Object.assign(data,values),remove:async key=>{delete data[key];}}},
    action:{setBadgeText:async value=>calls.push({badge:value.text}),setTitle:async()=>{}},
    permissions:{contains:async()=>permission},
    tabs:{get:async id=>{if(!tabs.has(id))throw Error('Closed');return tabs.get(id);},create:async args=>{const tab={id:sequence++,url:args.url,status:'complete'};tabs.set(tab.id,tab);calls.push({create:args.url});return tab;},update:async(id,args)=>{calls.push({update:id,...args});Object.assign(tabs.get(id),args);return tabs.get(id);}},
    scripting:{executeScript:async args=>{calls.push({inject:args.target.tabId,file:args.files?.[0],banner:!!args.func});return[{result:probe}];}},
  };
  return{api,tabs,calls,data,setPermission:value=>permission=value,setProbe:value=>probe=value};
}

test('Ads launch survives popup closure and worker restart, without storing auth URLs',async()=>{
  const env=environment();let launcher=createAdsLauncher(env.api,()=>1000);
  const job=await launcher.start('ads',1);
  assert.equal(job.phase,'opening');assert.equal(env.tabs.get(1).url,'https://chatgpt.com/gpts');
  assert.equal(env.tabs.get(job.tabId).url,'https://ads.openai.com/manager');
  assert(!env.calls.some(c=>c.inject));
  env.tabs.get(job.tabId).url='https://auth.openai.com/choose-an-account?token=PRIVATE_SENTINEL';
  assert.equal((await launcher.resume(job.tabId)).phase,'sign-in-required');
  assert(!env.calls.some(c=>c.inject));
  launcher=createAdsLauncher(env.api,()=>2000); // suspended worker restarted
  env.tabs.get(job.tabId).url='https://ads.openai.com/manager';
  assert.equal((await launcher.resume(job.tabId)).phase,'preview-unavailable');
  assert(env.calls.some(c=>c.file==='ads-runtime.js'));
  assert(!JSON.stringify(env.data).includes('SENTINEL'));assert(!JSON.stringify(env.data).includes('https:'));
});

test('Shopify keeps an authorized embedded URL intact and reports missing merchant context honestly',async()=>{
  const env=environment(),url='https://connect.ads.openai.com/app?host=PRIVATE_SENTINEL&shop=PRIVATE_SHOP';
  env.tabs.get(1).url=url;env.setProbe({merchantContextRequired:true,appRoutePresent:true,hasCommittedTree:false});
  const job=await createAdsLauncher(env.api).start('shopify',1);
  assert.equal(job.tabId,1);assert.equal(job.phase,'merchant-context-required');
  assert.equal(env.tabs.get(1).url,url);assert(!env.calls.some(c=>c.create||c.url));
  assert(!JSON.stringify(env.data).includes('PRIVATE_'));
});

test('No grant means no opening or injection; unrelated origins are never injected',async()=>{
  const env=environment(),launcher=createAdsLauncher(env.api);
  env.setPermission(false);await assert.rejects(()=>launcher.start('ads',1),/Allow access/);
  assert.equal(env.calls.length,0);
  env.setPermission(true);const job=await launcher.start('ads',1);
  env.tabs.get(job.tabId).url='https://ads.openai.com.evil.invalid/manager';
  assert.equal((await launcher.resume(job.tabId)).phase,'sign-in-required');
  assert(!env.calls.some(c=>c.inject));
  await assert.rejects(()=>launcher.start('unknown',1),/Unsupported/);
});

test('Expired jobs stop checking; closing a tab removes session metadata',async()=>{
  const env=environment();let now=1;const launcher=createAdsLauncher(env.api,()=>now);
  const job=await launcher.start('shopify',1);now=16*60*1000;
  assert.equal((await launcher.resume(job.tabId)).phase,'expired');
  assert(!env.calls.some(c=>c.inject));await launcher.remove(job.tabId);assert.equal(await launcher.read(job.tabId),null);
});

test('Application-provided errors and access denials cannot become a preview success',async()=>{
  const env=environment();env.tabs.get(1).url='https://ads.openai.com/manager';
  env.setProbe({appRoutePresent:true,hasCommittedTree:false,previewAvailable:true,reason:'SECRET_SENTINEL',status:403});
  const job=await createAdsLauncher(env.api).start('ads',1);
  assert.equal(job.phase,'runtime-unavailable');assert(!JSON.stringify(env.data).includes('SENTINEL'));
});
