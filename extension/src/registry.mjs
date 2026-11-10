// Templates only. Never retain arbitrary paths, query strings or identifiers.
export const operations = [
  ['bootstrap', 'GET', /^\/$|^\/gpts$/, 'navigation', 'Application document', '/', 'HTML, bootstrap; may contain identity (never recorded)', 'Cannot initialize native app'],
  ['business-route', 'GET', /^\/business-hub(?:\/[^/]+(?:\/insights)?)?\/?$/, 'navigation', 'Native router/server loader', '/business-hub/{profile}/insights', 'Original route admission', 'Redirect or no manager'],
  ['route-data', 'GET', /^\/business-hub(?:\/[^/]+(?:\/insights)?)?\.data$/, 'navigation', 'Route clientLoader → serverLoader', '/business-hub/{profile}/insights.data', 'Native loader data; access boundary', 'Route cannot continue'],
  ['statsig', 'POST', /^\/v1\/initialize$/, 'configuration', 'Statsig SDK', '/v1/initialize', 'Feature gate evaluations, not server entitlement', 'Unresolved gates / unavailable entry'],
  ['asset', 'GET', /^\/cdn\/assets\/[A-Za-z0-9_./-]+$/, 'resource', 'Rspack native loader', '/cdn/assets/{asset}', 'Native JS/CSS/assets', 'Lazy load failure'],
  ['presence', 'GET', /^\/chat\/frontend\/v1\/business-profiles\/presence$/, 'business-read', 'bRUC / entry surfaces', '/chat/frontend/v1/business-profiles/presence', 'Presence/list eligibility', 'Entry/list unavailable'],
  ['profiles', 'GET', /^\/chat\/frontend\/v1\/business-profiles$/, 'business-read', 'bRUC', '/chat/frontend/v1/business-profiles', 'Authorized business list', 'No selectable profile'],
  ['manager', 'GET', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/manager$/, 'business-read', 'eUoS → g5Mm → KQ1R', '/chat/frontend/v1/business-profiles/{profile}/manager', 'profile, capabilities, fields, projection; server access applies', 'Skeleton, access/error screen'],
  ['admin-view', 'GET', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/admin-view$/, 'access', 'BusinessProfilesPage admin branch', '/chat/frontend/v1/business-profiles/{profile}/admin-view', 'Actual admin access and manager', 'No admin view'],
  ['insights', 'POST', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/insights$/, 'business-read', 'lDTh internal Insights', '/chat/frontend/v1/business-profiles/{profile}/insights', 'Profile/window, timeseries, summary, reporting metadata', 'Metrics native error/unavailable/forbidden'],
  ['discovery', 'POST', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/insights\/discovery-topics$/, 'business-read', 'lDTh → FCa5 DiscoveryTopics', '/chat/frontend/v1/business-profiles/{profile}/insights/discovery-topics', 'Matching profile/window, topics and mention counts', 'Discovery native empty/error state'],
  ['website', 'GET', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/website-crawl$/, 'business-read', 'lDTh website status', '/chat/frontend/v1/business-profiles/{profile}/website-crawl', 'Website crawl status; schema not revalidated live', 'Website status unavailable'],
  ['recrawl', 'POST', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/website-crawl\/recrawl$/, 'modification', 'Website retry action', '/chat/frontend/v1/business-profiles/{profile}/website-crawl/recrawl', 'Server-authorized operation; never simulated', 'Retry unavailable'],
  ['verification', 'GET', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/manager\/business-verification$/, 'access', 'C7pe', '/chat/frontend/v1/business-profiles/{profile}/manager/business-verification', 'Actual verification state', 'Verification unavailable'],
  ['feeds', 'GET', /^\/shopping\/business-profiles\/[^/]+\/feeds$/, 'business-read', 'c8Ji / HwNs', '/shopping/business-profiles/{profile}/feeds', 'Catalog list; optional agent/products path', 'Catalog list unavailable'],
  ['feed-summaries', 'GET', /^\/shopping\/business-profiles\/[^/]+\/feed-summaries$/, 'business-read', 'lDTh', '/shopping/business-profiles/{profile}/feed-summaries', 'Product feed summaries', 'Products unavailable'],
  ['shopify-connection', 'GET', /^\/shopping\/business-profiles\/[^/]+\/shopify-products\/connection$/, 'business-read', 'lDTh', '/shopping/business-profiles/{profile}/shopify-products/connection', 'Connection status', 'Products connection unavailable'],
  ['agent-read', 'GET', /^\/shopping\/business-profiles\/[^/]+\/agent-builder\/(?:v2|insights\/target)$/, 'business-read', 'lDTh / HwNs', '/shopping/business-profiles/{profile}/agent-builder/{read}', 'Agent configuration or insights target', 'Optional agent view unavailable'],
  ['agent-access', 'GET', /^\/shopping\/business-profiles\/[^/]+\/agent-builder\/(?:verification|industry-eligibility)$/, 'access', 'HwNs', '/shopping/business-profiles/{profile}/agent-builder/{eligibility}', 'Actual agent eligibility/verification', 'Agent unavailable'],
  ['agent-operation', '*', /^\/shopping\/business-profiles\/[^/]+\/agent-builder\/(?:v2(?:\/(?:prepare|create|publish|discard|disable))?|preview|chatgpt-preview)$/, 'potential-modification', 'HwNs', '/shopping/business-profiles/{profile}/agent-builder/{operation}', 'Requires actual authorized backend; no fixture', 'Action blocked in simulation'],
  ['product-mutation', 'POST', /^\/shopping\/business-profiles\/[^/]+\/(?:feeds\/[^/]+\/archive|shopify-products\/(?:connect|disconnect))$/, 'modification', 'lDTh', '/shopping/business-profiles/{profile}/{product-action}', 'Changes feed/connection', 'Action blocked in simulation'],
  ['profile-mutation', 'POST', /^\/chat\/frontend\/v1\/business-profiles\/(?:creation|shopify\/connect|[^/]+\/hide)$/, 'modification', 'c8Ji / lDTh', '/chat/frontend/v1/business-profiles/{profile-action}', 'Profile creation/visibility/connection', 'Action blocked in simulation'],
  ['verification-action', 'POST', /^\/chat\/frontend\/v1\/business-profiles\/[^/]+\/(?:manager\/)?verification-flows\/[^/]+\/(?:shopify-challenge|checks\/[^/]+\/(?:challenge|strong-challenge))$/, 'access', 'c8Ji / lDTh', '/chat/frontend/v1/business-profiles/{profile}/verification-flows/{flow}/{challenge}', 'Actual verification challenge; never simulated', 'Verification action blocked'],
  ['identity', 'GET', /^\/backend-api\/(?:me|accounts\/check\/v4-2023-04-27|accounts\/optimized\/check)$/, 'identity', 'Authentication/account initialization', '/backend-api/{identity-operation}', 'Identity/selected account; never read or simulated', 'No authenticated context'],
  ['telemetry', '*', /^\/ces\//, 'telemetry', 'Telemetry SDK', '/ces/{operation}', 'Not needed for presentation', 'No effect required by test'],
  ['sdk-telemetry', 'POST', /^\/v1\/(?:sdk_exception|log_event)$/, 'telemetry', 'Statsig SDK', '/v1/{telemetry}', 'Not needed for presentation', 'No effect required by test'],
];
export function classify(method, url, resourceType = 'other') {
  let parsed;
  try { parsed = new URL(url); } catch { return { operation: 'unknown', category: 'unknown', route: '{unknown}', source: 'other', method: 'OTHER' }; }
  const source = parsed.origin === 'https://native-insights-fixtures.invalid' ? 'simulation' :
    parsed.origin === 'https://chatgpt.com' || parsed.origin === 'https://ab.chatgpt.com' ? 'real' : 'other';
  // Never misclassify an unrelated host with a similar path as a known service operation.
  const entry = source === 'other' ? undefined : operations.find(([,m,p]) => (m === method || m === '*') && p.test(parsed.pathname));
  return { operation: entry?.[0] || 'unknown', category: entry?.[3] || (['POST','PUT','PATCH','DELETE'].includes(method) ? 'potential-modification' : 'unknown'),
    route: entry?.[5] || '{unknown}', source,
    method: ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'].includes(method) ? method : 'OTHER',
    resourceType: ['document','script','stylesheet','image','fetch','xhr','eventsource','websocket'].includes(resourceType) ? resourceType : 'other' };
}
