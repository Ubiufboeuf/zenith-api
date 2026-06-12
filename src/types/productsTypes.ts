import type { createSaleProductSchema, productSchema } from '@/schemas/productsSchemas'
import type z from 'zod'

export type Product = z.infer<typeof productSchema>

export type CreateSaleProduct = z.infer<typeof createSaleProductSchema>
