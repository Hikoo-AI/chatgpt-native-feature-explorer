import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const orca=process.env.ORCA_CLI_COMMAND||(process.env.ORCA_DEV_REPO_ROOT?'orca-dev':process.platform==='linux'?'orca-ide':'orca');
export async function cli(args){
 let stdout;try{({stdout}=await run(orca,[...args,'--json'],{cwd:new URL('../../../',import.meta.url),maxBuffer:8*1024*1024,timeout:45000}));}catch(error){let code=error.killed?'command-timeout':'command-failed';try{code=JSON.parse(error.stdout).error?.code||code;}catch{}throw Error('Orca '+args[0]+': '+code);}
 const reply=JSON.parse(stdout);if(!reply.ok)throw Error(reply.error?.code||'Orca command failed');return reply.result;
}
export async function chatGPTPage(){
 const tabs=(await cli(['tab','list'])).tabs;
 const page=tabs.find(tab=>tab.browserPageId===process.env.ORCA_PAGE_ID)||tabs.find(tab=>{try{return tab.active&&new URL(tab.url).origin==='https://chatgpt.com';}catch{return false;}});
 if(!page)throw Error('Open ChatGPT in Orca, then select its tab or set ORCA_PAGE_ID.');return page.browserPageId;
}
export async function evaluate(page,expression){
 const reply=await cli(['eval','--page',page,'--expression','(async()=>JSON.stringify(await ('+expression+')))()']);
 return typeof reply.result==='string'?JSON.parse(reply.result):reply.result;
}
export async function waitFor(page,expression,timeout=150000){
 const end=Date.now()+timeout;while(Date.now()<end){const result=await evaluate(page,expression);if(result)return result;await new Promise(resolve=>setTimeout(resolve,800));}throw Error('Orca page condition timed out');
}
export async function nativeRef(page,role,name,last=false){
 const snapshot=await cli(['snapshot','--page',page]);
 const refs=Object.entries(snapshot.refs||{}).filter(([ref,v])=>{
   if(v.role!==role||v.name!==name||v.disabled===true)return false;
   const line=(snapshot.snapshot||'').split('\n').find(line=>new RegExp('ref='+ref+'(?:\\]|,|\\s)').test(line));
   return !line||!/(?:\[disabled|\bdisabled\b)/.test(line);
 });
 const ref=(last?refs.at(-1):refs[0])?.[0];if(!ref)throw Error('Native control unavailable: '+role+' '+name);return ref;
}
export async function click(page,role,name,last=false){const ref=await nativeRef(page,role,name,last);await cli(['click','--page',page,'--element',ref]);}
// Cover everything outside the sample rectangle without reading the real shell
// or changing visibility inherited by native dialog children.
export async function captureMask(page,selector){
 await cli(['tab','switch','--page',page]);
 return evaluate(page,'(async()=>{document.getElementById("hikoo-capture-mask")?.remove();const target=document.querySelector('+JSON.stringify(selector)+');if(!target)throw Error("Sample capture target missing");const r=target.getBoundingClientRect(),root=document.createElement("div");root.id="hikoo-capture-mask";const rectangles=[[0,0,innerWidth,r.top],[0,r.bottom,innerWidth,innerHeight-r.bottom],[0,r.top,r.left,r.height],[r.right,r.top,innerWidth-r.right,r.height]];for(const [left,top,width,height]of rectangles){const mask=document.createElement("div");Object.assign(mask.style,{position:"fixed",left:left+"px",top:top+"px",width:Math.max(0,width)+"px",height:Math.max(0,height)+"px",background:"#f9f8f7",pointerEvents:"none",zIndex:"2147483646"});root.append(mask);}document.body.append(root);return true;})()');
}
