import { IDatabase } from "src/types/dbInterface"
import PgAdapter from "./adapters/pgDB"

export const getDatabase = <T>(): IDatabase<T> => {
  const dbType = process.env.DB_TYPE

  switch (dbType) {
    case "postgres":
      return PgAdapter.getInstance<T>()
    default:
      throw new Error(`Unsupported database type: ${dbType}`)
  }
}

export const db = getDatabase<Record<string, any>>()
