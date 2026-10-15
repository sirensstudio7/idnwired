# Supabase + Vercel setup (project intake & admin)

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order: [`001_project_inquiries.sql`](../supabase/migrations/001_project_inquiries.sql), [`002_anon_insert_project_inquiries.sql`](../supabase/migrations/002_anon_insert_project_inquiries.sql) (if used), [`003_company_sector.sql`](../supabase/migrations/003_company_sector.sql), [`004_articles.sql`](../supabase/migrations/004_articles.sql), [`006_article_images_bucket.sql`](../supabase/migrations/006_article_images_bucket.sql).
3. Under **Authentication → Users**, create an admin user (email + password). Disable public sign-ups in **Authentication → Providers** if desired.

## 2. Environment variables

Copy [`.env.example`](../.env.example) to `.env` locally and fill in values from **Project Settings → API**:

| Variable | Where |
|----------|--------|
| `PUBLIC_SUPABASE_URL` | Project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (secret) |

## 3. Vercel

In the Vercel project for this repo, add the same three variables. Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive. Redeploy after saving.

The site uses `@astrojs/vercel` with `output: "server"`. Marketing pages are prerendered; `/api/*` and `/admin/*` run as serverless functions.

## 4. Smoke test

1. Open `/start`, submit a test brief (production or preview with env vars set).
2. Sign in at `/admin/login` with the admin user.
3. Confirm the row appears on `/admin`, open detail, change status to **contacted**.

## Routes

| Path | Purpose |
|------|---------|
| `/start` | Public intake form |
| `/api/inquiries` | POST submissions (service role) |
| `/admin/login` | Admin auth |
| `/admin` | Inquiry list |
| `/admin/inquiries/[id]` | Detail + status |
| `/admin/articles` | Article list |
| `/admin/articles/new` | Create article |
| `/admin/articles/[id]` | Edit article |
| `/api/admin/articles` | Create article (auth) |
| `/api/admin/media` | Upload article images (auth) |
| `/api/admin/logout` | Sign out |
