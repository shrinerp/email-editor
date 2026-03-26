import { useState } from 'react';
import type { BlockType } from '../../types/blocks';
import { DataTab } from './DataTab';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero',      label: 'Hero',       icon: '🖼️' },
  { type: 'text',      label: 'Text',       icon: '📝' },
  { type: 'button',    label: 'Button',     icon: '🔘' },
  { type: 'image',     label: 'Image',      icon: '📷' },
  { type: 'divider',   label: 'Divider',    icon: '➖' },
  { type: 'twoColumn', label: '2 Columns',  icon: '⬜' },
  { type: 'header',    label: 'Header',     icon: '📋' },
];

interface Props {
  onAdd: (type: BlockType) => void;
  compact?: boolean;
  mergeData?: string;
  onMergeDataChange?: (value: string) => void;
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '6px 0',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
  cursor: 'pointer',
  fontWeight: active ? 700 : 400,
  fontSize: 12,
  color: active ? '#3b82f6' : '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  transition: 'color 0.15s, border-color 0.15s',
});

export function BlockPalette({ onAdd, compact = false, mergeData = '', onMergeDataChange }: Props) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'data'>('blocks');

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
      width: 180,
      flexShrink: 0,
      background: '#f8f8f8',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', padding: '0 8px' }}>
        <button style={tabStyle(activeTab === 'blocks')} onClick={() => setActiveTab('blocks')}>
          Blocks
        </button>
        <button style={tabStyle(activeTab === 'data')} onClick={() => setActiveTab('data')}>
          Data
        </button>
      </div>

      <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'blocks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
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
        )}

        {activeTab === 'data' && (
          <DataTab value={mergeData} onChange={onMergeDataChange ?? (() => {})} />
        )}
      </div>
    </aside>
  );
}
