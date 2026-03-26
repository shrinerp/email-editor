import { useRef } from 'react';
import type { ButtonBlock } from '../../types/blocks';
import { MergeFieldSelect, useMergeFields } from '../editor/MergeFieldChips';

interface Props {
  block: ButtonBlock;
  onChange: (updated: ButtonBlock) => void;
}

function insertAt(value: string, token: string, start: number): string {
  return value.slice(0, start) + token + value.slice(start);
}

export function ButtonBlockEditor({ block, onChange }: Props) {
  const labelRef = useRef<HTMLInputElement>(null);
  const labelCursor = useRef<number>(0);
  const fieldPaths = useMergeFields();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Button / CTA</label>
      <div>
        <input
          ref={labelRef}
          type="text"
          placeholder="Button label"
          value={block.label}
          onChange={e => onChange({ ...block, label: e.target.value })}
          onSelect={e => { labelCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
          onKeyUp={e => { labelCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
          style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }}
        />
        <MergeFieldSelect
          fieldPaths={fieldPaths}
          onInsert={token => {
            const pos = labelCursor.current;
            onChange({ ...block, label: insertAt(block.label, token, pos) });
            labelCursor.current = pos + token.length;
            requestAnimationFrame(() => {
              labelRef.current?.focus();
              labelRef.current?.setSelectionRange(pos + token.length, pos + token.length);
            });
          }}
        />
      </div>
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
