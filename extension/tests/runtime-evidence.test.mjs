import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {collectRuntimeEvidence,safeRuntimeEvidence} from '../src/runtime-evidence.mjs';

test('Unavailable runtime is reported without reading identity, content or browser state',async()=>{
 const document={getElementById:()=>null};
 Object.defineProperty(document,'cookie',{get(){throw Error('Cookie read forbidden');}});
 const raw=await vm.runInNewContext('('+collectRuntimeEvidence.toString()+')()',{
   document,location:{origin:'https://chatgpt.com',pathname:'/c/private-conversation'},
   fetch:()=>{throw Error('Network forbidden');},localStorage:new Proxy({},{get(){throw Error('Storage forbidden');}}),
 });
 const report=safeRuntimeEvidence(raw);
 assert.equal(report.status,'runtime-unavailable');assert.equal(report.limits.networkObserved,false);
 assert(!JSON.stringify(report).includes('private-conversation'));
});

test('Export whitelist rejects credentials, source, identity and arbitrary URLs',()=>{
 const secret='sensitive-value-that-must-never-be-exported';
 const raw={schema:secret,status:'collected',observedAt:'2026-11-10T12:00:00.000Z',site:'chatgpt.com',
   cookie:secret,authorization:secret,source:secret,userId:secret,url:'https://chatgpt.com/c/'+secret,
   runtimeAsset:'https://example.com/'+secret,build:secret,manifestVersion:secret,registeredModules:Infinity,
   candidates:[{key:'skills',name:secret,component:secret,status:'component-declared',modules:[{module:'EOSE',initialized:true,exportAvailable:true,source:secret}],references:['EOSE',secret],renderingValidated:true},{key:secret}],
   flags:[{identifier:'2778625748',referencedBy:['iC84'],value:secret},{identifier:secret}],
   routeReferences:['/skills','/c/'+secret]};
 const safe=safeRuntimeEvidence(raw),encoded=JSON.stringify(safe);
 assert(!encoded.includes(secret));assert.equal(safe.registeredModules,0);
 assert.equal(safe.candidates[0].name,'Skills');assert.equal(safe.candidates[0].renderingValidated,false);
 assert.equal(safe.candidates[0].publicReleaseStatus,'not-established');
 assert.deepEqual(safe.routeReferences,['/skills']);assert.equal(safe.flags.length,1);
 assert.equal(safe.flags[0].effectiveValueRead,false);assert.equal(safe.runtimeAsset,null);
});
