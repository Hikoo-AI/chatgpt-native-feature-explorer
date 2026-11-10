// FICTIONAL fixtures for the Business Hub Insights endpoints. Shapes follow the fields read by
// modules Sq3r / eq (chunk 76198) and DiscoveryTopics (chunk 332323). No real data.
export const PROFILE_ID = 'bp_fixture_demo';
const DAY = 864e5;
const d2s = t => new Date(t).toISOString().slice(0, 10);
const p = s => Date.parse(`${s}T00:00:00Z`);
function rng(seed) { let x = seed >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
// Deterministic daily counts with weekly seasonality and a mild upward trend.
function daily(dateStr, metric) {
  const t = p(dateStr), r = rng(t / DAY * 7 + metric.length * 131)();
  const dow = new Date(t).getUTCDay(), weekend = dow === 0 || dow === 6 ? 0.72 : 1;
  const trend = 1 + ((t - p('2026-09-01')) / DAY) * 0.006;
  const base = { entity_shown: 64, profile_open: 13, website_click: 7, call_click: 2 }[metric];
  return Math.max(0, Math.round(base * weekend * trend * (0.78 + r * 0.44)));
}
const METRICS = ['entity_shown', 'profile_open', 'website_click', 'call_click'];
const sum = (s, e, m) => { let n = 0; for (let t = p(s); t < p(e); t += DAY) n += daily(d2s(t), m); return n; };

export function insightsResponse({ start_date, end_date }, scope = 'local') {
  const span = p(end_date) - p(start_date), prevStart = d2s(p(start_date) - span);
  const timeseries = [];
  for (let t = p(start_date); t < p(end_date); t += DAY) {
    const date = d2s(t);
    timeseries.push({ date, metrics: METRICS.map(metric => ({ metric, event_count: daily(date, metric), status: 'complete', unavailable_reason: null })) });
  }
  const days = span / DAY;
  const summary = METRICS.map(metric => {
    const cur = sum(start_date, end_date, metric), prev = sum(prevStart, start_date, metric);
    return { metric, event_count: cur, previous_event_count: prev, percent_change: prev ? ((cur - prev) / prev) * 100 : null,
      status: 'complete', previous_status: 'complete', covered_days: days, total_days: days, previous_covered_days: days, unavailable_reason: null };
  });
  return { business_profile_id: PROFILE_ID, start_date, end_date, analytics_scope: scope,
    metadata: { available_start_date: d2s(p(start_date) - 120 * DAY), available_end_date_exclusive: end_date, missing_dates: [], previous_missing_dates: [] },
    timeseries, summary };
}

const TOPICS = [
  ['tc_1', 'Best brunch spots nearby', 0.27], ['tc_2', 'Vegetarian and vegan options', 0.18],
  ['tc_3', 'Weekend reservations', 0.14], ['tc_4', 'Coffee and pastries', 0.11], ['tc_5', 'Private events and groups', 0.07],
];
export function discoveryResponse({ start_date, end_date }) {
  const days = (p(end_date) - p(start_date)) / DAY;
  const matched = sum(start_date, end_date, 'entity_shown'), prevMatched = Math.round(matched * 0.9);
  const covered = []; for (let t = p(start_date); t < p(end_date); t += DAY) covered.push(d2s(t));
  const topics = TOPICS.map(([id, label, share], i) => ({ semantic_cluster_id: id, semantic_cluster_label: label,
    mention_count: Math.round(matched * share), previous_mention_count: Math.round(prevMatched * (share + (i % 2 ? 0.02 : -0.015))) }));
  const used = topics.reduce((a, t) => a + t.mention_count, 0), prevUsed = topics.reduce((a, t) => a + t.previous_mention_count, 0);
  return { business_profile_id: PROFILE_ID, start_date, end_date, status: 'available',
    metadata: { effective_start_date: start_date, effective_end_date_exclusive: end_date, covered_dates: covered, days },
    matched_mention_count: matched, previous_matched_mention_count: prevMatched,
    other_mention_count: matched - used, previous_other_mention_count: prevMatched - prevUsed, topics };
}
