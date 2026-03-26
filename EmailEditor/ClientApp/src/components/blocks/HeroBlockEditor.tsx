import { useRef } from 'react';
import type { HeroBlock } from '../../types/blocks';
import { MergeFieldSelect, useMergeFields } from '../editor/MergeFieldChips';

interface Props {
  block: HeroBlock;
  onChange: (updated: HeroBlock) => void;
}

/** Splices `token` into `value` at `start`, returns new string. */
function insertAt(value: string, token: string, start: number): string {
  return value.slice(0, start) + token + value.slice(start);
}

export function HeroBlockEditor({ block, onChange }: Props) {
  const headlineRef = useRef<HTMLInputElement>(null);
  const headlineCursor = useRef<number>(0);
  const fieldPaths = useMergeFields();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Hero Block</label>
      <input
        type="text"
        placeholder="Image URL"
        value={block.imageUrl}
        onChange={e => onChange({ ...block, imageUrl: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      <div>
        <input
          ref={headlineRef}
          type="text"
          placeholder="Headline"
          value={block.headline}
          onChange={e => onChange({ ...block, headline: e.target.value })}
          onSelect={e => { headlineCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
          onKeyUp={e => { headlineCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
          style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }}
        />
        <MergeFieldSelect
          fieldPaths={fieldPaths}
          onInsert={token => {
            const pos = headlineCursor.current;
            const next = insertAt(block.headline, token, pos);
            onChange({ ...block, headline: next });
            headlineCursor.current = pos + token.length;
            // restore focus + cursor
            requestAnimationFrame(() => {
              headlineRef.current?.focus();
              headlineRef.current?.setSelectionRange(pos + token.length, pos + token.length);
            });
          }}
        />
      </div>
      {block.imageUrl.startsWith('http') && (
        <img
          src={block.imageUrl}
          alt="preview"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 4 }}
        />
      )}
    </div>
  );
}
