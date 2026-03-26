---
name: xui
description: Use XUI (@xero/xui) React components instead of vanilla HTML/inline styles when building or modifying the email editor UI. Invoke whenever touching editor shell UI elements like buttons, inputs, selects, panels, or form controls.
user_invocable: true
---

# XUI Component Guidelines for Email Editor

When building or modifying the **editor shell UI** (not the generated email output), use `@xero/xui` components instead of vanilla HTML with inline styles. The XUI source lives at `/Users/paul.shriner/Documents/Github/xui`.

## Setup

XUI must be installed in the project before components can be used:
```bash
npm install @xero/xui
```

Import the XUI base styles once in `main.tsx` or `App.tsx`:
```tsx
import '@xero/xui/sass/xui.scss'; // requires sass support in Vite
```

Or use the prebuilt CSS if sass isn't configured:
```tsx
import '@xero/xui/dist/xui.css';
```

---

## Component Reference

### XUIButton — replaces `<button>` with inline styles

```tsx
import { XUIButton } from '@xero/xui/react/button';

// Primary action (Preview, Save)
<XUIButton variant="primary" size="medium" onClick={handlePreview}>
  Preview
</XUIButton>

// Secondary / neutral
<XUIButton variant="secondary" size="medium" onClick={handleDownload}>
  Download HTML
</XUIButton>

// Disabled state
<XUIButton variant="primary" isDisabled={loading}>
  {loading ? 'Loading…' : 'Preview'}
</XUIButton>

// Small (used in modal headers, toolbars)
<XUIButton variant="tertiary" size="small" onClick={onClose} aria-label="Close">
  ✕
</XUIButton>
```

Key props: `variant` ('primary'|'secondary'|'tertiary'|'borderless-main'|'borderless-muted'), `size` ('small'|'medium'|'large'), `isDisabled`, `isLoading`, `onClick`, `type`, `leftIcon`, `rightIcon`

---

### XUITextInput — replaces `<input type="text">` with inline styles

```tsx
import XUITextInput from '@xero/xui/react/textinput';

<XUITextInput
  label="Headline"
  value={block.headline}
  onChange={e => onChange({ ...block, headline: e.target.value })}
  placeholder="Enter headline…"
/>

// With cursor tracking for merge field insert
<XUITextInput
  label="Button Label"
  inputRef={labelRef}
  value={block.label}
  onChange={e => onChange({ ...block, label: e.target.value })}
  onSelect={e => { labelCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
  onKeyUp={e => { labelCursor.current = (e.target as HTMLInputElement).selectionStart ?? 0; }}
/>

// Multiline (replaces <textarea>)
<XUITextInput
  label="JSON Data"
  isMultiline
  value={value}
  onChange={e => onChange(e.target.value)}
  placeholder='{ "key": "value" }'
/>
```

Key props: `label`, `value`, `onChange`, `placeholder`, `isDisabled`, `isInvalid`, `validationMessage`, `hintMessage`, `isMultiline`, `inputRef`, `isLabelHidden`

---

### XUISelectBox — replaces `<select>` with inline styles (e.g. MergeFieldSelect)

```tsx
import XUISelectBox, { XUISelectBoxOption } from '@xero/xui/react/selectbox';

<XUISelectBox
  label="Insert field"
  isLabelHidden
  buttonContent={selected || 'Insert field…'}
  isDisabled={fieldPaths.length === 0}
  size="small"
  onSelect={(value) => {
    onInsert(`{{${value}}}`);
    setSelected('');
  }}
>
  {fieldPaths.map(path => (
    <XUISelectBoxOption key={path} value={path} id={path}>
      {`{{${path}}}`}
    </XUISelectBoxOption>
  ))}
</XUISelectBox>
```

Key props: `label`, `isLabelHidden`, `buttonContent`, `isDisabled`, `isInvalid`, `size`, `onSelect`, `fullWidth`, `matchTriggerWidth`

---

### XUIPanel — replaces styled `<div>` containers (sidebar, block editor cards)

```tsx
import XUIPanel, { XUIPanelHeader, XUIPanelHeading, XUIPanelSection } from '@xero/xui/react/panel';

<XUIPanel
  header={
    <XUIPanelHeader>
      <XUIPanelHeading headingLevel={3}>Text Block</XUIPanelHeading>
    </XUIPanelHeader>
  }
>
  <XUIPanelSection>
    {/* block editor content */}
  </XUIPanelSection>
</XUIPanel>
```

Key props: `header`, `footer`, `className`, `tagName`

---

### XUIIcon — replaces emoji icons

```tsx
import XUIIcon from '@xero/xui/react/icon';
import eyeIcon from '@xero/xui-icon/icons/eye';
import downloadIcon from '@xero/xui-icon/icons/download';
import closeIcon from '@xero/xui-icon/icons/cross';

<XUIIcon icon={eyeIcon} size="medium" />
<XUIIcon icon={downloadIcon} size="medium" />
```

Key props: `icon` (required, imported from `@xero/xui-icon`), `size`, `color`, `title` (accessible label)

---

## Rules

1. **Editor shell only** — XUI components are for the editor UI (sidebar, palette, headers, block editor forms). Never use XUI in the generated HTML email output.
2. **Don't mix** — If converting a component, convert it fully. Don't leave half-inline, half-XUI.
3. **Preserve logic** — When swapping a `<button>` for `<XUIButton>`, keep all existing `onClick`, `onMouseDown`, `ref`, and state logic intact.
4. **Cursor refs** — When replacing `<input>` with `XUITextInput`, pass `inputRef={ref}` to preserve cursor-tracking functionality used by merge field insertion.
5. **No XUI in email output** — `HtmlGeneratorService.cs` renders email HTML; XUI has no role there.
6. **Check the source** — For any component not listed here, check `/Users/paul.shriner/Documents/Github/xui/src/react/components/{name}/stories/` for real usage examples and props.
