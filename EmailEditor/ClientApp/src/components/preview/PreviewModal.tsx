interface Props {
  html: string | null;
  onClose: () => void;
}

export function PreviewModal({ html, onClose }: Props) {
  if (!html) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '90vw',
          maxWidth: 680,
          height: '90vh',
          background: '#fff',
          borderRadius: 10,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          background: '#f8f8f8',
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 }}>
            Preview
          </span>
          <button
            onClick={onClose}
            aria-label="Close preview"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              color: '#888',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* iframe */}
        <iframe
          srcDoc={html}
          title="Email Preview"
          style={{ flex: 1, border: 'none', display: 'block' }}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
