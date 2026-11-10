import fs from 'node:fs/promises';
export const FIXTURE_ORIGIN = 'https://native-insights-fixtures.invalid';
export const scenarios = ['ready','empty','insufficient','partial','loading','unavailable','error'];
const metrics = ['entity_shown','profile_open','website_click','call_click'];
export function validateFixture(f) {
  const check = (condition, message) => { if (!condition) throw Error(message); };
  check(f.sampleData === true && f.label === 'Experimental preview · Sample data', 'Explicit sample marker required');
  const id = f.manager?.profile?.business_profile_id;
  check(id === 'bp_fixture_demo', 'Only the fictional profile is accepted');
  check(f.insights.business_profile_id === id && f.discovery.business_profile_id === id, 'Profile mismatch');
  const {start_date, end_date} = f.window;
  const days = (Date.parse(end_date) - Date.parse(start_date))/864e5;
  check([7,28].includes(days), 'Invalid reporting window');
  for (const report of [f.insights,f.discovery]) check(report.start_date === start_date && report.end_date === end_date, 'Reporting window mismatch');
  check(f.insights.timeseries.length === days, 'Missing daily rows');
  f.insights.timeseries.forEach((row,i) => {
    check(row.date === new Date(Date.parse(start_date)+i*864e5).toISOString().slice(0,10), 'Noncontiguous dates');
    check(metrics.every(metric => row.metrics.some(m => m.metric === metric && Number.isInteger(m.event_count) && m.event_count >= 0)), 'Invalid metric row');
  });
  for (const metric of metrics) {
    const total = f.insights.timeseries.reduce((sum,row) => sum+row.metrics.find(m=>m.metric===metric).event_count,0);
    check(f.insights.summary.find(m=>m.metric===metric)?.event_count === total, 'Summary mismatch');
  }
  check(f.discovery.matched_mention_count === f.insights.summary.find(m=>m.metric==='entity_shown').event_count, 'Discovery/metrics totals differ');
  check(f.discovery.topics.reduce((sum,t)=>sum+t.mention_count,0)+f.discovery.other_mention_count === f.discovery.matched_mention_count, 'Topic counts mismatch');
  check(f.discovery.previous_matched_mention_count === f.insights.summary.find(m=>m.metric==='entity_shown').previous_event_count, 'Previous discovery/metrics totals differ');
  check(f.discovery.topics.reduce((sum,t)=>sum+t.previous_mention_count,0)+f.discovery.previous_other_mention_count === f.discovery.previous_matched_mention_count, 'Previous topic counts mismatch');
  return true;
}
export class FixtureManager {
  static async load(days = 7, state = 'ready') {
    if (![7,28].includes(days) || !scenarios.includes(state)) throw Error('Unknown fixture configuration');
    const base = JSON.parse(await fs.readFile(new URL(`../fixtures/ready-${days}d.json`, import.meta.url)));
    validateFixture(base);
    return new FixtureManager(base, state);
  }
  constructor(data,state) { this.data = structuredClone(data); this.state = state; }
  async resolve(operation, requestWindow) {
    if (!['manager','insights','discovery'].includes(operation)) return null;
    if (requestWindow && (requestWindow.start_date !== this.data.window.start_date || requestWindow.end_date !== this.data.window.end_date)) return {status:422,body:{sampleData:true,error:'fixture_window_mismatch'}};
    if (this.state === 'loading') await new Promise(resolve => setTimeout(resolve,80));
    if (['error','unavailable'].includes(this.state)) return {status:503,body:{sampleData:true,error:'synthetic_dependency_unavailable'}};
    const body = structuredClone(this.data[operation]);
    if (operation === 'insights') {
      if (['empty','insufficient'].includes(this.state)) {
        const count = this.state === 'empty' ? 0 : 1;
        body.timeseries.forEach(row=>row.metrics.forEach(m=>m.event_count=count));
        body.summary.forEach(m=>{m.event_count=count*body.timeseries.length;m.previous_event_count=m.event_count;m.percent_change=0;});
      }
      if (this.state === 'partial') {
        const row=body.timeseries[0];body.metadata.missing_dates=[row.date];
        row.metrics.forEach(m=>{m.event_count=0;m.status='unavailable';m.unavailable_reason='sample_gap';});
        body.summary.forEach(m=>{m.event_count=body.timeseries.reduce((s,r)=>s+r.metrics.find(x=>x.metric===m.metric).event_count,0);m.status='partial';m.covered_days--;m.percent_change=m.previous_event_count?(m.event_count-m.previous_event_count)/m.previous_event_count*100:null;});
      }
    }
    if (operation === 'discovery' && ['empty','insufficient'].includes(this.state)) {
      body.topics=[];body.matched_mention_count=this.state==='empty'?0:this.data.insights.timeseries.length;
      body.other_mention_count=body.matched_mention_count;body.previous_matched_mention_count=body.matched_mention_count;body.previous_other_mention_count=body.matched_mention_count;
    }
    if (operation === 'discovery' && this.state === 'partial') {
      const missing=this.data.insights.timeseries[0].metrics.find(m=>m.metric==='entity_shown').event_count;
      const matched=body.matched_mention_count-missing;
      const scale=matched/body.matched_mention_count;
      body.topics.forEach(t=>t.mention_count=Math.floor(t.mention_count*scale));
      body.matched_mention_count=matched;body.other_mention_count=matched-body.topics.reduce((s,t)=>s+t.mention_count,0);
      body.metadata.covered_dates.shift();body.metadata.days--;
    }
    return {status:200,body};
  }
}
