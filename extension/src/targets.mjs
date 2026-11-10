export const targets={
  insights:{name:'Business Hub Insights',origin:'https://chatgpt.com',url:'https://chatgpt.com/gpts',launchLabel:'Preview Insights'},
  ads:{name:'Ads Manager',origin:'https://ads.openai.com',url:'https://ads.openai.com/manager',launchLabel:'Open Ads Manager'},
  shopify:{name:'Ads for Shopify',origin:'https://connect.ads.openai.com',url:'https://connect.ads.openai.com/app',launchLabel:'Open Ads for Shopify'},
};
export function acceptsTab(target,url){
  try{const parsed=new URL(url);return parsed.origin===targets[target].origin&&(target!=='insights'||parsed.pathname==='/gpts');}catch{return false;}
}
