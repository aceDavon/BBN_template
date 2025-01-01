import fs from "fs"
import path from "path"
import crypto from "crypto"
import db from "../src/database/db"
import { MigrationHistory } from "../src/database/migrationHistory"

interface PostgresError extends Error {
  code?: string
  severity?: string
  length?: number
  detail?: string
  hint?: string
  position?: string
  file?: string
  line?: string
  routine?: string
}

const PG_ERROR_CODES = {
  "42P07": "Relation already exists",
  "25P02": "Transaction aborted",
} as const

const formatPgError = (error: unknown): string => {
  if (error && typeof error === "object" && "code" in error) {
    const pgError = error as PostgresError
    if (pgError.code && pgError.code in PG_ERROR_CODES) {
      return PG_ERROR_CODES[pgError.code as keyof typeof PG_ERROR_CODES]
    }
  }
  return error instanceof Error ? error.message : String(error)
}

interface MigrationOptions {
  dryRun?: boolean
  batch?: number
  verbose?: boolean
  force?: boolean
}

const calculateChecksum = (content: string): string => {
  return crypto.createHash("sha256").update(content).digest("hex")
}

const runMigrations = async (
  direction: "up" | "down",
  options: MigrationOptions = {}
) => {
  const migrationHistory = new MigrationHistory()
  await migrationHistory.initialize()

  let client
  try {
    if (!options.dryRun) {
      const lockAcquired = await migrationHistory.acquireLock()
      if (!lockAcquired) {
        throw new Error("Migrations are currently being run by another process")
      }
    }
    await db.query("BEGIN")

    const migrationsDir = path.resolve(__dirname, "../src/migrations")
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".ts"))
      .sort()

    if (direction === "up") {
      const executedMigrations = await migrationHistory.getExecutedMigrations()
      const pendingMigrations = migrationFiles.filter(
        (file) => !executedMigrations.includes(file)
      )

      if (pendingMigrations.length === 0) {
        console.log("No pending migrations")
        return
      }

      const batch =
        options.batch || (await migrationHistory.getLatestBatch()) + 1

      for (const file of pendingMigrations) {
        const startTime = Date.now()
        const filePath = path.join(migrationsDir, file)
        const content = fs.readFileSync(filePath, "utf8")
        const checksum = calculateChecksum(content)

        if (!options.force) {
          if (!(await migrationHistory.validateMigration(file, checksum))) {
            throw new Error(
              `Migration ${file} has been modified after being executed`
            )
          }
        }

        const { up } = await import(filePath)

        if (options.dryRun) {
          console.log(`Would run migration: ${file}`)
          continue
        }

        try {
          console.log(`Running migration: ${file}`)
          await up(client)
          const duration = Date.now() - startTime
          await migrationHistory.recordMigration(
            file,
            batch,
            "up",
            checksum,
            duration
          )

          if (options.verbose) {
            console.log(`Migration completed in ${duration}ms`)
          }
        } catch (error) {
          const errorMessage = formatPgError(error)
          await migrationHistory.recordMigration(
            file,
            batch,
            "error",
            checksum,
            Date.now() - startTime,
            errorMessage
          )
          throw new Error(`Error in migration ${file}: ${errorMessage}`)
        }
      }
    } else {
      const batch = options.batch || (await migrationHistory.getLatestBatch())
      const migrationsToRevert = options.batch
        ? await migrationHistory.getMigrationsInBatch(batch)
        : await migrationHistory.getExecutedMigrations()

      for (const file of migrationsToRevert.reverse()) {
        const startTime = Date.now()
        const filePath = path.join(migrationsDir, file)
        const content = fs.readFileSync(filePath, "utf8")
        const checksum = calculateChecksum(content)

        const { down } = await import(filePath)

        if (options.dryRun) {
          console.log(`Would revert migration: ${file}`)
          continue
        }

        try {
          console.log(`Reverting migration: ${file}`)
          await down(client)
          const duration = Date.now() - startTime
          await migrationHistory.recordMigration(
            file,
            batch,
            "down",
            checksum,
            duration
          )

          if (options.verbose) {
            console.log(`Reversion completed in ${duration}ms`)
          }
        } catch (error) {
          const errorMessage = formatPgError(error)
          await migrationHistory.recordMigration(
            file,
            batch,
            "error",
            checksum,
            Date.now() - startTime,
            errorMessage
          )
          throw new Error(`Error reverting migration ${file}: ${errorMessage}`)
        }
      }
    }

    await db.query("COMMIT")
    console.log(
      `Migrations ${direction === "up" ? "applied" : "reverted"} successfully.`
    )
  } catch (error) {
    if (client) {
      await db.query("ROLLBACK").catch(() => {
        // Ignore rollback errors
      })
    }
    console.error(`Migration failed: ${formatPgError(error)}`)
    throw error
  } finally {
    if (!options.dryRun) {
      await migrationHistory.releaseLock()
    }
  }
}

const [, , direction, ...args] = process.argv
const options: MigrationOptions = {
  dryRun: args.includes("--dry-run"),
  verbose: args.includes("--verbose"),
  force: args.includes("--force"),
}

if (args.includes("--batch")) {
  const batchIndex = args.indexOf("--batch")
  options.batch = parseInt(args[batchIndex + 1], 10)
}

if (direction !== "up" && direction !== "down") {
  console.error('Invalid direction. Use "up" or "down".')
  process.exit(1)
}

runMigrations(direction as "up" | "down", options).catch((err) => {
  console.error("Migration error:", formatPgError(err))
  process.exit(1)
})
