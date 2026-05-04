# Brigee Braids — Full-Stack Booking Platform

Premium Afrocentric hair braiding booking platform built with Next.js 16, Supabase, and Stripe.
Gold & Black brand identity | PWA installable | AI style suggestions | AUD payments

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Payments | Stripe (Cards, EFTPOS, Apple Pay, Google Pay) |
| SMS | Twilio |
| Email | SendGrid |
| AI | OpenAI GPT-4o Vision |
| PWA | Serwist |
| Deployment | Vercel (syd1) + Supabase |

## Local Development

### 1. Prerequisites
- Node.js 20+
- Supabase CLI: `npm install -g supabase`
- Stripe CLI: https://stripe.com/docs/stripe-cli

### 2. Install dependencies
```bash
cd brigee-braids && npm install
```

### 3. Environment variables
```bash
cp .env.example .env.local
# Fill in all values
```

Required services:
- **Supabase** → supabase.com → Create project → copy URL + anon key + service role key
- **Stripe** → stripe.com → Developers → API keys
- **OpenAI** → platform.openai.com → API keys
- **Twilio** → twilio.com → Account SID + Auth Token + AU phone number
- **SendGrid** → sendgrid.com → Settings → API keys

### 4. Run Supabase migrations
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 5. Create Supabase Storage buckets
In Supabase Dashboard → Storage:
- `style-images` — **Public**
- `inspiration-photos` — **Private**

### 6. Deploy Edge Functions
```bash
supabase functions deploy send-notification
supabase functions deploy ai-suggest
```

Set secrets in Supabase Dashboard → Edge Functions → Secrets:
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL

### 7. Configure Stripe webhook (local)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy webhook secret to STRIPE_WEBHOOK_SECRET in .env.local
```

Production webhook: https://your-domain.com/api/stripe/webhook
Events: payment_intent.succeeded, payment_intent.payment_failed

### 8. Start dev server
```bash
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
```bash
npm install -g vercel
vercel
# Add all env vars in Vercel Dashboard
```
Region: syd1 (Sydney) for lowest AU latency.

## Admin Access
1. Sign up at /sign-up
2. In Supabase Dashboard → Table Editor → profiles
3. Set role to "admin" for your user row
4. Admin dashboard available at /admin/dashboard

## Loyalty Tiers
| Tier | Visits |
|---|---|
| Silver | 5 |
| Gold | 10 |
| Diamond | 20 |
Auto-updated by database trigger on appointment completion.

## PWA Installation
- iOS Safari: Share → Add to Home Screen
- Android Chrome: Install App prompt or menu
- Desktop: Address bar install icon
