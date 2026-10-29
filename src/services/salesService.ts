/* eslint-disable no-useless-assignment */
import { db } from '@/config/db'
import { SaleDetailSchema, SalePaymentSchema, SaleSchema } from '@/schemas/salesSchemas'
import type { GetSalesRequestQuery, PaymentMethod, PaymentMethods, Sale, SaleDetail, SaleFull, SaleInclude, SaleIncludeOption, SalePayload, SalePayment, SalesExtendedQueryOptions, SalesServiceResult, SaleWithDetails, SaleWithPayments } from '@/types/salesTypes'
import { createCursor, createPagination } from './cursorService'
import type { InArgs, InStatement } from '@libsql/client'
import type { DatabaseStatements, InsertionResult } from '@/types/connectionTypes'
import { indexArray } from '@/lib/indexArray'
import { isEveryEnabled, isSomeEnabled, toEnableAll } from '@/utils/objects'
import { PAYMENT_METHODS } from '@/lib/constants/paymentsConstants'
import { SALE_INCLUDE } from '@/lib/constants/salesConstants'
import { HttpError } from '@/errors/HttpError'
import { Temporal } from 'temporal-polyfill'
import { SaleDetailsRowSchema } from '@/schemas/dbSchemas'

export function getSalePaymentMethod (query: GetSalesRequestQuery): PaymentMethods {
  const methods: Record<string, boolean> = {}

  for (const METHOD of PAYMENT_METHODS) {
    const m = METHOD.toLowerCase()
    methods[m] = false
  }

  if (!query.paymentMethod) return methods as PaymentMethods
  
  const items = query.paymentMethod.split(',')

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

  const paymentMethod = getSalePaymentMethod(query)
  const include = getSaleIncludeOptions(query, Object.values(paymentMethod).some((m) => m))

  const extendedQueryOptions: SalesExtendedQueryOptions = {
    limit: pagination.limit,
    cursor: pagination.cursor,
    include,
    paymentMethod,
    currency,
    since,
    until
  }
  
  return extendedQueryOptions
}

export function getSaleIncludeOptions (query: GetSalesRequestQuery, queryHasPaymentMethod: boolean): SaleInclude {
  const include = { ...SALE_INCLUDE }

  if (!query.include && !queryHasPaymentMethod) return include

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
  const { cursor, limit, include, since, until, currency, paymentMethod } = props
  
  const conditions: string[] = []
  const salesArgs: InArgs = []

  const lastId = cursor?.lastId ?? null
  if (lastId) {
    conditions.push('s.id > ?')
    salesArgs.push(lastId)
  }

  if (since) {
    conditions.push('s.createdAt >= ?')
    salesArgs.push(since)
  }

  if (until) {
    conditions.push('s.createdAt < ?')
    salesArgs.push(until)
  }

  if (currency) {
    conditions.push('s.currency = ?')
    salesArgs.push(currency.toUpperCase())
  }

  // === NUEVO: Filtro EXISTS para métodos de pago ===
  const somePaymentMethod = isSomeEnabled(paymentMethod)
  const everyPaymentMethod = isEveryEnabled(paymentMethod)

  if (somePaymentMethod && !everyPaymentMethod) {
    const methods: string[] = []
    
    for (const METHOD of PAYMENT_METHODS) {
      const m = METHOD.toLowerCase() as PaymentMethod
      if (!paymentMethod[m]) continue

      methods.push('sp.paymentMethod = ?')
      salesArgs.push(METHOD)
    }

    if (methods.length > 0) {
      conditions.push(`EXISTS (
        SELECT 1 FROM salePayments sp 
        WHERE sp.saleId = s.id AND (${methods.join(' OR ')})
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
    SELECT * FROM salePayments
    WHERE saleId IN (SELECT id FROM (${salesQuery}))
  `

  const detailsQuery = `
    SELECT * FROM saleDetails
    WHERE saleId IN (SELECT id FROM (${salesQuery}))
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

  const indexedPayments = indexArray(paymentsRows as unknown as SalePayment[], 'saleId')
  const indexedDetails = indexArray(detailsRows as unknown as SaleDetail[], 'saleId')

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
    SELECT * FROM salePayments
    WHERE saleId = ?
  `

  const detailsQuery = `
    SELECT * FROM saleDetails
    WHERE saleId = ?
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

  if (include.payments) {
    const salePayments: SalePayment[] = []

    for (const paymentRow of paymentsRows) {
      const salePaymentValidation = SalePaymentSchema.safeParse(paymentRow)
      
      if (!salePaymentValidation.success) continue   

      const salePayment = salePaymentValidation.data
      salePayments.push(salePayment)
    }

    ;(sale as SaleWithPayments).payments = salePayments
  }
  
  if (include.details) {
    const saleDetails: SaleDetail[] = []

    for (const detailRow of detailsRows) {
      const saleDetailRowValidation = SaleDetailsRowSchema.safeParse(detailRow)
      
      if (!saleDetailRowValidation.success) continue

      console.log({ saleDetailRowValidation })

      const snapshot = JSON.parse(saleDetailRowValidation.data.snapshot) ?? {}
      const saleDetailValidation = SaleDetailSchema.safeParse({ ...saleDetailRowValidation.data, snapshot })

      console.log({ saleDetailValidation })

      if (!saleDetailValidation.success) continue
      
      const saleDetail = saleDetailValidation.data
      saleDetails.push(saleDetail)
    }

    ;(sale as SaleWithDetails).details = saleDetails
  }
  
  return sale
}

function getCreateSaleStatements (sale: SaleFull): DatabaseStatements {
  /* Sales */
  const salesArgs: InArgs = [
    sale.id,
    sale.createdAt,
    sale.lastModified,
    sale.total,
    sale.totalDiscount,
    sale.generalDiscount,
    sale.currency,
    sale.status,
    sale.paymentStatus,
    sale.documentType,
    sale.saleType,
    sale.documentSerie,
    sale.documentNumber,
    sale.clientId,
    sale.userId
  ]
  const salesQuery = `INSERT INTO sales VALUES (${salesArgs.map(() => '?').join(', ')})`

  const { details, payments } = sale

  /* Payments */
  const paymentsArgs: InArgs = []
  const paymentsPlaceholders: string[] = []

  for (const payment of payments) {
    const paymentArgs: InArgs = [
      payment.id,
      payment.saleId,
      payment.amountPaid,
      payment.currency,
      payment.exchangeRate,
      payment.paymentMethod,
      payment.createdAt
    ]

    paymentsArgs.push(...paymentArgs)
    paymentsPlaceholders.push(`(${paymentArgs.map(() => '?').join(', ')})`)
  }

  const paymentsQuery = `
    INSERT INTO salePayments (
      id, saleId, amountPaid, currency,
      exchangeRate, paymentMethod, createdAt
    )
    VALUES ${paymentsPlaceholders.join(', ')}
  `
  
  /* Details */
  const detailsArgs: InArgs = []
  const detailsPlaceholders: string[] = []

  for (const detail of details) {
    const detailArgs: InArgs = [
      detail.id,
      detail.saleId,
      detail.productId,
      detail.quantity,
      detail.unitPriceAtMoment,
      detail.currency,
      detail.discount,
      detail.ivaRate,
      JSON.stringify(detail.snapshot)
    ]
    detailsArgs.push(...detailArgs)
    detailsPlaceholders.push(`(${detailArgs.map(() => '?').join(', ')})`)
  }

  const detailsQuery = `
    INSERT INTO saleDetails (
      id, saleId, productId, quantity,
      unitPriceAtMoment, currency, discount,
      ivaRate, snapshot
    )
    VALUES ${detailsPlaceholders.join(', ')}`

  /* Stock */
  const stockStmts: DatabaseStatements = details.map((detail) => ({
    sql: `
      UPDATE products
      SET stock = stock - ?
      WHERE id = ? AND stock >= ?
    `,
    args: [detail.quantity, detail.productId, detail.quantity]
  }))

  const stmts: DatabaseStatements = [
    { sql: salesQuery, args: salesArgs },
    ...stockStmts
  ]
  
  if (payments.length > 0) stmts.push({ sql: paymentsQuery, args: paymentsArgs })
  if (details.length > 0) stmts.push({ sql: detailsQuery, args: detailsArgs })

  return stmts
}

export async function createSaleByPayload (payload: SalePayload): Promise<InsertionResult> {
  const sale = structureSaleByPayload(payload)
  if (!sale) {
    return {
      success: false,
      message: 'Payload inválido'
    }
  }

  const stmts = getCreateSaleStatements(sale)

  // const result = await db.execute('INSERT INTO sales VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args)
  const batchResult = await db.batch(stmts)
  console.log(batchResult)

  return {
    success: true
  }
}

function structureSaleByPayload (payload: SalePayload): SaleFull | null {
  const saleId = crypto.randomUUID()
  const now = Temporal.Now.instant().toString()
  
  return {
    id: saleId,
    clientId: payload.clientId,
    createdAt: now,
    currency: payload.currency,
    details: payload.details.map((d) => ({
      id: crypto.randomUUID(),
      currency: d.currency,
      discount: d.discount,
      ivaRate: d.ivaRate,
      productId: d.productId,
      quantity: d.quantity,
      saleId: saleId,
      unitPriceAtMoment: d.unitPriceAtMoment,
      snapshot: JSON.parse(d.snapshot)
    })),
    documentNumber: 'null',
    documentSerie: 'null',
    documentType: payload.documentType,
    generalDiscount: payload.generalDiscount,
    lastModified: now,
    paymentStatus: 'PAID',
    payments: payload.payments.map((p) => ({
      id: crypto.randomUUID(),
      amountPaid: p.amountPaid,
      createdAt: p.createdAt ?? now,
      currency: p.currency,
      exchangeRate: p.exchangeRate ?? 22,
      paymentMethod: p.paymentMethod,
      saleId: saleId
    })),
    saleType: payload.saleType,
    status: 'COMPLETED',
    total: payload.total,
    totalDiscount: payload.totalDiscount,
    userId: payload.userId
  }
}

/* 
CREATE TABLE sales (                                                                                                         
  id TEXT PRIMARY KEY,                                                                                                         
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,                                                    
  last_modified TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,                                                 
  total INTEGER NOT NULL,                                                                                                      
  total_discount INTEGER NOT NULL DEFAULT 0,                                                                                   
  general_discount INTEGER NOT NULL DEFAULT 0,                                                                                 
  currency TEXT NOT NULL,                                                                                                      
  status TEXT NOT NULL,                                                                                                        
  payment_status TEXT NOT NULL,                                                                                                
  document_type TEXT NOT NULL,                                                                                                 
  sale_type TEXT NOT NULL,                                                                                                     
  -- Campos fiscales nuevos                                                                                                    
  document_serie TEXT NULL,                                                                                                    
  document_number TEXT NULL,                                                                                                   
  client_id TEXT NULL,                                                                                                         
  user_id TEXT NULL                                                                                                            
);   
*/
