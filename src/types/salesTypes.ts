import type z from 'zod'
import type { Cursor } from './cursorTypes'
import type { SaleDetailSchema, SaleFullSchema, SalePaymentSchema, SaleSchema, SaleWithDetailsSchema, SaleWithPaymentsSchema } from '@/schemas/salesSchemas'
import type { Request } from 'express'
import type { Currency } from './currenciesTypes'
import type { SALE_INCLUDE } from '@/lib/constants/salesConstants'
import type { PAYMENT_METHODS } from '@/lib/constants/paymentsConstants'

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
  payment_method?: string
  [key: string]: string | undefined
} & SalesQueryOptions>

export type GetSalesRequestQuery = GetSalesRequest['query']

export type GetSaleRequest = Request<{ id: string }, null, null, {
  include?: string
}>

export type SaleInclude = typeof SALE_INCLUDE
export type SaleIncludeOption = keyof SaleInclude
export type PaymentMethodList = typeof PAYMENT_METHODS
export type PaymentMethod = Lowercase<PaymentMethodList[number]>
export type PaymentMethods = Record<PaymentMethod, boolean>

export interface SalesQueryOptions {
  since?: string
  until?: string
  currency?: Currency
}

export interface SalesExtendedQueryOptions extends SalesQueryOptions {
  limit: number
  cursor: Cursor | null
  include: Record<SaleIncludeOption, boolean>
  payment_method: Record<PaymentMethod, boolean>
}

export interface SalesServiceResult {
  sales: Sale[]
  nextCursor: Cursor | null
}
