// Our fixture adapter only. All rendered business components and providers come
// from the live application's module cache. No proprietary implementation here.
void (async()=>{
  if(['loading','mounted'].includes(globalThis.__nativeFullPreview?.phase)){delete globalThis.__nativeFullFixtures;return;}
  if(location.origin!=='https://chatgpt.com'||location.pathname!=='/gpts')throw Error('Dedicated native /gpts tab required');
  const sample=globalThis.__nativeFullFixtures;
  if(!sample?.seven?.sampleData||!sample?.twentyEight?.sampleData)throw Error('Explicit fixtures required');
  delete globalThis.__nativeFullFixtures;
  const state=globalThis.__nativeFullPreview={phase:'loading',productionGateOverride:false,fixturePresentationGateOverrides:[],realResponseMocks:false};
  const policy=document.createElement('meta');policy.httpEquiv='Content-Security-Policy';policy.content="connect-src 'none'; form-action 'none'";document.head.append(policy);
  const originalURL=location.href;
  const stop=()=>{history.replaceState(history.state,'',originalURL);location.reload();};state.stop=stop;
  window.addEventListener('message',event=>{
    if(event.source===window&&event.origin===location.origin&&event.data?.type==='native-full-fixture-stopped')stop();
  });
  try{
    const manifest=__reactRouterManifest;
    const originalBusinessRoute=manifest.routes['business-profiles.route'];
    const originalAuthRoute=manifest.routes['authenticated-layout.route'];
    const originalNetwork={fetch,XMLHttpRequest,beacon:navigator.sendBeacon};
    const url=manifest.entry.imports.find(u=>/\/633146\.[a-f0-9]+\.js$/.test(u));
    const r=(await import(new URL(url,location.origin).href)).__webpack_require__;
    const key=Object.keys(document).find(k=>k.startsWith('__reactContainer$'));
    const root=document[key].stateNode;
    const walk=visit=>{const queue=[root.current];while(queue.length){const f=queue.pop();visit(f);if(f.child)queue.push(f.child);if(f.sibling)queue.push(f.sibling);}};
    let router;walk(f=>{if(f.tag===10&&f.memoizedProps?.value?.router)router=f.memoizedProps.value.router;});
    if(!router)throw Error('Original router required');
    const loader=Object.entries(r.c).find(([id])=>r.m[id]?.toString().includes('BusinessProfilesRoute')&&r.m[id]?.toString().includes('LazyBusinessProfilesPage.prefetch'));
    const load=Object.values(loader[1].exports).find(v=>typeof v==='function'&&v.toString().includes('BusinessProfilesRoute')&&!v.toString().includes('prefetch'));
    const Route=await load();
    await Object.values(r.c).find(m=>m.exports?.BusinessProfilesRoute===Route).exports.LazyBusinessProfilesPage.prefetch();
    const source=r.m.eUoS.toString();const prefix=source.slice(0,source.indexOf('e.BusinessProfileManagerView'));
    const part=prefix.slice(prefix.lastIndexOf('Promise.all(['));
    await Promise.all([...part.matchAll(/\.e\((\d+)\)/g)].map(m=>r.e(+m[1])));
    // Original lazy Agent builder entry; no copied implementation.
    await Promise.all([857739,118186,313356].map(chunk=>r.e(chunk)));
    const Manager=r('lDTh').BusinessProfileManagerView;
    const React=r.c.zd8w.exports,h=React.createElement,S=r.c.BolX.exports;
    const nativePortal=Object.values(r.c).find(module=>typeof module.exports?.createPortal==='function')?.exports.createPortal;
    const App=r.c.OWtl.exports.a,Thread=r.c.kl6F.exports.a,RouteScope=r.c.tSEg.exports.a;
    function readBusinessGate(scope){const value=scope.get(r.c.OMIV.exports.d,'2778625748');if(typeof value!=='boolean')throw Error('Native gate binding is incompatible with this build');return value;}
    const Client=Object.values(r.c).flatMap(m=>Object.values(m.exports||{})).find(v=>typeof v==='function'&&typeof v.prototype?.getQueryCache==='function'&&typeof v.prototype?.setQueryData==='function');
    const client=new Client({defaultOptions:{queries:{retry:false,staleTime:Infinity,gcTime:Infinity,refetchOnWindowFocus:false,refetchOnReconnect:false}}});
    const NativeQueryProvider=r.c.irkb.exports.b;
    const contexts=Object.values(r.c.jqIZ.exports).filter(v=>{try{return v?.$$typeof===Symbol.for('react.context');}catch{return false;}});
    const Location=contexts.find(v=>v.displayName==='Location'),RouteContext=contexts.find(v=>v.displayName==='Route');
    const profile=sample.twentyEight.manager.profile.business_profile_id;
    const sampleBase='/business-hub/'+profile;
    let sampleNavigate,showNotice,saveLocalDrafts,MemoryDialog;
    const memoryAccount='hikoo-fictional-memory-account';
    state.memoryReadOnly=true;
    async function loadMemory(){
      // Resolve the actual native lazy declaration, including shared chunks.
      // A single historical chunk ID is not sufficient to initialize this UI.
      await r.e(68473);
      const declaration=Object.values(r.m).map(factory=>factory.toString()).find(source=>source.includes('"rIVa"')&&source.includes('MemorySummaryDialog')&&source.includes('Promise.all(['));
      if(!declaration)throw Error('Current native memory loader unavailable');
      const at=declaration.indexOf('"rIVa"'),prefix=declaration.slice(declaration.lastIndexOf('Promise.all([',at),at);
      const chunks=[...prefix.matchAll(/\.e\((\d+)\)/g)].map(match=>Number(match[1]));
      if(!chunks.includes(376847))throw Error('Native memory loader changed');
      await Promise.all(chunks.map(chunk=>r.e(chunk)));
      state.memoryChunks=chunks;
      MemoryDialog=r('rIVa').MemorySummaryDialog;
      if(typeof MemoryDialog!=='function')throw Error('Native MemorySummaryDialog unavailable in this build');
    }
    const editorSections=new Set(sample.twentyEight.manager.available_sections);
    function previewTarget(destination){
      const url=new URL(destination,location.origin);
      if(url.origin!==location.origin)return{error:'External links are disabled during this preview. Close it to open the real service.'};
      if(url.pathname==='/gpts'&&url.search)url.pathname=state.sampleLocation.pathname;
      const section=url.pathname.slice(sampleBase.length+1);
      if(!url.pathname.startsWith(sampleBase+'/'))return{error:'This route requires a different business session and is outside the sample data.'};
      if(!['insights','products','agent'].includes(section)&&!(section.startsWith('edit/')&&editorSections.has(section.slice(5))))return{error:'This operation is not available in the local preview.'};
      for(const [key,value]of url.searchParams){
        if(section==='products'&&key==='activity'&&['history','issues'].includes(value))continue;
        if(key==='insight'&&section==='insights'&&value==='agent')continue;
        return{error:'This action requires a server operation or authorization and is disabled in this preview.'};
      }
      return{url};
    }
    function requestNavigation(destination){
      const target=previewTarget(destination);
      if(target.error){state.blockedActions=(state.blockedActions??0)+1;showNotice?.(target.error);return;}
      showNotice?.('');sampleNavigate?.(target.url);
    }
    state.previewNavigation=[];
    state.previewLinkChecks=[];
    const originalClients=new Set();walk(f=>{const v=f.tag===10?f.memoizedProps?.value:null;if(v&&typeof v.getQueryCache==='function')originalClients.add(v);});
    function IsolatedManager({originalApp,originalAuth,manager}){
      const isolatedApp=S.y(App),isolatedRoute=S.y(RouteScope);
      const queryClient=r.c.irkb.exports.c();
      const auth=r.c.EOo5.exports.a();
      const dataRouter=React.useContext(r.c.jqIZ.exports.c);
      state.isolationProof={differentScopeStore:isolatedApp.node.store!==originalApp.node.store,
        appScopeUsesFixtureClient:isolatedApp.queryClient===client,
        routeScopeUsesFixtureClient:isolatedRoute.queryClient===client,
        reactQueryUsesFixtureClient:queryClient===client,
        originalAuthIdentity:auth===originalAuth,originalDataRouter:dataRouter.router===router};
      return h(React.Fragment,null,h(Manager,{manager}),state.memoryOpen&&MemoryDialog&&h(MemoryDialog,{
        accountId:memoryAccount,forceRefresh:false,onClose:state.closeMemory
      }));
    }
    function FixtureBranch(){
      const auth=r.c.EOo5.exports.a();
      const locale=r.c.Wf1j.exports.a().locale;
      const [sampleLocation,setSampleLocation]=React.useState({pathname:sampleBase+'/insights',search:''});
      const [notice,setNotice]=React.useState('');showNotice=setNotice;
      const [localManager,setLocalManager]=React.useState(sample.twentyEight.manager);
      const [memoryOpen,setMemoryOpen]=React.useState(false);
      const displayToolbar=element=>memoryOpen&&nativePortal?nativePortal(element,document.body):element;
      state.memoryOpen=memoryOpen;
      state.closeMemory=()=>setMemoryOpen(false);
      const openMemory=async()=>{
        if(!sample.memory?.sampleData){setNotice('Memory fixture missing. Reload the preview.');return;}
        try{
          await loadMemory();
          // All locales receive an empty action list. No selection action is
          // enabled, and query functions are disabled for this fixture prefix.
          for(const prefix of ['chatgpt-about-you-summary','chatgpt-about-you-summary-checksum','chatgpt-about-you-selection-actions'])client.setQueryDefaults([prefix,memoryAccount],{enabled:false,retry:false});
          client.setQueryData(['chatgpt-about-you-summary',memoryAccount],sample.memory.summary);
          client.setQueryData(['chatgpt-about-you-summary-checksum',memoryAccount],sample.memory.checksum);
          client.setQueryData(['chatgpt-about-you-selection-actions',memoryAccount,locale],sample.memory.selectionActions);
          setNotice('Memory Summary · Publicly documented · Read-only fictional character.');
          setMemoryOpen(true);
        }catch{setNotice('Native dialog unavailable in this build.');}
      };
      saveLocalDrafts=form=>{
        const drafts=new Map();
        const consider=f=>{const p=f.memoizedProps;if(p?.profileId!==profile||p.valid!==true||!p.field?.field_key||!p.draft||typeof p.onDraftChange!=='function')return;
          if(!['upsert','clear'].includes(p.draft.operation))return;drafts.set(p.field.field_key,{draft:p.draft,clear:p.onDraftChange});};
        if(form){const key=Object.keys(form).find(k=>k.startsWith('__reactFiber$'));for(let f=form[key];f&&f.type!==Manager;f=f.return)consider(f);}
        else walk(consider);
        if(!drafts.size){showNotice('No valid draft to save locally.');return;}
        const revision='fixture-local-'+((state.localSaveCount??0)+1);
        const updated={...localManager,fields:localManager.fields.map(field=>{const entry=drafts.get(field.field_key);if(!entry)return field;const value=entry.draft.operation==='clear'?null:entry.draft.value;return{...field,editor_value:value,preview_value:value,revision,current_revision:{...field.current_revision,id:revision,value},approved_revision:{...field.approved_revision,id:revision,value}};})};
        client.setQueryData(['business-profiles',auth.accountId,profile,'manager'],updated);
        setLocalManager(updated);for(const entry of drafts.values())entry.clear(undefined);
        state.localSaveCount=(state.localSaveCount??0)+1;state.localSavedFields=[...drafts.keys()];
        showNotice('Sample data saved in memory only. No account changes.');
      };
      sampleNavigate=url=>{state.previewNavigation.push(url.pathname+url.search);setSampleLocation({pathname:url.pathname,search:url.search});};
      const samplePath=sampleLocation.pathname;
      state.sampleLocation=sampleLocation;
      const app=S.y(App),thread=S.y(Thread);
      state.originalAppScope=app;
      state.originalGate=readBusinessGate(app);
      const nativeLocation=React.useContext(Location),route=React.useContext(RouteContext);
      const [ready]=React.useState(()=>{
        if(!auth.accountId||!auth.userId)throw Error('Original authenticated context unavailable');
        const base=['business-profiles',auth.accountId,profile];
        client.setQueryData([...base,'manager'],sample.twentyEight.manager);
        const feeds=r('oXx6').b(auth.accountId,auth.userId,profile,null);
        client.setQueryData(feeds.queryKey,{items:[],next_cursor:null});
        client.setQueryData([...base,'insights',auth.userId],sample.twentyEight.insights);
        client.setQueryData([...base,'insights',auth.userId,'requested-window'],sample.twentyEight.window);
        for(const [days,data]of [[7,sample.seven],[28,sample.twentyEight]])client.setQueryData([...base,'discovery-topics',auth.userId,days],data.discovery);
        state.productionCacheUntouched=[...originalClients].every(c=>c.getQueryState([...base,'manager'])===undefined);
        return true;
      });
      const access={mode:'owner',accountId:auth.accountId,userId:auth.userId,profileId:profile};
      const routeValue=r.c.tSEg.exports.b({pathname:samplePath,routeTemplate:'/business-hub/:profileId/*',search:sampleLocation.search});
      // This is an explicitly simulated location in a fixture-only subtree. The
      // actual data router, protected route, real AuthProvider and URL stay intact.
      const locationValue={...nativeLocation,location:{...nativeLocation.location,pathname:samplePath,search:sampleLocation.search,hash:''}};
      const editorSection=samplePath.startsWith(sampleBase+'/edit/')?samplePath.slice((sampleBase+'/edit/').length):undefined;
      const routeContext={...route,matches:route.matches.map((m,i)=>i===route.matches.length-1?{...m,pathname:samplePath,pathnameBase:samplePath,params:{...m.params,profileId:profile,section:editorSection}}:m)};
      const view=h(IsolatedManager,{originalApp:app,originalAuth:auth,manager:localManager});
      const scoped=h(S.b,{scope:App,value:app.value},
        h(S.b,{scope:Thread,value:thread.value},
          h(S.b,{scope:RouteScope,value:routeValue},
            h(S.b,{scope:r.c.C1dV.exports.a,value:{access}},
              h(S.b,{scope:r.c.HwNs.exports.a,value:{accountId:auth.accountId,userId:auth.userId,profileId:profile,enabled:false}},view)))));
      return h('section',{id:'native-full-insights-sample',style:{height:'100vh',maxHeight:'100vh',minHeight:0,display:'flex',flexDirection:'column',overflow:'hidden'},onClickCapture:event=>{
        const button=event.target.closest?.('button');
        if(state.memoryOpen&&!event.target.closest?.('[data-hikoo-toolbar]')){
          if(button&&/^(Close|Fermer)$/i.test(button.getAttribute('aria-label')||button.textContent.trim()))return;
          event.preventDefault();event.stopPropagation();state.memoryBlockedActions=(state.memoryBlockedActions??0)+1;return;
        }
        if(button&&!button.closest('form')&&/^(Save|Enregistrer|Sauvegarder)$/.test(button.textContent.trim())){event.preventDefault();event.stopPropagation();saveLocalDrafts();return;}
        const anchor=event.target.closest?.('a[href]');
        if(anchor){event.preventDefault();event.stopPropagation();
          const url=new URL(anchor.href,location.origin);
          state.previewLinkChecks.push({sameOrigin:url.origin===location.origin,sampleProfile:url.pathname.startsWith(sampleBase+'/'),section:url.pathname.split('/').at(-1),queryKeys:[...url.searchParams.keys()]});
          requestNavigation(url.href);
        }
      },onKeyDownCapture:event=>{if(state.memoryOpen&&event.key==='Enter'){event.preventDefault();event.stopPropagation();}},onSubmitCapture:event=>{event.preventDefault();event.stopPropagation();if(!state.memoryOpen)saveLocalDrafts(event.target);}},
        displayToolbar(h('div',{'data-hikoo-toolbar':true,style:{position:memoryOpen?'fixed':'relative',top:0,left:0,right:0,flexShrink:0,display:'flex',alignItems:'center',gap:12,justifyContent:'space-between',background:'#111a45',color:'#ffffff',padding:'10px 18px',font:'12px system-ui',borderBottom:'1px solid #26305f',zIndex:2147483647}},
          h('span',{style:{display:'flex',alignItems:'center',gap:9}},h('strong',{style:{fontSize:13,letterSpacing:'-.2px',paddingRight:12,borderRight:'1px solid #56618d'}},'Hikoo Labs'),'Experimental preview · Sample data'),
          notice&&h('span',{role:'status','data-preview-notice':true,style:{flex:1,fontSize:11,color:'#e1e6ff'}},notice),
          sample.includePublicMemoryPreview&&h('button',{'data-memory-preview':true,onClick:memoryOpen?()=>setMemoryOpen(false):openMemory,style:{border:'1px solid #6874a2',borderRadius:7,background:'#26305f',color:'#fff',padding:'6px 11px',cursor:'pointer'}},memoryOpen?'Close Memory Summary':'Memory Summary'),
          h('button',{onClick:stop,'aria-label':'Close preview',style:{border:'1px solid #6874a2',borderRadius:7,background:'#26305f',color:'#ffffff',padding:'6px 11px',font:'11px system-ui',cursor:'pointer'}},'Close'))),
        ready&&h('div',{style:{flex:1,minHeight:0,overflow:'hidden'}},h(Location.Provider,{value:locationValue},h(RouteContext.Provider,{value:routeContext},h(S.a,{queryClient:client},h(NativeQueryProvider,{client},scoped))))));
    }
    class Boundary extends React.Component{
      constructor(p){super(p);this.state={error:null};}
      static getDerivedStateFromError(e){return{error:e.message};}
      componentDidCatch(e){state.phase='blocked';state.error=e.message;}
      render(){return this.state.error?h('p',{'data-fixture-error':true},this.state.error):this.props.children;}
    }
    const id='native-full-insights-fixture';
    manifest.routes[id]={id,parentId:'authenticated-layout.route',path:'gpts',module:'',hasAction:false,hasLoader:false,hasClientAction:false,hasClientLoader:false,hasClientMiddleware:false,hasDefaultExport:true,hasErrorBoundary:false,imports:[],css:[]};
    __reactRouterRouteModules[id]={default:FixtureBranch};
    router.patchRoutes('authenticated-layout.route',[{id,path:'gpts',element:h(Boundary,null,h(FixtureBranch))}]);
    state.verify=()=>{
      let managers=0,sameRoot=true,metrics=0,discovery=0;
      const Metrics=r.c.K0bl?.exports.BusinessInsightsMetrics,Discovery=r.c.FCa5?.exports.DiscoveryTopics;
      walk(f=>{if(f.type===Manager){managers++;let parent=f;while(parent.return)parent=parent.return;sameRoot&&=parent.stateNode===root;}
        if(Metrics&&f.type===Metrics)metrics++;if(Discovery&&f.type===Discovery)discovery++;});
      return{managers,sameRoot:managers>0&&sameRoot,metrics,discovery,productionCacheUntouched:state.productionCacheUntouched,
        originalGateBefore:state.originalGate,originalGateNow:readBusinessGate(state.originalAppScope),
        realRouteUnchanged:manifest.routes['business-profiles.route']===originalBusinessRoute&&manifest.routes['authenticated-layout.route']===originalAuthRoute,
        networkFunctionsUnchanged:fetch===originalNetwork.fetch&&XMLHttpRequest===originalNetwork.XMLHttpRequest&&navigator.sendBeacon===originalNetwork.beacon,
        actualRouterPath:router.state.location.pathname,locationContextIsFixture:true,navigationAdapterActive:!!state.navigationAdapter,isolation:state.isolationProof};
    };
    state.provenance=async()=>{
      const checks=[];
      for(const [chunk,modules]of [[850301,['lDTh','K0bl']],[332323,['FCa5']]]){
        const asset=new URL(r.u(chunk),new URL(r.p,location.origin));
        const namespace=await import(asset.href);
        for(const module of modules)checks.push({module,asset:asset.pathname,sameFactory:namespace.__webpack_modules__[module]===r.m[module]});
      }
      return{build:document.documentElement.dataset.build,runtime:url,checks};
    };
    state.verifyMemory=()=>{
      let count=0,sameRoot=true,fakeAccount=true;
      walk(f=>{if(MemoryDialog&&f.type===MemoryDialog){count++;fakeAccount&&=f.memoizedProps.accountId===memoryAccount;let parent=f;while(parent.return)parent=parent.return;sameRoot&&=parent.stateNode===root;}});
      const prefixes=['chatgpt-about-you-summary','chatgpt-about-you-summary-checksum','chatgpt-about-you-selection-actions'];
      return{count,sameRoot:count>0&&sameRoot,readOnly:state.memoryReadOnly,fakeAccount:count>0&&fakeAccount,
        queriesDisabled:prefixes.every(prefix=>client.getQueryDefaults([prefix,memoryAccount]).enabled===false),
        noFetching:client.getQueryCache().getAll().filter(q=>prefixes.includes(q.queryKey[0])).every(q=>q.state.fetchStatus==='idle')};
    };
    state.memoryProvenance=async()=>{
      const asset=new URL(r.u(376847),new URL(r.p,location.origin));
      const namespace=await import(asset.href);
      return{module:'rIVa',asset:asset.pathname,sameFactory:namespace.__webpack_modules__.rIVa===r.m.rIVa,originalExport:MemoryDialog===r.c.rIVa?.exports.MemorySummaryDialog};
    };
    await router.navigate('/gpts#native-full-insights-fixture');
    // Keep the original router object/providers, but contain navigation to the
    // fixture subtree. Native editors register their own blockers, so a single
    // outer blocker is insufficient to isolate their Back and query actions.
    const fixtureNavigate=async destination=>{
      if(typeof destination==='number'){showNotice?.('Use the preview’s Back controls.');return;}
      const current=new URL(state.sampleLocation.pathname+state.sampleLocation.search,location.origin);
      const value=typeof destination==='string'?destination:(destination.pathname??current.pathname)+(destination.search??'')+(destination.hash??'');
      requestNavigation(new URL(value,current).href);
    };
    router.navigate=fixtureNavigate;
    router.fetch=async()=>{showNotice?.('Server action disabled: only local sample data can be changed.');};
    state.navigationAdapter='Fixture-only temporary adapter on the original router; discarded on reload';
    state.phase='mounted';
  }catch(error){state.phase='blocked';state.error=error.message;}
})();
