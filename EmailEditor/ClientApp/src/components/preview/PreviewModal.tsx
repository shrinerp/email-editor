import { useState } from 'react';

interface Props {
  html: string | null;
  onClose: () => void;
}

type ViewportMode = 'desktop' | 'mobile';

const toggleBtnBase: React.CSSProperties = {
  padding: '3px 10px',
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid #d1d5db',
  borderRadius: 4,
  cursor: 'pointer',
  lineHeight: 1.6,
};

export function PreviewModal({ html, onClose }: Props) {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  if (!html) return null;

  const maxWidth = viewport === 'mobile' ? 375 : 680;

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
          maxWidth,
          height: '90vh',
          background: '#fff',
          borderRadius: 10,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          transition: 'max-width 0.2s ease',
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
          gap: 8,
        }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 }}>
            Preview
          </span>

          {/* Viewport toggle */}
          <button
            onClick={() => setViewport('desktop')}
            aria-pressed={viewport === 'desktop'}
            style={{
              ...toggleBtnBase,
              background: viewport === 'desktop' ? '#1d4ed8' : '#fff',
              color: viewport === 'desktop' ? '#fff' : '#374151',
              borderColor: viewport === 'desktop' ? '#1d4ed8' : '#d1d5db',
            }}
          >
            🖥 Desktop
          </button>
          <button
            onClick={() => setViewport('mobile')}
            aria-pressed={viewport === 'mobile'}
            style={{
              ...toggleBtnBase,
              background: viewport === 'mobile' ? '#1d4ed8' : '#fff',
              color: viewport === 'mobile' ? '#fff' : '#374151',
              borderColor: viewport === 'mobile' ? '#1d4ed8' : '#d1d5db',
            }}
          >
            📱 Mobile
          </button>

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

        {/* Email envelope header */}
        <div style={{
          padding: '10px 20px',
          borderBottom: '1px solid #e8e8e8',
          background: '#fafafa',
          flexShrink: 0,
          fontSize: 13,
          lineHeight: 1.8,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: '#999', width: 56, flexShrink: 0, textAlign: 'right' }}>From:</span>
            <span style={{ color: '#333' }}>Sender &lt;sender@example.com&gt;</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: '#999', width: 56, flexShrink: 0, textAlign: 'right' }}>To:</span>
            <span style={{ color: '#333' }}>recipient@example.com</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: '#999', width: 56, flexShrink: 0, textAlign: 'right' }}>Subject:</span>
            <span style={{ fontWeight: 600, color: '#111' }}>Email Preview</span>
          </div>
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
