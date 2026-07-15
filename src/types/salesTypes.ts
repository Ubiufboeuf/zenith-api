import type z from 'zod'
import type { Cursor } from './cursorTypes'
import type { SaleDetailSchema, SaleFullSchema, SalePaymentSchema, SaleSchema, SaleWithDetailsSchema, SaleWithPaymentsSchema } from '@/schemas/salesSchemas'
import type { Request } from 'express'

export type Sale = z.infer<typeof SaleSchema>
export type SaleDetail = z.infer<typeof SaleDetailSchema>
export type SaleWithDetails = z.infer<typeof SaleWithDetailsSchema>
export type SalePayment = z.infer<typeof SalePaymentSchema>
export type SaleWithPayments = z.infer<typeof SaleWithPaymentsSchema>
export type SaleFull = z.infer<typeof SaleFullSchema>

export type GetSalesRequest = Request<null, null, null, {
  limit?: string
  cursor?: string
  [key: string]: string | undefined
} & SalesQueryOptions>

export type GetSaleRequest = Request<{ id: string }, null, null, {
  include?: SaleInclude
}>

export type SaleInclude = 'details' | 'payments' | 'all'

export interface SalesQueryOptions {
  include?: SaleInclude
}

export interface SalesServiceProps extends SalesQueryOptions {
  limit: number
  cursor: Cursor | null
}

export interface SalesServiceResult {
  sales: Sale[]
  nextCursor: Cursor | null
}
