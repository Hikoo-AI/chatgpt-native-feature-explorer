// Own metadata collector. Self-contained so MV3 MAIN and Orca evaluate the same
// function. It neither initializes candidate modules nor evaluates feature gates.
export async function collectRuntimeEvidence() {
  const catalog=[
    {key:'insights',name:'Business Hub Insights',component:'BusinessProfileManagerView',markers:['BusinessProfileManagerView']},
    {key:'skills',name:'Skills',component:'BrowserSkillEditor',markers:['BrowserSkillEditor']},
    {key:'agents',name:'Workspace Agents',component:'WorkspaceAgentsPage',markers:['WorkspaceAgentsPage']},
    {key:'studio',name:'Workspace Agent Studio',component:'WorkspaceAgentBuilderPage',markers:['WorkspaceAgentBuilderPage']},
    {key:'automations',name:'Automations',markers:['inbox.automations.executionLocation']},
    {key:'memory',name:'Memory Summary',component:'MemorySummaryDialog',markers:['MemorySummaryDialog']},
    {key:'health',name:'Health',component:'HealthSidebarController',markers:['HealthSidebarController']},
    {key:'study',name:'Study Hours',markers:['chatgpt-parent-managed-study-mode-lock']},
  ];
  const flagIds=['2778625748','1466237283','3553340571','73506792','2711242789','1355972088','2039979220','1010509169','2401070674','3435160418','820196652','2487863402','219401130','chatgpt-parent-managed-study-mode-lock'];
  const pathPrefixes=['/skills','/agents','/automations','/routines','/tasks','/scheduled','/health','/business-hub'];
  const report={schema:'hikoo-native-evidence-v1',observedAt:new Date().toISOString(),
    site:location.origin==='https://chatgpt.com'?'chatgpt.com':'unsupported',
    status:'runtime-unavailable',collectionMode:'registered-modules-only',
    build:null,manifestVersion:null,runtimeAsset:null,registeredModules:0,initializedModules:0,
    nativeRootPresent:Object.keys(document).some(key=>key.startsWith('__reactContainer$')),
    previewActive:!!document.getElementById('native-full-insights-sample'),candidates:[],flags:[],routeReferences:[],
    limits:{candidateChunksLoaded:false,candidateModulesInitialized:false,gateValuesRead:false,permissionsChanged:false,
      networkObserved:false,privateApiCalled:false,proprietarySourcesStored:false,renderingValidated:false}};
  const manifest=globalThis.__reactRouterManifest;
  if(report.site!=='chatgpt.com'||!manifest?.entry?.imports)return report;
  // Resolve only a runtime already referenced by the current document. Native
  // candidate lazy loaders are NOT invoked; an absent chunk stays unconfirmed.
  let runtime;
  for(const path of manifest.entry.imports){
    let url;try{url=new URL(path,location.origin);}catch{continue;}
    if(url.origin!==location.origin||!/^\/cdn\/assets\/[\w.-]+\.js$/.test(url.pathname))continue;
    const namespace=await import(url.href);
    if(namespace.__webpack_require__){runtime=namespace.__webpack_require__;report.runtimeAsset=url.pathname;break;}
  }
  if(!runtime?.m||!runtime?.c)return report;
  const sources=[];
  for(const [id,factory]of Object.entries(runtime.m)){
    if(!/^[\w$]{1,12}$/.test(id)||typeof factory!=='function')continue;
    try{sources.push({id,source:Function.prototype.toString.call(factory)});}catch{}
  }
  const build=document.documentElement.dataset.build;
  report.build=/^[a-f0-9]{40}$/.test(build||'')?build:null;
  report.manifestVersion=/^(?:[a-f0-9]{8}|[a-f0-9]{40})$/.test(manifest.version||'')?manifest.version:null;
  report.status='collected';report.registeredModules=Object.keys(runtime.m).length;report.initializedModules=Object.keys(runtime.c).length;
  const contextNames={BolX:'Scopes',jqIZ:'Router',EOo5:'Authentication',irkb:'React Query',Wf1j:'Translation',OMIV:'Statsig',zd8w:'Native React'};
  report.candidates=catalog.map(candidate=>{
    const references=sources.filter(item=>candidate.markers.some(marker=>item.source.includes(marker)));
    const declarations=candidate.component?references.filter(item=>new RegExp('(?:^|[,{])\\s*'+candidate.component+'\\s*:').test(item.source)):[];
    const exports=declarations.map(item=>({module:item.id,initialized:!!runtime.c[item.id],
      exportAvailable:Object.prototype.hasOwnProperty.call(runtime.c[item.id]?.exports||{},candidate.component)}));
    const dependencies=new Set();
    for(const item of declarations.length?declarations:references){
      const parameter=item.source.match(/^[^(]*\([^,]*,[^,]*,\s*([\w$]+)\s*\)/)?.[1];
      if(!parameter)continue;
      const calls=new RegExp(parameter.replaceAll('$','\\$')+'\\(\"([\\w$]{1,12})\"\\)','g');
      for(const match of item.source.matchAll(calls))if(Object.hasOwn(runtime.m,match[1]))dependencies.add(match[1]);
    }
    const directDependencies=[...dependencies].slice(0,80);
    return{key:candidate.key,name:candidate.name,component:candidate.component||null,
      directDependencyCount:dependencies.size,dependencyBasis:declarations.length?'component-factory':'reference-factory',directDependencies,
      contextReferences:directDependencies.filter(id=>contextNames[id]).map(id=>contextNames[id]),
      status:exports.length?'component-declared':references.length?'references-only':'not-registered-in-this-tab',
      modules:exports,references:references.slice(0,40).map(item=>item.id),renderingValidated:false,publicReleaseStatus:'not-established'};
  });
  report.flags=flagIds.map(identifier=>({identifier,referencedBy:sources.filter(item=>item.source.includes(identifier)).slice(0,40).map(item=>item.id),effectiveValueRead:false}));
  report.routeReferences=pathPrefixes.filter(path=>sources.some(item=>item.source.includes('"'+path)||item.source.includes("'"+path)));
  return report;
}

// Export a whitelist, never arbitrary page fields. A page-provided object cannot
// add cookies, identities, URLs, conversation bodies, source text or error stacks.
export function safeRuntimeEvidence(value) {
  const integer=value=>Number.isSafeInteger(value)&&value>=0?value:0;
  const moduleId=value=>typeof value==='string'&&/^[\w$]{1,12}$/.test(value);
  const modules=(value,limit=40)=>Array.isArray(value)?value.filter(moduleId).slice(0,limit):[];
  const names={insights:['Business Hub Insights','BusinessProfileManagerView'],skills:['Skills','BrowserSkillEditor'],agents:['Workspace Agents','WorkspaceAgentsPage'],studio:['Workspace Agent Studio','WorkspaceAgentBuilderPage'],automations:['Automations',null],memory:['Memory Summary','MemorySummaryDialog'],health:['Health','HealthSidebarController'],study:['Study Hours',null]};
  const statuses=new Set(['component-declared','references-only','not-registered-in-this-tab']);
  const knownFlags=new Set(['2778625748','1466237283','3553340571','73506792','2711242789','1355972088','2039979220','1010509169','2401070674','3435160418','820196652','2487863402','219401130','chatgpt-parent-managed-study-mode-lock']);
  const knownRoutes=new Set(['/skills','/agents','/automations','/routines','/tasks','/scheduled','/health','/business-hub']);
  return{schema:'hikoo-native-evidence-v1',observedAt:typeof value?.observedAt==='string'&&/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(value.observedAt)?value.observedAt:null,
    site:value?.site==='chatgpt.com'?'chatgpt.com':'unsupported',status:value?.status==='collected'?'collected':'runtime-unavailable',collectionMode:'registered-modules-only',
    build:/^[a-f0-9]{40}$/.test(value?.build||'')?value.build:null,
    manifestVersion:/^(?:[a-f0-9]{8}|[a-f0-9]{40})$/.test(value?.manifestVersion||'')?value.manifestVersion:null,
    runtimeAsset:/^\/cdn\/assets\/\d+\.[a-f0-9]{8,64}\.js$/.test(value?.runtimeAsset||'')?value.runtimeAsset:null,
    registeredModules:integer(value?.registeredModules),initializedModules:integer(value?.initializedModules),
    nativeRootPresent:value?.nativeRootPresent===true,previewActive:value?.previewActive===true,
    candidates:(Array.isArray(value?.candidates)?value.candidates:[]).filter(c=>Object.hasOwn(names,c?.key)).slice(0,8).map(c=>({key:c.key,name:names[c.key][0],component:names[c.key][1],status:statuses.has(c.status)?c.status:'not-registered-in-this-tab',
      directDependencyCount:integer(c.directDependencyCount),dependenciesTruncated:integer(c.directDependencyCount)>modules(c.directDependencies,80).length,dependencyBasis:c.dependencyBasis==='component-factory'?'component-factory':'reference-factory',directDependencies:modules(c.directDependencies,80),contextReferences:(Array.isArray(c.contextReferences)?c.contextReferences:[]).filter(name=>['Scopes','Router','Authentication','React Query','Translation','Statsig','Native React'].includes(name)),
      modules:(Array.isArray(c.modules)?c.modules:[]).filter(m=>moduleId(m?.module)).slice(0,40).map(m=>({module:m.module,initialized:m.initialized===true,exportAvailable:m.exportAvailable===true})),references:modules(c.references),renderingValidated:false,publicReleaseStatus:'not-established'})),
    flags:(Array.isArray(value?.flags)?value.flags:[]).filter(f=>knownFlags.has(f?.identifier)).slice(0,14).map(f=>({identifier:f.identifier,referencedBy:modules(f.referencedBy),effectiveValueRead:false})),
    routeReferences:(Array.isArray(value?.routeReferences)?value.routeReferences:[]).filter(path=>knownRoutes.has(path)),
    limits:{candidateChunksLoaded:false,candidateModulesInitialized:false,gateValuesRead:false,permissionsChanged:false,networkObserved:false,privateApiCalled:false,proprietarySourcesStored:false,renderingValidated:false}};
}
