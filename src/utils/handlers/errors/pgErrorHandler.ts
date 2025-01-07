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

export const formatPgError = (error: PostgresError): string => {
  if (error && typeof error === "object" && "code" in error) {
    const pgError = error as PostgresError
    if (pgError.code && pgError.code in PG_ERROR_CODES) {
      return PG_ERROR_CODES[pgError.code as keyof typeof PG_ERROR_CODES]
    }
  }
  return error instanceof Error ? error.message : String(error)
}
