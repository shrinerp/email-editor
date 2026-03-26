import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import type { TextBlock } from '../../types/blocks';
import { MergeFieldSelect, useMergeFields } from '../editor/MergeFieldChips';

interface Props {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

interface AutocompleteState {
  anchorIndex: number;   // index in Quill where {{ starts
  query: string;         // text typed after {{
  top: number;           // px from editor top
  left: number;          // px from editor left
}

export function TextBlockEditor({ block, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const blockIdRef = useRef(block.id);
  const onChangeRef = useRef(onChange);
  const savedSelectionRef = useRef<{ index: number; length: number } | null>(null);
  const [autocomplete, setAutocomplete] = useState<AutocompleteState | null>(null);
  const autocompleteRef = useRef<AutocompleteState | null>(null);

  // Keep refs current every render
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { autocompleteRef.current = autocomplete; }, [autocomplete]);
  useEffect(() => { blockIdRef.current = block.id; }, [block.id]);

  const fieldPaths = useMergeFields();
  const fieldPathsRef = useRef<string[]>(fieldPaths);
  useEffect(() => { fieldPathsRef.current = fieldPaths; }, [fieldPaths]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    const q = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { toolbar: [['bold', 'italic', 'underline'], ['link'], [{ color: [] }]] },
    });
    quillRef.current = q;

    if (block.htmlContent) {
      q.clipboard.dangerouslyPasteHTML(block.htmlContent);
    }

    q.on('text-change', () => {
      onChangeRef.current({ ...block, id: blockIdRef.current, htmlContent: q.root.innerHTML });

      // Detect {{ trigger for autocomplete
      const range = q.getSelection();
      if (!range) { setAutocomplete(null); return; }

      const textBefore = q.getText(0, range.index);
      const openIdx = textBefore.lastIndexOf('{{');

      if (openIdx !== -1) {
        const query = textBefore.slice(openIdx + 2);
        // Only show if the text between {{ and cursor has no braces
        if (!query.includes('{') && !query.includes('}') && fieldPathsRef.current.length > 0) {
          const bounds = q.getBounds(range.index);
          const top = bounds?.bottom ?? 0;
          const left = bounds?.left ?? 0;
          setAutocomplete({ anchorIndex: openIdx, query, top: top + 4, left });
          return;
        }
      }
      setAutocomplete(null);
    });

    q.on('selection-change', (range) => {
      if (range) {
        savedSelectionRef.current = range;
      } else {
        // Focus left — close autocomplete only if it was keyboard-driven (not chip mousedown)
        // We do this via a small delay so the mousedown handler on the dropdown fires first
        setTimeout(() => setAutocomplete(null), 150);
      }
    });
  }, []);

  function handleInsert(token: string) {
    const q = quillRef.current;
    if (!q) return;
    const idx = savedSelectionRef.current?.index ?? q.getLength() - 1;
    q.focus();
    q.insertText(idx, token, 'user');
    q.setSelection(idx + token.length, 0);
  }

  function insertFromAutocomplete(path: string) {
    const q = quillRef.current;
    const ac = autocompleteRef.current;
    if (!q || !ac) return;
    const token = `{{${path}}}`;
    // Delete the typed "{{query" and replace with full token
    const currentRange = q.getSelection() ?? savedSelectionRef.current;
    const cursorIdx = currentRange?.index ?? ac.anchorIndex + 2 + ac.query.length;
    const charsToDelete = cursorIdx - ac.anchorIndex;
    q.deleteText(ac.anchorIndex, charsToDelete, 'user');
    q.insertText(ac.anchorIndex, token, 'user');
    q.setSelection(ac.anchorIndex + token.length, 0);
    setAutocomplete(null);
  }

  const filteredFields = autocomplete
    ? fieldPaths.filter(p => p.toLowerCase().includes(autocomplete.query.toLowerCase()))
    : [];

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Text Block</label>
      <div ref={editorRef} style={{ minHeight: 100 }} />

      {/* {{ Autocomplete dropdown */}
      {autocomplete && (
        <div
          style={{
            position: 'absolute',
            top: autocomplete.top + 44, // offset for toolbar height
            left: Math.max(0, autocomplete.left),
            zIndex: 500,
            background: '#fff',
            border: '1px solid #c7d2fe',
            borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            minWidth: 180,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {filteredFields.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: 12, color: '#aaa' }}>
              No merge fields available
            </div>
          ) : (
            filteredFields.map(path => (
              <div
                key={path}
                onMouseDown={e => { e.preventDefault(); insertFromAutocomplete(path); }}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  color: '#1d4ed8',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#eff6ff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
              >
                {`{{${path}}}`}
              </div>
            ))
          )}
        </div>
      )}

      <MergeFieldSelect fieldPaths={fieldPaths} onInsert={handleInsert} />
    </div>
  );
}
