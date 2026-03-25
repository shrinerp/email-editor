import type { ImageBlock } from '../../types/blocks';

interface Props {
  block: ImageBlock;
  onChange: (updated: ImageBlock) => void;
}

export function ImageBlockEditor({ block, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Image Block</label>
      <input
        type="text"
        placeholder="Image URL"
        value={block.imageUrl}
        onChange={e => onChange({ ...block, imageUrl: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      <input
        type="text"
        placeholder="Alt text"
        value={block.altText}
        onChange={e => onChange({ ...block, altText: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      {block.imageUrl && (
        <img src={block.imageUrl} alt={block.altText} style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 4 }} />
      )}
    </div>
  );
}
