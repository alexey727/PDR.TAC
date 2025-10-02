# PDR.cloud Technical Assessment

This repository contains a fullstack Nx workspace with an Angular frontend, a NestJS backend, and shared validation logic implemented with Zod.

## Requirements

- Node.js 20.19+
- npm 10+

## Setup

```bash
npm install
```

## Development

Run the NestJS API:

```bash
npm run start:api
```

Run the Angular frontend (proxies `/api` to the backend):

```bash
npm run start:frontend
```

The frontend dev server watches the shared library, so backend/frontend changes hot-reload automatically.

## Features

- **Inline editing:** Update a user's email or role directly inside the table; blur or press <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to cancel.
- **Random user generator:** The `Random user` button synthesises a valid user via `@faker-js/faker` and persists it immediately.
- **Shared Zod validation:** Both apps leverage the same schemas from `libs/shared`, keeping validation rules in sync.
- **Phone masking:** User form auto-formats telephone input while still accepting `+` country prefixes.
- **Animated toasts:** A bespoke toast service displays stacked emoji notifications for create/update/delete flows.

## Workspace Layout

- `apps/frontend` – Angular 18 Material UI with user management screens and `/smiley` route
- `apps/api` – NestJS REST API persisting users to `apps/api/data/users.json`
- `libs/shared` – Shared Zod schemas, DTOs, and types consumed by both apps

## Notes

- Validation logic is centralised in `libs/shared` to keep the frontend and backend in sync.
- Initial seed data lives in `apps/api/data/users.json`; bad records are skipped during bootstrap.
