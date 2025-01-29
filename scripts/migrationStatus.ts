import {
  MigrationHistory,
  MigrationLock,
} from "../src/database/migrationHistory"
import fs from "fs"
import path from "path"
import { db } from "../src/database/db"
import { QueryResult } from "node_modules/@types/pg"

async function showMigrationStatus() {
  const migrationHistory = new MigrationHistory()
  await migrationHistory.initialize()

  // Check if migrations are currently locked
  const lockStatus = await db.query<QueryResult<MigrationLock>>(
    "SELECT * FROM migration_locks WHERE id = 1"
  )
  if (lockStatus.rows[0].is_locked) {
    console.log("\n⚠️  Migrations are currently locked!")
    console.log(`Locked by: ${lockStatus.rows[0].locked_by}`)
    console.log(
      `Locked since: ${new Date(
        lockStatus.rows[0].locked_at as Date
      ).toLocaleString()}\n`
    )
  }

  const status = await migrationHistory.getDetailedStatus()
  const migrationsDir = path.resolve(__dirname, "../src/migrations")
  const allMigrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".ts"))

  // Summary statistics
  const totalMigrations = allMigrationFiles.length
  const executedMigrations = status.filter((m) => m.status === "up").length
  const failedMigrations = status.filter((m) => m.status === "error").length
  const pendingMigrations = totalMigrations - executedMigrations

  console.log("\nMigration Summary:")
  console.log("─".repeat(50))
  console.log(`Total Migrations: ${totalMigrations}`)
  console.log(`Executed: ${executedMigrations}`)
  console.log(`Pending: ${pendingMigrations}`)
  console.log(`Failed: ${failedMigrations}`)
  console.log(`Latest Batch: ${Math.max(...status.map((m) => m.batch || 0))}`)

  console.log("\nDetailed Migration Status:")
  console.log("─".repeat(100))

  const statusData = allMigrationFiles.map((file) => {
    const migration = status.find((m) => m.name === file)
    if (migration) {
      return {
        Migration: file,
        Status: migration.status,
        Batch: migration.batch || "-",
        Duration: migration.duration_ms ? `${migration.duration_ms}ms` : "-",
        "Avg Duration": migration.avg_duration_ms
          ? `${Math.round(migration.avg_duration_ms)}ms`
          : "-",
        Executions: migration.execution_count || 0,
        "Last Run By": migration.executed_by || "-",
        "Last Run At": migration.timestamp
          ? new Date(migration.timestamp).toLocaleString()
          : "-",
      }
    }
    return {
      Migration: file,
      Status: "Pending",
      Batch: "-",
      Duration: "-",
      "Avg Duration": "-",
      Executions: 0,
      "Last Run By": "-",
      "Last Run At": "-",
    }
  })

  console.table(statusData)

  // Show failed migrations if any
  const failedDetails = status.filter((m) => m.status === "error")
  if (failedDetails.length > 0) {
    console.log("\nFailed Migrations Details:")
    console.log("─".repeat(100))
    failedDetails.forEach((migration) => {
      console.log(`\nMigration: ${migration.name}`)
      console.log(
        `Failed at: ${new Date(migration.timestamp).toLocaleString()}`
      )
      console.log(`Error: ${migration.error}`)
    })
  }
}

// Add command line arguments for different views
// const [, , format] = process.argv
showMigrationStatus().catch(console.error)
