import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {scanText,auditRepository} from './audit.mjs';
import {runtimeFiles} from './runtime-files.mjs';

test('Publication rejects credentials and packaged frontend definitions',()=>{
  assert.throws(()=>scanText('Bearer '+'x'.repeat(40),'sample.js'),/credential/);
  assert.throws(()=>scanText(JSON.stringify({access_token:'test-only'}),'sample.json'),/credential/);
  assert.throws(()=>scanText('const '+'__webpack_modules__'+' = {};','sample.js'),/runtime/);
  assert.doesNotThrow(()=>scanText('const component = runtime("lDTh").BusinessProfileManagerView;','adapter.js'));
});
test('Publication refuses browser state and symlinks before scanning their content',async()=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'hikoo-audit-'));
  try{
    await fs.mkdir(path.join(root,'evidence'));
    await assert.rejects(()=>auditRepository(root),/artifact/);
    await fs.rmdir(path.join(root,'evidence'));
    await fs.symlink('missing-file',path.join(root,'unsafe-link'));
    await assert.rejects(()=>auditRepository(root),/Symlink/);
  }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('Runtime ZIP excludes research files and optional public-feature samples',()=>{
  assert(runtimeFiles.includes('background.mjs'));
  assert(runtimeFiles.includes('fixtures/ready-28d.json'));
  assert(runtimeFiles.every(file=>!/(?:^|\/)(?:tests|docs|history|evidence)(?:\/|$)|memory-summary|\.\./.test(file)));
  assert.equal(new Set(runtimeFiles).size,runtimeFiles.length);
});
