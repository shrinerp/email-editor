interface Props {
  html: string | null;
}

export function PreviewPanel({ html }: Props) {
  if (!html) return null;

  return (
    <div style={{
      marginTop: 16,
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      overflow: 'hidden',
      background: '#fff',
    }}>
      <div style={{
        padding: '8px 16px',
        background: '#f8f8f8',
        borderBottom: '1px solid #e0e0e0',
        fontSize: 12,
        fontWeight: 600,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Preview
      </div>
      <iframe
        srcDoc={html}
        title="Email Preview"
        style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
