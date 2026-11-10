import {createAdsLauncher} from './src/ads-launch.mjs';
const launches=createAdsLauncher(chrome);
chrome.tabs.onUpdated.addListener((tabId,change)=>{
  if(change.status==='complete')void launches.resume(tabId).catch(()=>{});
});
chrome.tabs.onRemoved.addListener(tabId=>{void launches.remove(tabId);});
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  if(sender.id!==chrome.runtime.id||sender.tab)return false;
  let task;
  if(message?.type==='hikoo-launch:start')task=launches.start(message.feature,message.tabId);
  else if(message?.type==='hikoo-launch:get'&&Number.isInteger(message.tabId))task=launches.read(message.tabId);
  else return false;
  task.then(job=>sendResponse({ok:true,job}),error=>sendResponse({ok:false,error:error.message}));
  return true;
});
