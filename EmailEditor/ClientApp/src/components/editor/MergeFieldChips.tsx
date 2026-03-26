import { createContext, useContext, useState } from 'react';

// ── Context ───────────────────────────────────────────────────────────────────

export const MergeFieldsContext = createContext<string[]>([]);
export function useMergeFields() { return useContext(MergeFieldsContext); }

// ── MergeFieldSelect ──────────────────────────────────────────────────────────

interface Props {
  /** Leaf-path keys from the parsed JSON e.g. ["person.firstName", "order.total"] */
  fieldPaths: string[];
  /** Called with the full token e.g. "{{person.firstName}}" */
  onInsert: (token: string) => void;
}

export function MergeFieldSelect({ fieldPaths, onInsert }: Props) {
  const [value, setValue] = useState('');
  const empty = fieldPaths.length === 0;

  return (
    <select
      value={value}
      disabled={empty}
      onChange={e => {
        const path = e.target.value;
        if (!path) return;
        onInsert(`{{${path}}}`);
        setValue('');
      }}
      style={{
        marginTop: 4,
        padding: '3px 6px',
        fontSize: 12,
        fontFamily: 'monospace',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        color: empty ? '#aaa' : '#1d4ed8',
        background: '#fff',
        cursor: empty ? 'default' : 'pointer',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <option value="" disabled>
        {empty ? 'No merge fields defined' : 'Insert field…'}
      </option>
      {fieldPaths.map(path => (
        <option key={path} value={path}>
          {`{{${path}}}`}
        </option>
      ))}
    </select>
  );
}
