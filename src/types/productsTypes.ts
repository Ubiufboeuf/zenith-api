import type { ProductEventsRowSchema } from '@/schemas/db'
import type { ProductCodeSchema, ProductWithEventsSchema, ProductFullSchema, ProductSchema } from '@/schemas/productsSchemas'
import type z from 'zod'

export type Product = z.infer<typeof ProductSchema>
export type ProductFull = z.infer<typeof ProductFullSchema>
export type ProductCode = z.infer<typeof ProductCodeSchema>
export type ProductWithEvents = z.infer<typeof ProductWithEventsSchema>
export type ProductEvents = z.infer<typeof ProductEventsRowSchema>
