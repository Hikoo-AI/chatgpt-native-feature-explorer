import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {runtimeFiles} from './runtime-files.mjs';

export function scanText(source, file) {
  const reject = (pattern, label) => {
    if (pattern.test(source)) throw Error(`${label}: ${file}`);
  };
  reject(/Bearer\s+[A-Za-z0-9._-]{30,}|\bgh[pousr]_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}|\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/, 'Possible credential');
  reject(/"(?:access_token|refresh_token)"\s*:\s*"[^"\s]+"/, 'Possible credential');
  reject(/__webpack_modules__\s*[:=]\s*\{|webpackChunk[\w$]*\s*\.push\s*\(\s*\[/, 'Packaged frontend runtime');
  reject(/\/(?:Users|home)\/[A-Za-z0-9_.-]+\//, 'Machine-specific absolute path');
}

export async function auditRepository(root) {
  const files = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(path.join(root, dir), {withFileTypes:true})) {
      if (['.git', 'node_modules', 'dist'].includes(entry.name)) continue;
      const file = path.posix.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw Error('Symlink excluded: '+file);
      if (/^(?:bundles|evidence|history|screenshots|video|\.pw-profile.*)$/.test(entry.name) || /(?:^\.env(?:\.|$)|\.(?:har|trace|sqlite|db|map)$)/i.test(entry.name)) {
        throw Error('Research or browser artifact excluded: '+file);
      }
      if (entry.isDirectory()) {await walk(file); continue;}
      const bytes = await fs.readFile(path.join(root, file));
      if (bytes.length > 512*1024 || bytes.includes(0)) throw Error('Unexpected binary or large file: '+file);
      scanText(bytes.toString('utf8'), file);
      if (/\.(?:mjs|js)$/.test(file)) execFileSync(process.execPath, ['--check', path.join(root,file)], {stdio:'pipe'});
      if (file !== 'PUBLIC-FILES.json') files.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    }
  }
  await walk('');
  for (const file of runtimeFiles) await fs.access(path.join(root,'extension',file));
  const manifest=JSON.parse(await fs.readFile(path.join(root,'extension/manifest.json'),'utf8'));
  if (manifest.manifest_version!==3 || manifest.permissions?.includes('cookies') || manifest.host_permissions?.length) throw Error('Unexpected extension permissions');
  const expected=['https://ads.openai.com/*','https://connect.ads.openai.com/*'];
  if (JSON.stringify(manifest.optional_host_permissions)!==JSON.stringify(expected)) throw Error('Unexpected optional host scope');
  if (manifest.background?.service_worker!=='background.mjs') throw Error('Missing background launcher');
  return files.sort((a,b)=>a.file.localeCompare(b.file));
}

const isCLI=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isCLI){
  const root=fileURLToPath(new URL('../',import.meta.url));
  const files=await auditRepository(root);
  if(process.argv.includes('--write-manifest'))await fs.writeFile(path.join(root,'PUBLIC-FILES.json'),JSON.stringify({
    scope:'Curated Hikoo integration source, original fictional fixtures and metadata-only documentation; excludes downloaded OpenAI code and browser state.',
    limitations:'Hashes document this source snapshot. Pattern checks supplement source selection and review; they do not prove universal ownership.',
    files,
  },null,2)+'\n');
  console.log(JSON.stringify({passed:true,files:files.length,runtimeFiles:runtimeFiles.length,manifestWritten:process.argv.includes('--write-manifest')},null,2));
}
