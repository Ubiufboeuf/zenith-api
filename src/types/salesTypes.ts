import type z from 'zod'
import type { Cursor } from './cursorTypes'
import type { SaleDetailSchema, SaleFullSchema, SalePaymentSchema, SaleSchema, SaleWithDetailsSchema, SaleWithPaymentsSchema } from '@/schemas/salesSchemas'
import type { Request } from 'express'
import type { Currency } from './currenciesTypes'
import type { SALE_INCLUDE } from '@/lib/constants/sales'

export type Sale = z.infer<typeof SaleSchema>
export type SaleDetail = z.infer<typeof SaleDetailSchema>
export type SaleWithDetails = z.infer<typeof SaleWithDetailsSchema>
export type SalePayment = z.infer<typeof SalePaymentSchema>
export type SaleWithPayments = z.infer<typeof SaleWithPaymentsSchema>
export type SaleFull = z.infer<typeof SaleFullSchema>

export type GetSalesRequest = Request<null, null, null, {
  limit?: string
  cursor?: string
  include?: string
  [key: string]: string | undefined
} & SalesQueryOptions>

export type GetSaleRequest = Request<{ id: string }, null, null, {
  include?: string
}>

export type SaleInclude = typeof SALE_INCLUDE
export type SaleIncludeOption = keyof SaleInclude

export interface SalesQueryOptions {
  since?: string
  until?: string
  currency?: Currency
}

export interface SalesServiceProps extends SalesQueryOptions {
  limit: number
  cursor: Cursor | null
  include: Record<SaleIncludeOption, boolean>
}

export interface SalesServiceResult {
  sales: Sale[]
  nextCursor: Cursor | null
}
