import { db } from '@/config/db'
import type { Product, ProductCode, ProductsServiceProps, ProductsServiceResult } from '@/types/productsTypes'
import type { InArgs, Row } from '@libsql/client'
import { createCursor } from './cursorService'
import { ProductsRowSchema } from '@/schemas/db'
import { ProductCodeSchema } from '@/schemas/productsSchemas'

export async function getProductsService ({ cursor, limit, code, since }: ProductsServiceProps): Promise<ProductsServiceResult | Product[]> {
  if (!code) {
    const { products, nextCursor } = await getProducts({ cursor, limit, since })

    return {
      products,
      nextCursor
    }
  }

  const products = await getProductsByCode(code)

  return products
}

function getProductsStatementParams ({ cursor, limit, since }: ProductsServiceProps): [string, InArgs] {
  const lastId = cursor?.lastId ?? null
  
  if (lastId && since) {
    return [`
      SELECT * FROM products p
      INNER JOIN product_events pe ON p.id = pe.product_id
      WHERE p.id > ?
      AND pe.created_at > ?
      ORDER BY p.id ASC LIMIT ?
    `, [lastId, since, limit]]
  }

  if (since) {
    return [`
      SELECT * FROM products p
      INNER JOIN product_events pe ON p.id = pe.product_id
      WHERE pe.created_at > ?
      ORDER BY p.id ASC LIMIT ?
    `, [since, limit]]
  }

  if (lastId) {
    return [`
      SELECT * FROM products p
      WHERE p.id > ?
      ORDER BY p.id ASC LIMIT ?
    `, [lastId, limit]]
  }

  return [`
    SELECT * FROM products p
    ORDER BY p.id ASC LIMIT ?
  `, [limit]]
}

export async function getProducts ({ cursor, limit, since }: ProductsServiceProps): Promise<ProductsServiceResult> {
  const [query, args] = getProductsStatementParams({ cursor, limit: limit + 1, since })
  const productsResult = await db.execute(query, args)

  const { rows } = productsResult
  const hasMore = rows.length > limit
  const visibleRows = hasMore ? rows.slice(0, limit) : rows

  if (visibleRows.length === 0) {
    return { nextCursor: null, products: [] }
  }

  
  const ids = visibleRows.map((row) => row.id as string)
  const codes = await getCodes(ids)

  const products: Product[] = []
  for (const row of visibleRows) {
    const associatedCodes = codes.get(row.id as string) || []
    const product = formProductWithCodes(row, associatedCodes)
    if (product) {
      products.push(product)
    }
  }
  
  const nextCursor = hasMore
    ? createCursor(products.at(-1)?.id)
    : null
  
  return {
    products,
    nextCursor
  }
}

export async function getProductsByCode (code: string): Promise<Product[]> {
  const productsQuery = `
    SELECT * FROM products p
    INNER JOIN product_codes pc ON p.id = pc.product_id
    WHERE pc.code = ?
  `

  const productsResult = await db.execute(productsQuery, [code])
  const productsRows = productsResult.rows

  const products: Product[] = []
  const codes = await getCodes(productsRows.map((r) => r.id as string))

  for (const productRow of productsRows) {
    const associatedCodes = codes.get(productRow.id as string) || []
    const product = formProductWithCodes(productRow, associatedCodes)
    if (product) {
      products.push(product)
    }
  }

  return products
}

export async function getCodes (productsIds: string[]): Promise<Map<string, ProductCode[]>> {
  const codes: Map<string, ProductCode[]> = new Map()

  const placeholders = productsIds.map(() => '?').join(', ')
  const codesResult = await db.execute(
    `SELECT * FROM product_codes WHERE product_id IN (${placeholders})`,
    productsIds
  )
  const { rows } = codesResult

  for (const codeRow of rows) {
    const prodId = codeRow.product_id as string
    if (!codes.has(prodId)) codes.set(prodId, [])
    
    const code = ProductCodeSchema.safeParse(codeRow)
    if (!code.success) continue

    codes.get(prodId)?.push(code.data)
  }

  return codes
}

export async function getProductById (id: string): Promise<Product | undefined> {
  const query = 'SELECT * FROM products WHERE id = ?'
  const result = await db.execute(query, [id])
  const row = result.rows[0]

  if (!row) return
  
  const codes = await getCodes([id])
  const product = formProductWithCodes(row, codes.get(id) || [])

  return product
}

function formProductWithCodes (row: Row, rows: (Row | ProductCode)[]) {
  const productValidation = ProductsRowSchema.safeParse(row)
  if (!productValidation.success) return

  const product = productValidation.data

  const codes: ProductCode[] = []
  
  for (const code of rows) {
    const codeValidation = ProductCodeSchema.safeParse(code)
    if (!codeValidation.success || codeValidation.data.product_id !== product.id) continue

    codes.push(codeValidation.data)
  }

  return {
    ...product,
    codes
  }
}
