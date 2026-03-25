import type { ButtonBlock } from '../../types/blocks';

interface Props {
  block: ButtonBlock;
  onChange: (updated: ButtonBlock) => void;
}

export function ButtonBlockEditor({ block, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Button / CTA</label>
      <input
        type="text"
        placeholder="Button label"
        value={block.label}
        onChange={e => onChange({ ...block, label: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      <input
        type="text"
        placeholder="URL (https://...)"
        value={block.url}
        onChange={e => onChange({ ...block, url: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label style={{ fontSize: 13 }}>
          Background
          <input type="color" value={block.backgroundColor}
            onChange={e => onChange({ ...block, backgroundColor: e.target.value })}
            style={{ marginLeft: 6 }} />
        </label>
        <label style={{ fontSize: 13 }}>
          Text
          <input type="color" value={block.textColor}
            onChange={e => onChange({ ...block, textColor: e.target.value })}
            style={{ marginLeft: 6 }} />
        </label>
      </div>
      <div style={{ marginTop: 4 }}>
        <a
          href={block.url || '#'}
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            backgroundColor: block.backgroundColor,
            color: block.textColor,
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {block.label || 'Button'}
        </a>
      </div>
    </div>
  );
}
