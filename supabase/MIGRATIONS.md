# Database Migrations Guide

This directory contains all database migrations for SKOUTEX. Migrations are SQL files that modify the database schema.

## Quick Start - Apply All Migrations

We've generated a combined migrations file that includes all pending migrations in the correct order. This is the easiest way to get your database up to date.

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your SKOUTEX project (`bhcvebrhvujnslzaweat`)
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Combined Migrations

1. Click **"New query"** in the SQL Editor
2. Open the file `combined_migrations.sql` in this directory
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **"Run"** or press `Cmd/Ctrl + Enter`

The migrations are designed to be **idempotent**, meaning they can be safely run multiple times without causing errors or data loss.

### Step 3: Verify Migrations

After running the migrations, verify they were applied successfully:

```sql
SELECT * FROM schema_migrations ORDER BY applied_at DESC;
```

You should see 12 migrations recorded.

## What Gets Created

The combined migrations will create the following tables and features:

### Core Tables
- **clubs** - Club profiles and context
- **players** - Player data linked from Sportmonks
- **inbound_targets** - WhatsApp-submitted player targets
- **transfer_targets** - Structured transfer targets
- **transfer_windows** - Transfer window periods
- **notifications** - User notifications
- **notification_preferences** - Notification settings
- **watchlist** - User player watchlist
- **schema_migrations** - Migration tracking

### Features
- Row Level Security (RLS) policies for all tables
- Indexes for performance optimization
- Foreign key constraints for data integrity
- Database triggers and functions
- Audit fields (created_at, updated_at)

## Individual Migration Files

If you prefer to apply migrations one at a time, here's the order:

1. **20260115133000_create_clubs.sql** - Club profiles table
2. **20260115142000_create_inbound_targets.sql** - WhatsApp targets table
3. **20260116120000_add_inbound_resolution_fields.sql** - Add resolution tracking
4. **20260116123000_add_whatsapp_ingest_and_unique_target.sql** - WhatsApp webhook fields
5. **20260116131500_add_inbound_resolve_attempts.sql** - Resolution attempt counter
6. **20260116140000_create_players_and_link_targets.sql** - Players table
7. **20260116_add_database_constraints.sql** - Add foreign key constraints
8. **20260116_add_performance_indexes.sql** - Performance optimization indexes
9. **20260116_create_notifications.sql** - Notifications system
10. **20260116_create_transfer_targets.sql** - Transfer targets table
11. **20260116_create_transfer_windows.sql** - Transfer windows table
12. **20260117000000_add_club_logo.sql** - Add club logo field

## Troubleshooting

### Migration Already Applied

If you see errors like "relation already exists" or "duplicate key", this is normal - the migrations use `IF NOT EXISTS` and `ON CONFLICT` clauses to handle this gracefully. You can safely ignore these errors.

### Permission Errors

If you see permission errors, make sure you're using the **service role key**, not the anon key. The SQL Editor in the Supabase Dashboard automatically uses the correct credentials.

### Syntax Errors

If you encounter syntax errors:
1. Make sure you copied the entire file contents
2. Check that no characters were corrupted during copy/paste
3. Try running migrations individually

### Rolling Back

If you need to roll back migrations:

```sql
-- Drop a specific table
DROP TABLE IF EXISTS table_name CASCADE;

-- Remove from migrations tracking
DELETE FROM schema_migrations WHERE version = 'migration_filename.sql';
```

**Warning**: `CASCADE` will drop all dependent objects. Use with caution in production.

## Regenerating Combined Migrations

If you add new migration files and need to regenerate the combined file:

```bash
npx tsx scripts/generate-migration-sql.ts
```

This will create a new `combined_migrations.sql` with all migrations.

## Best Practices

1. **Always backup** your database before running migrations in production
2. **Test migrations** in a development/staging environment first
3. **Read the migration** before applying to understand what changes it makes
4. **Never edit** migration files after they've been applied - create new ones instead
5. **Keep migrations idempotent** - use `IF NOT EXISTS`, `ON CONFLICT`, etc.

## Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs/guides/database)
- Review individual migration files for detailed comments
- Contact the development team
