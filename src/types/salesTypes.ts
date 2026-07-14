import type z from 'zod'
import type { Cursor } from './cursorTypes'
import type { SaleFullSchema, SaleSchema, SaleWithDetailsSchema, SaleWithPaymentsSchema } from '@/schemas/salesSchemas'
import type { Request } from 'express'

export type Sale = z.infer<typeof SaleSchema>
export type SaleWithDetails = z.infer<typeof SaleWithDetailsSchema>
export type SaleWithPayments = z.infer<typeof SaleWithPaymentsSchema>
export type SaleFull = z.infer<typeof SaleFullSchema>

export type GetSalesRequest = Request<null, null, null, {
  limit?: string
  cursor?: string
}>

export interface SalesServiceProps {
  limit: number
  cursor: Cursor | null
}

export interface SalesServiceResult {
  sales: Sale[]
  nextCursor: Cursor | null
}
