import type { HeroBlock } from '../../types/blocks';

interface Props {
  block: HeroBlock;
  onChange: (updated: HeroBlock) => void;
}

export function HeroBlockEditor({ block, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 600 }}>Hero Block</label>
      <input
        type="text"
        placeholder="Image URL"
        value={block.imageUrl}
        onChange={e => onChange({ ...block, imageUrl: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      <input
        type="text"
        placeholder="Headline"
        value={block.headline}
        onChange={e => onChange({ ...block, headline: e.target.value })}
        style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
      />
      {block.imageUrl && (
        <img src={block.imageUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 4 }} />
      )}
    </div>
  );
}
