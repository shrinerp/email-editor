import type { ColumnsBlock, EmailBlock, BlockType } from '../../types/blocks';
import { createBlock } from '../../types/blocks';
import { BlockCanvas } from '../editor/BlockCanvas';
import { BlockPalette } from '../editor/BlockPalette';

interface Props {
  block: ColumnsBlock;
  onChange: (updated: ColumnsBlock) => void;
}

function ColumnContainer({
  label,
  blocks,
  onBlocksChange,
  containerId,
}: {
  label: string;
  blocks: EmailBlock[];
  onBlocksChange: (blocks: EmailBlock[]) => void;
  containerId: string;
}) {
  function handleAdd(type: BlockType) {
    onBlocksChange([...blocks, createBlock(type)]);
  }

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '6px 10px',
        background: '#f8f8f8',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <span className="xui-heading-xsmall">{label}</span>
      </div>
      <div style={{ padding: 8 }}>
        <BlockPalette onAdd={handleAdd} compact />
        <div style={{ marginTop: 8 }}>
          <BlockCanvas blocks={blocks} onBlocksChange={onBlocksChange} containerId={containerId} />
        </div>
      </div>
    </div>
  );
}

export function ColumnsBlockEditor({ block, onChange }: Props) {
  function handleColumnCountChange(next: number) {
    const current = block.columns.length;
    if (next < current) {
      const removed = block.columns.slice(next);
      const hasBlocks = removed.some(col => col.length > 0);
      if (hasBlocks) {
        const names = removed
          .map((_, i) => `Column ${next + i + 1}`)
          .join(', ');
        if (!window.confirm(`Remove ${names}? All blocks inside will be deleted.`)) return;
      }
      onChange({ ...block, columns: block.columns.slice(0, next) });
    } else {
      const extras = Array.from({ length: next - current }, (): EmailBlock[] => []);
      onChange({ ...block, columns: [...block.columns, ...extras] });
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <p className="xui-heading-item" style={{ margin: 0 }}>Columns</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          Count
          <select
            value={block.columns.length}
            onChange={e => handleColumnCountChange(Number(e.target.value))}
            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${block.columns.length}, 1fr)`,
        gap: 12,
      }}>
        {block.columns.map((col, i) => (
          <ColumnContainer
            key={i}
            label={`Column ${i + 1}`}
            blocks={col}
            onBlocksChange={updated => {
              const cols = block.columns.map((c, idx) => idx === i ? updated : c);
              onChange({ ...block, columns: cols });
            }}
            containerId={`${block.id}:col${i}`}
          />
        ))}
      </div>
    </div>
  );
}
