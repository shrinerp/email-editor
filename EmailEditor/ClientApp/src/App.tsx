import { useState } from 'react';
import { BlockPalette } from './components/editor/BlockPalette';
import { BlockCanvas } from './components/editor/BlockCanvas';
import { MetadataForm } from './components/editor/MetadataForm';
import { PreviewPanel } from './components/preview/PreviewPanel';
import type { EmailBlock, BlockType } from './types/blocks';
import { createBlock } from './types/blocks';
import { generateHtml } from './api/generate';

interface Metadata {
  subject: string;
  previewText: string;
  fromName: string;
  fromAddress: string;
}

const btnBase: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  transition: 'opacity 0.15s',
};

export default function App() {
  const [metadata, setMetadata] = useState<Metadata>({
    subject: '',
    previewText: '',
    fromName: '',
    fromAddress: '',
  });
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addBlock(type: BlockType) {
    setBlocks(prev => [...prev, createBlock(type)]);
  }

  function buildDocument() {
    return { ...metadata, blocks };
  }

  async function handlePreview() {
    setLoading(true);
    setError(null);
    try {
      const html = await generateHtml(buildDocument());
      setPreviewHtml(html);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const html = await generateHtml(buildDocument());
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.subject || 'email'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f0f0f0' }}>
      <header style={{
        background: '#1a1a1a',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{ fontWeight: 700, fontSize: 18, flex: 1 }}>✉️ Email Editor</span>
        <button
          onClick={handlePreview}
          disabled={loading}
          style={{ ...btnBase, background: '#3b82f6', color: '#fff', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Loading…' : '👁 Preview'}
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{ ...btnBase, background: '#22c55e', color: '#fff', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Loading…' : '⬇ Download HTML'}
        </button>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 24px', fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, padding: 16, maxWidth: 1200, margin: '0 auto' }}>
        <BlockPalette onAdd={addBlock} />
        <div style={{ flex: 1 }}>
          <MetadataForm metadata={metadata} onChange={setMetadata} />
          <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} />
          <PreviewPanel html={previewHtml} />
        </div>
      </div>
    </div>
  );
}
