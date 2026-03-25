import type { EmailDocument } from '../types/blocks';

export async function generateHtml(doc: EmailDocument): Promise<string> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Generation failed (${response.status}): ${text}`);
  }

  return response.text();
}
