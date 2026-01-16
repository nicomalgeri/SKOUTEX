/**
 * Apply Database Migrations
 * This script applies pending migrations to the Supabase database
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface MigrationFile {
  filename: string;
  path: string;
  timestamp: string;
}

/**
 * Get all migration files sorted by timestamp
 */
function getMigrationFiles(): MigrationFile[] {
  const migrationsDir = join(__dirname, "../supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.map((filename) => ({
    filename,
    path: join(migrationsDir, filename),
    timestamp: filename.split("_")[0],
  }));
}

/**
 * Check if migrations table exists
 */
async function ensureMigrationsTable(): Promise<void> {
  const { error } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  });

  if (error) {
    // Try alternative method using raw SQL
    try {
      const { error: createError } = await supabase.from("schema_migrations").select("version").limit(1);

      if (createError && createError.message.includes("does not exist")) {
        console.log("⚠️  Cannot create migrations table automatically.");
        console.log("Please run this SQL in your Supabase SQL Editor:");
        console.log(`
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
        `);
        process.exit(1);
      }
    } catch (err) {
      console.error("❌ Error checking migrations table:", err);
    }
  }
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("schema_migrations")
      .select("version");

    if (error) {
      console.log("⚠️  Migrations table doesn't exist yet");
      return new Set();
    }

    return new Set(data?.map((row) => row.version) || []);
  } catch (err) {
    return new Set();
  }
}

/**
 * Apply a single migration
 */
async function applyMigration(migration: MigrationFile): Promise<boolean> {
  try {
    console.log(`\n📝 Applying: ${migration.filename}`);

    // Read migration file
    const sql = readFileSync(migration.path, "utf-8");

    // Split by semicolons to execute statements separately
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    // Execute each statement
    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      if (error) {
        console.error(`   ❌ Error executing statement:`, error.message);
        return false;
      }
    }

    // Record migration as applied
    const { error: recordError } = await supabase
      .from("schema_migrations")
      .insert({ version: migration.filename });

    if (recordError) {
      console.error(`   ❌ Error recording migration:`, recordError.message);
      return false;
    }

    console.log(`   ✅ Applied successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting database migration process...\n");

  // Ensure migrations table exists
  await ensureMigrationsTable();

  // Get all migration files
  const migrations = getMigrationFiles();
  console.log(`📁 Found ${migrations.length} migration files\n`);

  // Get applied migrations
  const appliedMigrations = await getAppliedMigrations();
  console.log(`✅ ${appliedMigrations.size} migrations already applied\n`);

  // Filter pending migrations
  const pendingMigrations = migrations.filter(
    (m) => !appliedMigrations.has(m.filename)
  );

  if (pendingMigrations.length === 0) {
    console.log("✨ All migrations are up to date!");
    return;
  }

  console.log(`📋 ${pendingMigrations.length} pending migrations:\n`);
  pendingMigrations.forEach((m) => {
    console.log(`   • ${m.filename}`);
  });
  console.log("");

  // Apply pending migrations
  let successCount = 0;
  let failureCount = 0;

  for (const migration of pendingMigrations) {
    const success = await applyMigration(migration);
    if (success) {
      successCount++;
    } else {
      failureCount++;
      console.error(`\n❌ Migration failed: ${migration.filename}`);
      console.error("Stopping migration process to prevent data corruption.\n");
      break;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📝 Total: ${pendingMigrations.length}`);
  console.log("=".repeat(60) + "\n");

  if (failureCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
