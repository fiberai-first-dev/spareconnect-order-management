# Spare Connect

Order and follow-up management for automobile spare parts dealerships. Built with Next.js 14, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.

## Workflow

1. **Order status** — Add orders by order no. / serial no. only. Each order has three toggleable states:
   - Quotation pending / completed
   - Awaiting confirmation / confirmed
   - Delivery pending / completed
2. **Order history** — Orders marked delivery completed move to history automatically.

Login: `admin` / `admin123`

## Prerequisites

- Node.js 18 or later
- npm
- Docker Desktop (recommended for PostgreSQL) **or** a native PostgreSQL installation

## Quick start (demo mode)

You can run the app without a database. Data is stored in memory and resets when the server restarts.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with:

- **Username:** `admin`
- **Password:** `admin123`

A banner at the top indicates demo mode when `DATABASE_URL` is not set.

## PostgreSQL via Docker

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Verify the container is running:

```bash
docker compose ps
```

You should see the `postgres` service with status `running` on port `5432`.

3. Copy the environment file and set your secrets:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/spareconnect"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

On Windows PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

4. Initialize the database (fresh install):

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

If upgrading from the old product/supplier schema, reset the dev database (destroys all data):

```bash
npx prisma migrate reset
npx prisma db seed
```

5. Start the app:

```bash
npm run dev
```

Sign in at [http://localhost:3000](http://localhost:3000) with `admin` / `admin123`.

## Native PostgreSQL (Windows)

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/).
2. During setup, note your username and password.
3. Open **pgAdmin** or `psql` and create a database:

```sql
CREATE DATABASE spareconnect;
```

4. Set `DATABASE_URL` in `.env` to match your credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/spareconnect"
```

5. Run migrations and seed as above.

## Stopping Docker PostgreSQL

```bash
docker compose down
```

To remove persisted data as well:

```bash
docker compose down -v
```

## Deploy to Vercel (with Supabase)

This app runs on [Vercel](https://vercel.com) and stores data in [Supabase](https://supabase.com) PostgreSQL.

### 1. Prepare the database (Supabase)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **Project Settings → Database → Connection string**.
3. Choose **Session pooler** (IPv4-compatible — required for Vercel and most home networks).
4. Copy the URI. It looks like:

```env
postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

5. URL-encode special characters in the password (e.g. `@` → `%40`).
6. From your machine, apply the schema and seed:

```bash
# Set DATABASE_URL in .env to your Supabase Session pooler URL first
npx prisma db push
npx prisma db seed
```

Login after seed: `admin` / `admin123`

> **Do not use** the direct connection (`db.xxxx.supabase.co`) on Vercel unless you have Supabase’s IPv4 add-on. Use the **Session pooler** host instead.

### 2. Push code to GitHub

**Never commit `.env`** — it contains secrets. Only commit `.env.example`.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spare-connect.git
git push -u origin main
```

If the repo already exists, push your latest changes:

```bash
git add .
git commit -m "Prepare for Vercel deploy"
git push
```

### 3. Import the project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your GitHub repository.
3. Framework preset should be **Next.js** (auto-detected).
4. Leave **Build Command** as `npm run build` and **Output Directory** as default.

### 4. Add environment variables in Vercel

In the Vercel project: **Settings → Environment Variables**. Add these for **Production**, **Preview**, and **Development**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Supabase **Session pooler** connection string (same as local `.env`) |
| `NEXTAUTH_SECRET` | A long random string (generate below) |
| `NEXTAUTH_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |

Generate `NEXTAUTH_SECRET` (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or with OpenSSL:

```bash
openssl rand -base64 32
```

5. Click **Deploy**.

### 5. After the first deploy

1. Open your live URL (e.g. `https://your-app.vercel.app`).
2. Confirm `NEXTAUTH_URL` in Vercel matches that URL exactly (including `https://`, no trailing slash).
3. If you change the URL or redeploy with a new domain, update `NEXTAUTH_URL` and redeploy.
4. Sign in with `admin` / `admin123` (from seed). Change the password in production if needed.

### 6. Schema updates after deploy

When you change `prisma/schema.prisma`, run against Supabase from your machine:

```bash
npx prisma db push
```

Or, if you use migrations:

```bash
npx prisma migrate deploy
```

Then push code to GitHub — Vercel redeploys automatically.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Prisma | Ensure `postinstall` runs `prisma generate` (already in `package.json`) |
| Can’t connect to DB | Use **Session pooler** URL, not direct `db....supabase.co` |
| Login fails on Vercel | Check `NEXTAUTH_URL` matches your live domain |
| Empty app / demo banner | `DATABASE_URL` missing or wrong in Vercel env vars |
| Password with `@` or `#` | URL-encode it in `DATABASE_URL` |

### Optional: deploy from CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts, then add the same environment variables in the Vercel dashboard.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Apply migrations in development |
| `npx prisma db seed` | Seed sample data |

## Project structure

```
app/           # Next.js App Router pages and API routes
components/    # UI components (layout, orders, products, shadcn)
lib/           # Auth, data layer, business logic
prisma/        # Schema, migrations, seed
types/         # Shared TypeScript types
```
