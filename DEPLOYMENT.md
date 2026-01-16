# SKOUTEX Production Deployment Checklist

This document provides a comprehensive checklist for deploying SKOUTEX to production.

## Current Status

✅ **Development Complete** - All major features implemented
✅ **Build Passing** - No TypeScript or build errors
✅ **Migrations Ready** - All database migrations prepared
⏳ **Database Setup** - Migrations need to be applied
⏳ **Environment Variables** - Need to be configured in production
⏳ **Cron Jobs** - Need to be configured in Vercel

## Prerequisites

- [x] Vercel account connected to GitHub repository
- [x] Supabase project created (`bhcvebrhvujnslzaweat.supabase.co`)
- [x] Sportmonks API account with credits
- [x] WhatsApp Business API credentials (optional)
- [ ] Email service provider account (SendGrid, AWS SES, or Mailgun)
- [ ] Custom domain (optional)

## Step 1: Apply Database Migrations

### Option A: Via Supabase Dashboard (Recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/bhcvebrhvujnslzaweat)
2. Navigate to **SQL Editor**
3. Click **"New query"**
4. Copy contents of `supabase/combined_migrations.sql`
5. Paste and click **"Run"**
6. Verify: `SELECT * FROM schema_migrations;` (should show 12 migrations)

### Option B: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link to project
supabase link --project-ref bhcvebrhvujnslzaweat

# Apply migrations
supabase db push
```

**Read more:** [supabase/MIGRATIONS.md](supabase/MIGRATIONS.md)

## Step 2: Configure Environment Variables

### Required Variables

Add these to your Vercel project settings:

```env
# Supabase (Already configured in .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://bhcvebrhvujnslzaweat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sportmonks API (Required for player data)
SPORTMONKS_API_KEY=your-api-key

# App URL (Required for emails and callbacks)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Cron Secret (Required for background jobs)
CRON_SECRET=generate-random-32-character-string

# OpenAI (Required for AI features)
OPENAI_API_KEY=your-openai-key

# Email SMTP (Required for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# WhatsApp (Optional - for inbound targets)
WHATSAPP_BUSINESS_ID=your-business-id
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_API_TOKEN=your-api-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
```

### How to Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your SKOUTEX project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. Select which environments (Production, Preview, Development)
6. Save and redeploy

## Step 3: Configure Cron Jobs

Cron jobs are already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/inbound/process-pending",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/check-watchlist",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/send-digest",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Cron jobs only work in production**, not in preview deployments.

### Verifying Cron Jobs

1. Go to Vercel Dashboard → Your Project → **Logs**
2. Filter by path (e.g., `/api/cron/check-watchlist`)
3. Check execution logs after scheduled time
4. Verify the `Authorization` header matches your `CRON_SECRET`

## Step 4: Email Service Setup

### SendGrid (Recommended)

1. Create account at [SendGrid](https://sendgrid.com)
2. Verify sender email address
3. Create API key with "Mail Send" permissions
4. Add to environment variables:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-api-key
   ```

### AWS SES (Alternative)

1. Set up AWS SES in your region
2. Verify domain or email
3. Create SMTP credentials
4. Add to environment variables:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-access-key-id
   SMTP_PASSWORD=your-secret-access-key
   ```

**Read more:** [src/lib/email/README.md](src/lib/email/README.md)

## Step 5: Deploy to Vercel

### Initial Deployment

If not already deployed:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Automatic Deployments

Once connected to GitHub:
- Push to `main` branch → Automatic production deployment
- Push to other branches → Preview deployments

### Manual Redeployment

After adding environment variables or changing `vercel.json`:

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click the three dots on the latest deployment
3. Click **"Redeploy"**
4. Select **"Use existing Build Cache"** (faster)

## Step 6: Verify Deployment

### 1. Test Authentication

- [ ] Sign up with new account
- [ ] Verify email confirmation works
- [ ] Log in successfully
- [ ] Check database has user record

### 2. Test Core Features

- [ ] Dashboard loads correctly
- [ ] Player search returns results (Sportmonks API)
- [ ] Can add players to watchlist
- [ ] Can create transfer targets
- [ ] Club context can be saved
- [ ] AI chat responds (OpenAI API)

### 3. Test Notifications

- [ ] Create a notification manually in database
- [ ] Verify it appears in notification badge
- [ ] Click notification to mark as read
- [ ] Test delete notification

### 4. Test Cron Jobs

- [ ] Wait for next scheduled run (or trigger manually)
- [ ] Check Vercel logs for execution
- [ ] Verify no errors in logs
- [ ] Check database for new notifications (if applicable)

### 5. Test Email Notifications

- [ ] Set up email preferences
- [ ] Create test notification
- [ ] Verify email received (if instant enabled)
- [ ] Wait for daily digest (9 AM UTC next day)
- [ ] Verify digest email received

## Step 7: Performance Optimization

### Enable Edge Runtime (Optional)

For faster response times, consider enabling Edge Runtime for API routes:

```typescript
// In API route files
export const runtime = 'edge';
```

**Note:** Edge Runtime has limitations (no Node.js APIs). Current implementation uses Node runtime for email sending.

### Enable ISR (Incremental Static Regeneration)

For public pages:

```typescript
// In page.tsx files
export const revalidate = 3600; // Revalidate every hour
```

### CDN Configuration

Vercel automatically configures CDN. Verify:
- Static assets are cached
- API routes have appropriate cache headers
- Images are optimized

## Step 8: Monitoring & Alerts

### Vercel Analytics

1. Enable in Vercel Dashboard → **Analytics**
2. Track page views, performance metrics
3. Set up custom events for key actions

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Datadog](https://datadoghq.com) for APM

### Database Monitoring

1. Go to Supabase Dashboard → **Database** → **Reports**
2. Monitor:
   - Query performance
   - Connection pooling
   - Table sizes
   - Index usage

## Step 9: Security Checklist

- [ ] All API routes have authentication checks
- [ ] RLS policies enabled on all Supabase tables
- [ ] Rate limiting configured (30 req/min)
- [ ] CORS properly configured
- [ ] Environment variables not exposed to client
- [ ] Cron endpoints protected with `CRON_SECRET`
- [ ] Service role key only used server-side
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (sanitized inputs)

## Step 10: Custom Domain (Optional)

### Add Domain to Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (automatic)

### Update Environment Variables

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Update Supabase URLs

Add production URL to Supabase:
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add site URL: `https://yourdomain.com`
3. Add redirect URLs: `https://yourdomain.com/**`

## Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

### API Routes Return 500

- Check Vercel function logs
- Verify environment variables are set
- Check Supabase connection
- Verify API keys are valid

### Cron Jobs Not Running

- Verify `vercel.json` is in root directory
- Check cron jobs only work in production
- Verify `CRON_SECRET` matches in code and requests
- Check Vercel logs for execution

### Email Not Sending

- Verify SMTP credentials
- Check email service provider dashboard for errors
- Test with simpler service (Ethereal) first
- Check logs for error messages

### Database Connection Errors

- Verify Supabase URL and keys
- Check service role key (not anon key) used for admin operations
- Verify RLS policies don't block operations
- Check connection pool limits

## Post-Deployment Tasks

### 1. Documentation

- [ ] Update README with production URL
- [ ] Document any manual setup steps
- [ ] Create user guide
- [ ] Document API endpoints

### 2. Testing

- [ ] Run end-to-end tests in production
- [ ] Test with real users
- [ ] Collect feedback
- [ ] Fix any issues

### 3. Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Monitor API usage and costs
- [ ] Track user adoption

### 4. Backup Strategy

- [ ] Enable Supabase point-in-time recovery
- [ ] Document backup restoration process
- [ ] Test backup restoration
- [ ] Set up automated backups

## Support

For issues or questions:
- Check this deployment guide
- Review individual feature documentation
- Check Vercel logs
- Check Supabase logs
- Contact development team

## Next Steps

Once deployed, consider:
- Setting up staging environment
- Implementing CI/CD testing
- Adding feature flags
- Setting up A/B testing
- Implementing analytics tracking
- Creating admin dashboard
- Adding user documentation
