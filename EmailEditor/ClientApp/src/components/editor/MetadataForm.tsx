interface Metadata {
  subject: string;
  previewText: string;
  fromName: string;
  fromAddress: string;
}

interface Props {
  metadata: Metadata;
  onChange: (updated: Metadata) => void;
}

const fieldStyle = {
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
  display: 'block',
  marginBottom: 4,
};

export function MetadataForm({ metadata, onChange }: Props) {
  return (
    <div style={{
      background: '#f8f8f8',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
    }}>
      <div>
        <label style={labelStyle}>Subject</label>
        <input style={fieldStyle} type="text" placeholder="Email subject" value={metadata.subject}
          onChange={e => onChange({ ...metadata, subject: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>Preview Text</label>
        <input style={fieldStyle} type="text" placeholder="Inbox snippet..." value={metadata.previewText}
          onChange={e => onChange({ ...metadata, previewText: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>From Name</label>
        <input style={fieldStyle} type="text" placeholder="Sender name" value={metadata.fromName}
          onChange={e => onChange({ ...metadata, fromName: e.target.value })} />
      </div>
      <div>
        <label style={labelStyle}>From Address</label>
        <input style={fieldStyle} type="email" placeholder="sender@example.com" value={metadata.fromAddress}
          onChange={e => onChange({ ...metadata, fromAddress: e.target.value })} />
      </div>
    </div>
  );
}
