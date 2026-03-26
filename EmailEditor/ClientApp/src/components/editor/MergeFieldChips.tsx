import { createContext, useContext, useState } from 'react';
import XUISelectBox, { XUISelectBoxOption } from '@xero/xui/react/selectbox';
console.log('[MergeFieldChips] XUISelectBox loaded:', XUISelectBox, 'XUISelectBoxOption:', XUISelectBoxOption);

// ── Context ───────────────────────────────────────────────────────────────────

export const MergeFieldsContext = createContext<string[]>([]);
export function useMergeFields() { return useContext(MergeFieldsContext); }

// ── MergeFieldSelect ──────────────────────────────────────────────────────────

interface Props {
  /** Leaf-path keys from the parsed JSON e.g. ["person.firstName", "order.total"] */
  fieldPaths: string[];
  /** Called with the full token e.g. "{{person.firstName}}" */
  onInsert: (token: string) => void;
}

export function MergeFieldSelect({ fieldPaths, onInsert }: Props) {
  const [selected, setSelected] = useState('');
  const empty = fieldPaths.length === 0;

  return (
    <XUISelectBox
      label="Insert field"
      isLabelHidden
      buttonContent={selected || 'Insert field\u2026'}
      isDisabled={empty}
      size="small"
      onSelect={(value: string) => {
        if (!value) return;
        onInsert(`{{${value}}}`);
        setSelected('');
      }}
    >
      {empty ? (
        <XUISelectBoxOption key="_empty" value="" id="_empty" isDisabled>
          No merge fields defined
        </XUISelectBoxOption>
      ) : (
        fieldPaths.map(path => (
          <XUISelectBoxOption key={path} value={path} id={path}>
            {`{{${path}}}`}
          </XUISelectBoxOption>
        ))
      )}
    </XUISelectBox>
  );
}
