/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '@/config/db'
import { ProductEventsRowSchema, ProductsRowSchema } from '@/schemas/db'
import { ProductCodeSchema } from '@/schemas/productsSchemas'
import type { Cursor } from '@/types/cursorTypes'
import type { Product, ProductCode, ProductEvents, ProductWithEvents } from '@/types/productsTypes'
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
    const product = formProduct('code', row, associatedCodes)
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

export async function getProductById (id: string): Promise<Product | undefined> {
  const productQuery = 'SELECT * FROM products WHERE id = ? LIMIT 1'
  const codesQuery = 'SELECT * FROM product_codes WHERE product_id = ?'

  const [productResult, codesResult] = await db.batch([
    { sql: productQuery, args: [id] },
    { sql: codesQuery, args: [id] }
  ])

  if (!productResult?.rows.length || !codesResult?.rows.length) return

  const productRow = productResult.rows[0]
  const codeRows = codesResult.rows

  const product = formProduct('code', productRow, codeRows)

  return product
}

export async function getProductsByCode (code: string): Promise<Product[] | undefined> {
  const productsQuery = `
    SELECT p.* FROM products p
    INNER JOIN product_codes pc ON p.id = pc.product_id
    WHERE pc.code = ?
  `
  const codesQuery = 'SELECT * FROM product_codes WHERE product_id IN (SELECT product_id FROM product_codes WHERE code = ?)'

  const [productsResult, codesResult] = await db.batch([
    { sql: productsQuery, args: [code] },
    { sql: codesQuery, args: [code] }
  ])

  if (!productsResult?.rows.length || !codesResult?.rows.length) return

  const productsRow = productsResult.rows
  console.log(productsRow)
  const codeRows = codesResult.rows

  const products: Product[] = []

  for (const row of productsRow) {
    const product = formProduct('code', row, codeRows)
    if (!product) continue
    products.push(product)
  }

  return products
}

export async function getProductsSince (since: string): Promise<ProductWithEvents[] | undefined> {
  const productsQuery = `
    SELECT * FROM products 
    WHERE id IN (
      SELECT DISTINCT product_id 
      FROM product_events 
      WHERE created_at >= ?
    );
  `

  const eventsQuery = `
    SELECT *
    FROM product_events
    WHERE created_at >= ?
  `

  const [productsResult, eventsResult] = await db.batch([
    { sql: productsQuery, args: [since] },
    { sql: eventsQuery, args: [since] }
  ])

  if (!productsResult?.rows.length || !eventsResult?.rows.length) return []

  const productsRow = productsResult.rows
  const eventRows = eventsResult.rows

  const products: ProductWithEvents[] = []

  for (const row of productsRow) {
    const product = formProduct('event', row, eventRows)
    if (!product) continue
    products.push(product)
  }

  return products
}

export function formProduct(type: 'code', row: Row | undefined, rows?: Row[]): Product | undefined
export function formProduct(type: 'event', row: Row | undefined, rows?: Row[]): ProductWithEvents | undefined

export function formProduct (type: 'code' | 'event', row: Row | undefined, rows: Row[] = []): Product | ProductWithEvents | undefined {
  if (!row) return
  
  const productParsed = ProductsRowSchema.safeParse(row)
  if (!productParsed.success) return

  const schema = type === 'code' ? ProductCodeSchema : ProductEventsRowSchema
  const extra = []

  for (const r of rows) {
    const parsed = schema.safeParse(r)
    if (!parsed.success) continue
    if (parsed.data.product_id !== productParsed.data.id) continue

    extra.push(parsed.data)
  }

  if (type === 'code') {
    return {
      ...productParsed.data,
      codes: extra as ProductCode[]
    }
  }

  return {
    ...productParsed.data,
    events: extra as ProductEvents[]
  }
}
