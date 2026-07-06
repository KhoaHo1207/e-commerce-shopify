# AGENTS.md

> Dense context for AI agents. Human-readable docs: `server/STRUCTURE.md`.

## Project

E-commerce REST API backend. Monorepo root: `e-commerce-shopify/` — **all code lives in `server/`**.

| Item | Value |
|------|-------|
| Stack | Node, Express 5, TypeScript (ESM), MongoDB/Mongoose, Zod, jose (JWT), argon2 |
| Entry | `server/src/server.ts` — dotenv, `connectDb()`, `createApp()`, listen |
| App | `server/src/app.ts` — `createApp()`: middleware, routes, `notFound`, `errorHandler` |
| API prefix | `/api/v1` (planned; not mounted yet — see `app.ts` comment) |
| Live endpoint | `GET /health` (plain text, not envelope) |
| Package mgr | pnpm (`cwd`: `server/`) |

## Architecture

```
HTTP → routes → [authenticate | validate] → controller → service → model
                                                      ↓
                                              throw AppError
                                                      ↓
                                         errorHandler → fail()
```

**Layer rules (strict):**
- `routes/` — path + HTTP method + middleware chain only
- `controllers/` — parse req, call service, `res.json(ok(...))`; no DB, no business rules
- `services/` — business logic, throw `AppError`; no `req`/`res`
- `models/` — Mongoose schemas/queries only
- `validators/` — Zod schemas
- `middlewares/` — Express cross-cutting (auth, validate, errors)
- `errors/` — `AppError` class + error codes
- `utils/` — pure helpers (JWT, password, envelope)
- `config/` — env-based config
- `types/` — shared TS types

## Directory map

```
server/src/
  app.ts, server.ts
  config/       db.ts, jwt-config.ts, password-config.ts
  routes/       index.ts + {auth,user,product,cart,order}-routes.ts
  controllers/  {auth,user,product,cart,order}-controller.ts
  services/     {auth,user,product,cart,order}-service.ts
  models/       user-model.ts ✓ | product,category,cart,order-model.ts ○
  validators/   auth-validator.ts ✓ | product,cart,order-validator.ts ○
  middlewares/  async-handler.ts ✓, error-handler.ts ✓, not-found.ts ✓
                authenticate.ts ○, validate.ts ○
  errors/       app-error.ts ✓, error-codes.ts ○
  types/        auth-type.ts ✓, api-type.ts ○
  utils/        envelope.ts ✓, jwt-util.ts ✓, password-util.ts ✓
```

`✓` = implemented · `○` = empty placeholder

## Conventions

| Topic | Rule |
|-------|------|
| Imports | `@/…` alias + **`.js` extension** (NodeNext ESM) — e.g. `@/config/db.js` |
| Files | kebab-case (`auth-controller.ts`) |
| Exports | functions camelCase (`errorHandler`, `notFound`, `asyncHandler`) |
| Classes/types | PascalCase (`AppError`, `JwtPayload`) |
| Model files | `{resource}-model.ts` |
| Route files | `{resource}-routes.ts` |
| New feature | add validator → service → controller → route → register in `routes/index.ts` |

## API response envelope

All JSON APIs use `server/src/utils/envelope.ts`:

```ts
ok(data, meta?)   // { success: true, status: "success", data }
fail(msg, code?)  // { success: false, status: "error", data: null, errors: [...] }
```

Errors: services `throw new AppError(statusCode, message)` → `error-handler.ts` catches → `fail(msg, "APP_ERROR")`. Unknown errors → 500 `"INTERNAL_SERVER_ERROR"`.

## Auth (built, unwired)

| Piece | File |
|-------|------|
| User schema | `models/user-model.ts` — name, email, password(select:false), phone, role, points, addresses |
| Register Zod | `validators/auth-validator.ts` — `registerSchema` |
| JWT sign/verify | `utils/jwt-util.ts` + `config/jwt-config.ts` |
| Password hash | `utils/password-util.ts` + `config/password-config.ts` |
| Types | `types/auth-type.ts` — `UserRole`, `JwtPayload` |

Use `authenticate.ts` for JWT middleware.

## Middleware order (`app.ts`)

```
cors → json → urlencoded → morgan → helmet → routes → notFound → errorHandler
```

`asyncHandler` wraps async controllers: `.catch(next)`.

## Env vars (`server/.env`)

`PORT` · `MONGO_URI` · `CORS_ORIGIN` (comma-separated) · `JWT_ACCESS_SECRET` · `JWT_REFRESH_SECRET`

## Scripts

```bash
cd server && pnpm dev      # tsx watch src/server.ts
cd server && pnpm build    # tsc && tsc-alias → dist/
cd server && pnpm start    # node dist/server.js
```

## Agent instructions

1. **Read before editing:** `app.ts`, `envelope.ts`, `errors/app-error.ts`, `middlewares/error-handler.ts`, existing file in same layer.
2. **Follow layer boundaries** — never put DB calls in controllers or Express types in services.
3. **Minimize diff** — match naming, import style, and patterns of neighboring files.
4. **Wire new routes:** implement in `routes/{x}-routes.ts` → export router → aggregate in `routes/index.ts` → `app.use("/api/v1", apiRoutes)` in `app.ts`.
5. **Validate all user input** via Zod in `validators/` + `validate.ts` middleware.
6. **Use `ok()`/`fail()`** for JSON responses; throw `AppError` for expected failures.
7. **Do not** commit `.env`, add unrelated deps, or create new folder patterns without reason.

## Implement next (priority)

1. `middlewares/validate.ts` + `middlewares/authenticate.ts`
2. `services/auth-service.ts` → `controllers/auth-controller.ts` → `routes/auth-routes.ts`
3. `routes/index.ts` mount + register in `app.ts`
