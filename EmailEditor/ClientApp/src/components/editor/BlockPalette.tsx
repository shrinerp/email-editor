import type { BlockType } from '../../types/blocks';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero',      label: 'Hero',       icon: '🖼️' },
  { type: 'text',      label: 'Text',       icon: '📝' },
  { type: 'button',    label: 'Button',     icon: '🔘' },
  { type: 'image',     label: 'Image',      icon: '📷' },
  { type: 'divider',   label: 'Divider',    icon: '➖' },
  { type: 'twoColumn', label: '2 Columns',  icon: '⬜' },
];

interface Props {
  onAdd: (type: BlockType) => void;
  compact?: boolean;
}

export function BlockPalette({ onAdd, compact = false }: Props) {
  if (compact) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
        {BLOCK_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <aside style={{
      width: 160,
      flexShrink: 0,
      background: '#f8f8f8',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#555', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Blocks
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {BLOCK_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
