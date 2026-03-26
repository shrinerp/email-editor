import { useRef } from 'react';
import XUITextInput from '@xero/xui/react/textinput';
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

  const headlineInputProps = {
    onSelect: (e: { target: EventTarget | null }) => { headlineCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; },
    onKeyUp: (e: { target: EventTarget | null }) => { headlineCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p className="xui-heading-item" style={{ margin: 0 }}>Hero Block</p>
      <XUITextInput
        label="Image URL"
        placeholder="Image URL"
        value={block.imageUrl}
        onChange={e => onChange({ ...block, imageUrl: e.target.value })}
      />
      <div>
        <XUITextInput
          label="Headline"
          placeholder="Headline"
          value={block.headline}
          inputRef={headlineRef}
          onChange={e => onChange({ ...block, headline: e.target.value })}
          inputProps={headlineInputProps}
        />
        <MergeFieldSelect
          fieldPaths={fieldPaths}
          onInsert={token => {
            const pos = headlineCursor.current;
            const next = insertAt(block.headline, token, pos);
            onChange({ ...block, headline: next });
            headlineCursor.current = pos + token.length;
            requestAnimationFrame(() => {
              (headlineRef.current as HTMLInputElement | null)?.focus();
              (headlineRef.current as HTMLInputElement | null)?.setSelectionRange(pos + token.length, pos + token.length);
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
