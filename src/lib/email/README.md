# Email Notification System

This directory contains the email notification system for SKOUTEX, including email templates and sending functionality.

## Features

- **Daily Digest Emails**: Send daily summaries of notifications from the last 24 hours
- **Weekly Digest Emails**: Send weekly summaries of notifications from the last 7 days
- **Instant Notifications**: Send immediate email alerts for important notifications
- **Professional HTML Templates**: Responsive email templates with SKOUTEX branding
- **User Preferences**: Respect user email notification preferences

## Setup

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-app-url.com

# SMTP Configuration (for production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=your-sendgrid-username
SMTP_PASSWORD=your-sendgrid-api-key

# For development (Ethereal test email)
ETHEREAL_USER=your-ethereal-username
ETHEREAL_PASSWORD=your-ethereal-password

# Cron secret (to secure cron endpoints)
CRON_SECRET=your-random-secret-string
```

### Email Service Providers

The system supports any SMTP email service. Here are some popular options:

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key-id
SMTP_PASSWORD=your-aws-secret-access-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

#### Gmail (for testing only, not recommended for production)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
```

### Development Testing

For development, you can use [Ethereal Email](https://ethereal.email/), a fake SMTP service:

1. Visit https://ethereal.email/create
2. Copy the credentials to your `.env.local`
3. Emails will be captured and viewable at https://ethereal.email/messages

## Cron Jobs

The email digest system uses two cron jobs configured in `vercel.json`:

```json
{
  "crons": [
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

- **check-watchlist**: Runs at 8 AM UTC daily to check for player changes
- **send-digest**: Runs at 9 AM UTC daily to send email digests

## Usage

### Sending Email Digests

Email digests are sent automatically by the cron job at `/api/cron/send-digest`.

To manually trigger (for testing):

```bash
curl -X GET https://your-app-url.com/api/cron/send-digest \
  -H "Authorization: Bearer your-cron-secret"
```

### Sending Instant Notifications

Instant notifications are sent automatically when creating a notification if the user has `email_instant_enabled: true` in their preferences.

```typescript
import { createNotification } from "@/lib/notifications/generator";

// This will automatically send an email if user has instant emails enabled
await createNotification({
  user_id: "user-uuid",
  type: "watchlist_price_change",
  title: "Player price changed",
  message: "Market value increased by 10%",
  data: { player_id: 123, link: "/dashboard/players/123" },
  related_player_id: 123,
});
```

### Testing Email Sending

You can test email sending with:

```typescript
import { sendTestEmail } from "@/lib/email/sender";

await sendTestEmail("user@example.com");
```

## Email Templates

The email templates are located in `templates.ts` and include:

- **Daily Digest**: Summary of notifications from the last 24 hours
- **Weekly Digest**: Summary of notifications from the last 7 days, grouped by type
- **Instant Notification**: Single notification sent immediately

All templates include:
- SKOUTEX branding and logo
- Responsive design
- Professional styling
- Notification icons and colors
- Direct links to relevant pages
- Unsubscribe/preferences link

## User Preferences

Users can control their email notifications through their preferences:

```typescript
interface NotificationPreferences {
  email_digest_enabled: boolean;       // Master toggle for digests
  email_digest_daily: boolean;         // Enable daily digests
  email_digest_weekly: boolean;        // Enable weekly digests
  email_instant_enabled: boolean;      // Enable instant emails
  // ... notification type preferences
}
```

The system respects these preferences when sending emails.

## Monitoring

Check the cron job logs in Vercel to monitor email sending:

1. Go to your Vercel project dashboard
2. Navigate to "Logs"
3. Filter by the cron job path (`/api/cron/send-digest`)

Each run returns statistics:
```json
{
  "success": true,
  "stats": {
    "users_processed": 50,
    "daily_digests_sent": 42,
    "weekly_digests_sent": 8,
    "daily_digests_failed": 0,
    "weekly_digests_failed": 0,
    "duration_ms": 5432
  }
}
```

## Troubleshooting

### Emails not sending

1. Check SMTP credentials are correct in environment variables
2. Verify the email service allows SMTP access
3. Check Vercel logs for error messages
4. Test with a simpler service like Ethereal first

### Cron jobs not running

1. Verify `vercel.json` is in the root directory
2. Check the cron secret is set correctly
3. Ensure the project is deployed to Vercel (cron jobs only work in production)
4. Check Vercel dashboard for cron job execution logs

### Missing environment variables

If you see errors about missing env vars:
1. Add them to `.env.local` for local development
2. Add them to Vercel project settings for production
3. Redeploy after adding new environment variables
