import { useRef } from 'react';
import type { ImageBlock } from '../../types/blocks';
import { MergeFieldChips, useMergeFields } from '../editor/MergeFieldChips';

interface Props {
  block: ImageBlock;
  onChange: (updated: ImageBlock) => void;
}

function insertAt(value: string, token: string, start: number): string {
  return value.slice(0, start) + token + value.slice(start);
}

export function ImageBlockEditor({ block, onChange }: Props) {
  const altRef = useRef<HTMLInputElement>(null);
  const altCursor = useRef<number>(0);
  const fieldPaths = useMergeFields();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Image Block</label>
      <input
        type="text"
        placeholder="Image URL"
        value={block.imageUrl}
        onChange={e => onChange({ ...block, imageUrl: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      <div>
        <input
          ref={altRef}
          type="text"
          placeholder="Alt text"
          value={block.altText}
          onChange={e => onChange({ ...block, altText: e.target.value })}
          onSelect={e => { altCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
          onKeyUp={e => { altCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
          style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }}
        />
        <MergeFieldChips
          fieldPaths={fieldPaths}
          onInsert={token => {
            const pos = altCursor.current;
            onChange({ ...block, altText: insertAt(block.altText, token, pos) });
            altCursor.current = pos + token.length;
            requestAnimationFrame(() => {
              altRef.current?.focus();
              altRef.current?.setSelectionRange(pos + token.length, pos + token.length);
            });
          }}
        />
      </div>
      {block.imageUrl && (
        <img src={block.imageUrl} alt={block.altText} style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 4 }} />
      )}
    </div>
  );
}
