# GreenAtlas

GreenAtlas is a React + TypeScript dashboard focused on environmental and risk intelligence workflows.

It provides module-based pages for:

- Risk Analysis
- Environmental Trends
- Pollution Insights
- Agricultural Stability
- Reports

## Tech Stack

- Vite
- React 18 + TypeScript
- React Router
- TanStack Query
- Tailwind CSS + shadcn/ui primitives
- Framer Motion
- Recharts
- Vitest + Testing Library
- Playwright (configured)

## Prerequisites

- Node.js 18+ (recommended: current LTS)
- npm 9+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:8080
```

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run build:dev` - Build using development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests once
- `npm run test:watch` - Run Vitest in watch mode

## App Routes

- `/` - Home
- `/risk/*` - Risk Analysis module
- `/trends/*` - Environmental Trends module
- `/pollution/*` - Pollution Insights module
- `/agriculture/*` - Agricultural Stability module
- `/reports` - Reports module

## Project Structure

- `src/pages` - Top-level route pages
- `src/components/dashboard` - Dashboard feature components
- `src/components/layout` - Shell, side nav, top nav
- `src/components/ui` - Reusable UI primitives
- `src/context` - Shared context state
- `src/hooks` - Custom hooks

## Notes

- This repository currently contains the frontend dashboard only.
- If you want to pair it with a backend API, add environment variables and data adapters for your endpoints.
