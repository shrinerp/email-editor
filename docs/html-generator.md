---
title: HTML Generator
tags: [backend, generator, email, csharp]
---

# HTML Generator

> [!note] Not Yet Implemented
> Tracked in [[https://github.com/shrinerp/email-editor/issues/3|#3]]. This document describes the intended design.

## Overview

`HtmlGeneratorService` (`EmailEditor/Services/HtmlGeneratorService.cs`) is the core of the application. It takes an `EmailDocument` and returns a complete, cross-email-client HTML string.

```csharp
public class HtmlGeneratorService
{
    public string Generate(EmailDocument doc): string;
}
```

## Output Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Preview text trick -->
  <div style="display:none;max-height:0;overflow:hidden;">
    {PreviewText}&#847; &zwnj; &nbsp; ...
  </div>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0">
          <!-- Blocks rendered here -->
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Block Rendering Rules

### Cross-Client Constraints

> [!important] These rules apply to ALL block renderers
> - No `flexbox` or `grid` — use `<table>` for every layout
> - All CSS must be **inlined** — no `<style>` tags, no class names
> - No `<button>` elements — use table cells with background colors
> - Images must have explicit `width` and `height` attributes

### HeroBlock

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td>
      <img src="{ImageUrl}" width="600" style="display:block;width:100%;" alt="">
      <p style="font-size:28px;font-weight:bold;margin:16px 0;">{Headline}</p>
    </td>
  </tr>
</table>
```

### TextBlock

Quill output is post-processed to inline all CSS before embedding. Wrapped in a padded table cell.

> [!warning] Sanitization Required
> `HtmlContent` from Quill must be HTML-sanitized before rendering to prevent XSS.

### ButtonBlock

Uses a VML fallback for Outlook — `<a>` with background color for modern clients, VML rect for Outlook.

```html
<!--[if mso]>
<v:roundrect ...><v:textbox>
<![endif]-->
<a href="{Url}" style="background-color:{BackgroundColor};color:{TextColor};...">{Label}</a>
<!--[if mso]></v:textbox></v:roundrect><![endif]-->
```

### TwoColumnBlock

Two `<td>` cells, each `width="50%"`.

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="50%" valign="top">{LeftHtmlContent}</td>
    <td width="50%" valign="top">{RightHtmlContent}</td>
  </tr>
</table>
```

### DividerBlock

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding:16px 0;">
      <hr style="border:none;border-top:1px solid #e0e0e0;margin:0;">
    </td>
  </tr>
</table>
```

## Testing Strategy

Every block type is tested with xUnit. Tests assert:
- Exact HTML structure (table layout, no divs for structure)
- Inline styles present
- Edge cases: empty content, special characters, missing optional fields

See `EmailEditor.Tests/Services/HtmlGeneratorTests.cs` (created in #3).

## Related

- [[domain-model]] — input types
- [[api]] — how the generator is invoked over HTTP
