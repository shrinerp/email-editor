import { useState } from 'react';
import { BlockPalette } from './components/editor/BlockPalette';
import { BlockCanvas } from './components/editor/BlockCanvas';
import { MetadataForm } from './components/editor/MetadataForm';
import type { EmailBlock, BlockType } from './types/blocks';
import { createBlock } from './types/blocks';

interface Metadata {
  subject: string;
  previewText: string;
  fromName: string;
  fromAddress: string;
}

export default function App() {
  const [metadata, setMetadata] = useState<Metadata>({
    subject: '',
    previewText: '',
    fromName: '',
    fromAddress: '',
  });
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);

  function addBlock(type: BlockType) {
    setBlocks(prev => [...prev, createBlock(type)]);
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f0f0f0' }}>
      <header style={{
        background: '#1a1a1a',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>✉️ Email Editor</span>
      </header>

      <div style={{ display: 'flex', gap: 16, padding: 16, maxWidth: 1200, margin: '0 auto' }}>
        <BlockPalette onAdd={addBlock} />
        <div style={{ flex: 1 }}>
          <MetadataForm metadata={metadata} onChange={setMetadata} />
          <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} />
        </div>
      </div>
    </div>
  );
}
