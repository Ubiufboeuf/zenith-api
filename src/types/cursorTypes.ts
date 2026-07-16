import type { Request } from 'express'

export interface Cursor {
  lastId: string | null
}

export type PaginationRequest = Request<null, null, null, PaginationRequestQuery>

export type PaginationRequestQuery = {
  limit?: string
  cursor?: string
  [key: string]: string | undefined
}

export interface Pagination {
  cursor: Cursor | null
  limit: number
}

export type PaginationResult = {
  success: false
  error: string
  status: number
} | ({
  success: true
} & Pagination)
