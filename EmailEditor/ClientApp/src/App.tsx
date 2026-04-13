import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { BlockPalette } from './components/editor/BlockPalette';
import { BlockCanvas } from './components/editor/BlockCanvas';
import { PreviewModal } from './components/preview/PreviewModal';
import { MergeFieldsContext } from './components/editor/MergeFieldChips';
import { flattenKeys } from './components/editor/DataTab';
import type { EmailBlock, BlockType, ColumnsBlock } from './types/blocks';
import { createBlock } from './types/blocks';
import { generateHtml } from './api/generate';

// ── Container path utilities ──────────────────────────────────────────────────

type ContainerPath =
  | { kind: 'root' }
  | { kind: 'column'; colsId: string; colIndex: number };

function findContainer(blocks: EmailBlock[], blockId: string): ContainerPath | null {
  if (blocks.some(b => b.id === blockId)) return { kind: 'root' };
  for (const b of blocks) {
    if (b.type !== 'columns') continue;
    for (let i = 0; i < b.columns.length; i++) {
      if (b.columns[i].some(c => c.id === blockId))
        return { kind: 'column', colsId: b.id, colIndex: i };
    }
  }
  return null;
}

function parseContainerId(id: string): ContainerPath | null {
  if (id === 'root') return { kind: 'root' };
  const match = id.match(/^(.+):col(\d+)$/);
  if (!match) return null;
  return { kind: 'column', colsId: match[1], colIndex: Number(match[2]) };
}

function pathsMatch(a: ContainerPath, b: ContainerPath): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'column' && b.kind === 'column')
    return a.colsId === b.colsId && a.colIndex === b.colIndex;
  return true;
}

function getContainerBlocks(blocks: EmailBlock[], path: ContainerPath): EmailBlock[] {
  if (path.kind === 'root') return blocks;
  const cb = blocks.find(b => b.id === path.colsId) as ColumnsBlock;
  return cb.columns[path.colIndex];
}

function setContainerBlocks(
  blocks: EmailBlock[], path: ContainerPath, items: EmailBlock[]
): EmailBlock[] {
  if (path.kind === 'root') return items;
  return blocks.map(b => {
    if (b.id !== path.colsId || b.type !== 'columns') return b;
    const cols = b.columns.map((col, i) => i === path.colIndex ? items : col);
    return { ...b, columns: cols };
  });
}

// ── Drag overlay helpers ──────────────────────────────────────────────────────

function findBlock(blocks: EmailBlock[], id: string): EmailBlock | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.type === 'columns') {
      for (const col of b.columns) {
        const found = findBlock(col, id);
        if (found) return found;
      }
    }
  }
  return null;
}

const blockTypeLabel: Record<string, string> = {
  hero: 'Hero',
  text: 'Text',
  button: 'Button',
  image: 'Image',
  divider: 'Divider',
  columns: 'Columns',
  header: 'Header',
};

// ── App ───────────────────────────────────────────────────────────────────────

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
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [mergeData, setMergeData] = useState<string>('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
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
      // Cross-container move — remove from source first, then insert into target
      // using the UPDATED state so we don't re-introduce the stale block tree.
      const draggedBlock = activeContainer[activeIdx];
      const newSource = activeContainer.filter(b => b.id !== activeId);
      let updated = setContainerBlocks(blocks, activePath, newSource);

      // Compute target container from the already-updated state
      const overContainer = getContainerBlocks(updated, overPath);
      const overIdx = overContainer.findIndex(b => b.id === overId);
      // over.id is a containerId (empty drop zone) → append; otherwise insert before over item
      const insertAt = overIdx === -1 ? overContainer.length : overIdx;

      const newTarget = [
        ...overContainer.slice(0, insertAt),
        draggedBlock,
        ...overContainer.slice(insertAt),
      ];

      updated = setContainerBlocks(updated, overPath, newTarget);
      setBlocks(updated);
    }
  }

  function addBlock(type: BlockType) {
    setBlocks(prev => [...prev, createBlock(type)]);
  }

  function buildDocument() {
    return { blocks };
  }

  function parsedMergeData(): object | undefined {
    if (!mergeData.trim()) return undefined;
    try { return JSON.parse(mergeData); } catch { return undefined; }
  }

  async function handlePreview() {
    setLoading(true);
    setError(null);
    try {
      const html = await generateHtml(buildDocument(), parsedMergeData());
      setPreviewHtml(html);
      setShowPreview(true);
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
      a.download = 'email.html';
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
        <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <img src="/xero-logo.png" alt="Xero" style={{ height: 24 }} />
        </span>
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

      <MergeFieldsContext.Provider value={(() => {
        try { return mergeData.trim() ? flattenKeys(JSON.parse(mergeData)) : []; } catch { return []; }
      })()}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div style={{ display: 'flex', gap: 16, padding: 16, maxWidth: 1200, margin: '0 auto' }}>
          <BlockPalette onAdd={addBlock} mergeData={mergeData} onMergeDataChange={setMergeData} />
          <div style={{ flex: 1 }}>
            <BlockCanvas blocks={blocks} onBlocksChange={setBlocks} containerId="root" />
          </div>
        </div>
        <DragOverlay>
          {activeId ? (() => {
            const block = findBlock(blocks, activeId);
            return (
              <div style={{
                background: '#fff',
                border: '2px solid #3b82f6',
                borderRadius: 8,
                padding: '10px 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                cursor: 'grabbing',
                fontWeight: 600,
                fontSize: 14,
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}>
                <span style={{ fontSize: 18, color: '#93c5fd' }}>⠿</span>
                {blockTypeLabel[block?.type ?? ''] ?? 'Block'}
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
      </MergeFieldsContext.Provider>
      <PreviewModal html={showPreview ? previewHtml : null} onClose={() => setShowPreview(false)} />
    </div>
  );
}
