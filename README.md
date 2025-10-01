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

## Workspace Layout

- `apps/frontend` – Angular 18 Material UI with user management screens and `/smiley` route
- `apps/api` – NestJS REST API persisting users to `apps/api/data/users.json`
- `libs/shared` – Shared Zod schemas, DTOs, and types consumed by both apps

## Notes

- Validation logic is centralised in `libs/shared` to keep the frontend and backend in sync.
- Initial seed data lives in `apps/api/data/users.json`; bad records are skipped during bootstrap.
