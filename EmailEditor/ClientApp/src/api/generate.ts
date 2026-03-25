import type { EmailDocument } from '../types/blocks';

export async function generateHtml(doc: EmailDocument, mergeData?: object): Promise<string> {
  const payload = mergeData ? { ...doc, mergeData } : doc;
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Generation failed (${response.status}): ${text}`);
  }

  return response.text();
}
