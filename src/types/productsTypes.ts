import type { ProductCodeSchema, ProductFullSchema, ProductSchema } from '@/schemas/productsSchemas'
import type z from 'zod'

export type Product = z.infer<typeof ProductSchema>
export type ProductFull = z.infer<typeof ProductFullSchema>
export type ProductCode = z.infer<typeof ProductCodeSchema>
