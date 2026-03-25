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

> [!note] In Progress
> This project is actively being built. See the [issue tracker](https://github.com/shrinerp/email-editor/issues) for current status.

| Issue | Title | Status |
|-------|-------|--------|
| #1 | tracking: Local Email HTML Editor | 🔵 Open |
| #2 | feat(models): define email block domain model | ✅ Merged |
| #3 | feat(generator): implement server-side HTML generator | ⚪ Pending |
| #4 | feat(api): create POST /api/generate endpoint | ⚪ Pending |
| #5 | infra(spa): scaffold React + Vite SPA | 🟡 PR Open |
| #6 | feat(ui): build block builder UI with drag-drop canvas | ⚪ Pending |
| #7 | feat(ui): implement preview and HTML download | ⚪ Pending |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# / ASP.NET Core (.NET 10) |
| Frontend | React 19 + Vite (TypeScript) |
| Drag-drop | dnd-kit |
| Rich text | Quill (vanilla) |
| Testing | xUnit |
