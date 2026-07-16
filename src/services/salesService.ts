/* eslint-disable no-useless-assignment */
import { db } from '@/config/db'
import { SaleDetailSchema, SalePaymentSchema, SaleSchema } from '@/schemas/salesSchemas'
import type { GetSalesRequestQuery, PaymentMethod, PaymentMethods, Sale, SaleDetail, SaleFull, SaleInclude, SaleIncludeOption, SalePayment, SalesExtendedQueryOptions, SalesServiceResult, SaleWithDetails, SaleWithPayments } from '@/types/salesTypes'
import { createCursor, createPagination } from './cursorService'
import type { InArgs, InStatement } from '@libsql/client'
import type { DatabaseStatements } from '@/types/connectionTypes'
import { indexArray } from '@/lib/indexArray'
import { isEveryEnabled, isSomeEnabled, toEnableAll } from '@/utils/objects'
import { PAYMENT_METHODS } from '@/lib/constants/payments'
import { SALE_INCLUDE } from '@/lib/constants/sales'
import { HttpError } from '@/errors/HttpError'

export function getSalePaymentMethod (query: GetSalesRequestQuery): PaymentMethods {
  const methods: Record<string, boolean> = {}

  for (const METHOD of PAYMENT_METHODS) {
    const m = METHOD.toLowerCase()
    methods[m] = false
  }

  if (!query.payment_method) return methods as PaymentMethods
  
  const items = query.payment_method.split(',')

  if (items.some((i) => i === 'any')) return toEnableAll(methods) as PaymentMethods

  for (const item of items) {
    if (!item || !(item in methods)) continue

    methods[item] = true
  }

  return methods as PaymentMethods
}

/**
 * @throws HTTPError
 */
export function getSalesQueryOptions (query: GetSalesRequestQuery): SalesExtendedQueryOptions {
  const pagination = createPagination(query)
  if (!pagination.success) {
    throw new HttpError(pagination.error, null, pagination.status)
  }

  const { currency, since, until } = query

  const payment_method = getSalePaymentMethod(query)
  const include = getSaleIncludeOptions(query, Object.values(payment_method).some((m) => m))

  const extendedQueryOptions: SalesExtendedQueryOptions = {
    limit: pagination.limit,
    cursor: pagination.cursor,
    include,
    payment_method,
    currency,
    since,
    until
  }
  
  return extendedQueryOptions
}

export function getSaleIncludeOptions (query: GetSalesRequestQuery, queryHasPaymentMethod: boolean): SaleInclude {
  const include = { ...SALE_INCLUDE }

  if (!query.include && !queryHasPaymentMethod) return SALE_INCLUDE

  const items = query.include?.split(',') ?? []

  if (items.some((i) => i === 'all')) {
    return toEnableAll(include) as SaleInclude
  }

  for (const item of items) {
    if (!item || !(item in SALE_INCLUDE)) continue

    include[item as SaleIncludeOption] = true
  }

  if (queryHasPaymentMethod) include.payments = true

  return include
}

export async function getSalesService (query: SalesExtendedQueryOptions): Promise<SalesServiceResult> {
  const { sales, nextCursor } = await getSales(query)

  return {
    sales,
    nextCursor
  }
}

function getSalesStatementParams (props: SalesExtendedQueryOptions): DatabaseStatements {
  const { cursor, limit, include, since, until, currency, payment_method } = props
  
  const conditions: string[] = []
  const salesArgs: InArgs = []

  const lastId = cursor?.lastId ?? null
  if (lastId) {
    conditions.push('s.id > ?')
    salesArgs.push(lastId)
  }

  if (since) {
    conditions.push('s.created_at >= ?')
    salesArgs.push(since)
  }

  if (until) {
    conditions.push('s.created_at < ?')
    salesArgs.push(until)
  }

  if (currency) {
    conditions.push('s.currency = ?')
    salesArgs.push(currency.toUpperCase())
  }

  // === NUEVO: Filtro EXISTS para métodos de pago ===
  const somePaymentMethod = isSomeEnabled(payment_method)
  const everyPaymentMethod = isEveryEnabled(payment_method)

  if (somePaymentMethod && !everyPaymentMethod) {
    const methods: string[] = []
    
    for (const METHOD of PAYMENT_METHODS) {
      const m = METHOD.toLowerCase() as PaymentMethod
      if (!payment_method[m]) continue

      methods.push('sp.payment_method = ?')
      salesArgs.push(METHOD)
    }

    if (methods.length > 0) {
      conditions.push(`EXISTS (
        SELECT 1 FROM sale_payments sp 
        WHERE sp.sale_id = s.id AND (${methods.join(' OR ')})
      )`)
    }
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const salesQuery = `
    SELECT s.* FROM sales s
    ${whereClause}
    ORDER BY s.id ASC
    LIMIT ?
  `

  salesArgs.push(limit)

  const paymentsQuery = `
    SELECT * FROM sale_payments
    WHERE sale_id IN (SELECT id FROM (${salesQuery}))
  `

  const detailsQuery = `
    SELECT * FROM sale_details
    WHERE sale_id IN (SELECT id FROM (${salesQuery}))
  `
  
  const stmts: DatabaseStatements = [{ sql: salesQuery, args: salesArgs }]

  if (include.payments) stmts.push({ sql: paymentsQuery, args: salesArgs })
  if (include.details) stmts.push({ sql: detailsQuery, args: salesArgs })

  return stmts
}

export async function getSales ({ cursor, limit, include, ...rest }: SalesExtendedQueryOptions): Promise<SalesServiceResult> {
  const stmts = getSalesStatementParams({ cursor, limit: limit + 1, include, ...rest })  
  const results = await db.batch(stmts)

  let resultIdx = 0
  const salesResult = results[resultIdx++]
  const paymentsResult = include.payments ? results[resultIdx++] : null
  const detailsResult = include.details ? results[resultIdx++] : null

  if (!salesResult?.rows) {
    return {
      sales: [],
      nextCursor: null
    }
  }

  const hasMore = salesResult.rows.length > limit
  const salesRows = hasMore ? salesResult.rows.slice(0, limit) : salesResult.rows
  
  if (salesRows.length === 0) {
    return { nextCursor: null, sales: [] }
  }

  const paymentsRows = paymentsResult?.rows ?? []
  const detailsRows = detailsResult?.rows ?? []

  const indexedPayments = indexArray(paymentsRows as unknown as SalePayment[], 'sale_id')
  const indexedDetails = indexArray(detailsRows as unknown as SaleDetail[], 'sale_id')

  const sales: Sale[] = []

  for (const row of salesRows) {
    const saleValidation = SaleSchema.safeParse(row)
    if (!saleValidation.success) continue

    const sale = saleValidation.data
    
    if (include.payments) {
      const payments = indexedPayments.get(sale.id) ?? []
      
      ;(sale as SaleWithPayments).payments = payments
    }

    if (include.details) {
      const details = indexedDetails.get(sale.id) ?? []
      
      ;(sale as SaleWithDetails).details = details
    }

    sales.push(sale)
  }

  const nextCursor = hasMore
    ? createCursor(sales.at(-1)?.id)
    : null
  
  return {
    sales,
    nextCursor
  }
}

function getSaleStatementsParams (id: string, include: SaleInclude): (InStatement | [string, (InArgs | undefined)?])[] {
  const saleQuery = `
    SELECT * FROM sales
    WHERE id = ?
  `

  const paymentsQuery = `
    SELECT * FROM sale_payments
    WHERE sale_id = ?
  `

  const detailsQuery = `
    SELECT * FROM sale_details
    WHERE sale_id = ?
  `
  
  const stmts = [{ sql: saleQuery, args: [id] }]

  if (include.payments) stmts.push({ sql: paymentsQuery, args: [id] })
  if (include.details) stmts.push({ sql: detailsQuery, args: [id] })

  return stmts
}

export async function getSaleById (id: string, include: SaleInclude): Promise<Sale | SaleWithDetails | SaleWithPayments | SaleFull | undefined> {
  const stmts = getSaleStatementsParams(id, include)

  const result = await db.batch(stmts)

  let resultIdx = 0
  const saleResult = result[resultIdx++]
  const paymentsResult = include.payments ? result[resultIdx++] : null
  const detailsResult = include.details ? result[resultIdx++] : null

  const saleValidation = SaleSchema.safeParse(saleResult?.rows[0])
  if (!saleValidation.success) return

  const sale = saleValidation.data

  const paymentsRows = paymentsResult?.rows ?? []
  const detailsRows = detailsResult?.rows ?? []

  if (paymentsRows.length) {
    const salePayments: SalePayment[] = []

    for (const paymentRow of paymentsRows) {
      const salePaymentValidation = SalePaymentSchema.safeParse(paymentRow)
      
      if (!salePaymentValidation.success) continue   

      const salePayment = salePaymentValidation.data
      salePayments.push(salePayment)
    }

    ;(sale as SaleWithPayments).payments = salePayments
  }
  
  if (detailsRows.length) {
    const saleDetails: SaleDetail[] = []

    for (const detailRow of detailsRows) {
      const saleDetailValidation = SaleDetailSchema.safeParse(detailRow)
      
      if (!saleDetailValidation.success) continue   

      const saleDetail = saleDetailValidation.data
      saleDetails.push(saleDetail)
      
      ;(sale as SaleWithDetails).details = saleDetails
    }
  }
  
  return sale
}
