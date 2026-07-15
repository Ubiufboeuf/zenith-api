import type { InArgs } from '@libsql/client'

export interface ResponseOptions {
  status: number
}

export interface DatabaseStatement {
  sql: string
  args: InArgs
}

export type DatabaseStatements = Array<DatabaseStatement>
