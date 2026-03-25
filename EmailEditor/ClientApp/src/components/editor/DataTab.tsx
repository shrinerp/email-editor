interface Props {
  value: string;
  onChange: (value: string) => void;
}

/** Flattens a parsed JSON object into dot-path leaf keys. */
export function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return [];
  const result: string[] = [];
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      result.push(...flattenKeys(val, path));
    } else {
      result.push(path);
    }
  }
  return result;
}

export function DataTab({ value, onChange }: Props) {
  let parsed: unknown = null;
  let parseError = '';
  if (value.trim()) {
    try {
      parsed = JSON.parse(value);
    } catch {
      parseError = 'Invalid JSON';
    }
  }

  const fields = parsed ? flattenKeys(parsed) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={'{\n  "person": {\n    "firstName": "Alice"\n  }\n}'}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: 160,
          fontFamily: 'monospace',
          fontSize: 12,
          padding: 8,
          border: `1px solid ${parseError ? '#f87171' : '#ccc'}`,
          borderRadius: 4,
          resize: 'vertical',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      {parseError && (
        <div style={{ fontSize: 12, color: '#ef4444' }}>{parseError}</div>
      )}
      {!parseError && fields.length === 0 && (
        <div style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>
          No merge fields yet
        </div>
      )}
      {fields.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available Fields
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {fields.map(f => (
              <div
                key={f}
                style={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  background: '#f0f4ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: 4,
                  padding: '3px 8px',
                  color: '#3730a3',
                }}
              >
                {`{{${f}}}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
