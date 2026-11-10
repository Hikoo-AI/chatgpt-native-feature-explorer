import {collectRuntimeEvidence,safeRuntimeEvidence} from './src/runtime-evidence.mjs';
import { targets, acceptsTab } from './src/targets.mjs';
import {launchMessages} from './src/ads-launch.mjs';
let selected='insights',tab;
const primary=document.querySelector('#preview'),status=document.querySelector('#status');
function feedback(text,error=false){status.hidden=false;status.textContent=text;status.dataset.kind=error?'error':'info';}
function update(){
  const target=targets[selected];
  document.querySelectorAll('[data-feature]').forEach(button=>{const active=button.dataset.feature===selected;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
  primary.replaceChildren(document.createTextNode(target.launchLabel+' '));const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');primary.append(arrow);
  let host='No active tab';try{host=new URL(tab?.url).hostname;}catch{}
  document.querySelector('#host').textContent=host;
  document.querySelector('#context-detail').textContent=acceptsTab(selected,tab?.url)?
    (selected==='insights'?'Isolated sample branch · no additional server access.':'Public application · sample-data preview not validated.'):
    `Hikoo opens ${new URL(target.url).hostname} automatically.`;
  if(selected==='insights'&&host==='chatgpt.com')document.querySelector('#context-detail').textContent='Hikoo prepares the test page automatically when launched.';
  if(selected==='ads'&&host==='auth.openai.com')document.querySelector('#context-detail').textContent='Complete account selection. Hikoo resumes automatically in Ads Manager.';
}
document.querySelectorAll('[data-feature]').forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.feature;status.hidden=true;update();}));
document.querySelector('#open').addEventListener('click',()=>chrome.tabs.create({url:targets[selected].url}));
document.querySelector('#stop').addEventListener('click',async()=>{
  try{await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:()=>globalThis.__nativeFullPreview?.stop()});window.close();}catch(error){feedback(error.message,true);}
});
primary.addEventListener('click',async()=>{
  primary.disabled=true;
  try{
    if(selected!=='insights'){
      const feature=selected;
      // Chrome requires this request directly in the user's click handler.
      // Only the chosen Ads origin is requested, never auth or Shopify admin.
      const granted=await chrome.permissions.request({origins:[targets[feature].origin+'/*']});
      if(!granted)throw Error(launchMessages['permission-required']);
      const [active]=await chrome.tabs.query({active:true,currentWindow:true});
      const response=await chrome.runtime.sendMessage({type:'hikoo-launch:start',feature,tabId:active?.id});
      if(!response?.ok)throw Error(response?.error||'Unable to start the application.');
      feedback(launchMessages[response.job.phase]);return;
    }
    [tab]=await chrome.tabs.query({active:true,currentWindow:true});update();
    if(selected==='insights'&&tab?.url&&new URL(tab.url).origin===targets.insights.origin&&!acceptsTab(selected,tab.url)){
      feedback('Hikoo is preparing the preview tab…');
      await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>finish(Error('Preparation timed out. Reopen this panel once ChatGPT has loaded.')),45000);
        const finish=error=>{clearTimeout(timeout);chrome.tabs.onUpdated.removeListener(onUpdated);error?reject(error):resolve();};
        const onUpdated=(id,change)=>{if(id===tab.id&&change.status==='complete')finish();};
        chrome.tabs.onUpdated.addListener(onUpdated);
        chrome.tabs.update(tab.id,{url:targets.insights.url}).catch(finish);
      });
      [tab]=await chrome.tabs.query({active:true,currentWindow:true});update();
      const [{result:ready}]=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:async()=>{
        for(let attempt=0;attempt<120;attempt++){
          const key=Object.keys(document).find(k=>k.startsWith('__reactContainer$'));
          if(globalThis.__reactRouterManifest&&key){const queue=[document[key].stateNode.current];while(queue.length){const f=queue.pop();if(f.tag===10&&f.type?.displayName==='RouteScope')return true;if(f.child)queue.push(f.child);if(f.sibling)queue.push(f.sibling);}}
          await new Promise(resolve=>setTimeout(resolve,250));
        }return false;
      }});
      if(!ready)throw Error('Sign in to ChatGPT, then retry the Hikoo preview.');
    }
    if(!acceptsTab(selected,tab?.url))throw Error(`This preview requires ${targets[selected].url}. Use “Open application”.`);
    const [seven,twentyEight]=await Promise.all([7,28].map(async days=>{
      const response=await fetch(chrome.runtime.getURL(`fixtures/ready-${days}d.json`));return response.json();
    }));
    await chrome.scripting.executeScript({target:{tabId:tab.id},world:'ISOLATED',files:['lease.js']});
    await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:fixtures=>{globalThis.__nativeFullFixtures=fixtures;},args:[{seven,twentyEight}]});
    await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',files:['native-full-preview.js']});
    const [{result}]=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:()=>({phase:globalThis.__nativeFullPreview?.phase,error:globalThis.__nativeFullPreview?.error})});
    if(result?.phase==='blocked')throw Error(result.error||'Preview unavailable in this build.');
    document.querySelector('#stop').hidden=false;feedback('Preview started with sample data. Close the preview or disable the extension to restore the page.');
  }catch(error){feedback(error.message,true);}finally{primary.disabled=false;}
});
try{[tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(tab?.url?.startsWith('https://connect.ads.openai.com/'))selected='shopify';
  else if(tab?.url?.startsWith('https://ads.openai.com/'))selected='ads';
  if(chrome.runtime?.sendMessage&&Number.isInteger(tab?.id)){
    const response=await chrome.runtime.sendMessage({type:'hikoo-launch:get',tabId:tab.id});
    if(response?.ok&&response.job){selected=response.job.feature;feedback(launchMessages[response.job.phase]);}
  }
}catch{feedback('Open this panel from the extension icon in Chrome.',true);}
update();
chrome.storage?.onChanged?.addListener((changes,area)=>{
  const job=changes['hikoo-launch:'+tab?.id]?.newValue;
  if(area==='session'&&job?.feature===selected)feedback(launchMessages[job.phase]);
});

document.querySelector('#runtime-report').addEventListener('click',async event=>{
  const button=event.currentTarget;button.disabled=true;
  try{
    const [active]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!active?.url||new URL(active.url).origin!=='https://chatgpt.com')throw Error('This report requires a ChatGPT tab. Ads and Shopify use separate sessions.');
    const [{result}]=await chrome.scripting.executeScript({target:{tabId:active.id},world:'MAIN',func:collectRuntimeEvidence});
    const report=safeRuntimeEvidence(result);
    if(report.status!=='collected')throw Error('The native runtime is not available yet. Finish signing in, then retry.');
    const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='hikoo-native-evidence.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    feedback(`Local report: ${report.registeredModules} registered modules, ${report.candidates.filter(c=>c.status==='component-declared').length} identified components. This report does not validate rendering or access rights.`);
  }catch(error){feedback(error.message,true);}finally{button.disabled=false;}
});
