// Metadata only. No API calls, source downloads, identity or access-state changes.
(()=>{
  const origin=location.origin;
  if(!['https://ads.openai.com','https://connect.ads.openai.com'].includes(origin))return{previewAvailable:false,reason:'Open the corresponding Ads application after signing in.'};
  const manifest=globalThis.__reactRouterManifest;
  const modules=globalThis.__reactRouterRouteModules||{};
  const roots=[document,document.documentElement,document.body].filter(Boolean).flatMap(node=>Object.keys(node).filter(key=>key.startsWith('__reactContainer$')).map(key=>node[key]));
  const routes=Object.keys(modules);
  const hasCommittedTree=roots.some(root=>!!root?.stateNode?.current?.child);
  const errors=globalThis.__reactRouterContext?.state?.errors||{};
  const merchantContextRequired=origin==='https://connect.ads.openai.com'&&
    typeof errors['routes/app']?.data==='string'&&/shop|embedded/i.test(errors['routes/app'].data);
  const result={origin,hasNativeRoot:roots.length>0,hasRouterManifest:!!manifest,registeredRouteModules:routes.length,
    hasCommittedTree,merchantContextRequired,
    appRoutePresent:origin==='https://connect.ads.openai.com'?!!modules['routes/app']:routes.some(id=>/campaign|ad.account|manager/i.test(id)),previewAvailable:false};
  result.reason=merchantContextRequired?'Open ChatGPT Ads from an authorized Shopify store: this tab has no merchant context.':result.appRoutePresent?
    'Native runtime present. An isolated sample-data preview is not yet validated.':
    'The Ads application components are not loaded. An authorized session is required.';
  globalThis.__nativeAdsProbe=result;
  return result;
})();
