import { QueryResult } from "node_modules/@types/pg"
import { db } from "./db"

export interface MigrationRecord {
  id: string
  name: string
  timestamp: Date
  batch: number
  status: string
  checksum?: string
  executed_by?: string
  duration_ms?: number
  error?: string
  rolled_back_at?: Date
  rolled_back_by?: string
  created_at: Date
  updated_at: Date
}

export interface MigrationLock {
  id: number
  is_locked: boolean
  locked_at: Date | null
  locked_by: string | null
}

export interface LatestBatchResult {
  latest_batch: number
}

export interface MigrationName {
  name: string
}

export interface DetailedMigrationStatus extends MigrationRecord {
  execution_count: number
  avg_duration_ms: number | null
}

interface MigrationHistoryRow {
  checksum: string
  status: "up" | "down" | "error"
}

export class MigrationHistory {
  async initialize(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        batch INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        checksum VARCHAR(64),
        executed_by VARCHAR(255),
        duration_ms INTEGER,
        error TEXT,
        rolled_back_at TIMESTAMP,
        rolled_back_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS migration_locks (
        id INTEGER PRIMARY KEY DEFAULT 1,
        is_locked BOOLEAN DEFAULT false,
        locked_at TIMESTAMP,
        locked_by VARCHAR(255),
        CONSTRAINT single_row CHECK (id = 1)
      );

      INSERT INTO migration_locks (id, is_locked)
      SELECT 1, false
      WHERE NOT EXISTS (SELECT 1 FROM migration_locks);
    `)
  }

  async acquireLock(): Promise<boolean> {
    try {
      await db.query("BEGIN")

      const result = await db.query(
        `
        UPDATE migration_locks 
        SET is_locked = true, 
            locked_at = NOW(), 
            locked_by = $1
        WHERE id = 1 AND is_locked = false
        RETURNING *
      `,
        [process.env.DB_USER || "root"]
      )

      await db.query("COMMIT")
      if (!result.rows || result.length === 0) {
        throw new Error(
          "Failed to acquire lock: Lock is already held by another process."
        )
      }
      return result.rows.length > 0
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  }

  async releaseLock(): Promise<void> {
    await db.query(`
      UPDATE migration_locks 
      SET is_locked = false, 
          locked_at = NULL, 
          locked_by = NULL
      WHERE id = 1
    `)
  }

  async getLatestBatch(): Promise<number> {
    const result = await db.query<QueryResult<LatestBatchResult>>(`
      SELECT COALESCE(MAX(batch), 0) as latest_batch
      FROM migration_history
      WHERE status = 'up'
    `)
    return result.rows.length > 0 ? result.rows[0].latest_batch : 0
  }

  async getMigrationsInBatch(batch: number): Promise<string[]> {
    const result = await db.query<QueryResult<MigrationName>>(
      `
      SELECT name
      FROM migration_history
      WHERE batch = $1 AND status = 'up'
      ORDER BY timestamp ASC
    `,
      [batch]
    )
    return result.rows ? result.rows.map((row) => row.name) : []
  }

  async validateMigration(name: string, checksum: string): Promise<boolean> {
    const result = await db.query<MigrationHistoryRow[]>(
      `
      WITH RankedMigrations AS (
        SELECT 
          checksum,
          status,
          ROW_NUMBER() OVER (
            PARTITION BY name 
            ORDER BY timestamp DESC
          ) as rn
        FROM migration_history
        WHERE name = $1
      )
      SELECT checksum, status
      FROM RankedMigrations
      WHERE rn = 1
      `,
      [name]
    )

    if (!result || result.length === 0) {
      return true // No history found, migration can proceed
    }

    const latestRecord = result[0]

    // If the latest status is 'down' or 'error', allow the migration
    if (latestRecord.status === "down" || latestRecord.status === "error") {
      return true
    }

    // For 'up' status, validate checksum if both exist
    if (!checksum || !latestRecord.checksum) {
      return true
    }

    return latestRecord.checksum === checksum
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await db.query<QueryResult<{ name: string }>>(
      `
      WITH LatestMigrationStatus AS (
        SELECT 
          name,
          status,
          ROW_NUMBER() OVER (
            PARTITION BY name 
            ORDER BY timestamp DESC
          ) as rn
        FROM migration_history
      )
      SELECT name
      FROM LatestMigrationStatus
      WHERE rn = 1 
      AND status = 'up'
      ORDER BY name ASC
      `
    )
    
    return result.rows.map((row) => row.name)
  }

  async recordMigration(
    name: string,
    batch: number,
    status: "up" | "down" | "error",
    checksum: string,
    durationMs: number,
    error?: string
  ): Promise<void> {
    await db.query<MigrationRecord>(
      `
      INSERT INTO migration_history 
      (name, batch, status, checksum, executed_by, duration_ms, error)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        name,
        batch,
        status,
        checksum,
        process.env.USER || "system",
        durationMs,
        error,
      ]
    )
  }

  async getDetailedStatus(): Promise<DetailedMigrationStatus[]> {
    const result = await db.query<QueryResult<DetailedMigrationStatus>>(`
      WITH ranked_migrations AS (
        SELECT 
          name,
          status,
          batch,
          timestamp,
          executed_by,
          duration_ms,
          error,
          rolled_back_at,
          rolled_back_by,
          ROW_NUMBER() OVER (PARTITION BY name ORDER BY timestamp DESC) as rn
        FROM migration_history
      )
      SELECT 
        name,
        status,
        batch,
        timestamp,
        executed_by,
        duration_ms,
        error,
        rolled_back_at,
        rolled_back_by,
        (
          SELECT COUNT(*) 
          FROM migration_history mh 
          WHERE mh.name = rm.name
        ) as execution_count,
        (
          SELECT AVG(duration_ms) 
          FROM migration_history mh 
          WHERE mh.name = rm.name AND status = 'up'
        ) as avg_duration_ms
      FROM ranked_migrations rm
      WHERE rn = 1
      ORDER BY timestamp DESC
    `)
    return result.rows
  }
}
