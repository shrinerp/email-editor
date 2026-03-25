import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import type { TextBlock } from '../../types/blocks';

interface Props {
  block: TextBlock;
  onChange: (updated: TextBlock) => void;
}

export function TextBlockEditor({ block, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const blockIdRef = useRef(block.id);
  const onChangeRef = useRef(onChange);

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
  }, []);

  // Update blockIdRef when block.id changes (shouldn't normally happen)
  useEffect(() => { blockIdRef.current = block.id; }, [block.id]);

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Text Block</label>
      <div ref={editorRef} style={{ minHeight: 100 }} />
    </div>
  );
}
