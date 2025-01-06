import dotenv from "dotenv"
dotenv.config()

import { Pool, QueryResult } from "pg"
import { IDatabase } from "src/types/dbInterface"

class PgAdapter<T> implements IDatabase<T> {
  private static instance: PgAdapter<any>
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

  public static getInstance<T>(): PgAdapter<T> {
    if (!PgAdapter.instance) {
      PgAdapter.instance = new PgAdapter<T>()
    }
    return PgAdapter.instance as PgAdapter<T>
  }

  async query<R = QueryResult>(sql: string, params?: any[]): Promise<R> {
    const result = await this.pool.query(sql, params)
    return result as R
  }

  async findAll(table: string): Promise<T[]> {
    const result = await this.pool.query(`SELECT * FROM ${table}`)
    return result.rows as T[]
  }

  async findOne(table: string, criteria: Partial<T>): Promise<T | null> {
    const entries = Object.entries(criteria)
    const conditions = entries
      .map((_, i) => `${entries[i][0]} = $${i + 1}`)
      .join(" AND ")
    const values = entries.map((entry) => entry[1])

    const result = await this.pool.query(
      `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`,
      values
    )
    return result.rows[0] || null
  }

  async insert(table: string, data: Partial<T>): Promise<T> {
    const columns = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")

    const result = await this.pool.query(
      `INSERT INTO ${table} (${columns.join(
        ", "
      )}) VALUES (${placeholders}) RETURNING *`,
      values
    )
    return result.rows[0]
  }

  async update(
    table: string,
    criteria: Partial<T>,
    data: Partial<T>
  ): Promise<T> {
    const setEntries = Object.entries(data)
    const whereEntries = Object.entries(criteria)
    const setClauses = setEntries
      .map((_, i) => `${setEntries[i][0]} = $${i + 1}`)
      .join(", ")
    const whereClauses = whereEntries
      .map((_, i) => `${whereEntries[i][0]} = $${setEntries.length + i + 1}`)
      .join(" AND ")

    const values = [...Object.values(data), ...Object.values(criteria)]

    const result = await this.pool.query(
      `UPDATE ${table} SET ${setClauses} WHERE ${whereClauses} RETURNING *`,
      values
    )
    
    return result.rows[0]
  }

  async delete(table: string, criteria: Partial<T>): Promise<boolean> {
    const entries = Object.entries(criteria)
    const conditions = entries
      .map((_, i) => `${entries[i][0]} = $${i + 1}`)
      .join(" AND ")
    const values = entries.map((entry) => entry[1])

    const result = await this.pool.query(
      `DELETE FROM ${table} WHERE ${conditions}`,
      values
    )
    return (result.rowCount ?? 0) > 0
  }
}

export default PgAdapter
