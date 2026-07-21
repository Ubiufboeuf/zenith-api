import type { ProductEventsRowSchema } from '@/schemas/dbSchemas'
import type { ProductCodeSchema, ProductWithEventsSchema, ProductFullSchema, ProductSchema, CreateProductSchema, StrictCreateProductSchema, ProductWithCodesSchema } from '@/schemas/productsSchemas'
import type z from 'zod'
import type { Cursor, Pagination, PaginationRequestQuery } from './cursorTypes'
import type { Request } from 'express'
import type { CreateResult } from './serviceTypes'
import type { PRODUCT_INCLUDE } from '@/lib/constants/productsConstants'

// === Schemas ===
export type Product = z.infer<typeof ProductSchema>
export type ProductCode = z.infer<typeof ProductCodeSchema>
export type ProductEvent = z.infer<typeof ProductEventsRowSchema>
export type ProductWithCodes = z.infer<typeof ProductWithCodesSchema>
export type ProductWithEvents = z.infer<typeof ProductWithEventsSchema>
export type ProductFull = z.infer<typeof ProductFullSchema>
export type CreateProduct = z.infer<typeof CreateProductSchema>
export type StrictCreateProduct = z.infer<typeof StrictCreateProductSchema>

// === Constants ===
export type ProductInclude = typeof PRODUCT_INCLUDE
export type ProductIncludeOption = keyof ProductInclude

// === HTTP ===
export type GetProductsRequest = Request<null, null, null, GetProductsRequestQuery>
export interface GetProductsRequestQuery extends PaginationRequestQuery {
  include?: string
  code?: string
  since?: string
}

export type GetProductRequest = Request<{ id: string }, null, null, GetProductRequestQuery>
export interface GetProductRequestQuery {
  include?: string
}

// === Props ===
export interface ProductsQueryOptions extends Pagination {
  include: Record<ProductIncludeOption, boolean>
  code?: string
  since?: string
}

export interface ProductQueryOptions {
  id: string
  include: Record<ProductIncludeOption, boolean>
}

// === Results ===
export type ProductsServiceResult = Product[] | {
  products: Product[]
  nextCursor: Cursor | null
}

export type CreateProductResult = CreateResult<{
  product: StrictCreateProduct
}>
