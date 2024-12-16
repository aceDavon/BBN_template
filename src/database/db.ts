import dotenv from "dotenv"
dotenv.config()

import { Pool } from "pg"

class Database {
  private static instance: Database
  private pool: Pool

  private constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "express_app",
      password: process.env.DB_PASSWORD || "password",
      port: Number(process.env.DB_PORT) || 5432,
    })
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async query(queryText: string, params: any[] = []): Promise<any> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(queryText, params)
      return result.rows
    } finally {
      client.release()
    }
  }

  public async findAll(tableName: string): Promise<any[]> {
    return this.query(`SELECT * FROM ${tableName}`)
  }

  public async findOne(
    tableName: string,
    conditions: Record<string, any>
  ): Promise<any | null> {
    const keys = Object.keys(conditions)
    const values = Object.values(conditions)
    const queryText = `SELECT * FROM ${tableName} WHERE ${keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(" AND ")} LIMIT 1`
    const results = await this.query(queryText, values)
    return results.length > 0 ? results[0] : null
  }

  public async findOrFail(
    tableName: string,
    conditions: Record<string, any>
  ): Promise<any> {
    const record = await this.findOne(tableName, conditions)
    if (!record) throw new Error(`${tableName} record not found`)
    return record
  }

  public async buildQuery(
    tableName: string,
    filters: Record<string, any>,
    relations: Record<string, string> = {}
  ): Promise<any[]> {
    const conditions = []
    const params: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        conditions.push(`${key} = $${paramIndex++}`)
        params.push(value)
      }
    }

    // for (const [relation, joinCondition] of Object.entries(relations)) {
    // Add JOIN conditions dynamically if needed
    // }

    const queryText = `
      SELECT * FROM ${tableName}
      ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
    `
    return this.query(queryText, params)
  }
}

export default Database.getInstance()
