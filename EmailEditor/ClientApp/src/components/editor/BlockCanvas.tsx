import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EmailBlock } from '../../types/blocks';
import { HeroBlockEditor } from '../blocks/HeroBlockEditor';
import { TextBlockEditor } from '../blocks/TextBlockEditor';
import { ButtonBlockEditor } from '../blocks/ButtonBlockEditor';
import { ImageBlockEditor } from '../blocks/ImageBlockEditor';
import { DividerBlockEditor } from '../blocks/DividerBlockEditor';
import { TwoColumnBlockEditor } from '../blocks/TwoColumnBlockEditor';

function BlockEditor({ block, onChange }: { block: EmailBlock; onChange: (b: EmailBlock) => void }) {
  switch (block.type) {
    case 'hero':      return <HeroBlockEditor block={block} onChange={onChange} />;
    case 'text':      return <TextBlockEditor block={block} onChange={onChange} />;
    case 'button':    return <ButtonBlockEditor block={block} onChange={onChange} />;
    case 'image':     return <ImageBlockEditor block={block} onChange={onChange} />;
    case 'divider':   return <DividerBlockEditor />;
    case 'twoColumn': return <TwoColumnBlockEditor block={block} onChange={onChange} />;
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
}

export function BlockCanvas({ blocks, onBlocksChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  }

  if (blocks.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#aaa',
        border: '2px dashed #e0e0e0',
        borderRadius: 8,
        minHeight: 200,
        fontSize: 14,
      }}>
        Add a block from the palette to get started
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
    </DndContext>
  );
}
