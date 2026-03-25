import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import type { TwoColumnBlock } from '../../types/blocks';

interface Props {
  block: TwoColumnBlock;
  onChange: (updated: TwoColumnBlock) => void;
}

function QuillEditor({ value, onChangeHtml }: { value: string; onChangeHtml: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { toolbar: [['bold', 'italic'], ['link']] },
    });
    if (value) quillRef.current.clipboard.dangerouslyPasteHTML(value);
    quillRef.current.on('text-change', () => {
      onChangeHtml(quillRef.current!.root.innerHTML);
    });
  }, []);

  return <div ref={editorRef} style={{ minHeight: 80 }} />;
}

export function TwoColumnBlockEditor({ block, onChange }: Props) {
  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Two Columns</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Left</div>
          <QuillEditor
            value={block.leftHtmlContent}
            onChangeHtml={html => onChange({ ...block, leftHtmlContent: html })}
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Right</div>
          <QuillEditor
            value={block.rightHtmlContent}
            onChangeHtml={html => onChange({ ...block, rightHtmlContent: html })}
          />
        </div>
      </div>
    </div>
  );
}
