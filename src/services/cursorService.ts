import type { Cursor } from '@/types/cursorTypes'
import { validateLimit } from '@/validations/paginationValidations'
import type { Request } from 'express'

export type PaginationRequest = Request<null, null, null, {
  limit?: string
  cursor?: string
  [key: string]: string | undefined
}>

type Pagination = {
  success: false
  error: string
  status: number
} | {
  success: true
  limit: number
  cursor: Cursor | null
}

export function createCursor (lastId?: string | null): Cursor {
  return {
    lastId: lastId ?? null
  }
}

export function cursorToB64 (cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
}

export function cursorFromB64 (cursor: string): Cursor | null {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(json)

    if (typeof parsed?.lastId !== 'string' && parsed?.lastId !== null) {
      return null
    }

    return {
      lastId: parsed.lastId ?? null
    }
  } catch {
    return null
  }
}

export function createPagination (req: PaginationRequest): Pagination {
  const limitValidation = validateLimit(req.query.limit ?? 1)
  if (!limitValidation.success) {
    return {
      success: false,
      error: 'El límite especificado es inválido',
      status: 400
    }
  }

  const { cursor: prevCursor } = req.query
  const limit = limitValidation.data

  const cursor = prevCursor
    ? cursorFromB64(prevCursor)
    : createCursor()

  return {
    success: true,
    limit,
    cursor
  }
}
