import { useRef } from 'react';
import XUITextInput from '@xero/xui/react/textinput';
import type { HeaderBlock } from '../../types/blocks';
import { MergeFieldSelect, useMergeFields } from '../editor/MergeFieldChips';

interface Props {
  block: HeaderBlock;
  onChange: (updated: HeaderBlock) => void;
}

function insertAt(value: string, token: string, start: number): string {
  return value.slice(0, start) + token + value.slice(start);
}

export function HeaderBlockEditor({ block, onChange }: Props) {
  const textRef = useRef<HTMLInputElement>(null);
  const textCursor = useRef<number>(0);
  const fieldPaths = useMergeFields();

  const textInputProps = {
    onSelect: (e: { target: EventTarget | null }) => { textCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; },
    onKeyUp:  (e: { target: EventTarget | null }) => { textCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p className="xui-heading-item" style={{ margin: 0 }}>Header Block</p>
      <div>
        <XUITextInput
          label="Text"
          placeholder="Header text"
          value={block.text}
          inputRef={textRef}
          onChange={e => onChange({ ...block, text: e.target.value })}
          inputProps={textInputProps}
        />
        <MergeFieldSelect
          fieldPaths={fieldPaths}
          onInsert={token => {
            const pos = textCursor.current;
            const next = insertAt(block.text, token, pos);
            onChange({ ...block, text: next });
            textCursor.current = pos + token.length;
            requestAnimationFrame(() => {
              (textRef.current as HTMLInputElement | null)?.focus();
              (textRef.current as HTMLInputElement | null)?.setSelectionRange(pos + token.length, pos + token.length);
            });
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, flex: 1 }}>
          Level
          <select
            value={block.level}
            onChange={e => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })}
            style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, flex: 1 }}>
          Alignment
          <select
            value={block.alignment}
            onChange={e => onChange({ ...block, alignment: e.target.value as 'left' | 'center' | 'right' })}
            style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
      {/* Live preview */}
      {block.text && (
        <div style={{ padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
          {(() => {
            const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3';
            return (
              <Tag style={{
                margin: 0,
                textAlign: block.alignment,
                color: '#1a1a1a',
                fontFamily: 'Arial, sans-serif',
              }}>
                {block.text}
              </Tag>
            );
          })()}
        </div>
      )}
    </div>
  );
}
