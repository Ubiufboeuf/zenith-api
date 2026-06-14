import { createSaleBodySchema, editSaleBodySchema } from '@/schemas/salesSchemas'
import type { CreateSaleBody, EditSaleBody } from '@/types/salesTypes'
import z from 'zod'

export function isValidCreateSaleBody (data: unknown): data is CreateSaleBody {
  return z.safeParse(createSaleBodySchema, data).success
}

export function isValidEditSaleBody (data: unknown): data is EditSaleBody {
  return z.safeParse(editSaleBodySchema, data).success
}
