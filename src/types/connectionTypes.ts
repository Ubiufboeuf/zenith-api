import type { InArgs } from '@libsql/client'

export interface ResponseOptions {
  status: number
}

export interface DatabaseStatement {
  sql: string
  args: InArgs
}

export type DatabaseStatements = Array<DatabaseStatement>

export interface SuccessInsertionResult {
  success: true
}

export interface FailureInsertionResult {
  success: false
  message: string
}

export type InsertionResult = SuccessInsertionResult | FailureInsertionResult
