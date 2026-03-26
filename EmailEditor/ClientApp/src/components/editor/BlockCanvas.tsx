import {
  useDroppable,
  useDndContext,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EmailBlock } from '../../types/blocks';
import { HeroBlockEditor } from '../blocks/HeroBlockEditor';
import { TextBlockEditor } from '../blocks/TextBlockEditor';
import { ButtonBlockEditor } from '../blocks/ButtonBlockEditor';
import { ImageBlockEditor } from '../blocks/ImageBlockEditor';
import { DividerBlockEditor } from '../blocks/DividerBlockEditor';
import { ColumnsBlockEditor } from '../blocks/ColumnsBlockEditor';
import { HeaderBlockEditor } from '../blocks/HeaderBlockEditor';

function BlockEditor({ block, onChange }: { block: EmailBlock; onChange: (b: EmailBlock) => void }) {
  switch (block.type) {
    case 'hero':      return <HeroBlockEditor block={block} onChange={onChange} />;
    case 'text':      return <TextBlockEditor block={block} onChange={onChange} />;
    case 'button':    return <ButtonBlockEditor block={block} onChange={onChange} />;
    case 'image':     return <ImageBlockEditor block={block} onChange={onChange} />;
    case 'divider':   return <DividerBlockEditor />;
    case 'columns':   return <ColumnsBlockEditor block={block} onChange={onChange} />;
    case 'header':    return <HeaderBlockEditor block={block} onChange={onChange} />;
  }
}

function SortableBlock({
  block,
  onChange,
  onDelete,
}: {
  block: EmailBlock;
  onChange: (b: EmailBlock) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', color: '#aaa', marginRight: 10, fontSize: 18, lineHeight: 1 }}
            title="Drag to reorder"
          >
            ⠿
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 18, lineHeight: 1, padding: 0 }}
            title="Delete block"
          >
            ✕
          </button>
        </div>
        <BlockEditor block={block} onChange={onChange} />
      </div>
    </div>
  );
}

interface Props {
  blocks: EmailBlock[];
  onBlocksChange: (blocks: EmailBlock[]) => void;
  containerId: string;
}

export function BlockCanvas({ blocks, onBlocksChange, containerId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });
  const { active } = useDndContext();
  const isDraggingAny = active !== null;

  if (blocks.length === 0) {
    const bg = isOver ? '#eff6ff' : isDraggingAny ? '#f8faff' : 'transparent';
    const borderColor = isOver ? '#93c5fd' : isDraggingAny ? '#bfdbfe' : '#e0e0e0';
    const color = isOver ? '#3b82f6' : isDraggingAny ? '#60a5fa' : '#aaa';
    return (
      <div ref={setNodeRef} style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        border: `2px dashed ${borderColor}`,
        background: bg,
        borderRadius: 8,
        minHeight: 200,
        fontSize: 14,
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
      }}>
        {isDraggingAny ? 'Drop here' : 'Add a block from the palette to get started'}
      </div>
    );
  }

  return (
    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
      <div style={{ flex: 1 }}>
        {blocks.map(block => (
          <SortableBlock
            key={block.id}
            block={block}
            onChange={updated => onBlocksChange(blocks.map(b => b.id === updated.id ? updated : b))}
            onDelete={() => onBlocksChange(blocks.filter(b => b.id !== block.id))}
          />
        ))}
      </div>
    </SortableContext>
  );
}
