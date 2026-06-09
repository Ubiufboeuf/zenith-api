import { productSchema } from '@/schemas/productSchema'
import type { Product } from '@/types/productTypes'
import z from 'zod'

export function isValidProduct (data: unknown): data is Product {
  return z.safeParse(productSchema, data).success
}
