import { createContext, useContext } from 'react';

// ── Context ───────────────────────────────────────────────────────────────────

export const MergeFieldsContext = createContext<string[]>([]);
export function useMergeFields() { return useContext(MergeFieldsContext); }

// ── MergeFieldChips ───────────────────────────────────────────────────────────

interface Props {
  /** Leaf-path keys from the parsed JSON e.g. ["person.firstName", "order.total"] */
  fieldPaths: string[];
  /** Called with the full token e.g. "{{person.firstName}}" */
  onInsert: (token: string) => void;
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  fontSize: 11,
  fontFamily: 'monospace',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: 4,
  color: '#1d4ed8',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  lineHeight: 1.6,
};

export function MergeFieldChips({ fieldPaths, onInsert }: Props) {
  if (fieldPaths.length === 0) {
    return (
      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
        No merge fields — add data in the Data tab
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
      {fieldPaths.map(path => (
        <button
          key={path}
          // preventDefault keeps focus on the active editor (Quill or input)
          onMouseDown={e => { e.preventDefault(); onInsert(`{{${path}}}`); }}
          style={chipStyle}
          title={`Insert {{${path}}}`}
        >
          {`{{${path}}}`}
        </button>
      ))}
    </div>
  );
}
