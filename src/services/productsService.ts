import { db } from '@/config/db'
import type { Cursor } from '@/types/cursorTypes'
import type { Product } from '@/types/productsTypes'
import { createCursor } from './cursorService'
import { isValidProduct } from '@/validations/productsValidations'

export async function getProductsByCursor (cursor: Cursor | null, limit: number): Promise<{ list: Product[], nextCursor: Cursor | null }> {
  const lastId = cursor?.lastId ?? null

  const result = await db.execute(
    lastId
      ? 'SELECT * FROM products WHERE id > ? ORDER BY id ASC LIMIT ?'
      : 'SELECT * FROM products ORDER BY id ASC LIMIT ?',
    lastId ? [lastId, limit + 1] : [limit + 1]
  )

  const rows = result.rows as unknown as Product[]

  const hasMore = rows.length > limit
  const list = hasMore ? rows.slice(0, limit) : rows

  return {
    list,
    nextCursor: hasMore
      ? createCursor(list.at(-1)?.id)
      : null
  }
}

export async function getProductById (id: string): Promise<Product | undefined> {
  const query = 'SELECT * FROM products WHERE id = ?'
  const result = await db.execute(query, [id])

  if (!result?.rows.length) {
    return
  }
  
  const product = result.rows[0]
  if (!isValidProduct(product)) return
  
  console.log(product)

  return product
}
