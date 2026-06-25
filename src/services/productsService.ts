/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/config/db'
import { ProductsRowSchema } from '@/schemas/db'
import { ProductCodeSchema } from '@/schemas/productsSchemas'
import type { Cursor } from '@/types/cursorTypes'
import type { Product, ProductCode } from '@/types/productsTypes'
import type { Row } from '@libsql/client'
import { createCursor } from './cursorService'

export async function getProductsByCursor (cursor: Cursor | null, limit: number): Promise<{ list: Product[], nextCursor: Cursor | null }> {
  const lastId = cursor?.lastId ?? null

  const result = await db.execute(
    lastId
      ? 'SELECT * FROM products WHERE id > ? ORDER BY id ASC LIMIT ?'
      : 'SELECT * FROM products ORDER BY id ASC LIMIT ?',
    lastId ? [lastId, limit + 1] : [limit + 1]
  )

  const productRows = result.rows
  const hasMore = productRows.length > limit
  const visibleRows = hasMore ? productRows.slice(0, limit) : productRows

  if (visibleRows.length === 0) {
    return { list: [], nextCursor: null }
  }

  const productIds = visibleRows.map((row) => row.id as string)

  const placeholders = productIds.map(() => '?').join(',')
  
  const codesResult = await db.execute(
    `SELECT * FROM product_codes WHERE product_id IN (${placeholders})`,
    productIds
  )
  const allCodeRows = codesResult.rows

  const codesByProductId = allCodeRows.reduce((acc, codeRow) => {
    const prodId = codeRow.product_id as string
    if (!acc[prodId]) acc[prodId] = []
    acc[prodId].push(codeRow)
    return acc
  }, {} as Record<string, any[]>)

  const list: Product[] = []
  for (const row of visibleRows) {
    const associatedCodes = codesByProductId[row.id as string] || []
    const product = formProduct(row, associatedCodes)
    if (product) {
      list.push(product)
    }
  }

  return {
    list,
    nextCursor: hasMore
      ? createCursor(list.at(-1)?.id)
      : null
  }
}

export async function getProductBy (by: 'id' | 'code', v: string): Promise<Product | undefined> {
  const productQuery = by === 'id'
    ? 'SELECT * FROM products WHERE id = ? LIMIT 1'
    : 'SELECT * FROM products WHERE id = (SELECT product_id FROM product_codes WHERE code = ? LIMIT 1) LIMIT 1'

  const codesQuery = by === 'id'
    ? 'SELECT * FROM product_codes WHERE product_id = ?'
    : 'SELECT * FROM product_codes WHERE product_id = (SELECT product_id FROM product_codes WHERE code = ? LIMIT 1)'

  const [productResult, codesResult] = await db.batch([
    { sql: productQuery, args: [v] },
    { sql: codesQuery, args: [v] }
  ])

  if (!productResult?.rows.length || !codesResult?.rows.length) return

  const productRow = productResult.rows[0]
  const codeRows = codesResult.rows

  const product = formProduct(productRow, codeRows)

  return product
}

export function formProduct (row: Row | undefined, codeRows: Row[] = []): Product | undefined {
  if (!row) return
  
  const productParsed = ProductsRowSchema.safeParse(row)
  if (!productParsed.success) return

  const codes: ProductCode[] = []
  
  for (const r of codeRows) {
    const codeParsed = ProductCodeSchema.safeParse(r)

    if (codeParsed.success) {
      codes.push(codeParsed.data)
    }
  }

  return {
    ...productParsed.data,
    codes
  }
}
