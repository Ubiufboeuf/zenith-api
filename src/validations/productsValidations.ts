import { createProductBodySchema, productSchema } from '@/schemas/productsSchemas'
import type { CreateProductBody, Product } from '@/types/productsTypes'
import z from 'zod'

export function isValidProduct (data: unknown): data is Product {
  return z.safeParse(productSchema, data).success
}

export function isValidCreateProductBody (data: unknown): data is CreateProductBody {
  return z.safeParse(createProductBodySchema, data).success
}
