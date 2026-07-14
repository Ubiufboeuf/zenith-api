import { db } from '@/config/db'
import { SaleDetailSchema, SalePaymentSchema, SaleSchema } from '@/schemas/salesSchemas'
import type { Sale, SaleDetail, SaleFull, SaleInclude, SalePayment, SalesServiceProps, SalesServiceResult, SaleWithDetails, SaleWithPayments } from '@/types/salesTypes'
import { createCursor } from './cursorService'
import type { InArgs, InStatement } from '@libsql/client'

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

function getSaleStatementsParams (id: string, include?: SaleInclude): (InStatement | [string, (InArgs | undefined)?])[] {
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

  if (include === 'payments' || include === 'all') stmts.push({ sql: paymentsQuery, args: [id] })
  if (include === 'details' || include === 'all') stmts.push({ sql: detailsQuery, args: [id] })

  return stmts
}

export async function getSaleById (id: string, include?: SaleInclude): Promise<Sale | SaleWithDetails | SaleWithPayments | SaleFull | undefined> {
  const stmts = getSaleStatementsParams(id, include)

  const result = await db.batch(stmts)

  let resultIdx = 0
  const saleResult = result[resultIdx++]
  const paymentsResult = (include === 'payments' || include === 'all') ? result[resultIdx++] : null
  // eslint-disable-next-line no-useless-assignment
  const detailsResult = (include === 'details' || include === 'all') ? result[resultIdx++] : null

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
