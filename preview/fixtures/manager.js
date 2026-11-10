// FICTIONAL Business Hub "manager" payload for BusinessProfileManagerView (module bDu6).
// Field shapes follow the zod schemas of module nBtg (chunk 429646) and the reads in chunk 55093.
import { PROFILE_ID } from '/fixtures/insights.js';
const img = (label, hue) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="100%" height="100%" fill="hsl(${hue},45%,82%)"/><text x="50%" y="50%" font-family="system-ui" font-size="28" fill="hsl(${hue},35%,30%)" text-anchor="middle" dominant-baseline="middle">${label} (fictional)</text></svg>`);
const address = { line1: '12 Rue Exemple', line2: '', city: 'Paris', region: 'Île-de-France', postal_code: '75000', country_code: 'FR' };
const hours = { time_zone: 'Europe/Paris', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day =>
  day === 'monday' ? { day, closed: true, intervals: [] } : { day, closed: false, intervals: day === 'sunday' ? [{ opens: '09:00', closes: '15:00' }] : [{ opens: '08:30', closes: '18:30' }] }) };
const photos = [['Dining room', 20], ['Brunch plate', 35], ['Pastry counter', 200]].map(([alt, hue], i) => ({ id: `ph_${i}`, url: img(alt, hue), alt, source: 'owner', scan_status: 'passed' }));
const VALUES = {
  name: 'Maison Exemple', category: JSON.stringify(['Brunch restaurant']),
  description: 'Neighbourhood brunch and coffee spot (fictional business used for a local frontend preview).',
  phone: '+33 1 23 45 67 89', email: 'hello@maison-exemple.example', website: 'https://maison-exemple.example',
  address: JSON.stringify(address), hours: JSON.stringify(hours), photos: JSON.stringify(photos),
  logo: JSON.stringify({ id: 'logo_0', url: img('Logo', 280), alt: 'Logo', source: 'owner', scan_status: 'passed' }),
  cover: JSON.stringify({ id: 'cover_0', url: img('Cover', 160), alt: 'Cover', source: 'owner', scan_status: 'passed' }),
  delivery_policy: null, returns_policy: null,
};
const field = (field_key, value) => ({
  field_key, editor_value: value, preview_value: value, discovered_value: null,
  revision: `rev_${field_key}`, approved_revision: value == null ? null : { id: `rev_${field_key}`, value, operation: 'set' },
  current_revision: value == null ? null : { id: `rev_${field_key}`, flow_id: null, operation: 'set', value },
  pending_revision_id: null, verification_flow_id: null, latest_failure: null,
  can_edit: true, can_clear: field_key !== 'name', verification_actions: [], status: 'approved', source: 'owner',
  ...(field_key === 'address' ? { coordinates: { latitude: 48.8606, longitude: 2.3376, source: 'owner_confirmed', address, expected_revision: 'rev_address' } } : {}),
});
export const SECTIONS = ['about', 'contact', 'location', 'hours', 'photos'];
export const manager = {
  profile: {
    business_profile_id: PROFILE_ID, display_name: 'Maison Exemple (fictional)', display_address: '12 Rue Exemple, 75000 Paris, FR',
    website_url: 'https://maison-exemple.example', scope: 'local', relationship: 'owner', creation_status: 'approved',
    can_manage: true, can_manage_members: true,
  },
  capabilities: { can_manage_ad_accounts: false, editable_sections: SECTIONS, requires_business_verification: false },
  available_sections: SECTIONS,
  // Allowed taxonomy labels (real labels from module hPKv); the saved value is the English label.
  category_options: ['Brunch restaurant', 'Breakfast restaurant', 'Cafe', 'Coffee shop', 'Bakery', 'French restaurant', 'Restaurant'],
  current: null,
  fields: Object.entries(VALUES).map(([k, v]) => field(k, v)),
};
