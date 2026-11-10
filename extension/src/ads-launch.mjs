import {targets} from './targets.mjs';

export const launchMessages={
  opening:'Opening the native application. Hikoo will continue after the page loads.',
  checking:'Checking the native runtime…',
  'sign-in-required':'Complete sign-in and account selection. Hikoo will resume automatically when you return to the application.',
  'merchant-context-required':'Open ChatGPT Ads from an authorized Shopify store. Keep this tab open; Hikoo will check again after navigation.',
  'runtime-unavailable':'The application runtime is not ready. Sign in or finish the required access steps, then retry.',
  'preview-unavailable':'Native runtime detected. An isolated sample-data preview is not implemented for this application.',
  'permission-required':'Allow access to this application when Chrome asks, then retry.',
  expired:'This launch has expired. Click Open to start again.',
  failed:'The application check failed. Click Open to retry.',
};

// A document load can finish before React hydration. Wait briefly for native
// bootstrap, but never manufacture a tree when a route loader rejected it.
export async function waitForAdsBootstrap(){
  for(let attempt=0;attempt<20;attempt++){
    const errors=globalThis.__reactRouterContext?.state?.errors;
    if(errors&&Object.keys(errors).length)return 'loader-error';
    if(globalThis.__reactRouterManifest){
      for(const node of [document,document.documentElement,document.body].filter(Boolean)){
        const key=Object.keys(node).find(key=>key.startsWith('__reactContainer$'));
        if(key&&node[key]?.stateNode?.current?.child)return 'ready';
      }
    }
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  return 'not-ready';
}

// Only our status is rendered here. This never substitutes for an Ads screen.
export function showAdsLaunchStatus(feature,phase,message){
  const expected=feature==='ads'?'https://ads.openai.com':feature==='shopify'?'https://connect.ads.openai.com':null;
  if(!expected||location.origin!==expected||!document.body)return false;
  document.getElementById('hikoo-native-launch-status')?.remove();
  const bar=document.createElement('aside');bar.id='hikoo-native-launch-status';bar.setAttribute('role','status');bar.dataset.phase=phase;
  Object.assign(bar.style,{position:'fixed',left:'16px',right:'16px',bottom:'16px',zIndex:'2147483647',background:'#111a45',color:'#fff',padding:'14px 18px',borderRadius:'12px',boxShadow:'0 8px 32px #0003',display:'flex',alignItems:'center',gap:'16px',font:'13px/1.5 system-ui'});
  const text=document.createElement('span');text.style.flex='1';
  const title=document.createElement('strong');title.textContent='Hikoo Labs · '+(feature==='ads'?'Ads Manager':'Ads for Shopify')+' · Public app';
  const detail=document.createElement('div');detail.textContent=message;text.append(title,detail);
  const close=document.createElement('button');close.type='button';close.textContent='Dismiss';close.setAttribute('aria-label','Dismiss Hikoo status');close.onclick=()=>bar.remove();
  Object.assign(close.style,{background:'#26305f',color:'#fff',border:'1px solid #6874a2',borderRadius:'7px',padding:'6px 10px',cursor:'pointer'});
  bar.append(text,close);document.body.append(bar);return true;
}

// Session storage contains only our tab/feature/status metadata. Full URLs,
// identity, query strings, server responses and credentials are never stored.
export function createAdsLauncher(api,now=()=>Date.now()){
  const key=id=>'hikoo-launch:'+id,busy=new Map();
  const read=async id=>(await api.storage.session.get(key(id)))[key(id)]||null;
  async function save(job){
    await api.storage.session.set({[key(job.tabId)]:job});
    const badge=job.phase==='sign-in-required'?'AUTH':job.phase==='merchant-context-required'?'SHOP':job.phase==='checking'||job.phase==='opening'?'…':'INFO';
    await api.action.setBadgeText({tabId:job.tabId,text:badge}).catch(()=>{});
    await api.action.setTitle({tabId:job.tabId,title:'Hikoo · '+launchMessages[job.phase]}).catch(()=>{});
    return job;
  }
  async function check(tabId){
    const job=await read(tabId);if(!job)return null;
    const next=phase=>save({...job,phase,updatedAt:now()});
    if(now()-job.startedAt>15*60*1000)return next('expired');
    let tab;try{tab=await api.tabs.get(tabId);}catch{await api.storage.session.remove(key(tabId));return null;}
    let origin,path;try{const url=new URL(tab.url);origin=url.origin;path=url.pathname;}catch{}
    const target=targets[job.feature];
    // No host grant for auth.openai.com or Shopify admin is requested. Never
    // inject into either, including when Chrome withholds their URL entirely.
    if(origin!==target.origin||path?.startsWith('/auth/'))return next('sign-in-required');
    if(tab.status==='loading')return job;
    if(!await api.permissions.contains({origins:[target.origin+'/*']}))return next('permission-required');
    await next('checking');
    try{
      await api.scripting.executeScript({target:{tabId},world:'MAIN',func:waitForAdsBootstrap});
      const [{result}]=await api.scripting.executeScript({target:{tabId},world:'MAIN',files:['ads-runtime.js']});
      // Accept only our known flags; never retain reason strings or raw errors
      // originating from the application.
      const phase=result?.merchantContextRequired?'merchant-context-required':result?.appRoutePresent&&result?.hasCommittedTree?'preview-unavailable':'runtime-unavailable';
      const current=await read(tabId);if(!current||current.startedAt!==job.startedAt)return current;
      const saved=await next(phase);
      await api.scripting.executeScript({target:{tabId},world:'MAIN',func:showAdsLaunchStatus,args:[job.feature,phase,launchMessages[phase]]});
      return saved;
    }catch{return next('failed');}
  }
  function resume(tabId){
    if(busy.has(tabId))return busy.get(tabId);
    const task=check(tabId).finally(()=>busy.delete(tabId));busy.set(tabId,task);return task;
  }
  async function start(feature,sourceTabId){
    if(!['ads','shopify'].includes(feature))throw Error('Unsupported automatic launch target');
    const target=targets[feature];
    if(!await api.permissions.contains({origins:[target.origin+'/*']}))throw Error(launchMessages['permission-required']);
    let source;try{source=await api.tabs.get(sourceTabId);}catch{}
    let sameOrigin=false;try{sameOrigin=new URL(source.url).origin===target.origin;}catch{}
    // Preserve the current authorized embedded Shopify URL, including its
    // transient context; never copy that URL into extension storage.
    const tab=sameOrigin?source:await api.tabs.create({url:'about:blank',active:true});
    const job=await save({feature,tabId:tab.id,phase:'opening',startedAt:now(),updatedAt:now()});
    if(sameOrigin){await api.tabs.update(tab.id,{active:true});return resume(tab.id);}
    await api.tabs.update(tab.id,{url:target.url});return job;
  }
  async function remove(tabId){await api.storage.session.remove(key(tabId));}
  return{start,resume,read,remove};
}
