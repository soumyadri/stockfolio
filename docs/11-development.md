# Development Guide

How to extend Stockfolio — adding database models, GraphQL operations, and UI features.

---

## Code Quality Commands

Run from the repository root:

```bash
pnpm lint          # ESLint all workspaces
pnpm typecheck     # TypeScript strict checks
pnpm build         # Full production build
```

Shared tooling config lives in `packages/config/`:
- `eslint.config.js` — flat ESLint config
- `prettier.config.js` — formatting rules
- `tsconfig.base.json` — base TypeScript settings

---

## Adding a Database Model

1. **Edit the schema**

   ```bash
   # apps/api/prisma/schema.prisma
   model MyModel {
     id        String   @id @default(cuid())
     userId    String
     createdAt DateTime @default(now())
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   }
   ```

2. **Create a migration**

   ```bash
   pnpm --filter api db:migrate
   # Enter a descriptive migration name when prompted
   ```

3. **Prisma Client regenerates** automatically. If types are stale:

   ```bash
   pnpm --filter api db:generate
   ```

4. **Update seed** if the model needs initial data (`prisma/seed.ts`).

---

## Adding a GraphQL Operation

### 1. Define types in schema

```typescript
// apps/api/src/graphql/schema.ts
type MyType {
  id: ID!
  name: String!
}

extend type Query {
  myItems: [MyType!]!
}

extend type Mutation {
  createMyItem(name: String!): MyType!
}
```

> Note: The schema is a single template string. Add types and fields directly in `typeDefs`.

### 2. Create a resolver

```typescript
// apps/api/src/graphql/resolvers/myFeature.ts
import type { GraphQLContext } from "../../context.js";
import { requireAuth } from "../../lib/requireAuth.js";

export const myFeatureResolvers = {
  Query: {
    myItems: async (_p, _a, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.myModel.findMany({ where: { userId } });
    },
  },
  Mutation: {
    createMyItem: async (_p, args, ctx: GraphQLContext) => {
      const userId = requireAuth(ctx);
      return ctx.prisma.myModel.create({
        data: { userId, name: args.name },
      });
    },
  },
};
```

### 3. Register in index

```typescript
// apps/api/src/graphql/resolvers/index.ts
import { myFeatureResolvers } from "./myFeature.js";

export const resolvers = {
  Query: {
    ...myFeatureResolvers.Query,
    // ...existing
  },
  Mutation: {
    ...myFeatureResolvers.Mutation,
    // ...existing
  },
};
```

### 4. Add business logic to a service (if complex)

```typescript
// apps/api/src/services/myFeatureService.ts
export async function doSomething(prisma, userId, input) {
  return prisma.$transaction(async (tx) => {
    // multi-step logic here
  });
}
```

### 5. Add client function

```typescript
// apps/web/lib/graphql/myFeature.ts
import { graphqlRequest } from "./client";
import { getStoredToken } from "../auth/token";

const MY_ITEMS_QUERY = `
  query MyItems {
    myItems { id name }
  }
`;

export async function fetchMyItems() {
  const data = await graphqlRequest<{ myItems: MyItem[] }>(
    MY_ITEMS_QUERY,
    undefined,
    getStoredToken() ?? undefined,
  );
  return data.myItems;
}
```

### 6. Use in a component

```typescript
"use client";
import { useEffect, useState } from "react";
import { fetchMyItems } from "../../lib/graphql/myFeature";

export function MyComponent() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetchMyItems().then(setItems); }, []);
  // render...
}
```

---

## Adding a Page

1. Create `apps/web/app/my-page/page.tsx`:

   ```typescript
   import { MyPageContent } from "../../components/my-feature/MyPageContent";

   export default function MyPage() {
     return <MyPageContent />;
   }
   ```

2. Create the content component in `components/my-feature/`.
3. Wrap in `AppLayout` for consistent header/footer.
4. Add navigation link in `components/layout/Header.tsx` if needed.
5. Add metadata in `page.tsx` or `lib/site/metadata.ts`.

---

## Adding a UI Component

### Shared (cross-app)

1. Create in `packages/ui/src/MyComponent.tsx`
2. Export from `packages/ui/src/index.ts`
3. Import: `import { MyComponent } from "@stockfolio/ui"`

### App-specific

1. Create in `apps/web/components/ui/MyComponent.tsx`
2. Follow existing patterns (Tailwind classes, dark theme colors)

---

## Conventions

### Naming

| Area | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `StockTradePanel.tsx` |
| Hooks | camelCase, `use` prefix | `useWalletData.ts` |
| GraphQL files | camelCase domain | `portfolio.ts` |
| API services | camelCase | `orderService.ts` |
| Database models | PascalCase | `WatchlistItem` |
| Env vars | SCREAMING_SNAKE | `JWT_SECRET` |

### File organization

- **Resolvers** are thin — no business logic
- **Services** contain domain logic
- **Components** don't call `fetch` directly — use `lib/graphql/` functions
- **Formatters** go in `lib/utils/`, not in mock folders

### TypeScript

- Strict mode enabled via shared tsconfig
- Prisma types imported from `@prisma/client` on API
- Frontend types defined alongside GraphQL client functions
- Future: GraphQL Code Generator → `packages/graphql-types`

### Styling

- Tailwind CSS utility classes
- Dark theme: black/slate backgrounds, white text
- Border color: `#2a2a2a`, `#3a3a3a`
- Cards: `rounded-xl border border-[#2a2a2a] bg-[#111111]`
- Positive: `emerald-400`, Negative: `red-400`, Primary: `blue-600`

### Error handling

- API: throw `badUserInput()` or `unauthenticated()` from `graphql/errors.ts`
- Client: `graphqlRequest` throws `Error` with GraphQL message
- UI: catch errors and show in modals or inline text

---

## Git Workflow

```bash
# Before committing
pnpm typecheck
pnpm lint

# Commit with descriptive message
git add -A
git commit -m "Add feature X"

# Push
git push origin master
```

---

## Testing (Not Yet Set Up)

Test scripts are placeholders:

```bash
pnpm test   # echoes "No tests yet" in each workspace
```

**Planned testing strategy:**

| Layer | Tool | What to test |
|-------|------|-------------|
| API services | Vitest | Order logic, price calculations, auth |
| GraphQL | Integration tests | Resolver + DB |
| Frontend | React Testing Library | Component rendering, form validation |
| E2E | Playwright | Login → place order → verify portfolio |

---

## Debugging Tips

### API

```bash
# Run API with logs
pnpm --filter api dev

# Inspect database
pnpm --filter api db:studio

# Test GraphQL in terminal
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ stocks { ticker } }"}'
```

### Frontend

- React DevTools for component state
- Network tab for GraphQL requests/responses
- Check `sessionStorage` for auth token in Application tab

### Common issues

| Problem | Fix |
|---------|-----|
| Prisma type errors | `pnpm --filter api db:generate` |
| CORS errors | Check `CORS_ORIGIN` in API `.env` |
| 401 on GraphQL | Token expired or missing — re-login |
| Stale prices | Restart API to reload stock cache |

---

## Next Steps

- [Roadmap & Limitations](./12-roadmap-and-limitations.md) — what's not built yet
- [GraphQL API](./05-graphql-api.md) — current operation reference
