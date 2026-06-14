# Spare Connect Application

## Overview

`Spare Connect` is a small authenticated Next.js order management application for automobile spare parts dealerships. It provides a simple workflow for tracking orders through three sequential status stages:

- Quotation: `PENDING` → `COMPLETED`
- Confirmation: `PENDING` → `CONFIRMED`
- Delivery: `PENDING` → `COMPLETED`

Orders are shown in an active order dashboard until delivery is completed, and completed orders move into the order history page.

## Key Features

- Username/password authentication using `next-auth` with credentials provider.
- Active order management with filtering by order stage and period.
- Order creation by order number / serial number.
- Order status advancement follows a strict sequence:
  - Quotation must complete before confirmation
  - Confirmation must complete before delivery
- Delivery-completed orders are excluded from active order results and appear in history.
- Demo mode support when `DATABASE_URL` is not configured.

## Application Flow

1. User visits `/`.
2. If authenticated, they are redirected to `/orders`.
3. If not authenticated, they are redirected to `/login`.
4. The `/login` page authenticates using the `admin` user record stored in demo memory or database.
5. After login, the user can:
   - add a new order
   - inspect active order statuses
   - advance order stages
   - browse completed orders under `/history`

## Pages and Routes

- `/login`
  - Client-side login form built with shadcn/ui components.
  - Uses `next-auth` credentials provider.

- `/orders`
  - Main active order dashboard.
  - Fetches orders from `/api/orders`.
  - Supports filters for stage and time period.
  - Displays order cards and allows order status updates.

- `/history`
  - Completed order archive.
  - Fetches orders from `/api/history`.
  - Searchable by order number.

- `/api/orders`
  - `GET`: returns active orders (delivery status not completed).
  - `POST`: creates a new order with default `PENDING` statuses.

- `/api/orders/[id]`
  - `GET`: returns a specific order by ID.
  - `PATCH`: updates status fields and enforces sequential progression.
  - `DELETE`: removes an order.

- `/api/history`
  - `GET`: returns orders whose delivery status is `COMPLETED`.

## Authentication

- Uses `next-auth` with `Credentials` provider.
- User validation is performed by `lib/data.ts` via `getUserByUsername()`.
- Passwords are bcrypt hashed.
- Session strategy: JWT.
- Custom sign-in page: `/login`.

## Data and Persistence

The app supports two storage modes:

1. Demo / in-memory mode when `DATABASE_URL` is not set.
   - Uses `lib/store.ts` and seeded demo data from `lib/seed-data.ts`.
   - Orders and users are stored in runtime memory only.

2. PostgreSQL mode when `DATABASE_URL` is provided.
   - Uses Prisma ORM with the schema defined in `prisma/schema.prisma`.
   - Models:
     - `User`: `id`, `username`, `password`, `createdAt`
     - `Order`: `id`, `orderNo`, `orderDate`, `quotationStatus`, `confirmationStatus`, `deliveryStatus`, `createdAt`, `updatedAt`

## Domain Logic

- `lib/order-flow.ts` contains the workflow rules.
- `applySequentialStatusUpdate()` enforces that:
  - Quotation must be completed before confirmation can confirm.
  - Confirmation must be confirmed before delivery can complete.
- Orders are prioritized in the dashboard by stage urgency and waiting time.

## UI and Layout

- Uses `Tailwind CSS` and shadcn/ui React components.
- The app has a protected layout under `app/(app)/layout.tsx`.
- Authenticated users see a sidebar and mobile navigation.
- Demo mode shows a top banner when `DATABASE_URL` is missing.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- next-auth
- bcryptjs
- shadcn/ui

## Important Behavior

- A new order is created with all statuses set to `PENDING`.
- Active orders are those with `deliveryStatus !== COMPLETED`.
- Completed orders are moved to history automatically by filtering on delivery status.
- The app supports full CRUD for orders through API routes.
- The app is intended for internal dealer workflow rather than customer-facing e-commerce.

## Demo Credentials

- Username: `admin`
- Password: `admin123`

## Notes

- The root page redirects users based on auth state.
- The order detail route under `app/(app)/orders/[id]/page.tsx` simply redirects back to `/orders`.
- Database operation errors are handled and returned as JSON API errors.
