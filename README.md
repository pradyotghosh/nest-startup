# Nest Startup

A reusable NestJS backend starter built with PostgreSQL, Prisma, JWT authentication, refresh-token rotation, user profiles, global API response handling, and centralized exception handling.

The goal of this project is to provide a clean foundation for starting new backend applications without rebuilding authentication, database infrastructure, guards, response handling, and common application setup every time.

> This project is currently under active development and will continue to evolve as more reusable modules are added.

---

## Features

### Authentication

- User registration
- Email/password login
- Logout / revoke session
- Argon2 password hashing
- JWT access tokens
- JWT refresh tokens
- Refresh-token rotation
- Hashed refresh tokens stored in the database
- Multiple user sessions supported
- Expired refresh-token cleanup
- JWT authentication guard
- `@CurrentUser()` decorator

### User Management

- User profile
- User details
- Role relationship
- Account status
- Soft deletion
- Current-user profile endpoints

### Media Upload

- Generic Media module
- Storage provider abstraction
- Local file storage
- Extensible storage provider abstraction for optional cloud storage adapters
- Profile images

### API Infrastructure

- Global API response interceptor
- Global exception filter
- Consistent API response format
- Pagination support
- DTO validation with `class-validator`
- Request transformation with `class-transformer`
- Swagger/OpenAPI support

### Database

- PostgreSQL
- Prisma ORM
- Shared `PrismaService`
- Prisma migrations
- Role-based user model
- User ↔ UserDetail one-to-one relationship
- User ↔ RefreshToken one-to-many relationship

---

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- Argon2
- JWT authentication
- Swagger / OpenAPI
- pnpm

---

## Project Structure

```text
src/
├── auth/
|   ├── dto/
|   ├── models/
|   ├── auth.controller.ts
|   ├── auth.module.ts
|   ├── auth.repository.ts
|   ├── auth.service.ts
|   └── token.service.ts
|
├── users/
|   ├── dto/
|   ├── models/
|   ├── users.controller.ts
|   ├── users.module.ts
|   ├── users.repository.ts
|   └── users.service.ts
|
├── common/
│   ├── decorators/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── policies/
│       ├── action.ts
│       └── policy.interface.ts
│
├── media/
│   ├── dto/
│   ├── models/
│   ├── policies/
│   │   └── media.policy.ts
│   ├── storage/
│   ├── media.controller.ts
│   ├── media.module.ts
│   ├── media.repository.ts
│   └── media.service.ts
|
├── prisma/
|   ├── prisma.module.ts
|   └── prisma.service.ts
|
├── generated/
|   └── prisma/
|
├── app.module.ts
└── main.ts

prisma/
├── schema.prisma
└── migrations/
```

---

## Architecture

The application follows a simple layered structure:

```text
HTTP Request
    |
    V
Controller
    |
    V
Service
    |
    V
Repository
    |
    V
PrismaService
    |
    V
PostgreSQL
```

Each layer has a specific responsibility.

### Controller

Handles HTTP requests and delegates application logic to services.

### Service

Contains application and business logic.

### Repository

Handles database queries and persistence.

### PrismaService

Provides a shared Prisma database client across the application.

---

## Authentication Flow

### Login

```text
Email + Password
      |
      V
Verify User
      |
      V
Verify Password
      |
      V
Generate Access Token
      +
Generate Refresh Token
      |
      V
Hash Refresh Token
      |
      V
Store Hash in PostgreSQL
      |
      V
Return Tokens
```

Example response:

```json
{
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  },
  "status": 200
}
```

### Logout Flow

```text
Refresh token
      |
      V
Verify validity and Hash Refresh Token
      |
      V
Set revokedAt to current Date
      |
      V
return true
```

Example response:

```json
{
  "data": true,
  "status": 200
}
```

---

## Refresh Token Rotation

Refresh tokens are stored as hashes rather than raw tokens.

When a refresh token is used:

```text
Refresh Token
     |
     V
Verify JWT
     |
     V
Hash Received Token
     |
     V
Find Token Hash in Database
     |
     V
Verify Session
     |
     V
Delete / Revoke Old Token
     |
     V
Generate New Token Pair
     |
     V
Store New Refresh Token Hash
```

This prevents previously used refresh tokens from being reused.

Multiple refresh-token records are supported, allowing users to remain authenticated on multiple devices.

---

## Authorization Flow

Protected resource endpoints use policy-based authorization.

```text
HTTP Request
     |
     v
JwtAuthGuard
     |
     | authenticate user
     v
PolicyGuard
     |
     | read @Policy() metadata
     | check allowed roles
     v
Resource Policy
(MediaPolicy, etc.)
     |
     | evaluate resource-specific rules
     | ownership / resource state / action rules
     v
Controller
```

@Policy() declares:

- the policy handler
- the requested action
- an optional route parameter used to identify the resource
- the roles allowed to access the route

Example:

```ts
@Policy(
  MediaPolicy,
  Action.DELETE,
  'id',
  [AuthRole.ADMIN, AuthRole.USER],
)
@UseGuards(JwtAuthGuard, PolicyGuard)
```

```text
PolicyGuard
→ metadata + roles

MediaPolicy
→ media-specific rules

```

---

## API Response Format

Successful responses are automatically wrapped by a global interceptor.

Controllers and services can simply return application data:

```ts
return user;
```

The HTTP response is automatically converted to:

```json
{
  "data": {
    "id": 1,
    "name": "Example User"
  },
  "status": 200
}
```

Paginated endpoints can return:

```json
{
  "data": [],
  "status": 200,
  "pageInfo": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

Errors are handled centrally by the global exception filter.

Example:

```json
{
  "data": null,
  "error": {
    "message": "Invalid refresh token"
  },
  "status": 401
}
```

---

## Database Models

The current base schema contains:

```text
Role
 |
 └──< User
       |
       ├── 0..1 UserDetail
       ├── * RefreshToken
       └── * Media
```

### User

Stores authentication and account-level information.

### UserDetail

Stores optional profile information separately from authentication data.

### Role

Provides user-role relationships for authorization.

### RefreshToken

Represents authenticated user sessions.

Only a SHA-256 hash of the refresh token is stored in the database.

### Media Upload

Response Media Model.

Example:

```json
{
  "data": {
    "id": 1,
    "name": "Test",
    "url": "http://localhost:3000/{folder_name}/{fileName}.{extension}",
    "storageKey": "{folderName}/{fileName}.{extension}",
    "mimeType": "image/jpg",
    "size": 3560,
    "uploadedById": 5,
    "createdAt": "2026-09-23 12:45:34.907",
    "updatedAt": "2026-09-23 12:45:34.907",
    "deletedAt": null
  },
  "error": null,
  "status": 201
}
```

---

## Environment Variables

Create a `.env` file in the project root.

To use Media upload :
Set UPLOAD_DIR as bucket or folder name
Set BASE_URL as endpoint of s3 or local server

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

JWT_ACCESS_SECRET=replace-with-a-secure-secret
JWT_REFRESH_SECRET=replace-with-a-different-secure-secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_DAYS=30

UPLOAD_DIR="./uploads"
BASE_URL="http://localhost:3000"
```

Do not commit your `.env` file.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/pradyotghosh/nest-startup.git
cd nest-startup
```

### 2. Install dependencies

```bash
pnpm install
```

If pnpm blocks required dependency build scripts:

```bash
pnpm approve-builds
```

Then run:

```bash
pnpm install
```

### 3. Configure environment variables

Create:

```text
.env
```

and add your PostgreSQL and JWT configuration.

### 4. Generate Prisma Client

```bash
pnpm prisma generate
```

### 5. Run database migrations

```bash
pnpm prisma migrate dev
```

### 6. Seed the database

Create the default application roles:

```bash
pnpm prisma db seed
```

### 7. Start the development server

Test once:

```powershell
pnpm prisma db seed
pnpm lint
pnpm build
```

---

## Default Role

Registration currently expects a default role named:

```text
USER
```

Make sure the `Role` table contains this role before registering users.

Additional roles can be added depending on the application, for example:

```text
ADMIN
USER
STAFF
```

---

## Current API Areas

The starter currently includes functionality around:

```text
/auth
├── register
├── login
├── logout
└── refresh

/users
└── me
    ├── get profile
    ├── update profile
    └── delete account

/media
├── upload
└── delete
```

Exact routes may evolve as the starter develops.

---

## Security

Current security-related features include:

- Argon2 password hashing
- Short-lived access tokens
- Separate access-token and refresh-token secrets
- Hashed refresh tokens
- Refresh-token rotation
- Database-backed refresh sessions
- Refresh-token expiration
- JWT guards
- DTO validation
- Soft-deleted user filtering
- Centralized exception handling
- Policy-based authorization
- Route-level role restrictions through `@Policy()`
- Resource-level authorization through domain policies

Secrets and credentials should always be provided through environment variables.

---

## Planned Modules

The starter is being developed incrementally.

Planned additions include:

- Improved session management
- Logout from all devices
- Database seeding
- Unit tests
- Integration tests
- E2E tests
- Docker support

---

## Starter Philosophy

This repository intentionally contains only functionality that can reasonably be reused across different applications.

For example:

```text
Reusable
├── Auth
├── Users
├── Roles
├── Refresh tokens
├── Media
├── Storage
├── Validation
├── Error handling
├── API responses
└── Database infrastructure
```

Application-specific features should remain outside the starter:

```text
Examples
├── Properties
├── Products
├── Orders
├── Bookings
└── Payments
```

The purpose is to provide infrastructure, not dictate application business logic.

---

## Status

🚧 **Work in progress**

This project is being built as a reusable foundation for future NestJS applications. APIs and internal abstractions may change while the architecture is refined.

---

## License

This project is currently provided for personal and educational use.

Add an appropriate open-source license before distributing it publicly if required.
