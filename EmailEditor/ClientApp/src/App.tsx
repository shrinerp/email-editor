import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { BlockPalette } from './components/editor/BlockPalette';
import { BlockCanvas } from './components/editor/BlockCanvas';
import { MetadataForm } from './components/editor/MetadataForm';
import { PreviewPanel } from './components/preview/PreviewPanel';
import type { EmailBlock, BlockType, TwoColumnBlock } from './types/blocks';
import { createBlock } from './types/blocks';
import { generateHtml } from './api/generate';

// ── Container path utilities ──────────────────────────────────────────────────

type ContainerPath =
  | { kind: 'root' }
  | { kind: 'column'; twoColId: string; side: 'left' | 'right' };

function findContainer(blocks: EmailBlock[], blockId: string): ContainerPath | null {
  if (blocks.some(b => b.id === blockId)) return { kind: 'root' };
  for (const b of blocks) {
    if (b.type !== 'twoColumn') continue;
    if (b.leftBlocks.some(c => c.id === blockId))
      return { kind: 'column', twoColId: b.id, side: 'left' };
    if (b.rightBlocks.some(c => c.id === blockId))
      return { kind: 'column', twoColId: b.id, side: 'right' };
  }
  return null;
}

function parseContainerId(id: string): ContainerPath | null {
  if (id === 'root') return { kind: 'root' };
  const sep = id.lastIndexOf(':');
  if (sep === -1) return null;
  const twoColId = id.slice(0, sep);
  const side = id.slice(sep + 1);
  if (side !== 'left' && side !== 'right') return null;
  return { kind: 'column', twoColId, side };
}

function pathsMatch(a: ContainerPath, b: ContainerPath): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'column' && b.kind === 'column')
    return a.twoColId === b.twoColId && a.side === b.side;
  return true;
}

function getContainerBlocks(blocks: EmailBlock[], path: ContainerPath): EmailBlock[] {
  if (path.kind === 'root') return blocks;
  const tc = blocks.find(b => b.id === path.twoColId) as TwoColumnBlock;
  return path.side === 'left' ? tc.leftBlocks : tc.rightBlocks;
}

function setContainerBlocks(
  blocks: EmailBlock[], path: ContainerPath, items: EmailBlock[]
): EmailBlock[] {
  if (path.kind === 'root') return items;
  return blocks.map(b => {
    if (b.id !== path.twoColId || b.type !== 'twoColumn') return b;
    return path.side === 'left'
      ? { ...b, leftBlocks: items }
      : { ...b, rightBlocks: items };
  });
}

// ── App ───────────────────────────────────────────────────────────────────────

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activePath = findContainer(blocks, activeId);
    if (!activePath) return;

    const overPath = findContainer(blocks, overId) ?? parseContainerId(overId);
    if (!overPath) return;

    const activeContainer = getContainerBlocks(blocks, activePath);
    const activeIdx = activeContainer.findIndex(b => b.id === activeId);

    if (pathsMatch(activePath, overPath)) {
      // Same container — simple reorder
      const overIdx = activeContainer.findIndex(b => b.id === overId);
      if (overIdx === -1) return;
      setBlocks(setContainerBlocks(
        blocks, activePath, arrayMove(activeContainer, activeIdx, overIdx)
      ));
    } else {
      // Cross-container move
      const overContainer = getContainerBlocks(blocks, overPath);
      const draggedBlock = activeContainer[activeIdx];
      const overIdx = overContainer.findIndex(b => b.id === overId);
      // over.id is a containerId (empty drop zone) → append; otherwise insert before over item
      const insertAt = overIdx === -1 ? overContainer.length : overIdx;

      const newSource = activeContainer.filter(b => b.id !== activeId);
      const newTarget = [
        ...overContainer.slice(0, insertAt),
        draggedBlock,
        ...overContainer.slice(insertAt),
      ];

      let updated = setContainerBlocks(blocks, activePath, newSource);
      updated = setContainerBlocks(updated, overPath, newTarget);
      setBlocks(updated);
    }
  }

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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 16, padding: 16, maxWidth: 1200, margin: '0 auto' }}>
          <BlockPalette onAdd={addBlock} />
          <div style={{ flex: 1 }}>
            <MetadataForm metadata={metadata} onChange={setMetadata} />
            <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} containerId="root" />
            <PreviewPanel html={previewHtml} />
          </div>
        </div>
      </DndContext>
    </div>
  );
}
