import { useRef } from 'react';
import XUITextInput from '@xero/xui/react/textinput';
import type { ImageBlock } from '../../types/blocks';
import { MergeFieldSelect, useMergeFields } from '../editor/MergeFieldChips';

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

  const altInputProps = {
    onSelect: (e: { target: EventTarget | null }) => { altCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; },
    onKeyUp: (e: { target: EventTarget | null }) => { altCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p className="xui-heading-item" style={{ margin: 0 }}>Image Block</p>
      <XUITextInput
        label="Image URL"
        placeholder="Image URL"
        value={block.imageUrl}
        onChange={e => onChange({ ...block, imageUrl: e.target.value })}
      />
      <div>
        <XUITextInput
          label="Alt text"
          placeholder="Alt text"
          value={block.altText}
          inputRef={altRef}
          onChange={e => onChange({ ...block, altText: e.target.value })}
          inputProps={altInputProps}
        />
        <MergeFieldSelect
          fieldPaths={fieldPaths}
          onInsert={token => {
            const pos = altCursor.current;
            onChange({ ...block, altText: insertAt(block.altText, token, pos) });
            altCursor.current = pos + token.length;
            requestAnimationFrame(() => {
              (altRef.current as HTMLInputElement | null)?.focus();
              (altRef.current as HTMLInputElement | null)?.setSelectionRange(pos + token.length, pos + token.length);
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
