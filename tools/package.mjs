import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {auditRepository} from './audit.mjs';
import {runtimeFiles} from './runtime-files.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
await auditRepository(root);
const {version}=JSON.parse(await fs.readFile(path.join(root,'extension/manifest.json'),'utf8'));
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid release version');
const dist=path.join(root,'dist');await fs.mkdir(dist,{recursive:true});
const output=path.join(dist,`hikoo-native-feature-explorer-v${version}.zip`);
await fs.rm(output,{force:true});
execFileSync('zip',['-q',output,...runtimeFiles],{cwd:path.join(root,'extension'),stdio:'pipe'});
const members=execFileSync('unzip',['-Z1',output],{encoding:'utf8'}).trim().split('\n').sort();
if(JSON.stringify(members)!==JSON.stringify([...runtimeFiles].sort()))throw Error('Distribution contains unexpected files');
console.log(JSON.stringify({archive:path.relative(root,output),files:members.length,bytes:(await fs.stat(output)).size},null,2));
