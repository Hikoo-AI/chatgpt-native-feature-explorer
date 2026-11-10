import fs from 'node:fs/promises';
export class EvidenceRecorder {
  events = [];
  record(metadata, action, status) {
    // Allowlist every persisted field. No URLs, headers, bodies, errors or arbitrary text.
    const { operation, category, route, source, method, resourceType } = metadata;
    this.events.push({ operation, category, route, source, method, resourceType,
      action: ['observed','blocked','fixture','document','websocket-blocked'].includes(action) ? action : 'blocked',
      ...(Number.isInteger(status) ? { status } : {}) });
  }
  async write(path, summary) { await fs.writeFile(path, JSON.stringify({ summary, events: this.events }, null, 2)); }
}
