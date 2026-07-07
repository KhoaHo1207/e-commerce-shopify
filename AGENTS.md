# AGENTS.md

> Dense context for AI agents. Human-readable docs: `server/STRUCTURE.md`.

## Project

E-commerce REST API backend. Monorepo root: `e-commerce-shopify/` — **all code lives in `server/`**.

| Item | Value |
|------|-------|
| Stack | Node, Express 5, TypeScript (ESM), MongoDB/Mongoose, Zod, jose (JWT), argon2 |
| Entry | `server/src/server.ts` — `import "dotenv/config"`, `connectDb()`, `createApp()`, listen |
| App | `server/src/app.ts` — `createApp()`: middleware, routes, `notFound`, `errorHandler` |
| API prefix | `/api/v1/auth` mounted in `app.ts` (central `apiRoutes` router not yet) |
| Live endpoints | `GET /health` · `POST /api/v1/auth/register` · `POST /api/v1/auth/login` |
| Package mgr | pnpm (`cwd`: `server/`) |

## Architecture

```
HTTP → routes → [validate] → controller → service → model → mapper → dto
                                    ↓
                            throw AppError subclass
                                    ↓
                           errorHandler (custom JSON)
```

**Layer rules (strict):**
- `routes/` — path + HTTP method + middleware chain only
- `controllers/` — parse req, call service, `res.json(ok(...))`; HTTP concerns (cookies, status) OK
- `services/` — business logic, throw typed errors; no `req`/`res`
- `models/` — Mongoose schemas/queries only
- `validators/` — Zod schemas + inferred input DTOs (`RegisterDto`, etc.)
- `dto/` — response shape interfaces only
- `mappers/` — model/document → DTO transforms
- `middlewares/` — Express cross-cutting (validate, errors; `authenticate` pending)
- `errors/` — `AppError` base + subclasses (`ConflictError`, `ValidationError`, …)
- `utils/` — pure helpers (JWT, password, envelope)
- `config/` — env-based config
- `types/` — shared TS types

## Directory map

```
server/src/
  app.ts, server.ts
  config/       db.ts, jwt-config.ts, password-config.ts
  routes/       index.ts (barrel), auth-route.ts ✓
  controllers/  index.ts (barrel), auth-controller.ts ✓
  services/     index.ts (barrel), auth-service.ts ✓
  models/       index.ts (barrel), user-model.ts ✓
  validators/   index.ts (barrel), auth-validator.ts ✓
  middlewares/  async-handler.ts ✓, validate.ts ✓, error-handler.ts ✓, not-found.ts ✓
                authenticate.ts ✗
  errors/       app-error.ts ✓ + 8 subclasses ✓, index.ts (barrel)
  dto/          auth-dto.ts ✓
  mappers/      user-mapper.ts ✓
  types/        auth-type.ts ✓
  utils/        envelope.ts ✓, jwt-util.ts ✓, password-util.ts ✓
```

`✓` = implemented · `✗` = not yet created

**Not created yet:** user/product/cart/order routes, controllers, services, models, validators.

## Conventions

| Topic | Rule |
|-------|------|
| Imports | `@/…` alias + **`.js` extension** (NodeNext ESM) |
| Files | kebab-case (`auth-controller.ts`) — note: `auth-route.ts` (singular) |
| Exports | functions camelCase; barrel `index.ts` per layer |
| Classes/types | PascalCase (`AppError`, `JwtPayload`) |
| New feature | validator → service → mapper/dto → controller → route → `routes/index.ts` |

## API response envelope

Success — always `ok()` from `@/utils/envelope.js`:
```ts
ok(data, meta?)  // { success: true, status: "success", data }
```

Errors — `error-handler.ts` builds JSON manually (not `fail()` yet):
- `ValidationError` → `{ success, status, errors: [{ field, message }] }` (no `data`)
- `AppError` → `{ success, status, errors: [{ message, code }] }`
- Unknown → 500

Throw in services: `new ConflictError("...")`, `new UnauthorizedError("...")`, etc.
Base: `new AppError(message, statusCode, code)`.

## Auth (implemented)

| Piece | File |
|-------|------|
| Routes | `routes/auth-route.ts` — register, login |
| Service | `services/auth-service.ts` — hash, conflict check, JWT sign |
| Controller | `controllers/auth-controller.ts` — 201 register; login sets refresh cookie |
| User schema | `models/user-model.ts` |
| Zod | `validators/auth-validator.ts` — `registerSchema`, `loginSchema` |
| JWT | `utils/jwt-util.ts` + `config/jwt-config.ts` |
| Password | `utils/password-util.ts` + `config/password-config.ts` |
| Response map | `mappers/user-mapper.ts` → `dto/auth-dto.ts` |

Login: `accessToken` in body, `refreshToken` in httpOnly cookie.
Register: returns user only (no tokens).

**Missing:** `authenticate.ts`, refresh/logout endpoints, `cookie-parser` in `app.ts`.

## Middleware order (`app.ts`)

```
cors → json → urlencoded → morgan → helmet → /api/v1/auth → notFound → errorHandler
```

Wrap async controllers with `asyncHandler` (convention; not yet applied to auth).

`validate(schema)` — Zod safeParse; throws `ValidationError` on failure.

## Env vars (`server/.env`)

`PORT` · `MONGO_URI` · `CORS_ORIGIN` · `JWT_ACCESS_SECRET` · `JWT_REFRESH_SECRET` · `JWT_ACCESS_EXPIRES_IN` · `JWT_REFRESH_EXPIRES_IN`

Load via `import "dotenv/config"` in `server.ts` (must be first import).

## Scripts

```bash
cd server && pnpm dev      # tsx watch src/server.ts
cd server && pnpm build    # tsc && tsc-alias → dist/
cd server && pnpm start    # node dist/server.js
```

## Agent instructions

1. **Read before editing:** same-layer files + `app.ts`, `envelope.ts`, `error-handler.ts`.
2. **Follow layer boundaries** — no DB in controllers, no `req`/`res` in services.
3. **Minimize diff** — match existing patterns (barrel exports, error subclasses, mapper for responses).
4. **New routes:** `{x}-route.ts` or `{x}-routes.ts` → barrel in `routes/index.ts` → mount in `app.ts`.
5. **Validate input** via Zod + `validate()` middleware.
6. **Success responses:** `ok()`. **Errors:** throw typed `AppError` subclasses.
7. **Do not** commit `.env` or add unrelated deps.

## Known gaps (fix when touching area)

1. `error-handler` / `not-found` don't use `fail()` — envelope inconsistent on errors
2. `validate` throws instead of `next(err)`
3. `asyncHandler` not wired on controllers
4. `routes/index.ts` is barrel only — refactor to central `Router()` when adding resources
5. `phone` unique index needs `sparse: true` if optional
6. `cookie-parser` installed but not registered

## Implement next

1. `middlewares/authenticate.ts` + `cookie-parser` in `app.ts`
2. Refresh token / logout endpoints
3. Central `apiRoutes` in `routes/index.ts`
4. Product domain (model → service → controller → route)
