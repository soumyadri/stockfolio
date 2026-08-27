# Stockfolio Documentation

Welcome to the Stockfolio documentation. This folder explains the project end to end — from purpose and architecture to GraphQL operations, frontend features, accessibility, and performance.

If you read these docs in order, you will understand how the entire system works.

---

## Documentation Index

| # | Document | What you'll learn |
|---|----------|-------------------|
| 1 | [Overview](./01-overview.md) | What Stockfolio is, who it's for, core concepts |
| 2 | [Architecture](./02-architecture.md) | Monorepo layout, system design, request flow |
| 3 | [Getting Started](./03-getting-started.md) | Prerequisites, install, run, environment variables |
| 4 | [Database](./04-database.md) | Prisma models, migrations, seed data |
| 5 | [GraphQL API](./05-graphql-api.md) | Full API reference — types, queries, mutations |
| 6 | [Backend](./06-backend.md) | Express, Apollo, auth, services, resolvers |
| 7 | [Frontend](./07-frontend.md) | Next.js routes, components, client state |
| 8 | [Features](./08-features.md) | Auth, trading, wallet, watchlist, charts — step by step |
| 9 | [Accessibility](./09-accessibility.md) | A11y patterns, what's implemented, known gaps |
| 10 | [Performance](./10-performance.md) | Optimizations, polling strategy, bundle choices |
| 11 | [Development Guide](./11-development.md) | Adding models, resolvers, components, code quality |
| 12 | [Roadmap & Limitations](./12-roadmap-and-limitations.md) | What's planned, known gaps, security notes |

---

## Quick Links

| Resource | Location |
|----------|----------|
| Project README | [`../README.md`](../README.md) |
| API entry point | `apps/api/src/index.ts` |
| GraphQL schema | `apps/api/src/graphql/schema.ts` |
| Web app entry | `apps/web/app/` |
| Prisma schema | `apps/api/prisma/schema.prisma` |

---

## Suggested Reading Paths

**New to the project?**
1. Overview → Architecture → Getting Started → Features

**Backend developer?**
1. Architecture → Database → GraphQL API → Backend

**Frontend developer?**
1. Architecture → GraphQL API → Frontend → Features

**Preparing for deployment or review?**
1. Getting Started → Performance → Accessibility → Roadmap & Limitations
