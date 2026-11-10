import { classify } from './registry.mjs';
export function observe(page, recorder) {
  const listener = response => {
    const request = response.request();
    const metadata = classify(request.method(), response.url(), request.resourceType());
    if (metadata.operation !== 'unknown') recorder.record(metadata, 'observed', response.status());
  };
  page.on('response', listener);
  return () => page.off('response', listener);
}
