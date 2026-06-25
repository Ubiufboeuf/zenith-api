import type { Cursor } from '@/types/cursorTypes'

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
