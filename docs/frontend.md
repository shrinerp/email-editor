---
title: Frontend (React SPA)
tags: [frontend, react, typescript]
---

# Frontend

React 19 + Vite (TypeScript) SPA located in `EmailEditor/ClientApp/`.

## Directory Structure

```
EmailEditor/ClientApp/
├── src/
│   ├── App.tsx                         ← Root: wires palette, canvas, metadata, preview
│   ├── types/
│   │   └── blocks.ts                   ← TypeScript block types + createBlock()
│   ├── api/
│   │   └── generate.ts                 ← fetch wrapper for POST /api/generate
│   ├── components/
│   │   ├── editor/
│   │   │   ├── BlockPalette.tsx        ← Click-to-add block sidebar
│   │   │   ├── BlockCanvas.tsx         ← dnd-kit sortable canvas + delete
│   │   │   └── MetadataForm.tsx        ← Subject, Preview Text, From fields
│   │   ├── blocks/
│   │   │   ├── HeroBlockEditor.tsx
│   │   │   ├── TextBlockEditor.tsx     ← Quill rich text
│   │   │   ├── ButtonBlockEditor.tsx   ← Label, URL, color pickers + live preview
│   │   │   ├── ImageBlockEditor.tsx
│   │   │   ├── DividerBlockEditor.tsx
│   │   │   └── TwoColumnBlockEditor.tsx ← Two Quill editors side by side
│   │   └── preview/
│   │       └── PreviewPanel.tsx        ← Sandboxed iframe
│   ├── index.css
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@dnd-kit/core` | Drag-and-drop primitives |
| `@dnd-kit/sortable` | Sortable list abstraction for the block canvas |
| `@dnd-kit/utilities` | CSS transform helpers |
| `quill` | Rich text editor (vanilla JS, wrapped with `useEffect`) |

## Component Design

### Editor Layout

```
┌──────────────────────────────────────────────────────┐
│  ✉️ Email Editor      [👁 Preview]  [⬇ Download HTML] │  ← Header
├──────────────┬───────────────────────────────────────┤
│              │  Subject / Preview Text / From fields │  ← MetadataForm
│  Block       ├───────────────────────────────────────┤
│  Palette     │  Canvas (drag-drop)                   │  ← BlockCanvas
│              │  ┌─────────────────────────────────┐  │
│  🖼️ Hero     │  │ ⠿  HeroBlock               [✕] │  │
│  📝 Text     │  ├─────────────────────────────────┤  │
│  🔘 Button   │  │ ⠿  TextBlock (Quill)        [✕] │  │
│  📷 Image    │  ├─────────────────────────────────┤  │
│  ➖ Divider  │  │ ⠿  ButtonBlock             [✕] │  │
│  ⬜ 2 Cols   │  └─────────────────────────────────┘  │
│              ├───────────────────────────────────────┤
│              │  [ Preview iframe renders here ]      │  ← PreviewPanel
└──────────────┴───────────────────────────────────────┘
```

### Block Components (`src/components/blocks/`)

Each block type has its own component with an inline editor:

| Component | Editor UI |
|-----------|-----------|
| `HeroBlock` | Image URL input + headline text input |
| `TextBlock` | Quill rich text editor |
| `ButtonBlock` | Label input + URL input + color pickers |
| `ImageBlock` | Image URL input + alt text input |
| `DividerBlock` | No editor (style only) |
| `TwoColumnBlock` | Two Quill editors side by side |

### Quill Integration

Quill is integrated as vanilla JS using `useEffect` and `useRef` (React 19 compatible):

```tsx
const editorRef = useRef<HTMLDivElement>(null);
const quillRef = useRef<Quill | null>(null);

useEffect(() => {
  if (!editorRef.current || quillRef.current) return;
  quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
  quillRef.current.on('text-change', () => {
    onChange(quillRef.current!.root.innerHTML);
  });
}, []);
```

## API Integration (`src/api/`)

```ts
export async function generateHtml(doc: EmailDocument): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}
```

## Dev Server

```bash
cd EmailEditor/ClientApp
npm run dev   # Vite dev server on localhost:5173
              # /api/* proxied to localhost:5261
```

## Related

- [[architecture]] — how the SPA fits in the system
- [[api]] — the endpoint the SPA calls
