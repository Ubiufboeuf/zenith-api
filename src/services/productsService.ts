import { db } from '@/config/db'
import type { CreateProduct, CreateProductResult, Product, ProductCode, ProductsServiceProps, ProductsServiceResult, StrictCreateProduct } from '@/types/productsTypes'
import type { InArgs, InStatement, Row } from '@libsql/client'
import { createCursor } from './cursorService'
import { ProductsRowSchema } from '@/schemas/db'
import { ProductCodeSchema } from '@/schemas/productsSchemas'
import { validateStrictProductCreation } from '@/validations/productsValidations'
import { getProductFieldIssues } from '@/errors/productErrors'
import { ZodError } from 'zod'
import { INITIAL_EVENT_VALUE, PRODUCT_EVENTS } from '@/lib/constants/products'
import { Temporal } from 'temporal-polyfill'
import { getErrorsDetails } from '@/errors'

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

export async function getProductsResolvingCodes (codes: string[]): Promise<Product[]> {
  const placeholders = codes.map(() => '?').join(', ')

  const productsQuery = `
    SELECT p.*, pc.* FROM products p
    INNER JOIN product_codes pc ON p.id = pc.product_id
    WHERE p.id IN (
      SELECT DISTINCT product_id FROM product_codes WHERE code IN (${placeholders})
    )
  `

  const productsResult = await db.execute({ sql: productsQuery, args: codes })
  const productsRows = productsResult?.rows ?? []

  const productsMap = new Map<string, { prodRow: Row, codes: ProductCode[] }>()

  for (const row of productsRows) {
    const prodId = row.product_id as string
    
    const codeValidation = ProductCodeSchema.safeParse(row)
    if (!codeValidation.success) continue
    const validCode = codeValidation.data

    if (!productsMap.has(prodId)) {
      productsMap.set(prodId, { prodRow: row, codes: [] })
    }
    
    productsMap.get(prodId)?.codes.push(validCode)
  }

  const products: Product[] = []
  for (const [, item] of productsMap) {
    const product = formProductWithCodes(item.prodRow, item.codes)
    if (product) {
      products.push(product)
    }
  }

  return products
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

export async function createProductService (createProduct: CreateProduct): Promise<CreateProductResult> {
  const strictCreateProductValidation = validateStrictProductCreation(createProduct)

  if (!strictCreateProductValidation.success) {
    const { error, userFriendlyError } = strictCreateProductValidation
    console.error(error)

    let errorMessage = 'Error desconocido'
    let status = 500
    
    if (userFriendlyError instanceof ZodError) {
      const inputFields = createProduct
      const missingFields = getProductFieldIssues({ error: userFriendlyError, inputFields })
      errorMessage = `Faltan datos para crear el producto: ${missingFields}`
      status = 400
    } else if (typeof userFriendlyError === 'string') {
      errorMessage = userFriendlyError
      status = strictCreateProductValidation.status ?? status
    }
    
    return {
      success: false,
      error: errorMessage,
      status
    }
  }

  const product = strictCreateProductValidation.data

  try {
    await createNewProduct(product)
  } catch (err) {
    console.error(err)
    const errorDetails = getErrorsDetails(err)
    
    if ('code' in errorDetails && errorDetails.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || errorDetails.message?.includes('UNIQUE')) {
      return {
        success: false,
        error: 'El producto ya existe',
        status: 409
      }
    }

    return {
      success: false,
      error: 'Error creando el producto',
      status: 500
    }
  }
  
  return {
    success: true,
    product
  }
}

async function createNewProduct (product: StrictCreateProduct): Promise<void> {
  const now = Temporal.Now.instant().toZonedDateTimeISO('UTC').toString()
  
  const productArgs: InArgs = [
    product.id,
    product.title,
    product.subtitle ?? '',
    product.provider ?? '',
    product.brand ?? '',
    product.category ?? '',
    product.cost_price,
    product.cost_currency,
    product.sale_price,
    product.sale_currency,
    product.stock ?? 0
  ]
  const eventArgs: InArgs = [
    crypto.randomUUID(),
    product.id,
    PRODUCT_EVENTS.CREATED_AT,
    INITIAL_EVENT_VALUE,
    now,
    now
  ]

  const productPlaceholders = productArgs.map(() => '?').join(', ')
  const eventPlaceholders = eventArgs.map(() => '?').join(', ')

  const stmts: InStatement[] = [
    { sql: `INSERT INTO products (id, title, subtitle, provider, brand, category, cost_price, cost_currency, sale_price, sale_currency, stock)
            VALUES (${productPlaceholders})`,
      args: productArgs },
    { sql: `INSERT INTO product_events (id, product_id, event_type, previous_value, new_value, created_at)
            VALUES (${eventPlaceholders})`,
      args: eventArgs }
  ]

  if (product.codes.length > 0) {
    const args: InArgs = []
    const placeholders: string[] = []

    for (const { code, product_id, type, is_main } of product.codes) {
      args.push(product_id, code, type, is_main ? '1' : '0')
      placeholders.push('(?, ?, ?, ?)')
    }
    
    stmts.push({
      sql: `INSERT INTO product_codes (product_id, code, type, is_main)
            VALUES ${placeholders.join(', ')}`,
      args: args
    })
  }

  await db.batch(stmts, 'write')
}
