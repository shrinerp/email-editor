---
title: API Reference
tags: [api, backend, csharp]
---

# API Reference

> [!success] Implemented
> `POST /api/generate` is live. See `EmailEditor/Program.cs` and `EmailEditor/Api/EmailDocumentDto.cs`.

## Base URL

```
http://localhost:5261
```

## Endpoints

### POST /api/generate

Accepts an `EmailDocument` as JSON and returns the generated cross-email-client HTML.

**Request**

```http
POST /api/generate
Content-Type: application/json
```

```json
{
  "subject": "Welcome to our newsletter",
  "previewText": "Here's what's new this week...",
  "fromName": "Acme Corp",
  "fromAddress": "hello@acme.com",
  "blocks": [
    {
      "type": "hero",
      "imageUrl": "https://example.com/banner.jpg",
      "headline": "Big News This Week"
    },
    {
      "type":"text",
      "htmlContent": "<p>Hello <strong>world</strong></p>"
    },
    {
      "type":"button",
      "label": "Read More",
      "url": "https://example.com",
      "backgroundColor": "#1a1a1a",
      "textColor": "#ffffff"
    },
    {
      "type":"divider"
    }
  ]
}
```

**Block `type` values**

| Value | Block type |
|-------|-----------|
| `hero` | [[domain-model#HeroBlock\|HeroBlock]] |
| `text` | [[domain-model#TextBlock\|TextBlock]] |
| `button` | [[domain-model#ButtonBlock\|ButtonBlock]] |
| `image` | [[domain-model#ImageBlock\|ImageBlock]] |
| `divider` | [[domain-model#DividerBlock\|DividerBlock]] |
| `twoColumn` | [[domain-model#TwoColumnBlock\|TwoColumnBlock]] |

**Response — 200 OK**

```http
Content-Type: text/html
```

Returns a complete HTML document string ready for download or iframe rendering.

**Response — 400 Bad Request**

Returned for malformed JSON or invalid block structure.

```json
{
  "error": "Invalid block type: 'unknown'"
}
```

## Security Notes

> [!warning] Input Sanitization
> All `htmlContent` fields (TextBlock, TwoColumnBlock) are sanitized server-side before being passed to the generator. This prevents XSS in the preview iframe.

## Related

- [[html-generator]] — what runs when this endpoint is called
- [[frontend]] — how the SPA calls this endpoint
