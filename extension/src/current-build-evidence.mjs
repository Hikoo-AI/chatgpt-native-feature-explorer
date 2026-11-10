// Own metadata-only probe shared by legacy Playwright and Orca. No module
// implementation is exported. Static candidate chunks are loaded by the native
// loader, while connections are blocked in the controlled test document.
export async function inspectCurrentBuild(){
  if(location.origin!=='https://chatgpt.com')throw Error('ChatGPT native origin required');
  if(![...document.querySelectorAll('meta[http-equiv]')].some(m=>/content-security-policy/i.test(m.httpEquiv)&&m.content.includes("connect-src 'none'")))throw Error('Run this probe only in the network-isolated preview');

    const manifest=__reactRouterManifest;
    let runtime, runtimeURL;
    for(const path of manifest.entry.imports){const m=await import(new URL(path,location.origin));if(m.__webpack_require__){runtime=m.__webpack_require__;runtimeURL=path;break;}}
    if(!runtime)throw Error('No native module runtime');
    const r=runtime, originalGateWrites=0;
    const before=new Set(Object.keys(r.m)),originalCache=new Set(Object.keys(r.c));
    const definitions=()=>Object.entries(r.m).map(([id,factory])=>({id,source:factory.toString()}));
    const exportsOf=id=>Object.keys(r.c[id]?.exports||{});
    const initialLazy=[];
    for(const {id,source}of definitions()){
      for(const component of ['BrowserSkillEditor','WorkspaceAgentsPage','WorkspaceAgentBuilderPage','HealthSidebarController']){
        const at=source.indexOf(').'+component);if(at<0)continue;
        const start=Math.max(source.lastIndexOf('Promise.all([',at),source.lastIndexOf('await n.e(',at));
        const segment=source.slice(start,at);
        const chunkIds=[...segment.matchAll(/\.e\((\d+)\)/g)].map(m=>Number(m[1]));
        const moduleId=[...segment.matchAll(/\.bind\([^,]+,"([^"]+)"\)/g)].at(-1)?.[1];
        if(moduleId&&chunkIds.length)initialLazy.push({component,loaderModule:id,moduleId,chunks:[...new Set(chunkIds)]});
      }
    }
    const loads=[];
    async function loadChunks(ids,reason){
      await Promise.all(ids.map(async id=>{
        const path=r.u(id);if(!path||path.includes('undefined')){loads.push({id,reason,available:false});return;}
        try{await Promise.race([r.e(id),new Promise((_,reject)=>setTimeout(()=>reject(Error('Static asset load timeout')),10000))]);loads.push({id,path,reason,available:true});}catch{loads.push({id,path,reason,available:false});}
      }));
    }
    await Promise.all(initialLazy.map(lazy=>loadChunks(lazy.chunks,lazy.component+' current lazy declaration')));
    // Historical chunk numbers are candidate hints only. The current runtime
    // must resolve an actual current asset; expected module signatures below
    // are checked afresh, so chunk presence alone never confirms a feature.
    await loadChunks([376847,320111,712588,655368],'historical candidate; current signature required');
    const all=definitions();
    const candidates=[
      {name:'Skills',component:'BrowserSkillEditor',expected:'EOSE',tokens:['BrowserSkillEditor','chatgpt.workspace.skills.access']},
      {name:'Workspace Agents',component:'WorkspaceAgentsPage',expected:'z3mf',tokens:['WorkspaceAgentsPage','/hermes/workspace-store/agents']},
      {name:'Workspace Agent Studio',component:'WorkspaceAgentBuilderPage',expected:'y8PF',tokens:['WorkspaceAgentBuilderPage','/agents/studio/']},
      {name:'Automations',expected:'JzcZ',tokens:['inbox.automations.executionLocation','/automations/query']},
      {name:'Memory Summary',component:'MemorySummaryDialog',expected:'rIVa',tokens:['MemorySummaryDialog','/memories/about_you/summary']},
      {name:'Health',component:'HealthSidebarController',expected:'vaKJ',tokens:['HealthSidebarController','connector_openai_olympic']},
      {name:'Study Hours',expected:'vCIC',tokens:['chatgpt-parent-managed-study-mode-lock','study_hours_schedule']}
    ];
    const results=candidates.map(c=>{
      const hits=all.filter(x=>c.tokens.some(t=>x.source.includes(t)));
      const direct=r.m[c.expected]?.toString()||'';
      return{name:c.name,expectedModule:c.expected,moduleRegistered:!!r.m[c.expected],initializedBefore:originalCache.has(c.expected),initializedNow:!!r.c[c.expected],exports:exportsOf(c.expected),declaredExports:[...(direct.match(/\.d\([^,]+,\{([^}]+)\}/)?.[1]||'').matchAll(/([\w$]+):\(\)=>/g)].map(m=>m[1]).filter((x,i,a)=>a.indexOf(x)===i),componentSignaturePresent:c.component?direct.includes(c.component):null,candidateSignaturePresent:c.component?direct.includes(c.component):c.tokens.some(token=>direct.includes(token)),matchingModules:hits.map(x=>({id:x.id,initialized:!!r.c[x.id],exports:exportsOf(x.id),tokens:c.tokens.filter(t=>x.source.includes(t))})),previewValidated:false,publicReleaseStatus:'not established'};
    });
    const routeStrings=[...new Set(all.flatMap(x=>[...x.source.matchAll(/"(\/(?:skills|agents|automations|routines|tasks|scheduled|health)[^"\s]*)"/g)].map(m=>m[1])))].sort();
    const flags=['3553340571','73506792','2711242789','1355972088','2039979220','1010509169','2401070674','2220834113','834565546','3435160418','820196652','2487863402','219401130','chatgpt-parent-managed-study-mode-lock'].map(identifier=>({identifier,modules:all.filter(x=>x.source.includes(identifier)).map(x=>x.id),effectiveValueRead:false}));
    const asset=performance.getEntriesByType('resource').map(e=>{try{return new URL(e.name);}catch{return null;}}).filter(u=>u?.origin===location.origin&&u.pathname.startsWith('/cdn/assets/')).map(u=>u.pathname);
    return{observedAt:new Date().toISOString(),origin:location.origin,pathname:location.pathname,manifestVersion:manifest.version,buildId:/^[a-f0-9]{40}$/.test(document.documentElement.dataset.build||'')?document.documentElement.dataset.build:null,runtimeURL,initialModuleCount:before.size,finalModuleCount:Object.keys(r.m).length,initialLazy,loads,candidates:results,routeStrings,flags,assetPaths:[...new Set(asset)],safety:{mountedComponents:0,explicitPrivateApiCallsInProbe:0,gateWrites:originalGateWrites,sourcePersisted:false},note:'Only current module definitions and lazy dependencies checked. Presence is not admission, public rollout status, or render validation.'};
}
