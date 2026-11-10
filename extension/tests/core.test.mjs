import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, operations } from '../src/registry.mjs';
import { EvidenceRecorder } from '../src/evidence.mjs';
import { FixtureManager, validateFixture, scenarios } from '../src/fixtures.mjs';
import { acceptsTab } from '../src/targets.mjs';

test('Each native target is confined to its own origin and supported document',()=>{
  assert(acceptsTab('insights','https://chatgpt.com/gpts'));
  assert(!acceptsTab('insights','https://chatgpt.com/gpts-other'));
  assert(!acceptsTab('ads','https://ads.openai.com.evil.invalid/manager'));
  assert(!acceptsTab('ads','https://auth.openai.com/choose-an-account'));
  assert(acceptsTab('ads','https://ads.openai.com/manager'));
  assert(acceptsTab('shopify','https://connect.ads.openai.com/app'));
});

test('Read POSTs differ from mutations, identity and telemetry', () => {
  const base='https://chatgpt.com/chat/frontend/v1/business-profiles/PRIVATE_ID';
  assert.equal(classify('POST',base+'/insights').category,'business-read');
  assert.equal(classify('POST',base+'/insights/discovery-topics').category,'business-read');
  assert.equal(classify('POST',base+'/website-crawl/recrawl').category,'modification');
  assert.equal(classify('GET','https://chatgpt.com/backend-api/me').category,'identity');
  assert.equal(classify('POST','https://chatgpt.com/ces/v1/rgstr').category,'telemetry');
  assert.equal(classify('GET','https://unrelated.invalid/backend-api/me').operation,'unknown');
  assert(operations.every(op=>op.length===8));
});
test('Metadata recorder never retains raw path, queries, headers or bodies', () => {
  const recorder=new EvidenceRecorder();
  recorder.record({...classify('POST','https://chatgpt.com/chat/frontend/v1/business-profiles/PRIVATE_SENTINEL/insights?token=SECRET_SENTINEL'),
    cookies:'SECRET_SENTINEL',body:'SECRET_SENTINEL',url:'SECRET_SENTINEL'},'observed',403);
  const json=JSON.stringify(recorder.events);
  assert(!json.includes('SENTINEL'));assert(!json.includes('?'));assert(!json.includes('cookies'));
  assert.equal(recorder.events[0].status,403);
  assert.equal(classify('GET','https://unknown.invalid/PRIVATE_SENTINEL').route,'{unknown}');
});
test('Fixtures have coherent profile, dates, summaries and discovery counts', async () => {
  for(const days of [7,28]) {
    const fixtures=await FixtureManager.load(days);
    assert(validateFixture(fixtures.data));
    const bad=structuredClone(fixtures.data);bad.discovery.business_profile_id='another-profile';
    assert.throws(()=>validateFixture(bad),/Profile mismatch/);
    const dates=structuredClone(fixtures.data);dates.discovery.end_date='2020-01-01';
    assert.throws(()=>validateFixture(dates),/Reporting window mismatch/);
    const total=structuredClone(fixtures.data);total.insights.summary[0].event_count++;
    assert.throws(()=>validateFixture(total),/Summary mismatch/);
  }
});
test('All visual scenarios and dependency errors are synthetic, never 401/403 substitutes', async () => {
  for(const state of scenarios) {
    const f=await FixtureManager.load(7,state);
    const result=await f.resolve('insights',f.data.window);
    assert([200,503].includes(result.status));
    assert.equal(await f.resolve('identity'),null);
    assert.equal((await f.resolve('discovery',{start_date:'2020-01-01',end_date:'2020-02-01'})).status,422);
    if(['empty','insufficient','partial'].includes(state)) {
      const discovery=await f.resolve('discovery',f.data.window);
      assert.equal(result.body.summary[0].event_count,discovery.body.matched_mention_count);
      assert.equal(result.body.summary[0].previous_event_count,discovery.body.previous_matched_mention_count);
    }
  }
  await assert.rejects(()=>FixtureManager.load(14),/Unknown fixture/);
});
test('Loading is an asynchronous fixture dependency', async () => {
  const f=await FixtureManager.load(7,'loading');
  let resolved=false;
  const pending=f.resolve('insights',f.data.window).then(result=>{resolved=true;return result;});
  await Promise.resolve();assert.equal(resolved,false);
  assert.equal((await pending).status,200);
});
