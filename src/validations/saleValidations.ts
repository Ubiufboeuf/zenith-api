import { SalePayloadSchema } from '@/schemas/salesSchemas'
import type { SalePayload } from '@/types/salesTypes'

export function isValidSalePayload (data: unknown): data is SalePayload {
  return SalePayloadSchema.safeParse(data).success
}
