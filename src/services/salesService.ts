import { db } from '@/config/db'
import type { Sale } from '@/types/saleTypes'
import { createCursor } from './cursorService'
import type { Cursor } from '@/types/cursorTypes'

export async function getSalesByCursor (cursor: Cursor | null, limit: number): Promise<{ list: Sale[], nextCursor: Cursor | null }> {
  const lastId = cursor?.lastId ?? null

  const result = await db.execute(
    lastId
      ? 'SELECT * FROM sales WHERE id > ? ORDER BY id ASC LIMIT ?'
      : 'SELECT * FROM sales ORDER BY id ASC LIMIT ?',
    lastId ? [lastId, limit + 1] : [limit + 1]
  )

  const rows = result.rows as unknown as Sale[]

  const hasMore = rows.length > limit
  const list = hasMore ? rows.slice(0, limit) : rows

  return {
    list,
    nextCursor: hasMore
      ? createCursor(list.at(-1)?.id)
      : null
  }
}

export async function getSaleById (id: string): Promise<Sale | undefined> {
  const query = 'SELECT * FROM sales WHERE id = ?'
  const result = await db.execute(query, [id])

  if (!result?.rows.length) return
  
  const sale = result.rows[0] as unknown as Sale
  
  // console.log('sale:', sale)

  return sale
}
