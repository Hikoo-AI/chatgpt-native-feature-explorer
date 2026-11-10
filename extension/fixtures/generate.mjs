// Reuse the project's OWN fictional fixtures. Never import a proprietary bundle.
import fs from 'node:fs/promises';
const dataModule = code => 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
const insightsCode = await fs.readFile(new URL('../../preview/fixtures/insights.js', import.meta.url), 'utf8');
const insightsURL = dataModule(insightsCode);
const { insightsResponse, discoveryResponse } = await import(insightsURL);
const managerCode = (await fs.readFile(new URL('../../preview/fixtures/manager.js', import.meta.url), 'utf8'))
  .replace("'/fixtures/insights.js'", JSON.stringify(insightsURL));
const { manager } = await import(dataModule(managerCode));
for (const days of [7,28]) {
  const end_date = '2026-11-10';
  const start_date = new Date(Date.parse(end_date) - days*864e5).toISOString().slice(0,10);
  const scenario = { sampleData: true, label: 'Experimental preview · Sample data', schemaStatus: 'Metrics validated on native build; full manager schema not yet validated',
    window: { start_date, end_date }, manager: { ...manager, profile: { ...manager.profile, access_revoked: false } },
    insights: insightsResponse({start_date,end_date}), discovery: discoveryResponse({start_date,end_date}) };
  // The original demo estimated discovery's previous total independently. Align it
  // with the metric report so both current AND previous windows agree in this lab.
  const previous=scenario.insights.summary.find(metric=>metric.metric==='entity_shown').previous_event_count;
  const oldPrevious=scenario.discovery.previous_matched_mention_count;
  scenario.discovery.topics.forEach(topic=>topic.previous_mention_count=Math.round(previous*topic.previous_mention_count/oldPrevious));
  scenario.discovery.previous_matched_mention_count=previous;
  scenario.discovery.previous_other_mention_count=previous-scenario.discovery.topics.reduce((sum,topic)=>sum+topic.previous_mention_count,0);
  await fs.writeFile(new URL(`ready-${days}d.json`, import.meta.url), JSON.stringify(scenario,null,2));
}
