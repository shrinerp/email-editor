---
title: Email Editor
tags: [project, index]
---

# Email Editor

A locally-hosted email editor that generates cross-email-client compatible HTML. Built with ASP.NET Core (backend) and React + Vite (frontend).

## Quick Links

- [[architecture]] — System design and layer overview
- [[domain-model]] — Email block types and contracts
- [[html-generator]] — Cross-client HTML generation rules
- [[api]] — REST API reference
- [[frontend]] — React SPA structure
- [[dev-setup]] — Running the project locally

## Project Status

> [!success] Complete
> All 6 implementation issues closed and merged to `main`.

| Issue | Title | Status |
|-------|-------|--------|
| #2 | feat(models): define email block domain model | ✅ Merged |
| #3 | feat(generator): implement server-side HTML generator | ✅ Merged |
| #4 | feat(api): create POST /api/generate endpoint | ✅ Merged |
| #5 | infra(spa): scaffold React + Vite SPA | ✅ Merged |
| #6 | feat(ui): build block builder UI with drag-drop canvas | ✅ Merged |
| #7 | feat(ui): implement preview and HTML download | ✅ Merged |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# / ASP.NET Core (.NET 10) |
| Frontend | React 19 + Vite (TypeScript) |
| Drag-drop | dnd-kit |
| Rich text | Quill (vanilla JS) |
| HTML sanitization | HtmlSanitizer (Ganss.Xss) |
| Testing | xUnit (44 tests) |
