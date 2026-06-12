import { createSaleBodySchema } from '@/schemas/salesSchemas'
import type { CreateSaleBody } from '@/types/salesTypes'
import z from 'zod'

export function isValidCreateSaleBody (data: unknown): data is CreateSaleBody {
  return z.safeParse(createSaleBodySchema, data).success
}
