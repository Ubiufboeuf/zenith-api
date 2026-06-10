import { productSchema } from '@/schemas/productsSchemas'
import type { Product } from '@/types/productsTypes'
import z from 'zod'

export function isValidProduct (data: unknown): data is Product {
  return z.safeParse(productSchema, data).success
}
