---
title: Dev Setup
tags: [setup, development]
---

# Dev Setup

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) + npm
- Git

## Clone & Install

```bash
git clone https://github.com/shrinerp/email-editor.git
cd email-editor

# Install frontend dependencies
cd EmailEditor/ClientApp
npm install
cd ../..
```

## Running Locally

You need two terminals — one for the .NET API, one for the Vite dev server.

**Terminal 1 — .NET API**
```bash
cd EmailEditor
dotnet run
# API available at http://localhost:5261
```

**Terminal 2 — React SPA**
```bash
cd EmailEditor/ClientApp
npm run dev
# SPA available at http://localhost:5173
# /api/* proxied to http://localhost:5261
```

Open `http://localhost:5173` in your browser.

> [!tip] Vite Proxy
> In development, all `/api/*` requests from the React app are automatically forwarded to the .NET backend. You don't need to configure CORS.

## Running Tests

```bash
# From repo root
dotnet test
```

## Project Structure

```
email-editor/
├── EmailEditor/               ← ASP.NET Core Web API
│   ├── Models/                ← Domain model (IEmailBlock, block types)
│   ├── Services/              ← HtmlGeneratorService (⚪ pending #3)
│   ├── ClientApp/             ← React + Vite SPA
│   ├── Program.cs             ← App host + API endpoints
│   └── EmailEditor.csproj
├── EmailEditor.Tests/         ← xUnit tests
│   ├── Models/                ← Domain model tests
│   └── Services/              ← Generator tests (⚪ pending #3)
├── EmailEditor.slnx           ← Solution file
└── docs/                      ← This documentation
```

## Branches & Workflow

- All work is tracked via GitHub issues
- Branch naming: `{issue-number}-{slug}` (e.g. `2-email-block-domain-model`)
- Every change goes through a PR targeting `main`
- TDD: write tests first

## Related

- [[architecture]] — how the pieces fit together
- [[api]] — API endpoints and request/response shapes
