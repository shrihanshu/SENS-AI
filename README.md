# AI Career Coach

AI-powered career coach built with Next.js, Prisma, Neon, Clerk, and Groq.

## What it does
- Authenticated user onboarding with Clerk
- AI-generated insights for industries, resumes, cover letters, quizzes, and interview prep
- Resume builder with PDF export
- Scheduled industry insight refresh via Inngest

## Stack
- Next.js 15 (App Router) + React 19
- Prisma ORM + Neon Postgres
- Clerk for auth
- Groq for LLM calls (model aliasing supported)
- Inngest for scheduled jobs
- Tailwind + shadcn/ui for UI

## Prerequisites
- Node.js 18+ and npm
- A Neon Postgres database
- Clerk project (publishable + secret keys)
- Groq API key (free tier works)

## Environment variables
Create `.env` in the project root (`ai-career-coach/.env`):
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require&pgbouncer=true&connection_limit=5&pool_timeout=30

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GROQ_API_KEY=gsk_...
# Optional: global model alias; defaults to llama-3.3-70b-versatile
AI_MODEL_ALIAS=gpt-5.1-codex-max
```

## Install & run
```bash
npm install
npx prisma generate
npx prisma migrate deploy   # or `migrate dev` in local dev
npm run dev
```
App will start on the next available port (defaults to 3000).

## Common tasks
- Apply pending migrations: `npx prisma migrate deploy`
- Regenerate Prisma client: `npx prisma generate`
- Start Inngest dev (if used locally): `npx inngest-cli dev`

## Notes
- If you hit Prisma pool errors on Neon, keep `pgbouncer=true` and a small `connection_limit`.
- For PDF export, ensure the resume preview renders at least once before downloading.
