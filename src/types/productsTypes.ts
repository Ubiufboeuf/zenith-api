import type { productSchema } from '@/schemas/productsSchemas'
import type z from 'zod'

export type Currency = '$' | 'U$S'

export type Product = z.infer<typeof productSchema>
