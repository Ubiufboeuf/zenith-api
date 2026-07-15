import type { ProductEventsRowSchema } from '@/schemas/db'
import type { ProductCodeSchema, ProductWithEventsSchema, ProductFullSchema, ProductSchema } from '@/schemas/productsSchemas'
import type z from 'zod'
import type { Cursor } from './cursorTypes'
import type { Request } from 'express'

export type Product = z.infer<typeof ProductSchema>
export type ProductFull = z.infer<typeof ProductFullSchema>
export type ProductCode = z.infer<typeof ProductCodeSchema>
export type ProductWithEvents = z.infer<typeof ProductWithEventsSchema>
export type ProductEvents = z.infer<typeof ProductEventsRowSchema>

export type GetProductsRequest = Request<null, null, null, {
  code?: string
  since?: string
  limit?: string
  cursor?: string
}>


export interface ProductsServiceProps {
  limit: number
  cursor: Cursor | null
  code?: string
  since?: string
}

export interface ProductsServiceResult {
  products: Product[]
  nextCursor: Cursor | null
}
