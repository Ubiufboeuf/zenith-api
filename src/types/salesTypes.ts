import type { createSaleBodySchema, editSaleBodySchema, saleBodySchema } from '@/schemas/salesSchemas'
import type z from 'zod'

export type Sale = z.infer<typeof saleBodySchema>
export type CreateSaleBody = z.infer<typeof createSaleBodySchema>
export type EditSaleBody = z.infer<typeof editSaleBodySchema>
