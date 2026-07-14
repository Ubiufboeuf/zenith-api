import { db } from '@/config/db'
import { SaleSchema } from '@/schemas/salesSchemas'
import type { Sale, SalesServiceProps, SalesServiceResult } from '@/types/salesTypes'
import { createCursor } from './cursorService'
import type { InArgs } from '@libsql/client'

export async function getSalesService ({ cursor, limit }: SalesServiceProps): Promise<SalesServiceResult> {
  const { sales, nextCursor } = await getSales({ cursor, limit })

  return {
    sales,
    nextCursor
  }
}

function getProductsStatementParams ({ cursor, limit }: SalesServiceProps): [string, InArgs] {
  const lastId = cursor?.lastId ?? null

  if (lastId) {
    return [`
      SELECT * FROM sales
      WHERE id > ?
      ORDER BY id ASC LIMIT ?
    `, [lastId, limit]]
  }

  return [`
    SELECT * FROM sales
    ORDER BY id ASC LIMIT ?
  `, [limit]]
}

export async function getSales ({ cursor, limit }: SalesServiceProps): Promise<SalesServiceResult> {
  const [query, args] = getProductsStatementParams({ cursor, limit: limit + 1 })  
  const result = await db.execute(query, args)

  const { rows } = result
  const hasMore = rows.length > limit
  const visibleRows = hasMore ? rows.slice(0, limit) : rows

  if (visibleRows.length === 0) {
    return { nextCursor: null, sales: [] }
  }
  
  const sales: Sale[] = []

  for (const row of visibleRows) {
    const saleValidation = SaleSchema.safeParse(row)
    if (!saleValidation.success) continue
    sales.push(saleValidation.data)
  }

  const nextCursor = hasMore
    ? createCursor(sales.at(-1)?.id)
    : null
  
  return {
    sales,
    nextCursor
  }
}

export async function getSaleById (id: string): Promise<Sale | undefined> {
  const query = 'SELECT * FROM sales WHERE id = ?'
  const result = await db.execute(query, [id])
  const row = result.rows[0]

  if (!row) return
  
  const saleValidation = SaleSchema.safeParse(row)

  return saleValidation.data
}
