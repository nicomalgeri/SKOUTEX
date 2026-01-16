/**
 * Generate Combined Migration SQL
 * Combines all pending migrations into a single SQL file for easy application
 */

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

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
 * Main execution
 */
function main() {
  console.log("📦 Generating combined migration SQL...\n");

  const migrations = getMigrationFiles();
  console.log(`📁 Found ${migrations.length} migration files:\n`);

  let combinedSql = `-- Combined Migrations for SKOUTEX
-- Generated: ${new Date().toISOString()}
-- Total migrations: ${migrations.length}
--
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Run the query
--
-- Note: Migrations are designed to be idempotent (safe to run multiple times)
-- ============================================================================

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

`;

  migrations.forEach((migration, index) => {
    console.log(`   ${index + 1}. ${migration.filename}`);

    const sql = readFileSync(migration.path, "utf-8");

    combinedSql += `\n-- ============================================================================
-- Migration: ${migration.filename}
-- ============================================================================\n\n`;

    combinedSql += sql;

    combinedSql += `\n\n-- Record migration as applied
INSERT INTO schema_migrations (version) VALUES ('${migration.filename}')
ON CONFLICT (version) DO NOTHING;\n`;
  });

  const outputPath = join(__dirname, "../supabase/combined_migrations.sql");
  writeFileSync(outputPath, combinedSql, "utf-8");

  console.log(`\n✅ Generated combined SQL file:`);
  console.log(`   ${outputPath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Open Supabase Dashboard > SQL Editor`);
  console.log(`   2. Create new query`);
  console.log(`   3. Copy contents of: supabase/combined_migrations.sql`);
  console.log(`   4. Run the query`);
  console.log(``);
}

main();
