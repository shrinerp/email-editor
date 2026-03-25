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
│   ├── App.tsx                    ← Root component (placeholder)
│   ├── components/
│   │   ├── editor/                ← Canvas, palette, drag-drop
│   │   ├── blocks/                ← One component per block type
│   │   └── preview/               ← iframe HTML preview
│   ├── api/                       ← fetch wrapper for /api/generate
│   ├── index.css
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

> [!note] Partially Implemented
> Directory structure above reflects the intended design (#6, #7). Currently only `App.tsx` placeholder exists.

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
┌────────────────────────────────────────────────┐
│  Subject / Preview Text / From fields          │
├──────────────┬─────────────────────────────────┤
│  Block       │  Canvas (drag-drop)             │
│  Palette     │  ┌──────────────────────────┐  │
│              │  │  HeroBlock               │  │
│  [Hero]      │  ├──────────────────────────┤  │
│  [Text]      │  │  TextBlock (Quill)       │  │
│  [Button]    │  ├──────────────────────────┤  │
│  [Image]     │  │  ButtonBlock             │  │
│  [Divider]   │  └──────────────────────────┘  │
│  [2-Column]  │                                 │
│              │  [Preview]  [Download HTML]     │
└──────────────┴─────────────────────────────────┘
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
