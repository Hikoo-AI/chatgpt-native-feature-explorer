import { classify } from './registry.mjs';
import { FIXTURE_ORIGIN } from './fixtures.mjs';

// Browser-side HTTP(S) interception. No listening proxy, CA, forwarding or HAR.
// Always create a fresh context: no storageState, cookie copy or authenticated page.
export async function createSimulationProxy(browser, fixtures, recorder) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  try {
  await context.addInitScript(() => {
    for (const name of ['WebTransport','RTCPeerConnection','webkitRTCPeerConnection']) {
      if (name in globalThis) Object.defineProperty(globalThis,name,{configurable:false,writable:false,
        value:class { constructor() { throw new TypeError('Transport unavailable in isolated fixture harness'); } }});
    }
  });
  await context.routeWebSocket('**/*', socket => {
    recorder.record(classify('GET',socket.url(),'websocket'),'websocket-blocked');
    socket.close(); // Never connectToServer().
  });
  const handler = async route => {
    const request=route.request(), url=new URL(request.url());
    const metadata=classify(request.method(),url.href,request.resourceType());
    if (url.origin !== FIXTURE_ORIGIN) { recorder.record(metadata,'blocked');return route.abort('blockedbyclient'); }
    if (url.pathname === '/harness' && request.method() === 'GET' && request.isNavigationRequest()) {
      recorder.record(metadata,'document',200);
      return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><title>Network test harness</title>',
        headers:{'content-security-policy':"default-src 'none'; connect-src 'self'; form-action 'none'; base-uri 'none'",'cache-control':'no-store'}});
    }
    const match=url.pathname.match(/^\/chat\/frontend\/v1\/business-profiles\/bp_fixture_demo\/(manager|insights(?:\/discovery-topics)?)$/);
    const operation=match?.[1]==='insights/discovery-topics'?'discovery':match?.[1];
    if (!operation || !['manager','insights','discovery'].includes(operation) ||
      request.method() !== (operation==='manager'?'GET':'POST')) {
      recorder.record(metadata,'blocked');return route.abort('blockedbyclient');
    }
    // Only synthetic-origin bodies may be inspected, and they are never recorded.
    let window;
    if (operation !== 'manager') { try { window=request.postDataJSON(); } catch { recorder.record(metadata,'blocked');return route.abort('blockedbyclient'); } }
    const fixture=await fixtures.resolve(operation,window);
    if (!fixture) { recorder.record(metadata,'blocked');return route.abort('blockedbyclient'); }
    recorder.record(metadata,'fixture',fixture.status);
    return route.fulfill({status:fixture.status,contentType:'application/json',body:JSON.stringify(fixture.body),headers:{'cache-control':'no-store'}});
  };
  await context.route('**/*',handler);
  // The context is disposable. Never remove the deny policy while pages/workers live.
  return { context, dispose: () => context.close() };
  } catch (error) { await context.close(); throw error; }
}
