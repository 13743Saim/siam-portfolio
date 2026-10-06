# Siam Portfolio — Next.js + Motion

A portfolio built with Next.js App Router, React, TypeScript, and Motion. The contact form sends messages through the server-side Resend API integration.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Contact email setup

1. Create a Resend account and verify a domain for sending email.
2. Copy `.env.example` to `.env.local`.
3. Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in `.env.local`. The sender address must use your verified domain; the recipient defaults to `siam.appalux@gmail.com` if omitted.
4. Restart the dev server and submit the contact form to test it.

The contact route sends submissions to `CONTACT_TO_EMAIL`. If the mail service is unavailable, the form offers a prefilled email draft to `siam.appalux@gmail.com`. Keep the Resend API key in server environment variables; never expose it in client code.

## Admin dashboard setup

The private dashboard at `/admin` stores projects and uploaded images in Supabase. Free Supabase projects include a Postgres database and Storage; image uploads are limited here to 4 MB.

1. Create a free Supabase project and run [`supabase/setup.sql`](supabase/setup.sql) in its SQL Editor.
2. In Supabase Project Settings > API Keys, create a dedicated Secret API key for the portfolio server. Keep the `sb_secret_` key server-side and never use a `NEXT_PUBLIC_` prefix.
3. Add `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to Vercel's Production Environment Variables. Set a unique admin password and a random session secret of at least 32 characters. Keep these values private.
4. Redeploy the project and open `/admin` to sign in, upload your portrait, and manage project details, images, order, and visibility.

Resend's free transactional email plan currently includes 3,000 emails/month with a 100-email daily limit. To enable automatic contact-form delivery, also set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` using a verified sender domain, and `CONTACT_TO_EMAIL=siam.appalux@gmail.com` in Vercel, then redeploy.

## Deploy to Vercel

Add the mail and admin variables described above under Vercel Project Settings > Environment Variables. Redeploy after saving them. The public portfolio works without these integrations, while `/admin` requires Supabase and admin settings.
