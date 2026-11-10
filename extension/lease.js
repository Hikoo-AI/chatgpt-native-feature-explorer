// An invalidated extension context stops its MAIN-world preview by document reload.
if(!globalThis.__nativeFullFixtureLease){
  globalThis.__nativeFullFixtureLease=setInterval(()=>{
    try{chrome.runtime.getManifest();}
    catch{clearInterval(globalThis.__nativeFullFixtureLease);window.postMessage({type:'native-full-fixture-stopped'},location.origin);}
  },500);
}
