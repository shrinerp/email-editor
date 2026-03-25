import type { TwoColumnBlock, EmailBlock, BlockType } from '../../types/blocks';
import { createBlock } from '../../types/blocks';
import { BlockCanvas } from '../editor/BlockCanvas';
import { BlockPalette } from '../editor/BlockPalette';

interface Props {
  block: TwoColumnBlock;
  onChange: (updated: TwoColumnBlock) => void;
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
        fontSize: 11,
        fontWeight: 600,
        color: '#666',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
      }}>
        {label}
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

export function TwoColumnBlockEditor({ block, onChange }: Props) {
  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Two Columns</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ColumnContainer
          label="Left"
          blocks={block.leftBlocks}
          onBlocksChange={leftBlocks => onChange({ ...block, leftBlocks })}
          containerId={`${block.id}:left`}
        />
        <ColumnContainer
          label="Right"
          blocks={block.rightBlocks}
          onBlocksChange={rightBlocks => onChange({ ...block, rightBlocks })}
          containerId={`${block.id}:right`}
        />
      </div>
    </div>
  );
}
