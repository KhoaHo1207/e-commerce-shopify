# Cấu trúc dự án — E-Commerce Shopify Server

Backend API cho ứng dụng thương mại điện tử, xây dựng bằng **Node.js**, **Express 5**, **TypeScript**, **MongoDB (Mongoose)**.

---

## Tech stack

| Công nghệ | Mục đích |
|-----------|----------|
| Express 5 | HTTP server / routing |
| TypeScript | Type-safe development |
| Mongoose | ODM cho MongoDB |
| Zod | Validate request body |
| jose | Ký / verify JWT |
| argon2 | Hash mật khẩu |
| tsx | Chạy TypeScript ở môi trường dev |
| helmet, cors, morgan | Bảo mật, CORS, logging |

---

## Cây thư mục (hiện tại)

```
server/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── db.ts
│   │   ├── jwt-config.ts
│   │   ├── mail.ts
│   │   └── password-config.ts
│   │
│   ├── routes/
│   │   ├── index.ts              # central /api/v1 router
│   │   └── auth-route.ts         # register/login/logout/refresh/otp
│   │
│   ├── controllers/
│   │   ├── index.ts
│   │   └── auth-controller.ts
│   │
│   ├── services/
│   │   ├── index.ts
│   │   └── auth-service.ts
│   │
│   ├── models/
│   │   ├── index.ts
│   │   └── user-model.ts
│   │
│   ├── validators/
│   │   ├── index.ts
│   │   └── auth-validator.ts
│   │
│   ├── middlewares/
│   │   ├── async-handler.ts
│   │   ├── authenticate.ts
│   │   ├── validate.ts
│   │   ├── error-handler.ts
│   │   └── not-found.ts
│   │
│   ├── templates/
│   │   └── otp-template.ts
│   │
│   ├── errors/
│   │   ├── index.ts              # barrel
│   │   ├── app-error.ts
│   │   ├── validation-error.ts
│   │   ├── bad-request-error.ts
│   │   ├── unauthorized-error.ts
│   │   ├── forbidden-error.ts
│   │   ├── not-found-error.ts
│   │   ├── conflict-error.ts
│   │   ├── too-many-requests-error.ts
│   │   └── internal-server-error.ts
│   │
│   ├── dto/
│   │   └── auth-dto.ts
│   │
│   ├── mappers/
│   │   └── user-mapper.ts
│   │
│   ├── types/
│   │   └── auth-type.ts
│   │
│   └── utils/
│       ├── envelope.ts
│       ├── jwt-util.ts
│       └── password-util.ts
│
├── dist/
├── .env
├── package.json
├── tsconfig.json
└── STRUCTURE.md
```

**Chưa tạo:** các domain product/cart/order/user, `error-codes.ts`, `api-type.ts`.

---

## Vai trò từng layer

### `app.ts` & `server.ts`

- **`server.ts`** — `import "dotenv/config"` (phải load env trước mọi import khác), connect DB, listen.
- **`app.ts`** — `createApp()`: middleware, routes, error handling.

### Luồng xử lý request

```
routes → validate(Zod) → controller → service → model
                              ↓
                         mapper → dto (response)
```

| Layer | Vai trò |
|-------|---------|
| `routes/` | Định nghĩa path, method, middleware chain |
| `validators/` | Zod schema + input DTO (`RegisterDto`, `LoginDto`) |
| `controllers/` | Gọi service, `res.json(ok(...))`, set cookie/status |
| `services/` | Business logic, throw typed errors |
| `models/` | Mongoose schema |
| `mappers/` | Transform document → response DTO |
| `dto/` | Interface shape cho response |
| `errors/` | `AppError` + subclasses theo HTTP status |
| `middlewares/` | validate, error-handler, not-found |

### Barrel `index.ts`

Mỗi layer chính có `index.ts` re-export; `routes/index.ts` hiện đóng vai trò aggregate router (`apiRoutes`).

---

## API endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/health` | Health check (plain text) |
| POST | `/api/v1/auth/register` | Đăng ký + gửi OTP xác thực email |
| POST | `/api/v1/auth/login` | Đăng nhập — set `accessToken`/`refreshToken` httpOnly cookie + trả user |
| POST | `/api/v1/auth/logout` | Đăng xuất — clear cookie + invalidate refresh token |
| POST | `/api/v1/auth/refresh-token` | Rotate access/refresh token bằng refresh cookie |
| POST | `/api/v1/auth/send-otp` | Gửi lại OTP xác thực email |
| POST | `/api/v1/auth/verify-otp` | Xác thực OTP để kích hoạt tài khoản |

Mount hiện tại: `app.use("/api/v1", apiRoutes)`; auth được mount qua `apiRoutes.use("/auth", authRoute)`.

---

## Format response

### Thành công — `ok()`

```json
{
  "success": true,
  "status": "success",
  "data": { ... }
}
```

### Lỗi — `error-handler` + envelope helpers (`fail()`, `failErrors()`)

**ValidationError (400):**
```json
{
  "success": false,
  "status": "error",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

**AppError subclass (4xx):**
```json
{
  "success": false,
  "status": "error",
  "errors": [{ "message": "Email already exists", "code": "CONFLICT" }]
}
```

### Throw errors trong service

```ts
throw new ConflictError("Email already exists");
throw new UnauthorizedError("Invalid email or password");
// Base: new AppError(message, statusCode, code)
```

---

## Middleware order

```
cors → json → urlencoded → morgan → helmet → cookieParser
  → /api/v1
  → notFound
  → errorHandler
```

---

## Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|------------|-------|
| File | kebab-case | `auth-controller.ts` |
| Route file | `auth-route.ts` (hiện tại) | Có thể đổi → `auth-routes.ts` |
| Export function | camelCase | `errorHandler`, `register` |
| Class | PascalCase | `ConflictError` |
| Import | `@/` + `.js` | `@/models/index.js` |

---

## Biến môi trường

| Biến | Mô tả |
|------|-------|
| `PORT` | Cổng server |
| `MONGO_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Origins, phân cách bằng dấu phẩy |
| `JWT_ACCESS_SECRET` | Secret access token |
| `JWT_REFRESH_SECRET` | Secret refresh token |
| `JWT_ACCESS_EXPIRES_IN` | Mặc định `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Mặc định `7d` |

---

## Scripts

```bash
pnpm dev      # tsx watch src/server.ts
pnpm build    # tsc && tsc-alias
pnpm start    # node dist/server.js
```

---

## Trạng thái hiện tại

### Đã implement

- Bootstrap, config, middleware (validate, error-handler, not-found)
- Auth vertical slice: register + login
- User model, auth validators, JWT/password utils
- Error class hierarchy (8 subclasses)
- DTO + mapper pattern
- Barrel exports per layer

### Cần chỉnh (technical debt)

| Ưu tiên | Vấn đề |
|---------|--------|
| Cao | Chưa có rate limiting toàn cục cho login/OTP endpoints |
| Cao | Auth/OTP còn lộ signal giúp account enumeration ở một số message |
| Trung bình | Cần policy migration nếu có bản ghi OTP cũ lưu plaintext |
| Trung bình | Chưa có test tự động cho auth + otp + refresh/logout |
| Thấp | Deps chưa dùng: cloudinary, multer, streamifier |

### Chưa implement

- Product, cart, order, user domains
- Tests

---

## Thêm feature mới

```
1. validators/{x}-validator.ts   — Zod schema
2. models/{x}-model.ts           — Mongoose schema
3. dto/ + mappers/               — response shape
4. services/{x}-service.ts       — business logic
5. controllers/{x}-controller.ts — HTTP handler
6. routes/{x}-route.ts           — Router + validate + controller
7. routes/index.ts               — re-export / aggregate
8. app.ts                        — mount route
```

AI agent context: xem `AGENTS.md` ở root repo.
