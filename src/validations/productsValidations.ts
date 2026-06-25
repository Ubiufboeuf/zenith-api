import { ProductFullSchema, ProductSchema } from '@/schemas/productsSchemas'
import type { Product, ProductFull } from '@/types/productsTypes'
import z from 'zod'

export function isValidProduct (data: unknown): data is Product {
  return z.safeParse(ProductSchema, data).success
}

export function isValidProductFull (data: unknown): data is ProductFull {
  return z.safeParse(ProductFullSchema, data).success
}
