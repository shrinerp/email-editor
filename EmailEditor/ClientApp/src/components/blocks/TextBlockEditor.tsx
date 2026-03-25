import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import type { TextBlock } from '../../types/blocks';
import { MergeFieldChips, useMergeFields } from '../editor/MergeFieldChips';

interface Props {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

export function TextBlockEditor({ block, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const blockIdRef = useRef(block.id);
  const onChangeRef = useRef(onChange);
  const savedSelectionRef = useRef<{ index: number; length: number } | null>(null);

  // Keep onChangeRef current so the Quill handler always calls the latest onChange
  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { toolbar: [['bold', 'italic', 'underline'], ['link'], [{ color: [] }]] },
    });
    if (block.htmlContent) {
      quillRef.current.clipboard.dangerouslyPasteHTML(block.htmlContent);
    }
    quillRef.current.on('text-change', () => {
      onChangeRef.current({ ...block, id: blockIdRef.current, htmlContent: quillRef.current!.root.innerHTML });
    });
    // Track last known selection so chip clicks can insert at the right position
    quillRef.current.on('selection-change', (range) => {
      if (range) savedSelectionRef.current = range;
    });
  }, []);

  useEffect(() => { blockIdRef.current = block.id; }, [block.id]);

  const fieldPaths = useMergeFields();

  function handleInsert(token: string) {
    const q = quillRef.current;
    if (!q) return;
    const idx = savedSelectionRef.current?.index ?? q.getLength() - 1;
    q.focus();
    q.insertText(idx, token, 'user');
    q.setSelection(idx + token.length, 0);
  }

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Text Block</label>
      <div ref={editorRef} style={{ minHeight: 100 }} />
      <MergeFieldChips fieldPaths={fieldPaths} onInsert={handleInsert} />
    </div>
  );
}
