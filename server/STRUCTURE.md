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

## Cây thư mục

```
server/
├── src/
│   ├── app.ts                  # Khởi tạo Express app (middleware, routes)
│   ├── server.ts               # Entry point — kết nối DB và start server
│   │
│   ├── config/                 # Cấu hình từ biến môi trường
│   │   ├── db.ts
│   │   ├── jwt-config.ts
│   │   └── password-config.ts
│   │
│   ├── routes/                 # Định nghĩa API endpoints
│   │   ├── index.ts            # Gom và mount tất cả routes (/api/v1)
│   │   ├── auth-routes.ts
│   │   ├── user-routes.ts
│   │   ├── product-routes.ts
│   │   ├── cart-routes.ts
│   │   └── order-routes.ts
│   │
│   ├── controllers/            # Nhận request, trả response, gọi service
│   │   ├── auth-controller.ts
│   │   ├── user-controller.ts
│   │   ├── product-controller.ts
│   │   ├── cart-controller.ts
│   │   └── order-controller.ts
│   │
│   ├── services/               # Business logic
│   │   ├── auth-service.ts
│   │   ├── user-service.ts
│   │   ├── product-service.ts
│   │   ├── cart-service.ts
│   │   └── order-service.ts
│   │
│   ├── models/                 # Mongoose schemas
│   │   ├── user-model.ts
│   │   ├── product-model.ts
│   │   ├── category-model.ts
│   │   ├── cart-model.ts
│   │   └── order-model.ts
│   │
│   ├── validators/             # Zod schemas cho từng resource
│   │   ├── auth-validator.ts
│   │   ├── product-validator.ts
│   │   ├── cart-validator.ts
│   │   └── order-validator.ts
│   │
│   ├── middlewares/            # Express middleware
│   │   ├── async-handler.ts    # Bọc async route, forward lỗi → next()
│   │   ├── authenticate.ts     # Xác thực JWT
│   │   ├── validate.ts         # Validate body/query với Zod
│   │   ├── error-handler.ts    # Global error handler
│   │   └── not-found.ts        # 404 handler
│   │
│   ├── errors/                 # Custom error classes & mã lỗi
│   │   ├── app-error.ts
│   │   └── error-codes.ts
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── auth-type.ts
│   │   └── api-type.ts
│   │
│   └── utils/                  # Helper functions dùng chung
│       ├── envelope.ts         # Format response API (ok / fail)
│       ├── jwt-util.ts
│       └── password-util.ts
│
├── dist/                       # Output sau khi build (tsc)
├── .env                        # Biến môi trường (không commit)
├── package.json
├── tsconfig.json
└── STRUCTURE.md                # File này
```

---

## Vai trò từng layer

### `app.ts` & `server.ts`

Tách riêng **cấu hình app** và **khởi động server**:

- **`app.ts`** — `createApp()`: đăng ký middleware, routes, error handling. Dễ test và tái sử dụng.
- **`server.ts`** — Load `.env`, gọi `connectDb()`, `createApp()`, `app.listen()`.

### `config/`

Chứa cấu hình đọc từ `process.env`, tách khỏi business logic.

| File | Nội dung |
|------|----------|
| `db.ts` | Kết nối MongoDB |
| `jwt-config.ts` | Secret, thời hạn access/refresh token |
| `password-config.ts` | Tuỳ chọn hash argon2 |

### `routes/` → `controllers/` → `services/` → `models/`

Luồng xử lý request theo kiến trúc phân lớp:

```
HTTP Request
    ↓
routes/          Định nghĩa path & method (GET, POST, ...)
    ↓
middlewares/     authenticate, validate, ...
    ↓
controllers/     Parse request, gọi service, trả response
    ↓
services/        Business logic (không phụ thuộc Express)
    ↓
models/          Truy vấn / lưu dữ liệu MongoDB
```

**Ví dụ** khi implement đăng ký:

```
POST /api/v1/auth/register
  → auth-routes.ts
  → validate(registerSchema)
  → auth-controller.register
  → auth-service.register
  → user-model.create
```

### `validators/`

Zod schema validate dữ liệu đầu vào. Tách riêng khỏi controller để dễ test và tái sử dụng.

### `middlewares/`

| File | Vai trò |
|------|---------|
| `async-handler.ts` | Bọc handler async, tự động `catch` → `next(err)` |
| `authenticate.ts` | Đọc JWT từ header, gắn `req.user` |
| `validate.ts` | Parse & validate body/query bằng Zod schema |
| `not-found.ts` | Trả 404 cho route không tồn tại |
| `error-handler.ts` | Bắt mọi lỗi, trả response thống nhất |

> Middleware global (cors, helmet, json, morgan) được đăng ký trực tiếp trong `app.ts`.

### `errors/`

- **`app-error.ts`** — Lỗi có kiểm soát (HTTP status + message). Service throw `AppError`, `error-handler` bắt và trả JSON.
- **`error-codes.ts`** — Mã lỗi cố định (`USER_NOT_FOUND`, `INVALID_TOKEN`, ...).

### `types/`

TypeScript interfaces/types dùng chung giữa nhiều module (không chứa logic).

### `utils/`

Helper thuần function, không phụ thuộc Express:

| File | Vai trò |
|------|---------|
| `envelope.ts` | `ok(data)` / `fail(message)` — format JSON response |
| `jwt-util.ts` | `signAccessToken`, `verifyAccessToken`, ... |
| `password-util.ts` | `hashPassword`, `verifyPassword` |

---

## Luồng xử lý request

```
Client
  │
  ▼
┌─────────────────────────────────────┐
│  app.ts                             │
│  cors → json → morgan → helmet      │
│  routes (/api/v1/...)               │
│  notFound                           │
│  errorHandler                       │
└─────────────────────────────────────┘
  │
  ▼
Response JSON
```

### Format response

Mọi API response dùng envelope thống nhất từ `utils/envelope.ts`:

**Thành công:**
```json
{
  "success": true,
  "status": "success",
  "data": { ... }
}
```

**Lỗi:**
```json
{
  "success": false,
  "status": "error",
  "data": null,
  "errors": [{ "message": "...", "code": "APP_ERROR" }]
}
```

---

## Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|------------|-------|
| File | kebab-case | `auth-controller.ts` |
| Export function | camelCase | `errorHandler`, `notFound` |
| Class | PascalCase | `AppError` |
| Type / Interface | PascalCase | `JwtPayload`, `UserRole` |
| Model file | `{resource}-model.ts` | `user-model.ts` |
| Route file | `{resource}-routes.ts` | `auth-routes.ts` |
| Import path | Alias `@/` + extension `.js` | `@/config/db.js` |

---

## Scripts

```bash
pnpm dev      # Chạy dev với hot-reload (tsx watch)
pnpm build    # Compile TypeScript → dist/
pnpm start    # Chạy production (node dist/server.js)
```

---

## Biến môi trường

| Biến | Mô tả |
|------|-------|
| `PORT` | Cổng server (mặc định `3000`) |
| `MONGO_URI` | Connection string MongoDB |
| `CORS_ORIGIN` | Danh sách origin, phân cách bằng dấu phẩy |
| `JWT_ACCESS_SECRET` | Secret ký access token |
| `JWT_REFRESH_SECRET` | Secret ký refresh token |

---

## Trạng thái hiện tại

### Đã implement

- Bootstrap: `app.ts`, `server.ts`
- Config: DB, JWT, password
- Middleware: `async-handler`, `error-handler`, `not-found`
- Model: `user-model`
- Validator: `registerSchema` (auth)
- Utils: envelope, JWT, password hashing
- Types: `JwtPayload`, `UserRole`
- Errors: `AppError`
- Endpoint: `GET /health`

### Chưa implement (file placeholder)

- Routes, controllers, services cho auth / user / product / cart / order
- Middleware: `authenticate`, `validate`
- Models: product, category, cart, order
- Validators: product, cart, order
- `errors/error-codes.ts`, `types/api-type.ts`

### Bước tiếp theo gợi ý

1. Implement `routes/index.ts` — mount `/api/v1`
2. Wire `auth-routes` → `auth-controller` → `auth-service`
3. Viết `authenticate.ts` và `validate.ts`
4. Đăng ký routes trong `app.ts`:

```ts
// app.ts
import apiRoutes from "@/routes/index.js";
app.use("/api/v1", apiRoutes);
```
